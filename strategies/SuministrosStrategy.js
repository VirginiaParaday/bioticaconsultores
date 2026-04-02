const ServiceStrategy = require('./ServiceStrategy');

/**
 * Estrategia para el servicio de Suministros
 * Maneja: Monitoreo, Insumos forestales, Kits de restauración, Herramientas, Seguridad
 */
class SuministrosStrategy extends ServiceStrategy {
  constructor() {
    super();
    this.subservicioPrefixes = {
      'sum-monitoreo': 'sum1_',
      'sum-insumos-forestales': 'sum2_',
      'sum-kits-restauracion': 'sum3_',
      'sum-herramientas': 'sum4_',
      'sum-seguridad': 'sum5_',
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

    // Validaciones específicas para suministros
    if (data.subservicio === 'sum-insumos-forestales' && !data.sum2_tipo_insumo) {
      errors.push('El tipo de insumo forestal es requerido');
    }

    if (data.subservicio === 'sum-kits-restauracion' && !data.sum3_cantidad) {
      errors.push('La cantidad de kits es requerida');
    }

    if (data.subservicio === 'sum-herramientas' && !data.sum4_tipo_herramienta) {
      errors.push('El tipo de herramienta es requerido');
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

module.exports = SuministrosStrategy;
