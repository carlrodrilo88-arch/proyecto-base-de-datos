# Procedimiento de Trabajo - Entrega 1

## Contexto del proyecto

El proyecto consiste en un sistema de gestion documental y reportes de servicio
para Meditec. La empresa usa actualmente macros de Excel y Word para generar
reportes PDF, y se busca centralizar la informacion mediante una aplicacion web
con base de datos PostgreSQL.

## Regla de trabajo acordada

- Trabajar siempre enfocados en la Entrega 1 hasta cerrarla.
- No agregar nuevas entradas a la bitacora IA sin avisar antes y recibir visto
  bueno.
- No modificar archivos fuera del alcance solicitado sin confirmacion.
- No crear el tag final hasta que la documentacion este revisada.

## Archivos principales de Entrega 1

| Archivo | Proposito |
| --- | --- |
| `docs/entrega-1/ENTREGA1_PROPUESTA.md` | Propuesta formal del proyecto. |
| `docs/entrega-1/ENTREGA1_REQUERIMIENTOS.md` | Requerimientos funcionales, de datos, no funcionales y reglas de negocio. |
| `docs/entrega-1/ENTREGA1_GANTT.md` | Cronograma de 12 semanas. |
| `docs/diagramas/ENTREGA1_ER_CHEN.md` | Especificacion del diagrama ER Chen. |
| `docs/certificaciones/CERTIFICACION_ENTREGA_1.md` | Certificacion de calidad de Entrega 1. |
| `docs/certificaciones/firma.jpg` | Firma del primer integrante. |
| `docs/bitacora-ia/BITACORA_IA_ENTREGA_1.md` | Bitacora IA inicial autorizada. |

## Modelo conceptual acordado para Chen

Entidades principales:

- Institucion.
- Empresa.
- Servicio_Solicitante.
- Tecnico.
- Proveedor.
- Usuario.
- Rol.
- Equipo_Autorizado.
- Equipo.
- Tipo_Servicio.
- Reporte.
- Archivo_PDF.
- Auditoria_Evento.

Cambios acordados:

- `Cliente` fue reemplazado por `Servicio_Solicitante`.
- Se elimino `Tipo_Equipo` para evitar redundancia.
- Se agrego `Equipo` como entidad central del mantenimiento.
- `Servicio_Mantenimiento` fue reemplazado por `Tipo_Servicio`.

## Pendientes antes de cerrar Entrega 1

- Dibujar el diagrama ER Chen visual en draw.io, diagrams.net o herramienta
  equivalente.
- Exportar el diagrama como PNG o PDF.
- Guardarlo en `docs/diagramas/`.
- Actualizar la certificacion cuando el diagrama este incluido.
- Revisar nombres, carne y firmas de todos los integrantes.
- Revisar ortografia y presentacion final.
- Hacer commit limpio de Entrega 1.
- Crear y subir tag `entrega-1`.
- Subir tambien la rama `main` si se quiere que GitHub muestre los cambios en la
  vista principal del repositorio.

## Archivos recomendados para commit de Entrega 1

```bash
git add README.md INSTALL.md
git add docs/entrega-1/ENTREGA1_PROPUESTA.md
git add docs/entrega-1/ENTREGA1_REQUERIMIENTOS.md
git add docs/entrega-1/ENTREGA1_GANTT.md
git add docs/entrega-1/PROCEDIMIENTO_TRABAJO_ENTREGA1.md
git add docs/diagramas/ENTREGA1_ER_CHEN.md
git add docs/diagramas/ENTREGA1_ER_CHEN.png
git add docs/certificaciones/CERTIFICACION_ENTREGA_1.md
git add docs/certificaciones/firma.jpg
git add docs/bitacora-ia/BITACORA_IA_ENTREGA_1.md
```

Si el diagrama se exporta como PDF en lugar de PNG, usar:

```bash
git add docs/diagramas/ENTREGA1_ER_CHEN.pdf
```

## Comandos de cierre

Crear commit:

```bash
git commit -m "docs(entrega-1): agrega propuesta y diseno conceptual"
```

Subir rama principal:

```bash
git push origin main
```

Crear tag:

```bash
git tag entrega-1
```

Subir tag:

```bash
git push origin entrega-1
```

Verificar tag en GitHub:

```bash
git ls-remote --tags origin entrega-1
```

Verificar sincronizacion de rama:

```bash
git status -sb
```

Si aparece `[ahead 1]`, falta subir la rama con `git push origin main`.
