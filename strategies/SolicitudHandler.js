const GestionAmbientalStrategy = require('./GestionAmbientalStrategy');
const BiodiversidadStrategy = require('./BiodiversidadStrategy');
const ManejoForestalStrategy = require('./ManejoForestalStrategy');
const EcoturismoStrategy = require('./EcoturismoStrategy');
const InnovacionStrategy = require('./InnovacionStrategy');
const SuministrosStrategy = require('./SuministrosStrategy');
const OrdenamientoStrategy = require('./OrdenamientoStrategy');

/**
 * Contexto del patrón Strategy
 * Gestiona las diferentes estrategias de procesamiento de solicitudes
 */
class SolicitudHandler {
  constructor() {
    // Registro de estrategias por tipo de servicio
    this.strategies = {
      'gestion-ambiental': new GestionAmbientalStrategy(),
      'biodiversidad-restauracion': new BiodiversidadStrategy(),
      'manejo-forestal': new ManejoForestalStrategy(),
      'ecoturismo': new EcoturismoStrategy(),
      'innovacion-sostenibilidad': new InnovacionStrategy(),
      'suministros': new SuministrosStrategy(),
      'ordenamiento-planificacion': new OrdenamientoStrategy(),
    };
  }

  /**
   * Obtiene la estrategia para un tipo de servicio
   * @param {string} servicio - Tipo de servicio
   * @returns {ServiceStrategy} Estrategia correspondiente
   */
  getStrategy(servicio) {
    const strategy = this.strategies[servicio];
    if (!strategy) {
      throw new Error(`No strategy found for service: ${servicio}`);
    }
    return strategy;
  }

  /**
   * Valida los datos de la solicitud
   * @param {Object} data - Datos de la solicitud
   * @returns {Object} Resultado de la validación
   */
  validate(data) {
    const strategy = this.getStrategy(data.servicio);
    return strategy.validate(data);
  }

  /**
   * Procesa la solicitud completa
   * @param {Object} data - Datos de la solicitud
   * @param {Object} client - Cliente de PostgreSQL
   * @returns {Promise<Object>} Resultado del procesamiento
   */
  async process(data, client) {
    const strategy = this.getStrategy(data.servicio);
    
    // 1. Validar
    const validation = strategy.validate(data);
    if (!validation.valid) {
      throw new Error(`Validation failed: ${validation.errors.join(', ')}`);
    }

    // 2. Procesar
    const result = await strategy.process(data, client);

    // 3. Guardar campos dinámicos
    const dynamicFields = strategy.getDynamicFields(data, data.subservicio);
    if (Object.keys(dynamicFields).length > 0) {
      const entries = Object.entries(dynamicFields);
      const vals = entries.flatMap(([campo, valor]) => [result.solicitudId, campo, valor]);
      const ph = entries.map((_, i) => `($${i*3+1},$${i*3+2},$${i*3+3})`).join(',');
      await client.query(
        `INSERT INTO campos_dinamicos (solicitud_id, campo, valor) VALUES ${ph}`,
        vals
      );
    }

    return result;
  }

  /**
   * Extrae campos dinámicos del body
   * @param {Object} body - Body de la request
   * @param {string} servicio - Tipo de servicio
   * @param {string} subservicio - Subservicio
   * @returns {Object} Campos dinámicos
   */
  getDynamicFields(body, servicio, subservicio) {
    const strategy = this.getStrategy(servicio);
    return strategy.getDynamicFields(body, subservicio);
  }

  /**
   * Registra una nueva estrategia
   * @param {string} servicio - Tipo de servicio
   * @param {ServiceStrategy} strategy - Estrategia a registrar
   */
  registerStrategy(servicio, strategy) {
    this.strategies[servicio] = strategy;
  }

  /**
   * Lista todos los servicios disponibles
   * @returns {string[]} Lista de servicios
   */
  getAvailableServices() {
    return Object.keys(this.strategies);
  }
}

module.exports = SolicitudHandler;
