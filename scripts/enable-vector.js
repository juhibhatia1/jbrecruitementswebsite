const { PrismaClient } = require("@prisma/client");

async function main() {
  const prisma = new PrismaClient();
  console.log("Connecting to database to enable pgvector extension...");

  try {
    // Enable the pgvector extension
    await prisma.$executeRawUnsafe("CREATE EXTENSION IF NOT EXISTS vector;");
    console.log("Successfully enabled pgvector extension in Neon database! 🚀");
  } catch (error) {
    console.error("Failed to enable pgvector extension:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
