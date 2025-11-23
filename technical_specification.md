# StokeLeads AI Onboarding - Technical Implementation Specification

## 1. Executive Summary
**Project:** StokeLeads Client Onboarding Assistant
**Goal:** Automate the creation of website "skeletons" by ingesting a business's Google Business Profile (GBP) data and using Generative AI to infer structure, services, and copy.
**Output:** A validated JSON configuration file compatible with the StokeLeads Site Builder.

---

## 2. Technical Architecture

### 2.1. Tech Stack
*   **Frontend:** React 19, TypeScript, Tailwind CSS.
*   **Build Tool:** Vite.
*   **State Management:** React Context API (for global onboarding wizard state).
*   **Data Sources:**
    1.  **Google Maps Javascript API (Places Library):**
        *   *Autocomplete Service:* For finding the exact business.
        *   *Places Details Service:* To fetch verified reviews, address, phone, website, and photos.
    2.  **Google Gemini API (via `@google/genai`):**
        *   To analyze raw Places data and web content.
        *   To hallucinate/infer missing marketing copy (About Us, Taglines).
        *   To categorize services into the StokeLeads hierarchy.

### 2.2. Data Flow
1.  **Search Phase:** User types business name -> Google Places Autocomplete returns `place_id`.
2.  **Extraction Phase:** App fetches `place_id` details (reviews, photos, phone, website URL).
3.  **Enrichment Phase (AI):** 
    *   Gemini receives the raw Places JSON + the "StokeLeads Onboarding Template".
    *   Gemini outputs a structured `OnboardingData` JSON.
4.  **Human-in-the-Loop Phase:** User reviews/edits the AI-generated categories and copy in the UI.
5.  **Export Phase:** Final state is serialized to `.json` for the web builder.

---

## 3. Core Feature Implementation Details

### 3.1. Google Business Profile Integration
**Requirement:** Valid Google Maps API Key with "Places API" and "Maps JavaScript API" enabled.

**Implementation Logic:**
*   Use `useLoadScript` to load the Google Maps SDK.
*   Implement a custom Combobox component tied to `google.maps.places.AutocompleteService`.
*   Upon selection, call `google.maps.places.PlacesService.getDetails()`.
*   **Fields to fetch:** `name`, `formatted_address`, `formatted_phone_number`, `website`, `rating`, `reviews` (top 5), `photos` (max 10), `types` (Google categories).

### 3.2. The AI Enrichment Layer (Gemini 2.5)
We rely on a **Two-Stage Prompting Strategy** to ensure accuracy.

**Stage 1: The Analyst (Extraction)**
*   *Input:* Raw Google Places JSON Dump + Website URL (if available).
*   *Task:* "Extract technical facts. List all mentioned services in reviews. Identify the primary trade."

**Stage 2: The Architect (Structuring)**
*   *Input:* Stage 1 Output + StokeLeads JSON Schema.
*   *Task:* "Map these raw services into 4 distinct Categories. Write a tagline based on the reviews. Infer environmental challenges based on the city latitude/longitude."

### 3.3. Service Scaffolding Logic
The application must support a flexible hierarchy:
*   **Category:** (e.g., "Outdoor Living")
    *   **Service:** (e.g., "Composite Decking")
        *   **Status:** Selected/Unselected

**Auto-Selection Algorithm:**
If Gemini sees specific keywords in `reviews` or `types` (e.g., "built my deck"), it marks the corresponding service as `selected: true`. All inferred/suggested services start as `selected: true` to encourage abundance, allowing the user to prune (remove) rather than add.

---

## 4. Data Model Specification (TypeScript)

The LLM building this must adhere strictly to this interface to ensure compatibility with the downstream builder.

```typescript
interface OnboardingData {
  // Identity
  businessName: string;
  placeId: string; // Google Maps ID
  googleCid: string; // Derived for review links
  tagline: string;
  
  // Contact
  primaryPhone: string;
  primaryEmail: string;
  address: string;
  websiteUrl: string;
  
  // Localization
  coordinates: { lat: number; lng: number };
  primaryCity: string;
  neighborhoods: string[]; // Extracted from address vicinity
  environmentalChallenges: string[]; // Inferred from Geography (e.g., "Salt Air" for coastal)

  // The Core "Skeleton"
  categories: {
    id: string;
    name: string; // e.g., "Hardscaping"
    isPrimary: boolean;
    services: {
      name: string;
      description?: string;
      selected: boolean;
    }[];
  }[];

  // Content
  projects: {
    title: string;
    location: string; // Inferred from review locations
    description: string;
  }[];

  testimonials: {
    author: string;
    rating: number;
    text: string;
    date: string;
    source: 'Google' | 'Manual';
  }[];
}
```

---

## 5. User Interface (UX) Requirements

### 5.1. Step 1: The Search (Floating UI)
*   **Visual:** A clean, centered search bar similar to Google.com.
*   **Behavior:** As user types, show a dropdown of real businesses with their addresses.
*   **Error Handling:** If business not found, provide "Enter Manually" fallback.

### 5.2. Step 2: The "Ghost Scan" (Loading State)
*   **Visual:** A terminal-like or progress bar interface listing steps:
    *   "Connecting to Google Maps..."
    *   "Downloading Reviews..."
    *   "Analyzing Competitors..."
    *   "Drafting Website Copy..."
*   **Purpose:** Hides the 5-10s latency of the LLM chain.

### 5.3. Step 3: The Editor (Split View)
*   **Left Panel:** Navigation (Identity, Services, SEO, Portfolio).
*   **Right Panel:** Form fields.
*   **Interactivity:** 
    *   Services should be "pill" toggles (Click to select/deselect).
    *   Text fields should have an "AI Regenerate" button (wand icon) to rewrite copy if the user dislikes the draft.

---

## 6. Implementation Prompt for LLM Agent

*To build this fully, paste the following into your coding agent:*

"I need you to refactor the current React application into a production-grade onboarding tool. 
1. **Install Dependencies:** Add `@react-google-maps/api` for the search functionality.
2. **API Integration:** Create a `GooglePlacesService.ts` that handles the Autocomplete and Details fetching.
3. **Gemini Update:** Update `fetchBusinessData` to accept a raw Google Places JSON object instead of just a string name. 
4. **Prompt Engineering:** Update the system prompt to prioritize facts found in the Google Object (Phone, Address) over hallucination, but use hallucination for 'Taglines' and 'Service Categorization'.
5. **UI Update:** Replace the simple text input in `App.tsx` with a Google Places Autocomplete component.
6. **Output:** Ensure the final JSON structure matches the `OnboardingData` interface exactly."
