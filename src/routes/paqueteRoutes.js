const express = require("express");
const router = express.Router();
const paqueteController = require("../controllers/paqueteController");

router.get("/", paqueteController.listarTodos);
router.get("/:idPaquete", paqueteController.obtenerPorId);
router.get(
  "/:idPaquete/tratamientos",
  paqueteController.obtenerTratamientosPorPaquete,
);
router.get(
  "/tratamiento/:idTratamiento/paquetes",
  paqueteController.obtenerPaquetesPorTratamiento,
);
router.post(
  "/:idPaquete/tratamientos/:idTratamiento",
  paqueteController.asignarTratamiento,
);
router.delete(
  "/:idPaquete/tratamientos/:idTratamiento",
  paqueteController.desasignarTratamiento,
);
router.post("/", paqueteController.crear);
router.put("/:idPaquete", paqueteController.actualizar);
router.delete("/:idPaquete", paqueteController.eliminar);

module.exports = router;
