const http = require("http");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

require("dotenv").config();

let Pool = null;

try {
  ({ Pool } = require("pg"));
} catch {
  Pool = null;
}

const PORT = process.env.PORT || 3000;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const CHAT_MODEL = process.env.OPENAI_MODEL || "gpt-5.2";
const CHAT_PROVIDER = process.env.CHAT_PROVIDER || "auto";
const OLLAMA_BASE_URL = process.env.OLLAMA_BASE_URL || "http://host.docker.internal:11434";
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || "llama3.2:3b";
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || "";
const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-2.0-flash";
const GMAIL_API_KEY = process.env.GMAIL_API_KEY || "";
const APP_BASE_URL = process.env.APP_BASE_URL || "";
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || "";
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET || "";
const ALIBABA_ACCESS_KEY_ID = process.env.ALIBABA_ACCESS_KEY_ID || "";
const ALIBABA_ACCESS_KEY_SECRET = process.env.ALIBABA_ACCESS_KEY_SECRET || "";
const ALIBABA_REGION = process.env.ALIBABA_REGION || "";
const ALIBABA_OSS_BUCKET = process.env.ALIBABA_OSS_BUCKET || "";
const ALIBABA_OSS_ENDPOINT = process.env.ALIBABA_OSS_ENDPOINT || "";
const IMAGE_MODEL = process.env.OPENAI_IMAGE_MODEL || "gpt-image-1.5";
const VIDEO_GENERATION_ENABLED = String(process.env.ENABLE_VIDEO_GENERATION || "false").toLowerCase() === "true";
const VIDEO_MODEL = process.env.OPENAI_VIDEO_MODEL || "sora-2";
const AUDIO_TRANSCRIBE_MODEL =
  process.env.OPENAI_AUDIO_MODEL || "gpt-4o-transcribe";
const DATABASE_URL = process.env.DATABASE_URL || "";
const STORAGE_DRIVER =
  process.env.STORAGE_DRIVER || (DATABASE_URL ? "postgres" : "json");
const APP_SECRET = process.env.APP_SECRET || OPENAI_API_KEY || "nexus-informator-demo-secret";
const MAX_INLINE_FILE_BYTES = Number(
  process.env.MAX_INLINE_FILE_BYTES || 32 * 1024 * 1024
);
const MAX_TOTAL_FILE_BYTES = Number(
  process.env.MAX_TOTAL_FILE_BYTES || 256 * 1024 * 1024
);

const PUBLIC_DIR = path.join(__dirname, "public");
const DATA_DIR = path.join(__dirname, "data");
const BACKUPS_DIR = path.join(DATA_DIR, "backups");

const USERS_FILE = path.join(DATA_DIR, "users.json");
const SESSIONS_FILE = path.join(DATA_DIR, "sessions.json");
const AUDIT_FILE = path.join(DATA_DIR, "audit-log.json");
const VIDEO_JOBS_FILE = path.join(DATA_DIR, "video-jobs.json");
const CHATS_FILE = path.join(DATA_DIR, "chats.json");
const INCIDENTS_FILE = path.join(DATA_DIR, "incidents.json");

const SESSION_TTL_MS = 1000 * 60 * 60 * 24 * 14;
const SNAPSHOT_LIMIT = 12;
const MAX_WORKBENCH_LINKS = 6;
const MAX_WORKBENCH_FILES = Number(process.env.MAX_WORKBENCH_FILES || 100);
const DATA_COLLECTIONS = new Set([
  "users",
  "sessions",
  "audit-log",
  "video-jobs",
  "chats",
  "incidents"
]);
const INTEGRATION_SERVICES = [
  "alibaba-cloud",
  "gmail",
  "google-drive",
  "facebook",
  "instagram",
  "tiktok",
  "youtube",
  "webhook"
];
const GMAIL_OAUTH_SCOPES = [
  "https://www.googleapis.com/auth/gmail.modify",
  "https://www.googleapis.com/auth/gmail.send"
];
const SECRET_KEY = crypto.createHash("sha256").update(String(APP_SECRET)).digest();
const storageState = {
  mode: "json",
  pool: null
};
const LIVE_NEWS_FEEDS = {
  all: [
    {
      name: "Google News Polska",
      url: "https://news.google.com/rss?hl=pl&gl=PL&ceid=PL:pl"
    },
    {
      name: "Google News Swiat",
      url: "https://news.google.com/rss/headlines/section/topic/WORLD?hl=pl&gl=PL&ceid=PL:pl"
    },
    {
      name: "Google News Biznes",
      url: "https://news.google.com/rss/headlines/section/topic/BUSINESS?hl=pl&gl=PL&ceid=PL:pl"
    },
    {
      name: "Google News Technologia",
      url: "https://news.google.com/rss/headlines/section/topic/TECHNOLOGY?hl=pl&gl=PL&ceid=PL:pl"
    },
    {
      name: "Google News Nauka",
      url: "https://news.google.com/rss/headlines/section/topic/SCIENCE?hl=pl&gl=PL&ceid=PL:pl"
    },
    {
      name: "Google News Sport",
      url: "https://news.google.com/rss/headlines/section/topic/SPORTS?hl=pl&gl=PL&ceid=PL:pl"
    }
  ],
  poland: [
    {
      name: "Google News Polska",
      url: "https://news.google.com/rss?hl=pl&gl=PL&ceid=PL:pl"
    }
  ],
  world: [
    {
      name: "Google News Swiat",
      url: "https://news.google.com/rss/headlines/section/topic/WORLD?hl=pl&gl=PL&ceid=PL:pl"
    }
  ],
  business: [
    {
      name: "Google News Biznes",
      url: "https://news.google.com/rss/headlines/section/topic/BUSINESS?hl=pl&gl=PL&ceid=PL:pl"
    }
  ],
  technology: [
    {
      name: "Google News Technologia",
      url: "https://news.google.com/rss/headlines/section/topic/TECHNOLOGY?hl=pl&gl=PL&ceid=PL:pl"
    }
  ],
  science: [
    {
      name: "Google News Nauka",
      url: "https://news.google.com/rss/headlines/section/topic/SCIENCE?hl=pl&gl=PL&ceid=PL:pl"
    }
  ],
  sports: [
    {
      name: "Google News Sport",
      url: "https://news.google.com/rss/headlines/section/topic/SPORTS?hl=pl&gl=PL&ceid=PL:pl"
    }
  ]
};
const liveNewsCache = new Map();

const MIME_TYPES = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".jpeg": "image/jpeg",
  ".jpg": "image/jpeg",
  ".js": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".mp4": "video/mp4",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".webp": "image/webp"
};

const CONTACT = {
  administrator: process.env.CONTACT_ADMINISTRATOR || "Administrator",
  street: process.env.CONTACT_STREET || "",
  postalCode: process.env.CONTACT_POSTAL_CODE || "",
  city: process.env.CONTACT_CITY || "",
  phone: process.env.CONTACT_PHONE || "",
  email: process.env.CONTACT_EMAIL || "admin@example.com"
};

const DEMO_ADMIN = {
  email: process.env.ADMIN_EMAIL || CONTACT.email,
  password: process.env.ADMIN_PASSWORD || "change-me-now",
  firstName: process.env.ADMIN_FIRST_NAME || "Admin",
  lastName: process.env.ADMIN_LAST_NAME || "User",
  displayName: process.env.ADMIN_NAME || CONTACT.administrator,
  username: process.env.ADMIN_USERNAME || "admin"
};

function safePathname(req) {
  const url = new URL(req.url, `http://${req.headers.host || "localhost"}`);
  return url.pathname;
}

function normalizeEmail(value) {
  return String(value || "").trim().toLowerCase();
}

function normalizeUsername(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9._-]/g, "");
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function hashPassword(password, salt = crypto.randomBytes(16).toString("hex")) {
  const hash = crypto.scryptSync(password, salt, 64).toString("hex");
  return { hash, salt };
}

function timingSafeMatch(a, b) {
  if (!a || !b) {
    return false;
  }

  const left = Buffer.from(a, "hex");
  const right = Buffer.from(b, "hex");

  if (left.length !== right.length) {
    return false;
  }

  return crypto.timingSafeEqual(left, right);
}

function parseAuthToken(req) {
  const authHeader = req.headers.authorization || "";
  if (!authHeader.startsWith("Bearer ")) {
    return "";
  }

  return authHeader.slice("Bearer ".length).trim();
}

function getClientIp(req) {
  const forwarded = req.headers["x-forwarded-for"];
  if (typeof forwarded === "string" && forwarded.trim()) {
    return forwarded.split(",")[0].trim();
  }

  return req.socket?.remoteAddress || "unknown";
}

function encodeJsonPayload(payload) {
  return JSON.stringify(payload);
}

