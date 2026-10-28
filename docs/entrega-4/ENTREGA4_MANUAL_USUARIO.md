# Manual de usuario

**Sistema:** Gestión Documental y Reportes Meditec
**Responsable:** Carlos Geovanni Lopez Rodriguez — 2690-23-2511
**Versión:** Entrega 4, 27/10/2026

## 1. Objetivo

Este manual explica cómo usar el Sistema de Gestión Documental Meditec para
administrar catálogos, crear reportes de servicio técnico en PDF y consultar
los documentos publicados. Está dirigido a los usuarios autorizados de la
empresa; la instalación y el despliegue se describen en el manual técnico.

## 2. Acceso al sistema

### 2.1 Dirección

| Ambiente | Dirección |
| --- | --- |
| Publicado en Railway | https://meditec-web-production.up.railway.app |
| Local (desarrollo) | `http://localhost:3000`, después de iniciar el servidor según el manual técnico |

La aplicación funciona en cualquier computadora con un navegador actualizado
(Chrome, Edge o Firefox). No requiere instalar programas.

### 2.2 Iniciar sesión

1. Abra la dirección del sistema.
2. Escriba su **nombre de usuario** (por ejemplo, `carlos`) o su correo.
3. Escriba su contraseña. Distingue mayúsculas y minúsculas.
4. Pulse **Ingresar al sistema**.

El nombre de usuario no distingue mayúsculas: `Carlos` y `carlos` son la misma
cuenta.

### 2.3 Primer ingreso y contraseña temporal

Las cuentas nuevas y las contraseñas restablecidas son **temporales**. Al entrar
con una de ellas, el sistema abre únicamente **Cambiar mi contraseña**:

1. Escriba la contraseña temporal en **Contraseña actual**.
2. Escriba y confirme la nueva contraseña. Debe tener entre 10 y 128
   caracteres e incluir letras y números, y ser distinta de la actual.
3. Pulse **Guardar nueva contraseña**.

Después del cambio se habilitan los módulos permitidos para su rol. A partir de
ese momento la contraseña temporal deja de funcionar en todas las computadoras.

### 2.4 Duración de la sesión

La sesión dura **una hora** desde el inicio de sesión y no se renueva con la
actividad. Al vencer, el sistema muestra *“La sesión expiró”* o *“Sesión no
válida”*. Vuelva a iniciar sesión; los datos que no se hayan confirmado no se
guardan.

> Recomendación: inicie sesión justo antes de crear un lote de reportes y
> confírmelo dentro de la misma hora.

### 2.5 Cerrar sesión

Pulse **Cerrar sesión** al terminar, sobre todo en computadoras compartidas.

## 3. Roles y permisos

| Acción | Administrador | Generador de reportes | Consulta |
| --- | :---: | :---: | :---: |
| Consultar reportes y ver PDF publicados | Sí | Sí | Sí |
| Consultar catálogos | Sí | Sí | Sí |
| Crear y editar instituciones, servicios, equipos, técnicos y empresas | Sí | Sí | No |
| Crear y publicar reportes | Sí | Sí | No |
| Desactivar registros de catálogos | Sí | No | No |
| Administrar usuarios y contraseñas temporales | Sí | No | No |
| Registrar constancias de computadoras | Sí | No | No |
| Cambiar su propia contraseña | Sí | Sí | Sí |

Si un usuario intenta una acción que su rol no permite, el sistema la rechaza y
no modifica información.

No use como cuenta de la página el usuario de PostgreSQL `meditec_web`: es
exclusivo de la conexión técnica entre la aplicación y la base de datos.

## 4. Navegación

La barra lateral agrupa los módulos:

- **Documentos:** Reportes.
- **Catálogos:** Instituciones, Servicios solicitantes, Equipos médicos,
  Técnicos, Empresas y proveedores.
- **Administración** (solo administrador): Constancia de computadoras, Usuarios
  y permisos.
- **Cuenta:** Cambiar mi contraseña y Cerrar sesión.

El módulo activo se resalta. En pantallas pequeñas la navegación se muestra
como una franja horizontal que se desplaza con el dedo.

