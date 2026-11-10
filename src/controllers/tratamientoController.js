const tratamientoService = require("../services/tratamientoService");

const tratamientoController = {
  async listarTodos(req, res) {
    try {
      const tratamientos = await tratamientoService.listarTratamientos();
      res.json({
        success: true,
        count: tratamientos.length,
        data: tratamientos,
      });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  },

  async obtenerPorId(req, res) {
    try {
      const idTratamiento = parseInt(req.params.idTratamiento);
      const tratamiento =
        await tratamientoService.obtenerTratamientoPorId(idTratamiento);
      res.json({ success: true, data: tratamiento });
    } catch (error) {
      res.status(404).json({ success: false, error: error.message });
    }
  },

  async obtenerMaterialesPorTratamiento(req, res) {
    try {
      const idTratamiento = parseInt(req.params.idTratamiento);
      const materiales =
        await tratamientoService.obtenerMaterialesPorTratamiento(idTratamiento);
      res.json({ success: true, count: materiales.length, data: materiales });
    } catch (error) {
      res.status(404).json({ success: false, error: error.message });
    }
  },

  async obtenerTratamientosPorMaterial(req, res) {
    try {
      const idMaterial = parseInt(req.params.idMaterial);
      const tratamientos =
        await tratamientoService.obtenerTratamientosPorMaterial(idMaterial);
      res.json({
        success: true,
        count: tratamientos.length,
        data: tratamientos,
      });
    } catch (error) {
      res.status(404).json({ success: false, error: error.message });
    }
  },

  async asignarMaterial(req, res) {
    try {
      const idTratamiento = parseInt(req.params.idTratamiento);
      const idMaterial = parseInt(req.params.idMaterial);
      const { cantidad } = req.body;
      await tratamientoService.asignarMaterialATratamiento(
        idTratamiento,
        idMaterial,
        cantidad,
      );
      res.json({
        success: true,
        mensaje: "Material asignado al tratamiento correctamente",
      });
    } catch (error) {
      res.status(400).json({ success: false, error: error.message });
    }
  },

  async desasignarMaterial(req, res) {
    try {
      const idTratamiento = parseInt(req.params.idTratamiento);
      const idMaterial = parseInt(req.params.idMaterial);
      await tratamientoService.desasignarMaterialDeTratamiento(
        idTratamiento,
        idMaterial,
      );
      res.json({
        success: true,
        mensaje: "Material desasignado del tratamiento correctamente",
      });
    } catch (error) {
      res.status(400).json({ success: false, error: error.message });
    }
  },

  async actualizarCantidadMaterial(req, res) {
    try {
      const idTratamiento = parseInt(req.params.idTratamiento);
      const idMaterial = parseInt(req.params.idMaterial);
      const { cantidad } = req.body;
      await tratamientoService.actualizarCantidadMaterial(
        idTratamiento,
        idMaterial,
        cantidad,
      );
      res.json({
        success: true,
        mensaje: "Cantidad de material actualizada correctamente",
      });
    } catch (error) {
      res.status(400).json({ success: false, error: error.message });
    }
  },

  async obtenerEmpleadosFijosPorTratamiento(req, res) {
    try {
      const idTratamiento = parseInt(req.params.idTratamiento);
      const empleados =
        await tratamientoService.obtenerEmpleadosFijosPorTratamiento(
          idTratamiento,
        );
      res.json({ success: true, count: empleados.length, data: empleados });
    } catch (error) {
      res.status(404).json({ success: false, error: error.message });
    }
  },

  async obtenerTratamientosPorEmpleadoFijo(req, res) {
    try {
      const idEmpleado = parseInt(req.params.idEmpleado);
      const tratamientos =
        await tratamientoService.obtenerTratamientosPorEmpleadoFijo(idEmpleado);
      res.json({
        success: true,
        count: tratamientos.length,
        data: tratamientos,
      });
    } catch (error) {
      res.status(404).json({ success: false, error: error.message });
    }
  },

  async asignarEmpleadoFijo(req, res) {
    try {
      const idTratamiento = parseInt(req.params.idTratamiento);
      const idEmpleado = parseInt(req.params.idEmpleado);
      await tratamientoService.asignarEmpleadoFijoATratamiento(
        idEmpleado,
        idTratamiento,
      );
      res.json({
        success: true,
        mensaje: "Empleado fijo asignado al tratamiento correctamente",
      });
    } catch (error) {
      res.status(400).json({ success: false, error: error.message });
    }
  },

  async desasignarEmpleadoFijo(req, res) {
    try {
      const idTratamiento = parseInt(req.params.idTratamiento);
      const idEmpleado = parseInt(req.params.idEmpleado);
      await tratamientoService.desasignarEmpleadoFijoDeTratamiento(
        idEmpleado,
        idTratamiento,
      );
      res.json({
        success: true,
        mensaje: "Empleado fijo desasignado del tratamiento correctamente",
      });
    } catch (error) {
      res.status(400).json({ success: false, error: error.message });
    }
  },

  async crear(req, res) {
    try {
      const tratamiento = await tratamientoService.crearTratamiento(req.body);
      res.status(201).json({ success: true, data: tratamiento });
    } catch (error) {
      res.status(400).json({ success: false, error: error.message });
    }
  },

  async actualizar(req, res) {
    try {
      const idTratamiento = parseInt(req.params.idTratamiento);
      const tratamiento = await tratamientoService.actualizarTratamiento(
        idTratamiento,
        req.body,
      );
      res.json({ success: true, data: tratamiento });
    } catch (error) {
      res.status(400).json({ success: false, error: error.message });
    }
  },

  async eliminar(req, res) {
    try {
      await tratamientoService.eliminarTratamiento(
        parseInt(req.params.idTratamiento),
      );
      res.json({ success: true, message: "Tratamiento eliminado" });
    } catch (error) {
      res.status(404).json({ success: false, error: error.message });
    }
  },
  async obtenerEmpleadosDisponibles(req, res) {
    try {
      const { idTratamiento } = req.params;
      const empleados =
        await tratamientoService.obtenerEmpleadosDisponibles(idTratamiento);
      res.json({ success: true, data: empleados });
    } catch (e) {
      res.status(400).json({ success: false, error: e.message });
    }
  },

  async moverCitas(req, res) {
    try {
      const idOrigen = parseInt(req.params.idTratamiento);
      const idDestino = parseInt(req.body.idtratamiento_destino);
      const r = await tratamientoService.moverCitasATratamiento(
        idOrigen,
        idDestino,
      );
      res.json({ success: true, count: r.length, data: r });
    } catch (e) {
      res.status(400).json({ success: false, error: e.message });
    }
  },
};

module.exports = tratamientoController;
