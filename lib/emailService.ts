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

Our team will contact you shortly to coordinate the next steps and get started with your service.

Have questions? You can reply directly to this email
or reach us on WhatsApp at https://wa.me/971585819271 (+971 58 581 9271) if you have any immediate questions.

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
          
          <p style="font-size: 14px; color: #718096; text-align: center;">Have questions? You can reply directly to this email<br />or contact us on WhatsApp at <a href="https://wa.me/971585819271" style="color: #5a58ab; font-weight: bold; text-decoration: none; white-space: nowrap;">+971 58 581 9271</a>.</p>
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
        path: path.join(/*turbopackIgnore: true*/ process.cwd(), "public", "logo.avif"),
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
  calSchedulingLink?: string;
  bookingLink?: string;
  interviewDescription?: string | null;
  interviewBrief?: string | null;
  yearsOfExperience?: string | number;
  applicationLink?: string | null;
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

If you have any questions, feel free to reply to this email
or contact us via WhatsApp at https://wa.me/971585819271 (+971 58 581 9271).

Best of luck!
Team JB Recruitment Solutions`
    : `Hi ${data.candidateName},

Thank you for booking your coach-led mock interview practice session for ${data.jobRole} at JB Recruitment Solutions.

Your payment has been received. Please use the link below to book your preferred session slot:

${data.bookingLink || data.calSchedulingLink ? `Book your slot: ${data.bookingLink || data.calSchedulingLink}` : "Our team will contact you shortly to schedule your session."}

Role focus: ${data.jobRole}
Years of experience: ${data.yearsOfExperience || "Not provided"}
${data.applicationLink ? `Application link: ${data.applicationLink}` : ""}
${data.interviewBrief ? `\nInterview brief:\n${data.interviewBrief}` : ""}

