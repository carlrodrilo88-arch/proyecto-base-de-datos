CREATE OR REPLACE FUNCTION generar_codigo_reporte()
RETURNS TEXT AS $$
DECLARE
    siguiente BIGINT;
BEGIN
    SELECT COALESCE(MAX(id_reporte), 0) + 1 INTO siguiente FROM reportes;
    RETURN 'REP-' || TO_CHAR(CURRENT_DATE, 'YYYY') || '-' || LPAD(siguiente::TEXT, 6, '0');
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION set_actualizado_en()
RETURNS TRIGGER AS $$
BEGIN
    NEW.actualizado_en = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;
