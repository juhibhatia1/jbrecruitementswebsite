import dotenv from "dotenv";
import path from "path";

const dev = process.argv.includes("--dev");

if (dev) {
  // Force development environment
  (process.env as any).NODE_ENV = "development";

  // Explicitly load .env.local and override existing env vars
  dotenv.config({
    path: path.resolve(process.cwd(), ".env.local"),
    override: true,
  });

  // Also load .env as a fallback for variables not in .env.local
  dotenv.config({
    path: path.resolve(process.cwd(), ".env"),
  });
}
