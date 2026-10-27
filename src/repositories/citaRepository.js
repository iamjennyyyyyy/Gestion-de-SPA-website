const pool = require('../config/database');

class CitaRepository {
        async listarTodos() {
        await pool.query(
            `UPDATE citas SET estado = 'cancelada'
             WHERE estado = 'pendiente'
               AND (fecha < CURRENT_DATE OR (fecha = CURRENT_DATE AND CURRENT_TIME > '17:00:00'))`
        );
        const result = await pool.query(`SELECT * from vw_citas`);
        return result.rows;
    }

    async buscarPorId(id) {
        const result = await pool.query(
            `SELECT * from vw_citas
            WHERE idcita = $1`, [id]);
        return result.rows[0];
    }

    async buscarPorTratamiento(idTratamiento) {
        const result = await pool.query(
            `SELECT * from vw_citas
            WHERE idtratamiento = $1`, [idTratamiento]);
        return result.rows;
    }

    async buscarPorPaquete(idPaqueteVendido) {
        const result = await pool.query(
            `SELECT * from vw_citas
            WHERE idpaquetevendido = $1`, [idPaqueteVendido]);
        return result.rows;
    }

    async buscarPorEstado(estado) {
        const result = await pool.query(
            `SELECT * from vw_citas
            WHERE LOWER(estado) = LOWER($1)`, [estado]);
        return result.rows;
    }

    async buscarPorCliente(idCliente) {
        const result = await pool.query(
            `SELECT * from vw_citas
            WHERE idcliente = $1`, [idCliente]);
        return result.rows;
    }

    async buscarPorEmpleado(idEmpleado) {
        const result = await pool.query(
            `SELECT * from vw_citas
            WHERE idempleado = $1`, [idEmpleado]);
        return result.rows;
    }

    async buscarPorFecha(fecha) {
        const result = await pool.query(
            `SELECT * from vw_citas
            WHERE fecha = $1`, [fecha]);
        return result.rows;
    }

    async buscarPorIntervaloFechas(fecha1, fecha2) {
        const result = await pool.query(
            `SELECT * from vw_citas
            WHERE fecha BETWEEN $1 AND $2`, [fecha1, fecha2]);
        return result.rows;
    }

    async buscarPorIntervaloPrecio(precioMin, precioMax) {
        const result = await pool.query(
            `SELECT * FROM vw_citas
            WHERE precio BETWEEN $1 AND $2`, [precioMin, precioMax]);
        return result.rows;
    }


    async crear(datos) {
        const valores = [];
        const campos = [];

        if (datos.idcliente !== undefined) {
            campos.push('idcliente');
            valores.push(datos.idcliente);
        }

        if (datos.idtratamiento !== undefined) {
            campos.push('idtratamiento');
            valores.push(datos.idtratamiento);
        }

        if (datos.fecha !== undefined) {
            campos.push('fecha');
            valores.push(datos.fecha);
        }

        if (datos.hora !== undefined) {
            campos.push('hora');
            valores.push(datos.hora);
        }

        if (datos.observaciones !== undefined) {
            campos.push('observaciones');
            valores.push(datos.observaciones);
        }

        if (datos.idpaquetevendido !== undefined) {
            campos.push('idpaquetevendido');
            valores.push(datos.idpaquetevendido);
        }

        if (datos.idempleado !== undefined) {
            campos.push('idempleado');
            valores.push(datos.idempleado);
        }

        if (datos.estado !== undefined) {
            campos.push('estado');
            valores.push(datos.estado);
        }

        if (datos.precio !== undefined) {
            campos.push('precio');
            valores.push(datos.precio);
        }

        if (campos.length === 0) {
            throw new Error('No hay datos para crear la cita');
        }

        const placeholders = valores.map((_, i) => `$${i + 1}`).join(', ');
        const query = `INSERT INTO citas (${campos.join(', ')}) VALUES (${placeholders}) RETURNING *`;

        const result = await pool.query(query, valores);
        return result.rows[0];
    }

    async actualizar(id, datos) {
        const valores = [];
        const sets = [];
        let contador = 1;

        if (datos.idcliente !== undefined) {
            sets.push(`idcliente = $${contador}`);
            valores.push(datos.idcliente);
            contador++;
        }

        if (datos.idtratamiento !== undefined) {
            sets.push(`idtratamiento = $${contador}`);
            valores.push(datos.idtratamiento);
            contador++;
        }

        if (datos.fecha !== undefined) {
            sets.push(`fecha = $${contador}`);
            valores.push(datos.fecha);
            contador++;
        }

        if (datos.hora !== undefined) {
            sets.push(`hora = $${contador}`);
            valores.push(datos.hora);
            contador++;
        }

        if (datos.observaciones !== undefined) {
            sets.push(`observaciones = $${contador}`);
            valores.push(datos.observaciones);
            contador++;
        }

        if (datos.idpaquetevendido !== undefined) {
            sets.push(`idpaquetevendido = $${contador}`);
            valores.push(datos.idpaquetevendido);
            contador++;
        }

        if (datos.idempleado !== undefined) {
            sets.push(`idempleado = $${contador}`);
            valores.push(datos.idempleado);
            contador++;
        }

        if (datos.estado !== undefined) {
            sets.push(`estado = $${contador}`);
            valores.push(datos.estado);
            contador++;
        }

        if (datos.precio !== undefined) {
            sets.push(`precio = $${contador}`);
            valores.push(datos.precio);
            contador++;
        }

        if (sets.length === 0) {
            throw new Error('No hay datos para actualizar');
        }

        valores.push(id);
        const query = `UPDATE citas SET ${sets.join(', ')} WHERE idcita = $${contador} RETURNING *`;

        const result = await pool.query(query, valores);
        return result.rows[0];
    }

    async eliminar(id) {
        const result = await pool.query('DELETE FROM citas WHERE idcita = $1 RETURNING *', [id]);
        return result.rows[0];
    }

    async buscarPorPaqueteVendido(idPaqueteVendido) {
  const result = await pool.query(
    `SELECT c.*, t.nombre as tratamientonombre 
     FROM citas c
     JOIN tratamientos t ON t.idtratamiento = c.idtratamiento
     WHERE c.idpaquetevendido = $1
     ORDER BY c.fecha ASC`,
    [idPaqueteVendido]
  );
  return result.rows;
}

async moverATratamiento(idOrigen, idDestino) {
    const r = await pool.query(
        'UPDATE citas SET idtratamiento = $1 WHERE idtratamiento = $2 RETURNING *',
        [idDestino, idOrigen]);
    return r.rows;
}
}

module.exports = new CitaRepository();
