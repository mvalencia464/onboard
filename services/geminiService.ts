import { GoogleGenAI, Type } from "@google/genai";
import { OnboardingData } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const PROMPT_SYSTEM = `
You are an expert Business Data Enrichment AI for "StokeLeads".
Your goal is to generate a comprehensive "Website Skeleton" configuration JSON.

INPUT: You will receive raw JSON data from a Google Business Profile (Reviews, Address, Categories).
OUTPUT: You must extract factual data where it exists, and intelligently infer/hallucinate marketing copy and service lists where it is missing.

RULES:
1. **Categories**: 
   - Identify the 'primary' category from the Google 'types' or user input.
   - Generate 3-5 additional relevant categories (e.g., "Repairs", "Materials", "Commercial").
   - For EACH category, list 20-30 specific services.
   - IF a service is mentioned in the Google Reviews or Types, mark 'selected: true'.
   - Pre-select the most common core services for this industry so the user has a solid starting point.
   
2. **Localization**:
   - Use the 'formatted_address' to determine the City/Region.
   - List 10 real neighborhoods near that location.
   - Infer environmental challenges based on the city's climate (e.g., Snow, Salt, Heat).

3. **Copywriting**:
   - Write a 'Tagline' that sounds premium.
   - Write an 'About Us' that incorporates the business name and city, sounding established and trustworthy.
   - Extract or generate 3 'Testimonials'. 
   - **CRITICAL**: Only use reviews that are clearly for the business specified in the input. If a review mentions a different service or business name, IGNORE IT.
   - If real reviews are provided in the input, paraphrase them to be punchy. If not, generate realistic placeholders.
`;

export const enrichBusinessData = async (placeData: any, allReviews: any[] = []): Promise<Partial<OnboardingData>> => {
  try {
    // Filter MGR reviews to only include those that likely belong to THIS business
    // We check for the business name in the review text or any business identifiers
    const filteredMGRReviews = allReviews.filter(r => {
      const reviewText = (r.review || r.body || r.text || r.content || '').toLowerCase();
      const nameParts = placeData.name.toLowerCase().split(' ').filter((p: string) => p.length > 3);
      // If the review mentions major parts of the business name, or if we have no other reviews,
      // we might keep it, but for safety with multiple clients in one account, 
      // we should be strict or rely on a property if MGR provides it.
      // Since MGR API doesn't seem to have a business_id in this context, we use a heuristic.
      return nameParts.some((part: string) => reviewText.includes(part));
    });

    // Merge Google Reviews with filtered MGR Reviews
    const combinedReviews = [
      ...(placeData.reviews?.map((r: any) => ({
        text: r.text || '',
        author: r.author_name || 'Google User',
        rating: r.rating || 5
      })) || []),
      ...filteredMGRReviews.map(r => ({
        text: r.review || r.body || r.text || r.content || '',
        author: r.reviewer?.name || r.author_name || r.name || 'Verified Customer',
        rating: typeof r.rating === 'object' ? r.rating.score : (r.rating || 5)
      }))
    ].filter(r => r.text.length > 5);

    // Pre-process Place Data to give the AI a clean prompt
    const placeContext = {
      name: placeData.name,
      address: placeData.formatted_address,
      phone: placeData.formatted_phone_number,
      website: placeData.website,
      rating: placeData.rating,
      // Use combined reviews (clamped to a reasonable number for token limits if necessary, but 100-200 is usually fine for Flash)
      reviews: combinedReviews.slice(0, 100),
      // Google types (e.g., ['general_contractor', 'point_of_interest'])
      types: placeData.types || [],
      operating_hours: placeData.opening_hours?.weekday_text || []
    };

    const model = "gemini-2.5-flash";

    const prompt = `
      Analyze this Google Business Profile data:
      ${JSON.stringify(placeContext, null, 2)}

      Generate the OnboardingData JSON.
      
      Specific overrides:
      - Use the exact phone number and website from the data if available.
      - **CRITICAL**: DO NOT GUESS OR INVENT AN EMAIL ADDRESS. Leave 'primaryEmail' as an empty string.
      - **CRITICAL**: DO NOT GUESS OR INVENT A WEBSITE URL. If the input data has no website, leave 'websiteUrl' as an empty string.
      - If 'operating_hours' is present, format it as a single string summary (e.g. "Mon-Fri 8am-5pm").
      - Infer "Social Media" handles based on the business name (e.g. facebook.com/businessname).
    `;

    const response = await ai.models.generateContent({
      model: model,
      contents: prompt,
      config: {
        systemInstruction: PROMPT_SYSTEM,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            businessName: { type: Type.STRING },
            tagline: { type: Type.STRING },
            primaryPhone: { type: Type.STRING },
            primaryEmail: { type: Type.STRING },
            address: { type: Type.STRING },
            operatingHours: { type: Type.STRING },
            websiteUrl: { type: Type.STRING },
            brandColor: { type: Type.STRING },
            aboutUs: { type: Type.STRING },
            primaryCity: { type: Type.STRING },
            neighborhoods: { type: Type.ARRAY, items: { type: Type.STRING } },
            environmentalChallenges: { type: Type.ARRAY, items: { type: Type.STRING } },
            categories: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  isPrimary: { type: Type.BOOLEAN },
                  services: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        name: { type: Type.STRING },
                        selected: { type: Type.BOOLEAN }
                      }
                    }
                  }
                }
              }
            },
            projects: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  title: { type: Type.STRING },
                  location: { type: Type.STRING },
                  feature: { type: Type.STRING },
                  imagePlaceholder: { type: Type.STRING }
                }
              }
            },
            testimonials: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  quote: { type: Type.STRING },
                  author: { type: Type.STRING },
                  location: { type: Type.STRING }
                }
              }
            },
            socials: {
              type: Type.OBJECT,
              properties: {
                instagram: { type: Type.STRING },
                facebook: { type: Type.STRING },
                linkedin: { type: Type.STRING },
                yelp: { type: Type.STRING },
                houzz: { type: Type.STRING },
                bbb: { type: Type.STRING }
              }
            }
          }
        }
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");

    const data = JSON.parse(text);

    // Merge explicit Google Data to ensure accuracy over hallucination
    return {
      ...data,
      businessName: placeContext.name, // Always use the real name
      address: placeContext.address,   // Always use the real address
      primaryPhone: placeContext.phone || data.primaryPhone,
      // STRICTLY use the Google Maps website or empty string. Never allow AI guess.
      websiteUrl: placeContext.website || "",
      // Google Places API does not provide email. Never allow AI guess.
      primaryEmail: "",
    };

  } catch (error) {
    console.error("Error enriching business data:", error);
    throw error;
  }
};