import nodemailer from "nodemailer";
import { getDataStore } from "./dataStore";

interface SendEmailParams {
  to?: string;
  subject: string;
  html: string;
  text?: string;
  replyTo?: string;
}

export async function sendEmail({ to, subject, html, text, replyTo }: SendEmailParams) {
  const store = getDataStore();
  const settings = (store.settings as any)?.email;

  // Prefer environment variables, fall back to stored settings
  const host = process.env.SMTP_HOST || settings?.smtpHost;
  const port = Number(process.env.SMTP_PORT || settings?.smtpPort || 587);
  const secure = process.env.SMTP_SECURE === "true" || settings?.smtpSecure || port === 465;
  const user = process.env.SMTP_USER || settings?.smtpUser;
  const pass = process.env.SMTP_PASS || settings?.smtpPass;
  const from = process.env.SMTP_FROM || settings?.fromEmail || `"okobiz" <${user || "info@okobiz.com"}>`;
  const recipient = to || settings?.notificationEmail || user;

  if (!recipient) {
    throw new Error("No recipient email specified and no notificationEmail configured.");
  }

  // If credentials are missing, log gracefully (e.g., local dev)
  if (!host || !user || !pass) {
    console.info(`[SIMULATED EMAIL] To: ${recipient} | Subject: ${subject}`);
    return {
      success: true,
      mode: "simulated",
      message: "Email logged to console (SMTP credentials not fully configured).",
    };
  }

  const transporter = nodemailer.createTransport({
    host,
    port,
    secure,
    auth: { user, pass },
  });

  return transporter.sendMail({
    from,
    to: recipient,
    replyTo,
    subject,
    html,
    text,
  });
}

/**
 * Send an email reply to a job candidate.
 */
export async function sendCandidateEmail({
  to,
  toName,
  jobTitle,
  subject,
  messageHtml,
}: {
  to: string;
  toName: string;
  jobTitle: string;
  subject: string;
  messageHtml: string;
}) {
  const store = getDataStore();
  const settings = (store.settings as any)?.email;

  const host = process.env.SMTP_HOST || settings?.smtpHost;
  const port = Number(process.env.SMTP_PORT || settings?.smtpPort || 587);
  const secure = process.env.SMTP_SECURE === "true" || settings?.smtpSecure || port === 465;
  const user = process.env.SMTP_USER || settings?.smtpUser;
  const pass = process.env.SMTP_PASS || settings?.smtpPass;
  const from = process.env.SMTP_FROM || settings?.fromEmail || `"okobiz Careers" <${user || "careers@okobiz.com"}>`;

  if (!host || !user || !pass) {
    console.info(`[SIMULATED CANDIDATE EMAIL] To: ${to} | Subject: ${subject}`);
    return {
      success: true,
      mode: "simulated",
      message: `Candidate reply to ${to} simulated successfully (SMTP not configured).`,
      preview: undefined as string | undefined,
    };
  }

  const transporter = nodemailer.createTransport({
    host,
    port,
    secure,
    auth: { user, pass },
  });

  await transporter.sendMail({
    from,
    to,
    subject,
    html: messageHtml,
  });

  return {
    success: true,
    mode: "smtp",
    message: "Email sent successfully",
    preview: undefined as string | undefined,
  };
}

/**
 * Send an email notification for a new user inquiry.
 */
