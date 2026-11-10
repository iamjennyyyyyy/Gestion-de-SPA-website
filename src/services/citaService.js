const citaRepository = require("../repositories/citaRepository");
const clienteRepository = require("../repositories/clienteRepository");
const tratamientoRepository = require("../repositories/tratamientoRepository");
const empleadoRepository = require("../repositories/empleadoRepository");
const paqueteVendidoRepository = require("../repositories/paqueteVendidoRepository");
const materialesPorCitaRepository = require("../repositories/materialesPorCita");
const materialRepository = require("../repositories/materialRepository");
const { MaterialCita } = require("../models/Relaciones");
const Cita = require("../models/Cita");

const citaService = {
  async listarCitas() {
    return await citaRepository.listarTodos();
  },

  async obtenerCitaPorId(id) {
    const cita = await citaRepository.buscarPorId(id);
    if (!cita) throw new Error("Cita no encontrada");
    return cita;
  },

  async obtenerCitasPorCliente(idCliente) {
    const cliente = await clienteRepository.buscarPorId(idCliente);
    if (!cliente) throw new Error("Cliente no encontrado");
    return await citaRepository.buscarPorCliente(idCliente);
  },

  async obtenerCitasPorEmpleado(idEmpleado) {
    const empleado = await empleadoRepository.buscarPorId(idEmpleado);
    if (!empleado) throw new Error("Empleado no encontrado");
    return await citaRepository.buscarPorEmpleado(idEmpleado);
  },

  async obtenerCitasPorFecha(fecha) {
    if (!fecha) throw new Error("La fecha es obligatoria");
    return await citaRepository.buscarPorFecha(fecha);
  },

  async obtenerCitasPorTratamiento(idTratamiento) {
    const tratamiento = await tratamientoRepository.buscarPorId(idTratamiento);
    if (!tratamiento) throw new Error("Tratamiento no encontrado");
    return await citaRepository.buscarPorTratamiento(idTratamiento);
  },

  async obtenerCitasPorPaquete(idPaquete) {
    const paquete = await paqueteVendidoRepository.buscarPorId(idPaquete);
    if (!paquete) throw new Error("Paquete no encontrado");
    return await citaRepository.buscarPorPaquete(idPaquete);
  },

  async obtenerPaqueteVendidoPorCita(idCita) {
    const cita = await citaRepository.buscarPorId(idCita);
    if (!cita) throw new Error("Cita no encontrada");
    if (!cita.idpaquetevendido)
      throw new Error("Esta cita no está asociada a ningún paquete vendido");
    return await paqueteVendidoRepository.buscarPorId(cita.idpaquetevendido);
  },

  async obtenerCitasPorEstado(estado) {
    if (!estado) throw new Error("El estado es obligatorio");
    return await citaRepository.buscarPorEstado(estado);
  },

  async obtenerCitasPorIntervaloFechas(fecha1, fecha2) {
    if (!fecha1 || !fecha2) throw new Error("Las fechas son obligatorias");
    return await citaRepository.buscarPorIntervaloFechas(fecha1, fecha2);
  },

  async obtenerCitasPorIntervaloPrecio(precioMin, precioMax) {
    if (!precioMin || !precioMax)
      throw new Error("Los precios son obligatorios");
    return await citaRepository.buscarPorIntervaloPrecio(precioMin, precioMax);
  },

  async obtenerMaterialesPorCita(idCita) {
    const cita = await citaRepository.buscarPorId(idCita);
    if (!cita) throw new Error("Cita no encontrada");
    return await materialesPorCitaRepository.buscarMaterialesPorCita(idCita);
  },

  async obtenerCitasPorMaterial(idMaterial) {
    const material = await materialRepository.buscarPorId(idMaterial);
    if (!material) throw new Error("Material no encontrado");
    return await materialesPorCitaRepository.buscarCitasPorMaterial(idMaterial);
  },

  async asignarMaterialACita(idcita, idmaterial, cantidad) {
    console.log("=== SERVICE DEBUG ===");
    console.log("idCita:", idcita);
    console.log("idMaterial:", idmaterial);
    console.log("cantidad:", cantidad);

    const relacion = new MaterialCita({
      idcita,
      idmaterial,
      cantidadutilizada: cantidad,
    });
    console.log("MaterialCita creado:", relacion);
    relacion.validar();
    const cita = await citaRepository.buscarPorId(idcita);
    const material = await materialRepository.buscarPorId(idmaterial);
    if (!cita) throw new Error("Cita no encontrada");
    if (!material) throw new Error("Material no encontrado");
    const existeRelacion = await materialesPorCitaRepository.existeRelacion(
      idcita,
      idmaterial,
    );
    if (existeRelacion)
      throw new Error("Este material ya está asignado a esta cita");
    return await materialesPorCitaRepository.asignarMaterialACita(
      idcita,
      idmaterial,
      cantidad,
    );
  },

  async desasignarMaterialDeCita(idCita, idMaterial) {
    const cita = await citaRepository.buscarPorId(idCita);
    const material = await materialRepository.buscarPorId(idMaterial);
    if (!cita) throw new Error("Cita no encontrada");
    if (!material) throw new Error("Material no encontrado");
    const existeRelacion = await materialesPorCitaRepository.existeRelacion(
      idCita,
      idMaterial,
    );
    if (!existeRelacion)
      throw new Error("El material no se encuentra asignado a esta cita");
    return await materialesPorCitaRepository.desasignarMaterialDeCita(
      idMaterial,
      idCita,
    );
  },

  async actualizarCantidadMaterial(idCita, idMaterial, cantidad) {
    const cita = await citaRepository.buscarPorId(idCita);
    const material = await materialRepository.buscarPorId(idMaterial);
    if (!cita) throw new Error("Cita no encontrada");
    if (!material) throw new Error("Material no encontrado");
    const existeRelacion = await materialesPorCitaRepository.existeRelacion(
      idCita,
      idMaterial,
    );
    if (!existeRelacion)
      throw new Error("El material no se encuentra asignado a esta cita");
    return await materialesPorCitaRepository.actualizarCantidadMaterial(
      idMaterial,
      idCita,
      cantidad,
    );
  },

  async crearCita(datos) {
    const cita = new Cita(datos);
    cita.validar();
    const cliente = await clienteRepository.buscarPorId(datos.idcliente);
    if (!cliente) throw new Error("El cliente no existe");
    const tratamiento = await tratamientoRepository.buscarPorId(
      datos.idtratamiento,
    );
    if (!tratamiento) throw new Error("El tratamiento no existe");
    if (datos.idempleado) {
      const empleado = await empleadoRepository.buscarPorId(datos.idempleado);
      if (!empleado) throw new Error("El empleado no existe");
    }
    if (datos.idpaquetevendido) {
      const paquete = await paqueteVendidoRepository.buscarPorId(
        datos.idpaquetevendido,
      );
      if (!paquete) throw new Error("El paquete vendido no existe");
    }
    return await citaRepository.crear(datos);
  },

  async actualizarCita(id, datos) {
    const existente = await citaRepository.buscarPorId(id);
    if (!existente) throw new Error("Cita no encontrada");
    if (existente.estado === "realizada")
      throw new Error("No se puede modificar una cita ya realizada");
    if (existente.estado === "cancelada")
      throw new Error("No se puede modificar una cita cancelada");
    if (datos.idcliente && datos.idcliente !== existente.idcliente) {
      const cliente = await clienteRepository.buscarPorId(datos.idcliente);
      if (!cliente) throw new Error("El cliente no existe");
    }
    if (
      datos.idtratamiento &&
      datos.idtratamiento !== existente.idtratamiento
    ) {
      const tratamiento = await tratamientoRepository.buscarPorId(
        datos.idtratamiento,
      );
      if (!tratamiento) throw new Error("El tratamiento no existe");
    }
    if (datos.idempleado && datos.idempleado !== existente.idempleado) {
      const empleado = await empleadoRepository.buscarPorId(datos.idempleado);
      if (!empleado) throw new Error("El empleado no existe");
    }
    if (
      datos.idpaquetevendido &&
      datos.idpaquetevendido !== existente.idpaquetevendido
    ) {
      const paquete = await paqueteVendidoRepository.buscarPorId(
        datos.idpaquetevendido,
      );
      if (!paquete) throw new Error("El paquete vendido no existe");
    }
    Cita.validarActualizacion(datos);
    return await citaRepository.actualizar(id, datos);
  },

  async eliminarCita(id) {
    const cita = await citaRepository.buscarPorId(id);
    if (!cita) throw new Error("Cita no encontrada");
    await citaRepository.eliminar(id);
  },
  // Agrega esta función al citaService
  async obtenerCitasPorPaqueteVendido(idPaqueteVendido) {
    if (!idPaqueteVendido) {
      throw new Error("El ID del paquete vendido es obligatorio");
    }
    const id = parseInt(idPaqueteVendido);
    if (isNaN(id)) {
      throw new Error("El ID del paquete vendido debe ser un número válido");
    }
    return await citaRepository.buscarPorPaqueteVendido(id);
  },
};

module.exports = citaService;
