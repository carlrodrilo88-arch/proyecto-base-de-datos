# Requerimientos - Entrega 1

## Introduccion

Este documento define los requerimientos iniciales del sistema de gestion
documental y reportes para Meditec. Su objetivo es identificar las funciones que
debe ofrecer la aplicacion y los datos que la base de datos debe almacenar para
centralizar la creacion, administracion y consulta de reportes PDF.

## Actores del sistema

| Actor                  | Descripcion |
| ---                    | --- |
| Administrador          | Gestiona usuarios, roles, permisos, catalogos y configuracion general. |
| Generador de reportes  | Crea reportes y carga o genera archivos PDF desde equipos autorizados. |
| Usuario de consulta    | Busca y visualiza reportes disponibles en el sistema. |
| Tecnico                | Persona responsable de realizar servicios o participar en reportes. |
| Servicio solicitante o institucion | Entidad relacionada con los reportes generados por Meditec. |

## Requerimientos funcionales
RF= requerimiento funcional
| Codigo | Requerimiento |
| --- | --- |
| RF-01 | El sistema debe permitir registrar servicios solicitantes. |
| RF-02 | El sistema debe permitir registrar proveedores. |
| RF-03 | El sistema debe permitir registrar tecnicos. |
| RF-04 | El sistema debe permitir registrar instituciones. |
| RF-05 | El sistema debe permitir registrar usuarios del sistema. |
| RF-06 | El sistema debe permitir asignar roles y permisos a los usuarios. |
| RF-07 | El sistema debe permitir registrar equipos autorizados para generar o cargar reportes PDF. |
| RF-08 | El sistema debe permitir crear reportes asociados a servicios solicitantes, instituciones y tecnicos. |
| RF-09 | El sistema debe generar o asignar un ID unico para cada reporte. |
| RF-10 | El sistema debe permitir cargar o asociar un archivo PDF a cada reporte. |
| RF-11 | El sistema debe permitir consultar reportes mediante su ID unico. |
| RF-12 | El sistema debe permitir filtrar reportes por servicio solicitante, institucion, tecnico, fecha o estado. |
| RF-13 | El sistema debe registrar eventos importantes de auditoria. |
| RF-14 | El sistema debe restringir la generacion y carga de PDFs a usuarios y equipos autorizados. |

## Requerimientos de datos

| Codigo | Dato requerido        | Descripcion |
| ---    | ---                   | --- |
| RD-01 | Servicios solicitantes | Informacion de personas, areas o entidades que solicitan servicios o reportes. |
| RD-02 | Proveedores            | Informacion de proveedores asociados a servicios, equipos o documentacion. |
| RD-03 | Tecnicos               | Informacion del personal tecnico responsable de reportes o servicios. |
| RD-04 | Instituciones          | Informacion de instituciones, sedes u organizaciones atendidas. |
| RD-05 | Usuarios               | Cuentas que acceden al sistema. |
| RD-06 | Roles                  | Perfiles de acceso y permisos diferenciados. |
| RD-07 | Equipos autorizados    | Computadoras permitidas para generar o cargar reportes PDF. |
| RD-08 | Reportes               | Registro principal de cada documento generado o cargado. |
| RD-09 | Archivos PDF           | Ruta, URL o identificador del archivo PDF asociado al reporte. |
| RD-10 | Auditoria              | Historial de acciones relevantes realizadas en el sistema. |

## Requerimientos no funcionales

| Codigo | Requerimiento |
| --- | --- |
| RNF-01 | La base de datos debe implementarse en PostgreSQL. |
| RNF-02 | El sistema debe aplicar control de acceso por roles. |
| RNF-03 | La base de datos debe mantener integridad referencial mediante llaves primarias y foraneas. |
| RNF-04 | Los reportes deben tener identificadores unicos. |
| RNF-05 | La consulta por ID unico debe ser rapida mediante indices. |
| RNF-06 | El sistema debe permitir acceso remoto desde la aplicacion web. |
| RNF-07 | El repositorio no debe contener credenciales reales. |
| RNF-08 | El diseno debe permitir crecimiento futuro del sistema. |

## Reglas de negocio

| Codigo | Regla |
| --- | --- |
| RN-01 | Solo dos computadoras podran generar o cargar reportes PDF. |
| RN-02 | Todo reporte debe tener un ID unico. |
| RN-03 | Un reporte publicado debe tener un PDF asociado. |
| RN-04 | Solo usuarios autorizados podran consultar reportes. |
| RN-05 | Las acciones importantes del sistema deben registrarse en auditoria. |
| RN-06 | Los datos de servicios solicitantes, tecnicos, proveedores e instituciones deben mantenerse activos o inactivos sin eliminar historial. |

## Matriz requerimiento-entidad

| Requerimiento                        | Entidades relacionadas |
| ---                                  | --- |
| Registrar servicios solicitantes     | Servicio_Solicitante |
| Registrar proveedores                | Proveedor |
| Registrar tecnicos                   | Tecnico |
| Registrar instituciones              | Institucion |
| Registrar usuarios y roles           | Usuario, Rol |
| Registrar equipos autorizados        | Equipo autorizado |
| Crear reportes                       | Reporte, Servicio_Solicitante, Institucion, Tecnico, Usuario |
| Asociar PDFs a reportes              | Reporte, Archivo PDF |
| Consultar reportes por ID            | Reporte, Archivo PDF |
| Controlar generacion y carga de PDFs | Usuario, Rol, Equipo autorizado, Reporte |
| Registrar auditoria                  | Auditoria, Usuario |
