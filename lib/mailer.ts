import "server-only";

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

  cachedTransporter = nodemailer.createTransport({
    host: "smtp0001.neo.space",
    port: 465,
    secure: true,
    pool: true,
    maxConnections: 5,
    maxMessages: 100,
    auth: {
      user,
      pass,
    },
  });

  return cachedTransporter;
}
