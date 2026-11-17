-- Archivo: sql/migrations/010_coordinacion_trabajos.sql
-- Autor: Carlos Geovanni Lopez Rodriguez
-- Descripcion: Coordinacion de trabajos de mantenimiento con plazo en dias habiles.
--   feriados: dias no laborables que, junto con sabados y domingos, no cuentan como habiles.
--   coordinaciones_trabajo: mantenimiento coordinado con una empresa e institucion, referencia
--   NOG u orden de compra (OC), fecha de inicio y dias habiles disponibles. El ultimo dia de
--   trabajo (fecha_fin) lo calcula un trigger; el dia de inicio cuenta como el primer dia.
--   vw_coordinaciones_trabajo: agrega los dias habiles restantes segun la fecha de Guatemala.
-- Dependencias: sql/migrations/009_empresas_tecnico.sql y registrar_evento_auditoria().
-- Se puede ejecutar varias veces; tambien sobre una base instalada con el DDL actual.
-- Despues ejecutar sql/security/001_roles_permisos.sql y sql/security/002_usuario_web.sql.

BEGIN;

CREATE TABLE IF NOT EXISTS feriados (
    id_feriado BIGSERIAL PRIMARY KEY,
    fecha DATE NOT NULL,
    nombre VARCHAR(120) NOT NULL,
    creado_en TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_feriados_fecha UNIQUE (fecha),
    CONSTRAINT chk_feriados_nombre CHECK (BTRIM(nombre) <> '')
);

CREATE TABLE IF NOT EXISTS coordinaciones_trabajo (
    id_coordinacion BIGSERIAL PRIMARY KEY,
    id_proveedor BIGINT NOT NULL,
    id_institucion BIGINT NOT NULL,
    nombre_mantenimiento VARCHAR(180) NOT NULL,
    tipo_referencia VARCHAR(3) NOT NULL,
    numero_referencia VARCHAR(80) NOT NULL,
    fecha_coordinacion DATE NOT NULL,
    fecha_inicio DATE NOT NULL,
    dias_habiles INTEGER NOT NULL,
    fecha_fin DATE NOT NULL,
    estado VARCHAR(20) NOT NULL DEFAULT 'activo',
    fecha_finalizacion DATE,
    id_usuario_creador BIGINT NOT NULL,
    creado_en TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    actualizado_en TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_coordinacion_nombre CHECK (BTRIM(nombre_mantenimiento) <> ''),
    CONSTRAINT chk_coordinacion_tipo_referencia CHECK (tipo_referencia IN ('NOG', 'OC')),
    CONSTRAINT chk_coordinacion_numero_referencia CHECK (BTRIM(numero_referencia) <> ''),
    CONSTRAINT chk_coordinacion_dias CHECK (dias_habiles BETWEEN 1 AND 365),
    CONSTRAINT chk_coordinacion_inicio CHECK (fecha_inicio >= fecha_coordinacion),
    CONSTRAINT chk_coordinacion_fin CHECK (fecha_fin >= fecha_inicio),
    CONSTRAINT chk_coordinacion_estado CHECK (estado IN ('activo', 'finalizado')),
    CONSTRAINT chk_coordinacion_finalizacion
        CHECK ((estado = 'finalizado') = (fecha_finalizacion IS NOT NULL)),
    CONSTRAINT fk_coordinacion_proveedores
        FOREIGN KEY (id_proveedor) REFERENCES proveedores(id_proveedor)
        ON UPDATE CASCADE ON DELETE RESTRICT,
    CONSTRAINT fk_coordinacion_instituciones
        FOREIGN KEY (id_institucion) REFERENCES instituciones(id_institucion)
        ON UPDATE CASCADE ON DELETE RESTRICT,
    CONSTRAINT fk_coordinacion_usuarios
        FOREIGN KEY (id_usuario_creador) REFERENCES usuarios(id_usuario)
        ON UPDATE CASCADE ON DELETE RESTRICT
);

CREATE INDEX IF NOT EXISTS idx_coordinaciones_estado_fin ON coordinaciones_trabajo(estado, fecha_fin);
CREATE INDEX IF NOT EXISTS idx_coordinaciones_proveedor ON coordinaciones_trabajo(id_proveedor);

