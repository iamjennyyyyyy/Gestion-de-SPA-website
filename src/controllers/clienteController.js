const clienteService = require("../services/clienteService");

const clienteController = {
  async listarTodos(req, res) {
    try {
      if (req.query.q) {
        const clientes = await clienteService.buscarClientes(req.query.q);
        return res.json({
          success: true,
          count: clientes.length,
          data: clientes,
        });
      }
      const clientes = await clienteService.listarClientes();
      res.json({ success: true, count: clientes.length, data: clientes });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  },

  async obtenerPorId(req, res) {
    try {
      const idCliente = parseInt(req.params.idCliente);
      const cliente = await clienteService.obtenerClientePorId(idCliente);
      res.json({ success: true, data: cliente });
    } catch (error) {
      res.status(404).json({ success: false, error: error.message });
    }
  },

  async obtenerPorDNI(req, res) {
    try {
      const { dni } = req.query;
      const cliente = await clienteService.obtenerClientePorDNI(dni);
      res.json({ success: true, data: cliente });
    } catch (error) {
      res.status(404).json({ success: false, error: error.message });
    }
  },

  async crear(req, res) {
    try {
      const cliente = await clienteService.crearCliente(req.body);
      res.status(201).json({ success: true, data: cliente });
    } catch (error) {
      res.status(400).json({ success: false, error: error.message });
    }
  },

  async actualizar(req, res) {
    try {
      const idCliente = parseInt(req.params.idCliente);
      const cliente = await clienteService.actualizarCliente(
        idCliente,
        req.body,
      );
      res.json({ success: true, data: cliente });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  },

  async eliminar(req, res) {
    try {
      await clienteService.eliminarCliente(parseInt(req.params.idCliente));
      res.json({ success: true, message: "Cliente eliminado" });
    } catch (error) {
      res.status(404).json({ success: false, error: error.message });
    }
  },
};

module.exports = clienteController;
