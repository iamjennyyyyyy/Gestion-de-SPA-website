const express = require('express');
const router = express.Router();
const clienteController = require('../controllers/clienteController');

router.get('/', clienteController.listarTodos);
router.get('/dni', clienteController.obtenerPorDNI);
router.get('/:idCliente', clienteController.obtenerPorId);

router.post('/', clienteController.crear);
router.put('/:idCliente', clienteController.actualizar);
router.delete('/:idCliente', clienteController.eliminar);

module.exports = router;