import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'jsr:@supabase/supabase-js@2'

const RATE_LIMIT = 10; // requests per minute
const WINDOW = 60 * 1000; // 1 minute

const supabase = createClient(
  Deno.env.get('SUPABASE_URL'),
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
)

serve(async (req) => {
  const ip =
    req.headers.get('x-forwarded-for') ||
    req.headers.get('cf-connecting-ip') ||
    'unknown';
  const now = new Date();

  // Fetch rate limit record for this IP
  const { data, error } = await supabase
    .from('rate_limits')
    .select('*')
    .eq('identifier', ip)
    .single();

  if (error && error.code !== 'PGRST116') {
    // Unexpected error
    return new Response('Internal Error', { status: 500 });
  }

  if (!data || now.getTime() - new Date(data.last_request).getTime() > WINDOW) {
    // No record or window expired: reset count
    const upsertRes = await supabase
      .from('rate_limits')
      .upsert({ identifier: ip, count: 1, last_request: now }, { onConflict: 'identifier' });
    if (upsertRes.error) {
      return new Response('Internal Error', { status: 500 });
    }
  } else if (data.count < RATE_LIMIT) {
    // Within window and under limit: increment count
    const updateRes = await supabase
      .from('rate_limits')
      .update({ count: data.count + 1, last_request: now })
      .eq('identifier', ip);
    if (updateRes.error) {
      return new Response('Internal Error', { status: 500 });
    }
  } else {
    // Over the limit
    return new Response('Too Many Requests', { status: 429 });
  }

  // Example: proxy to your real logic or return a success
  return new Response('OK: You are under the rate limit!');
});
