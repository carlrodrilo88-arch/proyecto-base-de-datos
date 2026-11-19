-- Archivo: sql/migrations/011_carta_coordinacion.sql
-- Autor: Carlos Geovanni Lopez Rodriguez
-- Descripcion: Datos para generar la carta de coordinacion de un mantenimiento.
--   tecnicos.dpi: DPI de 13 digitos que se imprime en el listado de personal.
--   instituciones.linea_carta: texto opcional que va debajo del nombre de la institucion.
--   destinatarios: persona a quien se dirige la carta (nombre y cargo), reutilizable por institucion.
--   coordinaciones_trabajo: orden de compra (numero_oc) y NOG (numero_nog) por separado y
--   obligatorios para coordinaciones nuevas o editadas, y destinatario de la carta.
--   coordinacion_tecnico: personal tecnico asignado (maximo 10 por coordinacion).
-- Las coordinaciones anteriores conservan su referencia: el NOG o la OC que tenian pasa a su
-- columna nueva; la otra queda vacia y se pide al editarlas (restriccion NOT VALID).
-- Dependencias: sql/migrations/010_coordinacion_trabajos.sql.
-- Se puede ejecutar varias veces.
-- Despues ejecutar sql/security/001_roles_permisos.sql y sql/security/002_usuario_web.sql.

BEGIN;

ALTER TABLE tecnicos ADD COLUMN IF NOT EXISTS dpi VARCHAR(13);
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'chk_tecnicos_dpi') THEN
        ALTER TABLE tecnicos ADD CONSTRAINT chk_tecnicos_dpi CHECK (dpi IS NULL OR dpi ~ '^[0-9]{13}$');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'uq_tecnicos_dpi') THEN
        ALTER TABLE tecnicos ADD CONSTRAINT uq_tecnicos_dpi UNIQUE (dpi);
    END IF;
END $$;

ALTER TABLE instituciones ADD COLUMN IF NOT EXISTS linea_carta VARCHAR(200);

CREATE TABLE IF NOT EXISTS destinatarios (
    id_destinatario BIGSERIAL PRIMARY KEY,
    id_institucion BIGINT NOT NULL,
    nombre VARCHAR(160) NOT NULL,
    cargo VARCHAR(160) NOT NULL,
    activo BOOLEAN NOT NULL DEFAULT TRUE,
    creado_en TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_destinatarios_nombre CHECK (BTRIM(nombre) <> ''),
    CONSTRAINT chk_destinatarios_cargo CHECK (BTRIM(cargo) <> ''),
    CONSTRAINT fk_destinatarios_instituciones
        FOREIGN KEY (id_institucion) REFERENCES instituciones(id_institucion)
        ON UPDATE CASCADE ON DELETE RESTRICT
);
CREATE UNIQUE INDEX IF NOT EXISTS uq_destinatarios_institucion_nombre
    ON destinatarios (id_institucion, LOWER(BTRIM(nombre)));

-- La descripcion de la carta (equipos, marcas, numero de visita) excede los 180 caracteres anteriores.
DROP VIEW IF EXISTS vw_coordinaciones_trabajo;
ALTER TABLE coordinaciones_trabajo ALTER COLUMN nombre_mantenimiento TYPE VARCHAR(600);

ALTER TABLE coordinaciones_trabajo ADD COLUMN IF NOT EXISTS numero_oc VARCHAR(80);
ALTER TABLE coordinaciones_trabajo ADD COLUMN IF NOT EXISTS numero_nog VARCHAR(80);
ALTER TABLE coordinaciones_trabajo ADD COLUMN IF NOT EXISTS id_destinatario BIGINT;

-- Traslada la referencia unica anterior a su columna y elimina el esquema NOG-u-OC.
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns
               WHERE table_name = 'coordinaciones_trabajo' AND column_name = 'tipo_referencia') THEN
        -- Los triggers de calculo y auditoria no deben dispararse por este traslado.
        ALTER TABLE coordinaciones_trabajo DISABLE TRIGGER USER;
        UPDATE coordinaciones_trabajo SET numero_oc = numero_referencia
            WHERE tipo_referencia = 'OC' AND numero_oc IS NULL;
        UPDATE coordinaciones_trabajo SET numero_nog = numero_referencia
            WHERE tipo_referencia = 'NOG' AND numero_nog IS NULL;
        ALTER TABLE coordinaciones_trabajo ENABLE TRIGGER USER;
        ALTER TABLE coordinaciones_trabajo DROP COLUMN tipo_referencia, DROP COLUMN numero_referencia;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'chk_coordinacion_oc_nog') THEN
        -- NOT VALID: obliga en filas nuevas o editadas sin rechazar las anteriores incompletas;
        -- una coordinacion anterior incompleta aun se puede finalizar.
        ALTER TABLE coordinaciones_trabajo ADD CONSTRAINT chk_coordinacion_oc_nog
            CHECK (estado = 'finalizado'
                OR (numero_oc IS NOT NULL AND BTRIM(numero_oc) <> ''
                    AND numero_nog IS NOT NULL AND BTRIM(numero_nog) <> '')) NOT VALID;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_coordinacion_destinatarios') THEN
        ALTER TABLE coordinaciones_trabajo ADD CONSTRAINT fk_coordinacion_destinatarios
            FOREIGN KEY (id_destinatario) REFERENCES destinatarios(id_destinatario)
            ON UPDATE CASCADE ON DELETE RESTRICT;
    END IF;
