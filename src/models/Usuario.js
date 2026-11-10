const bcrypt = require("bcrypt");

class Usuario {
  constructor(datos = {}) {
    this.idusuario = datos.idusuario || null;
    this.username = datos.username || "";
    this.rol = datos.rol || "dependiente";
    this.contrasena = datos.contrasena || "";
    this.salt = datos.salt || "";
    this.created_at = datos.created_at || null;
  }

  async encriptarContrasena(contrasenaPlana) {
    const salt = await bcrypt.genSalt(10);
    this.salt = salt;
    this.contrasena = await bcrypt.hash(contrasenaPlana, salt);
  }

  async validarContrasena(contrasenaPlana) {
    return await bcrypt.compare(contrasenaPlana, this.contrasena);
  }

  validar() {
    if (!this.username || this.username.trim() === "") {
      throw new Error("El nombre de usuario es obligatorio");
    }
    if (this.username.length < 3) {
      throw new Error("El nombre de usuario debe tener al menos 3 caracteres");
    }
    if (!this.contrasena || this.contrasena.length < 6) {
      throw new Error("La contraseña debe tener al menos 6 caracteres");
    }
    const rolesValidos = ["dependiente", "administrador"];
    if (!rolesValidos.includes(this.rol)) {
      throw new Error("Rol no válido");
    }
    return true;
  }

  static validarActualizacion(datos) {
    if (datos.username !== undefined) {
      if (!datos.username || datos.username.trim() === "") {
        throw new Error("El nombre de usuario es obligatorio");
      }
      if (datos.username.length < 3) {
        throw new Error(
          "El nombre de usuario debe tener al menos 3 caracteres",
        );
      }
    }
    if (datos.rol !== undefined) {
      const rolesValidos = ["dependiente", "administrador"];
      if (!rolesValidos.includes(datos.rol)) {
        throw new Error("Rol no válido");
      }
    }
    if (datos.contrasena !== undefined && datos.contrasena.length < 6) {
      throw new Error("La contraseña debe tener al menos 6 caracteres");
    }
    return true;
  }
}

module.exports = Usuario;
