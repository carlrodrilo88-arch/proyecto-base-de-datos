// Regenera el PDF de todos los reportes publicados con la plantilla actual
// (por ejemplo, para que la firma muestre a los tecnicos asignados).
// Cada PDF nuevo se guarda con clave nueva; la version anterior queda como 'reemplazado'.
// Uso: node src/regenerate-published-pdfs.js [--dry-run] [--solo-con-tecnicos]
const crypto = require("crypto");
const { Pool } = require("pg");
require("dotenv").config();
const { generateReportPdf } = require("./pdf-report");
const { putPdf, deletePdf } = require("./storage");
const { loadReportDetail } = require("./report-detail");

async function main() {
  const dryRun = process.argv.includes("--dry-run");
  const onlyWithTechnicians = process.argv.includes("--solo-con-tecnicos");
  if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL es obligatoria");
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  let ok = 0;
  let failed = 0;
  try {
    const { rows } = await pool.query(
      `SELECT r.id_reporte, r.codigo_reporte FROM reportes r WHERE r.estado='publicado'
       ${onlyWithTechnicians ? "AND EXISTS (SELECT 1 FROM reporte_tecnico rt WHERE rt.id_reporte=r.id_reporte)" : ""}
       ORDER BY r.id_reporte`
    );
    console.log(`Reportes publicados: ${rows.length}${dryRun ? " (simulacion, no se cambia nada)" : ""}`);
    for (const { id_reporte: id, codigo_reporte: codigo } of rows) {
      let key = null;
      try {
        const report = await loadReportDetail(id, pool);
        const pdf = await generateReportPdf(report);
        if (dryRun) {
          console.log(`- ${codigo}: firma -> ${report.tecnicos || "(sin tecnicos)"}`);
          ok += 1;
          continue;
        }
        const hash = crypto.createHash("sha256").update(pdf).digest("hex");
        key = `reportes/${new Date().getFullYear()}/${codigo}-v${Date.now()}.pdf`;
        await putPdf(key, pdf);
        await pool.query("CALL reemplazar_pdf_reporte($1, $2, $3, $4, NULL)", [id, key, hash, pdf.length]);
        console.log(`- ${codigo}: regenerado (firma: ${report.tecnicos || "sin tecnicos"})`);
        ok += 1;
      } catch (error) {
        if (key) await deletePdf(key).catch(() => null);
        console.error(`- ${codigo}: ERROR ${error.message}`);
        failed += 1;
      }
    }
  } finally {
    await pool.end();
  }
  console.log(`Listo: ${ok} correctos, ${failed} con error.`);
  if (failed) process.exitCode = 1;
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
