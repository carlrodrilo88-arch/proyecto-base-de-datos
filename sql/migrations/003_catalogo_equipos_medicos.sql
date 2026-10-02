-- Se ejecuta despues de las migraciones 001 y 002.
BEGIN;

CREATE TABLE IF NOT EXISTS equipos_medicos (
    id_equipo_medico BIGSERIAL PRIMARY KEY,
    id_institucion BIGINT NOT NULL,
    nombre VARCHAR(180) NOT NULL,
    numero_bien VARCHAR(100),
    marca VARCHAR(100),
    modelo VARCHAR(100),
    numero_serie VARCHAR(100),
    activo BOOLEAN NOT NULL DEFAULT TRUE,
    creado_en TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_equipos_medicos_instituciones
        FOREIGN KEY (id_institucion) REFERENCES instituciones(id_institucion)
        ON UPDATE CASCADE ON DELETE RESTRICT,
    CONSTRAINT uq_equipo_bien_institucion UNIQUE (id_institucion, numero_bien)
);

ALTER TABLE reportes ADD COLUMN IF NOT EXISTS id_equipo_medico BIGINT;

-- Convierte datos historicos ya capturados en registros del catalogo.
INSERT INTO equipos_medicos (
    id_institucion, nombre, numero_bien, marca, modelo, numero_serie
)
SELECT DISTINCT
    ss.id_institucion,
    COALESCE(NULLIF(r.descripcion_equipo, ''), 'Equipo historico'),
    NULLIF(r.numero_bien, ''), NULLIF(r.marca, ''), NULLIF(r.modelo, ''),
    NULLIF(r.numero_serie, '')
FROM reportes r
JOIN servicios_solicitantes ss ON ss.id_servicio_solicitante=r.id_servicio_solicitante
WHERE r.descripcion_equipo IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM equipos_medicos em
      WHERE em.id_institucion=ss.id_institucion
        AND (
          (em.numero_bien IS NOT NULL AND em.numero_bien=r.numero_bien)
          OR (em.numero_bien IS NULL AND em.nombre=r.descripcion_equipo
              AND em.marca IS NOT DISTINCT FROM r.marca
              AND em.modelo IS NOT DISTINCT FROM r.modelo)
        )
  );

UPDATE reportes r
SET id_equipo_medico=em.id_equipo_medico
FROM servicios_solicitantes ss, equipos_medicos em
WHERE ss.id_servicio_solicitante=r.id_servicio_solicitante
  AND em.id_institucion=ss.id_institucion
  AND r.id_equipo_medico IS NULL
  AND (
    (r.numero_bien IS NOT NULL AND em.numero_bien=r.numero_bien)
    OR (r.numero_bien IS NULL AND em.nombre=r.descripcion_equipo
        AND em.marca IS NOT DISTINCT FROM r.marca
        AND em.modelo IS NOT DISTINCT FROM r.modelo)
  );

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='fk_reportes_equipo_medico') THEN
        ALTER TABLE reportes ADD CONSTRAINT fk_reportes_equipo_medico
            FOREIGN KEY (id_equipo_medico) REFERENCES equipos_medicos(id_equipo_medico)
            ON UPDATE CASCADE ON DELETE RESTRICT;
    END IF;
END
$$;

COMMIT;
