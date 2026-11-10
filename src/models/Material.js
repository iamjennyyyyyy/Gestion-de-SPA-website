// models/Material.js
class Material {
  constructor(datos = {}) {
    this.idmaterial = datos.idmaterial || null;
    this.nombre = datos.nombre || "";
    this.cantidad = datos.cantidad !== undefined ? datos.cantidad : null;
  }

  validar() {
    if (!this.nombre || this.nombre.trim() === "") {
      throw new Error("El nombre del material es obligatorio");
    }
    if (this.nombre.trim().length < 3) {
      throw new Error(
        "El nombre del material debe tener al menos 3 caracteres",
      );
    }
    if (this.cantidad === null || this.cantidad === undefined) {
      throw new Error("La cantidad del material es obligatoria");
    }
    if (isNaN(this.cantidad) || this.cantidad < 0) {
      throw new Error(
        "La cantidad del material debe ser un número no negativo",
      );
    }
    return true;
  }

  static validarActualizacion(datos) {
    if (datos.nombre !== undefined) {
      if (!datos.nombre || datos.nombre.trim() === "") {
        throw new Error("El nombre del material es obligatorio");
      }
      if (datos.nombre.trim().length < 3) {
        throw new Error(
          "El nombre del material debe tener al menos 3 caracteres",
        );
      }
    }
    if (datos.cantidad !== undefined) {
      if (isNaN(datos.cantidad) || datos.cantidad < 0) {
        throw new Error(
          "La cantidad del material debe ser un número no negativo",
        );
      }
    }
    return true;
  }
}

module.exports = Material;
