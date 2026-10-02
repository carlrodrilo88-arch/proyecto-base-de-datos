# Explicacion de Archivos de la Aplicacion Web

## Proposito

La carpeta `web/` contiene el avance web de la Entrega 3 del Sistema de Gestion
Documental y Reportes para Meditec. La aplicacion permite iniciar sesion, usar
cinco catalogos conectados a PostgreSQL y gestionar el flujo principal de
reportes.

## Archivos principales

### `package.json`

Define la informacion basica del proyecto web, las dependencias necesarias y los
comandos de ejecucion.

- `express`: framework usado para crear el servidor web y las rutas API.
- `pg`: cliente usado para conectarse a PostgreSQL.
- `dotenv`: permite cargar variables de entorno desde `.env`.
- `bcryptjs`: protege las contrasenas mediante hashes adaptativos.
- `helmet`: agrega cabeceras HTTP de seguridad.
- `express-rate-limit`: limita intentos repetidos de inicio de sesion.
- `npm run dev`: inicia el servidor con `node --watch src/server.js`.
- `npm start`: inicia el servidor con Node.js sin modo de observacion.

### `package-lock.json`

Registra las versiones exactas de las dependencias instaladas. Sirve para que el
proyecto pueda instalarse nuevamente con las mismas versiones usadas durante el
desarrollo.

### `.env`

Archivo local de configuracion usado por la aplicacion durante las pruebas.
Contiene el puerto del servidor, la cadena de conexion a PostgreSQL y el secreto
de sesion.

Este archivo no debe subirse al repositorio porque puede contener contrasenas.

### `.env.example`

Archivo de ejemplo que muestra que variables necesita la aplicacion para
funcionar. Sirve como guia para crear un `.env` local sin exponer credenciales
reales.

### `.gitkeep`

Archivo vacio usado para conservar la carpeta `web/` dentro del repositorio
cuando todavia no tenia codigo.

## Carpeta `src/`

### `src/server.js`

Es el archivo principal del backend. Crea el servidor Express, configura la
conexion con PostgreSQL y define las rutas API usadas por la interfaz web.

Funciones principales:

- Cargar configuracion desde `.env`.
- Conectarse a PostgreSQL mediante `pg`.
- Servir los archivos estaticos ubicados en `public/`.
- Validar login contra la tabla `usuarios`.
- Crear tokens firmados con expiracion de una hora.
- Entregar la sesion mediante una cookie `HttpOnly` y `SameSite=Strict`.
- Proteger rutas CRUD mediante autenticacion y autorizacion por rol.
- Validar entradas y limitar solicitudes JSON.
- Exponer `/api/health` para comprobar conexion con la base de datos.
- Exponer rutas CRUD para `servicios_solicitantes`.
- Exponer rutas CRUD para `tecnicos`.
- Exponer rutas CRUD para `instituciones` y `proveedores`.
- Exponer rutas CRUD para `equipos_medicos` sin confundirlos con las
  computadoras de `equipos_autorizados`.
- Crear y consultar reportes con filtros por codigo y estado.
- Validar que el equipo que crea o carga un reporte este activo y autorizado.
- Asociar una version PDF y publicar el reporte mediante procedimientos SQL.
- Seleccionar un proveedor principal para aplicar su identidad al reporte.
- Generar una vista previa PDF antes de permitir la publicacion.
- Calcular hash y tamano, almacenar y servir el PDF definitivo.

### `src/security.js`

Centraliza la firma y verificacion de tokens, la vigencia de la sesion y la
creacion, lectura y eliminacion de la cookie protegida. En produccion exige un
secreto de al menos 32 caracteres y agrega el atributo `Secure` a la cookie.

### `src/security.test.js`

Contiene pruebas unitarias para tokens validos, vencidos o alterados, secretos
de produccion, bcrypt y cookies de sesion.

### `src/pdf-report.js`

Genera el PDF con los datos tecnicos, la institucion obtenida desde el servicio
y la identidad del proveedor principal.

### `src/storage.js`

Abstrae el almacenamiento. Usa `web/storage/` durante el desarrollo y un Bucket
S3 privado cuando `STORAGE_DRIVER=s3` en Railway.

### `src/report-flow.test.js`

Comprueba la generacion PDF, lectura y escritura local, y el rechazo de claves
de almacenamiento peligrosas.

## Carpeta `public/`

### `public/index.html`

Define la estructura visual inicial de la aplicacion en el navegador. Incluye la
pantalla de login, el layout principal, la navegacion lateral, las secciones
para administrar los cinco catalogos y el modulo de reportes.

### `public/styles.css`

Contiene los estilos de la interfaz web. Define colores, distribucion de
pantallas, formularios, tablas, botones, mensajes y estados visuales usados por
el login y los modulos CRUD.

### `public/app.js`

Contiene la logica del frontend. Se encarga de responder a las acciones del
usuario y consumir las rutas API del servidor.

Funciones principales:

- Enviar las credenciales del login a `/api/login`.
- Enviar solicitudes usando automaticamente la cookie de sesion protegida.
- Recuperar la sesion actual mediante `/api/session`.
- Cerrar la sesion mediante `/api/logout` sin acceder al token desde JavaScript.
- Mostrar el nombre y rol del usuario autenticado.
- Cambiar entre secciones de la aplicacion.
- Listar servicios solicitantes desde PostgreSQL.
- Crear, editar y desactivar servicios solicitantes.
- Listar tecnicos desde PostgreSQL.
- Crear, editar y desactivar tecnicos.
- Listar, crear, editar y desactivar instituciones y proveedores.
- Crear reportes usando el usuario autenticado y un equipo autorizado.
- Registrar la referencia del PDF, publicar y filtrar reportes.
- No solicitar manualmente el peso del PDF; mientras se use una ruta simulada se
  guarda como nulo y la futura carga real lo obtendra de `File.size`.
- Escapar los datos mostrados en tablas para reducir el riesgo de XSS.
- Mostrar mensajes de exito o error en la interfaz.

## Carpeta `node_modules/`

Contiene las dependencias instaladas por `npm install`. No forma parte del codigo
propio del proyecto y no debe subirse al repositorio porque puede reconstruirse
con `package.json` y `package-lock.json`.

## Flujo de ejecucion

1. Se crea una base de datos PostgreSQL, por ejemplo `meditec_reportes`.
2. Se ejecutan los scripts `sql/ddl/001_schema.sql` y `sql/dml/001_seed.sql`.
3. Se configura `web/.env` con la conexion local.
4. Se ejecuta `npm run dev` dentro de `web/`.
5. El servidor inicia en `http://localhost:3000`.
6. El navegador carga `public/index.html`, `public/styles.css` y
   `public/app.js`.
7. La interfaz consume las rutas de `src/server.js`.
8. El backend consulta y modifica datos en PostgreSQL.

## Pruebas realizadas

Se comprobo la conexion entre la aplicacion web y PostgreSQL mediante:

```text
http://localhost:3000/api/health
```

El endpoint respondio correctamente con `ok: true`, confirmando que la aplicacion
puede comunicarse con la base de datos. Ademas, se ejecutaron nueve pruebas
unitarias de seguridad y una prueba integrada del flujo completo de reportes en
la base `meditec_reportes_pruebas` sobre PostgreSQL 18.4.
