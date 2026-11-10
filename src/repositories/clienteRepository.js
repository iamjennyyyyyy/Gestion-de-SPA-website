const pool = require("../config/database");

class ClienteRepository {
  async listarTodos() {
    const result = await pool.query(
      `SELECT idcliente, nombre, ci, telefono, email
            FROM clientes
            ORDER BY idcliente`,
    );
    return result.rows;
  }

  async buscarPorId(id) {
    const result = await pool.query(
      `SELECT idcliente, nombre, ci, telefono, email
            FROM clientes
            WHERE idcliente = $1`,
      [id],
    );
    return result.rows[0];
  }

  async buscarPorNombre(nombre) {
    const result = await pool.query(
      `SELECT idcliente, nombre, ci, telefono, email
            FROM clientes
            WHERE nombre = $1`,
      [nombre],
    );
    return result.rows[0];
  }

  async buscarPorQuery(q) {
    const result = await pool.query(
      `SELECT idcliente, nombre, ci, telefono, email
            FROM clientes
            WHERE nombre ILIKE $1 OR ci ILIKE $1
            ORDER BY nombre
            LIMIT 20`,
      [`%${q}%`],
    );
    return result.rows;
  }

  async buscarPorDNI(dni_v) {
    const result = await pool.query(
      `SELECT idcliente, nombre, ci, telefono, email from clientes
            WHERE ci = $1`,
      [dni_v],
    );
    return result.rows[0];
  }

  async buscarServiciosPorClientePorIntervalo(idCliente, fecha1, fecha2) {
    const result = await pool.query(
      `
        
        SELECT
            p.nombre as nombre_servicio,
            pv.fechacompra as fecha,
            'PAQUETE' as tipo
        FROM paquetevendido pv
        JOIN paquetes p ON p.idpaquete = pv.idpaquete
        WHERE pv.idCliente = $1
        AND pv.fechacompra BETWEEN $2 AND $3
        
        UNION ALL
        
        SELECT
            t.nombre as nombre_servicio,
            c.fecha as fecha,
            'TRATAMIENTO' as tipo
        FROM citas c
        JOIN tratamientos t ON t.idtratamiento = c.idtratamiento
        WHERE c.idCliente = $1
        AND c.fecha BETWEEN $2 AND $3
        
        ORDER BY fecha DESC
    `,
      [idCliente, fecha1, fecha2],
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

    if (datos.ci !== undefined) {
      campos.push(`ci`);
      valores.push(datos.ci);
    }

    if (datos.email !== undefined) {
      campos.push(`email`);
      valores.push(datos.email);
    }

    if (datos.telefono !== undefined) {
      campos.push(`telefono`);
      valores.push(datos.telefono);
    }

    if (campos.length === 0) {
      throw new Error("No hay datos para crear el cliente");
    }

    const placeholders = valores.map((_, i) => `$${i + 1}`).join(", ");
    const query = `INSERT INTO clientes (${campos.join(", ")}) VALUES (${placeholders}) RETURNING *`;

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

    if (datos.ci !== undefined) {
      sets.push(`ci = $${contador}`);
      valores.push(datos.ci);
      contador++;
    }

    if (datos.email !== undefined) {
      sets.push(`email = $${contador}`);
      valores.push(datos.email);
      contador++;
    }

    if (datos.telefono !== undefined) {
      sets.push(`telefono = $${contador}`);
      valores.push(datos.telefono);
      contador++;
    }

    if (sets.length === 0) {
      throw new Error("No hay datos para actualizar");
    }

    valores.push(id);
    const query = `UPDATE clientes SET ${sets.join(", ")} WHERE idcliente = $${contador} RETURNING *`;

    const result = await pool.query(query, valores);
    return result.rows[0];
  }

  async eliminar(id) {
    const result = await pool.query(
      "DELETE FROM clientes WHERE idcliente = $1 RETURNING *",
      [id],
    );
    return result.rows[0];
  }
}

module.exports = new ClienteRepository();
