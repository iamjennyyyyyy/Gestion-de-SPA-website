# Flujo del Sistema, Roles y Reglas de Negocio

---

## 1. Flujo General del Sistema

El sistema de gestión SPA "Belleza & Relax" controla todo el ciclo de vida de un negocio de servicios de estética y bienestar. El flujo principal es:

```
                    ┌──────────────────────────┐
                    │      1. LOGIN            │
                    │  (dependiente / admin)   │
                    └──────────┬───────────────┘
                               │
          ┌────────────────────┴────────────────────┐
          ▼                                         ▼
┌──────────────────────┐            ┌──────────────────────────┐
│   DEPENDIENTE        │            │   ADMINISTRADOR          │
│                      │            │                          │
│  • Ver dashboard     │            │  • Ver dashboard         │
│  • Ver tratamientos  │            │  • CRUD tratamientos     │
│  • Ver paquetes      │            │  • CRUD empleados        │
│  • Vender paquetes   │            │  • CRUD clientes         │
│  • Ver citas del día │            │  • CRUD áreas            │
│  • AGENDAR CITA      │            │  • CRUD categorías       │
│  • Cancelar cita     │            │  • CRUD distritos        │
│  • Realizar cita     │            │  • CRUD materiales       │
│  • Ver reportes      │            │  • CRUD paquetes         │
│  • Ver mapa          │            │  • CRUD empleados fijos  │
│                      │            │  • Ver paquetes vendidos │
│                      │            │  • Ver reportes          │
└──────────────────────┘            └──────────────────────────┘
```

### Flujo Detallado — Ciclo de una Cita

```
1. CLIENTE llega al SPA
       │
       ▼
2. DEPENDIENTE busca o registra al cliente
       │  (autocomplete en frontend → GET /api/clientes?q=)
       ▼
3. DEPENDIENTE selecciona un TRATAMIENTO
       │  (se cargan empleados disponibles para ese tratamiento)
       ▼
4. DEPENDIENTE selecciona EMPLEADO + FECHA + HORA
       │  (solo horarios válidos 9:00-18:00, slots cada 30 min)
       ▼
5. SISTEMA verifica (Service + BD Triggers):
       │  • Cliente existe
       │  • Tratamiento existe
       │  • Empleado existe y está disponible (no tiene otra cita)
       │  • Hay stock suficiente de materiales
       │  • Fecha no es pasada ni domingo
       │  • Hora está en horario laboral
       ▼
6. CITA se crea con estado "pendiente"
       │  (trigger asigna precio automático según tratamiento)
       ▼
7. LLEGA EL DÍA DE LA CITA
       │
       ├──→ CLIENTE ASISTE:
       │        DEPENDIENTE abre la cita → "Realizar"
       │        SISTEMA cambia estado a "realizada"
       │        DEPENDIENTE registra materiales usados
       │        TRIGGER descuenta stock automáticamente
       │
       └──→ CLIENTE NO ASISTE:
                DEPENDIENTE cancela la cita
                SISTEMA cambia estado a "cancelada"
                (Al final del día, las pendientes pasadas
                 se auto-cancelan al listar citas)
```

### Flujo Detallado — Venta de un Paquete

```
1. CLIENTE solicita un paquete
       │
       ▼
2. DEPENDIENTE busca al cliente
       │
       ▼
3. DEPENDIENTE selecciona el paquete en pantalla
       │  (botón "Vender" en la lista de paquetes)
       ▼
4. DEPENDIENTE llena:
       │  • Cliente (autocomplete)
       │  • Fecha de inicio
       │  • Fecha de fin (máx 30 días después de hoy)
       ▼
5. SISTEMA valida (Service + Triggers):
       │  • Cliente existe
       │  • Paquete existe
       │  • fechainicio >= hoy
       │  • fechafin >= fechainicio
       │  • fechafin <= fechainicio + 30 días
       ▼
6. PAQUETE VENDIDO se crea
       │  (trigger asigna precio del paquete automáticamente)
       ▼
7. DEPENDIENTE agenda las CITAS del paquete
       │  (cada tratamiento incluido en el paquete,
       │   cada cita con precio=0 porque ya lo pagó en el paquete)
       ▼
8. Se sigue el mismo ciclo de citas del flujo anterior
```

