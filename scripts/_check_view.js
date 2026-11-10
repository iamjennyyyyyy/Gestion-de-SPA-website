const { Pool } = require("pg");
const p = new Pool({
  host: "localhost",
  user: "postgres",
  password: "postNicky",
  database: "SPA_Services",
  port: 5432,
});
(async () => {
  const r = await p.query(
    "SELECT pg_get_viewdef('vw_top_3_tratamientos_mas_solicitados'::regclass)",
  );
  console.log(r.rows[0]?.pg_get_viewdef || "NOT FOUND");
  // Also check column names
  const cols = await p.query(`
    SELECT column_name, data_type 
    FROM information_schema.columns 
    WHERE table_schema='public' AND table_name='vw_top_3_tratamientos_mas_solicitados'
    ORDER BY ordinal_position
  `);
  console.log(
    "\nColumns:",
    cols.rows.map((c) => c.column_name + " (" + c.data_type + ")").join(", "),
  );
  // Query the view
  const data = await p.query(
    "SELECT * FROM vw_top_3_tratamientos_mas_solicitados",
  );
  console.log("\nData:");
  data.rows.forEach((r) => console.log(JSON.stringify(r)));
  await p.end();
})();
