require('dotenv').config();
const express  = require('express');
const multer   = require('multer');
const crypto   = require('crypto');
const { Pool } = require('pg');
const path     = require('path');
const fs       = require('fs');

const app  = express();
const PORT = process.env.PORT || 3000;

// ============================================================
// POSTGRESQL
// ============================================================
const pool = new Pool(
  process.env.DATABASE_URL
    ? { connectionString: process.env.DATABASE_URL, ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false }
    : { host: process.env.DB_HOST||'localhost', port: process.env.DB_PORT||5432,
        database: process.env.DB_NAME||'biotica', user: process.env.DB_USER||'biotica_user',
        password: process.env.DB_PASSWORD||'', ssl: false }
);
pool.connect().then(c=>{ c.release(); console.log('✅ Conectado a PostgreSQL'); })
              .catch(e=> console.error('❌ PostgreSQL:', e.message));

// ============================================================
// MULTER
// ============================================================
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(__dirname, 'uploads');
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
});
const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } });

// ============================================================
// MIDDLEWARES
// ============================================================
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'public', 'index.html')));

// ============================================================
// HELPERS — Crypto (sin bcrypt, solo SHA-256 + salt)
// ============================================================
function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.createHmac('sha256', salt).update(password).digest('hex');
  return `${salt}:${hash}`;
}
function verifyPassword(password, stored) {
  const [salt, hash] = stored.split(':');
  const attempt = crypto.createHmac('sha256', salt).update(password).digest('hex');
  return attempt === hash;
}
function makeToken(id, tipo) {
  return Buffer.from(`${tipo}:${id}:${Date.now()}`).toString('base64');
}

// ============================================================
// CONSTANTES
// ============================================================
const SERVICIOS_VALIDOS = [
  'gestion-ambiental','ordenamiento-planificacion','biodiversidad-restauracion',
  'manejo-forestal','ecoturismo','innovacion-sostenibilidad','suministros',
];
const PREFIJOS_SUBSERVICIO = {
  'ca-eia':'eia_','ca-dia':'dia_','ca-pma':'pma_','ca-daa':'daa_',
  'ca-licencias':'lic_','ca-auditoria':'aud_',
  'op-planificacion-territorial':'op1_','op-ordenamiento-ambiental':'op2_',
  'op-cuencas-hidrograficas':'op3_','op-zonificacion':'op4_','op-desarrollo-sostenible':'op5_',
  'inventarios-flora-fauna':'if_','estudios-biodiversidad':'eb_',
  'restauracion-ecologica':'re_','monitoreo-flora-fauna':'mf_',
  'monitoreo-especies-amenazadas':'me_','planes-conservacion':'pc_',
  'mf-inventarios-forestales':'mfi_','mf-aprovechamiento':'mfa_',
  'mf-reforestacion':'mfr_','mf-certificacion':'mfc_','mf-control-tala':'mft_',
  'eco-rutas':'eco1_','eco-impacto':'eco2_','eco-manejo':'eco3_',
  'eco-capacitacion':'eco4_','eco-promocion':'eco5_',
  'inn-investigacion':'inn1_','inn-economia-circular':'inn2_',
  'inn-energias-renovables':'inn3_','inn-huella-carbono':'inn4_',
  'inn-sostenibilidad-empresarial':'inn5_',
  'sum-monitoreo':'sum1_','sum-insumos-forestales':'sum2_',
  'sum-kits-restauracion':'sum3_','sum-herramientas':'sum4_','sum-seguridad':'sum5_',
};

// ============================================================
// HELPERS — Solicitudes
// ============================================================
async function generarOrden(client) {
  const year = new Date().getFullYear();
  const { rows } = await client.query(
    `SELECT COUNT(*) AS total FROM solicitudes WHERE EXTRACT(YEAR FROM fecha_creacion) = $1`, [year]
  );
  return `BIO-${year}-${String(Number(rows[0].total) + 1).padStart(3, '0')}`;
}
function extraerCamposDinamicos(body, subservicio) {
  if (!subservicio || !PREFIJOS_SUBSERVICIO[subservicio]) return {};
  const prefix = PREFIJOS_SUBSERVICIO[subservicio];
  return Object.fromEntries(Object.entries(body).filter(([k, v]) => k.startsWith(prefix) && v));
}

