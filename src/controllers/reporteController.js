const reporteService = require("../services/reporteService");

const reporteController = {
  async generarIngresosPorMes(req, res) {
    try {
      const { fecha } = req.query;
      const resultado = await reporteService.generarIngresosPorMes(fecha);
      res.json({ success: true, data: resultado });
    } catch (error) {
      res.status(400).json({ success: false, error: error.message });
    }
  },

  async obtenerTop3Tratamientos(req, res) {
    try {
      const top3 = await reporteService.obtenerTop3Tratamientos();
      res.json({ success: true, count: top3.length, data: top3 });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  },

  async obtenerEmpleadosPorCliente(req, res) {
    try {
      const idCliente = parseInt(req.params.idCliente);
      const empleados =
        await reporteService.obtenerEmpleadosPorCliente(idCliente);
      res.json({ success: true, count: empleados.length, data: empleados });
    } catch (error) {
      res.status(404).json({ success: false, error: error.message });
    }
  },

  async buscarServiciosPorClientePorIntervalo(req, res) {
    try {
      const idCliente = parseInt(req.params.idCliente);
      const { fechaInicio, fechaFin } = req.query;

      if (!fechaInicio || !fechaFin) {
        return res.status(400).json({
          success: false,
          error: "Las fechas de inicio y fin son obligatorias",
        });
      }

      const servicios =
        await reporteService.buscarServiciosPorClientePorIntervalo(
          idCliente,
          fechaInicio,
          fechaFin,
        );
      res.json({ success: true, count: servicios.length, data: servicios });
    } catch (error) {
      res.status(404).json({ success: false, error: error.message });
    }
  },

  async obtenerReporteDiscrepanciasCompleto(req, res) {
    try {
      const { anio, mes } = req.params;

      const anioNum = parseInt(anio);
      const mesNum = parseInt(mes);

      const reporte = await reporteService.obtenerReporteDiscrepanciasCompleto(
        anioNum,
        mesNum,
      );

      const totalTratamientos = new Set(
        reporte.map((item) => item.id_tratamiento),
      ).size;
      const totalMateriales = reporte.filter((item) => item.id_material).length;

      const totalCitasPlanificadas = reporte.reduce(
        (sum, item) => sum + (item.cantidad_planificada_citas || 0),
        0,
      );
      const totalCitasRealizadas = reporte.reduce(
        (sum, item) => sum + (item.cantidad_realizada_citas || 0),
        0,
      );
      const totalDiscrepanciaCitas = reporte.reduce(
        (sum, item) => sum + (item.discrepancia_citas || 0),
        0,
      );

      const totalMaterialPlanificado = reporte.reduce(
        (sum, item) => sum + (item.cantidad_planificada_material || 0),
        0,
      );
      const totalMaterialUtilizado = reporte.reduce(
        (sum, item) => sum + (item.cantidad_utilizada_material || 0),
        0,
      );
      const totalDiscrepanciaMaterial = reporte.reduce(
        (sum, item) => sum + (item.discrepancia_material || 0),
        0,
      );

      res.json({
        success: true,
        params: {
          anio: anioNum,
          mes: mesNum,
        },
        summary: {
          total_tratamientos: totalTratamientos,
          total_registros_materiales: totalMateriales,
          citas: {
            planificadas: totalCitasPlanificadas,
            realizadas: totalCitasRealizadas,
            discrepancia: totalDiscrepanciaCitas,
          },
          materiales: {
            planificados: totalMaterialPlanificado,
            utilizados: totalMaterialUtilizado,
            discrepancia: totalDiscrepanciaMaterial,
          },
        },
        data: reporte,
      });
    } catch (error) {
      if (error.message.includes("año") || error.message.includes("mes")) {
        res.status(400).json({ success: false, error: error.message });
      } else {
        res.status(500).json({ success: false, error: error.message });
      }
    }
  },

  async obtenerReporteResumenPorTratamiento(req, res) {
    try {
      const { anio, mes } = req.params;

      const anioNum = parseInt(anio);
      const mesNum = parseInt(mes);

      const reporte = await reporteService.obtenerReporteResumenPorTratamiento(
        anioNum,
        mesNum,
      );

      // Calcular resumen general
      const totalTratamientos = reporte.length;
      const totalCitasPlanificadas = reporte.reduce(
        (sum, item) => sum + (item.total_citas_planificadas || 0),
        0,
      );
      const totalCitasRealizadas = reporte.reduce(
        (sum, item) => sum + (item.total_citas_realizadas || 0),
        0,
      );
      const totalDiscrepanciaCitas = reporte.reduce(
        (sum, item) => sum + (item.discrepancia_citas || 0),
        0,
      );

      const totalMaterialesPlanificados = reporte.reduce(
        (sum, item) => sum + (item.total_material_planificado || 0),
        0,
      );
      const totalMaterialesUsados = reporte.reduce(
        (sum, item) => sum + (item.total_material_utilizado || 0),
        0,
      );
      const totalDiscrepanciaMateriales = reporte.reduce(
        (sum, item) => sum + (item.discrepancia_material || 0),
        0,
      );

      res.json({
        success: true,
        params: {
          anio: anioNum,
          mes: mesNum,
        },
        summary: {
          total_tratamientos: totalTratamientos,
          citas: {
            planificadas: totalCitasPlanificadas,
            realizadas: totalCitasRealizadas,
            discrepancia: totalDiscrepanciaCitas,
          },
          materiales: {
            planificados: totalMaterialesPlanificados,
            usados: totalMaterialesUsados,
            discrepancia: totalDiscrepanciaMateriales,
          },
        },
        data: reporte,
      });
    } catch (error) {
      if (error.message.includes("año") || error.message.includes("mes")) {
        res.status(400).json({ success: false, error: error.message });
      } else {
        res.status(500).json({ success: false, error: error.message });
      }
    }
  },
};

module.exports = reporteController;
