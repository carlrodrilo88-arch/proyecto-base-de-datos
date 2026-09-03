# Modelo Relacional - Entrega 2

## Proyecto

Sistema de Gestion Documental y Reportes para Meditec.

## Proposito

Este documento transforma el modelo Entidad-Relacion aprobado en la Entrega 1 a
un modelo relacional implementable en PostgreSQL. El objetivo es dejar definidas
las tablas, llaves primarias, llaves foraneas y relaciones necesarias para la
implementacion base de la Entrega 2.

## Tablas principales

### roles

Almacena los perfiles de acceso disponibles en el sistema.

- PK: `id_rol`
- UK: `nombre`

### usuarios

Almacena las cuentas que acceden a la aplicacion web.

- PK: `id_usuario`
- FK: `id_rol` referencia `roles(id_rol)`
- UK: `correo`

### equipos_autorizados

Registra las computadoras permitidas para generar o cargar reportes PDF.

- PK: `id_equipo_autorizado`
- UK: `identificador_equipo`

### servicios_solicitantes

Registra las personas, areas o entidades que solicitan servicios o reportes.

- PK: `id_servicio_solicitante`

### instituciones

Registra instituciones, sedes u organizaciones atendidas por Meditec.

- PK: `id_institucion`

### tecnicos

Registra al personal tecnico que puede participar en reportes.

- PK: `id_tecnico`
- UK: `correo`

### proveedores

Registra proveedores asociados a servicios, equipos o documentacion.

- PK: `id_proveedor`
- UK: `nit`

### reportes

Registra el documento principal generado o cargado en el sistema.

- PK: `id_reporte`
- UK: `codigo_reporte`
- FK: `id_servicio_solicitante` referencia `servicios_solicitantes(id_servicio_solicitante)`
- FK: `id_institucion` referencia `instituciones(id_institucion)`
- FK: `id_usuario_creador` referencia `usuarios(id_usuario)`
- FK: `id_equipo_autorizado` referencia `equipos_autorizados(id_equipo_autorizado)`

### archivos_pdf

Registra el archivo PDF asociado a cada reporte.

- PK: `id_archivo_pdf`
- FK: `id_reporte` referencia `reportes(id_reporte)`
- UK: `id_reporte`, para mantener relacion 1:1 entre reporte y archivo PDF activo.

### auditoria_eventos

Registra eventos relevantes para trazabilidad.

- PK: `id_evento`
- FK: `id_usuario` referencia `usuarios(id_usuario)`

## Tablas intermedias para relaciones N:M

### reporte_tecnico

Resuelve la relacion N:M entre `reportes` y `tecnicos`.

- PK compuesta: `id_reporte`, `id_tecnico`
- FK: `id_reporte` referencia `reportes(id_reporte)`
- FK: `id_tecnico` referencia `tecnicos(id_tecnico)`

### reporte_proveedor

Resuelve la relacion N:M entre `reportes` y `proveedores`.

- PK compuesta: `id_reporte`, `id_proveedor`
- FK: `id_reporte` referencia `reportes(id_reporte)`
- FK: `id_proveedor` referencia `proveedores(id_proveedor)`

## Cardinalidades implementadas

| Relacion                          | Cardinalidad | Implementacion                     |
| --------------------------------- | ------------ | ---------------------------------- |
| roles - usuarios                  | 1:N          | `usuarios.id_rol`                  |
| usuarios - reportes               | 1:N          | `reportes.id_usuario_creador`      |
| servicios_solicitantes - reportes | 1:N          | `reportes.id_servicio_solicitante` |
| instituciones - reportes          | 1:N          | `reportes.id_institucion`          |
| equipos_autorizados - reportes    | 1:N          | `reportes.id_equipo_autorizado`    |
| reportes - archivos_pdf           | 1:1          | `archivos_pdf.id_reporte UNIQUE`   |
| reportes - tecnicos               | N:M          | `reporte_tecnico`                  |
| reportes - proveedores            | N:M          | `reporte_proveedor`                |
| usuarios - auditoria_eventos      | 1:N          | `auditoria_eventos.id_usuario`     |

## Reglas de integridad principales

- Todo reporte debe tener `codigo_reporte` unico.
- Todo usuario debe pertenecer a un rol existente.
- Todo reporte debe tener un servicio solicitante y un usuario creador.
- Un reporte puede tener como maximo un archivo PDF asociado en la tabla `archivos_pdf`.
- Las relaciones N:M evitan duplicar tecnicos o proveedores dentro de la tabla `reportes`.
- Las entidades principales usan `activo` para evitar eliminar historial operativo.

