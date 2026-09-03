# Diagrama ER Chen - Entrega 1

## Proposito

Este documento define la especificacion conceptual para elaborar el diagrama
Entidad-Relacion en notacion Chen del sistema de gestion documental y reportes
para Meditec.

## Entidades y atributos

### Servicio_Solicitante

Representa a la persona, area o entidad que solicita un servicio o reporte a
Meditec.

- id: llave primaria.
- nombre.
- estado: activo/desactivado.

### Institucion

Representa instituciones, sedes u organizaciones donde se realizan servicios o
para las cuales se generan reportes.

- id_institucion: llave primaria.
- nombre.
- direccion.
- telefono.
- correo.
- estado.

### Tecnico

Representa al personal tecnico responsable de servicios, revisiones o reportes.

- id_tecnico: llave primaria.
- nombre.
- telefono.
- correo.
- especialidad.
- estado.

### Proveedor

Representa proveedores asociados a servicios, equipos, insumos o informacion
relacionada con reportes.

- id_proveedor: llave primaria.
- nombre.
- nit.
- telefono.
- correo.
- direccion.
- estado.

### Usuario

Representa a las personas que acceden al sistema web.

- id_usuario: llave primaria.
- nombre.
- correo.
- password_hash.
- estado.

### Rol

Representa el tipo de acceso asignado a cada usuario.

- id_rol: llave primaria.
- nombre.
- descripcion.

### Equipo_Autorizado

Representa las computadoras autorizadas para generar o cargar reportes PDF.

- id_equipo: llave primaria.
- nombre.
- identificador_equipo.
- descripcion.
- estado.

### Reporte

Representa el registro principal de cada reporte generado o cargado en el
sistema.

- id_reporte: llave primaria.
- codigo_reporte.
- titulo.
- descripcion.
- fecha_reporte.
- estado.

### Archivo_PDF

Representa el archivo PDF asociado a un reporte.

- id_archivo: llave primaria.
- url_archivo.
- hash_archivo.
- fecha_carga.
- tamano.
- estado.

### Auditoria_Evento

Representa los eventos importantes registrados por el sistema para trazabilidad.

- id_evento: llave primaria.
- entidad.
- entidad_id.
- accion.
- detalle.
- fecha_evento.
- ip_origen.

## Relaciones y cardinalidades

| Relacion | Entidades | Cardinalidad | Descripcion |
| --- | --- | --- | --- |
| Tiene | Rol - Usuario | 1:N | Un rol puede asignarse a muchos usuarios; cada usuario tiene un rol. |
| Crea | Usuario - Reporte | 1:N | Un usuario puede crear muchos reportes; cada reporte es creado por un usuario. |
| Solicita | Servicio_Solicitante - Reporte | 1:N | Un servicio solicitante puede tener muchos reportes; cada reporte pertenece a un servicio solicitante. |
| Se_genera_para | Institucion - Reporte | 1:N | Una institucion puede estar asociada a muchos reportes; cada reporte puede generarse para una institucion. |
| Adjunta | Reporte - Archivo_PDF | 1:1 | Un reporte publicado debe tener un archivo PDF asociado. |
| Usa | Equipo_Autorizado - Reporte | 1:N | Un equipo autorizado puede usarse para registrar muchos reportes; cada reporte cargado se asocia al equipo utilizado. |
| Registra | Usuario - Auditoria_Evento | 1:N | Un usuario puede generar muchos eventos de auditoria; cada evento se asocia a un usuario. |
| Participa | Reporte - Tecnico | M:N | Un reporte puede involucrar varios tecnicos y un tecnico puede participar en varios reportes. |
| Involucra | Reporte - Proveedor | M:N | Un reporte puede involucrar varios proveedores y un proveedor puede relacionarse con varios reportes. |

## Relaciones N:M para resolver en el modelo relacional

Aunque en Chen las relaciones N:M se representan directamente con rombos, en el
modelo relacional posterior deben resolverse con tablas intermedias.

| Relacion N:M | Tabla intermedia sugerida | Llaves sugeridas |
| --- | --- | --- |
| Reporte - Tecnico | reporte_tecnico | id_reporte, id_tecnico |
| Reporte - Proveedor | reporte_proveedor | id_reporte, id_proveedor |

## Guia para dibujar el diagrama

1. Dibujar cada entidad como rectangulo.
2. Agregar sus atributos como ovalos conectados a la entidad.
3. Subrayar el atributo que funciona como llave primaria.
4. Dibujar cada relacion como rombo entre las entidades correspondientes.
5. Colocar las cardinalidades `1`, `N` o `M` en las lineas.
6. Verificar que las relaciones N:M `Participa` e `Involucra` aparezcan de forma clara.
7. Exportar el resultado como PNG o PDF y guardarlo en `docs/diagramas/`.

## Validacion conceptual

El diagrama debe permitir justificar que el sistema puede:

- Registrar entidades principales del negocio.
- Crear reportes con identificador unico.
- Asociar reportes a servicios solicitantes, instituciones, tecnicos y proveedores.
- Controlar usuarios, roles y equipos autorizados.
- Asociar reportes con archivos PDF.
- Registrar acciones importantes en auditoria.

Antes de avanzar al DDL definitivo, este diagrama debe revisarse y aprobarse como
base conceptual del proyecto.
