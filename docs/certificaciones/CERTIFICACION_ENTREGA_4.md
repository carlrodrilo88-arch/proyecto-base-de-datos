# Certificacion de calidad - Entrega 4

## Identificacion

| Campo | Valor |
| --- | --- |
| Proyecto | Sistema de Gestión Documental y Reportes Meditec |
| Entrega | Entrega 4: integración, documentación y defensa |
| Responsable | Carlos Geovanni Lopez Rodriguez |
| Carné | 2690-23-2511 |
| Modalidad | Proyecto individual |
| Fecha | 27/10/2026 |

## Declaracion

El responsable certifica que el código y los documentos incluidos fueron
revisados contra la rúbrica, que las pruebas marcadas como aprobadas fueron
ejecutadas y que los resultados pendientes se declaran expresamente. No se
certifican como terminados la defensa ni los casos manuales que aún no cuentan
con evidencia.

## Lista de verificacion

| Criterio | Estado | Evidencia u observación |
| --- | --- | --- |
| Estructura obligatoria | Cumple | `docs/`, `sql/`, `web/`, README e INSTALL presentes. |
| Estándares SQL | Cumple | Scripts separados, encabezados, integridad y migraciones no destructivas. |
| Estándares de aplicación | Cumple | Capas, errores controlados, validación y consultas parametrizadas. |
| Credenciales fuera del repositorio | Cumple | `.env` y almacenamiento ignorados. |
| Bitácora IA actualizada | Cumple | Bitácora consolidada existente; no se modifica en esta certificación. |
| Pruebas automatizadas | Cumple | 29 aprobadas, 0 fallidas. |
| Pruebas de base | Cumple | `npm run test:db` aprobado en PostgreSQL 15.2. |
| Plantillas PDF | Cumple | Tres formatos, una hoja, recomendaciones y firmas, sin observaciones. |
| Manual técnico | Cumple | `ENTREGA4_MANUAL_TECNICO.md`. |
| Manual de usuario | Cumple | `ENTREGA4_MANUAL_USUARIO.md`. |
| Informe y trazabilidad | Cumple | Informe final y matriz final incluidos. |
| Datos mínimos por tabla principal | Pendiente | No todas las tablas principales alcanzan 50 registros. |
| Instalación limpia final | Cumple | Ejecutada el 27/10/2026 en una base vacía de Railway (PostgreSQL 18.6), sin `001_seed.sql`. |
| Despliegue público | Cumple | https://meditec-web-production.up.railway.app; `/api/health` responde 200, el login de administrador funciona y un reporte publicado guardó su PDF en el Bucket `meditec-pdfs`. |
| Flujos manuales finales | Pendiente | Publicación real, segundo rol y lote requieren evidencia. |
| Defensa oral | Pendiente | Debe realizarla el responsable. |
| Tag `entrega-4` | Cumple | Creado el 27/10/2026; los puntos pendientes de esta lista se aceptan como limitaciones declaradas. |

## Firma

| Nombre | Carné | Firma |
| --- | --- | --- |
| Carlos Geovanni Lopez Rodriguez | 2690-23-2511 | ![Firma Carlos Geovanni Lopez Rodriguez](firma.jpg) |
