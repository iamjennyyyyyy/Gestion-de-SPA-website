const express = require("express");
const router = express.Router();
const areaController = require("../controllers/areaController");

router.get("/", areaController.listarTodos);
router.get("/:idArea", areaController.obtenerPorId);
router.get("/:idArea/empleados", areaController.obtenerEmpleadosPorArea);
router.get(
  "/empleado/:idEmpleado/areas",
  areaController.obtenerAreasPorEmpleado,
);
router.post(
  "/:idArea/empleados/:idEmpleado",
  areaController.asignarEmpleadoAUnArea,
);

router.post("/", areaController.crear);
router.put("/:idArea", areaController.actualizar);
router.delete("/:idArea", areaController.eliminar);
router.get(
  "/:idArea/empleados-todos",
  areaController.obtenerTodosEmpleadosPorArea,
);
router.put(
  "/:idArea/categorias/:idCategoria/mover",
  areaController.moverCategoriaAOtraArea,
);
router.delete(
  "/:idArea/empleados/:idEmpleado",
  areaController.desasignarEmpleadoDeUnArea,
);

module.exports = router;
