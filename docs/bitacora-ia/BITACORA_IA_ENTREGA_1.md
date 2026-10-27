# Bitacora consolidada de Agentes IA

## Registro 21

| Campo | Detalle |
| ----- | ------- |
| Fecha | 27/10/2026 |
| Herramienta | Claude Code / Claude Opus 5.5 |
| Objetivo | Adaptar el historial de reportes en Excel (`Libro1.xlsx`) al modelo de datos para cargar instituciones, servicios solicitantes y equipos medicos con su numero de bien, marca, modelo y serie. |
| Prompt utilizado | Se solicito exportar del Excel las instituciones, servicios, equipos, modelos y numeros de bien para agregarlos a la base de datos, tomando el contexto del proyecto. Ante numeros de bien repetidos con datos distintos, el responsable indico que corresponden al mismo equipo. |
| Resultado obtenido | Se relacionaron las columnas del Excel con `instituciones`, `servicios_solicitantes` y `equipos_medicos`. Se unificaron las variantes de escritura de cada institucion (por ejemplo, cuatro formas de Hospital Regional de Occidente) y de los servicios que solo diferian en mayusculas o acentos. Se dejo un solo equipo por numero de bien, conservando la variante con datos mas completos, y los equipos sin numero de bien se guardaron con ese campo vacio. Se omitieron las filas sin institucion y una fila con cliente "13", cuyo bien ya estaba registrado en el IGSS. Se genero `sql/dml/003_carga_excel_equipos.sql`, con encabezado de archivo, autor, descripcion y dependencias, que se puede ejecutar varias veces sin duplicar (`ON CONFLICT` y `NOT EXISTS`), y se agrego al orden de instalacion en `INSTALL.md`. |
| Validacion del grupo | Proyecto individual validado por Carlos. El script se probo primero dentro de una transaccion revertida: inserto 6 instituciones, 96 servicios y 285 equipos, y una segunda ejecucion no agrego registros. Con autorizacion del responsable se ejecuto sobre `meditec_reportes`, que paso de 2 a 8 instituciones, de 3 a 99 servicios y de 1 a 286 equipos, sin modificar los datos existentes. Se verifico con una conexion nueva el conteo por institucion. Queda pendiente confirmar si los bienes `HRO-N5-68-004A0626` y `HRO-N2-30-00450E4B`, con 12 y 8 series distintas, son un solo equipo o varios. |
| Estandares aplicados | R6, S1, S2, S3, S4, S7, S8, D1 y D4. |
| Responsable | Carlos Geovanni Lopez Rodriguez / 2690-23-2511 |

## Registro 20

| Campo | Detalle |
| ----- | ------- |
| Fecha | 27/10/2026 |
| Herramienta | OpenCode / GPT-5.6 Sol; skills `frontend-design`, `browser-automation` y `pdf` |
| Objetivo | Cerrar el flujo web de reportes para la Entrega 4, mejorar la interfaz, adaptar las plantillas corporativas a una sola hoja y validar la integracion con PostgreSQL 15. |
| Prompt utilizado | Se solicito mejorar el diseno de la pagina conservando la funcionalidad; retirar la carga de logotipos porque cada empresa usa una plantilla fija; registrar las computadoras solamente como constancia inactiva; buscar equipos medicos por marca, numero de bien o serie; revisar datos y redaccion antes de crear; crear y publicar el PDF en una sola accion; reproducir la distribucion de las capturas de Teknor, Meditec y GT Medical; conservar recomendaciones y retirar observaciones de los reportes nuevos. |
| Resultado obtenido | Se renovo la interfaz responsive con identidad visual Meditec y foco accesible; se retiraron los logotipos editables; se agrego el modulo administrativo de constancia de computadoras, siempre inactivas y sin edicion; se preparo la migracion 006 y se actualizaron permisos minimos; se incorporo una revision previa sin persistencia con advertencias de espacios, palabras repetidas, mayusculas, puntuacion y texto insuficiente; la confirmacion crea, almacena y publica un PDF por equipo; se corrigio la instalacion de la secuencia de codigos para bases antiguas; y las tres plantillas PDF quedaron en una sola hoja, con especificaciones tecnicas, recomendaciones y firmas, sin el apartado de observaciones. Si el texto no cabe con un tamano legible, la publicacion se rechaza en lugar de recortar informacion. |
| Validacion del grupo | Proyecto individual validado por Carlos. PostgreSQL 15 quedo actualizado y `npm run test:db` confirmo esquema y privilegios de `meditec_web`; `/api/health` respondio correctamente; las 27 pruebas automatizadas finalizaron sin fallos; se verifico el acceso administrativo con cambio obligatorio de contrasena; y se renderizaron visualmente las plantillas Teknor, Meditec y GT Medical, confirmando una pagina, identidad diferenciada, ausencia de observaciones y espacio de firmas sin superposiciones. No se crearon reportes reales durante las pruebas visuales. |
| Estandares aplicados | R1, R6, R7, S1, S2, S3, S4, S7, S8, A1, A2, A3, A4, A5, A6, D1 y D4. |
| Responsable | Carlos Geovanni Lopez Rodriguez / 2690-23-2511 |

