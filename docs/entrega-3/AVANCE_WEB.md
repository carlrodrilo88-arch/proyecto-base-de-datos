# Avance Web - Entrega 3

## Proyecto

Sistema de Gestion Documental y Reportes para Meditec.

## Avance alcanzado

La aplicacion cubre aproximadamente el 70% solicitado para la Entrega 3. Integra
autenticacion, autorizacion por rol, catalogos principales y el ciclo de
borrador, vista previa, generacion, publicacion y consulta de reportes PDF.

## Modulos implementados

| Modulo | Funciones | Estado |
| --- | --- | --- |
| Autenticacion | Login bcrypt, sesion firmada en cookie y cierre de sesion | Implementado |
| Servicios | CRUD y relacion obligatoria con institucion | Implementado |
| Tecnicos | CRUD con especialidad y estado | Implementado |
| Instituciones | CRUD de datos de contacto | Implementado |
| Proveedores | CRUD, logotipo, pie de pagina e identidad del reporte | Implementado |
| Equipos medicos | CRUD de bien, marca, modelo, serie e institucion | Implementado |
| Reportes | Borrador, proveedor principal, equipo medico y datos tecnicos | Implementado |
| PDF | Vista previa, generacion final, hash, tamano y versiones | Implementado |
| Consulta | Codigo, estado, vista resumen y apertura del PDF | Implementado |

## Control de acceso

| Rol funcional | Lectura | Escritura |
| --- | --- | --- |
| administrador | Catalogos y reportes | Gestion y desactivacion |
| generador_reportes | Catalogos y reportes | Catalogos, borradores y publicacion |
| consulta | Reportes autorizados | Sin escritura |

La cuenta tecnica `meditec_web` tiene permisos minimos, no puede crear bases,
roles ni tablas, y no recibe acceso directo a la auditoria.

## Seguridad implementada

- Hashes bcrypt.
- Cookie `HttpOnly`, `SameSite=Strict` y `Secure` en produccion.
- Sesiones firmadas con una hora de vigencia.
- Helmet, limite de intentos y cuerpo JSON limitado.
- Consultas parametrizadas y validacion de entradas.
- Validacion conjunta de usuario, rol, computadora autorizada e institucion del
  equipo medico.

## Almacenamiento

En desarrollo los PDF se guardan en `web/storage/`, excluido de Git. En Railway
se usa un Bucket privado compatible con S3 configurado mediante variables de
entorno. PostgreSQL conserva clave del objeto, hash, tamano, estado y versiones.

## Pruebas

- Doce pruebas automatizadas de seguridad, PDF y almacenamiento aprobadas.
- Casos SQL, roles, triggers, procedimientos y flujo API documentados en
  `docs/casos-prueba/casos-prueba-iniciales.md`.
- `npm run test:db` aprobo esquema y permisos despues de las migraciones 002 y 003.
- El flujo integrado creo, previsualizo, publico y recupero un PDF valido como
  evidencia; resta la comprobacion visual del grupo en el navegador.

## Pendientes para Entrega 4

- Administracion web de usuarios y computadoras autorizadas.
- Edicion completa de borradores y asignacion visual de tecnicos.
- Carga administrada de logotipos en el Bucket.
- Filtros web adicionales por fecha, tecnico, servicio e institucion.
- Manual tecnico y manual de usuario.
- Instalacion desde cero y flujo completo de despliegue documentado.
