const pool = require("../config/database");

class MaterialRepository {
  async listarTodos() {
    const result = await pool.query(
      "SELECT idmaterial, nombre, cantidad FROM materiales",
    );
    return result.rows;
  }

  async buscarPorId(id) {
    const result = await pool.query(
      "SELECT idmaterial, nombre, cantidad FROM materiales WHERE idmaterial = $1",
      [id],
    );
    return result.rows[0];
  }

  async buscarPorNombre(nombre) {
    const result = await pool.query(
      "SELECT idmaterial, nombre, cantidad FROM materiales WHERE nombre = $1",
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

    if (datos.cantidad !== undefined) {
      campos.push(`cantidad`);
      valores.push(datos.cantidad);
    }

    if (campos.length === 0) {
      throw new Error("No hay datos para crear el material");
    }

    const placeholders = valores.map((_, i) => `$${i + 1}`).join(", ");
    const query = `INSERT INTO materiales (${campos.join(", ")}) VALUES (${placeholders}) RETURNING *`;

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

    if (datos.cantidad !== undefined) {
      sets.push(`cantidad = $${contador}`);
      valores.push(datos.cantidad);
      contador++;
    }

    if (sets.length === 0) {
      throw new Error("No hay datos para actualizar");
    }

    valores.push(id);
    const query = `UPDATE materiales SET ${sets.join(", ")} WHERE idmaterial = $${contador} RETURNING *`;

    const result = await pool.query(query, valores);
    return result.rows[0];
  }

  async eliminar(id) {
    const result = await pool.query(
      "DELETE FROM materiales WHERE idmaterial = $1 RETURNING *",
      [id],
    );
    return result.rows[0];
  }
}

module.exports = new MaterialRepository();
