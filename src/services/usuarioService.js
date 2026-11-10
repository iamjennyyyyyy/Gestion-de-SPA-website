const usuarioRepository = require("../repositories/usuarioRepository");
const Usuario = require("../models/Usuario");
const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET || "tu_secreto_super_seguro";

const usuarioService = {
  async listarUsuarios() {
    return await usuarioRepository.listarTodos();
  },

  async obtenerUsuarioPorId(id) {
    const usuario = await usuarioRepository.buscarPorId(id);
    if (!usuario) throw new Error("Usuario no encontrado");
    return usuario;
  },

  async registrar(username, contrasena, rol = "dependiente") {
    const existente = await usuarioRepository.buscarPorUsername(username);
    if (existente) throw new Error("El nombre de usuario ya existe");

    const usuario = new Usuario({ username, rol });
    await usuario.encriptarContrasena(contrasena);
    usuario.validar();

    return await usuarioRepository.crear({
      username: usuario.username,
      rol: usuario.rol,
      contrasena: usuario.contrasena,
      salt: usuario.salt,
    });
  },

  async login(username, contrasena) {
    const usuarioDB = await usuarioRepository.buscarPorUsername(username);
    if (!usuarioDB) throw new Error("Usuario o contraseña incorrectos");

    const usuario = new Usuario(usuarioDB);
    const valido = await usuario.validarContrasena(contrasena);
    if (!valido) throw new Error("Usuario o contraseña incorrectos");

    const token = jwt.sign(
      {
        id: usuarioDB.idusuario,
        username: usuarioDB.username,
        rol: usuarioDB.rol,
      },
      JWT_SECRET,
      { expiresIn: "8h" },
    );

    return {
      token,
      usuario: {
        id: usuarioDB.idusuario,
        username: usuarioDB.username,
        rol: usuarioDB.rol,
      },
    };
  },

  async cambiarRol(id, nuevoRol) {
    const usuario = await usuarioRepository.buscarPorId(id);
    if (!usuario) throw new Error("Usuario no encontrado");
    if (!["dependiente", "administrador"].includes(nuevoRol)) {
      throw new Error("Rol no válido");
    }
    return await usuarioRepository.actualizar(id, { rol: nuevoRol });
  },

  async eliminarUsuario(id) {
    const usuario = await usuarioRepository.buscarPorId(id);
    if (!usuario) throw new Error("Usuario no encontrado");
    await usuarioRepository.eliminar(id);
  },
};

module.exports = usuarioService;
