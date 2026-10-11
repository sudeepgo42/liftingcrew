import { getRedis } from './_lib.js';

// Setup check. Reports what is configured without revealing any secret values.
export default async function handler(req, res) {
  let redis;
  const code = String(process.env.CREW_CODE || '').trim().replace(/^["']|["']$/g, '');
  const out = {
    crewCodeSet: code.length > 0,
    crewCodeLength: code.length,
    redisUrlSet: Boolean(process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL),
    redisTokenSet: Boolean(process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN),
    redisReachable: false,
    aiEnabled: Boolean(process.env.ANTHROPIC_API_KEY),
    environment: process.env.VERCEL_ENV || 'unknown',
  };
  try { redis = getRedis(); out.redisReachable = (await redis.ping()) === 'PONG'; } catch (e) { out.redisError = String(e.message || e).slice(0, 200); }
  res.setHeader('Cache-Control', 'no-store');
  res.status(200).json(out);
}
