# 🌿 Biótica Consultores — Plataforma de Solicitudes Ambientales

## Instalación y ejecución

```bash
npm install
node server.js
```

Visita: http://localhost:3000

## Rutas

| URL | Descripción |
|-----|-------------|
| `/` | Página principal con formulario |
| `/dashboard.html` | Dashboard interno de solicitudes |
| `POST /api/solicitud` | Endpoint para enviar formulario |
| `GET /api/dashboard` | Datos para el dashboard |

## Características
- Formulario accesible con validación client-side y server-side
- Generación de número de orden único (BIO-2026-001)
- Upload de archivos (máx 5 MB)
- Dashboard con KPIs en tiempo real (actualización cada 30s)
- Diseño responsivo inspirado en bioticaconsultores.com
