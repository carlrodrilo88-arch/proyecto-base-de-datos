# Manual de usuario

## Objetivo

Este manual explica el uso del Sistema de Gestión Documental Meditec para
administrar catálogos, preparar reportes de servicio y consultar los PDF
publicados. La aplicación está dirigida a usuarios autorizados de Meditec.

## Acceso al sistema

1. Inicie el servidor según el manual técnico.
2. Abra `http://localhost:3000`.
3. Escriba el correo y la contraseña asignados.
4. Pulse **Ingresar al sistema**.

Si la cuenta tiene una contraseña temporal, el sistema abrirá únicamente el
módulo **Cambiar mi contraseña**. La nueva contraseña debe contener al menos
10 caracteres, letras y números. Después del cambio se habilitan los módulos
permitidos por el rol.

No utilice como cuenta de la página el usuario PostgreSQL `meditec_web`; este es
exclusivo para la conexión técnica entre Node.js y la base de datos.

## Navegacion y roles

La barra lateral agrupa los módulos de documentos, catálogos y cuenta.

| Rol | Acciones principales |
| --- | --- |
| Administrador | Gestiona catálogos, usuarios, permisos y constancias de computadoras; crea y consulta reportes. |
| Generador de reportes | Gestiona catálogos operativos y crea reportes. |
| Consulta | Consulta reportes y PDF publicados sin modificar información. |

El módulo activo se identifica visualmente en la navegación. En pantallas
pequeñas, la navegación se presenta como una franja horizontal desplazable.

## Gestion de catalogos

Los módulos **Instituciones**, **Servicios solicitantes**, **Equipos médicos**,
**Técnicos** y **Empresas y proveedores** comparten el mismo flujo:

1. Abra el módulo correspondiente.
2. Complete los campos del formulario.
3. Pulse **Guardar**.
4. Use el filtro para localizar registros existentes.
5. Pulse **Editar** para actualizar un registro.
6. El administrador puede pulsar **Desactivar** cuando un registro ya no debe
   aparecer en formularios nuevos.

Los registros se desactivan en vez de eliminarse para conservar el historial.

### Equipos médicos

Cada equipo pertenece a una institución. Debe tener descripción, marca, modelo
y al menos número de bien o número de serie. Estos datos se copian al reporte
para preservar la información histórica aunque el catálogo cambie después.

### Usuarios y permisos

Solo el administrador puede crear usuarios, asignar roles, desactivar cuentas y
establecer contraseñas temporales. Un administrador no puede desactivar su propia
cuenta ni cambiarse a sí mismo de rol.

### Constancia de computadoras

Este módulo registra las computadoras utilizadas durante el proyecto. Los
registros se guardan inactivos, no conceden permisos y no se pueden editar ni
activar desde la interfaz. La autorización efectiva para crear documentos se
controla mediante el usuario autenticado y su rol.

## Creacion y publicacion de reportes

1. Abra **Reportes**.
2. Seleccione la institución atendida. El sistema habilitará únicamente sus
   servicios y equipos.
3. Seleccione el servicio solicitante y la fecha.
4. Busque equipos por descripción, marca, modelo, número de bien o serie.
5. Seleccione uno o varios equipos. Se generará un reporte independiente por
   cada equipo.
6. Si el equipo no existe, use **Registrar un equipo nuevo**. Debe indicar
   descripción, marca, modelo y al menos bien o serie.
7. Seleccione la empresa prestadora: Teknor, Meditec o GT Medical. Cada empresa
   utiliza una plantilla fija con su logotipo incorporado.
8. Complete tipo de servicio, asunto, especificaciones técnicas y
   recomendaciones. Los reportes nuevos no incluyen observaciones.
9. Pulse **Revisar reporte**. En este momento todavía no se guarda información.
10. Compruebe institución, servicio, equipos, plantilla y redacción. La revisión
    advierte espacios o palabras repetidas, mayúsculas excesivas, falta de
    puntuación y descripciones demasiado cortas.
11. Pulse **Volver y corregir** o **Crear y publicar PDF**.

La confirmación crea, almacena y publica un PDF por equipo. Cada documento debe
caber en una sola hoja. Si el contenido no cabe con un tamaño legible, el sistema
rechaza la publicación y solicita resumirlo; nunca recorta texto silenciosamente.

## Consulta de reportes

La tabla **Reportes registrados** permite buscar por código y estado. Las
acciones disponibles dependen del estado:

- **Vista previa:** disponible para borradores técnicos recuperables.
- **Publicar:** permite completar un borrador que haya quedado pendiente.
- **Ver PDF:** abre el archivo definitivo de un reporte publicado.

Un reporte publicado conserva su código, los datos históricos del equipo y la
versión activa del PDF. No debe editarse como si fuera un borrador.

## Cuenta y seguridad

- Use **Cambiar mi contraseña** para actualizar su clave personal.
- Use **Cerrar sesión** al finalizar, especialmente en computadoras compartidas.
- No comparta contraseñas ni archivos `.env`.
- La sesión expira automáticamente; si ocurre, vuelva a iniciar sesión.

## Errores frecuentes

| Mensaje o situación | Acción recomendada |
| --- | --- |
| Credenciales inválidas | Verifique correo y contraseña; solicite un restablecimiento al administrador. |
| Debe cambiar su contraseña | Complete el cambio obligatorio antes de abrir otros módulos. |
| Seleccione al menos un equipo | Busque y agregue un equipo antes de revisar el reporte. |
| Equipo ajeno a la institución | Seleccione un equipo perteneciente a la institución del servicio. |
| Contenido demasiado extenso | Resuma especificaciones o recomendaciones para conservar una sola hoja. |
| No se pudo publicar | Verifique la conexión, el almacenamiento y vuelva a intentarlo. El reporte no se marca como publicado sin PDF. |
| La base requiere actualización | Aplique las migraciones indicadas en `INSTALL.md` con una cuenta propietaria. |