## Registro 19

| Campo | Detalle |
| ----- | ------- |
| Fecha | 12/10/2026 |
| Herramienta | ChatGPT / OpenCode |
| Objetivo | Evaluar los ajustes necesarios en la base de datos para mejorar la coherencia del flujo de reportes. |
| Prompt utilizado | ¿Es necesario modificar la base de datos para mejorar la fluidez del proyecto, considerando una empresa prestadora por reporte, sus plantillas, los datos del equipo, las observaciones y las firmas manuales? |
| Resultado obtenido | Se determino que no es necesario reconstruir la base ni aplicar optimizaciones sin evidencia de lentitud. Con autorizacion del responsable se preparo la migracion 005 para agregar codigo_plantilla, renombrar descripcion como observaciones conservando su contenido y registrar las empresas ausentes. Se actualizaron aplicacion, scripts, diccionario, instalacion y exclusiones de Git. |
| Validacion del grupo | La propuesta fue autorizada antes de implementarla. Se aprobaron 27 pruebas automatizadas. En PostgreSQL 18 aislado se comprobaron conservacion de reportes y referencias PDF, reejecucion sin duplicados, instalacion desde cero y permisos restringidos. En navegador se crearon, publicaron y recuperaron PDF de las tres empresas contra esa base temporal. Aplicar la migracion a meditec_reportes_pruebas permanece pendiente de DATABASE_ADMIN_URL con la cuenta propietaria; no se modificaron sus datos. |
| Estandares aplicados | R1, R6, S1, S2, S3, S4, S7, S8, D1 y D4. |
| Responsable | Carlos Geovanni Lopez Rodriguez / 2690-23-2511 |

## Registro 18

| Campo | Detalle |
| ----- | ------- |
| Fecha | 01/10/2026 |
| Herramienta | ChatGPT / Codex |
| Objetivo | Consolidar el estado de la Entrega 3 y dejar un punto seguro para continuar el proyecto posteriormente |
| Prompt utilizado | Se solicito registrar el estado alcanzado despues de implementar seguridad, administracion de usuarios, cambio obligatorio de contrasena, catalogos, busqueda de equipos y generacion de reportes individuales por lote, conservando las decisiones y pendientes para una sesion futura |
| Resultado obtenido | La base local `meditec_reportes_pruebas` quedo actualizada hasta la migracion 004; la web administra usuarios por rol y genera un borrador y PDF independiente por cada equipo seleccionado. Se aprobaron 17 pruebas automatizadas y `npm run test:db`; el commit `66c0530` se publico en `main` y el tag anotado `entrega-3` se publico en GitHub. Por decision del responsable no se agregaron los 50 registros por tabla principal. El estado tecnico y los pasos de reanudacion quedaron documentados en `docs/entrega-3/ESTADO_CONTINUACION.md` |
| Validacion del grupo | Al reanudar, revisar el documento de continuacion, no ejecutar el reset sobre datos que deban conservarse, comprobar visualmente usuarios y reportes por lote, configurar Railway y decidir si se completaran los 50 registros antes de una version posterior |
| Estandares aplicados | R2, R3, R5, S2, S3, S4, S7, S8, D1, D2, D4. Codigos tomados de los estandares definidos en el PDF del proyecto |
| Responsable | Carlos Geovanni Lopez Rodriguez / 2690-23-2511 |

