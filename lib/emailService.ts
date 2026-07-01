import { getMailerTransporter } from "./mailer";
import { generateReceiptPdf } from "./pdfGenerator";
import { escapeHtml } from "./security";
import path from "path";

interface PurchaseData {
  id: string;
  candidateName: string;
  candidateEmail: string;
  serviceName: string;
  amount: number;
  currency: string;
  country: string | null;
  createdAt: Date;
}

export async function sendPurchaseEmails(purchase: PurchaseData) {
  const user = process.env.NEXT_NODEMAILER_USER;
  const adminEmail =
    process.env.PURCHASE_ALERT_EMAIL || user;

  if (!user) {
    console.error("Mailer credentials missing. Cannot send emails.");
    return { success: false, error: "Mailer credentials missing" };
  }

  const transporter = getMailerTransporter();

  // Generate PDF receipt
  let pdfBuffer: Buffer;
  try {
    pdfBuffer = await generateReceiptPdf(purchase);
  } catch (pdfError) {
    console.error("Failed to generate PDF receipt:", pdfError);
    return { success: false, error: "PDF generation failed" };
  }

  const formatServicesList = (rawName: string) => {
    const parts = rawName.split(" + ");
    if (parts.length <= 1) return rawName;
    if (parts.length === 2) return `${parts[0]} and ${parts[1]}`;
    return `${parts.slice(0, -1).join(", ")}, and ${parts[parts.length - 1]}`;
  };

  const formattedServices = formatServicesList(purchase.serviceName);

  const isMultiService = purchase.serviceName.includes(" + ");

  const formatCurrency = (amount: number, currencyStr: string) => {
    const currencyUpper = currencyStr.toUpperCase();
    const locale = currencyUpper === "INR" ? "en-IN" : "en-US";
    return `${amount.toLocaleString(locale, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })} ${currencyUpper}`;
  };

  const formattedAmount = formatCurrency(purchase.amount, purchase.currency);

  // 1. Candidate Email Options
  const candidateMailOptions = {
    from: `"JB Recruitment Solutions" <${user}>`,
    to: purchase.candidateEmail,
    subject: `Your Receipt for ${formattedServices} - JB Recruitment Solutions`,
    text: `Hi ${purchase.candidateName},

Thank you for your purchase of "${formattedServices}"!

We have received your payment of ${formattedAmount}. Your receipt is attached to this email as a PDF.

Our team will contact you shortly to coordinate the next steps and get started with your service. You can also reply directly to this email if you have any immediate questions.

Best regards,
Team JB Recruitment Solutions`,
    html: `
      <div style="font-family: 'Raleway', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px; color: #2d3748; line-height: 1.6;">
        <div style="text-align: center; padding-bottom: 20px; border-bottom: 1px solid #edf2f7;">
          <img src="cid:jb-logo" alt="JB Recruitment Solutions" style="width: 100px; height: auto;" />
        </div>
        <div style="padding: 20px 0;">
          <h2 style="color: #5a58ab; font-size: 22px; margin-top: 0; font-weight: 600;">Payment Confirmed!</h2>
          <p>Hi <strong>${purchase.candidateName}</strong>,</p>
          <p>Thank you for purchasing <strong>${formattedServices}</strong>. We're excited to work with you on your career journey!</p>
          
          <div style="background-color: #f7fafc; border: 1px solid #edf2f7; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0; font-size: 16px; color: #4a5568;">Purchase Summary</h3>
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 6px 0; color: #718096;">${isMultiService ? "Services:" : "Service:"}</td>
                <td style="padding: 6px 0; font-weight: bold; text-align: right;">${formattedServices}</td>
              </tr>
              <tr>
                <td style="padding: 6px 0; color: #718096;">Amount Paid:</td>
                <td style="padding: 6px 0; font-weight: bold; text-align: right; color: #5a58ab;">${formattedAmount}</td>
              </tr>
              <tr>
                <td style="padding: 6px 0; color: #718096;">Receipt ID:</td>
                <td style="padding: 6px 0; font-family: monospace; font-size: 13px; text-align: right;">${purchase.id}</td>
              </tr>
            </table>
          </div>

          <p>We've attached your official PDF receipt to this email. Please keep it for your records.</p>
          
          <p>Our team will contact you shortly to coordinate the next steps and get started with your service.</p>
          
          <p style="font-size: 14px; color: #718096; text-align: center;">Have questions or want to open the chat? You can also reply directly to this email to speak with our support team.</p>
        </div>
        <div style="text-align: center; padding-top: 20px; border-top: 1px solid #edf2f7; font-size: 12px; color: #a0aec0;">
          <p>© ${new Date().getFullYear()} JB Recruitment Solutions. All rights reserved.</p>
        </div>
      </div>
    `,
    attachments: [
      {
        filename: `Receipt-${purchase.id}.pdf`,
        content: pdfBuffer,
      },
      {
        filename: "logo.avif",
        path: path.join(process.cwd(), "public", "logo.avif"),
        cid: "jb-logo",
      },
    ],
  };

  // 2. Admin Alert Email Options
  const adminMailOptions = {
    from: `"Purchase Alert" <${user}>`,
    to: adminEmail,
    subject: `🚨 Alert: New Premium Purchase - ${purchase.candidateName}`,
    text: `New premium service purchase alert:
Candidate Name: ${purchase.candidateName}
Candidate Email: ${purchase.candidateEmail}
Service Name: ${purchase.serviceName}
Amount: ${formattedAmount}
Billing Country: ${purchase.country || "Not provided"}
Transaction Date: ${purchase.createdAt.toLocaleString()}
Purchase ID: ${purchase.id}`,
    html: `
      <div style="font-family: Arial, sans-serif; padding: 20px; border: 2px solid #5a58ab; border-radius: 8px; max-width: 600px; margin: 0 auto; color: #333;">
        <h2 style="color: #e53e3e; margin-top: 0;">🚨 New Premium Purchase</h2>
        <p>A candidate has successfully purchased a premium service. Here are the details:</p>
        
        <div style="background-color: #fffaf0; border: 1px solid #feebc8; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 8px 0; font-weight: bold; border-bottom: 1px solid #edf2f7;">Candidate Name:</td>
              <td style="padding: 8px 0; border-bottom: 1px solid #edf2f7;">${purchase.candidateName}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; font-weight: bold; border-bottom: 1px solid #edf2f7;">Candidate Email:</td>
              <td style="padding: 8px 0; border-bottom: 1px solid #edf2f7;"><a href="mailto:${purchase.candidateEmail}">${purchase.candidateEmail}</a></td>
            </tr>
            <tr>
              <td style="padding: 8px 0; font-weight: bold; border-bottom: 1px solid #edf2f7;">${isMultiService ? "Services Purchased:" : "Service Name:"}</td>
              <td style="padding: 8px 0; border-bottom: 1px solid #edf2f7; font-weight: bold; color: #5a58ab;">${purchase.serviceName}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; font-weight: bold; border-bottom: 1px solid #edf2f7;">Transaction Amount:</td>
              <td style="padding: 8px 0; border-bottom: 1px solid #edf2f7; font-weight: bold; color: #38a169;">${formattedAmount}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; font-weight: bold; border-bottom: 1px solid #edf2f7;">Billing Country:</td>
              <td style="padding: 8px 0; border-bottom: 1px solid #edf2f7;">${purchase.country || "Not provided"}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; font-weight: bold; border-bottom: 1px solid #edf2f7;">Purchase ID:</td>
              <td style="padding: 8px 0; border-bottom: 1px solid #edf2f7; font-family: monospace;">${purchase.id}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; font-weight: bold;">Date:</td>
              <td style="padding: 8px 0;">${purchase.createdAt.toLocaleString()}</td>
            </tr>
          </table>
        </div>
        
        <p style="font-size: 13px; color: #718096;">This is an automated system alert. A confirmation email and PDF receipt have already been dispatched to the candidate.</p>
      </div>
    `,
  };

  try {
    // Send to candidate
    console.log(`Sending purchase confirmation email to candidate: ${purchase.candidateEmail}`);
    await transporter.sendMail(candidateMailOptions);

    // Send to admin
    console.log(`Sending alert email to admin: ${adminEmail}`);
    await transporter.sendMail(adminMailOptions);

    return { success: true };
  } catch (err) {
    console.error("Error sending purchase confirmation/alert emails:", err);
    return { success: false, error: err };
  }
}

