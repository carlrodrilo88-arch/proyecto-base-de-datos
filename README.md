# Sistema de Gestion Documental Meditec

Proyecto academico para la implementacion de una aplicacion web conectada a
PostgreSQL, orientada a centralizar la generacion, almacenamiento y consulta de
reportes PDF de la empresa Meditec.

## Objetivo general

Desarrollar un sistema web que permita registrar informacion operativa de
clientes, proveedores, tecnicos e instituciones, generar reportes PDF con formato
corporativo, almacenarlos de forma centralizada y consultarlos mediante un ID
unico desde dispositivos autorizados.

## Alcance inicial

- Registro y mantenimiento de clientes, proveedores, tecnicos e instituciones.
- Registro de usuarios, roles y permisos.
- Creacion de reportes con datos estructurados.
- Asociacion de cada reporte con un archivo PDF almacenado en servidor o nube.
- Consulta de reportes por ID unico.
- Restriccion para que solo dos equipos autorizados puedan generar o cargar PDF.
- Base de datos PostgreSQL accesible remotamente.

## Estructura del repositorio

```text
docs/
  entrega-1/        Propuesta, alcance y requisitos
  entrega-2/        Modelo entidad-relacion, modelo relacional y diccionario
  entrega-3/        Consultas, vistas, procedimientos, triggers y seguridad
  entrega-4/        Manual, pruebas, conclusiones y material final
  diagramas/        Diagramas Mermaid o exportados a imagen/PDF
  casos-prueba/     Casos de prueba funcionales
  certificaciones/  Evidencias de instalacion, ejecucion o despliegue
sql/
  ddl/              Creacion de tablas, llaves e indices
  dml/              Datos de prueba
  views/            Vistas SQL
  procedures/       Funciones y procedimientos almacenados
  triggers/         Triggers de auditoria o validacion
  security/         Roles, permisos y politicas
web/                Codigo de la aplicacion web
```

## Documentos guia

- [Plan del proyecto](docs/plan-proyecto.md)
- [Modelo de datos](docs/modelo-datos.md)
- [DDL inicial](sql/ddl/001_schema.sql)

## Propuesta tecnica

- Base de datos: PostgreSQL.
- Backend sugerido: Node.js/Express, Python/FastAPI o Java/Spring Boot.
- Frontend sugerido: React, Vue o HTML/CSS/JS segun el alcance de la clase.
- Almacenamiento de PDFs: carpeta controlada en servidor, bucket compatible con
  S3 o servicio de almacenamiento en nube.

## Flujo principal

1. Un usuario autenticado ingresa al sistema.
2. Si su rol y equipo estan autorizados, registra o genera un reporte.
3. El sistema crea un ID unico para el reporte.
4. El PDF se guarda en el almacenamiento configurado.
5. Los usuarios autorizados consultan el reporte por ID, cliente, institucion o
   fecha.