## Registro 16

| Campo | Detalle |
| ----- | ------- |
| Fecha | 30/09/2026 |
| Herramienta | ChatGPT / Codex |
| Objetivo | Revisar y fortalecer la seguridad de PostgreSQL y de la aplicacion web |
| Prompt utilizado | Analiza la seguridad actual del proyecto Meditec y aplica los controles necesarios para proteger contrasenas, sesiones, rutas, roles y permisos. Verifica que el usuario tecnico de PostgreSQL tenga solamente los privilegios necesarios y documenta las pruebas realizadas, sin crear el commit todavia |
| Resultado obtenido | Se reemplazaron contrasenas almacenadas de forma insegura por hashes bcrypt; se implementaron sesiones firmadas con expiracion, cookies HttpOnly y SameSite Strict, cierre de sesion, Helmet, limite de intentos de acceso, validacion de entradas y autorizacion por rol. Tambien se creo el usuario tecnico `meditec_web` sin privilegios CREATEDB ni CREATEROLE, se limitaron sus permisos sobre tablas, secuencias, funciones y procedimientos, y se realizaron pruebas unitarias e integradas de autenticacion, autorizacion y privilegios minimos |
| Validacion del grupo | El grupo debe comprobar que las credenciales reales permanezcan fuera del repositorio, ejecutar nuevamente los scripts de permisos despues de cada migracion y verificar los accesos de administrador, generador de reportes y consulta antes del despliegue |
| Estandares aplicados | S2, S3, S4, S7, S8, D1, D4. Codigos tomados de los estandares definidos en el PDF del proyecto |
| Responsable | Carlos Geovanni Lopez Rodriguez / 2690-23-2511 |

## Registro 17

| Campo | Detalle |
| ----- | ------- |
| Fecha | 29/09/2026 |
| Herramienta | ChatGPT / Codex |
| Objetivo | Evitar que la instalacion normal del DDL elimine las tablas y los datos existentes |
| Prompt utilizado | Revisa si el DDL del proyecto elimina todas las tablas al ejecutarse y determina el riesgo para una base con informacion. Separa cualquier operacion destructiva de la instalacion normal, conserva un procedimiento explicito para reiniciar unicamente ambientes de prueba y actualiza la documentacion correspondiente |
| Resultado obtenido | Se confirmo que las instrucciones `DROP TABLE` podian eliminar la estructura y la informacion al volver a ejecutar el DDL. Se retiraron esas instrucciones de `sql/ddl/001_schema.sql` y se trasladaron a `sql/reset/001_reset_schema.sql`, incluyendo advertencias sobre su caracter destructivo. El DDL quedo destinado exclusivamente a instalaciones nuevas, mientras que los cambios sobre bases existentes se realizan mediante migraciones versionadas que conservan la informacion |
| Validacion del grupo | El grupo debe utilizar el script de reinicio unicamente en bases de prueba, revisar siempre la base seleccionada antes de ejecutarlo y aplicar las migraciones versionadas cuando ya existan datos |
| Estandares aplicados | S1, S2, S3, S4, S7, D1, D4. Codigos tomados de los estandares definidos en el PDF del proyecto |
| Responsable | Carlos Geovanni Lopez Rodriguez / 2690-23-2511 |

## Registro 15

