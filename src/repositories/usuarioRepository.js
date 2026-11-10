const pool = require("../config/database");

class UsuarioRepository {
  async listarTodos() {
    const result = await pool.query(
      "SELECT idusuario, username, rol, created_at FROM usuarios ORDER BY username",
    );
    return result.rows;
  }

  async buscarPorId(id) {
    const result = await pool.query(
      "SELECT idusuario, username, rol, created_at FROM usuarios WHERE idusuario = $1",
      [id],
    );
    return result.rows[0];
  }

  async buscarPorUsername(username) {
    const result = await pool.query(
      "SELECT * FROM usuarios WHERE username = $1",
      [username],
    );
    return result.rows[0];
  }

  async crear(datos) {
    const query = `INSERT INTO usuarios (username, rol, contrasena, salt) VALUES ($1, $2, $3, $4) RETURNING idusuario, username, rol, created_at`;
    const result = await pool.query(query, [
      datos.username,
      datos.rol,
      datos.contrasena,
      datos.salt,
    ]);
    return result.rows[0];
  }

  async actualizar(id, datos) {
    const valores = [];
    const sets = [];
    let contador = 1;

    if (datos.username !== undefined) {
      sets.push(`username = $${contador}`);
      valores.push(datos.username);
      contador++;
    }
    if (datos.rol !== undefined) {
      sets.push(`rol = $${contador}`);
      valores.push(datos.rol);
      contador++;
    }
    if (datos.contrasena !== undefined) {
      sets.push(`contrasena = $${contador}`);
      valores.push(datos.contrasena);
      contador++;
    }
    if (datos.salt !== undefined) {
      sets.push(`salt = $${contador}`);
      valores.push(datos.salt);
      contador++;
    }

    if (sets.length === 0) {
      throw new Error("No hay datos para actualizar");
    }

    valores.push(id);
    const query = `UPDATE usuarios SET ${sets.join(", ")} WHERE idusuario = $${contador} RETURNING idusuario, username, rol, created_at`;
    const result = await pool.query(query, valores);
    return result.rows[0];
  }

  async eliminar(id) {
    const result = await pool.query(
      "DELETE FROM usuarios WHERE idusuario = $1 RETURNING idusuario",
      [id],
    );
    return result.rows[0];
  }
}

module.exports = new UsuarioRepository();
