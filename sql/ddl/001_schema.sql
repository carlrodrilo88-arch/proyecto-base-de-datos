-- Archivo: sql/ddl/001_schema.sql
-- Autor: Carlos Geovanni Lopez Rodriguez
-- Descripcion: DDL base para el Sistema de Gestion Documental y Reportes Meditec.
-- Dependencias: PostgreSQL 14 o superior.

DROP TABLE IF EXISTS auditoria_eventos CASCADE;
DROP TABLE IF EXISTS archivos_pdf CASCADE;
DROP TABLE IF EXISTS reporte_proveedor CASCADE;
DROP TABLE IF EXISTS reporte_tecnico CASCADE;
DROP TABLE IF EXISTS reportes CASCADE;
DROP TABLE IF EXISTS equipos_autorizados CASCADE;
DROP TABLE IF EXISTS usuarios CASCADE;
DROP TABLE IF EXISTS roles CASCADE;
DROP TABLE IF EXISTS proveedores CASCADE;
DROP TABLE IF EXISTS tecnicos CASCADE;
DROP TABLE IF EXISTS instituciones CASCADE;
DROP TABLE IF EXISTS servicios_solicitantes CASCADE;

CREATE TABLE roles (
    id_rol BIGSERIAL PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL UNIQUE,
    descripcion TEXT,
    activo BOOLEAN NOT NULL DEFAULT TRUE,
    creado_en TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE usuarios (
    id_usuario BIGSERIAL PRIMARY KEY,
    id_rol BIGINT NOT NULL,
    nombre VARCHAR(120) NOT NULL,
    correo VARCHAR(160) NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    activo BOOLEAN NOT NULL DEFAULT TRUE,
    creado_en TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_usuarios_roles
        FOREIGN KEY (id_rol)
        REFERENCES roles(id_rol)
        ON UPDATE CASCADE
        ON DELETE RESTRICT
);

CREATE TABLE equipos_autorizados (
    id_equipo_autorizado BIGSERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    identificador_equipo VARCHAR(160) NOT NULL UNIQUE,
    descripcion TEXT,
    activo BOOLEAN NOT NULL DEFAULT TRUE,
    creado_en TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE servicios_solicitantes (
    id_servicio_solicitante BIGSERIAL PRIMARY KEY,
    nombre VARCHAR(160) NOT NULL,
    telefono VARCHAR(40),
    correo VARCHAR(160),
    direccion TEXT,
    activo BOOLEAN NOT NULL DEFAULT TRUE,
    creado_en TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE instituciones (
    id_institucion BIGSERIAL PRIMARY KEY,
    nombre VARCHAR(160) NOT NULL,
    direccion TEXT,
    telefono VARCHAR(40),
    correo VARCHAR(160),
    activo BOOLEAN NOT NULL DEFAULT TRUE,
    creado_en TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE tecnicos (
    id_tecnico BIGSERIAL PRIMARY KEY,
    nombre VARCHAR(120) NOT NULL,
    telefono VARCHAR(40),
    correo VARCHAR(160) UNIQUE,
    especialidad VARCHAR(120),
    activo BOOLEAN NOT NULL DEFAULT TRUE,
    creado_en TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE proveedores (
    id_proveedor BIGSERIAL PRIMARY KEY,
    nombre VARCHAR(160) NOT NULL,
    nit VARCHAR(30) UNIQUE,
    telefono VARCHAR(40),
    correo VARCHAR(160),
    direccion TEXT,
    activo BOOLEAN NOT NULL DEFAULT TRUE,
    creado_en TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE reportes (
    id_reporte BIGSERIAL PRIMARY KEY,
    codigo_reporte VARCHAR(40) NOT NULL UNIQUE,
    id_servicio_solicitante BIGINT NOT NULL,
    id_institucion BIGINT,
    id_usuario_creador BIGINT NOT NULL,
    id_equipo_autorizado BIGINT,
    titulo VARCHAR(180) NOT NULL,
    descripcion TEXT,
    fecha_reporte DATE NOT NULL,
    estado VARCHAR(30) NOT NULL DEFAULT 'borrador',
    creado_en TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    actualizado_en TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_reportes_estado
        CHECK (estado IN ('borrador', 'publicado', 'anulado')),
    CONSTRAINT fk_reportes_servicios_solicitantes
        FOREIGN KEY (id_servicio_solicitante)
        REFERENCES servicios_solicitantes(id_servicio_solicitante)
        ON UPDATE CASCADE
        ON DELETE RESTRICT,
    CONSTRAINT fk_reportes_instituciones
        FOREIGN KEY (id_institucion)
        REFERENCES instituciones(id_institucion)
        ON UPDATE CASCADE
        ON DELETE SET NULL,
    CONSTRAINT fk_reportes_usuarios
        FOREIGN KEY (id_usuario_creador)
        REFERENCES usuarios(id_usuario)
        ON UPDATE CASCADE
        ON DELETE RESTRICT,
    CONSTRAINT fk_reportes_equipos_autorizados
        FOREIGN KEY (id_equipo_autorizado)
        REFERENCES equipos_autorizados(id_equipo_autorizado)
        ON UPDATE CASCADE
        ON DELETE SET NULL
);

CREATE TABLE reporte_tecnico (
    id_reporte BIGINT NOT NULL,
    id_tecnico BIGINT NOT NULL,
    rol_en_reporte VARCHAR(80),
    PRIMARY KEY (id_reporte, id_tecnico),
    CONSTRAINT fk_reporte_tecnico_reportes
        FOREIGN KEY (id_reporte)
        REFERENCES reportes(id_reporte)
        ON UPDATE CASCADE
        ON DELETE CASCADE,
    CONSTRAINT fk_reporte_tecnico_tecnicos
        FOREIGN KEY (id_tecnico)
        REFERENCES tecnicos(id_tecnico)
        ON UPDATE CASCADE
        ON DELETE RESTRICT
);

CREATE TABLE reporte_proveedor (
    id_reporte BIGINT NOT NULL,
    id_proveedor BIGINT NOT NULL,
    observacion TEXT,
    PRIMARY KEY (id_reporte, id_proveedor),
    CONSTRAINT fk_reporte_proveedor_reportes
        FOREIGN KEY (id_reporte)
        REFERENCES reportes(id_reporte)
        ON UPDATE CASCADE
        ON DELETE CASCADE,
    CONSTRAINT fk_reporte_proveedor_proveedores
        FOREIGN KEY (id_proveedor)
        REFERENCES proveedores(id_proveedor)
        ON UPDATE CASCADE
        ON DELETE RESTRICT
);

CREATE TABLE archivos_pdf (
    id_archivo_pdf BIGSERIAL PRIMARY KEY,
    id_reporte BIGINT NOT NULL UNIQUE,
    url_archivo TEXT NOT NULL,
    hash_archivo VARCHAR(128),
    tamano_bytes BIGINT,
    estado VARCHAR(30) NOT NULL DEFAULT 'activo',
    fecha_carga TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_archivos_pdf_estado
        CHECK (estado IN ('activo', 'reemplazado', 'eliminado')),
    CONSTRAINT chk_archivos_pdf_tamano
        CHECK (tamano_bytes IS NULL OR tamano_bytes > 0),
    CONSTRAINT fk_archivos_pdf_reportes
        FOREIGN KEY (id_reporte)
        REFERENCES reportes(id_reporte)
        ON UPDATE CASCADE
        ON DELETE CASCADE
);

CREATE TABLE auditoria_eventos (
    id_evento BIGSERIAL PRIMARY KEY,
    id_usuario BIGINT,
    entidad VARCHAR(80) NOT NULL,
    entidad_id BIGINT,
    accion VARCHAR(80) NOT NULL,
    detalle TEXT,
    ip_origen VARCHAR(60),
    fecha_evento TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_auditoria_eventos_usuarios
        FOREIGN KEY (id_usuario)
        REFERENCES usuarios(id_usuario)
        ON UPDATE CASCADE
        ON DELETE SET NULL
);

CREATE INDEX idx_reportes_codigo ON reportes(codigo_reporte);
CREATE INDEX idx_reportes_servicio ON reportes(id_servicio_solicitante);
CREATE INDEX idx_reportes_institucion ON reportes(id_institucion);
CREATE INDEX idx_reportes_fecha ON reportes(fecha_reporte);
CREATE INDEX idx_reportes_estado ON reportes(estado);
CREATE INDEX idx_archivos_pdf_reporte ON archivos_pdf(id_reporte);
CREATE INDEX idx_auditoria_entidad ON auditoria_eventos(entidad, entidad_id);
CREATE INDEX idx_auditoria_fecha ON auditoria_eventos(fecha_evento);