| Campo | Detalle |
| ----- | ------- |
| Fecha | 01/10/2026 |
| Herramienta | ChatGPT / Codex |
| Objetivo | Separar las computadoras autorizadas de los equipos medicos incluidos en los reportes |
| Prompt utilizado | Se aclaro que los equipos deben registrarse previamente y que al elaborar el PDF solo debe seleccionarse el equipo, conservando numero de bien, marca y modelo como datos del catalogo |
| Resultado obtenido | Se creo `equipos_medicos` relacionado con instituciones, con nombre, bien, marca, modelo y serie; se agrego CRUD web, filtrado por la institucion del servicio, relacion con reportes y copia historica automatica. `equipos_autorizados` quedo reservado al control de seguridad mediante `AUTHORIZED_DEVICE_ID`. Se agrego una migracion no destructiva, permisos, seed, documentacion y casos de prueba. Las doce pruebas automatizadas continuaron aprobadas |
| Validacion del grupo | Ejecutar migraciones 002 y 003, reaplicar permisos y validar los cinco casos CP-EQM antes del commit, tag o despliegue en Railway |
| Estandares aplicados | S2, S3, S4, S7, S8, D1, D3, D4. Codigos tomados de los estandares definidos en el PDF del proyecto |
| Responsable | Carlos Geovanni Lopez Rodriguez / 2690-23-2511 |

## Registro 14

| Campo | Detalle |
| ----- | ------- |
| Fecha | 01/10/2026 |
| Herramienta | ChatGPT / Codex |
| Objetivo | Corregir el flujo de reportes para seleccionar proveedor, revisar una vista previa y almacenar el PDF definitivo de forma persistente |
| Prompt utilizado | Se solicito que el reporte permitiera seleccionar el proveedor para tomar su formato, visualizar el documento antes de publicarlo, mostrar su ubicacion y preparar el almacenamiento de archivos en Railway |
| Resultado obtenido | Se agregaron proveedor principal y campos tecnicos al reporte; se implementaron guardado en borrador, vista previa PDF, publicacion con generacion automatica, calculo SHA-256 y tamano, recuperacion del archivo y almacenamiento local o en Railway Bucket mediante S3. Se agregaron PDFKit, el cliente S3, una segunda migracion, documentacion y tres pruebas nuevas. El conjunto de doce pruebas automatizadas finalizo correctamente y npm reporto cero vulnerabilidades |
| Validacion del grupo | Ejecutar la migracion 002 y reaplicar permisos en PostgreSQL; probar borrador, vista previa, publicacion y descarga; posteriormente configurar y probar el Bucket real en Railway |
| Estandares aplicados | S2, S3, S4, S7, S8, D1, D2, D4. Codigos tomados de los estandares definidos en el PDF del proyecto |
| Responsable | Carlos Geovanni Lopez Rodriguez / 2690-23-2511 |

## Registro 13

| Campo | Detalle |
| ----- | ------- |
| Fecha | 30/09/2026 |
| Herramienta | ChatGPT / Codex |
| Objetivo | Corregir la relacion entre servicios e instituciones y preparar la identidad visual de los proveedores para los reportes |
| Prompt utilizado | Se solicito conservar solamente el nombre del servicio solicitante y relacionarlo obligatoriamente con una institucion, agregar logotipo y pie de pagina a cada proveedor, y analizar tres capturas de los reportes actuales |
| Resultado obtenido | Se normalizo el modelo para que cada servicio pertenezca a una institucion y el reporte obtenga la institucion a traves del servicio; se preparo una migracion que conserva los registros existentes; se agregaron `logo_url` y `pie_pagina` al proveedor; y se ajustaron DDL, seed, vista, consultas, API, interfaz y documentacion. Las tres plantillas comparten numero, fecha, cliente, servicio, datos del equipo, especificaciones, recomendaciones y firmas; pedido/NOG y tipo de servicio son campos variables que deben incorporarse en la siguiente fase del reporte |
| Validacion del grupo | Aplicar la migracion en `meditec_reportes_pruebas`, ejecutar los casos CP-MIG-01 a CP-MIG-05 y confirmar cual proveedor define la plantilla cuando un reporte tenga mas de un proveedor |
| Estandares aplicados | S2, S3, S4, S7, D1, D3, D4. Codigos tomados de los estandares definidos en el PDF del proyecto |
| Responsable | Carlos Geovanni Lopez Rodriguez / 2690-23-2511 |

