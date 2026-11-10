const materialService = require("../services/materialService");

const materialController = {
  async listarTodos(req, res) {
    try {
      const materiales = await materialService.listarMateriales();
      res.json({ success: true, count: materiales.length, data: materiales });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  },

  async obtenerPorId(req, res) {
    try {
      const idMaterial = parseInt(req.params.idMaterial);
      const material = await materialService.obtenerMaterialPorId(idMaterial);
      res.json({ success: true, data: material });
    } catch (error) {
      res.status(404).json({ success: false, error: error.message });
    }
  },

  async crear(req, res) {
    try {
      const material = await materialService.crearMaterial(req.body);
      res.status(201).json({ success: true, data: material });
    } catch (error) {
      res.status(400).json({ success: false, error: error.message });
    }
  },

  async actualizar(req, res) {
    try {
      const idMaterial = parseInt(req.params.idMaterial);
      const material = await materialService.actualizarMaterial(
        idMaterial,
        req.body,
      );
      res.json({ success: true, data: material });
    } catch (error) {
      res.status(400).json({ success: false, error: error.message });
    }
  },

  async eliminar(req, res) {
    try {
      await materialService.eliminarMaterial(parseInt(req.params.idMaterial));
      res.json({ success: true, message: "Material eliminado" });
    } catch (error) {
      res.status(404).json({ success: false, error: error.message });
    }
  },
};

module.exports = materialController;
