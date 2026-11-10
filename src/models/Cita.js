// models/Cita.js
const dayjs = require("dayjs");

class Cita {
  constructor(datos = {}) {
    this.idcita = datos.idcita || null;
    this.idtratamiento = datos.idtratamiento || null;
    this.idcliente = datos.idcliente || null;
    this.idempleado = datos.idempleado || null;
    this.idpaquetevendido = datos.idpaquetevendido || null;
    this.observaciones = datos.observaciones || "";
    this.fecha = datos.fecha || null;
    this.hora = datos.hora || null;
    this.estado = datos.estado || "pendiente";
    this.precio = datos.precio !== undefined ? datos.precio : null;
  }

  validar() {
    if (!this.idtratamiento) {
      throw new Error("El tratamiento es obligatorio");
    }
    if (!this.idcliente) {
      throw new Error("El cliente es obligatorio");
    }
    if (!this.idempleado) {
      throw new Error("El empleado es obligatorio");
    }
    if (!this.fecha) {
      throw new Error("La fecha es obligatoria");
    }
    if (!this.hora) {
      throw new Error("La hora es obligatoria");
    }
    if (this.precio === null || this.precio === undefined) {
      throw new Error("El precio es obligatorio");
    }

    const fechaCita = dayjs(`${this.fecha} ${this.hora}`);

    if (!fechaCita.isValid()) {
      throw new Error("La fecha y hora no son válidas");
    }

    if (fechaCita.isBefore(dayjs())) {
      throw new Error("No se puede agendar citas en fecha pasada");
    }

    if (dayjs(this.fecha).day() === 0) {
      throw new Error("No se atienden los domingos");
    }

    const horasValidas = [
      "09:00",
      "09:30",
      "10:00",
      "10:30",
      "11:00",
      "11:30",
      "12:00",
      "12:30",
      "13:00",
      "13:30",
      "14:00",
      "14:30",
      "15:00",
      "15:30",
      "16:00",
      "16:30",
      "17:00",
      "17:30",
      "18:00",
    ];
    if (!horasValidas.includes(this.hora)) {
      throw new Error(
        "Horario no válido. El horario de atención es de 9:00 a 18:00",
      );
    }

    const estadosValidos = ["pendiente", "realizada", "cancelada"];
    if (!estadosValidos.includes(this.estado)) {
      throw new Error("Estado de cita no válido");
    }

    if (this.precio < 0) {
      throw new Error("El precio no puede ser negativo");
    }

    if (this.observaciones && this.observaciones.length > 500) {
      throw new Error("Las observaciones no pueden superar los 500 caracteres");
    }

    return true;
  }

  static validarActualizacion(datos) {
    if (datos.idtratamiento !== undefined && !datos.idtratamiento) {
      throw new Error("El tratamiento es obligatorio");
    }
    if (datos.idcliente !== undefined && !datos.idcliente) {
      throw new Error("El cliente es obligatorio");
    }
    if (datos.idempleado !== undefined && !datos.idempleado) {
      throw new Error("El empleado es obligatorio");
    }
    if (datos.fecha !== undefined && !datos.fecha) {
      throw new Error("La fecha es obligatoria");
    }
    if (datos.hora !== undefined && !datos.hora) {
      throw new Error("La hora es obligatoria");
    }

    if (datos.fecha !== undefined && datos.hora !== undefined) {
      const fechaCita = dayjs(`${datos.fecha} ${datos.hora}`);
      if (!fechaCita.isValid()) {
        throw new Error("La fecha y hora no son válidas");
      }
      if (fechaCita.isBefore(dayjs())) {
        throw new Error("No se puede agendar citas en fecha pasada");
      }
    }

    if (datos.fecha !== undefined && dayjs(datos.fecha).day() === 0) {
      throw new Error("No se atienden los domingos");
    }

    if (datos.hora !== undefined) {
      const horasValidas = [
        "09:00",
        "09:30",
        "10:00",
        "10:30",
        "11:00",
        "11:30",
        "12:00",
        "12:30",
        "13:00",
        "13:30",
        "14:00",
        "14:30",
        "15:00",
        "15:30",
        "16:00",
        "16:30",
        "17:00",
        "17:30",
        "18:00",
      ];
      if (!horasValidas.includes(datos.hora)) {
        throw new Error(
          "Horario no válido. El horario de atención es de 9:00 a 18:00",
        );
      }
    }

    if (datos.estado !== undefined) {
      const estadosValidos = ["pendiente", "realizada", "cancelada"];
      if (!estadosValidos.includes(datos.estado)) {
        throw new Error("Estado de cita no válido");
      }
    }

    if (datos.precio !== undefined && datos.precio < 0) {
      throw new Error("El precio no puede ser negativo");
    }

    if (datos.observaciones !== undefined && datos.observaciones.length > 500) {
      throw new Error("Las observaciones no pueden superar los 500 caracteres");
    }

    return true;
  }
}

module.exports = Cita;