## Registro 12

| Campo | Detalle |
| ----- | ------- |
| Fecha | 30/09/2026 |
| Herramienta | ChatGPT / Codex |
| Objetivo | Completar y validar la seguridad y el flujo web requeridos para la Entrega 3 |
| Prompt utilizado | Se solicito continuar con el control de seguridad y realizar todo lo posible para dejar lista la Entrega 3, conservando la estructura obligatoria del repositorio y sin crear el commit final |
| Resultado obtenido | Se reemplazaron las contrasenas de prueba por hashes bcrypt; se implementaron sesiones firmadas de una hora mediante cookie HttpOnly, SameSite Strict y Secure en produccion; se agregaron cierre de sesion, limite de intentos, cabeceras de seguridad, validacion de entradas y autorizacion por rol. Se creo un usuario tecnico PostgreSQL con privilegios minimos, sin permisos CREATEDB ni CREATEROLE. La web quedo integrada con cuatro catalogos y con el flujo de creacion, validacion de equipo autorizado, asociacion de PDF, publicacion y consulta de reportes. Las nueve pruebas unitarias y la prueba integrada contra PostgreSQL 18.4 finalizaron correctamente |
| Validacion del grupo | El grupo debe revisar visualmente la aplicacion, tomar las capturas requeridas, comprobar que no se incluyan secretos ni archivos ajenos en Git y aprobar la certificacion antes de crear el commit y el tag final |
| Estandares aplicados | S2, S3, S4, S7, S8, D1, D2, D4. Codigos tomados de los estandares definidos en el PDF del proyecto |
| Responsable | Carlos Geovanni Lopez Rodriguez / 2690-23-2511 |

## Registro 11

| Campo | Detalle |
| ----- | ------- |
| Fecha | 29/09/2026 |
| Herramienta | ChatGPT / Codex |
| Objetivo | Revisar, fortalecer y validar la implementacion SQL avanzada correspondiente a la Entrega 3 |
| Prompt utilizado | Se solicito actuar como analista de bases de datos, revisar si el DDL eliminaba informacion, identificar indices redundantes, separar el reinicio destructivo de la instalacion normal, implementar historial de archivos PDF, completar procedimientos, triggers, auditoria, roles y permisos, y ejecutar pruebas reales en PostgreSQL antes de realizar el commit |
| Resultado obtenido | Se separo el reinicio destructivo en `sql/reset/001_reset_schema.sql`; el DDL dejo de eliminar datos; se eliminaron indices redundantes; se implemento una secuencia para generar codigos de reporte; se permitio conservar historial de PDFs con una sola version activa; se agregaron procedimientos de publicacion y reemplazo, triggers de validacion y auditoria, roles reejecutables, consultas y un script automatizado de pruebas. El ciclo completo se ejecuto en PostgreSQL 18.4 sobre la base `meditec_reportes_pruebas`. Las 16 consultas funcionaron, la publicacion sin PDF fue rechazada, los permisos fueron comprobados y el seed pudo repetirse sin duplicar datos. Finalmente se creo el commit `deeba92` con el mensaje `entrega-3: completa y valida implementacion SQL avanzada` |
| Validacion del grupo | El grupo debe revisar los resultados documentados en `docs/casos-prueba/casos-prueba-iniciales.md`, conservar las evidencias de PostgreSQL, confirmar que el usuario temporal ya no tenga privilegios `CREATEDB` ni `CREATEROLE` y aprobar el commit antes de enviarlo al repositorio remoto |
| Estandares aplicados | S2, S3, S4, S7, S8, D1, D4. Codigos tomados de los estandares definidos en el PDF del proyecto |
| Responsable | Carlos Geovanni Lopez Rodriguez / 2690-23-2511 |