interface InterviewInvitationData {
  candidateName: string;
  candidateEmail: string;
  jobRole: string;
  interviewPreference: "AI" | "MANUAL";
  interviewLink?: string;
  interviewDescription?: string | null;
  durationMinutes: number;
}

export async function sendInterviewInvitationEmail(data: InterviewInvitationData) {
  const user = process.env.NEXT_NODEMAILER_USER;
  if (!user) {
    console.error("Mailer credentials missing. Cannot send interview invitation email.");
    return { success: false, error: "Mailer credentials missing" };
  }

  const transporter = getMailerTransporter();

  const isAI = data.interviewPreference === "AI";

  const subject = isAI
    ? `Your AI Mock Interview Link for ${escapeHtml(data.jobRole)} — JB Recruitment Solutions`
    : `Booking Confirmed for ${escapeHtml(data.jobRole)} — JB Recruitment Solutions`;

  const textBody = isAI
    ? `Hi ${data.candidateName},

Thank you for booking your mock interview practice session for ${data.jobRole} at JB Recruitment Solutions.

Your AI-powered mock interview is ready. Click the link below to begin when you are ready. The link expires in 7 days.

Interview Link: ${data.interviewLink}

Duration: approximately ${data.durationMinutes} minutes
${data.interviewDescription ? `\nWhat to expect:\n${data.interviewDescription}` : ""}

Tips before you start:
- Use a quiet environment with minimal background noise.
- Ensure your microphone is working.
- Use Chrome or Edge for best compatibility.

Best of luck!
Team JB Recruitment Solutions`
    : `Hi ${data.candidateName},

Thank you for booking your mock interview practice session for ${data.jobRole} at JB Recruitment Solutions.

We have received your booking and a coach will be in touch with you shortly to schedule your practice session.

Best regards,
Team JB Recruitment Solutions`;

  const htmlBody = isAI
    ? `
      <div style="font-family: 'Raleway', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px; color: #2d3748; line-height: 1.6;">
        <div style="text-align: center; padding-bottom: 20px; border-bottom: 1px solid #edf2f7;">
          <img src="cid:jb-logo" alt="JB Recruitment Solutions" style="width: 100px; height: auto;" />
        </div>
        <div style="padding: 20px 0;">
          <h2 style="color: #5a58ab; font-size: 22px; margin-top: 0; font-weight: 600;">Your Mock Interview is Ready</h2>
          <p>Hi <strong>${escapeHtml(data.candidateName)}</strong>,</p>
          <p>Thank you for booking your mock interview practice session for <strong>${escapeHtml(data.jobRole)}</strong>. Your AI-powered mock interview is now ready to begin.</p>
          ${data.interviewDescription ? `<div style="background-color: #f7fafc; border: 1px solid #edf2f7; padding: 15px; border-radius: 8px; margin: 16px 0;"><p style="margin: 0; font-size: 14px; color: #4a5568;">${escapeHtml(data.interviewDescription)}</p></div>` : ""}
          <div style="background-color: #f7fafc; border: 1px solid #edf2f7; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 6px 0; color: #718096;">Role:</td>
                <td style="padding: 6px 0; font-weight: bold; text-align: right;">${escapeHtml(data.jobRole)}</td>
              </tr>
              <tr>
                <td style="padding: 6px 0; color: #718096;">Duration:</td>
                <td style="padding: 6px 0; font-weight: bold; text-align: right;">~${data.durationMinutes} minutes</td>
              </tr>
              <tr>
                <td style="padding: 6px 0; color: #718096;">Format:</td>
                <td style="padding: 6px 0; font-weight: bold; text-align: right;">AI Mock Interview</td>
              </tr>
            </table>
          </div>
          <div style="text-align: center; margin: 28px 0;">
            <a href="${data.interviewLink}" style="background-color: #5a58ab; color: white; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 15px; display: inline-block;">Start Your Interview</a>
          </div>
          <p style="font-size: 13px; color: #718096;">This link expires in <strong>7 days</strong>. Use Chrome or Edge for the best experience. Ensure your microphone is working before starting.</p>
        </div>
        <div style="text-align: center; padding-top: 20px; border-top: 1px solid #edf2f7; font-size: 12px; color: #a0aec0;">
          <p>© ${new Date().getFullYear()} JB Recruitment Solutions. All rights reserved.</p>
        </div>
      </div>
    `
    : `
      <div style="font-family: 'Raleway', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px; color: #2d3748; line-height: 1.6;">
        <div style="text-align: center; padding-bottom: 20px; border-bottom: 1px solid #edf2f7;">
          <img src="cid:jb-logo" alt="JB Recruitment Solutions" style="width: 100px; height: auto;" />
        </div>
        <div style="padding: 20px 0;">
          <h2 style="color: #5a58ab; font-size: 22px; margin-top: 0; font-weight: 600;">Booking Confirmed</h2>
          <p>Hi <strong>${escapeHtml(data.candidateName)}</strong>,</p>
          <p>Thank you for booking your mock interview practice session for <strong>${escapeHtml(data.jobRole)}</strong>. We have received your booking and a coach will be in touch shortly to schedule your practice session.</p>
          <p style="font-size: 14px; color: #718096;">If you have any questions in the meantime, feel free to reply to this email.</p>
        </div>
        <div style="text-align: center; padding-top: 20px; border-top: 1px solid #edf2f7; font-size: 12px; color: #a0aec0;">
          <p>© ${new Date().getFullYear()} JB Recruitment Solutions. All rights reserved.</p>
        </div>
      </div>
    `;

  const attachments = [
    {
      filename: "logo.avif",
      path: path.join(process.cwd(), "public", "logo.avif"),
      cid: "jb-logo",
    },
  ];

  try {
    await transporter.sendMail({
      from: `"JB Recruitment Solutions" <${user}>`,
      to: data.candidateEmail,
      subject,
      text: textBody,
      html: htmlBody,
      attachments,
    });
    return { success: true };
  } catch (err) {
    console.error("Error sending interview invitation email:", err);
    return { success: false, error: err };
  }
}

