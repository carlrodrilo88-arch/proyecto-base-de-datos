-- Archivo: sql/dml/001_seed.sql
-- Autor: Carlos Geovanni Lopez Rodriguez
-- Descripcion: Datos de prueba para demostrar los requisitos de Entrega 3.
-- Dependencias: sql/ddl/001_schema.sql
-- Nota: el script puede ejecutarse mas de una vez sin duplicar sus datos.

INSERT INTO roles (nombre, descripcion) VALUES
('administrador', 'Control total del sistema'),
('generador_reportes', 'Puede crear, generar y cargar reportes PDF'),
('consulta', 'Puede buscar y visualizar reportes autorizados')
ON CONFLICT (nombre) DO NOTHING;

INSERT INTO usuarios (id_rol, nombre, correo, password_hash)
SELECT r.id_rol, v.nombre, v.correo, v.password_hash
FROM (
    VALUES
        ('administrador', 'Administrador Meditec', 'admin@meditec.local',
         '240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9'),
        ('generador_reportes', 'Generador Meditec', 'generador@meditec.local',
         '8f25b29935083ee7696b45d84fdbf926e626f5aa32120295b3ad3507ad0ff1e2'),
        ('consulta', 'Consulta Meditec', 'consulta@meditec.local',
         '7fa95c704c2defa7b1295d28bcddfd752bf9b594db18886dd64721183cfc47a5')
) AS v(rol, nombre, correo, password_hash)
JOIN roles r ON r.nombre = v.rol
ON CONFLICT (correo) DO NOTHING;

INSERT INTO equipos_autorizados (nombre, identificador_equipo, descripcion) VALUES
('Equipo generador 1', 'MEDI-GEN-001', 'Computadora autorizada para generar reportes'),
('Equipo generador 2', 'MEDI-GEN-002', 'Computadora autorizada para generar reportes')
ON CONFLICT (identificador_equipo) DO NOTHING;

INSERT INTO servicios_solicitantes (nombre, telefono, correo, direccion)
SELECT v.nombre, v.telefono, v.correo, v.direccion
FROM (
    VALUES
        ('Area de mantenimiento', '2222-1001', 'mantenimiento@hospital.local', 'Ciudad de Guatemala'),
        ('Direccion administrativa', '2222-1002', 'administracion@clinica.local', 'Mixco, Guatemala'),
        ('Coordinacion de biomedica', '2222-1003', 'biomedica@centromedico.local', 'Villa Nueva, Guatemala')
) AS v(nombre, telefono, correo, direccion)
WHERE NOT EXISTS (
    SELECT 1 FROM servicios_solicitantes ss WHERE ss.nombre = v.nombre
);

INSERT INTO instituciones (nombre, direccion, telefono, correo)
SELECT v.nombre, v.direccion, v.telefono, v.correo
FROM (
    VALUES
        ('Hospital Central', 'Zona 1, Ciudad de Guatemala', '2230-0001', 'contacto@hospitalcentral.local'),
        ('Clinica Norte', 'Zona 17, Ciudad de Guatemala', '2230-0002', 'contacto@clinicanorte.local'),
        ('Centro Medico Sur', 'Villa Nueva, Guatemala', '2230-0003', 'contacto@centromedicosur.local')
) AS v(nombre, direccion, telefono, correo)
WHERE NOT EXISTS (
    SELECT 1 FROM instituciones i WHERE i.nombre = v.nombre
);

INSERT INTO tecnicos (nombre, telefono, correo, especialidad)
SELECT v.nombre, v.telefono, v.correo, v.especialidad
FROM (
    VALUES
        ('Carlos Lopez', '5550-1001', 'carlos.lopez@meditec.local', 'Equipo medico'),
        ('Ana Morales', '5550-1002', 'ana.morales@meditec.local', 'Mantenimiento preventivo'),
        ('Luis Perez', '5550-1003', 'luis.perez@meditec.local', 'Calibracion')
) AS v(nombre, telefono, correo, especialidad)
WHERE NOT EXISTS (
    SELECT 1 FROM tecnicos t WHERE t.correo = v.correo
);

INSERT INTO proveedores (nombre, nit, telefono, correo, direccion)
SELECT v.nombre, v.nit, v.telefono, v.correo, v.direccion
FROM (
    VALUES
        ('Proveedor Biomedico A', '1000001-1', '2440-1001', 'ventas@proveedora.local', 'Ciudad de Guatemala'),
        ('Suministros Clinicos B', '1000002-2', '2440-1002', 'ventas@proveedorb.local', 'Mixco, Guatemala')
) AS v(nombre, nit, telefono, correo, direccion)
WHERE NOT EXISTS (
    SELECT 1 FROM proveedores p WHERE p.nit = v.nit
);

-- Reporte que posteriormente se publica despues de asociarle un PDF.
INSERT INTO reportes (
    codigo_reporte, id_servicio_solicitante, id_institucion,
    id_usuario_creador, id_equipo_autorizado, titulo, descripcion,
    fecha_reporte, estado
)
SELECT
    'REP-2026-000001', ss.id_servicio_solicitante, i.id_institucion,
    u.id_usuario, e.id_equipo_autorizado,
    'Mantenimiento preventivo de monitor',
    'Revision preventiva y comprobacion general de equipo medico.',
    DATE '2026-09-01', 'borrador'
FROM servicios_solicitantes ss
JOIN instituciones i ON i.nombre = 'Hospital Central'
JOIN usuarios u ON u.correo = 'generador@meditec.local'
JOIN equipos_autorizados e ON e.identificador_equipo = 'MEDI-GEN-001'
WHERE ss.nombre = 'Area de mantenimiento'
  AND NOT EXISTS (
      SELECT 1 FROM reportes r WHERE r.codigo_reporte = 'REP-2026-000001'
  );

