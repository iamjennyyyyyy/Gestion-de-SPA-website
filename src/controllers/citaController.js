const citaService = require("../services/citaService");

const citaController = {
  async listarTodos(req, res) {
    try {
      const citas = await citaService.listarCitas();
      res.json({ success: true, count: citas.length, data: citas });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  },

  async obtenerPorId(req, res) {
    try {
      const idCita = parseInt(req.params.idCita);
      const cita = await citaService.obtenerCitaPorId(idCita);
      res.json({ success: true, data: cita });
    } catch (error) {
      res.status(404).json({ success: false, error: error.message });
    }
  },

  async obtenerPorCliente(req, res) {
    try {
      const idCliente = parseInt(req.params.idCliente);
      const citas = await citaService.obtenerCitasPorCliente(idCliente);
      res.json({ success: true, count: citas.length, data: citas });
    } catch (error) {
      res.status(404).json({ success: false, error: error.message });
    }
  },

  async obtenerPorEmpleado(req, res) {
    try {
      const idEmpleado = parseInt(req.params.idEmpleado);
      const citas = await citaService.obtenerCitasPorEmpleado(idEmpleado);
      res.json({ success: true, count: citas.length, data: citas });
    } catch (error) {
      res.status(404).json({ success: false, error: error.message });
    }
  },

  async obtenerPorFecha(req, res) {
    try {
      const { fecha } = req.query;
      const citas = await citaService.obtenerCitasPorFecha(fecha);
      res.json({ success: true, count: citas.length, data: citas });
    } catch (error) {
      res.status(400).json({ success: false, error: error.message });
    }
  },

  async obtenerPorTratamiento(req, res) {
    try {
      const idTratamiento = parseInt(req.params.idTratamiento);
      const citas = await citaService.obtenerCitasPorTratamiento(idTratamiento);
      res.json({ success: true, count: citas.length, data: citas });
    } catch (error) {
      res.status(400).json({ success: false, error: error.message });
    }
  },

  async obtenerPorPaquete(req, res) {
    try {
      const idPaquete = parseInt(req.params.idPaquete);
      const citas = await citaService.obtenerCitasPorPaquete(idPaquete);
      res.json({ success: true, count: citas.length, data: citas });
    } catch (error) {
      res.status(400).json({ success: false, error: error.message });
    }
  },

  async obtenerPorEstado(req, res) {
    try {
      const { estado } = req.query;
      const citas = await citaService.obtenerCitasPorEstado(estado);
      res.json({ success: true, count: citas.length, data: citas });
    } catch (error) {
      res.status(400).json({ success: false, error: error.message });
    }
  },

  async obtenerPorIntervaloFechas(req, res) {
    try {
      const { fecha1, fecha2 } = req.query;
      const citas = await citaService.obtenerCitasPorIntervaloFechas(
        fecha1,
        fecha2,
      );
      res.json({ success: true, count: citas.length, data: citas });
    } catch (error) {
      res.status(404).json({ success: false, error: error.message });
    }
  },

  async obtenerPorIntervaloPrecio(req, res) {
    try {
      const { precioMin, precioMax } = req.query;
      const citas = await citaService.obtenerCitasPorIntervaloPrecio(
        precioMin,
        precioMax,
      );
      res.json({ success: true, count: citas.length, data: citas });
    } catch (error) {
      res.status(404).json({ success: false, error: error.message });
    }
  },

  async obtenerMaterialesPorCita(req, res) {
    try {
      const idCita = parseInt(req.params.idCita);
      const materiales = await citaService.obtenerMaterialesPorCita(idCita);
      res.json({ success: true, count: materiales.length, data: materiales });
    } catch (error) {
      res.status(404).json({ success: false, error: error.message });
    }
  },

  async obtenerCitasPorMaterial(req, res) {
    try {
      const idMaterial = parseInt(req.params.idMaterial);
      const materiales = await citaService.obtenerCitasPorMaterial(idMaterial);
      res.json({ success: true, count: materiales.length, data: materiales });
    } catch (error) {
      res.status(404).json({ success: false, error: error.message });
    }
  },

  async asignarMaterialACita(req, res) {
    try {
      console.log("=== CONTROLLER DEBUG ===");
      console.log("req.params:", req.params);
      console.log("req.body:", req.body);

      const idCita = parseInt(req.params.idCita);
      const idMaterial = parseInt(req.params.idMaterial);
      const { cantidadutilizada } = req.body;

      console.log("idCita:", idCita);
      console.log("idMaterial:", idMaterial);
      console.log("cantidadutilizada:", cantidadutilizada);

      await citaService.asignarMaterialACita(
        idCita,
        idMaterial,
        cantidadutilizada,
      );
      res.json({ success: true, mensaje: "Material asignado correctamente" });
    } catch (error) {
      console.error("Error en controller:", error.message);
      res.status(400).json({ success: false, error: error.message });
    }
  },

  async desasignarMaterialACita(req, res) {
    try {
      const idCita = parseInt(req.params.idCita);
      const idMaterial = parseInt(req.params.idMaterial);
      await citaService.desasignarMaterialDeCita(idCita, idMaterial);
      res.json({
        success: true,
        mensaje: "Material desasignado correctamente",
      });
    } catch (error) {
      res.status(404).json({ success: false, error: error.message });
    }
  },

  async crear(req, res) {
    try {
      const cita = await citaService.crearCita(req.body);
      res.status(201).json({ success: true, data: cita });
    } catch (error) {
      res.status(400).json({ success: false, error: error.message });
    }
  },

  async modificar(req, res) {
    try {
      const idCita = parseInt(req.params.idCita);
      const cita = await citaService.actualizarCita(idCita, req.body);
      res.json({ success: true, data: cita });
    } catch (error) {
      res.status(400).json({ success: false, error: error.message });
    }
  },

  async eliminar(req, res) {
    try {
      await citaService.eliminarCita(parseInt(req.params.idCita));
      res.json({ success: true, message: "Cita eliminada" });
    } catch (error) {
      res.status(404).json({ success: false, error: error.message });
    }
  },
  // Obtener citas por paquete vendido
  // Agrega esta función al citaController
  async obtenerCitasPorPaqueteVendido(req, res) {
    try {
      const idPaqueteVendido = parseInt(req.params.idPaqueteVendido);
      const citas =
        await citaService.obtenerCitasPorPaqueteVendido(idPaqueteVendido);
      res.json({ success: true, count: citas.length, data: citas });
    } catch (error) {
      res.status(400).json({ success: false, error: error.message });
    }
  },
};

module.exports = citaController;
