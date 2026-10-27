-- Archivo: sql/migrations/007_usuario_acceso.sql
-- Autor: Carlos Geovanni Lopez Rodriguez
-- Descripcion: Agrega el nombre de usuario para iniciar sesion y vuelve
--   opcional el correo. Los usuarios existentes reciben como nombre de
--   usuario la parte de su correo anterior a la arroba.
-- Dependencias: sql/migrations/004_administracion_usuarios.sql
-- Se puede ejecutar varias veces; tambien sobre una base instalada con el DDL actual.

BEGIN;

ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS usuario VARCHAR(60);

-- Si dos correos comparten la parte local, el segundo recibe su id como sufijo.
UPDATE usuarios u
SET usuario = origen.usuario
FROM (
    SELECT id_usuario,
        CASE WHEN ROW_NUMBER() OVER (PARTITION BY base ORDER BY id_usuario) = 1
             THEN base ELSE base || id_usuario END AS usuario
    FROM (
        SELECT id_usuario,
            LEFT(REGEXP_REPLACE(LOWER(SPLIT_PART(correo, '@', 1)), '[^a-z0-9._-]', '', 'g'), 50) AS base
        FROM usuarios
        WHERE usuario IS NULL
    ) candidatos
) origen
WHERE origen.id_usuario = u.id_usuario;

ALTER TABLE usuarios
    ALTER COLUMN usuario SET NOT NULL,
    ALTER COLUMN correo DROP NOT NULL;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'uq_usuarios_usuario') THEN
        ALTER TABLE usuarios ADD CONSTRAINT uq_usuarios_usuario UNIQUE (usuario);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'ck_usuarios_usuario_formato') THEN
        ALTER TABLE usuarios ADD CONSTRAINT ck_usuarios_usuario_formato
            CHECK (usuario ~ '^[a-z0-9._-]{3,60}$');
    END IF;
END
$$;

COMMIT;
