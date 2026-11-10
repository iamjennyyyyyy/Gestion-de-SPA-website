const pool = require("../config/database");

class AreaRepository {
  async listarTodos() {
    const result = await pool.query(
      `SELECT a.idarea, a.nombre, COALESCE(epa.count, 0)::int AS cantidadpersonalfijo
            FROM areas a
            LEFT JOIN (SELECT idarea, COUNT(*) AS count FROM empleadosporarea GROUP BY idarea) epa ON epa.idarea = a.idarea`,
    );
    return result.rows;
  }

  async buscarPorId(id) {
    const result = await pool.query(
      `SELECT a.idarea, a.nombre, COALESCE(epa.count, 0)::int AS cantidadpersonalfijo
            FROM areas a
            LEFT JOIN (SELECT idarea, COUNT(*) AS count FROM empleadosporarea GROUP BY idarea) epa ON epa.idarea = a.idarea
            WHERE a.idarea = $1`,
      [id],
    );
    return result.rows[0];
  }

  async buscarPorNombre(nombre) {
    const result = await pool.query(
      `SELECT a.idarea, a.nombre, COALESCE(epa.count, 0)::int AS cantidadpersonalfijo
            FROM areas a
            LEFT JOIN (SELECT idarea, COUNT(*) AS count FROM empleadosporarea GROUP BY idarea) epa ON epa.idarea = a.idarea
            WHERE a.nombre = $1`,
      [nombre],
    );
    return result.rows[0];
  }

  //RELACION EMPLEADOS POR AREA / AREA - EMPLEADOS
  async buscarEmpleadosPorArea(idArea) {
    const result = await pool.query(
      `SELECT e.idempleado, e.nombre, e.dni, e.especialidad, e.esfijo, e.horastrabajo, e.direccion, e.telefono
            FROM empleados e
            INNER JOIN empleadosPorArea epa ON epa.idempleado = e.idempleado
            WHERE epa.idarea = $1
            ORDER BY e.nombre`,
      [idArea],
    );
    return result.rows;
  }
  //USAR METODO PARA FORMULARIOS
  async buscarEmpleadosSuplentesPorArea(idArea) {
    const result = await pool.query(
      `SELECT e.idempleado, e.nombre, e.dni, e.especialidad, e.esfijo, e.horastrabajo, e.direccion, e.telefono
            FROM empleados e
            INNER JOIN empleadosPorArea epa ON epa.idempleado = e.idempleado
            WHERE epa.idarea = $1 AND e.esfijo = false
            ORDER BY e.nombre`,
      [idArea],
    );
    return result.rows;
  }

  async buscarAreasDeUnEmpleado(idEmpleado) {
    const result = await pool.query(
      `SELECT a.idarea, a.nombre
            FROM areas a
            INNER JOIN empleadosPorArea epa ON epa.idarea = a.idarea
            WHERE epa.idempleado = $1
            ORDER BY a.nombre`,
      [idEmpleado],
    );
    return result.rows;
  }

  async asignarEmpleadoAUnArea(idEmpleado, idArea) {
    const result = await pool.query(
      `INSERT INTO empleadosporarea (idempleado, idarea)
            VALUES ($1, $2) RETURNING *`,
      [idEmpleado, idArea],
    );
    return result.rows[0];
  }

  async desasignarEmpleadoDeUnArea(idEmpleado, idArea) {
    const result = await pool.query(
      `DELETE FROM empleadosporarea
            WHERE idempleado = $1 AND idarea = $2 RETURNING *`,
      [idEmpleado, idArea],
    );
    return result.rows[0];
  }

  async existeRelacion(idEmpleado, idArea) {
    const result = await pool.query(
      `SELECT *
            FROM empleadosporarea
            WHERE idempleado = $1 AND idarea = $2`,
      [idEmpleado, idArea],
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
      throw new Error("No hay datos para crear el área");
    }

    const placeholders = valores.map((_, i) => `$${i + 1}`).join(", ");
    const query = `INSERT INTO areas (${campos.join(", ")}) VALUES (${placeholders}) RETURNING *`;

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

    if (datos.cantidadpersonalfijo !== undefined) {
      sets.push(`cantidadpersonalfijo = $${contador}`);
      valores.push(datos.cantidadpersonalfijo);
      contador++;
    }

    if (sets.length === 0) {
      throw new Error("No hay datos para actualizar");
    }

    valores.push(id);
    const query = `UPDATE areas SET ${sets.join(", ")} WHERE idarea = $${contador} RETURNING *`;

    const result = await pool.query(query, valores);
    return result.rows[0];
  }

  async eliminar(id) {
    const result = await pool.query(
      "DELETE FROM areas WHERE idarea = $1 RETURNING *",
      [id],
    );
    return result.rows[0];
  }
  async obtenerTodosEmpleadosPorArea(idArea) {
    const result = await pool.query(
      `SELECT e.idempleado, e.nombre, e.dni, e.especialidad, e.esfijo, e.horastrabajo, e.direccion, e.telefono
            FROM empleados e
            INNER JOIN empleadosPorArea epa ON epa.idempleado = e.idempleado
            WHERE epa.idarea = $1
            ORDER BY e.nombre`,
      [idArea],
    );
    return result.rows;
  }
  async desasignarEmpleadoDeUnArea(idArea, idEmpleado) {
    // Primero verificar si existe la asignación
    const asignacion = await pool.query(
      "SELECT * FROM empleadosporarea WHERE idarea = $1 AND idempleado = $2",
      [idArea, idEmpleado],
    );

    if (asignacion.rows.length === 0) {
      throw new Error("El empleado no está asignado a esta área");
    }

    // Si existe, proceder a eliminar
    const result = await pool.query(
      "DELETE FROM empleadosporarea WHERE idarea = $1 AND idempleado = $2 RETURNING *",
      [idArea, idEmpleado],
    );

    if (result.rowCount === 0) {
      throw new Error("No se pudo desasignar el empleado del área");
    }

    return {
      rowCount: result.rowCount,
      data: result.rows[0],
      message: "Empleado desasignado correctamente",
    };
  }
}

module.exports = new AreaRepository();
