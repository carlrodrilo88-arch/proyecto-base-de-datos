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

## Pruebas de seguridad web

### Ambiente de ejecucion

| Campo | Valor |
| --- | --- |
| Fecha | 29/09/2026 |
| Aplicacion | Node.js / Express |
| Base conectada | `meditec_reportes_pruebas` |
| PostgreSQL | 18.4 |
| Hash de contrasenas | bcrypt, costo 12 |
| Duracion de sesion | 1 hora |
| Resultado general | Aprobado |

### Pruebas unitarias

| ID | Caso | Resultado esperado | Resultado obtenido | Estado |
| --- | --- | --- | --- | --- |
| CP-WEB-01 | Verificar token valido | La sesion es aceptada y conserva usuario, rol y vencimiento | Token aceptado correctamente | Aprobado |
| CP-WEB-02 | Verificar token vencido | La sesion es rechazada | Token rechazado | Aprobado |
| CP-WEB-03 | Alterar la firma del token | La sesion es rechazada sin provocar error interno | Firma rechazada | Aprobado |
| CP-WEB-04 | Enviar token malformado | La sesion es rechazada sin provocar error interno | Token rechazado | Aprobado |
| CP-WEB-05 | Usar secreto corto en produccion | La aplicacion rechaza la configuracion | Configuracion rechazada | Aprobado |
| CP-WEB-06 | Comparar contrasena con bcrypt | Acepta la correcta y rechaza una diferente | Ambas condiciones fueron comprobadas | Aprobado |

Las seis pruebas se ejecutaron mediante `npm test` y finalizaron sin fallos.

### Pruebas integradas de API

| ID | Solicitud | Resultado esperado | HTTP obtenido | Estado |
| --- | --- | --- | ---: | --- |
| CP-WEB-07 | `GET /api/health` | Aplicacion y base disponibles | 200 | Aprobado |
| CP-WEB-08 | Login de administrador con credenciales validas | Sesion creada con bcrypt | 200 | Aprobado |
| CP-WEB-09 | Login de generador con credenciales validas | Sesion creada con bcrypt | 200 | Aprobado |
| CP-WEB-10 | Login de consulta con credenciales validas | Sesion creada con bcrypt | 200 | Aprobado |
| CP-WEB-11 | Login con contrasena incorrecta | Credenciales rechazadas | 401 | Aprobado |
| CP-WEB-12 | Usuario consulta solicita tecnicos | Lectura permitida | 200 | Aprobado |
| CP-WEB-13 | Usuario consulta intenta crear tecnico | Operacion bloqueada por rol | 403 | Aprobado |
| CP-WEB-14 | Generador intenta desactivar tecnico | Operacion bloqueada por rol | 403 | Aprobado |
| CP-WEB-15 | Generador envia nombre vacio | Entrada rechazada | 400 | Aprobado |
| CP-WEB-16 | Solicitud autenticada con token malformado | Sesion rechazada | 401 | Aprobado |

Las solicitudes de autorizacion se realizaron sin insertar, modificar o
desactivar registros reales. La aplicacion se detuvo al finalizar las pruebas.

### Auditoria de dependencias

La primera auditoria detecto tres vulnerabilidades moderadas transitivas en
`qs`, `body-parser` y Express. Se aplicaron actualizaciones compatibles mediante
`npm audit fix`, se repitieron las pruebas y la auditoria final reporto:

```text
found 0 vulnerabilities
```

### Controles implementados

- Hash bcrypt para las contrasenas academicas.
- Tokens firmados con fecha de emision y expiracion de una hora.
- Cookie de sesion `HttpOnly` y `SameSite=Strict`, con `Secure` en produccion.
- Comparacion segura de firmas con validacion previa de longitud.
- Autorizacion separada para administrador, generador y consulta.
- Limite de intentos sobre el endpoint de login.
- Cabeceras HTTP de seguridad mediante Helmet.
- Limite de 32 KB para solicitudes JSON.
- Validacion de identificadores, textos, correos, booleanos y longitudes.
- Respuestas `400`, `401`, `403` y `409` segun el tipo de rechazo.