interface InterviewResultsData {
  candidateName: string;
  candidateEmail: string;
  jobRole: string;
  completedAt: Date | null;
  finalScore: number | null;
  summary: string;
  strengths: string[];
  improvements: string[];
  evaluationEvents: Array<{ question: string; answerSummary: string; score: number; feedback: string }>;
}

export async function sendInterviewResultsToCandidate(data: InterviewResultsData) {
  const user = process.env.NEXT_NODEMAILER_USER;
  if (!user) return { success: false, error: "Mailer credentials missing" };

  const transporter = getMailerTransporter();

  let pdfBuffer: Buffer | null = null;
  try {
    const { generateInterviewReportPdf } = await import("./pdfGenerator");
    pdfBuffer = await generateInterviewReportPdf(data);
  } catch (pdfErr) {
    console.error("Failed to generate interview report PDF:", pdfErr);
  }

  const scoreLine = data.finalScore !== null ? `\nYour Score: ${data.finalScore} / 10` : "";
  const strengthsList = data.strengths.map((s) => `  + ${s}`).join("\n");
  const improvementsList = data.improvements.map((s) => `  △ ${s}`).join("\n");

  const subject = `Your Mock Interview Report: ${data.jobRole} — JB Recruitment Solutions`;

  const textBody = `Hi ${data.candidateName},

Your mock interview for ${data.jobRole} has been completed. Here is your performance report.
${scoreLine}

Summary:
${data.summary}

Strengths:
${strengthsList || "See attached report."}

Areas to Improve:
${improvementsList || "See attached report."}

Your full report is attached as a PDF.

Best regards,
Team JB Recruitment Solutions`;

  const scoreHtml = data.finalScore !== null
    ? `<div style="text-align:center;margin:24px 0 0;">
        <div style="display:inline-block;background:#5a58ab;border-radius:12px;padding:16px 32px;">
          <div style="color:rgba(255,255,255,0.7);font-size:11px;font-weight:700;letter-spacing:1px;margin-bottom:4px;">SCORE</div>
          <div style="color:white;font-size:36px;font-weight:800;line-height:1;">${data.finalScore}<span style="font-size:16px;font-weight:400;opacity:0.7"> / 10</span></div>
        </div>
      </div>`
    : "";

  const htmlBody = `
    <div style="font-family:'Raleway',Helvetica,Arial,sans-serif;max-width:600px;margin:0 auto;border:1px solid #e2e8f0;border-radius:12px;overflow:hidden;color:#2d3748;">
      <div style="background:#1a1f2b;padding:20px 28px;display:flex;align-items:center;justify-content:space-between;">
        <img src="cid:jb-logo" alt="JB Recruitment Solutions" style="height:40px;width:auto;" />
        <span style="color:rgba(255,255,255,0.5);font-size:11px;">Performance Report</span>
      </div>
      <div style="background:#5a58ab;padding:10px 28px;">
        <span style="color:white;font-size:12px;font-weight:700;letter-spacing:0.5px;">MOCK INTERVIEW PERFORMANCE REPORT</span>
      </div>
      <div style="padding:28px;">
        <p style="margin:0 0 4px;">Hi <strong>${escapeHtml(data.candidateName)}</strong>,</p>
        <p style="margin:0 0 20px;color:#4a5568;">Your mock interview for <strong>${escapeHtml(data.jobRole)}</strong> is complete. Here is your performance report.</p>
        ${scoreHtml}
        <div style="background:#f7fafc;border:1px solid #edf2f7;border-radius:8px;padding:16px;margin:20px 0;">
          <p style="margin:0 0 6px;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.5px;color:#718096;">Summary</p>
          <p style="margin:0;font-size:14px;color:#2d3748;line-height:1.6;">${escapeHtml(data.summary)}</p>
        </div>
        ${data.strengths.length > 0 ? `
        <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;padding:16px;margin:16px 0;">
          <p style="margin:0 0 10px;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.5px;color:#15803d;">Strengths</p>
          <ul style="margin:0;padding-left:0;list-style:none;">
            ${data.strengths.map((s) => `<li style="font-size:13px;color:#2d3748;padding:4px 0;"><span style="color:#16a34a;font-weight:700;margin-right:8px;">+</span>${escapeHtml(s)}</li>`).join("")}
          </ul>
        </div>` : ""}
        ${data.improvements.length > 0 ? `
        <div style="background:#fffbeb;border:1px solid #fde68a;border-radius:8px;padding:16px;margin:16px 0;">
          <p style="margin:0 0 10px;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.5px;color:#b45309;">Areas to Improve</p>
          <ul style="margin:0;padding-left:0;list-style:none;">
            ${data.improvements.map((s) => `<li style="font-size:13px;color:#2d3748;padding:4px 0;"><span style="color:#d97706;font-weight:700;margin-right:8px;">△</span>${escapeHtml(s)}</li>`).join("")}
          </ul>
        </div>` : ""}
        <p style="font-size:12px;color:#718096;margin-top:24px;">Your full performance report with question-by-question evaluation is attached as a PDF. Keep it for your records and use it to guide your preparation.</p>
      </div>
      <div style="background:#f7fafc;border-top:1px solid #edf2f7;padding:16px 28px;text-align:center;font-size:11px;color:#a0aec0;">
        © ${new Date().getFullYear()} JB Recruitment Solutions. All rights reserved.
      </div>
    </div>`;

  const attachments: Array<{ filename: string; content?: Buffer; path?: string; cid?: string }> = [
    { filename: "logo.avif", path: path.join(process.cwd(), "public", "logo.avif"), cid: "jb-logo" },
  ];
  if (pdfBuffer) {
    const safeName = data.jobRole.replace(/[^a-zA-Z0-9_-]/g, "_");
    attachments.push({ filename: `Interview-Report-${safeName}.pdf`, content: pdfBuffer });
  }

  try {
    await transporter.sendMail({ from: `"JB Recruitment Solutions" <${user}>`, to: data.candidateEmail, subject, text: textBody, html: htmlBody, attachments });
    return { success: true };
  } catch (err) {
    console.error("Error sending interview results email:", err);
    return { success: false, error: err };
  }
}

