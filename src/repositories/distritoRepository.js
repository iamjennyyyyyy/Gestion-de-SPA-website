const pool = require("../config/database");

class DistritoRepository {
  async listarTodos() {
    const result = await pool.query(
      `SELECT d.iddistrito, d.nombre, COUNT(e.idempleado)::int AS empleados
			 FROM distritos d
			 LEFT JOIN empleados e ON e.iddistrito = d.iddistrito
			 GROUP BY d.iddistrito, d.nombre
			 ORDER BY d.iddistrito`,
    );
    return result.rows;
  }

  async buscarPorId(id) {
    const result = await pool.query(
      "SELECT * FROM distritos WHERE iddistrito = $1",
      [id],
    );
    return result.rows[0];
  }

  async buscarPorNombre(nombre) {
    const result = await pool.query(
      "SELECT * FROM distritos WHERE nombre = $1",
      [nombre],
    );
    return result.rows[0];
  }

  async crear(datos) {
    const valores = [];
    const campos = [];

    if (datos.nombre !== undefined) {
      campos.push(`nombre`);
      valores.push(datos.nombre);
    }

    if (campos.length === 0) {
      throw new Error("No hay datos para crear el distrito");
    }

    const placeholders = valores.map((_, i) => `$${i + 1}`).join(", ");
    const query = `INSERT INTO distritos (${campos.join(", ")}) VALUES (${placeholders}) RETURNING *`;

    const result = await pool.query(query, valores);
    return result.rows[0];
  }

  async actualizar(id, datos) {
    const valores = [];
    const sets = [];
    let contador = 1;

    if (datos.nombre !== undefined) {
      sets.push(`nombre = $${contador}`);
      valores.push(datos.nombre);
      contador++;
    }

    if (sets.length === 0) {
      throw new Error("No hay datos para actualizar");
    }

    valores.push(id);
    const query = `UPDATE distritos SET ${sets.join(", ")} WHERE iddistrito = $${contador} RETURNING *`;

    const result = await pool.query(query, valores);
    return result.rows[0];
  }

  async eliminar(id) {
    const result = await pool.query(
      "DELETE FROM distritos WHERE iddistrito = $1 RETURNING *",
      [id],
    );
    return result.rows[0];
  }

  async reasignarEmpleados(origenId, destinoId) {
    const result = await pool.query(
      `UPDATE empleados SET iddistrito = $1 WHERE iddistrito = $2 RETURNING *`,
      [destinoId, origenId],
    );
    return result.rows;
  }
  async buscarEmpleadosPorDistrito(idDistrito) {
    const result = await pool.query(
      `SELECT * FROM vw_empleados WHERE iddistrito = $1 ORDER BY nombre`,
      [idDistrito],
    );
    return result.rows;
  }
}

module.exports = new DistritoRepository();
