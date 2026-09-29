# Plan del Proyecto

## Nombre propuesto

Sistema de Gestion Documental y Reportes para Meditec.

## Problema

Meditec utiliza actualmente macros de Excel y Word para crear reportes. Ese
modelo dificulta la busqueda, centralizacion, seguridad, control de versiones y
acceso remoto a los documentos generados.

## Propuesta de solucion

Implementar una aplicacion web con una base de datos PostgreSQL en la nube. El
sistema permitira administrar entidades principales de la empresa, generar o
cargar reportes PDF, almacenar los archivos de forma centralizada y consultar
cada reporte mediante un identificador unico.

## Objetivos especificos

- Disenar una base de datos relacional normalizada para servicios solicitantes, proveedores,
  tecnicos, instituciones, usuarios, equipos autorizados y reportes.
- Implementar control de roles para separar administracion, generacion y consulta.
- Registrar trazabilidad basica de creacion, carga y consulta de reportes.
- Definir mecanismos de consulta rapida por ID, cliente, institucion, tecnico y
  fecha.
- Preparar scripts SQL para creacion de tablas, datos de prueba, vistas,
  procedimientos, triggers y permisos.

## Modulos del sistema

### 1. Seguridad y acceso

Administra usuarios, roles, permisos y equipos autorizados. Este modulo controla
que solo dos computadoras puedan generar o cargar reportes.

### 2. Catalogos

Administra servicios solicitantes, proveedores, tecnicos e instituciones. Estos datos sirven
como base para crear reportes consistentes.

### 3. Reportes

Permite registrar la informacion principal de cada reporte, generar su ID unico,
asociar el archivo PDF y almacenar metadatos como fecha, tecnico responsable,
cliente, institucion y estado.

### 4. Consulta documental

Permite buscar reportes por ID unico y filtros adicionales. Los usuarios
autorizados pueden visualizar o descargar el PDF.

### 5. Auditoria

Registra eventos importantes: creacion de reportes, carga de PDF, actualizacion
de datos y consultas relevantes.

## Entregas sugeridas

### Entrega 1: Propuesta y alcance

- Introduccion.
- Planteamiento del problema.
- Objetivo general y objetivos especificos.
- Requerimientos funcionales y no funcionales.
- Alcance y limitaciones.

### Entrega 2: Diseno de base de datos

- Modelo entidad-relacion.
- Modelo relacional.
- Diccionario de datos.
- Normalizacion.
- Script DDL inicial.

### Entrega 3: Implementacion SQL

- Datos de prueba.
- Consultas principales.
- Vistas.
- Funciones o procedimientos almacenados.
- Triggers.
- Roles y permisos.

### Entrega 4: Aplicacion, pruebas y cierre

- Prototipo web funcional.
- Casos de prueba.
- Manual de usuario.
- Evidencias de ejecucion.
- Conclusiones y recomendaciones.

## Requerimientos funcionales

- RF-01: Registrar servicios solicitantes.
- RF-02: Registrar proveedores.
- RF-03: Registrar tecnicos.
- RF-04: Registrar instituciones.
- RF-05: Registrar usuarios del sistema.
- RF-06: Asignar roles y permisos.
- RF-07: Registrar equipos autorizados para generacion o carga de PDFs.
- RF-08: Crear reportes con ID unico.
- RF-09: Cargar o asociar archivo PDF a un reporte.
- RF-10: Consultar reporte por ID unico.
- RF-11: Filtrar reportes por servicio solicitante, institucion, tecnico, estado y fecha.
- RF-12: Registrar eventos de auditoria.

## Requerimientos no funcionales

- RNF-01: La base de datos debe estar alojada en PostgreSQL.
- RNF-02: El sistema debe aplicar autenticacion de usuarios.
- RNF-03: El acceso a generacion/carga debe limitarse por rol y equipo autorizado.
- RNF-04: Los reportes deben tener identificadores unicos.
- RNF-05: Las consultas por ID deben ser rapidas mediante indices.
- RNF-06: La estructura debe permitir crecimiento futuro.

## Riesgos y decisiones pendientes

- Definir si el PDF se genera dentro de la app o si se carga despues de crearlo
  externamente.
- Confirmar donde se almacenaran los PDFs: servidor local, servidor web o nube.
- Confirmar tecnologia del backend y frontend segun lo permitido por la clase.
- Definir si se implementara autenticacion real o simulada para el prototipo.
