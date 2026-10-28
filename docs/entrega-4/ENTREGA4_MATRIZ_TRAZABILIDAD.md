# Matriz de trazabilidad final

## Requerimientos funcionales

| Req. | Implementación BD | Implementación web | Evidencia | Estado final |
| --- | --- | --- | --- | --- |
| RF-01 Registrar servicios | `servicios_solicitantes` con FK a institución | CRUD `/api/servicios-solicitantes` | Pruebas de BD y catálogo web | Cumple |
| RF-02 Registrar proveedores | `proveedores` y código de plantilla | CRUD `/api/proveedores` | Selector Teknor, Meditec y GT Medical | Cumple |
| RF-03 Registrar técnicos | `tecnicos` | CRUD `/api/tecnicos` | Catálogo web | Cumple |
| RF-04 Registrar instituciones | `instituciones` | CRUD `/api/instituciones` | Catálogo e importación depurada | Cumple |
| RF-05 Registrar usuarios | `usuarios` con hash bcrypt | Administración `/api/usuarios` | Login y cambio obligatorio | Cumple |
| RF-06 Asignar roles y permisos | `roles` y roles PostgreSQL | Selector de rol y middleware | Pruebas de privilegios | Cumple |
| RF-07 Registrar equipos autorizados | `equipos_autorizados` | Constancias inactivas de solo registro | Migración 006 | Cumple con alcance revisado |
| RF-08 Crear reportes relacionados | `reportes`, servicio, institución inferida y equipo | Formulario por pasos y lote por equipo | Revisión previa y API | Parcial: asignación de técnicos no expuesta |
| RF-09 Código único | Secuencia y `generar_codigo_reporte()` | Código devuelto al crear | Pruebas de secuencia | Cumple |
| RF-10 Asociar PDF | `archivos_pdf` e historial activo | Generación y publicación automática | Pruebas PDF y almacenamiento | Cumple |
| RF-11 Consultar por ID | Código único y vista resumen | Búsqueda por código y apertura del PDF | Tabla de reportes | Cumple |
| RF-12 Filtros | Consultas por institución, servicio, técnico, fecha y estado | Código y estado en interfaz | Consultas Q01-Q16 | Parcial |
| RF-13 Auditoría | `auditoria_eventos` y triggers | Generación automática desde operaciones | Pruebas SQL | Cumple en backend |
| RF-14 Restringir generación | Roles, procedimientos y permisos mínimos | `requireAuth` y `requireRole` | Pruebas de autorización | Parcial frente al requisito original de dispositivo; el alcance final usa constancia inactiva |

## Requerimientos no funcionales

| Req. | Evidencia | Estado |
| --- | --- | --- |
| RNF-01 PostgreSQL | Base `meditec_reportes` validada en PostgreSQL 15.2 | Cumple |
| RNF-02 Control por roles | Roles funcionales, middleware y privilegios SQL | Cumple |
| RNF-03 Integridad referencial | PK, FK, UNIQUE, CHECK y acciones referenciales | Cumple |
| RNF-04 Identificadores únicos | Secuencia y restricción única | Cumple |
| RNF-05 Consultas indexadas | Índices y vista resumen | Cumple |
| RNF-06 Acceso desde web | Express y PostgreSQL integrados; publicado en https://meditec-web-production.up.railway.app | Cumple |
| RNF-07 Sin credenciales | `.env` y almacenamiento excluidos de Git | Cumple |
| RNF-08 Crecimiento futuro | Migraciones, historial PDF y almacenamiento S3 | Cumple |

## Requisitos minimos del proyecto

| Requisito | Evidencia | Estado |
| --- | --- | --- |
| Al menos 8 entidades principales | 13 tablas en el DDL | Cumple |
| Dos relaciones N:M | `reporte_tecnico`, `reporte_proveedor` | Cumple |
| Normalización hasta 3FN | `ENTREGA2_NORMALIZACION_3FN.md` | Cumple |
| Al menos 15 restricciones | DDL con PK, FK, UNIQUE, CHECK y NOT NULL | Cumple |
| Dos triggers y dos funciones/procedimientos | Triggers de reporte/PDF y rutinas de código/publicación/reemplazo | Cumple |
| Tres roles diferenciados | Administrador, generador y consulta | Cumple |
| 50 registros por tabla principal | Servicios y equipos superan 50; otras tablas no | Pendiente |

## Resumen

La trazabilidad confirma el núcleo funcional y técnico. Permanecen pendientes
los filtros web completos, asignación visual de técnicos, control original por
dispositivo y volumen mínimo en todas las tablas principales. Estos
puntos se declaran para evitar certificar como terminado algo que no fue probado.
