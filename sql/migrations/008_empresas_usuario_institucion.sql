-- Archivo: sql/migrations/008_empresas_usuario_institucion.sql
-- Autor: Carlos Geovanni Lopez Rodriguez
-- Descripcion: Enlaza usuarios y instituciones con las empresas (proveedores).
--   usuario_proveedor: empresas a las que pertenece cada usuario (1 a N).
--   proveedor_institucion: hospitales que atiende cada empresa (N:M); un mismo
--   hospital puede ser cliente de varias empresas y comparte sus equipos.
--   Ademas impide registrar dos veces la misma institucion con distinta
--   capitalizacion o espacios.
-- Dependencias: sql/migrations/007_usuario_acceso.sql
-- Se puede ejecutar varias veces; tambien sobre una base instalada con el DDL actual.

BEGIN;

CREATE TABLE IF NOT EXISTS usuario_proveedor (
    id_usuario BIGINT NOT NULL,
    id_proveedor BIGINT NOT NULL,
    PRIMARY KEY (id_usuario, id_proveedor),
    CONSTRAINT fk_usuario_proveedor_usuarios
        FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario)
        ON UPDATE CASCADE ON DELETE CASCADE,
    CONSTRAINT fk_usuario_proveedor_proveedores
        FOREIGN KEY (id_proveedor) REFERENCES proveedores(id_proveedor)
        ON UPDATE CASCADE ON DELETE RESTRICT
);

CREATE TABLE IF NOT EXISTS proveedor_institucion (
    id_proveedor BIGINT NOT NULL,
    id_institucion BIGINT NOT NULL,
    creado_en TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id_proveedor, id_institucion),
    CONSTRAINT fk_proveedor_institucion_proveedores
        FOREIGN KEY (id_proveedor) REFERENCES proveedores(id_proveedor)
        ON UPDATE CASCADE ON DELETE RESTRICT,
    CONSTRAINT fk_proveedor_institucion_instituciones
        FOREIGN KEY (id_institucion) REFERENCES instituciones(id_institucion)
        ON UPDATE CASCADE ON DELETE RESTRICT
);

CREATE INDEX IF NOT EXISTS idx_proveedor_institucion_institucion
    ON proveedor_institucion(id_institucion);

-- Las instituciones que ya tienen reportes quedan enlazadas a la empresa de esos reportes.
INSERT INTO proveedor_institucion (id_proveedor, id_institucion)
SELECT DISTINCT r.id_proveedor_plantilla, ss.id_institucion
FROM reportes r
JOIN servicios_solicitantes ss ON ss.id_servicio_solicitante = r.id_servicio_solicitante
WHERE r.id_proveedor_plantilla IS NOT NULL
ON CONFLICT DO NOTHING;

-- Antes de crear el indice unico se informan los nombres repetidos para unificarlos a mano.
DO $$
DECLARE
    repetidas TEXT;
BEGIN
    SELECT STRING_AGG(nombre, '; ') INTO repetidas
    FROM (
        SELECT MIN(nombre) AS nombre
        FROM instituciones
        GROUP BY LOWER(BTRIM(nombre))
        HAVING COUNT(*) > 1
    ) duplicadas;
    IF repetidas IS NOT NULL THEN
        RAISE EXCEPTION 'Instituciones repetidas, unifiquelas antes de migrar: %', repetidas;
    END IF;
END
$$;

CREATE UNIQUE INDEX IF NOT EXISTS uq_instituciones_nombre_normalizado
    ON instituciones (LOWER(BTRIM(nombre)));

-- Una correccion de contenido se audita como tal y no como un cambio de estado.
CREATE OR REPLACE FUNCTION auditar_cambio_reporte()
RETURNS TRIGGER AS $$
DECLARE
    usuario_contexto BIGINT;
BEGIN
    usuario_contexto := NULLIF(current_setting('meditec.id_usuario', TRUE), '')::BIGINT;
    usuario_contexto := COALESCE(usuario_contexto, NEW.id_usuario_creador);
    PERFORM registrar_evento_auditoria(
        usuario_contexto, 'reportes', NEW.id_reporte,
        CASE WHEN TG_OP = 'INSERT' THEN 'CREAR' ELSE 'ACTUALIZAR' END,
        CASE
            WHEN TG_OP = 'INSERT' THEN 'Reporte creado con estado ' || NEW.estado
            WHEN OLD.estado = NEW.estado THEN 'Contenido corregido; estado ' || NEW.estado
            ELSE 'Estado anterior: ' || OLD.estado || '; estado nuevo: ' || NEW.estado
        END
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp;

COMMIT;
