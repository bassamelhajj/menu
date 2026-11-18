# Admin database setup

The admin account is stored in Postgres so the username and password can be
changed from the dashboard without editing source files or redeploying.

## 1. Create a Postgres database

Use any managed Postgres provider that gives you a connection string, for
example Neon, Supabase, Railway, or a Vercel Marketplace Postgres integration.

For Vercel, use the provider's **pooled** connection string. A direct
connection string can exhaust Postgres connections in serverless functions.

## 2. Add `DATABASE_URL`

Locally, add this to `.env.local`:

```dotenv
DATABASE_URL=postgres://user:password@host:5432/database?sslmode=require
```

If you run a local Postgres without SSL, also add:

```dotenv
DATABASE_SSL=disable
```

On Vercel, add `DATABASE_URL` under **Settings → Environment Variables** for
Production and Preview.

Do not prefix it with `VITE_`.

## 3. Create the tables and the first admin

The first admin is created from the existing bootstrap values:

```dotenv
ADMIN_USERNAME=admin@example.com
ADMIN_PASSWORD_HASH=scrypt$...
ADMIN_SESSION_SECRET=<long-random-secret>
```

Then run:

```bash
npm run db:init
```

This creates:

- `admin_users` — username, scrypt password hash, session version, timestamps.
- `admin_audit_log` — credential-change audit entries.

If `admin_users` is not empty, the script does not overwrite the existing admin.
The database becomes the source of truth after the first row is created.

## 4. Change credentials from the dashboard

1. Open `/#/admin`.
2. Sign in.
3. Open **Credentials** in the sidebar.
4. Enter the current password, the new username, and optionally a new password.
5. Save.

Changing credentials increments `session_version`, so every old admin cookie
becomes invalid. The browser that made the change receives a fresh cookie.

## 5. Recover a lost password

From the project root:

```bash
npm run db:reset-admin -- "new long password"
```

The script uses `DATABASE_URL` and `ADMIN_USERNAME` from `.env.local`, replaces
the first admin's password hash, and invalidates old sessions.

## Schema

See [`db/schema.sql`](./db/schema.sql).

`admin_users`:

| Column | Purpose |
|---|---|
| `id` | Primary key used inside the signed session cookie. |
| `username` | Login name; uniqueness is enforced case-insensitively. |
| `password_hash` | `scrypt` hash in the format `scrypt$N$r$p$salt$hash`. |
| `session_version` | Incremented on credential changes to revoke old sessions. |
| `created_at`, `updated_at` | Audit timestamps. |

`admin_audit_log`:

| Column | Purpose |
|---|---|
| `admin_id` | Admin who performed the action. |
| `action` | For example `password_changed` or `username_changed`. |
| `ip`, `user_agent` | Request context for incident review. |
| `created_at` | When the action happened. |

## Security notes

- The API uses parameterized SQL.
- Passwords are hashed with `scrypt`; plaintext passwords are never stored.
- The session cookie remains `HttpOnly`, `SameSite=Strict`, and `Secure` on HTTPS.
- The current password is required before any credential change.
- The API is rate-limited to 5 failed attempts per 10 minutes per IP.
- Sessions are checked against the database on every request.
- Back up the database and restrict access to `DATABASE_URL`.
- The in-memory rate limiter is best-effort on serverless. For stronger
  protection, put the app behind Vercel WAF or use Upstash Redis.
