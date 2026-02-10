import { testImapConnection } from "@/lib/imap.js";

export const runtime = "nodejs";

// Cache the auth status for 60 seconds to avoid hammering IMAP on every page load
let cachedStatus = null;
let cacheExpiry = 0;

export async function GET() {
  const now = Date.now();

  // Return cached result if still fresh
  if (cachedStatus && now < cacheExpiry) {
    return Response.json(cachedStatus);
  }

  // Test actual IMAP connection
  const result = await testImapConnection();

  const response = {
    authenticated: result.success,
    message: result.message
  };

  // Cache for 60 seconds
  cachedStatus = response;
  cacheExpiry = now + 60000;

  return Response.json(response);
}
