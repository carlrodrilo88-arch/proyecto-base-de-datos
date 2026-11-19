-- Archivo: sql/migrations/012_numero_pedido_coordinacion.sql
-- Autor: Carlos Geovanni Lopez Rodriguez
-- Descripcion: Numero de pedido de cada coordinacion ("No. de Pedido 683/2026"), que cambia con cada
--   orden de compra y se imprime en la carta de todas las empresas junto a la OC y el NOG.
--   Es obligatorio para coordinaciones nuevas o editadas; las anteriores lo piden al editarlas
--   (restriccion NOT VALID, igual que la OC y el NOG en la migracion 011).
-- Dependencias: sql/migrations/011_carta_coordinacion.sql.
-- Se puede ejecutar varias veces. No modifica ni borra datos existentes.
-- La vista se amplia con CREATE OR REPLACE (columna al final), por lo que conserva sus permisos.

BEGIN;

ALTER TABLE coordinaciones_trabajo ADD COLUMN IF NOT EXISTS numero_pedido VARCHAR(80);

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'chk_coordinacion_pedido') THEN
        ALTER TABLE coordinaciones_trabajo ADD CONSTRAINT chk_coordinacion_pedido
            CHECK (estado = 'finalizado'
                OR (numero_pedido IS NOT NULL AND BTRIM(numero_pedido) <> '')) NOT VALID;
    END IF;
END $$;

CREATE OR REPLACE VIEW vw_coordinaciones_trabajo AS
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
    CASE WHEN c.estado = 'finalizado' THEN c.fecha_finalizacion <= c.fecha_fin END AS finalizada_a_tiempo,
    c.numero_pedido
FROM coordinaciones_trabajo c
JOIN proveedores p ON p.id_proveedor = c.id_proveedor
JOIN instituciones i ON i.id_institucion = c.id_institucion
JOIN usuarios u ON u.id_usuario = c.id_usuario_creador
LEFT JOIN destinatarios d ON d.id_destinatario = c.id_destinatario
CROSS JOIN (SELECT fecha_actual_guatemala() AS fecha) hoy;

COMMIT;
