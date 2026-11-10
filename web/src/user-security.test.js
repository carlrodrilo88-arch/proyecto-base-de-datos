const test = require("node:test");
const assert = require("node:assert/strict");
const {
  validatePassword, normalizeUsername, generateTemporaryPassword, resolveTemporaryPassword,
} = require("./user-security");

test("acepta una contrasena segura", () => {
  assert.equal(validatePassword("Temporal2026"), "Temporal2026");
});

test("rechaza contrasenas cortas o sin combinacion", () => {
  assert.throws(() => validatePassword("corta1"), /10 y 128/);
  assert.throws(() => validatePassword("solamentepalabras"), /letras y numeros/);
  assert.throws(() => validatePassword("1234567890"), /letras y numeros/);
});

test("normaliza el nombre de usuario en minusculas", () => {
  assert.equal(normalizeUsername("  Carlos "), "carlos");
  assert.equal(normalizeUsername("c.lopez_2026"), "c.lopez_2026");
});

test("rechaza nombres de usuario invalidos", () => {
  assert.throws(() => normalizeUsername("ab"), /entre 3 y 60/);
  assert.throws(() => normalizeUsername("carlos lopez"), /entre 3 y 60/);
  assert.throws(() => normalizeUsername("admin@meditec.local"), /entre 3 y 60/);
  assert.throws(() => normalizeUsername(undefined), /entre 3 y 60/);
});

test("genera contrasenas temporales validas y distintas", () => {
  const first = generateTemporaryPassword();
  const second = generateTemporaryPassword();
  assert.match(first, /^[0-9a-f]{16}$/);
  assert.equal(validatePassword(first), first);
  assert.notEqual(first, second);
});

test("resuelve la contrasena temporal manual o generada", () => {
  assert.equal(resolveTemporaryPassword({ generar_password: true }).generated, true);
  assert.deepEqual(resolveTemporaryPassword({ password_temporal: "Temporal2026" }),
    { password: "Temporal2026", generated: false });
  assert.deepEqual(resolveTemporaryPassword({}, false), { password: null, generated: false });
  assert.throws(() => resolveTemporaryPassword({}), /10 y 128/);
});
