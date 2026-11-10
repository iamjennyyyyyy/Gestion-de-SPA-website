const express = require("express");
const router = express.Router();
const paqueteVendidoController = require("../controllers/paqueteVendidoController");

router.get("/", paqueteVendidoController.listarTodos);
router.get("/:idPaquete", paqueteVendidoController.obtenerPorId);
router.get(
  "/filtros/precio",
  paqueteVendidoController.buscarPorIntervaloPrecio,
);
router.get(
  "/filtros/duracion",
  paqueteVendidoController.buscarPorDuracionTotal,
);
router.get(
  "/filtros/fecha-inicio",
  paqueteVendidoController.buscarPorFechaInicio,
);
router.get(
  "/filtros/fecha-compra",
  paqueteVendidoController.buscarPorFechaCompra,
);
router.get("/filtros/fecha-fin", paqueteVendidoController.buscarPorFechaFin);
router.get(
  "/filtros/intervalo-inicio",
  paqueteVendidoController.buscarPorIntervaloFechasInicio,
);
router.get(
  "/filtros/intervalo-fin",
  paqueteVendidoController.buscarPorIntervaloFechasFin,
);
router.get(
  "/filtros/intervalo-compra",
  paqueteVendidoController.buscarPorIntervaloFechasCompra,
);
router.post("/", paqueteVendidoController.crear);
router.put("/:idPaquete", paqueteVendidoController.actualizar);
router.delete("/:idPaquete", paqueteVendidoController.eliminar);

module.exports = router;
