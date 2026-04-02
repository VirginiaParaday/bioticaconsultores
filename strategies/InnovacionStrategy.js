const ServiceStrategy = require('./ServiceStrategy');

/**
 * Estrategia para el servicio de Innovación y Sostenibilidad
 * Maneja: Investigación, Economía circular, Energías renovables, Huella de carbono, Sostenibilidad empresarial
 */
class InnovacionStrategy extends ServiceStrategy {
  constructor() {
    super();
    this.subservicioPrefixes = {
      'inn-investigacion': 'inn1_',
      'inn-economia-circular': 'inn2_',
      'inn-energias-renovables': 'inn3_',
      'inn-huella-carbono': 'inn4_',
      'inn-sostenibilidad-empresarial': 'inn5_',
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

    // Validaciones específicas para innovación
    if (data.subservicio === 'inn-investigacion' && !data.inn1_area_investigacion) {
      errors.push('El área de investigación es requerida');
    }

    if (data.subservicio === 'inn-energias-renovables' && !data.inn3_tipo_energia) {
      errors.push('El tipo de energía renovable es requerido');
    }

    if (data.subservicio === 'inn-huella-carbono' && !data.inn4_alcance) {
      errors.push('El alcance del cálculo de huella de carbono es requerido');
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

module.exports = InnovacionStrategy;
