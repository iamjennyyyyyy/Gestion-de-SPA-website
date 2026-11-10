const paqueteService = require("../services/paqueteService");

const paqueteController = {
  async listarTodos(req, res) {
    try {
      const paquetes = await paqueteService.listarPaquetes();
      res.json({ success: true, count: paquetes.length, data: paquetes });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  },

  async obtenerPorId(req, res) {
    try {
      const idPaquete = parseInt(req.params.idPaquete);
      const paquete = await paqueteService.obtenerPaquetePorId(idPaquete);
      res.json({ success: true, data: paquete });
    } catch (error) {
      res.status(404).json({ success: false, error: error.message });
    }
  },

  async crear(req, res) {
    try {
      const paquete = await paqueteService.crearPaquete(req.body);
      res.status(201).json({ success: true, data: paquete });
    } catch (error) {
      res.status(400).json({ success: false, error: error.message });
    }
  },

  async actualizar(req, res) {
    try {
      const idPaquete = parseInt(req.params.idPaquete);
      const paquete = await paqueteService.actualizarPaquete(
        idPaquete,
        req.body,
      );
      res.json({ success: true, data: paquete });
    } catch (error) {
      res.status(400).json({ success: false, error: error.message });
    }
  },

  async eliminar(req, res) {
    try {
      await paqueteService.eliminarPaquete(parseInt(req.params.idPaquete));
      res.json({ success: true, message: "Paquete eliminado" });
    } catch (error) {
      res.status(404).json({ success: false, error: error.message });
    }
  },

  async obtenerTratamientosPorPaquete(req, res) {
    try {
      const idPaquete = parseInt(req.params.idPaquete);
      const tratamientos =
        await paqueteService.obtenerTratamientosPorPaquete(idPaquete);
      res.json({
        success: true,
        count: tratamientos.length,
        data: tratamientos,
      });
    } catch (error) {
      res.status(404).json({ success: false, error: error.message });
    }
  },

  async obtenerPaquetesPorTratamiento(req, res) {
    try {
      const idTratamiento = parseInt(req.params.idTratamiento);
      const paquetes =
        await paqueteService.obtenerPaquetesPorTratamiento(idTratamiento);
      res.json({ success: true, count: paquetes.length, data: paquetes });
    } catch (error) {
      res.status(404).json({ success: false, error: error.message });
    }
  },

  async asignarTratamiento(req, res) {
    try {
      const idPaquete = parseInt(req.params.idPaquete);
      const idTratamiento = parseInt(req.params.idTratamiento);
      await paqueteService.asignarTratamientoAPaquete(idPaquete, idTratamiento);
      res.json({
        success: true,
        mensaje: "Tratamiento asignado al paquete correctamente",
      });
    } catch (error) {
      res.status(400).json({ success: false, error: error.message });
    }
  },

  async desasignarTratamiento(req, res) {
    try {
      const idPaquete = parseInt(req.params.idPaquete);
      const idTratamiento = parseInt(req.params.idTratamiento);
      await paqueteService.desasignarTratamientoDePaquete(
        idPaquete,
        idTratamiento,
      );
      res.json({
        success: true,
        mensaje: "Tratamiento desasignado del paquete correctamente",
      });
    } catch (error) {
      res.status(400).json({ success: false, error: error.message });
    }
  },
};

module.exports = paqueteController;