// ============================================================
// AUTH — Admin
// ============================================================
const ADMINS = { 'Biotica': { password: 'Biotica/1973', rol: 'admin' } };

// POST /api/auth/check-email
app.post('/api/auth/check-email', async (req, res) => {
  const { correo } = req.body;
  if (!correo) return res.status(400).json({ error: 'Correo requerido.' });
  try {
    const { rows } = await pool.query(
      'SELECT id, usuario FROM usuarios WHERE correo = $1 AND activo = true', [correo]
    );
    return res.json({ tiene_cuenta: rows.length > 0, usuario: rows[0]?.usuario || null });
  } catch (err) {
    return res.status(500).json({ error: 'Error interno.' });
  }
});

app.post('/api/auth/login', (req, res) => {
  const { usuario, password } = req.body;
  if (!usuario || !password)
    return res.status(400).json({ success: false, message: 'Usuario y contraseña requeridos.' });
  const user = ADMINS[usuario];
  if (!user || user.password !== password)
    return res.status(401).json({ success: false, message: 'Usuario o contraseña incorrectos.' });
  const token = makeToken(usuario, 'admin');
  return res.json({ success: true, token, usuario, rol: 'admin' });
});

// ============================================================
// AUTH — Usuarios (registro / login / perfil / eliminar)
// ============================================================

// POST /api/usuarios/registro
app.post('/api/usuarios/registro', async (req, res) => {
  const { usuario, correo, password } = req.body;
  if (!usuario || !correo || !password)
    return res.status(400).json({ success: false, message: 'Todos los campos son obligatorios.' });
  if (usuario.length < 3)
    return res.status(400).json({ success: false, message: 'El usuario debe tener al menos 3 caracteres.' });
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo))
    return res.status(400).json({ success: false, message: 'Correo no válido.' });
  if (password.length < 6)
    return res.status(400).json({ success: false, message: 'La contraseña debe tener al menos 6 caracteres.' });

  try {
    const hash = hashPassword(password);
    const { rows } = await pool.query(
      `INSERT INTO usuarios (usuario, correo, password_hash) VALUES ($1, $2, $3) RETURNING id, usuario, correo, fecha_creacion`,
      [usuario, correo, hash]
    );
    const token = makeToken(rows[0].id, 'usuario');
    return res.json({ success: true, token, usuario: rows[0].usuario, correo: rows[0].correo, id: rows[0].id });
  } catch (err) {
    if (err.code === '23505') {
      const campo = err.constraint?.includes('correo') ? 'correo' : 'usuario';
      return res.status(409).json({ success: false, message: `Este ${campo} ya está registrado.` });
    }
    console.error('Error registro:', err);
    return res.status(500).json({ success: false, message: 'Error interno.' });
  }
});

// POST /api/usuarios/login
app.post('/api/usuarios/login', async (req, res) => {
  const { usuario, password } = req.body;
  if (!usuario || !password)
    return res.status(400).json({ success: false, message: 'Usuario y contraseña requeridos.' });
  try {
    const { rows } = await pool.query(
      `SELECT * FROM usuarios WHERE (usuario = $1 OR correo = $1) AND activo = true`, [usuario]
    );
    if (!rows.length || !verifyPassword(password, rows[0].password_hash))
      return res.status(401).json({ success: false, message: 'Usuario o contraseña incorrectos.' });
    const token = makeToken(rows[0].id, 'usuario');
    return res.json({ success: true, token, usuario: rows[0].usuario, correo: rows[0].correo, id: rows[0].id });
  } catch (err) {
    console.error('Error login usuario:', err);
    return res.status(500).json({ success: false, message: 'Error interno.' });
  }
});