export async function sendInquiryNotification(inquiry: {
  name: string;
  email: string;
  phone?: string;
  subject?: string;
  service?: string;
  budget?: string;
  timeline?: string;
  message: string;
}) {
  const subjectLine = `New Inquiry from ${inquiry.name}: ${inquiry.subject || inquiry.service || "Website Contact"}`;

  const htmlBody = `
  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
    <h2 style="color: #0167D6; border-bottom: 2px solid #0167D6; padding-bottom: 8px;">New Client Inquiry</h2>
    <table style="width: 100%; border-collapse: collapse; margin-top: 15px;">
      <tr>
        <td style="padding: 8px; font-weight: bold; width: 120px;">Name:</td>
        <td style="padding: 8px;">${inquiry.name}</td>
      </tr>
      <tr>
        <td style="padding: 8px; font-weight: bold;">Email:</td>
        <td style="padding: 8px;"><a href="mailto:${inquiry.email}">${inquiry.email}</a></td>
      </tr>
      ${inquiry.phone ? `
      <tr>
        <td style="padding: 8px; font-weight: bold;">Phone:</td>
        <td style="padding: 8px;">${inquiry.phone}</td>
      </tr>` : ""}
      ${inquiry.service ? `
      <tr>
        <td style="padding: 8px; font-weight: bold;">Service:</td>
        <td style="padding: 8px;">${inquiry.service}</td>
      </tr>` : ""}
      ${inquiry.budget ? `
      <tr>
        <td style="padding: 8px; font-weight: bold;">Budget:</td>
        <td style="padding: 8px;">${inquiry.budget}</td>
      </tr>` : ""}
      ${inquiry.timeline ? `
      <tr>
        <td style="padding: 8px; font-weight: bold;">Timeline:</td>
        <td style="padding: 8px;">${inquiry.timeline}</td>
      </tr>` : ""}
    </table>

    <div style="margin-top: 20px; padding: 15px; background-color: #f8fafc; border-radius: 6px; border-left: 4px solid #0167D6;">
      <h4 style="margin-top: 0; margin-bottom: 8px; color: #334155;">Message:</h4>
      <p style="white-space: pre-wrap; margin: 0; color: #1e293b;">${inquiry.message}</p>
    </div>

    <p style="margin-top: 25px; font-size: 12px; color: #64748b; text-align: center;">
      This message was sent automatically from okobiz.com contact form.
    </p>
  </div>
  `;

  return sendEmail({
    subject: subjectLine,
    html: htmlBody,
    replyTo: inquiry.email,
  });
}

/**
 * Send an email notification for a new job application.
 */
export async function sendApplicationNotification(application: {
  fullName: string;
  email: string;
  phone: string;
  jobTitle: string;
  yearsOfExperience?: string;
  expectedSalary?: string;
  portfolioUrl?: string;
  resumeUrl?: string;
  coverLetter?: string;
}) {
  const subjectLine = `New Job Application: ${application.fullName} - ${application.jobTitle}`;

  const htmlBody = `
  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
    <h2 style="color: #0167D6; border-bottom: 2px solid #0167D6; padding-bottom: 8px;">Job Application Received</h2>
    <table style="width: 100%; border-collapse: collapse; margin-top: 15px;">
      <tr>
        <td style="padding: 8px; font-weight: bold; width: 140px;">Applicant:</td>
        <td style="padding: 8px;">${application.fullName}</td>
      </tr>
      <tr>
        <td style="padding: 8px; font-weight: bold;">Position:</td>
        <td style="padding: 8px; font-weight: bold; color: #0167D6;">${application.jobTitle}</td>
      </tr>
      <tr>
        <td style="padding: 8px; font-weight: bold;">Email:</td>
        <td style="padding: 8px;"><a href="mailto:${application.email}">${application.email}</a></td>
      </tr>
      <tr>
        <td style="padding: 8px; font-weight: bold;">Phone:</td>
        <td style="padding: 8px;">${application.phone}</td>
      </tr>
      ${application.yearsOfExperience ? `
      <tr>
        <td style="padding: 8px; font-weight: bold;">Experience:</td>
        <td style="padding: 8px;">${application.yearsOfExperience}</td>
      </tr>` : ""}
      ${application.expectedSalary ? `
      <tr>
        <td style="padding: 8px; font-weight: bold;">Expected Salary:</td>
        <td style="padding: 8px;">${application.expectedSalary}</td>
      </tr>` : ""}
      ${application.portfolioUrl ? `
      <tr>
        <td style="padding: 8px; font-weight: bold;">Portfolio/LinkedIn:</td>
        <td style="padding: 8px;"><a href="${application.portfolioUrl}" target="_blank">${application.portfolioUrl}</a></td>
      </tr>` : ""}
      ${application.resumeUrl ? `
      <tr>
        <td style="padding: 8px; font-weight: bold;">Resume Link:</td>
        <td style="padding: 8px;"><a href="${application.resumeUrl}" target="_blank" style="color: #0167D6; font-weight: bold;">View Resume</a></td>
      </tr>` : ""}
    </table>

    ${application.coverLetter ? `
    <div style="margin-top: 20px; padding: 15px; background-color: #f8fafc; border-radius: 6px; border-left: 4px solid #0167D6;">
      <h4 style="margin-top: 0; margin-bottom: 8px; color: #334155;">Cover Note:</h4>
      <p style="white-space: pre-wrap; margin: 0; color: #1e293b;">${application.coverLetter}</p>
    </div>` : ""}

    <p style="margin-top: 25px; font-size: 12px; color: #64748b; text-align: center;">
      Applicant response submitted via okobiz careers portal.
    </p>
  </div>
  `;

  return sendEmail({
    subject: subjectLine,
    html: htmlBody,
    replyTo: application.email,
  });
}

