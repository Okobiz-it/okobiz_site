import mongoose, { Schema } from "mongoose";

export interface ISiteSetting {
  siteName: string;
  contactPhone: string;
  contactEmail: string;
  contactAddress: string;
  whatsappNumber: string;
  stats: {
    journeyStarted: string;
    happyClients: string;
    teamMembers: string;
    yearsOfExcellence: string;
  };
  portfolioPdf?: {
    heading: string;
    subheading: string;
    pdfUrl: string;
    badge?: string;
  };
}

const SiteSettingSchema = new Schema<ISiteSetting>({
  siteName: { type: String, default: "okobiz" },
  contactPhone: { type: String, default: "01973-590937" },
  contactEmail: { type: String, default: "info@okobiz.com" },
  contactAddress: { type: String, default: "Uttara, Dhaka, Bangladesh" },
  whatsappNumber: { type: String, default: "+8801973590937" },
  stats: {
    journeyStarted: { type: String, default: "2018" },
    happyClients: { type: String, default: "150" },
    teamMembers: { type: String, default: "20" },
    yearsOfExcellence: { type: String, default: "6+" }
  },
  portfolioPdf: {
    heading: { type: String, default: "okobiz Official Profile & Credentials 2024" },
    subheading: { type: String, default: "Corporate capabilities brochure, technology stack & verified client references • PDF (2.8 MB)" },
    pdfUrl: { type: String, default: "/assets/okobiz_profile-DvU1SuUS.pdf" },
    badge: { type: String, default: "" }
  }
});

export default mongoose.models.SiteSetting || mongoose.model<ISiteSetting>("SiteSetting", SiteSettingSchema);