-- Fecha del dia en Guatemala; el servidor de la base puede estar en UTC.
CREATE OR REPLACE FUNCTION fecha_actual_guatemala()
RETURNS DATE AS $$
    SELECT (CURRENT_TIMESTAMP AT TIME ZONE 'America/Guatemala')::DATE;
$$ LANGUAGE sql STABLE;

-- Dia habil: de lunes a viernes y no registrado como feriado.
CREATE OR REPLACE FUNCTION es_dia_habil(p_fecha DATE)
RETURNS BOOLEAN AS $$
    SELECT EXTRACT(ISODOW FROM p_fecha) < 6
       AND NOT EXISTS (SELECT 1 FROM feriados f WHERE f.fecha = p_fecha);
$$ LANGUAGE sql STABLE;

-- Ultimo dia de trabajo: el inicio es el dia 1 y se avanza solo por dias habiles.
CREATE OR REPLACE FUNCTION sumar_dias_habiles(p_inicio DATE, p_dias INTEGER)
RETURNS DATE AS $$
DECLARE
    v_fecha DATE := p_inicio;
    v_contados INTEGER := 1;
BEGIN
    IF p_inicio IS NULL OR p_dias IS NULL OR p_dias < 1 THEN
        RAISE EXCEPTION 'Se requiere una fecha de inicio y al menos un dia habil';
    END IF;
    IF NOT es_dia_habil(p_inicio) THEN
        RAISE EXCEPTION 'La fecha de inicio % no es un dia habil', TO_CHAR(p_inicio, 'DD/MM/YYYY');
    END IF;
    WHILE v_contados < p_dias LOOP
        v_fecha := v_fecha + 1;
        IF es_dia_habil(v_fecha) THEN
            v_contados := v_contados + 1;
        END IF;
    END LOOP;
    RETURN v_fecha;
END;
$$ LANGUAGE plpgsql STABLE;

-- Dias habiles entre dos fechas, ambas incluidas; 0 si el rango esta vacio.
CREATE OR REPLACE FUNCTION dias_habiles_entre(p_desde DATE, p_hasta DATE)
RETURNS INTEGER AS $$
    SELECT COUNT(*)::INTEGER
    FROM generate_series(p_desde, p_hasta, INTERVAL '1 day') AS d(dia)
    WHERE es_dia_habil(d.dia::DATE);
$$ LANGUAGE sql STABLE;

-- Calcula el ultimo dia al crear, recoordinar o ampliar; una coordinacion finalizada no cambia.
CREATE OR REPLACE FUNCTION calcular_fin_coordinacion()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'UPDATE' AND OLD.estado = 'finalizado' THEN
        RAISE EXCEPTION 'La coordinacion % ya fue finalizada y no se puede modificar', OLD.id_coordinacion;
    END IF;
    IF TG_OP = 'INSERT'
       OR NEW.fecha_inicio IS DISTINCT FROM OLD.fecha_inicio
       OR NEW.dias_habiles IS DISTINCT FROM OLD.dias_habiles THEN
        NEW.fecha_fin := sumar_dias_habiles(NEW.fecha_inicio, NEW.dias_habiles);
    END IF;
    IF TG_OP = 'UPDATE' THEN
        NEW.actualizado_en := CURRENT_TIMESTAMP;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION auditar_coordinacion_trabajo()
RETURNS TRIGGER AS $$
DECLARE
    usuario_contexto BIGINT;
    v_accion VARCHAR(80);
    v_detalle TEXT;
