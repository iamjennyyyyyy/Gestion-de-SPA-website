// models/PaqueteVendido.js
const dayjs = require("dayjs");

class PaqueteVendido {
  constructor(datos = {}) {
    this.idpaquetevendido = datos.idpaquetevendido || null;
    this.idpaquete = datos.idpaquete || null;
    this.idcliente = datos.idcliente || null;
    this.fechacompra = datos.fechacompra || null;
    this.fechainicio = datos.fechainicio || null;
    this.fechafin = datos.fechafin || null;
    this.precio = datos.precio !== undefined ? datos.precio : null;
  }

  validar() {
    if (!this.idpaquete) {
      throw new Error("El paquete es obligatorio");
    }
    if (!this.idcliente) {
      throw new Error("El cliente es obligatorio");
    }
    if (!this.fechacompra) {
      throw new Error("La fecha de compra es obligatoria");
    }
    if (!this.fechainicio) {
      throw new Error("La fecha de inicio es obligatoria");
    }
    if (!this.fechafin) {
      throw new Error("La fecha de fin es obligatoria");
    }
    if (this.precio === null || this.precio === undefined) {
      throw new Error("El precio es obligatorio");
    }

    const fechacompra = dayjs(this.fechacompra);
    const fechainicio = dayjs(this.fechainicio);
    const fechafin = dayjs(this.fechafin);
    const hoy = dayjs().startOf("day");

    console.log("Validando fechas:", {
      fechacompra: this.fechacompra,
      fechainicio: this.fechainicio,
      fechafin: this.fechafin,
      hoy: hoy.format("YYYY-MM-DD"),
    });

    if (!fechacompra.isValid()) {
      throw new Error("Fecha de compra no válida");
    }
    if (!fechainicio.isValid()) {
      throw new Error("Fecha de inicio no válida");
    }
    if (!fechafin.isValid()) {
      throw new Error("Fecha de fin no válida");
    }
    if (fechainicio.isBefore(fechacompra)) {
      throw new Error(
        "La fecha de inicio no puede ser anterior a la fecha de compra",
      );
    }
    if (fechafin.isBefore(fechainicio)) {
      throw new Error(
        "La fecha de fin no puede ser anterior a la fecha de inicio",
      );
    }

    // ✅ CORREGIDO: Permitir fechas iguales o posteriores a hoy
    if (fechainicio.isBefore(hoy)) {
      throw new Error("La fecha de inicio no puede ser pasada");
    }

    if (this.precio < 0) {
      throw new Error("El precio no puede ser negativo");
    }

    return true;
  }

  static validarActualizacion(datos) {
    if (datos.idpaquete !== undefined && !datos.idpaquete) {
      throw new Error("El paquete es obligatorio");
    }
    if (datos.idcliente !== undefined && !datos.idcliente) {
      throw new Error("El cliente es obligatorio");
    }
    if (datos.fechacompra !== undefined && !datos.fechacompra) {
      throw new Error("La fecha de compra es obligatoria");
    }
    if (datos.fechainicio !== undefined && !datos.fechainicio) {
      throw new Error("La fecha de inicio es obligatoria");
    }
    if (datos.fechafin !== undefined && !datos.fechafin) {
      throw new Error("La fecha de fin es obligatoria");
    }
    if (datos.precio !== undefined && datos.precio < 0) {
      throw new Error("El precio no puede ser negativo");
    }

    if (datos.fechacompra !== undefined && datos.fechainicio !== undefined) {
      const fechacompra = dayjs(datos.fechacompra);
      const fechainicio = dayjs(datos.fechainicio);
      if (fechainicio.isBefore(fechacompra)) {
        throw new Error(
          "La fecha de inicio no puede ser anterior a la fecha de compra",
        );
      }
    }

    if (datos.fechainicio !== undefined && datos.fechafin !== undefined) {
      const fechainicio = dayjs(datos.fechainicio);
      const fechafin = dayjs(datos.fechafin);
      if (fechafin.isBefore(fechainicio)) {
        throw new Error(
          "La fecha de fin no puede ser anterior a la fecha de inicio",
        );
      }
    }

    // ✅ CORREGIDO: Permitir fechas iguales o posteriores a hoy
    if (
      datos.fechainicio !== undefined &&
      dayjs(datos.fechainicio).isBefore(dayjs().startOf("day"))
    ) {
      throw new Error("La fecha de inicio no puede ser pasada");
    }

    return true;
  }
}

module.exports = PaqueteVendido;
