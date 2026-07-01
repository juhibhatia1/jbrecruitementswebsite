"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendPurchaseEmails = sendPurchaseEmails;
exports.sendInterviewInvitationEmail = sendInterviewInvitationEmail;
exports.sendInterviewResultsToCandidate = sendInterviewResultsToCandidate;
exports.sendNewApplicationAlertEmail = sendNewApplicationAlertEmail;
var mailer_1 = require("./mailer");
var pdfGenerator_1 = require("./pdfGenerator");
var security_1 = require("./security");
var path_1 = require("path");
function sendPurchaseEmails(purchase) {
    return __awaiter(this, void 0, void 0, function () {
        var user, adminEmail, transporter, pdfBuffer, pdfError_1, formatServicesList, formattedServices, isMultiService, formatCurrency, formattedAmount, candidateMailOptions, adminMailOptions, err_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    user = process.env.NEXT_NODEMAILER_USER;
                    adminEmail = process.env.PURCHASE_ALERT_EMAIL || user;
                    if (!user) {
                        console.error("Mailer credentials missing. Cannot send emails.");
                        return [2 /*return*/, { success: false, error: "Mailer credentials missing" }];
                    }
                    transporter = (0, mailer_1.getMailerTransporter)();
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, (0, pdfGenerator_1.generateReceiptPdf)(purchase)];
                case 2:
                    pdfBuffer = _a.sent();
                    return [3 /*break*/, 4];
                case 3:
                    pdfError_1 = _a.sent();
                    console.error("Failed to generate PDF receipt:", pdfError_1);
                    return [2 /*return*/, { success: false, error: "PDF generation failed" }];
                case 4:
                    formatServicesList = function (rawName) {
                        var parts = rawName.split(" + ");
                        if (parts.length <= 1)
                            return rawName;
                        if (parts.length === 2)
                            return "".concat(parts[0], " and ").concat(parts[1]);
                        return "".concat(parts.slice(0, -1).join(", "), ", and ").concat(parts[parts.length - 1]);
                    };
                    formattedServices = formatServicesList(purchase.serviceName);
                    isMultiService = purchase.serviceName.includes(" + ");
                    formatCurrency = function (amount, currencyStr) {
                        var currencyUpper = currencyStr.toUpperCase();
                        var locale = currencyUpper === "INR" ? "en-IN" : "en-US";
                        return "".concat(amount.toLocaleString(locale, {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                        }), " ").concat(currencyUpper);
                    };
                    formattedAmount = formatCurrency(purchase.amount, purchase.currency);
                    candidateMailOptions = {
                        from: "\"JB Recruitment Solutions\" <".concat(user, ">"),
                        to: purchase.candidateEmail,
                        subject: "Your Receipt for ".concat(formattedServices, " - JB Recruitment Solutions"),
                        text: "Hi ".concat(purchase.candidateName, ",\n\nThank you for your purchase of \"").concat(formattedServices, "\"!\n\nWe have received your payment of ").concat(formattedAmount, ". Your receipt is attached to this email as a PDF.\n\nOur team will contact you shortly to coordinate the next steps and get started with your service. You can also reply directly to this email if you have any immediate questions.\n\nBest regards,\nTeam JB Recruitment Solutions"),
                        html: "\n      <div style=\"font-family: 'Raleway', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px; color: #2d3748; line-height: 1.6;\">\n        <div style=\"text-align: center; padding-bottom: 20px; border-bottom: 1px solid #edf2f7;\">\n          <img src=\"cid:jb-logo\" alt=\"JB Recruitment Solutions\" style=\"width: 100px; height: auto;\" />\n        </div>\n        <div style=\"padding: 20px 0;\">\n          <h2 style=\"color: #5a58ab; font-size: 22px; margin-top: 0; font-weight: 600;\">Payment Confirmed!</h2>\n          <p>Hi <strong>".concat(purchase.candidateName, "</strong>,</p>\n          <p>Thank you for purchasing <strong>").concat(formattedServices, "</strong>. We're excited to work with you on your career journey!</p>\n          \n          <div style=\"background-color: #f7fafc; border: 1px solid #edf2f7; padding: 15px; border-radius: 8px; margin: 20px 0;\">\n            <h3 style=\"margin-top: 0; font-size: 16px; color: #4a5568;\">Purchase Summary</h3>\n            <table style=\"width: 100%; border-collapse: collapse;\">\n              <tr>\n                <td style=\"padding: 6px 0; color: #718096;\">").concat(isMultiService ? "Services:" : "Service:", "</td>\n                <td style=\"padding: 6px 0; font-weight: bold; text-align: right;\">").concat(formattedServices, "</td>\n              </tr>\n              <tr>\n                <td style=\"padding: 6px 0; color: #718096;\">Amount Paid:</td>\n                <td style=\"padding: 6px 0; font-weight: bold; text-align: right; color: #5a58ab;\">").concat(formattedAmount, "</td>\n              </tr>\n              <tr>\n                <td style=\"padding: 6px 0; color: #718096;\">Receipt ID:</td>\n                <td style=\"padding: 6px 0; font-family: monospace; font-size: 13px; text-align: right;\">").concat(purchase.id, "</td>\n              </tr>\n            </table>\n          </div>\n\n          <p>We've attached your official PDF receipt to this email. Please keep it for your records.</p>\n          \n          <p>Our team will contact you shortly to coordinate the next steps and get started with your service.</p>\n          \n          <p style=\"font-size: 14px; color: #718096; text-align: center;\">Have questions or want to open the chat? You can also reply directly to this email to speak with our support team.</p>\n        </div>\n        <div style=\"text-align: center; padding-top: 20px; border-top: 1px solid #edf2f7; font-size: 12px; color: #a0aec0;\">\n          <p>\u00A9 ").concat(new Date().getFullYear(), " JB Recruitment Solutions. All rights reserved.</p>\n        </div>\n      </div>\n    "),
                        attachments: [
                            {
                                filename: "Receipt-".concat(purchase.id, ".pdf"),
                                content: pdfBuffer,
                            },
                            {
                                filename: "logo.avif",
                                path: path_1.default.join(process.cwd(), "public", "logo.avif"),
                                cid: "jb-logo",
                            },
                        ],
                    };
                    adminMailOptions = {
                        from: "\"Purchase Alert\" <".concat(user, ">"),
                        to: adminEmail,
                        subject: "\uD83D\uDEA8 Alert: New Premium Purchase - ".concat(purchase.candidateName),
                        text: "New premium service purchase alert:\nCandidate Name: ".concat(purchase.candidateName, "\nCandidate Email: ").concat(purchase.candidateEmail, "\nService Name: ").concat(purchase.serviceName, "\nAmount: ").concat(formattedAmount, "\nBilling Country: ").concat(purchase.country || "Not provided", "\nTransaction Date: ").concat(purchase.createdAt.toLocaleString(), "\nPurchase ID: ").concat(purchase.id),
                        html: "\n      <div style=\"font-family: Arial, sans-serif; padding: 20px; border: 2px solid #5a58ab; border-radius: 8px; max-width: 600px; margin: 0 auto; color: #333;\">\n        <h2 style=\"color: #e53e3e; margin-top: 0;\">\uD83D\uDEA8 New Premium Purchase</h2>\n        <p>A candidate has successfully purchased a premium service. Here are the details:</p>\n        \n        <div style=\"background-color: #fffaf0; border: 1px solid #feebc8; padding: 15px; border-radius: 5px; margin: 20px 0;\">\n          <table style=\"width: 100%; border-collapse: collapse;\">\n            <tr>\n              <td style=\"padding: 8px 0; font-weight: bold; border-bottom: 1px solid #edf2f7;\">Candidate Name:</td>\n              <td style=\"padding: 8px 0; border-bottom: 1px solid #edf2f7;\">".concat(purchase.candidateName, "</td>\n            </tr>\n            <tr>\n              <td style=\"padding: 8px 0; font-weight: bold; border-bottom: 1px solid #edf2f7;\">Candidate Email:</td>\n              <td style=\"padding: 8px 0; border-bottom: 1px solid #edf2f7;\"><a href=\"mailto:").concat(purchase.candidateEmail, "\">").concat(purchase.candidateEmail, "</a></td>\n            </tr>\n            <tr>\n              <td style=\"padding: 8px 0; font-weight: bold; border-bottom: 1px solid #edf2f7;\">").concat(isMultiService ? "Services Purchased:" : "Service Name:", "</td>\n              <td style=\"padding: 8px 0; border-bottom: 1px solid #edf2f7; font-weight: bold; color: #5a58ab;\">").concat(purchase.serviceName, "</td>\n            </tr>\n            <tr>\n              <td style=\"padding: 8px 0; font-weight: bold; border-bottom: 1px solid #edf2f7;\">Transaction Amount:</td>\n              <td style=\"padding: 8px 0; border-bottom: 1px solid #edf2f7; font-weight: bold; color: #38a169;\">").concat(formattedAmount, "</td>\n            </tr>\n            <tr>\n              <td style=\"padding: 8px 0; font-weight: bold; border-bottom: 1px solid #edf2f7;\">Billing Country:</td>\n              <td style=\"padding: 8px 0; border-bottom: 1px solid #edf2f7;\">").concat(purchase.country || "Not provided", "</td>\n            </tr>\n            <tr>\n              <td style=\"padding: 8px 0; font-weight: bold; border-bottom: 1px solid #edf2f7;\">Purchase ID:</td>\n              <td style=\"padding: 8px 0; border-bottom: 1px solid #edf2f7; font-family: monospace;\">").concat(purchase.id, "</td>\n            </tr>\n            <tr>\n              <td style=\"padding: 8px 0; font-weight: bold;\">Date:</td>\n              <td style=\"padding: 8px 0;\">").concat(purchase.createdAt.toLocaleString(), "</td>\n            </tr>\n          </table>\n        </div>\n        \n        <p style=\"font-size: 13px; color: #718096;\">This is an automated system alert. A confirmation email and PDF receipt have already been dispatched to the candidate.</p>\n      </div>\n    "),
                    };
                    _a.label = 5;
                case 5:
                    _a.trys.push([5, 8, , 9]);
                    // Send to candidate
                    console.log("Sending purchase confirmation email to candidate: ".concat(purchase.candidateEmail));
                    return [4 /*yield*/, transporter.sendMail(candidateMailOptions)];
                case 6:
                    _a.sent();
                    // Send to admin
                    console.log("Sending alert email to admin: ".concat(adminEmail));
                    return [4 /*yield*/, transporter.sendMail(adminMailOptions)];
                case 7:
                    _a.sent();
                    return [2 /*return*/, { success: true }];
                case 8:
                    err_1 = _a.sent();
                    console.error("Error sending purchase confirmation/alert emails:", err_1);
                    return [2 /*return*/, { success: false, error: err_1 }];
                case 9: return [2 /*return*/];
            }
        });
    });
}
function sendInterviewInvitationEmail(data) {
    return __awaiter(this, void 0, void 0, function () {
        var user, transporter, isAI, subject, textBody, htmlBody, attachments, err_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    user = process.env.NEXT_NODEMAILER_USER;
                    if (!user) {
                        console.error("Mailer credentials missing. Cannot send interview invitation email.");
                        return [2 /*return*/, { success: false, error: "Mailer credentials missing" }];
                    }
                    transporter = (0, mailer_1.getMailerTransporter)();
                    isAI = data.interviewPreference === "AI";
                    subject = isAI
                        ? "Your AI Mock Interview Link for ".concat((0, security_1.escapeHtml)(data.jobRole), " \u2014 JB Recruitment Solutions")
                        : "Booking Confirmed for ".concat((0, security_1.escapeHtml)(data.jobRole), " \u2014 JB Recruitment Solutions");
                    textBody = isAI
                        ? "Hi ".concat(data.candidateName, ",\n\nThank you for booking your mock interview practice session for ").concat(data.jobRole, " at JB Recruitment Solutions.\n\nYour AI-powered mock interview is ready. Click the link below to begin when you are ready. The link expires in 7 days.\n\nInterview Link: ").concat(data.interviewLink, "\n\nDuration: approximately ").concat(data.durationMinutes, " minutes\n").concat(data.interviewDescription ? "\nWhat to expect:\n".concat(data.interviewDescription) : "", "\n\nTips before you start:\n- Use a quiet environment with minimal background noise.\n- Ensure your microphone is working.\n- Use Chrome or Edge for best compatibility.\n\nBest of luck!\nTeam JB Recruitment Solutions")
                        : "Hi ".concat(data.candidateName, ",\n\nThank you for booking your mock interview practice session for ").concat(data.jobRole, " at JB Recruitment Solutions.\n\nWe have received your booking and a coach will be in touch with you shortly to schedule your practice session.\n\nBest regards,\nTeam JB Recruitment Solutions");
                    htmlBody = isAI
                        ? "\n      <div style=\"font-family: 'Raleway', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px; color: #2d3748; line-height: 1.6;\">\n        <div style=\"text-align: center; padding-bottom: 20px; border-bottom: 1px solid #edf2f7;\">\n          <img src=\"cid:jb-logo\" alt=\"JB Recruitment Solutions\" style=\"width: 100px; height: auto;\" />\n        </div>\n        <div style=\"padding: 20px 0;\">\n          <h2 style=\"color: #5a58ab; font-size: 22px; margin-top: 0; font-weight: 600;\">Your Mock Interview is Ready</h2>\n          <p>Hi <strong>".concat((0, security_1.escapeHtml)(data.candidateName), "</strong>,</p>\n          <p>Thank you for booking your mock interview practice session for <strong>").concat((0, security_1.escapeHtml)(data.jobRole), "</strong>. Your AI-powered mock interview is now ready to begin.</p>\n          ").concat(data.interviewDescription ? "<div style=\"background-color: #f7fafc; border: 1px solid #edf2f7; padding: 15px; border-radius: 8px; margin: 16px 0;\"><p style=\"margin: 0; font-size: 14px; color: #4a5568;\">".concat((0, security_1.escapeHtml)(data.interviewDescription), "</p></div>") : "", "\n          <div style=\"background-color: #f7fafc; border: 1px solid #edf2f7; padding: 15px; border-radius: 8px; margin: 20px 0;\">\n            <table style=\"width: 100%; border-collapse: collapse;\">\n              <tr>\n                <td style=\"padding: 6px 0; color: #718096;\">Role:</td>\n                <td style=\"padding: 6px 0; font-weight: bold; text-align: right;\">").concat((0, security_1.escapeHtml)(data.jobRole), "</td>\n              </tr>\n              <tr>\n                <td style=\"padding: 6px 0; color: #718096;\">Duration:</td>\n                <td style=\"padding: 6px 0; font-weight: bold; text-align: right;\">~").concat(data.durationMinutes, " minutes</td>\n              </tr>\n              <tr>\n                <td style=\"padding: 6px 0; color: #718096;\">Format:</td>\n                <td style=\"padding: 6px 0; font-weight: bold; text-align: right;\">AI Mock Interview</td>\n              </tr>\n            </table>\n          </div>\n          <div style=\"text-align: center; margin: 28px 0;\">\n            <a href=\"").concat(data.interviewLink, "\" style=\"background-color: #5a58ab; color: white; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 15px; display: inline-block;\">Start Your Interview</a>\n          </div>\n          <p style=\"font-size: 13px; color: #718096;\">This link expires in <strong>7 days</strong>. Use Chrome or Edge for the best experience. Ensure your microphone is working before starting.</p>\n        </div>\n        <div style=\"text-align: center; padding-top: 20px; border-top: 1px solid #edf2f7; font-size: 12px; color: #a0aec0;\">\n          <p>\u00A9 ").concat(new Date().getFullYear(), " JB Recruitment Solutions. All rights reserved.</p>\n        </div>\n      </div>\n    ")
                        : "\n      <div style=\"font-family: 'Raleway', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px; color: #2d3748; line-height: 1.6;\">\n        <div style=\"text-align: center; padding-bottom: 20px; border-bottom: 1px solid #edf2f7;\">\n          <img src=\"cid:jb-logo\" alt=\"JB Recruitment Solutions\" style=\"width: 100px; height: auto;\" />\n        </div>\n        <div style=\"padding: 20px 0;\">\n          <h2 style=\"color: #5a58ab; font-size: 22px; margin-top: 0; font-weight: 600;\">Booking Confirmed</h2>\n          <p>Hi <strong>".concat((0, security_1.escapeHtml)(data.candidateName), "</strong>,</p>\n          <p>Thank you for booking your mock interview practice session for <strong>").concat((0, security_1.escapeHtml)(data.jobRole), "</strong>. We have received your booking and a coach will be in touch shortly to schedule your practice session.</p>\n          <p style=\"font-size: 14px; color: #718096;\">If you have any questions in the meantime, feel free to reply to this email.</p>\n        </div>\n        <div style=\"text-align: center; padding-top: 20px; border-top: 1px solid #edf2f7; font-size: 12px; color: #a0aec0;\">\n          <p>\u00A9 ").concat(new Date().getFullYear(), " JB Recruitment Solutions. All rights reserved.</p>\n        </div>\n      </div>\n    ");
                    attachments = [
                        {
                            filename: "logo.avif",
                            path: path_1.default.join(process.cwd(), "public", "logo.avif"),
                            cid: "jb-logo",
                        },
                    ];
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, transporter.sendMail({
                            from: "\"JB Recruitment Solutions\" <".concat(user, ">"),
                            to: data.candidateEmail,
                            subject: subject,
                            text: textBody,
                            html: htmlBody,
                            attachments: attachments,
                        })];
                case 2:
                    _a.sent();
                    return [2 /*return*/, { success: true }];
                case 3:
                    err_2 = _a.sent();
                    console.error("Error sending interview invitation email:", err_2);
                    return [2 /*return*/, { success: false, error: err_2 }];
                case 4: return [2 /*return*/];
            }
        });
    });
}
function sendInterviewResultsToCandidate(data) {
    return __awaiter(this, void 0, void 0, function () {
        var user, transporter, pdfBuffer, generateInterviewReportPdf, pdfErr_1, scoreLine, strengthsList, improvementsList, subject, textBody, scoreHtml, htmlBody, attachments, safeName, err_3;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    user = process.env.NEXT_NODEMAILER_USER;
                    if (!user)
                        return [2 /*return*/, { success: false, error: "Mailer credentials missing" }];
                    transporter = (0, mailer_1.getMailerTransporter)();
                    pdfBuffer = null;
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 4, , 5]);
                    return [4 /*yield*/, Promise.resolve().then(function () { return require("./pdfGenerator"); })];
                case 2:
                    generateInterviewReportPdf = (_a.sent()).generateInterviewReportPdf;
                    return [4 /*yield*/, generateInterviewReportPdf(data)];
                case 3:
                    pdfBuffer = _a.sent();
                    return [3 /*break*/, 5];
                case 4:
                    pdfErr_1 = _a.sent();
                    console.error("Failed to generate interview report PDF:", pdfErr_1);
                    return [3 /*break*/, 5];
                case 5:
                    scoreLine = data.finalScore !== null ? "\nYour Score: ".concat(data.finalScore, " / 10") : "";
                    strengthsList = data.strengths.map(function (s) { return "  + ".concat(s); }).join("\n");
                    improvementsList = data.improvements.map(function (s) { return "  \u25B3 ".concat(s); }).join("\n");
                    subject = "Your Mock Interview Report: ".concat(data.jobRole, " \u2014 JB Recruitment Solutions");
                    textBody = "Hi ".concat(data.candidateName, ",\n\nYour mock interview for ").concat(data.jobRole, " has been completed. Here is your performance report.\n").concat(scoreLine, "\n\nSummary:\n").concat(data.summary, "\n\nStrengths:\n").concat(strengthsList || "See attached report.", "\n\nAreas to Improve:\n").concat(improvementsList || "See attached report.", "\n\nYour full report is attached as a PDF.\n\nBest regards,\nTeam JB Recruitment Solutions");
                    scoreHtml = data.finalScore !== null
                        ? "<div style=\"text-align:center;margin:24px 0 0;\">\n        <div style=\"display:inline-block;background:#5a58ab;border-radius:12px;padding:16px 32px;\">\n          <div style=\"color:rgba(255,255,255,0.7);font-size:11px;font-weight:700;letter-spacing:1px;margin-bottom:4px;\">SCORE</div>\n          <div style=\"color:white;font-size:36px;font-weight:800;line-height:1;\">".concat(data.finalScore, "<span style=\"font-size:16px;font-weight:400;opacity:0.7\"> / 10</span></div>\n        </div>\n      </div>")
                        : "";
                    htmlBody = "\n    <div style=\"font-family:'Raleway',Helvetica,Arial,sans-serif;max-width:600px;margin:0 auto;border:1px solid #e2e8f0;border-radius:12px;overflow:hidden;color:#2d3748;\">\n      <div style=\"background:#1a1f2b;padding:20px 28px;display:flex;align-items:center;justify-content:space-between;\">\n        <img src=\"cid:jb-logo\" alt=\"JB Recruitment Solutions\" style=\"height:40px;width:auto;\" />\n        <span style=\"color:rgba(255,255,255,0.5);font-size:11px;\">Performance Report</span>\n      </div>\n      <div style=\"background:#5a58ab;padding:10px 28px;\">\n        <span style=\"color:white;font-size:12px;font-weight:700;letter-spacing:0.5px;\">MOCK INTERVIEW PERFORMANCE REPORT</span>\n      </div>\n      <div style=\"padding:28px;\">\n        <p style=\"margin:0 0 4px;\">Hi <strong>".concat((0, security_1.escapeHtml)(data.candidateName), "</strong>,</p>\n        <p style=\"margin:0 0 20px;color:#4a5568;\">Your mock interview for <strong>").concat((0, security_1.escapeHtml)(data.jobRole), "</strong> is complete. Here is your performance report.</p>\n        ").concat(scoreHtml, "\n        <div style=\"background:#f7fafc;border:1px solid #edf2f7;border-radius:8px;padding:16px;margin:20px 0;\">\n          <p style=\"margin:0 0 6px;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.5px;color:#718096;\">Summary</p>\n          <p style=\"margin:0;font-size:14px;color:#2d3748;line-height:1.6;\">").concat((0, security_1.escapeHtml)(data.summary), "</p>\n        </div>\n        ").concat(data.strengths.length > 0 ? "\n        <div style=\"background:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;padding:16px;margin:16px 0;\">\n          <p style=\"margin:0 0 10px;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.5px;color:#15803d;\">Strengths</p>\n          <ul style=\"margin:0;padding-left:0;list-style:none;\">\n            ".concat(data.strengths.map(function (s) { return "<li style=\"font-size:13px;color:#2d3748;padding:4px 0;\"><span style=\"color:#16a34a;font-weight:700;margin-right:8px;\">+</span>".concat((0, security_1.escapeHtml)(s), "</li>"); }).join(""), "\n          </ul>\n        </div>") : "", "\n        ").concat(data.improvements.length > 0 ? "\n        <div style=\"background:#fffbeb;border:1px solid #fde68a;border-radius:8px;padding:16px;margin:16px 0;\">\n          <p style=\"margin:0 0 10px;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.5px;color:#b45309;\">Areas to Improve</p>\n          <ul style=\"margin:0;padding-left:0;list-style:none;\">\n            ".concat(data.improvements.map(function (s) { return "<li style=\"font-size:13px;color:#2d3748;padding:4px 0;\"><span style=\"color:#d97706;font-weight:700;margin-right:8px;\">\u25B3</span>".concat((0, security_1.escapeHtml)(s), "</li>"); }).join(""), "\n          </ul>\n        </div>") : "", "\n        <p style=\"font-size:12px;color:#718096;margin-top:24px;\">Your full performance report with question-by-question evaluation is attached as a PDF. Keep it for your records and use it to guide your preparation.</p>\n      </div>\n      <div style=\"background:#f7fafc;border-top:1px solid #edf2f7;padding:16px 28px;text-align:center;font-size:11px;color:#a0aec0;\">\n        \u00A9 ").concat(new Date().getFullYear(), " JB Recruitment Solutions. All rights reserved.\n      </div>\n    </div>");
                    attachments = [
                        { filename: "logo.avif", path: path_1.default.join(process.cwd(), "public", "logo.avif"), cid: "jb-logo" },
                    ];
                    if (pdfBuffer) {
                        safeName = data.jobRole.replace(/[^a-zA-Z0-9_-]/g, "_");
                        attachments.push({ filename: "Interview-Report-".concat(safeName, ".pdf"), content: pdfBuffer });
                    }
                    _a.label = 6;
                case 6:
                    _a.trys.push([6, 8, , 9]);
                    return [4 /*yield*/, transporter.sendMail({ from: "\"JB Recruitment Solutions\" <".concat(user, ">"), to: data.candidateEmail, subject: subject, text: textBody, html: htmlBody, attachments: attachments })];
                case 7:
                    _a.sent();
                    return [2 /*return*/, { success: true }];
                case 8:
                    err_3 = _a.sent();
                    console.error("Error sending interview results email:", err_3);
                    return [2 /*return*/, { success: false, error: err_3 }];
                case 9: return [2 /*return*/];
            }
        });
    });
}
function sendNewApplicationAlertEmail(data) {
    return __awaiter(this, void 0, void 0, function () {
        var user, receiver, transporter, err_4;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    user = process.env.NEXT_NODEMAILER_USER;
                    receiver = process.env.INTERVIEW_REPORT_EMAIL || user;
                    if (!user || !receiver)
                        return [2 /*return*/, { success: false, error: "Mailer credentials missing" }];
                    transporter = (0, mailer_1.getMailerTransporter)();
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, transporter.sendMail({
                            from: "\"Application Alert\" <".concat(user, ">"),
                            to: receiver,
                            subject: "New Booking: ".concat((0, security_1.escapeHtml)(data.candidateName), " \u2014 ").concat((0, security_1.escapeHtml)(data.jobRole)),
                            html: "\n        <div style=\"font-family: Arial, sans-serif; padding: 20px; border: 2px solid #5a58ab; border-radius: 8px; max-width: 600px; margin: 0 auto; color: #333;\">\n          <h2 style=\"color: #5a58ab; margin-top: 0;\">New Mock Interview Booking</h2>\n          <div style=\"background-color: #f7fafc; border: 1px solid #edf2f7; padding: 15px; border-radius: 8px;\">\n            <table style=\"width: 100%; border-collapse: collapse;\">\n              <tr><td style=\"padding: 7px 0; font-weight: bold; border-bottom: 1px solid #edf2f7;\">Name:</td><td style=\"padding: 7px 0; border-bottom: 1px solid #edf2f7;\">".concat((0, security_1.escapeHtml)(data.candidateName), "</td></tr>\n              <tr><td style=\"padding: 7px 0; font-weight: bold; border-bottom: 1px solid #edf2f7;\">Email:</td><td style=\"padding: 7px 0; border-bottom: 1px solid #edf2f7;\"><a href=\"mailto:").concat((0, security_1.escapeHtml)(data.candidateEmail), "\">").concat((0, security_1.escapeHtml)(data.candidateEmail), "</a></td></tr>\n              <tr><td style=\"padding: 7px 0; font-weight: bold; border-bottom: 1px solid #edf2f7;\">Phone:</td><td style=\"padding: 7px 0; border-bottom: 1px solid #edf2f7;\">").concat((0, security_1.escapeHtml)(data.candidatePhone || "Not provided"), "</td></tr>\n              <tr><td style=\"padding: 7px 0; font-weight: bold; border-bottom: 1px solid #edf2f7;\">LinkedIn:</td><td style=\"padding: 7px 0; border-bottom: 1px solid #edf2f7;\">").concat(data.linkedInUrl ? "<a href=\"".concat((0, security_1.escapeHtml)(data.linkedInUrl), "\">").concat((0, security_1.escapeHtml)(data.linkedInUrl), "</a>") : "Not provided", "</td></tr>\n              <tr><td style=\"padding: 7px 0; font-weight: bold; border-bottom: 1px solid #edf2f7;\">Role:</td><td style=\"padding: 7px 0; border-bottom: 1px solid #edf2f7; font-weight: bold; color: #5a58ab;\">").concat((0, security_1.escapeHtml)(data.jobRole), "</td></tr>\n              <tr><td style=\"padding: 7px 0; font-weight: bold;\">Session Type:</td><td style=\"padding: 7px 0;\">").concat(data.interviewPreference === "AI" ? "AI Mock Interview" : "Coach Session", "</td></tr>\n            </table>\n          </div>\n          <p style=\"font-size: 13px; color: #718096; margin-top: 16px;\">Application ID: <code>").concat((0, security_1.escapeHtml)(data.applicationId), "</code></p>\n        </div>\n      "),
                        })];
                case 2:
                    _a.sent();
                    return [2 /*return*/, { success: true }];
                case 3:
                    err_4 = _a.sent();
                    console.error("Error sending new application alert email:", err_4);
                    return [2 /*return*/, { success: false, error: err_4 }];
                case 4: return [2 /*return*/];
            }
        });
    });
}
