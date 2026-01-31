const nodemailer = require("nodemailer");

(async () => {
  const transporter = nodemailer.createTransport({
    host: "smtp0001.neo.space",
    port: 465,
    secure: true, // TLS
    auth: {
      user: user, // use env-configured user
      pass: pass,
    },
  });

  try {
    await transporter.verify();
    console.log("SMTP verified");
    const info = await transporter.sendMail({
      from: process.env.NEXT_NODEMAILER_USER,
      to: process.env.NEXT_NODEMAILER_USER,
      subject: "SMTP Test",
      text: "Hello from SMTP test",
    });
    console.log("Sent:", info);
  } catch (err) {
    console.error("SMTP test error:", err);
  }
})();
