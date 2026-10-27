const test = require("node:test");
const assert = require("node:assert/strict");
const { migrationConnections } = require("./migrate-report-templates");

test("la migracion requiere una conexion administrativa explicita", () => {
  assert.throws(() => migrationConnections({ DATABASE_URL: "postgresql://web@localhost/meditec" }), /DATABASE_ADMIN_URL/);
});

test("la migracion rechaza otra base o servidor", () => {
  const web = "postgresql://web@localhost:5432/meditec";
  for (const admin of ["postgresql://owner@localhost/otra", "postgresql://owner@remoto/meditec", "postgresql://owner@localhost:5433/meditec"]) {
    assert.throws(() => migrationConnections({ DATABASE_URL: web, DATABASE_ADMIN_URL: admin }), /misma base y servidor/);
  }
});

test("acepta propietario y cuenta web diferentes sobre la misma base local", () => {
  const result = migrationConnections({ DATABASE_URL: "postgresql://web@localhost/meditec", DATABASE_ADMIN_URL: "postgresql://owner@127.0.0.1:5432/meditec" });
  assert.equal(result.database, "meditec");
});
