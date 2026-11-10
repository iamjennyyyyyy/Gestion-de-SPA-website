const pool = require("../config/database");

class ReporteRepository {
  async generarIngresosPorMes(fechaMes) {
    const result = await pool.query(
      `SELECT * FROM generar_ingresos_por_mes($1)`,
      [fechaMes],
    );
    return result.rows[0];
  }

  async obtenerTop3Tratamientos() {
    const result = await pool.query(
      `SELECT * FROM vw_top_3_tratamientos_mas_solicitados`,
    );
    return result.rows;
  }

  async obtenerEmpleadosPorCliente(idCliente) {
    const result = await pool.query(
      `SELECT * FROM buscar_empleados_por_cliente($1)`,
      [idCliente],
    );
    return result.rows;
  }

  async buscarServiciosPorClientePorIntervalo(
    idCliente,
    fechaInicio,
    fechaFin,
  ) {
    const result = await pool.query(
      `SELECT * FROM buscarServiciosPorClientePorIntervalo($1, $2, $3)`,
      [idCliente, fechaInicio, fechaFin],
    );
    return result.rows;
  }

  async obtenerReporteDiscrepanciasCompleto(anio, mes) {
    const result = await pool.query(
      `SELECT * FROM reporte_discrepancias_completo($1, $2)`,
      [anio, mes],
    );
    return result.rows;
  }

  async obtenerReporteResumenPorTratamiento(anio, mes) {
    const result = await pool.query(
      `SELECT * FROM reporte_resumen_por_tratamiento($1, $2)`,
      [anio, mes],
    );
    return result.rows;
  }
}

module.exports = new ReporteRepository();
