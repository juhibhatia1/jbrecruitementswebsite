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

/**
 * Automatically appends sent emails into the IMAP "Sent" folder on the mail server
 * so they appear in webmail, Outlook, and email clients just like manual emails.
 */
export async function appendMailToSentFolder(mailOptions: any): Promise<boolean> {
  const user = process.env.NEXT_NODEMAILER_USER;
  const pass = process.env.NEXT_NODEMAILER_PASS;
  if (!user || !pass) return false;

  const host = process.env.IMAP_HOST || "imap0001.neo.space";
  const port = Number(process.env.IMAP_PORT || 993);

  try {
    const MailComposer = (await import("nodemailer/lib/mail-composer")).default;
    const composer = new MailComposer(mailOptions);
    const rawBuffer: Buffer = await new Promise((resolve, reject) => {
      composer.compile().build((err: any, msg: Buffer) => {
        if (err) reject(err);
        else resolve(msg);
      });
    });

    const tls = await import("tls");

    return await new Promise<boolean>((resolve) => {
      const socket = tls.connect(port, host, { rejectUnauthorized: false }, () => {});
      socket.setEncoding("utf8");

      let tag = 1;
      function send(cmd: string) {
        socket.write(`A${tag++} ${cmd}\r\n`);
      }

      let buffer = "";

      socket.on("data", (data) => {
        buffer += data;

        if (buffer.includes("* OK") && tag === 1) {
          send(`LOGIN "${user}" "${pass}"`);
        } else if (buffer.includes("A1 OK") && tag === 2) {
          const len = Buffer.byteLength(rawBuffer);
          socket.write(`A2 APPEND "Sent" (\\Seen) {${len}}\r\n`);
          tag = 3;
        } else if (buffer.includes("+") && tag === 3) {
          socket.write(rawBuffer);
          socket.write("\r\n");
          tag = 4;
        } else if (buffer.includes("A2 OK") && tag === 4) {
          send("LOGOUT");
          socket.end();
          resolve(true);
        } else if (buffer.includes("A2 NO") || buffer.includes("A2 BAD")) {
          socket.end();
          resolve(false);
        }
      });

      socket.on("error", (err) => {
        console.warn("Non-fatal: IMAP Sent folder sync warning:", err?.message || err);
        resolve(false);
      });

      setTimeout(() => {
        try { socket.end(); } catch {}
        resolve(false);
      }, 15000);
    });
  } catch (err: any) {
    console.warn("Non-fatal: Failed to compile email for Sent folder:", err?.message || err);
    return false;
  }
}
