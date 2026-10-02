const crypto = require("crypto");

const TOKEN_TTL_SECONDS = 60 * 60;
const SESSION_COOKIE_NAME = "meditec_session";

function resolveSessionSecret(env = process.env) {
  const secret = env.SESSION_SECRET || "desarrollo-local-no-usar-en-produccion";
  if (env.NODE_ENV === "production" && secret.length < 32) {
    throw new Error("SESSION_SECRET debe tener al menos 32 caracteres en produccion");
  }
  return secret;
}

function signToken(payload, secret, nowSeconds = Math.floor(Date.now() / 1000)) {
  const body = Buffer.from(JSON.stringify({
    ...payload,
    iat: nowSeconds,
    exp: nowSeconds + TOKEN_TTL_SECONDS,
  })).toString("base64url");
  const signature = crypto.createHmac("sha256", secret).update(body).digest("base64url");
  return `${body}.${signature}`;
}

function verifyToken(token, secret, nowSeconds = Math.floor(Date.now() / 1000)) {
  try {
    if (typeof token !== "string") return null;
    const parts = token.split(".");
    if (parts.length !== 2 || !parts[0] || !parts[1]) return null;

    const [body, signature] = parts;
    const expected = crypto.createHmac("sha256", secret).update(body).digest("base64url");
    const receivedBuffer = Buffer.from(signature, "utf8");
    const expectedBuffer = Buffer.from(expected, "utf8");
    if (receivedBuffer.length !== expectedBuffer.length) return null;
    if (!crypto.timingSafeEqual(receivedBuffer, expectedBuffer)) return null;

    const payload = JSON.parse(Buffer.from(body, "base64url").toString("utf8"));
    if (!Number.isInteger(payload.exp) || payload.exp <= nowSeconds) return null;
    if (!Number.isInteger(payload.iat) || payload.iat > nowSeconds + 60) return null;
    return payload;
  } catch (_error) {
    return null;
  }
}

function readSessionCookie(cookieHeader) {
  if (typeof cookieHeader !== "string") return null;
  for (const item of cookieHeader.split(";")) {
    const separator = item.indexOf("=");
    if (separator === -1) continue;
    const name = item.slice(0, separator).trim();
    if (name !== SESSION_COOKIE_NAME) continue;
    try {
      return decodeURIComponent(item.slice(separator + 1).trim());
    } catch (_error) {
      return null;
    }
  }
  return null;
}

function createSessionCookie(token, production = false) {
  const attributes = [
    `${SESSION_COOKIE_NAME}=${encodeURIComponent(token)}`,
    "HttpOnly",
    "Path=/",
    "SameSite=Strict",
    `Max-Age=${TOKEN_TTL_SECONDS}`,
  ];
  if (production) attributes.push("Secure");
  return attributes.join("; ");
}

function clearSessionCookie(production = false) {
  const attributes = [
    `${SESSION_COOKIE_NAME}=`,
    "HttpOnly",
    "Path=/",
    "SameSite=Strict",
    "Max-Age=0",
  ];
  if (production) attributes.push("Secure");
  return attributes.join("; ");
}

module.exports = {
  SESSION_COOKIE_NAME,
  TOKEN_TTL_SECONDS,
  clearSessionCookie,
  createSessionCookie,
  readSessionCookie,
  resolveSessionSecret,
  signToken,
  verifyToken,
};
