# Normalizacion 3FN - Entrega 2

## Objetivo

Demostrar que el modelo relacional del proyecto se encuentra normalizado hasta
Tercera Forma Normal (3FN), reduciendo redundancia y evitando dependencias
incorrectas entre atributos.

## Primera Forma Normal

El modelo cumple 1FN porque:

- Cada tabla tiene una llave primaria.
- Cada campo almacena un solo valor atomico.
- No se guardan listas repetidas dentro de columnas.
- Las relaciones de varios tecnicos o proveedores por reporte se separan en
  tablas intermedias.

Ejemplo aplicado:

No se guarda una columna `tecnicos` dentro de `reportes` con varios nombres
separados por coma. En su lugar se utiliza `reporte_tecnico`, donde cada fila
representa un tecnico asociado a un reporte.

## Segunda Forma Normal

El modelo cumple 2FN porque:

- Todas las tablas con llave primaria simple tienen atributos que dependen de la
  llave completa.
- Las tablas con llave compuesta (`reporte_tecnico` y `reporte_proveedor`) no
  contienen atributos que dependan solo de una parte de la llave.

Ejemplo aplicado:

En `reporte_tecnico`, el campo `rol_en_reporte` depende de la combinacion
`id_reporte` + `id_tecnico`, porque describe la participacion especifica de ese
tecnico en ese reporte.

## Tercera Forma Normal

El modelo cumple 3FN porque:

- Los atributos no clave dependen directamente de la llave primaria.
- No se almacenan datos de una entidad dentro de otra si pueden obtenerse por
  relacion.
- No se duplican nombres de tecnicos, proveedores, instituciones o usuarios en
  `reportes`; solo se almacenan sus llaves foraneas.

Ejemplo aplicado:

La tabla `reportes` almacena `id_servicio_solicitante`, no el nombre, telefono y
correo del servicio solicitante. Esos datos permanecen en
`servicios_solicitantes`, evitando inconsistencias si el contacto cambia.

## Ejemplo de descomposicion

### Diseno no normalizado

| codigo_reporte | servicio_solicitante | tecnico_1 | tecnico_2  | proveedor_1 | proveedor_2 | pdf_url          |
| -------------- | -------------------- | --------- | ---------- | ----------- | ----------- | ---------------- |
| REP-001        | Hospital Central     | Ana Ruiz  | Luis Perez | Proveedor A | Proveedor B | /pdf/rep-001.pdf |

Problemas:

- Repite columnas para tecnicos y proveedores.
- Limita la cantidad de participantes.
- Duplica nombres en reportes.
- Mezcla datos del reporte con datos del archivo PDF.

### Diseno normalizado

- `reportes` guarda la informacion principal del reporte.
- `servicios_solicitantes` guarda los datos del solicitante.
- `tecnicos` guarda los datos de cada tecnico.
- `proveedores` guarda los datos de cada proveedor.
- `reporte_tecnico` relaciona reportes con tecnicos.
- `reporte_proveedor` relaciona reportes con proveedores.
- `archivos_pdf` guarda los datos del archivo asociado.

## Conclusion

El modelo evita grupos repetidos, dependencias parciales y dependencias
transitivas. Por ello, el diseno queda justificado hasta 3FN y listo para su
implementacion base mediante el script DDL.

