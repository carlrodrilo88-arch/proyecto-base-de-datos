-- Archivo: sql/migrations/009_empresas_tecnico.sql
-- Autor: Carlos Geovanni Lopez Rodriguez
-- Descripcion: Enlaza los tecnicos con las empresas (proveedores) para las que trabajan.
--   proveedor_tecnico: N:M; un usuario solo ve y asigna los tecnicos de sus empresas,
--   y un reporte solo admite tecnicos de la empresa que lo emite.
--   Los tecnicos que ya participaron en reportes quedan enlazados a la empresa de esos reportes.
-- Dependencias: sql/migrations/008_empresas_usuario_institucion.sql
-- Se puede ejecutar varias veces; tambien sobre una base instalada con el DDL actual.

BEGIN;

CREATE TABLE IF NOT EXISTS proveedor_tecnico (
    id_proveedor BIGINT NOT NULL,
    id_tecnico BIGINT NOT NULL,
    PRIMARY KEY (id_proveedor, id_tecnico),
    CONSTRAINT fk_proveedor_tecnico_proveedores
        FOREIGN KEY (id_proveedor) REFERENCES proveedores(id_proveedor)
        ON UPDATE CASCADE ON DELETE RESTRICT,
    CONSTRAINT fk_proveedor_tecnico_tecnicos
        FOREIGN KEY (id_tecnico) REFERENCES tecnicos(id_tecnico)
        ON UPDATE CASCADE ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_proveedor_tecnico_tecnico ON proveedor_tecnico(id_tecnico);

INSERT INTO proveedor_tecnico (id_proveedor, id_tecnico)
SELECT DISTINCT r.id_proveedor_plantilla, rt.id_tecnico
FROM reporte_tecnico rt
JOIN reportes r ON r.id_reporte = rt.id_reporte
WHERE r.id_proveedor_plantilla IS NOT NULL
ON CONFLICT DO NOTHING;

COMMIT;