interface NewApplicationAlertData {
  candidateName: string;
  candidateEmail: string;
  candidatePhone?: string | null;
  linkedInUrl?: string | null;
  jobRole: string;
  interviewPreference: "AI" | "MANUAL";
  applicationId: string;
}

export async function sendNewApplicationAlertEmail(data: NewApplicationAlertData) {
  const user = process.env.NEXT_NODEMAILER_USER;
  const receiver = process.env.INTERVIEW_REPORT_EMAIL || user;
  if (!user || !receiver) return { success: false, error: "Mailer credentials missing" };

  const transporter = getMailerTransporter();

  try {
    await transporter.sendMail({
      from: `"Application Alert" <${user}>`,
      to: receiver,
      subject: `New Booking: ${escapeHtml(data.candidateName)} — ${escapeHtml(data.jobRole)}`,
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; border: 2px solid #5a58ab; border-radius: 8px; max-width: 600px; margin: 0 auto; color: #333;">
          <h2 style="color: #5a58ab; margin-top: 0;">New Mock Interview Booking</h2>
          <div style="background-color: #f7fafc; border: 1px solid #edf2f7; padding: 15px; border-radius: 8px;">
            <table style="width: 100%; border-collapse: collapse;">
              <tr><td style="padding: 7px 0; font-weight: bold; border-bottom: 1px solid #edf2f7;">Name:</td><td style="padding: 7px 0; border-bottom: 1px solid #edf2f7;">${escapeHtml(data.candidateName)}</td></tr>
              <tr><td style="padding: 7px 0; font-weight: bold; border-bottom: 1px solid #edf2f7;">Email:</td><td style="padding: 7px 0; border-bottom: 1px solid #edf2f7;"><a href="mailto:${escapeHtml(data.candidateEmail)}">${escapeHtml(data.candidateEmail)}</a></td></tr>
              <tr><td style="padding: 7px 0; font-weight: bold; border-bottom: 1px solid #edf2f7;">Phone:</td><td style="padding: 7px 0; border-bottom: 1px solid #edf2f7;">${escapeHtml(data.candidatePhone || "Not provided")}</td></tr>
              <tr><td style="padding: 7px 0; font-weight: bold; border-bottom: 1px solid #edf2f7;">LinkedIn:</td><td style="padding: 7px 0; border-bottom: 1px solid #edf2f7;">${data.linkedInUrl ? `<a href="${escapeHtml(data.linkedInUrl)}">${escapeHtml(data.linkedInUrl)}</a>` : "Not provided"}</td></tr>
              <tr><td style="padding: 7px 0; font-weight: bold; border-bottom: 1px solid #edf2f7;">Role:</td><td style="padding: 7px 0; border-bottom: 1px solid #edf2f7; font-weight: bold; color: #5a58ab;">${escapeHtml(data.jobRole)}</td></tr>
              <tr><td style="padding: 7px 0; font-weight: bold;">Session Type:</td><td style="padding: 7px 0;">${data.interviewPreference === "AI" ? "AI Mock Interview" : "Coach Session"}</td></tr>
            </table>
          </div>
          <p style="font-size: 13px; color: #718096; margin-top: 16px;">Application ID: <code>${escapeHtml(data.applicationId)}</code></p>
        </div>
      `,
    });
    return { success: true };
  } catch (err) {
    console.error("Error sending new application alert email:", err);
    return { success: false, error: err };
  }
}
