# 🌿 Biótica Consultores — Plataforma de Solicitudes Ambientales

## Instalación y ejecución

```bash
npm install
node server.js
```

Visita: http://localhost:3000

## Rutas

| URL                   | Descripción                      |
| --------------------- | -------------------------------- |
| `/`                   | Página principal con formulario  |
| `/dashboard.html`     | Dashboard interno de solicitudes |
| `POST /api/solicitud` | Endpoint para enviar formulario  |
| `GET /api/dashboard`  | Datos para el dashboard          |

## Características

- Formulario accesible con validación client-side y server-side
- Generación de número de orden único (BIO-2026-001)
- Upload de archivos (máx 5 MB)
- Dashboard con KPIs en tiempo real (actualización cada 30s)
- Diseño responsivo inspirado en bioticaconsultores.com

---

## 🎨 Patrones de Diseño Implementados

### 1. Strategy Pattern

El **Strategy Pattern** es el patrón principal de este proyecto. Permite manejar los diferentes tipos de servicios ambientales de forma modular y extensible.

#### ¿Por qué Strategy?

- **7 tipos de servicios ambientales** diferentes (gestión-ambiental, biodiversidad-restauración, manejo-forestal, etc.)
- **Múltiples subservicios** por cada servicio
- **Campos dinámicos diferentes** para cada subservicio
- **Extensibilidad**: agregar nuevos servicios sin modificar código existente

#### Estructura del Patrón

```
strategies/
├── ServiceStrategy.js          # Clase base (interfaz)
├── GestionAmbientalStrategy.js # Estrategia concreta
├── BiodiversidadStrategy.js    # Estrategia concreta
├── ManejoForestalStrategy.js   # Estrategia concreta
├── EcoturismoStrategy.js       # Estrategia concreta
├── InnovacionStrategy.js       # Estrategia concreta
├── SuministrosStrategy.js      # Estrategia concreta
├── OrdenamientoStrategy.js     # Estrategia concreta
├── SolicitudHandler.js         # Contexto (usa las estrategias)
└── index.js                    # Exportaciones del módulo
```

#### Clase Base: `ServiceStrategy`

```javascript
// strategies/ServiceStrategy.js
class ServiceStrategy {
  /**
   * Valida los datos de la solicitud
   * @param {Object} data - Datos de la solicitud
   * @returns {Object} { valid: boolean, errors: string[] }
   */
  validate(data) {
    throw new Error("Method validate() must be implemented");
  }

  /**
   * Procesa la solicitud y ejecuta queries en la base de datos
   * @param {Object} data - Datos de la solicitud
   * @param {Object} client - Cliente de PostgreSQL (para transacciones)
   * @returns {Promise<Object>} Resultado del procesamiento
   */
  async process(data, client) {
    throw new Error("Method process() must be implemented");
  }

  /**
   * Extrae campos dinámicos del body según el subservicio
   * @param {Object} body - Body de la request
   * @param {string} subservicio - Nombre del subservicio
   * @returns {Object} Campos dinámicos extraídos
   */
  getDynamicFields(body, subservicio) {
    throw new Error("Method getDynamicFields() must be implemented");
  }

  /**
   * Retorna los prefijos de campos dinámicos para cada subservicio
   * @returns {Object} Mapa de subservicio -> prefijo
   */
  getSubservicioPrefixes() {
    return {};
  }
}

module.exports = ServiceStrategy;
```

#### Ejemplo de Estrategia Concreta: `GestionAmbientalStrategy`

