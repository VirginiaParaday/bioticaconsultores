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

// File upload — drag & drop + button
const fileInput   = document.getElementById('documento');
const fileDisplay = document.getElementById('file-name-display');
const dropZone    = document.getElementById('file-drop-zone');

function setFile(file) {
  if (!file) return;
  fileDisplay.textContent = `📄 ${file.name}`;
  dropZone?.classList.add('has-file');
}

fileInput?.addEventListener('change', () => {
  setFile(fileInput.files[0]);
  if (!fileInput.files[0]) {
    fileDisplay.textContent = 'Arrastra tu archivo aquí';
    dropZone?.classList.remove('has-file');
  }
});

// Drag & drop events
['dragenter','dragover'].forEach(evt => {
  dropZone?.addEventListener(evt, (e) => {
    e.preventDefault(); e.stopPropagation();
    dropZone.classList.add('dragover');
  });
});
['dragleave','drop'].forEach(evt => {
  dropZone?.addEventListener(evt, (e) => {
    e.preventDefault(); e.stopPropagation();
    dropZone.classList.remove('dragover');
  });
});
dropZone?.addEventListener('drop', (e) => {
  const dt = e.dataTransfer;
  if (dt?.files?.length) {
    // Transfer file to the input
    const transfer = new DataTransfer();
    transfer.items.add(dt.files[0]);
    fileInput.files = transfer.files;
    setFile(dt.files[0]);
  }
});

// =====================
// SUBSERVICIO DINÁMICO
// =====================

