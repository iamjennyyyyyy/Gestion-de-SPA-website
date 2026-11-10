const pool = require("C:\\Users\\Jenny\\Desktop\\Proyecto Final BD\\src\\config\\database");
const Usuario = require("C:\\Users\\Jenny\\Desktop\\Proyecto Final BD\\src\\models\\Usuario");
const usuarioRepository = require("C:\\Users\\Jenny\\Desktop\\Proyecto Final BD\\src\\repositories\\usuarioRepository");

async function seedUser(username, contrasena, rol) {
  const existente = await usuarioRepository.buscarPorUsername(username);
  if (existente) {
    console.log(`Usuario ${username} ya existe, omitiendo`);
    return;
  }
  const u = new Usuario({ username, rol });
  await u.encriptarContrasena(contrasena);
  u.validar();
  await usuarioRepository.crear({
    username: u.username,
    rol: u.rol,
    contrasena: u.contrasena,
    salt: u.salt,
  });
  console.log(`Usuario ${username} creado (${rol})`);
}

(async () => {
  try {
    await seedUser("admin", "admin123", "administrador");
    await seedUser("dependiente", "dependiente123", "dependiente");

    const r = await pool.query(
      "SELECT username, rol FROM usuarios ORDER BY username",
    );
    console.log(
      "Usuarios en BD:",
      r.rows.map((u) => `${u.username} (${u.rol})`).join(", "),
    );
    await pool.end();
  } catch (e) {
    console.log("ERROR:", e.message);
  }
})();
