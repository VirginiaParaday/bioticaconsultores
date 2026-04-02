const ServiceStrategy = require('./ServiceStrategy');

/**
 * Estrategia para el servicio de Manejo Forestal
 * Maneja: Inventarios forestales, Aprovechamiento, Reforestación, Certificación, Control de tala
 */
class ManejoForestalStrategy extends ServiceStrategy {
  constructor() {
    super();
    this.subservicioPrefixes = {
      'mf-inventarios-forestales': 'mfi_',
      'mf-aprovechamiento': 'mfa_',
      'mf-reforestacion': 'mfr_',
      'mf-certificacion': 'mfc_',
      'mf-control-tala': 'mft_',
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

    // Validaciones específicas para manejo forestal
    if (data.subservicio === 'mf-inventarios-forestales' && !data.mfi_area_hectareas) {
      errors.push('El área en hectáreas es requerida para inventarios forestales');
    }

    if (data.subservicio === 'mf-reforestacion' && !data.mfr_especies) {
      errors.push('Las especies a reforestar son requeridas');
    }

    if (data.subservicio === 'mf-certificacion' && !data.mfc_tipo_certificacion) {
      errors.push('El tipo de certificación es requerido');
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

module.exports = ManejoForestalStrategy;
