# Happy Feet Accounts Setup

## Architecture

Browser  
→ Happy Feet Cloudflare Worker  
→ Better Auth authentication + Happy Feet authorization/API layer  
→ Cloudflare D1

Static files remain in `public/`. The Worker is added only to handle API routes and protected page routing.

## Authentication
Better Auth 1.7.6 is pinned. It natively supports Cloudflare D1 and email/password. The Username plugin supplies username sign-in and the Admin plugin supplies roles plus ban/unban/session revocation behavior.

Happy Feet uses:
- email/password authentication
- username plugin
- admin plugin
- database-backed sessions
- 7-day session expiry
- Better Auth database-backed rate limiting
- generic login errors
- no OAuth/SSO
- no password-reset email until an email provider is approved

Passwords are handled by Better Auth. Happy Feet never stores or logs plaintext passwords and never implements password hashing itself.

## Database schema
Migration: `migrations/0001_accounts.sql`

Tables:
- `user`: Better Auth user + username/admin fields + last login timestamp
- `session`: Better Auth sessions
- `account`: Better Auth credential record; password field contains Better Auth's password hash, never plaintext
- `verification`: Better Auth verification records
- `rateLimit`: Better Auth rate-limit counters
- `registration_codes`: hashed invite codes and redemption metadata
- `audit_log`: administrative actions without credentials
- `workouts`: account-owned workout records

Permanent user deletion also deletes sessions, credential accounts, and D1 workout rows. Routine management should use Disable instead.

## Role model
Roles are `user` and `admin`; new accounts default to `user`. Admin API routes call a server-side session check and verify the current database-backed role. UI visibility is not treated as authorization.

The last active admin cannot be disabled, demoted, or deleted.

## Invite model
An admin generates a 24-byte cryptographically random secret. The UI displays it once. D1 stores SHA-256(secret), not the plaintext secret.

Registration performs a conditional update from `active` to `redeeming` before account creation. Only one concurrent request can claim a single-use invite. Successful account creation marks it `used`; ordinary account-creation errors restore it to `active`. A Worker crash between those operations can leave an invite in `redeeming`; an admin/recovery procedure should inspect and explicitly reset such a code rather than guessing.

## Local setup
1. Install Node.js supported by current Wrangler.
2. Run `npm install`.
3. Copy `.dev.vars.example` to `.dev.vars`.
4. Generate a local Better Auth secret yourself and put it in `.dev.vars`. Do not send it in chat.
5. Run `npm run db:local:migrate`.
6. Run `npm run dev`.

## Production cloud plan — NOT YET APPLIED
Exact existing Cloudflare Worker project: `happy-feet-footwork` (current public URL uses the footworktrainer-donnelly Workers deployment).

Proposed D1 database name: `happy-feet-footwork-prod`.

Resources to create:
- one Cloudflare D1 database
- one D1 binding named `DB` on the existing Worker
- one production secret named `BETTER_AUTH_SECRET`
- one non-secret environment value `BETTER_AUTH_URL` set to the canonical deployed HTTPS origin

Proposed `wrangler.jsonc` changes after approval:
- add `main: "./src/index.js"`
- add `compatibility_flags: ["nodejs_compat"]`
- add `assets.binding: "ASSETS"`
- add `assets.run_worker_first` for `/api/*`, `/login`, `/signup`, `/account`, `/admin`
- add D1 binding `DB` with the real database ID returned by Cloudflare
- keep observability and existing static assets

Production migration command (only after database creation and approval):
`npx wrangler d1 migrations apply happy-feet-footwork-prod --remote`

Deployment command (only after approval):
`npx wrangler deploy`

## Initial admin bootstrap
No public promotion endpoint exists.

After production deployment and after an invite is available:
1. Navigate to `/signup`.
2. Enter your own username, email, password, confirmation, and registration code.
3. Do not send the password or secret to ChatGPT.
4. Identify the new account's exact internal ID with:
   `npx wrangler d1 execute happy-feet-footwork-prod --remote --command "SELECT id, username, email, role FROM user WHERE email = 'YOUR_EMAIL';"`
5. Proposed promotion SQL (replace the ID only after verifying it):
   `UPDATE user SET role='admin', updatedAt=<CURRENT_EPOCH_MS> WHERE id='<EXACT_USER_ID>' AND role='user';`
6. STOP and obtain explicit approval before running that production UPDATE.
7. Verify the row, sign out/in, verify `/admin`, and verify a normal user receives 403 from admin APIs.

Recovery: use D1 Time Travel / point-in-time recovery if a destructive database change causes damage, or use an explicitly reviewed SQL update against the exact known account ID to restore an admin role. Never expose a public recovery endpoint.

## Cost assumptions
Target is Workers Free + D1 Free. Current Cloudflare documentation lists 100,000 Worker requests/day on Free and D1 Free allowances of 5 million rows read/day, 100,000 rows written/day, 5 GB total storage, 10 databases, and 500 MB per database. If a D1 daily limit is exceeded, queries fail until reset rather than silently creating paid usage.

No R2, paid email, paid Better Auth infrastructure, or paid Cloudflare feature is required for this MVP.

## Rate limiting
Better Auth's database-backed limiter protects auth routes, with stricter login/signup rules in code. This uses D1 rows and therefore consumes the normal D1 Free allowance. No separate paid Cloudflare rate-limiting product is enabled.

Cloudflare also offers a Worker Rate Limiting binding, but this implementation does not enable it yet because the database-backed Better Auth limiter avoids creating another cloud configuration dependency before approval.

## Password recovery
Not enabled. Better Auth supports reset flows, but real recovery requires a transactional email provider. No provider, subscription, DNS/domain configuration, or email secret will be added without approval.

## Rollback / recovery
Before deployment, capture the current production Worker version. Worker rollback is to redeploy/restore that prior version. D1 schema migrations are forward-only by policy; do not reset production. For data recovery, D1 Free currently provides a 7-day Time Travel window.

## Known limitations
- The first migration must be checked against Better Auth's generated schema before production application.
- D1 has no interactive transactions. Invite claiming uses a conditional state transition to prevent concurrent reuse; a crash can strand an invite in `redeeming`.
- Existing localStorage history is not automatically imported.
- Email verification and password recovery are not enabled in the MVP.
