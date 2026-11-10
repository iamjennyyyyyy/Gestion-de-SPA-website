const pool = require("../config/database");

class PaqueteRepository {
  async listarTodos() {
    const result = await pool.query(
      "SELECT * FROM vw_paquete_con_tratamientos",
    );
    return result.rows;
  }

  async buscarPorId(id) {
    const result = await pool.query(
      "SELECT * FROM vw_paquete_con_tratamientos WHERE idpaquete = $1",
      [id],
    );
    return result.rows[0];
  }

  async buscarPorNombre(nombre) {
    const result = await pool.query(
      "SELECT * FROM vw_paquete_con_tratamientos WHERE paquetenombre = $1",
      [nombre],
    );
    return result.rows[0];
  }

  //RELACION CONTENIDOPAQUETE /PAQUETE - TRATAMIENTOS
  async buscarTratamientosPorPaquete(idPaquete) {
    const result = await pool.query(
      `SELECT t.idtratamiento,
            t.nombre as tratamientonombre,
            c.nombre as categorianombre,
            t.precio,
            t.duracion,
            t.descripcion
            FROM tratamientos t
            INNER JOIN contenidopaquete cp ON cp.idtratamiento = t.idtratamiento
            INNER JOIN categorias c ON c.idcategoria = t.idcategoria
            WHERE cp.idpaquete = $1
            ORDER BY t.nombre`,
      [idPaquete],
    );
    return result.rows;
  }

  async buscarPaquetesConTratamiento(idTratamiento) {
    const result = await pool.query(
      `SELECT p.idpaquete,
            p.nombre as paquetenombre,
            p.precio,
            p.duraciontotal
            FROM paquetes p
            INNER JOIN contenidopaquete cp ON cp.idpaquete = p.idpaquete
            WHERE cp.idtratamiento = $1
            ORDER BY p.nombre`,
      [idTratamiento],
    );
    return result.rows;
  }

  async asignarTratamientoAlPaquete(idTratamiento, idPaquete) {
    const result = await pool.query(
      `INSERT INTO contenidopaquete (idtratamiento, idpaquete)
            VALUES ($1, $2) RETURNING *`,
      [idTratamiento, idPaquete],
    );
    return result.rows[0];
  }

  async desasignarTratamientoDelPaquete(idTratamiento, idPaquete) {
    const result = await pool.query(
      `DELETE FROM contenidopaquete
            WHERE idtratamiento = $1 AND idpaquete = $2 RETURNING *`,
      [idTratamiento, idPaquete],
    );
    return result.rows[0];
  }

  async existeRelacion(idTratamiento, idPaquete) {
    const result = await pool.query(
      `SELECT * FROM contenidopaquete
            WHERE idtratamiento = $1 AND idpaquete = $2`,
      [idTratamiento, idPaquete],
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

    if (datos.precio !== undefined) {
      campos.push(`precio`);
      valores.push(datos.precio);
    }

    if (datos.duraciontotal !== undefined) {
      campos.push(`duraciontotal`);
      valores.push(datos.duraciontotal);
    }

    if (campos.length === 0) {
      throw new Error("No hay datos para crear el paquete");
    }

    const placeholders = valores.map((_, i) => `$${i + 1}`).join(", ");
    const query = `INSERT INTO paquetes (${campos.join(", ")}) VALUES (${placeholders}) RETURNING *`;

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

    if (datos.duraciontotal !== undefined) {
      sets.push(`duraciontotal = $${contador}`);
      valores.push(datos.duraciontotal);
      contador++;
    }

    if (datos.precio !== undefined) {
      sets.push(`precio = $${contador}`);
      valores.push(datos.precio);
      contador++;
    }

    if (sets.length === 0) {
      throw new Error("No hay datos para actualizar");
    }

    valores.push(id);
    const query = `UPDATE paquetes SET ${sets.join(", ")} WHERE idpaquete = $${contador} RETURNING *`;

    const result = await pool.query(query, valores);
    return result.rows[0];
  }

  async eliminar(id) {
    const result = await pool.query(
      "DELETE FROM paquetes WHERE idpaquete = $1 RETURNING *",
      [id],
    );
    return result.rows[0];
  }
}
module.exports = new PaqueteRepository();