/**
 * Send quotation email with PDF attachment and formatted HTML summary.
 */
export async function sendQuotationEmail({
  to,
  clientName,
  organizationName,
  refNo,
  subject: quoteSubject,
  grandTotal,
  inWords,
  attachmentBuffer,
  viewOnlineUrl,
}: {
  to: string;
  clientName: string;
  organizationName?: string | null;
  refNo: string;
  subject: string;
  grandTotal: number | string;
  inWords?: string | null;
  attachmentBuffer?: Buffer;
  viewOnlineUrl?: string;
}) {
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT) || 587;
  const secure = process.env.SMTP_SECURE === "true" || port === 465;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const from = process.env.SMTP_FROM || `"okobiz Quotation Desk" <${user || "info@okobiz.com"}>`;

  const formattedTotal = Number(grandTotal || 0).toLocaleString("en-BD");

  const orgLine = organizationName
    ? `<div class="row"><span class="label">Organization:</span><span class="val">${organizationName}</span></div>`
    : "";

  const wordsLine = inWords
    ? `<div style="font-size: 12px; color: #64748b; margin-top: 6px; font-style: italic;">In Words: ${inWords}</div>`
    : "";

  const onlineBtn = viewOnlineUrl
    ? `<div style="text-align: center; margin: 24px 0;"><a href="${viewOnlineUrl}" class="btn" target="_blank">📄 View & Print Official Quotation (PDF)</a></div>`
    : "";

  const clientHeaderGreeting = organizationName ? `(${organizationName})` : "";

  const html = `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8">
    <style>
      body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f4f5; margin: 0; padding: 24px; color: #18181b; }
      .container { max-width: 620px; margin: 0 auto; background: #ffffff; border-radius: 4px; overflow: hidden; border: 1px solid #e4e4e7; box-shadow: 0 4px 16px rgba(0,0,0,0.06); }
      .header { background: #1E65B8; padding: 28px 24px; text-align: center; color: #ffffff; }
      .header h1 { margin: 0; font-size: 24px; font-weight: 800; letter-spacing: 0.15em; }
      .header p { margin: 6px 0 0; font-size: 11px; letter-spacing: 0.2em; opacity: 0.9; }
      .badge { display: inline-block; background-color: rgba(255, 255, 255, 0.2); padding: 4px 14px; border-radius: 4px; font-size: 11px; margin-top: 12px; font-weight: 700; text-transform: uppercase; }
      .content { padding: 32px 28px; line-height: 1.65; }
      .quote-card { background: #f8fafc; border: 1px solid #cbd5e1; border-radius: 4px; padding: 20px; margin: 24px 0; }
      .row { display: flex; justify-content: space-between; padding: 6px 0; border-bottom: 1px dashed #e2e8f0; font-size: 13px; }
      .row:last-child { border-bottom: none; }
      .label { color: #64748b; font-weight: 600; }
      .val { color: #0f172a; font-weight: 700; text-align: right; }
      .total-row { display: flex; justify-content: space-between; margin-top: 14px; padding-top: 12px; border-top: 2px solid #1E65B8; font-size: 16px; }
      .total-label { font-weight: 800; color: #0f172a; }
      .total-amount { font-weight: 900; color: #1E65B8; }
      .btn { display: inline-block; background: #1E65B8; color: #ffffff !important; padding: 12px 28px; border-radius: 4px; text-decoration: none; font-weight: 700; font-size: 13px; text-align: center; }
      .footer { background: #f8fafc; padding: 20px; text-align: center; font-size: 11px; color: #94a3b8; border-top: 1px solid #e4e4e7; }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">
        <h1>OKOBIZ</h1>
        <p>LEADING THE DIGITAL REVOLUTION</p>
        <div class="badge">Official Business Quotation</div>
      </div>
      <div class="content">
        <p style="font-size: 15px; margin-top: 0;">
          Dear <strong>${clientName}</strong> ${clientHeaderGreeting},
        </p>
        <p style="font-size: 14px;">
          Thank you for showing interest in our software and POS hardware solutions. We are pleased to submit our formal quotation for <strong>${quoteSubject}</strong>.
        </p>

        <div class="quote-card">
          <div class="row">
            <span class="label">Reference No:</span>
            <span class="val">${refNo}</span>
          </div>
          <div class="row">
            <span class="label">Client:</span>
            <span class="val">${clientName}</span>
          </div>
          ${orgLine}
          <div class="row">
            <span class="label">Subject:</span>
            <span class="val">${quoteSubject}</span>
          </div>

          <div class="total-row">
            <span class="total-label">Grand Total Payable:</span>
            <span class="total-amount">৳ ${formattedTotal}</span>
          </div>
          ${wordsLine}
        </div>

        <p style="font-size: 13px; color: #52525b;">
          📎 <strong>Quotation Document:</strong> Please review the attached official PDF document for full scope of work, technical specifications, and terms & conditions.
        </p>

        ${onlineBtn}

        <div style="border-top: 1px solid #e4e4e7; margin-top: 24px; padding-top: 16px; font-size: 13px; color: #71717a;">
          <p style="margin: 0; font-weight: 700; color: #18181b;">Thanks & Regards,</p>
          <p style="margin: 4px 0 0; font-weight: 600;">Md. Sorower Jahan</p>
          <p style="margin: 2px 0 0; color: #52525b; font-weight: 500;">CEO | Okobiz</p>
          <p style="margin: 2px 0 0;">Mobile: +880 1973590937 | Web: okobiz.com</p>
        </div>
      </div>
      <div class="footer">
        <p style="margin: 0;">&copy; ${new Date().getFullYear()} Okobiz. All rights reserved.</p>
        <p style="margin: 4px 0 0;">This is an automated quotation transmission.</p>
      </div>
    </div>
  </body>
  </html>
  `;

  const safeFilename = `Quotation_${refNo.replace(/[^a-zA-Z0-9_-]/g, "_")}.pdf`;
  const attachments: any[] = [];
  if (attachmentBuffer) {
    attachments.push({
      filename: safeFilename,
      content: attachmentBuffer,
      contentType: "application/pdf",
    });
  }

  const isSmtpConfigured = Boolean(host && user && pass);
  if (!isSmtpConfigured) {
    console.info(`[SIMULATED QUOTATION EMAIL] To: ${to} | Ref: ${refNo} | Amount: ${formattedTotal}`);
    return {
      success: true,
      mode: "simulated",
      message: `Quotation email to ${to} simulated successfully (SMTP not configured).`,
    };
  }

  const transporter = nodemailer.createTransport({
    host,
    port,
    secure,
    auth: { user, pass },
  });

  return transporter.sendMail({
    from,
    to,
    subject: `📄 Quotation: ${quoteSubject} [Ref: ${refNo}] - okobiz`,
    html,
    attachments: attachments.length > 0 ? attachments : undefined,
  });
}
