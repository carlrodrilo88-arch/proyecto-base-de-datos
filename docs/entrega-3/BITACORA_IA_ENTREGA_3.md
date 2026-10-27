# Bitacora de Agentes IA - Entrega 3

## Registro 1: datos de prueba y consultas principales

| Campo | Detalle |
| --- | --- |
| Fecha | 29/09/2026 |
| Herramienta | ChatGPT / Codex |
| Objetivo | Completar el primer punto de la Entrega 3: datos de prueba y consultas SQL principales. |
| Solicitud | Analizar como desarrollar el seed y las consultas, explicar previamente el alcance y realizar los cambios solamente despues de recibir autorizacion. |
| Alcance autorizado | Modificar el seed, crear el archivo de consultas y documentar el apartado. No modificar DDL, triggers, seguridad ni aplicacion web. |
| Resultado | Se amplio el seed con usuarios por rol, reportes en diferentes estados, relaciones con tecnicos y proveedores, un PDF simulado y eventos iniciales de auditoria. Tambien se crearon quince consultas demostrativas y su documentacion. |
| Responsable | Carlos Geovanni Lopez Rodriguez / 2690-23-2511 |

## Archivos modificados

### `sql/dml/001_seed.sql`

- Se cambio su alcance de datos minimos de Entrega 2 a datos de prueba para
  Entrega 3.
- Se agregaron usuarios de prueba para los roles administrador, generador y
  consulta.
- Se conservaron las credenciales compatibles con el mecanismo de autenticacion
  actual de la aplicacion.
- Se agregaron tres reportes con estados publicado, borrador y anulado.
- Se agregaron relaciones entre reportes, tecnicos y proveedores.
- Se agrego un archivo PDF simulado para el reporte publicado.
- Se agregaron eventos iniciales de auditoria para disponer de datos antes de
  implementar los triggers automaticos.
- Se reemplazaron inserciones que generaban duplicados por inserciones
  condicionadas o `ON CONFLICT`.
- Se evitaron identificadores numericos fijos. Las relaciones se resuelven por
  valores estables como correo, NIT, identificador de equipo y codigo de
  reporte.

### `sql/queries/001_consultas_entrega3.sql`

Se creo un archivo con quince consultas para demostrar:

- Busqueda por codigo unico.
- Filtros por servicio solicitante, institucion, tecnico y proveedor.
- Filtros por rango de fechas y estado.
- Reportes con PDF activo y sin PDF activo.
- Uso de la vista `vw_reportes_resumen`.
- Consulta de eventos de auditoria.
- Conteos por estado e institucion.
- Detalle de tecnicos y proveedores relacionados con cada reporte.

### Documentacion de Entrega 3

- Se creo `docs/entrega-3/DATOS_Y_CONSULTAS_ENTREGA3.md` con los datos
  incluidos, credenciales, codigos de reporte, orden de ejecucion y resultados
  esperados.
- Se actualizo `docs/entrega-3/BASES_REQUERIMIENTOS_ENTREGA3.md` para registrar
  el archivo de consultas y retirar como pendientes el seed y las consultas.

## Decisiones tecnicas

1. Todos los datos agregados son ficticios y de uso academico.
2. El reporte `REP-2026-000001` se crea como borrador, recibe el PDF y despues
   cambia a publicado. Esto prepara el seed para la futura regla que impedira
   publicar sin PDF.
3. El reporte `REP-2026-000002` permanece sin PDF para demostrar consultas y
   pruebas negativas.
4. El seed busca ser reejecutable sin duplicar los registros que el mismo
   define.
5. No se cambio el mecanismo de hash de contrasenas porque esa mejora pertenece
   al trabajo posterior de seguridad y aplicacion web.

## Validaciones realizadas

- Se compararon las tablas y columnas utilizadas con
  `sql/ddl/001_schema.sql`.
- Se verifico que las consultas correspondan a los requisitos documentados de
  Entrega 3.
- Se ejecuto `git diff --check` sin encontrar errores de formato en el diff.
- Se confirmo que los cambios se limitaran a seed, consultas y documentacion de
  Entrega 3.

## Validacion pendiente

No se ejecuto el conjunto de scripts en PostgreSQL porque no hay una instancia
confirmada en el entorno de trabajo. Antes de considerar cerrado este apartado
se debe ejecutar, como minimo:

```text
sql/ddl/001_schema.sql
sql/dml/001_seed.sql
sql/views/001_reportes_resumen.sql
sql/queries/001_consultas_entrega3.sql
```

Se debe repetir el seed y confirmar que no duplique sus datos. Los resultados
deben incorporarse posteriormente a los casos de prueba de Entrega 3.

## Estado