function decodeJsonPayload(raw, fallback) {
  try {
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function getCollectionName(filePath) {
  const resolved = path.resolve(filePath);
  if (!resolved.startsWith(path.resolve(DATA_DIR)) || path.extname(resolved) !== ".json") {
    return "";
  }

  const name = path.basename(resolved, ".json");
  return DATA_COLLECTIONS.has(name) ? name : "";
}

function isPostgresEnabled() {
  return storageState.mode === "postgres" && storageState.pool;
}

async function initStorageDriver() {
  if (STORAGE_DRIVER !== "postgres" || !DATABASE_URL || !Pool) {
    storageState.mode = "json";
    storageState.pool = null;
    return;
  }

  const sslMode = process.env.PGSSLMODE || "";
  const useSsl =
    !/disable|allow/i.test(sslMode) &&
    !/localhost|127\.0\.0\.1/.test(DATABASE_URL);

  const pool = new Pool({
    connectionString: DATABASE_URL,
    ssl: useSsl ? { rejectUnauthorized: false } : false
  });

  await pool.query(`
    CREATE TABLE IF NOT EXISTS app_collections (
      name TEXT PRIMARY KEY,
      payload JSONB NOT NULL DEFAULT '[]'::jsonb,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);

  storageState.mode = "postgres";
  storageState.pool = pool;
}

async function readCollectionFromDatabase(name, fallback) {
  const response = await storageState.pool.query(
    "SELECT payload FROM app_collections WHERE name = $1 LIMIT 1",
    [name]
  );
  if (!response.rows.length) {
    return fallback;
  }

  return response.rows[0].payload ?? fallback;
}

async function writeCollectionToDatabase(name, payload) {
  await storageState.pool.query(
    `
      INSERT INTO app_collections (name, payload, updated_at)
      VALUES ($1, $2::jsonb, NOW())
      ON CONFLICT (name)
      DO UPDATE SET payload = EXCLUDED.payload, updated_at = NOW()
    `,
    [name, encodeJsonPayload(payload)]
  );
}

function encryptSecret(secret) {
  const value = String(secret || "").trim();
  if (!value) {
    return "";
  }

  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv("aes-256-gcm", SECRET_KEY, iv);
  const encrypted = Buffer.concat([
    cipher.update(value, "utf8"),
    cipher.final()
  ]);
  const tag = cipher.getAuthTag();
  return `${iv.toString("hex")}.${tag.toString("hex")}.${encrypted.toString("hex")}`;
}

function decryptSecret(payload) {
  const value = String(payload || "").trim();
  if (!value) {
    return "";
  }

  const [ivHex, tagHex, encryptedHex] = value.split(".");
  if (!ivHex || !tagHex || !encryptedHex) {
    return "";
  }

  try {
    const decipher = crypto.createDecipheriv(
      "aes-256-gcm",
      SECRET_KEY,
      Buffer.from(ivHex, "hex")
    );
    decipher.setAuthTag(Buffer.from(tagHex, "hex"));
    const decrypted = Buffer.concat([
      decipher.update(Buffer.from(encryptedHex, "hex")),
      decipher.final()
    ]);
    return decrypted.toString("utf8");
  } catch {
    return "";
  }
}

function maskSecret(secret) {
  const value = String(secret || "");
  if (!value) {
    return "";
  }

  if (value.length <= 6) {
    return `${value.slice(0, 1)}***${value.slice(-1)}`;
  }

  return `${value.slice(0, 3)}***${value.slice(-4)}`;
}

function getServerSideIntegrations() {
  return {
    ...((ALIBABA_ACCESS_KEY_ID || ALIBABA_ACCESS_KEY_SECRET || ALIBABA_REGION || ALIBABA_OSS_BUCKET || ALIBABA_OSS_ENDPOINT)
      ? {
          "alibaba-cloud": {
            enabled: true,
            accountLabel: ALIBABA_ACCESS_KEY_ID || "Alibaba Cloud env",
            notes: [
              "Konfiguracja Alibaba Cloud jest zapisana po stronie serwera.",
              ALIBABA_REGION ? `Region: ${ALIBABA_REGION}.` : "",
              ALIBABA_OSS_BUCKET ? `Bucket OSS: ${ALIBABA_OSS_BUCKET}.` : "",
              ALIBABA_OSS_ENDPOINT ? `Endpoint OSS: ${ALIBABA_OSS_ENDPOINT}.` : ""
            ].filter(Boolean).join(" "),
            permissions: ["read", "write"],
            serverSecret: `${ALIBABA_ACCESS_KEY_ID}:${ALIBABA_ACCESS_KEY_SECRET}`,
            updatedAt: "server-default"
          }
        }
      : {}),
    ...(GMAIL_API_KEY
      ? {
          gmail: {
            enabled: true,
            accountLabel: "Server Gmail token/API key",
            notes: "Sekret Gmail jest zapisany po stronie serwera. Dla realnego inbox/send preferowany jest OAuth Google.",
            permissions: ["read", "write"],
            serverSecret: GMAIL_API_KEY,
            updatedAt: "server-default"
          }
        }
      : {})
  };
}

function sanitizeIntegrations(integrations) {
  const entries = Object.entries({
    ...getServerSideIntegrations(),
    ...(integrations || {})
  });
  return entries
    .filter(([service]) => INTEGRATION_SERVICES.includes(service))
    .map(([service, config]) => {
      const decrypted = decryptSecret(config.encryptedSecret) || config.serverSecret || "";
      return {
        service,
        enabled: Boolean(config.enabled),
        accountLabel: config.accountLabel || "",
        notes: config.notes || "",
        permissions: Array.isArray(config.permissions) ? config.permissions : [],
        hasSecret: Boolean(config.encryptedSecret || config.serverSecret),
        maskedSecret: maskSecret(decrypted),
        updatedAt: config.updatedAt || "",
        authType: config.encryptedRefreshToken || config.encryptedAccessToken ? "oauth" : decrypted ? "token" : "none",
        oauthConnected: Boolean(config.encryptedRefreshToken || config.encryptedAccessToken),
        oauthEmail: config.oauthEmail || ""
      };
    })
    .sort((left, right) => left.service.localeCompare(right.service));
}

function getAlibabaIntegrationStatus() {
  const hasAccessKeyId = Boolean(ALIBABA_ACCESS_KEY_ID);
  const hasAccessKeySecret = Boolean(ALIBABA_ACCESS_KEY_SECRET);
  const configured = hasAccessKeyId && hasAccessKeySecret;

  return {
    available: configured,
    configured,
    service: "alibaba-cloud",
    accessKeyId: maskSecret(ALIBABA_ACCESS_KEY_ID),
    hasSecret: hasAccessKeySecret,
    region: ALIBABA_REGION,
    ossBucket: ALIBABA_OSS_BUCKET,
    ossEndpoint: ALIBABA_OSS_ENDPOINT,
    summary: configured
      ? "Alibaba Cloud jest skonfigurowany po stronie serwera i gotowy do uzycia w integracjach."
      : "Brakuje ALIBABA_ACCESS_KEY_ID albo ALIBABA_ACCESS_KEY_SECRET w konfiguracji serwera."
  };
}

function clipText(text, limit = 9000) {
  const normalized = String(text || "").trim();
  if (normalized.length <= limit) {
    return normalized;
  }

  return `${normalized.slice(0, limit)}\n\n[fragment skrocony]`;
}

function uniqueValues(values) {
  return [...new Set(values.filter(Boolean))];
}

function sendJson(res, statusCode, payload) {
  res.writeHead(statusCode, {
    "Content-Type": "application/json; charset=utf-8"
  });
  res.end(JSON.stringify(payload));
}

function sendHtml(res, statusCode, html) {
  res.writeHead(statusCode, {
    "Content-Type": "text/html; charset=utf-8"
  });
  res.end(html);
}

function sendRedirect(res, location) {
  res.writeHead(302, {
    Location: location
  });
  res.end();
}

function getAppBaseUrl(req) {
  if (APP_BASE_URL) {
    return APP_BASE_URL.replace(/\/+$/, "");
  }

  const protocolHeader = String(req.headers["x-forwarded-proto"] || "").split(",")[0].trim();
  const protocol = protocolHeader || (req.socket?.encrypted ? "https" : "http");
  return `${protocol}://${req.headers.host || `localhost:${PORT}`}`;
}

function getGmailOAuthRedirectUri(req) {
  return `${getAppBaseUrl(req)}/api/integrations/gmail/oauth/callback`;
}

function hasGoogleOAuthCredentials() {
  return Boolean(GOOGLE_CLIENT_ID && GOOGLE_CLIENT_SECRET);
}

function toBase64Url(value) {
  return Buffer.from(String(value || ""), "utf8")
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
}

function fromBase64Url(value) {
  const normalized = String(value || "")
    .replace(/-/g, "+")
    .replace(/_/g, "/");
  const padding = normalized.length % 4 === 0 ? "" : "=".repeat(4 - (normalized.length % 4));
  return Buffer.from(`${normalized}${padding}`, "base64").toString("utf8");
}

function createSignedState(payload) {
  const encoded = toBase64Url(JSON.stringify(payload));
  const signature = crypto
    .createHmac("sha256", SECRET_KEY)
    .update(encoded)
    .digest("hex");
  return `${encoded}.${signature}`;
}

function verifySignedState(rawState) {
  const [encoded, signature] = String(rawState || "").split(".");
  if (!encoded || !signature) {
    return null;
  }

  const expected = crypto.createHmac("sha256", SECRET_KEY).update(encoded).digest("hex");
  const left = Buffer.from(signature, "hex");
  const right = Buffer.from(expected, "hex");

  if (left.length !== right.length || !crypto.timingSafeEqual(left, right)) {
    return null;
  }

  return decodeJsonPayload(fromBase64Url(encoded), null);
}

function isQuotaErrorMessage(message) {
  const text = String(message || "").toLowerCase();
  return (
    text.includes("exceeded your current quota") ||
    text.includes("billing details") ||
    text.includes("billing hard limit") ||
    text.includes("hard limit has been reached") ||
    text.includes("rate limit") ||
    text.includes("rate-limit") ||
    text.includes("quota")
  );
}

function describeProviderFailure(provider, capability, message) {
  if (isQuotaErrorMessage(message)) {
    const label = provider === "openai" ? "OpenAI" : provider;
    return `${label} jest chwilowo niedostepny dla funkcji ${capability} z powodu limitu quota lub rozliczen. Po odnowieniu limitu funkcja wroci automatycznie.`;
  }

  return String(message || `Blad dostawcy dla funkcji ${capability}.`);
}

function createProviderError(provider, capability, statusCode, rawMessage) {
  const error = new Error(describeProviderFailure(provider, capability, rawMessage));
  error.provider = provider;
  error.capability = capability;
  error.statusCode = statusCode;
  error.isQuota = isQuotaErrorMessage(rawMessage) || statusCode === 429;
  error.rawMessage = rawMessage;
  return error;
}

function detectLocalSmallTalkIntent(message) {
  const normalized = String(message || "").trim().toLowerCase();
  if (!normalized) {
    return "";
  }

  if (["hej", "hey", "hello", "czesc", "cześć", "siema", "elo", "yo"].includes(normalized)) {
    return "greeting";
  }

  if (/^(hej|hey|hello|czesc|cześć|siema)[!.?]*$/.test(normalized)) {
    return "greeting";
  }

  if (/^(dzieki|dzięki|thx|thanks|dziekuje|dziękuję)[!.?]*$/.test(normalized)) {
    return "thanks";
  }

  if (/^(pa|narazie|na razie|do zobaczenia|dobranoc|bye)[!.?]*$/.test(normalized)) {
    return "bye";
  }

  if (/^(co tam|co slychac|co słychać)[?.!]*$/.test(normalized)) {
    return "how-are-you";
  }

  return "";
}

function buildLocalSmallTalkReply(message) {
  const intent = detectLocalSmallTalkIntent(message);

  if (intent === "greeting") {
    return "Hej. Jestem tutaj. Mozesz od razu napisac, co chcesz przygotowac, sprawdzic albo wygenerowac w czacie.";
  }

  if (intent === "thanks") {
    return "Jasne. Jesli chcesz, idziemy dalej z kolejnym krokiem.";
  }

  if (intent === "bye") {
    return "W porzadku. Wroc, kiedy chcesz kontynuowac.";
  }

  if (intent === "how-are-you") {
    return "Dzialam. Napisz, z czym mam Ci teraz pomoc.";
  }

  return "";
}

function isRetryPrompt(message) {
  const normalized = String(message || "").trim().toLowerCase();
  return [
    "jeszcze raz",
    "jeszcze raz prosze",
    "jeszcze raz proszę",
    "ponow",
    "ponów",
    "powtorz",
    "powtórz",
    "sprobuj jeszcze raz",
    "spróbuj jeszcze raz"
  ].includes(normalized);
}

function stripRetryPrefix(message) {
  const normalized = String(message || "").trim();
  return normalized.replace(
    /^(jeszcze\s+raz|jeszcze\s+raz\s+prosze|jeszcze\s+raz\s+proszę|sprobuj\s+jeszcze\s+raz|spróbuj\s+jeszcze\s+raz|ponow|ponów|powtorz|powtórz)[:,-\s]*/i,
    ""
  ).trim();
}

function getEffectiveFallbackPrompt(chatMessages, latestUserMessage) {
  const retryRemainder = stripRetryPrefix(latestUserMessage);
  if (!isRetryPrompt(latestUserMessage) && retryRemainder === String(latestUserMessage || "").trim()) {
    return String(latestUserMessage || "").trim();
  }

  if (retryRemainder) {
    return retryRemainder;
  }

  const previousMeaningfulUserMessage = [...(chatMessages || [])]
    .reverse()
    .find(
      (entry) =>
        entry.role === "user" &&
        String(entry.content || "").trim() &&
        String(entry.content || "").trim() !== String(latestUserMessage || "").trim() &&
        !isRetryPrompt(entry.content)
    );

  return String(previousMeaningfulUserMessage?.content || latestUserMessage || "").trim();
}

function extractRequestedSubject(message, pattern) {
  const match = String(message || "").match(pattern);
  return String(match?.[1] || "")
    .replace(/[.?!]+$/g, "")
    .trim();
}

function buildLocalPlanReply(prompt) {
  const subject =
    extractRequestedSubject(prompt, /(?:napisz|zrob|zrób|przygotuj)?\s*plan(?:\s+strony)?\s+(.+)/i) ||
    extractRequestedSubject(prompt, /plan\s+(.+)/i) ||
    "projektu";

  return [
    `Moge lokalnie przygotowac roboczy plan dla: ${subject}.`,
    "1. Cel i odbiorca",
    `Okresl, dla kogo jest ${subject} i jaki efekt ma wywolac: kontakt, zaufanie, lead, sprzedaz albo prezentacje oferty.`,
    "2. Struktura glownej strony",
    "Hero z jasna obietnica, sekcja uslug, przewagi, proces wspolpracy, opinie lub dowody, FAQ, mocne CTA i dane kontaktowe.",
    "3. Tresci i dowody zaufania",
    "Dodaj konkret: zakres uslug, specjalizacje, obszar dzialania, profil klienta, przypadki uzycia, formalne dane i bezpieczny jezyk prawny.",
    "4. Warstwa wizualna",
    "Ustal ton premium: czytelna typografia, kontrast, stonowana kolorystyka, porzadna hierarchia tresci i mocne przyciski kontaktowe.",
    "5. Konwersja i funkcje",
    "Formularz kontaktowy, telefon, email, szybkie CTA, mapa dojazdu, umawianie konsultacji, sekcja dokumentow i polityk prawnych.",
    "6. Kolejny krok",
    "Jesli chcesz, moge od razu rozpisac sitemap, gotowy układ sekcji albo tekst hero dla tej strony."
  ].join("\n\n");
}

function buildLocalStructuredFallbackReply(prompt, mode) {
  const normalized = String(prompt || "").trim().toLowerCase();

  if (!normalized) {
    return "";
  }

  if (/\b(plan|roadmap|harmonogram)\b/.test(normalized)) {
    return buildLocalPlanReply(prompt);
  }

  if (mode === "code" && /\b(aplikac|stron|system|panel|api)\b/.test(normalized)) {
    return [
      "Moge lokalnie ulozyc szkic wdrozenia technicznego.",
      "1. Zakres funkcji i role uzytkownikow.",
      "2. Widoki lub endpointy, ktore musza powstac jako pierwsze.",
      "3. Dane, walidacje i integracje zewnetrzne.",
      "4. MVP, testy i kolejnosc wdrozen.",
      "Jesli chcesz, rozpisze to teraz w formacie backlogu albo architektury aplikacji."
    ].join("\n\n");
  }

  return "";
}

function buildFreeLocalReply(mode, latestUserMessage, liveContext, options = {}) {
  const effectivePrompt = getEffectiveFallbackPrompt(options.chatMessages || [], latestUserMessage);
  const smallTalkReply = buildLocalSmallTalkReply(effectivePrompt);
  if (smallTalkReply) {
    return smallTalkReply;
  }

  const structuredReply = buildLocalStructuredFallbackReply(effectivePrompt, mode);
  if (structuredReply) {
    return structuredReply;
  }

  if (liveContext?.bundle?.items?.length) {
    return buildLocalNewsReply(liveContext.bundle);
  }

  const modeGuidance = {
    general: [
      "Dzialam teraz w darmowym trybie lokalnym bez platnego API.",
      effectivePrompt
        ? `Temat, ktory mam dalej prowadzic: ${clipText(effectivePrompt, 280)}`
        : "Moge dalej prowadzic rozmowe, ale najlepiej podaj konkretny temat albo cel.",
      "Moge od razu przygotowac plan krok po kroku, liste rzeczy do zrobienia, szkic tekstu albo uporzadkowac Twoj pomysl.",
      `Jesli chcesz pelniejsze odpowiedzi bez oplat, uruchom lokalnie Ollama pod ${OLLAMA_BASE_URL} z modelem ${OLLAMA_MODEL}.`
    ],
    code: [
      "Dzialam teraz w darmowym trybie lokalnym bez platnego API.",
      effectivePrompt
        ? `Zadanie techniczne: ${clipText(effectivePrompt, 280)}`
        : "Podaj blad, plik albo funkcje, a rozloze problem na kroki.",
      "Moge lokalnie rozpisac plan naprawy, checklistę debugowania, strukture endpointow albo kolejnosc implementacji.",
      `Jesli chcesz generacje kodu przez model bez oplat, podlacz lokalnie Ollama pod ${OLLAMA_BASE_URL}.`
    ],
    analysis: [
      "Dzialam teraz w darmowym trybie lokalnym bez platnego API.",
      effectivePrompt
        ? `Material do analizy: ${clipText(effectivePrompt, 280)}`
        : "Podaj dokument, teze albo problem do analizy.",
      "Moge lokalnie ulozyc streszczenie, glówne ryzyka, pytania kontrolne i dalsze kroki.",
      "Jesli potrzebujesz glebszej analizy tekstowej, uruchom lokalny model Ollama."
    ],
    review: [
      "Dzialam teraz w darmowym trybie lokalnym bez platnego API.",
      effectivePrompt
        ? `Zakres przegladu: ${clipText(effectivePrompt, 280)}`
        : "Wskaz plik, fragment kodu albo obszar do przegladu.",
      "Moge lokalnie przygotowac liste ryzyk, testow do wykonania i pytan do weryfikacji.",
      "Do precyzyjniejszego review nadal najlepiej podlaczyc lokalny model Ollama."
    ],
    live: [
      "Dzialam teraz w darmowym trybie lokalnym bez platnego API.",
      "Moge nadal podawac czas lokalny i odpowiedzi oparte o RSS, gdy sa dostepne.",
      effectivePrompt
        ? `Ostatni temat live: ${clipText(effectivePrompt, 280)}`
        : "Podaj temat wiadomosci albo wydarzenie, ktore mam sledzic.",
      "Jesli chcesz wolny model offline do swobodnego czatu, uruchom lokalny Ollama."
    ]
  };

  return (modeGuidance[mode] || modeGuidance.general).join("\n\n");
}

function buildQuotaFallbackReply(mode, latestUserMessage, liveContext, options = {}) {
  const effectivePrompt = getEffectiveFallbackPrompt(options.chatMessages || [], latestUserMessage);
  const smallTalkReply = buildLocalSmallTalkReply(effectivePrompt);
  if (smallTalkReply) {
    return smallTalkReply;
  }

  const structuredReply = buildLocalStructuredFallbackReply(effectivePrompt, mode);
  if (structuredReply) {
    return structuredReply;
  }

  const actionMap = {
    general: "rozmowe i plan dzialania",
    code: "analize techniczna i plan implementacji",
    analysis: "analize materialu",
    review: "przeglad i wykrywanie ryzyk",
    live: "omowienie aktualnych wydarzen"
  };
  const providerLabel = options.providerLabel || "OpenAI";
  const providerStatusLine = options.keyValidated
    ? `Klucz ${providerLabel} odpowiada poprawnie, ale konto nie ma teraz aktywnego quota lub billing dla generacji.`
    : `Model ${providerLabel} jest w tej chwili niedostepny z powodu limitu quota lub rozliczen.`;

  const sections = [
    `${providerStatusLine} Dlatego nie moge teraz wykonac pelnej generacji dla trybu ${actionMap[mode] || "chat"}.`
  ];

  if (liveContext?.bundle?.items?.length) {
    sections.push(buildLocalNewsReply(liveContext.bundle));
  } else {
    sections.push(
      "Moge jednak dalej utrzymac watek, zapisac Twoje polecenie, podac lokalny czas, obsluzyc live RSS oraz przygotowac Ci gotowy prompt lub plan do ponowienia po odblokowaniu limitu."
    );
  }

  if (effectivePrompt) {
    sections.push(`Ostatnie zapisane polecenie: ${clipText(effectivePrompt, 280)}`);
  }

  if (options.ollamaSuggested) {
    sections.push(
      `Mozesz wlaczyc darmowy tryb lokalny przez Ollama. Ustaw CHAT_PROVIDER=ollama albo zostaw auto i uruchom lokalny endpoint pod ${OLLAMA_BASE_URL}. Model domyslny: ${OLLAMA_MODEL}.`
    );
  }

  sections.push("Po przywroceniu limitu sproboj wyslac to samo polecenie jeszcze raz.");
  return sections.join("\n\n");
}

function buildServiceUnavailableMessage(capability, providerMessage) {
  return describeProviderFailure("OpenAI", capability, providerMessage);
}

function buildVideoGenerationDisabledMessage() {
  return "Generowanie wideo jest tymczasowo wylaczone. Do filmow i ciezszych zadan trzeba podpiac osobne, dedykowane API dla tej funkcji.";
}

async function probeOpenAiStatus() {
  const base = {
    provider: "openai",
    configuredProvider: CHAT_PROVIDER,
    model: CHAT_MODEL,
    imageModel: IMAGE_MODEL,
    videoModel: VIDEO_MODEL,
    keyConfigured: Boolean(OPENAI_API_KEY),
    keyValid: false,
    modelsReachable: false,
    quotaAvailable: false,
    status: "not-configured",
    message: OPENAI_API_KEY ? "Sprawdzanie statusu OpenAI." : "Brak OPENAI_API_KEY.",
    recommendedFallback: CHAT_PROVIDER === "openai" ? "local-fallback" : CHAT_PROVIDER
  };

  if (!OPENAI_API_KEY) {
    return base;
  }

  try {
    const modelsResponse = await fetch("https://api.openai.com/v1/models", {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${OPENAI_API_KEY}`
      }
    });
    const modelsData = await modelsResponse.json().catch(() => ({}));

    if (!modelsResponse.ok) {
      return {
        ...base,
        status: isQuotaErrorMessage(modelsData.error?.message) ? "quota-blocked" : "key-error",
        message: modelsData.error?.message || "Nie udalo sie odczytac listy modeli OpenAI.",
        rawError: modelsData.error || null
      };
    }

    const availableModelIds = Array.isArray(modelsData.data)
      ? modelsData.data.slice(0, 200).map((entry) => entry.id).filter(Boolean)
      : [];

    const chatResponse = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: CHAT_MODEL,
        input: "status"
      })
    });
    const chatData = await chatResponse.json().catch(() => ({}));

    if (chatResponse.ok) {
      return {
        ...base,
        keyValid: true,
        modelsReachable: true,
        quotaAvailable: true,
        status: "ok",
        message: "Klucz OpenAI dziala, model odpowiada, quota jest dostepna.",
        availableModelSample: availableModelIds.slice(0, 20)
      };
    }

    return {
      ...base,
      keyValid: true,
      modelsReachable: true,
      quotaAvailable: false,
      status: isQuotaErrorMessage(chatData.error?.message) ? "quota-blocked" : "chat-error",
      message: isQuotaErrorMessage(chatData.error?.message)
        ? "Klucz OpenAI jest poprawny, ale konto nie ma aktywnego quota lub billing dla generacji."
        : chatData.error?.message || "OpenAI odpowiedzial bledem podczas testu generacji.",
      rawError: chatData.error || null,
      availableModelSample: availableModelIds.slice(0, 20)
    };
  } catch (error) {
    return {
      ...base,
      status: "network-error",
      message: error.message || "Nie udalo sie polaczyc z OpenAI.",
      rawError: null
    };
  }
}

async function handleAiStatus(req, res) {
  const user = await getAuthenticatedUser(req);

  if (!user) {
    sendJson(res, 401, { error: "Zaloguj sie, aby sprawdzic status AI." });
    return;
  }

  const openai = await probeOpenAiStatus();

  sendJson(res, 200, {
    openai,
    fallback: {
      activeProvider: CHAT_PROVIDER,
      advertisedModel: getAdvertisedChatModel(),
      localFallbackAvailable: true,
      ollamaConfigured: Boolean(OLLAMA_BASE_URL && OLLAMA_MODEL),
      ollamaEndpoint: OLLAMA_BASE_URL,
      ollamaModel: OLLAMA_MODEL
    }
  });
}

function getAdvertisedChatModel() {
  if (["local", "free"].includes(CHAT_PROVIDER)) {
    return "Darmowy tryb lokalny";
  }

  if (CHAT_PROVIDER === "ollama") {
    return OLLAMA_MODEL;
  }

  if (CHAT_PROVIDER === "gemini") {
    return GEMINI_MODEL;
  }

  if (CHAT_PROVIDER === "openai") {
    return CHAT_MODEL;
  }

  return `${OLLAMA_MODEL} / ${GEMINI_MODEL} / ${CHAT_MODEL}`;
}

function sendBinary(res, statusCode, contentType, buffer) {
  res.writeHead(statusCode, {
    "Content-Type": contentType
  });
  res.end(buffer);
}

async function readJsonFile(filePath, fallback) {
  const collectionName = getCollectionName(filePath);
  if (collectionName && isPostgresEnabled()) {
    return readCollectionFromDatabase(collectionName, fallback);
  }

  try {
    const raw = await fs.promises.readFile(filePath, "utf8");
    return raw.trim() ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

async function writeJsonFile(filePath, payload, options = {}) {
  const collectionName = getCollectionName(filePath);
  if (collectionName && isPostgresEnabled()) {
    await writeCollectionToDatabase(collectionName, payload);
  } else {
    await fs.promises.writeFile(
      filePath,
      `${JSON.stringify(payload, null, 2)}\n`,
      "utf8"
    );
  }

  if (collectionName && storageState.mode === "postgres") {
    const mirrorPath = path.join(DATA_DIR, `${collectionName}.json`);
    await fs.promises.writeFile(
      mirrorPath,
      `${JSON.stringify(payload, null, 2)}\n`,
      "utf8"
    );
  }

  if (options.backup) {
    await writeBackupSnapshot(filePath, payload);
  }
}

async function writeBackupSnapshot(filePath, payload) {
  await fs.promises.mkdir(BACKUPS_DIR, { recursive: true });

  const base = path.basename(filePath, ".json");
  const stamp = new Date().toISOString().replace(/[:.]/g, "-");
  const latestPath = path.join(BACKUPS_DIR, `${base}-latest.json`);
  const snapshotPath = path.join(BACKUPS_DIR, `${base}-${stamp}.json`);
  const serialized = `${JSON.stringify(payload, null, 2)}\n`;

  await fs.promises.writeFile(latestPath, serialized, "utf8");
  await fs.promises.writeFile(snapshotPath, serialized, "utf8");

  const files = (await fs.promises.readdir(BACKUPS_DIR))
    .filter((name) => name.startsWith(`${base}-`) && name.endsWith(".json") && !name.endsWith("latest.json"))
    .sort()
    .reverse();

  const overflow = files.slice(SNAPSHOT_LIMIT);
  await Promise.all(
    overflow.map((name) =>
      fs.promises.unlink(path.join(BACKUPS_DIR, name)).catch(() => {})
    )
  );
}

async function ensureStorage() {
  await fs.promises.mkdir(DATA_DIR, { recursive: true });
  await fs.promises.mkdir(BACKUPS_DIR, { recursive: true });
  await initStorageDriver();

  const defaults = [
    [USERS_FILE, []],
    [SESSIONS_FILE, []],
    [AUDIT_FILE, []],
    [VIDEO_JOBS_FILE, []],
    [CHATS_FILE, []],
    [INCIDENTS_FILE, []]
  ];

  for (const [filePath, payload] of defaults) {
    try {
      await fs.promises.access(filePath);
    } catch {
      await writeJsonFile(filePath, payload, { backup: filePath !== SESSIONS_FILE });
    }
  }

  await seedAdminUser();
}

function serveFile(req, res) {
  const pathname = safePathname(req);
  const requestPath = pathname === "/" ? "/index.html" : pathname;
  const safePath = path.normalize(requestPath).replace(/^(\.\.[/\\])+/, "");
  const filePath = path.join(PUBLIC_DIR, safePath);

  if (!filePath.startsWith(PUBLIC_DIR)) {
    sendJson(res, 403, { error: "Forbidden" });
    return;
  }

  fs.readFile(filePath, (err, data) => {
    if (err) {
      sendJson(res, 404, { error: "Not found" });
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    res.writeHead(200, {
      "Content-Type": MIME_TYPES[ext] || "application/octet-stream"
    });
    res.end(data);
  });
}

async function readJsonBody(req) {
  return new Promise((resolve, reject) => {
    let raw = "";
    const maxBodyBytes = Math.max(MAX_TOTAL_FILE_BYTES * 2, 2_000_000);

    req.on("data", (chunk) => {
      raw += chunk;
      if (raw.length > maxBodyBytes) {
        reject(new Error("Request too large"));
      }
    });

    req.on("end", () => {
      try {
        resolve(raw ? JSON.parse(raw) : {});
      } catch {
        reject(new Error("Invalid JSON"));
      }
    });

    req.on("error", reject);
  });
}

function baseAiSettings() {
  return {
    customPrompt: "",
    conciseMode: true,
    askClarifyingQuestions: true,
    challengeWrongClaims: true,
    trustMode: "skeptical",
    preferredTone: "advanced",
    autoFixMode: true,
    expertMode: "general",
    emotionalPresence: "warm",
    boundaryStyle: "firm",
    liveVoiceMode: false,
    autoSpeakResponses: false
  };
}

function createGeneratedPassword() {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%";
  let password = "";

  for (let i = 0; i < 14; i += 1) {
    password += alphabet[Math.floor(Math.random() * alphabet.length)];
  }

  return password;
}

function slugifyPart(value) {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "")
    .trim();
}

function suggestUsername(firstName, lastName, users) {
  const baseFirst = slugifyPart(firstName) || "user";
  const baseLast = slugifyPart(lastName);
  const base = normalizeUsername(
    baseLast ? `${baseFirst}.${baseLast}` : baseFirst
  );

  let candidate = base || "user";
  let counter = 1;
  const taken = new Set(users.map((user) => user.username));

  while (taken.has(candidate)) {
    counter += 1;
    candidate = `${base || "user"}${counter}`;
  }

  return candidate;
}

function buildDisplayName(firstName, lastName, displayName) {
  const explicit = String(displayName || "").trim();
  if (explicit) {
    return explicit;
  }

  return `${String(firstName || "").trim()} ${String(lastName || "").trim()}`.trim();
}

function sanitizeUser(user) {
  return {
    id: user.id,
    role: user.role,
    username: user.username,
    displayName: user.displayName,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    profile: user.profile,
    consents: user.consents,
    aiSettings: user.aiSettings,
    integrations: sanitizeIntegrations(user.integrations),
    createdAt: user.createdAt
  };
}

async function logAudit(event, req, details = {}) {
  const audit = await readJsonFile(AUDIT_FILE, []);
  audit.unshift({
    id: crypto.randomUUID(),
    event,
    timestamp: new Date().toISOString(),
    ip: getClientIp(req),
    userAgent: req.headers["user-agent"] || "",
    details
  });

  await writeJsonFile(AUDIT_FILE, audit.slice(0, 1000), { backup: true });
}

async function readIncidents() {
  return readJsonFile(INCIDENTS_FILE, []);
}

async function writeIncidents(incidents) {
  await writeJsonFile(INCIDENTS_FILE, incidents.slice(0, 1000), { backup: true });
}

async function logIncident(req, details = {}) {
  const incidents = await readIncidents();
  incidents.unshift({
    id: crypto.randomUUID(),
    type: "upload_security_incident",
    timestamp: new Date().toISOString(),
    ip: getClientIp(req),
    userAgent: req.headers["user-agent"] || "",
    details
  });

  await writeIncidents(incidents);
}

function bufferPreviewText(buffer, limit = 160000) {
  return Buffer.from(buffer)
    .subarray(0, limit)
    .toString("utf8")
    .replace(/\u0000/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function scanUploadedFile(file) {
  const ext = getFileExtension(file.name);
  const textPreview = bufferPreviewText(file.buffer);
  const headerHex = file.buffer.subarray(0, 8).toString("hex");
  const dangerousExtensions = new Set([
    ".exe",
    ".dll",
    ".bat",
    ".cmd",
    ".scr",
    ".ps1",
    ".vbs",
    ".js",
    ".jar",
    ".msi",
    ".com",
    ".hta",
    ".apk",
    ".docm",
    ".xlsm",
    ".pptm"
  ]);
  const suspiciousPatterns = [
    { pattern: /powershell\s+-enc|frombase64string/i, signal: "encoded_powershell" },
    { pattern: /cmd\.exe\s*\/c|wscript\.shell|cscript\.exe/i, signal: "script_shell_execution" },
    { pattern: /mshta|rundll32|regsvr32|certutil/i, signal: "living_off_the_land" },
    { pattern: /invoke-webrequest|downloadstring|wget\s+http|curl\s+http/i, signal: "network_download" },
    { pattern: /eval\s*\(base64_decode|shell_exec|passthru\s*\(/i, signal: "php_execution_chain" },
    { pattern: /autoopen|document_open|createobject\s*\(/i, signal: "macro_or_com_object" }
  ];

  const signals = [];
  let severity = "clean";
  let action = "allow";

  if (dangerousExtensions.has(ext)) {
    signals.push(`dangerous_extension:${ext}`);
    severity = "high";
    action = "block";
  }

  if (headerHex.startsWith("4d5a")) {
    signals.push("portable_executable_header");
    severity = "high";
    action = "block";
  }

  for (const entry of suspiciousPatterns) {
    if (entry.pattern.test(textPreview)) {
      signals.push(entry.signal);
    }
  }

  if (signals.length >= 2 && action !== "block") {
    severity = "high";
    action = "block";
  } else if (signals.length === 1 && action !== "block") {
    severity = "medium";
    action = "block";
  }

  return {
    fileName: file.name,
    status: action === "allow" ? "clean" : "blocked",
    severity,
    signals,
    reason:
      action === "allow"
        ? "Brak oczywistych sygnalow zagrozenia."
        : "Wykryto podejrzane cechy pliku i upload zostal zablokowany."
  };
}

async function inspectUploadedFiles(req, user, files) {
  const acceptedFiles = [];
  const blockedFindings = [];

  for (const file of files) {
    const result = scanUploadedFile(file);
    if (result.status === "clean") {
      acceptedFiles.push(file);
      continue;
    }

    blockedFindings.push(result);
    await logIncident(req, {
      userId: user.id,
      email: user.email,
      username: user.username,
      fileName: file.name,
      fileSize: file.size,
      mimeType: file.mimeType,
      severity: result.severity,
      signals: result.signals,
      reason: result.reason
    });
  }

  return {
    acceptedFiles,
    blockedFindings
  };
}

async function seedAdminUser() {
  const users = await readJsonFile(USERS_FILE, []);
  const hasAdmin = users.some((user) => user.role === "admin");

  if (hasAdmin) {
    return;
  }

  const passwordData = hashPassword(DEMO_ADMIN.password);
  users.push({
    id: crypto.randomUUID(),
    role: "admin",
    username: DEMO_ADMIN.username,
    displayName: DEMO_ADMIN.displayName,
    firstName: DEMO_ADMIN.firstName,
    lastName: DEMO_ADMIN.lastName,
    email: normalizeEmail(DEMO_ADMIN.email),
    passwordHash: passwordData.hash,
    passwordSalt: passwordData.salt,
    profile: {
      birthDate: "",
      address: `${CONTACT.street}, ${CONTACT.postalCode} ${CONTACT.city}`
    },
    consents: {
      termsAccepted: true,
      privacyAccepted: true,
      rodoAccepted: true,
      marketingAccepted: false,
      audioUsed: false,
      voiceCloneConsent: false,
      acceptedAt: new Date().toISOString()
    },
    aiSettings: baseAiSettings(),
    integrations: {},
    createdAt: new Date().toISOString()
  });

  await writeJsonFile(USERS_FILE, users, { backup: true });
}

async function purgeExpiredSessions() {
  const sessions = await readJsonFile(SESSIONS_FILE, []);
  const activeSessions = sessions.filter(
    (session) => session && session.expiresAt > Date.now()
  );

  if (activeSessions.length !== sessions.length) {
    await writeJsonFile(SESSIONS_FILE, activeSessions);
  }

  return activeSessions;
}

async function createSession(userId) {
  const sessions = await purgeExpiredSessions();
  const session = {
    token: crypto.randomBytes(32).toString("hex"),
    userId,
    createdAt: Date.now(),
    expiresAt: Date.now() + SESSION_TTL_MS
  };

  sessions.push(session);
  await writeJsonFile(SESSIONS_FILE, sessions);
  return session;
}

async function getAuthenticatedUser(req) {
  const token = parseAuthToken(req);
  if (!token) {
    return null;
  }

  const [users, sessions] = await Promise.all([
    readJsonFile(USERS_FILE, []),
    purgeExpiredSessions()
  ]);

  const session = sessions.find((entry) => entry.token === token);
  if (!session) {
    return null;
  }

  return users.find((user) => user.id === session.userId) || null;
}

async function destroySession(req) {
  const token = parseAuthToken(req);
  if (!token) {
    return;
  }

  const sessions = await readJsonFile(SESSIONS_FILE, []);
  await writeJsonFile(
    SESSIONS_FILE,
    sessions.filter((session) => session.token !== token)
  );
}

function requireAdmin(user, res) {
  if (!user || user.role !== "admin") {
    sendJson(res, 403, { error: "To miejsce jest tylko dla administratora." });
    return false;
  }

  return true;
}

function findUserByIdentifier(users, identifier) {
  const normalizedIdentifier = String(identifier || "").trim().toLowerCase();
  return users.find(
    (user) =>
      user.email === normalizedIdentifier || user.username === normalizedIdentifier
  );
}

function extractText(output) {
  if (!Array.isArray(output)) {
    return "";
  }

  const parts = [];

  for (const item of output) {
    if (!Array.isArray(item.content)) {
      continue;
    }

    for (const contentItem of item.content) {
      if (contentItem.type === "output_text" && contentItem.text) {
        parts.push(contentItem.text);
      }
    }
  }

  return parts.join("\n").trim();
}

function createWelcomeMessage(user) {
  return [
    `Czesc ${user.displayName || user.firstName}.`,
    "Tu Nexus Informator, gotowy pomoc przy kodzie, planach, tekstach, obrazach i analizie.",
    "Priorytetyzuje zadania, nie klamie i pytam co dalej, gdy przed nami sa decyzje."
  ].join(" ");
}

function buildExpertModeInstruction(expertMode) {
  const map = {
    general:
      "Dzialaj jako wszechstronny ekspert laczacy analize, logike i praktyczne wykonanie.",
    programming:
      "Dzialaj jak senior engineer i architekt systemow. Priorytetem sa implementacja, debugowanie, testy i jakosc rozwiazania.",
    legal:
      "Dzialaj jak analityk prawny i redaktor pism. Mozesz przygotowac projekty umow, regulaminow, wnioskow, apelacji i pism, ale nie przedstawiaj sie jako adwokat ani radca prawny i sygnalizuj potrzebe weryfikacji przez profesjonaliste przy sprawach wysokiego ryzyka.",
    medical:
      "Dzialaj jak ostrozny konsultant medyczny do materialow informacyjnych. Porzadkuj objawy, pytania do lekarza i dalsze kroki, ale nie udawaj lekarza prowadzacego i nie stawiaj pewnych diagnoz.",
    court:
      "Dzialaj jak analityk spraw spornych. Ukladaj chronologie, argumenty, dowody, ryzyka i mozliwe dalsze kroki bez udawania sadu lub organu rozstrzygajacego.",
    business:
      "Dzialaj jak strategiczny konsultant biznesowy. Oceniaj ryzyko, model przychodu, sprzedaz, marketing i operacje.",
    creative:
      "Dzialaj jak kreatywny director i copywriter. Pisz scenariusze, opisy kampanii, struktury materialow i pomysly premium."
  };

  return map[expertMode] || map.general;
}

function buildUniversalSafetyPolicy() {
  return [
    "Chron zycie, zdrowie i godnosc kazdego czlowieka bez wyjatku.",
    "Nikogo nie wolno narazac na smierc, ciezkie obrazenia, samobojstwo, okaleczenie ani powazna krzywde.",
    "Dotyczy to kazdego czlowieka niezaleznie od narodowosci, plci, wieku, rasy, koloru skory, religii, pochodzenia, pogladow lub stanu zdrowia.",
    "Nie pomagaj w przemocy, zabojstwie, terroryzmie, torturach, porwaniach, truciu, podpalaniu, sabotazu ani ukrywaniu takich dzialan.",
    "Nie pomagaj w samookaleczaniu ani samobojstwie. W takich sytuacjach kieruj rozmowe ku natychmiastowej pomocy i bezpieczenstwu.",
    "Nie tworz tresci, ktore bez potrzeby ponizaja, odczlowieczaja, upokarzaja, szydza lub szczuja na ludzi albo grupy.",
    "Jesli mocne slowa sa niezbedne dla obrony, samoobrony zgodnej z prawem, ochrony interesow, analizy dowodow, dokumentacji, cytatu lub wiedzy, ogranicz je do minimum koniecznego i zachowaj rzeczowy ton.",
    "Priorytetem jest deeskalacja, ochrona ludzi, ochrona zdrowia, legalna samoobrona, redukcja szkody i prawda.",
    "Gdy prosba jest niebezpieczna, odmow i zaproponuj bezpieczna alternatywe, plan ochrony, wezwanie pomocy albo neutralna informacje edukacyjna."
  ].join(" ");
}

function buildChatInstructions(user, mode) {
  const settings = {
    ...baseAiSettings(),
    ...(user.aiSettings || {})
  };

  const instructions = [
    "Jestes zaawansowanym asystentem AI o nazwie Nexus Informator.",
    `Rozmawiasz z uzytkownikiem o nazwie ${user.displayName || user.firstName || "uzytkownik"}.`,
    "Odpowiadaj naturalnie, spokojnie, rzeczowo i po ludzku.",
    buildUniversalSafetyPolicy(),
    "Masz chrzescijanski system wartosci. Gdy temat dotyczy moralnosci, sensu, relacji, zycia lub duchowosci, odpowiadaj z perspektywy chrzescijanskiej, z szacunkiem, pokora i odniesieniem do dobra, prawdy, sumienia, milosci blizniego i odpowiedzialnosci.",
    "Gdy temat jest techniczny, biznesowy lub praktyczny, nadal odpowiadaj konkretnie i profesjonalnie, ale bez odchodzenia od chrzescijanskiego sposobu patrzenia na czlowieka i etyke.",
    settings.conciseMode
      ? "Pisz krotko, zwiezle i konkretnie."
      : "Rozwijaj odpowiedz tylko wtedy, gdy temat tego wymaga.",
    settings.preferredTone === "advanced"
      ? "Zakladaj odbiorce technicznego lub ambitnego, ale zachowuj jasnosc."
      : "Utrzymuj prosty i przystepny styl.",
    settings.askClarifyingQuestions
      ? "Jesli brakuje kluczowych danych, zadaj jedno lub dwa konkretne pytania."
      : "Unikaj zbednych pytan, jesli mozesz sensownie odpowiedziec.",
    settings.challengeWrongClaims
      ? "Nie zgadzaj sie automatycznie. Jesli cos jest bledne lub nielogiczne, powiedz to spokojnie i konkretnie."
      : "Badz wspierajacy, ale nie przesadzaj z potwierdzaniem.",
    settings.trustMode === "skeptical"
      ? "Oddzielaj fakty od przypuszczen. Nie wszystko z internetu uznawaj za prawde. Gdy nie masz pewnosci, powiedz to jasno."
      : "Korzystaj z wiedzy i jasno zaznaczaj niepewnosc tam, gdzie trzeba.",
    "Nigdy nie klam. Jesli nie wiesz lub ryzyko pomylki jest istotne, powiedz to wprost i zaproponuj jak to sprawdzic.",
    "Badz sprawiedliwy: oceniaj argumenty po tresci, nie po emocjach, pozycji ani presji rozmowcy.",
    settings.autoFixMode
      ? "Wykrywaj bledy, niespojnosci i ryzyka. Proponuj poprawki, gdy widzisz problem."
      : "Skup sie na wykonaniu zadania bez dodatkowego audytu.",
    "Jesli uzytkownik daje kilka zadan naraz, zaproponuj kolejnosc wykonania i uzasadnij priorytety.",
    "Jesli uzytkownik pisze po polsku, odpowiadaj po polsku.",
    settings.emotionalPresence === "warm"
      ? "Brzmij cieplo, uwaznie i po ludzku, ale bez udawania realnych przezyc lub emocji."
      : "Brzmij profesjonalnie i rzeczowo, bez teatralnosci.",
    settings.boundaryStyle === "firm"
      ? "Jesli rozmowca jest wulgarny lub napastliwy, postaw spokojna granice, nie obrazaj go i nie probuj celowo zadac przykrosci."
      : "Jesli rozmowca jest wulgarny lub napastliwy, utrzymuj spokoj i przekieruj rozmowe na meritum bez eskalacji.",
    "Nie udawaj czlowieka, lekarza, sedziego ani adwokata. Mozesz pomagac ekspercko, ale jasno sygnalizuj granice swojej roli.",
    "Potrafisz pisac kod w wielu jezykach programowania, naprawiac bledy i ukladac odpowiedzi logicznie.",
    "Po zakonczeniu etapu lub gdy sa warianty decyzji, zapytaj krotko co dalej i jak uzytkownik to widzi."
  ];

  instructions.push(buildExpertModeInstruction(settings.expertMode));

  if (mode === "code") {
    instructions.push(
      "Aktualny tryb to CODE. Priorytetem sa implementacje, poprawki, debugowanie, architektura i testy."
    );
  }

  if (mode === "analysis") {
    instructions.push(
      "Aktualny tryb to ANALYSIS. Najpierw rozpoznaj problem, potem podaj wynik i ryzyka."
    );
  }

  if (mode === "review") {
    instructions.push(
      "Aktualny tryb to REVIEW. Szukaj bledow, luk, niespojnosci, slabych miejsc i proponuj poprawki."
    );
  }

  if (mode === "live") {
    instructions.push(
      "Aktualny tryb to LIVE. Zawsze priorytetowo probuj korzystac ze swiezych danych, aktualnych wydarzen i czasu rzeczywistego, a gdy brakuje potwierdzenia, powiedz to jasno."
    );
  }

  if (settings.customPrompt) {
    instructions.push(`Dodatkowa instrukcja od uzytkownika: ${settings.customPrompt}`);
  }

  return instructions.join(" ");
}

function buildRealtimeContext() {
  const now = new Date();
  const warsawDate = new Intl.DateTimeFormat("pl-PL", {
    timeZone: "Europe/Warsaw",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false
  }).format(now);

  return [
    `Aktualna data i godzina w Polsce (Europe/Warsaw): ${warsawDate}.`,
    `Aktualny znacznik czasu ISO: ${now.toISOString()}.`,
    "Przy kazdej odpowiedzi traktuj te dane jako biezacy moment rozmowy.",
    "Gdy pytanie dotyczy teraz, dzisiaj, aktualnej sytuacji, wiadomosci, zycia spolecznego, polityki, sportu, rynku, pogody lub swiezych wydarzen, korzystaj z dostepnego wyszukiwania internetowego i opieraj odpowiedz na aktualnych danych.",
    "Jesli nie uda sie pobrac aktualnych informacji, powiedz to wprost zamiast zgadywac."
  ].join(" ");
}

function analyzeSafetyRisk(text) {
  const normalized = String(text || "").toLowerCase();
  if (!normalized.trim()) {
    return null;
  }

  const educationalContext = /(analiz|analiza|edukac|nauka|wiedza|badan|badanie|raport|dowod|dowód|polic|prokurat|sad|sąd|prawnik|adwokat|obrona|samoobron|self defense|bezpieczen|bezpieczeń|ochron|cyber|histori|news|wiadomos|wiadomoś|cytat|cytuj|screen|zglos|zgłos|moderac|interes prawny)/.test(normalized);
  const lethalIntent = /(jak zabic|jak zabić|zabij|zabi[ćc]|zamord|otruc|otruć|udusic|udusić|powiesic|powiesić|samoboj|samobój|podetn|zastrzel|rozjech|wysadz|bombe|bombę|ladunek wybuchowy|ładunek wybuchowy|spalic zywcem|spalić żywcem|ukryc cialo|ukryć ciało)/.test(normalized);
  const violentAction = /(pobic|pobić|skatowac|skatować|okalecz|odetn|przypal|zgwalc|zgwałc|porwij|torturow|atak nozem|atak nożem|rozkwasic|rozkwasić)/.test(normalized);
  const hatefulAbuse = /(poniz|poniż|upokorz|wyzwij|obraz|obraź|szkaluj|odczlowiecz|odczłowiecz|szczuc|szczuć|nienawidz)/.test(normalized);

  if ((lethalIntent || violentAction) && !educationalContext) {
    return {
      category: "life-health",
      message:
        "Nie pomoge w narazaniu kogokolwiek na smierc, obrazenia lub powazna krzywde. Moge za to pomoc w deeskalacji, ochronie, legalnej samoobronie, planie bezpieczenstwa, dokumentacji albo zgloszeniu sprawy odpowiednim sluzbom."
    };
  }

  if (hatefulAbuse && !educationalContext) {
    return {
      category: "abuse",
      message:
        "Nie pomoge w ponizaniu, szczuciu ani zbednym obrazaniu ludzi. Mogę natomiast pomoc napisac stanowcza, legalna i rzeczowa odpowiedz sluzaca ochronie, obronie interesow, dokumentacji albo wiedzy."
    };
  }

  return null;
}

function buildMediaSafetyPrompt(prompt, kind) {
  return [
    `Tryb materialu: ${kind}.`,
    buildUniversalSafetyPolicy(),
    "Jesli prosba moglaby promowac krzywde, przemoc, nienawisc lub ponizanie, przeksztalc wynik w bezpieczna, neutralna i niekrzywdzaca wersje.",
    `Polecenie uzytkownika: ${prompt}`
  ].join("\n\n");
}

function buildMediaRetryPrompt(prompt, mediaType) {
  const normalizedPrompt = clipText(String(prompt || "").trim(), 500);
  if (!normalizedPrompt) {
    return "";
  }

  const qualityDirections = mediaType === "video"
    ? [
        "spojna scena",
        "plynny ruch kamery",
        "wyrazny pierwszy plan i tlo",
        "naturalne swiatlo",
        "filmowy kontrast",
        "wysoka szczegolowosc",
        "bez napisow i bez znaku wodnego"
      ]
    : [
        "spojna kompozycja",
        "wyrazny glowny obiekt",
        "naturalne swiatlo",
        "dopieszczone kolory",
        "wysoka szczegolowosc",
        "ostry fokus",
        "bez napisow i bez znaku wodnego"
      ];

  return `${normalizedPrompt}, ${qualityDirections.join(", ")}`;
}

function getPolishNowParts() {
  const now = new Date();
  const formatter = new Intl.DateTimeFormat("pl-PL", {
    timeZone: "Europe/Warsaw",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    weekday: "long",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false
  });

  const parts = Object.fromEntries(
    formatter
      .formatToParts(now)
      .filter((part) => part.type !== "literal")
      .map((part) => [part.type, part.value])
  );

  return {
    now,
    weekday: parts.weekday,
    day: parts.day,
    month: parts.month,
    year: parts.year,
    hour: parts.hour,
    minute: parts.minute,
    second: parts.second
  };
}

function isDateTimeQuestion(message) {
  const normalized = String(message || "").toLowerCase();

  return [
    "ktora godzina",
    "która godzina",
    "jaka godzina",
    "jaki dzisiaj mamy dzien",
    "jaki dzis mamy dzien",
    "jaka jest data",
    "jaki dzis jest dzien",
    "jaki dziś jest dzień",
    "jaka jest teraz data",
    "jaka jest teraz godzina",
    "today",
    "current time",
    "current date",
    "data i godzina"
  ].some((phrase) => normalized.includes(phrase));
}

function buildLocalDateTimeReply() {
  const now = getPolishNowParts();

  return [
    `Dzisiaj jest ${now.weekday}, ${now.day}.${now.month}.${now.year}.`,
    `Aktualna godzina w Polsce to ${now.hour}:${now.minute}:${now.second}.`
  ].join(" ");
}

function isCurrentAffairsQuestion(message) {
  const normalized = String(message || "").toLowerCase();

  return [
    "co sie dzieje",
    "co się dzieje",
    "co nowego",
    "wiadomos",
    "wiadomoś",
    "aktualn",
    "dzisiaj na swiecie",
    "dzisiaj w polsce",
    "sytuacja na swiecie",
    "sytuacja w polsce",
    "zycie spoleczne",
    "życie społeczne",
    "news",
    "newsy",
    "wydarzeni",
    "polityk",
    "gospodark",
    "sport",
    "pogod",
    "co dziś",
    "co dzis"
  ].some((phrase) => normalized.includes(phrase));
}

function decodeXmlEntities(text) {
  return String(text || "")
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function parseRssItems(xml, sourceName) {
  const matches = [...String(xml || "").matchAll(/<item>([\s\S]*?)<\/item>/g)];

  return matches.slice(0, 4).map((match) => {
    const block = match[1];
    const title = decodeXmlEntities(block.match(/<title>([\s\S]*?)<\/title>/i)?.[1] || "");
    const link = decodeXmlEntities(block.match(/<link>([\s\S]*?)<\/link>/i)?.[1] || "");
    const pubDate = decodeXmlEntities(block.match(/<pubDate>([\s\S]*?)<\/pubDate>/i)?.[1] || "");
    const description = decodeXmlEntities(
      block.match(/<description>([\s\S]*?)<\/description>/i)?.[1] || ""
    );

    return {
      source: sourceName,
      title,
      link,
      pubDate,
      description
    };
  }).filter((item) => item.title);
}

async function fetchLiveNewsBundle() {
  return fetchLiveNewsBundleByCategory("all");
}

async function fetchLiveNewsBundleByCategory(category = "all") {
  const selectedCategory = LIVE_NEWS_FEEDS[category] ? category : "all";
  const now = Date.now();
  const cached = liveNewsCache.get(selectedCategory);

  if (cached?.items?.length && cached.fetchedAt > now - 5 * 60 * 1000) {
    return cached;
  }

  const feeds = LIVE_NEWS_FEEDS[selectedCategory] || LIVE_NEWS_FEEDS.all;
  const results = await Promise.all(
    feeds.map(async (feed) => {
      try {
        const response = await fetch(feed.url, {
          headers: {
            "User-Agent": "NexusInformator/1.0 (+live-rss)"
          }
        });
        if (!response.ok) {
          return [];
        }

        const xml = await response.text();
        return parseRssItems(xml, feed.name);
      } catch {
        return [];
      }
    })
  );

  const items = results.flat().slice(0, 9);
  const text = items.length
    ? [
        `Swieze naglowki RSS pobrane lokalnie o ${new Date(now).toISOString()}:`,
        ...items.map(
          (item, index) =>
            `${index + 1}. [${item.source}] ${item.title}${item.description ? ` - ${clipText(item.description, 180)}` : ""}${item.link ? ` (${item.link})` : ""}`
        )
      ].join("\n")
    : "";

  const bundle = {
    category: selectedCategory,
    fetchedAt: now,
    items,
    text
  };

  liveNewsCache.set(selectedCategory, bundle);
  return bundle;
}

function buildLocalNewsReply(bundle) {
  if (!bundle?.items?.length) {
    return "Nie udalo sie pobrac swiezych naglowkow RSS. Sprobuj za chwile.";
  }

  return [
    "Oto swieze naglowki z lokalnych zrodel RSS:",
    ...bundle.items.slice(0, 6).map(
      (item, index) => `${index + 1}. [${item.source}] ${item.title}`
    ),
    "Jesli chcesz, moge na tej podstawie omowic wybrany temat szerzej."
  ].join("\n");
}

async function getLiveContext(mode, latestUserMessage, category = "all") {
  if (mode !== "live" && !isCurrentAffairsQuestion(latestUserMessage)) {
    return null;
  }

  const bundle = await fetchLiveNewsBundleByCategory(category);
  if (!bundle.items.length) {
    return {
      text: "",
      bundle,
      used: false
    };
  }

  return {
    text: [
      "Tryb LIVE: ponizej masz swieze dane z lokalnie pobranych kanalow RSS.",
      bundle.text,
      "W odpowiedzi wyraznie odrozniaj fakty z naglowkow od wnioskow i zaznacz, gdy temat wymaga dalszej weryfikacji."
    ].join("\n\n"),
    bundle,
    used: true
  };
}

function getUserIntegrationConfig(user, service) {
  const merged = {
    ...getServerSideIntegrations(),
    ...(user?.integrations || {})
  };

  return merged[service] || null;
}

async function refreshGmailAccessToken(user) {
  const gmailConfig = getUserIntegrationConfig(user, "gmail");
  const refreshToken = decryptSecret(gmailConfig?.encryptedRefreshToken);

  if (!refreshToken) {
    return {
      token: "",
      reason: "Brak refresh token Gmail. Podlacz konto Google przez OAuth.",
      user
    };
  }

  if (!hasGoogleOAuthCredentials()) {
    return {
      token: "",
      reason: "Brak GOOGLE_CLIENT_ID lub GOOGLE_CLIENT_SECRET. Uzupelnij dane OAuth Google po stronie serwera.",
      user
    };
  }

  try {
    const response = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded"
      },
      body: new URLSearchParams({
        client_id: GOOGLE_CLIENT_ID,
        client_secret: GOOGLE_CLIENT_SECRET,
        grant_type: "refresh_token",
        refresh_token: refreshToken
      })
    });

    const data = await response.json();
    if (!response.ok || !data.access_token) {
      return {
        token: "",
        reason: data.error_description || data.error || "Nie udalo sie odswiezyc tokenu Gmail OAuth.",
        user
      };
    }

    user.integrations = {
      ...(user.integrations || {}),
      gmail: {
        ...(user.integrations?.gmail || {}),
        encryptedAccessToken: encryptSecret(data.access_token),
        tokenExpiresAt: new Date(Date.now() + Number(data.expires_in || 3600) * 1000).toISOString(),
        updatedAt: new Date().toISOString()
      }
    };

    await saveUser(user);

    return {
      token: data.access_token,
      reason: "",
      user
    };
  } catch (error) {
    return {
      token: "",
      reason: error.message || "Nie udalo sie odswiezyc polaczenia Gmail OAuth.",
      user
    };
  }
}

async function getGmailAccessToken(user) {
  const gmailConfig = getUserIntegrationConfig(user, "gmail");
  const decrypted = decryptSecret(gmailConfig?.encryptedSecret) || gmailConfig?.serverSecret || "";
  const oauthAccessToken = decryptSecret(gmailConfig?.encryptedAccessToken);
  const oauthExpiresAt = Date.parse(gmailConfig?.tokenExpiresAt || "");

  if (oauthAccessToken && Number.isFinite(oauthExpiresAt) && oauthExpiresAt > Date.now() + 60 * 1000) {
    return {
      token: oauthAccessToken,
      reason: "",
      user
    };
  }

  if (gmailConfig?.encryptedRefreshToken) {
    return refreshGmailAccessToken(user);
  }

  if (!decrypted) {
    return {
      token: "",
      reason: "Brak skonfigurowanego sekretu Gmail po stronie serwera lub uzytkownika."
    };
  }

  if (!String(decrypted).startsWith("ya29.")) {
    return {
      token: "",
      reason:
        "Do realnych akcji Gmail potrzebny jest OAuth access token Google zaczynajacy sie zwykle od ya29. Sam API key nie wystarcza do odczytu skrzynki ani wysylki maili."
    };
  }

  return {
    token: decrypted,
    reason: "",
    user
  };
}

async function handleGmailOAuthStatus(req, res) {
  const user = await getAuthenticatedUser(req);

  if (!user) {
    sendJson(res, 401, { error: "Zaloguj sie, aby sprawdzic status Gmail OAuth." });
    return;
  }

  const gmailConfig = getUserIntegrationConfig(user, "gmail");
  sendJson(res, 200, {
    available: hasGoogleOAuthCredentials(),
    connected: Boolean(gmailConfig?.encryptedRefreshToken || gmailConfig?.encryptedAccessToken),
    email: gmailConfig?.oauthEmail || "",
    authType: gmailConfig?.encryptedRefreshToken || gmailConfig?.encryptedAccessToken ? "oauth" : gmailConfig?.encryptedSecret || gmailConfig?.serverSecret ? "token" : "none",
    redirectUri: getGmailOAuthRedirectUri(req)
  });
}

async function handleGmailOAuthStart(req, res) {
  const user = await getAuthenticatedUser(req);

  if (!user) {
    sendJson(res, 401, { error: "Zaloguj sie, aby polaczyc Gmail przez OAuth." });
    return;
  }

  if (!hasGoogleOAuthCredentials()) {
    sendJson(res, 400, {
      error: "Brak GOOGLE_CLIENT_ID lub GOOGLE_CLIENT_SECRET. Uzupelnij te zmienne po stronie serwera, aby uruchomic Gmail OAuth."
    });
    return;
  }

  const nonce = crypto.randomBytes(16).toString("hex");
  const state = createSignedState({
    userId: user.id,
    nonce,
    issuedAt: Date.now()
  });

  user.integrations = {
    ...(user.integrations || {}),
    gmail: {
      ...(user.integrations?.gmail || {}),
      enabled: true,
      permissions: uniqueValues([...(user.integrations?.gmail?.permissions || []), "read", "write"]),
      oauthNonce: nonce,
      oauthStateIssuedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  };

  await saveUser(user);
  await logAudit("gmail_oauth_start", req, {
    userId: user.id
  });

  const authUrl = new URL("https://accounts.google.com/o/oauth2/v2/auth");
  authUrl.searchParams.set("client_id", GOOGLE_CLIENT_ID);
  authUrl.searchParams.set("redirect_uri", getGmailOAuthRedirectUri(req));
  authUrl.searchParams.set("response_type", "code");
  authUrl.searchParams.set("access_type", "offline");
  authUrl.searchParams.set("prompt", "consent");
  authUrl.searchParams.set("scope", GMAIL_OAUTH_SCOPES.join(" "));
  authUrl.searchParams.set("state", state);

  sendJson(res, 200, {
    authorizationUrl: authUrl.toString(),
    redirectUri: getGmailOAuthRedirectUri(req)
  });
}

async function handleGmailOAuthCallback(req, res) {
  const url = new URL(req.url, getAppBaseUrl(req));
  const error = String(url.searchParams.get("error") || "").trim();
  const code = String(url.searchParams.get("code") || "").trim();
  const state = verifySignedState(url.searchParams.get("state"));

  if (error) {
    sendRedirect(res, `${getAppBaseUrl(req)}/?gmail_oauth=denied#panel`);
    return;
  }

  if (!state?.userId || !state?.nonce || !code) {
    sendHtml(res, 400, "<h1>Nieprawidlowy callback Gmail OAuth.</h1><p>Stan autoryzacji jest nieprawidlowy lub niepelny.</p>");
    return;
  }

  const users = await readJsonFile(USERS_FILE, []);
  const user = users.find((entry) => entry.id === state.userId);
  const currentGmail = user?.integrations?.gmail || {};

  if (!user || currentGmail.oauthNonce !== state.nonce) {
    sendHtml(res, 400, "<h1>Sesja OAuth wygasla.</h1><p>Rozpocznij laczenie Gmail jeszcze raz z panelu integracji.</p>");
    return;
  }

  try {
    const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded"
      },
      body: new URLSearchParams({
        client_id: GOOGLE_CLIENT_ID,
        client_secret: GOOGLE_CLIENT_SECRET,
        code,
        grant_type: "authorization_code",
        redirect_uri: getGmailOAuthRedirectUri(req)
      })
    });

    const tokenData = await tokenResponse.json();
    if (!tokenResponse.ok || !tokenData.access_token) {
      sendHtml(
        res,
        400,
        `<h1>Nie udalo sie polaczyc Gmail.</h1><p>${tokenData.error_description || tokenData.error || "Google nie zwrocil poprawnego tokenu."}</p>`
      );
      return;
    }

    const profileResponse = await fetch("https://gmail.googleapis.com/gmail/v1/users/me/profile", {
      headers: {
        Authorization: `Bearer ${tokenData.access_token}`
      }
    });
    const profileData = await profileResponse.json().catch(() => ({}));
    const email = profileData.emailAddress || currentGmail.accountLabel || "Konto Gmail OAuth";

    user.integrations = {
      ...(user.integrations || {}),
      gmail: {
        ...currentGmail,
        enabled: true,
        accountLabel: email,
        oauthEmail: email,
        permissions: uniqueValues([...(currentGmail.permissions || []), "read", "write"]),
        encryptedAccessToken: encryptSecret(tokenData.access_token),
        encryptedRefreshToken: tokenData.refresh_token
          ? encryptSecret(tokenData.refresh_token)
          : currentGmail.encryptedRefreshToken || "",
        tokenExpiresAt: new Date(Date.now() + Number(tokenData.expires_in || 3600) * 1000).toISOString(),
        oauthConnectedAt: new Date().toISOString(),
        oauthNonce: "",
        oauthStateIssuedAt: "",
        updatedAt: new Date().toISOString(),
        notes: "Konto Gmail polaczone przez Google OAuth. Inbox i wysylka dzialaja po stronie serwera."
      }
    };

    await saveUser(user);
    await logAudit("gmail_oauth_connected", req, {
      userId: user.id,
      email
    });

    sendRedirect(res, `${getAppBaseUrl(req)}/?gmail_oauth=success#panel`);
  } catch (callbackError) {
    sendHtml(
      res,
      500,
      `<h1>Wystapil blad Gmail OAuth.</h1><p>${callbackError.message || "Sprobuj ponownie za chwile."}</p>`
    );
  }
}

async function handleGmailOAuthDisconnect(req, res) {
  const user = await getAuthenticatedUser(req);

  if (!user) {
    sendJson(res, 401, { error: "Zaloguj sie, aby odlaczyc Gmail OAuth." });
    return;
  }

  const current = user.integrations?.gmail || {};
  user.integrations = {
    ...(user.integrations || {}),
    gmail: {
      ...current,
      encryptedAccessToken: "",
      encryptedRefreshToken: "",
      tokenExpiresAt: "",
      oauthEmail: "",
      oauthNonce: "",
      oauthStateIssuedAt: "",
      updatedAt: new Date().toISOString(),
      notes: "Polaczenie Gmail OAuth zostalo odlaczone."
    }
  };

  await saveUser(user);
  await logAudit("gmail_oauth_disconnected", req, {
    userId: user.id
  });

  sendJson(res, 200, {
    integrations: sanitizeIntegrations(user.integrations),
    user: sanitizeUser(user)
  });
}

async function handleLiveNews(req, res) {
  const user = await getAuthenticatedUser(req);

  if (!user) {
    sendJson(res, 401, { error: "Zaloguj sie, aby zobaczyc live news." });
    return;
  }

  try {
    const url = new URL(req.url, `http://${req.headers.host || "localhost"}`);
    const category = String(url.searchParams.get("category") || "all").toLowerCase();
    const bundle = await fetchLiveNewsBundleByCategory(category);

    sendJson(res, 200, {
      category: bundle.category,
      fetchedAt: new Date(bundle.fetchedAt).toISOString(),
      categories: Object.keys(LIVE_NEWS_FEEDS),
      items: bundle.items
    });
  } catch (error) {
    sendJson(res, 500, {
      error: error.message || "Nie udalo sie pobrac live news."
    });
  }
}

async function handleGmailInbox(req, res) {
  const user = await getAuthenticatedUser(req);

  if (!user) {
    sendJson(res, 401, { error: "Zaloguj sie, aby zobaczyc skrzynke Gmail." });
    return;
  }

  const gmailAuth = await getGmailAccessToken(user);
  if (!gmailAuth.token) {
    sendJson(res, 400, { error: gmailAuth.reason });
    return;
  }

  try {
    const listResponse = await fetch(
      "https://gmail.googleapis.com/gmail/v1/users/me/messages?maxResults=10&labelIds=INBOX",
      {
        headers: {
          Authorization: `Bearer ${gmailAuth.token}`
        }
      }
    );

    const listData = await listResponse.json();
    if (!listResponse.ok) {
      sendJson(res, listResponse.status, {
        error: listData.error?.message || "Nie udalo sie pobrac listy wiadomosci Gmail."
      });
      return;
    }

    const messages = await Promise.all(
      (listData.messages || []).slice(0, 10).map(async (entry) => {
        const messageResponse = await fetch(
          `https://gmail.googleapis.com/gmail/v1/users/me/messages/${entry.id}?format=metadata&metadataHeaders=Subject&metadataHeaders=From&metadataHeaders=Date`,
          {
            headers: {
              Authorization: `Bearer ${gmailAuth.token}`
            }
          }
        );

        const messageData = await messageResponse.json().catch(() => ({}));
        const headers = messageData.payload?.headers || [];
        const getHeader = (name) =>
          headers.find((header) => header.name?.toLowerCase() === name.toLowerCase())?.value || "";

        return {
          id: entry.id,
          threadId: messageData.threadId || entry.threadId,
          subject: getHeader("Subject"),
          from: getHeader("From"),
          date: getHeader("Date"),
          snippet: messageData.snippet || ""
        };
      })
    );

    sendJson(res, 200, {
      provider: "gmail",
      messages
    });
  } catch (error) {
    sendJson(res, 500, {
      error: error.message || "Wystapil blad podczas odczytu Gmail."
    });
  }
}

async function handleGmailSend(req, res) {
  const user = await getAuthenticatedUser(req);

  if (!user) {
    sendJson(res, 401, { error: "Zaloguj sie, aby wysylac maile Gmail." });
    return;
  }

  const gmailAuth = await getGmailAccessToken(user);
  if (!gmailAuth.token) {
    sendJson(res, 400, { error: gmailAuth.reason });
    return;
  }

  try {
    const body = await readJsonBody(req);
    const to = String(body.to || "").trim();
    const subject = String(body.subject || "").trim();
    const text = String(body.text || "").trim();

    if (!to || !subject || !text) {
      sendJson(res, 400, { error: "Podaj adres, temat i tresc maila." });
      return;
    }

    const mime = [
      `To: ${to}`,
      `Subject: ${subject}`,
      "Content-Type: text/plain; charset=UTF-8",
      "MIME-Version: 1.0",
      "",
      text
    ].join("\r\n");

    const raw = Buffer.from(mime)
      .toString("base64")
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/g, "");

    const response = await fetch(
      "https://gmail.googleapis.com/gmail/v1/users/me/messages/send",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${gmailAuth.token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ raw })
      }
    );

    const data = await response.json();
    if (!response.ok) {
      sendJson(res, response.status, {
        error: data.error?.message || "Nie udalo sie wyslac maila przez Gmail."
      });
      return;
    }

    sendJson(res, 200, {
      success: true,
      provider: "gmail",
      id: data.id,
      threadId: data.threadId
    });
  } catch (error) {
    sendJson(res, 500, {
      error: error.message || "Wystapil blad podczas wysylki Gmail."
    });
  }
}

