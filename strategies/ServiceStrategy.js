/**
 * Clase base para el patrón Strategy
 * Define la interfaz que todas las estrategias concretas deben implementar
 */
class ServiceStrategy {
  /**
   * Valida los datos de la solicitud
   * @param {Object} data - Datos de la solicitud
   * @returns {Object} { valid: boolean, errors: string[] }
   */
  validate(data) {
    throw new Error('Method validate() must be implemented');
  }

  /**
   * Procesa la solicitud y ejecuta queries en la base de datos
   * @param {Object} data - Datos de la solicitud
   * @param {Object} client - Cliente de PostgreSQL (para transacciones)
   * @returns {Promise<Object>} Resultado del procesamiento
   */
  async process(data, client) {
    throw new Error('Method process() must be implemented');
  }

  /**
   * Extrae campos dinámicos del body según el subservicio
   * @param {Object} body - Body de la request
   * @param {string} subservicio - Nombre del subservicio
   * @returns {Object} Campos dinámicos extraídos
   */
  getDynamicFields(body, subservicio) {
    throw new Error('Method getDynamicFields() must be implemented');
  }

  /**
   * Retorna los prefijos de campos dinámicos para cada subservicio
   * @returns {Object} Mapa de subservicio -> prefijo
   */
  getSubservicioPrefixes() {
    return {};
  }
}

module.exports = ServiceStrategy;