INSERT INTO reportes (
    codigo_reporte, id_servicio_solicitante, id_institucion,
    id_usuario_creador, id_equipo_autorizado, titulo, descripcion,
    fecha_reporte, estado
)
SELECT
    'REP-2026-000002', ss.id_servicio_solicitante, i.id_institucion,
    u.id_usuario, e.id_equipo_autorizado,
    'Revision de incubadora',
    'Reporte en preparacion pendiente de archivo PDF.',
    DATE '2026-09-10', 'borrador'
FROM servicios_solicitantes ss
JOIN instituciones i ON i.nombre = 'Clinica Norte'
JOIN usuarios u ON u.correo = 'generador@meditec.local'
JOIN equipos_autorizados e ON e.identificador_equipo = 'MEDI-GEN-002'
WHERE ss.nombre = 'Coordinacion de biomedica'
  AND NOT EXISTS (
      SELECT 1 FROM reportes r WHERE r.codigo_reporte = 'REP-2026-000002'
  );

INSERT INTO reportes (
    codigo_reporte, id_servicio_solicitante, id_institucion,
    id_usuario_creador, id_equipo_autorizado, titulo, descripcion,
    fecha_reporte, estado
)
SELECT
    'REP-2026-000003', ss.id_servicio_solicitante, i.id_institucion,
    u.id_usuario, e.id_equipo_autorizado,
    'Calibracion de centrifuga',
    'Reporte anulado utilizado para demostrar filtros por estado.',
    DATE '2026-08-26', 'anulado'
FROM servicios_solicitantes ss
JOIN instituciones i ON i.nombre = 'Centro Medico Sur'
JOIN usuarios u ON u.correo = 'admin@meditec.local'
JOIN equipos_autorizados e ON e.identificador_equipo = 'MEDI-GEN-001'
WHERE ss.nombre = 'Direccion administrativa'
  AND NOT EXISTS (
      SELECT 1 FROM reportes r WHERE r.codigo_reporte = 'REP-2026-000003'
  );

INSERT INTO reporte_tecnico (id_reporte, id_tecnico, rol_en_reporte)
SELECT r.id_reporte, t.id_tecnico, v.rol_en_reporte
FROM (
    VALUES
        ('REP-2026-000001', 'carlos.lopez@meditec.local', 'Tecnico responsable'),
        ('REP-2026-000001', 'ana.morales@meditec.local', 'Tecnico de apoyo'),
        ('REP-2026-000002', 'ana.morales@meditec.local', 'Tecnico responsable'),
        ('REP-2026-000003', 'luis.perez@meditec.local', 'Tecnico responsable')
) AS v(codigo_reporte, correo_tecnico, rol_en_reporte)
JOIN reportes r ON r.codigo_reporte = v.codigo_reporte
JOIN tecnicos t ON t.correo = v.correo_tecnico
ON CONFLICT (id_reporte, id_tecnico) DO NOTHING;

INSERT INTO reporte_proveedor (id_reporte, id_proveedor, observacion)
SELECT r.id_reporte, p.id_proveedor, v.observacion
FROM (
    VALUES
        ('REP-2026-000001', '1000001-1', 'Proveedor del equipo revisado'),
        ('REP-2026-000002', '1000002-2', 'Proveedor de repuestos'),
        ('REP-2026-000003', '1000001-1', 'Proveedor del servicio de calibracion')
) AS v(codigo_reporte, nit_proveedor, observacion)
JOIN reportes r ON r.codigo_reporte = v.codigo_reporte
JOIN proveedores p ON p.nit = v.nit_proveedor
ON CONFLICT (id_reporte, id_proveedor) DO NOTHING;

INSERT INTO archivos_pdf (
    id_reporte, url_archivo, hash_archivo, tamano_bytes, estado
)
SELECT
    r.id_reporte,
    '/archivos/reportes/REP-2026-000001.pdf',
    'demo-sha256-rep-2026-000001',
    245760,
    'activo'
FROM reportes r
WHERE r.codigo_reporte = 'REP-2026-000001'
  AND NOT EXISTS (
      SELECT 1
      FROM archivos_pdf ap
      WHERE ap.id_reporte = r.id_reporte
        AND ap.estado = 'activo'
  );

-- Se publica despues de que el PDF existe para respetar la regla de negocio.
UPDATE reportes
SET estado = 'publicado'
WHERE codigo_reporte = 'REP-2026-000001'
  AND estado = 'borrador'
  AND EXISTS (
      SELECT 1
      FROM archivos_pdf ap
      WHERE ap.id_reporte = reportes.id_reporte
        AND ap.estado = 'activo'
  );

-- Eventos iniciales para consultar la bitacora antes de implementar los triggers.
INSERT INTO auditoria_eventos (id_usuario, entidad, entidad_id, accion, detalle, ip_origen)
SELECT
    r.id_usuario_creador, 'reportes', r.id_reporte, 'DATOS_PRUEBA',
    'Registro inicial de Entrega 3 para ' || r.codigo_reporte, '127.0.0.1'
FROM reportes r
WHERE r.codigo_reporte IN ('REP-2026-000001', 'REP-2026-000002', 'REP-2026-000003')
  AND NOT EXISTS (
      SELECT 1
      FROM auditoria_eventos ae
      WHERE ae.entidad = 'reportes'
        AND ae.entidad_id = r.id_reporte
        AND ae.accion = 'DATOS_PRUEBA'
  );