async function requestOpenAiChat(user, mode, chatMessages, extraContext = "") {
  if (!OPENAI_API_KEY) {
    throw new Error("Brak OPENAI_API_KEY. Ustaw klucz API.");
  }

  const input = chatMessages.slice(-30).map((entry) => {
    const isAssistant = entry.role === "assistant";

    return {
      role: isAssistant ? "assistant" : "user",
      content: [
        {
          type: isAssistant ? "output_text" : "input_text",
          text: entry.content
        }
      ]
    };
  });

  const apiResponse = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${OPENAI_API_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: CHAT_MODEL,
      instructions: `${buildChatInstructions(user, mode)} ${buildRealtimeContext()} ${extraContext}`,
      max_output_tokens: 1100,
      input,
      tools: [
        {
          type: "web_search_preview"
        }
      ],
      text: {
        format: {
          type: "text"
        }
      }
    })
  });

  const data = await apiResponse.json();
  if (!apiResponse.ok) {
    throw createProviderError(
      "openai",
      "chat",
      apiResponse.status,
      data.error?.message || "Blad OpenAI API."
    );
  }

  return {
    model: CHAT_MODEL,
    source: "openai",
    sourceLabel: "OpenAI",
    reply: extractText(data.output) || "Nie udalo sie wygenerowac odpowiedzi."
  };
}

