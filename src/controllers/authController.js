// controllers/authController.js
const usuarioService = require("../services/usuarioService");

const authController = {
  async registrar(req, res) {
    try {
      const { username, contrasena, rol } = req.body;
      const usuario = await usuarioService.registrar(
        username,
        contrasena,
        rol || "dependiente",
      );
      res.status(201).json({ success: true, data: usuario });
    } catch (error) {
      res.status(400).json({ success: false, error: error.message });
    }
  },

  async login(req, res) {
    try {
      const { username, contrasena } = req.body;
      const resultado = await usuarioService.login(username, contrasena);
      res.json({ success: true, ...resultado });
    } catch (error) {
      res.status(401).json({ success: false, error: error.message });
    }
  },

  async perfil(req, res) {
    try {
      const usuario = await usuarioService.obtenerUsuarioPorId(req.usuario.id);
      res.json({ success: true, data: usuario });
    } catch (error) {
      res.status(404).json({ success: false, error: error.message });
    }
  },

  async listarUsuarios(req, res) {
    try {
      const usuarios = await usuarioService.listarUsuarios();
      res.json({ success: true, count: usuarios.length, data: usuarios });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  },

  async cambiarRol(req, res) {
    try {
      const idUsuario = parseInt(req.params.idUsuario);
      const { rol } = req.body;
      const usuario = await usuarioService.cambiarRol(idUsuario, rol);
      res.json({ success: true, data: usuario });
    } catch (error) {
      res.status(400).json({ success: false, error: error.message });
    }
  },

  async eliminarUsuario(req, res) {
    try {
      await usuarioService.eliminarUsuario(parseInt(req.params.idUsuario));
      res.json({ success: true, message: "Usuario eliminado" });
    } catch (error) {
      res.status(404).json({ success: false, error: error.message });
    }
  },
};

module.exports = authController;
