# Seahawks Fantasy Dashboard — Yahoo Integration Starter

A React/TypeScript dashboard for a 7-inch (1024×600) touchscreen, with five views and a floating navigation button. **All dashboard scores are still demo data.** The new backend supports Yahoo OAuth and fetching raw league data; the UI is not yet mapped to live Yahoo responses.

## Run the dashboard (no Yahoo credentials required)

```bash
npm install
npm run dev:all
```

Open http://localhost:5173.

## Connect Yahoo (after approval)

1. Copy `.env.example` to `.env` and fill in `YAHOO_CLIENT_ID` and `YAHOO_CLIENT_SECRET` **locally**. Never commit `.env`.
2. Register the exact callback `http://localhost:3001/auth/yahoo/callback` with Yahoo (if Yahoo allows HTTP loopback redirects). If Yahoo requires HTTPS, use an approved HTTPS callback and update the backend configuration before proceeding.
3. Run `npm run dev:all`.
4. Open http://localhost:5173 and visit http://localhost:3001/auth/yahoo/start to connect a Yahoo account.
5. Inspect http://localhost:3001/api/auth/status and http://localhost:3001/api/yahoo/leagues. The latter returns **raw** Yahoo API JSON, not yet normalized for the dashboard.
6. To switch from your Yahoo account to your dad's, run `curl -X POST http://localhost:3001/api/auth/disconnect` and then connect with his account. This clears locally stored tokens, but does not revoke the app in Yahoo account settings.

## Security and deployment

- `.private/yahoo-tokens.json` is ignored by Git, stored with restricted permissions, and **must never be uploaded**. The client secret stays in `.env` on the backend, never in React code.
- Backend binds to `127.0.0.1` for local development. The development callback cookie is not marked `secure` because it is loopback HTTP; use HTTPS and secure cookies for any remote deployment.
- This is a **single-household, single-authorized-account** starter, not a multi-user web service. Do not expose the backend publicly without adding proper session authentication, CSRF protection, and hardened token storage.
- Yahoo approval, access scopes, callback policy, and API response structure should be verified against the developer portal before connecting real data.
- The Seahawks game scoreboard will require a separate data provider if Yahoo Fantasy does not supply the needed game-level data.
