const test = require("node:test");
const assert = require("node:assert/strict");
const bcrypt = require("bcryptjs");
const {
  SESSION_COOKIE_NAME,
  TOKEN_TTL_SECONDS,
  clearSessionCookie,
  createSessionCookie,
  readSessionCookie,
  resolveSessionSecret,
  signToken,
  verifyToken,
} = require("./security");

const secret = "secreto-de-prueba-con-mas-de-32-caracteres";
const payload = { id_usuario: 1, correo: "admin@meditec.local", rol: "administrador" };

test("acepta un token valido", () => {
  const token = signToken(payload, secret, 1000);
  const session = verifyToken(token, secret, 1001);
  assert.equal(session.id_usuario, 1);
  assert.equal(session.exp, 1000 + TOKEN_TTL_SECONDS);
});

test("rechaza un token vencido", () => {
  const token = signToken(payload, secret, 1000);
  assert.equal(verifyToken(token, secret, 1000 + TOKEN_TTL_SECONDS), null);
});

test("rechaza firma alterada o de longitud invalida", () => {
  const token = signToken(payload, secret, 1000);
  const [body, signature] = token.split(".");
  assert.equal(verifyToken(`${body}.${signature.slice(1)}`, secret, 1001), null);
  assert.equal(verifyToken(`${body}.firma-falsa`, secret, 1001), null);
});

test("rechaza tokens malformados", () => {
  assert.equal(verifyToken("sin-firma", secret), null);
  assert.equal(verifyToken("a.b.c", secret), null);
  assert.equal(verifyToken(null, secret), null);
});

test("exige un secreto largo en produccion", () => {
  assert.throws(
    () => resolveSessionSecret({ NODE_ENV: "production", SESSION_SECRET: "corto" }),
    /32 caracteres/
  );
  assert.equal(
    resolveSessionSecret({ NODE_ENV: "production", SESSION_SECRET: secret }),
    secret
  );
});

test("bcrypt valida la contrasena y rechaza otra", async () => {
  const hash = await bcrypt.hash("admin123", 10);
  assert.equal(await bcrypt.compare("admin123", hash), true);
  assert.equal(await bcrypt.compare("incorrecta", hash), false);
});

test("crea y lee una cookie HttpOnly de sesion", () => {
  const token = signToken(payload, secret, 1000);
  const cookie = createSessionCookie(token, false);
  assert.match(cookie, new RegExp(`^${SESSION_COOKIE_NAME}=`));
  assert.match(cookie, /HttpOnly/);
  assert.match(cookie, /SameSite=Strict/);
  assert.doesNotMatch(cookie, /Secure/);
  assert.equal(readSessionCookie(cookie), token);
});

test("agrega Secure en produccion y permite limpiar la cookie", () => {
  const cookie = createSessionCookie("token", true);
  const cleared = clearSessionCookie(true);
  assert.match(cookie, /Secure/);
  assert.match(cleared, /Max-Age=0/);
  assert.match(cleared, /Secure/);
});

test("rechaza cookies ausentes o mal codificadas", () => {
  assert.equal(readSessionCookie(undefined), null);
  assert.equal(readSessionCookie("otra=valor"), null);
  assert.equal(readSessionCookie(`${SESSION_COOKIE_NAME}=%E0%A4%A`), null);
});
