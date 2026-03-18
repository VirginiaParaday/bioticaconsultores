// =====================
// BIÓTICA — main.js
// =====================

// Navbar scroll
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 60);
});

// Hamburger menu
const hamburger = document.getElementById('hamburger');
const navLinks = document.querySelector('.nav-links');
hamburger?.addEventListener('click', () => navLinks.classList.toggle('open'));

// Char counter
const descripcion = document.getElementById('descripcion');
const charCount = document.getElementById('char-count');
descripcion?.addEventListener('input', () => {
  charCount.textContent = descripcion.value.length;
});

// File upload label
const fileInput = document.getElementById('documento');
const fileDisplay = document.getElementById('file-name-display');
fileInput?.addEventListener('change', () => {
  fileDisplay.textContent = fileInput.files[0]
    ? `📄 ${fileInput.files[0].name}`
    : 'Subir archivo (PDF, Word, imagen — máx. 5 MB)';
});

// =====================
// SUBSERVICIO DINÁMICO
// =====================

// Mapa: valor del servicio → { label, opciones[] }
const SUBSERVICIOS = {
  'ordenamiento-planificacion': {
    label: 'Subservicio de Ordenamiento y Planificación',
    opciones: [
      { value: 'op-planificacion-territorial',  text: 'Planificación Territorial y Uso del Suelo' },
      { value: 'op-ordenamiento-ambiental',      text: 'Planes de Ordenamiento Ambiental Regional' },
      { value: 'op-cuencas-hidrograficas',       text: 'Estrategias de Conservación de Cuencas Hidrográficas' },
      { value: 'op-zonificacion',                text: 'Zonificación Ecológica y Económica' },
      { value: 'op-desarrollo-sostenible',       text: 'Planes de Desarrollo Sostenible' },
    ]
  },
  'biodiversidad-restauracion': {
    label: 'Subservicio de Biodiversidad y Restauración',
    opciones: [
      { value: 'inventarios-flora-fauna',        text: 'Inventarios de Flora y Fauna' },
      { value: 'estudios-biodiversidad',         text: 'Estudios de Biodiversidad en Áreas Protegidas' },
      { value: 'restauracion-ecologica',         text: 'Proyectos de Restauración Ecológica' },
      { value: 'monitoreo-flora-fauna',          text: 'Monitoreo de Fauna y Flora' },
      { value: 'monitoreo-especies-amenazadas',  text: 'Monitoreo de Especies Amenazadas' },
      { value: 'planes-conservacion',            text: 'Planes de Conservación de Hábitats' },
    ]
  },
  'manejo-forestal': {
    label: 'Subservicio de Manejo Forestal',
    opciones: [
      { value: 'mf-inventarios-forestales',  text: 'Inventarios Forestales' },
      { value: 'mf-aprovechamiento',         text: 'Aprovechamiento Forestal' },
      { value: 'mf-reforestacion',           text: 'Reforestación y Compensación Ambiental' },
      { value: 'mf-certificacion',           text: 'Certificación Forestal' },
      { value: 'mf-control-tala',            text: 'Control de Tala y Deforestación' },
    ]
  },
  'ecoturismo': {
    label: 'Subservicio de Ecoturismo',
    opciones: [
      { value: 'eco-rutas',      text: 'Diseño de Rutas Ecoturísticas' },
      { value: 'eco-impacto',    text: 'Evaluación de Impacto Ambiental en Proyectos Turísticos' },
      { value: 'eco-manejo',     text: 'Planes de Manejo para Áreas Naturales Visitadas' },
      { value: 'eco-capacitacion', text: 'Capacitación en Turismo Sostenible' },
      { value: 'eco-promocion',  text: 'Estrategias de Promoción de Ecoturismo Comunitario' },
    ]
  },
  'innovacion-sostenibilidad': {
    label: 'Subservicio de Innovación y Sostenibilidad',
    opciones: [
      { value: 'inn-investigacion',           text: 'Proyectos de Investigación Aplicada' },
      { value: 'inn-economia-circular',       text: 'Estrategias de Economía Circular' },
      { value: 'inn-energias-renovables',     text: 'Implementación de Energías Renovables' },
      { value: 'inn-huella-carbono',          text: 'Planes de Reducción de Huella de Carbono' },
      { value: 'inn-sostenibilidad-empresarial', text: 'Consultoría en Sostenibilidad Empresarial' },
    ]
  },
  'suministros': {
    label: 'Subservicio de Suministros',
    opciones: [
      { value: 'sum-monitoreo',          text: 'Materiales para Monitoreo Ambiental' },
      { value: 'sum-insumos-forestales', text: 'Insumos Forestales' },
      { value: 'sum-kits-restauracion',  text: 'Kits de Restauración Ecológica' },
      { value: 'sum-herramientas',       text: 'Herramientas para Estudios de Campo' },
      { value: 'sum-seguridad',          text: 'Equipos de Seguridad Ambiental' },
    ]
  }
};

const servicioSelect   = document.getElementById('servicio');
const groupSubservicio = document.getElementById('group-subservicio');
const labelSubservicio = document.getElementById('label-subservicio');
const subservicioSelect = document.getElementById('subservicio');
const allSubfields = document.querySelectorAll('.subfields');

function hideAllSubfields() {
  allSubfields.forEach(el => el.classList.add('hidden'));
}

