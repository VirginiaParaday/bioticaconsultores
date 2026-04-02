const ServiceStrategy = require('./ServiceStrategy');

/**
 * Estrategia para el servicio de Ordenamiento y Planificación
 * Maneja: Planificación territorial, Ordenamiento ambiental, Cuencas hidrográficas, Zonificación, Desarrollo sostenible
 */
class OrdenamientoStrategy extends ServiceStrategy {
  constructor() {
    super();
    this.subservicioPrefixes = {
      'op-planificacion-territorial': 'op1_',
      'op-ordenamiento-ambiental': 'op2_',
      'op-cuencas-hidrograficas': 'op3_',
      'op-zonificacion': 'op4_',
      'op-desarrollo-sostenible': 'op5_',
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

    // Validaciones específicas para ordenamiento
    if (data.subservicio === 'op-planificacion-territorial' && !data.op1_area_cobertura) {
      errors.push('El área de cobertura es requerida para planificación territorial');
    }

    if (data.subservicio === 'op-cuencas-hidrograficas' && !data.op3_nombre_cuenca) {
      errors.push('El nombre de la cuenca es requerido');
    }

    if (data.subservicio === 'op-zonificacion' && !data.op4_tipo_zonificacion) {
      errors.push('El tipo de zonificación es requerido');
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

module.exports = OrdenamientoStrategy;
