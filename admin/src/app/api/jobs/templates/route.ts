import { NextResponse } from "next/server";
import { getDataStore, saveDatastore } from "@/lib/dataStore";
import { connectDB } from "@/lib/mongodb";
import EmailTemplate from "@/models/EmailTemplate";

const DEFAULT_TEMPLATES_SEED = [
  {
    _id: "tmpl-1",
    name: "Technical Interview Invitation",
    subject: "Interview Invitation: {jobTitle} at okobiz",
    body: `<p>Dear {name},</p><p>Thank you for applying for the <strong>{jobTitle}</strong> position at <strong>okobiz</strong>.</p><p>We were very impressed by your qualifications and would like to invite you for a <strong>Technical &amp; Architecture Interview</strong>. This session will last approximately 45–60 minutes, where we will discuss your technical background, previous projects, and how we build software at okobiz.</p><p><strong>Proposed Timing:</strong> Please let us know your availability between 11:00 AM – 6:00 PM (BST) over the next two days for a Google Meet or in-person session at our Mirpur, Dhaka office.</p><p>Looking forward to speaking with you!</p><p>Best regards,<br/><strong>Recruitment Team</strong><br/>okobiz Software &amp; Digital Solutions<br/>Mirpur, Dhaka 1216 | <a href="https://okobiz.com">okobiz.com</a></p>`,
    isDefault: true,
    createdAt: "2024-01-01T00:00:00.000Z",
    updatedAt: "2024-01-01T00:00:00.000Z"
  },
  {
    _id: "tmpl-2",
    name: "Shortlisted for Assessment",
    subject: "Application Update: {jobTitle} at okobiz",
    body: `<p>Dear {name},</p><p>We are pleased to inform you that your profile has been <strong>shortlisted</strong> for the <strong>{jobTitle}</strong> role at okobiz!</p><p>As the next step in our evaluation process, our engineering lead will review your code repositories and recent portfolio. You will receive a brief take-home scenario or interview schedule shortly.</p><p>Thank you for your enthusiasm to join the okobiz family!</p><p>Warm regards,<br/><strong>Talent Acquisition</strong><br/>okobiz</p>`,
    isDefault: true,
    createdAt: "2024-01-01T00:00:00.000Z",
    updatedAt: "2024-01-01T00:00:00.000Z"
  },
  {
    _id: "tmpl-3",
    name: "Offer Letter Discussion",
    subject: "Job Offer: {jobTitle} at okobiz",
    body: `<p>Dear {name},</p><p>Congratulations! Following your interviews and assessments, the leadership team at okobiz is thrilled to extend a formal offer of employment for the position of <strong>{jobTitle}</strong>.</p><p>We were thoroughly impressed by your domain expertise, problem-solving mindset, and alignment with our company culture.</p><p>Attached to this email, please find the formal Offer Letter detailing your proposed compensation package, festival bonuses, benefits, and joining date.</p><p>Please review the details and let us know your feedback within 3 business days.</p><p>Welcome aboard!<br/><strong>Human Resources</strong><br/>okobiz</p>`,
    isDefault: true,
    createdAt: "2024-01-01T00:00:00.000Z",
    updatedAt: "2024-01-01T00:00:00.000Z"
  },
  {
    _id: "tmpl-4",
    name: "Polite Rejection & Talent Pool",
    subject: "Update regarding your application for {jobTitle} at okobiz",
    body: `<p>Dear {name},</p><p>Thank you for taking the time to consider okobiz as your next career step and for applying for the <strong>{jobTitle}</strong> position.</p><p>We received an exceptionally large number of strong applications for this opening. After careful review, we have decided to move forward with candidates whose experience more closely matches our immediate requirements.</p><p>We have retained your profile in our active talent database and will reach out promptly should an opportunity arise that suits your strengths.</p><p>We wish you every success in your professional endeavors.</p><p>Sincerely,<br/><strong>okobiz Recruitment Team</strong></p>`,
    isDefault: true,
    createdAt: "2024-01-01T00:00:00.000Z",
    updatedAt: "2024-01-01T00:00:00.000Z"
  }
];

export async function GET() {
  try {
    const db = await connectDB();
    if (db) {
      let templates = await EmailTemplate.find().sort({ createdAt: 1 });
      if (!templates || templates.length === 0) {
        // Seed default templates in MongoDB
        await EmailTemplate.insertMany(DEFAULT_TEMPLATES_SEED);
        templates = await EmailTemplate.find().sort({ createdAt: 1 });
      }
      return NextResponse.json({ success: true, data: templates });
    }
  } catch (err: any) {
    console.warn("MongoDB GET email templates error:", err.message);
  }

  const store = getDataStore();
  if (!store.emailTemplates || store.emailTemplates.length === 0) {
    store.emailTemplates = [...DEFAULT_TEMPLATES_SEED];
    saveDatastore(store);
  }
  return NextResponse.json({ success: true, data: store.emailTemplates });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    if (!body.name || !body.subject || !body.body) {
      return NextResponse.json(
        { success: false, message: "Template name, subject, and body are required." },
        { status: 400 }
      );
    }

    const store = getDataStore();
    if (!store.emailTemplates) store.emailTemplates = [];

    const newTemplate = {
      _id: "tmpl-" + Date.now(),
      name: body.name.trim(),
      subject: body.subject.trim(),
      body: body.body.trim(),
      isDefault: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    store.emailTemplates.push(newTemplate);
    saveDatastore(store);

    let finalDoc = newTemplate;
    const db = await connectDB();
    if (db) {
      try {
        const created = await EmailTemplate.create(newTemplate);
        if (created) finalDoc = created.toObject ? created.toObject() : created;
      } catch (dbErr: any) {
        console.error("MongoDB EmailTemplate create error:", dbErr.message);
      }
    }

    return NextResponse.json({ success: true, data: finalDoc });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const { _id, ...updates } = body;
    if (!_id) {
      return NextResponse.json({ success: false, message: "Template ID is required." }, { status: 400 });
    }

    const store = getDataStore();
    if (!store.emailTemplates) store.emailTemplates = [];
    const idx = store.emailTemplates.findIndex(t => t._id === _id);
    if (idx !== -1) {
      store.emailTemplates[idx] = {
        ...store.emailTemplates[idx],
        ...updates,
        updatedAt: new Date().toISOString()
      };
      saveDatastore(store);
    }

    let updatedDoc = { _id, ...updates, updatedAt: new Date().toISOString() };
    const db = await connectDB();
    if (db) {
      try {
        const res = await EmailTemplate.findByIdAndUpdate(
          _id,
          { ...updates, updatedAt: new Date() },
          { new: true, upsert: true }
        );
        if (res) updatedDoc = res.toObject ? res.toObject() : res;
      } catch (dbErr: any) {
        console.error("MongoDB EmailTemplate update error:", dbErr.message);
      }
    }

    return NextResponse.json({ success: true, data: updatedDoc });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json({ success: false, message: "Template ID is required." }, { status: 400 });
    }

    const store = getDataStore();
    if (store.emailTemplates) {
      store.emailTemplates = store.emailTemplates.filter(t => t._id !== id);
      saveDatastore(store);
    }

    const db = await connectDB();
    if (db) {
      try {
        await EmailTemplate.findByIdAndDelete(id);
      } catch (dbErr: any) {
        console.error("MongoDB EmailTemplate delete error:", dbErr.message);
      }
    }

    return NextResponse.json({ success: true, message: "Template deleted successfully." });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}

