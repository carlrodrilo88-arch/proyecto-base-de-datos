# Datos de Prueba y Consultas - Entrega 3

## Objetivo

Los datos y consultas de este apartado permiten demostrar las relaciones del
modelo de Meditec y preparar las pruebas de vistas, procedimientos, triggers y
roles requeridas en la Entrega 3.

## Datos incluidos

El archivo `sql/dml/001_seed.sql` crea datos ficticios para:

- Los roles administrador, generador y consulta.
- Un usuario de prueba por cada rol.
- Dos equipos autorizados.
- Servicios solicitantes, instituciones, tecnicos y proveedores.
- Tres reportes con estados publicado, borrador y anulado.
- Relaciones entre reportes, tecnicos y proveedores.
- Un PDF simulado asociado al reporte publicado.
- Eventos iniciales de auditoria.

El reporte publicado se crea primero como borrador, recibe su PDF y finalmente
cambia a publicado. Este orden respeta la regla de negocio que se implementara
mediante trigger: no se puede publicar un reporte sin un PDF activo.

## Usuarios de prueba

| Rol | Correo | Contrasena |
| --- | --- | --- |
| Administrador | `admin@meditec.local` | `admin123` |
| Generador | `generador@meditec.local` | `generador123` |
| Consulta | `consulta@meditec.local` | `consulta123` |

Estas credenciales usan el mecanismo de autenticacion disponible actualmente.
No deben utilizarse en un entorno de produccion.

## Codigos de reporte

| Codigo | Estado esperado | PDF activo |
| --- | --- | --- |
| `REP-2026-000001` | publicado | Si |
| `REP-2026-000002` | borrador | No |
| `REP-2026-000003` | anulado | No |

## Orden de ejecucion para este apartado

```text
sql/ddl/001_schema.sql
sql/procedures/001_reportes.sql
sql/triggers/001_reportes.sql
sql/dml/001_seed.sql
sql/views/001_reportes_resumen.sql
sql/security/001_roles_permisos.sql
sql/security/002_usuario_web.sql
sql/queries/001_consultas_entrega3.sql
```

Los procedimientos y triggers se instalan antes del seed para que la carga de
datos tambien ejercite las reglas de publicacion y auditoria. Las consultas
requieren que la vista resumen ya exista.

## Consultas incluidas

El archivo `sql/queries/001_consultas_entrega3.sql` contiene consultas para:

- Codigo unico.
- Servicio solicitante.
- Institucion.
- Tecnico.
- Proveedor.
- Rango de fechas.
- Estado.
- Reportes con PDF.
- Reportes sin PDF.
- Vista resumen.
- Eventos de auditoria.
- Conteos por estado e institucion.
- Relaciones con tecnicos y proveedores.
- Historial de versiones PDF, distinguiendo el unico archivo activo.

Los valores incluidos son demostrativos y pueden reemplazarse durante las
pruebas o la exposicion.

## Reejecucion

El seed identifica los registros por valores estables como correo, NIT,
identificador de equipo y codigo de reporte. Ejecutarlo nuevamente no debe
duplicar los datos definidos por el propio archivo.

## Resultado esperado

Despues de ejecutar los archivos deben existir tres reportes de prueba. Las
consultas deben demostrar tanto resultados positivos como el caso de un reporte
sin PDF. La ejecucion definitiva debe validarse en PostgreSQL y documentarse en
los casos de prueba de la entrega.
