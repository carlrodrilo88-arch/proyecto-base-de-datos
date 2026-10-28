# Casos de prueba de la Entrega 4

## Ambiente

| Elemento | Valor |
| --- | --- |
| Fecha de validación | 27/10/2026 |
| Base | `meditec_reportes` |
| SGBD | PostgreSQL 15.2 |
| Usuario técnico | `meditec_web` con privilegios mínimos |
| Aplicación | Node.js / Express |
| Navegador de validación | Chromium automatizado |
| Almacenamiento | Local de desarrollo |

No se utilizaron credenciales reales ni se crearon reportes operativos durante
la revisión visual documentada.

## Pruebas automatizadas

| Código | Prueba | Resultado esperado | Resultado | Estado |
| --- | --- | --- | --- | --- |
| CP-E4-A01 | Ejecutar `npm test` | Todas las pruebas finalizan sin fallos | 29 aprobadas, 0 fallidas | Aprobado |
| CP-E4-A02 | Validar plantillas por código estable | Resolver Teknor, Meditec y GT Medical | Tres formatos resueltos | Aprobado |
| CP-E4-A03 | Generar PDF normal | Archivo válido de una página con logo y firmas | Tres plantillas válidas | Aprobado |
| CP-E4-A04 | Enviar contenido excesivo | Rechazar sin recortar ni crear segunda página | Error controlado de una hoja | Aprobado |
| CP-E4-A05 | Validar lote de equipos | Rechazar vacío, repetidos e inválidos | Casos negativos aprobados | Aprobado |
| CP-E4-A06 | Validar sesiones y contraseñas | Tokens, cookies y bcrypt seguros | Pruebas aprobadas | Aprobado |
| CP-E4-A07 | Validar almacenamiento | Guardar, leer, borrar y bloquear rutas inseguras | Pruebas aprobadas | Aprobado |

## Pruebas de base de datos

| Código | Prueba | Resultado esperado | Resultado | Estado |
| --- | --- | --- | --- | --- |
| CP-E4-DB01 | Ejecutar `npm run test:db` | Esquema y permisos válidos | “Base de Meditec lista y permisos web verificados” | Aprobado |
| CP-E4-DB02 | Conectar con `meditec_web` | Acceso sin privilegios administrativos | Conexión y consultas correctas | Aprobado |
| CP-E4-DB03 | Consultar plantillas activas | Tres códigos corporativos | 3 plantillas | Aprobado |
| CP-E4-DB04 | Consultar constancias activas | Ninguna computadora activa | 0 activas | Aprobado |
| CP-E4-DB05 | Verificar funciones y vista | Código, publicación y vista existentes | Objetos encontrados | Aprobado |
| CP-E4-DB06 | Revisar datos importados | Instituciones, servicios y equipos disponibles | 8, 99 y 286 registros | Aprobado |
| CP-E4-DB07 | Instalación desde cero | Orden completo sin errores | Ejecutada el 27/10/2026 en base vacía de Railway, PostgreSQL 18.6 | Aprobado |
| CP-E4-DB08 | Despliegue público | `/api/health` 200 y login | https://meditec-web-production.up.railway.app responde 200; login de administrador aprobado | Aprobado |
| CP-E4-DB09 | PDF en Bucket de Railway | El reporte publicado se guarda en el Bucket | Reporte publicado desde la web; el Bucket `meditec-pdfs` registra el objeto PDF | Aprobado |

## Pruebas funcionales

| Código | Flujo | Resultado esperado | Evidencia actual | Estado |
| --- | --- | --- | --- | --- |
| CP-E4-F01 | Abrir `/api/health` | `ok: true` y fecha de BD | Respuesta correcta | Aprobado |
| CP-E4-F02 | Login administrativo temporal | Acceso y obligación de cambio | Módulo de cambio mostrado | Aprobado |
| CP-E4-F03 | Cambiar contraseña | Renovar sesión y habilitar módulos | Flujo disponible; ejecución personal requerida | Pendiente de evidencia final |
| CP-E4-F04 | Buscar equipo por marca, bien o serie | Coincidencias de la institución | Implementado en interfaz | Pendiente de ejecución manual documentada |
| CP-E4-F05 | Revisar reporte | Mostrar datos y advertencias sin guardar | Diálogo renderizado | Aprobado visualmente |
| CP-E4-F06 | Crear y publicar un reporte | Código, PDF activo y estado publicado | No se creó un reporte real en esta validación | Pendiente de ejecución manual |
| CP-E4-F07 | Crear lote | Un reporte y PDF por equipo | Implementado y validado unitariamente | Pendiente de ejecución integrada final |
| CP-E4-F08 | Registrar computadora | Guardar constancia inactiva | API y migración implementadas | Pendiente de ejecución manual |
| CP-E4-F09 | Usuario consulta intenta modificar | API responde 403 | Middleware implementado | Pendiente de prueba con segundo usuario |

## Pruebas visuales y PDF

| Código | Prueba | Resultado | Estado |
| --- | --- | --- | --- |
| CP-E4-V01 | Login en escritorio y móvil | Sin desbordamiento; logo y formulario visibles | Aprobado |
| CP-E4-V02 | Diálogo de revisión | Advertencias, datos y acciones sin solaparse | Aprobado |
| CP-E4-V03 | Plantilla Meditec | Logo, pedido, tipo, valores centrados y una hoja | Aprobado |
| CP-E4-V04 | Plantilla Teknor | Logo, marca de agua, barras grises, firmas y una hoja | Aprobado |
| CP-E4-V05 | Plantilla GT Medical | Logo, curvas verdes/azules, firmas y una hoja | Aprobado |
| CP-E4-V06 | Apartados del reporte | Especificaciones y recomendaciones; sin observaciones | Aprobado |

## Resultado general

Las pruebas automáticas, de base y visuales ejecutadas finalizaron correctamente.
La instalación limpia, el despliegue público y la publicación de PDF en el
Bucket se aprobaron en Railway. Quedan pendientes las pruebas que deben generar
datos reales de demostración y un usuario de consulta. Estos casos no
se marcan como aprobados hasta guardar su evidencia.
