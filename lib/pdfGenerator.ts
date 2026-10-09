import { PDFDocument, PDFImage, PDFPage, rgb, StandardFonts } from "pdf-lib";
import { MULTI_CURRENCY_PRICING, type Currency } from "@/lib/rag/system-context";
import fs from "fs";
import path from "path";

const BRAND_COLOR = rgb(0.353, 0.345, 0.671); // #5a58ab
const DARK_COLOR = rgb(0.145, 0.18, 0.239);   // #252e3d
const GRAY_COLOR = rgb(0.44, 0.52, 0.6);      // muted gray
const LIGHT_GRAY = rgb(0.93, 0.94, 0.96);
const WHITE = rgb(1, 1, 1);
const GREEN = rgb(0.08, 0.627, 0.376);         // #15a060

export async function generateReceiptPdf(purchase: {
  id: string;
  candidateName: string;
  candidateEmail: string;
  serviceName: string;
  amount: number;
  currency: string;
  createdAt: Date;
  gatewayTransactionId?: string | null;
}) {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([595, 842]); // A4 portrait
  const { width, height } = page.getSize();

  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  // ═══════════════════════════════════════════════════════════════════════════
  // ENTERPRISE HEADER — Zone 1: Dark top band with logo (left) + company (right)
  // ═══════════════════════════════════════════════════════════════════════════
  const headerBandH = 100;
  const accentBarH  = 36;
  const HEADER_DARK = rgb(0.102, 0.122, 0.169); // #1a1f2b deep navy

  page.drawRectangle({
    x: 0,
    y: height - headerBandH,
    width,
    height: headerBandH,
    color: HEADER_DARK,
  });

  // Subtle bottom border on the dark band (brand color, 2px)
  page.drawRectangle({
    x: 0,
    y: height - headerBandH - 2,
    width,
    height: 2,
    color: BRAND_COLOR,
  });

  // ── Logo (left-aligned, vertically centered in dark band) ─────────────────
  try {
    const logoPngPath = path.join(process.cwd(), "public", "logo.png");
    if (fs.existsSync(logoPngPath)) {
      const pngBuffer  = fs.readFileSync(logoPngPath);
      const logoImg    = await pdfDoc.embedPng(pngBuffer);

      // Target height = 52px, compute width proportionally
      const targetH  = 52;
      const targetW  = (logoImg.width / logoImg.height) * targetH;
      const logoX    = 40;
      const logoY    = height - headerBandH + (headerBandH - targetH) / 2;

      page.drawImage(logoImg, {
        x: logoX,
        y: logoY,
        width: targetW,
        height: targetH,
        opacity: 1,
      });
    }
  } catch (logoError) {
    console.error("Could not render header logo:", logoError);
  }

  // ── Company info (right-aligned, vertically stacked in dark band) ──────────
  const companyName  = "JB Recruitment Solutions";
  const companyEmail = "contact@jbrecruitments.com";
  const companyWeb   = "jbrecruitments.com";

  const companyNameSize  = 11;
  const companyInfoSize  = 8;
  const companyNameW = boldFont.widthOfTextAtSize(companyName, companyNameSize);
  const companyEmailW = font.widthOfTextAtSize(companyEmail, companyInfoSize);
  const companyWebW   = font.widthOfTextAtSize(companyWeb, companyInfoSize);

  const rightEdge = width - 40;

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
    font,
    color: rgb(0.65, 0.70, 0.80),
  });

  page.drawText(companyWeb, {
    x: rightEdge - companyWebW,
    y: height - 66,
    size: companyInfoSize,
    font,
    color: rgb(0.65, 0.70, 0.80),
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // Zone 2: Brand-color accent bar — "PAYMENT RECEIPT" left, Receipt# right
  // ═══════════════════════════════════════════════════════════════════════════
  const accentBarY = height - headerBandH - 2 - accentBarH;

  page.drawRectangle({
    x: 0,
    y: accentBarY,
    width,
    height: accentBarH,
    color: BRAND_COLOR,
  });

  const receiptTitle = "PAYMENT RECEIPT";
  const titleSize    = 11;
  page.drawText(receiptTitle, {
    x: 40,
    y: accentBarY + (accentBarH - titleSize) / 2,
    size: titleSize,
    font: boldFont,
    color: WHITE,
  });

  const receiptDate = new Date(purchase.createdAt).toLocaleDateString("en-US", {
    year: "numeric", month: "long", day: "numeric",
  });
  const receiptReference = (purchase.gatewayTransactionId || purchase.id).toUpperCase();
  const receiptNo  = `#${receiptReference}`;
  const rightInfoText = `${receiptNo}   ·   ${receiptDate}`;
  const rightInfoSize = 8;
  const rightInfoW    = font.widthOfTextAtSize(rightInfoText, rightInfoSize);

  page.drawText(rightInfoText, {
    x: rightEdge - rightInfoW,
    y: accentBarY + (accentBarH - rightInfoSize) / 2 + 1,
    size: rightInfoSize,
    font,
    color: rgb(0.85, 0.88, 1.0),
  });

  // ─── RECEIPT INFO CARD ──────────────────────────────────────────────────────
  const sectionY   = accentBarY - 50;
  const cardH      = 75;
  const cardY      = sectionY - cardH + 12;

  // Light card background
  page.drawRectangle({
    x: 40,
    y: cardY,
    width: width - 80,
    height: cardH,
    color: rgb(0.973, 0.976, 0.984), // #f8f9fb
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
    font,
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

  // Green PAID pill badge
  const badgeW   = 58;
  const badgeH   = 22;
  const badgeX   = 390;
  const badgeY   = sectionY - 38;

  page.drawRectangle({
    x: badgeX,
    y: badgeY,
    width: badgeW,
    height: badgeH,
    color: rgb(0.878, 0.973, 0.925),
    borderColor: GREEN,
    borderWidth: 1,
  });

  const paidText     = "PAID";
  const paidTextSize = 9;
  const paidTextW    = boldFont.widthOfTextAtSize(paidText, paidTextSize);
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

  // ─── SERVICE TABLE HEADER ────────────────────────────────────────────────────
  const tableY = sectionY - 125;

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

  // ─── TABLE ROWS (Itemized Listing) ──────────────────────────────────────────
  const items = purchase.serviceName.split(" + ");

  // Use MULTI_CURRENCY_PRICING for correct per-currency line item amounts.
  // Fall back to evenly splitting purchase.amount if a service isn't found.
  const currency = (purchase.currency || "USD").toUpperCase() as Currency;
  const getItemPrice = (itemName: string): number => {
    const row = MULTI_CURRENCY_PRICING[itemName];
    if (row && row[currency] !== undefined) return row[currency];
    // Fallback: split total evenly across all items
    return purchase.amount / items.length;
  };

  let currentY = tableY - 35;
  for (const item of items) {
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
      font,
      color: GRAY_COLOR,
    });

    page.drawText(currency, {
      x: 350,
      y: currentY + 8,
      size: 10,
      font,
      color: DARK_COLOR,
    });

    const itemPrice = getItemPrice(item);
    page.drawText(`${itemPrice.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, {
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

  // ─── TOTALS SECTION ─────────────────────────────────────────────────────────
  // Total block with brand background
  const totalBoxWidth = 185;
  const totalBoxHeight = 35;
  const totalBoxX = 360;
  const totalBoxY = currentY - 15;

  page.drawRectangle({
    x: totalBoxX,
    y: totalBoxY,
    width: totalBoxWidth,
    height: totalBoxHeight,
    color: BRAND_COLOR,
  });

  const totalLabel = "TOTAL PAID";
  const totalValText = `${purchase.amount.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${currency}`;
  const totalValSize = 10;

  // Let's draw them horizontally aligned or vertically stacked nicely centered
  const combinedText = `${totalLabel}:  ${totalValText}`;
  const combinedWidth = boldFont.widthOfTextAtSize(combinedText, totalValSize);

  page.drawText(combinedText, {
    x: totalBoxX + (totalBoxWidth - combinedWidth) / 2,
    y: totalBoxY + (totalBoxHeight - totalValSize) / 2,
    size: totalValSize,
    font: boldFont,
    color: WHITE,
  });

  // ─── WATERMARK LOGO ─────────────────────────────────────────────────────────
  try {
    const publicDir = path.join(process.cwd(), "public");
    const logoPngPath = path.join(publicDir, "logo.png");
    
    if (fs.existsSync(logoPngPath)) {
      const pngBuffer = fs.readFileSync(logoPngPath);
      const embeddedImage = await pdfDoc.embedPng(pngBuffer);
      
      const logoWidth = 250;
      const logoHeight = (embeddedImage.height / embeddedImage.width) * logoWidth;
      
      page.drawImage(embeddedImage, {
        x: (width - logoWidth) / 2,
        y: (height - logoHeight) / 2 - 20,
        width: logoWidth,
        height: logoHeight,
        opacity: 0.05,
      });
    }
  } catch (watermarkError) {
    console.error("Could not render logo watermark, skipping:", watermarkError);
  }

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

  page.drawText(
    "This is an official computer-generated receipt and does not require a signature.",
    {
      x: 50,
      y: 63,
      size: 8,
      font,
      color: GRAY_COLOR,
    }
  );

  page.drawText("juhi@jbrecruitments.com   |   jbrecruitments.com", {
    x: 50,
    y: 46,
    size: 8,
    font,
    color: GRAY_COLOR,
  });

  // Footer brand accent
  page.drawRectangle({
    x: 0,
    y: 0,
    width,
    height: 8,
    color: BRAND_COLOR,
  });

  const pdfBytes = await pdfDoc.save();
  return Buffer.from(pdfBytes);
}

export async function generateInterviewReportPdf(data: {
  candidateName: string;
  candidateEmail: string;
  jobRole: string;
  completedAt: Date | null;
  finalScore: number | null;
  summary: string;
  strengths: string[];
  weaknesses?: string[];
  improvements: string[];
  evaluationEvents: Array<{
    question: string;
    answerSummary: string;
    score: number;
    feedback: string;
    improvementTip?: string;
  }>;
  transcript?: Array<{ role: string; text: string }>;
}) {
  const PAGE_W    = 595;
  const PAGE_H    = 842;
  const MARGIN    = 40;
  const CONTENT_W = PAGE_W - MARGIN * 2;
  const FOOTER_H  = 110;

  const pdfDoc   = await PDFDocument.create();
  const font     = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  const HEADER_DARK = rgb(0.102, 0.122, 0.169);
  const ORANGE      = rgb(0.98,  0.45,  0.09);
  const RED         = rgb(0.86,  0.15,  0.15);

  // Embed logo once for header + watermark reuse
  let logoImg: PDFImage | null = null;
  try {
    const logoPath = path.join(process.cwd(), "public", "logo.png");
    if (fs.existsSync(logoPath)) {
      const buf = fs.readFileSync(logoPath);
      logoImg   = await pdfDoc.embedPng(buf);
    }
  } catch { /* skip */ }

  // ── Mutable page state shared by all closures ─────────────────────────────────
  let page    = pdfDoc.addPage([PAGE_W, PAGE_H]);
  let cursorY = PAGE_H;

  const drawPageFooter = (pg: PDFPage) => {
    pg.drawLine({ start: { x: 50, y: 100 }, end: { x: PAGE_W - 50, y: 100 }, thickness: 1, color: LIGHT_GRAY });
    pg.drawText("JB Recruitment Solutions — Mock Interview Performance Report",
      { x: 50, y: 80, size: 9, font: boldFont, color: DARK_COLOR });
    pg.drawText("This report was auto-generated following the completion of your AI mock interview session.",
      { x: 50, y: 63, size: 7.5, font, color: GRAY_COLOR });
    pg.drawText("juhi@jbrecruitments.com   |   jbrecruitments.com",
      { x: 50, y: 46, size: 7.5, font, color: GRAY_COLOR });
    pg.drawRectangle({ x: 0, y: 0, width: PAGE_W, height: 8, color: BRAND_COLOR });
  };

  const addContinuationPage = () => {
    drawPageFooter(page);
    page = pdfDoc.addPage([PAGE_W, PAGE_H]);
    page.drawRectangle({ x: 0, y: PAGE_H - 26, width: PAGE_W, height: 26, color: BRAND_COLOR });
    page.drawText("MOCK INTERVIEW PERFORMANCE REPORT  ·  continued",
      { x: MARGIN, y: PAGE_H - 18, size: 8, font: boldFont, color: WHITE });
    cursorY = PAGE_H - 42;
  };

  const ensureSpace = (needed: number) => {
    if (cursorY - needed < FOOTER_H) addContinuationPage();
  };

  // WinAnsi (pdf-lib default) only covers U+0020–U+00FF — strip everything outside that
  const toWinAnsi = (text: string) =>
    text
      .replace(/[\r\n\t\x00-\x1F\x7F]/g, " ")
      .replace(/[^\x20-\xFF]/g, "?")
      .replace(/ {2,}/g, " ")
      .trim();

  const wrapText = (text: string, maxW: number, size: number, f: typeof font): string[] => {
    const clean = toWinAnsi(text);
    const words = clean.split(" ");
    const lines: string[] = [];
    let line = "";
    for (const word of words) {
      if (!word) continue;
      const test = line ? `${line} ${word}` : word;
      if (f.widthOfTextAtSize(test, size) > maxW) {
        if (line) lines.push(line);
        line = word;
      } else line = test;
    }
    if (line) lines.push(line);
    return lines;
  };

  const sectionLabel = (label: string, color: typeof DARK_COLOR) => {
    ensureSpace(40);
    page.drawText(label, { x: MARGIN, y: cursorY, size: 9, font: boldFont, color });
    page.drawLine({
      start: { x: MARGIN, y: cursorY - 4 }, end: { x: PAGE_W - MARGIN, y: cursorY - 4 },
      thickness: 0.5, color: LIGHT_GRAY,
    });
    cursorY -= 20;
  };

  // ── First-page header ─────────────────────────────────────────────────────────
  const headerBandH = 100;
  const accentBarH  = 36;
  const rightEdge   = PAGE_W - 40;

  page.drawRectangle({ x: 0, y: PAGE_H - headerBandH, width: PAGE_W, height: headerBandH, color: HEADER_DARK });
  page.drawRectangle({ x: 0, y: PAGE_H - headerBandH - 2, width: PAGE_W, height: 2, color: BRAND_COLOR });

  if (logoImg) {
    const targetH = 52;
    const targetW = (logoImg.width / logoImg.height) * targetH;
    page.drawImage(logoImg, {
      x: 40, y: PAGE_H - headerBandH + (headerBandH - targetH) / 2,
      width: targetW, height: targetH,
    });
  }

  const companyName  = "JB Recruitment Solutions";
  const companyEmail = "contact@jbrecruitments.com";
  page.drawText(companyName,
    { x: rightEdge - boldFont.widthOfTextAtSize(companyName, 11), y: PAGE_H - 34, size: 11, font: boldFont, color: WHITE });
  page.drawText(companyEmail,
    { x: rightEdge - font.widthOfTextAtSize(companyEmail, 8), y: PAGE_H - 52, size: 8, font, color: rgb(0.65, 0.70, 0.80) });
  page.drawText("jbrecruitments.com",
    { x: rightEdge - font.widthOfTextAtSize("jbrecruitments.com", 8), y: PAGE_H - 66, size: 8, font, color: rgb(0.65, 0.70, 0.80) });

  const accentBarY = PAGE_H - headerBandH - 2 - accentBarH;
  page.drawRectangle({ x: 0, y: accentBarY, width: PAGE_W, height: accentBarH, color: BRAND_COLOR });
  page.drawText("MOCK INTERVIEW PERFORMANCE REPORT",
    { x: 40, y: accentBarY + (accentBarH - 11) / 2, size: 11, font: boldFont, color: WHITE });
  if (data.completedAt) {
    const dateText = new Date(data.completedAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
    page.drawText(dateText, {
      x: rightEdge - font.widthOfTextAtSize(dateText, 8),
      y: accentBarY + (accentBarH - 8) / 2 + 1,
      size: 8, font, color: rgb(0.85, 0.88, 1.0),
    });
  }

  const cardTopY  = accentBarY - 20;
  const cardH     = 70;
  const cardBodyY = cardTopY - cardH;
  page.drawRectangle({ x: 40, y: cardBodyY, width: PAGE_W - 80, height: cardH, color: rgb(0.973, 0.976, 0.984) });
  page.drawRectangle({ x: 40, y: cardBodyY, width: 3, height: cardH, color: BRAND_COLOR });
  page.drawText("CANDIDATE",         { x: 56, y: cardTopY - 8,  size: 7.5, font: boldFont, color: GRAY_COLOR });
  page.drawText(toWinAnsi(data.candidateName),  { x: 56, y: cardTopY - 22, size: 12,  font: boldFont, color: DARK_COLOR });
  page.drawText(toWinAnsi(data.candidateEmail), { x: 56, y: cardTopY - 36, size: 9,   font,           color: GRAY_COLOR });
  page.drawText(toWinAnsi(data.jobRole),        { x: 56, y: cardTopY - 50, size: 9,   font,           color: GRAY_COLOR });

  if (data.finalScore !== null) {
    const sbX = rightEdge - 60;
    const sbY = cardBodyY + 10;
    page.drawRectangle({ x: sbX, y: sbY, width: 60, height: 50, color: BRAND_COLOR });
    const scoreStr = `${data.finalScore}`;
    page.drawText(scoreStr,
      { x: sbX + (60 - boldFont.widthOfTextAtSize(scoreStr, 20)) / 2, y: sbY + 26, size: 20, font: boldFont, color: WHITE });
    page.drawText("SCORE",
      { x: sbX + (60 - boldFont.widthOfTextAtSize("SCORE", 7)) / 2, y: sbY + 12, size: 7, font: boldFont, color: rgb(0.85, 0.88, 1.0) });
  }

  // Watermark on first page only
  if (logoImg) {
    const logoW = 250;
    const logoH = (logoImg.height / logoImg.width) * logoW;
    page.drawImage(logoImg, {
      x: (PAGE_W - logoW) / 2, y: (PAGE_H - logoH) / 2 - 20,
      width: logoW, height: logoH, opacity: 0.04,
    });
  }

  cursorY = cardBodyY - 24;

  // ── Summary ───────────────────────────────────────────────────────────────────
  sectionLabel("SUMMARY", DARK_COLOR);
  for (const ln of wrapText(data.summary, CONTENT_W, 9, font)) {
    ensureSpace(18);
    page.drawText(ln, { x: MARGIN, y: cursorY, size: 9, font, color: DARK_COLOR });
    cursorY -= 14;
  }
  cursorY -= 10;

  // ── Improvements ─────────────────────────────────────────────────────────────
  if (data.improvements.length > 0) {
    sectionLabel("YOUR IMPROVEMENT PLAN — FOCUS ON THESE", ORANGE);
    let idx = 1;
    for (const s of data.improvements) {
      for (const ln of wrapText(`${idx++}.  ${s}`, CONTENT_W - 10, 9, font)) {
        ensureSpace(17);
        page.drawText(ln, { x: MARGIN + 10, y: cursorY, size: 9, font, color: DARK_COLOR });
        cursorY -= 13;
      }
    }
    cursorY -= 8;
  }

  // ── Weaknesses ────────────────────────────────────────────────────────────────
  const weaknesses = data.weaknesses ?? [];
  if (weaknesses.length > 0) {
    sectionLabel("OBSERVED WEAKNESSES", RED);
    for (const s of weaknesses) {
      for (const ln of wrapText(`x  ${s}`, CONTENT_W - 10, 9, font)) {
        ensureSpace(17);
        page.drawText(ln, { x: MARGIN + 10, y: cursorY, size: 9, font, color: DARK_COLOR });
        cursorY -= 13;
      }
    }
    cursorY -= 8;
  }

  // ── Strengths ─────────────────────────────────────────────────────────────────
  if (data.strengths.length > 0) {
    sectionLabel("STRENGTHS", GREEN);
    for (const s of data.strengths) {
      for (const ln of wrapText(`+  ${s}`, CONTENT_W - 10, 9, font)) {
        ensureSpace(17);
        page.drawText(ln, { x: MARGIN + 10, y: cursorY, size: 9, font, color: DARK_COLOR });
        cursorY -= 13;
      }
    }
    cursorY -= 8;
  }

  // ── Question-by-question evaluation ──────────────────────────────────────────
  if (data.evaluationEvents.length > 0) {
    sectionLabel("QUESTION-BY-QUESTION EVALUATION", DARK_COLOR);
    for (const ev of data.evaluationEvents) {
      const scoreColor = ev.score >= 8 ? GREEN : ev.score >= 6 ? rgb(0.8, 0.5, 0.1) : RED;
      const qLines   = wrapText(`Q: ${ev.question}`,      CONTENT_W - 65, 8.5, boldFont);
      const ansLines = wrapText(`A: ${ev.answerSummary}`, CONTENT_W,      8,   font);
      const fbLines  = wrapText(`   ${ev.feedback}`,      CONTENT_W,      8,   font);
      const tipLines = ev.improvementTip
        ? wrapText(`   Tip: ${ev.improvementTip}`, CONTENT_W, 7.5, boldFont)
        : [];

      ensureSpace(28);
      page.drawText(`Score: ${ev.score}/10`,
        { x: PAGE_W - MARGIN - 60, y: cursorY, size: 8, font: boldFont, color: scoreColor });

      for (const ln of qLines)   { ensureSpace(17); page.drawText(ln, { x: MARGIN, y: cursorY, size: 8.5, font: boldFont, color: DARK_COLOR }); cursorY -= 13; }
      for (const ln of ansLines) { ensureSpace(16); page.drawText(ln, { x: MARGIN, y: cursorY, size: 8,   font,           color: GRAY_COLOR  }); cursorY -= 12; }
      for (const ln of fbLines)  { ensureSpace(16); page.drawText(ln, { x: MARGIN, y: cursorY, size: 8,   font,           color: GRAY_COLOR  }); cursorY -= 12; }
      for (const ln of tipLines) { ensureSpace(15); page.drawText(ln, { x: MARGIN, y: cursorY, size: 7.5, font: boldFont, color: rgb(0.7, 0.35, 0.05) }); cursorY -= 11; }

      ensureSpace(18);
      page.drawLine({
        start: { x: MARGIN, y: cursorY - 4 }, end: { x: PAGE_W - MARGIN, y: cursorY - 4 },
        thickness: 0.3, color: LIGHT_GRAY,
      });
      cursorY -= 14;
    }
    cursorY -= 6;
  }

  // ── Full interview transcript ─────────────────────────────────────────────────
  const transcript = data.transcript ?? [];
  if (transcript.length > 0) {
    sectionLabel("FULL INTERVIEW TRANSCRIPT", DARK_COLOR);
    for (const entry of transcript) {
      const isAI      = entry.role === "model";
      const roleLabel = isAI ? "AI Interviewer" : "Candidate";
      const roleColor = isAI ? BRAND_COLOR : DARK_COLOR;
      const lines     = wrapText(entry.text, CONTENT_W - 10, 8, font);

      ensureSpace(24);
      page.drawText(roleLabel, { x: MARGIN, y: cursorY, size: 7.5, font: boldFont, color: roleColor });
      cursorY -= 12;
      for (const ln of lines) {
        ensureSpace(14);
        page.drawText(ln, { x: MARGIN + 10, y: cursorY, size: 8, font, color: GRAY_COLOR });
        cursorY -= 12;
      }
      cursorY -= 4;
    }
  }

  drawPageFooter(page);
  return Buffer.from(await pdfDoc.save());
}