### Pendientes de seguridad web

- Aplicar la validacion de equipos autorizados al implementar reportes y carga de
  PDFs.
- Definir almacenamiento persistente para los archivos PDF.
- Cambiar la credencial temporal de `meditec_test` y confirmar que no conserve
  los atributos `CREATEDB` ni `CREATEROLE`.

## Pruebas de privilegios minimos de la aplicacion

Se creo el usuario tecnico `meditec_web` con `LOGIN`, sin `CREATEDB`, sin
`CREATEROLE` y sin herencia de otros roles. Los permisos se aplicaron mediante
`sql/security/002_usuario_web.sql` y la aplicacion se conecto temporalmente con
esa cuenta.

| ID | Operacion como `meditec_web` | Resultado esperado | Resultado obtenido | Estado |
| --- | --- | --- | --- | --- |
| CP-DB-01 | Consultar usuarios y roles | Permitida para autenticar | Permitida | Aprobado |
| CP-DB-02 | Insertar servicio dentro de una transaccion con `ROLLBACK` | Permitida | Permitida y revertida | Aprobado |
| CP-DB-03 | Actualizar tecnico dentro de una transaccion con `ROLLBACK` | Permitida | Permitida y revertida | Aprobado |
| CP-DB-04 | Consultar auditoria directamente | Denegada | Denegada | Aprobado |
| CP-DB-05 | Crear una tabla | Denegada | Denegada | Aprobado |
| CP-DB-06 | Eliminar la tabla `tecnicos` | Denegada | Denegada | Aprobado |
| CP-DB-07 | Crear una base de datos | Denegada | Denegada | Aprobado |
| CP-DB-08 | Crear un rol PostgreSQL | Denegada | Denegada | Aprobado |

### Verificacion web con el usuario restringido

| Prueba | HTTP obtenido | Estado |
| --- | ---: | --- |
| Healthcheck conectado como `meditec_web` | 200 | Aprobado |
| Login de administrador | 200 | Aprobado |
| Login de generador | 200 | Aprobado |
| Login de consulta | 200 | Aprobado |
| Lectura de servicios por usuario consulta | 200 | Aprobado |
| Intento de escritura por usuario consulta | 403 | Aprobado |
| Validacion de entrada para generador | 400 | Aprobado |

Las operaciones de escritura usadas para comprobar privilegios se ejecutaron
dentro de transacciones revertidas o fueron rechazadas antes de llegar a la base.
No se conservaron registros de prueba.

## Pruebas de cookie protegida de sesion

El frontend dejo de almacenar tokens en `localStorage`. La autenticacion utiliza
una cookie que JavaScript no puede leer y que el navegador envia solo al mismo
sitio.

| ID | Caso | Resultado esperado | Resultado obtenido | Estado |
| --- | --- | --- | --- | --- |
| CP-COOKIE-01 | Login valido | Responde 200 y crea cookie de sesion | 200 y encabezado `Set-Cookie` | Aprobado |
| CP-COOKIE-02 | Revisar cuerpo del login | No expone el token en JSON | Campo `token` ausente | Aprobado |
| CP-COOKIE-03 | Revisar atributos locales | Incluye `HttpOnly` y `SameSite=Strict` | Ambos presentes | Aprobado |
| CP-COOKIE-04 | Revisar atributo de produccion | Agrega `Secure` cuando `NODE_ENV=production` | Comprobado mediante prueba unitaria | Aprobado |
| CP-COOKIE-05 | Consultar sesion sin cookie | Rechaza la solicitud | 401 | Aprobado |
| CP-COOKIE-06 | Consultar sesion con cookie valida | Devuelve el usuario actual | 200 | Aprobado |
| CP-COOKIE-07 | Consultar tecnicos con cookie valida | Permite la lectura | 200 | Aprobado |
| CP-COOKIE-08 | Usuario consulta intenta escribir | Bloquea por rol | 403 | Aprobado |
| CP-COOKIE-09 | Cerrar sesion | Responde 204 y expira la cookie | 204 y `Max-Age=0` | Aprobado |

