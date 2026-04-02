/**
 * Índice del módulo de estrategias
 * Exporta todas las estrategias y el handler
 */

const ServiceStrategy = require('./ServiceStrategy');
const GestionAmbientalStrategy = require('./GestionAmbientalStrategy');
const BiodiversidadStrategy = require('./BiodiversidadStrategy');
const ManejoForestalStrategy = require('./ManejoForestalStrategy');
const EcoturismoStrategy = require('./EcoturismoStrategy');
const InnovacionStrategy = require('./InnovacionStrategy');
const SuministrosStrategy = require('./SuministrosStrategy');
const OrdenamientoStrategy = require('./OrdenamientoStrategy');
const SolicitudHandler = require('./SolicitudHandler');

module.exports = {
  ServiceStrategy,
  GestionAmbientalStrategy,
  BiodiversidadStrategy,
  ManejoForestalStrategy,
  EcoturismoStrategy,
  InnovacionStrategy,
  SuministrosStrategy,
  OrdenamientoStrategy,
  SolicitudHandler,
};
