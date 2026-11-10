const pool = require("../config/database");

class TratamientoRepository {
  async listarTodos() {
    const result = await pool.query(
      `SELECT t.*, c.nombre as categorianombre FROM vw_tratamientos t
            LEFT JOIN categorias c ON c.idcategoria = t.idcategoria`,
    );
    return result.rows;
  }

  async buscarPorId(id) {
    const result = await pool.query(
      `SELECT t.*, c.nombre as categorianombre FROM vw_tratamientos t
            LEFT JOIN categorias c ON c.idcategoria = t.idcategoria
            WHERE t.idtratamiento = $1`,
      [id],
    );
    return result.rows[0];
  }

  async buscarPorNombre(nombre) {
    const result = await pool.query(
      `SELECT t.*, c.nombre as categorianombre FROM vw_tratamientos t
            LEFT JOIN categorias c ON c.idcategoria = t.idcategoria
            WHERE t.nombre = $1`,
      [nombre],
    );
    return result.rows[0];
  }

  async buscarPorCategoria(idcategoria) {
    const result = await pool.query(
      `SELECT t.*, c.nombre as categorianombre FROM vw_tratamientos t
            LEFT JOIN categorias c ON c.idcategoria = t.idcategoria
            WHERE t.idcategoria = $1`,
      [idcategoria],
    );
    return result.rows;
  }

  //RELACION EMPLEADOSFIJOSPORTRATAMIENTO / TRATAMIENTO - EMPLEADOS
  async buscarEmpleadosPorTratamiento(idTratamiento) {
    const result = await pool.query(
      `SELECT idempleado, nombre, dni, especialidad, esfijo, horastrabajo, direccion, telefono
            FROM empleados e
            INNER JOIN empleadosFijosPorTratamiento ept ON ept.idempleadofijo = e.idempleado
            WHERE ept.idtratamiento = $1
            ORDER BY e.nombre`,
      [idTratamiento],
    );
    return result.rows;
  }

  async buscarTratamientosPorEmpleadoAsignado(idEmpleado) {
    const result = await pool.query(
      `SELECT t.nombre as tratamientonombre, c.nombre as categorianombre, t.precio, t.duracion, t.descripcion
            FROM tratamientos t
            INNER JOIN categorias c ON c.idcategoria = t.idcategoria
            INNER JOIN empleadosfijosportratamiento eft ON eft.idtratamiento = t.idtratamiento
            WHERE eft.idempleadofijo = $1
            ORDER BY t.nombre`,
      [idEmpleado],
    );
    return result.rows;
  }

  async asignarEmpleadoAUnTratamiento(idEmpleado, idTratamiento) {
    const result = await pool.query(
      `INSERT INTO empleadosfijosportratamiento (idempleadofijo, idTratamiento)
            VALUES ($1, $2) RETURNING *`,
      [idEmpleado, idTratamiento],
    );
    return result.rows[0];
  }

  async desasignarEmpleadoDeUnTratamiento(idEmpleado, idTratamiento) {
    const result = await pool.query(
      `DELETE FROM empleadosfijosportratamiento
            WHERE idempleadofijo = $1 AND idtratamiento = $2 RETURNING *`,
      [idEmpleado, idTratamiento],
    );
    return result.rows[0];
  }

  async existeRelacion(idEmpleado, idTratamiento) {
    const result = await pool.query(
      `SELECT *
            FROM empleadosfijosportratamiento
            WHERE idempleadofijo = $1 AND idtratamiento = $2`,
      [idEmpleado, idTratamiento],
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

    if (datos.descripcion !== undefined) {
      campos.push(`descripcion`);
      valores.push(datos.descripcion);
    }

    if (datos.duracion !== undefined) {
      campos.push(`duracion`);
      valores.push(datos.duracion);
    }

    if (datos.idcategoria !== undefined) {
      campos.push(`idcategoria`);
      valores.push(datos.idcategoria);
    }

    if (campos.length === 0) {
      throw new Error("No hay datos para crear el tratamiento");
    }

    const placeholders = valores.map((_, i) => `$${i + 1}`).join(", ");
    const query = `INSERT INTO tratamientos (${campos.join(", ")}) VALUES (${placeholders}) RETURNING *`;

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

    if (datos.precio !== undefined) {
      sets.push(`precio = $${contador}`);
      valores.push(datos.precio);
      contador++;
    }

    if (datos.descripcion !== undefined) {
      sets.push(`descripcion = $${contador}`);
      valores.push(datos.descripcion);
      contador++;
    }

    if (datos.duracion !== undefined) {
      sets.push(`duracion = $${contador}`);
      valores.push(datos.duracion);
      contador++;
    }

    if (datos.idcategoria !== undefined) {
      sets.push(`idcategoria = $${contador}`);
      valores.push(datos.idcategoria);
      contador++;
    }

    if (sets.length === 0) {
      throw new Error("No hay datos para actualizar");
    }

    valores.push(id);
    const query = `UPDATE tratamientos SET ${sets.join(", ")} WHERE idtratamiento = $${contador} RETURNING *`;

    const result = await pool.query(query, valores);
    return result.rows[0];
  }

  async eliminar(id) {
    const result = await pool.query(
      "DELETE FROM tratamientos WHERE idtratamiento = $1 RETURNING *",
      [id],
    );
    return result.rows[0];
  }
  async moverACategoria(idCategoriaOrigen, idCategoriaDestino) {
    const result = await pool.query(
      `UPDATE tratamientos SET idcategoria = $1 WHERE idcategoria = $2 RETURNING *`,
      [idCategoriaDestino, idCategoriaOrigen],
    );
    return result.rows;
  }
  async buscarAreaPorTratamiento(idTratamiento) {
    const result = await pool.query(
      `SELECT a.idarea, a.nombre
            FROM areas a
            INNER JOIN categorias c ON c.idarea = a.idarea
            INNER JOIN tratamientos t ON t.idcategoria = c.idcategoria
            WHERE t.idtratamiento = $1`,
      [idTratamiento],
    );
    return result.rows[0];
  }
}

module.exports = new TratamientoRepository();