// GET /api/usuarios/:id/perfil
app.get('/api/usuarios/:id/perfil', async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT id, usuario, correo, fecha_creacion FROM usuarios WHERE id = $1 AND activo = true`, [req.params.id]
    );
    if (!rows.length) return res.status(404).json({ error: 'Usuario no encontrado.' });
    return res.json(rows[0]);
  } catch (err) {
    return res.status(500).json({ error: 'Error interno.' });
  }
});

// DELETE /api/usuarios/:id
app.delete('/api/usuarios/:id', async (req, res) => {
  try {
    await pool.query(`UPDATE usuarios SET activo = false WHERE id = $1`, [req.params.id]);
    return res.json({ success: true, message: 'Cuenta eliminada correctamente.' });
  } catch (err) {
    console.error('Error eliminando usuario:', err);
    return res.status(500).json({ error: 'Error interno.' });
  }
});

// GET /api/usuarios/:id/ordenes — Órdenes del usuario
app.get('/api/usuarios/:id/ordenes', async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT id, orden, servicio, subservicio, departamento, municipio,
              urgencia, estado, descripcion, fecha_creacion
       FROM solicitudes WHERE usuario_id = $1 ORDER BY fecha_creacion DESC`,
      [req.params.id]
    );
    return res.json({ ordenes: rows });
  } catch (err) {
    console.error('Error obteniendo órdenes usuario:', err);
    return res.status(500).json({ error: 'Error interno.' });
  }
});

// ============================================================
// POST /api/solicitud
// ============================================================
app.post('/api/solicitud', upload.single('documento'), async (req, res) => {
  const { nombre, correo, telefono, servicio, subservicio,
          departamento, municipio, descripcion, urgencia, usuario_id } = req.body;

  if (!nombre || !correo || !telefono || !servicio || !descripcion || !urgencia)
    return res.status(400).json({ success: false, message: 'Todos los campos obligatorios deben completarse.' });
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo))
    return res.status(400).json({ success: false, message: 'Por favor ingresa un correo válido.' });
  if (!SERVICIOS_VALIDOS.includes(servicio))
    return res.status(422).json({ success: false, outOfPortfolio: true, message: 'Este servicio no está en nuestro portafolio.' });

  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const orden = await generarOrden(client);
    const { rows } = await client.query(
      `INSERT INTO solicitudes
        (orden, nombre, correo, telefono, departamento, municipio,
         servicio, subservicio, descripcion, urgencia, archivo, estado, usuario_id)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,'Recibida',$12) RETURNING id`,
      [orden, nombre, correo, telefono,
       departamento||null, municipio||null,
       servicio, subservicio||null, descripcion, urgencia,
       req.file ? req.file.filename : null,
       usuario_id||null]
    );
    const solicitudId = rows[0].id;
    const campos = extraerCamposDinamicos(req.body, subservicio);
    if (Object.keys(campos).length > 0) {
      const entries = Object.entries(campos);
      const vals = entries.flatMap(([campo, valor]) => [solicitudId, campo, valor]);
      const ph   = entries.map((_,i) => `($${i*3+1},$${i*3+2},$${i*3+3})`).join(',');
      await client.query(`INSERT INTO campos_dinamicos (solicitud_id, campo, valor) VALUES ${ph}`, vals);
    }
    await client.query('COMMIT');
    return res.json({ success: true, orden,
      message: `Tu orden ha sido generada: ${orden}. Revisa tu correo para el seguimiento.` });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Error guardando solicitud:', err.message, err.stack);
    return res.status(500).json({ success: false, message: 'Error interno del servidor.' });
  } finally {
    client.release();
  }
});

// ============================================================
// GET /api/dashboard
// ============================================================
app.get('/api/dashboard', async (req, res) => {
  try {
    const [statsRes, solRes] = await Promise.all([
      pool.query('SELECT * FROM dashboard_stats'),
      pool.query(`SELECT s.id, s.orden, s.nombre, s.correo, s.telefono, s.servicio, s.subservicio,
                         s.departamento, s.municipio, s.urgencia, s.estado, s.fecha_creacion,
                         s.usuario_id,
                         u.usuario   AS usuario_registrado,
                         u.correo    AS correo_registrado,
                         CASE WHEN u.id IS NOT NULL THEN true ELSE false END AS es_registrado
                  FROM solicitudes s
                  LEFT JOIN usuarios u ON s.usuario_id = u.id
                  ORDER BY s.fecha_creacion DESC LIMIT 100`)
    ]);
    const s = statsRes.rows[0];
    return res.json({
      total: Number(s.total), alta: Number(s.alta), media: Number(s.media), baja: Number(s.baja),
      recibidas: Number(s.recibidas), en_proceso: Number(s.en_proceso), completadas: Number(s.completadas),
      solicitudes: solRes.rows,
    });
  } catch (err) {
    return res.status(500).json({ error: 'Error obteniendo datos.' });
  }
});

