const paqueteVendidoService = require("../services/paqueteVendidoService");

const paqueteVendidoController = {
  async listarTodos(req, res) {
    try {
      const paquetes = await paqueteVendidoService.listarPaquetesV();
      res.json({ success: true, count: paquetes.length, data: paquetes });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  },

  async obtenerPorId(req, res) {
    try {
      const idPaquete = parseInt(req.params.idPaquete);
      const paquete =
        await paqueteVendidoService.obtenerPaqueteVPorId(idPaquete);
      res.json({ success: true, data: paquete });
    } catch (error) {
      res.status(404).json({ success: false, error: error.message });
    }
  },

  async buscarPorIntervaloPrecio(req, res) {
    try {
      const { precioMin, precioMax } = req.query;
      const paquetes =
        await paqueteVendidoService.obtenerPaquetesVPorIntervaloPrecio(
          parseFloat(precioMin),
          parseFloat(precioMax),
        );
      res.json({ success: true, count: paquetes.length, data: paquetes });
    } catch (error) {
      res.status(400).json({ success: false, error: error.message });
    }
  },

  async buscarPorDuracionTotal(req, res) {
    try {
      const { duracion } = req.query;
      const paquetes =
        await paqueteVendidoService.obtenerPaquetesVPorDuracionTotal(
          parseInt(duracion),
        );
      res.json({ success: true, count: paquetes.length, data: paquetes });
    } catch (error) {
      res.status(400).json({ success: false, error: error.message });
    }
  },

  async buscarPorFechaInicio(req, res) {
    try {
      const { fechaInicio } = req.query;
      const paquetes =
        await paqueteVendidoService.obtenerPaquetesVPorFechaInicio(fechaInicio);
      res.json({ success: true, count: paquetes.length, data: paquetes });
    } catch (error) {
      res.status(400).json({ success: false, error: error.message });
    }
  },

  async buscarPorFechaCompra(req, res) {
    try {
      const { fechaCompra } = req.query;
      const paquetes =
        await paqueteVendidoService.obtenerPaquetesVPorFechaCompra(fechaCompra);
      res.json({ success: true, count: paquetes.length, data: paquetes });
    } catch (error) {
      res.status(400).json({ success: false, error: error.message });
    }
  },

  async buscarPorFechaFin(req, res) {
    try {
      const { fechaFin } = req.query;
      const paquetes =
        await paqueteVendidoService.obtenerPaquetesVPorFechaFin(fechaFin);
      res.json({ success: true, count: paquetes.length, data: paquetes });
    } catch (error) {
      res.status(400).json({ success: false, error: error.message });
    }
  },

  async buscarPorIntervaloFechasInicio(req, res) {
    try {
      const { fecha1, fecha2 } = req.query;
      const paquetes =
        await paqueteVendidoService.obtenerPaquetesVPorIntervaloFechasInicio(
          fecha1,
          fecha2,
        );
      res.json({ success: true, count: paquetes.length, data: paquetes });
    } catch (error) {
      res.status(400).json({ success: false, error: error.message });
    }
  },

  async buscarPorIntervaloFechasFin(req, res) {
    try {
      const { fecha1, fecha2 } = req.query;
      const paquetes =
        await paqueteVendidoService.obtenerPaquetesVPorIntervaloFechasFin(
          fecha1,
          fecha2,
        );
      res.json({ success: true, count: paquetes.length, data: paquetes });
    } catch (error) {
      res.status(400).json({ success: false, error: error.message });
    }
  },

  async buscarPorIntervaloFechasCompra(req, res) {
    try {
      const { fecha1, fecha2 } = req.query;
      const paquetes =
        await paqueteVendidoService.obtenerPaquetesVPorIntervaloFechasCompra(
          fecha1,
          fecha2,
        );
      res.json({ success: true, count: paquetes.length, data: paquetes });
    } catch (error) {
      res.status(400).json({ success: false, error: error.message });
    }
  },

  async crear(req, res) {
    try {
      const paquete = await paqueteVendidoService.crearPaqueteV(req.body);
      res.status(201).json({ success: true, data: paquete });
    } catch (error) {
      res.status(400).json({ success: false, error: error.message });
    }
  },

  async actualizar(req, res) {
    try {
      const idPaquete = parseInt(req.params.idPaquete);
      const paquete = await paqueteVendidoService.actualizarPaqueteV(
        idPaquete,
        req.body,
      );
      res.json({ success: true, data: paquete });
    } catch (error) {
      res.status(400).json({ success: false, error: error.message });
    }
  },

  async eliminar(req, res) {
    try {
      await paqueteVendidoService.eliminarPaqueteV(
        parseInt(req.params.idPaquete),
      );
      res.json({ success: true, message: "Paquete vendido eliminado" });
    } catch (error) {
      res.status(404).json({ success: false, error: error.message });
    }
  },
};

module.exports = paqueteVendidoController;