```javascript
// strategies/GestionAmbientalStrategy.js
const ServiceStrategy = require("./ServiceStrategy");

class GestionAmbientalStrategy extends ServiceStrategy {
  constructor() {
    super();
    this.subservicioPrefixes = {
      "ca-eia": "eia_",
      "ca-dia": "dia_",
      "ca-pma": "pma_",
      "ca-daa": "daa_",
      "ca-licencias": "lic_",
      "ca-auditoria": "aud_",
    };
  }

  validate(data) {
    const errors = [];

    if (!data.nombre || data.nombre.length < 3) {
      errors.push("El nombre debe tener al menos 3 caracteres");
    }

    if (!data.descripcion || data.descripcion.length < 10) {
      errors.push("La descripción debe tener al menos 10 caracteres");
    }

    // Validaciones específicas para gestión ambiental
    if (data.subservicio === "ca-eia" && !data.eia_alcance) {
      errors.push("El alcance del EIA es requerido");
    }

    if (data.subservicio === "ca-licencias" && !data.lic_tipo) {
      errors.push("El tipo de licencia es requerido");
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  async process(data, client) {
    const { rows } = await client.query(
      `INSERT INTO solicitudes 
        (orden, nombre, correo, telefono, departamento, municipio,
         servicio, subservicio, descripcion, urgencia, archivo, estado, usuario_id)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,'Recibida',$12) RETURNING id`,
      [
        data.orden,
        data.nombre,
        data.correo,
        data.telefono,
        data.departamento || null,
        data.municipio || null,
        data.servicio,
        data.subservicio || null,
        data.descripcion,
        data.urgencia,
        data.archivo || null,
        data.usuario_id || null,
      ],
    );

    return { solicitudId: rows[0].id };
  }

  getDynamicFields(body, subservicio) {
    const prefix = this.subservicioPrefixes[subservicio];
    if (!prefix) return {};

    return Object.fromEntries(
      Object.entries(body).filter(([k, v]) => k.startsWith(prefix) && v),
    );
  }

  getSubservicioPrefixes() {
    return this.subservicioPrefixes;
  }
}

module.exports = GestionAmbientalStrategy;
```

#### Contexto: `SolicitudHandler`

```javascript
// strategies/SolicitudHandler.js
const GestionAmbientalStrategy = require("./GestionAmbientalStrategy");
const BiodiversidadStrategy = require("./BiodiversidadStrategy");
const ManejoForestalStrategy = require("./ManejoForestalStrategy");
const EcoturismoStrategy = require("./EcoturismoStrategy");
const InnovacionStrategy = require("./InnovacionStrategy");
const SuministrosStrategy = require("./SuministrosStrategy");
const OrdenamientoStrategy = require("./OrdenamientoStrategy");

class SolicitudHandler {
  constructor() {
    // Registro de estrategias por tipo de servicio
    this.strategies = {
      "gestion-ambiental": new GestionAmbientalStrategy(),
      "biodiversidad-restauracion": new BiodiversidadStrategy(),
      "manejo-forestal": new ManejoForestalStrategy(),
      ecoturismo: new EcoturismoStrategy(),
      "innovacion-sostenibilidad": new InnovacionStrategy(),
      suministros: new SuministrosStrategy(),
      "ordenamiento-planificacion": new OrdenamientoStrategy(),
    };
  }

  /**
   * Obtiene la estrategia para un tipo de servicio
   * @param {string} servicio - Tipo de servicio
   * @returns {ServiceStrategy} Estrategia correspondiente
   */
  getStrategy(servicio) {
    const strategy = this.strategies[servicio];
    if (!strategy) {
      throw new Error(`No strategy found for service: ${servicio}`);
    }
    return strategy;
  }

  /**
   * Valida los datos de la solicitud
   * @param {Object} data - Datos de la solicitud
   * @returns {Object} Resultado de la validación
   */
  validate(data) {
    const strategy = this.getStrategy(data.servicio);
    return strategy.validate(data);
  }

  /**
   * Procesa la solicitud completa
   * @param {Object} data - Datos de la solicitud
   * @param {Object} client - Cliente de PostgreSQL
   * @returns {Promise<Object>} Resultado del procesamiento
   */
  async process(data, client) {
    const strategy = this.getStrategy(data.servicio);

    // 1. Validar
    const validation = strategy.validate(data);
    if (!validation.valid) {
      throw new Error(`Validation failed: ${validation.errors.join(", ")}`);
    }

    // 2. Procesar
    const result = await strategy.process(data, client);

    // 3. Guardar campos dinámicos
    const dynamicFields = strategy.getDynamicFields(data, data.subservicio);
    if (Object.keys(dynamicFields).length > 0) {
      const entries = Object.entries(dynamicFields);
      const vals = entries.flatMap(([campo, valor]) => [
        result.solicitudId,
        campo,
        valor,
      ]);
      const ph = entries
        .map((_, i) => `($${i * 3 + 1},$${i * 3 + 2},$${i * 3 + 3})`)
        .join(",");
      await client.query(
        `INSERT INTO campos_dinamicos (solicitud_id, campo, valor) VALUES ${ph}`,
        vals,
      );
    }

    return result;
  }

  /**
   * Extrae campos dinámicos del body
   * @param {Object} body - Body de la request
   * @param {string} servicio - Tipo de servicio
   * @param {string} subservicio - Subservicio
   * @returns {Object} Campos dinámicos
   */
  getDynamicFields(body, servicio, subservicio) {
    const strategy = this.getStrategy(servicio);
    return strategy.getDynamicFields(body, subservicio);
  }

  /**
   * Registra una nueva estrategia
   * @param {string} servicio - Tipo de servicio
   * @param {ServiceStrategy} strategy - Estrategia a registrar
   */
  registerStrategy(servicio, strategy) {
    this.strategies[servicio] = strategy;
  }

  /**
   * Lista todos los servicios disponibles
   * @returns {string[]} Lista de servicios
   */
  getAvailableServices() {
    return Object.keys(this.strategies);
  }
}

module.exports = SolicitudHandler;
```