If you have any questions, feel free to reply to this email
or contact us via WhatsApp at https://wa.me/971585819271 (+971 58 581 9271).

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
          <p style="font-size: 13px; color: #718096;">This link expires in <strong>7 days</strong>. Use Chrome or Edge for the best experience. Ensure your microphone is working before starting.<br />For support, contact us via WhatsApp at <a href="https://wa.me/971585819271" style="color: #5a58ab; font-weight: bold; text-decoration: none; white-space: nowrap;">+971 58 581 9271</a>.</p>
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
          <h2 style="color: #5a58ab; font-size: 22px; margin-top: 0; font-weight: 600;">Payment Confirmed — Book Your Session</h2>
          <p>Hi <strong>${escapeHtml(data.candidateName)}</strong>,</p>
          <p>Thank you for booking a coach-led mock interview for <strong>${escapeHtml(data.jobRole)}</strong>. Your payment has been received successfully.</p>
          <p>Please click below to choose your preferred date and time — the slot will be confirmed with your coach immediately after you schedule:</p>
          ${(data.bookingLink || data.calSchedulingLink) ? `
          <div style="text-align: center; margin: 28px 0;">
            <a href="${data.bookingLink || data.calSchedulingLink}" style="background-color: #5a58ab; color: white; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 15px; display: inline-block;">Book Your Session Slot</a>
          </div>
          <p style="font-size: 13px; color: #718096; text-align: center;">Or copy this link: <a href="${data.bookingLink || data.calSchedulingLink}" style="color: #5a58ab;">${data.bookingLink || data.calSchedulingLink}</a></p>
          ` : `<p style="font-size: 14px; color: #718096;">Our team will contact you shortly to schedule your session.</p>`}
          <div style="background-color: #f7fafc; border: 1px solid #edf2f7; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 0 0 8px; font-size: 14px; color: #4a5568;"><strong>Role:</strong> ${escapeHtml(data.jobRole)}</p>
            <p style="margin: 0 0 8px; font-size: 14px; color: #4a5568;"><strong>Years of experience:</strong> ${escapeHtml(String(data.yearsOfExperience || "Not provided"))}</p>
            ${data.applicationLink ? `<p style="margin: 0 0 8px; font-size: 14px; color: #4a5568;"><strong>Application link:</strong> <a href="${escapeHtml(data.applicationLink)}" style="color: #5a58ab;">${escapeHtml(data.applicationLink)}</a></p>` : ""}
            ${data.interviewBrief ? `<p style="margin: 0; font-size: 14px; color: #4a5568;"><strong>Brief:</strong> ${escapeHtml(data.interviewBrief)}</p>` : ""}
          </div>
          <p style="font-size: 14px; color: #718096;">If you have any questions, feel free to reply to this email<br />or contact us via WhatsApp at <a href="https://wa.me/971585819271" style="color: #5a58ab; font-weight: bold; text-decoration: none; white-space: nowrap;">+971 58 581 9271</a>.</p>
        </div>
        <div style="text-align: center; padding-top: 20px; border-top: 1px solid #edf2f7; font-size: 12px; color: #a0aec0;">
          <p>© ${new Date().getFullYear()} JB Recruitment Solutions. All rights reserved.</p>
        </div>
      </div>
    `;

  const attachments = [
    {
      filename: "logo.avif",
      path: path.join(/*turbopackIgnore: true*/ process.cwd(), "public", "logo.avif"),
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

interface HumanInterviewScheduleData {
  candidateName: string;
  candidateEmail: string;
  jobRole: string;
  scheduledAt: Date;
  timeZone?: string;
  yearsOfExperience?: string | number;
  applicationLink?: string | null;
  interviewBrief?: string | null;
  purchaseId: string;
}

export async function sendHumanInterviewScheduleConfirmationEmail(data: HumanInterviewScheduleData) {
  const user = process.env.NEXT_NODEMAILER_USER;
  if (!user) {
    return { success: false, error: "Mailer credentials missing" };
  }

  const transporter = getMailerTransporter();
  const formattedDate = new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: data.timeZone || "Asia/Kolkata",
  }).format(data.scheduledAt);

  try {
    await transporter.sendMail({
      from: `"JB Recruitment Solutions" <${user}>`,
      to: data.candidateEmail,
      subject: `Your Human Interview Slot is Confirmed — ${escapeHtml(data.jobRole)}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px;">
          <h2 style="color: #5a58ab; margin-top: 0;">Human Interview Slot Confirmed</h2>
          <p>Hi <strong>${escapeHtml(data.candidateName)}</strong>,</p>
          <p>Your human-led interview for <strong>${escapeHtml(data.jobRole)}</strong> has been scheduled.</p>
          <div style="background:#f7fafc;border:1px solid #edf2f7;padding:16px;border-radius:10px;margin:18px 0;">
            <p style="margin:0 0 8px;"><strong>Date & time:</strong> ${escapeHtml(formattedDate)}</p>
            <p style="margin:0 0 8px;"><strong>Role:</strong> ${escapeHtml(data.jobRole)}</p>
            <p style="margin:0 0 8px;"><strong>Years of experience:</strong> ${escapeHtml(String(data.yearsOfExperience || "Not provided"))}</p>
            ${data.applicationLink ? `<p style="margin:0 0 8px;"><strong>Application link:</strong> <a href="${escapeHtml(data.applicationLink)}">${escapeHtml(data.applicationLink)}</a></p>` : ""}
            ${data.interviewBrief ? `<p style="margin:0;"><strong>Brief:</strong> ${escapeHtml(data.interviewBrief)}</p>` : ""}
          </div>
          <p style="margin:0;color:#718096;font-size:13px;">Reference ID: ${escapeHtml(data.purchaseId)}</p>
          <p style="margin:8px 0 0;color:#718096;font-size:13px;">Have questions? Reply to this email<br />or contact us via WhatsApp at <a href="https://wa.me/971585819271" style="color: #5a58ab; font-weight: bold; text-decoration: none; white-space: nowrap;">+971 58 581 9271</a>.</p>
        </div>
      `,
    });

    return { success: true };
  } catch (err) {
    console.error("Error sending human interview schedule confirmation email:", err);
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
  weaknesses: string[];
  improvements: string[];
  evaluationEvents: Array<{ question: string; answerSummary: string; score: number; feedback: string; improvementTip?: string }>;
  resultsPageUrl?: string;
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
  const subject = `Your Mock Interview Report: ${escapeHtml(data.jobRole)} — JB Recruitment Solutions`;

  const textBody = `Hi ${data.candidateName},

Your mock interview for ${data.jobRole} has been completed.${scoreLine}

Summary:
${data.summary}
${data.resultsPageUrl ? `\nView your full results (improvements, Q&A breakdown, transcript):\n${data.resultsPageUrl}` : ""}

