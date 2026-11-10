const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const {
  verificarToken,
  esAdministrador,
} = require("../middlewares/authMiddleware");

router.post("/registro", authController.registrar);
router.post("/login", authController.login);
router.get("/perfil", verificarToken, authController.perfil);
router.get(
  "/usuarios",
  verificarToken,
  esAdministrador,
  authController.listarUsuarios,
);
router.put(
  "/usuarios/:idUsuario/rol",
  verificarToken,
  esAdministrador,
  authController.cambiarRol,
);
router.delete(
  "/usuarios/:idUsuario",
  verificarToken,
  esAdministrador,
  authController.eliminarUsuario,
);
router.post(
  "/registro",
  verificarToken,
  esAdministrador,
  authController.registrar,
);

module.exports = router;
