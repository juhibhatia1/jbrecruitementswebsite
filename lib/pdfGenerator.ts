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
    const fs   = await import("fs");
    const path = await import("path");
    const sharp = await import("sharp");

    const logoAvifPath = path.join(process.cwd(), "public", "logo.avif");
    if (fs.existsSync(logoAvifPath)) {
      const avifBuffer = fs.readFileSync(logoAvifPath);
      const pngBuffer  = await sharp.default(avifBuffer).png().toBuffer();
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
  const companyEmail = "juhi@jbrecruitments.com";
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
  const receiptNo  = `#${purchase.id.slice(0, 14).toUpperCase()}`;
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
  const pricingCatalog: Record<string, number> = {
    "Resume Review & Rewriting": 80,
    "Cover Letter Writing": 50,
    "LinkedIn Optimization": 80,
    "Superstar Shout-Out": 160,
    "Ask Me Anything": 40,
    "Interview Prep": 100,
    "All Career Services Bundle": 480,
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

    page.drawText(purchase.currency.toUpperCase(), {
      x: 350,
      y: currentY + 8,
      size: 10,
      font,
      color: DARK_COLOR,
    });

    const itemPrice = pricingCatalog[item] || (purchase.amount / items.length);
    page.drawText(`${itemPrice.toFixed(2)}`, {
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
