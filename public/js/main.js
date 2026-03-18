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

  // ── Verificar sesión y correo antes de enviar ──
  const userLoggedIn = !!sessionStorage.getItem('biotica_user_auth');
  if (!userLoggedIn) {
    setLoading(true);
    try {
      const checkRes  = await fetch('/api/auth/check-email', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ correo })
      });
      const checkData = await checkRes.json();
      setLoading(false);

      if (checkData.tiene_cuenta) {
        // Tiene cuenta → pedir que inicie sesión
        showEmailModal('login', correo, checkData.usuario);
        return;
      } else {
        // No tiene cuenta → proponer registro o continuar anónimo
        showEmailModal('register', correo, null);
        return;
      }
    } catch(e) {
      setLoading(false);
      // Si falla la verificación, continuar normal
    }
  }

  await doSubmitForm();
});

// ── Función real de envío ──
async function doSubmitForm() {
  setLoading(true);
  const formData = new FormData(form);
  const userId = sessionStorage.getItem('biotica_user_id');
  if (userId) formData.append('usuario_id', userId);
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
}

// ── Modal de verificación de correo ──
function showEmailModal(type, correo, usuario) {
  const overlay = document.getElementById('email-check-modal');
  const box     = document.getElementById('email-modal-content');
  if (!overlay || !box) return;

  // Guardar correo para usarlo después del login/registro
  sessionStorage.setItem('biotica_pending_correo', correo);

  if (type === 'login') {
    box.innerHTML = `
      <span class="emodal-icon">👋</span>
      <div class="emodal-title">¡Ya tienes una cuenta!</div>
      <p class="emodal-sub">El correo <strong>${correo}</strong> está registrado con el usuario <strong>@${usuario}</strong>.<br>Inicia sesión para vincular esta orden a tu cuenta y poder hacer seguimiento.</p>
      <div class="emodal-btn-group">
        <a href="/login-usuario.html" class="emodal-btn emodal-btn-primary" onclick="saveFormBeforeLeave()">Iniciar sesión y continuar</a>
        <div class="emodal-divider">o</div>
        <button class="emodal-btn emodal-btn-ghost" onclick="closeEmailModal(); doSubmitForm()">Continuar sin iniciar sesión</button>
      </div>`;
  } else {
    box.innerHTML = `
      <span class="emodal-icon">🌿</span>
      <div class="emodal-title">¿Quieres hacer seguimiento?</div>
      <p class="emodal-sub">Crea una cuenta gratis con <strong>${correo}</strong> y podrás ver el estado de todas tus órdenes en cualquier momento.<br>Si prefieres no registrarte, igual te enviaremos las actualizaciones por correo.</p>
      <div class="emodal-btn-group">
        <a href="/register.html" class="emodal-btn emodal-btn-primary" onclick="saveFormBeforeLeave()">Registrarme y continuar</a>
        <div class="emodal-divider">o</div>
        <button class="emodal-btn emodal-btn-outline" onclick="closeEmailModal(); doSubmitForm()">Solo seguimiento por correo</button>
        <button class="emodal-btn emodal-btn-ghost" onclick="closeEmailModal()">Cancelar</button>
      </div>`;
  }

  overlay.classList.remove('hidden');
}

function closeEmailModal() {
  document.getElementById('email-check-modal')?.classList.add('hidden');
}

// Guardar correo del formulario en sessionStorage antes de ir a login/register
function saveFormBeforeLeave() {
  const correo = document.getElementById('correo')?.value.trim();
  if (correo) sessionStorage.setItem('biotica_prefill_correo', correo);
}

