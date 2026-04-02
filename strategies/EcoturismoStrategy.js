const ServiceStrategy = require('./ServiceStrategy');

/**
 * Estrategia para el servicio de Ecoturismo
 * Maneja: Rutas, Impacto, Manejo, Capacitación, Promoción
 */
class EcoturismoStrategy extends ServiceStrategy {
  constructor() {
    super();
    this.subservicioPrefixes = {
      'eco-rutas': 'eco1_',
      'eco-impacto': 'eco2_',
      'eco-manejo': 'eco3_',
      'eco-capacitacion': 'eco4_',
      'eco-promocion': 'eco5_',
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

    // Validaciones específicas para ecoturismo
    if (data.subservicio === 'eco-rutas' && !data.eco1_destino) {
      errors.push('El destino de la ruta es requerido');
    }

    if (data.subservicio === 'eco-capacitacion' && !data.eco4_tema) {
      errors.push('El tema de capacitación es requerido');
    }

    if (data.subservicio === 'eco-impacto' && !data.eco2_area_evaluacion) {
      errors.push('El área de evaluación de impacto es requerida');
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

module.exports = EcoturismoStrategy;
