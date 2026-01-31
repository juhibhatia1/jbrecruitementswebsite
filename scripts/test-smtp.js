require("dotenv").config();
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
        "node scripts/test-smtp.js\n\n" +
        "Or create a .env.local with:\n" +
        "NEXT_NODEMAILER_USER=you@domain.com\nNEXT_NODEMAILER_PASS=yourpassword\n",
    );
    process.exit(1);
  }

  const transporter = nodemailer.createTransport({
    host: "smtp0001.neo.space",
    port: 465,
    secure: true, // TLS
    auth: {
      user: user,
      pass: pass,
    },
  });

  try {
    await transporter.verify();
    console.log("SMTP verified for user:", user);
    const info = await transporter.sendMail({
      from: user,
      to: user,
      subject: "SMTP Test",
      text: "Hello from SMTP test",
    });
    console.log("Sent:", info);
  } catch (err) {
    console.error("SMTP test error:", err);
    process.exit(1);
  }
})();
