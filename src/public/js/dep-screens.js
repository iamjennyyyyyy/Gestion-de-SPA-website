/* dep-screens.js — Pantallas dependiente: Tratamientos, Paquetes, Vendidos,
   Reportes, Mapa, Inicio, Realizar/Cancelar cita, sub-modal */
// Dependiente: Tratamientos (read-only list)
SCREENS.tratamientos = async () => {
  const ct = $("pageContent");
  ct.innerHTML = showLoading();
  try {
    const d = await api.get("/api/tratamientos");
    if (!d.success) {
      ct.innerHTML = showEmpty(
        "fa-solid fa-spa",
        "Sin datos",
        "No hay tratamientos disponibles.",
      );
      return;
    }
    ct.innerHTML =
      '<div class="fade-in"><div class="flex items-center justify-between mb-5"><h3 class="text-lg font-semibold text-[#2c3e50]">Tratamientos</h3><span class="px-2.5 py-0.5 bg-menta-50 text-menta-700 text-xs font-semibold rounded-full">' +
      d.data.length +
      '</span></div><div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">' +
      d.data
        .map(
          (t) =>
            '<div class="bg-white rounded-2xl border border-[#e8ecf1] shadow-sm p-5 hover:shadow-md transition-shadow"><div class="flex items-start gap-3"><div class="w-10 h-10 rounded-xl bg-lavender-100 flex items-center justify-center flex-shrink-0"><i class="fa-solid fa-spa text-spa"></i></div><div class="min-w-0"><h4 class="font-semibold text-[#2c3e50] truncate">' +
            t.nombre +
            '</h4><p class="text-xs text-[#6b7280] mt-0.5 line-clamp-2">' +
            (t.descripcion || "Sin descripción") +
            '</p></div></div><div class="flex items-center justify-between mt-4 pt-3 border-t border-[#e8ecf1]"><span class="text-lg font-bold text-menta">' +
            $$(t.precio) +
            '</span><div class="text-right"><span class="text-xs text-[#6b7280]">' +
            t.duracion +
            " min</span>" +
            (t.categorianombre
              ? '<br><span class="text-xs text-menta font-medium">' +
                t.categorianombre +
                "</span>"
              : "") +
            "</div></div></div>",
        )
        .join("") +
      "</div></div>";
  } catch (e) {
    ct.innerHTML = showEmpty(
      "fa-solid fa-circle-exclamation",
      "Error",
      "Ocurrió un error al cargar tratamientos.",
      "Reintentar",
      "navigate('tratamientos')",
    );
  }
};

SCREENS["paquetes-vendidos"] = async () => renderPaquetesVendidos();
SCREENS["admin-paquetes-vendidos"] = async () => renderPaquetesVendidos();

