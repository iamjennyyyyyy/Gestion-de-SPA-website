const categoriaRepository = require("../repositories/categoriaRepository");
const areaRepository = require("../repositories/areaRepository");
const Categoria = require("../models/Categoria");
const tratamientoRepository = require("../repositories/tratamientoRepository");

const categoriaService = {
  async listarCategorias() {
    return await categoriaRepository.listarTodos();
  },

  async obtenerCategoriaPorId(id) {
    const categoria = await categoriaRepository.buscarPorId(id);
    if (!categoria) throw new Error("Categoría no encontrada");
    return categoria;
  },

  async obtenerCategoriasPorArea(idArea) {
    const area = await areaRepository.buscarPorId(idArea);
    if (!area) throw new Error("Área no encontrada");
    return await categoriaRepository.buscarPorArea(idArea);
  },

  async crearCategoria(datos) {
    const area = await areaRepository.buscarPorId(datos.idarea);
    if (!area) throw new Error("El área de la categoría no existe");
    const categoria = new Categoria(datos);
    categoria.validar();
    if (await categoriaRepository.buscarPorNombre(categoria.nombre))
      throw new Error("Ya existe una categoría con ese nombre");
    return await categoriaRepository.crear(datos);
  },

  async actualizarCategoria(id, datos) {
    const existente = await categoriaRepository.buscarPorId(id);
    if (!existente) throw new Error("Categoría no encontrada");
    if (
      datos.nombre &&
      datos.nombre !== existente.nombre &&
      (await categoriaRepository.buscarPorNombre(datos.nombre))
    ) {
      throw new Error("Ya existe una categoría con ese nombre");
    }
    Categoria.validarActualizacion(datos);
    return await categoriaRepository.actualizar(id, datos);
  },

  async eliminarCategoria(id) {
    const categoria = await categoriaRepository.buscarPorId(id);
    if (!categoria) throw new Error("Categoría no encontrada");
    try {
      await categoriaRepository.eliminar(id);
    } catch (e) {
      if (e.code === "23503")
        throw new Error(
          "No se puede eliminar: la categoría tiene tratamientos asociados",
        );
      throw e;
    }
  },
  async moverCategoriaAOtraArea(idCategoria, idAreaNueva) {
    const categoria = await categoriaRepository.buscarPorId(idCategoria);
    if (!categoria) throw new Error("Categoría no encontrada");
    const area = await areaRepository.buscarPorId(idAreaNueva);
    if (!area) throw new Error("Área de destino no encontrada");
    return await categoriaRepository.cambiarDeArea(idCategoria, idAreaNueva);
  },

  async moverTratamientosAOtraCategoria(idCategoriaOrigen, idCategoriaDestino) {
    const origen = await categoriaRepository.buscarPorId(idCategoriaOrigen);
    if (!origen) throw new Error("Categoría de origen no encontrada");
    const destino = await categoriaRepository.buscarPorId(idCategoriaDestino);
    if (!destino) throw new Error("Categoría de destino no encontrada");
    return await tratamientoRepository.moverACategoria(
      idCategoriaOrigen,
      idCategoriaDestino,
    );
  },
};

module.exports = categoriaService;
