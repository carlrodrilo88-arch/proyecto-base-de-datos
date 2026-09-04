# Bitacora de Agentes IA - 

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
