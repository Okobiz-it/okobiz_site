export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { getDataStore, saveDatastore } from "@/lib/dataStore";
import { connectDB } from "@/lib/mongodb";
import JobApplication from "@/models/JobApplication";
import { sendCandidateEmail } from "@/lib/email";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { applicationId, to, toName, jobTitle, subject, message } = body;

    if (!to || !subject || !message) {
      return NextResponse.json(
        { success: false, message: "Recipient email, subject, and message are required." },
        { status: 400 }
      );
    }

    // Call email sender (supports SMTP or fallback simulation)
    const emailResult = await sendCandidateEmail({
      to: to.trim(),
      toName: (toName || "Candidate").trim(),
      jobTitle: jobTitle || "Role Application",
      subject: subject.trim(),
      messageHtml: message
    });

    if (!emailResult.success) {
      return NextResponse.json({ success: false, message: emailResult.message }, { status: 500 });
    }

    // Record interaction in JobApplication if applicationId is provided
    if (applicationId) {
      const emailRecord = {
        subject: subject.trim(),
        message: message.trim(),
        sentAt: new Date().toISOString(),
        sentBy: "okobiz Recruitment",
        status: emailResult.mode === "smtp" ? "sent" : "simulated"
      };

      const store = getDataStore();
      if (!store.jobApplications) store.jobApplications = [];
      const appIdx = store.jobApplications.findIndex((a: any) => a._id === applicationId);
      if (appIdx !== -1) {
        if (!store.jobApplications[appIdx].emailsSent) {
          store.jobApplications[appIdx].emailsSent = [];
        }
        store.jobApplications[appIdx].emailsSent.unshift(emailRecord as any);
        saveDatastore(store);
      }

      const db = await connectDB();
      if (db) {
        try {
          await JobApplication.findByIdAndUpdate(applicationId, {
            $push: { emailsSent: { $each: [emailRecord], $position: 0 } }
          });
        } catch (dbErr: any) {
          console.warn("MongoDB record email notice:", dbErr.message);
        }
      }
    }

    return NextResponse.json({
      success: true,
      mode: emailResult.mode,
      message: emailResult.message,
      preview: emailResult.preview
    });
  } catch (err: any) {
    console.error("Job reply email error:", err);
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
