# Instalacion y Ejecucion

## Requisitos

- PostgreSQL 14 o superior.
- Cliente `psql` o una herramienta como pgAdmin/DBeaver.
- Base de datos creada para el proyecto, por ejemplo `meditec_reportes`.

## Orden recomendado de scripts SQL

Ejecutar los archivos en este orden:

```text
sql/ddl/001_schema.sql
sql/dml/001_seed.sql
sql/procedures/001_reportes.sql
sql/triggers/001_reportes.sql
sql/views/001_reportes_resumen.sql
sql/security/001_roles_permisos.sql
```

## Ejemplo con psql

```bash
psql -U postgres -d meditec_reportes -f sql/ddl/001_schema.sql
psql -U postgres -d meditec_reportes -f sql/dml/001_seed.sql
psql -U postgres -d meditec_reportes -f sql/procedures/001_reportes.sql
psql -U postgres -d meditec_reportes -f sql/triggers/001_reportes.sql
psql -U postgres -d meditec_reportes -f sql/views/001_reportes_resumen.sql
psql -U postgres -d meditec_reportes -f sql/security/001_roles_permisos.sql
```

## Nota

Si el proyecto se presenta como prototipo academico, la aplicacion web puede usar
datos de prueba y una ruta local para simular el almacenamiento de PDFs. La
estructura de base de datos ya deja preparado el campo `pdf_url` para reemplazar
esa ruta por almacenamiento en nube.
