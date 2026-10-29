# Manual tecnico

## Arquitectura

La solución utiliza una arquitectura web de tres capas:

1. **Interfaz:** HTML, CSS y JavaScript sin framework en `web/public/`.
2. **Aplicación:** Node.js y Express en `web/src/server.js`.
3. **Persistencia:** PostgreSQL con scripts versionados en `sql/`.

PDFKit genera los documentos; el almacenamiento puede ser local o compatible
con S3. Las consultas usan parámetros y el servidor aplica autenticación,
autorización por rol, validación de entradas y mensajes de error controlados.

## Requisitos

- Windows, Linux o macOS.
- Node.js 20 o superior y npm.
- PostgreSQL 14 o superior. El ambiente final local validado usa PostgreSQL 15.2.
- `psql`, pgAdmin o una herramienta equivalente.
- Una base vacía para instalación inicial, por ejemplo `meditec_reportes`.

## Configuracion

Desde `web/`, copie `.env.example` como `.env` y configure:

```env
PORT=3000
DATABASE_URL=postgres://meditec_web:CLAVE@localhost:5432/meditec_reportes
SESSION_SECRET=secreto-aleatorio-de-al-menos-32-caracteres
NODE_ENV=development
STORAGE_DRIVER=local
```

`.env` contiene secretos, está excluido de Git y nunca debe enviarse al
repositorio. `DATABASE_ADMIN_URL` se utiliza solo durante migraciones que
requieren al propietario y debe retirarse al terminar.

## Instalacion desde cero

1. Cree la base con una cuenta administrativa.
2. Cree el rol técnico sin privilegios administrativos:

```sql
CREATE ROLE meditec_web
WITH LOGIN PASSWORD 'definir-fuera-del-repositorio'
NOCREATEDB NOCREATEROLE NOINHERIT;
```

3. Ejecute en orden:

```text
sql/ddl/001_schema.sql
sql/procedures/001_reportes.sql
sql/triggers/001_reportes.sql
sql/dml/001_seed.sql
sql/dml/002_empresas_reportes.sql
sql/dml/003_carga_excel_equipos.sql
sql/views/001_reportes_resumen.sql
sql/security/001_roles_permisos.sql
sql/security/002_usuario_web.sql
```

4. Instale e inicie la web:

```powershell
cd web
npm install
npm run test:db
npm test
npm start
```

5. Abra `http://localhost:3000` y `/api/health`.

`sql/reset/001_reset_schema.sql` es destructivo y solo debe utilizarse en una
base de pruebas que se desee reconstruir completamente.

## Actualizacion de una base existente

Detenga la aplicación, haga una copia de seguridad y ejecute las migraciones
`001` a `006` en orden. Después vuelva a ejecutar procedimientos, triggers,
vista y scripts de seguridad. Nunca ejecute el DDL inicial sobre una base con
datos.

La migración 006 convierte `equipos_autorizados` en constancias inactivas. El
script de procedimientos crea de forma segura la secuencia de códigos si una
base antigua no la contiene y la avanza según los reportes existentes.

Si la base ya estaba instalada antes del 27/10/2026, vuelva a ejecutar
`sql/security/001_roles_permisos.sql` y `sql/security/002_usuario_web.sql` con
la cuenta propietaria **antes** de desplegar el código nuevo. Agregan a
`meditec_web`: `UPDATE` y `DELETE` sobre `equipos_autorizados`, `SELECT`,
`INSERT` y `DELETE` sobre `reporte_tecnico`, y `SELECT` sobre
`auditoria_eventos`. Sin ellos la consulta de reportes responde 503 con el
mensaje de permisos. `npm run test:db` lista los permisos faltantes.

## Operaciones CRUD por tabla principal

| Tabla | Crear | Consultar | Actualizar | Eliminar |
| --- | --- | --- | --- | --- |
| instituciones, servicios_solicitantes, equipos_medicos, tecnicos, proveedores | `POST` | `GET` | `PUT /:id` | `DELETE /:id`: desactivación lógica (`activo=FALSE`) |
| usuarios | `POST` | `GET` | `PUT /:id` y restablecer contraseña | `DELETE /:id`: desactivación lógica |
| reportes | `POST` (uno o lote) | `GET` y `GET /:id` | `PUT /:id` solo en `borrador`; publicar | `DELETE /:id`: anulación (`estado='anulado'`), solo administrador |
| archivos_pdf | Al publicar (`reemplazar_pdf_reporte`) | `GET /api/reportes/:id/archivo` | El procedimiento marca la versión anterior como `reemplazado` | No se borra: es evidencia del reporte |
| equipos_autorizados | `POST` | `GET` | `PUT /:id` (sigue inactivo) | `DELETE /:id`: eliminación física |
| roles | Script SQL | `GET /api/roles` | Catálogo fijo | Catálogo fijo |
| reporte_tecnico (N:M) | Al crear el reporte | Columna Técnicos de la vista y `GET /:id` | Se reemplaza al editar un borrador | Se reemplaza al editar un borrador |
| proveedor_tecnico (N:M) | Al crear el técnico (al menos una empresa) | Columna Empresas de `GET /api/tecnicos` | Se reemplaza al editar el técnico | Se reemplaza al editar el técnico |
| auditoria_eventos | Triggers | `GET /api/auditoria` (administrador, últimos 500) | No aplica | No aplica |

