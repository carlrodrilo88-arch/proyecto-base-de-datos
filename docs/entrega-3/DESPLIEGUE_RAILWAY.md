# Preparacion de despliegue en Railway

## Recursos

Crear en el mismo proyecto de Railway:

1. Un servicio PostgreSQL.
2. Un servicio web conectado al repositorio Git.
3. Un Storage Bucket privado para los PDF.

## Servicio web

Configurar `web` como Root Directory. Railway ejecutara `npm install` y
`npm start` a partir de `web/package.json`. El endpoint de salud es
`/api/health`.

## Variables privadas

```text
NODE_ENV=production
DATABASE_URL=<referencia privada al PostgreSQL de Railway>
SESSION_SECRET=<valor aleatorio de 32 caracteres o mas>
AUTHORIZED_DEVICE_ID=MEDI-GEN-001
STORAGE_DRIVER=s3
STORAGE_BUCKET=<BUCKET del Railway Bucket>
STORAGE_ENDPOINT=<ENDPOINT del Railway Bucket>
STORAGE_REGION=<REGION del Railway Bucket>
STORAGE_ACCESS_KEY_ID=<ACCESS_KEY_ID del Railway Bucket>
STORAGE_SECRET_ACCESS_KEY=<SECRET_ACCESS_KEY del Railway Bucket>
```

Usar referencias de variables de Railway; no copiar valores reales al
repositorio.

## Base de datos remota

En una base vacia ejecutar el orden completo de `INSTALL.md`. En una copia de
la base actual ejecutar las migraciones 001, 002 y 003 y despues reaplicar los
scripts de seguridad.

## Validacion previa al tag

- `/api/health` responde 200.
- Login de los tres roles.
- CRUD principal persiste al reiniciar el servicio.
- El borrador abre una vista previa.
- La publicacion crea el objeto en el Bucket.
- `Ver PDF` recupera el objeto privado mediante el backend.
- Ninguna variable privada aparece en Git o en respuestas HTTP.
