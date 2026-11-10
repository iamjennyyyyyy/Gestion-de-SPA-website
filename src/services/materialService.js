const materialRepository = require("../repositories/materialRepository");
const Material = require("../models/Material");

const materialService = {
  async listarMateriales() {
    return await materialRepository.listarTodos();
  },

  async obtenerMaterialPorId(id) {
    const material = await materialRepository.buscarPorId(id);
    if (!material) throw new Error("Material no encontrado");
    return material;
  },

  async crearMaterial(datos) {
    const material = new Material(datos);
    material.validar();
    if (await materialRepository.buscarPorNombre(material.nombre))
      throw new Error("Ya existe un material con ese nombre");
    return await materialRepository.crear(datos);
  },

  async actualizarMaterial(id, datos) {
    const existente = await materialRepository.buscarPorId(id);
    if (!existente) throw new Error("Material no encontrado");
    if (
      datos.nombre &&
      datos.nombre !== existente.nombre &&
      (await materialRepository.buscarPorNombre(datos.nombre))
    ) {
      throw new Error("Ya existe un material con ese nombre");
    }
    Material.validarActualizacion(datos);
    return await materialRepository.actualizar(id, datos);
  },

  async eliminarMaterial(id) {
    const material = await materialRepository.buscarPorId(id);
    if (!material) throw new Error("Material no encontrado");
    try {
      await materialRepository.eliminar(id);
    } catch (e) {
      if (e.code === "23503")
        throw new Error(
          "No se puede eliminar: el material está asociado a tratamientos o citas",
        );
      throw e;
    }
  },
};

module.exports = materialService;
