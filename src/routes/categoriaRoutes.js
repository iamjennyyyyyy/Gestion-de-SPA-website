const express = require("express");
const router = express.Router();
const categoriaController = require("../controllers/categoriaController");

router.get("/", categoriaController.listarTodos);
router.get("/:idCategoria", categoriaController.obtenerPorId);
router.get("/area/:idArea", categoriaController.obtenerCategoriasPorArea);
router.post("/", categoriaController.crear);
router.put("/:idCategoria", categoriaController.actualizar);
router.delete("/:idCategoria", categoriaController.eliminar);
router.put(
  "/:idCategoria/tratamientos/mover",
  categoriaController.moverTratamientosAOtraCategoria,
);

module.exports = router;
