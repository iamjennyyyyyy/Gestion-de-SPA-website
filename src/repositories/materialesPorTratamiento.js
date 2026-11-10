const pool = require("../config/database");

class materialesPorTratamientoRepository {
  async buscarMaterialesPorTratamiento(idTratamiento) {
    const result = await pool.query(
      `SELECT m.idmaterial,
            m.nombre as nombrematerial,
            mpt.cantidad
            FROM materiales m
            INNER JOIN materialesportratamiento mpt ON mpt.idmaterial = m.idmaterial
            WHERE mpt.idtratamiento = $1
            ORDER BY m.nombre`,
      [idTratamiento],
    );
    return result.rows;
  }

  async buscarTratamientosPorMaterial(idMaterial) {
    const result = await pool.query(
      `SELECT t.idtratamiento,
            t.nombre as nombretratamiento,
            mpt.cantidad
            FROM tratamientos t
            INNER JOIN materialesportratamiento mpt ON mpt.idtratamiento = t.idtratamiento
            WHERE mpt.idmaterial = $1
            ORDER BY t.nombre`,
      [idMaterial],
    );
    return result.rows;
  }

  async asignarMaterialATratamiento(idTratamiento, idMaterial, cantidad) {
    const result = await pool.query(
      `INSERT INTO materialesportratamiento (idtratamiento, idmaterial, cantidad)
            VALUES ($1, $2, $3) RETURNING *`,
      [idTratamiento, idMaterial, cantidad],
    );
    return result.rows[0];
  }

  async desasignarMaterialAUnTratamiento(idMaterial, idTratamiento) {
    const result = await pool.query(
      `DELETE FROM materialesportratamiento
            WHERE idmaterial = $1 AND idtratamiento = $2 RETURNING *`,
      [idMaterial, idTratamiento],
    );
    return result.rows[0];
  }

  async actualizarCantidadMaterial(idMaterial, idTratamiento, cant) {
    const result = await pool.query(
      `UPDATE materialesportratamiento
            SET cantidad = $1
            WHERE idmaterial = $2 AND idtratamiento = $3 RETURNING *`,
      [cant, idMaterial, idTratamiento],
    );
    return result.rows[0];
  }

  async existeRelacion(idMaterial, idTratamiento) {
    const result = await pool.query(
      `SELECT *
            FROM materialesportratamiento
            WHERE idtratamiento = $1 AND idmaterial = $2`,
      [idTratamiento, idMaterial],
    );
    return result.rows[0];
  }
}

module.exports = new materialesPorTratamientoRepository();
