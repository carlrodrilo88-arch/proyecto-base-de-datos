# Modelo relacional final - Entrega 4

Diagrama editable del esquema implementado en `sql/ddl/001_schema.sql`. La
imagen exportada está en `docs/diagramas/ENTREGA4_MODELO_RELACIONAL.png`.
Para regenerarla, pegue el bloque Mermaid en https://mermaid.live y exporte PNG.

- Entidades principales: roles, usuarios, equipos_autorizados, instituciones,
  servicios_solicitantes, equipos_medicos, tecnicos, proveedores, reportes,
  archivos_pdf y auditoria_eventos.
- Relaciones N:M resueltas: `reporte_tecnico` (reportes ↔ técnicos) y
  `reporte_proveedor` (reportes ↔ proveedores).
- Las FK usan `ON UPDATE CASCADE`; `ON DELETE RESTRICT` salvo las asociativas y
  `archivos_pdf` (`CASCADE`), y `equipos_autorizados` y `auditoria_eventos`
  (`SET NULL`).

```mermaid
erDiagram
    roles ||--o{ usuarios : "asigna"
    usuarios ||--o{ reportes : "crea"
    usuarios |o--o{ auditoria_eventos : "ejecuta"
    instituciones ||--o{ servicios_solicitantes : "agrupa"
    instituciones ||--o{ equipos_medicos : "posee"
    servicios_solicitantes ||--o{ reportes : "solicita"
    equipos_medicos |o--o{ reportes : "se documenta en"
    proveedores |o--o{ reportes : "plantilla"
    equipos_autorizados |o--o{ reportes : "constancia"
    reportes ||--o{ reporte_tecnico : ""
    tecnicos ||--o{ reporte_tecnico : ""
    reportes ||--o{ reporte_proveedor : ""
    proveedores ||--o{ reporte_proveedor : ""
    reportes ||--o{ archivos_pdf : "versiona"

    roles {
        bigint id_rol PK
        varchar nombre UK
        text descripcion
        boolean activo
        timestamp creado_en
    }
    usuarios {
        bigint id_usuario PK
        bigint id_rol FK
        varchar nombre
        varchar usuario UK
        varchar correo UK
        text password_hash
        boolean debe_cambiar_password
        boolean activo
        timestamp creado_en
    }
    equipos_autorizados {
        bigint id_equipo_autorizado PK
        varchar nombre
        varchar identificador_equipo UK
        text descripcion
        boolean activo
        timestamp creado_en
    }
    instituciones {
        bigint id_institucion PK
        varchar nombre
        text direccion
        varchar telefono
        varchar correo
        boolean activo
        timestamp creado_en
    }
    servicios_solicitantes {
        bigint id_servicio_solicitante PK
        bigint id_institucion FK
        varchar nombre "UK con id_institucion"
        boolean activo
        timestamp creado_en
    }
    equipos_medicos {
        bigint id_equipo_medico PK
        bigint id_institucion FK
        varchar nombre
        varchar numero_bien "UK con id_institucion"
        varchar marca
        varchar modelo
        varchar numero_serie
        boolean activo
        timestamp creado_en
    }
    tecnicos {
        bigint id_tecnico PK
        varchar nombre
        varchar telefono
        varchar correo UK
        varchar especialidad
        boolean activo
        timestamp creado_en
    }
    proveedores {
        bigint id_proveedor PK
        varchar nombre
        varchar nit UK
        varchar telefono
        varchar correo
        text direccion
        text logo_url
        text pie_pagina
        varchar codigo_plantilla UK
        boolean activo
        timestamp creado_en
    }
    reportes {
        bigint id_reporte PK
        varchar codigo_reporte UK
        bigint id_servicio_solicitante FK
        bigint id_equipo_medico FK
        bigint id_proveedor_plantilla FK
        bigint id_usuario_creador FK
        bigint id_equipo_autorizado FK
        varchar titulo
        text observaciones
        varchar numero_pedido_nog
        varchar descripcion_equipo
        varchar marca
        varchar modelo
        varchar numero_serie
        varchar numero_bien
        varchar tipo_servicio
        text especificaciones_tecnicas
        text recomendaciones
        date fecha_reporte
        varchar estado "borrador, publicado, anulado"
        timestamp creado_en
        timestamp actualizado_en
    }
    reporte_tecnico {
        bigint id_reporte PK,FK
        bigint id_tecnico PK,FK
        varchar rol_en_reporte
    }
    reporte_proveedor {
        bigint id_reporte PK,FK
        bigint id_proveedor PK,FK
        text observacion
    }
    archivos_pdf {
        bigint id_archivo_pdf PK
        bigint id_reporte FK
        text url_archivo
        varchar hash_archivo
        bigint tamano_bytes
        varchar estado "activo, reemplazado, eliminado"
        timestamp fecha_carga
    }
    auditoria_eventos {
        bigint id_evento PK
        bigint id_usuario FK
        varchar entidad
        bigint entidad_id
        varchar accion
        text detalle
        varchar ip_origen
        timestamp fecha_evento
    }
```

Los datos del equipo copiados en `reportes` (descripción, marca, modelo, serie y
bien) son una instantánea histórica intencional: conservan lo que se documentó
aunque el inventario cambie después, por lo que no violan la 3FN.
