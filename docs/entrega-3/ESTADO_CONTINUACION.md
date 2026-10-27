# Estado para continuar el proyecto

## Punto de referencia

- Fecha del registro: 01/10/2026.
- Rama: `main`.
- Commit publicado: `66c0530` (`entrega-3: agrega usuarios y reportes individuales por lote`).
- Tag publicado: `entrega-3`.
- Base local: `meditec_reportes_pruebas`, PostgreSQL 18.4.
- Migraciones aplicadas: 001, 002, 003 y 004.

## Funciones terminadas

- Inicio y cierre de sesion con cookie protegida y hashes bcrypt.
- Roles funcionales `administrador`, `generador_reportes` y `consulta`.
- Administracion web de usuarios, asignacion de rol, activacion y restablecimiento.
- Cambio obligatorio de la contrasena temporal.
- Catalogos de instituciones, servicios relacionados con institucion, tecnicos,
  proveedores y equipos medicos.
- Proveedores con logotipo y pie de pagina para el formato PDF.
- Equipos medicos con institucion, numero de bien, marca, modelo y serie.
- Busqueda de equipos por nombre, bien, serie, marca o modelo.
- Seleccion de varios equipos sin duplicados.
- Creacion transaccional de un reporte independiente por equipo, reutilizando el
  contenido tecnico comun.
- Vista previa, publicacion y PDF independiente para cada reporte.
- Almacenamiento local de PDF y adaptador S3 para Railway Bucket.
- Vistas, funciones, procedimientos, triggers, auditoria y permisos minimos del
  usuario tecnico `meditec_web`.

## Validaciones alcanzadas

- `npm test`: 17 pruebas aprobadas y 0 fallidas.
- `npm run test:db`: estructura y permisos aprobados.
- Flujo previo de borrador, vista previa, publicacion y recuperacion PDF aprobado.
- Los equipos con bienes 1111, 1112 y 1113 quedaron asociados a los reportes
  `REP-2026-000011`, `REP-2026-000012` y `REP-2026-000013`, respectivamente.

## Decisiones vigentes

- No se agregaron los 50 registros por tabla principal por decision expresa del
  responsable. El requisito continua pendiente si se exige posteriormente.
- Un lote no combina equipos en un mismo reporte: crea un registro y un PDF por
  equipo.
- El DDL base no elimina tablas. `sql/reset/001_reset_schema.sql` es destructivo
  y se usa exclusivamente cuando se desea reiniciar una base de pruebas.
- Los cambios futuros del esquema deben implementarse mediante una migracion
  nueva; no se deben editar migraciones ya aplicadas.
- Las credenciales reales permanecen fuera de Git.

## Pendientes recomendados

1. Probar visualmente en navegador la creacion de usuarios, el cambio obligatorio
   de contrasena y el control de los tres roles.
2. Probar visualmente la busqueda de equipos y la creacion de varios borradores,
   confirmando un numero de bien por cada vista previa y PDF.
3. Guardar las capturas elegidas dentro de una carpeta documental antes de
   agregarlas a Git; no agregar las capturas sueltas de la raiz.
4. Crear PostgreSQL, servicio web y Bucket privado en Railway siguiendo
   `docs/entrega-3/DESPLIEGUE_RAILWAY.md`.
5. Aplicar en Railway el esquema, datos iniciales, migraciones y permisos en el
   orden documentado; luego ejecutar las validaciones de salud y roles.
6. Si se realizan correcciones posteriores al tag, crear un nuevo commit y una
   version como `entrega-3.1` en lugar de mover el tag publicado.

## Comandos de reanudacion

Desde `web/`:

```bash
npm install
npm test
npm run test:db
npm run dev
```

Abrir `http://localhost:3000` y ejecutar primero las pruebas visuales pendientes.

## Archivos que deben permanecer fuera de commits

- `web/.env` y cualquier archivo con credenciales.
- `web/nbproject/`.
- `_bmad/`, salvo que se decida incorporarlo formalmente al proyecto.
- `docs/entrega-3/BITACORA_IA_ENTREGA_3.md`, porque fue creado sin autorizacion.
- Capturas y copias del PDF del enunciado ubicadas sueltas en la raiz.
