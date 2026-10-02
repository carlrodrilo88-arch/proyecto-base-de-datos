# Matriz de trazabilidad - Entrega 3

| Req. | Implementacion BD | Implementacion web | Prueba o evidencia | Estado E3 |
| --- | --- | --- | --- | --- |
| RF-01 | `servicios_solicitantes` e institucion FK | `/api/servicios-solicitantes` | CP-MIG-01 a 03 | Cumple |
| RF-02 | `proveedores`, logo y pie | `/api/proveedores` | CP-MIG-04 | Cumple |
| RF-03 | `tecnicos` | `/api/tecnicos` | CRUD web | Cumple |
| RF-04 | `instituciones` | `/api/instituciones` | CRUD web | Cumple |
| RF-05 | `usuarios` y seed bcrypt | Login; administracion queda para E4 | CP-LOGIN y CP-COOKIE | Parcial 70% |
| RF-06 | `roles` y seguridad SQL | Middleware `requireRole` | CP-DB-01 a 08 | Cumple |
| RF-07 | `equipos_autorizados` y `equipos_medicos` | Catalogo de equipos medicos; autorizados por entorno | CP-EQM-01 a 05 | Parcial 70% |
| RF-08 | `reportes`, relaciones N:M y equipo medico | Formulario de borrador | CP-PDF-02 | Parcial 70% |
| RF-09 | Secuencia y `generar_codigo_reporte()` | Codigo devuelto al crear | Prueba SQL de unicidad | Cumple |
| RF-10 | `archivos_pdf` y procedimiento de reemplazo | Vista previa, generacion y almacenamiento | CP-PDF-03 a 05 | Cumple |
| RF-11 | Indice unico y vista resumen | Filtro por codigo | CP-REP-06 | Cumple |
| RF-12 | Consultas SQL por todos los criterios | Web filtra codigo y estado; resto queda para E4 | Q01-Q16 | Parcial 70% |
| RF-13 | `auditoria_eventos` y triggers | Eventos generados desde operaciones | Pruebas de auditoria | Cumple |
| RF-14 | Roles, equipo autorizado y procedimientos | Rol + `AUTHORIZED_DEVICE_ID` | CP-REP-02 y CP-DB | Cumple |

## Requerimientos de datos

RD-01 a RD-10 se implementan mediante servicios, proveedores, tecnicos,
instituciones, usuarios, roles, equipos autorizados, reportes, archivos PDF y
auditoria. `equipos_medicos` refina el modelo sin sustituir el control de las dos
computadoras autorizadas.
