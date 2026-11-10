// models/Area.js
class Area {
  constructor(datos = {}) {
    this.idarea = datos.idarea || null;
    this.nombre = datos.nombre || "";
    this.cantidadpersonalfijo = datos.cantidadpersonalfijo || 0;
  }

  validar() {
    if (!this.nombre || this.nombre.trim() === "") {
      throw new Error("El nombre del área es obligatorio");
    }
    if (this.nombre.trim().length < 3) {
      throw new Error("El nombre del área debe tener al menos 3 caracteres");
    }
    if (this.nombre.trim().length > 100) {
      throw new Error("El nombre del área no puede superar los 100 caracteres");
    }
    if (this.cantidadpersonalfijo < 0) {
      throw new Error("La cantidad de personal fijo no puede ser negativa");
    }
    return true;
  }

  static validarActualizacion(datos) {
    if (datos.nombre !== undefined) {
      if (!datos.nombre || datos.nombre.trim() === "") {
        throw new Error("El nombre del área es obligatorio");
      }
      if (datos.nombre.trim().length < 3) {
        throw new Error("El nombre del área debe tener al menos 3 caracteres");
      }
      if (datos.nombre.trim().length > 100) {
        throw new Error(
          "El nombre del área no puede superar los 100 caracteres",
        );
      }
    }
    if (
      datos.cantidadpersonalfijo !== undefined &&
      datos.cantidadpersonalfijo < 0
    ) {
      throw new Error("La cantidad de personal fijo no puede ser negativa");
    }
    return true;
  }
}

module.exports = Area;
