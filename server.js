const express = require('express');
const multer = require('multer');
const { v4: uuidv4 } = require('uuid');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = 3000;

// In-memory store for requests
const solicitudes = [];

// Multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(__dirname, 'uploads');
    if (!fs.existsSync(dir)) fs.mkdirSync(dir);
    cb(null, dir);
  },
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
});
const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } });

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Explicit root route
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Valid services
const serviciosValidos = [
  'consultoria-ambiental',
  'ordenamiento-planificacion',
  'biodiversidad-restauracion',
  'manejo-forestal',
  'ecoturismo',
  'innovacion-sostenibilidad',
  'suministros'
];

// Valid subservicios by category
const subserviciosValidos = {
  'consultoria-ambiental': ['eia', 'dia', 'pma', 'daa', 'tramites', 'auditoria'],
  'ordenamiento-planificacion': ['uso-suelo', 'poar', 'cuencas', 'zonificacion', 'desarrollo-sostenible'],
  'biodiversidad-restauracion': ['inventario-flora', 'biodiversidad', 'restauracion', 'monitoreo-especies', 'habitats'],
  'manejo-forestal': ['inventario-forestal', 'aprovechamiento', 'reforestacion', 'certificacion', 'control-tala'],
  'ecoturismo': ['rutas', 'eia-turismo', 'manejo-areas', 'capacitacion-turismo', 'promocion'],
  'innovacion-sostenibilidad': ['investigacion', 'economia-circular', 'energias-renovables', 'huella-carbono', 'sostenibilidad-empresarial'],
  'suministros': ['monitoreo-equipos', 'insumos-forestales', 'kits-restauracion', 'herramientas-campo', 'equipos-seguridad']
};

// Generate order number
function generarOrden() {
  const year = new Date().getFullYear();
  const num = String(solicitudes.length + 1).padStart(3, '0');
  return `BIO-${year}-${num}`;
}

// POST /api/solicitud
app.post('/api/solicitud', upload.single('documento'), (req, res) => {
  const { nombre, correo, telefono, servicio, subservicio, descripcion, urgencia } = req.body;

  // Validate required fields
  if (!nombre || !correo || !telefono || !servicio || !subservicio || !descripcion || !urgencia) {
    return res.status(400).json({ success: false, message: 'Todos los campos obligatorios deben completarse.' });
  }

  // Email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(correo)) {
    return res.status(400).json({ success: false, message: 'Por favor ingresa un correo válido.' });
  }

  // Service validation
  if (!serviciosValidos.includes(servicio)) {
    return res.status(422).json({ success: false, outOfPortfolio: true, message: 'Este servicio no está en nuestro portafolio.' });
  }

  // Subservicio validation
  const subserviciosCategoria = subserviciosValidos[servicio];
  if (!subserviciosCategoria || !subserviciosCategoria.includes(subservicio)) {
    return res.status(422).json({ success: false, outOfPortfolio: true, message: 'Este subservicio no está en nuestro portafolio.' });
  }

  const orden = generarOrden();
  const solicitud = {
    id: uuidv4(),
    orden,
    nombre,
    correo,
    telefono,
    servicio,
    subservicio,
    descripcion,
    urgencia,
    archivo: req.file ? req.file.filename : null,
    estado: 'Recibida',
    fecha: new Date().toISOString()
  };

  solicitudes.push(solicitud);

  return res.json({
    success: true,
    orden,
    message: `Tu orden ha sido generada: ${orden}. Revisa tu correo para el seguimiento.`
  });
});

// GET dashboard data
app.get('/api/dashboard', (req, res) => {
  const stats = {
    total: solicitudes.length,
    alta: solicitudes.filter(s => s.urgencia === 'alta').length,
    media: solicitudes.filter(s => s.urgencia === 'media').length,
    baja: solicitudes.filter(s => s.urgencia === 'baja').length,
    solicitudes: solicitudes.slice().reverse()
  };
  res.json(stats);
});

app.listen(PORT, () => {
  console.log(`🌿 Biótica Consultores - Servidor corriendo en http://localhost:${PORT}`);
});
