// models/Distrito.js
class Distrito {
  constructor(datos = {}) {
    this.iddistrito = datos.iddistrito || null;
    this.nombre = datos.nombre || "";
  }

  validar() {
    if (!this.nombre || this.nombre.trim() === "") {
      throw new Error("El nombre del distrito es obligatorio");
    }
    if (this.nombre.trim().length < 3) {
      throw new Error(
        "El nombre del distrito debe tener al menos 3 caracteres",
      );
    }
    return true;
  }

  static validarActualizacion(datos) {
    if (datos.nombre !== undefined) {
      if (!datos.nombre || datos.nombre.trim() === "") {
        throw new Error("El nombre del distrito es obligatorio");
      }
      if (datos.nombre.trim().length < 3) {
        throw new Error(
          "El nombre del distrito debe tener al menos 3 caracteres",
        );
      }
    }
    return true;
  }
}

module.exports = Distrito;
