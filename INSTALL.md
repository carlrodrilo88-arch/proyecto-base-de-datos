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
psql -U postgres -d meditec_reportes -f sql/queries/001_consultas_entrega3.sql
```

El script de seguridad requiere una cuenta con privilegio `CREATEROLE`.

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
