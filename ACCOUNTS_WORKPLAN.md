# Happy Feet Accounts Workplan

## Architecture decisions
- Keep the existing plain HTML/CSS/JavaScript application.
- Add a Cloudflare Worker entrypoint in `src/index.js` for API/auth routes and continue serving `./public` assets.
- Use Better Auth 1.7.6 with native Cloudflare D1, email/password, Username, and Admin plugins.
- Use Better Auth database-backed sessions and HttpOnly cookies. No session token is stored in localStorage.
- Use D1 for users, sessions, invite metadata, audit records, and account-owned workouts.
- Keep current localStorage workout history untouched. New signed-in workouts are additionally persisted to D1.
- Use Better Auth's `banned` account state as Happy Feet's Disabled state because it blocks login and revokes sessions.
- Public signup goes through `/api/register`; direct `/api/auth/sign-up/email` is blocked by the Worker.
- Invite codes are 192-bit random secrets. Only SHA-256 hashes are stored. Plaintext is returned once at creation.
- No password-reset UI is enabled until a real email provider is approved.

## Checklist
- [x] Read-only repository inspection
- [x] Feature branch `feature/accounts-admin`
- [x] Worker/API structure
- [x] Versioned D1 migration SQL
- [x] Better Auth configuration
- [x] Invite-only registration gate
- [x] Login by email or username
- [x] Logout/session lookup
- [x] Server-side admin authorization
- [x] Account page
- [x] Admin dashboard
- [x] User search/filter
- [x] Disable/reactivate
- [x] Promote/demote
- [x] Session revocation
- [x] Final-active-admin safeguards
- [x] Invite generation/revocation
- [x] Audit log writes
- [x] D1 workout ownership model
- [x] Preserve localStorage history
- [ ] Apply production D1 migration (requires separate approval)
- [ ] Create initial production account
- [ ] Promote exact production account to admin (requires explicit approval)
- [ ] Run destructive production authorization tests (must use fixtures, not real users)
- [ ] Deploy production Worker (requires separate approval)

## Tests
Repository CI should perform dependency install and Wrangler dry-run compilation. Full auth/security integration tests require a local D1 runtime and are intentionally not represented as completed until actually run.

Required integration test matrix remains the 26 cases in the approved specification, including cross-user isolation, invite reuse, disabled sessions, final-admin protection, and regression testing of the workout engine.

## Blockers
Production D1 does not exist/bind yet. Production secrets have not been created. Those are intentional approval boundaries.

## Next step
Review CI/PR. Then approve or reject the production cloud plan in `ACCOUNTS_SETUP.md`.
