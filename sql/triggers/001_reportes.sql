-- Automatizaciones y reglas de integridad de reportes y archivos PDF.

CREATE OR REPLACE FUNCTION validar_publicacion_reporte()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.estado = 'publicado'
       AND (TG_OP = 'INSERT' OR OLD.estado IS DISTINCT FROM NEW.estado)
       AND NOT EXISTS (
           SELECT 1 FROM archivos_pdf
           WHERE id_reporte = NEW.id_reporte AND estado = 'activo'
       ) THEN
        RAISE EXCEPTION 'No se puede publicar el reporte % sin un PDF activo',
            NEW.codigo_reporte;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp;

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
        CASE WHEN TG_OP = 'INSERT'
            THEN 'Reporte creado con estado ' || NEW.estado
            ELSE 'Estado anterior: ' || OLD.estado || '; estado nuevo: ' || NEW.estado
        END
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp;

CREATE OR REPLACE FUNCTION auditar_cambio_pdf()
RETURNS TRIGGER AS $$
DECLARE
    usuario_contexto BIGINT;
BEGIN
    usuario_contexto := NULLIF(current_setting('meditec.id_usuario', TRUE), '')::BIGINT;
    PERFORM registrar_evento_auditoria(
        usuario_contexto, 'archivos_pdf', NEW.id_archivo_pdf,
        CASE
            WHEN TG_OP = 'INSERT' THEN 'CARGAR_PDF'
            WHEN OLD.estado = 'activo' AND NEW.estado = 'reemplazado'
                THEN 'REEMPLAZAR_PDF'
            ELSE 'ACTUALIZAR_PDF'
        END,
        'PDF del reporte ' || NEW.id_reporte || ' con estado ' || NEW.estado
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp;

CREATE TRIGGER trg_reportes_validar_publicacion
BEFORE INSERT OR UPDATE OF estado ON reportes
FOR EACH ROW EXECUTE FUNCTION validar_publicacion_reporte();

CREATE TRIGGER trg_reportes_actualizado_en
BEFORE UPDATE ON reportes
FOR EACH ROW EXECUTE FUNCTION set_actualizado_en();

CREATE TRIGGER trg_reportes_auditoria
AFTER INSERT OR UPDATE ON reportes
FOR EACH ROW EXECUTE FUNCTION auditar_cambio_reporte();

CREATE TRIGGER trg_archivos_pdf_auditoria
AFTER INSERT OR UPDATE ON archivos_pdf
FOR EACH ROW EXECUTE FUNCTION auditar_cambio_pdf();
