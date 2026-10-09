import { getMailerTransporter, createFreshMailerTransporter } from "./mailer";
import { generateReceiptPdf } from "./pdfGenerator";
import { escapeHtml } from "./security";
import { buildAppUrl } from "./app-url";
import path from "path";

/**
 * Sends an email using the pooled transporter, falling back to a fresh direct connection on transient errors (e.g. greeting timeout, dropped socket).
 */
async function sendMailWithRetry(mailOptions: any, description: string): Promise<any> {
  const transporter = getMailerTransporter();
  try {
    return await transporter.sendMail(mailOptions);
  } catch (err: any) {
    console.warn(
      `Transient error sending ${description} (${err?.message || err}). Retrying with a fresh direct connection...`
    );
    try {
      const freshTransporter = createFreshMailerTransporter();
      return await freshTransporter.sendMail(mailOptions);
    } catch (retryErr) {
      console.error(`Retry failed for ${description}:`, retryErr);
      throw retryErr;
    }
  }
}

export interface PurchaseData {
  id: string;
  candidateName: string;
  candidateEmail: string;
  serviceName: string;
  amount: number;
  currency: string;
  country: string | null;
  createdAt: Date;
  gatewayTransactionId?: string | null;
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

  // Receipt reference identifier: prioritize payment gateway reference (PayU txnid / Stripe payment_intent), fallback to DB ID
  const receiptId = purchase.gatewayTransactionId || purchase.id;

