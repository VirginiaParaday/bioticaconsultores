# 🗄️ Base de datos — Biótica Consultores

## Requisitos

- PostgreSQL 14+
- Node.js 18+

---

## 1. Crear la base de datos y usuario

```sql
-- Conectar como superusuario (psql -U postgres)
CREATE DATABASE biotica;
CREATE USER biotica_user WITH ENCRYPTED PASSWORD 'tu_password_seguro';
GRANT ALL PRIVILEGES ON DATABASE biotica TO biotica_user;
\c biotica
GRANT ALL ON SCHEMA public TO biotica_user;
```

## 2. Aplicar el schema

```bash
psql -U biotica_user -d biotica -f database/schema.sql
```

## 3. Configurar variables de entorno

```bash
cp .env.example .env
# Editar .env con tus credenciales
```

## 4. Instalar dependencias y correr el servidor

```bash
npm install
npm start        # producción
npm run dev      # desarrollo con auto-reload
```

---

## Estructura de tablas

| Tabla               | Descripción                                          |
| ------------------- | ---------------------------------------------------- |
| `solicitudes`       | Solicitud principal con datos del cliente y servicio |
| `campos_dinamicos`  | Campos específicos según subservicio (clave-valor)   |
| `mensajes_gio`      | Historial de conversaciones del chatbot              |
| `historial_estados` | Auditoría automática de cambios de estado            |
| `dashboard_stats`   | Vista precalculada para el dashboard                 |

---

## Endpoints disponibles

| Método  | Ruta                           | Descripción                                       |
| ------- | ------------------------------ | ------------------------------------------------- |
| `POST`  | `/api/solicitud`               | Crear nueva solicitud                             |
| `GET`   | `/api/dashboard`               | Stats + listado reciente                          |
| `GET`   | `/api/solicitud/:orden`        | Detalle completo con campos dinámicos e historial |
| `PATCH` | `/api/solicitud/:orden/estado` | Cambiar estado de una solicitud                   |

---

## Servicios cloud recomendados

| Plataforma   | Plan gratis       | URL de conexión                             |
| ------------ | ----------------- | ------------------------------------------- |
| **Supabase** | ✅ 500 MB         | `postgresql://...supabase.co:5432/postgres` |
| **Railway**  | ✅ 1 GB           | `postgresql://...railway.app:PORT/railway`  |
| **Render**   | ✅ 1 GB (90 días) | `postgresql://...render.com/biotica`        |
| **Neon**     | ✅ 3 GB           | `postgresql://...neon.tech/biotica`         |

Para producción en la nube, agregar en `.env`:

```
DATABASE_URL=postgresql://usuario:password@host:puerto/biotica
DB_SSL=true
```
