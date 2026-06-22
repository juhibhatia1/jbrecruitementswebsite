import { generateReceiptPdf } from "../lib/pdfGenerator.js";
import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function generateSample() {
  const purchase = {
    id: "ch_sample_receipt_12345",
    candidateName: "John Doe",
    candidateEmail: "john.doe@example.com",
    serviceName: "Resume Review & Rewriting + Cover Letter Writing",
    amount: 130.00,
    currency: "usd",
    createdAt: new Date(),
  };

  console.log("Generating sample PDF using lib/pdfGenerator.ts...");
  const pdfBuffer = await generateReceiptPdf(purchase);
  const outputPath = path.join(__dirname, "../sample_receipt.pdf");
  fs.writeFileSync(outputPath, pdfBuffer);
  console.log(`Successfully generated sample PDF at: ${outputPath}`);
}

generateSample().catch(console.error);
