import "dotenv/config";
import express from "express";
import crypto from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import { getPlayersByTeam } from "./sleeper.mjs";
import { getSeahawksGame } from "./espn.mjs";

const app = express();
const PORT = Number(process.env.PORT || 3001);
const CLIENT_ID = process.env.YAHOO_CLIENT_ID;
const CLIENT_SECRET = process.env.YAHOO_CLIENT_SECRET;
const REDIRECT_URI =
  process.env.YAHOO_REDIRECT_URI ||
  `http://localhost:${PORT}/auth/yahoo/callback`;
const TOKEN_FILE = path.resolve(".private/yahoo-tokens.json");
const AUTH_URL = "https://api.login.yahoo.com/oauth2/request_auth";
const TOKEN_URL = "https://api.login.yahoo.com/oauth2/get_token";
const FANTASY_URL = "https://fantasysports.yahooapis.com/fantasy/v2";
const STATE_COOKIE = "yahoo_oauth_state";
const b64 = (s) => Buffer.from(s).toString("base64");
const configured = () => Boolean(CLIENT_ID && CLIENT_SECRET);
async function readTokens() {
  try {
    return JSON.parse(await fs.readFile(TOKEN_FILE, "utf8"));
  } catch (e) {
    if (e.code === "ENOENT") return null;
    throw e;
  }
}
async function saveTokens(tokens) {
  await fs.mkdir(path.dirname(TOKEN_FILE), { recursive: true, mode: 0o700 });
  await fs.writeFile(TOKEN_FILE, JSON.stringify(tokens, null, 2), {
    mode: 0o600,
  });
  await fs.chmod(TOKEN_FILE, 0o600);
}
async function tokenRequest(params) {
  const res = await fetch(TOKEN_URL, {
    method: "POST",
    headers: {
      Authorization: `Basic ${b64(`${CLIENT_ID}:${CLIENT_SECRET}`)}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams(params),
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok)
    throw new Error(
      `Yahoo token request failed (${res.status}): ${body.error || "unknown error"}`,
    );
  return body;
}
async function accessToken() {
  const tokens = await readTokens();
  if (!tokens) return null;
  if (Date.now() < tokens.expires_at - 60_000) return tokens.access_token;
  if (!tokens.refresh_token)
    throw new Error("Yahoo login expired. Please reconnect.");
  const refreshed = await tokenRequest({
    grant_type: "refresh_token",
    refresh_token: tokens.refresh_token,
  });
  const next = {
    ...tokens,
    ...refreshed,
    refresh_token: refreshed.refresh_token || tokens.refresh_token,
    expires_at: Date.now() + Number(refreshed.expires_in || 3600) * 1000,
  };
  await saveTokens(next);
  return next.access_token;
}
function parseCookie(req, name) {
  const cookies = (req.headers.cookie || "").split(";").map((s) => s.trim());
  const entry = cookies.find((c) => c.startsWith(name + "="));
  return entry ? decodeURIComponent(entry.slice(name.length + 1)) : null;
}
app.get("/api/health", (_req, res) =>
  res.json({ ok: true, service: "Seahawks Yahoo backend" }),
);
app.get("/api/auth/status", async (_req, res) => {
  try {
    res.json({ configured: configured(), connected: !!(await readTokens()) });
  } catch {
    res.status(500).json({ error: "Could not read local authorization state" });
  }
});
app.get("/auth/yahoo/start", (req, res) => {
  if (!configured())
    return res
      .status(503)
      .send("Add Yahoo credentials to .env before connecting.");
  const state = crypto.randomBytes(24).toString("hex");
  res.cookie(STATE_COOKIE, state, {
    httpOnly: true,
    sameSite: "lax",
    secure: false,
    maxAge: 10 * 60 * 1000,
    path: "/auth/yahoo",
  });
  const params = new URLSearchParams({
    client_id: CLIENT_ID,
    redirect_uri: REDIRECT_URI,
    response_type: "code",
    state,
  });
  res.redirect(`${AUTH_URL}?${params}`);
});
app.get("/auth/yahoo/callback", async (req, res) => {
  const expected = parseCookie(req, STATE_COOKIE);
  res.clearCookie(STATE_COOKIE, { path: "/auth/yahoo" });
  if (
    !expected ||
    typeof req.query.state !== "string" ||
    req.query.state !== expected
  )
    return res.status(400).send("Invalid OAuth state. Please restart sign-in.");
  if (typeof req.query.code !== "string")
    return res.status(400).send("Yahoo did not return an authorization code.");
  try {
    const t = await tokenRequest({
      grant_type: "authorization_code",
      code: req.query.code,
      redirect_uri: REDIRECT_URI,
    });
    await saveTokens({
      ...t,
      expires_at: Date.now() + Number(t.expires_in || 3600) * 1000,
    });
    res.redirect("http://localhost:5173/?yahoo=connected");
  } catch (e) {
    console.error(e.message);
    res
      .status(502)
      .send(
        "Yahoo authentication failed. Check backend logs and callback configuration.",
      );
  }
});
app.post("/api/auth/disconnect", async (_req, res) => {
  await fs.rm(TOKEN_FILE, { force: true });
  res.json({
    connected: false,
    note: "Local credentials removed. To revoke authorization entirely, use Yahoo account settings.",
  });
});
// Raw Yahoo JSON for adapter development; not yet mapped to the dashboard's normalized data.
app.get("/api/yahoo/leagues", async (_req, res) => {
  try {
    const token = await accessToken();
    if (!token) return res.status(401).json({ error: "Connect Yahoo first" });
    const url = `${FANTASY_URL}/users;use_login=1/games;game_codes=nfl/leagues?format=json`;
    const response = await fetch(url, {
      headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
    });
    const body = await response
      .json()
      .catch(() => ({ error: "Yahoo returned a non-JSON response" }));
    res.status(response.status).json(body);
  } catch (e) {
    console.error(e.message);
    res.status(502).json({
      error: "Unable to retrieve leagues. Reconnect Yahoo or check API access.",
    });
  }
});

app.get("/api/players", async (req, res) => {
  try {
    const team = String(req.query.team || "SEA")
      .trim()
      .toUpperCase();

    if (!/^[A-Z]{2,3}$/.test(team)) {
      return res.status(400).json({
        error: "Invalid team abbreviation",
      });
    }

    const players = await getPlayersByTeam(team);

    res.json({
      team,
      count: players.length,
      players,
    });
  } catch (error) {
    console.error("Sleeper API error:", error);

    res.status(502).json({
      error: "Unable to retrieve Sleeper players",
    });
  }
});

app.get("/api/seahawks/game", async (req, res) => {
  try {
    const data = await getSeahawksGame();
    res.json(data);
  } catch (error) {
    console.error("ESPN API error:", error);
    res.status(502).json({
      error: "Unable to retrieve Seahawks game data",
    });
  }
});

app.listen(PORT, "127.0.0.1", () =>
  console.log(`Yahoo backend: http://localhost:${PORT} (local only)`),
);
