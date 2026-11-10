// 📁 jobs/refreshMaterializedViews.js
const cron = require("node-cron");
const pool = require("../config/database");

const refreshViews = async () => {
  try {
    await pool.query(
      `REFRESH MATERIALIZED VIEW vw_top_3_tratamientos_mas_solicitados`,
    );
    console.log(`vw_top_3_tratamientos_mas_solicitados actualizada`);
  } catch (error) {
    console.error(
      `Error actualizando vw_top_3_tratamientos_mas_solicitados:`,
      error.message,
    );
  }
};

cron.schedule("0 2 * * *", refreshViews);

console.log("Jobs programados: REFRESH de vistas materializadas a las 2 AM");
