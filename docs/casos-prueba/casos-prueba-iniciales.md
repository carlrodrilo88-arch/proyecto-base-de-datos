# Casos de Prueba Iniciales

| ID | Caso | Entrada | Resultado esperado |
| --- | --- | --- | --- |
| CP-01 | Registrar cliente | Datos validos de cliente | Cliente guardado correctamente |
| CP-02 | Registrar tecnico | Datos validos de tecnico | Tecnico guardado correctamente |
| CP-03 | Crear reporte | Cliente, fecha, titulo y usuario valido | Reporte creado con codigo unico |
| CP-04 | Publicar sin PDF | Reporte sin archivo en `archivos_pdf` | La base de datos rechaza el cambio |
| CP-05 | Consultar por ID | Codigo de reporte existente | Se muestra el resumen del reporte |
| CP-06 | Consultar ID inexistente | Codigo no registrado | No se muestran resultados |
| CP-07 | Equipo no autorizado | Identificador no registrado | No permite carga/generacion de PDF |
| CP-08 | Usuario consulta | Usuario con rol consulta | Puede visualizar, no puede modificar |