// Mapa: valor del servicio → { label, opciones[] }
const SUBSERVICIOS = {
  'gestion-ambiental': {
    label: 'Subservicio de Consultoría Ambiental',
    opciones: [
      { value: 'ca-eia',          text: 'Evaluación de Impacto Ambiental (EIA)' },
      { value: 'ca-dia',          text: 'Declaración de Impacto Ambiental (DIA)' },
      { value: 'ca-pma',          text: 'Plan de Manejo Ambiental (PMA)' },
      { value: 'ca-daa',          text: 'Diagnóstico Ambiental de Alternativas (DAA)' },
      { value: 'ca-licencias',    text: 'Trámite de licencias y permisos ambientales' },
      { value: 'ca-auditoria',    text: 'Auditoría y cumplimiento normativo' },
    ]
  },
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
  ['nombre','correo','telefono','servicio','subservicio','departamento','municipio','descripcion','urgencia'].forEach(f => setError(f, ''));
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

  // Validar subservicio cuando el servicio seleccionado tiene subservicios
  const subservicio = document.getElementById('subservicio')?.value;
  if (servicio && SUBSERVICIOS[servicio] && !subservicio) {
    setError('subservicio', 'Selecciona un subservicio.'); valid = false;
  }

  // Validar ubicación
  const departamento = document.getElementById('departamento')?.value;
  const municipio    = document.getElementById('municipio')?.value;
  if (!departamento) { setError('departamento', 'Selecciona un departamento.'); valid = false; }
  if (!municipio)    { setError('municipio',    'Selecciona un municipio.');    valid = false; }

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
      if (fileDisplay) fileDisplay.textContent = 'Arrastra tu archivo aquí';
      dropZone?.classList.remove('has-file');
      hideAllSubfields();
      groupSubservicio?.classList.add('hidden');
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


// =====================
// UBICACIÓN — Departamentos y Municipios Colombia
// =====================
const MUNICIPIOS_COLOMBIA = {
  "Amazonas": ["Leticia", "Puerto Nariño", "El Encanto", "La Chorrera", "La Pedrera", "La Victoria", "Miriti-Paraná", "Puerto Alegría", "Puerto Arica", "Puerto Santander", "Tarapacá"],
  "Antioquia": ["Medellín", "Abejorral", "Abriaquí", "Alejandría", "Amagá", "Amalfi", "Andes", "Angelópolis", "Angostura", "Anorí", "Anzá", "Apartadó", "Arboletes", "Argelia", "Armenia", "Barbosa", "Bello", "Belmira", "Betania", "Betulia", "Briceño", "Buriticá", "Cáceres", "Caicedo", "Caldas", "Campamento", "Cañasgordas", "Caracolí", "Caramanta", "Carepa", "Carolina del Príncipe", "Caucasia", "Chigorodó", "Cisneros", "Ciudad Bolívar", "Cocorná", "Concepción", "Concordia", "Copacabana", "Dabeiba", "Don Matías", "Ebéjico", "El Bagre", "El Carmen de Viboral", "El Santuario", "Entrerríos", "Envigado", "Fredonia", "Frontino", "Giraldo", "Girardota", "Gómez Plata", "Granada", "Guadalupe", "Guarne", "Guatapé", "Heliconia", "Hispania", "Itagüí", "Ituango", "Jardín", "Jericó", "La Ceja", "La Estrella", "La Pintada", "La Unión", "Liborina", "Maceo", "Marinilla", "Montebello", "Murindó", "Mutatá", "Nariño", "Nechí", "Necoclí", "Olaya", "Peñol", "Peque", "Pueblorrico", "Puerto Berrío", "Puerto Nare", "Puerto Triunfo", "Remedios", "Retiro", "Rionegro", "Sabanalarga", "Sabaneta", "Salgar", "San Andrés de Cuerquia", "San Carlos", "San Francisco", "San Jerónimo", "San José de la Montaña", "San Juan de Urabá", "San Luis", "San Pedro de los Milagros", "San Pedro de Urabá", "San Rafael", "San Roque", "San Vicente Ferrer", "Santa Bárbara", "Santa Rosa de Osos", "Santo Domingo", "Segovia", "Sonsón", "Sopetrán", "Supía", "Tarazá", "Tarso", "Titiribí", "Toledo", "Turbo", "Uramita", "Urrao", "Valdivia", "Valparaíso", "Vegachí", "Venecia", "Vigía del Fuerte", "Yalí", "Yarumal", "Yolombó", "Yondó", "Zaragoza"],
  "Arauca": ["Arauca", "Arauquita", "Cravo Norte", "Fortul", "Puerto Rondón", "Saravena", "Tame"],
  "Atlántico": ["Barranquilla", "Baranoa", "Campo de la Cruz", "Candelaria", "Galapa", "Juan de Acosta", "Luruaco", "Malambo", "Manatí", "Palmar de Varela", "Piojó", "Polonuevo", "Ponedera", "Puerto Colombia", "Repelón", "Sabanagrande", "Sabanalarga", "Santa Lucía", "Santo Tomás", "Soledad", "Suan", "Tubará", "Usiacurí"],
  "Bolívar": ["Cartagena", "Achí", "Altos del Rosario", "Arenal", "Arjona", "Arroyohondo", "Barranco de Loba", "Calamar", "Cantagallo", "Cicuco", "Clemencia", "Córdoba", "El Carmen de Bolívar", "El Guamo", "El Peñón", "Hatillo de Loba", "Magangué", "Mahates", "Margarita", "María la Baja", "Mompox", "Montecristo", "Morales", "Norosí", "Pinillos", "Regidor", "Río Viejo", "San Cristóbal", "San Estanislao", "San Fernando", "San Jacinto", "San Jacinto del Cauca", "San Juan Nepomuceno", "San Martín de Loba", "San Pablo", "Santa Catalina", "Santa Rosa", "Santa Rosa del Sur", "Simití", "Soplaviento", "Talaigua Nuevo", "Tiquisio", "Turbaco", "Turbaná", "Villanueva", "Zambrano"],
  "Boyacá": ["Tunja", "Almeida", "Aquitania", "Arcabuco", "Belén", "Berbeo", "Betéitiva", "Boavita", "Boyacá", "Briceño", "Buenavista", "Busbanzá", "Caldas", "Campohermoso", "Cerinza", "Chinavita", "Chiquinquirá", "Chiscas", "Chita", "Chitaraque", "Chivatá", "Chivor", "Ciénega", "Cómbita", "Coper", "Corrales", "Covarachía", "Cubará", "Cucaita", "Cuítiva", "Duitama", "El Cocuy", "El Espino", "Firavitoba", "Floresta", "Gachantivá", "Gameza", "Garagoa", "Guacamayas", "Guateque", "Guayatá", "Güicán", "Iza", "Jenesano", "Jericó", "La Capilla", "La Uvita", "La Victoria", "Labranzagrande", "Macanal", "Maripí", "Miraflores", "Mongua", "Monguí", "Moniquirá", "Motavita", "Muzo", "Nobsa", "Nuevo Colón", "Oicatá", "Otanche", "Pachavita", "Páez", "Paipa", "Pajarito", "Panqueba", "Pauna", "Paya", "Paz de Río", "Pesca", "Pisba", "Puerto Boyacá", "Quípama", "Ramiriquí", "Ráquira", "Rondón", "Saboyá", "Sáchica", "Samacá", "San Eduardo", "San José de Pare", "San Luis de Gaceno", "San Mateo", "San Miguel de Sema", "San Pablo de Borbur", "Santa María", "Santa Rosa de Viterbo", "Santa Sofía", "Santana", "Sativanorte", "Sativasur", "Siachoque", "Soatá", "Socotá", "Socha", "Sogamoso", "Somondoco", "Sora", "Soracá", "Sotaquirá", "Susacón", "Sutamarchán", "Sutatenza", "Tasco", "Tenza", "Tibaná", "Tibasosa", "Tinjacá", "Tipacoque", "Toca", "Togüí", "Tópaga", "Tota", "Turmequé", "Tuta", "Tutazá", "Úmbita", "Ventaquemada", "Villa de Leyva", "Viracachá", "Zetaquira"],
  "Caldas": ["Manizales", "Aguadas", "Anserma", "Aranzazu", "Belalcázar", "Chinchiná", "Filadelfia", "La Dorada", "La Merced", "Manzanares", "Marmato", "Marquetalia", "Marulanda", "Neira", "Norcasia", "Pácora", "Palestina", "Pensilvania", "Riosucio", "Risaralda", "Salamina", "Samaná", "San José", "Supía", "Victoria", "Villamaría", "Viterbo"],
  "Caquetá": ["Florencia", "Albania", "Belén de los Andaquíes", "Cartagena del Chairá", "Curillo", "El Doncello", "El Paujil", "La Montañita", "Milán", "Morelia", "Puerto Rico", "San José del Fragua", "San Vicente del Caguán", "Solano", "Solita", "Valparaíso"],
  "Casanare": ["Yopal", "Aguazul", "Chámeza", "Hato Corozal", "La Salina", "Maní", "Monterrey", "Nunchía", "Orocué", "Paz de Ariporo", "Pore", "Recetor", "Sabanalarga", "Sácama", "San Luis de Palenque", "Támara", "Tauramena", "Trinidad", "Villanueva"],
  "Cauca": ["Popayán", "Almaguer", "Argelia", "Balboa", "Bolívar", "Buenos Aires", "Cajibío", "Caldono", "Caloto", "Corinto", "El Tambo", "Florencia", "Guachené", "Guapí", "Inzá", "Jambaló", "La Sierra", "La Vega", "López de Micay", "Mercaderes", "Miranda", "Morales", "Padilla", "Páez", "Patía", "Piamonte", "Piendamó", "Puerto Tejada", "Puracé", "Rosas", "San Sebastián", "Santa Rosa", "Santander de Quilichao", "Silvia", "Sotará", "Suárez", "Sucre", "Timbío", "Timbiquí", "Toribío", "Totoró", "Villa Rica"],
  "Cesar": ["Valledupar", "Aguachica", "Agustín Codazzi", "Astrea", "Becerril", "Bosconia", "Chimichagua", "Chiriguaná", "Curumaní", "El Copey", "El Paso", "Gamarra", "González", "La Gloria", "La Jagua de Ibirico", "La Paz", "Manaure", "Pailitas", "Pelaya", "Pueblo Bello", "Río de Oro", "San Alberto", "San Diego", "San Martín", "Tamalameque"],
  "Chocó": ["Quibdó", "Acandí", "Alto Baudó", "Atrato", "Bagadó", "Bahía Solano", "Bajo Baudó", "Bojayá", "Carmen del Darién", "Cértegui", "Condoto", "El Carmen de Atrato", "El Litoral del San Juan", "Istmina", "Juradó", "Lloró", "Medio Atrato", "Medio Baudó", "Medio San Juan", "Nóvita", "Nuquí", "Río Iro", "Río Quito", "Riosucio", "San José del Palmar", "Sipí", "Tadó", "Unguía", "Unión Panamericana"],
  "Cundinamarca": ["Bogotá D.C.", "Agua de Dios", "Albán", "Anapoima", "Anolaima", "Arbeláez", "Beltrán", "Bituima", "Bojacá", "Cabrera", "Cachipay", "Cajicá", "Calera", "Caparrapí", "Cáqueza", "Carmen de Carupa", "Chaguaní", "Chía", "Chipaque", "Choachí", "Chocontá", "Cogua", "Cota", "Cucunubá", "El Colegio", "El Peñón", "El Rosal", "Facatativá", "Fomeque", "Fosca", "Funza", "Fúquene", "Fusagasugá", "Gachalá", "Gachancipá", "Gachetá", "Gama", "Girardot", "Granada", "Guachetá", "Guaduas", "Guasca", "Guataquí", "Guatavita", "Guayabal de Síquima", "Guayabetal", "Gutiérrez", "Jerusalén", "Junín", "La Calera", "La Mesa", "La Palma", "La Peña", "La Vega", "Lenguazaque", "Machetá", "Madrid", "Manta", "Medina", "Mosquera", "Nariño", "Nemocón", "Nilo", "Nimaima", "Nocaima", "Ospina Pérez", "Pacho", "Paime", "Pandi", "Paratebueno", "Pasca", "Puerto Salgar", "Pulí", "Quebradanegra", "Quetame", "Quipile", "Ricaurte", "San Antonio del Tequendama", "San Bernardo", "San Cayetano", "San Francisco", "San Juan de Rioseco", "Sasaima", "Sesquilé", "Sibaté", "Silvania", "Simijaca", "Soacha", "Sopó", "Subachoque", "Suesca", "Supatá", "Susa", "Sutatausa", "Tabio", "Tausa", "Tena", "Tibacuy", "Tibiritá", "Tocaima", "Tocancipá", "Topaipí", "Ubalá", "Ubaque", "Une", "Útica", "Vergara", "Vianí", "Villagómez", "Villapinzón", "Villeta", "Viotá", "Yacopí", "Zipacón", "Zipaquirá"],
  "Córdoba": ["Montería", "Ayapel", "Buenavista", "Canalete", "Cereté", "Chimá", "Chinú", "Ciénaga de Oro", "Cotorra", "La Apartada", "Lorica", "Los Córdobas", "Momil", "Montelíbano", "Moñitos", "Planeta Rica", "Pueblo Nuevo", "Puerto Escondido", "Puerto Libertador", "Purísima", "Sahagún", "San Andrés de Sotavento", "San Antero", "San Bernardo del Viento", "San Carlos", "San José de Uré", "San Pelayo", "Santa Cruz de Lorica", "Tierralta", "Tuchín", "Valencia"],
  "Guainía": ["Inírida", "Barranco Minas", "Cacahual", "La Guadalupe", "Mapiripana", "Morichal", "Pana Pana", "Puerto Colombia", "San Felipe"],
  "Guaviare": ["San José del Guaviare", "Calamar", "El Retorno", "Miraflores"],
  "Huila": ["Neiva", "Acevedo", "Agrado", "Aipe", "Algeciras", "Altamira", "Baraya", "Campoalegre", "Colombia", "Elías", "Garzón", "Gigante", "Guadalupe", "Hobo", "Iquira", "Isnos", "La Argentina", "La Plata", "Nátaga", "Oporapa", "Paicol", "Palermo", "Palestina", "Pital", "Pitalito", "Rivera", "Saladoblanco", "San Agustín", "Santa María", "Suaza", "Tarqui", "Tello", "Teruel", "Tesalia", "Timaná", "Villavieja", "Yaguará"],
  "La Guajira": ["Riohacha", "Albania", "Barrancas", "Dibulla", "Distracción", "El Molino", "Fonseca", "Hatonuevo", "La Jagua del Pilar", "Maicao", "Manaure", "San Juan del Cesar", "Uribia", "Urumita", "Villanueva"],
  "Magdalena": ["Santa Marta", "Algarrobo", "Aracataca", "Ariguaní", "Cerro San Antonio", "Chivolo", "Ciénaga", "Concordia", "El Banco", "El Piñón", "El Retén", "Fundación", "Guamal", "Nueva Granada", "Pedraza", "Pijiño del Carmen", "Pivijay", "Plato", "Puebloviejo", "Remolino", "Sabanas de San Ángel", "Salamina", "San Sebastián de Buenavista", "San Zenón", "Santa Ana", "Santa Bárbara de Pinto", "Sitionuevo", "Tenerife", "Zapayán", "Zona Bananera"],
  "Meta": ["Villavicencio", "Acacías", "Barranca de Upía", "Cabuyaro", "Castilla la Nueva", "Cubarral", "Cumaral", "El Calvario", "El Castillo", "El Dorado", "Fuente de Oro", "Granada", "Guamal", "La Macarena", "Lejanías", "Mapiripán", "Mesetas", "La Uribe", "Puerto Concordia", "Puerto Gaitán", "Puerto Lleras", "Puerto López", "Puerto Rico", "Restrepo", "San Carlos de Guaroa", "San Juan de Arama", "San Juanito", "San Martín", "Uribe", "Vistahermosa"],
  "Nariño": ["Pasto", "Albán", "Aldana", "Ancuyá", "Arboleda", "Barbacoas", "Belén", "Buesaco", "Chachagüí", "Colón", "Consacá", "Contadero", "Córdoba", "Cuaspud", "Cumbal", "Cumbitara", "El Charco", "El Peñol", "El Rosario", "El Tablón de Gómez", "El Tambo", "Francisco Pizarro", "Funes", "Guachucal", "Guaitarilla", "Gualmatán", "Iles", "Imués", "Ipiales", "La Cruz", "La Florida", "La Llanada", "La Tola", "La Unión", "Leiva", "Linares", "Los Andes", "Magüí", "Mallama", "Mosquera", "Nariño", "Olaya Herrera", "Ospina", "Policarpa", "Potosí", "Providencia", "Puerres", "Pupiales", "Ricaurte", "Roberto Payán", "Samaniego", "San Bernardo", "San Lorenzo", "San Pablo", "San Pedro de Cartago", "Sandoná", "Santa Bárbara", "Santacruz", "Sapuyes", "Taminango", "Tangua", "Tumaco", "Túquerres", "Yacuanquer"],
  "Norte de Santander": ["Cúcuta", "Abrego", "Arboledas", "Bochalema", "Bucarasica", "Cácota", "Cachirá", "Chinácota", "Chitagá", "Convención", "Cucutilla", "Durania", "El Carmen", "El Tarra", "El Zulia", "Gramalote", "Hacarí", "Herrán", "Labateca", "La Esperanza", "La Playa", "Los Patios", "Lourdes", "Mutiscua", "Ocaña", "Pamplona", "Pamplonita", "Puerto Santander", "Ragonvalia", "Salazar", "San Calixto", "San Cayetano", "Santiago", "Sardinata", "Silos", "Teorama", "Tibú", "Toledo", "Villa Caro", "Villa del Rosario"],
  "Putumayo": ["Mocoa", "Colón", "Orito", "Puerto Asís", "Puerto Caicedo", "Puerto Guzmán", "Puerto Leguízamo", "San Francisco", "San Miguel", "Santiago", "Sibundoy", "Valle del Guamuez", "Villagarzón"],
  "Quindío": ["Armenia", "Buenavista", "Calarcá", "Circasia", "Córdoba", "Filandia", "Génova", "La Tebaida", "Montenegro", "Pijao", "Quimbaya", "Salento"],
  "Risaralda": ["Pereira", "Apía", "Balboa", "Belén de Umbría", "Dosquebradas", "Guática", "La Celia", "La Virginia", "Marsella", "Mistrató", "Pueblo Rico", "Quinchía", "Santa Rosa de Cabal", "Santuario"],
  "San Andrés y Providencia": ["San Andrés", "Providencia", "Santa Catalina"],
  "Santander": ["Bucaramanga", "Aguada", "Albania", "Aratoca", "Barbosa", "Barichara", "Barrancabermeja", "Betulia", "Bolívar", "Cabrera", "California", "Capitanejo", "Carcasí", "Cepitá", "Cerrito", "Charalá", "Charta", "Chima", "Chipatá", "Cimitarra", "Concepción", "Confines", "Contratación", "Coromoro", "Curití", "El Carmen de Chucurí", "El Guacamayo", "El Playón", "El Socorro", "Encino", "Enciso", "Florián", "Floridablanca", "Galán", "Gámbita", "Girón", "Guaca", "Guadalupe", "Guapotá", "Guavatá", "Güepsa", "Hato", "Jesús María", "Jordán", "La Belleza", "La Paz", "Landázuri", "Lebríja", "Los Santos", "Macaravita", "Málaga", "Matanza", "Mogotes", "Molagavita", "Ocamonte", "Oiba", "Onzaga", "Palmar", "Palmas del Socorro", "Páramo", "Piedecuesta", "Pinchote", "Puente Nacional", "Puerto Parra", "Puerto Wilches", "Rionegro", "Sabana de Torres", "San Andrés", "San Benito", "San Gil", "San Joaquín", "San José de Miranda", "San Miguel", "San Vicente de Chucurí", "Santa Bárbara", "Santa Helena del Opón", "Simacota", "Socorro", "Suaita", "Sucre", "Surata", "Tona", "Valle de San José", "Vélez", "Vetas", "Villanueva", "Zapatoca"],
  "Sucre": ["Sincelejo", "Buenavista", "Caimito", "Chalán", "Coloso", "Corozal", "Coveñas", "El Roble", "Galeras", "Guaranda", "La Unión", "Los Palmitos", "Majagual", "Morroa", "Ovejas", "Palmito", "Sampués", "San Benito Abad", "San Juan de Betulia", "San Marcos", "San Onofre", "San Pedro", "Santiago de Tolú", "Sincé", "Sucre", "Tolú Viejo"],
  "Tolima": ["Ibagué", "Alpujarra", "Alvarado", "Ambalema", "Anzoátegui", "Armero", "Ataco", "Cajamarca", "Carmen de Apicalá", "Casabianca", "Chaparral", "Coello", "Coyaima", "Cunday", "Dolores", "Espinal", "Falan", "Flandes", "Fresno", "Guamo", "Herveo", "Honda", "Icononzo", "Lérida", "Líbano", "Mariquita", "Melgar", "Murillo", "Natagaima", "Ortega", "Palocabildo", "Piedras", "Planadas", "Prado", "Purificación", "Rioblanco", "Roncesvalles", "Rovira", "Saldaña", "San Antonio", "San Luis", "Santa Isabel", "Suárez", "Valle de San Juan", "Venadillo", "Villahermosa", "Villarrica"],
  "Valle del Cauca": ["Cali", "Alcalá", "Andalucía", "Ansermanuevo", "Argelia", "Bolívar", "Buenaventura", "Buga", "Bugalagrande", "Caicedonia", "Calima", "Candelaria", "Cartago", "Dagua", "El Águila", "El Cairo", "El Cerrito", "El Dovio", "Florida", "Ginebra", "Guacarí", "Jamundí", "La Cumbre", "La Unión", "La Victoria", "Obando", "Palmira", "Pradera", "Restrepo", "Riofrío", "Roldanillo", "San Pedro", "Sevilla", "Toro", "Trujillo", "Tuluá", "Ulloa", "Versalles", "Vijes", "Yotoco", "Yumbo", "Zarzal"],
  "Vaupés": ["Mitú", "Carurú", "Pacoa", "Taraira", "Papunaua", "Yavaraté"],
  "Vichada": ["Puerto Carreño", "Cumaribo", "La Primavera", "Santa Rosalía"],
};

const depSelect  = document.getElementById("departamento");
const muniSelect = document.getElementById("municipio");

depSelect?.addEventListener("change", () => {
  const dep = depSelect.value;
  const munis = MUNICIPIOS_COLOMBIA[dep] || [];
  muniSelect.innerHTML = '<option value="" disabled selected>Selecciona un municipio</option>';
  munis.forEach(m => {
    const opt = document.createElement("option");
    opt.value = m; opt.textContent = m;
    muniSelect.appendChild(opt);
  });
  muniSelect.disabled = false;
  muniSelect.value = "";
});