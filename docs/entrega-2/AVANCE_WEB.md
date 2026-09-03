# Avance Web - Entrega 2

## Proyecto

Sistema de Gestion Documental y Reportes para Meditec.

## Alcance implementado

La aplicacion web incluida en `web/` cubre el avance minimo solicitado para la
Entrega 2: login, layout principal y dos modulos CRUD conectados a PostgreSQL.

## Tecnologia usada

- Node.js.
- Express.
- PostgreSQL mediante el paquete `pg`.
- HTML, CSS y JavaScript sin framework frontend.

## Funcionalidades

### Login

El sistema valida el correo y la contrasena contra la tabla `usuarios`.

Usuario de prueba:

- Correo: `admin@meditec.local`
- Contrasena: `admin123`

### Layout

La interfaz incluye:

- Pantalla de acceso.
- Barra lateral con navegacion.
- Area principal de trabajo.
- Identificacion del usuario autenticado.
- Opcion de salida.

### CRUD 1: servicios solicitantes

Permite:

- Listar servicios solicitantes.
- Crear nuevos registros.
- Editar registros existentes.
- Desactivar registros sin eliminarlos fisicamente.

Tabla usada: `servicios_solicitantes`.

### CRUD 2: tecnicos

Permite:

- Listar tecnicos.
- Crear nuevos registros.
- Editar registros existentes.
- Desactivar registros sin eliminarlos fisicamente.

Tabla usada: `tecnicos`.

## Persistencia

Los formularios consumen rutas API del servidor Express. Las operaciones CRUD
persisten directamente en PostgreSQL usando consultas parametrizadas.

## Rutas principales

| Ruta | Metodo | Proposito |
| --- | --- | --- |
| `/api/login` | POST | Autenticacion de usuario. |
| `/api/health` | GET | Verificacion de conexion a BD. |
| `/api/servicios-solicitantes` | GET, POST | Listar y crear servicios solicitantes. |
| `/api/servicios-solicitantes/:id` | PUT, DELETE | Editar o desactivar un servicio solicitante. |
| `/api/tecnicos` | GET, POST | Listar y crear tecnicos. |
| `/api/tecnicos/:id` | PUT, DELETE | Editar o desactivar un tecnico. |

## Ejecucion local

1. Crear la base de datos `meditec_reportes`.
2. Ejecutar `sql/ddl/001_schema.sql`.
3. Ejecutar `sql/dml/001_seed.sql`.
4. Copiar `web/.env.example` como `web/.env` y ajustar `DATABASE_URL`.
5. Ejecutar:

```bash
cd web
npm install
npm run dev
```

## Estado de Entrega 2

| Elemento | Estado |
| --- | --- |
| Login | Implementado |
| Layout | Implementado |
| CRUD servicios solicitantes | Implementado |
| CRUD tecnicos | Implementado |
| Persistencia en BD | Implementada en codigo; pendiente de prueba con PostgreSQL local o remoto configurado |

