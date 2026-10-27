# Sistema de Gestion Documental Meditec

**Responsable:** Carlos Geovanni Lopez Rodriguez — 2690-23-2511

**SGBD:** PostgreSQL 15.2 (compatible con PostgreSQL 14 o superior)

**Aplicación:** Node.js, Express, HTML, CSS, JavaScript y PDFKit

Proyecto academico para la implementacion de una aplicacion web conectada a
PostgreSQL, orientada a centralizar la generacion, almacenamiento y consulta de
reportes PDF de la empresa Meditec.

## Objetivo general

Desarrollar un sistema web que permita registrar informacion operativa de
servicios solicitantes, proveedores, tecnicos e instituciones, generar reportes PDF con formato
corporativo, almacenarlos de forma centralizada y consultarlos mediante un ID
unico desde usuarios autorizados.

## Alcance inicial

- Registro y mantenimiento de servicios solicitantes, proveedores, tecnicos e instituciones.
- Registro de usuarios, roles y permisos.
- Creacion de reportes con datos estructurados.
- Asociacion de cada reporte con un archivo PDF almacenado en servidor o nube.
- Consulta de reportes por ID unico.
- Registro inactivo de computadoras como constancia del proyecto.
- Base PostgreSQL local y preparacion para despliegue remoto.

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
  queries/          Consultas demostrativas
  reset/            Reinicio controlado de ambientes de prueba
  tests/            Validaciones SQL automatizadas
web/                Codigo de la aplicacion web
```

## Documentos guia

- [Plan del proyecto](docs/plan-proyecto.md)
- [Modelo de datos](docs/modelo-datos.md)
- [DDL inicial](sql/ddl/001_schema.sql)

## Implementacion tecnica

- Base de datos: PostgreSQL.
- Backend: Node.js y Express.
- Frontend: HTML, CSS y JavaScript sin framework.
- PDF: PDFKit con plantillas Teknor, Meditec y GT Medical de una sola hoja.
- Almacenamiento de PDFs: carpeta controlada en servidor, bucket compatible con
  S3 o servicio de almacenamiento en nube.

## Flujo principal

1. Un usuario autenticado ingresa al sistema.
2. Si su rol esta autorizado, registra y revisa un reporte.
3. El sistema crea un ID unico para el reporte.
4. Se asocia una ruta de PDF y la base conserva el historial de versiones.
5. El reporte solo puede publicarse cuando existe un PDF activo.
6. Los usuarios autorizados consultan reportes por codigo y estado; las consultas
   SQL tambien contemplan servicio, institucion, tecnico y fecha.

## Instalacion y pruebas

Consulte [INSTALL.md](INSTALL.md) para la instalación inicial y las migraciones.

```powershell
cd web
npm install
npm run test:db
npm test
npm start
```

La aplicación queda disponible en `http://localhost:3000` y el estado de la base
en `http://localhost:3000/api/health`.

## Documentacion final

- [Manual de usuario](docs/entrega-4/ENTREGA4_MANUAL_USUARIO.md)
- [Manual técnico](docs/entrega-4/ENTREGA4_MANUAL_TECNICO.md)
- [Informe final](docs/entrega-4/ENTREGA4_INFORME_FINAL.md)
- [Matriz de trazabilidad](docs/entrega-4/ENTREGA4_MATRIZ_TRAZABILIDAD.md)
- [Casos de prueba](docs/casos-prueba/CASOS_PRUEBA_ENTREGA4.md)
- [Certificación](docs/certificaciones/CERTIFICACION_ENTREGA_4.md)
- [Plantillas de reportes](docs/entrega-4/PLANTILLAS_REPORTES.md)

## Estado de cierre

La aplicación local, PostgreSQL, los permisos y las pruebas automatizadas están
validados. El despliegue público, la instalación limpia final, algunos casos
manuales, los datos mínimos por cada tabla principal, la defensa y el tag
`entrega-4` permanecen pendientes y están declarados en el informe final.
