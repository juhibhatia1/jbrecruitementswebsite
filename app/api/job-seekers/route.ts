import { NextResponse } from "next/server";
import ImageKit from "imagekit";
import { addJobSeekerSubmission } from "@/lib/submissions-store";
import { extractRequestMeta } from "@/lib/request-analytics";
import { getMailerTransporter } from "@/lib/mailer";
import path from "path";

const imagekit = new ImageKit({
  publicKey: process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY || "",
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY || "",
  urlEndpoint: process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT || "",
});

export async function POST(request: Request) {
  try {
    const requestMeta = extractRequestMeta(request);
    const formData = await request.formData();
    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const phone = formData.get("phone") as string;
    const location = formData.get("location") as string;
    const description = formData.get("description") as string;
    const file = formData.get("resume") as File;

    if (!name || !email || !file) {
      return NextResponse.json(
        { error: "Name, email, and resume are required." },
        { status: 400 },
      );
    }

    // Convert file to buffer for ImageKit
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Upload to ImageKit
    let fileUrl = "";
    try {
      const uploadResponse = await imagekit.upload({
        file: buffer,
        fileName: file.name,
        folder: "/job-seekers-resumes",
      });
      fileUrl = uploadResponse.url;
    } catch (uploadError) {
      console.error("ImageKit upload failed:", uploadError);
      // Continue without file upload, save to DB if we can
    }

    // Save to database immediately (independent of email)
    let dbSaved = false;
    try {
      await addJobSeekerSubmission({
        name,
        email,
        phone,
        location,
        description,
        resumeUrl: fileUrl || undefined,
        resumeFileName: file.name || undefined,
        requestMeta,
      });
      dbSaved = true;
    } catch (dbError) {
      console.error("Database save error:", dbError);
      // Continue to attempt email even if DB save fails
    }

    // Configure Nodemailer
    const user = process.env.NEXT_NODEMAILER_USER;
    const pass = process.env.NEXT_NODEMAILER_PASS;

    if (!user || !pass) {
      console.error("Missing Nodemailer credentials");
      // If DB was saved, return success with warning
      if (dbSaved) {
        return NextResponse.json(
          {
            success: true,
            message: "Application saved, but email service unavailable.",
          },
          { status: 200 },
        );
      }
      return NextResponse.json(
        { error: "Server configuration error" },
        { status: 500 },
      );
    }

    const transporter = getMailerTransporter();

    const mailOptions = {
      from: user,
      to: user, // Send to admin
      replyTo: email,
      subject: `New Job Application from ${name}`,
      text: `
        Name: ${name}
        Email: ${email}
        Phone: ${phone || "Not provided"}
        Location: ${location || "Not provided"}
        
        Description:
        ${description || "No description provided"}

        Resume: ${fileUrl || "No file URL"}
      `,
      html: `
        <div style="text-align:center; padding:12px 0 8px 0;"><img src="cid:jb-logo" alt="JB Recruitment" style="width:84px; height:auto; display:inline-block;" /></div>
        <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
          <h2 style="color: #3b82f6;">New Job Application</h2>
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Phone:</strong> ${phone || "Not provided"}</p>
          <p><strong>Location:</strong> ${location || "Not provided"}</p>
          
          <div style="margin-top: 20px; padding: 15px; background-color: #f3f4f6; border-radius: 5px;">
            <p><strong>Description:</strong></p>
            <p style="white-space: pre-wrap;">${(description || "No description provided").replace(/\n/g, "<br>")}</p>
          </div>

          <div style="margin-top: 20px;">
            ${
              fileUrl
                ? `<a href="${fileUrl}" style="background-color: #3b82f6; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">View Resume</a>
            <p style="margin-top: 10px; font-size: 12px; color: #666;">Or copy link: ${fileUrl}</p>`
                : "<p>Resume: Pending upload</p>"
            }
          </div>
        </div>
      `,
      attachments: [
        {
          filename: "logo.avif",
          path: path.join(process.cwd(), "public", "logo.avif"),
          cid: "jb-logo",
        },
      ],
    };

    const candidateMailOptions = {
      from: `"JB Recruitment Solutions" <${user}>`,
      to: email, // Send to candidate
      subject:
        "Thank you for sharing your profile with JB Recruitment Solutions",
      text: `Hi ${name},

Thank you so much for taking the time to share your profile with us.

We’ve received your details and will definitely reach out if we come across any potential opportunities that align with your experience.

We understand that job searching can sometimes feel overwhelming, so here’s a small tip that can really make a difference: Try to actively grow your network and engage with hiring teams. It helps improve your visibility significantly. LinkedIn allows up to 100 connection requests per week, so you can use this to connect with people in your industry or target companies.

Also, make sure your resume is ATS-friendly and your LinkedIn profile is well-optimized with the right keywords and skills for the roles you’re aiming for.

If you need any support with this or would like career guidance, you can explore the “Services” section on our founder Juhi Bhatia’s LinkedIn profile - we’d be more than happy to support you.

Wishing you all the very best in your job search - Team JB is rooting for you.

LinkedIn: linkedin.com/in/juhiibhatia/
Instagram: instagram.com/juhibhatia_globalrecruiter`,
      html: `
        <div style="text-align:center; padding:12px 0 8px 0;"><img src="cid:jb-logo" alt="JB Recruitment" style="width:84px; height:auto; display:inline-block;" /></div>
        <div style="font-family: Arial, sans-serif; padding: 20px; color: #333; line-height: 1.6; white-space: pre-wrap;">
Hi ${name}

Thank you so much for taking the time to share your profile with us.

We’ve received your details and will definitely reach out if we come across any potential opportunities that align with your experience.

We understand that job searching can sometimes feel overwhelming, so here’s a small tip that can really make a difference: Try to actively grow your network and engage with hiring teams. It helps improve your visibility significantly. LinkedIn allows up to 100 connection requests per week, so you can use this to connect with people in your industry or target companies.

Also, make sure your resume is ATS-friendly and your LinkedIn profile is well-optimized with the right keywords and skills for the roles you’re aiming for.

If you need any support with this or would like career guidance, you can explore the “Services” section on our founder Juhi Bhatia’s LinkedIn profile - we’d be more than happy to support you.

Wishing you all the very best in your job search - Team JB is rooting for you.

LinkedIn: linkedin.com/in/juhiibhatia/
Instagram: instagram.com/juhibhatia_globalrecruiter
        </div>
      `,
      attachments: [
        {
          filename: "logo.avif",
          path: path.join(process.cwd(), "public", "logo.avif"),
          cid: "jb-logo",
        },
      ],
    };

    let emailSent = false;
    try {
      await transporter.sendMail(mailOptions);
      // Send auto-reply to the candidate
      await transporter.sendMail(candidateMailOptions);
      emailSent = true;
    } catch (emailError) {
      console.error("Error sending email:", emailError);
      emailSent = false;
    }

    // Return success if DB was saved (email is secondary)
    if (dbSaved) {
      return NextResponse.json({
        success: true,
        message: emailSent
          ? "Application submitted successfully!"
          : "Application saved (email pending).",
      });
    }

    // If DB save failed and email also failed
    if (!emailSent) {
      return NextResponse.json(
        { error: "Failed to process application." },
        { status: 500 },
      );
    }

    return NextResponse.json({
      success: true,
      message: "Application submitted successfully!",
    });
  } catch (error) {
    console.error("Error processing job application:", error);
    return NextResponse.json(
      { error: "Failed to process application." },
      { status: 500 },
    );
  }
}