### Auto-Cancelación de Citas

Cada vez que se listan las citas (`GET /api/citas`), el repositorio ejecuta:

```sql
UPDATE citas SET estado = 'cancelada'
WHERE estado = 'pendiente'
  AND (fecha < CURRENT_DATE
       OR (fecha = CURRENT_DATE AND CURRENT_TIME > '17:00:00'))
```

Esto significa que al llegar un nuevo día, todas las citas pendientes del día anterior se cancelan automáticamente. No requiere acción manual.

---

## 2. Rol del Dependiente

### ¿Qué puede hacer?

El **dependiente** es el empleado de mostrador que interactúa directamente con los clientes.

#### Pantalla de Inicio / Dashboard
- Ve el resumen del día: citas de hoy, ventas de hoy, clientes nuevos
- Atajos rápidos a crear cita y vender paquete

#### Gestión de Tratamientos (solo lectura)
- Ve todos los tratamientos disponibles con precio, duración y descripción
- No puede crear, editar ni eliminar tratamientos

#### Gestión de Paquetes
- Ve todos los paquetes disponibles
- **Vende paquetes**: asigna un paquete a un cliente, define fechas de vigencia

#### Gestión de Citas (función principal)
- **Crear cita**: selecciona cliente, tratamiento, empleado, fecha y hora
- **Ver detalle**: información completa de la cita
- **Realizar cita**: marca la cita como realizada (cuando el cliente asiste)
- **Cancelar cita**: marca la cita como cancelada
- **Cambiar estado**: puede cambiar entre pendiente/realizada/cancelada
- **Editar cita**: modifica fecha, hora, empleado (solo si aún está pendiente)

#### Reportes
- Ve reportes del negocio:
  - Citas hoy / Ventas hoy
  - Top tratamientos más solicitados
  - Gráficos de tendencias

#### Mapa
- Muestra la ubicación del SPA (Google Maps embebido)

### ¿Qué NO puede hacer?
- No puede crear/modificar/eliminar empleados
- No puede crear/modificar/eliminar clientes (pero sí **registrar clientes nuevos rápidamente** desde el modal de cita)
- No puede gestionar inventario de materiales
- No puede gestionar áreas, categorías, distritos
- No puede gestionar usuarios del sistema

---

## 3. Rol del Administrador

### ¿Qué puede hacer?

El **administrador** tiene control total sobre la configuración del sistema.

#### Dashboard
- Resumen general: citas totales, ingresos, clientes, empleados
- Estadísticas y métricas del negocio

#### Gestión de Tratamientos (CRUD completo)
- **Crear**, **editar** y **eliminar** tratamientos
- Al eliminar un tratamiento con citas asociadas, ofrece **mover las citas a otro tratamiento**
- Ver panel expandible con:
  - Materiales necesarios para el tratamiento
  - Empleados fijos asignados al tratamiento

#### Gestión de Empleados (CRUD completo)
- **Crear**, **editar** y **eliminar** empleados
- Campos: nombre, especialidad, DNI, teléfono, dirección, distrito, horas de trabajo, tipo (fijo/suplente)
- Asignar empleados a áreas
- Asignar empleados fijos a tratamientos

#### Gestión de Clientes
- **Crear**, **editar** y **eliminar** clientes
- Ver todos los clientes registrados
- Validación de CI (cédula cubana de 11 dígitos)

#### Gestión de Áreas (CRUD genérico)
- Crear, editar, eliminar áreas del SPA
- Cada área tiene un nombre único y un conteo automático de personal fijo

#### Gestión de Categorías (CRUD genérico)
- Crear, editar, eliminar categorías de tratamientos
- Cada categoría pertenece a un área

#### Gestión de Distritos (CRUD genérico)
- Crear, editar, eliminar distritos (para ubicación de empleados)

#### Gestión de Materiales (CRUD genérico)
- Crear, editar, eliminar materiales
- Control de stock (cantidad disponible)
- Los materiales se descuentan automáticamente al usarlos en citas

#### Gestión de Paquetes (CRUD genérico)
- Crear, editar, eliminar paquetes
- Definir qué tratamientos incluye cada paquete

