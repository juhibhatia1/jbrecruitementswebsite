import { NextResponse } from "next/server";
import ImageKit from "imagekit";
import { addJobSeekerSubmission } from "@/lib/submissions-store";
import { extractRequestMeta } from "@/lib/request-analytics";
import { getMailerTransporter } from "@/lib/mailer";
import { getClientIp, isRateLimited } from "@/lib/rate-limiter";
import { escapeHtml } from "@/lib/security";
import path from "path";
import { randomUUID } from "crypto";

const imagekit = new ImageKit({
  publicKey: process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY || "",
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY || "",
  urlEndpoint: process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT || "",
});

function logJobSeekerEvent(
  requestId: string,
  stage: string,
  details?: Record<string, unknown>,
) {
  const payload = {
    scope: "job-seekers-api",
    requestId,
    stage,
    timestamp: new Date().toISOString(),
    ...details,
  };

  console.log("[job-seekers]", JSON.stringify(payload));
}

function logJobSeekerError(
  requestId: string,
  stage: string,
  error: unknown,
  details?: Record<string, unknown>,
) {
  const normalizedError =
    error instanceof Error
      ? {
          name: error.name,
          message: error.message,
          stack: error.stack,
        }
      : error;

  const payload = {
    scope: "job-seekers-api",
    requestId,
    stage,
    timestamp: new Date().toISOString(),
    ...details,
    error: normalizedError,
  };

  console.error("[job-seekers]", JSON.stringify(payload));
}

function isImageKitQuotaError(error: unknown) {
  if (!error || typeof error !== "object") {
    return false;
  }

  const message =
    "message" in error && typeof (error as { message?: unknown }).message === "string"
      ? (error as { message: string }).message
      : "";
  const help =
    "help" in error && typeof (error as { help?: unknown }).help === "string"
      ? (error as { help: string }).help
      : "";

  return /upload limit exceeded/i.test(message) || /upload limit exceeded/i.test(help);
}

