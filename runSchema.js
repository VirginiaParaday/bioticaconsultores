const fs = require('fs');
const pool = require('./database/db'); // ajusta la ruta si tu db.js está en raíz

async function runSchema() {
  const schema = fs.readFileSync('./database/schema.sql', 'utf8');
  try {
    await pool.query(schema);
    console.log("✅ Esquema cargado en la base de datos Railway");
  } catch (err) {
    console.error("❌ Error cargando esquema:", err);
  } finally {
    pool.end();
  }
}

runSchema();