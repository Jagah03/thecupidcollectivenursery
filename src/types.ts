/**
 * Shared Type Definitions for The Cupid Collective Nursery
 */

export interface GlobalSettings {
  adminPassword?: string; // Keep hidden in client or strip out
  routingEmail: string;
  introHeadline: string;
  introSubheadline: string;
  introBody: string;
}

export interface NurseryGuidelines {
  locationDescription: string;
  sessionBoundaries: string; // Markdown/Formatted text
  rules: string;             // Markdown/Formatted text
  expectations: string;      // Markdown/Formatted text
}

export interface NurseryPackage {
  id: string;
  name: string;
  description: string;
  duration: number; // in minutes
  price: number;    // in dollars
  isActive: boolean;
  isVirtual: boolean;
}

export interface Caregiver {
  id: string;
  name: string;
  imageUrl: string;
  bio: string;
  philosophy: string;
}

export interface BlogArticle {
  id: string;
  title: string;
  content: string; // formatted text/markdown
  date: string;
  category: "Conventions" | "Reviews" | "General";
}

export interface SafetyAlert {
  id: string;
  title: string;
  date: string;
  details: string; // formatted text/markdown
  recommendations: string; // guidelines on safe navigation
}

export interface MentalHealthResource {
  id: string;
  name: string;
  phone: string;
  textCode?: string;
  link?: string;
  category: "General" | "Veterans" | "LGBTQ+" | "Youth" | "Other";
  description: string;
}

export interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: string;
  orderIndex: number;
}

export interface Testimonial {
  id: string;
  author: string;
  quote: string;
  rating: number; // 1-5
  role: string; // e.g., "Little", "Virtual Client"
}

export interface Inquiry {
  id: string;
  name: string;
  pronouns: string;
  email: string;
  subject: string;
  message: string;
  date: string;
  read: boolean;
}

export interface MailingListEntry {
  email: string;
  date: string;
}

// Full State representation
export interface DBStore {
  globalSettings: GlobalSettings;
  nurseryGuidelines: NurseryGuidelines;
  packages: NurseryPackage[];
  caregivers: Caregiver[];
  blogArticles: BlogArticle[];
  safetyAlerts: SafetyAlert[];
  hotlines: MentalHealthResource[];
  faqs: FAQItem[];
  testimonials: Testimonial[];
  inquiries: Inquiry[];
  mailingList: MailingListEntry[];
}