#### Paquetes Vendidos
- Ver todos los paquetes vendidos con detalle de cliente, fechas y tratamientos

#### Reportes e Informes
- Reportes detallados del negocio
- Consultas específicas (empleados por cliente, servicios por cliente en rango de fechas)

### ¿Qué NO puede hacer?
- No puede agendar citas (eso es función del dependiente)
- No puede realizar/cancelar citas (tampoco, es del dependiente)
  - Aunque técnicamente podría por la API, la interfaz admin no tiene esas pantallas

---

## 4. Reglas de Negocio

Las reglas de negocio están implementadas en **tres niveles**:
1. **Frontend** (JavaScript): validaciones visuales antes de enviar
2. **Backend Services** (Node.js): validaciones lógicas en el servidor
3. **Base de Datos** (PostgreSQL): triggers + check constraints (última barrera)

### 4.1 Reglas sobre Citas

| # | Regla | Dónde se aplica | Explicación |
|---|-------|-----------------|-------------|
| 1 | **No citas en fecha pasada** | Trigger `trg_verificar_fecha_y_hora_no_pasada`, Model `Cita.validar()`, CHECK `chk_fecha_no_pasada` | No se puede crear o modificar una cita con fecha/hora anterior al momento actual |
| 2 | **No citas los domingos** | Model `Cita.validar()`, Model `Cita.validarActualizacion()` | El SPA no atiende los domingos |
| 3 | **Horario laboral 9:00-18:00** | Model `Cita.validar()` (array `horasValidas`) | Solo se permiten citas en slots de 30 min entre 09:00 y 18:00 |
| 4 | **Estados válidos** | CHECK `citas_estado_check`, Model `Cita.validar()` | Una cita solo puede estar: pendiente, realizada o cancelada |
| 5 | **No modificar citas realizadas** | Service `citaService.actualizarCita()` | Si una cita ya fue realizada, no se puede editar |
| 6 | **No modificar citas canceladas** | Service `citaService.actualizarCita()` | Si una cita ya fue cancelada, no se puede editar |
| 7 | **Precio automático individual** | Trigger `trg_registrar_precio_cita` | Si la cita no pertenece a un paquete, el precio se copia del tratamiento |
| 8 | **Precio cero en paquete** | Trigger `trg_registrar_precio_cita` + `trg_verificar_precio_cita` | Si la cita pertenece a un paquete, el precio debe ser 0 (ya se pagó en el paquete) |
| 9 | **Individual siempre con precio > 0** | Trigger `trg_verificar_precio_cita` | Las citas individuales no pueden tener precio 0 |
| 10 | **Stock suficiente de materiales** | Trigger `trg_verificar_cantidad_suficiente` | Antes de agendar, verifica que hayan materiales en stock para el tratamiento |
| 11 | **Empleado no puede tener dos citas simultáneas** | Trigger `trg_verificar_disponibilidad_empleado` | Verifica solapamiento de horarios considerando la duración del tratamiento |
| 12 | **Observaciones máx 500 caracteres** | CHECK `chk_observaciones_validas`, Model `Cita.validar()` | Las observaciones no pueden exceder 500 caracteres |
| 13 | **Auto-cancelación al listar** | Repository `citaRepository.listarTodos()` | Las citas pendientes con fecha pasada se cancelan automáticamente al consultar la lista |

### 4.2 Reglas sobre Clientes

| # | Regla | Dónde se aplica | Explicación |
|---|-------|-----------------|-------------|
| 14 | **CI obligatorio y único** | CHECK `chk_ci_valido`, UNIQUE `ci_unique_cliente`, Model `Cliente.validar()` | Cada cliente debe tener una cédula de 11 dígitos, única en el sistema |
| 15 | **CI con formato de fecha válida** | Trigger `trg_validar_dni_cliente`, Model `Cliente.validarFormatoDNI()` | La cédula cubana YYMMDD debe representar una fecha de nacimiento real (siglo, mes, día válidos) |
| 16 | **Nombre completo obligatorio** | Trigger `trg_validar_nombre_completo_cliente`, Model `Cliente.validar()` | El nombre debe tener al menos un espacio (nombre + apellido) |
| 17 | **Teléfono con formato válido** | CHECK `chk_telefono_valido_cliente` | Solo números, opcionalmente con prefijo +, entre 7 y 15 dígitos |
| 18 | **Email con formato válido** | CHECK `chk_email_valido` | Debe contener al menos un @, aunque no sea obligatorio |

