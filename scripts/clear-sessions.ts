import { prisma } from "../lib/prisma";

async function main() {
  const r = await prisma.interviewSession.deleteMany({
    where: { status: { notIn: ["COMPLETED"] } },
  });
  console.log("Deleted sessions:", r.count);
  await prisma.$disconnect();
}

main().catch(console.error);
