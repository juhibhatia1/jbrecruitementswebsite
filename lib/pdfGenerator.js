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
exports.generateReceiptPdf = generateReceiptPdf;
exports.generateInterviewReportPdf = generateInterviewReportPdf;
var pdf_lib_1 = require("pdf-lib");
var system_context_1 = require("@/lib/rag/system-context");
var BRAND_COLOR = (0, pdf_lib_1.rgb)(0.353, 0.345, 0.671); // #5a58ab
var DARK_COLOR = (0, pdf_lib_1.rgb)(0.145, 0.18, 0.239); // #252e3d
var GRAY_COLOR = (0, pdf_lib_1.rgb)(0.44, 0.52, 0.6); // muted gray
var LIGHT_GRAY = (0, pdf_lib_1.rgb)(0.93, 0.94, 0.96);
var WHITE = (0, pdf_lib_1.rgb)(1, 1, 1);
var GREEN = (0, pdf_lib_1.rgb)(0.08, 0.627, 0.376); // #15a060
function generateReceiptPdf(purchase) {
    return __awaiter(this, void 0, void 0, function () {
        var pdfDoc, page, _a, width, height, font, boldFont, headerBandH, accentBarH, HEADER_DARK, fs, path, _s, sharp, logoAvifPath, avifBuffer, pngBuffer, logoImg, targetH, targetW, logoX, logoY, logoError_1, companyName, companyEmail, companyWeb, companyNameSize, companyInfoSize, companyNameW, companyEmailW, companyWebW, rightEdge, accentBarY, receiptTitle, titleSize, receiptDate, receiptNo, rightInfoText, rightInfoSize, rightInfoW, sectionY, cardH, cardY, badgeW, badgeH, badgeX, badgeY, paidText, paidTextSize, paidTextW, tableY, items, currency, getItemPrice, currentY, _i, items_1, item, itemPrice, totalBoxWidth, totalBoxHeight, totalBoxX, totalBoxY, totalLabel, totalValText, totalValSize, combinedText, combinedWidth, fs, path, _s, sharp, publicDir, logoAvifPath, avifBuffer, pngBuffer, embeddedImage, logoWidth, logoHeight, watermarkError_1, pdfBytes;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0: return [4 /*yield*/, pdf_lib_1.PDFDocument.create()];
                case 1:
                    pdfDoc = _b.sent();
                    page = pdfDoc.addPage([595, 842]);
                    _a = page.getSize(), width = _a.width, height = _a.height;
                    return [4 /*yield*/, pdfDoc.embedFont(pdf_lib_1.StandardFonts.Helvetica)];
                case 2:
                    font = _b.sent();
                    return [4 /*yield*/, pdfDoc.embedFont(pdf_lib_1.StandardFonts.HelveticaBold)];
                case 3:
                    boldFont = _b.sent();
                    headerBandH = 100;
                    accentBarH = 36;
                    HEADER_DARK = (0, pdf_lib_1.rgb)(0.102, 0.122, 0.169);
                    page.drawRectangle({
                        x: 0,
                        y: height - headerBandH,
                        width: width,
                        height: headerBandH,
                        color: HEADER_DARK,
                    });
                    // Subtle bottom border on the dark band (brand color, 2px)
                    page.drawRectangle({
                        x: 0,
                        y: height - headerBandH - 2,
                        width: width,
                        height: 2,
                        color: BRAND_COLOR,
                    });
                    _b.label = 4;
                case 4:
                    _b.trys.push([4, 11, , 12]);
                    return [4 /*yield*/, Promise.resolve().then(function () { return require("fs"); })];
                case 5:
                    fs = _b.sent();
                    return [4 /*yield*/, Promise.resolve().then(function () { return require("path"); })];
                case 6:
                    path = _b.sent();
                    _s = "sharp";
                    return [4 /*yield*/, Promise.resolve("".concat(_s)).then(function (s) { return require(s); })];
                case 7:
                    sharp = _b.sent();
                    logoAvifPath = path.join(process.cwd(), "public", "logo.avif");
                    if (!fs.existsSync(logoAvifPath)) return [3 /*break*/, 10];
                    avifBuffer = fs.readFileSync(logoAvifPath);
                    return [4 /*yield*/, sharp.default(avifBuffer).png().toBuffer()];
                case 8:
                    pngBuffer = _b.sent();
                    return [4 /*yield*/, pdfDoc.embedPng(pngBuffer)];
                case 9:
                    logoImg = _b.sent();
                    targetH = 52;
                    targetW = (logoImg.width / logoImg.height) * targetH;
                    logoX = 40;
                    logoY = height - headerBandH + (headerBandH - targetH) / 2;
                    page.drawImage(logoImg, {
                        x: logoX,
                        y: logoY,
                        width: targetW,
                        height: targetH,
                        opacity: 1,
                    });
                    _b.label = 10;
                case 10: return [3 /*break*/, 12];
                case 11:
                    logoError_1 = _b.sent();
                    console.error("Could not render header logo:", logoError_1);
                    return [3 /*break*/, 12];
                case 12:
                    companyName = "JB Recruitment Solutions";
                    companyEmail = "contact@jbrecruitments.com";
                    companyWeb = "jbrecruitments.com";
                    companyNameSize = 11;
                    companyInfoSize = 8;
                    companyNameW = boldFont.widthOfTextAtSize(companyName, companyNameSize);
                    companyEmailW = font.widthOfTextAtSize(companyEmail, companyInfoSize);
                    companyWebW = font.widthOfTextAtSize(companyWeb, companyInfoSize);
                    rightEdge = width - 40;
                    page.drawText(companyName, {
                        x: rightEdge - companyNameW,
                        y: height - 34,
                        size: companyNameSize,
                        font: boldFont,
                        color: WHITE,
                    });
                    page.drawText(companyEmail, {
                        x: rightEdge - companyEmailW,
                        y: height - 52,
                        size: companyInfoSize,
                        font: font,
                        color: (0, pdf_lib_1.rgb)(0.65, 0.70, 0.80),
                    });
                    page.drawText(companyWeb, {
                        x: rightEdge - companyWebW,
                        y: height - 66,
                        size: companyInfoSize,
                        font: font,
                        color: (0, pdf_lib_1.rgb)(0.65, 0.70, 0.80),
                    });
                    accentBarY = height - headerBandH - 2 - accentBarH;
                    page.drawRectangle({
                        x: 0,
                        y: accentBarY,
                        width: width,
                        height: accentBarH,
                        color: BRAND_COLOR,
                    });
                    receiptTitle = "PAYMENT RECEIPT";
                    titleSize = 11;
                    page.drawText(receiptTitle, {
                        x: 40,
                        y: accentBarY + (accentBarH - titleSize) / 2,
                        size: titleSize,
                        font: boldFont,
                        color: WHITE,
                    });
                    receiptDate = new Date(purchase.createdAt).toLocaleDateString("en-US", {
                        year: "numeric", month: "long", day: "numeric",
                    });
                    receiptNo = "#".concat(purchase.id.slice(0, 14).toUpperCase());
                    rightInfoText = "".concat(receiptNo, "   \u00B7   ").concat(receiptDate);
                    rightInfoSize = 8;
                    rightInfoW = font.widthOfTextAtSize(rightInfoText, rightInfoSize);
                    page.drawText(rightInfoText, {
                        x: rightEdge - rightInfoW,
                        y: accentBarY + (accentBarH - rightInfoSize) / 2 + 1,
                        size: rightInfoSize,
                        font: font,
                        color: (0, pdf_lib_1.rgb)(0.85, 0.88, 1.0),
                    });
                    sectionY = accentBarY - 50;
                    cardH = 75;
                    cardY = sectionY - cardH + 12;
                    // Light card background
                    page.drawRectangle({
                        x: 40,
                        y: cardY,
                        width: width - 80,
                        height: cardH,
                        color: (0, pdf_lib_1.rgb)(0.973, 0.976, 0.984), // #f8f9fb
                    });
                    // Left brand accent stripe on card
                    page.drawRectangle({
                        x: 40,
                        y: cardY,
                        width: 3,
                        height: cardH,
                        color: BRAND_COLOR,
                    });
                    // BILLED TO — left side
                    page.drawText("BILLED TO", {
                        x: 56,
                        y: sectionY - 4,
                        size: 7.5,
                        font: boldFont,
                        color: GRAY_COLOR,
                    });
                    page.drawText(purchase.candidateName, {
                        x: 56,
                        y: sectionY - 20,
                        size: 12,
                        font: boldFont,
                        color: DARK_COLOR,
                    });
                    page.drawText(purchase.candidateEmail, {
                        x: 56,
                        y: sectionY - 36,
                        size: 9,
                        font: font,
                        color: GRAY_COLOR,
                    });
                    // PAYMENT STATUS — right side
                    page.drawText("PAYMENT STATUS", {
                        x: 390,
                        y: sectionY - 4,
                        size: 7.5,
                        font: boldFont,
                        color: GRAY_COLOR,
                    });
                    badgeW = 58;
                    badgeH = 22;
                    badgeX = 390;
                    badgeY = sectionY - 38;
                    page.drawRectangle({
                        x: badgeX,
                        y: badgeY,
                        width: badgeW,
                        height: badgeH,
                        color: (0, pdf_lib_1.rgb)(0.878, 0.973, 0.925),
                        borderColor: GREEN,
                        borderWidth: 1,
                    });
                    paidText = "PAID";
                    paidTextSize = 9;
                    paidTextW = boldFont.widthOfTextAtSize(paidText, paidTextSize);
                    page.drawText(paidText, {
                        x: badgeX + (badgeW - paidTextW) / 2,
                        y: badgeY + (badgeH - paidTextSize) / 2 + 1,
                        size: paidTextSize,
                        font: boldFont,
                        color: GREEN,
                    });
                    // ─── DIVIDER ────────────────────────────────────────────────────────────────
                    page.drawLine({
                        start: { x: 50, y: sectionY - 100 },
                        end: { x: width - 50, y: sectionY - 100 },
                        thickness: 1,
                        color: LIGHT_GRAY,
                    });
                    tableY = sectionY - 125;
                    page.drawRectangle({
                        x: 50,
                        y: tableY,
                        width: width - 100,
                        height: 24,
                        color: LIGHT_GRAY,
                    });
                    page.drawText("DESCRIPTION", {
                        x: 62,
                        y: tableY + 8,
                        size: 9,
                        font: boldFont,
                        color: DARK_COLOR,
                    });
                    page.drawText("CURRENCY", {
                        x: 350,
                        y: tableY + 8,
                        size: 9,
                        font: boldFont,
                        color: DARK_COLOR,
                    });
                    page.drawText("AMOUNT", {
                        x: 465,
                        y: tableY + 8,
                        size: 9,
                        font: boldFont,
                        color: DARK_COLOR,
                    });
                    items = purchase.serviceName.split(" + ");
                    currency = (purchase.currency || "USD").toUpperCase();
                    getItemPrice = function (itemName) {
                        var row = system_context_1.MULTI_CURRENCY_PRICING[itemName];
                        if (row && row[currency] !== undefined)
                            return row[currency];
                        // Fallback: split total evenly across all items
                        return purchase.amount / items.length;
                    };
                    currentY = tableY - 35;
                    for (_i = 0, items_1 = items; _i < items_1.length; _i++) {
                        item = items_1[_i];
                        page.drawText(item, {
                            x: 62,
                            y: currentY + 8,
                            size: 10,
                            font: boldFont,
                            color: DARK_COLOR,
                        });
                        page.drawText("Professional career consulting service", {
                            x: 62,
                            y: currentY - 6,
                            size: 8,
                            font: font,
                            color: GRAY_COLOR,
                        });
                        page.drawText(currency, {
                            x: 350,
                            y: currentY + 8,
                            size: 10,
                            font: font,
                            color: DARK_COLOR,
                        });
                        itemPrice = getItemPrice(item);
                        page.drawText("".concat(itemPrice.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })), {
                            x: 465,
                            y: currentY + 8,
                            size: 10,
                            font: boldFont,
                            color: DARK_COLOR,
                        });
                        // Row bottom border
                        page.drawLine({
                            start: { x: 50, y: currentY - 18 },
                            end: { x: width - 50, y: currentY - 18 },
                            thickness: 0.5,
                            color: LIGHT_GRAY,
                        });
                        currentY -= 45;
                    }
                    totalBoxWidth = 185;
                    totalBoxHeight = 35;
                    totalBoxX = 360;
                    totalBoxY = currentY - 15;
                    page.drawRectangle({
                        x: totalBoxX,
                        y: totalBoxY,
                        width: totalBoxWidth,
                        height: totalBoxHeight,
                        color: BRAND_COLOR,
                    });
                    totalLabel = "TOTAL PAID";
                    totalValText = "".concat(purchase.amount.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 }), " ").concat(currency);
                    totalValSize = 10;
                    combinedText = "".concat(totalLabel, ":  ").concat(totalValText);
                    combinedWidth = boldFont.widthOfTextAtSize(combinedText, totalValSize);
                    page.drawText(combinedText, {
                        x: totalBoxX + (totalBoxWidth - combinedWidth) / 2,
                        y: totalBoxY + (totalBoxHeight - totalValSize) / 2,
                        size: totalValSize,
                        font: boldFont,
                        color: WHITE,
                    });
                    _b.label = 13;
                case 13:
                    _b.trys.push([13, 20, , 21]);
                    return [4 /*yield*/, Promise.resolve().then(function () { return require("fs"); })];
                case 14:
                    fs = _b.sent();
                    return [4 /*yield*/, Promise.resolve().then(function () { return require("path"); })];
                case 15:
                    path = _b.sent();
                    _s = "sharp";
                    return [4 /*yield*/, Promise.resolve("".concat(_s)).then(function (s) { return require(s); })];
                case 16:
                    sharp = _b.sent();
                    publicDir = path.join(process.cwd(), "public");
                    logoAvifPath = path.join(publicDir, "logo.avif");
                    if (!fs.existsSync(logoAvifPath)) return [3 /*break*/, 19];
                    avifBuffer = fs.readFileSync(logoAvifPath);
                    return [4 /*yield*/, sharp.default(avifBuffer).png().toBuffer()];
                case 17:
                    pngBuffer = _b.sent();
                    return [4 /*yield*/, pdfDoc.embedPng(pngBuffer)];
                case 18:
                    embeddedImage = _b.sent();
                    logoWidth = 250;
                    logoHeight = (embeddedImage.height / embeddedImage.width) * logoWidth;
                    page.drawImage(embeddedImage, {
                        x: (width - logoWidth) / 2,
                        y: (height - logoHeight) / 2 - 20,
                        width: logoWidth,
                        height: logoHeight,
                        opacity: 0.05,
                    });
                    _b.label = 19;
                case 19: return [3 /*break*/, 21];
                case 20:
                    watermarkError_1 = _b.sent();
                    console.error("Could not render logo watermark, skipping:", watermarkError_1);
                    return [3 /*break*/, 21];
                case 21:
                    // ─── DIVIDER BEFORE FOOTER ──────────────────────────────────────────────────
                    page.drawLine({
                        start: { x: 50, y: 100 },
                        end: { x: width - 50, y: 100 },
                        thickness: 1,
                        color: LIGHT_GRAY,
                    });
                    // ─── FOOTER ─────────────────────────────────────────────────────────────────
                    page.drawText("Thank you for choosing JB Recruitment Solutions.", {
                        x: 50,
                        y: 80,
                        size: 10,
                        font: boldFont,
                        color: DARK_COLOR,
                    });
                    page.drawText("This is an official computer-generated receipt and does not require a signature.", {
                        x: 50,
                        y: 63,
                        size: 8,
                        font: font,
                        color: GRAY_COLOR,
                    });
                    page.drawText("juhi@jbrecruitments.com   |   jbrecruitments.com", {
                        x: 50,
                        y: 46,
                        size: 8,
                        font: font,
                        color: GRAY_COLOR,
                    });
                    // Footer brand accent
                    page.drawRectangle({
                        x: 0,
                        y: 0,
                        width: width,
                        height: 8,
                        color: BRAND_COLOR,
                    });
                    return [4 /*yield*/, pdfDoc.save()];
                case 22:
                    pdfBytes = _b.sent();
                    return [2 /*return*/, Buffer.from(pdfBytes)];
            }
        });
    });
}
function generateInterviewReportPdf(data) {
    return __awaiter(this, void 0, void 0, function () {
        var pdfDoc, page, _a, width, height, font, boldFont, HEADER_DARK, headerBandH, accentBarH, rightEdge, fs, path, _s, sharp, logoAvifPath, pngBuffer, logoImg, targetH, targetW, _b, companyName, companyEmail, accentBarY, titleText, dateText, cardTopY, cardH, cardBodyY, scoreBadgeX, scoreBadgeY, scoreStr, denomStr, cursorY, wrapText, sectionLabel, summaryLines, _i, summaryLines_1, ln, _c, _d, s, lines, _e, lines_1, ln, AMBER, _f, _g, s, lines, _h, lines_2, ln, _j, _k, ev, qLines, fbLines, _l, qLines_1, ln, _m, fbLines_1, ln, fs, path, _s, sharp, logoAvifPath, pngBuffer, img, logoW, logoH, _o, _p, _q;
        return __generator(this, function (_r) {
            switch (_r.label) {
                case 0: return [4 /*yield*/, pdf_lib_1.PDFDocument.create()];
                case 1:
                    pdfDoc = _r.sent();
                    page = pdfDoc.addPage([595, 842]);
                    _a = page.getSize(), width = _a.width, height = _a.height;
                    return [4 /*yield*/, pdfDoc.embedFont(pdf_lib_1.StandardFonts.Helvetica)];
                case 2:
                    font = _r.sent();
                    return [4 /*yield*/, pdfDoc.embedFont(pdf_lib_1.StandardFonts.HelveticaBold)];
                case 3:
                    boldFont = _r.sent();
                    HEADER_DARK = (0, pdf_lib_1.rgb)(0.102, 0.122, 0.169);
                    headerBandH = 100;
                    accentBarH = 36;
                    rightEdge = width - 40;
                    // ── Dark header band ─────────────────────────────────────────────────────────
                    page.drawRectangle({ x: 0, y: height - headerBandH, width: width, height: headerBandH, color: HEADER_DARK });
                    page.drawRectangle({ x: 0, y: height - headerBandH - 2, width: width, height: 2, color: BRAND_COLOR });
                    _r.label = 4;
                case 4:
                    _r.trys.push([4, 11, , 12]);
                    return [4 /*yield*/, Promise.resolve().then(function () { return require("fs"); })];
                case 5:
                    fs = _r.sent();
                    return [4 /*yield*/, Promise.resolve().then(function () { return require("path"); })];
                case 6:
                    path = _r.sent();
                    _s = "sharp";
                    return [4 /*yield*/, Promise.resolve("".concat(_s)).then(function (s) { return require(s); })];
                case 7:
                    sharp = _r.sent();
                    logoAvifPath = path.join(process.cwd(), "public", "logo.avif");
                    if (!fs.existsSync(logoAvifPath)) return [3 /*break*/, 10];
                    return [4 /*yield*/, sharp.default(fs.readFileSync(logoAvifPath)).png().toBuffer()];
                case 8:
                    pngBuffer = _r.sent();
                    return [4 /*yield*/, pdfDoc.embedPng(pngBuffer)];
                case 9:
                    logoImg = _r.sent();
                    targetH = 52;
                    targetW = (logoImg.width / logoImg.height) * targetH;
                    page.drawImage(logoImg, { x: 40, y: height - headerBandH + (headerBandH - targetH) / 2, width: targetW, height: targetH });
                    _r.label = 10;
                case 10: return [3 /*break*/, 12];
                case 11:
                    _b = _r.sent();
                    return [3 /*break*/, 12];
                case 12:
                    companyName = "JB Recruitment Solutions";
                    companyEmail = "contact@jbrecruitments.com";
                    page.drawText(companyName, { x: rightEdge - boldFont.widthOfTextAtSize(companyName, 11), y: height - 34, size: 11, font: boldFont, color: WHITE });
                    page.drawText(companyEmail, { x: rightEdge - font.widthOfTextAtSize(companyEmail, 8), y: height - 52, size: 8, font: font, color: (0, pdf_lib_1.rgb)(0.65, 0.70, 0.80) });
                    page.drawText("jbrecruitments.com", { x: rightEdge - font.widthOfTextAtSize("jbrecruitments.com", 8), y: height - 66, size: 8, font: font, color: (0, pdf_lib_1.rgb)(0.65, 0.70, 0.80) });
                    accentBarY = height - headerBandH - 2 - accentBarH;
                    page.drawRectangle({ x: 0, y: accentBarY, width: width, height: accentBarH, color: BRAND_COLOR });
                    titleText = "MOCK INTERVIEW PERFORMANCE REPORT";
                    page.drawText(titleText, { x: 40, y: accentBarY + (accentBarH - 11) / 2, size: 11, font: boldFont, color: WHITE });
                    dateText = data.completedAt ? new Date(data.completedAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }) : "";
                    if (dateText) {
                        page.drawText(dateText, { x: rightEdge - font.widthOfTextAtSize(dateText, 8), y: accentBarY + (accentBarH - 8) / 2 + 1, size: 8, font: font, color: (0, pdf_lib_1.rgb)(0.85, 0.88, 1.0) });
                    }
                    cardTopY = accentBarY - 20;
                    cardH = 70;
                    cardBodyY = cardTopY - cardH;
                    page.drawRectangle({ x: 40, y: cardBodyY, width: width - 80, height: cardH, color: (0, pdf_lib_1.rgb)(0.973, 0.976, 0.984) });
                    page.drawRectangle({ x: 40, y: cardBodyY, width: 3, height: cardH, color: BRAND_COLOR });
                    page.drawText("CANDIDATE", { x: 56, y: cardTopY - 8, size: 7.5, font: boldFont, color: GRAY_COLOR });
                    page.drawText(data.candidateName, { x: 56, y: cardTopY - 22, size: 12, font: boldFont, color: DARK_COLOR });
                    page.drawText(data.candidateEmail, { x: 56, y: cardTopY - 36, size: 9, font: font, color: GRAY_COLOR });
                    page.drawText(data.jobRole, { x: 56, y: cardTopY - 50, size: 9, font: font, color: GRAY_COLOR });
                    // Score badge on right
                    if (data.finalScore !== null) {
                        scoreBadgeX = rightEdge - 60;
                        scoreBadgeY = cardBodyY + 10;
                        page.drawRectangle({ x: scoreBadgeX, y: scoreBadgeY, width: 60, height: 50, color: BRAND_COLOR });
                        scoreStr = "".concat(data.finalScore);
                        denomStr = " / 10";
                        page.drawText(scoreStr, { x: scoreBadgeX + (60 - boldFont.widthOfTextAtSize(scoreStr, 20)) / 2, y: scoreBadgeY + 26, size: 20, font: boldFont, color: WHITE });
                        page.drawText("SCORE", { x: scoreBadgeX + (60 - boldFont.widthOfTextAtSize("SCORE", 7)) / 2, y: scoreBadgeY + 12, size: 7, font: boldFont, color: (0, pdf_lib_1.rgb)(0.85, 0.88, 1.0) });
                        void denomStr;
                    }
                    cursorY = cardBodyY - 24;
                    wrapText = function (text, maxWidth, fontSize, f) {
                        var words = text.split(" ");
                        var lines = [];
                        var line = "";
                        for (var _i = 0, words_1 = words; _i < words_1.length; _i++) {
                            var word = words_1[_i];
                            var test = line ? "".concat(line, " ").concat(word) : word;
                            if (f.widthOfTextAtSize(test, fontSize) > maxWidth) {
                                if (line)
                                    lines.push(line);
                                line = word;
                            }
                            else {
                                line = test;
                            }
                        }
                        if (line)
                            lines.push(line);
                        return lines;
                    };
                    sectionLabel = function (label, y, color) {
                        page.drawText(label, { x: 40, y: y, size: 9, font: boldFont, color: color });
                        page.drawLine({ start: { x: 40, y: y - 4 }, end: { x: width - 40, y: y - 4 }, thickness: 0.5, color: LIGHT_GRAY });
                        return y - 16;
                    };
                    cursorY = sectionLabel("SUMMARY", cursorY, DARK_COLOR);
                    summaryLines = wrapText(data.summary, width - 80, 9, font);
                    for (_i = 0, summaryLines_1 = summaryLines; _i < summaryLines_1.length; _i++) {
                        ln = summaryLines_1[_i];
                        if (cursorY < 60)
                            break;
                        page.drawText(ln, { x: 40, y: cursorY, size: 9, font: font, color: DARK_COLOR });
                        cursorY -= 14;
                    }
                    cursorY -= 10;
                    // ── Strengths ────────────────────────────────────────────────────────────────
                    if (data.strengths.length > 0 && cursorY > 80) {
                        cursorY = sectionLabel("STRENGTHS", cursorY, GREEN);
                        for (_c = 0, _d = data.strengths; _c < _d.length; _c++) {
                            s = _d[_c];
                            if (cursorY < 60)
                                break;
                            lines = wrapText("+  ".concat(s), width - 90, 9, font);
                            for (_e = 0, lines_1 = lines; _e < lines_1.length; _e++) {
                                ln = lines_1[_e];
                                page.drawText(ln, { x: 50, y: cursorY, size: 9, font: font, color: DARK_COLOR });
                                cursorY -= 13;
                            }
                        }
                        cursorY -= 8;
                    }
                    // ── Improvements ─────────────────────────────────────────────────────────────
                    if (data.improvements.length > 0 && cursorY > 80) {
                        AMBER = (0, pdf_lib_1.rgb)(0.8, 0.5, 0.1);
                        cursorY = sectionLabel("AREAS TO IMPROVE", cursorY, AMBER);
                        for (_f = 0, _g = data.improvements; _f < _g.length; _f++) {
                            s = _g[_f];
                            if (cursorY < 60)
                                break;
                            lines = wrapText("\u25B3  ".concat(s), width - 90, 9, font);
                            for (_h = 0, lines_2 = lines; _h < lines_2.length; _h++) {
                                ln = lines_2[_h];
                                page.drawText(ln, { x: 50, y: cursorY, size: 9, font: font, color: DARK_COLOR });
                                cursorY -= 13;
                            }
                        }
                        cursorY -= 8;
                    }
                    // ── Evaluation events table ───────────────────────────────────────────────────
                    if (data.evaluationEvents.length > 0 && cursorY > 100) {
                        cursorY = sectionLabel("QUESTION-BY-QUESTION EVALUATION", cursorY, DARK_COLOR);
                        for (_j = 0, _k = data.evaluationEvents; _j < _k.length; _j++) {
                            ev = _k[_j];
                            if (cursorY < 80)
                                break;
                            qLines = wrapText("Q: ".concat(ev.question), width - 100, 8.5, font);
                            fbLines = wrapText("   ".concat(ev.feedback), width - 100, 8, font);
                            page.drawText("Score: ".concat(ev.score, "/10"), { x: rightEdge - 60, y: cursorY, size: 8, font: boldFont, color: BRAND_COLOR });
                            for (_l = 0, qLines_1 = qLines; _l < qLines_1.length; _l++) {
                                ln = qLines_1[_l];
                                if (cursorY < 60)
                                    break;
                                page.drawText(ln, { x: 40, y: cursorY, size: 8.5, font: boldFont, color: DARK_COLOR });
                                cursorY -= 13;
                            }
                            for (_m = 0, fbLines_1 = fbLines; _m < fbLines_1.length; _m++) {
                                ln = fbLines_1[_m];
                                if (cursorY < 60)
                                    break;
                                page.drawText(ln, { x: 40, y: cursorY, size: 8, font: font, color: GRAY_COLOR });
                                cursorY -= 12;
                            }
                            page.drawLine({ start: { x: 40, y: cursorY - 4 }, end: { x: width - 40, y: cursorY - 4 }, thickness: 0.3, color: LIGHT_GRAY });
                            cursorY -= 14;
                        }
                    }
                    _r.label = 13;
                case 13:
                    _r.trys.push([13, 20, , 21]);
                    return [4 /*yield*/, Promise.resolve().then(function () { return require("fs"); })];
                case 14:
                    fs = _r.sent();
                    return [4 /*yield*/, Promise.resolve().then(function () { return require("path"); })];
                case 15:
                    path = _r.sent();
                    _s = "sharp";
                    return [4 /*yield*/, Promise.resolve("".concat(_s)).then(function (s) { return require(s); })];
                case 16:
                    sharp = _r.sent();
                    logoAvifPath = path.join(process.cwd(), "public", "logo.avif");
                    if (!fs.existsSync(logoAvifPath)) return [3 /*break*/, 19];
                    return [4 /*yield*/, sharp.default(fs.readFileSync(logoAvifPath)).png().toBuffer()];
                case 17:
                    pngBuffer = _r.sent();
                    return [4 /*yield*/, pdfDoc.embedPng(pngBuffer)];
                case 18:
                    img = _r.sent();
                    logoW = 250;
                    logoH = (img.height / img.width) * logoW;
                    page.drawImage(img, { x: (width - logoW) / 2, y: (height - logoH) / 2 - 20, width: logoW, height: logoH, opacity: 0.04 });
                    _r.label = 19;
                case 19: return [3 /*break*/, 21];
                case 20:
                    _o = _r.sent();
                    return [3 /*break*/, 21];
                case 21:
                    // ── Footer ───────────────────────────────────────────────────────────────────
                    page.drawLine({ start: { x: 50, y: 100 }, end: { x: width - 50, y: 100 }, thickness: 1, color: LIGHT_GRAY });
                    page.drawText("JB Recruitment Solutions — Mock Interview Performance Report", { x: 50, y: 80, size: 9, font: boldFont, color: DARK_COLOR });
                    page.drawText("This report was auto-generated following the completion of your AI mock interview session.", { x: 50, y: 63, size: 7.5, font: font, color: GRAY_COLOR });
                    page.drawText("juhi@jbrecruitments.com   |   jbrecruitments.com", { x: 50, y: 46, size: 7.5, font: font, color: GRAY_COLOR });
                    page.drawRectangle({ x: 0, y: 0, width: width, height: 8, color: BRAND_COLOR });
                    _q = (_p = Buffer).from;
                    return [4 /*yield*/, pdfDoc.save()];
                case 22: return [2 /*return*/, _q.apply(_p, [_r.sent()])];
            }
        });
    });
}
