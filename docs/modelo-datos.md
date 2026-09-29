# Modelo de Datos

## Entidades principales

### usuarios

Personas que ingresan al sistema. Se relacionan con un rol y pueden crear,
cargar o consultar reportes segun sus permisos.

### roles

Define el nivel de acceso. Roles sugeridos:

- administrador
- generador_reportes
- consulta

### equipos_autorizados

Registra las computadoras permitidas para generar o cargar reportes. Permite
cumplir el requisito de limitar esa accion a dos equipos.

### servicios_solicitantes

Areas, departamentos o contactos que solicitan documentacion o reportes.

### proveedores

Proveedores asociados a equipos, servicios o informacion administrativa.

### tecnicos

Personal tecnico responsable de visitas, mantenimientos o elaboracion de
reportes.

### instituciones

Instituciones relacionadas con servicios solicitantes. Puede representar sedes,
hospitales, clinicas, departamentos u organizaciones.

### reportes

Registro central del documento. Incluye ID unico, datos de referencia, estado,
fecha, usuario creador y ubicacion del PDF.

### auditoria_eventos

Bitacora de acciones relevantes ejecutadas dentro del sistema.

## Relaciones clave

- Un rol puede tener muchos usuarios.
- Un usuario puede crear muchos reportes.
- Un servicio solicitante puede tener muchos reportes.
- Una institucion puede tener muchos reportes.
- Un tecnico puede estar asociado a muchos reportes.
- Un reporte puede tener un PDF asociado.
- Un equipo autorizado puede ser usado para registrar o cargar reportes.

## Reglas de negocio

- Cada reporte debe tener un codigo unico.
- Solo usuarios con rol permitido pueden crear o cargar PDFs.
- Solo equipos activos y autorizados pueden ejecutar acciones de generacion o
  carga.
- Un reporte no debe marcarse como publicado si no tiene archivo PDF asociado.
- Los eventos importantes deben quedar registrados en auditoria.

## Tablas sugeridas

| Tabla | Proposito |
| --- | --- |
| roles | Catalogo de roles del sistema |
| usuarios | Cuentas de acceso |
| equipos_autorizados | Computadoras permitidas para generar/cargar |
| servicios_solicitantes | Catalogo de servicios solicitantes |
| proveedores | Catalogo de proveedores |
| tecnicos | Catalogo de tecnicos |
| instituciones | Catalogo de instituciones |
| reportes | Registro principal de reportes |
| auditoria_eventos | Historial de acciones |

## Indices recomendados

- reportes.codigo_reporte
- reportes.id_servicio_solicitante
- reportes.institucion_id
- reportes.fecha_reporte
- usuarios.correo
- equipos_autorizados.identificador_equipo