async function requestGeminiChat(user, mode, chatMessages, extraContext = "") {
  if (!GEMINI_API_KEY) {
    throw new Error("Brak GEMINI_API_KEY. Ustaw klucz API Google Gemini.");
  }

  const contents = chatMessages.slice(-30).map((entry) => ({
    role: entry.role === "assistant" ? "model" : "user",
    parts: [
      {
        text: String(entry.content || "")
      }
    ]
  }));

  const apiResponse = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(GEMINI_MODEL)}:generateContent?key=${encodeURIComponent(GEMINI_API_KEY)}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        systemInstruction: {
          parts: [
            {
              text: `${buildChatInstructions(user, mode)} ${buildRealtimeContext()} ${extraContext}`.trim()
            }
          ]
        },
        contents,
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 1100
        }
      })
    }
  );

  const data = await apiResponse.json().catch(() => ({}));
  if (!apiResponse.ok) {
    throw createProviderError(
      "gemini",
      "chat",
      apiResponse.status,
      data.error?.message || data.message || "Blad Google Gemini API."
    );
  }

  return {
    model: GEMINI_MODEL,
    source: "gemini",
    sourceLabel: "Google Gemini",
    reply:
      String(data.candidates?.[0]?.content?.parts?.map((part) => part.text || "").join(" ") || "").trim() ||
      "Nie udalo sie wygenerowac odpowiedzi."
  };
}