Implementacion preparada y validada estaticamente. Pendiente de validacion
integral en PostgreSQL y de aprobacion del grupo.

---

## Registro 2: revision del DDL e integridad de Entrega 3

| Campo | Detalle |
| --- | --- |
| Fecha | 29/09/2026 |
| Herramienta | ChatGPT / Codex |
| Objetivo | Revisar el riesgo destructivo del DDL, eliminar redundancias y completar la integridad, automatizacion, seguridad y pruebas SQL de la Entrega 3. |
| Solicitud | Actuar como analista de bases de datos PostgreSQL; separar el reinicio destructivo de la instalacion normal, eliminar indices redundantes, permitir historial de PDF con una sola version activa, corregir la generacion concurrente de codigos, completar procedimientos, triggers y permisos, definir el orden de instalacion y preparar pruebas reproducibles. Explicar el alcance antes de modificar y trabajar solo despues de recibir autorizacion. |
| Alcance autorizado | Modificar DDL, seed, procedimientos, triggers, vistas, seguridad, consultas, instalacion y documentacion de pruebas; crear scripts separados de reinicio y validacion. No modificar la aplicacion web ni crear commits. |
| Resultado | El DDL dejo de eliminar datos; se creo un reset separado; se retiraron indices duplicados; se agrego historial de PDF con una sola version activa; la generacion de codigo usa secuencia; se implementaron procedimientos de publicacion y reemplazo, triggers de validacion y auditoria, roles reejecutables, orden de instalacion y pruebas SQL. |
| Responsable | Carlos Geovanni Lopez Rodriguez / 2690-23-2511 |

## Archivos modificados en el Registro 2

- `INSTALL.md`: separa instalacion, reinicio, actualizaciones y validacion.
- `sql/ddl/001_schema.sql`: deja de borrar datos, usa transaccion, crea la
  secuencia de codigos y garantiza un solo PDF activo por reporte.
- `sql/dml/001_seed.sql`: adapta la insercion del PDF al historial de versiones.
- `sql/procedures/001_reportes.sql`: genera codigos con secuencia, registra
  auditoria, publica reportes y reemplaza PDFs.
- `sql/triggers/001_reportes.sql`: valida la publicacion y audita reportes y PDFs.
- `sql/views/001_reportes_resumen.sql`: muestra solamente el PDF activo.
- `sql/security/001_roles_permisos.sql`: crea roles de forma reejecutable y
  limita permisos y ejecucion de rutinas.
- `sql/queries/001_consultas_entrega3.sql`: agrega consulta del historial PDF.
- `docs/casos-prueba/casos-prueba-iniciales.md`: incorpora casos SQL detallados.
- `docs/entrega-3/BASES_REQUERIMIENTOS_ENTREGA3.md`: actualiza estado y pendientes.
- `docs/entrega-3/DATOS_Y_CONSULTAS_ENTREGA3.md`: actualiza orden y alcance.

## Archivos creados en el Registro 2

- `sql/reset/001_reset_schema.sql`: reinicio destructivo y explicito para pruebas.
- `sql/tests/001_validacion_entrega3.sql`: validaciones, pruebas negativas y
  planes `EXPLAIN` dentro de una transaccion reversible.

## Decisiones tecnicas del Registro 2

1. La instalacion normal no debe destruir objetos existentes; si la base ya
   contiene el esquema, se deben usar migraciones versionadas.
2. El historial de PDFs se conserva y un indice unico parcial permite solamente
   una version activa por reporte.
3. Los dos indices cubiertos por restricciones `UNIQUE` fueron retirados.
4. El indice de estado se conserva hasta medirlo con datos representativos.
5. Los roles de PostgreSQL y los roles funcionales de la aplicacion son capas
   diferentes y se documentan como tales.
6. Las pruebas no sustituyen la ejecucion y captura de evidencias en PostgreSQL.

## Validacion realizada en el Registro 2

- Revision estatica de dependencias entre DDL, funciones, triggers, seed, vista,
  permisos y consultas.
- Comprobacion del orden de instalacion documentado.
- Preparacion de pruebas para codigos, publicacion sin PDF, historial, permisos e
  indices.

## Validacion pendiente del Registro 2

- Ejecutar todos los scripts en PostgreSQL con detencion ante el primer error.
- Ejecutar dos veces el seed y comparar conteos.
- Guardar la salida del archivo de validacion como evidencia.
- Confirmar con `EXPLAIN ANALYZE` la utilidad de los indices al disponer de un
  volumen representativo.

## Estado del Registro 2

Implementacion terminada y revisada estaticamente. Pendiente de validacion real
en PostgreSQL antes de cerrar la Entrega 3.