export async function POST(request: Request) {
  const requestId = randomUUID();

  try {
    const ip = getClientIp(request);
    // Limit to 5 submissions per hour
    if (isRateLimited(ip, 5, 60 * 60 * 1000)) {
      return NextResponse.json(
        { error: "Too many application submissions. Please try again in an hour." },
        { status: 429 },
      );
    }

    logJobSeekerEvent(requestId, "request.received", {
      method: "POST",
      pathname: request.headers.get("x-pathname") || "unknown",
      contentType: request.headers.get("content-type") || "unknown",
      userAgent: request.headers.get("user-agent") || "unknown",
    });

    const requestMeta = extractRequestMeta(request);
    const formData = await request.formData();
    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const phone = formData.get("phone") as string;
    const location = formData.get("location") as string;
    const description = formData.get("description") as string;
    const file = formData.get("resume") as File;

    if (!name || !email || !file) {
      logJobSeekerEvent(requestId, "request.validation_failed", {
        hasName: Boolean(name),
        hasEmail: Boolean(email),
        hasResume: Boolean(file),
      });
      return NextResponse.json(
        { error: "Name, email, and resume are required." },
        { status: 400 },
      );
    }

    // Size limit check (5MB)
    const MAX_FILE_SIZE = 5 * 1024 * 1024;
    if (file.size > MAX_FILE_SIZE) {
      logJobSeekerEvent(requestId, "request.validation_failed", {
        reason: "file_too_large",
        size: file.size,
      });
      return NextResponse.json(
        { error: "Resume file exceeds the maximum allowed size of 5MB." },
        { status: 400 },
      );
    }

    // Extension & MIME verification
    const allowedExtensions = [".pdf", ".doc", ".docx"];
    const allowedMimeTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/octet-stream",
    ];

    const extension = path.extname(file.name).toLowerCase();
    if (
      !allowedExtensions.includes(extension) ||
      (file.type && !allowedMimeTypes.includes(file.type.toLowerCase()))
    ) {
      logJobSeekerEvent(requestId, "request.validation_failed", {
        reason: "invalid_file_type",
        fileName: file.name,
        fileType: file.type,
      });
      return NextResponse.json(
        {
          error:
            "Invalid file type. Only PDF and Word documents (.pdf, .doc, .docx) are allowed.",
        },
        { status: 400 },
      );
    }

    logJobSeekerEvent(requestId, "request.parsed", {
      name,
      email,
      phoneProvided: Boolean(phone),
      locationProvided: Boolean(location),
      descriptionLength: description?.length || 0,
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type || "unknown",
      requestMeta,
    });

    // Convert file to buffer for ImageKit
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    logJobSeekerEvent(requestId, "resume.buffer_created", {
      fileName: file.name,
      bufferSize: buffer.length,
    });

    // Upload to ImageKit (fallback to email attachment + DB record if quota is exhausted)
    let fileUrl = "";
    let imageKitUploadSucceeded = false;
    try {
      logJobSeekerEvent(requestId, "resume.imagekit_upload_started", {
        fileName: file.name,
        targetFolder: "/job-seekers-resumes",
      });

      const uploadResponse = await imagekit.upload({
        file: buffer,
        fileName: file.name,
        folder: "/job-seekers-resumes",
      });
      fileUrl = uploadResponse.url;
      imageKitUploadSucceeded = true;
      logJobSeekerEvent(requestId, "resume.imagekit_upload_succeeded", {
        fileName: file.name,
        fileUrl,
        imagekitFileId: uploadResponse.fileId,
      });
    } catch (uploadError) {
      if (isImageKitQuotaError(uploadError)) {
        logJobSeekerError(
          requestId,
          "resume.imagekit_quota_exceeded",
          uploadError,
          {
            fileName: file.name,
            fileSize: file.size,
            action: "continuing_with_email_attachment",
          },
        );
      } else {
        logJobSeekerError(
          requestId,
          "resume.imagekit_upload_failed",
          uploadError,
          {
            fileName: file.name,
            fileSize: file.size,
          },
        );
        return NextResponse.json(
          { error: "Failed to upload resume to cloud storage. Please try again." },
          { status: 500 },
        );
      }
    }

    if (!imageKitUploadSucceeded) {
      logJobSeekerEvent(requestId, "resume.imagekit_upload_skipped", {
        fileName: file.name,
        reason: "quota_or_storage_limit",
        fallback: "email_attachment_and_database_record",
      });
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
      logJobSeekerEvent(requestId, "database.save_succeeded", {
        email,
        fileUrl: fileUrl || null,
      });
    } catch (dbError) {
      logJobSeekerError(requestId, "database.save_failed", dbError, {
        email,
        fileUrl: fileUrl || null,
      });
      // Continue to attempt email even if DB save fails
    }

    // Configure Nodemailer
    const user = process.env.NEXT_NODEMAILER_USER;
    const pass = process.env.NEXT_NODEMAILER_PASS;

    if (!user || !pass) {
      logJobSeekerEvent(requestId, "email.credentials_missing", {
        hasUser: Boolean(user),
        hasPass: Boolean(pass),
        dbSaved,
      });
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
          <p><strong>Name:</strong> ${escapeHtml(name)}</p>
          <p><strong>Email:</strong> ${escapeHtml(email)}</p>
          <p><strong>Phone:</strong> ${escapeHtml(phone) || "Not provided"}</p>
          <p><strong>Location:</strong> ${escapeHtml(location) || "Not provided"}</p>
          
          <div style="margin-top: 20px; padding: 15px; background-color: #f3f4f6; border-radius: 5px;">
            <p><strong>Description:</strong></p>
            <p style="white-space: pre-wrap;">${escapeHtml(description || "No description provided").replace(/\n/g, "<br>")}</p>
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
          filename: file.name,
          content: buffer,
        },
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

If you need any support with this or would like career guidance, you can explore the "Services" section on our founder Juhi Bhatia’s LinkedIn profile - we’d be more than happy to support you.

Wishing you all the very best in your job search - Team JB is rooting for you.

LinkedIn: linkedin.com/in/juhiibhatia/
Instagram: instagram.com/juhibhatia_globalrecruiter`,
      html: `
        <div style="text-align:center; padding:12px 0 8px 0;"><img src="cid:jb-logo" alt="JB Recruitment" style="width:84px; height:auto; display:inline-block;" /></div>
        <div style="font-family: Arial, sans-serif; padding: 20px; color: #333; line-height: 1.6; white-space: pre-wrap;">
Hi ${escapeHtml(name)}

Thank you so much for taking the time to share your profile with us.

We’ve received your details and will definitely reach out if we come across any potential opportunities that align with your experience.

We understand that job searching can sometimes feel overwhelming, so here’s a small tip that can really make a difference: Try to actively grow your network and engage with hiring teams. It helps improve your visibility significantly. LinkedIn allows up to 100 connection requests per week, so you can use this to connect with people in your industry or target companies.

Also, make sure your resume is ATS-friendly and your LinkedIn profile is well-optimized with the right keywords and skills for the roles you’re aiming for.

If you need any support with this or would like career guidance, you can explore the "Services" section on our founder Juhi Bhatia’s LinkedIn profile - we’d be more than happy to support you.

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
      logJobSeekerEvent(requestId, "email.admin_send_started", {
        to: user,
        replyTo: email,
        hasResumeAttachment: true,
      });
      await transporter.sendMail(mailOptions);
      logJobSeekerEvent(requestId, "email.admin_send_succeeded", {
        to: user,
      });

      logJobSeekerEvent(requestId, "email.candidate_send_started", {
        to: email,
      });
      // Send auto-reply to the candidate
      await transporter.sendMail(candidateMailOptions);
      emailSent = true;
      logJobSeekerEvent(requestId, "email.candidate_send_succeeded", {
        to: email,
      });
    } catch (emailError) {
      logJobSeekerError(requestId, "email.send_failed", emailError, {
        adminEmail: user,
        candidateEmail: email,
      });
      emailSent = false;
    }

    // Return success if DB was saved (email is secondary)
    if (dbSaved) {
      logJobSeekerEvent(requestId, "request.completed", {
        outcome: emailSent ? "success" : "saved_with_email_pending",
        fileUrl: fileUrl || null,
      });
      return NextResponse.json({
        success: true,
        message: emailSent
          ? "Application submitted successfully!"
          : "Application saved (email pending).",
      });
    }

    // If DB save failed and email also failed
    if (!emailSent) {
      logJobSeekerEvent(requestId, "request.completed", {
        outcome: "failed",
        dbSaved,
        emailSent,
        fileUrl: fileUrl || null,
      });
      return NextResponse.json(
        { error: "Failed to process application." },
        { status: 500 },
      );
    }

    logJobSeekerEvent(requestId, "request.completed", {
      outcome: "success_without_db_save",
      fileUrl: fileUrl || null,
    });
    return NextResponse.json({
      success: true,
      message: "Application submitted successfully!",
    });
  } catch (error) {
    logJobSeekerError(requestId, "request.unhandled_error", error);
    return NextResponse.json(
      { error: "Failed to process application." },
      { status: 500 },
    );
  }
}