## Registro 10

| Campo | Detalle |
| ----- | ------- |
| Fecha | 14/09/2026 |
| Herramienta | ChatGPT / Codex |
| Objetivo | Corregir inconsistencias entre los scripts SQL, la documentacion principal y el modelo actual de base de datos |
| Prompt utilizado | Se solicito analizar el proyecto, identificar que contenia y corregir las inconsistencias detectadas en los scripts SQL y documentos relacionados |
| Resultado obtenido | Se corrigio el procedimiento `generar_codigo_reporte()` para usar `id_reporte` en lugar de `id`. Tambien se actualizo la vista `vw_reportes_resumen` para utilizar las tablas reales del modelo actual: `servicios_solicitantes`, `instituciones`, `reporte_tecnico`, `tecnicos`, `reporte_proveedor`, `proveedores`, `usuarios` y `archivos_pdf`. Ademas, se ajustaron los permisos SQL para reemplazar `clientes` por `servicios_solicitantes` y agregar permisos sobre tablas relacionadas con PDFs, tecnicos y proveedores por reporte. Finalmente, se actualizo la documentacion principal para reemplazar referencias antiguas como `pdf_url`, `clientes` y `cliente_id` por los nombres actuales del esquema |
| Validacion del grupo | El grupo debe ejecutar nuevamente los scripts SQL en PostgreSQL siguiendo el orden de `INSTALL.md` y confirmar que la vista, funciones, triggers y permisos se crean correctamente |
| Estandares aplicados | S2, S3, S4, S7, S8, D1, D4. Codigos tomados de los estandares definidos en el PDF del proyecto |
| Responsable | Carlos Geovanni Lopez Rodriguez / 2690-23-2511 |

## Registro 9

| Campo | Detalle |
| ----- | ------- |
| Fecha | 03/09/2026 |
| Herramienta | ChatGPT / Codex |
| Objetivo | Resolver el error de conexion entre la aplicacion web y PostgreSQL para validar el avance de la Entrega 2 |
| Prompt utilizado | Se pidio apoyo para interpretar el error `Error interno de la aplicacion`, revisar la conexion de la web con PostgreSQL 18, configurar el archivo `.env` y probar el endpoint `http://localhost:3000/api/health` |
| Resultado obtenido | Se identifico que la aplicacion intentaba conectarse con una contrasena incorrecta del usuario `postgres`. Se creo el archivo `web/.env`, se ajusto `DATABASE_URL` con la contrasena correcta, se reinicio la aplicacion Node/Express y se verifico la conexion mediante `/api/health`, obteniendo respuesta `ok: true`. Tambien se comprobo el login por API con el usuario academico `admin@meditec.local` |
| Validacion del grupo | El grupo debe tomar capturas de la web funcionando, del endpoint `/api/health` y de las pantallas CRUD para incluirlas como evidencia de Entrega 2 |
| Estandares aplicados | S2, S3, S8, D1, D4. Codigos tomados de los estandares definidos en el PDF del proyecto |
| Responsable | Carlos Geovanni Lopez Rodriguez / 2690-23-2511 |

## Registro 8

