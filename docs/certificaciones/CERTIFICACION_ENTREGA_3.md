# Certificacion de Calidad - Entrega 3

## Proyecto

Sistema de Gestion Documental y Reportes para Meditec.

## Declaracion

Se certifica que los componentes tecnicos de la Entrega 3 fueron implementados
y probados en PostgreSQL 18.4 y en la aplicacion Node.js/Express. El tag de la
entrega queda condicionado a la revision final del grupo.

## Checklist de calidad

| Criterio | Cumple | Observacion |
| --- | --- | --- |
| Datos de prueba | Si | Seed reejecutable con usuarios, catalogos, reportes, PDF y auditoria. |
| Consultas principales | Si | Dieciseis consultas ejecutadas correctamente. |
| Vista SQL | Si | `vw_reportes_resumen` validada con PDF activo. |
| Procedimientos | Si | Codigos, auditoria, publicacion y reemplazo de PDF. |
| Triggers | Si | Fecha, auditoria y validacion de publicacion. |
| Roles y permisos | Si | Roles academicos y usuario web de privilegios minimos. |
| Casos de prueba | Si | Evidencia SQL, API, cookies, permisos y PDF real documentada. |
| Seguridad web | Si | bcrypt, sesiones de una hora, cookie HttpOnly, rate limit y roles. |
| Catalogos web | Si | Servicios, tecnicos, instituciones, proveedores y equipos medicos. |
| Reportes web | Si | Borrador, proveedor principal, equipo medico, vista previa, generacion PDF, publicacion y consulta. |
| Avance web cercano al 70% | Si | Modulos principales integrados con PostgreSQL, almacenamiento local y preparacion para Railway Bucket. |
| Bitacora general | Si | Registros de apoyo IA conservados en la bitacora general. |
| Despliegue web | Pendiente | Requiere conectar la cuenta Railway y crear PostgreSQL y Bucket. |
| Tag Git | Pendiente | Crear despues de validar el despliegue y el commit final. |

## Limitaciones conocidas

- En desarrollo los PDF se almacenan localmente; el almacenamiento persistente
  en Railway Bucket requiere crear el recurso y configurar sus variables privadas.
- El cierre de sesion elimina la cookie, pero no mantiene una lista de revocacion
  de tokens antes de su vencimiento de una hora.
- Railway queda preparado conceptualmente, pero no desplegado en esta entrega.

## Integrantes

| Nombre | Carne | Firma |
| --- | --- | --- |
| Carlos Geovanni Lopez Rodriguez | 2690-23-2511 | ![Firma Carlos Geovanni Lopez Rodriguez](firma.jpg) |

## Fecha

30/09/2026
