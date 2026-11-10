const areaService = require("../services/areaService");

const areaController = {
  async listarTodos(req, res) {
    try {
      const areas = await areaService.listarAreas();
      res.json({ success: true, count: areas.length, data: areas });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  },

  async obtenerPorId(req, res) {
    try {
      const idArea = parseInt(req.params.idArea);
      const area = await areaService.obtenerAreaPorId(idArea);
      res.json({ success: true, data: area });
    } catch (error) {
      res.status(404).json({ success: false, error: error.message });
    }
  },

  async obtenerEmpleadosPorArea(req, res) {
    try {
      const idArea = parseInt(req.params.idArea);
      const empleados = await areaService.obtenerEmpleadosPorArea(idArea);
      res.json({ success: true, count: empleados.length, data: empleados });
    } catch (error) {
      res.status(404).json({ success: false, error: error.message });
    }
  },

  async obtenerAreasPorEmpleado(req, res) {
    try {
      const idEmpleado = parseInt(req.params.idEmpleado);
      const areas = await areaService.obtenerAreasPorEmpleado(idEmpleado);
      res.json({ success: true, count: areas.length, data: areas });
    } catch (error) {
      res.status(404).json({ success: false, error: error.message });
    }
  },

  async asignarEmpleadoAUnArea(req, res) {
    try {
      const idArea = parseInt(req.params.idArea);
      const idEmpleado = parseInt(req.params.idEmpleado);
      await areaService.asignarEmpleadoAUnArea(idArea, idEmpleado);
      res.json({ success: true, mensaje: "Empleado asignado al área" });
    } catch (error) {
      res.status(400).json({ success: false, error: error.message });
    }
  },

  async crear(req, res) {
    try {
      const area = await areaService.crearArea(req.body);
      res.status(201).json({ success: true, data: area });
    } catch (error) {
      res.status(400).json({ success: false, error: error.message });
    }
  },

  async actualizar(req, res) {
    try {
      const idArea = parseInt(req.params.idArea);
      const area = await areaService.actualizarArea(idArea, req.body);
      res.json({ success: true, data: area });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  },

  async eliminar(req, res) {
    try {
      await areaService.eliminarArea(parseInt(req.params.idArea));
      res.json({ success: true, message: "Área eliminada" });
    } catch (error) {
      res.status(404).json({ success: false, error: error.message });
    }
  },
  async obtenerTodosEmpleadosPorArea(req, res) {
    try {
      const idArea = parseInt(req.params.idArea);
      const empleados = await areaService.obtenerTodosEmpleadosPorArea(idArea);
      res.json({ success: true, count: empleados.length, data: empleados });
    } catch (error) {
      res.status(404).json({ success: false, error: error.message });
    }
  },

  async moverCategoriaAOtraArea(req, res) {
    try {
      const idCategoria = parseInt(req.params.idCategoria);
      const idAreaNueva = parseInt(req.body.idAreaNueva);
      const resultado = await areaService.moverCategoriaAOtraArea(
        idCategoria,
        idAreaNueva,
      );
      res.json({
        success: true,
        data: resultado,
        mensaje: "Categoría movida a otra área",
      });
    } catch (error) {
      res.status(400).json({ success: false, error: error.message });
    }
  },
  async desasignarEmpleadoDeUnArea(req, res) {
    try {
      const { idArea, idEmpleado } = req.params;

      // Validar que los parámetros existan
      if (!idArea || !idEmpleado) {
        return res.status(400).json({
          success: false,
          error: "Los parámetros idArea e idEmpleado son requeridos",
        });
      }

      const resultado = await areaService.desasignarEmpleadoDeUnArea(
        idArea,
        idEmpleado,
      );

      return res.status(200).json({
        success: true,
        message: resultado.message,
        data: resultado.data,
      });
    } catch (error) {
      console.error("Error en desasignarEmpleadoDeUnArea:", error);

      // Manejo específico de errores
      if (error.message.includes("requeridos")) {
        return res.status(400).json({
          success: false,
          error: error.message,
        });
      }

      if (error.message.includes("válidos")) {
        return res.status(400).json({
          success: false,
          error: error.message,
        });
      }

      if (error.message.includes("no existe")) {
        return res.status(404).json({
          success: false,
          error: error.message,
        });
      }

      if (error.message.includes("no está asignado")) {
        return res.status(404).json({
          success: false,
          error: error.message,
        });
      }

      return res.status(500).json({
        success: false,
        error: "Error interno del servidor al desasignar el empleado",
      });
    }
  },
};

module.exports = areaController;