## 5. Catálogos

### 5.1 Flujo general

Los módulos **Instituciones**, **Servicios solicitantes**, **Equipos médicos**,
**Técnicos** y **Empresas y proveedores** funcionan igual:

1. Abra el módulo.
2. Complete el formulario **Nuevo registro**.
3. Pulse **Guardar**.
4. Use el filtro de la tabla para localizar registros.
5. Pulse **Editar** para cambiar un registro y luego **Guardar**; **Cancelar**
   descarta los cambios.
6. El administrador puede pulsar **Desactivar** cuando un registro ya no debe
   aparecer en formularios nuevos.

Los registros se **desactivan** en lugar de eliminarse para conservar el
historial de los reportes que los usan.

### 5.2 Instituciones y servicios solicitantes

Cada servicio solicitante (por ejemplo, *Intensivo* o *Central*) pertenece a una
institución. Al crear un reporte solo aparecen los servicios de la institución
elegida.

### 5.3 Equipos médicos

Cada equipo pertenece a una institución y requiere descripción, marca, modelo y
**al menos** número de bien o número de serie. Cuando se usa en un reporte, sus
datos se copian al documento; si después se corrige el catálogo, los reportes
ya publicados conservan los datos originales.

### 5.4 Empresas y proveedores

Las empresas Teknor, Meditec y GT Medical tienen una plantilla PDF fija con su
logotipo y su formato. El campo **Pie de página del PDF** solo se usa en
proveedores sin plantilla propia.

## 6. Usuarios y permisos (administrador)

### 6.1 Crear un usuario

1. Abra **Usuarios y permisos**.
2. Escriba el **nombre completo** y el **usuario** con el que entrará: de 3 a 60
   caracteres, en minúsculas, con letras, números, punto, guion o guion bajo.
3. El **correo** es opcional.
4. Elija el **rol**: Administrador, Generador de reportes o Consulta.
5. Escriba una **contraseña temporal** que cumpla las reglas de la sección 2.3.
6. Pulse **Guardar** y entregue la contraseña al usuario por un medio privado.

El usuario deberá cambiarla en su primer ingreso.

### 6.2 Restablecer una contraseña

Si un usuario olvida su contraseña, edítelo, escriba una nueva **contraseña
temporal** y guarde. La cuenta vuelve a exigir el cambio en el siguiente
ingreso. Para su propia cuenta, use **Cambiar mi contraseña**.

### 6.3 Restricciones

- Un administrador no puede desactivar su propia cuenta ni cambiarse de rol.
- Los usuarios desactivados no pueden iniciar sesión, pero sus reportes se
  conservan.

## 7. Constancia de computadoras (administrador)

Este módulo registra las computadoras usadas durante el proyecto, como
constancia del requisito de que solo dos equipos generan reportes. Los registros
se guardan **inactivos**, no conceden permisos y no se editan desde la interfaz.
El permiso real para crear documentos depende del usuario y su rol.

## 8. Creación y publicación de reportes

### 8.1 Datos del servicio

1. Abra **Reportes**.
2. Seleccione la **institución** atendida. El sistema habilita solo sus
   servicios y equipos.
3. Seleccione el **servicio solicitante** y la **fecha del servicio**.

### 8.2 Selección de equipos

4. Busque equipos por descripción, marca, modelo, número de bien o serie.
5. Seleccione uno o varios. **Se genera un reporte y un PDF independiente por
   cada equipo seleccionado.**
6. Si el equipo no existe, pulse **+ Registrar un equipo nuevo**, complete
   descripción, marca, modelo y bien o serie, y pulse **Guardar y agregar**.

### 8.3 Empresa y plantilla

7. Seleccione la empresa prestadora. Con **Abrir formato PDF** puede ver la
   plantilla vacía antes de escribir.

| Empresa | Características del PDF |
| --- | --- |
| Teknor | Logotipo y marca de agua; secciones con banda gris; no usa número de pedido. |
| Meditec | Logotipo a la derecha, casillas de tipo de servicio, firma de Servicio técnico Biomédica y pie con lema, teléfonos de emergencia, sitio web y correos. |
| GT Medical | Curvas verdes y azules, número de pedido y NOG. |

