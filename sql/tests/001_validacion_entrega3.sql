-- Validacion reproducible de los componentes SQL de Entrega 3.
-- Ejecutar despues de la instalacion completa. Los cambios de datos se revierten.

BEGIN;

DO $$
DECLARE
    cantidad INTEGER;
    codigo_1 TEXT;
    codigo_2 TEXT;
    rechazo_publicacion BOOLEAN := FALSE;
BEGIN
    SELECT COUNT(*) INTO cantidad
    FROM pg_indexes
    WHERE schemaname = 'public'
      AND tablename = 'reportes'
      AND indexdef LIKE '%(codigo_reporte)%';
    IF cantidad <> 1 THEN
        RAISE EXCEPTION 'Se esperaba un solo indice para reportes.codigo_reporte; existen %', cantidad;
    END IF;

    SELECT COUNT(*) INTO cantidad
    FROM pg_indexes
    WHERE schemaname = 'public'
      AND indexname = 'uq_archivo_pdf_activo_por_reporte';
    IF cantidad <> 1 THEN
        RAISE EXCEPTION 'No existe el indice unico parcial de PDF activo';
    END IF;

    codigo_1 := generar_codigo_reporte();
    codigo_2 := generar_codigo_reporte();
    IF codigo_1 = codigo_2 THEN
        RAISE EXCEPTION 'La funcion genero codigos repetidos: %', codigo_1;
    END IF;

    BEGIN
        UPDATE reportes
        SET estado = 'publicado'
        WHERE codigo_reporte = 'REP-2026-000002';
    EXCEPTION WHEN OTHERS THEN
        rechazo_publicacion := TRUE;
    END;
    IF NOT rechazo_publicacion THEN
        RAISE EXCEPTION 'Se permitio publicar un reporte sin PDF activo';
    END IF;

    IF has_table_privilege('meditec_consulta', 'reportes', 'UPDATE') THEN
        RAISE EXCEPTION 'meditec_consulta no debe actualizar reportes';
    END IF;
    IF NOT has_table_privilege('meditec_consulta', 'vw_reportes_resumen', 'SELECT') THEN
        RAISE EXCEPTION 'meditec_consulta debe consultar la vista resumen';
    END IF;
END
$$;

DO $$
DECLARE
    reporte_prueba BIGINT;
    usuario_prueba BIGINT;
BEGIN
    SELECT id_reporte INTO reporte_prueba
    FROM reportes WHERE codigo_reporte = 'REP-2026-000001';

    SELECT id_usuario INTO usuario_prueba
    FROM usuarios WHERE correo = 'admin@meditec.local';

    CALL reemplazar_pdf_reporte(
        reporte_prueba,
        '/archivos/reportes/REP-2026-000001-v2.pdf',
        'demo-sha256-rep-2026-000001-v2',
        250000,
        usuario_prueba
    );
END
$$;

DO $$
DECLARE
    total_versiones INTEGER;
    versiones_activas INTEGER;
BEGIN
    SELECT COUNT(*), COUNT(*) FILTER (WHERE ap.estado = 'activo')
    INTO total_versiones, versiones_activas
    FROM archivos_pdf ap
    JOIN reportes r ON r.id_reporte = ap.id_reporte
    WHERE r.codigo_reporte = 'REP-2026-000001';

    IF total_versiones < 2 OR versiones_activas <> 1 THEN
        RAISE EXCEPTION 'Historial PDF invalido: % versiones, % activas',
            total_versiones, versiones_activas;
    END IF;
END
$$;

EXPLAIN SELECT * FROM reportes WHERE codigo_reporte = 'REP-2026-000001';
EXPLAIN SELECT * FROM reportes WHERE estado = 'publicado';
EXPLAIN SELECT * FROM reportes
WHERE estado = 'publicado' AND fecha_reporte BETWEEN DATE '2026-01-01' AND DATE '2026-12-31';

ROLLBACK;