### 4.3 Reglas sobre Empleados

| # | Regla | Dónde se aplica | Explicación |
|---|-------|-----------------|-------------|
| 19 | **DNI obligatorio y válido** | Trigger `trg_validar_dni_empleado` | Misma validación de cédula cubana que para clientes |
| 20 | **Nombre completo obligatorio** | Trigger `trg_validar_nombre_completo_empleado` | Misma regla: nombre + apellido |
| 21 | **Horas de trabajo > 0** | CHECK `chk_horas_trab_validas` | Las horas de trabajo del empleado deben ser positivas |
| 22 | **Teléfono obligatorio y válido** | CHECK `chk_telefono_valido_empleado` | Formato: solo números, 7-15 dígitos |
| 23 | **Empleados fijos para tratamientos** | Trigger `trg_verificar_empleado_fijo` | Solo empleados marcados como `esfijo=true` pueden asignarse a `empleadosfijosportratamiento` |
| 24 | **Conteo automático de fijos por área** | Trigger `trg_actualizar_personal_fijo` | Al asignar/desasignar empleados a áreas, se recalcula automáticamente `cantidadpersonalfijo` |

### 4.4 Reglas sobre Paquetes Vendidos

| # | Regla | Dónde se aplica | Explicación |
|---|-------|-----------------|-------------|
| 25 | **Fecha de compra = hoy** | Trigger `trg_verificar_fechas_paquete` (INSERT) | No se puede vender un paquete con fecha de compra diferente a hoy |
| 26 | **Inicio no anterior a compra** | Trigger `trg_verificar_fechas_paquete` | `fechainicio` no puede ser anterior a `fechacompra` |
| 27 | **Fin no anterior a inicio** | Trigger `trg_verificar_fechas_paquete` | `fechafin` no puede ser anterior a `fechainicio` |
| 28 | **Vigencia máxima 30 días** | Trigger `trg_verificar_fechas_paquete` | `fechafin` no puede superar `fechacompra + 30` días |
| 29 | **Precio automático** | Trigger `trg_registrar_precio_paquete_vendido` | El precio del paquete vendido se copia del precio del paquete original |
| 30 | **Fecha de compra no futura** | CHECK `chk_fechacompra_no_futura` | No se puede registrar una venta con fecha futura |

### 4.5 Reglas sobre Materiales

| # | Regla | Dónde se aplica | Explicación |
|---|-------|-----------------|-------------|
| 31 | **Stock no negativo** | CHECK `chk_cantidad_positiva` | La cantidad de material no puede ser negativa |
| 32 | **Descuento automático al usar** | Trigger `trg_actualizar_cantidad_materiales` | Al registrar materiales usados en una cita, se descuenta del stock automáticamente |
| 33 | **Solo en citas realizadas** | Trigger `trg_verificar_estado_cita` | No se pueden registrar materiales usados si la cita no está en estado "realizada" |
| 34 | **Cantidad por tratamiento > 0** | CHECK `chk_cantidad_matportrat` | La cantidad de material necesaria para un tratamiento debe ser positiva |
| 35 | **Cantidad usada por cita >= 0** | CHECK `chk_cantidad_matporcita` | La cantidad de material usada en una cita puede ser 0 o más |

### 4.6 Reglas sobre Nombres (general)

| # | Regla | Dónde se aplica | Explicación |
|---|-------|-----------------|-------------|
| 36 | **Nombres únicos** | UNIQUE en áreas, categorías, distritos, materiales, paquetes, tratamientos, clientes.ci, clientes.email, usuarios.username | No pueden existir dos registros con el mismo nombre en cada tabla |
| 37 | **Nombres con más de 3 caracteres** | CHECK en áreas, categorías, distritos, materiales, paquetes, tratamientos, clientes, empleados | `LENGTH(TRIM(nombre)) > 3` |
| 38 | **Nombres de usuario únicos** | UNIQUE `usuarios_username_key` | No pueden existir dos usuarios con el mismo username |

