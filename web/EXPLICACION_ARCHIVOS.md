# Explicacion de Archivos de la Aplicacion Web

## Proposito

La carpeta `web/` contiene el avance web de la Entrega 2 del Sistema de Gestion
Documental y Reportes para Meditec. La aplicacion permite iniciar sesion y usar
dos modulos CRUD conectados a PostgreSQL: servicios solicitantes y tecnicos.

## Archivos principales

### `package.json`

Define la informacion basica del proyecto web, las dependencias necesarias y los
comandos de ejecucion.

- `express`: framework usado para crear el servidor web y las rutas API.
- `pg`: cliente usado para conectarse a PostgreSQL.
- `dotenv`: permite cargar variables de entorno desde `.env`.
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
- Crear y verificar tokens simples de sesion.
- Proteger rutas CRUD mediante autenticacion.
- Exponer `/api/health` para comprobar conexion con la base de datos.
- Exponer rutas CRUD para `servicios_solicitantes`.
- Exponer rutas CRUD para `tecnicos`.

## Carpeta `public/`

### `public/index.html`

Define la estructura visual inicial de la aplicacion en el navegador. Incluye la
pantalla de login, el layout principal, la navegacion lateral y las secciones
para administrar servicios solicitantes y tecnicos.

### `public/styles.css`

Contiene los estilos de la interfaz web. Define colores, distribucion de
pantallas, formularios, tablas, botones, mensajes y estados visuales usados por
el login y los modulos CRUD.

### `public/app.js`

Contiene la logica del frontend. Se encarga de responder a las acciones del
usuario y consumir las rutas API del servidor.

Funciones principales:

- Enviar las credenciales del login a `/api/login`.
- Guardar el token de sesion en el navegador.
- Mostrar el nombre y rol del usuario autenticado.
- Cambiar entre secciones de la aplicacion.
- Listar servicios solicitantes desde PostgreSQL.
- Crear, editar y desactivar servicios solicitantes.
- Listar tecnicos desde PostgreSQL.
- Crear, editar y desactivar tecnicos.
- Mostrar mensajes de exito o error en la interfaz.

## Carpeta `node_modules/`

Contiene las dependencias instaladas por `npm install`. No forma parte del codigo
propio del proyecto y no debe subirse al repositorio porque puede reconstruirse
con `package.json` y `package-lock.json`.

## Flujo de ejecucion

1. Se crea la base de datos `meditec_reportes` en PostgreSQL.
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
puede comunicarse con la base de datos.