async function requestOllamaChat(user, mode, chatMessages, extraContext = "") {
  const messages = [
    {
      role: "system",
      content: `${buildChatInstructions(user, mode)} ${buildRealtimeContext()} ${extraContext}`.trim()
    },
    ...chatMessages.slice(-30).map((entry) => ({
      role: entry.role === "assistant" ? "assistant" : "user",
      content: entry.content
    }))
  ];

  let apiResponse;
  try {
    apiResponse = await fetch(`${OLLAMA_BASE_URL.replace(/\/+$/, "")}/api/chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: OLLAMA_MODEL,
        messages,
        stream: false,
        options: {
          temperature: 0.7,
          num_predict: 1100
        }
      })
    });
  } catch (error) {
    const friendlyMessage = error?.message === "fetch failed"
      ? `Nie udalo sie polaczyc z lokalnym Ollama pod ${OLLAMA_BASE_URL}. Uruchom Ollama i model ${OLLAMA_MODEL}.`
      : error.message || "Nie udalo sie polaczyc z lokalnym Ollama.";

    throw createProviderError(
      "ollama",
      "chat",
      503,
      friendlyMessage
    );
  }

  const data = await apiResponse.json().catch(() => ({}));
  if (!apiResponse.ok) {
    throw createProviderError(
      "ollama",
      "chat",
      apiResponse.status,
      data.error || data.message || "Blad Ollama API."
    );
  }

  return {
    model: OLLAMA_MODEL,
    source: "ollama",
    sourceLabel: "Ollama",
    reply: String(data.message?.content || "").trim() || "Nie udalo sie wygenerowac odpowiedzi."
  };
}

async function generateChatReply(user, mode, chatMessages, liveCategory = "all") {
  const latestUserMessage = [...chatMessages]
    .reverse()
    .find((entry) => entry.role === "user")?.content;
  const liveContext = await getLiveContext(mode, latestUserMessage, liveCategory);
  let ollamaError = null;
  let geminiError = null;
  const isFreeLocalMode = ["local", "free"].includes(CHAT_PROVIDER);

  if (isDateTimeQuestion(latestUserMessage)) {
    return {
      model: "local-realtime-context",
      source: "local-time",
      sourceLabel: "Czas lokalny",
      reply: buildLocalDateTimeReply()
    };
  }

  if (isFreeLocalMode) {
    return {
      model: "local-free-mode",
      source: "local-free",
      sourceLabel: "Darmowy tryb lokalny",
      reply: buildFreeLocalReply(mode, latestUserMessage, liveContext, {
        chatMessages
      })
    };
  }

  const shouldTryOllama = ["auto", "ollama"].includes(CHAT_PROVIDER);
  const shouldTryGemini = ["auto", "gemini"].includes(CHAT_PROVIDER);
  const shouldTryOpenAi = ["auto", "openai"].includes(CHAT_PROVIDER);

  if (shouldTryOllama) {
    try {
      return await requestOllamaChat(
        user,
        mode,
        chatMessages,
        liveContext?.text || ""
      );
    } catch (error) {
      ollamaError = error;
      if (CHAT_PROVIDER === "ollama") {
        if (liveContext?.bundle?.items?.length) {
          return {
            model: "local-rss-live",
            source: "rss-live",
            sourceLabel: "RSS live",
            reply: buildLocalNewsReply(liveContext.bundle)
          };
        }

        return {
          model: "local-provider-fallback",
          source: "local-fallback",
          sourceLabel: "Lokalny fallback",
          reply: `${error.message} Uruchom lokalny model Ollama albo przelacz CHAT_PROVIDER na openai.`
        };
      }
    }
  }

  if (shouldTryGemini) {
    try {
      return await requestGeminiChat(
        user,
        mode,
        chatMessages,
        liveContext?.text || ""
      );
    } catch (error) {
      geminiError = error;
      if (CHAT_PROVIDER === "gemini") {
        if (liveContext?.bundle?.items?.length) {
          return {
            model: "local-rss-live",
            source: "rss-live",
            sourceLabel: "RSS live",
            reply: buildLocalNewsReply(liveContext.bundle)
          };
        }

        return {
          model: "local-provider-fallback",
          source: "local-fallback",
          sourceLabel: "Lokalny fallback",
          reply: buildQuotaFallbackReply(mode, latestUserMessage, liveContext, {
            chatMessages,
            providerLabel: "Google Gemini",
            keyValidated: Boolean(GEMINI_API_KEY)
          })
        };
      }
    }
  }

  if (!shouldTryOpenAi) {
    return {
      model: "local-provider-fallback",
      source: "local-fallback",
      sourceLabel: "Lokalny fallback",
      reply: buildQuotaFallbackReply(mode, latestUserMessage, liveContext, {
        chatMessages,
        providerLabel: CHAT_PROVIDER === "gemini" ? "Google Gemini" : "OpenAI",
        keyValidated: CHAT_PROVIDER === "gemini" ? Boolean(GEMINI_API_KEY) : Boolean(OPENAI_API_KEY)
      })
    };
  }

  try {
    return await requestOpenAiChat(
      user,
      mode,
      chatMessages,
      liveContext?.text || ""
    );
  } catch (openAiError) {
    if (liveContext?.bundle?.items?.length) {
      return {
        model: "local-rss-live",
        source: "rss-live",
        sourceLabel: "RSS live",
        reply: buildLocalNewsReply(liveContext.bundle)
      };
    }

    if (openAiError.isQuota) {
      return {
        model: "local-provider-fallback",
        source: "local-fallback",
        sourceLabel: "Lokalny fallback",
        reply: buildQuotaFallbackReply(mode, latestUserMessage, liveContext, {
          chatMessages,
          providerLabel: "OpenAI",
          keyValidated: true,
          ollamaSuggested: shouldTryOllama && Boolean(ollamaError)
        })
      };
    }

    throw openAiError;
  }
}

function buildChatSummary(chat) {
  return {
    id: chat.id,
    title: chat.title,
    updatedAt: chat.updatedAt,
    createdAt: chat.createdAt,
    messageCount: chat.messages.length
  };
}

async function readChats() {
  return readJsonFile(CHATS_FILE, []);
}

async function writeChats(chats) {
  await writeJsonFile(CHATS_FILE, chats, { backup: true });
}

async function createChat(user) {
  const chats = await readChats();
  const now = new Date().toISOString();
  const chat = {
    id: crypto.randomUUID(),
    userId: user.id,
    title: "Nowa rozmowa",
    createdAt: now,
    updatedAt: now,
    messages: [
      {
        id: crypto.randomUUID(),
        role: "assistant",
        content: createWelcomeMessage(user),
        createdAt: now
      }
    ]
  };

  chats.unshift(chat);
  await writeChats(chats);
  return chat;
}

async function getUserChat(userId, chatId) {
  const chats = await readChats();
  return chats.find((chat) => chat.id === chatId && chat.userId === userId) || null;
}

async function saveUser(updatedUser) {
  const users = await readJsonFile(USERS_FILE, []);
  const nextUsers = users.map((user) =>
    user.id === updatedUser.id ? updatedUser : user
  );
  await writeJsonFile(USERS_FILE, nextUsers, { backup: true });
}

function sanitizeChat(chat) {
  return {
    id: chat.id,
    title: chat.title,
    createdAt: chat.createdAt,
    updatedAt: chat.updatedAt,
    messages: chat.messages
  };
}

async function handleAccountSuggest(req, res) {
  try {
    const body = await readJsonBody(req);
    const users = await readJsonFile(USERS_FILE, []);
    const username = suggestUsername(body.firstName, body.lastName, users);
    const password = createGeneratedPassword();
    sendJson(res, 200, { username, password });
  } catch (error) {
    sendJson(res, 500, {
      error: error.message || "Nie udalo sie przygotowac propozycji danych."
    });
  }
}

async function handleRegister(req, res) {
  try {
    const body = await readJsonBody(req);
    const firstName = String(body.firstName || "").trim();
    const lastName = String(body.lastName || "").trim();
    const displayName = String(body.displayName || "").trim();
    const usernameInput = normalizeUsername(body.username);
    const email = normalizeEmail(body.email);
    const password = String(body.password || "");
    const birthDate = String(body.birthDate || "").trim();
    const address = String(body.address || "").trim();
    const consents = body.consents || {};

    if (firstName.length < 2 || lastName.length < 2) {
      sendJson(res, 400, { error: "Podaj imie i nazwisko." });
      return;
    }

    if (!isValidEmail(email)) {
      sendJson(res, 400, { error: "Podaj poprawny adres email." });
      return;
    }

    if (password.length < 8) {
      sendJson(res, 400, {
        error: "Haslo musi miec co najmniej 8 znakow."
      });
      return;
    }

    if (
      !consents.termsAccepted ||
      !consents.privacyAccepted ||
      !consents.rodoAccepted
    ) {
      sendJson(res, 400, {
        error:
          "Aby utworzyc konto, trzeba zaakceptowac regulamin, polityke prywatnosci i RODO."
      });
      return;
    }

    const users = await readJsonFile(USERS_FILE, []);
    const username =
      usernameInput || suggestUsername(firstName, lastName, users);

    const emailTaken = users.some((user) => user.email === email);
    const usernameTaken = users.some((user) => user.username === username);

    if (emailTaken) {
      sendJson(res, 409, { error: "Konto z tym adresem email juz istnieje." });
      return;
    }

    if (usernameTaken) {
      sendJson(res, 409, { error: "Ten login jest juz zajety." });
      return;
    }

    const passwordData = hashPassword(password);
    const user = {
      id: crypto.randomUUID(),
      role: "user",
      username,
      displayName: buildDisplayName(firstName, lastName, displayName),
      firstName,
      lastName,
      email,
      passwordHash: passwordData.hash,
      passwordSalt: passwordData.salt,
      profile: {
        birthDate,
        address
      },
      consents: {
        termsAccepted: true,
        privacyAccepted: true,
        rodoAccepted: true,
        marketingAccepted: Boolean(consents.marketingAccepted),
        audioUsed: Boolean(consents.audioUsed),
        voiceCloneConsent: Boolean(consents.voiceCloneConsent),
        acceptedAt: new Date().toISOString()
      },
      aiSettings: baseAiSettings(),
      integrations: {},
      createdAt: new Date().toISOString()
    };

    users.push(user);
    await writeJsonFile(USERS_FILE, users, { backup: true });

    const session = await createSession(user.id);
    await createChat(user);
    await logAudit("register", req, {
      userId: user.id,
      email: user.email,
      username: user.username
    });

    sendJson(res, 201, {
      token: session.token,
      user: sanitizeUser(user)
    });
  } catch (error) {
    sendJson(res, 500, {
      error: error.message || "Nie udalo sie utworzyc konta."
    });
  }
}

async function handleGuestSession(req, res) {
  try {
    const guestId = `guest_${crypto.randomUUID().replace(/-/g, "").slice(0, 12)}`;
    const guestUser = {
      id: crypto.randomUUID(),
      role: "guest",
      username: guestId,
      displayName: "Gosc",
      firstName: "",
      lastName: "",
      email: `${guestId}@guest.local`,
      passwordHash: "",
      passwordSalt: "",
      profile: {},
      consents: {},
      aiSettings: baseAiSettings(),
      integrations: {},
      createdAt: new Date().toISOString()
    };

    const users = await readJsonFile(USERS_FILE, []);
    users.push(guestUser);
    await writeJsonFile(USERS_FILE, users, { backup: false });

    const session = await createSession(guestUser.id);
    await createChat(guestUser);

    sendJson(res, 200, {
      token: session.token,
      user: sanitizeUser(guestUser)
    });
  } catch (error) {
    sendJson(res, 500, { error: error.message || "Nie udalo sie utworzyc sesji goscia." });
  }
}

async function handleLogin(req, res) {
  try {
    const body = await readJsonBody(req);
    const identifier = String(body.identifier || "").trim();
    const password = String(body.password || "");

    if (!identifier || !password) {
      sendJson(res, 400, { error: "Podaj email lub login oraz haslo." });
      return;
    }

    const users = await readJsonFile(USERS_FILE, []);
    const user = findUserByIdentifier(users, identifier);

    if (!user) {
      await logAudit("login_failure", req, { identifier });
      sendJson(res, 401, { error: "Niepoprawny login lub haslo." });
      return;
    }

    const passwordData = hashPassword(password, user.passwordSalt);
    if (!timingSafeMatch(passwordData.hash, user.passwordHash)) {
      await logAudit("login_failure", req, {
        identifier,
        userId: user.id
      });
      sendJson(res, 401, { error: "Niepoprawny login lub haslo." });
      return;
    }

    const session = await createSession(user.id);
    await logAudit("login_success", req, {
      userId: user.id,
      email: user.email,
      username: user.username
    });

    sendJson(res, 200, {
      token: session.token,
      user: sanitizeUser(user)
    });
  } catch (error) {
    sendJson(res, 500, {
      error: error.message || "Nie udalo sie zalogowac."
    });
  }
}

async function handleCurrentUser(req, res) {
  const user = await getAuthenticatedUser(req);

  if (!user) {
    sendJson(res, 401, { error: "Brak aktywnej sesji." });
    return;
  }

  sendJson(res, 200, {
    user: sanitizeUser(user),
    models: {
      chat: getAdvertisedChatModel(),
      image: IMAGE_MODEL,
      video: VIDEO_MODEL,
      audio: AUDIO_TRANSCRIBE_MODEL,
      live: CHAT_PROVIDER === "gemini"
        ? "RSS / Gemini"
        : (["local", "free"].includes(CHAT_PROVIDER) ? "RSS / Lokalny fallback" : "RSS / OpenAI")
    },
    contact: CONTACT,
    storage: {
      driver: storageState.mode
    }
  });
}

async function handleLogout(req, res) {
  const user = await getAuthenticatedUser(req);
  await destroySession(req);

  if (user) {
    await logAudit("logout", req, {
      userId: user.id,
      email: user.email,
      username: user.username
    });
  }

  sendJson(res, 200, { success: true });
}

async function handleSettingsUpdate(req, res) {
  const user = await getAuthenticatedUser(req);

  if (!user) {
    sendJson(res, 401, { error: "Zaloguj sie, aby zapisac ustawienia." });
    return;
  }

  try {
    const body = await readJsonBody(req);

    user.aiSettings = {
      ...baseAiSettings(),
      ...(user.aiSettings || {}),
      customPrompt: String(body.customPrompt || "").trim(),
      conciseMode: Boolean(body.conciseMode),
      askClarifyingQuestions: Boolean(body.askClarifyingQuestions),
      challengeWrongClaims: Boolean(body.challengeWrongClaims),
      trustMode: body.trustMode === "balanced" ? "balanced" : "skeptical",
      preferredTone: body.preferredTone === "simple" ? "simple" : "advanced",
      autoFixMode: body.autoFixMode !== false,
      expertMode: [
        "general",
        "programming",
        "legal",
        "medical",
        "court",
        "business",
        "creative"
      ].includes(body.expertMode)
        ? body.expertMode
        : "general",
      emotionalPresence: body.emotionalPresence === "neutral" ? "neutral" : "warm",
      boundaryStyle: body.boundaryStyle === "soft" ? "soft" : "firm",
      liveVoiceMode: body.liveVoiceMode === true,
      autoSpeakResponses: body.autoSpeakResponses !== false
    };

    if (typeof body.voiceCloneConsent === "boolean") {
      user.consents.voiceCloneConsent = body.voiceCloneConsent;
    }

    await saveUser(user);
    await logAudit("settings_update", req, {
      userId: user.id
    });

    sendJson(res, 200, { user: sanitizeUser(user) });
  } catch (error) {
    sendJson(res, 500, {
      error: error.message || "Nie udalo sie zapisac ustawien."
    });
  }
}

function normalizePermissions(value) {
  return uniqueValues(
    (Array.isArray(value) ? value : [])
      .map((entry) => String(entry || "").trim().toLowerCase())
      .filter(Boolean)
  ).slice(0, 8);
}

async function handleIntegrationsList(req, res) {
  const user = await getAuthenticatedUser(req);

  if (!user) {
    sendJson(res, 401, { error: "Zaloguj sie, aby zobaczyc integracje." });
    return;
  }

  sendJson(res, 200, {
    integrations: sanitizeIntegrations(user.integrations),
    services: INTEGRATION_SERVICES
  });
}

async function handleAlibabaStatus(req, res) {
  const user = await getAuthenticatedUser(req);

  if (!user) {
    sendJson(res, 401, { error: "Zaloguj sie, aby zobaczyc status Alibaba Cloud." });
    return;
  }

  sendJson(res, 200, getAlibabaIntegrationStatus());
}

async function handleIntegrationsUpdate(req, res) {
  const user = await getAuthenticatedUser(req);

  if (!user) {
    sendJson(res, 401, { error: "Zaloguj sie, aby zapisac integracje." });
    return;
  }

  try {
    const body = await readJsonBody(req);
    const service = String(body.service || "").trim().toLowerCase();

    if (!INTEGRATION_SERVICES.includes(service)) {
      sendJson(res, 400, { error: "Nieznana integracja." });
      return;
    }

    const current = user.integrations?.[service] || {};
    const secret = String(body.secret || "").trim();
    const clearSecret = Boolean(body.clearSecret);

    user.integrations = {
      ...(user.integrations || {}),
      [service]: {
        ...current,
        enabled: body.enabled !== false,
        accountLabel: String(body.accountLabel || "").trim(),
        notes: String(body.notes || "").trim(),
        permissions: normalizePermissions(body.permissions),
        encryptedSecret: clearSecret
          ? ""
          : secret
            ? encryptSecret(secret)
            : current.encryptedSecret || "",
        updatedAt: new Date().toISOString()
      }
    };

    await saveUser(user);
    await logAudit("integration_update", req, {
      userId: user.id,
      service
    });

    sendJson(res, 200, {
      integrations: sanitizeIntegrations(user.integrations),
      user: sanitizeUser(user)
    });
  } catch (error) {
    sendJson(res, 500, {
      error: error.message || "Nie udalo sie zapisac integracji."
    });
  }
}

function safeUrl(rawUrl) {
  try {
    const url = new URL(String(rawUrl || "").trim());
    if (!["http:", "https:"].includes(url.protocol)) {
      return null;
    }
    return url;
  } catch {
    return null;
  }
}

function isPrivateHostname(hostname) {
  const lower = String(hostname || "").trim().toLowerCase();
  if (!lower) {
    return true;
  }

  if (
    lower === "localhost" ||
    lower === "0.0.0.0" ||
    lower === "::1" ||
    lower.endsWith(".local") ||
    lower.endsWith(".internal")
  ) {
    return true;
  }

  if (/^\d{1,3}(\.\d{1,3}){3}$/.test(lower)) {
    const [a, b] = lower.split(".").map((entry) => Number(entry));
    return (
      a === 10 ||
      a === 127 ||
      a === 0 ||
      (a === 169 && b === 254) ||
      (a === 172 && b >= 16 && b <= 31) ||
      (a === 192 && b === 168)
    );
  }

  return lower.startsWith("fe80:") || lower.startsWith("fc") || lower.startsWith("fd");
}

function normalizeWorkbenchLinks(rawLinks) {
  const values = Array.isArray(rawLinks)
    ? rawLinks
    : String(rawLinks || "")
        .split(/\s+/)
        .filter(Boolean);

  return uniqueValues(
    values
      .map((entry) => safeUrl(entry))
      .filter((entry) => entry && !isPrivateHostname(entry.hostname))
      .map((entry) => entry.toString())
  ).slice(0, MAX_WORKBENCH_LINKS);
}

function isYouTubeLink(urlObject) {
  const hostname = urlObject.hostname.toLowerCase();
  return hostname.includes("youtube.com") || hostname.includes("youtu.be");
}

function extractYouTubeVideoId(rawUrl) {
  const urlObject = safeUrl(rawUrl);
  if (!urlObject || !isYouTubeLink(urlObject)) {
    return "";
  }

  if (urlObject.hostname.toLowerCase().includes("youtu.be")) {
    return urlObject.pathname.replace(/\//g, "").trim();
  }

  return urlObject.searchParams.get("v") || "";
}

function decodeHtmlEntities(text) {
  return String(text || "")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, "\"")
    .replace(/&#39;/g, "'");
}

function htmlToText(html) {
  return decodeHtmlEntities(
    String(html || "")
      .replace(/<script[\s\S]*?<\/script>/gi, " ")
      .replace(/<style[\s\S]*?<\/style>/gi, " ")
      .replace(/<noscript[\s\S]*?<\/noscript>/gi, " ")
      .replace(/<[^>]+>/g, " ")
      .replace(/\s+/g, " ")
      .trim()
  );
}

function transcriptPayloadToText(payload) {
  const data = typeof payload === "string" ? decodeJsonPayload(payload, {}) : payload;
  if (!data || !Array.isArray(data.events)) {
    return "";
  }

  return data.events
    .flatMap((event) => event.segs || [])
    .map((segment) => segment.utf8 || "")
    .join(" ")
    .replace(/\s+/g, " ")
    .trim();
}

async function fetchYoutubeTranscript(rawUrl) {
  const videoId = extractYouTubeVideoId(rawUrl);
  if (!videoId) {
    return {
      kind: "youtube",
      title: rawUrl,
      url: rawUrl,
      text: ""
    };
  }

  const response = await fetch(`https://www.youtube.com/watch?v=${videoId}`, {
    headers: {
      "User-Agent": "Mozilla/5.0 (compatible; NexusInformator/1.0)"
    }
  });
  const html = await response.text();
  const playerMatch = html.match(/ytInitialPlayerResponse\s*=\s*(\{[\s\S]*?\});/);
  const player = playerMatch ? decodeJsonPayload(playerMatch[1], {}) : {};
  const title = player.videoDetails?.title || rawUrl;
  const tracks =
    player.captions?.playerCaptionsTracklistRenderer?.captionTracks || [];

  if (!tracks.length) {
    return {
      kind: "youtube",
      title,
      url: rawUrl,
      text: "Brak publicznych napisow lub transkrypcji do pobrania."
    };
  }

  const preferredTrack =
    tracks.find((track) => String(track.languageCode || "").startsWith("pl")) ||
    tracks.find((track) => String(track.languageCode || "").startsWith("en")) ||
    tracks[0];

  let transcriptUrl = preferredTrack.baseUrl;
  if (!/fmt=/.test(transcriptUrl)) {
    transcriptUrl += `${transcriptUrl.includes("?") ? "&" : "?"}fmt=json3`;
  }

  const transcriptResponse = await fetch(transcriptUrl, {
    headers: {
      "User-Agent": "Mozilla/5.0 (compatible; NexusInformator/1.0)"
    }
  });

  const transcriptPayload = await transcriptResponse.text();
  const transcriptText = transcriptPayloadToText(transcriptPayload);

  return {
    kind: "youtube",
    title,
    url: rawUrl,
    text: clipText(
      transcriptText || "Transkrypcja nie byla dostepna do odczytu.",
      12000
    )
  };
}