  // Generate PDF receipt (non-blocking fallback to ensure emails always send)
  let pdfBuffer: Buffer | null = null;
  try {
    pdfBuffer = await generateReceiptPdf(purchase);
  } catch (pdfError) {
    console.warn("Non-fatal: Failed to generate PDF receipt, sending confirmation without attachment:", pdfError);
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

  const includesMockInterview = purchase.serviceName.toLowerCase().includes("mock interview") ||
                                purchase.serviceName.toLowerCase().includes("ai mock interview");

  const setupUrl = buildAppUrl(`/payment/success?payment_intent=${receiptId}`);

  let candidateText = `Hi ${purchase.candidateName},

Thank you for your purchase of "${formattedServices}"!

We have received your payment of ${formattedAmount}.
Receipt ID / Transaction Reference: ${receiptId}

Your receipt is attached to this email as a PDF.`;

  if (includesMockInterview) {
    candidateText += `\n\nSince your purchase includes an AI Mock Interview: if you haven't configured your interview details (uploaded your resume and job description) before payment, please visit the link below to complete the setup. If you have already filled in the details and set up your interview, please ignore this link:\n${setupUrl}`;
  } else {
    candidateText += `\n\nOur team will contact you shortly to coordinate the next steps and get started with your service.`;
  }

  candidateText += `\n\nHave questions? You can reply directly to this email
or reach us on WhatsApp at https://wa.me/971585819271 (+971 58 581 9271) if you have any immediate questions.

Best regards,
Team JB Recruitment Solutions`;

  // 1. Candidate Email Options
  const candidateMailOptions = {
    from: `"JB Recruitment Solutions" <${user}>`,
    to: purchase.candidateEmail,
    subject: `Your Receipt for ${formattedServices} - JB Recruitment Solutions`,
    text: candidateText,
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
                <td style="padding: 6px 0; font-family: monospace; font-size: 13px; text-align: right;">${receiptId}</td>
              </tr>
            </table>
          </div>

          <p>We've attached your official PDF receipt to this email. Please keep it for your records.</p>
          
          ${includesMockInterview ? `
            <div style="background-color: #f4f3ff; border: 1px solid #dcd9ff; padding: 18px; border-radius: 8px; margin: 20px 0; text-align: center;">
              <h4 style="margin-top: 0; margin-bottom: 8px; font-size: 16px; color: #5a58ab; font-weight: bold;">Set up your AI Mock Interview</h4>
              <p style="margin-bottom: 15px; font-size: 13px; color: #4a5568; line-height: 1.5;">If you haven't configured your interview details (uploaded your resume and job description) before payment, please click below to complete the setup. If you have already filled in the details and set up your interview, please ignore this message.</p>
              <a href="${setupUrl}" style="display: inline-block; background-color: #5a58ab; color: #ffffff; padding: 10px 20px; border-radius: 8px; font-weight: bold; text-decoration: none; font-size: 14px; box-shadow: 0 4px 10px rgba(90, 88, 171, 0.2);">Configure Interview Now</a>
            </div>
          ` : `
            <p>Our team will contact you shortly to coordinate the next steps and get started with your service.</p>
          `}
          
          <p style="font-size: 14px; color: #718096; text-align: center;">Have questions? You can reply directly to this email<br />or contact us on WhatsApp at <a href="https://wa.me/971585819271" style="color: #5a58ab; font-weight: bold; text-decoration: none; white-space: nowrap;">+971 58 581 9271</a>.</p>
        </div>
        <div style="text-align: center; padding-top: 20px; border-top: 1px solid #edf2f7; font-size: 12px; color: #a0aec0;">
          <p>© ${new Date().getFullYear()} JB Recruitment Solutions. All rights reserved.</p>
        </div>
      </div>
    `,
    attachments: [
      ...(pdfBuffer
        ? [
            {
              filename: `Receipt-${receiptId}.pdf`,
              content: pdfBuffer,
            },
          ]
        : []),
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
Receipt / Transaction Reference: ${receiptId}
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
              <td style="padding: 8px 0; font-weight: bold; border-bottom: 1px solid #edf2f7;">Receipt / Ref ID:</td>
              <td style="padding: 8px 0; border-bottom: 1px solid #edf2f7; font-family: monospace;">${receiptId}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; font-weight: bold; border-bottom: 1px solid #edf2f7;">Database ID:</td>
              <td style="padding: 8px 0; border-bottom: 1px solid #edf2f7; font-family: monospace; color: #718096;">${purchase.id}</td>
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
    // 1. FIRST PRIORITY: Candidate Receipt Email
    console.log(`[Email Priority 1] Sending candidate receipt email to: ${purchase.candidateEmail} (Receipt ID: ${receiptId})`);
    let candidateReceiptSent = false;
    try {
      await sendMailWithRetry(candidateMailOptions, "candidate receipt");
      candidateReceiptSent = true;
      console.log(`[Email Priority 1 Success] Candidate receipt email sent successfully to ${purchase.candidateEmail}`);
    } catch (receiptErr) {
      console.error("[Email Priority 1 Error] Failed to send candidate receipt email:", receiptErr);
    }

    // 2. SECOND PRIORITY: Candidate Service Confirmation Email (only after receipt email is processed)
    console.log(`[Email Priority 2] Sending candidate service confirmation email to: ${purchase.candidateEmail}`);
    let serviceConfirmationSent = false;
    try {
      const confirmationResult = await sendCandidateServiceConfirmationEmail(purchase);
      if (confirmationResult?.success) {
        serviceConfirmationSent = true;
        console.log(`[Email Priority 2 Success] Candidate service confirmation email sent successfully to ${purchase.candidateEmail}`);
      } else {
        console.error("[Email Priority 2 Error] Failed to send candidate service confirmation email:", confirmationResult?.error);
      }
    } catch (confErr) {
      console.error("[Email Priority 2 Error] Failed to send candidate service confirmation email:", confErr);
    }

    // 3. THIRD PRIORITY: Admin Alert Email
    console.log(`[Email Priority 3] Sending admin alert email to: ${adminEmail}`);
    let adminAlertSent = false;
    try {
      await sendMailWithRetry(adminMailOptions, "admin alert");
      adminAlertSent = true;
      console.log(`[Email Priority 3 Success] Admin alert email sent successfully to ${adminEmail}`);
    } catch (adminErr) {
      console.error("[Email Priority 3 Error] Failed to send admin alert email:", adminErr);
    }

    const anySent = candidateReceiptSent || serviceConfirmationSent || adminAlertSent;
    return {
      success: anySent,
      candidateReceiptSent,
      adminAlertSent,
      serviceConfirmationSent,
    };
  } catch (err) {
    console.error("Unexpected error in sendPurchaseEmails:", err);
    return { success: false, error: err };
  }
}

export async function sendCandidateServiceConfirmationEmail(purchase: PurchaseData) {
  const user = process.env.NEXT_NODEMAILER_USER;
  if (!user) {
    console.error("Mailer credentials missing. Cannot send candidate service confirmation email.");
    return { success: false, error: "Mailer credentials missing" };
  }

  const transporter = getMailerTransporter();
  const candidateName = purchase.candidateName.trim();

  // Split services if multiple
  const serviceList = purchase.serviceName
    .split(" + ")
    .map((s) => s.trim())
    .filter(Boolean);

  const isAMAOnly =
    serviceList.length === 1 &&
    serviceList[0].toLowerCase().includes("ask me anything");

  const isAIInterviewOnly =
    serviceList.length === 1 &&
    (serviceList[0].toLowerCase().includes("ai mock interview") ||
      serviceList[0].toLowerCase() === "mock interview");

  // Time in IST (Asia/Kolkata)
  const purchaseDate = purchase.createdAt ? new Date(purchase.createdAt) : new Date();
  const hourString = new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    hour12: false,
    timeZone: "Asia/Kolkata",
  }).format(purchaseDate);
  const hour = parseInt(hourString, 10);
  const isAfter7PM = hour >= 19;

  let subject = "";
  let textBody = "";
  let htmlBody = "";

  if (isAMAOnly || isAIInterviewOnly) {
    // Template 1: For AMA & AI Mock Interview
    const serviceTitle = isAMAOnly ? "Ask Me Anything" : "AI Mock Interview";
    subject = `Confirmation for ${serviceTitle}`;

    textBody = `Hi ${candidateName},

Your ${serviceTitle} service is now confirmed.

Please share all your questions along with your latest resume at juhi@jbrecruitments.com. Once I receive them, I’ll review everything carefully and get back to you within 48 hours.

Looking forward to supporting you!

Best,
Juhi Bhatia
Founder & CEO | JB`;

    htmlBody = `
      <div style="font-family: Arial, Helvetica, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; color: #2d3748; line-height: 1.6; font-size: 15px;">
        <p>Hi ${escapeHtml(candidateName)},</p>
        <p>Your <strong>${escapeHtml(serviceTitle)}</strong> service is now confirmed.</p>
        <p>Please share all your questions along with your latest resume at <a href="mailto:juhi@jbrecruitments.com" style="color: #5a58ab; font-weight: bold; text-decoration: underline;">juhi@jbrecruitments.com</a>. Once I receive them, I’ll review everything carefully and get back to you within 48 hours.</p>
        <p>Looking forward to supporting you!</p>
        <p style="margin-top: 24px; line-height: 1.4;">
          Best,<br />
          <strong>Juhi Bhatia</strong><br />
          <span style="color: #718096; font-size: 14px;">Founder &amp; CEO | JB</span>
        </p>
      </div>
    `;
  } else {
    // Template 2 (After 7 PM IST) or Template 3 (Standard Hours)
    const bulletListText = serviceList.map((s) => `* ${s}`).join("\n");
    const bulletListHtml = serviceList
      .map((s) => `<li style="margin-bottom: 6px;">${escapeHtml(s)}</li>`)
      .join("");

    const displayTitle = serviceList.length === 1 ? serviceList[0] : "Your Services";
    subject = `Confirmation for ${displayTitle}`;

    if (isAfter7PM) {
      // Template 2: After 7 PM IST
      textBody = `Hi ${candidateName},

This is to confirm that the following services you have selected are now confirmed:

${bulletListText}

Please feel free to reach out to me anytime tomorrow on WhatsApp at +971 585 819 271 so we can coordinate the next steps and get started.

Thank you for choosing JB. I look forward to working with you and supporting you in your career journey.

Best,
Juhi Bhatia
Founder & CEO | JB`;

      htmlBody = `
        <div style="font-family: Arial, Helvetica, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; color: #2d3748; line-height: 1.6; font-size: 15px;">
          <p>Hi ${escapeHtml(candidateName)},</p>
          <p>This is to confirm that the following services you have selected are now confirmed:</p>
          <ul style="padding-left: 20px; margin: 16px 0;">
            ${bulletListHtml}
          </ul>
          <p>Please feel free to reach out to me anytime tomorrow on WhatsApp at <a href="https://wa.me/971585819271" style="color: #5a58ab; font-weight: bold; text-decoration: none;">+971 585 819 271</a> so we can coordinate the next steps and get started.</p>
          <p>Thank you for choosing JB. I look forward to working with you and supporting you in your career journey.</p>
          <p style="margin-top: 24px; line-height: 1.4;">
            Best,<br />
            <strong>Juhi Bhatia</strong><br />
            <span style="color: #718096; font-size: 14px;">Founder &amp; CEO | JB</span>
          </p>
        </div>
      `;
    } else {
      // Template 3: Before 7 PM IST
      textBody = `Hi ${candidateName},

This is to confirm that the following services you have selected are now confirmed:

${bulletListText}

Please feel free to reach out to me on WhatsApp at +971 585 819 271 so we can coordinate the next steps and get started.

I look forward to working with you and supporting you in your career journey.

Best,
Juhi Bhatia
Founder & CEO | JB`;

      htmlBody = `
        <div style="font-family: Arial, Helvetica, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; color: #2d3748; line-height: 1.6; font-size: 15px;">
          <p>Hi ${escapeHtml(candidateName)},</p>
          <p>This is to confirm that the following services you have selected are now confirmed:</p>
          <ul style="padding-left: 20px; margin: 16px 0;">
            ${bulletListHtml}
          </ul>
          <p>Please feel free to reach out to me on WhatsApp at <a href="https://wa.me/971585819271" style="color: #5a58ab; font-weight: bold; text-decoration: none;">+971 585 819 271</a> so we can coordinate the next steps and get started.</p>
          <p>I look forward to working with you and supporting you in your career journey.</p>
          <p style="margin-top: 24px; line-height: 1.4;">
            Best,<br />
            <strong>Juhi Bhatia</strong><br />
            <span style="color: #718096; font-size: 14px;">Founder &amp; CEO | JB</span>
          </p>
        </div>
      `;
    }
  }

  const mailOptions = {
    from: `"Juhi Bhatia" <${user}>`,
    replyTo: "juhi@jbrecruitments.com",
    to: purchase.candidateEmail,
    subject,
    text: textBody,
    html: htmlBody,
  };

  try {
    console.log(`Sending service confirmation email to candidate: ${purchase.candidateEmail}`);
    await sendMailWithRetry(mailOptions, "candidate service confirmation");
    return { success: true };
  } catch (err) {
    console.error("Error sending candidate service confirmation email:", err);
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
- Take the interview on a laptop or desktop computer (mobile devices are not recommended).
- Use headphones to prevent audio echo.
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
          <div style="background-color: #eef2ff; border-left: 4px solid #5a58ab; padding: 16px; margin: 20px 0; border-radius: 4px;">
            <h4 style="margin: 0 0 10px 0; color: #4338ca; font-size: 14px;">Setup Requirements for Best Experience</h4>
            <ul style="margin: 0; padding-left: 20px; font-size: 13px; color: #4f46e5; line-height: 1.5;">
              <li>Take the interview on a <strong>laptop or desktop computer</strong> (mobile devices are not recommended).</li>
              <li>Use <strong>headphones</strong> to prevent audio echo.</li>
              <li>Ensure you are in a <strong>quiet environment</strong> with a stable internet connection.</li>
            </ul>
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
