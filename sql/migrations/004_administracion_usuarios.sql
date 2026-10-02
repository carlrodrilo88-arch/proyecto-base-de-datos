-- Habilita la administracion segura de usuarios desde la aplicacion web.
-- Los usuarios existentes deben cambiar su contrasena conocida al iniciar sesion.

BEGIN;

ALTER TABLE usuarios
    ADD COLUMN IF NOT EXISTS debe_cambiar_password BOOLEAN NOT NULL DEFAULT TRUE;

DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'meditec_web') THEN
        GRANT INSERT, UPDATE ON usuarios TO meditec_web;
        GRANT USAGE, SELECT ON SEQUENCE usuarios_id_usuario_seq TO meditec_web;
    END IF;
END
$$;

COMMIT;
