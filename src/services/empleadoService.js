const empleadoRepository = require("../repositories/empleadoRepository");
const distritoRepository = require("../repositories/distritoRepository");
const Empleado = require("../models/Empleado");

const empleadoService = {
  async listarEmpleados() {
    return await empleadoRepository.listarTodos();
  },

  async obtenerEmpleadoPorId(id) {
    const empleado = await empleadoRepository.buscarPorId(id);
    if (!empleado) throw new Error("Empleado no encontrado");
    return empleado;
  },

  async obtenerEmpleadoPorDNI(dni) {
    const empleado = await empleadoRepository.buscarPorDNI(dni);
    if (!empleado) throw new Error("Empleado no encontrado");
    return empleado;
  },

  async crearEmpleado(datos) {
    const empleado = new Empleado(datos);
    empleado.validar();
    if (await empleadoRepository.buscarPorNombre(datos.nombre))
      throw new Error("Ya existe un empleado con ese nombre");
    if (await empleadoRepository.buscarPorDNI(datos.dni))
      throw new Error("Ya existe un empleado con ese DNI");
    const distrito = await distritoRepository.buscarPorId(datos.iddistrito);
    if (!distrito) throw new Error("El distrito no existe");
    return await empleadoRepository.crear(datos);
  },

  async actualizarEmpleado(id, datos) {
    const existente = await empleadoRepository.buscarPorId(id);
    if (!existente) throw new Error("Empleado no encontrado");
    if (
      datos.nombre &&
      datos.nombre !== existente.nombre &&
      (await empleadoRepository.buscarPorNombre(datos.nombre))
    ) {
      throw new Error("Ya existe un empleado con ese nombre");
    }
    if (
      datos.dni &&
      datos.dni !== existente.dni &&
      (await empleadoRepository.buscarPorDNI(datos.dni))
    ) {
      throw new Error("Ya existe un empleado con ese DNI");
    }
    Empleado.validarActualizacion(datos);
    return await empleadoRepository.actualizar(id, datos);
  },

  async eliminarEmpleado(id) {
    const empleado = await empleadoRepository.buscarPorId(id);
    if (!empleado) throw new Error("Empleado no encontrado");
    try {
      // Si el empleado es fijo, eliminar primero sus asignaciones fijas
      if (empleado.esfijo) {
        await empleadoRepository.eliminarDeTratamientosFijos(id);
      }
      await empleadoRepository.eliminar(id);
    } catch (e) {
      if (e.code === "23503")
        throw new Error(
          "No se puede eliminar: el empleado tiene citas, áreas o tratamientos asociados",
        );
      throw e;
    }
  },

  async cambiarEsFijo(id) {
    const empleado = await empleadoRepository.buscarPorId(id);
    if (!empleado) throw new Error("Empleado no encontrado");

    const nuevoValor = !empleado.esfijo;

    // Si se está desmarcando como fijo (nuevoValor === false),
    // eliminar todos los registros de empleadofijo
    if (nuevoValor === false) {
      await empleadoRepository.eliminarDeTratamientosFijos(id);
    }

    return await empleadoRepository.cambiarEsFijo(id, nuevoValor);
  },
};

module.exports = empleadoService;
