const ServiceStrategy = require('./ServiceStrategy');

/**
 * Estrategia para el servicio de Gestión Ambiental
 * Maneja: EIA, DIA, PMA, DAA, Licencias, Auditoría
 */
class GestionAmbientalStrategy extends ServiceStrategy {
  constructor() {
    super();
    this.subservicioPrefixes = {
      'ca-eia': 'eia_',
      'ca-dia': 'dia_',
      'ca-pma': 'pma_',
      'ca-daa': 'daa_',
      'ca-licencias': 'lic_',
      'ca-auditoria': 'aud_',
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

    // Validaciones específicas para gestión ambiental
    if (data.subservicio === 'ca-eia' && !data.eia_alcance) {
      errors.push('El alcance del EIA es requerido');
    }

    if (data.subservicio === 'ca-licencias' && !data.lic_tipo) {
      errors.push('El tipo de licencia es requerido');
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

module.exports = GestionAmbientalStrategy;
