-- Archivo: sql/procedures/001_reportes.sql
-- Autor: Carlos Geovanni Lopez Rodriguez
-- Descripcion: Funciones y procedimientos de negocio para reportes y archivos PDF.
-- Dependencias: sql/ddl/001_schema.sql


-- Las bases creadas con el esquema inicial pueden no tener la secuencia. Si ya
-- existen reportes, se avanza hasta el mayor sufijo numerico para evitar codigos
-- duplicados. La reejecucion nunca disminuye una secuencia existente.
CREATE SEQUENCE IF NOT EXISTS secuencia_codigo_reporte
    AS BIGINT START WITH 1 INCREMENT BY 1;

DO $$
DECLARE
    maximo_existente BIGINT;
    valor_secuencia BIGINT;
    secuencia_usada BOOLEAN;
BEGIN
    SELECT COALESCE(MAX((SUBSTRING(codigo_reporte FROM '([0-9]+)$'))::BIGINT), 0)
    INTO maximo_existente
    FROM reportes
    WHERE codigo_reporte ~ '[0-9]+$';

    SELECT last_value, is_called
    INTO valor_secuencia, secuencia_usada
    FROM secuencia_codigo_reporte;

    IF maximo_existente > valor_secuencia
       OR (maximo_existente = valor_secuencia AND maximo_existente > 0 AND NOT secuencia_usada) THEN
        PERFORM setval('secuencia_codigo_reporte', maximo_existente, TRUE);
    END IF;
END
$$;

CREATE OR REPLACE FUNCTION generar_codigo_reporte()
RETURNS TEXT AS $$
DECLARE
    candidato TEXT;
BEGIN
    LOOP
        candidato := 'REP-' || TO_CHAR(CURRENT_DATE, 'YYYY') || '-' ||
            LPAD(nextval('secuencia_codigo_reporte')::TEXT, 6, '0');
        EXIT WHEN NOT EXISTS (
            SELECT 1 FROM reportes WHERE codigo_reporte = candidato
        );
    END LOOP;
    RETURN candidato;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION set_actualizado_en()
RETURNS TRIGGER AS $$
BEGIN
    NEW.actualizado_en = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION registrar_evento_auditoria(
    p_id_usuario BIGINT,
    p_entidad VARCHAR,
    p_entidad_id BIGINT,
    p_accion VARCHAR,
    p_detalle TEXT DEFAULT NULL,
    p_ip_origen VARCHAR DEFAULT NULL
)
RETURNS BIGINT AS $$
DECLARE
    nuevo_id BIGINT;
BEGIN
    INSERT INTO auditoria_eventos (
        id_usuario, entidad, entidad_id, accion, detalle, ip_origen
    ) VALUES (
        p_id_usuario, p_entidad, p_entidad_id, p_accion, p_detalle, p_ip_origen
    )
    RETURNING id_evento INTO nuevo_id;
    RETURN nuevo_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp;

CREATE OR REPLACE PROCEDURE publicar_reporte(
    p_id_reporte BIGINT,
    p_id_usuario BIGINT DEFAULT NULL
)
LANGUAGE plpgsql
AS $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM reportes WHERE id_reporte = p_id_reporte) THEN
        RAISE EXCEPTION 'El reporte % no existe', p_id_reporte;
    END IF;
    IF NOT EXISTS (
        SELECT 1 FROM archivos_pdf
        WHERE id_reporte = p_id_reporte AND estado = 'activo'
    ) THEN
        RAISE EXCEPTION 'No se puede publicar el reporte % sin un PDF activo', p_id_reporte;
    END IF;
    PERFORM set_config('meditec.id_usuario', COALESCE(p_id_usuario::TEXT, ''), TRUE);
    UPDATE reportes SET estado = 'publicado' WHERE id_reporte = p_id_reporte;
END;
$$;

CREATE OR REPLACE PROCEDURE reemplazar_pdf_reporte(
    p_id_reporte BIGINT,
    p_url_archivo TEXT,
    p_hash_archivo VARCHAR DEFAULT NULL,
    p_tamano_bytes BIGINT DEFAULT NULL,
    p_id_usuario BIGINT DEFAULT NULL
)
LANGUAGE plpgsql
AS $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM reportes WHERE id_reporte = p_id_reporte) THEN
        RAISE EXCEPTION 'El reporte % no existe', p_id_reporte;
    END IF;
    IF NULLIF(BTRIM(p_url_archivo), '') IS NULL THEN
        RAISE EXCEPTION 'La URL del archivo es obligatoria';
    END IF;
    IF p_tamano_bytes IS NOT NULL AND p_tamano_bytes <= 0 THEN
        RAISE EXCEPTION 'El tamano del archivo debe ser mayor que cero';
    END IF;

    PERFORM set_config('meditec.id_usuario', COALESCE(p_id_usuario::TEXT, ''), TRUE);
    UPDATE archivos_pdf
    SET estado = 'reemplazado'
    WHERE id_reporte = p_id_reporte AND estado = 'activo';
    INSERT INTO archivos_pdf (
        id_reporte, url_archivo, hash_archivo, tamano_bytes, estado
    ) VALUES (
        p_id_reporte, p_url_archivo, p_hash_archivo, p_tamano_bytes, 'activo'
    );
END;
$$;
