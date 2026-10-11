import { Redis } from '@upstash/redis';
import { timingSafeEqual } from 'node:crypto';

// Vercel's Upstash integration injects KV_REST_API_*; a direct Upstash setup uses UPSTASH_REDIS_REST_*.
// Created on first use, so a missing database setting gives a clear error instead of crashing every function.
let client;
export function getRedis() {
  if (!client) client = new Redis({
    url: process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL,
    token: process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN,
  });
  return client;
}

export function authorised(req) {
  // Trim spaces and stray quotes, which are easy to paste into the Vercel dashboard by mistake.
  const expected = String(process.env.CREW_CODE || '').trim().replace(/^["']|["']$/g, '');
  const given = decodeURIComponent(String(req.headers['x-crew-code'] || '')).trim();
  if (!expected) return false;
  const a = Buffer.from(given), b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}

export function send(res, status, body) {
  res.setHeader('Cache-Control', 'no-store');
  res.status(status).json(body);
}