// ============================================================
// GET /api/solicitud/:orden
// ============================================================
app.get('/api/solicitud/:orden', async (req, res) => {
  try {
    const { rows: sol } = await pool.query(
      `SELECT s.*, u.usuario AS usuario_registrado, u.correo AS correo_registrado
       FROM solicitudes s
       LEFT JOIN usuarios u ON s.usuario_id = u.id
       WHERE s.orden = $1`,
      [req.params.orden]
    );
    if (!sol.length) return res.status(404).json({ error: 'Solicitud no encontrada.' });
    const [campos, historial] = await Promise.all([
      pool.query('SELECT campo, valor FROM campos_dinamicos WHERE solicitud_id = $1', [sol[0].id]),
      pool.query('SELECT * FROM historial_estados WHERE solicitud_id = $1 ORDER BY created_at ASC', [sol[0].id])
    ]);
    return res.json({ ...sol[0], campos_dinamicos: campos.rows, historial: historial.rows });
  } catch (err) {
    return res.status(500).json({ error: 'Error interno.' });
  }
});

// ============================================================
// PATCH /api/solicitud/:orden/estado
// ============================================================
app.patch('/api/solicitud/:orden/estado', async (req, res) => {
  const { estado, observacion, cambiado_por } = req.body;
  const validos = ['Recibida','En revisión','En proceso','Completada','Cancelada'];
  if (!validos.includes(estado)) return res.status(400).json({ error: 'Estado no válido.' });
  try {
    const { rows } = await pool.query(
      `UPDATE solicitudes SET estado = $1 WHERE orden = $2 RETURNING id, orden, estado`,
      [estado, req.params.orden]
    );
    if (!rows.length) return res.status(404).json({ error: 'Solicitud no encontrada.' });
    if (observacion || cambiado_por) {
      await pool.query(
        `UPDATE historial_estados SET observacion=$1, cambiado_por=$2
         WHERE solicitud_id=$3 AND estado_nuevo=$4 AND cambiado_por='sistema'`,
        [observacion||null, cambiado_por||'sistema', rows[0].id, estado]
      );
    }
    return res.json({ success: true, ...rows[0] });
  } catch (err) {
    return res.status(500).json({ error: 'Error interno.' });
  }
});

// ============================================================
// START + WEBSOCKET
// ============================================================
const { WebSocketServer } = require('ws');
const http = require('http');

const server = http.createServer(app);
const wss    = new WebSocketServer({ server });

// Salas por asesor: { asesorId: { asesor: ws|null, usuarios: Map<id, ws> } }
const salas = {};

const ASESORES_IDS = ['jose', 'elkin', 'leonel'];
ASESORES_IDS.forEach(id => {
  salas[id] = { asesor: null, usuarios: new Map() };
});

function broadcast(room, msg, excludeWs = null) {
  const sala = salas[room];
  if (!sala) return;
  const data = JSON.stringify(msg);
  if (sala.asesor && sala.asesor !== excludeWs && sala.asesor.readyState === 1)
    sala.asesor.send(data);
  sala.usuarios.forEach((ws) => {
    if (ws !== excludeWs && ws.readyState === 1) ws.send(data);
  });
}

function getOnlineUsers(room) {
  const sala = salas[room];
  if (!sala) return 0;
  return sala.usuarios.size;
}