BEGIN
    usuario_contexto := NULLIF(current_setting('meditec.id_usuario', TRUE), '')::BIGINT;
    usuario_contexto := COALESCE(usuario_contexto, NEW.id_usuario_creador);
    IF TG_OP = 'INSERT' THEN
        v_accion := 'CREAR';
        v_detalle := NEW.nombre_mantenimiento || ': inicio ' || TO_CHAR(NEW.fecha_inicio, 'DD/MM/YYYY')
            || ', ' || NEW.dias_habiles || ' dias habiles, ultimo dia ' || TO_CHAR(NEW.fecha_fin, 'DD/MM/YYYY');
    ELSIF OLD.estado = 'activo' AND NEW.estado = 'finalizado' THEN
        v_accion := 'FINALIZAR';
        v_detalle := NEW.nombre_mantenimiento || ': finalizada el ' || TO_CHAR(NEW.fecha_finalizacion, 'DD/MM/YYYY')
            || '; ultimo dia previsto ' || TO_CHAR(NEW.fecha_fin, 'DD/MM/YYYY');
    ELSE
        v_accion := CASE
            WHEN NEW.fecha_inicio IS DISTINCT FROM OLD.fecha_inicio THEN 'RECOORDINAR'
            WHEN NEW.dias_habiles > OLD.dias_habiles THEN 'AMPLIAR'
            ELSE 'ACTUALIZAR'
        END;
        v_detalle := NEW.nombre_mantenimiento
            || ': inicio ' || TO_CHAR(OLD.fecha_inicio, 'DD/MM/YYYY') || ' -> ' || TO_CHAR(NEW.fecha_inicio, 'DD/MM/YYYY')
            || '; dias ' || OLD.dias_habiles || ' -> ' || NEW.dias_habiles
            || '; ultimo dia ' || TO_CHAR(OLD.fecha_fin, 'DD/MM/YYYY') || ' -> ' || TO_CHAR(NEW.fecha_fin, 'DD/MM/YYYY');
    END IF;
    PERFORM registrar_evento_auditoria(
        usuario_contexto, 'coordinaciones_trabajo', NEW.id_coordinacion, v_accion, v_detalle
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp;

DROP TRIGGER IF EXISTS trg_coordinaciones_calcular_fin ON coordinaciones_trabajo;
CREATE TRIGGER trg_coordinaciones_calcular_fin
BEFORE INSERT OR UPDATE ON coordinaciones_trabajo
FOR EACH ROW EXECUTE FUNCTION calcular_fin_coordinacion();

DROP TRIGGER IF EXISTS trg_coordinaciones_auditoria ON coordinaciones_trabajo;
CREATE TRIGGER trg_coordinaciones_auditoria
AFTER INSERT OR UPDATE ON coordinaciones_trabajo
FOR EACH ROW EXECUTE FUNCTION auditar_coordinacion_trabajo();

-- situacion: por_iniciar, en_curso, vencida (paso el ultimo dia sin finalizar) o finalizada.
CREATE OR REPLACE VIEW vw_coordinaciones_trabajo AS
SELECT c.id_coordinacion, c.id_proveedor, p.nombre AS empresa, c.id_institucion, i.nombre AS institucion,
    c.nombre_mantenimiento, c.tipo_referencia, c.numero_referencia,
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
CROSS JOIN (SELECT fecha_actual_guatemala() AS fecha) hoy;

-- Feriados nacionales de Guatemala 2026 y 2027 (Codigo de Trabajo, art. 127).
-- El administrador los corrige o agrega desde la web (por ejemplo, asuetos locales).
INSERT INTO feriados (fecha, nombre) VALUES
('2026-01-01', 'Primero de enero'),
('2026-04-02', 'Jueves Santo'),
('2026-04-03', 'Viernes Santo'),
('2026-04-04', 'Sabado Santo'),
('2026-05-01', 'Dia del Trabajo'),
('2026-06-30', 'Dia del Ejercito'),
('2026-09-15', 'Dia de la Independencia'),
('2026-10-20', 'Dia de la Revolucion'),
('2026-11-01', 'Dia de Todos los Santos'),
('2026-12-24', 'Nochebuena (medio dia)'),
('2026-12-25', 'Navidad'),
('2026-12-31', '31 de diciembre (medio dia)'),
('2027-01-01', 'Primero de enero'),
('2027-03-25', 'Jueves Santo'),
('2027-03-26', 'Viernes Santo'),
('2027-03-27', 'Sabado Santo'),
('2027-05-01', 'Dia del Trabajo'),
('2027-06-30', 'Dia del Ejercito'),
('2027-09-15', 'Dia de la Independencia'),
('2027-10-20', 'Dia de la Revolucion'),
('2027-11-01', 'Dia de Todos los Santos'),
('2027-12-24', 'Nochebuena (medio dia)'),
('2027-12-25', 'Navidad'),
('2027-12-31', '31 de diciembre (medio dia)')
ON CONFLICT (fecha) DO NOTHING;

COMMIT;
