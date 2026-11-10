const empleadoService = require("../services/empleadoService");

const empleadoController = {
  async listarTodos(req, res) {
    try {
      const empleados = await empleadoService.listarEmpleados();
      res.json({ success: true, count: empleados.length, data: empleados });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  },

  async obtenerPorId(req, res) {
    try {
      const idEmpleado = parseInt(req.params.idEmpleado);
      const empleado = await empleadoService.obtenerEmpleadoPorId(idEmpleado);
      res.json({ success: true, data: empleado });
    } catch (error) {
      res.status(404).json({ success: false, error: error.message });
    }
  },

  async obtenerPorDNI(req, res) {
    try {
      const { dni } = req.query;
      const empleado = await empleadoService.obtenerEmpleadoPorDNI(dni);
      res.json({ success: true, data: empleado });
    } catch (error) {
      res.status(404).json({ success: false, error: error.message });
    }
  },

  async crear(req, res) {
    try {
      const empleado = await empleadoService.crearEmpleado(req.body);
      res.status(201).json({ success: true, data: empleado });
    } catch (error) {
      res.status(400).json({ success: false, error: error.message });
    }
  },

  async actualizar(req, res) {
    try {
      const idEmpleado = parseInt(req.params.idEmpleado);
      const empleado = await empleadoService.actualizarEmpleado(
        idEmpleado,
        req.body,
      );
      res.json({ success: true, data: empleado });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  },

  async eliminar(req, res) {
    try {
      await empleadoService.eliminarEmpleado(parseInt(req.params.idEmpleado));
      res.json({ success: true, message: "Empleado eliminado" });
    } catch (error) {
      res.status(404).json({ success: false, error: error.message });
    }
  },
  async cambiarEsFijo(req, res) {
    try {
      const idEmpleado = parseInt(req.params.idEmpleado);
      const empleado = await empleadoService.cambiarEsFijo(idEmpleado);
      res.json({
        success: true,
        data: empleado,
        mensaje: "Estado esFijo cambiado",
      });
    } catch (error) {
      res.status(400).json({ success: false, error: error.message });
    }
  },
};

module.exports = empleadoController;
