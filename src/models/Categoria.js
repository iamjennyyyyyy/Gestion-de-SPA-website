// models/Categoria.js
class Categoria {
  constructor(datos = {}) {
    this.idcategoria = datos.idcategoria || null;
    this.nombre = datos.nombre || "";
    this.idarea = datos.idarea || null;
  }

  validar() {
    if (!this.nombre || this.nombre.trim() === "") {
      throw new Error("El nombre de la categoría es obligatorio");
    }
    if (this.nombre.trim().length < 3) {
      throw new Error(
        "El nombre de la categoría debe tener al menos 3 caracteres",
      );
    }
    if (this.nombre.trim().length > 100) {
      throw new Error(
        "El nombre de la categoría no puede superar los 100 caracteres",
      );
    }
    if (!this.idarea) {
      throw new Error("El área es obligatoria");
    }
    return true;
  }

  static validarActualizacion(datos) {
    if (datos.nombre !== undefined) {
      if (!datos.nombre || datos.nombre.trim() === "") {
        throw new Error("El nombre de la categoría es obligatorio");
      }
      if (datos.nombre.trim().length < 3) {
        throw new Error(
          "El nombre de la categoría debe tener al menos 3 caracteres",
        );
      }
      if (datos.nombre.trim().length > 100) {
        throw new Error(
          "El nombre de la categoría no puede superar los 100 caracteres",
        );
      }
    }
    if (datos.idarea !== undefined && !datos.idarea) {
      throw new Error("El área es obligatoria");
    }
    return true;
  }
}

module.exports = Categoria;