// Dependiente: Paquetes (read-only w/ detail)
SCREENS.paquetes = async () => {
  const ct = $("pageContent");
  ct.innerHTML = showLoading();
  try {
    const d = await api.get("/api/paquetes");
    if (!d.success) {
      ct.innerHTML = showEmpty(
        "fa-solid fa-box",
        "Sin datos",
        "No hay paquetes disponibles.",
      );
      return;
    }
    let content =
      '<div class="fade-in"><div class="flex items-center justify-between mb-5"><h3 class="text-lg font-semibold text-[#2c3e50]">Paquetes</h3><span class="px-2.5 py-0.5 bg-menta-50 text-menta-700 text-xs font-semibold rounded-full">' +
      d.data.length +
      '</span></div><div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">' +
      d.data
        .map(
          (p) =>
            '<div class="bg-white rounded-2xl border border-[#e8ecf1] shadow-sm p-5 hover:shadow-md transition-shadow"><div class="flex items-start gap-3"><div class="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center flex-shrink-0"><i class="fa-solid fa-gift text-amber-500"></i></div><div class="min-w-0"><h4 class="font-semibold text-[#2c3e50]">' +
            p.paquetenombre +
            '</h4></div></div><div class="flex items-center justify-between mt-4 pt-3 border-t border-[#e8ecf1]"><span class="text-lg font-bold text-menta">' +
            $$(p.precio) +
            '</span><div class="flex gap-2"><button onclick="venderPaquete(' +
            p.idpaquete +
            ",'" +
            p.paquetenombre.replace(/'/g, "\\'") +
            "'," +
            p.precio +
            ')" class="px-3 py-1.5 bg-menta text-white text-xs font-medium rounded-xl hover:bg-menta-600 shadow-sm">Vender</button><button onclick="verPaqueteDetalle(' +
            p.idpaquete +
            ')" class="text-xs text-menta hover:text-menta-600 font-medium">Ver <i class="fa-solid fa-chevron-right ml-0.5 text-xs"></i></button></div></div></div>',
        )
        .join("") +
      "</div></div>";
    ct.innerHTML = content;
  } catch (e) {
    ct.innerHTML = showEmpty(
      "fa-solid fa-circle-exclamation",
      "Error",
      "Ocurrió un error.",
      "Reintentar",
      "navigate('paquetes')",
    );
  }
};
async function verPaqueteDetalle(id) {
  try {
    const d = await api.get("/api/paquetes/" + id);
    if (!d.success) return toast(d.error, false);
    const p = d.data;

    // Los tratamientos vienen como un string separado por comas desde la vista
    const tratamientosString = p.tratamientos || "";
    const tratamientosList = tratamientosString
      ? tratamientosString.split(", ")
      : [];

    // Duración total
    const duracionTotal = p.duraciontotal
      ? `${p.duraciontotal} min`
      : "No especificada";

    openModal(`<div class="p-6" style="max-width: 480px">
      <h3 class="text-lg font-semibold text-[#2c3e50] mb-4">
        <i class="fa-solid fa-gift text-amber-500 mr-2"></i>${p.paquetenombre}
      </h3>
      <div class="mb-4">
        <div class="flex justify-between items-center mb-2">
          <p class="text-xs font-semibold text-[#6b7280] uppercase tracking-wider">Duración Total</p>
          <span class="text-sm font-medium text-menta">${duracionTotal}</span>
        </div>
      </div>
      ${
        tratamientosList.length
          ? `
        <div class="mb-4">
          <p class="text-xs font-semibold text-[#6b7280] mb-2 uppercase tracking-wider">Tratamientos incluidos</p>
          <div class="space-y-2">
            ${tratamientosList
              .map(
                (t) => `
              <div class="flex items-center gap-3 px-3 py-2.5 bg-lavender-50 rounded-xl text-sm">
                <div class="w-2 h-2 rounded-full bg-menta"></div>
                <span class="text-[#2c3e50]">${t}</span>
              </div>
            `,
              )
              .join("")}
          </div>
        </div>
      `
          : '<p class="text-sm text-[#9ca3af] mb-4">No hay tratamientos asignados</p>'
      }
      <div class="flex items-center justify-between py-3 border-t border-[#e8ecf1]">
        <span class="text-sm text-[#6b7280]">Precio Total</span>
        <span class="text-xl font-bold text-menta">${$$(p.precio)}</span>
      </div>
      <button onclick="closeModal()" class="mt-4 w-full px-4 py-2.5 bg-menta text-white rounded-xl text-sm font-medium shadow-sm hover:bg-menta-600">Cerrar</button>
    </div>`);
  } catch (e) {
    toast("Error al cargar detalle", false);
  }
}
async function venderPaquete(id, nombre, precio) {
  try {
    const cl = await api.get("/api/clientes");
    if (!cl.success) return toast("Error al cargar clientes", false);

    // Obtener los tratamientos del paquete
    const pkgRes = await api.get("/api/paquetes/" + id);
    if (!pkgRes.success) return toast("Error al cargar el paquete", false);
    const paquete = pkgRes.data;

    // Obtener tratamientos del paquete
    const tratamientosRes = await api.get(
      "/api/paquetes/" + id + "/tratamientos",
    );
    const tratamientos = tratamientosRes.success
      ? tratamientosRes.data || []
      : [];

    console.log("Tratamientos del paquete:", tratamientos); // Para depurar

    if (tratamientos.length === 0) {
      toast("El paquete no tiene tratamientos asignados", false);
      return;
    }

    // Cargar empleados para cada tratamiento
    const empleadosMap = {};
    for (const trat of tratamientos) {
      const tratId = trat.idtratamiento;
      const empsRes = await api.get(
        "/api/tratamientos/" + tratId + "/empleados-disponibles",
      );
      if (empsRes.success && empsRes.data) {
        empleadosMap[tratId] = empsRes.data;
      } else {
        empleadosMap[tratId] = { fijos: [], suplentes: [] };
      }
    }

    // Construir modal con selección de cliente y citas
    let tratamientosHtml = "";
    let diaOffset = 0;

    for (let i = 0; i < tratamientos.length; i++) {
      const trat = tratamientos[i];
      const fechaMin = dayjs().add(diaOffset, "day").format("YYYY-MM-DD");
      // ✅ CORREGIDO: usar 'tratamientonombre' (con 'm' minúscula después de la 't')
      const nombreTratamiento =
        trat.tratamientonombre || trat.nombre || "Tratamiento sin nombre";

      tratamientosHtml += `
        <div class="border-t border-[#e8ecf1] pt-4 mt-4 ${i === 0 ? "border-t-0 pt-0 mt-0" : ""}">
          <div class="flex items-center gap-2 mb-3">
            <div class="w-6 h-6 rounded-full bg-menta-50 flex items-center justify-center">
              <span class="text-xs font-bold text-menta">${i + 1}</span>
            </div>
            <h4 class="font-semibold text-[#2c3e50]">${nombreTratamiento}</h4>
          </div>
          <div class="grid grid-cols-3 gap-3">
            <div>
              <label class="block text-xs font-semibold text-[#6b7280] mb-1">Fecha *</label>
              <input type="date" class="citaFecha w-full px-3 py-2 border border-[#d1d5db] rounded-lg text-sm" 
                     data-trat="${trat.idtratamiento}" data-index="${i}" value="${fechaMin}">
            </div>
            <div>
             <div>
  <label class="block text-xs font-semibold text-[#6b7280] mb-1">Hora *</label>
  <select class="citaHora w-full px-3 py-2 border border-[#d1d5db] rounded-lg text-sm" data-trat="${trat.idtratamiento}" data-index="${i}">${horasOptions('10:00')}</select>
</div>
            </div>
            <div>
              <label class="block text-xs font-semibold text-[#6b7280] mb-1">Empleado *</label>
                           <select class="citaEmpleado w-full px-3 py-2 border border-[#d1d5db] rounded-lg text-sm" 
                      data-trat="${trat.idtratamiento}" data-index="${i}">
                <option value="">Seleccionar</option>
                ${
                  empleadosMap[trat.idtratamiento].fijos &&
                  empleadosMap[trat.idtratamiento].fijos.length
                    ? '<optgroup label="Fijos del tratamiento">' +
                      empleadosMap[trat.idtratamiento].fijos
                        .map(
                          (e) =>
                            '<option value="' +
                            e.idempleado +
                            '">' +
                            e.nombre +
                            "</option>",
                        )
                        .join("") +
                      "</optgroup>"
                    : ""
                }
                ${
                  empleadosMap[trat.idtratamiento].suplentes &&
                  empleadosMap[trat.idtratamiento].suplentes.length
                    ? '<optgroup label="Suplentes del área">' +
                      empleadosMap[trat.idtratamiento].suplentes
                        .map(
                          (e) =>
                            '<option value="' +
                            e.idempleado +
                            '">' +
                            e.nombre +
                            "</option>",
                        )
                        .join("") +
                      "</optgroup>"
                    : ""
                }
              </select>
            </div>
          </div>
        </div>
      `;
      diaOffset++;
    }

    openModal(
      `
      <div class="p-6" style="max-width: 700px; max-height: 80vh; overflow-y-auto">
        <h3 class="text-lg font-semibold text-[#2c3e50] mb-4">
          <i class="fa-solid fa-gift text-amber-500 mr-2"></i>Vender Paquete: ${paquete.paquetenombre}
        </h3>
        
        <div class="bg-amber-50 rounded-xl px-4 py-3 mb-4 border border-amber-100">
          <p class="text-sm font-semibold text-[#2c3e50]">Precio del paquete</p>
          <p class="text-lg font-bold text-menta">${$$(paquete.precio)}</p>
        </div>
        
        <div class="mb-4">
          <label class="block text-xs font-semibold text-[#6b7280] mb-1.5">Cliente *</label>
          <div class="relative">
            <input type="text" id="vtaClienteInput" autocomplete="off" class="w-full px-4 py-2.5 border border-[#d1d5db] rounded-xl text-sm" placeholder="Nombre del cliente">
            <input type="hidden" id="vtaClienteId">
            <div id="vtaClienteAutocomplete" class="absolute z-50 w-full bg-white border border-[#e8ecf1] rounded-xl shadow-lg mt-1 max-h-48 overflow-y-auto hidden"></div>
          </div>
        </div>
        
        <input type="hidden" id="vtaPaqueteId" value="${paquete.idpaquete}">
        <input type="hidden" id="vtaPaquetePrecio" value="${paquete.precio}">
        
        <div class="border-t border-[#e8ecf1] pt-4 mt-4">
          <h4 class="font-semibold text-[#2c3e50] mb-3 flex items-center gap-2">
            <i class="fa-solid fa-calendar-check text-menta text-sm"></i>Agendar Citas
          </h4>
          <div id="tratamientosContainer">
            ${tratamientosHtml}
          </div>
        </div>
        
        <div class="flex gap-2 mt-6 pt-4 border-t border-[#e8ecf1]">
          <button onclick="closeModal()" class="flex-1 px-4 py-2.5 bg-gray-100 text-[#6b7280] rounded-xl text-sm font-medium hover:bg-gray-200">Cancelar</button>
          <button onclick="guardarVentaPaqueteCompleto()" class="flex-1 px-4 py-2.5 bg-menta text-white rounded-xl text-sm font-medium shadow-sm hover:bg-menta-600">Registrar Venta y Citas</button>
        </div>
      </div>
    `,
      () => {
        const inp = $("vtaClienteInput");
        if (inp)
          inp.addEventListener(
            "input",
            debounce(function () {
              vtaAutocomplete();
            }, 300),
          );
      },
    );
  } catch (e) {
    console.error("Error:", e);
    toast(e.message || "Error de conexión", false);
  }
}
async function vtaAutocomplete() {
  const q = $("vtaClienteInput")?.value;
  if (!q || q.length < 2) {
    $("vtaClienteAutocomplete")?.classList.add("hidden");
    return;
  }
  try {
    const d = await api.get("/api/clientes?q=" + encodeURIComponent(q));
    if (!d.success) return;
    const filtrados = d.data || [];
    const ac = $("vtaClienteAutocomplete");
    if (!ac) return;
    let html = '<div class="p-2 space-y-1">';
    if (filtrados.length) {
      html += filtrados
        .map(
          (c) =>
            '<div class="px-3 py-2 hover:bg-menta-50 rounded-lg cursor-pointer text-sm text-[#2c3e50] flex items-center justify-between" onclick="vtaSelCliente(' +
            c.idcliente +
            ",'" +
            c.nombre.replace(/'/g, "\\'") +
            "')\"><span>" +
            c.nombre +
            '</span><span class="text-xs text-[#6b7280]">' +
            (c.telefono || "") +
            "</span></div>",
        )
        .join("");
    } else {
      html +=
        '<div class="px-3 py-2 text-sm text-[#9ca3af]">Sin resultados</div>';
    }
    html +=
      '<div class="border-t border-[#e8ecf1] mt-1 pt-1"><div class="px-3 py-2 hover:bg-menta-50 rounded-lg cursor-pointer text-sm text-menta font-medium flex items-center gap-2" onclick="crearClienteRapido(\'vta\')"><i class="fa-solid fa-plus"></i> Agregar nuevo cliente</div></div></div>';
    ac.innerHTML = html;
    ac.classList.remove("hidden");
  } catch (e) {}
}
function vtaSelCliente(id, nombre) {
  $("vtaClienteId").value = id;
  $("vtaClienteInput").value = nombre;
  $("vtaClienteAutocomplete").classList.add("hidden");
}


// ============================================================
// PAQUETES VENDIDOS - Lista general
// ============================================================
let paquetesVendidosFilter = "todos";
let paqueteVendidoFechaDesde = "";
let paqueteVendidoFechaHasta = "";

async function renderPaquetesVendidos() {
  const ct = $("pageContent");
  ct.innerHTML = showLoading("Cargando paquetes vendidos...");

  try {
    const d = await api.get("/api/paquetes-vendidos");
    if (!d.success) {
      ct.innerHTML = showEmpty(
        "fa-solid fa-receipt",
        "Sin datos",
        "No se pudieron cargar los paquetes vendidos.",
      );
      return;
    }

    let paquetes = d.data || [];
    const hoy = dayjs().format("YYYY-MM-DD");

    // Filtrar por fechas
    if (paqueteVendidoFechaDesde) {
      paquetes = paquetes.filter(
        (p) =>
          dayjs(p.fechacompra).format("YYYY-MM-DD") >= paqueteVendidoFechaDesde,
      );
    }
    if (paqueteVendidoFechaHasta) {
      paquetes = paquetes.filter(
        (p) =>
          dayjs(p.fechacompra).format("YYYY-MM-DD") <= paqueteVendidoFechaHasta,
      );
    }

    // Ordenar por fecha de compra (más reciente primero)
    paquetes.sort((a, b) => new Date(b.fechacompra) - new Date(a.fechacompra));

    const filtrosActivos = paqueteVendidoFechaDesde || paqueteVendidoFechaHasta;

    ct.innerHTML = `
      <div class="fade-in">
        <div class="flex items-center justify-between mb-5">
          <h3 class="text-lg font-semibold text-[#2c3e50]">
            <i class="fa-solid fa-receipt text-menta mr-2"></i>Paquetes Vendidos
          </h3>
          <span class="px-2.5 py-0.5 bg-menta-50 text-menta-700 text-xs font-semibold rounded-full">${paquetes.length}</span>
        </div>
        
        <div class="flex flex-wrap items-center gap-2 mb-4 p-3 bg-[#f8fafc] rounded-xl border border-[#e8ecf1]">
          <i class="fa-solid fa-filter text-xs text-[#6b7280]"></i>
          <input type="date" id="paqVendFechaDesde" value="${paqueteVendidoFechaDesde}" class="px-2.5 py-1.5 border border-[#d1d5db] rounded-lg text-xs w-36" 
                 onchange="paqueteVendidoFechaDesde=this.value;renderPaquetesVendidos()">
          <span class="text-xs text-[#6b7280]">a</span>
          <input type="date" id="paqVendFechaHasta" value="${paqueteVendidoFechaHasta}" class="px-2.5 py-1.5 border border-[#d1d5db] rounded-lg text-xs w-36" 
                 onchange="paqueteVendidoFechaHasta=this.value;renderPaquetesVendidos()">
          ${filtrosActivos ? "<button onclick=\"paqueteVendidoFechaDesde='';paqueteVendidoFechaHasta='';renderPaquetesVendidos()\" class=\"px-3 py-1.5 bg-gray-200 text-[#6b7280] text-xs font-medium rounded-lg hover:bg-gray-300\">Limpiar</button>" : ""}
        </div>
        
        <div class="space-y-3">
          ${
            paquetes.length
              ? paquetes
                  .map((pv) => {
                    const esActivo =
                      dayjs(pv.fechainicio).format("YYYY-MM-DD") <= hoy &&
                      dayjs(pv.fechafin).format("YYYY-MM-DD") >= hoy;
                    const estadoBadge = !esActivo
                      ? '<span class="px-2 py-0.5 text-xs font-semibold rounded-full bg-gray-100 text-gray-500">Vencido</span>'
                      : '<span class="px-2 py-0.5 text-xs font-semibold rounded-full bg-menta-50 text-menta-700">Activo</span>';

                    return `
              <div class="bg-white rounded-2xl border border-[#e8ecf1] shadow-sm overflow-hidden">
                <div class="px-5 py-3.5 flex items-center justify-between cursor-pointer hover:bg-[#f8fafc] transition-colors" 
                     onclick="togglePaqVendidoPanel(${pv.idpaquetevendido})">
                  <div class="flex items-center gap-3">
                    <div class="w-9 h-9 rounded-xl bg-amber-50 flex items-center justify-center">
                      <i class="fa-solid fa-box text-amber-500 text-sm"></i>
                    </div>
                    <div>
                      <h4 class="font-medium text-[#2c3e50]">${pv.paquetenombre || "Paquete #" + pv.idpaquete}</h4>
                      <p class="text-xs text-[#6b7280]">
                        ${pv.clientenombre || "Cliente"} &bull; Compra: ${formatDateShort(pv.fechacompra)}
                      </p>
                    </div>
                  </div>
                  <div class="flex items-center gap-3">
                    ${estadoBadge}
                    <span class="text-base font-bold text-menta">${$$(pv.precio || 0)}</span>
                    <i class="fa-solid fa-chevron-down text-[#9ca3af] transition-transform" id="paqVendChev_${pv.idpaquetevendido}"></i>
                  </div>
                </div>
                <div id="paqVendPanel_${pv.idpaquetevendido}" class="hidden border-t border-[#e8ecf1] bg-[#f8fafc]">
                  <div class="p-4" id="paqVendContent_${pv.idpaquetevendido}">
                    ${showLoading()}
                  </div>
                </div>
              </div>
            `;
                  })
                  .join("")
              : showEmpty(
                  "fa-solid fa-receipt",
                  "Sin paquetes vendidos",
                  "Aún no se han vendido paquetes.",
                )
          }
        </div>
      </div>
    `;
  } catch (e) {
    console.error(e);
    ct.innerHTML = showEmpty(
      "fa-solid fa-circle-exclamation",
      "Error",
      "Ocurrió un error al cargar los paquetes vendidos.",
      "Reintentar",
      "renderPaquetesVendidos()",
    );
  }
}

let _expandedPaqVendido = null;

async function loadPaqVendidoDetalle(id) {
  const ct = $(`paqVendContent_${id}`);
  if (!ct) return;

  try {
    const d = await api.get("/api/paquetes-vendidos/" + id);
    if (!d.success) {
      ct.innerHTML =
        '<p class="text-xs text-red-400">Error al cargar detalle</p>';
      return;
    }

    const pv = d.data;

    // Obtener citas del paquete
    let citasHtml =
      '<p class="text-xs text-[#9ca3af] py-2">Cargando citas...</p>';
    try {
      const cRes = await api.get('/api/citas/paquete-vendido/' + id);
      const citas = cRes.success ? cRes.data || [] : [];

      // Ordenar citas por fecha (más cercana primero)
      citas.sort((a, b) => new Date(a.fecha) - new Date(b.fecha));

      citasHtml = citas.length
        ? `
        <div class="space-y-2">
          <p class="text-xs font-semibold text-[#6b7280] uppercase tracking-wider mb-2">Citas del paquete</p>
          ${citas
            .map(
              (c) => `
            <div class="flex items-center justify-between px-3 py-2 bg-white rounded-xl border border-[#e8ecf1] text-sm">
              <div>
                <p class="font-medium text-[#2c3e50]">${c.tratamientonombre || "-"}</p>
                <p class="text-xs text-[#6b7280]">${formatDateShort(c.fecha)} ${formatTime(c.hora)}</p>
              </div>
              <span class="px-2 py-0.5 text-xs font-semibold rounded-full border ${sc(c.estado)}">${cap(c.estado)}</span>
            </div>
          `,
            )
            .join("")}
        </div>
      `
        : '<p class="text-xs text-[#9ca3af] py-2">Sin citas registradas para este paquete</p>';
    } catch (e2) {
      citasHtml = '<p class="text-xs text-red-300">Error al cargar citas</p>';
    }

    ct.innerHTML = `
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <h5 class="text-xs font-semibold text-[#6b7280] uppercase tracking-wider mb-2">
            <i class="fa-solid fa-circle-info text-menta mr-1"></i>Información
          </h5>
          <div class="space-y-1.5">
            <div class="flex justify-between text-sm px-3 py-2 bg-white rounded-xl border border-[#e8ecf1]">
              <span class="text-[#6b7280]">Paquete</span>
              <span class="font-medium">${pv.paquetenombre || "-"}</span>
            </div>
            <div class="flex justify-between text-sm px-3 py-2 bg-white rounded-xl border border-[#e8ecf1]">
              <span class="text-[#6b7280]">Cliente</span>
              <span class="font-medium">${pv.clientenombre || "-"}</span>
            </div>
            <div class="flex justify-between text-sm px-3 py-2 bg-white rounded-xl border border-[#e8ecf1]">
              <span class="text-[#6b7280]">Precio</span>
              <span class="font-bold text-menta">${$$(pv.precio || 0)}</span>
            </div>
            <div class="flex justify-between text-sm px-3 py-2 bg-white rounded-xl border border-[#e8ecf1]">
              <span class="text-[#6b7280]">Compra</span>
              <span class="font-medium">${formatDateShort(pv.fechacompra)}</span>
            </div>
            <div class="flex justify-between text-sm px-3 py-2 bg-white rounded-xl border border-[#e8ecf1]">
              <span class="text-[#6b7280]">Inicio</span>
              <span class="font-medium">${formatDateShort(pv.fechainicio)}</span>
            </div>
            <div class="flex justify-between text-sm px-3 py-2 bg-white rounded-xl border border-[#e8ecf1]">
              <span class="text-[#6b7280]">Fin</span>
              <span class="font-medium">${formatDateShort(pv.fechafin)}</span>
            </div>
          </div>
        </div>
        <div>
          ${citasHtml}
        </div>
      </div>
    `;
  } catch (e) {
    ct.innerHTML =
      '<p class="text-xs text-red-400">Error al cargar detalle</p>';
  }
}

function togglePaqVendidoPanel(id) {
  const panel = $(`paqVendPanel_${id}`);
  const chev = $(`paqVendChev_${id}`);

  if (_expandedPaqVendido === id) {
    _expandedPaqVendido = null;
    if (panel) panel.classList.add("hidden");
    if (chev) chev.classList.remove("rotate-180");
    return;
  }

  if (_expandedPaqVendido) {
    const oldPanel = $(`paqVendPanel_${_expandedPaqVendido}`);
    const oldChev = $(`paqVendChev_${_expandedPaqVendido}`);
    if (oldPanel) oldPanel.classList.add("hidden");
    if (oldChev) oldChev.classList.remove("rotate-180");
  }

  _expandedPaqVendido = id;
  if (panel) panel.classList.remove("hidden");
  if (chev) chev.classList.add("rotate-180");
  loadPaqVendidoDetalle(id);
}


function cancelarCita(id) {
  openConfirm(
    "Cancelar Cita",
    "¿Confirmas la cancelación de esta cita? Solo podrás reactivarla editándola.",
    async function () {
      try {
        const d = await api.put("/api/citas/" + id, { estado: "cancelada" });
        if (!d.success) return toast(d.error || "Error al cancelar", false);
        toast("Cita cancelada");
        SCREENS.citas();
      } catch (e) {
        toast(e.message || "Error de conexión", false);
      }
    },
    true,
  );
}


let _realizarMateriales = []; // working list of materials for this realization

async function realizarCita(idCita) {
  try {
    // Load cita details
    const citaRes = await api.get("/api/citas/" + idCita);
    if (!citaRes.success) {
      toast("Error al cargar la cita", false);
      return;
    }
    const cita = citaRes.data;

    // Get treatment materials from the database using the correct endpoint
    const tratMatRes = await api.get(
      "/api/tratamientos/" + cita.idtratamiento + "/materiales",
    );

    // Get all available materials (for adding new ones)
    const allMatRes = await api.get("/api/materiales");

    // Build working materials list - set cantidad to 0 initially
    _realizarMateriales = [];
    if (tratMatRes.success && tratMatRes.data && tratMatRes.data.length) {
      tratMatRes.data.forEach(function (m) {
        _realizarMateriales.push({
          idmaterial: m.idmaterial,
          // ✅ CORREGIDO: usar 'nombrematerial' en lugar de 'nombre'
          nombre: m.nombrematerial || m.nombre || "Material",
          cantidad: 0,
          cantidadPredeterminada: m.cantidad || 0,
          esPredeterminado: true,
        });
      });
    } else {
      toast("Este tratamiento no tiene materiales asignados", false);
    }

    const todosLosMat =
      allMatRes.success && allMatRes.data ? allMatRes.data : [];

    _renderRealizarModal(idCita, cita, todosLosMat);
  } catch (e) {
    console.error("Error al cargar materiales:", e);
    toast(e.message || "Error al cargar materiales", false);
  }
}

function _renderRealizarModal(idCita, cita, todosLosMat) {
  const matUsados = new Set(_realizarMateriales.map((m) => m.idmaterial));
  const matDisponibles = todosLosMat.filter(
    (m) => !matUsados.has(m.idmaterial),
  );

  const matListHtml = _realizarMateriales.length
    ? _realizarMateriales
        .map(function (m, i) {
          // Show default quantity in a small badge
          const defaultBadge = m.cantidadPredeterminada
            ? `<span class="text-xs text-gray-400 ml-1">(default: ${m.cantidadPredeterminada})</span>`
            : "";

          return (
            '<div class="flex items-center gap-3 p-3 bg-[#f8fafc] rounded-xl border border-[#e8ecf1] mb-2">' +
            '<div class="flex-1 min-w-0">' +
            '<p class="text-sm font-medium text-[#2c3e50] truncate">' +
            m.nombre +
            defaultBadge +
            "</p>" +
            (m.esPredeterminado
              ? '<span class="text-xs text-menta font-medium">Material del tratamiento</span>'
              : '<span class="text-xs text-[#9ca3af]">Agregado</span>') +
            "</div>" +
            '<div class="flex items-center gap-2 flex-shrink-0">' +
            '<label class="text-xs text-[#6b7280]">Cant.:</label>' +
            '<input type="number" min="0" step="0.01" value="' +
            m.cantidad +
            '" class="w-20 px-2 py-1.5 border border-[#d1d5db] rounded-lg text-sm text-center" onchange="window._realizarCantidad(' +
            i +
            ',this.value)">' +
            '<button onclick="window._realizarQuitarMat(' +
            i +
            ')" class="p-1.5 text-[#d1d5db] hover:text-red-400 transition-colors" title="Quitar"><i class="fa-solid fa-xmark"></i></button>' +
            "</div></div>"
          );
        })
        .join("")
    : '<p class="text-sm text-[#9ca3af] py-2 text-center">No hay materiales asignados a este tratamiento</p>';

  const addSelectHtml = matDisponibles.length
    ? '<select id="realizarAddSelect" class="flex-1 px-3 py-2 border border-[#d1d5db] rounded-xl text-sm">' +
      '<option value="">Seleccionar material a agregar...</option>' +
      matDisponibles
        .map(
          (m) =>
            '<option value="' + m.idmaterial + '">' + m.nombre + "</option>",
        )
        .join("") +
      "</select>" +
      '<button onclick="window._realizarAgregarMat(' +
      idCita +
      ')" class="px-3 py-2 bg-menta text-white rounded-xl text-sm font-medium hover:bg-menta-600 flex-shrink-0"><i class="fa-solid fa-plus mr-1"></i>Agregar</button>'
    : '<p class="text-xs text-[#9ca3af]">No hay más materiales disponibles</p>';

  const html =
    '<div class="p-6" style="max-width:600px">' +
    '<div class="flex items-center justify-between mb-5">' +
    '<div><h3 class="text-lg font-semibold text-[#2c3e50]"><i class="fa-solid fa-check-circle text-menta mr-2"></i>Realizar Cita</h3>' +
    '<p class="text-xs text-[#6b7280] mt-1">' +
    (cita.clientenombre || "") +
    " — " +
    (cita.tratamientonombre || "") +
    "</p></div>" +
    '<span class="px-2.5 py-0.5 text-xs font-semibold rounded-full border bg-amber-100 text-amber-700 border-amber-200">Pendiente</span>' +
    "</div>" +
    '<div class="mb-4">' +
    '<h4 class="text-sm font-semibold text-[#2c3e50] mb-2"><i class="fa-solid fa-box-open text-menta mr-1.5"></i>Materiales utilizados</h4>' +
    '<div class="text-xs text-[#6b7280] mb-2">Ingresa las cantidades utilizadas para cada material:</div>' +
    matListHtml +
    "</div>" +
    '<div class="border-t border-[#e8ecf1] pt-4 mb-4">' +
    '<h4 class="text-sm font-semibold text-[#2c3e50] mb-2"><i class="fa-solid fa-plus text-mentaverde-500 mr-1.5"></i>Agregar material extra</h4>' +
    '<div class="flex gap-2 items-center">' +
    addSelectHtml +
    "</div>" +
    "</div>" +
    '<div class="flex gap-2 mt-6">' +
    '<button onclick="closeModal()" class="flex-1 px-4 py-2.5 bg-gray-100 text-[#6b7280] rounded-xl text-sm font-medium hover:bg-gray-200">Cancelar</button>' +
    '<button onclick="window._confirmarRealizarCita(' +
    idCita +
    ')" class="flex-1 px-4 py-2.5 bg-menta text-white rounded-xl text-sm font-medium shadow-sm hover:bg-menta-600 flex items-center justify-center gap-2"><i class="fa-solid fa-check"></i>Confirmar Realizada</button>' +
    "</div></div>";

  openModal(html);

  // Store data for later use
  window._todosLosMat = todosLosMat;
  window._realizarCitaId = idCita;
  window._realizarCitaData = cita;
}

// Update quantity for a material in the working list
window._realizarCantidad = function (idx, val) {
  if (_realizarMateriales[idx])
    _realizarMateriales[idx].cantidad = parseFloat(val) || 0;
};

// Remove a material from working list and re-render
window._realizarQuitarMat = function (idx) {
  _realizarMateriales.splice(idx, 1);
  _renderRealizarModal(
    window._realizarCitaId,
    window._realizarCitaData,
    window._todosLosMat,
  );
};

// Add a material from the dropdown
window._realizarAgregarMat = function (idCita) {
  const sel = document.getElementById("realizarAddSelect");
  if (!sel || !sel.value) {
    toast("Selecciona un material", false);
    return;
  }
  const idm = parseInt(sel.value);
  const mat = window._todosLosMat.find(function (m) {
    return m.idmaterial === idm;
  });
  if (!mat) return;

  _realizarMateriales.push({
    idmaterial: mat.idmaterial,
    nombre: mat.nombre,
    cantidad: 0, // Start with 0
    cantidadPredeterminada: 0,
    esPredeterminado: false,
  });
  _renderRealizarModal(
    window._realizarCitaId,
    window._realizarCitaData,
    window._todosLosMat,
  );
};

// Confirm: assign materials to cita and mark as realizada
// Confirm: assign materials to cita and mark as realizada
window._confirmarRealizarCita = async function (idCita) {
  console.log("=== INICIANDO CONFIRMACIÓN ===");
  console.log("ID Cita:", idCita);

  const citaId = Number(idCita);

  const hasMaterialsWithQuantity = _realizarMateriales.some(
    (m) => m.cantidad > 0,
  );

  if (!hasMaterialsWithQuantity) {
    const userConfirmed = confirm(
      "⚠️ No has registrado ningún material.\n¿Deseas continuar?",
    );
    if (!userConfirmed) return;
  }

  try {
    const btn = document.querySelector(
      'button[onclick*="_confirmarRealizarCita"]',
    );
    if (btn) {
      btn.disabled = true;
      btn.innerHTML =
        '<i class="fa-solid fa-spinner fa-spin mr-1"></i>Guardando...';
    }

    // PASO 1: Marcar cita como realizada
    console.log("Paso 1: Actualizando estado de la cita...");
    const updateRes = await api.put(`/api/citas/${citaId}`, {
      estado: "realizada",
    });

    if (!updateRes.success) {
      toast(updateRes.error || "Error al actualizar cita", false);
      if (btn) btn.disabled = false;
      return;
    }
    console.log("✅ Cita actualizada a realizada");

    // Esperar un momento
    await new Promise((resolve) => setTimeout(resolve, 200));

    // PASO 2: Insertar materiales con el campo correcto: 'cantidadutilizada'
    let assignedCount = 0;
    for (const m of _realizarMateriales) {
      if (m.cantidad > 0) {
        try {
          console.log(
            `Registrando material: ${m.nombre}, cantidad: ${m.cantidad}`,
          );

          // ✅ CAMBIO IMPORTANTE: usar 'cantidadutilizada' en lugar de 'cantidad'
          const matRes = await api.post(
            `/api/citas/${citaId}/materiales/${m.idmaterial}`,
            {
              cantidadutilizada: m.cantidad,
            },
          );

          if (matRes.success) {
            assignedCount++;
            console.log(`✅ ${m.nombre} registrado`);
          } else {
            console.error(`Error con ${m.nombre}:`, matRes.error);
            toast(`Error: ${matRes.error}`, false);
          }
        } catch (e) {
          console.error(`Excepción con ${m.nombre}:`, e);
          toast(`Error al registrar ${m.nombre}: ${e.message}`, false);
        }
      }
    }

    toast(`✅ Cita realizada. ${assignedCount} material(es) registrado(s).`);
    closeModal();
    SCREENS.citas();
  } catch (e) {
    console.error("Error general:", e);
    toast(e.message || "Error de conexión", false);
    const btn = document.querySelector(
      'button[onclick*="_confirmarRealizarCita"]',
    );
    if (btn) {
      btn.disabled = false;
      btn.innerHTML = '<i class="fa-solid fa-check"></i>Confirmar Realizada';
    }
  }
};
SCREENS.inicio = async () => {
  const ct = $("pageContent");
  ct.innerHTML = showLoading();
  try {
    const d = await api.get("/api/citas");
    if (!d.success) {
      ct.innerHTML = showEmpty(
        "fa-solid fa-calendar-xmark",
        "Sin datos",
        "No se pudieron cargar las citas.",
      );
      return;
    }
    const hoy = dayjs().format("YYYY-MM-DD"),
      hoyCitas = d.data.filter(
        (c) => dayjs(c.fecha).format("YYYY-MM-DD") === hoy,
      ),
      pendientes = hoyCitas.filter((c) => c.estado === "pendiente"),
      realizadasHoy = hoyCitas.filter((c) => c.estado === "realizada");
    const ventasHoy = realizadasHoy.reduce(
      (s, c) => s + Number(c.precio || c.costo || 0),
      0,
    );
    const frases = [
      '"El cuidado personal es la forma más profunda de amor propio." —',
      '"Donde la calma y la belleza se encuentran." —',
      '"Cada día es una oportunidad para renovarte." —',
      '"Tu bienestar es nuestra inspiración." —',
    ];
    const frase = frases[dayjs().day() % frases.length];
    ct.innerHTML =
      '<div class="fade-in"><div class="bg-gradient-to-br from-menta via-menta-600 to-menta-700 rounded-2xl p-6 md:p-8 mb-6 relative overflow-hidden shadow-md"><div class="absolute inset-0 pointer-events-none"><div class="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-2xl"></div><div class="absolute -bottom-8 -left-8 w-48 h-48 bg-white/5 rounded-full blur-3xl"></div><div class="absolute top-1/2 left-1/4 w-32 h-32 bg-spa-300/10 rounded-full blur-xl"></div></div><div class="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4"><div><div class="flex items-center gap-3 mb-2"><div class="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center"><i class="fa-solid fa-spa text-white text-lg"></i></div><h2 class="text-white font-semibold text-lg">Bienvenido/a, ' +
      (user?.username || "Usuario") +
      '</h2></div><p class="text-white/80 text-sm">Hoy es ' +
      today() +
      '</p></div><div class="flex gap-3"><div class="bg-white/15 backdrop-blur-sm rounded-xl px-4 py-2.5 text-center"><p class="text-xs text-white/70">Citas Hoy</p><p class="text-xl font-bold text-white">' +
      hoyCitas.length +
      '</p></div><div class="bg-white/15 backdrop-blur-sm rounded-xl px-4 py-2.5 text-center"><p class="text-xs text-white/70">Ventas Hoy</p><p class="text-xl font-bold text-white">' +
      $$(ventasHoy) +
      '</p></div></div></div></div><div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6"><div class="bg-white rounded-2xl p-5 border border-[#e8ecf1] shadow-sm card-hover"><div class="flex items-center gap-3"><div class="w-10 h-10 rounded-xl bg-menta-50 flex items-center justify-center"><i class="fa-solid fa-calendar-day text-menta"></i></div><div><p class="text-xs text-[#6b7280]">Citas Hoy</p><p class="text-2xl font-bold text-[#2c3e50]">' +
      hoyCitas.length +
      '</p></div></div></div><div class="bg-white rounded-2xl p-5 border border-[#e8ecf1] shadow-sm card-hover"><div class="flex items-center gap-3"><div class="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center"><i class="fa-solid fa-hourglass-half text-amber-500"></i></div><div><p class="text-xs text-[#6b7280]">Pendientes</p><p class="text-2xl font-bold text-[#2c3e50]">' +
      pendientes.length +
      '</p></div></div></div><div class="bg-white rounded-2xl p-5 border border-[#e8ecf1] shadow-sm card-hover"><div class="flex items-center gap-3"><div class="w-10 h-10 rounded-xl bg-lavender-100 flex items-center justify-center"><i class="fa-solid fa-spa text-spa"></i></div><div><p class="text-xs text-[#6b7280]">Hoy</p><p class="text-lg font-semibold text-[#2c3e50]">' +
      today() +
      '</p></div></div></div></div><div class="grid grid-cols-1 lg:grid-cols-3 gap-5"><div class="lg:col-span-2 bg-white rounded-2xl border border-[#e8ecf1] shadow-sm overflow-hidden"><div class="px-5 py-4 border-b border-[#e8ecf1] flex items-center justify-between"><h3 class="font-semibold text-[#2c3e50]"><i class="fa-solid fa-clock text-menta mr-2"></i>Citas de Hoy</h3><span class="px-2.5 py-0.5 bg-menta-50 text-menta-700 text-xs font-semibold rounded-full">' +
      hoyCitas.length +
      "</span></div>" +
      (hoyCitas.length
        ? renderTable(
            [
              { label: "Hora", render: (c) => formatTime(c.hora) },
              { label: "Cliente", render: (c) => c.clientenombre || "-" },
              {
                label: "Tratamiento",
                render: (c) => c.tratamientonombre || "-",
              },
              {
                label: "Estado",
                render: (c) =>
                  '<span class="px-2.5 py-0.5 text-xs font-semibold rounded-full border ' +
                  sc(c.estado) +
                  '">' +
                  cap(c.estado) +
                  "</span>",
              },
            ],
            hoyCitas,
          )
        : '<div class="p-12 flex flex-col items-center gap-2 text-[#9ca3af]"><i class="fa-solid fa-calendar-check text-3xl"></i><p class="text-sm font-medium">¡Sin citas hoy!</p><p class="text-xs">Un día libre para ti y tu equipo.</p></div>') +
      '</div><div class="bg-white rounded-2xl border border-[#e8ecf1] shadow-sm p-5"><div class="flex items-center gap-3 mb-3"><div class="w-10 h-10 rounded-xl bg-lavender-100 flex items-center justify-center"><i class="fa-solid fa-leaf text-menta"></i></div><h3 class="font-semibold text-[#2c3e50] text-sm">Ambiente del Día</h3></div><p class="text-sm text-[#6b7280] italic leading-relaxed">' +
      frase +
      '</p><p class="text-xs text-[#9ca3af] mt-2">Un espacio de calma y bienestar.</p><div class="flex gap-2 mt-4"><span class="w-2 h-2 rounded-full bg-menta"></span><span class="w-2 h-2 rounded-full bg-spa-300"></span><span class="w-2 h-2 rounded-full bg-blush"></span><span class="w-2 h-2 rounded-full bg-turquesa"></span></div></div></div></div>';
  } catch (e) {
    ct.innerHTML = showEmpty(
      "fa-solid fa-circle-exclamation",
      "Error",
      "Ocurrió un error al cargar el resumen.",
      "Reintentar",
      "navigate('inicio')",
    );
  }
};
async function guardarVentaPaqueteCompleto() {
  try {
    const idcliente = $("vtaClienteId").value;
    const idpaquete = $("vtaPaqueteId").value;
    const precioPaquete = $("vtaPaquetePrecio").value;

    if (!idcliente) {
      toast("Selecciona un cliente", false);
      return;
    }

    // Obtener todas las citas del formulario
    const fechas = document.querySelectorAll(".citaFecha");
    const horas = document.querySelectorAll(".citaHora");
    const empleados = document.querySelectorAll(".citaEmpleado");

    const citas = [];
    let errores = false;
    let fechaInicio = null;
    let fechaFin = null;

    for (let i = 0; i < fechas.length; i++) {
      const fecha = fechas[i].value;
      const hora = horas[i].value;
      const idempleado = empleados[i].value;
      const idtratamiento = fechas[i].dataset.trat;

      if (!fecha) {
        toast(`La fecha del tratamiento ${i + 1} es obligatoria`, false);
        errores = true;
        break;
      }
      if (!hora) {
        toast(`La hora del tratamiento ${i + 1} es obligatoria`, false);
        errores = true;
        break;
      }
      if (!idempleado) {
        toast(`El empleado del tratamiento ${i + 1} es obligatorio`, false);
        errores = true;
        break;
      }

      // Calcular fecha de inicio y fin
      if (fechaInicio === null || fecha < fechaInicio) fechaInicio = fecha;
      if (fechaFin === null || fecha > fechaFin) fechaFin = fecha;

      citas.push({
        idcliente: Number(idcliente),
        idtratamiento: Number(idtratamiento),
        fecha,
        hora,
        idempleado: Number(idempleado),
        observaciones: `Cita incluida en paquete`,
        estado: "pendiente",
        precio: 0, // ✅ ENVIAR PRECIO 0 (el trigger lo respetará o lo cambiará)
      });
    }

    if (errores) return;

    // Mostrar loading en el botón
    const btn = document.querySelector(
      'button[onclick*="guardarVentaPaqueteCompleto"]',
    );
    const originalText = btn?.innerHTML;
    if (btn) {
      btn.disabled = true;
      btn.innerHTML =
        '<i class="fa-solid fa-spinner fa-spin mr-1"></i>Guardando...';
    }

    // 1. PRIMERO registrar todas las citas (con precio 0)
    let citasGuardadas = [];
    let errorEnCitas = false;

    for (const cita of citas) {
      try {
        console.log("Creando cita:", cita); // Para depurar
        const citaRes = await api.post("/api/citas", cita);

        if (citaRes.success) {
          citasGuardadas.push({
            ...cita,
            idcita: citaRes.data.idcita,
          });
          console.log(
            `✅ Cita ${cita.idtratamiento} creada con ID: ${citaRes.data.idcita}`,
          );
        } else {
          console.error("Error al guardar cita:", citaRes.error);
          toast(`Error al agendar cita: ${citaRes.error}`, false);
          errorEnCitas = true;
          break;
        }
      } catch (e) {
        console.error("Error:", e);
        toast(`Error al agendar cita: ${e.message}`, false);
        errorEnCitas = true;
        break;
      }
    }

    if (errorEnCitas) {
      if (btn) {
        btn.disabled = false;
        btn.innerHTML = originalText;
      }
      return;
    }

    // 2. Registrar el paquete vendido con las fechas calculadas
    const hoy = todayStr();
    console.log("Registrando paquete vendido:", {
      idpaquete: Number(idpaquete),
      idcliente: Number(idcliente),
      precio: Number(precioPaquete),
      fechacompra: hoy,
      fechainicio: fechaInicio,
      fechafin: fechaFin,
    });

    const paqueteRes = await api.post("/api/paquetes-vendidos", {
      idpaquete: Number(idpaquete),
      idcliente: Number(idcliente),
      precio: Number(precioPaquete),
      fechacompra: hoy,
      fechainicio: fechaInicio,
      fechafin: fechaFin,
    });

    if (!paqueteRes.success) {
      toast(
        paqueteRes.error ||
          "Error al registrar el paquete, pero las citas se crearon",
        false,
      );
      if (btn) {
        btn.disabled = false;
        btn.innerHTML = originalText;
      }
      SCREENS.citas();
      return;
    }

    const idPaqueteVendido = paqueteRes.data.idpaquetevendido;
    console.log(`✅ Paquete vendido creado con ID: ${idPaqueteVendido}`);

    // 3. ACTUALIZAR las citas con el idpaquetevendido
    let citasActualizadas = 0;
    for (const cita of citasGuardadas) {
      try {
        await api.put(`/api/citas/${cita.idcita}`, {
          idpaquetevendido: idPaqueteVendido,
        });
        citasActualizadas++;
        console.log(`✅ Cita ${cita.idcita} actualizada con paquete vendido`);
      } catch (e) {
        console.error("Error al actualizar cita:", e);
      }
    }

    toast(
      `✅ Paquete vendido y ${citasActualizadas} citas agendadas correctamente`,
    );
    closeModal();
    SCREENS.citas();

    if (btn) {
      btn.disabled = false;
      btn.innerHTML = originalText;
    }
  } catch (e) {
    console.error("Error general:", e);
    toast(e.message || "Error al guardar", false);
    const btn = document.querySelector(
      'button[onclick*="guardarVentaPaqueteCompleto"]',
    );
    if (btn) {
      btn.disabled = false;
      btn.innerHTML = "Registrar Venta y Citas";
    }
  }
}

// Reportes — dependiente y admin comparten el mismo render
async function _renderReporteScreen(ct) {
  ct.innerHTML = showLoading("Generando reportes...");
  try {
    const hoy = todayStr();
    const [hoyRes, topRes] = await Promise.all([
      api.get("/api/citas/fecha?fecha=" + hoy),
      api.get("/api/reportes/top-tratamientos"),
    ]);
    const hoyCitas = hoyRes.success ? hoyRes.data || [] : [];
    const realizadas = hoyCitas.filter((c) => c.estado === "realizada");
    const pendientes = hoyCitas.filter((c) => c.estado === "pendiente");
    const canceladas = hoyCitas.filter((c) => c.estado === "cancelada");
    const ventasHoy = realizadas.reduce((s, c) => s + Number(c.precio || 0), 0);
    const inicioSem = dayjs().startOf("week").format("YYYY-MM-DD"),
      finSem = dayjs().endOf("week").format("YYYY-MM-DD");
    let semData = { data: [] };
    try {
      semData = await api.get(
        "/api/citas/intervalo/fechas?fecha1=" + inicioSem + "&fecha2=" + finSem,
      );
    } catch (e) {}
    const semReal = (semData.data || []).filter(
      (c) => c.estado === "realizada",
    );
    const ventasSem = semReal.reduce((s, c) => s + Number(c.precio || 0), 0);
    const topData = topRes.success ? topRes.data || [] : [];
    const topColors = [
      "bg-amber-100 text-amber-600",
      "bg-gray-100 text-gray-500",
      "bg-orange-50 text-orange-400",
    ];
    const topHtml = topData.length
      ? topData
          .map(
            (t, i) =>
              '<div class="flex items-center gap-3 p-3 bg-[#f8fafc] rounded-xl border border-[#e8ecf1]"><div class="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ' +
              topColors[i] +
              '">' +
              (i + 1) +
              '</div><div class="flex-1 min-w-0"><p class="text-sm font-medium text-[#2c3e50] truncate">' +
              (t.tratamientonombre || t.nombre || "-") +
              "</p>" +
              '<p class="text-xs text-[#6b7280]">' +
              (t.solicitudes || 0) +
              " citas</p></div></div>",
          )
          .join("")
      : '<p class="text-sm text-[#9ca3af] py-3 text-center">Sin datos disponibles</p>';
    ct.innerHTML =
      '<div class="fade-in"><div class="flex items-center justify-between mb-5"><h3 class="text-lg font-semibold text-[#2c3e50]"><i class="fa-solid fa-chart-bar text-menta mr-2"></i>Reportes</h3></div><div class="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6"><div class="bg-white rounded-2xl border border-[#e8ecf1] shadow-sm p-5"><div class="flex items-center gap-3 mb-2"><div class="w-9 h-9 rounded-xl bg-lavender-100 flex items-center justify-center"><i class="fa-solid fa-calendar-check text-spa text-sm"></i></div><p class="text-xs text-[#6b7280]">Citas Hoy</p></div><p class="text-3xl font-bold text-[#2c3e50]">' +
      hoyCitas.length +
      '</p><p class="text-xs text-[#6b7280] mt-1">' +
      pendientes.length +
      ' pendientes</p></div><div class="bg-white rounded-2xl border border-[#e8ecf1] shadow-sm p-5"><div class="flex items-center gap-3 mb-2"><div class="w-9 h-9 rounded-xl bg-menta-50 flex items-center justify-center"><i class="fa-solid fa-coins text-menta text-sm"></i></div><p class="text-xs text-[#6b7280]">Ventas Hoy</p></div><p class="text-3xl font-bold text-menta">' +
      $$(ventasHoy) +
      '</p><p class="text-xs text-[#6b7280] mt-1">' +
      realizadas.length +
      ' realizadas</p></div><div class="bg-white rounded-2xl border border-[#e8ecf1] shadow-sm p-5"><div class="flex items-center gap-3 mb-2"><div class="w-9 h-9 rounded-xl bg-amber-50 flex items-center justify-center"><i class="fa-solid fa-calendar-week text-amber-500 text-sm"></i></div><p class="text-xs text-[#6b7280]">Ventas Semana</p></div><p class="text-3xl font-bold text-[#2c3e50]">' +
      $$(ventasSem) +
      '</p><p class="text-xs text-[#6b7280] mt-1">' +
      semReal.length +
      ' realizadas</p></div><div class="bg-white rounded-2xl border border-[#e8ecf1] shadow-sm p-5"><div class="flex items-center gap-3 mb-2"><div class="w-9 h-9 rounded-xl bg-red-50 flex items-center justify-center"><i class="fa-solid fa-ban text-red-400 text-sm"></i></div><p class="text-xs text-[#6b7280]">Canceladas Hoy</p></div><p class="text-3xl font-bold text-red-400">' +
      canceladas.length +
      '</p><p class="text-xs text-[#6b7280] mt-1">citas canceladas</p></div></div><div class="grid grid-cols-1 lg:grid-cols-2 gap-5"><div class="bg-white rounded-2xl border border-[#e8ecf1] shadow-sm p-5"><h4 class="font-semibold text-[#2c3e50] mb-3 flex items-center gap-2"><i class="fa-solid fa-trophy text-amber-500 text-sm"></i>Top 3 Tratamientos</h4><div class="space-y-2">' +
      topHtml +
      '</div></div><div class="bg-white rounded-2xl border border-[#e8ecf1] shadow-sm p-5"><h4 class="font-semibold text-[#2c3e50] mb-3 flex items-center gap-2"><i class="fa-solid fa-user-clock text-menta text-sm"></i>Historial de Cliente</h4><div class="space-y-2"><div class="relative"><input type="text" id="rptClienteInput" autocomplete="off" placeholder="Buscar cliente..." class="w-full px-4 py-2.5 border border-[#d1d5db] rounded-xl text-sm" oninput="debounce(rptAutocomplete,300)()"><input type="hidden" id="rptClienteId"><div id="rptClienteAC" class="absolute z-50 w-full bg-white border border-[#e8ecf1] rounded-xl shadow-lg mt-1 max-h-40 overflow-y-auto hidden"></div></div><div class="flex gap-2"><input type="date" id="rptFechaDesde" class="flex-1 px-3 py-2 border border-[#d1d5db] rounded-xl text-sm"><input type="date" id="rptFechaHasta" class="flex-1 px-3 py-2 border border-[#d1d5db] rounded-xl text-sm"></div><div class="flex gap-2"><button onclick="rptEmpleadosPorCliente()" class="flex-1 px-3 py-2 bg-lavender-100 text-spa text-xs font-medium rounded-xl hover:bg-lavender-200">Ver empleados</button><button onclick="rptServiciosCliente()" class="flex-1 px-3 py-2 bg-menta-50 text-menta text-xs font-medium rounded-xl hover:bg-menta-100">Ver servicios por fechas</button></div><div id="rptClienteResultado" class="text-xs text-[#9ca3af] text-center py-2">Selecciona un cliente</div></div></div></div></div>';
  } catch (e) {
    ct.innerHTML = showEmpty(
      "fa-solid fa-circle-exclamation",
      "Error",
      "Ocurrió un error al cargar reportes.",
      "Reintentar",
      "navigate('reportes')",
    );
  }
}
async function rptAutocomplete() {
  const q = $("rptClienteInput")?.value;
  if (!q || q.length < 2) {
    $("rptClienteAC")?.classList.add("hidden");
    return;
  }
  try {
    const d = await api.get("/api/clientes?q=" + encodeURIComponent(q));
    if (!d.success) return;
    const ac = $("rptClienteAC");
    if (!ac) return;
    let html = '<div class="p-2 space-y-1">';
    if (d.data.length) {
      html += d.data
        .map(
          (c) =>
            '<div class="px-3 py-2 hover:bg-menta-50 rounded-lg cursor-pointer text-sm text-[#2c3e50] flex items-center justify-between" onclick="rptSelCliente(' +
            c.idcliente +
            ",'" +
            c.nombre.replace(/'/g, "\\'") +
            "')\"><span>" +
            c.nombre +
            '</span><span class="text-xs text-[#6b7280]">' +
            (c.telefono || "") +
            "</span></div>",
        )
        .join("");
    } else {
      html +=
        '<div class="px-3 py-2 text-sm text-[#9ca3af]">Sin resultados</div>';
    }
    html += "</div>";
    ac.innerHTML = html;
    ac.classList.remove("hidden");
  } catch (e) {}
}
function rptSelCliente(id, nombre) {
  const hi = $("rptClienteId");
  const inp = $("rptClienteInput");
  const ac = $("rptClienteAC");
  if (hi) hi.value = id;
  if (inp) inp.value = nombre;
  if (ac) ac.classList.add("hidden");
}
async function rptEmpleadosPorCliente() {
  const idcliente = $("rptClienteId")?.value;
  if (!idcliente) return toast("Selecciona un cliente primero", false);
  const res = $("rptClienteResultado");
  if (!res) return;
  res.innerHTML =
    '<div class="flex justify-center py-3"><div class="w-5 h-5 border-2 border-[#e8ecf1] border-t-menta rounded-full spin"></div></div>';
  try {
    const d = await api.get("/api/reportes/empleados-por-cliente/" + idcliente);
    if (!d.success) {
      res.innerHTML =
        '<p class="text-xs text-red-400 text-center py-2">' +
        (d.error || "Error") +
        "</p>";
      return;
    }
    const emps = d.data || [];
    res.innerHTML = emps.length
      ? '<div class="mt-1"><p class="text-xs font-semibold text-[#6b7280] mb-1.5">Empleados que atendieron a este cliente:</p><div class="space-y-1">' +
        emps
          .map(
            (e) =>
              '<div class="flex items-center gap-2 px-3 py-2 bg-[#f8fafc] rounded-lg border border-[#e8ecf1]"><div class="w-6 h-6 rounded-full bg-menta-50 flex items-center justify-center"><i class="fa-solid fa-user-tie text-menta text-xs"></i></div><span class="text-xs font-medium text-[#2c3e50]">' +
              (e.nombre || "-") +
              '</span><span class="ml-auto text-xs text-[#6b7280]">' +
              (e.totalcitas || e.citas || "") +
              " cita(s)</span></div>",
          )
          .join("") +
        "</div></div>"
      : '<p class="text-xs text-[#9ca3af] text-center py-2">No hay empleados registrados para este cliente</p>';
  } catch (e) {
    res.innerHTML =
      '<p class="text-xs text-red-400 text-center py-2">Error: ' +
      (e.message || "") +
      "</p>";
  }
}
async function rptServiciosCliente() {
  const idcliente = $("rptClienteId")?.value;
  if (!idcliente) return toast("Selecciona un cliente primero", false);
  const desde = $("rptFechaDesde")?.value;
  const hasta = $("rptFechaHasta")?.value;
  if (!desde || !hasta)
    return toast("Selecciona las fechas de inicio y fin", false);
  const res = $("rptClienteResultado");
  if (!res) return;
  res.innerHTML =
    '<div class="flex justify-center py-3"><div class="w-5 h-5 border-2 border-[#e8ecf1] border-t-menta rounded-full spin"></div></div>';
  try {
    const d = await api.get(
      "/api/reportes/servicios-cliente/" +
        idcliente +
        "?fechaInicio=" +
        desde +
        "&fechaFin=" +
        hasta,
    );
    if (!d.success) {
      res.innerHTML =
        '<p class="text-xs text-red-400 text-center py-2">' +
        (d.error || "Error") +
        "</p>";
      return;
    }
    const svcs = d.data || [];
    res.innerHTML = svcs.length
      ? '<div class="mt-1"><p class="text-xs font-semibold text-[#6b7280] mb-1.5">Servicios de ' +
        formatDateShort(desde) +
        " a " +
        formatDateShort(hasta) +
        ':</p><div class="space-y-1">' +
        svcs
          .map(
            (s) =>
              '<div class="flex items-center justify-between px-3 py-2 bg-[#f8fafc] rounded-lg border border-[#e8ecf1]"><div><p class="text-xs font-medium text-[#2c3e50]">' +
              (s.nombre_servicio || "-") +
              '</p><p class="text-xs text-[#6b7280]">' +
              formatDateShort(s.fecha_servicio) +
              '</p></div><span class="text-xs font-semibold text-menta">' +
              (s.tipo_servicio || "") +
              "</span></div>",
          )
          .join("") +
        "</div></div>"
      : '<p class="text-xs text-[#9ca3af] text-center py-2">Sin servicios en el intervalo seleccionado</p>';
  } catch (e) {
    res.innerHTML =
      '<p class="text-xs text-red-400 text-center py-2">Error: ' +
      (e.message || "") +
      "</p>";
  }
}
SCREENS.reportes = async () => _renderReporteScreen($("pageContent"));
// Dependiente: Mapa y Contactos
SCREENS.mapa = async () => {
  const ct = $("pageContent");
  ct.innerHTML = showLoading();
  try {
    const redesHtml = ["instagram", "facebook", "whatsapp"]
      .map(
        (s) =>
          '<div class="w-10 h-10 rounded-xl bg-lavender-100 flex items-center justify-center text-spa hover:bg-menta-50 hover:text-menta transition-all cursor-pointer"><i class="fa-brands fa-' +
          s +
          '"></i></div>',
      )
      .join("");
    let distritosHtml = "";
    try {
      const d = await api.get("/api/distritos");
      if (d.success && d.data && d.data.length) {
        distritosHtml = d.data
          .filter((di) => di.nombre)
          .slice(0, 4)
          .map(
            (di) =>
              '<div class="flex items-center gap-2 px-3 py-2 bg-[#f8fafc] rounded-xl border border-[#e8ecf1]"><i class="fa-solid fa-circle text-[6px] text-menta"></i><span class="text-sm text-[#2c3e50]">' +
              di.nombre +
              '</span><span class="text-xs text-[#6b7280] ml-auto">' +
              (di.empleados || 0) +
              " emp.</span></div>",
          )
          .join("");
      }
    } catch (e2) {}
    ct.innerHTML =
      '<div class="fade-in"><div class="flex items-center justify-between mb-5"><h3 class="text-lg font-semibold text-[#2c3e50]"><i class="fa-solid fa-map-location-dot text-menta mr-2"></i>Mapa y Contactos</h3></div><div class="grid grid-cols-1 lg:grid-cols-5 gap-5"><div class="lg:col-span-3 bg-white rounded-2xl border border-[#e8ecf1] shadow-sm overflow-hidden"><div class="bg-gradient-to-br from-menta-50 to-lavender-100 h-48 lg:h-64 flex items-center justify-center relative"><div class="absolute inset-0 opacity-10"><svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" class="w-full h-full"><path fill="#2ecc71" d="M44.7,-76.4C58.8,-69.2,71.8,-59.1,79.6,-45.8C87.4,-32.5,90,-16.2,88.6,-0.7C87.2,14.9,81.8,29.8,73.1,42.8C64.4,55.8,52.5,66.9,39,74.5C25.5,82.1,10.5,86.2,-3.8,83.5C-18.1,80.8,-31.6,71.3,-43.7,60.2C-55.9,49.1,-66.7,36.4,-73.1,21.5C-79.5,6.6,-81.5,-10.5,-76.1,-24.8C-70.8,-39.1,-58,-50.6,-44.1,-57.8C-30.2,-65.1,-15.1,-68.1,-0.2,-67.8C14.7,-67.5,30.6,-63.6,44.7,-76.4Z" transform="translate(100 100)" /></svg></div><div class="text-center relative z-10"><div class="w-16 h-16 mx-auto mb-3 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center shadow-sm"><i class="fa-solid fa-location-dot text-red-400 text-xl"></i></div><p class="font-semibold text-[#2c3e50]">Av. Principal 123, Santiago</p><p class="text-sm text-[#6b7280]">SPA Belleza & Relax</p></div></div>' +
      (distritosHtml
        ? '<div class="p-5 grid grid-cols-1 sm:grid-cols-2 gap-3">' +
          distritosHtml +
          "</div>"
        : "") +
      '</div><div class="lg:col-span-2 space-y-4"><div class="bg-white rounded-2xl border border-[#e8ecf1] shadow-sm p-5"><h4 class="font-semibold text-[#2c3e50] mb-4 flex items-center gap-2"><i class="fa-solid fa-address-card text-menta"></i>Contacto</h4><div class="space-y-3 text-sm"><div class="flex items-center gap-3"><div class="w-8 h-8 rounded-lg bg-menta-50 flex items-center justify-center flex-shrink-0"><i class="fa-solid fa-location-dot text-menta text-xs"></i></div><div><p class="font-medium text-[#2c3e50]">Dirección</p><p class="text-[#6b7280] text-xs">Av. Principal 123, Santiago, Chile</p></div></div><div class="flex items-center gap-3"><div class="w-8 h-8 rounded-lg bg-menta-50 flex items-center justify-center flex-shrink-0"><i class="fa-solid fa-phone text-menta text-xs"></i></div><div><p class="font-medium text-[#2c3e50]">Teléfono</p><p class="text-[#6b7280] text-xs">+56 2 1234 5678</p></div></div><div class="flex items-center gap-3"><div class="w-8 h-8 rounded-lg bg-menta-50 flex items-center justify-center flex-shrink-0"><i class="fa-solid fa-envelope text-menta text-xs"></i></div><div><p class="font-medium text-[#2c3e50]">Email</p><p class="text-[#6b7280] text-xs">spa@bellezarelax.com</p></div></div><div class="flex items-center gap-3"><div class="w-8 h-8 rounded-lg bg-menta-50 flex items-center justify-center flex-shrink-0"><i class="fa-solid fa-clock text-menta text-xs"></i></div><div><p class="font-medium text-[#2c3e50]">Horario</p><p class="text-[#6b7280] text-xs">Lun – Sáb: 9:00 – 18:00</p></div></div></div></div><div class="bg-white rounded-2xl border border-[#e8ecf1] shadow-sm p-5"><h4 class="font-semibold text-[#2c3e50] mb-4 flex items-center gap-2"><i class="fa-solid fa-hashtag text-menta"></i>Redes Sociales</h4><div class="flex gap-3">' +
      redesHtml +
      "</div></div></div></div></div>";
  } catch (e) {
    ct.innerHTML = showEmpty(
      "fa-solid fa-circle-exclamation",
      "Error",
      "Ocurrió un error.",
      "Reintentar",
      "navigate('mapa')",
    );
  }
};
