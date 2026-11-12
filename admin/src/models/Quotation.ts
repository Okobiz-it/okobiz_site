import mongoose, { Schema } from "mongoose";

export interface IQuotation {
  _id: string;
  ref_no: string;
  quote_date: Date;
  client_name: string;
  organization_name?: string;
  address?: string;
  phone?: string;
  email?: string;
  subject: string;
  software_columns?: any[];
  software_rows?: any[];
  software_amount?: number;
  plan_name?: string;
  billing_cycle?: string;
  license_fee_title?: string;
  license_fee_amount?: number;
  subscription_amount?: number;
  recurring_note?: string;
  has_hardware?: boolean;
  hardware_columns?: any[];
  hardware_rows?: any[];
  hardware_amount?: number;
  grand_total: number;
  in_words?: string;
  project_breakdown?: string;
  terms_conditions?: string;
  client_requirements?: string;
  deliverables?: string;
  additional_notes?: string;
  company_signatory_name?: string;
  company_signatory_title?: string;
  company_phone?: string;
  company_email?: string;
  doc_type?: "QUOTATION" | "BILL" | string;
  bill_rows?: any[];
  status: "SENT" | "DRAFT" | "ACCEPTED" | "REJECTED" | string;
  email_sent_at?: Date | null;
  created_at: Date;
  updated_at: Date;
}

const QuotationSchema = new Schema<IQuotation>(
  {
    _id: { type: String, default: () => new mongoose.Types.ObjectId().toString() },
    ref_no: { type: String, required: true, unique: true },
    quote_date: { type: Date, default: Date.now },
    client_name: { type: String, required: true },
    organization_name: { type: String, default: "" },
    address: { type: String, default: "" },
    phone: { type: String, default: "" },
    email: { type: String, default: "" },
    subject: { type: String, default: "Quotation for Software & Hardware Solution" },
    software_columns: { type: Schema.Types.Mixed, default: [] },
    software_rows: { type: Schema.Types.Mixed, default: [] },
    software_amount: { type: Number, default: 0 },
    plan_name: { type: String, default: "Starter" },
    billing_cycle: { type: String, default: "MONTHLY" },
    license_fee_title: { type: String, default: "One-time Setup & License Fee" },
    license_fee_amount: { type: Number, default: 0 },
    subscription_amount: { type: Number, default: 0 },
    recurring_note: { type: String, default: "" },
    has_hardware: { type: Boolean, default: false },
    hardware_columns: { type: Schema.Types.Mixed, default: [] },
    hardware_rows: { type: Schema.Types.Mixed, default: [] },
    hardware_amount: { type: Number, default: 0 },
    grand_total: { type: Number, default: 0 },
    in_words: { type: String, default: "" },
    project_breakdown: { type: String, default: "" },
    terms_conditions: { type: String, default: "" },
    client_requirements: { type: String, default: "" },
    deliverables: { type: String, default: "" },
    additional_notes: { type: String, default: "" },
    company_signatory_name: { type: String, default: "Md. Sorower Jahan" },
    company_signatory_title: { type: String, default: "CEO, okobiz" },
    company_phone: { type: String, default: "+880 1973590937" },
    company_email: { type: String, default: "info@okobiz.com" },
    doc_type: { type: String, default: "QUOTATION" },
    bill_rows: { type: Schema.Types.Mixed, default: [] },
    status: { type: String, default: "SENT" },
    email_sent_at: { type: Date, default: null },
  },
  {
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
  }
);

export default mongoose.models.Quotation || mongoose.model<IQuotation>("Quotation", QuotationSchema);

