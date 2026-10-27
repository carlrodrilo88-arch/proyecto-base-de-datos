-- Archivo: sql/dml/004_usuario_administrador.sql
-- Autor: Carlos Geovanni Lopez Rodriguez
-- Descripcion: Crea los roles base y la cuenta administradora principal
--   (usuario carlos) para una instalacion sin datos de prueba.
-- Dependencias: DDL actual o migracion 007.
-- La contrasena es temporal: el sistema obliga a cambiarla en el primer ingreso.
-- Solo se guarda su hash; no ejecutar 001_seed.sql en produccion.

BEGIN;

INSERT INTO roles (nombre, descripcion) VALUES
('administrador', 'Control total del sistema'),
('generador_reportes', 'Puede crear, generar y cargar reportes PDF'),
('consulta', 'Puede buscar y visualizar reportes autorizados')
ON CONFLICT (nombre) DO NOTHING;

INSERT INTO usuarios (id_rol, nombre, usuario, correo, password_hash, debe_cambiar_password)
SELECT r.id_rol, 'Carlos Geovanni Lopez Rodriguez', 'carlos', NULL,
    '$2b$12$sU7F/8TAQXmk.EY6QoMUOu0XmsYjwRXtL.D8Cq/T5F4TRN12RYdem', TRUE
FROM roles r
WHERE r.nombre = 'administrador'
ON CONFLICT (usuario) DO NOTHING;

COMMIT;
