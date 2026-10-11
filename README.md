# Crew Lifts

Shared Push, Pull, Legs tracker for the crew. Static page plus two Vercel functions, with every set stored in Upstash Redis.

## Deploy (about 10 minutes)

1. Push this folder to a new private GitHub repo.
2. In Vercel: **Add New > Project**, import the repo. Leave the framework as **Other**. Deploy.
3. In the project: **Storage > Create Database > Upstash (Redis)**, free plan, region **Sydney** if offered. Connect it to the project for all environments. This adds `KV_REST_API_URL` and `KV_REST_API_TOKEN` automatically.
4. **Settings > Environment Variables**, add:
   - `CREW_CODE` – the passcode the four of us type once per phone. Make it long; anyone with the link and the code can read and write.
   - `ANTHROPIC_API_KEY` – optional. Turns on "Adapt the programme". Without it the rest of the app works.
   - `ANTHROPIC_MODEL` – optional, defaults to `claude-sonnet-5-5`.
5. **Deployments > Redeploy** so the new variables load.
6. Open the site, enter the crew code, add names on the Crew tab.

## How data is kept safe

- Every session is written to Redis the moment Save is tapped.
- If a phone is offline, the session is kept on that phone and syncs automatically when it reconnects.
- Numbers typed but not yet saved survive closing the tab.
- Deleted sessions and replaced programme versions are kept in a `crew:snapshots` list (last 200) so they can be recovered.
- Crew tab has CSV and full JSON backup downloads.

## Data layout (Redis)

| Key | Type | Contents |
|---|---|---|
| `crew:program` | JSON | Current programme and version history |
| `crew:members` | JSON | Crew names |
| `crew:logs` | Hash | One field per session (`date_person_day`) |
| `crew:snapshots` | List | Deleted sessions and old programmes |
