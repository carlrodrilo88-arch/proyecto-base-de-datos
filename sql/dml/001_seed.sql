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
         '$2b$12$lDVGawQEi9GKWL0coD7F5OitpC/rgCQZoo4pAz9P4PN9z9JgAljia'),
        ('generador_reportes', 'Generador Meditec', 'generador@meditec.local',
         '$2b$12$e0U3ISqGeZv4JdvZTLKu7..VnAhkCpuc1UEfbIg3JRy3Xe7Kh5FNu'),
        ('consulta', 'Consulta Meditec', 'consulta@meditec.local',
         '$2b$12$TZvdH3363vVRxj5SpN6kb.bz/5lopVzBGeDP2hWk4MfjFPirp3eJK')
) AS v(rol, nombre, correo, password_hash)
JOIN roles r ON r.nombre = v.rol
ON CONFLICT (correo) DO NOTHING;

INSERT INTO equipos_autorizados (nombre, identificador_equipo, descripcion) VALUES
('Equipo generador 1', 'MEDI-GEN-001', 'Computadora autorizada para generar reportes'),
('Equipo generador 2', 'MEDI-GEN-002', 'Computadora autorizada para generar reportes')
ON CONFLICT (identificador_equipo) DO NOTHING;

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

INSERT INTO servicios_solicitantes (id_institucion, nombre)
SELECT i.id_institucion, v.servicio
FROM (
    VALUES
        ('Hospital Central', 'Area de mantenimiento'),
        ('Clinica Norte', 'Coordinacion de biomedica'),
        ('Centro Medico Sur', 'Direccion administrativa')
) AS v(institucion, servicio)
JOIN instituciones i ON i.nombre = v.institucion
ON CONFLICT (id_institucion, nombre) DO NOTHING;

INSERT INTO equipos_medicos (
    id_institucion, nombre, numero_bien, marca, modelo, numero_serie
)
SELECT i.id_institucion, v.nombre, v.numero_bien, v.marca, v.modelo, v.numero_serie
FROM (
    VALUES
        ('Hospital Central', 'Monitor de signos vitales', 'BIEN-001', 'BLT', 'M6000', 'SER-001'),
        ('Clinica Norte', 'Incubadora neonatal', 'BIEN-002', 'Medix', 'PC-305', 'SER-002'),
        ('Centro Medico Sur', 'Centrifuga de laboratorio', 'BIEN-003', 'Hettich', 'EBA-200', 'SER-003')
) AS v(institucion, nombre, numero_bien, marca, modelo, numero_serie)
JOIN instituciones i ON i.nombre=v.institucion
ON CONFLICT (id_institucion, numero_bien) DO NOTHING;

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

INSERT INTO proveedores (nombre, nit, telefono, correo, direccion, logo_url, pie_pagina)
SELECT v.nombre, v.nit, v.telefono, v.correo, v.direccion, v.logo_url, v.pie_pagina
FROM (
    VALUES
        ('Proveedor Biomedico A', '1000001-1', '2440-1001', 'ventas@proveedora.local', 'Ciudad de Guatemala', '/logos/proveedor-a.png', 'Proveedor Biomedico A - Servicio tecnico y soporte'),
        ('Suministros Clinicos B', '1000002-2', '2440-1002', 'ventas@proveedorb.local', 'Mixco, Guatemala', '/logos/proveedor-b.png', 'Suministros Clinicos B - Guatemala')
) AS v(nombre, nit, telefono, correo, direccion, logo_url, pie_pagina)
WHERE NOT EXISTS (
    SELECT 1 FROM proveedores p WHERE p.nit = v.nit
);

-- Reporte que posteriormente se publica despues de asociarle un PDF.
INSERT INTO reportes (
    codigo_reporte, id_servicio_solicitante,
    id_usuario_creador, id_equipo_autorizado, titulo, descripcion,
    fecha_reporte, estado
)
SELECT
    'REP-2026-000001', ss.id_servicio_solicitante,
    u.id_usuario, e.id_equipo_autorizado,
    'Mantenimiento preventivo de monitor',
    'Revision preventiva y comprobacion general de equipo medico.',
    DATE '2026-09-01', 'borrador'
FROM servicios_solicitantes ss
JOIN usuarios u ON u.correo = 'generador@meditec.local'
JOIN equipos_autorizados e ON e.identificador_equipo = 'MEDI-GEN-001'
WHERE ss.nombre = 'Area de mantenimiento'
  AND NOT EXISTS (
      SELECT 1 FROM reportes r WHERE r.codigo_reporte = 'REP-2026-000001'
  );

INSERT INTO reportes (
    codigo_reporte, id_servicio_solicitante,
    id_usuario_creador, id_equipo_autorizado, titulo, descripcion,
    fecha_reporte, estado
)
SELECT
    'REP-2026-000002', ss.id_servicio_solicitante,
    u.id_usuario, e.id_equipo_autorizado,
    'Revision de incubadora',
    'Reporte en preparacion pendiente de archivo PDF.',
    DATE '2026-09-10', 'borrador'
FROM servicios_solicitantes ss
JOIN usuarios u ON u.correo = 'generador@meditec.local'
JOIN equipos_autorizados e ON e.identificador_equipo = 'MEDI-GEN-002'
WHERE ss.nombre = 'Coordinacion de biomedica'
  AND NOT EXISTS (
      SELECT 1 FROM reportes r WHERE r.codigo_reporte = 'REP-2026-000002'
  );

INSERT INTO reportes (
    codigo_reporte, id_servicio_solicitante,
    id_usuario_creador, id_equipo_autorizado, titulo, descripcion,
    fecha_reporte, estado
)
SELECT
    'REP-2026-000003', ss.id_servicio_solicitante,
    u.id_usuario, e.id_equipo_autorizado,
    'Calibracion de centrifuga',
    'Reporte anulado utilizado para demostrar filtros por estado.',
    DATE '2026-08-26', 'anulado'
FROM servicios_solicitantes ss
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

UPDATE reportes r
SET id_proveedor_plantilla = rp.id_proveedor
FROM reporte_proveedor rp
WHERE rp.id_reporte = r.id_reporte
  AND r.id_proveedor_plantilla IS NULL;

UPDATE reportes r
SET id_equipo_medico=em.id_equipo_medico,
    descripcion_equipo=em.nombre,
    numero_bien=em.numero_bien,
    marca=em.marca,
    modelo=em.modelo,
    numero_serie=em.numero_serie
FROM equipos_medicos em, servicios_solicitantes ss
WHERE ss.id_servicio_solicitante=r.id_servicio_solicitante
  AND em.id_institucion=ss.id_institucion
  AND em.numero_bien = CASE r.codigo_reporte
      WHEN 'REP-2026-000001' THEN 'BIEN-001'
      WHEN 'REP-2026-000002' THEN 'BIEN-002'
      WHEN 'REP-2026-000003' THEN 'BIEN-003'
  END;

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