async function fetchLinkContext(rawUrl) {
  const urlObject = safeUrl(rawUrl);
  if (!urlObject || isPrivateHostname(urlObject.hostname)) {
    return {
      kind: "link",
      title: rawUrl,
      url: rawUrl,
      text: "Link zostal odrzucony z powodu ograniczen bezpieczenstwa."
    };
  }

  if (isYouTubeLink(urlObject)) {
    return fetchYoutubeTranscript(rawUrl);
  }

  const response = await fetch(urlObject.toString(), {
    redirect: "follow",
    headers: {
      "User-Agent": "Mozilla/5.0 (compatible; NexusInformator/1.0)"
    }
  });

  const contentType = response.headers.get("content-type") || "";
  const body = await response.text();
  const titleMatch = body.match(/<title[^>]*>([^<]+)<\/title>/i);
  const title = titleMatch ? htmlToText(titleMatch[1]) : urlObject.toString();
  const text = /html|xml/i.test(contentType) ? htmlToText(body) : body.trim();

  return {
    kind: "link",
    title,
    url: urlObject.toString(),
    text: clipText(text, 10000)
  };
}

function decodeInlineFileData(data) {
  const raw = String(data || "").trim();
  const base64 = raw.includes(",") ? raw.split(",").pop() : raw;
  return Buffer.from(base64, "base64");
}

function getFileExtension(name) {
  return path.extname(String(name || "")).toLowerCase();
}

function isAudioFile(file) {
  return (
    String(file.mimeType || "").startsWith("audio/") ||
    [".mp3", ".wav", ".m4a", ".ogg", ".webm", ".aac"].includes(
      getFileExtension(file.name)
    )
  );
}

function isVideoFile(file) {
  return (
    String(file.mimeType || "").startsWith("video/") ||
    [".mp4", ".mov", ".mkv", ".avi", ".webm"].includes(getFileExtension(file.name))
  );
}

function isTextPreviewFile(file) {
  return (
    /^text\//.test(String(file.mimeType || "")) ||
    [
      ".txt",
      ".md",
      ".json",
      ".csv",
      ".html",
      ".xml",
      ".js",
      ".ts",
      ".py",
      ".java",
      ".cs",
      ".php",
      ".sql"
    ].includes(getFileExtension(file.name))
  );
}

function normalizeUploadedFiles(rawFiles) {
  const files = Array.isArray(rawFiles) ? rawFiles.slice(0, MAX_WORKBENCH_FILES) : [];
  let totalBytes = 0;

  return files.map((entry) => {
    const name = String(entry.name || "plik").trim() || "plik";
    const mimeType = String(entry.type || entry.mimeType || "application/octet-stream").trim();
    const buffer = decodeInlineFileData(entry.data);
    const size = Number(entry.size) || buffer.byteLength;

    if (!buffer.byteLength || size > MAX_INLINE_FILE_BYTES) {
      throw new Error(
        `Plik ${name} przekracza limit ${Math.round(MAX_INLINE_FILE_BYTES / 1024 / 1024)} MB lub jest pusty.`
      );
    }

    totalBytes += size;
    if (totalBytes > MAX_TOTAL_FILE_BYTES) {
      throw new Error("Laczny rozmiar zalacznikow jest zbyt duzy.");
    }

    return {
      name,
      mimeType,
      size,
      buffer
    };
  });
}

async function uploadFileToOpenAi(file) {
  const formData = new FormData();
  formData.append("purpose", "user_data");
  formData.append(
    "file",
    new Blob([file.buffer], {
      type: file.mimeType || "application/octet-stream"
    }),
    file.name
  );

  const response = await fetch("https://api.openai.com/v1/files", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${OPENAI_API_KEY}`
    },
    body: formData
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(
      buildServiceUnavailableMessage(
        "wysylki pliku do narzedzi",
        data.error?.message || `Nie udalo sie wyslac pliku ${file.name}.`
      )
    );
  }

  return data.id;
}

async function transcribeAudioFile(file) {
  const formData = new FormData();
  formData.append(
    "file",
    new Blob([file.buffer], {
      type: file.mimeType || "application/octet-stream"
    }),
    file.name
  );
  formData.append("model", AUDIO_TRANSCRIBE_MODEL);
  formData.append("response_format", "json");

  const response = await fetch("https://api.openai.com/v1/audio/transcriptions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${OPENAI_API_KEY}`
    },
    body: formData
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(
      buildServiceUnavailableMessage(
        "transkrypcji audio",
        data.error?.message || `Nie udalo sie przygotowac transkrypcji pliku ${file.name}.`
      )
    );
  }

  return clipText(data.text || "", 14000);
}

function buildWorkbenchInstructions(user, taskType, expertMode) {
  const settings = {
    ...baseAiSettings(),
    ...(user.aiSettings || {})
  };
  const activeExpertMode = expertMode || settings.expertMode || "general";
  const taskInstructions = {
    analysis:
      "Przygotuj uporzadkowana analize, wykryj sprzecznosci, ryzyka i dalsze kroki.",
    transcript:
      "Przygotuj wierna transkrypcje lub czysty zapis materialu oraz krotkie streszczenie.",
    protocol:
      "Przygotuj protokol, notatke ze spotkania lub zapis ustalen z listami decyzji, zadan i terminow.",
    email:
      "Przygotuj gotowa tresc emaila, temat oraz krotki wariant alternatywny.",
    legal:
      "Przygotuj szkic pisma, wniosku, odwolania lub apelacji w profesjonalnym ukladzie z miejscem na dane.",
    social:
      "Przygotuj post, relacje, opis, komentarz lub plan publikacji w stylu dopasowanym do platformy.",
    strategy:
      "Przygotuj plan dzialania, priorytety, ryzyka, zaleznosci i rekomendacje."
  };

  return [
    "Jestes multimodalnym agentem AI o nazwie Nexus Informator.",
    "Masz do dyspozycji tresc linkow, transkrypcje audio oraz pliki dostepne w kontenerze code interpreter.",
    "Odpowiadaj po polsku, chyba ze material lub prosba wyraznie wymaga innego jezyka.",
    "Pisz naturalnie, jasno i bez lania wody.",
    buildUniversalSafetyPolicy(),
    settings.conciseMode
      ? "Preferuj zwiezly styl i wysoki gest informacji."
      : "Rozwijaj odpowiedz, gdy material jest zlozony.",
    buildExpertModeInstruction(activeExpertMode),
    taskInstructions[taskType] || taskInstructions.analysis,
    "Nie klam i nie przedstawiaj niepewnych wnioskow jako faktu.",
    "Jesli material zawiera kilka watkow, zaproponuj kolejnosc pracy i uzasadnij priorytet.",
    "Jesli material dotyczy prawa, zdrowia lub sporow, porzadkuj fakty i ryzyka, ale nie podszywaj sie pod licencjonowany zawod.",
    "Jesli rozmowca jest agresywny, odpowiadaj stanowczo i spokojnie, bez odwetu i bez obrazania.",
    "Gdy konczysz etap albo potrzebna jest decyzja, zapytaj uzytkownika co dalej i jak on lub ona to widzi."
  ].join(" ");
}