| Campo | Detalle |
| ----- | ------- |
| Fecha | 03/09/2026 |
| Herramienta | ChatGPT / Codex |
| Objetivo | Comprender el uso de DML y preparar datos iniciales para pruebas de la base de datos |
| Prompt utilizado | Se pidio explicar que era DML, que informacion debia incluirse en el archivo de datos iniciales y si esos datos podian modificarse posteriormente |
| Resultado obtenido | Se explico que DML permite consultar y manipular datos en tablas ya creadas mediante comandos como `SELECT`, `INSERT`, `UPDATE` y `DELETE`. Para esta etapa se creo el archivo `sql/dml/001_seed.sql` utilizando sentencias `INSERT`, con datos minimos necesarios para probar la Entrega 2: roles, usuario administrador, equipos autorizados, servicios solicitantes, instituciones, tecnicos y proveedores |
| Validacion del grupo | El grupo debe revisar que los datos iniciales sean adecuados para probar login y CRUD en Entrega 2. Estos registros no son definitivos; pueden modificarse, ampliarse o reemplazarse segun las necesidades del proyecto, especialmente antes de preparar los datos completos requeridos en Entrega 3 |
| Estandares aplicados | S2, S3, S8, D1, D4. Codigos tomados de los estandares definidos en el PDF del proyecto |
| Responsable | Carlos Geovanni Lopez Rodriguez / 2690-23-2511 |

## Registro 7

| Campo | Detalle |
| ----- | ------- |
| Fecha | 03/09/2026 |
| Herramienta | ChatGPT / Codex |
| Objetivo | Orientar la documentacion del modelo relacional, diccionario de datos y normalizacion 3FN |
| Prompt utilizado | Se pidio explicar que debia incluir el diccionario de datos y revisar como presentar de forma mas clara los documentos de modelo relacional y normalizacion 3FN |
| Resultado obtenido | Se explico el contenido esperado del diccionario de datos, incluyendo campos, tipos de datos, restricciones y descripcion. Tambien se apoyo en ordenar visualmente las tablas Markdown de los documentos `ENTREGA2_MODELO_RELACIONAL.md`, `ENTREGA2_NORMALIZACION_3FN.md` y `ENTREGA2_DICCIONARIO_DATOS.md`, sin cambiar el contenido tecnico |
| Validacion del grupo | El grupo debe revisar que la documentacion sea comprensible, que el diccionario coincida con el DDL y que el modelo relacional grafico se agregue antes del commit de Entrega 2 |
| Estandares aplicados | D1, D2, D4, S1, S3. Codigos tomados de los estandares definidos en el PDF del proyecto |
| Responsable | Carlos Geovanni Lopez Rodriguez / 2690-23-2511 |

## Registro 6

| Campo | Detalle |
| ----- | ------- |
| Fecha | 03/09/2026 |
| Herramienta | ChatGPT / Codex |
| Objetivo | Apoyar la creacion del DDL base y explicar las decisiones tecnicas aplicadas |
| Prompt utilizado | Se pidio apoyo para crear el DDL de Entrega 2 y explicar a que hacian referencia conceptos como PK, FK, UNIQUE, NOT NULL, CHECK, indices, ON DELETE/ON UPDATE y tablas N:M |
| Resultado obtenido | Se ayudo a estructurar el DDL base para PostgreSQL a partir del ER aprobado, incluyendo entidades principales, llaves primarias, llaves foraneas, restricciones, indices y tablas intermedias para resolver relaciones N:M. Tambien se explico el significado de cada restriccion y su utilidad dentro del modelo relacional |
| Validacion del grupo | El grupo debe revisar que el DDL coincida con el ER aprobado, que las tablas representen correctamente el negocio de Meditec y que las restricciones sean comprensibles para defenderlas en clase |
| Estandares aplicados | S1, S2, S3, S4, S7, D1, D4. Codigos tomados de los estandares definidos en el PDF del proyecto |
| Responsable | Carlos Geovanni Lopez Rodriguez / 2690-23-2511 |

## Registro 5

