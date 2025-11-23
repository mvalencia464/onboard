export enum AppStep {
  SEARCH = 'SEARCH',
  SCANNING = 'SCANNING',
  EDITOR = 'EDITOR',
  COMPLETE = 'COMPLETE',
  ADMIN = 'ADMIN'
}

export interface ServiceItem {
  name: string;
  selected: boolean;
}

export interface ServiceCategory {
  name: string;
  isPrimary: boolean;
  services: ServiceItem[];
}

export interface Project {
  id: string;
  title: string;
  location: string;
  feature: string;
  imagePlaceholder: string; // URL or placeholder
}

export interface Testimonial {
  id: string;
  quote: string;
  author: string;
  location: string;
}

export interface OnboardingData {
  // Database Fields
  id?: number;
  status?: 'new' | 'draft' | 'onboarded';

  // Section 1: Identity
  businessName: string;
  googlePlaceId?: string; // Added for referencing the source
  tagline: string;
  primaryPhone: string;
  primaryEmail: string;
  address: string;
  operatingHours: string;
  licenseNumber: string;
  googleBusinessProfileUrl: string;
  websiteUrl: string;
  
  // Section 2: Branding
  brandColor: string;
  fontPreference: 'Modern' | 'Classic' | 'Handwritten';
  logoUrl: string | null; // Placeholder logic
  aboutUs: string;
  
  // Section 3: Localization & SEO
  primaryCity: string;
  neighborhoods: string[]; // List of strings
  environmentalChallenges: string[];

  // Section 4: Services (The Skeleton)
  categories: ServiceCategory[];

  // Section 5: Materials
  deckingBrand: string;
  railingType: string;
  foundationType: string;

  // Section 6: Portfolio
  projects: Project[];

  // Section 7: Social Proof
  testimonials: Testimonial[];

  // Section 8: Process
  processSteps: string[];

  // Social Links
  socials: {
    instagram: string;
    facebook: string;
    linkedin: string;
    yelp: string;
    houzz: string;
    bbb: string;
  };
}

// Initial empty state
export const INITIAL_DATA: OnboardingData = {
  businessName: '',
  tagline: '',
  primaryPhone: '',
  primaryEmail: '',
  address: '',
  operatingHours: '',
  licenseNumber: '',
  googleBusinessProfileUrl: '',
  websiteUrl: '',
  brandColor: '#EA580C',
  fontPreference: 'Modern',
  logoUrl: null,
  aboutUs: '',
  primaryCity: '',
  neighborhoods: [],
  environmentalChallenges: [],
  categories: [],
  deckingBrand: '',
  railingType: '',
  foundationType: '',
  projects: [],
  testimonials: [],
  processSteps: ['Consult & Design', 'Precision Build', 'Lifetime Enjoyment'],
  socials: {
    instagram: '',
    facebook: '',
    linkedin: '',
    yelp: '',
    houzz: '',
    bbb: ''
  }
};