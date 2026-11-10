const pool = require("../config/database");

class CategoriaRepository {
  async listarTodos() {
    const result = await pool.query(
      `SELECT c.idcategoria, c.nombre as categorianombre, a.nombre AS areanombre
            FROM categorias c
            INNER JOIN areas a ON c.idarea = a.idarea`,
    );
    return result.rows;
  }

  async buscarPorId(id) {
    const result = await pool.query(
      `SELECT c.idcategoria, c.nombre as categorianombre, c.idarea, a.nombre AS areanombre
            FROM categorias c
            INNER JOIN areas a ON c.idarea = a.idarea
            WHERE idcategoria = $1`,
      [id],
    );
    return result.rows[0];
  }

  async buscarPorNombre(nombre) {
    const result = await pool.query(
      `SELECT c.idcategoria, c.nombre as categorianombre, a.nombre AS areanombre
            FROM categorias c
            INNER JOIN areas a ON c.idarea = a.idarea
            WHERE c.nombre = $1`,
      [nombre],
    );
    return result.rows[0];
  }

  async buscarPorArea(idArea) {
    const result = await pool.query(
      `SELECT c.idcategoria, c.nombre as categorianombre, a.nombre AS areanombre
            FROM categorias c
            INNER JOIN areas a ON c.idarea = a.idarea
            WHERE c.idarea = $1`,
      [idArea],
    );
    return result.rows;
  }

  async crear(datos) {
    const valores = [];
    const campos = [];

    if (datos.nombre !== undefined) {
      campos.push(`nombre`);
      valores.push(datos.nombre);
    }

    if (datos.idarea !== undefined) {
      campos.push(`idarea`);
      valores.push(datos.idarea);
    }

    if (campos.length === 0) {
      throw new Error("No hay datos para crear la categoría");
    }

    const placeholders = valores.map((_, i) => `$${i + 1}`).join(", ");
    const query = `INSERT INTO categorias (${campos.join(", ")}) VALUES (${placeholders}) RETURNING *`;

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

    if (datos.idarea !== undefined) {
      sets.push(`idarea = $${contador}`);
      valores.push(datos.idarea);
      contador++;
    }

    if (sets.length === 0) {
      throw new Error("No hay datos para actualizar");
    }

    valores.push(id);
    const query = `UPDATE categorias SET ${sets.join(", ")} WHERE idcategoria = $${contador} RETURNING *`;

    const result = await pool.query(query, valores);
    return result.rows[0];
  }

  async eliminar(id) {
    const result = await pool.query(
      "DELETE FROM categorias WHERE idcategoria = $1 RETURNING *",
      [id],
    );
    return result.rows[0];
  }
  async cambiarDeArea(idCategoria, idAreaNueva) {
    const result = await pool.query(
      `UPDATE categorias SET idarea = $1 WHERE idcategoria = $2 RETURNING *`,
      [idAreaNueva, idCategoria],
    );
    return result.rows[0];
  }
}

module.exports = new CategoriaRepository();
