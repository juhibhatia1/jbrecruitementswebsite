import { NextResponse } from "next/server";
import { addContactSubmission } from "@/lib/submissions-store";
import { extractRequestMeta } from "@/lib/request-analytics";
import { getMailerTransporter } from "@/lib/mailer";
import { getClientIp, isRateLimited } from "@/lib/rate-limiter";
import { escapeHtml } from "@/lib/security";

export async function POST(request: Request) {
  try {
    const ip = getClientIp(request);
    // Limit to 5 submissions per hour
    if (isRateLimited(ip, 5, 60 * 60 * 1000)) {
      return NextResponse.json(
        { error: "Too many contact submissions. Please try again in an hour." },
        { status: 429 },
      );
    }

    const requestMeta = extractRequestMeta(request);

    const { name, email, message, phone, subject, company } =
      await request.json();

    const nameClean = String(name || "").trim();
    const emailClean = String(email || "").trim().toLowerCase();
    const phoneClean = String(phone || "").trim();
    const messageClean = String(message || "").trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^\+?[0-9\s\-\(\)\.]{6,20}$/;
    const phoneDigits = phoneClean.replace(/\D/g, "");

    if (!nameClean || nameClean.length < 2 || !/\p{L}/u.test(nameClean)) {
      return NextResponse.json(
        { error: "Please enter a valid name (at least 2 letters)." },
        { status: 400 },
      );
    }

    if (!emailClean || !emailRegex.test(emailClean)) {
      return NextResponse.json(
        { error: "Please enter a valid email address." },
        { status: 400 },
      );
    }

    if (phoneClean && (!phoneRegex.test(phoneClean) || phoneDigits.length < 6 || phoneDigits.length > 15)) {
      return NextResponse.json(
        { error: "Please enter a valid phone number with country code (e.g. +1 555 123 4567 or +44 7911 123456)." },
        { status: 400 },
      );
    }

    if (!messageClean || messageClean.length < 5) {
      return NextResponse.json(
        { error: "Message must be at least 5 characters long." },
        { status: 400 },
      );
    }

    // Save to database immediately (independent of email)
    let dbSaved = false;
    try {
      await addContactSubmission({
        name,
        email,
        phone,
        company,
        subject,
        message,
        requestMeta,
      });
      dbSaved = true;
    } catch (dbError) {
      console.error("Database save error:", dbError);
      // Continue to attempt email even if DB save fails
    }

    const user = process.env.NEXT_NODEMAILER_USER;
    const pass = process.env.NEXT_NODEMAILER_PASS;

    if (!user || !pass) {
      console.error("Missing email credentials in environment variables.");
      // If DB was saved, return success with warning
      if (dbSaved) {
        return NextResponse.json(
          {
            success: true,
            message: "Submission saved, but email service unavailable.",
          },
          { status: 200 },
        );
      }
      return NextResponse.json(
        { error: "Server configuration error." },
        { status: 500 },
      );
    }

    const transporter = getMailerTransporter();

    const mailOptions = {
      from: user,
      to: user, // Sending to self/admin. Change if you want to send to a specific admin email.
      replyTo: email, // Customer's email - so you can reply directly to them
      subject: subject || `New Contact Form Submission from ${name}`,
      text: `
          Name: ${name}
          Email: ${email}
          Phone: ${phone || "Not provided"}
          
          Message:
          ${message}
        `,
      html: `
          <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
            <h2 style="color: #3b82f6;">New Contact Form Submission</h2>
            <p><strong>Name:</strong> ${escapeHtml(name)}</p>
            <p><strong>Email:</strong> ${escapeHtml(email)}</p>
            <p><strong>Phone:</strong> ${escapeHtml(phone) || "Not provided"}</p>
            <p><strong>Company:</strong> ${escapeHtml(company) || "Not provided"}</p>
            <div style="margin-top: 20px; padding: 15px; background-color: #f3f4f6; border-radius: 5px;">
              <p><strong>Message:</strong></p>
              <p style="white-space: pre-wrap;">${escapeHtml(message).replace(/\n/g, "<br>")}</p>
            </div>
          </div>
        `,
    };

    let emailSent = false;
    try {
      const info = await transporter.sendMail(mailOptions);
      emailSent = true;
      console.log("Mail options:", mailOptions);
      console.log(
        "Email sent, messageId:",
        info?.messageId,
        "response:",
        info?.response,
      );
    } catch (sendError) {
      console.error("Error in sendMail:", sendError);
      emailSent = false;
    }

    // Return success if DB was saved (email is secondary)
    if (dbSaved) {
      return NextResponse.json(
        {
          success: true,
          message: emailSent
            ? "Email sent successfully!"
            : "Submission saved (email pending).",
        },
        { status: 200 },
      );
    }

    // If DB save failed and email also failed
    if (!emailSent) {
      return NextResponse.json(
        {
          error: "Failed to process submission. Please try again later.",
        },
        { status: 502 },
      );
    }

    return NextResponse.json(
      { success: true, message: "Submission processed." },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error in contact submission:", error);
    return NextResponse.json(
      { error: "Failed to process submission." },
      { status: 500 },
    );
  }
}
