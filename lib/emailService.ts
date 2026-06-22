import { getMailerTransporter } from "./mailer";
import { generateReceiptPdf } from "./pdfGenerator";
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

  // 1. Candidate Email Options
  const candidateMailOptions = {
    from: `"JB Recruitment Solutions" <${user}>`,
    to: purchase.candidateEmail,
    subject: `Your Receipt for ${formattedServices} - JB Recruitment Solutions`,
    text: `Hi ${purchase.candidateName},

Thank you for your purchase of "${formattedServices}"!

We have received your payment of ${purchase.amount} ${purchase.currency.toUpperCase()}. Your receipt is attached to this email as a PDF.

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
                <td style="padding: 6px 0; font-weight: bold; text-align: right; color: #5a58ab;">${purchase.amount} ${purchase.currency.toUpperCase()}</td>
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
Amount: ${purchase.amount} ${purchase.currency.toUpperCase()}
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
              <td style="padding: 8px 0; border-bottom: 1px solid #edf2f7; font-weight: bold; color: #38a169;">${purchase.amount} ${purchase.currency.toUpperCase()}</td>
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