Your full performance report is also attached as a PDF.

If you have any questions, feel free to reply to this email
or contact us via WhatsApp at https://wa.me/971585819271 (+971 58 581 9271).

Best regards,
Team JB Recruitment Solutions`;

  const scoreColor = data.finalScore === null ? "#5a58ab"
    : data.finalScore >= 8 ? "#16a34a"
    : data.finalScore >= 6 ? "#d97706"
    : "#dc2626";

  const scoreHtml = data.finalScore !== null
    ? `<div style="text-align:center;margin:24px 0;">
        <div style="display:inline-block;border-radius:16px;padding:20px 36px;border:2px solid ${scoreColor}20;background:${scoreColor}08;">
          <div style="color:#718096;font-size:11px;font-weight:700;letter-spacing:1px;margin-bottom:6px;text-transform:uppercase;">Overall Score</div>
          <div style="font-size:48px;font-weight:800;line-height:1;color:${scoreColor};">${data.finalScore}<span style="font-size:20px;font-weight:400;color:#a0aec0;"> / 10</span></div>
        </div>
      </div>`
    : "";

  const resultsButtonHtml = data.resultsPageUrl
    ? `<div style="text-align:center;margin:24px 0 8px;">
        <a href="${data.resultsPageUrl}" style="display:inline-block;background:#5a58ab;color:white;padding:14px 32px;border-radius:10px;text-decoration:none;font-weight:700;font-size:14px;letter-spacing:0.2px;">View Your Full Results →</a>
        <p style="margin:10px 0 0;font-size:11px;color:#a0aec0;">Improvements · Q&amp;A breakdown · Full transcript</p>
      </div>`
    : "";

  const htmlBody = `
    <div style="font-family:'Raleway',Helvetica,Arial,sans-serif;max-width:600px;margin:0 auto;border:1px solid #e2e8f0;border-radius:12px;overflow:hidden;color:#2d3748;">
      <div style="background:#1a1f2b;padding:18px 28px;display:flex;align-items:center;justify-content:space-between;">
        <img src="cid:jb-logo" alt="JB Recruitment Solutions" style="height:36px;width:auto;" />
        <span style="color:rgba(255,255,255,0.4);font-size:11px;">Performance Report</span>
      </div>
      <div style="background:#5a58ab;padding:9px 28px;">
        <span style="color:white;font-size:11px;font-weight:700;letter-spacing:0.8px;text-transform:uppercase;">Mock Interview Complete</span>
      </div>
      <div style="padding:28px;">
        <p style="margin:0 0 4px;font-size:15px;">Hi <strong>${escapeHtml(data.candidateName)}</strong>,</p>
        <p style="margin:0 0 20px;color:#4a5568;font-size:14px;">Your mock interview for <strong>${escapeHtml(data.jobRole)}</strong> is complete. Here is your performance summary.</p>
        ${scoreHtml}
        <div style="background:#f7fafc;border:1px solid #edf2f7;border-radius:10px;padding:16px;margin:20px 0;">
          <p style="margin:0 0 8px;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.5px;color:#718096;">Summary</p>
          <p style="margin:0;font-size:14px;color:#2d3748;line-height:1.65;">${escapeHtml(data.summary)}</p>
        </div>
        ${resultsButtonHtml}
        <p style="font-size:12px;color:#a0aec0;margin-top:20px;text-align:center;">Your complete performance report (with full Q&amp;A and transcript) is also attached as a PDF.<br />For questions, reach us on WhatsApp at <a href="https://wa.me/971585819271" style="color: #5a58ab; font-weight: bold; text-decoration: none; white-space: nowrap;">+971 58 581 9271</a>.</p>
      </div>
      <div style="background:#f7fafc;border-top:1px solid #edf2f7;padding:14px 28px;text-align:center;font-size:11px;color:#a0aec0;">
        © ${new Date().getFullYear()} JB Recruitment Solutions. All rights reserved.
      </div>
    </div>`;

  const attachments: Array<{ filename: string; content?: Buffer; path?: string; cid?: string }> = [
    { filename: "logo.avif", path: path.join(/*turbopackIgnore: true*/ process.cwd(), "public", "logo.avif"), cid: "jb-logo" },
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