| Campo | Detalle |
| ----- | ------- |
| Fecha | 02/09/2026 |
| Herramienta | ChatGPT / Codex |
| Objetivo | Revisar y validar el diagrama ER Chen exportado como imagen |
| Prompt utilizado | Se solicito analizar la imagen del diagrama ER Chen ubicada en `docs/diagramas/` para verificar entidades, atributos, relaciones y cardinalidades contra el modelo acordado |
| Resultado obtenido | Se identificaron ajustes en nombres de atributos y entidades: reemplazar atributos genericos, corregir `fecha_origen` por `fecha_evento`, `ip_evento` por `ip_origen`, corregir `Roll` por `Rol`, validar `Servicio_Solicitante` con `id`, `nombre` y `estado`, y confirmar las cardinalidades principales |
| Validacion del grupo | El grupo aplico las correcciones en la imagen final `diagrama_chen.png` y debe validar visualmente que el diagrama coincida con la especificacion conceptual antes del commit final |
| Estandares aplicados | D1, D3, D4. Codigos tomados de los estandares definidos en el PDF del proyecto |
| Responsable | Carlos Geovanni Lopez Rodriguez / 2690-23-2511 |

## Registro 4

| Campo | Detalle |
| ----- | ------- |
| Fecha | 31/08/2026 |
| Herramienta | ChatGPT / Codex |
| Objetivo | Analizar el enunciado del proyecto y orientar la Entrega 1 |
| Prompt utilizado | Se pidio leer el PDF del proyecto y explicar paso a paso que solicita la Entrega 1 |
| Resultado obtenido | Se identificaron productos obligatorios: propuesta, requerimientos, Gantt, ER Chen, README, estructura, bitacora, certificacion y tag |
| Validacion del grupo | El grupo reviso que los productos coincidan con la rubrica del PDF |
| Estandares aplicados | D1, D2, D3, D4, R1, R2. Codigos tomados de los estandares definidos en el PDF del proyecto |
| Responsable | Carlos Geovanni Lopez Rodriguez / 2690-23-2511 |

## Registro 3

| Campo | Detalle |
| ----- | ------- |
| Fecha | 31/08/2026 |
| Herramienta | ChatGPT / Codex |
| Objetivo | Estructurar la propuesta del sistema Meditec |
| Prompt utilizado | Se proporciono contexto de Meditec: reportes en Excel/Word, necesidad de app web y PostgreSQL |
| Resultado obtenido | Se definio problema, propuesta, objetivo general, objetivos especificos, alcance y limitaciones |
| Validacion del grupo | El grupo validara que la propuesta represente el problema real de Meditec |
| Estandares aplicados | D1, D4. Codigos tomados de los estandares definidos en el PDF del proyecto |
| Responsable | Carlos Geovanni Lopez Rodriguez / 2690-23-2511 |

## Registro 2

| Campo | Detalle |
| ----- | ------- |
| Fecha | 31/08/2026 |
| Herramienta | ChatGPT / Codex |
| Objetivo | Identificar requerimientos funcionales y de datos |
| Prompt utilizado | Se solicito separar los requerimientos para el Entregable 1 |
| Resultado obtenido | Se propusieron requerimientos para clientes, proveedores, tecnicos, instituciones, usuarios, roles, equipos autorizados, reportes, PDFs y auditoria |
| Validacion del grupo | El grupo revisara si faltan procesos reales usados por Meditec |
| Estandares aplicados | D1, D4. Codigos tomados de los estandares definidos en el PDF del proyecto |
| Responsable | Carlos Geovanni Lopez Rodriguez / 2690-23-2511 |

## Registro 1

| Campo | Detalle |
| ----- | ------- |
| Fecha | 31/08/2026 |
| Herramienta | ChatGPT / Codex |
| Objetivo | Proponer entidades y relaciones para el ER conceptual |
| Prompt utilizado | Se pidio orientar el modelo ER en Chen segun el proyecto |
| Resultado obtenido | Se sugirieron entidades principales y relaciones N:M como reporte-tecnico y reporte-proveedor |
| Validacion del grupo | El grupo debe confirmar que las relaciones representan el negocio antes de aprobar el ER |
| Estandares aplicados | D3, D4. Codigos tomados de los estandares definidos en el PDF del proyecto |
| Responsable | Carlos Geovanni Lopez Rodriguez / 2690-23-2511 |
