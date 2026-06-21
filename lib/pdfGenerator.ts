import { PDFDocument, rgb, StandardFonts } from "pdf-lib";

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
}) {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([595, 842]); // A4 portrait
  const { width, height } = page.getSize();

  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  // ─── HEADER BACKGROUND BLOCK ───────────────────────────────────────────────
  page.drawRectangle({
    x: 0,
    y: height - 130,
    width,
    height: 130,
    color: BRAND_COLOR,
  });





  // ─── "PAYMENT RECEIPT" (Centered) ─────────────────────────────────────────
  const receiptTitle = "PAYMENT RECEIPT";
  const titleSize = 16;
  const titleWidth = boldFont.widthOfTextAtSize(receiptTitle, titleSize);
  
  page.drawText(receiptTitle, {
    x: (width - titleWidth) / 2,
    y: height - 55,
    size: titleSize,
    font: boldFont,
    color: WHITE,
  });

  const receiptDate = new Date(purchase.createdAt).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const dateLabel = `Date: ${receiptDate}`;
  const dateSize = 10;
  const dateWidth = font.widthOfTextAtSize(dateLabel, dateSize);

  page.drawText(dateLabel, {
    x: (width - dateWidth) / 2,
    y: height - 76,
    size: dateSize,
    font,
    color: rgb(0.85, 0.85, 0.95),
  });

  // ─── RECEIPT INFO SECTION ───────────────────────────────────────────────────
  // Left column: Bill To
  const sectionY = height - 165;

  page.drawText("BILLED TO", {
    x: 50,
    y: sectionY,
    size: 9,
    font: boldFont,
    color: BRAND_COLOR,
  });

  page.drawText(purchase.candidateName, {
    x: 50,
    y: sectionY - 18,
    size: 12,
    font: boldFont,
    color: DARK_COLOR,
  });

  page.drawText(purchase.candidateEmail, {
    x: 50,
    y: sectionY - 35,
    size: 10,
    font,
    color: GRAY_COLOR,
  });

  // Right column: Receipt details
  page.drawText("RECEIPT NO.", {
    x: 390,
    y: sectionY,
    size: 9,
    font: boldFont,
    color: BRAND_COLOR,
  });

  page.drawText(`#${purchase.id.slice(0, 14).toUpperCase()}`, {
    x: 390,
    y: sectionY - 18,
    size: 11,
    font: boldFont,
    color: DARK_COLOR,
  });

  page.drawText("PAYMENT STATUS", {
    x: 390,
    y: sectionY - 45,
    size: 9,
    font: boldFont,
    color: BRAND_COLOR,
  });

  // Green PAID badge background
  const badgeWidth = 62;
  const badgeHeight = 20;
  const badgeX = 390;
  const badgeY = sectionY - 76;
  
  page.drawRectangle({
    x: badgeX,
    y: badgeY,
    width: badgeWidth,
    height: badgeHeight,
    color: rgb(0.88, 0.97, 0.93),
    borderColor: GREEN,
    borderWidth: 1,
  });

  const paidText = "PAID";
  const paidTextSize = 9;
  const paidTextWidth = boldFont.widthOfTextAtSize(paidText, paidTextSize);
  
  page.drawText(paidText, {
    x: badgeX + (badgeWidth - paidTextWidth) / 2,
    y: badgeY + (badgeHeight - paidTextSize) / 2 + 1.5,
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

  // ─── TABLE ROW ──────────────────────────────────────────────────────────────
  const rowY = tableY - 35;

  page.drawText(purchase.serviceName, {
    x: 62,
    y: rowY + 8,
    size: 11,
    font: boldFont,
    color: DARK_COLOR,
  });

  page.drawText("Professional career consulting service", {
    x: 62,
    y: rowY - 8,
    size: 9,
    font,
    color: GRAY_COLOR,
  });

  page.drawText(purchase.currency.toUpperCase(), {
    x: 350,
    y: rowY + 8,
    size: 11,
    font,
    color: DARK_COLOR,
  });

  page.drawText(`${purchase.amount.toFixed(2)}`, {
    x: 465,
    y: rowY + 8,
    size: 11,
    font: boldFont,
    color: DARK_COLOR,
  });

  // Row bottom border
  page.drawLine({
    start: { x: 50, y: rowY - 22 },
    end: { x: width - 50, y: rowY - 22 },
    thickness: 0.5,
    color: LIGHT_GRAY,
  });

  // ─── TOTALS SECTION ─────────────────────────────────────────────────────────
  const totalY = rowY - 40;

  // Total block with brand background
  const totalBoxWidth = 185;
  const totalBoxHeight = 35;
  const totalBoxX = 360;
  const totalBoxY = totalY - 35;

  page.drawRectangle({
    x: totalBoxX,
    y: totalBoxY,
    width: totalBoxWidth,
    height: totalBoxHeight,
    color: BRAND_COLOR,
  });

  const totalLabel = "TOTAL PAID";
  const totalLabelSize = 9;
  const totalValText = `${purchase.amount.toFixed(2)} ${purchase.currency.toUpperCase()}`;
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
    const fs = await import("fs");
    const path = await import("path");
    const sharp = await import("sharp");
    
    const publicDir = path.join(process.cwd(), "public");
    const logoAvifPath = path.join(publicDir, "logo.avif");
    
    if (fs.existsSync(logoAvifPath)) {
      const avifBuffer = fs.readFileSync(logoAvifPath);
      // pdf-lib does not support AVIF directly, so we convert it to PNG buffer using sharp
      const pngBuffer = await sharp.default(avifBuffer).png().toBuffer();
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

  page.drawText("contact@jbrecruitments.com   |   jbrecruitments.com", {
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
