# Instalacion y Ejecucion

## Requisitos

- PostgreSQL 14 o superior.
- Cliente `psql` o una herramienta como pgAdmin/DBeaver.
- Base de datos creada para el proyecto, por ejemplo `meditec_reportes`.

## Instalacion inicial

El archivo `sql/ddl/001_schema.sql` esta destinado a una base vacia y no elimina
tablas ni datos existentes. Si los objetos ya existen, la instalacion se detiene
para evitar ocultar diferencias de estructura.

## Orden completo de scripts SQL

Ejecutar los archivos en este orden:

```text
sql/ddl/001_schema.sql
sql/procedures/001_reportes.sql
sql/triggers/001_reportes.sql
sql/dml/001_seed.sql
sql/views/001_reportes_resumen.sql
sql/security/001_roles_permisos.sql
sql/security/002_usuario_web.sql
sql/queries/001_consultas_entrega3.sql
```

## Ejemplo con psql

```bash
psql -U postgres -d meditec_reportes -f sql/ddl/001_schema.sql
psql -U postgres -d meditec_reportes -f sql/procedures/001_reportes.sql
psql -U postgres -d meditec_reportes -f sql/triggers/001_reportes.sql
psql -U postgres -d meditec_reportes -f sql/dml/001_seed.sql
psql -U postgres -d meditec_reportes -f sql/views/001_reportes_resumen.sql
psql -U postgres -d meditec_reportes -f sql/security/001_roles_permisos.sql
psql -U postgres -d meditec_reportes -f sql/security/002_usuario_web.sql
psql -U postgres -d meditec_reportes -f sql/queries/001_consultas_entrega3.sql
```

El script de seguridad requiere una cuenta con privilegio `CREATEROLE`.

Antes de ejecutar `sql/security/002_usuario_web.sql`, un administrador debe
crear el rol de conexion sin guardar su contrasena en el repositorio:

```sql
CREATE ROLE meditec_web
WITH LOGIN PASSWORD 'definir-fuera-del-repositorio'
NOCREATEDB NOCREATEROLE NOINHERIT;
```

El segundo script de seguridad retira privilegios anteriores y concede solo los
necesarios para login, lectura y los catalogos publicados actualmente. La
aplicacion debe usar las credenciales de `meditec_web` en `DATABASE_URL`.

## Reinicio del ambiente de pruebas

`sql/reset/001_reset_schema.sql` elimina permanentemente todas las tablas y los
datos de Meditec. No forma parte de la instalacion normal. Para reconstruir una
base de pruebas se ejecuta primero ese archivo y despues el orden completo
anterior.

```bash
psql -U postgres -d meditec_reportes -f sql/reset/001_reset_schema.sql
```

## Actualizaciones posteriores

No se debe volver a ejecutar el DDL sobre una base con informacion. Los cambios
futuros de estructura deben agregarse como migraciones versionadas para
preservar los datos existentes.

Para actualizar una base creada antes de la relacion obligatoria entre servicio
e institucion, ejecutar como propietario de la base:

```bash
psql -U meditec_test -d meditec_reportes_pruebas -f sql/migrations/001_servicios_institucion_proveedor_identidad.sql
psql -U meditec_test -d meditec_reportes_pruebas -f sql/migrations/002_flujo_reportes_proveedor_pdf.sql
psql -U meditec_test -d meditec_reportes_pruebas -f sql/migrations/003_catalogo_equipos_medicos.sql
psql -U meditec_test -d meditec_reportes_pruebas -f sql/security/001_roles_permisos.sql
psql -U meditec_test -d meditec_reportes_pruebas -f sql/security/002_usuario_web.sql
```

La migracion conserva los registros, relaciona cada servicio con la institucion
de sus reportes y agrega `logo_url` y `pie_pagina` a proveedores. Los scripts de
seguridad se repiten porque la vista resumen es reconstruida durante el cambio.

La segunda migracion agrega el proveedor principal de plantilla y los campos
tecnicos observados en los reportes actuales. Tambien reconstruye la vista, por
lo que los scripts de seguridad deben ejecutarse despues de ambas migraciones.

La tercera migracion separa los equipos medicos de las computadoras autorizadas.
El reporte selecciona un activo medico de la institucion y conserva una copia
historica de nombre, bien, marca, modelo y serie. `AUTHORIZED_DEVICE_ID`
identifica la computadora autorizada que genera el PDF y se configura en el
entorno, no en el formulario.

## Almacenamiento de reportes

En desarrollo, `STORAGE_DRIVER=local` guarda los PDF generados dentro de
`web/storage/`, carpeta excluida de Git. En Railway debe configurarse un Bucket
privado compatible con S3 y definir:

```text
STORAGE_DRIVER=s3
STORAGE_BUCKET=nombre-del-bucket
STORAGE_ENDPOINT=endpoint-s3-del-bucket
STORAGE_REGION=region-del-bucket
STORAGE_ACCESS_KEY_ID=credencial-privada
STORAGE_SECRET_ACCESS_KEY=credencial-privada
```

Estas variables se configuran en Railway y nunca se escriben con valores reales
en archivos versionados.

## Validacion de Entrega 3

Despues de instalar todos los componentes se puede ejecutar
`sql/tests/001_validacion_entrega3.sql`. Sus comprobaciones funcionales trabajan
dentro de una transaccion que termina con `ROLLBACK`; las llamadas a secuencias
de PostgreSQL no se revierten, por lo que pueden quedar saltos numericos sin que
eso represente duplicados ni perdida de integridad.

## Nota

Si el proyecto se presenta como prototipo academico, la aplicacion web puede usar
datos de prueba y una ruta local para simular el almacenamiento de PDFs. La
estructura de base de datos ya deja preparado el campo `archivos_pdf.url_archivo`
para reemplazar esa ruta por almacenamiento en nube.
