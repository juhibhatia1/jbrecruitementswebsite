"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMailerTransporter = getMailerTransporter;
var nodemailer_1 = require("nodemailer");
var cachedTransporter = null;
function getMailerTransporter() {
    if (cachedTransporter) {
        return cachedTransporter;
    }
    var user = process.env.NEXT_NODEMAILER_USER;
    var pass = process.env.NEXT_NODEMAILER_PASS;
    if (!user || !pass) {
        throw new Error("Missing NEXT_NODEMAILER_USER or NEXT_NODEMAILER_PASS");
    }
    var host = process.env.SMTP_HOST || "smtp.gmail.com";
    var port = Number(process.env.SMTP_PORT || 587);
    var secure = process.env.SMTP_SECURE === "true" || port === 465;
    cachedTransporter = nodemailer_1.default.createTransport({
        host: host,
        port: port,
        secure: secure,
        pool: true,
        maxConnections: 5,
        maxMessages: 100,
        auth: { user: user, pass: pass },
    });
    return cachedTransporter;
}
