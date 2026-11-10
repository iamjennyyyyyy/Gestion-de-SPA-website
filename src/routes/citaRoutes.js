const express = require("express");
const router = express.Router();
const citaController = require("../controllers/citaController");

router.get("/", citaController.listarTodos);
router.get("/cliente/:idCliente", citaController.obtenerPorCliente);
router.get("/empleado/:idEmpleado", citaController.obtenerPorEmpleado);
router.get("/tratamiento/:idTratamiento", citaController.obtenerPorTratamiento);
router.get("/paquete/:idPaquete", citaController.obtenerPorPaquete);
router.get(
  "/paquete-vendido/:idPaqueteVendido",
  citaController.obtenerCitasPorPaqueteVendido,
); // ← CAMBIADO
router.get("/fecha", citaController.obtenerPorFecha);
router.get("/estado", citaController.obtenerPorEstado);
router.get("/intervalo/fechas", citaController.obtenerPorIntervaloFechas);
router.get("/intervalo/precio", citaController.obtenerPorIntervaloPrecio);
router.get("/material/:idMaterial", citaController.obtenerCitasPorMaterial);
router.get("/:idCita", citaController.obtenerPorId);
router.get("/:idCita/materiales", citaController.obtenerMaterialesPorCita);
router.post("/", citaController.crear);
router.post(
  "/:idCita/materiales/:idMaterial",
  citaController.asignarMaterialACita,
);
router.delete(
  "/:idCita/materiales/:idMaterial",
  citaController.desasignarMaterialACita,
);
router.put("/:idCita", citaController.modificar);
router.delete("/:idCita", citaController.eliminar);

module.exports = router;