END $$;

CREATE TABLE IF NOT EXISTS coordinacion_tecnico (
    id_coordinacion BIGINT NOT NULL,
    id_tecnico BIGINT NOT NULL,
    CONSTRAINT pk_coordinacion_tecnico PRIMARY KEY (id_coordinacion, id_tecnico),
    CONSTRAINT fk_coordinacion_tecnico_coordinacion
        FOREIGN KEY (id_coordinacion) REFERENCES coordinaciones_trabajo(id_coordinacion)
        ON UPDATE CASCADE ON DELETE CASCADE,
    CONSTRAINT fk_coordinacion_tecnico_tecnico
        FOREIGN KEY (id_tecnico) REFERENCES tecnicos(id_tecnico)
        ON UPDATE CASCADE ON DELETE RESTRICT
);
CREATE INDEX IF NOT EXISTS idx_coordinacion_tecnico_tecnico ON coordinacion_tecnico(id_tecnico);

-- La carta admite como maximo 10 tecnicos.
CREATE OR REPLACE FUNCTION validar_maximo_tecnicos_coordinacion()
RETURNS TRIGGER AS $$
BEGIN
    IF (SELECT COUNT(*) FROM coordinacion_tecnico WHERE id_coordinacion = NEW.id_coordinacion) >= 10 THEN
        RAISE EXCEPTION 'Una coordinacion admite como maximo 10 tecnicos';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_coordinacion_tecnico_maximo ON coordinacion_tecnico;
CREATE TRIGGER trg_coordinacion_tecnico_maximo
BEFORE INSERT ON coordinacion_tecnico
FOR EACH ROW EXECUTE FUNCTION validar_maximo_tecnicos_coordinacion();

-- La vista se reconstruye con las referencias nuevas y el destinatario.
DROP VIEW IF EXISTS vw_coordinaciones_trabajo;
CREATE VIEW vw_coordinaciones_trabajo AS
SELECT c.id_coordinacion, c.id_proveedor, p.nombre AS empresa, c.id_institucion, i.nombre AS institucion,
    c.nombre_mantenimiento, c.numero_oc, c.numero_nog, c.id_destinatario,
    d.nombre AS destinatario, d.cargo AS destinatario_cargo,
    c.fecha_coordinacion, c.fecha_inicio, c.dias_habiles, c.fecha_fin,
    c.estado, c.fecha_finalizacion, c.id_usuario_creador, u.nombre AS creador,
    c.creado_en, c.actualizado_en,
    CASE
        WHEN c.estado = 'finalizado' THEN 'finalizada'
        WHEN hoy.fecha > c.fecha_fin THEN 'vencida'
        WHEN hoy.fecha < c.fecha_inicio THEN 'por_iniciar'
        ELSE 'en_curso'
    END AS situacion,
    CASE WHEN c.estado = 'activo'
        THEN dias_habiles_entre(GREATEST(hoy.fecha, c.fecha_inicio), c.fecha_fin)
    END AS dias_restantes,
    CASE WHEN c.estado = 'activo' AND hoy.fecha > c.fecha_fin
        THEN dias_habiles_entre(c.fecha_fin + 1, hoy.fecha)
    END AS dias_vencidos,
    CASE WHEN c.estado = 'finalizado' THEN c.fecha_finalizacion <= c.fecha_fin END AS finalizada_a_tiempo
FROM coordinaciones_trabajo c
JOIN proveedores p ON p.id_proveedor = c.id_proveedor
JOIN instituciones i ON i.id_institucion = c.id_institucion
JOIN usuarios u ON u.id_usuario = c.id_usuario_creador
LEFT JOIN destinatarios d ON d.id_destinatario = c.id_destinatario
CROSS JOIN (SELECT fecha_actual_guatemala() AS fecha) hoy;

COMMIT;
