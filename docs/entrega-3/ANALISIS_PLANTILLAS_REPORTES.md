# Analisis de plantillas actuales de reportes

## Evidencia revisada

Se revisaron tres capturas correspondientes a plantillas de Teknor, Meditec y
GT Medical. Aunque su identidad visual cambia, comparten la misma estructura
operativa.

## Datos comunes

- Numero unico y fecha del reporte.
- Institucion o cliente.
- Servicio solicitante perteneciente a la institucion.
- Descripcion del equipo, marca, modelo, numero de serie y numero de bien.
- Especificaciones tecnicas y recomendaciones.
- Firma del tecnico, firma del departamento de mantenimiento y firma del
  servicio solicitante.

## Datos variables

- Numero de pedido y NOG aparece en dos plantillas.
- Meditec clasifica el servicio como garantia, mantenimiento preventivo,
  mantenimiento correctivo, llamada de emergencia u otros.
- Logotipo, colores, marca de agua, datos de contacto y pie de pagina cambian
  segun el proveedor.

## Criterio de implementacion

Los datos tecnicos deben pertenecer al reporte; la identidad visual debe
obtenerse del proveedor asociado. Por ello `proveedores.logo_url` conserva la
ubicacion del logotipo y `proveedores.pie_pagina` el texto inferior. La futura
generacion del PDF seleccionara la plantilla del proveedor sin duplicar esos
datos en cada reporte.

La implementacion conserva la relacion de varios proveedores, pero exige un
`id_proveedor_plantilla` que define la identidad visual. El reporte se guarda
primero como borrador, puede abrirse como vista previa y solo al publicarlo se
genera y almacena la version PDF definitiva.