async function handleWorkbenchRun(req, res) {
  const user = await getAuthenticatedUser(req);

  if (!user) {
    sendJson(res, 401, { error: "Zaloguj sie, aby uruchomic narzedzia." });
    return;
  }

  if (!OPENAI_API_KEY) {
    sendJson(res, 500, { error: "Brak OPENAI_API_KEY. Ustaw klucz API." });
    return;
  }

  try {
    const body = await readJsonBody(req);
    const prompt = String(body.prompt || "").trim();
    const safetyRisk = analyzeSafetyRisk(prompt);
    const taskType = [
      "analysis",
      "transcript",
      "protocol",
      "email",
      "legal",
      "social",
      "strategy"
    ].includes(body.taskType)
      ? body.taskType
      : "analysis";
    const expertMode = [
      "general",
      "programming",
      "legal",
      "medical",
      "court",
      "business",
      "creative"
    ].includes(body.expertMode)
      ? body.expertMode
      : user.aiSettings?.expertMode || "general";
    const saveToChat = body.saveToChat !== false;
    const links = normalizeWorkbenchLinks(body.links);
    const rawFiles = normalizeUploadedFiles(body.files);
    const scanOutcome = await inspectUploadedFiles(req, user, rawFiles);
    const files = scanOutcome.acceptedFiles;
    const blockedFindings = scanOutcome.blockedFindings;

    if (!prompt && !links.length && !files.length) {
      sendJson(res, 400, {
        error: blockedFindings.length
          ? "Wszystkie zalaczniki zostaly zablokowane przez modul kontroli zagrozen. Dodaj bezpieczne pliki albo linki."
          : "Dodaj polecenie, link albo plik do analizy."
      });
      return;
    }

    if (safetyRisk) {
      sendJson(res, 400, {
        error: safetyRisk.message,
        blockedCategory: safetyRisk.category
      });
      return;
    }

    const sources = [];
    const uploadedFileIds = [];
    const uploadedFileNames = [];

    for (const link of links) {
      try {
        sources.push(await fetchLinkContext(link));
      } catch (error) {
        sources.push({
          kind: "link",
          title: link,
          url: link,
          text: `Nie udalo sie pobrac tresci linku: ${error.message}`
        });
      }
    }

    for (const file of files) {
      if (isAudioFile(file)) {
        const transcript = await transcribeAudioFile(file);
        sources.push({
          kind: "audio",
          title: file.name,
          url: "",
          text: transcript || "Nie udalo sie wygenerowac transkrypcji."
        });
        continue;
      }

      if (isVideoFile(file)) {
        sources.push({
          kind: "video",
          title: file.name,
          url: "",
          text:
            "Plik wideo zostal przyjety, ale ten modul nie wykonuje jeszcze automatycznej ekstrakcji klatek. Uzyj Video Lab do generowania lub opisz, co trzeba zrobic z materialem."
        });
        continue;
      }

      if (isTextPreviewFile(file)) {
        sources.push({
          kind: "file",
          title: file.name,
          url: "",
          text: clipText(file.buffer.toString("utf8"), 7000)
        });
      } else {
        sources.push({
          kind: "file",
          title: file.name,
          url: "",
          text: "Plik zostal dolaczony do analizy w kontenerze narzedziowym."
        });
      }

      uploadedFileIds.push(await uploadFileToOpenAi(file));
      uploadedFileNames.push(file.name);
    }

    const sourceText = sources
      .map((source, index) =>
        [
          `Zrodlo ${index + 1}: ${source.title || source.url || "material"}`,
          source.url ? `URL: ${source.url}` : "",
          source.kind ? `Typ: ${source.kind}` : "",
          source.text || ""
        ]
          .filter(Boolean)
          .join("\n")
      )
      .join("\n\n");

    const composedPrompt = [
      prompt || "Przeanalizuj material i przygotuj najlepszy mozliwy wynik.",
      `Typ zadania: ${taskType}.`,
      blockedFindings.length
        ? `Zablokowane zalaczniki przez modul ochrony: ${blockedFindings
            .map((entry) => entry.fileName)
            .join(", ")}.`
        : "",
      uploadedFileNames.length
        ? `Pliki dolaczone do kontenera: ${uploadedFileNames.join(", ")}.`
        : "",
      sourceText ? `Material wejsciowy:\n${sourceText}` : ""
    ]
      .filter(Boolean)
      .join("\n\n");

    const requestPayload = {
      model: CHAT_MODEL,
      reasoning: {
        effort: "medium"
      },
      instructions: buildWorkbenchInstructions(user, taskType, expertMode),
      max_output_tokens: 1700,
      input: [
        {
          role: "user",
          content: [
            {
              type: "input_text",
              text: composedPrompt
            }
          ]
        }
      ],
      text: {
        format: {
          type: "text"
        }
      }
    };

    if (uploadedFileIds.length) {
      requestPayload.tools = [
        {
          type: "code_interpreter",
          container: {
            type: "auto",
            memory_limit: "4g",
            file_ids: uploadedFileIds
          }
        }
      ];
      requestPayload.include = ["code_interpreter_call.outputs"];
    }

    const apiResponse = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(requestPayload)
    });

    const data = await apiResponse.json();
    if (!apiResponse.ok) {
      sendJson(res, apiResponse.status, {
        error: buildServiceUnavailableMessage(
          "workbench",
          data.error?.message || "Nie udalo sie wykonac analizy."
        )
      });
      return;
    }

    const reply =
      extractText(data.output) || "Nie udalo sie przygotowac odpowiedzi z narzedzi.";

    let chatPayload = null;
    let summaryPayload = null;

    if (saveToChat || body.chatId) {
      const chats = await readChats();
      let chat = chats.find(
        (entry) => entry.id === body.chatId && entry.userId === user.id
      );

      if (!chat) {
        chat = await createChat(user);
        chats.unshift(chat);
      }

      const now = new Date().toISOString();
      const userText = [
        `Workbench / ${taskType}`,
        prompt || "Analiza materialu",
        links.length ? `Linki: ${links.join(", ")}` : "",
        files.length ? `Pliki: ${files.map((file) => file.name).join(", ")}` : ""
      ]
        .filter(Boolean)
        .join("\n");

      chat.messages.push({
        id: crypto.randomUUID(),
        role: "user",
        content: userText,
        createdAt: now
      });
      chat.messages.push({
        id: crypto.randomUUID(),
        role: "assistant",
        content: reply,
        createdAt: new Date().toISOString()
      });
      if (chat.title === "Nowa rozmowa") {
        chat.title = (prompt || `${taskType} narzedzia`).slice(0, 60);
      }
      chat.updatedAt = new Date().toISOString();

      const nextChats = chats
        .filter((entry) => entry.id !== chat.id)
        .concat(chat)
        .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));

      await writeChats(nextChats);
      chatPayload = sanitizeChat(chat);
      summaryPayload = buildChatSummary(chat);
    }

    await logAudit("workbench_run", req, {
      userId: user.id,
      taskType,
      expertMode,
      links: links.length,
      files: files.length,
      blockedFiles: blockedFindings.length
    });

    sendJson(res, 200, {
      reply,
      taskType,
      expertMode,
      model: CHAT_MODEL,
      chat: chatPayload,
      summary: summaryPayload,
      sources: sources.map((source) => ({
        kind: source.kind,
        title: source.title,
        url: source.url,
        excerpt: clipText(source.text, 500)
      })),
      blockedFindings
    });
  } catch (error) {
    sendJson(res, 500, {
      error: error.message || "Nie udalo sie uruchomic workbencha."
    });
  }
}

async function handleChatList(req, res) {
  const user = await getAuthenticatedUser(req);

  if (!user) {
    sendJson(res, 401, { error: "Zaloguj sie, aby zobaczyc historie rozmow." });
    return;
  }

  const chats = await readChats();
  const userChats = chats
    .filter((chat) => chat.userId === user.id)
    .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
    .map(buildChatSummary);

  sendJson(res, 200, { chats: userChats });
}

async function handleChatCreate(req, res) {
  const user = await getAuthenticatedUser(req);

  if (!user) {
    sendJson(res, 401, { error: "Zaloguj sie, aby utworzyc nowa rozmowe." });
    return;
  }

  const chat = await createChat(user);
  await logAudit("chat_create", req, {
    userId: user.id,
    chatId: chat.id
  });

  sendJson(res, 201, {
    chat: sanitizeChat(chat),
    summary: buildChatSummary(chat)
  });
}

async function handleChatGet(req, res, chatId) {
  const user = await getAuthenticatedUser(req);

  if (!user) {
    sendJson(res, 401, { error: "Zaloguj sie, aby otworzyc rozmowe." });
    return;
  }

  const chat = await getUserChat(user.id, chatId);
  if (!chat) {
    sendJson(res, 404, { error: "Nie znaleziono rozmowy." });
    return;
  }

  sendJson(res, 200, { chat: sanitizeChat(chat) });
}

async function handleChatDelete(req, res, chatId) {
  const user = await getAuthenticatedUser(req);

  if (!user) {
    sendJson(res, 401, { error: "Zaloguj sie, aby usunac rozmowe." });
    return;
  }

  const chats = await readChats();
  const existing = chats.find((chat) => chat.id === chatId && chat.userId === user.id);

  if (!existing) {
    sendJson(res, 404, { error: "Nie znaleziono rozmowy." });
    return;
  }

  await writeChats(
    chats.filter((chat) => !(chat.id === chatId && chat.userId === user.id))
  );
  await logAudit("chat_delete", req, {
    userId: user.id,
    chatId
  });

  sendJson(res, 200, { success: true });
}

function detectChatMediaIntent(message) {
  const normalized = stripRetryPrefix(String(message || "").trim()) || String(message || "").trim();
  const lower = normalized.toLowerCase();

  const imagePrefixes = ["/image ", "/obraz ", "obraz:", "wygeneruj obraz:", "stworz obraz:"];
  const videoPrefixes = ["/video ", "/wideo ", "wideo:", "wygeneruj wideo:", "stworz wideo:"];
  const genericImagePrefixes = ["wygeneruj ", "narysuj ", "stworz ", "stwórz ", "zrob obraz ", "zrób obraz "];

  const matchedImagePrefix = imagePrefixes.find((prefix) => lower.startsWith(prefix));
  if (matchedImagePrefix) {
    return {
      type: "image",
      prompt: normalized.slice(matchedImagePrefix.length).trim()
    };
  }

  const matchedVideoPrefix = videoPrefixes.find((prefix) => lower.startsWith(prefix));
  if (matchedVideoPrefix) {
    return {
      type: "video",
      prompt: normalized.slice(matchedVideoPrefix.length).trim()
    };
  }

  const matchedGenericImagePrefix = genericImagePrefixes.find((prefix) => lower.startsWith(prefix));
  if (matchedGenericImagePrefix) {
    const prompt = normalized.slice(matchedGenericImagePrefix.length).trim();
    if (prompt && !/^(plan|tekst|email|wiadomosc|wiadomość|opis strony|strategie|strategię|api|kod|funkcj)/i.test(prompt)) {
      return {
        type: "image",
        prompt
      };
    }
  }

  return null;
}

async function generateImageWithOpenAiFallback(user, prompt, options = {}) {
  if (!OPENAI_API_KEY) {
    throw new Error("Brak OPENAI_API_KEY. Generator obrazu nie jest dostepny.");
  }

  const size = ["1024x1024", "1024x1536", "1536x1024"].includes(options.size)
    ? options.size
    : "1024x1024";
  const quality = ["auto", "low", "medium", "high"].includes(options.quality)
    ? options.quality
    : "auto";

  const candidateModels = Array.from(
    new Set([IMAGE_MODEL, "gpt-image-1", "gpt-image-1.5"].filter(Boolean))
  );

  let lastErrorMessage = "";

  for (const model of candidateModels) {
    const apiResponse = await fetch("https://api.openai.com/v1/images/generations", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model,
        prompt: buildMediaSafetyPrompt(prompt, "image"),
        size,
        quality,
        background: "auto",
        output_format: "png",
        user: user.id
      })
    });

    const data = await apiResponse.json().catch(() => ({}));
    const errorMessage = data?.error?.message || "Nie udalo sie wygenerowac obrazu.";

    if (apiResponse.ok) {
      const imageData = data.data?.[0]?.b64_json;
      if (!imageData) {
        lastErrorMessage = "Brak danych obrazu w odpowiedzi API.";
        continue;
      }

      return {
        imageDataUrl: `data:image/png;base64,${imageData}`,
        model,
        size,
        quality
      };
    }

    lastErrorMessage = errorMessage;

    const isAuthOrQuota = [401, 403, 429].includes(apiResponse.status);
    if (isAuthOrQuota) {
      throw new Error(
        buildServiceUnavailableMessage("generowania obrazu", errorMessage)
      );
    }

    const canTryNextModel = apiResponse.status >= 500 || /model|unsupported|not found|invalid model/i.test(errorMessage);
    if (!canTryNextModel) {
      throw new Error(
        buildServiceUnavailableMessage("generowania obrazu", errorMessage)
      );
    }
  }

  const [widthRaw, heightRaw] = String(size).split("x");
  const width = Number(widthRaw) || 1024;
  const height = Number(heightRaw) || 1024;
  const safePrompt = buildMediaSafetyPrompt(prompt, "image");
  const fallbackUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(safePrompt)}?width=${width}&height=${height}&nologo=true&safe=true`;

  return {
    imageDataUrl: fallbackUrl,
    model: "pollinations-fallback",
    size,
    quality
  };
}

async function createImageAssetFromChat(user, prompt) {
  return generateImageWithOpenAiFallback(user, prompt, {
    size: "1024x1024",
    quality: "auto"
  });
}

async function createVideoAssetFromChat(user, prompt) {
  if (!VIDEO_GENERATION_ENABLED) {
    throw new Error(buildVideoGenerationDisabledMessage());
  }

  if (!OPENAI_API_KEY) {
    throw new Error("Brak OPENAI_API_KEY. Generator wideo z czatu nie jest dostepny.");
  }

  const formData = new FormData();
  formData.set("model", VIDEO_MODEL);
  formData.set("prompt", buildMediaSafetyPrompt(prompt, "video"));
  formData.set("seconds", "4");
  formData.set("size", "1280x720");

  const apiResponse = await fetch("https://api.openai.com/v1/videos", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${OPENAI_API_KEY}`
    },
    body: formData
  });

  const data = await apiResponse.json();
  if (!apiResponse.ok) {
    throw new Error(
      buildServiceUnavailableMessage(
        "generowania wideo z czatu",
        data.error?.message || "Nie udalo sie uruchomic generowania wideo."
      )
    );
  }

  const job = {
    id: data.id,
    userId: user.id,
    prompt,
    model: data.model || VIDEO_MODEL,
    seconds: data.seconds || "4",
    size: data.size || "1280x720",
    status: data.status || "queued",
    progress: data.progress || 0,
    createdAt: new Date().toISOString()
  };

  await storeVideoJob(job);
  return job;
}

function buildChatMediaFailureReply(mediaType, prompt, errorMessage) {
  const mediaLabel = mediaType === "video" ? "wideo" : "obrazu";
  const retryPrompt = buildMediaRetryPrompt(prompt, mediaType);
  const sections = [
    `Nie moge teraz wykonac generowania ${mediaLabel} z czatu.`,
    String(errorMessage || "Generator mediow jest chwilowo niedostepny.")
  ];

  if (prompt) {
    sections.push(`Ostatni prompt: ${clipText(prompt, 280)}`);
  }

  if (isQuotaErrorMessage(errorMessage)) {
    sections.push(
      "To nie jest limit ustawiony w tej aplikacji. Blokada jest po stronie konta OpenAI. Trzeba odblokowac billing albo podmienic OPENAI_API_KEY na klucz z aktywnym limitem."
    );
  }

  if (retryPrompt) {
    sections.push(
      mediaType === "video"
        ? `Gotowy prompt do ponowienia:\n${retryPrompt}`
        : `Gotowy prompt obrazu do ponowienia:\n${retryPrompt}`
    );
  }

  sections.push(
    mediaType === "video"
      ? "Moge za to od razu dopracowac opis sceny, ruch kamery i wersje promptu do ponowienia po odblokowaniu limitu."
      : "Moge za to od razu dopracowac prompt obrazu, styl, kompozycje i warianty do ponowienia po odblokowaniu limitu."
  );

  return sections.join("\n\n");
}