wss.on('connection', (ws) => {
  ws.meta = {};

  ws.on('message', (raw) => {
    let msg;
    try { msg = JSON.parse(raw); } catch { return; }

    // ── JOIN ──────────────────────────────────────────────
    if (msg.type === 'join') {
      const { room, rol, nombre, clientId } = msg;
      if (!salas[room]) return;

      ws.meta = { room, rol, nombre: nombre || 'Usuario', clientId: clientId || '' };

      if (rol === 'asesor') {
        // Desconectar sesión anterior del asesor si existe
        if (salas[room].asesor && salas[room].asesor.readyState === 1) {
          salas[room].asesor.send(JSON.stringify({ type: 'system', text: 'Nueva sesión iniciada en otro dispositivo.' }));
          salas[room].asesor.close();
        }
        salas[room].asesor = ws;
        ws.send(JSON.stringify({
          type: 'joined',
          room,
          online: getOnlineUsers(room),
          text: `Conectado como asesor. ${getOnlineUsers(room)} usuario(s) en sala.`
        }));
        // Notificar usuarios que el asesor está en línea
        salas[room].usuarios.forEach((uws) => {
          if (uws.readyState === 1)
            uws.send(JSON.stringify({ type: 'asesor-status', online: true, text: `${nombre} está en línea.` }));
        });
      } else {
        // Usuario
        const userId = Date.now() + '-' + Math.random().toString(36).slice(2, 6);
        ws.meta.userId = userId;
        salas[room].usuarios.set(userId, ws);
        ws.send(JSON.stringify({
          type: 'joined',
          room,
          userId,
          asesorOnline: !!(salas[room].asesor && salas[room].asesor.readyState === 1),
          text: salas[room].asesor && salas[room].asesor.readyState === 1
            ? 'Conectado. El asesor está disponible.'
            : 'Conectado. El asesor no está disponible en este momento, deja tu mensaje y te responderá pronto.'
        }));
        // Notificar al asesor
        if (salas[room].asesor && salas[room].asesor.readyState === 1) {
          salas[room].asesor.send(JSON.stringify({
            type: 'user-joined',
            nombre: ws.meta.nombre,
            online: getOnlineUsers(room)
          }));
        }
      }
    }

    // ── MESSAGE ───────────────────────────────────────────
    if (msg.type === 'message') {
      const { room, rol, nombre, clientId } = ws.meta;
      if (!room || !msg.text?.trim()) return;
      const payload = {
        type: 'message',
        from: rol === 'asesor' ? 'asesor' : 'usuario',
        nombre: nombre || 'Usuario',
        clientId: clientId || '',
        text: msg.text.trim(),
        ts: new Date().toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })
      };
      // Enviar a TODOS — el cliente usa clientId para saber si es propio
      broadcast(room, payload);
    }

    // ── TYPING ────────────────────────────────────────────
    if (msg.type === 'typing') {
      const { room, rol, nombre } = ws.meta;
      if (!room) return;
      broadcast(room, { type: 'typing', from: rol, nombre }, ws);
    }
  });

  ws.on('close', () => {
    const { room, rol, userId, nombre } = ws.meta;
    if (!room) return;
    if (rol === 'asesor') {
      salas[room].asesor = null;
      salas[room].usuarios.forEach(uws => {
        if (uws.readyState === 1)
          uws.send(JSON.stringify({ type: 'asesor-status', online: false, text: 'El asesor se ha desconectado.' }));
      });
    } else if (userId) {
      salas[room].usuarios.delete(userId);
      if (salas[room].asesor && salas[room].asesor.readyState === 1) {
        salas[room].asesor.send(JSON.stringify({
          type: 'user-left',
          nombre,
          online: getOnlineUsers(room)
        }));
      }
    }
  });
});

// GET /api/chat/status — estado de asesores en línea
app.get('/api/chat/status', (req, res) => {
  const status = {};
  ASESORES_IDS.forEach(id => {
    status[id] = {
      online: !!(salas[id].asesor && salas[id].asesor.readyState === 1),
      usuarios: salas[id].usuarios.size
    };
  });
  res.json(status);
});

server.listen(PORT, () =>
  console.log(`🌿 Biótica Consultores — Servidor en http://localhost:${PORT}`)
);