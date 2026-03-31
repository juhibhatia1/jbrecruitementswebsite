import { NextResponse } from "next/server";
import { addContactSubmission } from "@/lib/submissions-store";
import { extractRequestMeta } from "@/lib/request-analytics";
import { getMailerTransporter } from "@/lib/mailer";

export async function POST(request: Request) {
  try {
    const requestMeta = extractRequestMeta(request);

    const { name, email, message, phone, subject, company } =
      await request.json();

    // Basic validation
    if (!name || !email || !message) {
      return NextResponse.json(
        { error: "Name, email, and message are required fields." },
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
            <p><strong>Name:</strong> ${name}</p>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Phone:</strong> ${phone || "Not provided"}</p>
            <p><strong>Company:</strong> ${company || "Not provided"}</p>
            <div style="margin-top: 20px; padding: 15px; background-color: #f3f4f6; border-radius: 5px;">
              <p><strong>Message:</strong></p>
              <p style="white-space: pre-wrap;">${message.replace(
                /\n/g,
                "<br>",
              )}</p>
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
