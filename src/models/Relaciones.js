// models/Relaciones.js
class MaterialTratamiento {
  constructor(datos = {}) {
    this.idmaterial = datos.idmaterial || null;
    this.idtratamiento = datos.idtratamiento || null;
    this.cantidad = datos.cantidad !== undefined ? datos.cantidad : null;
  }

  validar() {
    if (!this.idmaterial) {
      throw new Error("El material es obligatorio");
    }
    if (!this.idtratamiento) {
      throw new Error("El tratamiento es obligatorio");
    }
    if (this.cantidad === null || this.cantidad === undefined) {
      throw new Error("La cantidad es obligatoria");
    }
    if (this.cantidad <= 0) {
      throw new Error("La cantidad debe ser mayor a 0");
    }
    return true;
  }

  static validarActualizacion(datos) {
    if (datos.idmaterial !== undefined && !datos.idmaterial) {
      throw new Error("El material es obligatorio");
    }
    if (datos.idtratamiento !== undefined && !datos.idtratamiento) {
      throw new Error("El tratamiento es obligatorio");
    }
    if (datos.cantidad !== undefined && datos.cantidad <= 0) {
      throw new Error("La cantidad debe ser mayor a 0");
    }
    return true;
  }
}

class MaterialCita {
  constructor(datos = {}) {
    this.idcita = datos.idcita || null;
    this.idmaterial = datos.idmaterial || null;
    this.cantidadutilizada =
      datos.cantidadutilizada !== undefined ? datos.cantidadutilizada : null;
  }

  validar() {
    if (!this.idcita) {
      throw new Error("La cita es obligatoria");
    }
    if (!this.idmaterial) {
      throw new Error("El material es obligatorio");
    }
    if (
      this.cantidadutilizada === null ||
      this.cantidadutilizada === undefined
    ) {
      throw new Error("La cantidad utilizada es obligatoria");
    }
    if (this.cantidadutilizada <= 0) {
      throw new Error("La cantidad utilizada debe ser mayor a 0");
    }
    return true;
  }

  static validarActualizacion(datos) {
    if (datos.idcita !== undefined && !datos.idcita) {
      throw new Error("La cita es obligatoria");
    }
    if (datos.idmaterial !== undefined && !datos.idmaterial) {
      throw new Error("El material es obligatorio");
    }
    if (datos.cantidadutilizada !== undefined && datos.cantidadutilizada <= 0) {
      throw new Error("La cantidad utilizada debe ser mayor a 0");
    }
    return true;
  }
}

module.exports = {
  MaterialTratamiento,
  MaterialCita,
};
