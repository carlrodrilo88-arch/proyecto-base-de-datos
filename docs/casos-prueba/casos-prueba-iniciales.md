# Casos de Prueba Iniciales

| ID | Caso | Entrada | Resultado esperado |
| --- | --- | --- | --- |
| CP-01 | Registrar cliente | Datos validos de cliente | Cliente guardado correctamente |
| CP-02 | Registrar tecnico | Datos validos de tecnico | Tecnico guardado correctamente |
| CP-03 | Crear reporte | Cliente, fecha, titulo y usuario valido | Reporte creado con codigo unico |
| CP-04 | Publicar sin PDF | Reporte sin archivo en `archivos_pdf` | La base de datos rechaza el cambio |
| CP-05 | Consultar por ID | Codigo de reporte existente | Se muestra el resumen del reporte |
| CP-06 | Consultar ID inexistente | Codigo no registrado | No se muestran resultados |
| CP-07 | Equipo no autorizado | Identificador no registrado | No permite carga/generacion de PDF |
| CP-08 | Usuario consulta | Usuario con rol consulta | Puede visualizar, no puede modificar |

## Casos SQL detallados de Entrega 3

### Ambiente de ejecucion

| Campo | Valor |
| --- | --- |
| Fecha | 29/09/2026 |
| PostgreSQL | 18.4 |
| Base utilizada | `meditec_reportes_pruebas` |
| Usuario de prueba | `meditec_test` |
| Ambiente | Base local exclusiva para pruebas |
| Resultado general | Aprobado con un caso pendiente |

| ID | Procedimiento | Resultado esperado | Resultado obtenido | Estado |
| --- | --- | --- | --- | --- |
| CP-SQL-01 | Ejecutar el DDL sobre una base con el esquema existente | La ejecucion se detiene y no elimina informacion | No se ejecuto sobre datos existentes para evitar una operacion innecesaria; queda pendiente comprobar la detencion transaccional | Pendiente |
| CP-SQL-02 | Ejecutar `sql/reset/001_reset_schema.sql` en la base descartable | Se eliminan intencionalmente los objetos de Meditec | El reset finalizo correctamente; los objetos inexistentes produjeron avisos y no errores | Aprobado |
| CP-SQL-03 | Ejecutar dos veces `generar_codigo_reporte()` | Se obtienen codigos diferentes | Las dos llamadas generaron valores diferentes | Aprobado |
| CP-SQL-04 | Publicar `REP-2026-000002` sin PDF activo | El trigger rechaza la operacion | PostgreSQL rechazo el cambio de estado | Aprobado |
| CP-SQL-05 | Llamar `reemplazar_pdf_reporte` | Se conserva el anterior y existe exactamente un PDF activo | Se comprobaron al menos dos versiones y exactamente una activa; la prueba termino con `ROLLBACK` | Aprobado |
| CP-SQL-06 | Crear y actualizar reportes con triggers instalados | Se crean eventos automaticos de auditoria | Se registraron eventos `CREAR` y `ACTUALIZAR`, ademas de la carga de PDF | Aprobado |
| CP-SQL-07 | Consultar privilegios de `meditec_consulta` | Puede leer la vista y no modificar reportes | `has_table_privilege` confirmo lectura de la vista y ausencia de permiso de actualizacion | Aprobado |
| CP-SQL-08 | Ejecutar nuevamente el seed | No se duplican los datos administrados por el seed | La segunda ejecucion produjo cero inserciones y cero actualizaciones; los conteos permanecieron iguales | Aprobado |
| CP-SQL-09 | Ejecutar `EXPLAIN` para codigo, estado y fecha | Se obtienen planes validos y se identifican los indices utilizados | PostgreSQL utilizo `reportes_codigo_reporte_key` e `idx_reportes_estado` | Aprobado |

Los controles automatizables se encuentran en
`sql/tests/001_validacion_entrega3.sql`.

### Validacion de reejecucion del seed

| Entidad | Antes | Despues | Resultado |
| --- | ---: | ---: | --- |
| Roles | 3 | 3 | Sin duplicados |
| Usuarios | 3 | 3 | Sin duplicados |
| Reportes | 3 | 3 | Sin duplicados |
| Archivos PDF | 1 | 1 | Sin duplicados |
| Eventos de auditoria | 8 | 8 | Sin duplicados |

### Planes de ejecucion

| Consulta | Indice utilizado | Resultado |
| --- | --- | --- |
| Reporte por codigo | `reportes_codigo_reporte_key` | Aprobado |
| Reportes por estado | `idx_reportes_estado` | Aprobado |
| Estado y rango de fechas | `idx_reportes_estado` con filtro de fecha | Aprobado |

La busqueda por codigo confirma que la restriccion `UNIQUE` ya proporciona el
indice necesario. El indice independiente que existia sobre la misma columna era
redundante.

### Incidencia corregida durante las pruebas

La primera ejecucion de `sql/tests/001_validacion_entrega3.sql` fallo porque
PostgreSQL no permite utilizar una subconsulta directamente como argumento de
`CALL`. El script se corrigio obteniendo primero los identificadores en variables
PL/pgSQL. Despues de la correccion se ejecuto completamente y termino con
`ROLLBACK`.

## Conclusion de las pruebas SQL

La implementacion SQL de Entrega 3 fue validada en PostgreSQL 18.4. La creacion
del esquema, procedimientos, triggers, datos, vista, permisos, consultas y casos
negativos se ejecuto correctamente. El seed pudo repetirse sin modificar los
conteos. La base utilizada fue exclusiva para pruebas y no se modificaron otras
bases del servidor.
