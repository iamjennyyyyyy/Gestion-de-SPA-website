const { Pool } = require("pg");
const p = new Pool({
  host: "localhost",
  user: "postgres",
  password: "postNicky",
  database: "SPA_Services",
  port: 5432,
});
(async () => {
  const def = await p.query(
    "SELECT pg_get_viewdef('vw_paquete_vendido_con_tratamientos'::regclass)",
  );
  console.log("Definition:", def.rows[0]?.pg_get_viewdef || "NOT FOUND");
  const cols = await p.query(
    "SELECT column_name FROM information_schema.columns WHERE table_schema='public' AND table_name='vw_paquete_vendido_con_tratamientos' ORDER BY ordinal_position",
  );
  console.log("Columns:", cols.rows.map((c) => c.column_name).join(", "));
  // Try querying
  const data = await p.query(
    "SELECT * FROM vw_paquete_vendido_con_tratamientos",
  );
  console.log("Data rows:", data.rows.length);
  if (data.rows.length > 0)
    console.log("First row keys:", Object.keys(data.rows[0]).join(", "));
  await p.end();
})();