La busqueda estatica confirmo que `public/app.js` ya no contiene referencias a
`localStorage`, encabezados `Authorization` ni `meditec_token`. Las nueve pruebas
unitarias finalizaron correctamente.

## Prueba integrada del flujo de reportes

| ID | Paso | Resultado esperado | Resultado obtenido | Estado |
| --- | --- | --- | --- | --- |
| CP-REP-01 | Consultar catalogos de reportes | Servicios con su institucion y equipos activos | HTTP 200 | Aprobado |
| CP-REP-02 | Crear con equipo inexistente | Rechazo sin insertar reporte | HTTP 403 | Aprobado |
| CP-REP-03 | Crear con `MEDI-GEN-001` | Reporte en borrador y codigo unico | HTTP 201 | Aprobado |
| CP-REP-04 | Asociar ruta de PDF | Version PDF activa registrada | HTTP 201 | Aprobado |
| CP-REP-05 | Publicar reporte con PDF | Estado actualizado a publicado | HTTP 200 | Aprobado |
| CP-REP-06 | Consultar por codigo | Retorna estado y URL del PDF | HTTP 200 | Aprobado |

La prueba genero temporalmente `REP-2026-000006`, comprobo su estado publicado y
la ruta `/pruebas/entrega3-codex.pdf`. Al finalizar se eliminaron exclusivamente
el reporte temporal y sus tres eventos de auditoria; el conteo residual fue cero.

## Casos para la migracion servicio-institucion y proveedor

Estos casos deben ejecutarse despues de aplicar
`sql/migrations/001_servicios_institucion_proveedor_identidad.sql`.

| ID | Caso | Resultado esperado | Estado |
| --- | --- | --- | --- |
| CP-MIG-01 | Consultar servicios existentes | Cada servicio conserva nombre e institucion obligatoria | Pendiente de ejecucion |
| CP-MIG-02 | Crear servicio sin institucion | Solicitud rechazada con HTTP 400 | Pendiente de ejecucion |
| CP-MIG-03 | Crear servicio con institucion activa | Registro creado con HTTP 201 | Pendiente de ejecucion |
| CP-MIG-04 | Editar proveedor | Conserva logotipo y texto de pie de pagina | Pendiente de ejecucion |
| CP-MIG-05 | Crear reporte seleccionando servicio | La vista obtiene la institucion desde el servicio | Pendiente de ejecucion |
| CP-MIG-06 | Asociar una ruta PDF simulada | No solicita peso manual y guarda `tamano_bytes` como nulo | Pendiente de ejecucion |

## Casos del flujo de vista previa y publicacion

| ID | Caso | Resultado esperado | Estado |
| --- | --- | --- | --- |
| CP-PDF-01 | Crear reporte sin proveedor principal | Solicitud rechazada | Cubierto por validacion obligatoria de API |
| CP-PDF-02 | Guardar datos tecnicos completos | Reporte creado como borrador | Aprobado: `REP-2026-000010` |
| CP-PDF-03 | Abrir vista previa | Respuesta PDF sin publicar ni crear version activa | Aprobado |
| CP-PDF-04 | Publicar borrador | PDF generado con hash y tamano automaticos | Aprobado |
| CP-PDF-05 | Abrir reporte publicado | Backend recupera el objeto local o del Bucket | Aprobado: HTTP 200, `%PDF`, 2441 bytes |
| CP-PDF-06 | Validar componentes aislados | Generacion, almacenamiento y rutas seguras | 3 pruebas automatizadas aprobadas |

## Casos del catalogo de equipos medicos