function populateSubservicios(servicioValue) {
  // Limpiar opciones actuales (excepto el placeholder)
  subservicioSelect.innerHTML = '<option value="" disabled selected>Selecciona un subservicio</option>';
  const config = SUBSERVICIOS[servicioValue];
  if (!config) return;
  labelSubservicio.innerHTML = config.label + ' <span class="req">*</span>';
  config.opciones.forEach(op => {
    const opt = document.createElement('option');
    opt.value = op.value;
    opt.textContent = op.text;
    subservicioSelect.appendChild(opt);
  });
}

servicioSelect?.addEventListener('change', () => {
  const val = servicioSelect.value;
  hideAllSubfields();
  if (SUBSERVICIOS[val]) {
    populateSubservicios(val);
    groupSubservicio.classList.remove('hidden');
  } else {
    groupSubservicio.classList.add('hidden');
    subservicioSelect.value = '';
  }
});

subservicioSelect?.addEventListener('change', () => {
  hideAllSubfields();
  const target = document.getElementById('fields-' + subservicioSelect.value);
  if (target) target.classList.remove('hidden');
});

// Validation helpers
function setError(id, msg) {
  const el = document.getElementById('err-' + id);
  if (el) el.textContent = msg;
  const field = document.getElementById(id);
  if (field) field.classList.toggle('invalid', !!msg);
}
function clearErrors() {
  ['nombre','correo','telefono','servicio','subservicio','descripcion','urgencia'].forEach(f => setError(f, ''));
}

// Form submit
const form = document.getElementById('solicitudForm');
const feedback = document.getElementById('form-feedback');
const btnSubmit = document.getElementById('btn-submit');
const btnText = btnSubmit?.querySelector('.btn-text');
const btnLoader = btnSubmit?.querySelector('.btn-loader');

function showFeedback(msg, type) {
  feedback.className = `form-feedback ${type}`;
  feedback.innerHTML = (type === 'success' ? '✅ ' : '⚠️ ') + msg;
  feedback.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

function setLoading(on) {
  btnSubmit.disabled = on;
  btnText.classList.toggle('hidden', on);
  btnLoader.classList.toggle('hidden', !on);
}

form?.addEventListener('submit', async (e) => {
  e.preventDefault();
  clearErrors();
  feedback.className = 'form-feedback hidden';

  const nombre = document.getElementById('nombre').value.trim();
  const correo = document.getElementById('correo').value.trim();
  const telefono = document.getElementById('telefono').value.trim();
  const servicio = document.getElementById('servicio').value;
  const desc = document.getElementById('descripcion').value.trim();
  const urgencia = form.querySelector('input[name="urgencia"]:checked')?.value;

  let valid = true;
  const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const telRe = /^[+\d\s\-().]{7,20}$/;

  if (!nombre) { setError('nombre', 'El nombre es obligatorio.'); valid = false; }
  if (!correo) { setError('correo', 'El correo es obligatorio.'); valid = false; }
  else if (!emailRe.test(correo)) { setError('correo', 'Por favor ingresa un correo válido.'); valid = false; }
  if (!telefono) { setError('telefono', 'El teléfono es obligatorio.'); valid = false; }
  else if (!telRe.test(telefono)) { setError('telefono', 'Ingresa un número de teléfono válido.'); valid = false; }
  if (!servicio) { setError('servicio', 'Selecciona un tipo de servicio.'); valid = false; }

  // Validar subservicio si es Consultoría Ambiental
  const subservicio = document.getElementById('subservicio')?.value;
  if (servicio === 'gestion-ambiental' && !subservicio) {
    setError('subservicio', 'Selecciona un subservicio.'); valid = false;
  }

  if (!desc) { setError('descripcion', 'La descripción es obligatoria.'); valid = false; }
  if (!urgencia) { setError('urgencia', 'Selecciona el nivel de urgencia.'); valid = false; }

  if (!valid) return;

  setLoading(true);

  const formData = new FormData(form);
  try {
    const res = await fetch('/api/solicitud', { method: 'POST', body: formData });
    const data = await res.json();

    if (data.success) {
      showFeedback(data.message, 'success');
      form.reset();
      if (charCount) charCount.textContent = '0';
      if (fileDisplay) fileDisplay.textContent = 'Subir archivo (PDF, Word, imagen — máx. 5 MB)';
    } else if (data.outOfPortfolio) {
      showFeedback(data.message, 'error');
    } else {
      showFeedback(data.message || 'Error al enviar la solicitud.', 'error');
    }
  } catch (err) {
    showFeedback('Error de conexión. Intenta nuevamente.', 'error');
  } finally {
    setLoading(false);
  }
});

// Animate stats on scroll
const statNums = document.querySelectorAll('.stat-num');
const animateStats = () => {
  statNums.forEach(el => {
    const rect = el.getBoundingClientRect();
    if (rect.top < window.innerHeight && !el.dataset.animated) {
      el.dataset.animated = 'true';
      el.style.transition = 'transform 0.6s ease';
      el.style.transform = 'scale(1.1)';
      setTimeout(() => el.style.transform = 'scale(1)', 400);
    }
  });
};
window.addEventListener('scroll', animateStats, { passive: true });

// =====================
// SOLICITAR — auto-selección de servicio
// =====================
document.querySelectorAll('.srv-btn-primary[data-service]').forEach(btn => {
  btn.addEventListener('click', (e) => {
    e.preventDefault();
    const serviceVal = btn.dataset.service;

    // Seleccionar el servicio en el <select>
    const select = document.getElementById('servicio');
    if (select) {
      select.value = serviceVal;
      // Disparar el evento change para activar subservicios si aplica
      select.dispatchEvent(new Event('change'));
    }

    // Scroll suave a la sección del formulario
    const target = document.getElementById('form-section');
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});