const pool = require("../config/database");

class PaqueteVendidoRepository {
  async listarTodos() {
    const result = await pool.query(`
      SELECT * FROM vw_paquete_vendido_con_tratamientos`);
    return result.rows;
  }

  async buscarPorId(id) {
    const result = await pool.query(
      `
      SELECT * FROM vw_paquete_vendido_con_tratamientos
      WHERE idpaquetevendido = $1`,
      [id],
    );
    return result.rows[0];
  }

  async buscarPorIntervaloPrecio(precioMin, precioMax) {
    const result = await pool.query(
      `
      SELECT * FROM vw_paquete_vendido_con_tratamientos
      WHERE precio BETWEEN $1 AND $2`,
      [precioMin, precioMax],
    );
    return result.rows;
  }

  async buscarPorDuracionTotal(duracion) {
    const result = await pool.query(
      `
      SELECT * FROM vw_paquete_vendido_con_tratamientos
      WHERE duraciontotal = $1`,
      [duracion],
    );
    return result.rows;
  }

  async buscarPorFechaInicio(fechaInicio) {
    const result = await pool.query(
      `
      SELECT * FROM vw_paquete_vendido_con_tratamientos
      WHERE fechainicio = $1`,
      [fechaInicio],
    );
    return result.rows;
  }

  async buscarPorFechaCompra(fechaCompra) {
    const result = await pool.query(
      `
      SELECT * FROM vw_paquete_vendido_con_tratamientos
      WHERE fechacompra = $1`,
      [fechaCompra],
    );
    return result.rows;
  }

  async buscarPorFechaFin(fechaFin) {
    const result = await pool.query(
      `
      SELECT * FROM vw_paquete_vendido_con_tratamientos
      WHERE fechafin = $1`,
      [fechaFin],
    );
    return result.rows;
  }

  async buscarPorIntervaloFechasInicio(fecha1, fecha2) {
    const result = await pool.query(
      `
      SELECT * FROM vw_paquete_vendido_con_tratamientos
      WHERE fechainicio BETWEEN $1 AND $2`,
      [fecha1, fecha2],
    );
    return result.rows;
  }

  async buscarPorIntervaloFechasFin(fecha1, fecha2) {
    const result = await pool.query(
      `
      SELECT * FROM vw_paquete_vendido_con_tratamientos
      WHERE fechafin BETWEEN $1 AND $2`,
      [fecha1, fecha2],
    );
    return result.rows;
  }

  async buscarPorIntervaloFechasCompra(fecha1, fecha2) {
    const result = await pool.query(
      `
      SELECT * FROM vw_paquete_vendido_con_tratamientos
      WHERE fechacompra BETWEEN $1 AND $2`,
      [fecha1, fecha2],
    );
    return result.rows;
  }

  async crear(datos) {
    const valores = [];
    const campos = [];

    if (datos.idpaquete !== undefined) {
      campos.push(`idpaquete`);
      valores.push(datos.idpaquete);
    }

    if (datos.idcliente !== undefined) {
      campos.push(`idcliente`);
      valores.push(datos.idcliente);
    }

    if (datos.precio !== undefined) {
      campos.push(`precio`);
      valores.push(datos.precio);
    }

    if (datos.fechacompra !== undefined) {
      campos.push(`fechacompra`);
      valores.push(datos.fechacompra);
    }

    if (datos.fechainicio !== undefined) {
      campos.push(`fechainicio`);
      valores.push(datos.fechainicio);
    }

    if (datos.fechafin !== undefined) {
      campos.push(`fechafin`);
      valores.push(datos.fechafin);
    }

    if (campos.length === 0) {
      throw new Error("No hay datos para crear la venta del paquete");
    }

    const placeholders = valores.map((_, i) => `$${i + 1}`).join(", ");
    const query = `INSERT INTO paquetevendido (${campos.join(", ")}) VALUES (${placeholders}) RETURNING *`;

    const result = await pool.query(query, valores);
    return result.rows[0];
  }

  async actualizar(id, datos) {
    const valores = [];
    const sets = [];
    let contador = 1;

    if (datos.idpaquete !== undefined) {
      sets.push(`idpaquete = $${contador}`);
      valores.push(datos.idpaquete);
      contador++;
    }

    if (datos.idcliente !== undefined) {
      sets.push(`idcliente = $${contador}`);
      valores.push(datos.idcliente);
      contador++;
    }

    if (datos.fechacompra !== undefined) {
      sets.push(`fechacompra = $${contador}`);
      valores.push(datos.fechacompra);
      contador++;
    }

    if (datos.precio !== undefined) {
      sets.push(`precio = $${contador}`);
      valores.push(datos.precio);
      contador++;
    }

    if (datos.fechainicio !== undefined) {
      sets.push(`fechainicio = $${contador}`);
      valores.push(datos.fechainicio);
      contador++;
    }

    if (datos.fechafin !== undefined) {
      sets.push(`fechafin = $${contador}`);
      valores.push(datos.fechafin);
      contador++;
    }

    if (sets.length === 0) {
      throw new Error("No hay datos para actualizar");
    }

    valores.push(id);
    const query = `UPDATE paquetevendido SET ${sets.join(", ")} WHERE idpaquetevendido = $${contador} RETURNING *`;

    const result = await pool.query(query, valores);
    return result.rows[0];
  }

  async eliminar(id) {
    const result = await pool.query(
      "DELETE FROM paquetevendido WHERE idpaquetevendido = $1 RETURNING *",
      [id],
    );
    return result.rows[0];
  }
}

module.exports = new PaqueteVendidoRepository();
