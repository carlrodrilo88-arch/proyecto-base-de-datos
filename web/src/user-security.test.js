const test = require("node:test");
const assert = require("node:assert/strict");
const { validatePassword, normalizeUsername } = require("./user-security");

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
