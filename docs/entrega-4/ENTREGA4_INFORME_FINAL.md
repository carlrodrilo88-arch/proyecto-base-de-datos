# Informe final

## Resumen ejecutivo

El Sistema de Gestión Documental Meditec centraliza catálogos operativos,
usuarios, equipos médicos y reportes de servicio. La aplicación web se conecta
a PostgreSQL, genera un código único, produce un PDF corporativo de una sola
hoja por equipo y conserva el archivo publicado con su historial y auditoría.

El ambiente final local fue validado sobre PostgreSQL 15.2, Node.js/Express y
PDFKit. Las 29 pruebas automatizadas y la verificación de esquema y privilegios
finalizaron correctamente.

## Problema y objetivos

El proceso anterior dependía de archivos dispersos y formatos preparados
manualmente. Esto dificultaba mantener catálogos consistentes, localizar
documentos y conservar evidencia de los servicios prestados.

El objetivo fue diseñar e implementar una base relacional normalizada y una
interfaz funcional que administrara datos, aplicara seguridad por roles y
generara reportes PDF identificables y consultables.

## Alcance final

La solución incluye:

- Autenticación y cambio obligatorio de contraseña temporal.
- Roles de administrador, generador de reportes y consulta.
- CRUD de instituciones, servicios, equipos médicos, técnicos, proveedores y
  usuarios según permisos.
- CRUD de reportes: creación individual o por lote, consulta, edición de
  borradores y anulación lógica por el administrador.
- Registro inactivo de computadoras como constancia académica, con edición y
  eliminación.
- Búsqueda de equipos por descripción, marca, modelo, bien o serie.
- Creación por lote de un reporte independiente por equipo.
- Revisión previa de datos y redacción sin persistencia.
- Generación, almacenamiento, publicación y consulta de PDF.
- Plantillas fijas para Teknor, Meditec y GT Medical.
- Asignación de técnicos a cada reporte (relación N:M `reporte_tecnico`).
- Filtros de reportes por código, estado, institución, servicio, técnico y
  rango de fechas.
- Auditoría con módulo de consulta para el administrador, historial de
  archivos, procedimientos, triggers y vistas.
- Carga depurada de instituciones, servicios y equipos desde información
  histórica de Excel, sin importar los reportes antiguos como documentos.

## Solucion implementada

La base contiene 13 tablas principales y asociativas, dos relaciones N:M
(`reporte_tecnico` y `reporte_proveedor`), restricciones explícitas, índices,
vistas, funciones, procedimientos y triggers. Los datos operativos están
normalizados: cada servicio y equipo médico pertenece a una institución, y el
reporte conserva una copia histórica de los datos del equipo.

La web utiliza HTML, CSS y JavaScript en el cliente, Express en el servidor y
consultas parametrizadas mediante `pg`. El PDF se genera con PDFKit. La empresa
prestadora se resuelve por un código estable y no por su nombre editable.

Conteos observados en la base local al 27/10/2026:

| Entidad | Registros |
| --- | ---: |
| Instituciones | 8 |
| Servicios solicitantes | 99 |
| Equipos médicos | 286 |
| Técnicos | 3 |
| Proveedores | 5 |
| Usuarios | 1 |
| Reportes | 3 |
| Archivos PDF | 3 |
| Constancias de computadoras | 2, todas inactivas |

## Seguridad y calidad

Las contraseñas funcionales usan bcrypt. Las sesiones se firman, expiran y se
transportan mediante cookies protegidas. La API valida entradas y roles, limita
intentos de acceso y no expone errores SQL crudos. La cuenta técnica
`meditec_web` tiene privilegios mínimos y no puede crear bases ni roles.

El repositorio separa DDL, DML, migraciones, procedimientos, triggers, vistas,
seguridad, consultas y pruebas. Los secretos y los PDF generados permanecen
fuera de Git.

## Pruebas y resultados

- `npm test`: 29 aprobadas, 0 fallidas.
- `npm run test:db`: esquema y permisos aprobados.
- `/api/health`: conexión operativa con PostgreSQL.
- Acceso administrativo y cambio obligatorio de contraseña verificados.
- Plantillas Teknor, Meditec y GT Medical renderizadas y revisadas visualmente.
- Los PDF normales contienen una sola página, firmas y recomendaciones, sin
  observaciones.
- Los textos que no caben de forma legible son rechazados en lugar de recortarse.
- La migración de una base existente conservó información y dejó las constancias
  de computadoras inactivas.

## Limitaciones

- La aplicación está publicada en
  https://meditec-web-production.up.railway.app. El 27/10/2026 se verificó
  `/api/health`, el acceso de administrador y la publicación de un PDF en el
  Bucket de Railway.
- La validación local fue sobre una base existente migrada a PostgreSQL 15.2.
  La instalación desde cero se ejecutó en Railway sobre PostgreSQL 18.6.
- El requisito general de 50 registros por cada tabla principal no se cumple en
  técnicos, proveedores, usuarios e instituciones. Sí existe volumen superior a
  50 en servicios y equipos médicos.

## Conclusiones

La solución demuestra integración entre diseño relacional, seguridad, lógica de
negocio y una interfaz web funcional. La generación automática elimina pasos
manuales, conserva la identidad de cada empresa y garantiza que un documento no
se publique sin un PDF activo.

El uso de migraciones no destructivas permitió actualizar una base antigua sin
reiniciar información. Las pruebas automatizadas y la cuenta de privilegios
mínimos reducen riesgos técnicos y dejan una base reproducible para continuar.

## Recomendaciones

1. Completar filtros web y asignación visual de técnicos.
2. Ejecutar y documentar una instalación limpia completa en PostgreSQL 15.
3. Desplegar PostgreSQL y almacenamiento S3 privado en Railway.
4. Incorporar respaldos periódicos y una política de retención.
5. Completar los datos mínimos exigidos únicamente con información ficticia o
   autorizada, sin inventar registros operativos reales.
6. Mantener las plantillas en una sola hoja y revisar visualmente cualquier
   cambio antes de publicarlo.

## Declaracion de integridad y uso de IA

Declaro que el proyecto fue desarrollado de manera individual por Carlos
Geovanni Lopez Rodriguez, carné 2690-23-2511. El uso de agentes de inteligencia
artificial se documenta en la bitácora consolidada del repositorio. Las
propuestas generadas fueron revisadas, probadas y adaptadas antes de incorporarse.

No se incluyen credenciales reales en archivos versionados. Los datos importados
se utilizaron para estructurar catálogos y no para presentar como propios
reportes históricos creados por terceros.
