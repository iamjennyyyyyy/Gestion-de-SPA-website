const areaRepository = require("../repositories/areaRepository");
const empleadoRepository = require("../repositories/empleadoRepository");
const Area = require("../models/Area");

const areaService = {
  async listarAreas() {
    return await areaRepository.listarTodos();
  },

  async obtenerAreaPorId(id) {
    const area = await areaRepository.buscarPorId(id);
    if (!area) throw new Error("Área no encontrada");
    return area;
  },

  async obtenerEmpleadosPorArea(id) {
    const area = await areaRepository.buscarPorId(id);
    if (!area) throw new Error("Área no encontrada");
    return await areaRepository.buscarEmpleadosPorArea(id);
  },

  async obtenerAreasPorEmpleado(idEmpleado) {
    const empleado = await empleadoRepository.buscarPorId(idEmpleado);
    if (!empleado) throw new Error("Empleado no encontrado");
    return await areaRepository.buscarAreasDeUnEmpleado(idEmpleado);
  },

  async asignarEmpleadoAUnArea(idArea, idEmpleado) {
    const empleado = await empleadoRepository.buscarPorId(idEmpleado);
    const area = await areaRepository.buscarPorId(idArea);
    if (!empleado) throw new Error("Empleado no encontrado");
    if (!area) throw new Error("Área no encontrada");
    const existeRelacion = await areaRepository.existeRelacion(
      idEmpleado,
      idArea,
    );
    if (existeRelacion)
      throw new Error("Este empleado ya se encuentra asignado a esta área");
    return await areaRepository.asignarEmpleadoAUnArea(idEmpleado, idArea);
  },

  async desasignarEmpleadoDeUnArea(idArea, idEmpleado) {
    // Validaciones de entrada
    if (!idArea || !idEmpleado) {
      throw new Error("El ID del área y del empleado son requeridos");
    }

    // Convertir a números si es necesario
    const areaId = typeof idArea === "string" ? parseInt(idArea) : idArea;
    const empleadoId =
      typeof idEmpleado === "string" ? parseInt(idEmpleado) : idEmpleado;

    if (isNaN(areaId) || isNaN(empleadoId)) {
      throw new Error("Los IDs deben ser números válidos");
    }

    // Verificar si existe el empleado (opcional pero recomendado)
    const empleado = await empleadoRepository.buscarPorId(empleadoId);
    if (!empleado) {
      throw new Error(`El empleado con ID ${empleadoId} no existe`);
    }

    // Verificar si existe el área (opcional pero recomendado)
    const area = await areaRepository.buscarPorId(areaId);
    if (!area) {
      throw new Error(`El área con ID ${areaId} no existe`);
    }

    // Verificar si existe la relación
    const existeRelacion = await areaRepository.existeRelacion(
      empleadoId,
      areaId,
    );
    if (!existeRelacion) {
      throw new Error(
        `El empleado ${empleado.nombre || empleadoId} no está asignado al área ${area.nombre || areaId}`,
      );
    }

    // Proceder a desasignar
    const result = await areaRepository.desasignarEmpleadoDeUnArea(
      areaId,
      empleadoId,
    );

    return {
      success: true,
      message: `Empleado ${empleado.nombre} desasignado exitosamente del área ${area.nombre}`,
      data: {
        empleado: {
          id: empleado.idempleado,
          nombre: empleado.nombre,
        },
        area: {
          id: area.idarea,
          nombre: area.nombre,
        },
        asignacionEliminada: result.data,
      },
    };
  },

  async crearArea(datos) {
    const area = new Area(datos);
    area.validar();
    if (await areaRepository.buscarPorNombre(area.nombre))
      throw new Error("Ya existe un área con ese nombre");
    return await areaRepository.crear(datos);
  },

  async actualizarArea(id, datos) {
    const existente = await areaRepository.buscarPorId(id);
    if (!existente) throw new Error("Área no encontrada");
    if (
      datos.nombre &&
      datos.nombre !== existente.nombre &&
      (await areaRepository.buscarPorNombre(datos.nombre))
    ) {
      throw new Error("Ya existe un área con ese nombre");
    }
    Area.validarActualizacion(datos);
    return await areaRepository.actualizar(id, datos);
  },

  async eliminarArea(id) {
    const area = await areaRepository.buscarPorId(id);
    if (!area) throw new Error("Área no encontrada");
    try {
      await areaRepository.eliminar(id);
    } catch (e) {
      if (e.code === "23503")
        throw new Error(
          "No se puede eliminar: el área tiene categorías o empleados asociados",
        );
      throw e;
    }
  },
  async obtenerTodosEmpleadosPorArea(id) {
    const area = await areaRepository.buscarPorId(id);
    if (!area) throw new Error("Área no encontrada");
    return await areaRepository.obtenerTodosEmpleadosPorArea(id);
  },
};

module.exports = areaService;
