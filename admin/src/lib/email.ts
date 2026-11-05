import nodemailer from "nodemailer";

export interface EmailOptions {
  to: string;
  toName: string;
  jobTitle?: string;
  subject: string;
  messageHtml: string;
  messageText?: string;
}

export interface EmailResult {
  success: boolean;
  mode: "smtp" | "simulated";
  message: string;
  preview?: {
    from: string;
    to: string;
    subject: string;
    sentAt: string;
  };
}

/**
 * Sends or simulates an email to a job applicant.
 * If SMTP credentials (SMTP_HOST, SMTP_USER, SMTP_PASS) are provided in process.env,
 * it sends a live email via nodemailer.
 * Otherwise, it gracefully simulates the email dispatch and records the interaction.
 */
export async function sendCandidateEmail(options: EmailOptions): Promise<EmailResult> {
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT) || 587;
  const secure = process.env.SMTP_SECURE === "true" || port === 465;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const from = process.env.SMTP_FROM || `"okobiz Careers" <career@okobiz.com>`;

  const isSmtpConfigured = Boolean(host && user && pass);

  if (isSmtpConfigured) {
    try {
      const transporter = nodemailer.createTransport({
        host,
        port,
        secure,
        auth: { user, pass }
      });

      const info = await transporter.sendMail({
        from,
        to: `"${options.toName}" <${options.to}>`,
        subject: options.subject,
        text: options.messageText || options.messageHtml.replace(/<[^>]*>?/gm, ""),
        html: options.messageHtml
      });

      return {
        success: true,
        mode: "smtp",
        message: `Live email dispatched successfully via SMTP to ${options.to} (MessageId: ${info.messageId})`,
        preview: {
          from,
          to: options.to,
          subject: options.subject,
          sentAt: new Date().toISOString()
        }
      };
    } catch (smtpErr: any) {
      console.warn("SMTP send failed, falling back to simulated log:", smtpErr.message);
      return {
        success: false,
        mode: "smtp",
        message: `Failed to deliver email via SMTP: ${smtpErr.message}. Please check your SMTP credentials.`
      };
    }
  }

  // Simulated mode when SMTP is not configured yet
  console.log("=== [okobiz Careers Email Simulation] ===");
  console.log(`To: ${options.toName} <${options.to}>`);
  console.log(`From: ${from}`);
  console.log(`Subject: ${options.subject}`);
  console.log(`Timestamp: ${new Date().toISOString()}`);
  console.log(`Content:\n${options.messageText || options.messageHtml.replace(/<[^>]*>?/gm, "")}`);
  console.log("=========================================");

  return {
    success: true,
    mode: "simulated",
    message: "Email simulated successfully! Configure SMTP_HOST, SMTP_PORT, SMTP_USER, and SMTP_PASS in your environment to send live emails.",
    preview: {
      from,
      to: options.to,
      subject: options.subject,
      sentAt: new Date().toISOString()
    }
  };
}

export const EMAIL_TEMPLATES = {
  interview: {
    name: "Technical Interview Invitation",
    subject: "Interview Invitation: {jobTitle} at okobiz",
    body: `<p>Dear {name},</p>
<p>Thank you for applying for the <strong>{jobTitle}</strong> position at <strong>okobiz</strong>.</p>
<p>We were very impressed by your qualifications and would like to invite you for a <strong>Technical &amp; Architecture Interview</strong>. This session will last approximately 45–60 minutes, where we will discuss your technical background, previous projects, and how we build software at okobiz.</p>
<p><strong>Proposed Timing:</strong> Please let us know your availability between 11:00 AM – 6:00 PM (BST) over the next two days for a Google Meet or in-person session at our Mirpur, Dhaka office.</p>
<p>Looking forward to speaking with you!</p>
<p>Best regards,<br/>
<strong>Recruitment Team</strong><br/>
okobiz Software &amp; Digital Solutions<br/>
Mirpur, Dhaka 1216 | <a href="https://okobiz.com">okobiz.com</a></p>`
  },
  shortlist: {
    name: "Shortlisted for Assessment",
    subject: "Application Update: {jobTitle} at okobiz",
    body: `<p>Dear {name},</p>
<p>We are pleased to inform you that your profile has been <strong>shortlisted</strong> for the <strong>{jobTitle}</strong> role at okobiz!</p>
<p>As the next step in our evaluation process, our engineering lead will review your code repositories and recent portfolio. You will receive a brief take-home scenario or interview schedule shortly.</p>
<p>Thank you for your enthusiasm to join the okobiz family!</p>
<p>Warm regards,<br/>
<strong>Talent Acquisition</strong><br/>
okobiz</p>`
  },
  offer: {
    name: "Offer Letter Discussion",
    subject: "Job Offer: {jobTitle} at okobiz",
    body: `<p>Dear {name},</p>
<p>Congratulations! Following your interviews and assessments, the leadership team at okobiz is thrilled to extend a formal offer of employment for the position of <strong>{jobTitle}</strong>.</p>
<p>We were thoroughly impressed by your domain expertise, problem-solving mindset, and alignment with our company culture.</p>
<p>Attached to this email, please find the formal Offer Letter detailing your proposed compensation package, festival bonuses, benefits, and joining date.</p>
<p>Please review the details and let us know your feedback within 3 business days.</p>
<p>Welcome aboard!<br/>
<strong>Human Resources</strong><br/>
okobiz</p>`
  },
  rejection: {
    name: "Polite Rejection & Talent Pool",
    subject: "Update regarding your application for {jobTitle} at okobiz",
    body: `<p>Dear {name},</p>
<p>Thank you for taking the time to consider okobiz as your next career step and for applying for the <strong>{jobTitle}</strong> position.</p>
<p>We received an exceptionally large number of strong applications for this opening. After careful review, we have decided to move forward with candidates whose experience more closely matches our immediate requirements.</p>
<p>We have retained your profile in our active talent database and will reach out promptly should an opportunity arise that suits your strengths.</p>
<p>We wish you every success in your professional endeavors.</p>
<p>Sincerely,<br/>
<strong>okobiz Recruitment Team</strong></p>`
  }
};

