const paqueteRepository = require("../repositories/paqueteRepository");
const tratamientoRepository = require("../repositories/tratamientoRepository");
const Paquete = require("../models/Paquete");

const paqueteService = {
  async listarPaquetes() {
    return await paqueteRepository.listarTodos();
  },

  async obtenerPaquetePorId(id) {
    const paquete = await paqueteRepository.buscarPorId(id);
    if (!paquete) throw new Error("Paquete no encontrado");
    return paquete;
  },

  async obtenerTratamientosPorPaquete(idPaquete) {
    const paquete = await paqueteRepository.buscarPorId(idPaquete);
    if (!paquete) throw new Error("Paquete no encontrado");
    return await paqueteRepository.buscarTratamientosPorPaquete(idPaquete);
  },

  async obtenerPaquetesPorTratamiento(idTratamiento) {
    const tratamiento = await tratamientoRepository.buscarPorId(idTratamiento);
    if (!tratamiento) throw new Error("Tratamiento no encontrado");
    return await paqueteRepository.buscarPaquetesConTratamiento(idTratamiento);
  },

  async asignarTratamientoAPaquete(idPaquete, idTratamiento) {
    const paquete = await paqueteRepository.buscarPorId(idPaquete);
    const tratamiento = await tratamientoRepository.buscarPorId(idTratamiento);
    if (!paquete) throw new Error("Paquete no encontrado");
    if (!tratamiento) throw new Error("Tratamiento no encontrado");
    const existeRelacion = await paqueteRepository.existeRelacion(
      idTratamiento,
      idPaquete,
    );
    if (existeRelacion)
      throw new Error("Este tratamiento ya está asignado a este paquete");
    return await paqueteRepository.asignarTratamientoAlPaquete(
      idTratamiento,
      idPaquete,
    );
  },

  async desasignarTratamientoDePaquete(idPaquete, idTratamiento) {
    const paquete = await paqueteRepository.buscarPorId(idPaquete);
    const tratamiento = await tratamientoRepository.buscarPorId(idTratamiento);
    if (!paquete) throw new Error("Paquete no encontrado");
    if (!tratamiento) throw new Error("Tratamiento no encontrado");
    const existeRelacion = await paqueteRepository.existeRelacion(
      idTratamiento,
      idPaquete,
    );
    if (!existeRelacion)
      throw new Error("Este tratamiento no está asignado a este paquete");
    return await paqueteRepository.desasignarTratamientoDelPaquete(
      idTratamiento,
      idPaquete,
    );
  },

  async crearPaquete(datos) {
    const paquete = new Paquete(datos);
    paquete.validar();
    if (await paqueteRepository.buscarPorNombre(paquete.nombre))
      throw new Error("Ya existe un paquete con ese nombre");
    return await paqueteRepository.crear(datos);
  },

  async actualizarPaquete(id, datos) {
    const existente = await paqueteRepository.buscarPorId(id);
    if (!existente) throw new Error("Paquete no encontrado");
    if (
      datos.nombre &&
      datos.nombre !== existente.nombre &&
      (await paqueteRepository.buscarPorNombre(datos.nombre))
    ) {
      throw new Error("Ya existe un paquete con ese nombre");
    }
    Paquete.validarActualizacion(datos);
    return await paqueteRepository.actualizar(id, datos);
  },

  async eliminarPaquete(id) {
    const paquete = await paqueteRepository.buscarPorId(id);
    if (!paquete) throw new Error("Paquete no encontrado");
    try {
      await paqueteRepository.eliminar(id);
    } catch (e) {
      if (e.code === "23503")
        throw new Error(
          "No se puede eliminar: el paquete tiene ventas o contenido asociados",
        );
      throw e;
    }
  },
};

module.exports = paqueteService;
