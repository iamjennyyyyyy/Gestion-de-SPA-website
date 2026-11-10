const express = require("express");
const router = express.Router();
const tratamientoController = require("../controllers/tratamientoController");

router.get("/", tratamientoController.listarTodos);
router.get("/:idTratamiento", tratamientoController.obtenerPorId);
router.get(
  "/:idTratamiento/materiales",
  tratamientoController.obtenerMaterialesPorTratamiento,
);
router.get(
  "/material/:idMaterial",
  tratamientoController.obtenerTratamientosPorMaterial,
);
router.post(
  "/:idTratamiento/materiales/:idMaterial",
  tratamientoController.asignarMaterial,
);
router.delete(
  "/:idTratamiento/materiales/:idMaterial",
  tratamientoController.desasignarMaterial,
);
router.patch(
  "/:idTratamiento/materiales/:idMaterial",
  tratamientoController.actualizarCantidadMaterial,
);
router.get(
  "/:idTratamiento/empleados-fijos",
  tratamientoController.obtenerEmpleadosFijosPorTratamiento,
);
router.get(
  "/empleado-fijo/:idEmpleado/tratamientos",
  tratamientoController.obtenerTratamientosPorEmpleadoFijo,
);
router.post(
  "/:idTratamiento/empleados-fijos/:idEmpleado",
  tratamientoController.asignarEmpleadoFijo,
);
router.delete(
  "/:idTratamiento/empleados-fijos/:idEmpleado",
  tratamientoController.desasignarEmpleadoFijo,
);
router.post("/", tratamientoController.crear);
router.put("/:idTratamiento", tratamientoController.actualizar);
router.delete("/:idTratamiento", tratamientoController.eliminar);
router.get(
  "/:idTratamiento/empleados-disponibles",
  tratamientoController.obtenerEmpleadosDisponibles,
);

module.exports = router;
