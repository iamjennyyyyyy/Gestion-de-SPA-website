const pool = require("../config/database");

class EmpleadoRepository {
  async listarTodos() {
    const result = await pool.query(`SELECT * from vw_empleados`);
    return result.rows;
  }

  async buscarPorId(id) {
    const result = await pool.query(
      `SELECT * from vw_empleados
            WHERE idempleado = $1`,
      [id],
    );
    return result.rows[0];
  }

  async buscarPorNombre(nombre) {
    const result = await pool.query(
      `SELECT * from vw_empleados
            WHERE nombre = $1`,
      [nombre],
    );
    return result.rows[0];
  }

  async buscarPorDNI(dni_v) {
    const result = await pool.query(
      `SELECT * from vw_empleados
            WHERE dni = $1`,
      [dni_v],
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

    if (datos.especialidad !== undefined) {
      campos.push(`especialidad`);
      valores.push(datos.especialidad);
    }

    if (datos.horastrabajo !== undefined) {
      campos.push(`horastrabajo`);
      valores.push(datos.horastrabajo);
    }

    if (datos.direccion !== undefined) {
      campos.push(`direccion`);
      valores.push(datos.direccion);
    }

    if (datos.dni !== undefined) {
      campos.push(`dni`);
      valores.push(datos.dni);
    }

    if (datos.telefono !== undefined) {
      campos.push(`telefono`);
      valores.push(datos.telefono);
    }

    if (datos.iddistrito !== undefined) {
      campos.push(`iddistrito`);
      valores.push(datos.iddistrito);
    }

    if (datos.esfijo !== undefined) {
      campos.push(`esfijo`);
      valores.push(datos.esfijo);
    }

    if (campos.length === 0) {
      throw new Error("No hay datos para crear el empleado");
    }

    const placeholders = valores.map((_, i) => `$${i + 1}`).join(", ");
    const query = `INSERT INTO empleados (${campos.join(", ")}) VALUES (${placeholders}) RETURNING *`;

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

    if (datos.especialidad !== undefined) {
      sets.push(`especialidad = $${contador}`);
      valores.push(datos.especialidad);
      contador++;
    }

    if (datos.horastrabajo !== undefined) {
      sets.push(`horastrabajo = $${contador}`);
      valores.push(datos.horastrabajo);
      contador++;
    }

    if (datos.direccion !== undefined) {
      sets.push(`direccion = $${contador}`);
      valores.push(datos.direccion);
      contador++;
    }

    if (datos.dni !== undefined) {
      sets.push(`dni = $${contador}`);
      valores.push(datos.dni);
      contador++;
    }

    if (datos.telefono !== undefined) {
      sets.push(`telefono = $${contador}`);
      valores.push(datos.telefono);
      contador++;
    }

    if (datos.iddistrito !== undefined) {
      sets.push(`iddistrito = $${contador}`);
      valores.push(datos.iddistrito);
      contador++;
    }

    if (datos.esfijo !== undefined) {
      sets.push(`esfijo = $${contador}`);
      valores.push(datos.esfijo);
      contador++;
    }

    if (sets.length === 0) {
      throw new Error("No hay datos para actualizar");
    }

    valores.push(id);
    const query = `UPDATE empleados SET ${sets.join(", ")} WHERE idempleado = $${contador} RETURNING *`;

    const result = await pool.query(query, valores);
    return result.rows[0];
  }

  async eliminar(id) {
    const result = await pool.query(
      `DELETE FROM empleados WHERE idempleado = $1 RETURNING *`,
      [id],
    );
    return result.rows[0];
  }

  async cambiarEsFijo(id, esFijo) {
    const result = await pool.query(
      `UPDATE empleados SET esfijo = $1 WHERE idempleado = $2 RETURNING *`,
      [esFijo, id],
    );
    return result.rows[0];
  }

  // NUEVO MÉTODO: Eliminar empleado de todos los tratamientos fijos
  async eliminarDeTratamientosFijos(idEmpleado) {
    const result = await pool.query(
      `DELETE FROM empleadosfijosportratamiento WHERE idempleadofijo = $1 RETURNING *`,
      [idEmpleado],
    );
    return result.rows;
  }
}

module.exports = new EmpleadoRepository();
