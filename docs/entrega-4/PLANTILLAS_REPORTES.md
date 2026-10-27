# Plantillas de reportes por empresa

## Flujo

Cada reporte selecciona una empresa prestadora: Teknor, Meditec o GT Medical.
El servidor resuelve su plantilla por `proveedores.codigo_plantilla`, no por el
nombre comercial editable. La misma
funcion genera la muestra del formato, la vista previa del borrador y el PDF final.
Las firmas se completan manualmente despues de imprimir el reporte.

La web muestra automaticamente una representacion visual del formato al elegir
la empresa. El enlace "Abrir formato PDF" permite revisar el documento exacto;
la muestra HTML no depende del visor PDF integrado del navegador.

## Disenos

- Teknor: logotipo, encabezado negro, marca de agua roja y barras grises.
- Meditec: logotipo azul y clasificacion del servicio. No se integra el QR.
- GT Medical: logotipo y decoracion verde/azul.
- Las tres incluyen institucion, servicio solicitante, equipo, marca, modelo,
  numero de serie, numero de bien, especificaciones tecnicas y recomendaciones.
- Pedido/NOG aparece en Meditec y GT Medical, siguiendo las capturas.
- Cada reporte ocupa una sola hoja. Si el contenido no cabe con un tamano legible,
  la publicacion se rechaza y solicita resumirlo; nunca se recorta silenciosamente.

## Logotipos

Los PNG de `web/public/logos/` se extrajeron de las capturas originales de la raiz:

| Archivo | Fuente | Recorte (x, y, ancho, alto) |
| --- | --- | --- |
| `teknor.png` | `Captura de pantalla 2026-09-30 233548.png` | 43, 48, 221, 82 |
| `meditec.png` | `Captura de pantalla 2026-09-30 233615.png` | 342, 39, 193, 77 |
| `gt-medical.png` | `Captura de pantalla 2026-09-30 233659.png` | 12, 27, 165, 87 |
| `teknor-watermark.png` | `Captura de pantalla 2026-09-30 233548.png` | 46, 54, 81, 73 |

Se retiro el fondo casi blanco para permitir transparencia. La resolucion esta
limitada por las capturas: estos recursos pueden reemplazarse por los originales
sin cambiar las plantillas. No se reproducen contactos fiscales ni un QR no confirmados.

## Catalogo existente

Aplicar `sql/migrations/005_plantillas_observaciones.sql` en bases existentes.
Agrega el codigo estable, conserva el contenido al renombrar `descripcion` como
`observaciones` y registra las empresas ausentes. En una base nueva, el DDL y
`sql/dml/002_empresas_reportes.sql` ya contienen estos cambios. No se ejecuta
automaticamente al iniciar la web.

Los reportes historicos de otros proveedores siguen usando el formato generico.
El formulario de reportes nuevos ofrece solamente las empresas con uno de los
tres codigos de plantilla y estado activo. Cada codigo pertenece a una sola empresa.

## Validacion

`web/src/report-templates.test.js` comprueba seleccion de formatos, imagenes
embebidas, campos impresos, recomendaciones, espacios de firmas y limite de una
sola hoja. Ejecutar `npm test` desde `web/`.

Validacion del 12/10/2026: 23 pruebas automatizadas aprobadas y ninguna fallida.
Se revisaron visualmente los tres PDF de ejemplo. La seleccion de las tres
empresas, los logotipos, pedido/NOG y el ancho movil se comprobaron en navegador
con catalogos y sesion simulados, sin modificar usuarios ni reportes reales.
El script de empresas no se ejecuto sobre la base local durante esta validacion.

Validacion posterior de la migracion 005: 27 pruebas aprobadas. En una instancia
aislada PostgreSQL 18 se verificaron instalacion limpia, migracion desde el esquema
anterior, conservacion de datos y reejecucion. El navegador utilizo catalogos y API
reales de esa base temporal para crear, publicar y recuperar un PDF por empresa.
Los archivos de prueba se guardaron fuera del almacenamiento real del proyecto.
La aplicacion a `meditec_reportes_pruebas` sigue pendiente de acceso administrativo.
