import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

export async function POST(request: Request) {
  try {
    const { name, email, message, phone, subject, company } =
      await request.json();

    // Basic validation
    if (!name || !email || !message) {
      return NextResponse.json(
        { error: "Name, email, and message are required fields." },
        { status: 400 }
      );
    }

    const user = process.env.NEXT_NODEMAILER_USER;
    const pass = process.env.NEXT_NODEMAILER_PASS;

    if (!user || !pass) {
      console.error("Missing email credentials in environment variables.");
      return NextResponse.json(
        { error: "Server configuration error." },
        { status: 500 }
      );
    }

    // Configure the transporter
    // Note: 'service: "gmail"' is used here. If using another provider,
    // you may need to switch to 'host' and 'port' configuration.
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user,
        pass,
      },
    });

    const mailOptions = {
      from: user,
      to: user, // Sending to self/admin. Change if you want to send to a specific admin email.
      replyTo: email, // Allow replying directly to the sender
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
                "<br>"
              )}</p>
            </div>
          </div>
        `,
    };

    await transporter.sendMail(mailOptions);

    return NextResponse.json(
      { success: true, message: "Email sent successfully!" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error sending email:", error);
    return NextResponse.json(
      { error: "Failed to send email." },
      { status: 500 }
    );
  }
}
