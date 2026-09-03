# Propuesta de Trabajo

## Introduccion

La empresa Meditec utiliza actualmente un sistema basado en macros de Excel y
Word para la creacion de reportes. Este enfoque limita la gestion documental,
dificulta la busqueda de informacion y reduce el control sobre los documentos
generados.

## Planteamiento del problema

Los reportes se generan de forma descentralizada, con poca trazabilidad y sin una
base de datos que permita consultar informacion historica de manera ordenada.
Esto provoca dependencia de archivos locales, riesgo de duplicidad, dificultad
para aplicar permisos y poca escalabilidad.

## Propuesta

Se propone desarrollar una aplicacion web conectada a una base de datos
PostgreSQL alojada en la nube. El sistema permitira registrar servicios
solicitantes,
proveedores, tecnicos e instituciones, generar o cargar reportes PDF con formato
corporativo y consultar cada documento mediante un ID unico.

## Objetivo general

Implementar un sistema web de gestion documental que centralice el registro,
almacenamiento y consulta de reportes PDF de Meditec mediante una base de datos
relacional PostgreSQL.

## Objetivos especificos

- Registrar informacion de servicios solicitantes, proveedores, tecnicos e instituciones.
- Generar identificadores unicos para cada reporte.
- Asociar archivos PDF a los reportes registrados.
- Controlar el acceso mediante usuarios, roles y equipos autorizados.
- Facilitar la busqueda de reportes desde dispositivos autorizados.
- Mantener trazabilidad de acciones relevantes mediante auditoria.

## Requerimientos de la empresa

- Solo dos computadoras podran generar o cargar nuevos reportes PDF.
- Los usuarios autorizados podran visualizar reportes desde la aplicacion web.
- La base de datos debe estar disponible en un servidor remoto.
- El sistema debe manejar roles y permisos para proteger la informacion.

## Beneficios esperados

- Centralizacion de la informacion documental.
- Reduccion de dependencia de macros de Excel y Word.
- Acceso remoto y controlado a reportes.
- Consultas mas rapidas por ID unico y filtros.
- Base preparada para crecimiento futuro.

## Alcance

El prototipo inicial cubrira el diseno de base de datos, scripts SQL,
administracion basica de catalogos, gestion de reportes, asociacion de archivos
PDF, busqueda por ID y control de acceso basico.

## Limitaciones

- La generacion automatica del PDF puede implementarse como carga manual si el
  tiempo del curso no permite replicar completamente el formato corporativo.
- El almacenamiento en nube puede simularse mediante una ruta de servidor si no
  se dispone de una cuenta de almacenamiento externa.
- La validacion de equipos autorizados puede representarse mediante un
  identificador registrado para fines del prototipo academico.
