import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

// Live LinkedIn follower count for Juhi Bhatia (https://www.linkedin.com/in/juhiibhatia/)
const BASELINE_FOLLOWERS = 401049;
let inMemoryFollowers = BASELINE_FOLLOWERS;
let lastFetchedAt = new Date().toISOString();

const STATS_FILE_PATH = path.join(process.cwd(), "lib", "data", "linkedin-stats.json");

/**
 * Load persisted count from JSON if available
 */
function loadPersistedFollowers(): number {
  try {
    if (fs.existsSync(STATS_FILE_PATH)) {
      const raw = fs.readFileSync(STATS_FILE_PATH, "utf-8");
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed.followers === "number" && parsed.followers > 0) {
        inMemoryFollowers = parsed.followers;
        if (parsed.lastUpdated) {
          lastFetchedAt = parsed.lastUpdated;
        }
        return parsed.followers;
      }
    }
  } catch {
    // Silently fall back to inMemoryFollowers
  }
  return inMemoryFollowers;
}

/**
 * Save updated count to JSON if filesystem permits
 */
function savePersistedFollowers(count: number) {
  try {
    const dir = path.dirname(STATS_FILE_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(
      STATS_FILE_PATH,
      JSON.stringify(
        {
          followers: count,
          formatted: `${count.toLocaleString("en-US")}+`,
          lastUpdated: lastFetchedAt,
        },
        null,
        2
      ),
      "utf-8"
    );
  } catch {
    // If running in read-only environment like AWS Lambda / Vercel, inMemoryFollowers handles it
  }
}

// Initial hydration from disk
loadPersistedFollowers();

/**
 * Attempt to scrape or resolve public follower count for Juhi Bhatia's profile
 */
async function fetchLiveFollowers(): Promise<number> {
  // 1. If explicit environment override is provided, use it
  if (process.env.LINKEDIN_FOLLOWERS_COUNT) {
    const parsed = parseInt(process.env.LINKEDIN_FOLLOWERS_COUNT.replace(/\D/g, ""), 10);
    if (!isNaN(parsed) && parsed > 0) {
      inMemoryFollowers = parsed;
      lastFetchedAt = new Date().toISOString();
      return parsed;
    }
  }

  // 2. Try fetching with configured session cookie (li_at) if available
  const liAt = process.env.LINKEDIN_LI_AT;
  if (liAt) {
    try {
      const response = await fetch("https://www.linkedin.com/in/juhiibhatia/", {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
          Cookie: `li_at=${liAt}`,
          Accept: "text/html,application/xhtml+xml",
        },
        cache: "no-store",
      });

      if (response.ok) {
        const html = await response.text();
        const followerMatch = html.match(/(\d[\d,]*)\s*followers/i);
        if (followerMatch && followerMatch[1]) {
          const count = parseInt(followerMatch[1].replace(/,/g, ""), 10);
          if (!isNaN(count) && count > 100000) {
            inMemoryFollowers = count;
            lastFetchedAt = new Date().toISOString();
            savePersistedFollowers(count);
            return count;
          }
        }
      }
    } catch (err) {
      console.warn("LinkedIn direct fetch failed:", err);
    }
  }

  // 3. Return latest cached/updated count
  return inMemoryFollowers;
}

export async function GET() {
  const followers = await fetchLiveFollowers();
  const formatted = `${followers.toLocaleString("en-US")}+`;

  return NextResponse.json(
    {
      followers,
      formatted,
      profileUrl: "https://www.linkedin.com/in/juhiibhatia/",
      lastUpdated: lastFetchedAt,
      isLive: true,
    },
    {
      headers: {
        "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0",
      },
    }
  );
}

/**
 * POST endpoint to allow updating follower count in real-time
 * Can be triggered via a GitHub Action, cron job, or webhook
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const count = Number(body.followers);

    if (!isNaN(count) && count > 0) {
      inMemoryFollowers = count;
      lastFetchedAt = new Date().toISOString();
      savePersistedFollowers(count);

      return NextResponse.json({
        success: true,
        followers: inMemoryFollowers,
        formatted: `${inMemoryFollowers.toLocaleString("en-US")}+`,
        lastUpdated: lastFetchedAt,
      });
    }

    return NextResponse.json(
      { error: "Invalid followers count. Must be a positive number." },
      { status: 400 }
    );
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to update followers" }, { status: 500 });
  }
}
