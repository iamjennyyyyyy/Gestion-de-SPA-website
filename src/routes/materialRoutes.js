const express = require("express");
const router = express.Router();
const materialController = require("../controllers/materialController");

router.get("/", materialController.listarTodos);
router.get("/:idMaterial", materialController.obtenerPorId);
router.post("/", materialController.crear);
router.put("/:idMaterial", materialController.actualizar);
router.delete("/:idMaterial", materialController.eliminar);

module.exports = router;