Cada técnico pertenece a una o más empresas (`proveedor_tecnico`, migración
009). Un usuario que no es administrador solo ve los técnicos de sus empresas, y
el formulario de reportes ofrece únicamente los técnicos de la empresa elegida.
El servidor lo vuelve a comprobar al guardar: un reporte solo admite técnicos
activos de la empresa que lo emite.

Los catálogos y los reportes no se borran físicamente para conservar la
integridad referencial y la trazabilidad (las FK usan `ON DELETE RESTRICT`).
La edición y la anulación de reportes se ejecutan en una transacción que fija
`meditec.id_usuario`, de modo que el trigger `trg_reportes_auditoria` registra
qué usuario hizo el cambio. Un reporte publicado no se edita porque su PDF
definitivo ya está almacenado; se anula y se crea uno nuevo.

## Consulta de reportes

`GET /api/reportes` acepta filtros opcionales y combinables: `codigo`, `estado`,
`id_institucion`, `id_servicio_solicitante`, `id_tecnico`, `fecha_desde` y
`fecha_hasta` (AAAA-MM-DD). Todos se envían como parámetros de la consulta
SQL; un valor vacío desactiva su filtro.

## Seguridad

- Contraseñas de usuarios almacenadas con bcrypt.
- Sesiones firmadas con expiración y cookie HttpOnly, SameSite Strict y Secure
  en producción.
- Límite de intentos de inicio de sesión.
- Helmet para cabeceras HTTP.
- Middleware `requireAuth` y `requireRole`.
- Consultas parametrizadas contra inyección SQL.
- Usuario `meditec_web` sin `SUPERUSER`, `CREATEDB` ni `CREATEROLE`.
- Permisos explícitos sobre tablas, secuencias, funciones y procedimientos.
- Archivos del almacenamiento y credenciales excluidos de Git.

## Generacion y almacenamiento de PDF

`web/src/pdf-report.js` resuelve la plantilla mediante
`proveedores.codigo_plantilla`. Teknor, Meditec y GT Medical utilizan logotipos
y composiciones fijas tomadas de las imágenes de referencia. Los valores de
institución, servicio, equipo, marca, modelo, serie y bien se centran dentro de
su área; las etiquetas conservan su alineación original.

Cada PDF ocupa una sola hoja y contiene especificaciones técnicas,
recomendaciones y espacios de firmas. No incluye observaciones. El texto se
ajusta hasta un mínimo legible; si no cabe se devuelve un error 400.

Con `STORAGE_DRIVER=local`, los archivos se guardan en `web/storage/`. En
producción se usa `STORAGE_DRIVER=s3` junto con bucket, endpoint, región y
credenciales configuradas exclusivamente en el entorno.

## Pruebas

```powershell
cd web
npm test
npm run test:db
```

Validación del 27/10/2026:

- 29 pruebas Node aprobadas y 0 fallidas.
- Esquema y permisos de `meditec_web` aprobados.
- `/api/health` respondió correctamente.
- Tres plantillas PDF renderizadas visualmente en una sola hoja.
- Base local `meditec_reportes` sobre PostgreSQL 15.2.

## Operacion y solucion de problemas

| Problema | Diagnóstico y corrección |
| --- | --- |
| `password authentication failed` | Sincronice la contraseña del rol con `DATABASE_URL`. |
| `database does not exist` | Corrija el nombre de base en `DATABASE_URL`. |
| `EADDRINUSE` | Ya existe un proceso en el puerto; deténgalo o cambie `PORT`. |
| Falta una columna o relación | Aplique migraciones pendientes en orden y repita seguridad. |
| Falta `generar_codigo_reporte()` | Ejecute `sql/procedures/001_reportes.sql`. |
| PDF no publicado | Revise almacenamiento; un reporte no se publica sin PDF activo. |
| Texto no cabe | Resuma especificaciones o recomendaciones. |

Para detener el servidor iniciado en primer plano, pulse `Ctrl + C`.
