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
        { status: 400 },
      );
    }

    const user = process.env.NEXT_NODEMAILER_USER;
    const pass = process.env.NEXT_NODEMAILER_PASS;

    if (!user || !pass) {
      console.error("Missing email credentials in environment variables.");
      return NextResponse.json(
        { error: "Server configuration error." },
        { status: 500 },
      );
    }

    // Temporary Gmail configuration (working solution)
    // Using Gmail while finding correct Neospace SMTP settings
    // const transporter = nodemailer.createTransport({
    //   service: "gmail",
    //   auth: {
    //     user,
    //     pass,
    //   },
    // });

    // When you find your Neospace SMTP settings, replace above with:
    const transporter = nodemailer.createTransport({
      host: "smtp0001.neo.space",
      port: 465,
      secure: true, // TLS
      auth: {
        user: user, // use env-configured user
        pass: pass,
      },
    });

    // Verify SMTP connection before attempting to send
    try {
      await transporter.verify();
    } catch (verifyError) {
      console.error("SMTP verify failed:", verifyError);
      return NextResponse.json(
        { error: "SMTP connection failed. Check SMTP host/port/credentials." },
        { status: 502 },
      );
    }

    // Alternative Neospace configurations to try:
    // 1. If above doesn't work, try:
    // host: "mail.neospace.com.my"
    //
    // 2. Or server-specific (check your Neospace control panel):
    // host: "server123.neospace.com.my" (replace 123 with your server number)
    //
    // 3. Or try with port 465:
    // port: 465, secure: true

    // Alternative configuration if above doesn't work:
    // Try port 465 with secure: true
    // const transporter = nodemailer.createTransport({
    //   host: "mail.jbrecruitments.com",
    //   port: 465,
    //   secure: true,
    //   auth: {
    //     user,
    //     pass,
    //   },
    // });

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

    try {
      const info = await transporter.sendMail(mailOptions);
      console.log("Mail options:", mailOptions);
      console.log(
        "Email sent, messageId:",
        info?.messageId,
        "response:",
        info?.response,
      );
      return NextResponse.json(
        { success: true, message: "Email sent successfully!" },
        { status: 200 },
      );
    } catch (sendError) {
      console.error("Error in sendMail:", sendError);
      return NextResponse.json(
        { error: "Failed to deliver email. Check SMTP provider logs." },
        { status: 502 },
      );
    }
  } catch (error) {
    console.error("Error sending email:", error);
    return NextResponse.json(
      { error: "Failed to send email." },
      { status: 500 },
    );
  }
}
