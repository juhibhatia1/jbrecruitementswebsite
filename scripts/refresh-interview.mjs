/**
 * Refresh an interview access token by application ID.
 *
 * Usage:
 *   node scripts/refresh-interview.mjs <applicationId>
 *
 * Example:
 *   node scripts/refresh-interview.mjs cms6b79d80003atgcrzobg2cy
 */

import { config } from 'dotenv';
import { createHash, randomBytes } from 'crypto';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
config({ path: resolve(__dirname, '../.env') });

// Dynamic import after env is loaded
const { PrismaClient } = (await import('../lib/prisma-client/index.js')).default
  ?? (await import('../lib/prisma-client/index.js'));

const TOKEN_EXPIRY_DAYS = 7;
const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
const applicationId = process.argv[2];

if (!applicationId) {
  console.error('\n  Usage: node scripts/refresh-interview.mjs <applicationId>\n');
  process.exit(1);
}

function generateToken() {
  return randomBytes(32).toString('base64url');
}

function hashToken(token) {
  const secret = process.env.INTERVIEW_TOKEN_SECRET;
  if (!secret) throw new Error('Missing INTERVIEW_TOKEN_SECRET in .env');
  return createHash('sha256').update(`${secret}:${token}`).digest('hex');
}

const prisma = new PrismaClient();

try {
  const app = await prisma.candidateApplication.findUnique({
    where: { id: applicationId },
    select: {
      id: true,
      candidateName: true,
      candidateEmail: true,
      interviewPreference: true,
      status: true,
      template: { select: { jobRole: true } },
    },
  });

  if (!app) {
    console.error(`\n  ✗ No application found with ID: ${applicationId}\n`);
    process.exit(1);
  }

  if (app.interviewPreference !== 'AI') {
    console.error(`\n  ✗ This application uses MANUAL preference — no token to refresh.\n`);
    process.exit(1);
  }

  const newToken    = generateToken();
  const newHash     = hashToken(newToken);
  const expiresAt   = new Date(Date.now() + TOKEN_EXPIRY_DAYS * 24 * 60 * 60 * 1000);

  // Delete the completed session so the candidate can retake the interview
  await prisma.interviewSession.deleteMany({
    where: { applicationId },
  });

  await prisma.candidateApplication.update({
    where: { id: applicationId },
    data: {
      accessTokenHash:      newHash,
      accessTokenExpiresAt: expiresAt,
      status:               'AI_INVITED',
    },
  });

  console.log('\n  ✓ Token refreshed!\n');
  console.log(`  Candidate  : ${app.candidateName} (${app.candidateEmail})`);
  console.log(`  Job Role   : ${app.template.jobRole}`);
  console.log(`  Old Status : ${app.status}  →  New Status : AI_INVITED`);
  console.log(`  Expires    : ${expiresAt.toUTCString()}`);
  console.log(`\n  ┌─ Interview URL ──────────────────────────────────────────────────`);
  console.log(`  │  ${BASE_URL}/interview/${newToken}`);
  console.log(`  └─────────────────────────────────────────────────────────────────\n`);

} catch (err) {
  console.error('\n  ✗ Error:', err.message, '\n');
  process.exit(1);
} finally {
  await prisma.$disconnect();
}