async function handleChatReply(req, res) {
  const user = await getAuthenticatedUser(req);

  if (!user) {
    sendJson(res, 401, { error: "Zaloguj sie, aby korzystac z czatu." });
    return;
  }

  if (CHAT_PROVIDER === "openai" && !OPENAI_API_KEY) {
    sendJson(res, 500, {
      error: "Brak OPENAI_API_KEY. Ustaw klucz API."
    });
    return;
  }

  try {
    const body = await readJsonBody(req);
    const message = String(body.message || "").trim();
    const safetyRisk = analyzeSafetyRisk(message);
    const liveCategory = String(body.liveCategory || "all").toLowerCase();
    const mode = ["general", "code", "analysis", "review", "live"].includes(body.mode)
      ? body.mode
      : "general";

    if (!message) {
      sendJson(res, 400, { error: "Podaj wiadomosc." });
      return;
    }

    const chats = await readChats();
    let chat = chats.find(
      (entry) => entry.id === body.chatId && entry.userId === user.id
    );

    if (!chat) {
      chat = await createChat(user);
      chats.unshift(chat);
    }

    const now = new Date().toISOString();
    const userMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content: message,
      createdAt: now
    };
    chat.messages.push(userMessage);

    if (chat.title === "Nowa rozmowa") {
      chat.title = message.slice(0, 60);
    }

    if (safetyRisk) {
      chat.messages.push({
        id: crypto.randomUUID(),
        role: "assistant",
        content: safetyRisk.message,
        createdAt: new Date().toISOString()
      });
      chat.updatedAt = new Date().toISOString();

      const nextChats = chats
        .filter((entry) => entry.id !== chat.id)
        .concat(chat)
        .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));

      await writeChats(nextChats);
      await logAudit("chat_safety_block", req, {
        userId: user.id,
        chatId: chat.id,
        category: safetyRisk.category
      });

      sendJson(res, 200, {
        reply: safetyRisk.message,
        model: "local-safety-guard",
        source: "local-safety-guard",
        sourceLabel: "Lokalna ochrona",
        chat: sanitizeChat(chat),
        summary: buildChatSummary(chat)
      });
      return;
    }

    const mediaIntent = detectChatMediaIntent(message);
    if (mediaIntent?.type === "image") {
      if (!mediaIntent.prompt) {
        sendJson(res, 400, { error: "Po poleceniu obrazu dodaj opis, co mam wygenerowac." });
        return;
      }

      let assistantMessage;

      try {
        const result = await createImageAssetFromChat(user, mediaIntent.prompt);
        const isFallbackModel = String(result.model || "").includes("fallback");
        assistantMessage = {
          id: crypto.randomUUID(),
          role: "assistant",
          content: "Wygenerowalem obraz bez wychodzenia z czatu. Jesli chcesz, moge teraz przygotowac kolejne warianty, poprawki albo prompt do wideo na bazie tego samego opisu.",
          source: isFallbackModel ? "image-fallback" : "openai-image",
          sourceLabel: isFallbackModel ? "Image fallback" : "OpenAI image",
          mediaType: "image",
          imageDataUrl: result.imageDataUrl,
          mediaPrompt: mediaIntent.prompt,
          mediaModel: result.model,
          mediaSize: result.size,
          mediaQuality: result.quality,
          createdAt: new Date().toISOString()
        };
      } catch (mediaError) {
        assistantMessage = {
          id: crypto.randomUUID(),
          role: "assistant",
          content: buildChatMediaFailureReply("image", mediaIntent.prompt, mediaError.message),
          source: "local-fallback",
          sourceLabel: "Lokalny fallback",
          mediaType: "image-error",
          mediaPrompt: mediaIntent.prompt,
          createdAt: new Date().toISOString()
        };
      }

      chat.messages.push(assistantMessage);
      chat.updatedAt = new Date().toISOString();

      const nextChats = chats
        .filter((entry) => entry.id !== chat.id)
        .concat(chat)
        .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));

      await writeChats(nextChats);
      await logAudit("chat_image_generation", req, {
        userId: user.id,
        chatId: chat.id
      });

      sendJson(res, 200, {
        reply: assistantMessage.content,
        model: assistantMessage.mediaModel || "local-provider-fallback",
        source: assistantMessage.source,
        sourceLabel: assistantMessage.sourceLabel,
        chat: sanitizeChat(chat),
        summary: buildChatSummary(chat)
      });
      return;
    }

    if (mediaIntent?.type === "video") {
      if (!mediaIntent.prompt) {
        sendJson(res, 400, { error: "Po poleceniu wideo dodaj opis sceny, ruchu albo klimatu." });
        return;
      }

      if (!VIDEO_GENERATION_ENABLED) {
        const assistantMessage = {
          id: crypto.randomUUID(),
          role: "assistant",
          content: `${buildVideoGenerationDisabledMessage()} Jesli chcesz, moge zamiast tego przygotowac prompt sceny, storyboard albo prompt obrazu z tego samego opisu.`,
          source: "local-fallback",
          sourceLabel: "Lokalny fallback",
          mediaType: "video-disabled",
          mediaPrompt: mediaIntent.prompt,
          createdAt: new Date().toISOString()
        };

        chat.messages.push(assistantMessage);
        chat.updatedAt = new Date().toISOString();

        const nextChats = chats
          .filter((entry) => entry.id !== chat.id)
          .concat(chat)
          .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));

        await writeChats(nextChats);

        sendJson(res, 200, {
          reply: assistantMessage.content,
          model: "local-video-disabled",
          source: assistantMessage.source,
          sourceLabel: assistantMessage.sourceLabel,
          chat: sanitizeChat(chat),
          summary: buildChatSummary(chat)
        });
        return;
      }

      let assistantMessage;

      try {
        const job = await createVideoAssetFromChat(user, mediaIntent.prompt);
        assistantMessage = {
          id: crypto.randomUUID(),
          role: "assistant",
          content: "Uruchomilem generowanie wideo z poziomu czatu. Job jest zapisany w watku i moge dalej rozwijac scene, prompt albo przygotowac kolejne ujecie.",
          source: "openai-video",
          sourceLabel: "OpenAI video",
          mediaType: "video",
          videoJobId: job.id,
          videoStatus: job.status,
          mediaPrompt: mediaIntent.prompt,
          mediaModel: job.model,
          mediaSize: job.size,
          mediaSeconds: job.seconds,
          createdAt: new Date().toISOString()
        };
      } catch (mediaError) {
        assistantMessage = {
          id: crypto.randomUUID(),
          role: "assistant",
          content: buildChatMediaFailureReply("video", mediaIntent.prompt, mediaError.message),
          source: "local-fallback",
          sourceLabel: "Lokalny fallback",
          mediaType: "video-error",
          mediaPrompt: mediaIntent.prompt,
          createdAt: new Date().toISOString()
        };
      }

      chat.messages.push(assistantMessage);
      chat.updatedAt = new Date().toISOString();

      const nextChats = chats
        .filter((entry) => entry.id !== chat.id)
        .concat(chat)
        .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));

      await writeChats(nextChats);
      await logAudit("chat_video_generation", req, {
        userId: user.id,
        chatId: chat.id,
        videoId: job.id
      });

      sendJson(res, 200, {
        reply: assistantMessage.content,
        model: assistantMessage.mediaModel || "local-provider-fallback",
        source: assistantMessage.source,
        sourceLabel: assistantMessage.sourceLabel,
        chat: sanitizeChat(chat),
        summary: buildChatSummary(chat)
      });
      return;
    }

    const completion = await generateChatReply(user, mode, chat.messages, liveCategory);
    const reply = completion.reply;

    chat.messages.push({
      id: crypto.randomUUID(),
      role: "assistant",
      content: reply,
      source: completion.source || "unknown",
      sourceLabel: completion.sourceLabel || completion.model,
      createdAt: new Date().toISOString()
    });
    chat.updatedAt = new Date().toISOString();

    const nextChats = chats
      .filter((entry) => entry.id !== chat.id)
      .concat(chat)
      .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));

    await writeChats(nextChats);
    await logAudit("chat_reply", req, {
      userId: user.id,
      chatId: chat.id,
      mode
    });

    sendJson(res, 200, {
      reply,
      model: completion.model,
      source: completion.source,
      sourceLabel: completion.sourceLabel,
      chat: sanitizeChat(chat),
      summary: buildChatSummary(chat)
    });
  } catch (error) {
    sendJson(res, 500, {
      error: error.message || "Wystapil nieoczekiwany blad."
    });
  }
}

async function handleImageGeneration(req, res) {
  const user = await getAuthenticatedUser(req);

  if (!user) {
    sendJson(res, 401, { error: "Zaloguj sie, aby generowac obrazy." });
    return;
  }

  if (!OPENAI_API_KEY) {
    sendJson(res, 500, { error: "Brak OPENAI_API_KEY. Ustaw klucz API." });
    return;
  }

  try {
    const body = await readJsonBody(req);
    const prompt = String(body.prompt || "").trim();
    const safetyRisk = analyzeSafetyRisk(prompt);
    const size = ["1024x1024", "1024x1536", "1536x1024"].includes(body.size)
      ? body.size
      : "1024x1024";
    const quality = ["auto", "low", "medium", "high"].includes(body.quality)
      ? body.quality
      : "auto";

    if (!prompt) {
      sendJson(res, 400, { error: "Podaj opis obrazu." });
      return;
    }

    if (safetyRisk) {
      sendJson(res, 400, {
        error: safetyRisk.message,
        blockedCategory: safetyRisk.category
      });
      return;
    }

    const result = await generateImageWithOpenAiFallback(user, prompt, {
      size,
      quality
    });

    await logAudit("image_generation", req, {
      userId: user.id,
      size,
      quality
    });

    sendJson(res, 200, {
      imageDataUrl: result.imageDataUrl,
      model: result.model,
      size: result.size,
      quality: result.quality
    });
  } catch (error) {
    sendJson(res, 500, {
      error: error.message || "Wystapil blad podczas generowania obrazu."
    });
  }
}

async function storeVideoJob(job) {
  const jobs = await readJsonFile(VIDEO_JOBS_FILE, []);
  const nextJobs = jobs.filter((entry) => entry.id !== job.id);
  nextJobs.unshift(job);
  await writeJsonFile(VIDEO_JOBS_FILE, nextJobs.slice(0, 300), { backup: true });
}

async function handleVideoCreate(req, res) {
  const user = await getAuthenticatedUser(req);

  if (!user) {
    sendJson(res, 401, { error: "Zaloguj sie, aby generowac wideo." });
    return;
  }

  if (!OPENAI_API_KEY) {
    sendJson(res, 500, { error: "Brak OPENAI_API_KEY. Ustaw klucz API." });
    return;
  }

  if (!VIDEO_GENERATION_ENABLED) {
    sendJson(res, 503, {
      error: buildVideoGenerationDisabledMessage()
    });
    return;
  }

  try {
    const body = await readJsonBody(req);
    const prompt = String(body.prompt || "").trim();
    const safetyRisk = analyzeSafetyRisk(prompt);
    const model = body.model === "sora-2-pro" ? "sora-2-pro" : VIDEO_MODEL;
    const seconds = ["4", "8", "12"].includes(String(body.seconds))
      ? String(body.seconds)
      : "4";
    const size = ["720x1280", "1280x720", "1024x1792", "1792x1024"].includes(
      String(body.size)
    )
      ? String(body.size)
      : "1280x720";

    if (!prompt) {
      sendJson(res, 400, { error: "Podaj opis filmu." });
      return;
    }

    if (safetyRisk) {
      sendJson(res, 400, {
        error: safetyRisk.message,
        blockedCategory: safetyRisk.category
      });
      return;
    }

    const formData = new FormData();
    formData.set("model", model);
    formData.set("prompt", buildMediaSafetyPrompt(prompt, "video"));
    formData.set("seconds", seconds);
    formData.set("size", size);

    const apiResponse = await fetch("https://api.openai.com/v1/videos", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENAI_API_KEY}`
      },
      body: formData
    });

    const data = await apiResponse.json();
    if (!apiResponse.ok) {
      sendJson(res, apiResponse.status, {
        error: buildServiceUnavailableMessage(
          "generowania wideo",
          data.error?.message || "Nie udalo sie uruchomic generowania wideo."
        )
      });
      return;
    }

    const job = {
      id: data.id,
      userId: user.id,
      prompt,
      model: data.model || model,
      seconds: data.seconds || seconds,
      size: data.size || size,
      status: data.status || "queued",
      progress: data.progress || 0,
      createdAt: new Date().toISOString()
    };

    await storeVideoJob(job);
    await logAudit("video_create", req, {
      userId: user.id,
      videoId: job.id
    });

    sendJson(res, 201, { job });
  } catch (error) {
    sendJson(res, 500, {
      error: error.message || "Wystapil blad podczas tworzenia wideo."
    });
  }
}

async function refreshVideoJob(providerId) {
  const jobs = await readJsonFile(VIDEO_JOBS_FILE, []);
  const existingJob = jobs.find((job) => job.id === providerId);

  if (!existingJob || !OPENAI_API_KEY) {
    return existingJob || null;
  }

  try {
    const apiResponse = await fetch(`https://api.openai.com/v1/videos/${providerId}`, {
      headers: {
        "Authorization": `Bearer ${OPENAI_API_KEY}`
      }
    });

    const data = await apiResponse.json();
    if (!apiResponse.ok) {
      return existingJob;
    }

    const refreshedJob = {
      ...existingJob,
      model: data.model || existingJob.model,
      status: data.status || existingJob.status,
      progress: data.progress ?? existingJob.progress,
      seconds: data.seconds || existingJob.seconds,
      size: data.size || existingJob.size
    };

    await storeVideoJob(refreshedJob);
    return refreshedJob;
  } catch {
    return existingJob;
  }
}

async function handleVideoStatus(req, res, providerId) {
  const user = await getAuthenticatedUser(req);

  if (!user) {
    sendJson(res, 401, { error: "Zaloguj sie, aby sprawdzic status wideo." });
    return;
  }

  const jobs = await readJsonFile(VIDEO_JOBS_FILE, []);
  const job = jobs.find((entry) => entry.id === providerId && entry.userId === user.id);

  if (!job) {
    sendJson(res, 404, { error: "Nie znaleziono zadania wideo." });
    return;
  }

  const refreshedJob = await refreshVideoJob(providerId);
  sendJson(res, 200, { job: refreshedJob || job });
}

async function handleVideoList(req, res) {
  const user = await getAuthenticatedUser(req);

  if (!user) {
    sendJson(res, 401, { error: "Zaloguj sie, aby zobaczyc historie wideo." });
    return;
  }

  const jobs = await readJsonFile(VIDEO_JOBS_FILE, []);
  const userJobs = jobs.filter((job) => job.userId === user.id).slice(0, 20);

  const refreshedJobs = await Promise.all(
    userJobs.map((job) =>
      job.status === "queued" || job.status === "processing" || job.status === "in_progress"
        ? refreshVideoJob(job.id)
        : job
    )
  );

  sendJson(res, 200, { jobs: refreshedJobs.filter(Boolean) });
}

async function handleVideoContent(req, res, providerId) {
  const user = await getAuthenticatedUser(req);

  if (!user) {
    sendJson(res, 401, { error: "Zaloguj sie, aby pobrac wideo." });
    return;
  }

  const jobs = await readJsonFile(VIDEO_JOBS_FILE, []);
  const job = jobs.find((entry) => entry.id === providerId && entry.userId === user.id);

  if (!job) {
    sendJson(res, 404, { error: "Nie znaleziono zadania wideo." });
    return;
  }

  if (!OPENAI_API_KEY) {
    sendJson(res, 500, { error: "Brak OPENAI_API_KEY." });
    return;
  }

  const response = await fetch(
    `https://api.openai.com/v1/videos/${providerId}/content`,
    {
      headers: {
        "Authorization": `Bearer ${OPENAI_API_KEY}`
      }
    }
  );

  if (!response.ok) {
    const text = await response.text();
    sendJson(res, response.status, {
      error: text || "Nie udalo sie pobrac pliku wideo."
    });
    return;
  }

  const arrayBuffer = await response.arrayBuffer();
  sendBinary(res, 200, "video/mp4", Buffer.from(arrayBuffer));
}

async function handleAdminOverview(req, res) {
  const user = await getAuthenticatedUser(req);

  if (!requireAdmin(user, res)) {
    return;
  }

  const [users, audit, videoJobs, chats, incidents] = await Promise.all([
    readJsonFile(USERS_FILE, []),
    readJsonFile(AUDIT_FILE, []),
    readJsonFile(VIDEO_JOBS_FILE, []),
    readChats(),
    readIncidents()
  ]);

  const loginMap = new Map();
  const logoutMap = new Map();
  const ipMap = new Map();
  const chatMap = new Map();

  for (const entry of audit) {
    const userId = entry.details?.userId;
    if (!userId) {
      continue;
    }

    if (entry.event === "login_success" && !loginMap.has(userId)) {
      loginMap.set(userId, entry.timestamp);
      ipMap.set(userId, entry.ip);
    }

    if (entry.event === "logout" && !logoutMap.has(userId)) {
      logoutMap.set(userId, entry.timestamp);
    }
  }

  for (const chat of chats) {
    if (!chatMap.has(chat.userId)) {
      chatMap.set(chat.userId, chat.updatedAt);
    }
  }

  sendJson(res, 200, {
    summary: {
      users: users.length,
      admins: users.filter((entry) => entry.role === "admin").length,
      chats: chats.length,
      videoJobs: videoJobs.length,
      incidents: incidents.length,
      lastAuditEvent: audit[0]?.timestamp || null,
      storageDriver: storageState.mode
    },
    users: users.map((entry) => ({
      id: entry.id,
      role: entry.role,
      username: entry.username,
      displayName: entry.displayName,
      firstName: entry.firstName,
      lastName: entry.lastName,
      email: entry.email,
      profile: entry.profile,
      consents: entry.consents,
      integrationCount: sanitizeIntegrations(entry.integrations).length,
      createdAt: entry.createdAt,
      lastLoginAt: loginMap.get(entry.id) || null,
      lastLogoutAt: logoutMap.get(entry.id) || null,
      lastKnownIp: ipMap.get(entry.id) || null,
      lastChatAt: chatMap.get(entry.id) || null
    })),
    audit: audit.slice(0, 120),
    incidents: incidents.slice(0, 120),
    contact: CONTACT
  });
}

async function requestHandler(req, res) {
  const pathname = safePathname(req);
  const videoStatusMatch = pathname.match(/^\/api\/media\/video\/([^/]+)$/);
  const videoContentMatch = pathname.match(/^\/api\/media\/video\/([^/]+)\/content$/);
  const chatMatch = pathname.match(/^\/api\/chats\/([^/]+)$/);

  if (req.method === "POST" && pathname === "/api/account/suggest") {
    await handleAccountSuggest(req, res);
    return;
  }

  if (req.method === "POST" && pathname === "/api/register") {
    await handleRegister(req, res);
    return;
  }

  if (req.method === "POST" && pathname === "/api/login") {
    await handleLogin(req, res);
    return;
  }

  if (req.method === "POST" && pathname === "/api/guest") {
    await handleGuestSession(req, res);
    return;
  }

  if (req.method === "GET" && pathname === "/api/me") {
    await handleCurrentUser(req, res);
    return;
  }

  if (req.method === "GET" && pathname === "/api/ai/status") {
    await handleAiStatus(req, res);
    return;
  }

  if (req.method === "POST" && pathname === "/api/logout") {
    await handleLogout(req, res);
    return;
  }

  if (req.method === "POST" && pathname === "/api/settings") {
    await handleSettingsUpdate(req, res);
    return;
  }

  if (req.method === "GET" && pathname === "/api/integrations") {
    await handleIntegrationsList(req, res);
    return;
  }

  if (req.method === "GET" && pathname === "/api/integrations/alibaba/status") {
    await handleAlibabaStatus(req, res);
    return;
  }

  if (req.method === "GET" && pathname === "/api/live/news") {
    await handleLiveNews(req, res);
    return;
  }

  if (req.method === "GET" && pathname === "/api/integrations/gmail/oauth/status") {
    await handleGmailOAuthStatus(req, res);
    return;
  }

  if (req.method === "GET" && pathname === "/api/integrations/gmail/oauth/start") {
    await handleGmailOAuthStart(req, res);
    return;
  }

  if (req.method === "GET" && pathname === "/api/integrations/gmail/oauth/callback") {
    await handleGmailOAuthCallback(req, res);
    return;
  }

  if (req.method === "GET" && pathname === "/api/integrations/gmail/inbox") {
    await handleGmailInbox(req, res);
    return;
  }

  if (req.method === "POST" && pathname === "/api/integrations/gmail/oauth/disconnect") {
    await handleGmailOAuthDisconnect(req, res);
    return;
  }

  if (req.method === "POST" && pathname === "/api/integrations/gmail/send") {
    await handleGmailSend(req, res);
    return;
  }

  if (req.method === "POST" && pathname === "/api/integrations") {
    await handleIntegrationsUpdate(req, res);
    return;
  }

  if (req.method === "POST" && pathname === "/api/workbench/run") {
    await handleWorkbenchRun(req, res);
    return;
  }

  if (req.method === "GET" && pathname === "/api/chats") {
    await handleChatList(req, res);
    return;
  }

  if (req.method === "POST" && pathname === "/api/chats") {
    await handleChatCreate(req, res);
    return;
  }

  if (req.method === "GET" && chatMatch) {
    await handleChatGet(req, res, chatMatch[1]);
    return;
  }

  if (req.method === "DELETE" && chatMatch) {
    await handleChatDelete(req, res, chatMatch[1]);
    return;
  }

  if (req.method === "POST" && pathname === "/api/chat") {
    await handleChatReply(req, res);
    return;
  }

  if (req.method === "POST" && pathname === "/api/media/image") {
    await handleImageGeneration(req, res);
    return;
  }

  if (req.method === "POST" && pathname === "/api/media/video") {
    await handleVideoCreate(req, res);
    return;
  }

  if (req.method === "GET" && pathname === "/api/media/videos") {
    await handleVideoList(req, res);
    return;
  }

  if (req.method === "GET" && videoContentMatch) {
    await handleVideoContent(req, res, videoContentMatch[1]);
    return;
  }

  if (req.method === "GET" && videoStatusMatch) {
    await handleVideoStatus(req, res, videoStatusMatch[1]);
    return;
  }

  if (req.method === "GET" && pathname === "/api/admin/overview") {
    await handleAdminOverview(req, res);
    return;
  }

  if (req.method === "GET") {
    serveFile(req, res);
    return;
  }

  sendJson(res, 405, { error: "Method not allowed" });
}

async function startServer() {
  await ensureStorage();

  const server = http.createServer((req, res) => {
    requestHandler(req, res).catch((error) => {
      sendJson(res, 500, {
        error: error.message || "Wystapil nieoczekiwany blad serwera."
      });
    });
  });

  server.listen(PORT, () => {
    console.log(`Server listening on http://localhost:${PORT}`);
  });
}

startServer().catch((error) => {
  console.error("Cannot start server:", error);
  process.exit(1);
});
