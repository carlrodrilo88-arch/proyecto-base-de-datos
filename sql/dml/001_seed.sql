-- Archivo: sql/dml/001_seed.sql
-- Autor: Carlos Geovanni Lopez Rodriguez
-- Descripcion: Datos minimos para probar login y CRUD base de Entrega 2.
-- Dependencias: sql/ddl/001_schema.sql

INSERT INTO roles (nombre, descripcion) VALUES
('administrador', 'Control total del sistema'),
('generador_reportes', 'Puede crear, generar y cargar reportes PDF'),
('consulta', 'Puede buscar y visualizar reportes autorizados')
ON CONFLICT (nombre) DO NOTHING;

INSERT INTO usuarios (id_rol, nombre, correo, password_hash) VALUES
(
    (SELECT id_rol FROM roles WHERE nombre = 'administrador'),
    'Administrador Meditec',
    'admin@meditec.local',
    '240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9'
)
ON CONFLICT (correo) DO NOTHING;

INSERT INTO equipos_autorizados (nombre, identificador_equipo, descripcion) VALUES
('Equipo generador 1', 'MEDI-GEN-001', 'Computadora autorizada para generar reportes'),
('Equipo generador 2', 'MEDI-GEN-002', 'Computadora autorizada para generar reportes')
ON CONFLICT (identificador_equipo) DO NOTHING;

INSERT INTO servicios_solicitantes (nombre, telefono, correo, direccion) VALUES
('Area de mantenimiento', '2222-1001', 'mantenimiento@hospital.local', 'Ciudad de Guatemala'),
('Direccion administrativa', '2222-1002', 'administracion@clinica.local', 'Mixco, Guatemala'),
('Coordinacion de biomedica', '2222-1003', 'biomedica@centromedico.local', 'Villa Nueva, Guatemala');

INSERT INTO instituciones (nombre, direccion, telefono, correo) VALUES
('Hospital Central', 'Zona 1, Ciudad de Guatemala', '2230-0001', 'contacto@hospitalcentral.local'),
('Clinica Norte', 'Zona 17, Ciudad de Guatemala', '2230-0002', 'contacto@clinicanorte.local');

INSERT INTO tecnicos (nombre, telefono, correo, especialidad) VALUES
('Carlos Lopez', '5550-1001', 'carlos.lopez@meditec.local', 'Equipo medico'),
('Ana Morales', '5550-1002', 'ana.morales@meditec.local', 'Mantenimiento preventivo'),
('Luis Perez', '5550-1003', 'luis.perez@meditec.local', 'Calibracion');

INSERT INTO proveedores (nombre, nit, telefono, correo, direccion) VALUES
('Proveedor Biomedico A', '1000001-1', '2440-1001', 'ventas@proveedora.local', 'Ciudad de Guatemala'),
('Suministros Clinicos B', '1000002-2', '2440-1002', 'ventas@proveedorb.local', 'Mixco, Guatemala');
