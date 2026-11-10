const { Pool } = require("pg");
const p = new Pool({
  host: "localhost",
  user: "postgres",
  password: "postNicky",
  database: "SPA_Services",
  port: 5432,
});
(async () => {
  // Check paquetevendido data
  const pv = await p.query("SELECT * FROM paquetevendido");
  console.log("=== PAQUETEVENDIDO ===");
  if (pv.rows.length === 0) {
    console.log("(empty)");
  } else {
    pv.rows.forEach((r) => console.log(JSON.stringify(r)));
  }

  // Check citas with idpaquetevendido
  const citas = await p.query(
    "SELECT idcita, idcliente, idtratamiento, idpaquetevendido, fecha FROM citas ORDER BY idcita",
  );
  console.log("\n=== CITAS ===");
  citas.rows.forEach((c) =>
    console.log(
      `  idcita=${c.idcita}, idcliente=${c.idcliente}, idpaquetevendido=${c.idpaquetevendido}, fecha=${c.fecha}`,
    ),
  );

  // Check if the view returns data when queried
  const vw = await p.query("SELECT * FROM vw_paquete_vendido_con_tratamientos");
  console.log("\n=== VW_PAQUETE_VENDIDO_CON_TRATAMIENTOS ===");
  console.log("Rows:", vw.rows.length);
  vw.rows.forEach((r) =>
    console.log(
      `  idpaquetevendido=${r.idpaquetevendido}, idpaquete=${r.idpaquete}, paquetenombre=${r.paquetenombre}, fechacompra=${r.fechacompra}, fechainicio=${r.fechainicio}, fechafin=${r.fechafin}`,
    ),
  );

  await p.end();
})();
