import fs from "fs";
import path from "path";
import sharp from "sharp";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PUBLIC_DIR = path.resolve(__dirname, "../public");
const EXTENSIONS = [".jpg", ".jpeg", ".png", ".webp"];

async function convertImages(dir) {
  const files = fs.readdirSync(dir);

  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      await convertImages(filePath);
    } else {
      const ext = path.extname(file).toLowerCase();
      if (EXTENSIONS.includes(ext)) {
        const newFilePath = filePath.replace(ext, ".avif");
        console.log(`Converting: ${filePath} -> ${newFilePath}`);

        try {
          await sharp(filePath).avif({ quality: 80 }).toFile(newFilePath);

          // Verify the new file exists before deleting the old one
          if (fs.existsSync(newFilePath)) {
            fs.unlinkSync(filePath);
            console.log(`Deleted original: ${filePath}`);
          } else {
            console.error(`Failed to generate: ${newFilePath}`);
          }
        } catch (err) {
          console.error(`Error converting ${filePath}:`, err);
        }
      }
    }
  }
}

console.log("Starting image conversion...");
convertImages(PUBLIC_DIR)
  .then(() => {
    console.log("Conversion complete!");
  })
  .catch((err) => {
    console.error("Fatal error:", err);
  });