| ID | Caso | Resultado esperado | Estado |
| --- | --- | --- | --- |
| CP-EQM-01 | Crear equipo sin institucion | Solicitud rechazada | Cubierto por validacion obligatoria de API |
| CP-EQM-02 | Crear equipo con bien, marca y modelo | Equipo registrado en su institucion | Aprobado mediante seed y consulta API |
| CP-EQM-03 | Elegir servicio en reporte | Solo muestra equipos de la misma institucion | Aprobado en flujo integrado |
| CP-EQM-04 | Crear reporte con equipo de otra institucion | Backend rechaza la operacion | Cubierto por JOIN de institucion en API |
| CP-EQM-05 | Crear reporte valido | Copia automaticamente datos del equipo | Aprobado con `REP-2026-000010` |

### Evidencia integrada final

El 01/10/2026 se ejecuto `npm run test:db` con el usuario tecnico y se confirmo
la existencia de `equipos_medicos`, las columnas de proveedor y equipo en
`reportes`, la vista resumen y los permisos de lectura/escritura requeridos.
La API respondio correctamente al healthcheck y login, encontro cinco servicios,
tres proveedores y cuatro equipos medicos. El reporte `REP-2026-000010` paso de
borrador a publicado, quedo almacenado como
`reportes/2026/REP-2026-000010.pdf` y fue recuperado con HTTP 200, tipo
`application/pdf`, firma `%PDF` y 2441 bytes.

## Casos de administracion de usuarios y contrasena temporal

Estos casos requieren aplicar primero
`sql/migrations/004_administracion_usuarios.sql`.

| ID | Caso | Resultado esperado | Estado |
| --- | --- | --- | --- |
| CP-USR-01 | Administrador crea un usuario | Guarda hash bcrypt, rol y cambio obligatorio | Pendiente de validacion integrada |
| CP-USR-02 | Usuario consulta abre administracion | API responde 403 y no muestra el modulo | Pendiente de validacion integrada |
| CP-USR-03 | Usuario entra con contrasena temporal | Solo permite sesion y cambio de contrasena | Pendiente de validacion integrada |
| CP-USR-04 | Usuario cambia su contrasena | Renueva sesion y habilita los modulos autorizados | Pendiente de validacion integrada |
| CP-USR-05 | Administrador restablece una contrasena | Nuevo hash y bandera de cambio obligatorio | Pendiente de validacion integrada |
| CP-USR-06 | Administrador intenta desactivarse o cambiar su rol | Operacion rechazada | Pendiente de validacion integrada |

La politica de longitud y combinacion de caracteres tiene dos pruebas unitarias
aprobadas. Ninguna ruta devuelve `password_hash` ni contrasenas en texto plano.

## Casos de busqueda de equipos y reportes por lote

| ID | Caso | Resultado esperado | Estado |
| --- | --- | --- | --- |
| CP-LOT-01 | Buscar parte del nombre, bien o serie | Muestra hasta diez coincidencias de la institucion | Cubierto por interfaz; validacion visual pendiente |
| CP-LOT-02 | Agregar dos veces el mismo equipo | No permite duplicarlo en la lista ni en la API | Prueba automatizada aprobada |
| CP-LOT-03 | Seleccionar varios equipos iguales | Crea un borrador independiente por equipo | Implementado; validacion integrada pendiente |
| CP-LOT-04 | Reutilizar especificaciones | Copia el contenido comun en todos los borradores | Implementado; validacion integrada pendiente |
| CP-LOT-05 | Incluir equipo de otra institucion | Revierte el lote completo sin reportes parciales | Garantizado por transaccion; validacion integrada pendiente |
| CP-LOT-06 | Crear mas de 50 en un lote | Rechaza la solicitud | Prueba automatizada aprobada |

Los reportes mantienen codigos, equipos, numeros de bien, numeros de serie, PDF
y estados independientes. La publicacion se realiza despues de revisar cada
vista previa.
