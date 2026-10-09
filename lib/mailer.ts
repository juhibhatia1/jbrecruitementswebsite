import nodemailer from "nodemailer";

let cachedTransporter: nodemailer.Transporter | null = null;

export function getMailerTransporter(): nodemailer.Transporter {
  if (cachedTransporter) {
    return cachedTransporter;
  }

  const user = process.env.NEXT_NODEMAILER_USER;
  const pass = process.env.NEXT_NODEMAILER_PASS;

  if (!user || !pass) {
    throw new Error("Missing NEXT_NODEMAILER_USER or NEXT_NODEMAILER_PASS");
  }

  const host = process.env.SMTP_HOST || "smtp0001.neo.space";
  const port = Number(process.env.SMTP_PORT || 465);
  const secure = process.env.SMTP_SECURE === "true" || port === 465;

  cachedTransporter = nodemailer.createTransport({
    host,
    port,
    secure,
    pool: true,
    maxConnections: 5,
    maxMessages: 100,
    connectionTimeout: 35000, // 35s to establish connection with remote SMTP
    greetingTimeout: 35000,   // 35s to receive SMTP 220 banner (accommodates Neo/Flockmail 18-22s tarpit greetpause)
    socketTimeout: 45000,    // 45s for socket transmission
    auth: { user, pass },
  });

  return cachedTransporter;
}

export function createFreshMailerTransporter(): nodemailer.Transporter {
  const user = process.env.NEXT_NODEMAILER_USER;
  const pass = process.env.NEXT_NODEMAILER_PASS;

  if (!user || !pass) {
    throw new Error("Missing NEXT_NODEMAILER_USER or NEXT_NODEMAILER_PASS");
  }

  const host = process.env.SMTP_HOST || "smtp0001.neo.space";
  const port = Number(process.env.SMTP_PORT || 465);
  const secure = process.env.SMTP_SECURE === "true" || port === 465;

  return nodemailer.createTransport({
    host,
    port,
    secure,
    pool: false,
    connectionTimeout: 35000,
    greetingTimeout: 35000,
    socketTimeout: 45000,
    auth: { user, pass },
  } as any);
}
