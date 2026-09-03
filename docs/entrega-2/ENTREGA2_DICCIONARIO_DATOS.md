# Diccionario de Datos - Entrega 2

## Proyecto

Sistema de Gestion Documental y Reportes para Meditec.

## roles

| Campo       | Tipo        | Restricciones                       | Descripcion                       |
| ----------- | ----------- | ----------------------------------- | --------------------------------- |
| id_rol      | BIGSERIAL   | PK                                  | Identificador del rol.            |
| nombre      | VARCHAR(50) | NOT NULL, UNIQUE                    | Nombre del rol.                   |
| descripcion | TEXT        |                                     | Descripcion del alcance del rol.  |
| activo      | BOOLEAN     | NOT NULL, DEFAULT TRUE              | Indica si el rol esta disponible. |
| creado_en   | TIMESTAMP   | NOT NULL, DEFAULT CURRENT_TIMESTAMP | Fecha de creacion.                |

## usuarios

| Campo         | Tipo         | Restricciones                       | Descripcion                          |
| ------------- | ------------ | ----------------------------------- | ------------------------------------ |
| id_usuario    | BIGSERIAL    | PK                                  | Identificador del usuario.           |
| id_rol        | BIGINT       | NOT NULL, FK                        | Rol asignado.                        |
| nombre        | VARCHAR(120) | NOT NULL                            | Nombre del usuario.                  |
| correo        | VARCHAR(160) | NOT NULL, UNIQUE                    | Correo usado para login.             |
| password_hash | TEXT         | NOT NULL                            | Contrasena almacenada como hash.     |
| activo        | BOOLEAN      | NOT NULL, DEFAULT TRUE              | Indica si puede ingresar al sistema. |
| creado_en     | TIMESTAMP    | NOT NULL, DEFAULT CURRENT_TIMESTAMP | Fecha de creacion.                   |

## equipos_autorizados

| Campo                | Tipo         | Restricciones                       | Descripcion                                  |
| -------------------- | ------------ | ----------------------------------- | -------------------------------------------- |
| id_equipo_autorizado | BIGSERIAL    | PK                                  | Identificador del equipo.                    |
| nombre               | VARCHAR(100) | NOT NULL                            | Nombre descriptivo del equipo.               |
| identificador_equipo | VARCHAR(160) | NOT NULL, UNIQUE                    | Identificador tecnico del equipo autorizado. |
| descripcion          | TEXT         |                                     | Observaciones del equipo.                    |
| activo               | BOOLEAN      | NOT NULL, DEFAULT TRUE              | Indica si el equipo esta autorizado.         |
| creado_en            | TIMESTAMP    | NOT NULL, DEFAULT CURRENT_TIMESTAMP | Fecha de registro.                           |

## servicios_solicitantes

| Campo                   | Tipo         | Restricciones                       | Descripcion                                       |
| ----------------------- | ------------ | ----------------------------------- | ------------------------------------------------- |
| id_servicio_solicitante | BIGSERIAL    | PK                                  | Identificador del servicio solicitante.           |
| nombre                  | VARCHAR(160) | NOT NULL                            | Nombre de la persona, area o entidad solicitante. |
| telefono                | VARCHAR(40)  |                                     | Telefono de contacto.                             |
| correo                  | VARCHAR(160) |                                     | Correo de contacto.                               |
| direccion               | TEXT         |                                     | Direccion relacionada.                            |
| activo                  | BOOLEAN      | NOT NULL, DEFAULT TRUE              | Indica si sigue vigente.                          |
| creado_en               | TIMESTAMP    | NOT NULL, DEFAULT CURRENT_TIMESTAMP | Fecha de registro.                                |

## instituciones

| Campo          | Tipo         | Restricciones                       | Descripcion                      |
| -------------- | ------------ | ----------------------------------- | -------------------------------- |
| id_institucion | BIGSERIAL    | PK                                  | Identificador de la institucion. |
| nombre         | VARCHAR(160) | NOT NULL                            | Nombre de la institucion.        |
| direccion      | TEXT         |                                     | Direccion fisica.                |
| telefono       | VARCHAR(40)  |                                     | Telefono de contacto.            |
| correo         | VARCHAR(160) |                                     | Correo de contacto.              |
| activo         | BOOLEAN      | NOT NULL, DEFAULT TRUE              | Indica si sigue vigente.         |
| creado_en      | TIMESTAMP    | NOT NULL, DEFAULT CURRENT_TIMESTAMP | Fecha de registro.               |

## tecnicos

| Campo        | Tipo         | Restricciones                       | Descripcion                           |
| ------------ | ------------ | ----------------------------------- | ------------------------------------- |
| id_tecnico   | BIGSERIAL    | PK                                  | Identificador del tecnico.            |
| nombre       | VARCHAR(120) | NOT NULL                            | Nombre del tecnico.                   |
| telefono     | VARCHAR(40)  |                                     | Telefono de contacto.                 |
| correo       | VARCHAR(160) | UNIQUE                              | Correo del tecnico.                   |
| especialidad | VARCHAR(120) |                                     | Area tecnica principal.               |
| activo       | BOOLEAN      | NOT NULL, DEFAULT TRUE              | Indica si puede asignarse a reportes. |
| creado_en    | TIMESTAMP    | NOT NULL, DEFAULT CURRENT_TIMESTAMP | Fecha de registro.                    |

