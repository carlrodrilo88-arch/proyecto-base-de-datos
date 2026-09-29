# Bases y Requerimientos - Entrega 3

## Fuente de referencia

Este documento resume las bases de la Entrega 3 segun el material del proyecto
y los documentos ya derivados en el repositorio:

- `Proyecto - Base de datos.pdf`
- `docs/entrega-1/ENTREGA1_GANTT.md`
- `docs/plan-proyecto.md`
- `docs/entrega-1/ENTREGA1_REQUERIMIENTOS.md`

Nota: en la revision local no se pudo extraer texto directo del PDF con las
herramientas disponibles en la terminal. Por eso este resumen toma como base los
documentos del repositorio que ya reflejan las bases y el cronograma del PDF del
proyecto.

## Enfoque general de la Entrega 3

La Entrega 3 corresponde a las semanas 6 a 8 del proyecto. Su enfoque principal
es la implementacion SQL avanzada, seguridad, pruebas y avance de la aplicacion
web hasta un 70%.

Segun el cronograma del proyecto, la Entrega 3 debe incluir:

- Datos de prueba.
- Vistas SQL.
- Triggers.
- Procedimientos almacenados.
- Roles y permisos.
- Casos de prueba.
- Aplicacion web al 70%.

## Requerimientos SQL esperados

### 1. Datos de prueba

Se deben preparar datos suficientes para probar las entidades principales del
sistema:

- Servicios solicitantes.
- Proveedores.
- Tecnicos.
- Instituciones.
- Usuarios.
- Roles.
- Equipos autorizados.
- Reportes.
- Archivos PDF asociados.
- Eventos de auditoria.

Estos datos deben permitir demostrar consultas, relaciones, vistas, triggers y
permisos.

### 2. Consultas principales

Se deben incluir consultas que demuestren el funcionamiento del modelo de datos.
Para el proyecto Meditec, las consultas principales deben cubrir:

- Consulta de reportes por codigo unico.
- Filtro de reportes por servicio solicitante.
- Filtro de reportes por institucion.
- Filtro de reportes por tecnico.
- Filtro de reportes por fecha.
- Filtro de reportes por estado.
- Consulta de reportes con archivo PDF asociado.
- Consulta de eventos de auditoria.

### 3. Vistas SQL

Las vistas deben simplificar consultas frecuentes del sistema. Como minimo, debe
existir una vista resumen de reportes que una la informacion principal:

- Codigo del reporte.
- Titulo.
- Fecha.
- Estado.
- Servicio solicitante.
- Institucion.
- Tecnicos asociados.
- Proveedores asociados.
- Usuario creador.
- Archivo PDF asociado.

### 4. Funciones o procedimientos almacenados

La Entrega 3 debe incluir funciones o procedimientos que automaticen reglas del
sistema. Para este proyecto son necesarios o recomendables:

- Funcion para generar codigo unico de reporte.
- Funcion para actualizar automaticamente la fecha de modificacion.
- Funcion o procedimiento para registrar eventos de auditoria.
- Funcion o validacion para controlar reglas de publicacion de reportes.

### 5. Triggers

Los triggers deben demostrar automatizacion dentro de la base de datos. Para el
caso Meditec, se consideran relevantes:

- Trigger para actualizar `reportes.actualizado_en`.
- Trigger de auditoria al crear o modificar reportes.
- Trigger o validacion para impedir publicar reportes sin PDF asociado.

### 6. Seguridad con roles y permisos

La Entrega 3 debe demostrar control de acceso a nivel de base de datos mediante
roles y permisos. Los roles esperados son:

- `meditec_admin`: administracion completa.
- `meditec_generador`: creacion y actualizacion de reportes, PDFs y catalogos
  necesarios.
- `meditec_consulta`: consulta de reportes publicados o vistas autorizadas.

La seguridad debe estar relacionada con los requerimientos funcionales:

- RF-05: Registrar usuarios del sistema.
- RF-06: Asignar roles y permisos.
- RF-07: Registrar equipos autorizados para generacion o carga de PDFs.
- RF-14: Restringir la generacion y carga de PDFs a usuarios y equipos
  autorizados.

## Casos de prueba esperados

La Entrega 3 debe incluir casos de prueba que permitan validar:

- Creacion de datos de prueba.
- Ejecucion de consultas principales.
- Funcionamiento de vistas.
- Funcionamiento de funciones o procedimientos.
- Ejecucion de triggers.
- Restricciones de seguridad por rol.
- Regla de negocio que exige PDF para publicar un reporte.
- Registro de auditoria en acciones importantes.

## Avance web esperado

El cronograma indica que para Entrega 3 la aplicacion web debe estar cerca del
70%. En el contexto actual del proyecto, esto significa avanzar desde el login y
CRUD inicial hacia modulos principales como:

- Catalogos adicionales.
- Reportes.
- Consulta documental.
- Asociacion de PDF simulado o ruta de archivo.
- Uso de datos reales desde PostgreSQL.

## Archivos del repositorio relacionados

Los archivos que deben servir como base tecnica para esta entrega son:

- `sql/ddl/001_schema.sql`
- `sql/dml/001_seed.sql`
- `sql/views/001_reportes_resumen.sql`
- `sql/procedures/001_reportes.sql`
- `sql/triggers/001_reportes.sql`
- `sql/security/001_roles_permisos.sql`
- `docs/casos-prueba/casos-prueba-iniciales.md`
- `web/src/server.js`
- `web/public/app.js`

## Pendientes recomendados

- Crear un archivo de consultas principales para Entrega 3.
- Ampliar los datos de prueba con reportes, archivos PDF simulados y relaciones
  con tecnicos/proveedores.
- Completar triggers de auditoria y validacion de publicacion.
- Revisar permisos ejecutando los scripts en PostgreSQL.
- Documentar resultados de pruebas SQL.
- Registrar el avance en la bitacora IA cuando se realicen cambios.