#### Uso en `server.js`

```javascript
const { SolicitudHandler } = require("./strategies");

// Instancia única del handler (Singleton implícito)
const solicitudHandler = new SolicitudHandler();

// Endpoint para crear solicitud
app.post("/api/solicitud", upload.single("documento"), async (req, res) => {
  const {
    nombre,
    correo,
    telefono,
    servicio,
    subservicio,
    departamento,
    municipio,
    descripcion,
    urgencia,
    usuario_id,
  } = req.body;

  // Validación básica
  if (
    !nombre ||
    !correo ||
    !telefono ||
    !servicio ||
    !descripcion ||
    !urgencia
  ) {
    return res.status(400).json({
      success: false,
      message: "Todos los campos obligatorios deben completarse.",
    });
  }

  // Validar que el servicio existe
  const SERVICIOS_VALIDOS = solicitudHandler.getAvailableServices();

  if (!SERVICIOS_VALIDOS.includes(servicio)) {
    return res.status(422).json({
      success: false,
      outOfPortfolio: true,
      message: "Este servicio no está en nuestro portafolio.",
    });
  }

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // Generar número de orden
    const orden = await generarOrden(client);

    // Preparar datos
    const data = {
      orden,
      nombre,
      correo,
      telefono,
      departamento,
      municipio,
      servicio,
      subservicio,
      descripcion,
      urgencia,
      archivo: req.file ? req.file.filename : null,
      usuario_id: usuario_id || null,
      ...req.body, // Incluir campos dinámicos
    };

    // Usar el Strategy Pattern para procesar
    const result = await solicitudHandler.process(data, client);

    await client.query("COMMIT");
    return res.json({
      success: true,
      orden,
      message: `Tu orden ha sido generada: ${orden}.`,
    });
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("❌ ERROR SOLICITUD:", err.message);
    return res.status(500).json({
      success: false,
      message: "Error interno del servidor.",
    });
  } finally {
    client.release();
  }
});
```

#### Diagrama de Clases

```
┌─────────────────────────────────────────────────────────────┐
│                    ServiceStrategy                          │
│                    (Clase Base)                             │
├─────────────────────────────────────────────────────────────┤
│ + validate(data): Object                                    │
│ + process(data, client): Promise<Object>                    │
│ + getDynamicFields(body, subservicio): Object               │
│ + getSubservicioPrefixes(): Object                          │
└─────────────────────────────────────────────────────────────┘
                           △
                           │
        ┌──────────────────┼──────────────────┐
        │                  │                  │
        │                  │                  │
┌───────┴───────┐  ┌───────┴───────┐  ┌───────┴───────┐
│ Gestion       │  │ Biodiversidad │  │ Manejo        │
│ Ambiental     │  │ Strategy      │  │ Forestal      │
│ Strategy      │  │               │  │ Strategy      │
└───────────────┘  └───────────────┘  └───────────────┘
        │                  │                  │
        │                  │                  │
        └──────────────────┼──────────────────┘
                           │
                           △
                           │
                  ┌────────┴────────┐
                  │ SolicitudHandler │
                  │   (Contexto)    │
                  ├─────────────────┤
                  │ - strategies    │
                  ├─────────────────┤
                  │ + validate()    │
                  │ + process()     │
                  │ + getStrategy() │
                  └─────────────────┘
```

#### Beneficios de esta Implementación

1. **Extensibilidad**: Agregar un nuevo servicio solo requiere crear una nueva clase que extienda `ServiceStrategy` y registrarla en `SolicitudHandler`.

