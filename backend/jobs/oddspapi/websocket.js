import WebSocket from "ws";
import { getCache, setCache } from "../../services/cacheService.js";
import {
  getOddspapiConfig,
  isOddspapiShadowEnabled,
  mapStatusId,
  parseProviderFixtureId,
} from "../../services/providers/oddspapi/config.js";
import { normalizeScores } from "../../services/providers/oddspapi/normalize.js";
import prisma from "../../Config/db.js";

const LIVE_KEY = (id) => `oddspapi:ws:${id}`;
const LIVE_TTL = 6 * 3600;

let socket = null;
let stopRequested = false;
let reconnectTimer = null;
let stats = { messages: 0, openedAt: null, lastMessageAt: null, reconnects: 0 };

function mergeScore(msg) {
  const { fullTime, halfTime } = normalizeScores(msg);
  const patch = {};
  if (fullTime) {
    patch.home_score = fullTime.home;
    patch.away_score = fullTime.away;
  }
  if (halfTime) {
    patch.ht_home_score = halfTime.home;
    patch.ht_away_score = halfTime.away;
  }
  return Object.keys(patch).length ? patch : null;
}

async function applyMessage(msg) {
  if (!msg?.fixtureId) return;
  const apiId = parseProviderFixtureId(msg.fixtureId);
  const prev = (await getCache(LIVE_KEY(msg.fixtureId))) || {};
  const next = { ...prev, fixtureId: msg.fixtureId, updatedAt: msg.updatedAt || new Date().toISOString() };
  if (msg.statusId != null) next.statusId = msg.statusId;
  if (msg.bookmakerOdds) next.bookmakerOdds = msg.bookmakerOdds;
  if (msg.scores) next.scores = msg.scores;
  await setCache(LIVE_KEY(msg.fixtureId), next, LIVE_TTL);

  if (apiId == null) return;
  const patch = {};
  if (msg.statusId != null) patch.status = mapStatusId(msg.statusId);
  const score = mergeScore(msg);
  if (score) Object.assign(patch, score);
  if (!Object.keys(patch).length) return;

  const existing = await prisma.fixture.findUnique({
    where: { api_fixture_id: apiId },
    select: { id: true, provider: true },
  });
  if (!existing || existing.provider !== "oddspapi") return;
  await prisma.fixture.update({ where: { id: existing.id }, data: patch });
}

function openSocket() {
  const cfg = getOddspapiConfig();
  if (!cfg.apiKey) {
    console.warn("[oddspapi:ws] missing ODDSPAPI_API_KEY");
    return null;
  }
  // Node 20 has no global WebSocket; the `ws` package does.
  return new WebSocket(`${cfg.wsUrl}?apiKey=${cfg.apiKey}`);
}

function scheduleReconnect(delayMs) {
  if (stopRequested) return;
  clearTimeout(reconnectTimer);
  reconnectTimer = setTimeout(() => {
    stats.reconnects += 1;
    connect().catch((err) => {
      console.error("[oddspapi:ws] reconnect failed:", err.message);
      scheduleReconnect(Math.min(30_000, delayMs * 2));
    });
  }, delayMs);
}

export async function connect() {
  if (!isOddspapiShadowEnabled() || !getOddspapiConfig().wsEnabled) return;
  stopRequested = false;
  const ws = openSocket();
  if (!ws) return;
  socket = ws;

  ws.on("open", () => {
    stats.openedAt = new Date().toISOString();
    console.log("[oddspapi:ws] connected (deltas only — REST reseed required after reconnect)");
  });
  ws.on("message", (data) => {
    stats.messages += 1;
    stats.lastMessageAt = new Date().toISOString();
    const raw = typeof data === "string" ? data : data?.toString?.();
    if (!raw || raw[0] !== "{") return;
    let msg;
    try {
      msg = JSON.parse(raw);
    } catch {
      return;
    }
    applyMessage(msg).catch((err) => {
      console.warn("[oddspapi:ws] apply failed:", err.message);
    });
  });
  ws.on("close", () => {
    console.warn("[oddspapi:ws] closed");
    socket = null;
    if (!stopRequested) scheduleReconnect(2000);
  });
  ws.on("error", (err) => {
    console.warn("[oddspapi:ws] error:", err.message);
  });
}

export async function disconnect() {
  stopRequested = true;
  clearTimeout(reconnectTimer);
  try {
    socket?.close();
  } catch {
    /* ok */
  }
  socket = null;
}

export function websocketStats() {
  return { ...stats, connected: Boolean(socket) };
}
