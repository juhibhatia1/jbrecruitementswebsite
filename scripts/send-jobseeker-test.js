const dotenv = require("dotenv");
const path = require("path");
dotenv.config();
// If vars aren't found, attempt to load .env.local from repository root
if (!process.env.NEXT_NODEMAILER_USER || !process.env.NEXT_NODEMAILER_PASS) {
  const localEnvPath = path.resolve(__dirname, "..", ".env.local");
  dotenv.config({ path: localEnvPath });
}
const nodemailer = require("nodemailer");

(async () => {
  const user = process.env.NEXT_NODEMAILER_USER;
  const pass = process.env.NEXT_NODEMAILER_PASS;

  if (!user || !pass) {
    console.error(
      "Missing NEXT_NODEMAILER_USER or NEXT_NODEMAILER_PASS environment variables.\n\n" +
        "For PowerShell (temporary):\n" +
        '$env:NEXT_NODEMAILER_USER="you@domain.com"\n' +
        '$env:NEXT_NODEMAILER_PASS="yourpassword"\n' +
        "node scripts/send-jobseeker-test.js\n\n" +
        "Or create a .env.local with:\n" +
        "NEXT_NODEMAILER_USER=you@domain.com\nNEXT_NODEMAILER_PASS=yourpassword\n",
    );
    process.exit(1);
  }

  const transporter = nodemailer.createTransport({
    host: "smtp0001.neo.space",
    port: 465,
    secure: true,
    auth: { user, pass },
  });

  const name = "Aashish Test";
  const candidateEmail = "aashish17405@gmail.com";

  const candidateMailOptions = {
    from: `"JB Recruitment Solutions" <${user}>`,
    to: candidateEmail,
    subject: "Thank you for sharing your profile with JB Recruitment Solutions",
    text: `Hi ${name},

Thank you so much for taking the time to share your profile with us.

We’ve received your details and will definitely reach out if we come across any potential opportunities that align with your experience.

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

If you need any support with this or would like career guidance, you can explore the “Services” section on our founder Juhi Bhatia’s <a href="https://linkedin.com/in/juhiibhatia/">LinkedIn profile</a> - we’d be more than happy to support you.

Wishing you all the very best in your job search - Team JB is rooting for you.

LinkedIn: linkedin.com/in/juhiibhatia/
Instagram: instagram.com/juhibhatia_globalrecruiter
      `,
    attachments: [
      {
        filename: "logo.avif",
        path: require("path").resolve(__dirname, "..", "public", "logo.avif"),
        cid: "jb-logo",
      },
    ],
  };

  try {
    await transporter.verify();
    console.log("SMTP verified for user:", user);
    const info = await transporter.sendMail(candidateMailOptions);
    console.log("Test email sent:", info.messageId || info);
  } catch (err) {
    console.error("Error sending test email:", err);
    process.exit(1);
  }
})();
