const ServiceStrategy = require('./ServiceStrategy');

/**
 * Estrategia para el servicio de Biodiversidad y Restauración
 * Maneja: Inventarios, Estudios, Restauración, Monitoreo, Conservación
 */
class BiodiversidadStrategy extends ServiceStrategy {
  constructor() {
    super();
    this.subservicioPrefixes = {
      'inventarios-flora-fauna': 'if_',
      'estudios-biodiversidad': 'eb_',
      'restauracion-ecologica': 're_',
      'monitoreo-flora-fauna': 'mf_',
      'monitoreo-especies-amenazadas': 'me_',
      'planes-conservacion': 'pc_',
    };
  }

  validate(data) {
    const errors = [];

    if (!data.nombre || data.nombre.length < 3) {
      errors.push('El nombre debe tener al menos 3 caracteres');
    }

    if (!data.descripcion || data.descripcion.length < 10) {
      errors.push('La descripción debe tener al menos 10 caracteres');
    }

    // Validaciones específicas para biodiversidad
    if (data.subservicio === 'inventarios-flora-fauna' && !data.if_area_estudio) {
      errors.push('El área de estudio es requerida para inventarios');
    }

    if (data.subservicio === 'monitoreo-especies-amenazadas' && !data.me_especies) {
      errors.push('Debe especificar las especies a monitorear');
    }

    if (data.subservicio === 'restauracion-ecologica' && !data.re_tipo_ecosistema) {
      errors.push('El tipo de ecosistema es requerido para restauración');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  async process(data, client) {
    const { rows } = await client.query(
      `INSERT INTO solicitudes 
        (orden, nombre, correo, telefono, departamento, municipio,
         servicio, subservicio, descripcion, urgencia, archivo, estado, usuario_id)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,'Recibida',$12) RETURNING id`,
      [
        data.orden, data.nombre, data.correo, data.telefono,
        data.departamento || null, data.municipio || null,
        data.servicio, data.subservicio || null, data.descripcion, data.urgencia,
        data.archivo || null, data.usuario_id || null
      ]
    );

    return { solicitudId: rows[0].id };
  }

  getDynamicFields(body, subservicio) {
    const prefix = this.subservicioPrefixes[subservicio];
    if (!prefix) return {};

    return Object.fromEntries(
      Object.entries(body).filter(([k, v]) => k.startsWith(prefix) && v)
    );
  }

  getSubservicioPrefixes() {
    return this.subservicioPrefixes;
  }
}

module.exports = BiodiversidadStrategy;
