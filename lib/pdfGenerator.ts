import { PDFDocument, rgb, StandardFonts } from "pdf-lib";

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
  const page = pdfDoc.addPage([600, 400]);
  const { width, height } = page.getSize();

  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  // Header Logo/Text
  page.drawText("JB RECRUITMENT SOLUTIONS", {
    x: 50,
    y: 350,
    size: 20,
    font: boldFont,
    color: rgb(0.23, 0.22, 0.45), // matching #5a58ab
  });

  page.drawText("PAYMENT RECEIPT", {
    x: 50,
    y: 325,
    size: 14,
    font: font,
    color: rgb(0.3, 0.3, 0.3),
  });

  // Divider line
  page.drawLine({
    start: { x: 50, y: 310 },
    end: { x: 550, y: 310 },
    thickness: 1,
    color: rgb(0.8, 0.8, 0.8),
  });

  // Details block
  const detailsY = 280;
  const lineSpacing = 22;

  page.drawText("Receipt ID:", { x: 50, y: detailsY, size: 11, font: boldFont });
  page.drawText(purchase.id, { x: 160, y: detailsY, size: 11, font });

  page.drawText("Date:", { x: 50, y: detailsY - lineSpacing, size: 11, font: boldFont });
  page.drawText(new Date(purchase.createdAt).toLocaleDateString(), { x: 160, y: detailsY - lineSpacing, size: 11, font });

  page.drawText("Candidate Name:", { x: 50, y: detailsY - lineSpacing * 2, size: 11, font: boldFont });
  page.drawText(purchase.candidateName, { x: 160, y: detailsY - lineSpacing * 2, size: 11, font });

  page.drawText("Candidate Email:", { x: 50, y: detailsY - lineSpacing * 3, size: 11, font: boldFont });
  page.drawText(purchase.candidateEmail, { x: 160, y: detailsY - lineSpacing * 3, size: 11, font });

  page.drawText("Service:", { x: 50, y: detailsY - lineSpacing * 4, size: 11, font: boldFont });
  page.drawText(purchase.serviceName, { x: 160, y: detailsY - lineSpacing * 4, size: 11, font });

  page.drawText("Amount Paid:", { x: 50, y: detailsY - lineSpacing * 5, size: 11, font: boldFont });
  page.drawText(`${purchase.amount} ${purchase.currency.toUpperCase()}`, { x: 160, y: detailsY - lineSpacing * 5, size: 11, font });

  // Footer divider
  page.drawLine({
    start: { x: 50, y: 120 },
    end: { x: 550, y: 120 },
    thickness: 1,
    color: rgb(0.8, 0.8, 0.8),
  });

  page.drawText("Thank you for choosing JB Recruitment Solutions!", {
    x: 50,
    y: 100,
    size: 10,
    font: font,
    color: rgb(0.4, 0.4, 0.4),
  });

  page.drawText("If you have any questions, please contact us at info@jbrecruitment.com", {
    x: 50,
    y: 85,
    size: 9,
    font: font,
    color: rgb(0.5, 0.5, 0.5),
  });

  const pdfBytes = await pdfDoc.save();
  return Buffer.from(pdfBytes);
}
