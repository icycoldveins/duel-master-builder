import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'

const RATE_LIMIT = 10; // requests per minute
const WINDOW = 60 * 1000; // 1 minute

// In-memory store (for demo/dev only; use Redis or DB for production/distributed)
const ipHits: Record<string, { count: number, last: number }> = {};

serve(async (req) => {
  const ip =
    req.headers.get('x-forwarded-for') ||
    req.headers.get('cf-connecting-ip') ||
    'unknown';
  const now = Date.now();

  if (!ipHits[ip] || now - ipHits[ip].last > WINDOW) {
    ipHits[ip] = { count: 1, last: now };
  } else {
    ipHits[ip].count++;
    ipHits[ip].last = now;
  }

  if (ipHits[ip].count > RATE_LIMIT) {
    return new Response('Too Many Requests', { status: 429 });
  }

  // Example: proxy to your real logic or return a success
  return new Response('OK: You are under the rate limit!');
});