### 8.4 Contenido técnico

8. Elija el **tipo de servicio**: Garantía, Mantenimiento preventivo,
   Mantenimiento correctivo, Llamada de emergencia u Otros.
9. Escriba el **asunto del reporte**.
10. Si la empresa es Meditec o GT Medical, complete **Número de pedido y NOG**.
11. Escriba la **descripción del servicio / especificaciones técnicas** y las
    **recomendaciones**.

### 8.5 Revisión y publicación

12. Pulse **Revisar reporte**. Hasta este punto **no se guarda nada**.
13. Compruebe institución, servicio, equipos, plantilla y redacción. La revisión
    advierte espacios o palabras repetidas, exceso de mayúsculas, falta de
    puntuación y descripciones demasiado cortas.
14. Pulse **Volver y corregir** para editar, o **Crear y publicar PDF** para
    confirmar.

Al confirmar, el sistema crea un código único por reporte (por ejemplo,
`REP-2026-000001`), genera el PDF, lo guarda en el almacenamiento y publica el
reporte. Al terminar abre el PDF en una pestaña nueva; si el navegador bloquea
ventanas emergentes, permítalas para este sitio.

Cada documento debe caber en **una sola hoja**. Si el texto no cabe con un
tamaño legible, el sistema rechaza la publicación y pide resumirlo; nunca
recorta el texto sin avisar.

## 9. Consulta de reportes

La tabla **Reportes registrados** muestra el código, la fecha, la institución,
el servicio, la empresa de la plantilla, el asunto y el estado de cada reporte.

1. Escriba un código o elija un estado y pulse **Buscar**.
2. Use la acción disponible según el estado:
   - **Ver PDF:** abre el documento definitivo de un reporte publicado.
   - **Vista previa:** disponible para borradores recuperables.
   - **Publicar:** completa un borrador que quedó pendiente.

Un reporte publicado conserva su código, los datos históricos del equipo y la
versión activa de su PDF. No se edita como un borrador.

## 10. Buenas prácticas de seguridad

- No comparta su contraseña; cada persona debe tener su propia cuenta.
- Cierre sesión en computadoras compartidas.
- No envíe contraseñas por canales públicos ni las guarde en el repositorio.
- Si sospecha que su contraseña fue vista por otra persona, cámbiela de
  inmediato o pida al administrador que la restablezca.

## 11. Mensajes frecuentes

| Mensaje o situación | Causa probable | Acción recomendada |
| --- | --- | --- |
| Credenciales inválidas | Usuario o contraseña incorrectos, o se usó una contraseña temporal ya cambiada | Verifique ambos datos; si no recuerda la contraseña, pida un restablecimiento al administrador. |
| Demasiados intentos | Más de 10 intentos fallidos en 15 minutos | Espere 15 minutos antes de intentar otra vez. |
| Debe cambiar su contraseña | La cuenta tiene una contraseña temporal | Complete el cambio obligatorio (sección 2.3). |
| Sesión no válida / La sesión expiró | Pasó una hora desde el inicio de sesión | Recargue la página, inicie sesión y repita la acción. |
| Seleccione al menos un equipo | No se agregó ningún equipo | Busque y agregue un equipo antes de revisar. |
| Equipo ajeno a la institución | El equipo pertenece a otra institución | Seleccione un equipo de la institución del servicio. |
| Contenido demasiado extenso | El texto no cabe en una hoja | Resuma las especificaciones o las recomendaciones. |
| No se pudo publicar | Falla de conexión o de almacenamiento | Intente de nuevo; el reporte no se marca como publicado sin PDF. Si persiste, avise al administrador. |
| No se abre el PDF | El navegador bloqueó la ventana emergente | Permita ventanas emergentes para el sitio o use **Ver PDF** en la tabla. |
| La base requiere actualización | Faltan migraciones en una instalación local | Aplique las migraciones de `INSTALL.md` con la cuenta propietaria de la base. |
