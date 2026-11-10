const paqueteVendidoRepository = require("../repositories/paqueteVendidoRepository");
const paqueteRepository = require("../repositories/paqueteRepository");
const clienteRepository = require("../repositories/clienteRepository");
const PaqueteVendido = require("../models/PaqueteVendido");

const paqueteVendidoService = {
  async listarPaquetesV() {
    return await paqueteVendidoRepository.listarTodos();
  },

  async obtenerPaqueteVPorId(id) {
    const paquete = await paqueteVendidoRepository.buscarPorId(id);
    if (!paquete) throw new Error("Paquete vendido no encontrado");
    return paquete;
  },

  async obtenerPaquetesVPorIntervaloPrecio(precioMin, precioMax) {
    if (!precioMin || !precioMax)
      throw new Error("Los precios son obligatorios");
    return await paqueteVendidoRepository.buscarPorIntervaloPrecio(
      precioMin,
      precioMax,
    );
  },

  async obtenerPaquetesVPorDuracionTotal(duracion) {
    if (!duracion) throw new Error("La duración es obligatoria");
    return await paqueteVendidoRepository.buscarPorDuracionTotal(duracion);
  },

  async obtenerPaquetesVPorFechaInicio(fechaInicio) {
    if (!fechaInicio) throw new Error("La fecha de inicio es obligatoria");
    return await paqueteVendidoRepository.buscarPorFechaInicio(fechaInicio);
  },

  async obtenerPaquetesVPorFechaCompra(fechaCompra) {
    if (!fechaCompra) throw new Error("La fecha de compra es obligatoria");
    return await paqueteVendidoRepository.buscarPorFechaCompra(fechaCompra);
  },

  async obtenerPaquetesVPorFechaFin(fechaFin) {
    if (!fechaFin) throw new Error("La fecha de fin es obligatoria");
    return await paqueteVendidoRepository.buscarPorFechaFin(fechaFin);
  },

  async obtenerPaquetesVPorIntervaloFechasInicio(fecha1, fecha2) {
    if (!fecha1 || !fecha2) throw new Error("Las fechas son obligatorias");
    return await paqueteVendidoRepository.buscarPorIntervaloFechasInicio(
      fecha1,
      fecha2,
    );
  },

  async obtenerPaquetesVPorIntervaloFechasFin(fecha1, fecha2) {
    if (!fecha1 || !fecha2) throw new Error("Las fechas son obligatorias");
    return await paqueteVendidoRepository.buscarPorIntervaloFechasFin(
      fecha1,
      fecha2,
    );
  },

  async obtenerPaquetesVPorIntervaloFechasCompra(fecha1, fecha2) {
    if (!fecha1 || !fecha2) throw new Error("Las fechas son obligatorias");
    return await paqueteVendidoRepository.buscarPorIntervaloFechasCompra(
      fecha1,
      fecha2,
    );
  },

  async crearPaqueteV(datos) {
    if (datos.idpaquete) {
      const paquete = await paqueteRepository.buscarPorId(datos.idpaquete);
      if (!paquete) throw new Error("El paquete no existe");
    }
    if (datos.idcliente) {
      const cliente = await clienteRepository.buscarPorId(datos.idcliente);
      if (!cliente) throw new Error("El cliente no existe");
    }
    const paqueteVendido = new PaqueteVendido(datos);
    paqueteVendido.validar();
    return await paqueteVendidoRepository.crear(datos);
  },

  async actualizarPaqueteV(id, datos) {
    const existente = await paqueteVendidoRepository.buscarPorId(id);
    if (!existente) throw new Error("Paquete vendido no encontrado");
    if (datos.idpaquete && datos.idpaquete !== existente.idpaquete) {
      const paquete = await paqueteRepository.buscarPorId(datos.idpaquete);
      if (!paquete) throw new Error("El paquete no existe");
    }
    if (datos.idcliente && datos.idcliente !== existente.idcliente) {
      const cliente = await clienteRepository.buscarPorId(datos.idcliente);
      if (!cliente) throw new Error("El cliente no existe");
    }
    PaqueteVendido.validarActualizacion(datos);
    return await paqueteVendidoRepository.actualizar(id, datos);
  },

  async eliminarPaqueteV(id) {
    const paquete = await paqueteVendidoRepository.buscarPorId(id);
    if (!paquete) throw new Error("Paquete vendido no encontrado");
    await paqueteVendidoRepository.eliminar(id);
  },
};

module.exports = paqueteVendidoService;