2. **Mantenibilidad**: Cada servicio tiene su lógica encapsulada en su propia clase.

3. **Testabilidad**: Se puede mockear fácilmente cada estrategia para pruebas unitarias.

4. **Separación de Responsabilidades**: La lógica de validación, procesamiento y extracción de campos dinámicos está separada por servicio.

5. **Open/Closed Principle**: El sistema está abierto para extensión (nuevas estrategias) pero cerrado para modificación (no se modifica el código existente).

---

### 2. Singleton Pattern (Implícito)

El **Singleton Pattern** se usa implícitamente para la conexión a la base de datos.

```javascript
// database/db.js
const { Pool } = require("pg");

// Instancia única del pool de conexiones
const pool = new Pool(
  process.env.DATABASE_URL
    ? {
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false },
      }
    : {
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        database: process.env.DB_NAME,
        user: process.env.DB_USER,
        password: String(process.env.DB_PASSWORD),
        ssl: process.env.DB_SSL === "true",
      },
);

module.exports = pool;
```

**Beneficios:**

- Una sola instancia del pool de conexiones en toda la aplicación
- Gestión eficiente de recursos de base de datos
- Acceso global desde cualquier módulo

---

### 3. Observer Pattern (WebSocket)

El **Observer Pattern** se implementa en el sistema de WebSocket para notificaciones en tiempo real.

```javascript
// Sistema de salas (rooms) para chat
const salas = {};
const ASESORES_IDS = ["jose", "elkin", "leonel"];

// Inicializar salas
ASESORES_IDS.forEach((id) => {
  salas[id] = { asesor: null, usuarios: new Map() };
});

// Función broadcast (notificar a todos los observadores)
function broadcast(room, msg, excludeWs = null) {
  const sala = salas[room];
  if (!sala) return;
  const data = JSON.stringify(msg);

  // Notificar al asesor (observador)
  if (sala.asesor && sala.asesor !== excludeWs && sala.asesor.readyState === 1)
    sala.asesor.send(data);

  // Notificar a todos los usuarios (observadores)
  sala.usuarios.forEach((ws) => {
    if (ws !== excludeWs && ws.readyState === 1) ws.send(data);
  });
}

// Cuando un usuario se conecta (se suscribe)
ws.on("message", (raw) => {
  if (msg.type === "join") {
    // Agregar observador a la sala
    salas[room].usuarios.set(userId, ws);

    // Notificar a todos los observadores
    broadcast(room, {
      type: "user-joined",
      nombre,
      online: getOnlineUsers(room),
    });
  }
});

// Cuando un usuario se desconecta (se desuscribe)
ws.on("close", () => {
  // Remover observador de la sala
  salas[room].usuarios.delete(userId);

  // Notificar a todos los observadores
  broadcast(room, { type: "user-left", nombre, online: getOnlineUsers(room) });
});
```

**Beneficios:**

- Notificaciones en tiempo real a múltiples clientes
- Desacoplamiento entre emisores y receptores de mensajes
- Fácil agregar nuevos tipos de notificaciones

---

## 📁 Estructura del Proyecto

```
bioticaconsultores/
├── server.js                    # Servidor principal
├── package.json                 # Dependencias
├── README.md                    # Documentación
├── database/
│   ├── db.js                    # Conexión PostgreSQL (Singleton)
│   ├── schema.sql               # Esquema de base de datos
│   └── README.md                # Documentación de BD
├── strategies/                  # Patrón Strategy
│   ├── ServiceStrategy.js       # Clase base
│   ├── GestionAmbientalStrategy.js
│   ├── BiodiversidadStrategy.js
│   ├── ManejoForestalStrategy.js
│   ├── EcoturismoStrategy.js
│   ├── InnovacionStrategy.js
│   ├── SuministrosStrategy.js
│   ├── OrdenamientoStrategy.js
│   ├── SolicitudHandler.js      # Contexto
│   └── index.js                 # Exportaciones
└── public/                      # Archivos estáticos
    ├── index.html
    ├── dashboard.html
    ├── css/
    ├── js/
    └── images/
```

---

## 🔧 Tecnologías

- **Backend**: Node.js, Express
- **Base de Datos**: PostgreSQL
- **WebSockets**: ws (para chat en tiempo real)
- **Uploads**: Multer
- **Patrones de Diseño**: Strategy, Singleton, Observer
