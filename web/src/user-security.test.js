const test = require("node:test");
const assert = require("node:assert/strict");
const { validatePassword } = require("./user-security");

test("acepta una contrasena segura", () => {
  assert.equal(validatePassword("Temporal2026"), "Temporal2026");
});

test("rechaza contrasenas cortas o sin combinacion", () => {
  assert.throws(() => validatePassword("corta1"), /10 y 128/);
  assert.throws(() => validatePassword("solamentepalabras"), /letras y numeros/);
  assert.throws(() => validatePassword("1234567890"), /letras y numeros/);
});