### 4.7 Reglas sobre Precios

| # | Regla | Dónde se aplica | Explicación |
|---|-------|-----------------|-------------|
| 39 | **Precio de tratamiento > 0** | CHECK `chk_precio_valido_trat` | El precio de un tratamiento debe ser positivo |
| 40 | **Precio de paquete > 0** | CHECK `chk_precio_valido_paquete` | El precio de un paquete debe ser positivo |
| 41 | **Precio de paquete vendido > 0** | CHECK `chk_precio_valido_paquetevend` | El precio de venta debe ser positivo |
| 42 | **Precio de cita >= 0** | CHECK `chk_precio_valido_cita` | El precio de cita puede ser 0 (paquete) o positivo (individual) |

### 4.8 Reglas sobre Roles y Seguridad

| # | Regla | Dónde se aplica | Explicación |
|---|-------|-----------------|-------------|
| 43 | **Roles válidos** | CHECK `usuarios_rol_check` | El rol solo puede ser 'dependiente' o 'administrador' |
| 44 | **Token JWT requerido** | Middleware `verificarToken` | Todas las rutas de API (excepto login) requieren token válido |
| 45 | **Protección de rutas admin** | Middleware `esAdministrador` | Ciertas rutas requieren rol administrador (aunque actualmente no se usa explícitamente) |

### Resumen de Reglas por Tabla

| Tabla | Cantidad de Reglas |
|-------|-------------------|
| citas | 13 reglas (1-13) |
| clientes | 5 reglas (14-18) |
| empleados | 6 reglas (19-24) |
| paquetevendido | 6 reglas (25-30) |
| materiales / materialesporcita / materialesportratamiento | 5 reglas (31-35) |
| General (nombres, unique) | 3 reglas (36-38) |
| Precios | 4 reglas (39-42) |
| Seguridad | 3 reglas (43-45) |
| **Total** | **45 reglas de negocio** |

---

## 5. Diagrama de Navegación del Sistema

### Dependiente
```
LOGIN (dependiente)
  │
  ├── INICIO (dashboard con KPIs del día)
  │
  ├── TRATAMIENTOS (lista de solo lectura)
  │
  ├── PAQUETES
  │     ├── Ver lista
  │     ├── Ver detalle de paquete
  │     └── Vender paquete (modal)
  │
  ├── PAQUETES VENDIDOS
  │     └── Ver lista con detalle expandible
  │
  ├── CITAS (módulo principal)
  │     ├── Ver citas del día
  │     ├── Filtrar por período (hoy, semana, mes)
  │     ├── Crear cita (modal con formulario)
  │     ├── Editar cita (modal)
  │     ├── Ver detalle de cita (modal)
  │     ├── Realizar cita
  │     ├── Cancelar cita
  │     └── Cambiar estado de cita
  │
  ├── REPORTES
  │     ├── KPIs (citas hoy, ventas hoy)
  │     ├── Top tratamientos
  │     └── Gráficos de tendencias
  │
  └── MAPA
        └── Ubicación del SPA
```

### Administrador
```
LOGIN (administrador)
  │
  ├── DASHBOARD (estadísticas generales)
  │
  ├── TRATAMIENTOS
  │     ├── CRUD completo
  │     ├── Filtrar por categoría
  │     ├── Panel expandible: materiales del tratamiento
  │     └── Panel expandible: empleados fijos asignados
  │
  ├── EMPLEADOS
  │     ├── CRUD completo
  │     ├── Asignar a áreas
  │     └── Asignar como fijo a tratamientos
  │
  ├── CLIENTES
  │     └── CRUD completo
  │
  ├── ÁREAS (CRUD genérico)
  ├── CATEGORÍAS (CRUD genérico)
  ├── DISTRITOS (CRUD genérico)
  ├── MATERIALES (CRUD genérico)
  ├── PAQUETES (CRUD genérico)
  │
  ├── PAQUETES VENDIDOS
  │     └── Ver lista con detalle expandible
  │
  └── REPORTES
        ├── KPIs generales
        ├── Reportes de empleados por cliente
        └── Reportes de servicios por cliente en rango de fechas
```

---

*Documento generado para el proyecto final de Base de Datos — SPA "Belleza & Relax"*