// Cerrar modal al click fuera
document.getElementById('email-check-modal')?.addEventListener('click', function(e) {
  if (e.target === this) closeEmailModal();
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
// =====================
// TABS — Formulario / Chatbot GIO / Asesor Virtual
// =====================
function switchTab(tab) {
  const tabForm    = document.getElementById('tab-form');
  const tabChat    = document.getElementById('tab-chat');
  const tabAsesor  = document.getElementById('tab-asesor');
  const panelForm  = document.getElementById('panel-form');
  const panelChat  = document.getElementById('panel-chat');
  const panelAsesor = document.getElementById('panel-asesor');

  [tabForm, tabChat, tabAsesor].forEach(t => t?.classList.remove('active'));
  [panelForm, panelChat, panelAsesor].forEach(p => p?.classList.add('hidden'));

  if (tab === 'form') {
    tabForm?.classList.add('active');
    panelForm?.classList.remove('hidden');
  } else if (tab === 'chat') {
    tabChat?.classList.add('active');
    panelChat?.classList.remove('hidden');
    if (!gioStarted) startGio();
    else document.getElementById('chat-input')?.focus();
  } else if (tab === 'asesor') {
    tabAsesor?.classList.add('active');
    panelAsesor?.classList.remove('hidden');
  }
}

// ── Asesor Virtual ──
const ASESORES = {
  jose:   { nombre: 'José Ariel Dueñas Cepeda',  cargo: 'Director Técnico y Científico' },
  elkin:  { nombre: 'Elkin René Briceño Lara',    cargo: 'Director Desarrollo Sostenible e Innovación' },
  leonel: { nombre: 'Leonel Andrés Torres',        cargo: 'Apoyo Técnico en Campo' },
};
let asesorSeleccionado = null;

function selectAsesor(card, id) {
  document.querySelectorAll('.asesor-card').forEach(c => c.classList.remove('selected'));
  card.classList.add('selected');
  asesorSeleccionado = id;
  const a = ASESORES[id];
  const infoBox = document.getElementById('asesor-selected-info');
  const msgText = document.getElementById('asesor-msg-text');
  msgText.innerHTML = `Has seleccionado a <strong>${a.nombre}</strong> como tu asesor.<br><span style="font-size:.82rem;color:var(--text-soft)">${a.cargo}</span><br><br>Al continuar, tu solicitud será dirigida directamente a <strong>${a.nombre}</strong> para su atención personalizada.`;
  infoBox.classList.remove('hidden');
  infoBox.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

function clearAsesor() {
  document.querySelectorAll('.asesor-card').forEach(c => c.classList.remove('selected'));
  document.getElementById('asesor-selected-info')?.classList.add('hidden');
  asesorSeleccionado = null;
}

function solicitarConAsesor() {
  if (!asesorSeleccionado) return;
  const a = ASESORES[asesorSeleccionado];
  sessionStorage.setItem('biotica_asesor', JSON.stringify({ id: asesorSeleccionado, ...a }));
  switchTab('form');
  showAsesorBanner(a);
  document.getElementById('form-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function chatearConAsesor() {
  if (!asesorSeleccionado) return;
  const nombre = sessionStorage.getItem('biotica_user_name') || '';
  const url = `/chat-asesor.html?asesor=${asesorSeleccionado}${nombre ? '&nombre='+encodeURIComponent(nombre) : ''}`;
  window.open(url, '_blank', 'width=600,height=700,noopener');
}

function showAsesorBanner(asesor) {
  document.getElementById('asesor-banner')?.remove();
  const formCard = document.getElementById('panel-form');
  if (!formCard) return;
  const banner = document.createElement('div');
  banner.id = 'asesor-banner';
  banner.style.cssText = 'background:linear-gradient(135deg,#eef7f1,#f0faf3);border:1.5px solid var(--green-pale);border-left:4px solid var(--green-vivid);border-radius:12px;padding:.85rem 1.1rem;margin-bottom:1.25rem;display:flex;align-items:center;justify-content:space-between;gap:.75rem;font-size:.85rem;';
  banner.innerHTML = `<span>🌿 Tu solicitud será atendida por <strong style="color:var(--green-vivid)">${asesor.nombre}</strong> — <span style="color:var(--text-soft)">${asesor.cargo}</span></span><button onclick="clearAsesorBanner()" style="background:none;border:none;cursor:pointer;color:var(--text-soft);font-size:1rem;padding:0;flex-shrink:0">✕</button>`;
  const inner = formCard.querySelector('#form-feedback') || formCard.firstChild;
  formCard.insertBefore(banner, inner);
}

function clearAsesorBanner() {
  document.getElementById('asesor-banner')?.remove();
  sessionStorage.removeItem('biotica_asesor');
}

// =====================
// CHATBOT GIO — Flujo estructurado de captura de datos
// =====================
const MUNICIPIOS_BY_DEP = typeof MUNICIPIOS_COLOMBIA !== 'undefined' ? MUNICIPIOS_COLOMBIA : {};

// Pasos del flujo
const STEPS = [
  { id: 'nombre',        label: 'Nombre completo',    pct: 10, question: '¿Cuál es tu nombre completo?', placeholder: 'Ej. María García López' },
  { id: 'correo',        label: 'Correo electrónico', pct: 22, question: 'Por favor, indícame tu correo electrónico para enviarte la confirmación.', placeholder: 'ejemplo@correo.com', validate: v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) ? null : 'Por favor escribe un correo válido (ej. nombre@correo.com).' },
  { id: 'telefono',      label: 'Teléfono de contacto', pct: 34, question: '¿Cuál es tu número de celular de contacto?', placeholder: '+57 300 123 4567', validate: v => /^[+\d\s\-().]{7,20}$/.test(v) ? null : 'Ingresa un número de teléfono válido.' },
  { id: 'departamento',  label: 'Departamento',        pct: 50, question: '¿En qué departamento de Colombia se desarrollará tu proyecto?', placeholder: 'Ej. Santander', isDepto: true },
  { id: 'municipio',     label: 'Municipio',           pct: 64, question: '¿Y en qué municipio exactamente?', placeholder: 'Ej. Bucaramanga', isMunicipio: true },
  { id: 'servicio',      label: 'Tipo de servicio',    pct: 78, question: '¿Qué tipo de servicio ambiental necesitas?', isServicio: true },
  { id: 'urgencia',      label: 'Nivel de urgencia',   pct: 90, question: '¿Cuál es el nivel de urgencia de tu solicitud?', isUrgencia: true },
  { id: 'descripcion',   label: 'Descripción',         pct: 96, question: 'Cuéntame brevemente en qué consiste tu necesidad o proyecto.', placeholder: 'Describe tu requerimiento en pocas palabras...' },
];

const SERVICIOS_CHAT = {
  'Consultoría Ambiental':        'gestion-ambiental',
  'Ordenamiento y Planificación': 'ordenamiento-planificacion',
  'Biodiversidad y Restauración': 'biodiversidad-restauracion',
  'Manejo Forestal':              'manejo-forestal',
  'Ecoturismo':                   'ecoturismo',
  'Innovación y Sostenibilidad':  'innovacion-sostenibilidad',
  'Suministros':                  'suministros',
};

let gioStarted   = false;
let currentStep  = 0;
let gioData      = {};
let waitingFreeText = false;

const chatInputEl   = document.getElementById('chat-input');
const chatSendBtn   = document.getElementById('chat-send');
const chatMsgs      = document.getElementById('chat-messages');
const quickReplies  = document.getElementById('chat-quick-replies');
const progressFill  = document.getElementById('chat-progress-fill');
const progressLabel = document.getElementById('chat-progress-label');

// ── Helpers ──
function scrollChat() { if (chatMsgs) chatMsgs.scrollTop = chatMsgs.scrollHeight; }

function addMsg(html, role) {
  const div  = document.createElement('div');
  div.className = `chat-msg ${role}`;
  const bub  = document.createElement('span');
  bub.className = 'chat-bubble';
  bub.innerHTML = html;
  div.appendChild(bub);
  chatMsgs?.appendChild(div);
  scrollChat();
}

function showTypingIndicator() {
  const div = document.createElement('div');
  div.className = 'chat-msg bot chat-typing';
  div.id = 'gio-typing';
  div.innerHTML = '<span class="chat-bubble"><span></span><span></span><span></span></span>';
  chatMsgs?.appendChild(div);
  scrollChat();
}
function hideTyping() { document.getElementById('gio-typing')?.remove(); }

function botMsg(html, delay = 600) {
  return new Promise(resolve => {
    showTypingIndicator();
    setTimeout(() => {
      hideTyping();
      addMsg(html, 'bot');
      resolve();
    }, delay);
  });
}

function setProgress(pct, label) {
  if (progressFill)  progressFill.style.width  = pct + '%';
  if (progressLabel) progressLabel.textContent  = label;
}

function setQuickReplies(options) {
  if (!quickReplies) return;
  quickReplies.innerHTML = '';
  options.forEach(opt => {
    const btn = document.createElement('button');
    btn.className = 'quick-reply';
    btn.textContent = typeof opt === 'string' ? opt : opt.label;
    btn.addEventListener('click', () => handleUserInput(typeof opt === 'string' ? opt : opt.value));
    quickReplies.appendChild(btn);
  });
}
function clearQuickReplies() { if (quickReplies) quickReplies.innerHTML = ''; }

function setInputPlaceholder(text) { if (chatInputEl) chatInputEl.placeholder = text; }
function enableInput(on = true) {
  if (chatInputEl) chatInputEl.disabled = !on;
  if (chatSendBtn) chatSendBtn.disabled = !on;
}

// ── Start ──
async function startGio() {
  gioStarted  = true;
  currentStep = 0;
  gioData     = {};
  setProgress(0, 'Inicio');
  clearQuickReplies();

  await botMsg('¡Bienvenido a la plataforma de gestión ambiental de <strong>Biótica Consultores</strong>! 🌿', 500);
  await botMsg('Para poder atender tu solicitud necesito algunos datos básicos. Empecemos…', 700);
  await askStep(0);
}

// ── Ask current step ──
async function askStep(stepIdx) {
  const step = STEPS[stepIdx];
  if (!step) return;
  setProgress(step.pct, step.label);
  clearQuickReplies();
  enableInput(true);

  // Sección headers
  if (stepIdx === 0) await botMsg('<span style="font-size:.8rem;color:var(--text-soft);font-weight:600;text-transform:uppercase;letter-spacing:.1em">📇 Datos de contacto</span>', 200);
  if (stepIdx === 3) await botMsg('<span style="font-size:.8rem;color:var(--text-soft);font-weight:600;text-transform:uppercase;letter-spacing:.1em">📍 Ubicación del proyecto</span>', 200);
  if (stepIdx === 5) await botMsg('<span style="font-size:.8rem;color:var(--text-soft);font-weight:600;text-transform:uppercase;letter-spacing:.1em">🌿 Tipo de servicio</span>', 200);
  if (stepIdx === 6) await botMsg('<span style="font-size:.8rem;color:var(--text-soft);font-weight:600;text-transform:uppercase;letter-spacing:.1em">⏱ Urgencia</span>', 200);
  if (stepIdx === 7) await botMsg('<span style="font-size:.8rem;color:var(--text-soft);font-weight:600;text-transform:uppercase;letter-spacing:.1em">📝 Descripción</span>', 200);

  await botMsg(step.question, 500);
  setInputPlaceholder(step.placeholder || 'Escribe tu respuesta...');

  // Quick replies para opciones fijas
  if (step.isServicio) {
    setQuickReplies(Object.keys(SERVICIOS_CHAT));
    enableInput(false);
  } else if (step.isUrgencia) {
    setQuickReplies(['🔴 Alta — 24 horas', '🟡 Media — 2-3 días', '🟢 Baja — 5 días']);
    enableInput(false);
  } else if (step.isDepto) {
    // Mostrar las primeras opciones como sugerencia
    const deps = Object.keys(MUNICIPIOS_BY_DEP).sort().slice(0, 6);
    setQuickReplies([...deps, '…ver más']);
    enableInput(true);
  }

  chatInputEl?.focus();
}

// ── Handle user input ──
async function handleUserInput(rawText) {
  const text = rawText?.trim();
  if (!text) return;

  // Si el usuario está en modo libre (pregunta fuera del flujo)
  if (waitingFreeText) {
    waitingFreeText = false;
    addMsg(text, 'user');
    await handleFreeQuestion(text);
    return;
  }

  addMsg(text, 'user');
  clearQuickReplies();
  enableInput(false);

  const step = STEPS[currentStep];
  if (!step) return;

  // Validación
  if (step.validate) {
    const err = step.validate(text);
    if (err) {
      await botMsg(`⚠️ ${err}`, 400);
      enableInput(true);
      setInputPlaceholder(step.placeholder || '');
      if (step.isServicio) setQuickReplies(Object.keys(SERVICIOS_CHAT));
      if (step.isUrgencia) setQuickReplies(['🔴 Alta — 24 horas', '🟡 Media — 2-3 días', '🟢 Baja — 5 días']);
      return;
    }
  }

  // Procesar según tipo de campo
  if (step.isDepto) {
    // Buscar departamento (fuzzy)
    if (text === '…ver más') {
      const allDeps = Object.keys(MUNICIPIOS_BY_DEP).sort();
      setQuickReplies(allDeps.slice(0, 20));
      enableInput(true);
      return;
    }
    const found = Object.keys(MUNICIPIOS_BY_DEP).find(d => d.toLowerCase() === text.toLowerCase())
                || Object.keys(MUNICIPIOS_BY_DEP).find(d => d.toLowerCase().includes(text.toLowerCase()));
    if (!found) {
      await botMsg(`No encontré ese departamento. ¿Podrías escribirlo de otra forma? Algunos ejemplos: <em>Santander, Antioquia, Cundinamarca</em>.`, 400);
      const deps = Object.keys(MUNICIPIOS_BY_DEP).filter(d => d.toLowerCase().includes(text.toLowerCase().slice(0,3))).slice(0, 6);
      if (deps.length) setQuickReplies(deps);
      enableInput(true);
      return;
    }
    gioData.departamento = found;
    currentStep++;
    // Municipios del depto
    const munis = MUNICIPIOS_BY_DEP[found] || [];
    await botMsg(`¿Y en qué municipio de <strong>${found}</strong> exactamente?`, 500);
    setProgress(STEPS[currentStep-1].pct, 'Municipio');
    setQuickReplies(munis.slice(0, 8));
    setInputPlaceholder('Escribe o elige el municipio...');
    enableInput(true);
    return;

  } else if (step.isMunicipio) {
    const dep   = gioData.departamento;
    const munis = dep ? (MUNICIPIOS_BY_DEP[dep] || []) : [];
    const found = munis.find(m => m.toLowerCase() === text.toLowerCase())
               || munis.find(m => m.toLowerCase().includes(text.toLowerCase()));
    if (dep && munis.length && !found) {
      await botMsg(`No encontré ese municipio en ${dep}. ¿Podrías escribirlo de nuevo?`, 400);
      const sug = munis.filter(m => m.toLowerCase().includes(text.toLowerCase().slice(0,3))).slice(0,6);
      if (sug.length) setQuickReplies(sug);
      enableInput(true);
      return;
    }
    gioData.municipio = found || text;

  } else if (step.isServicio) {
    const svcKey = SERVICIOS_CHAT[text] || Object.entries(SERVICIOS_CHAT).find(([k]) => k.toLowerCase().includes(text.toLowerCase()))?.[1];
    if (!svcKey) {
      await botMsg('Por favor selecciona una de las opciones disponibles.', 400);
      setQuickReplies(Object.keys(SERVICIOS_CHAT));
      enableInput(false);
      return;
    }
    gioData.servicio      = svcKey;
    gioData.servicioNombre = Object.keys(SERVICIOS_CHAT).find(k => SERVICIOS_CHAT[k] === svcKey) || text;

  } else if (step.isUrgencia) {
    if (text.includes('Alta') || text.includes('alta') || text.includes('24'))      gioData.urgencia = 'alta';
    else if (text.includes('Media') || text.includes('media') || text.includes('2')) gioData.urgencia = 'media';
    else if (text.includes('Baja') || text.includes('baja') || text.includes('5'))  gioData.urgencia = 'baja';
    else { await botMsg('Por favor elige Alta, Media o Baja.', 400); setQuickReplies(['🔴 Alta — 24 horas', '🟡 Media — 2-3 días', '🟢 Baja — 5 días']); enableInput(false); return; }

  } else {
    gioData[step.id] = text;
  }

  currentStep++;

  // Si terminamos todos los pasos → mostrar resumen
  if (currentStep >= STEPS.length) {
    await showSummary();
    return;
  }

  // Confirmaciones intermedias
  if (currentStep === 3) await botMsg('Perfecto, ya tengo tus datos de contacto. 👍', 300);
  if (currentStep === 5) await botMsg(`Anotado: <strong>${gioData.municipio}, ${gioData.departamento}</strong>. ✅`, 300);

  await askStep(currentStep);
}

// ── Resumen y confirmación ──
async function showSummary() {
  setProgress(100, 'Confirmación');
  clearQuickReplies();
  enableInput(false);

  const urgLabels = { alta: '🔴 Alta (24h)', media: '🟡 Media (2-3 días)', baja: '🟢 Baja (5 días)' };

  await botMsg('¡Perfecto! Ya tengo todos tus datos. Déjame hacer un resumen antes de enviar tu solicitud:', 600);

  const summaryDiv = document.createElement('div');
  summaryDiv.className = 'chat-msg bot';
  summaryDiv.innerHTML = `<div class="chat-summary">
    <div><span class="sum-label">Nombre</span><br><span class="sum-val">${gioData.nombre||'—'}</span></div>
    <div><span class="sum-label">Correo</span><br><span class="sum-val">${gioData.correo||'—'}</span></div>
    <div><span class="sum-label">Teléfono</span><br><span class="sum-val">${gioData.telefono||'—'}</span></div>
    <div><span class="sum-label">Ubicación</span><br><span class="sum-val">${gioData.municipio||'—'}, ${gioData.departamento||'—'}</span></div>
    <div><span class="sum-label">Servicio</span><br><span class="sum-val">${gioData.servicioNombre||'—'}</span></div>
    <div><span class="sum-label">Urgencia</span><br><span class="sum-val">${urgLabels[gioData.urgencia]||'—'}</span></div>
    <div><span class="sum-label">Descripción</span><br><span class="sum-val">${gioData.descripcion||'—'}</span></div>
    <div class="chat-actions">
      <button class="chat-action-btn chat-action-primary" onclick="submitGioForm()">✅ Confirmar y generar orden</button>
      <button class="chat-action-btn chat-action-ghost"   onclick="restartGio()">↩ Volver a empezar</button>
    </div>
  </div>`;
  chatMsgs?.appendChild(summaryDiv);
  scrollChat();
}

// ── Enviar solicitud desde GIO ──
async function submitGioForm() {
  const btns = document.querySelectorAll('.chat-action-btn');
  btns.forEach(b => b.disabled = true);

  await botMsg('Enviando tu solicitud… ⏳', 300);

  try {
    const fd = new FormData();
    fd.append('nombre',       gioData.nombre       || '');
    fd.append('correo',       gioData.correo        || '');
    fd.append('telefono',     gioData.telefono      || '');
    fd.append('departamento', gioData.departamento  || '');
    fd.append('municipio',    gioData.municipio     || '');
    fd.append('servicio',     gioData.servicio      || '');
    fd.append('urgencia',     gioData.urgencia      || 'media');
    fd.append('descripcion',  gioData.descripcion   || '');

    // Si hay usuario registrado, adjuntarlo
    const userId = sessionStorage.getItem('biotica_user_id');
    if (userId) fd.append('usuario_id', userId);

    const res  = await fetch('/api/solicitud', { method: 'POST', body: fd });
    const data = await res.json();

    if (data.success) {
      setProgress(100, '¡Listo!');
      await botMsg(`🎉 <strong>¡Solicitud enviada con éxito!</strong><br>Tu número de orden es: <strong style="color:var(--green-vivid);font-size:1.05rem">${data.orden}</strong><br><span style="font-size:.8rem;color:var(--text-soft)">Te enviaremos la confirmación a ${gioData.correo}</span>`, 400);

      const doneDiv = document.createElement('div');
      doneDiv.className = 'chat-msg bot';
      doneDiv.innerHTML = `<div class="chat-summary" style="text-align:center">
        <div style="font-size:2rem;margin-bottom:.5rem">✅</div>
        <div class="sum-val" style="font-size:1.1rem">${data.orden}</div>
        <div class="sum-label">Guarda este número para hacer seguimiento</div>
        <div class="chat-actions" style="justify-content:center">
          <button class="chat-action-btn chat-action-ghost" onclick="startGio()">Nueva solicitud</button>
          <button class="chat-action-btn chat-action-primary" onclick="switchTab('form')">Ir al formulario</button>
        </div>
      </div>`;
      chatMsgs?.appendChild(doneDiv);
      scrollChat();
    } else {
      await botMsg(`⚠️ ${data.message || 'Hubo un error al enviar. ¿Quieres intentar de nuevo?'}`, 400);
      btns.forEach(b => b.disabled = false);
    }
  } catch(err) {
    await botMsg('Error de conexión. Por favor intenta de nuevo.', 400);
    btns.forEach(b => b.disabled = false);
  }
}

// ── Reiniciar ──
function restartGio() {
  if (chatMsgs) chatMsgs.innerHTML = '';
  gioStarted  = false;
  currentStep = 0;
  gioData     = {};
  clearQuickReplies();
  setProgress(0, 'Inicio');
  enableInput(true);
  startGio();
}

// ── Preguntas libres fuera del flujo ──
async function handleFreeQuestion(text) {
  showTypingIndicator();
  try {
    const res  = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 500,
        system: `Eres GIO, asistente virtual de Biótica Consultores Ltda, empresa colombiana de consultoría ambiental. Responde en español, de forma breve y amigable (máximo 2 párrafos). Si el usuario quiere hacer una solicitud, dile que continúe con el formulario de GIO.`,
        messages: [{ role: 'user', content: text }]
      })
    });
    const data = await res.json();
    hideTyping();
    const reply = data.content?.map(b => b.text||'').join('') || 'No pude responder eso. ¿Continuamos con tu solicitud?';
    addMsg(reply.replace(/\n/g, '<br>'), 'bot');
  } catch(e) {
    hideTyping();
    addMsg('Error de conexión. ¿Continuamos con tu solicitud?', 'bot');
  }
  // Retomar flujo si estamos en medio de pasos
  if (currentStep < STEPS.length && gioStarted) {
    setTimeout(() => askStep(currentStep), 800);
  }
}

// ── Event listeners ──
function handleSendBtn() {
  const text = chatInputEl?.value.trim();
  if (!text) return;
  if (chatInputEl) chatInputEl.value = '';
  handleUserInput(text);
}

chatSendBtn?.addEventListener('click', handleSendBtn);
chatInputEl?.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendBtn(); }
});