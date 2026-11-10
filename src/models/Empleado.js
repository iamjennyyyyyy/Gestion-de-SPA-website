// models/Empleado.js
class Empleado {
  constructor(datos = {}) {
    this.idempleado = datos.idempleado || null;
    this.nombre = datos.nombre || "";
    this.especialidad = datos.especialidad || "";
    this.horastrabajo = datos.horastrabajo || 0;
    this.direccion = datos.direccion || "";
    this.dni = datos.dni || "";
    this.telefono = datos.telefono || "";
    this.iddistrito = datos.iddistrito || null;
    this.esfijo = datos.esfijo !== undefined ? datos.esfijo : false;
  }

  static validarFormatoDNI(dni) {
    const dniLimpio = dni.toString().replace(/[\s\.\-]/g, "");

    // Validar longitud exacta de 11 dígitos
    if (dniLimpio.length !== 11) {
      throw new Error("El DNI debe tener exactamente 11 dígitos");
    }

    // Validar que solo contenga números
    if (!/^\d+$/.test(dniLimpio)) {
      throw new Error("El DNI no puede contener letras ni símbolos");
    }

    const anhoReal = new Date().getFullYear();
    const anhoMinimo = anhoReal - 120;
    const anhoMaximo = anhoReal - 1;

    // Extraer siglo (posición 7, índice 6 porque empieza en 0)
    const siglo = dniLimpio.charAt(6);
    let anhoNacimiento = parseInt(dniLimpio.substring(0, 2), 10);

    // Determinar el año completo según el siglo
    if (siglo >= "0" && siglo <= "5") {
      anhoNacimiento = anhoNacimiento + 1900;
    } else if (siglo >= "6" && siglo <= "8") {
      anhoNacimiento = anhoNacimiento + 2000;
    } else {
      throw new Error("El dígito de siglo en el DNI es inválido");
    }

    // Validar rango de año
    if (anhoNacimiento < anhoMinimo || anhoNacimiento > anhoMaximo) {
      throw new Error("El año de nacimiento en el DNI no es válido");
    }

    // Extraer mes y día
    const mes = parseInt(dniLimpio.substring(2, 4), 10);
    const dia = parseInt(dniLimpio.substring(4, 6), 10);

    // Validar mes
    if (mes < 1 || mes > 12) {
      throw new Error("El mes en el DNI no es válido");
    }

    // Validar día
    if (dia < 1 || dia > 31) {
      throw new Error("El día en el DNI no es válido");
    }

    // Validar días según el mes (incluyendo años bisiestos)
    const mesesCon30Dias = [4, 6, 9, 11];

    if (mesesCon30Dias.includes(mes) && dia > 30) {
      throw new Error("La fecha en el DNI no es válida");
    }

    if (mes === 2) {
      const esBisiesto = anhoNacimiento % 4 === 0;
      if ((esBisiesto && dia > 29) || (!esBisiesto && dia > 28)) {
        throw new Error("La fecha en el DNI no es válida");
      }
    }

    return dniLimpio;
  }

  static validarNombreCompleto(nombre) {
    const nombreTrim = nombre.trim();
    const cantidadEspacios = (nombreTrim.match(/ /g) || []).length;

    if (cantidadEspacios < 1) {
      throw new Error("El nombre debe ser completo (nombre y apellido)");
    }

    return nombreTrim;
  }

  validar() {
    // Validar nombre completo
    if (!this.nombre || this.nombre.trim() === "") {
      throw new Error("El nombre del empleado es obligatorio");
    }
    this.nombre = Empleado.validarNombreCompleto(this.nombre);

    if (this.nombre.length < 3) {
      throw new Error("El nombre debe tener al menos 3 caracteres");
    }

    if (!this.especialidad || this.especialidad.trim() === "") {
      throw new Error("La especialidad es obligatoria");
    }

    if (this.horastrabajo <= 0) {
      throw new Error("Las horas de trabajo deben ser mayores a 0");
    }
    if (this.horastrabajo > 40) {
      throw new Error(
        "Las horas de trabajo no pueden superar las 40 semanales",
      );
    }

    if (!this.direccion || this.direccion.trim() === "") {
      throw new Error("La dirección es obligatoria");
    }

    // Validar DNI con formato de fecha
    if (!this.dni || this.dni.trim() === "") {
      throw new Error("La cédula es obligatoria");
    }
    this.dni = Empleado.validarFormatoDNI(this.dni);

    // Validar teléfono
    if (!this.telefono || this.telefono.trim() === "") {
      throw new Error("El teléfono es obligatorio");
    }
    const telLimpio = this.telefono.toString().replace(/[\s\-\(\)]/g, "");
    if (!/^\d+$/.test(telLimpio)) {
      throw new Error("El teléfono debe contener solo números");
    }
    this.telefono = telLimpio;

    if (!this.iddistrito) {
      throw new Error("El distrito es obligatorio");
    }

    if (typeof this.esfijo !== "boolean") {
      throw new Error("El campo esFijo debe ser true o false");
    }

    return true;
  }

  static validarActualizacion(datos) {
    // Validar nombre completo si se actualiza
    if (datos.nombre !== undefined) {
      if (!datos.nombre || datos.nombre.trim() === "") {
        throw new Error("El nombre del empleado es obligatorio");
      }
      const nombreValidado = this.validarNombreCompleto(datos.nombre);
      if (nombreValidado.length < 3) {
        throw new Error("El nombre debe tener al menos 3 caracteres");
      }
      datos.nombre = nombreValidado;
    }

    if (
      datos.especialidad !== undefined &&
      (!datos.especialidad || datos.especialidad.trim() === "")
    ) {
      throw new Error("La especialidad es obligatoria");
    }

    if (datos.horastrabajo !== undefined) {
      if (datos.horastrabajo <= 0) {
        throw new Error("Las horas de trabajo deben ser mayores a 0");
      }
      if (datos.horastrabajo > 40) {
        throw new Error(
          "Las horas de trabajo no pueden superar las 40 semanales",
        );
      }
    }

    if (
      datos.direccion !== undefined &&
      (!datos.direccion || datos.direccion.trim() === "")
    ) {
      throw new Error("La dirección es obligatoria");
    }

    // Validar DNI con formato de fecha si se actualiza
    if (datos.dni !== undefined) {
      if (!datos.dni || datos.dni.toString().trim() === "") {
        throw new Error("La cédula es obligatoria");
      }
      datos.dni = this.validarFormatoDNI(datos.dni);
    }

    // Validar teléfono si se actualiza
    if (datos.telefono !== undefined) {
      if (!datos.telefono || datos.telefono.trim() === "") {
        throw new Error("El teléfono es obligatorio");
      }
      const telLimpio = datos.telefono.toString().replace(/[\s\-\(\)]/g, "");
      if (!/^\d+$/.test(telLimpio)) {
        throw new Error("El teléfono debe contener solo números");
      }
      datos.telefono = telLimpio;
    }

    if (datos.iddistrito !== undefined && !datos.iddistrito) {
      throw new Error("El distrito es obligatorio");
    }

    if (datos.esfijo !== undefined && typeof datos.esfijo !== "boolean") {
      throw new Error("El campo esFijo debe ser true o false");
    }

    return true;
  }
}

module.exports = Empleado;