## proveedores

| Campo        | Tipo         | Restricciones                       | Descripcion                     |
| ------------ | ------------ | ----------------------------------- | ------------------------------- |
| id_proveedor | BIGSERIAL    | PK                                  | Identificador del proveedor.    |
| nombre       | VARCHAR(160) | NOT NULL                            | Nombre comercial del proveedor. |
| nit          | VARCHAR(30)  | UNIQUE                              | Identificacion tributaria.      |
| telefono     | VARCHAR(40)  |                                     | Telefono de contacto.           |
| correo       | VARCHAR(160) |                                     | Correo de contacto.             |
| direccion    | TEXT         |                                     | Direccion del proveedor.        |
| activo       | BOOLEAN      | NOT NULL, DEFAULT TRUE              | Indica si sigue vigente.        |
| creado_en    | TIMESTAMP    | NOT NULL, DEFAULT CURRENT_TIMESTAMP | Fecha de registro.              |

## reportes

| Campo                   | Tipo         | Restricciones                       | Descripcion                                    |
| ----------------------- | ------------ | ----------------------------------- | ---------------------------------------------- |
| id_reporte              | BIGSERIAL    | PK                                  | Identificador interno del reporte.             |
| codigo_reporte          | VARCHAR(40)  | NOT NULL, UNIQUE                    | Codigo unico usado para consulta.              |
| id_servicio_solicitante | BIGINT       | NOT NULL, FK                        | Servicio solicitante relacionado.              |
| id_institucion          | BIGINT       | FK                                  | Institucion relacionada, si aplica.            |
| id_usuario_creador      | BIGINT       | NOT NULL, FK                        | Usuario que registro el reporte.               |
| id_equipo_autorizado    | BIGINT       | FK                                  | Equipo usado para cargar o generar el reporte. |
| titulo                  | VARCHAR(180) | NOT NULL                            | Titulo del reporte.                            |
| descripcion             | TEXT         |                                     | Descripcion general.                           |
| fecha_reporte           | DATE         | NOT NULL                            | Fecha del reporte.                             |
| estado                  | VARCHAR(30)  | NOT NULL, CHECK                     | Estado: borrador, publicado o anulado.         |
| creado_en               | TIMESTAMP    | NOT NULL, DEFAULT CURRENT_TIMESTAMP | Fecha de creacion.                             |
| actualizado_en          | TIMESTAMP    | NOT NULL, DEFAULT CURRENT_TIMESTAMP | Fecha de ultima actualizacion.                 |

## reporte_tecnico

| Campo          | Tipo        | Restricciones | Descripcion                        |
| -------------- | ----------- | ------------- | ---------------------------------- |
| id_reporte     | BIGINT      | PK, FK        | Reporte asociado.                  |
| id_tecnico     | BIGINT      | PK, FK        | Tecnico asociado.                  |
| rol_en_reporte | VARCHAR(80) |               | Funcion del tecnico en el reporte. |

## reporte_proveedor

| Campo        | Tipo   | Restricciones | Descripcion                                |
| ------------ | ------ | ------------- | ------------------------------------------ |
| id_reporte   | BIGINT | PK, FK        | Reporte asociado.                          |
| id_proveedor | BIGINT | PK, FK        | Proveedor asociado.                        |
| observacion  | TEXT   |               | Detalle de la participacion del proveedor. |

## archivos_pdf

| Campo          | Tipo         | Restricciones                       | Descripcion                               |
| -------------- | ------------ | ----------------------------------- | ----------------------------------------- |
| id_archivo_pdf | BIGSERIAL    | PK                                  | Identificador del archivo PDF.            |
| id_reporte     | BIGINT       | NOT NULL, UNIQUE, FK                | Reporte asociado.                         |
| url_archivo    | TEXT         | NOT NULL                            | Ruta o URL del PDF.                       |
| hash_archivo   | VARCHAR(128) |                                     | Hash para validar integridad del archivo. |
| tamano_bytes   | BIGINT       | CHECK                               | Tamano del archivo en bytes.              |
| estado         | VARCHAR(30)  | NOT NULL, CHECK                     | Estado: activo, reemplazado o eliminado.  |
| fecha_carga    | TIMESTAMP    | NOT NULL, DEFAULT CURRENT_TIMESTAMP | Fecha de carga del archivo.               |

## auditoria_eventos

| Campo        | Tipo        | Restricciones                       | Descripcion                          |
| ------------ | ----------- | ----------------------------------- | ------------------------------------ |
| id_evento    | BIGSERIAL   | PK                                  | Identificador del evento.            |
| id_usuario   | BIGINT      | FK                                  | Usuario que genero el evento.        |
| entidad      | VARCHAR(80) | NOT NULL                            | Tabla o entidad afectada.            |
| entidad_id   | BIGINT      |                                     | Identificador del registro afectado. |
| accion       | VARCHAR(80) | NOT NULL                            | Accion realizada.                    |
| detalle      | TEXT        |                                     | Descripcion del evento.              |
| ip_origen    | VARCHAR(60) |                                     | IP desde donde se realizo la accion. |
| fecha_evento | TIMESTAMP   | NOT NULL, DEFAULT CURRENT_TIMESTAMP | Fecha del evento.                    |

