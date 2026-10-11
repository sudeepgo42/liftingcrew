import { redis, authorised, send } from './_lib.js';
import { SEED_PROGRAM, SEED_CREW } from './_seed.js';

const K = { program: 'crew:program', crew: 'crew:members', logs: 'crew:logs', snapshots: 'crew:snapshots' };
const ID = /^[a-z0-9_.-]{1,150}$/;
const DATE = /^\d{4}-\d{2}-\d{2}$/;

function cleanLog(l) {
  if (!l || !ID.test(l.id) || !DATE.test(l.date) || typeof l.person !== 'string' || !Array.isArray(l.entries)) return null;
  const entries = l.entries.slice(0, 20).map(e => ({
    exId: String(e.exId || '').slice(0, 80),
    name: String(e.name || '').slice(0, 80),
    sets: (Array.isArray(e.sets) ? e.sets : []).slice(0, 12).map(s => ({
      kg: Math.max(0, Math.min(1000, Number(s.kg) || 0)),
      reps: Math.max(0, Math.min(500, Math.round(Number(s.reps) || 0))),
    })).filter(s => s.reps > 0),
  })).filter(e => e.exId && e.sets.length);
  if (!entries.length) return null;
  return {
    id: l.id, date: l.date, person: l.person.slice(0, 24),
    dayId: String(l.dayId || '').slice(0, 40), dayName: String(l.dayName || '').slice(0, 40),
    programVersion: Number(l.programVersion) || 1, entries, savedAt: new Date().toISOString(),
  };
}

export default async function handler(req, res) {
  if (!authorised(req)) return send(res, 401, { error: 'Crew code required', code: 'locked' });
  try {
    if (req.method === 'GET') {
      let [program, crew, logMap] = await Promise.all([redis.get(K.program), redis.get(K.crew), redis.hgetall(K.logs)]);
      if (!program) { program = SEED_PROGRAM; await redis.set(K.program, program, { nx: true }); }
      if (!crew) { crew = SEED_CREW; await redis.set(K.crew, crew, { nx: true }); }
      const logs = Object.values(logMap || {}).map(v => (typeof v === 'string' ? JSON.parse(v) : v)).sort((a, b) => (a.date < b.date ? 1 : -1));
      return send(res, 200, { program, crew, logs, ai: Boolean(process.env.ANTHROPIC_API_KEY) });
    }
    if (req.method !== 'POST') return send(res, 405, { error: 'Method not allowed' });

    const body = req.body || {};
    switch (body.action) {
      case 'saveLog': {
        const log = cleanLog(body.log);
        if (!log) return send(res, 400, { error: 'Invalid session' });
        await redis.hset(K.logs, { [log.id]: JSON.stringify(log) });
        return send(res, 200, { ok: true, log });
      }
      case 'deleteLog': {
        if (!ID.test(body.id || '')) return send(res, 400, { error: 'Invalid id' });
        const old = await redis.hget(K.logs, body.id);
        if (old) await redis.lpush(K.snapshots, JSON.stringify({ deletedAt: new Date().toISOString(), log: old }));
        await redis.hdel(K.logs, body.id);
        await redis.ltrim(K.snapshots, 0, 199);
        return send(res, 200, { ok: true });
      }
      case 'saveCrew': {
        const names = (Array.isArray(body.names) ? body.names : []).map(n => String(n).trim().slice(0, 24)).filter(Boolean).slice(0, 6);
        await redis.set(K.crew, { names: [...new Set(names)] });
        return send(res, 200, { ok: true });
      }
      case 'saveProgram': {
        const p = body.program;
        if (!p || !Array.isArray(p.days) || !p.days.length) return send(res, 400, { error: 'Invalid programme' });
        const current = await redis.get(K.program);
        if (current && Number(body.baseVersion) !== Number(current.version)) {
          return send(res, 409, { error: 'Someone updated the programme first. Reload and try again.', code: 'conflict' });
        }
        if (current) await redis.lpush(K.snapshots, JSON.stringify({ replacedAt: new Date().toISOString(), program: current }));
        await redis.set(K.program, p);
        return send(res, 200, { ok: true });
      }
      default:
        return send(res, 400, { error: 'Unknown action' });
    }
  } catch (err) {
    console.error(err);
    return send(res, 500, { error: 'Server error' });
  }
}
