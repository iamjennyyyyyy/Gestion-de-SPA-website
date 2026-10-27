# Documentación Completa del Proyecto
## Sistema de Gestión SPA "Belleza & Relax"
### Base de Datos — Asignatura: Base de Datos

---

## Índice

1. [Arquitectura General](#1-arquitectura-general)
2. [Base de Datos (PostgreSQL)](#2-base-de-datos-postgresql)
   - 2.1 [Diagrama Entidad-Relación](#21-diagrama-entidad-relación)
   - 2.2 [Tablas, Campos y CHECK Constraints](#22-tablas-campos-y-check-constraints)
   - 2.3 [Relaciones y Llaves Foráneas](#23-relaciones-y-llaves-foráneas)
   - 2.4 [Triggers 14 — Explicación Detallada](#24-triggers-14--explicación-detallada)
   - 2.5 [Vistas 5](#25-vistas-5)
   - 2.6 [Funciones Auxiliares](#26-funciones-auxiliares)
   - 2.7 [Archivos SQL y Scripts](#27-archivos-sql-y-scripts)
3. [Backend (Node.js + Express)](#3-backend-nodejs--express)
   - 3.1 [Estructura del Backend](#31-estructura-del-backend)
   - 3.2 [Conexión BD → Backend](#32-conexión-bd--backend)
   - 3.3 [Capas: Routes → Controllers → Services → Repositories](#33-capas-routes--controllers--services--repositories)
   - 3.4 [Modelos del lado del Servidor](#34-modelos-del-lado-del-servidor)
   - 3.5 [API Endpoints Completa](#35-api-endpoints-completa)
4. [Frontend (HTML + CSS + JS vanilla)](#4-frontend-html--css--js-vanilla)
   - 4.1 [Conexión Backend → Frontend](#41-conexión-backend--frontend)
   - 4.2 [Archivos JS del Frontend](#42-archivos-js-del-frontend)
   - 4.3 [Pantallas del Sistema](#43-pantallas-del-sistema)
5. [Autenticación y Roles](#5-autenticación-y-roles)
6. [Resumen del Flujo Completo (Ejemplo: Agendar Cita)](#6-resumen-del-flujo-completo-ejemplo-agendar-cita)

---

## 1. Arquitectura General

El sistema usa una arquitectura de **3 capas**:

```
┌──────────────────────────────────────────────────┐
│   FRONTEND (Navegador)                           │
│   index.html + JS (api.js, utils.js, screens)    │
│   Tailwind CSS + FontAwesome + dayjs             │
└──────────────────────┬───────────────────────────┘
                       │ HTTP (fetch) JSON
                       ▼
┌──────────────────────────────────────────────────┐
│   BACKEND (Node.js + Express)                    │
│   app.js ─→ routes ─→ controllers ─→ services    │
│              ↓                                    │
│         middlewares (auth)                        │
│              ↓                                    │
│         models (validación)                       │
└──────────────────────┬───────────────────────────┘
                       │ SQL (pg pool)
                       ▼
┌──────────────────────────────────────────────────┐
│   BASE DE DATOS (PostgreSQL 18)                  │
│   SPA_Services                                   │
│   Tablas + Vistas + Trigger + Functions + CK     │
└──────────────────────────────────────────────────┘
```

**Puertos**: Backend en `localhost:3000`, BD en `localhost:5432`

---

## 2. Base de Datos (PostgreSQL)

### 2.1 Diagrama Entidad-Relación

```
                ┌───────────┐
                │   areas   │───┐
                └───────────┘   │
                      │         │
                      ▼         ▼
                ┌───────────┐ ┌──────────────────────┐
                │ categorias│ │ empleadosporarea     │──┐
                └───────────┘ └──────────────────────┘  │
                      │         ▲                       │
                      ▼         │                       │
                ┌───────────┐ ┌───────────┐            │
                │tratamientos│ │ empleados │◄───────────┘
                └───────────┘ └───────────┘
                  │    ▲         │    ▲
                  │    │         │    │
        ┌─────────┘    │    ┌────┘    │
        ▼              │    ▼         │
┌──────────────┐       │ ┌──────────────────────────┐
│materialespor │       │ │empleadosfijosportratamiento│
│tratamiento   │       │ └──────────────────────────┘
└──────────────┘       │
        │              │
        ▼              │
┌───────────┐          │
│ materiales│          │
└───────────┘          │
                       │
┌───────────┐          │
│  clientes │          │
└───────────┘          │
      │                │
      ▼                ▼
┌─────────────────────────────────────────┐
│              citas                      │
│  (idcliente, idtratamiento, idempleado, │
│   idpaquetevendido, fecha, hora,        │
│   estado, precio, observaciones)        │
└─────┬───────────────────────────────────┘
      │
      ▼
┌──────────────────────┐     ┌──────────────────────┐
│  materialesporcita   │     │   paquetevendido     │
│ (idcita, idmaterial, │     │ (idpaquete, idcliente,│
│  cantidadmaterial    │     │  fechacompra,         │
│  utilizado)          │     │  fechainicio, fechafin│
└──────────────────────┘     │  precio)              │
                             └──────────┬───────────┘
                                        │
                                        ▼
                                ┌──────────────┐
                                │   paquetes   │
                                └──────────────┘
                                      │
                                      ▼
                              ┌────────────────────┐
                              │ contenidopaquete   │
                              │ (idpaquete,        │
                              │  idtratamiento)    │
                              └────────────────────┘

             ┌──────────┐
             │ usuarios │ (login)
             └──────────┘
```

### 2.2 Tablas, Campos y CHECK Constraints

#### **areas**
| Campo | Tipo | Restricciones |
|-------|------|---------------|
| idarea | INTEGER (PK, SERIAL) | |
| nombre | VARCHAR(200) | NOT NULL, UNIQUE, `chk_areas_nombre`: LENGTH(TRIM(nombre)) > 3 |
| cantidadpersonalfijo | INTEGER | DEFAULT 0, `chk_cantidad_personal`: >= 0 |

#### **categorias**
| Campo | Tipo | Restricciones |
|-------|------|---------------|
| idcategoria | INTEGER (PK, SERIAL) | |
| nombre | VARCHAR(200) | NOT NULL, UNIQUE, `chk_categorias_nombre`: LENGTH(TRIM(nombre)) > 3 |
| idarea | INTEGER (FK → areas) | |

#### **tratamientos**
| Campo | Tipo | Restricciones |
|-------|------|---------------|
| idtratamiento | INTEGER (PK, SERIAL) | |
| nombre | VARCHAR(100) | NOT NULL, UNIQUE, `chk_tratamientos_nombre`: LENGTH(TRIM(nombre)) > 3 |
| precio | NUMERIC(10,2) | NOT NULL, `chk_precio_valido_trat`: > 0 |
| descripcion | TEXT | |
| duracion | INTEGER | NOT NULL, `chk_duracion_valida`: > 0 |
| idcategoria | INTEGER (FK → categorias) | |

#### **distritos**
| Campo | Tipo | Restricciones |
|-------|------|---------------|
| iddistrito | INTEGER (PK, SERIAL) | |
| nombre | VARCHAR(100) | UNIQUE, `chk_distritos_nombre`: LENGTH(TRIM(nombre)) > 3 |

#### **empleados**
| Campo | Tipo | Restricciones |
|-------|------|---------------|
| idempleado | INTEGER (PK, SERIAL) | |
| nombre | VARCHAR(100) | NOT NULL, `chk_empleados_nombre`: LENGTH(TRIM(nombre)) > 3 |
| especialidad | VARCHAR(100) | NOT NULL, `chk_especialidad_valida`: IS NOT NULL AND LENGTH > 0 |
| horastrabajo | INTEGER | NOT NULL, `chk_horas_trab_validas`: > 0 |
| direccion | TEXT | NOT NULL, `chk_direccion_valida`: IS NOT NULL AND LENGTH > 0 |
| dni | VARCHAR(11) | NOT NULL |
| telefono | VARCHAR(10) | NOT NULL, `chk_telefono_valido_empleado`: ~ '^\+?[0-9]{7,15}$' |
| iddistrito | INTEGER (FK → distritos) | |
| esfijo | BOOLEAN | Indica si es empleado fijo |

#### **clientes**
| Campo | Tipo | Restricciones |
|-------|------|---------------|
| idcliente | INTEGER (PK, SERIAL) | |
| nombre | VARCHAR(100) | NOT NULL, `chk_clientes_nombre`: LENGTH(TRIM(nombre)) > 3 |
| ci | VARCHAR(15) | NOT NULL, UNIQUE, `chk_ci_valido`: ~ '^[0-9]{11}$' |
| telefono | VARCHAR(15) | `chk_telefono_valido_cliente`: ~ '^\+?[0-9]{7,15}$' |
| email | VARCHAR(100) | UNIQUE, `chk_email_valido`: LIKE '%@%' |

#### **paquetes**
| Campo | Tipo | Restricciones |
|-------|------|---------------|
| idpaquete | INTEGER (PK, SERIAL) | |
| nombre | VARCHAR(100) | NOT NULL, UNIQUE, `chk_paquetes_nombre`: LENGTH(TRIM(nombre)) > 3 |
| precio | NUMERIC(10,2) | NOT NULL, `chk_precio_valido_paquete`: > 0 |
| duraciontotal | INTEGER | |

#### **materiales**
| Campo | Tipo | Restricciones |
|-------|------|---------------|
| idmaterial | INTEGER (PK, SERIAL) | |
| nombre | VARCHAR(100) | NOT NULL, UNIQUE, `chk_materiales_nombre`: LENGTH(TRIM(nombre)) > 3 |
| cantidad | INTEGER | `chk_cantidad_positiva`: >= 0 |

#### **contenidopaquete** (M:N paquetes ↔ tratamientos)
| Campo | Tipo | Restricciones |
|-------|------|---------------|
| idpaquete | INTEGER (FK → paquetes) | PK compuesta |
| idtratamiento | INTEGER (FK → tratamientos) | PK compuesta |

#### **materialesportratamiento** (M:N tratamientos ↔ materiales)
| Campo | Tipo | Restricciones |
|-------|------|---------------|
| idtratamiento | INTEGER (FK → tratamientos) | PK compuesta |
| idmaterial | INTEGER (FK → materiales) | PK compuesta |
| cantidad | INTEGER | DEFAULT 1, `chk_cantidad_matportrat`: > 0 |

#### **empleadosporarea** (M:N empleados ↔ areas)
| Campo | Tipo | Restricciones |
|-------|------|---------------|
| idempleado | INTEGER (FK → empleados) | PK compuesta |
| idarea | INTEGER (FK → areas) | PK compuesta |

#### **paquetevendido**
| Campo | Tipo | Restricciones |
|-------|------|---------------|
| idpaquetevendido | INTEGER (PK, SERIAL) | |
| idpaquete | INTEGER (FK → paquetes) | |
| idcliente | INTEGER (FK → clientes) | |
| fechacompra | DATE | DEFAULT CURRENT_DATE, NOT NULL, `chk_fechacompra_no_futura`: <= CURRENT_DATE |
| fechainicio | DATE | NOT NULL, |
| fechafin | DATE | NOT NULL, `chk_fechas_validas`: fechainicio <= fechafin |
| precio | NUMERIC(10,2) | NOT NULL, `chk_precio_valido_paquetevend`: > 0 |

#### **empleadosfijosportratamiento** (M:N empleados_fijos ↔ tratamientos)
| Campo | Tipo | Restricciones |
|-------|------|---------------|
| idempleadofijo | INTEGER (FK → empleados) | PK compuesta |
| idtratamiento | INTEGER (FK → tratamientos) | PK compuesta |

#### **citas** (tabla central del sistema)
| Campo | Tipo | Restricciones |
|-------|------|---------------|
| idcita | INTEGER (PK, SERIAL) | |
| idcliente | INTEGER (FK → clientes) | |
| idtratamiento | INTEGER (FK → tratamientos) | |
| fecha | DATE | NOT NULL, `chk_fecha_no_pasada`: >= CURRENT_DATE |
| hora | TIME | NOT NULL |
| observaciones | TEXT | `chk_observaciones_validas`: IS NULL OR LENGTH < 500 |
| idpaquetevendido | INTEGER (FK → paquetevendido, nullable) | |
| idempleado | INTEGER (FK → empleados) | |
| estado | VARCHAR(20) | DEFAULT 'pendiente', `citas_estado_check`: IN ('pendiente','realizada','cancelada') |
| precio | NUMERIC(10,2) | NOT NULL, `chk_precio_valido_cita`: >= 0 |

#### **materialesporcita** (M:N citas ↔ materiales)
| Campo | Tipo | Restricciones |
|-------|------|---------------|
| idcita | INTEGER (FK → citas) | PK compuesta |
| idmaterial | INTEGER (FK → materiales) | PK compuesta |
| cantidadmaterialutilizado | INTEGER | NOT NULL, `chk_cantidad_matporcita`: >= 0 |

#### **usuarios**
| Campo | Tipo | Restricciones |
|-------|------|---------------|
| idusuario | INTEGER (PK, SERIAL) | |
| username | VARCHAR(50) | NOT NULL, UNIQUE |
| rol | VARCHAR(20) | DEFAULT 'dependiente', `usuarios_rol_check`: IN ('dependiente','administrador') |
| contrasena | VARCHAR(255) | NOT NULL (bcrypt hash) |
| salt | VARCHAR(32) | NOT NULL |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP |

### 2.3 Relaciones y Llaves Foráneas

La BD tiene **18 llaves foráneas** (integridad referencial):

| # | Columna Origen | Tabla Destino | Columna Destino |
|---|---------------|---------------|-----------------|
| 1 | categorias.idarea → areas.idarea |
| 2 | citas.idcliente → clientes.idcliente |
| 3 | citas.idempleado → empleados.idempleado |
| 4 | citas.idpaquetevendido → paquetevendido.idpaquetevendido |
| 5 | citas.idtratamiento → tratamientos.idtratamiento |
| 6 | contenidopaquete.idpaquete → paquetes.idpaquete |
| 7 | contenidopaquete.idtratamiento → tratamientos.idtratamiento |
| 8 | empleados.iddistrito → distritos.iddistrito |
| 9 | empleadosfijosportratamiento.idempleadofijo → empleados.idempleado |
| 10 | empleadosfijosportratamiento.idtratamiento → tratamientos.idtratamiento |
| 11 | empleadosporarea.idarea → areas.idarea |
| 12 | empleadosporarea.idempleado → empleados.idempleado |
| 13 | materialesporcita.idcita → citas.idcita |
| 14 | materialesporcita.idmaterial → materiales.idmaterial |
| 15 | materialesportratamiento.idmaterial → materiales.idmaterial |
| 16 | materialesportratamiento.idtratamiento → tratamientos.idtratamiento |
| 17 | paquetevendido.idcliente → clientes.idcliente |
| 18 | paquetevendido.idpaquete → paquetes.idpaquete |
| 19 | tratamientos.idcategoria → categorias.idcategoria |

### 2.4 Triggers (14) — Explicación Detallada

Cada trigger tiene una **función asociada** que se ejecuta automáticamente.

---

#### **Trigger 1: `trg_actualizar_cantidad_materiales`**
- **Función**: `actualizar_cantidad_materiales()`
- **Tabla**: `materialesporcita`
- **Evento**: AFTER INSERT
- **¿Qué hace?** Cada vez que se inserta un material usado en una cita, descuenta automáticamente la `cantidad` del stock en la tabla `materiales`.
- **SQL**: `UPDATE materiales SET cantidad = cantidad - NEW.cantidadusada WHERE idmaterial = NEW.idmaterial`
- **Regla de negocio**: El inventario se actualiza automáticamente al registrar materiales usados.

---

#### **Trigger 2: `trg_actualizar_personal_fijo`**
- **Función**: `actualizar_personal_fijo()`
- **Tabla**: `empleadosporarea`
- **Evento**: AFTER INSERT OR UPDATE OR DELETE
- **¿Qué hace?** Mantiene actualizado el campo `cantidadpersonalfijo` en `areas` contando cuántos empleados con `esfijo=true` están asignados a cada área.
- **Lógica**:
  - INSERT: cuenta fijos en el área del nuevo registro
  - DELETE: cuenta fijos en el área del viejo registro
  - UPDATE: si cambió el área, recalcula ambas
- **Regla de negocio**: Cada área sabe cuántos empleados fijos tiene sin consultas manuales.

---

#### **Trigger 3: `trg_registrar_precio_cita`**
- **Función**: `registrar_precio_cita()`
- **Tabla**: `citas`
- **Evento**: BEFORE INSERT OR UPDATE
- **¿Qué hace?** Auto-asigna el precio de la cita:
  - Si **no** tiene `idpaquetevendido` (cita individual): precio = precio del tratamiento
  - Si tiene `idpaquetevendido` (cita de paquete): precio = 0 (el costo lo absorbe el paquete)
- **Regla de negocio**: Las citas de paquete no se cobran individualmente.

---

#### **Trigger 4: `trg_registrar_precio_paquete_vendido`**
- **Función**: `registrar_precio_paquete_vendido()`
- **Tabla**: `paquetevendido`
- **Evento**: BEFORE INSERT OR UPDATE
- **¿Qué hace?** Toma el `precio` del paquete original (tabla `paquetes`) y lo asigna al `paquetevendido` automáticamente.
- **Regla de negocio**: El precio de venta siempre es el precio del paquete.

---

#### **Trigger 5: `trg_validar_dni_cliente`**
- **Función**: `validar_dni_cliente()`
- **Tabla**: `clientes`
- **Evento**: BEFORE INSERT OR UPDATE
- **¿Qué hace?** Valida que el campo `ci` (cédula) tenga:
  - 11 dígitos exactos
  - Solo números
  - El siglo (dígito 7) válido: 0-5 → 1900, 6-8 → 2000
  - Año de nacimiento en rango realista (±120 años)
  - Mes válido (1-12) y día válido según el mes y año bisiesto
- **Regla de negocio**: La cédula cubana tiene formato `YYMMDDXXXXX` donde los primeros 6 dígitos son la fecha de nacimiento.

---

#### **Trigger 6: `trg_validar_dni_empleado`**
- **Función**: `validar_dni_empleado()`
- **Tabla**: `empleados`
- **Evento**: BEFORE INSERT OR UPDATE
- **¿Qué hace?** Exactamente la misma validación que para clientes, pero sobre el campo `dni` del empleado.
- **Regla de negocio**: Todos los empleados deben tener cédula válida.

---

#### **Trigger 7: `trg_validar_nombre_completo_cliente`**
- **Función**: `validar_nombre_completo_cliente()`
- **Tabla**: `clientes`
- **Evento**: BEFORE INSERT OR UPDATE
- **¿Qué hace?** Cuenta los espacios en el nombre. Si hay menos de 1 espacio, lanza excepción ("El nombre debe ser completo").
- **Regla de negocio**: No se permiten nombres de un solo apelativo (debe tener nombre y apellido).

---

#### **Trigger 8: `trg_validar_nombre_completo_empleado`**
- **Función**: `validar_nombre_completo_empleado()`
- **Tabla**: `empleados`
- **Evento**: BEFORE INSERT OR UPDATE
- **¿Qué hace?** Misma validación de nombre completo que para clientes.

---

#### **Trigger 9: `trg_verificar_cantidad_suficiente`**
- **Función**: `verificar_cantidad_suficiente()`
- **Tabla**: `citas`
- **Evento**: BEFORE INSERT
- **¿Qué hace?** Recorre todos los materiales necesarios para el tratamiento (`materialesportratamiento`) y verifica que el stock actual (`materiales.cantidad`) sea suficiente. Si falta algún material, rechaza la inserción.
- **SQL lógico**: `FOR EACH material IN (SELECT FROM materialesportratamiento WHERE idtratamiento = NEW.idtratamiento) LOOP IF stock_actual < cantidad_necesaria THEN RAISE EXCEPTION ...`
- **Regla de negocio**: No se puede agendar una cita si no hay materiales suficientes.

---

#### **Trigger 10: `trg_verificar_disponibilidad_empleado`**
- **Función**: `verificar_disponibilidad_empleado()`
- **Tabla**: `citas`
- **Evento**: BEFORE INSERT OR UPDATE
- **¿Qué hace?** Verifica que el empleado no tenga otra cita en el mismo horario. Considera la duración del tratamiento para detectar solapamientos.
- **SQL lógico**: `IF EXISTS (SELECT 1 FROM citas c JOIN tratamientos t WHERE mismo_empleado, misma_fecha, diferente_cita, y (nueva_hora < c.hora + duracion) AND (nueva_hora + nueva_duracion > c.hora)) THEN RAISE`
- **Regla de negocio**: Un empleado no puede atender dos citas al mismo tiempo.

---

#### **Trigger 11: `trg_verificar_empleado_fijo`**
- **Función**: `verificar_empleado_fijo()`
- **Tabla**: `empleadosfijosportratamiento`
- **Evento**: BEFORE INSERT
- **¿Qué hace?** Verifica que el empleado que se asigna como fijo a un tratamiento tenga `esfijo = true` en la tabla empleados.
- **Regla de negocio**: Solo empleados marcados como fijos pueden aparecer en la tabla de asignación fija por tratamiento.

---

#### **Trigger 12: `trg_verificar_estado_cita`**
- **Función**: `verificar_estado_cita()`
- **Tabla**: `materialesporcita`
- **Evento**: BEFORE INSERT
- **¿Qué hace?** Verifica que la cita asociada tenga estado 'realizada'. Si no, rechaza el registro de materiales usados.
- **Regla de negocio**: Solo se pueden registrar materiales usados en citas que ya fueron realizadas.

---

#### **Trigger 13: `trg_verificar_fecha_y_hora_no_pasada`**
- **Función**: `verificar_fecha_y_hora_no_pasada()`
- **Tabla**: `citas`
- **Evento**: BEFORE INSERT OR UPDATE
- **¿Qué hace?** Impide agendar o modificar una cita a una fecha/hora pasada. En UPDATE, solo valida si la fecha u hora cambiaron.
- **SQL lógico**: `IF NEW.fecha < CURRENT_DATE OR (NEW.fecha = CURRENT_DATE AND NEW.hora < LOCALTIME) THEN RAISE`
- **Regla de negocio**: No se permiten citas en el pasado.

---

#### **Trigger 14: `trg_verificar_fechas_paquete`**
- **Función**: `verificar_fechas_paquete()`
- **Tabla**: `paquetevendido`
- **Evento**: BEFORE INSERT OR UPDATE
- **¿Qué hace?** Valida las reglas de fechas del paquete vendido:
  1. `fechacompra` debe ser la fecha actual (solo en INSERT)
  2. `fechainicio` no puede ser anterior a `fechacompra`
  3. `fechafin` no puede ser anterior a `fechainicio`
  4. `fechafin` no puede superar los 30 días después de `fechacompra`
- **Regla de negocio**: Los paquetes vendidos tienen vigencia máxima de 30 días.

---

#### **Trigger 15 (adicional): `trg_verificar_precio_cita`**
- **Función**: `verificar_precio_cita()`
- **Tabla**: `citas`
- **Evento**: BEFORE INSERT OR UPDATE
- **¿Qué hace?** Valida la regla de precio:
  - Si `idpaquetevendido IS NULL` (cita individual), el precio **no puede ser 0**
  - Si `idpaquetevendido IS NOT NULL` (cita de paquete), el precio **debe ser 0**
- **Regla de negocio**: Las citas individuales siempre tienen precio > 0; las de paquete siempre precio = 0.

### 2.5 Vistas (5)

Las vistas se usan para **simplificar las consultas desde el backend** y mostrar datos desnormalizados.

#### **vw_citas**
- **Ubicación**: `scripts/crear_vistas.sql` línea 1
- **Propósito**: Listar todas las citas con nombres en lugar de IDs
- **JOINs**: LEFT JOIN con `tratamientos`, `empleados`, `clientes`, `paquetevendido`, `paquetes`
- **Campos**: idcita, idtratamiento, tratamientonombre, idcliente, clientenombre, fecha, hora, idempleado, empleadonombre, observaciones, precio, idpaquetevendido, paquetenombre, estado
- **Usado por**: `citaRepository.js` — casi todas las consultas SELECT usan `vw_citas`

#### **vw_empleados**
- **Ubicación**: `scripts/crear_vistas.sql` línea 24
- **Propósito**: Listar empleados con nombre de distrito y área
- **JOINs**: distritos, empleadosporarea, areas
- **Campos**: idempleado, nombre, dni, especialidad, esfijo, horastrabajo, direccion, telefono, iddistrito, distritonombre, idarea, areanombre

#### **vw_paquete_con_tratamientos**
- **Ubicación**: `scripts/crear_vistas.sql` línea 43
- **Propósito**: Mostrar cada paquete con sus tratamientos agregados
- **JOINs**: contenidopaquete, tratamientos + GROUP BY + string_agg
- **Campos**: idpaquete, paquetenombre, duraciontotal, precio, tratamientos (lista separada por comas)
- **Usado por**: Frontend para mostrar detalles de paquetes

#### **vw_paquete_vendido_con_tratamientos**
- **Ubicación**: `scripts/crear_vistas.sql` línea 55
- **Propósito**: Mostrar paquetes vendidos con cliente y tratamientos
- **JOINs**: paquetes, clientes, contenidopaquete, tratamientos + GROUP BY + string_agg
- **Campos**: idpaquetevendido, idpaquete, paquetenombre, duraciontotal, precio, idcliente, clientenombre, tratamientos, fechacompra, fechainicio, fechafin

#### **vw_tratamientos**
- **Ubicación**: `scripts/crear_vistas.sql` línea 76
- **Propósito**: Listar tratamientos con nombre de categoría
- **JOINs**: categorias
- **Campos**: idtratamiento, nombre, precio, duracion, descripcion, idcategoria, categorianombre

### 2.6 Funciones Auxiliares

Archivo: `scripts/02_funciones_basicas.sql`

Son **funciones reutilizables** para validación de datos, definidas en PL/pgSQL:

| Función | Propósito |
|---------|-----------|
| `es_solo_letras_espacios(valor, campo)` | Verifica que un campo solo contenga letras y espacios (regex) |
| `es_solo_numeros(valor, campo)` | Verifica que un campo solo contenga dígitos |
| `validar_longitud_rango(valor, campo, min, max)` | Valida que la longitud esté entre un mínimo y máximo |
| `validar_longitud(valor, campo, exacta)` | Valida que la longitud sea exacta |
| `validar_rango_numero(valor, campo, min, max)` | Valida que un número esté en un rango |

> **Nota**: Estas funciones están definidas pero **no se usan en triggers activos**. Se dejaron como utilidades para futuras validaciones.

### 2.7 Archivos SQL y Scripts

| Archivo | Contenido | Ubicación |
|---------|-----------|-----------|
| `backup.sql` | Dump completo de la BD (tablas, funciones, triggers, datos, secuencias) | `scripts/` |
| `SPA.sql` | Schema original (CREATE TABLE básico) | `scripts/` |
| `triggers_corregidos.sql` | Versión corregida de los 14 triggers | `scripts/` |
| `ediciones_3_triggers.sql` | Otra versión de los triggers | `scripts/` |
| `fix_triggers.sql` | Corrección de nombres de columnas en triggers | `scripts/` |
| `crear_vistas.sql` | Las 5 vistas CREATE OR REPLACE VIEW | `scripts/` |
| `checks 1 .sql` | CHECK constraints + UNIQUE + DEFAULTS | `scripts/` |
| `ediciones 1 .sql` | ALTER TABLE para agregar columnas (CI, teléfono, email a clientes; precio a citas) | `scripts/` |
| `edicion 2.sql` | ALTER TABLE para agregar `cantidad` a materiales | `scripts/` |
| `02_funciones_basicas.sql` | Funciones auxiliares de validación | `scripts/` |
| `datos_prueba_completos.sql` | Datos de prueba en transacción | `scripts/` |
| `insert_datos_adaptado.sql` | Datos de prueba adaptados | `scripts/` |
| `Insert test data.sql` | Datos de prueba detallados con 25 citas | `scripts/` |
| `seed.js` | Script Node.js para poblar la BD (automatizado) | raíz del proyecto |
| `seed_users.js` | Script Node.js para crear usuarios iniciales | `scripts/` |

---

## 3. Backend (Node.js + Express)

### 3.1 Estructura del Backend

```
src/
├── app.js                  ← Punto de entrada del servidor
├── config/
│   └── database.js         ← Conexión a PostgreSQL (Pool)
├── routes/
│   ├── areaRoutes.js
│   ├── authRoutes.js
│   ├── categoriaRoutes.js
│   ├── citaRoutes.js
│   ├── clienteRoutes.js
│   ├── distritoRoutes.js
│   ├── empleadoRoutes.js
│   ├── materialRoutes.js
│   ├── paqueteRoutes.js
│   ├── paqueteVendidoRoutes.js
│   ├── reporteRoutes.js
│   └── tratamientoRoutes.js
├── controllers/
│   ├── areaController.js
│   ├── authController.js
│   ├── categoriaController.js
│   ├── citaController.js
│   ├── clienteController.js
│   ├── distritoController.js
│   ├── empleadoController.js
│   ├── materialController.js
│   ├── paqueteController.js
│   ├── paqueteVendidoController.js
│   ├── reporteController.js
│   └── tratamientoController.js
├── services/
│   ├── areaService.js
│   ├── authService.js
│   ├── categoriaService.js
│   ├── citaService.js
│   ├── clienteService.js
│   ├── distritoService.js
│   ├── empleadoService.js
│   ├── materialService.js
│   ├── paqueteService.js
│   ├── paqueteVendidoService.js
│   ├── reporteService.js
│   └── tratamientoService.js
├── repositories/
│   ├── areaRepository.js
│   ├── categoriaRepository.js
│   ├── citaRepository.js
│   ├── clienteRepository.js
│   ├── distritoRepository.js
│   ├── empleadoRepository.js
│   ├── materialRepository.js
│   ├── materialesPorCita.js
│   ├── paqueteRepository.js
│   ├── paqueteVendidoRepository.js
│   ├── reporteRepository.js
│   ├── tratamientoRepository.js
│   └── usuarioRepository.js
├── models/
│   ├── Area.js, Categoria.js, Cita.js, Cliente.js
│   ├── Distrito.js, Empleado.js, Material.js
│   ├── Paquete.js, PaqueteVendido.js, Tratamiento.js
│   ├── Usuario.js
│   └── Relaciones.js      ← MaterialTratamiento + MaterialCita
├── middlewares/
│   └── authMiddleware.js   ← verificarToken, esAdministrador, esDependiente
├── jobs/
│   └── refreshMaterializedViews.js  ← Tarea programada (node-cron)
└── public/
    ├── index.html          ← SPA principal
    ├── css/
    │   └── style.css
    └── js/
        ├── api.js          ← Funciones fetch con JWT
        ├── utils.js        ← Globales, helpers, componentes UI
        ├── app.js          ← Router SPA + navegación + login
        ├── dep-screens.js  ← Pantallas del dependiente
        ├── dep-citas.js    ← CRUD de citas (dependiente)
        ├── admin-screens.js← Pantallas del administrador
        └── admin-crud.js   ← Motor CRUD genérico para admin
```

### 3.2 Conexión BD → Backend

**Archivo**: `src/config/database.js`

```javascript
const { Pool } = require('pg');

const pool = new Pool({
  host: 'localhost',      // Servidor PostgreSQL
  user: 'postgres',       // Usuario de BD
  password: 'postNicky',  // Contraseña de BD
  database: 'SPA_Services', // Nombre de la BD
  port: 5432              // Puerto PostgreSQL
});

module.exports = pool;
```

**Cómo se usa**: Cada `Repository` importa este `pool` y ejecuta consultas SQL con parámetros seguros (`$1`, `$2`) para prevenir inyección SQL.

```javascript
// Ejemplo en citaRepository.js
const pool = require('../config/database');
const result = await pool.query('SELECT * FROM vw_citas WHERE idcita = $1', [id]);
return result.rows;
```

### 3.3 Capas: Routes → Controllers → Services → Repositories

El backend sigue una **arquitectura en capas** estricta. Cada capa tiene una responsabilidad única:

```
Ruta (Route)
  │ Define la URL y el método HTTP
  │ Ej: GET /api/citas → citaController.listarTodos
  ▼
Controlador (Controller)
  │ Extrae parámetros del request (req.params, req.query, req.body)
  │ Llama al Service correspondiente
  │ Envía la respuesta JSON al frontend
  │ Maneja errores y códigos HTTP (200, 201, 400, 404, 500)
  ▼
Servicio (Service)
  │ Contiene la lógica de negocio
  │ Valida datos usando los Models
  │ Verifica existencias (cliente existe, empleado existe, etc.)
  │ Aplica reglas de negocio (no modificar citas realizadas, etc.)
  │ Llama al Repository
  ▼
Repositorio (Repository)
  │ Ejecuta las consultas SQL directamente
  │ Usa parámetros seguros ($1, $2) para prevenir inyección
  │ Devuelve los datos crudos (rows) al Service
  ▼
Base de Datos (PostgreSQL)
  │ Ejecuta la consulta SQL
  │ Activa triggers automáticamente
  │ Aplica CHECK constraints
  │ Devuelve resultados al Repository
```

**Ejemplo concreto** — flujo completo de `GET /api/citas`:

1. **Route** (`src/routes/citaRoutes.js:5`): `router.get('/', citaController.listarTodos);`
2. **Controller** (`src/controllers/citaController.js:5-11`):
   ```javascript
   async listarTodos(req, res) {
     const citas = await citaService.listarCitas();
     res.json({ success: true, count: citas.length, data: citas });
   }
   ```
3. **Service** (`src/services/citaService.js:13-15`):
   ```javascript
   async listarCitas() {
     return await citaRepository.listarTodos();
   }
   ```
4. **Repository** (`src/repositories/citaRepository.js:4-12`):
   ```javascript
   async listarTodos() {
     // Primero: auto-cancelar citas pendientes pasadas
     await pool.query(`UPDATE citas SET estado = 'cancelada'
       WHERE estado = 'pendiente'
       AND (fecha < CURRENT_DATE OR (fecha = CURRENT_DATE AND CURRENT_TIME > '17:00:00'))`);
     // Luego: obtener todas las citas desde la vista
     const result = await pool.query(`SELECT * from vw_citas`);
     return result.rows;
   }
   ```

### 3.4 Modelos del lado del Servidor

Los modelos en `src/models/` son **clases JavaScript** que:
1. Definen la estructura de los datos (constructor)
2. Validan los datos **antes** de llegar a la BD (validación del lado del servidor)

Ejemplo `Cita.js`:
```javascript
// Constructor
constructor(datos) {
  this.idcita = datos.idcita || null;
  this.idtratamiento = datos.idtratamiento || null;
  // ...
  this.estado = datos.estado || 'pendiente';
}

// Validación para creación
validar() {
  if (!this.idtratamiento) throw new Error('El tratamiento es obligatorio');
  if (!this.fecha) throw new Error('La fecha es obligatoria');
  if (!this.hora) throw new Error('La hora es obligatoria');
  // Valida que la hora esté en el array horasValidas (9:00-18:00 cada 30 min)
  const horasValidas = ['09:00','09:30',...,'17:30','18:00'];
  if (!horasValidas.includes(this.hora))
    throw new Error('Horario no válido');
  // Valida que no sea domingo
  if (dayjs(this.fecha).day() === 0)
    throw new Error('No se atienden los domingos');
  // ...
}

// Validación para actualización (parcial)
static validarActualizacion(datos) {
  // Solo valida los campos que vienen en datos
  if (datos.fecha !== undefined && datos.hora !== undefined) {
    // Validar fecha completa si ambos vienen
  }
}
```

Todos los modelos siguen este patrón. Los más importantes son:
- `Cita.js` — validaciones de fecha, hora, estado, precio
- `Cliente.js` — validación de CI (cédula cubana con siglo), nombre completo, email, teléfono
- `Empleado.js` — validación de DNI, nombre completo
- `Relaciones.js` — `MaterialTratamiento` y `MaterialCita` (relaciones M:N)
- `Usuario.js` — validación de username, rol, encriptación bcrypt

### 3.5 API Endpoints Completa

Todas las rutas están en `src/routes/`.

#### Autenticación (`/api/auth`)
| Método | Ruta | Descripción |
|--------|------|-------------|
| POST | `/api/auth/login` | Login (devuelve JWT + usuario) |

#### Áreas (`/api/areas`)
| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/` | Listar todas |
| GET | `/:id` | Obtener por ID |
| POST | `/` | Crear |
| PUT | `/:id` | Actualizar |
| DELETE | `/:id` | Eliminar |

#### Categorías (`/api/categorias`)
| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/` | Listar todas |
| GET | `/:id` | Obtener por ID |
| POST | `/` | Crear |
| PUT | `/:id` | Actualizar |
| DELETE | `/:id` | Eliminar |

#### Clientes (`/api/clientes`)
| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/` | Listar todos (con query `?q=` para búsqueda) |
| GET | `/:id` | Obtener por ID |
| POST | `/` | Crear |
| PUT | `/:id` | Actualizar |
| DELETE | `/:id` | Eliminar |

#### Empleados (`/api/empleados`)
| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/` | Listar todos |
| GET | `/:id` | Obtener por ID |
| GET | `/:idTratamiento/empleados-disponibles` | Obtener empleados disponibles para un tratamiento |
| POST | `/` | Crear |
| PUT | `/:id` | Actualizar |
| DELETE | `/:id` | Eliminar |

#### Distritos (`/api/distritos`)
| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/` | Listar todos |
| GET | `/:id` | Obtener por ID |
| POST | `/` | Crear |
| PUT | `/:id` | Actualizar |
| DELETE | `/:id` | Eliminar |

#### Materiales (`/api/materiales`)
| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/` | Listar todos |
| GET | `/:id` | Obtener por ID |
| POST | `/` | Crear |
| PUT | `/:id` | Actualizar |
| DELETE | `/:id` | Eliminar |

#### Paquetes (`/api/paquetes`)
| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/` | Listar todos |
| GET | `/:id` | Obtener por ID |
| POST | `/` | Crear |
| PUT | `/:id` | Actualizar |
| DELETE | `/:id` | Eliminar |

#### Tratamientos (`/api/tratamientos`)
| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/` | Listar todos |
| GET | `/:id` | Obtener por ID |
| POST | `/` | Crear |
| PUT | `/:id` | Actualizar |
| DELETE | `/:id` | Eliminar |

#### Paquetes Vendidos (`/api/paquetes-vendidos`)
| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/` | Listar todos |
| GET | `/:id` | Obtener por ID |
| GET | `/filtros/precio` | Filtrar por rango de precio |
| POST | `/` | Crear |
| PUT | `/:id` | Actualizar |
| DELETE | `/:id` | Eliminar |

#### Citas (`/api/citas`) — tabla central (17 endpoints)
| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/` | Listar todas (auto-cancela pasadas) |
| GET | `/cliente/:idCliente` | Por cliente |
| GET | `/empleado/:idEmpleado` | Por empleado |
| GET | `/tratamiento/:idTratamiento` | Por tratamiento |
| GET | `/paquete/:idPaquete` | Por paquete |
| GET | `/paquete-vendido/:idPaqueteVendido` | Por paquete vendido |
| GET | `/fecha` | Por fecha (query: ?fecha=YYYY-MM-DD) |
| GET | `/estado` | Por estado (query: ?estado=pendiente) |
| GET | `/intervalo/fechas` | Rango de fechas (query: ?fecha1=&fecha2=) |
| GET | `/intervalo/precio` | Rango de precio (query: ?precioMin=&precioMax=) |
| GET | `/material/:idMaterial` | Citas que usan un material |
| GET | `/:idCita` | Por ID |
| GET | `/:idCita/materiales` | Materiales de una cita |
| POST | `/` | Crear cita |
| POST | `/:idCita/materiales/:idMaterial` | Asignar material a cita |
| PUT | `/:idCita` | Actualizar cita |
| DELETE | `/:idCita` | Eliminar cita |
| DELETE | `/:idCita/materiales/:idMaterial` | Desasignar material |

#### Reportes (`/api/reportes`)
| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/empleados-por-cliente/:idCliente` | Empleados que atendieron a un cliente |
| GET | `/servicios-cliente/:idCliente` | Servicios de un cliente por rango de fechas |

---

## 4. Frontend (HTML + CSS + JS vanilla)

### 4.1 Conexión Backend → Frontend

**Archivo**: `src/public/js/api.js`

El frontend se comunica con el backend mediante **fetch()** con autenticación JWT.

```javascript
const api = {
  get: apiGet,    // fetch(url, { headers: { Authorization: 'Bearer token' } })
  post: apiPost,  // fetch(url, { method: 'POST', body: JSON.stringify(data) })
  put: apiPut,    // fetch(url, { method: 'PUT', body: JSON.stringify(data) })
  del: apiDelete  // fetch(url, { method: 'DELETE' })
};
```

**Flujo de autenticación:**
1. Usuario hace login → backend devuelve `{ token, usuario }`
2. Frontend guarda en `localStorage` (claves: `spa_token`, `spa_user`)
3. Cada petición incluye el header `Authorization: Bearer <token>`
4. Si el token expira (401), redirige al login automáticamente

**Archivo**: `src/public/index.html`
- Punto de entrada único (SPA)
- CDN: Tailwind CSS, FontAwesome, dayjs
- Renderizado inicial: login screen
- Las pantallas se cargan dinámicamente según navegación

**Router SPA**: `src/public/js/app.js`
- Maneja la navegación cliente-side (sin recargar página)
- Objeto global `SCREENS` contiene todas las pantallas
- Función `navigate(page)` cambia la pantalla actual
- Sidebar dinámico según rol (dependiente vs administrador)

### 4.2 Archivos JS del Frontend

| Archivo | Propósito | Ubicación |
|---------|-----------|-----------|
| `api.js` | Cliente HTTP con JWT | `src/public/js/api.js` |
| `utils.js` | Funciones globales (`$`, `toast`, `openModal`, `showLoading`, `showEmpty`, formateo) | `src/public/js/utils.js` |
| `app.js` | Router SPA, login, sidebar, navegación | `src/public/js/app.js` |
| `dep-screens.js` | Pantallas del dependiente (tratamientos, paquetes, reportes, inicio, venta de paquetes) | `src/public/js/dep-screens.js` |
| `dep-citas.js` | CRUD de citas para dependiente (listar, crear, editar, ver detalle, cambiar estado, autocomplete) | `src/public/js/dep-citas.js` |
| `admin-screens.js` | Pantallas del admin (tratamientos con panel expandible, CRUD empleados, clientes, reportes admin) | `src/public/js/admin-screens.js` |
| `admin-crud.js` | Motor CRUD genérico para admin (reutilizable para áreas, categorías, materiales, distritos, paquetes) | `src/public/js/admin-crud.js` |

### 4.3 Pantallas del Sistema

#### Rol: Dependiente
| Pantalla | Archivo | Función/Key |
|----------|---------|-------------|
| Inicio / Dashboard | `dep-screens.js` | `SCREENS.inicio` |
| Tratamientos (solo lectura) | `dep-screens.js` | `SCREENS.tratamientos` |
| Paquetes (ver + vender) | `dep-screens.js` | `SCREENS.paquetes` |
| Paquetes Vendidos | `dep-screens.js` | `SCREENS['paquetes-vendidos']` |
| Mis Citas (CRUD completo) | `dep-citas.js` | `SCREENS.citas` |
| Reportes | `dep-screens.js` | `SCREENS.reportes` |
| Mapa | `dep-screens.js` | `SCREENS.mapa` |

#### Rol: Administrador
| Pantalla | Archivo | Función/Key |
|----------|---------|-------------|
| Dashboard | `admin-screens.js` | `SCREENS['admin-inicio']` |
| Tratamientos (CRUD + materiales + empleados fijos) | `admin-screens.js` | `SCREENS['admin-tratamientos']` |
| Áreas | `admin-crud.js` (genérico) | `crudScreen({page:'admin-areas',...})` |
| Categorías | `admin-crud.js` | `crudScreen({page:'admin-categorias',...})` |
| Distritos | `admin-crud.js` | `crudScreen({page:'admin-distritos',...})` |
| Materiales | `admin-crud.js` | `crudScreen({page:'admin-materiales',...})` |
| Paquetes | `admin-crud.js` | `crudScreen({page:'admin-paquetes',...})` |
| Empleados | `admin-screens.js` | `SCREENS['admin-empleados']` |
| Clientes | `admin-screens.js` | `SCREENS['admin-clientes']` |
| Paquetes Vendidos | `admin-screens.js` | `SCREENS['admin-paquetes-vendidos']` |
| Reportes e Informes | `admin-screens.js` | `SCREENS['admin-reportes']` |

---

## 5. Autenticación y Roles

**Middleware**: `src/middlewares/authMiddleware.js`

```javascript
// Verifica que el token JWT sea válido
const verificarToken = (req, res, next) => { ... };

// Verifica que el rol sea 'administrador'
const esAdministrador = (req, res, next) => { ... };

// Verifica que el rol sea 'dependiente'
const esDependiente = (req, res, next) => { ... };
```

**En `app.js`**: Todas las rutas `/api/*` (excepto `/api/auth`) usan `verificarToken`:
```javascript
app.use('/api/citas', verificarToken, citaRoutes);
```

**Login**: `POST /api/auth/login` → recibe `{ username, password }` → verifica contra BD (bcrypt) → devuelve `{ success, token, usuario: { id, username, rol } }`

**Roles en Frontend**:
- `dependiente`: ve sidebar reducido (Inicio, Tratamientos, Paquetes, Citas, Reportes, Mapa)
- `administrador`: ve sidebar completo (Dashboard, Tratamientos, Empleados, Clientes, Áreas, Categorías, Distritos, Materiales, Paquetes, Paquetes Vendidos, Reportes)

---

## 6. Resumen del Flujo Completo (Ejemplo: Agendar Cita)

Para entender cómo todas las piezas se conectan, sigamos el flujo de **agendar una cita**:

### Paso 1: Frontend — Usuario llena el formulario
**Archivo**: `src/public/js/dep-citas.js`
- Usuario selecciona cliente (con autocomplete que llama `GET /api/clientes?q=...`)
- Selecciona tratamiento (carga empleados disponibles vía `GET /api/empleados/:id/empleados-disponibles`)
- Selecciona fecha y hora (solo slots de 30 min, 9:00-18:00)
- Hace clic en "Agendar" → llama `guardarCita()`

### Paso 2: Frontend — Envío HTTP
**Archivo**: `src/public/js/api.js`
```javascript
const d = await api.post('/api/citas', {
  idcliente: Number(idcliente),
  idtratamiento: Number(idtratamiento),
  fecha, hora, idempleado: Number(idempleado),
  observaciones, precio: Number(precio) || 0
});
```

### Paso 3: Route → Controller
**Route**: `citaRoutes.js:18` → `router.post('/', citaController.crear);`
**Controller**: `citaController.js:162-168`
```javascript
async crear(req, res) {
  const cita = await citaService.crearCita(req.body);
  res.status(201).json({ success: true, data: cita });
}
```

### Paso 4: Service — Validación
**Service**: `citaService.js:124-139`
```javascript
async crearCita(datos) {
  const cita = new Cita(datos);  // Crea instancia del modelo
  cita.validar();                 // Valida: campos requeridos, fecha, hora, domingo, precio
  // Verifica que cliente, tratamiento y empleado existan en BD
  const cliente = await clienteRepository.buscarPorId(datos.idcliente);
  if (!cliente) throw new Error('El cliente no existe');
  // ...
  return await citaRepository.crear(datos);
}
```

### Paso 5: Repository — SQL INSERT
**Repository**: `citaRepository.js:78-136`
```javascript
async crear(datos) {
  // Construye dinámicamente: INSERT INTO citas (campo1, campo2, ...) VALUES ($1, $2, ...)
  const query = `INSERT INTO citas (${campos.join(', ')}) VALUES (${placeholders}) RETURNING *`;
  const result = await pool.query(query, valores);
  return result.rows[0];
}
```

### Paso 6: Base de Datos — Triggers se Activan
Cuando PostgreSQL ejecuta el `INSERT INTO citas ...`, se activan automáticamente:

1. **BEFORE INSERT**: `trg_verificar_cantidad_suficiente` — verifica stock de materiales
2. **BEFORE INSERT**: `trg_verificar_disponibilidad_empleado` — verifica que el empleado esté libre
3. **BEFORE INSERT**: `trg_verificar_fecha_y_hora_no_pasada` — verifica que no sea fecha pasada
4. **BEFORE INSERT**: `trg_registrar_precio_cita` — asigna precio automático
5. **BEFORE INSERT**: `trg_verificar_precio_cita` — valida reglas de precio

Además, los **CHECK constraints** validan:
- `citas_estado_check`: estado debe ser pendiente/realizada/cancelada
- `chk_fecha_no_pasada`: fecha >= CURRENT_DATE
- `chk_precio_valido_cita`: precio >= 0
- `chk_observaciones_validas`: observaciones < 500 caracteres

### Paso 7: Respuesta al Frontend
PostgreSQL devuelve el registro creado → Repository lo pasa al Service → Service al Controller → Controller responde JSON → Frontend muestra toast de éxito y recarga la lista.

---

## Resumen de Archivos Clave para la Conexión

### BD ↔ Backend
| Archivo | Rol |
|---------|-----|
| `src/config/database.js` | Pool de conexión a PostgreSQL |
| `src/repositories/*.js` | Ejecutan SQL directamente |
| `scripts/backup.sql` | Dump completo de la BD |
| `scripts/crear_vistas.sql` | Vistas que los repositorios consultan |

### Backend ↔ Frontend
| Archivo | Rol |
|---------|-----|
| `src/app.js` | Servidor Express, monta rutas |
| `src/routes/*.js` | Define endpoints HTTP |
| `src/middlewares/authMiddleware.js` | Protege rutas con JWT |
| `src/public/js/api.js` | Cliente HTTP con autenticación |
| `src/public/index.html` | Punto de entrada SPA |

---

*Documento generado para el proyecto final de Base de Datos — SPA "Belleza & Relax"*
