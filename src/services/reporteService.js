const reporteRepository = require("../repositories/reporteRepository");

const reporteService = {
  async generarIngresosPorMes(fechaMes) {
    if (!fechaMes) {
      throw new Error("La fecha es obligatoria");
    }
    const fechaRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!fechaRegex.test(fechaMes)) {
      throw new Error("Formato de fecha inválido. Use YYYY-MM-DD");
    }
    return await reporteRepository.generarIngresosPorMes(fechaMes);
  },

  async obtenerTop3Tratamientos() {
    return await reporteRepository.obtenerTop3Tratamientos();
  },

  async obtenerEmpleadosPorCliente(idCliente) {
    if (!idCliente) {
      throw new Error("El ID del cliente es obligatorio");
    }
    const id = parseInt(idCliente);
    if (isNaN(id)) {
      throw new Error("El ID del cliente debe ser un número válido");
    }
    return await reporteRepository.obtenerEmpleadosPorCliente(id);
  },

  async buscarServiciosPorClientePorIntervalo(
    idCliente,
    fechaInicio,
    fechaFin,
  ) {
    if (!idCliente) {
      throw new Error("El ID del cliente es obligatorio");
    }
    if (!fechaInicio) {
      throw new Error("La fecha de inicio es obligatoria");
    }
    if (!fechaFin) {
      throw new Error("La fecha de fin es obligatoria");
    }

    const id = parseInt(idCliente);
    if (isNaN(id)) {
      throw new Error("El ID del cliente debe ser un número válido");
    }

    const fechaRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!fechaRegex.test(fechaInicio)) {
      throw new Error("Formato de fecha de inicio inválido. Use YYYY-MM-DD");
    }
    if (!fechaRegex.test(fechaFin)) {
      throw new Error("Formato de fecha de fin inválido. Use YYYY-MM-DD");
    }

    // Validar que fechaInicio no sea mayor que fechaFin
    if (fechaInicio > fechaFin) {
      throw new Error(
        "La fecha de inicio no puede ser mayor que la fecha de fin",
      );
    }

    return await reporteRepository.buscarServiciosPorClientePorIntervalo(
      id,
      fechaInicio,
      fechaFin,
    );
  },

  async obtenerReporteDiscrepanciasCompleto(anio, mes) {
    if (!anio && anio !== 0) {
      throw new Error("El año es obligatorio");
    }

    if (!mes && mes !== 0) {
      throw new Error("El mes es obligatorio");
    }
    const anioNum = parseInt(anio);
    if (isNaN(anioNum)) {
      throw new Error("El año debe ser un número válido");
    }
    if (anioNum < 1900 || anioNum > 2100) {
      throw new Error("El año debe estar entre 1900 y 2100");
    }

    const mesNum = parseInt(mes);
    if (isNaN(mesNum)) {
      throw new Error("El mes debe ser un número válido");
    }
    if (mesNum < 1 || mesNum > 12) {
      throw new Error("El mes debe estar entre 1 y 12");
    }

    return await reporteRepository.obtenerReporteDiscrepanciasCompleto(
      anioNum,
      mesNum,
    );
  },

  async obtenerReporteResumenPorTratamiento(anio, mes) {
    if (!anio && anio !== 0) {
      throw new Error("El año es obligatorio");
    }

    if (!mes && mes !== 0) {
      throw new Error("El mes es obligatorio");
    }
    const anioNum = parseInt(anio);
    if (isNaN(anioNum)) {
      throw new Error("El año debe ser un número válido");
    }
    if (anioNum < 1900 || anioNum > 2100) {
      throw new Error("El año debe estar entre 1900 y 2100");
    }

    const mesNum = parseInt(mes);
    if (isNaN(mesNum)) {
      throw new Error("El mes debe ser un número válido");
    }
    if (mesNum < 1 || mesNum > 12) {
      throw new Error("El mes debe estar entre 1 y 12");
    }

    return await reporteRepository.obtenerReporteResumenPorTratamiento(
      anioNum,
      mesNum,
    );
  },
};

module.exports = reporteService;
