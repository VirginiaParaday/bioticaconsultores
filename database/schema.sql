-- ============================================================
-- BIÓTICA CONSULTORES — Schema PostgreSQL
-- ============================================================

-- Extensión para UUID
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================
-- TABLA PRINCIPAL: solicitudes
-- ============================================================
CREATE TABLE IF NOT EXISTS solicitudes (
  id              UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  orden           VARCHAR(20)   NOT NULL UNIQUE,           -- BIO-2026-001
  estado          VARCHAR(30)   NOT NULL DEFAULT 'Recibida'
                  CHECK (estado IN ('Recibida','En revisión','En proceso','Completada','Cancelada')),

-- Datos del solicitante
nombre VARCHAR(150) NOT NULL,
correo VARCHAR(150) NOT NULL,
telefono VARCHAR(30) NOT NULL,

-- Ubicación
departamento VARCHAR(80), municipio VARCHAR(100),

-- Servicio
servicio VARCHAR(60) NOT NULL, subservicio VARCHAR(80),

-- Descripción y urgencia
descripcion TEXT NOT NULL,
urgencia VARCHAR(10) NOT NULL CHECK (
    urgencia IN ('alta', 'media', 'baja')
),

-- Archivo adjunto
archivo VARCHAR(255),

-- Metadatos
fecha_creacion  TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  fecha_actualizacion TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- TABLA: campos_dinamicos
-- Almacena los campos específicos según subservicio (clave-valor)
-- ============================================================
CREATE TABLE IF NOT EXISTS campos_dinamicos (
    id SERIAL PRIMARY KEY,
    solicitud_id UUID NOT NULL REFERENCES solicitudes (id) ON DELETE CASCADE,
    campo VARCHAR(80) NOT NULL, -- ej. "eia_tipo", "if_extension"
    valor TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- TABLA: mensajes_gio
-- Historial de conversaciones del chatbot GIO
-- ============================================================
CREATE TABLE IF NOT EXISTS mensajes_gio (
    id SERIAL PRIMARY KEY,
    session_id VARCHAR(64) NOT NULL, -- ID de sesión del browser
    rol VARCHAR(10) NOT NULL CHECK (rol IN ('user', 'assistant')),
    contenido TEXT NOT NULL,
    solicitud_id UUID REFERENCES solicitudes (id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- TABLA: historial_estados
-- Auditoría de cambios de estado por solicitud
-- ============================================================
CREATE TABLE IF NOT EXISTS historial_estados (
    id SERIAL PRIMARY KEY,
    solicitud_id UUID NOT NULL REFERENCES solicitudes (id) ON DELETE CASCADE,
    estado_anterior VARCHAR(30),
    estado_nuevo VARCHAR(30) NOT NULL,
    observacion TEXT,
    cambiado_por VARCHAR(100) DEFAULT 'sistema',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- ÍNDICES
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_solicitudes_correo ON solicitudes (correo);

CREATE INDEX IF NOT EXISTS idx_solicitudes_servicio ON solicitudes (servicio);

CREATE INDEX IF NOT EXISTS idx_solicitudes_urgencia ON solicitudes (urgencia);

CREATE INDEX IF NOT EXISTS idx_solicitudes_estado ON solicitudes (estado);

CREATE INDEX IF NOT EXISTS idx_solicitudes_fecha ON solicitudes (fecha_creacion DESC);

CREATE INDEX IF NOT EXISTS idx_campos_solicitud_id ON campos_dinamicos (solicitud_id);

CREATE INDEX IF NOT EXISTS idx_gio_session ON mensajes_gio (session_id);

-- ============================================================
-- FUNCIÓN: actualizar fecha_actualizacion automáticamente
-- ============================================================
CREATE OR REPLACE FUNCTION set_fecha_actualizacion()
RETURNS TRIGGER AS $$
BEGIN
  NEW.fecha_actualizacion = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_solicitudes_updated
  BEFORE UPDATE ON solicitudes
  FOR EACH ROW EXECUTE FUNCTION set_fecha_actualizacion();

-- ============================================================
-- FUNCIÓN: registrar historial de estados automáticamente
-- ============================================================
CREATE OR REPLACE FUNCTION registrar_cambio_estado()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.estado IS DISTINCT FROM NEW.estado THEN
    INSERT INTO historial_estados (solicitud_id, estado_anterior, estado_nuevo)
    VALUES (NEW.id, OLD.estado, NEW.estado);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_historial_estado
  AFTER UPDATE ON solicitudes
  FOR EACH ROW EXECUTE FUNCTION registrar_cambio_estado();

-- ============================================================
-- VISTA: dashboard_stats (usada por GET /api/dashboard)
-- ============================================================
CREATE OR REPLACE VIEW dashboard_stats AS
SELECT
    COUNT(*) AS total,
    COUNT(*) FILTER (
        WHERE
            urgencia = 'alta'
    ) AS alta,
    COUNT(*) FILTER (
        WHERE
            urgencia = 'media'
    ) AS media,
    COUNT(*) FILTER (
        WHERE
            urgencia = 'baja'
    ) AS baja,
    COUNT(*) FILTER (
        WHERE
            estado = 'Recibida'
    ) AS recibidas,
    COUNT(*) FILTER (
        WHERE
            estado = 'En proceso'
    ) AS en_proceso,
    COUNT(*) FILTER (
        WHERE
            estado = 'Completada'
    ) AS completadas
FROM solicitudes;