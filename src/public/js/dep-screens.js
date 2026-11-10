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
function actualizarPrecioMostrado() {
  const sel = document.getElementById("citaTratamiento");
  if (!sel) {
    console.log("No se encontró el select citaTratamiento");
    return;
  }

  const selectedOption = sel.options[sel.selectedIndex];
  if (!selectedOption) {
    console.log("No hay opción seleccionada");
    return;
  }

  const precio = selectedOption.getAttribute("data-precio");
  console.log("Precio obtenido:", precio);

  const precioSpan = document.getElementById("precioMostrado");
  if (precioSpan && precio) {
    precioSpan.textContent = $$(Number(precio));
  } else if (precioSpan) {
    precioSpan.textContent = "$0.00";
  }
}
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
             <select class="citaHora w-full px-3 py-2 border border-[#d1d5db] rounded-lg text-sm" 
        data-trat="${trat.idtratamiento}" data-index="${i}">
  <option value="09:00">09:00</option>
  <option value="09:30">09:30</option>
  <option value="10:00" selected>10:00</option>
  <option value="10:30">10:30</option>
  <option value="11:00">11:00</option>
  <option value="11:30">11:30</option>
  <option value="12:00">12:00</option>
  <option value="12:30">12:30</option>
  <option value="13:00">13:00</option>
  <option value="13:30">13:30</option>
  <option value="14:00">14:00</option>
  <option value="14:30">14:30</option>
 
</select>
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
async function crearClienteRapido(origen) {
  openSubModal(
    '<div class="p-6" style="max-width:420px"><div class="flex items-center justify-between mb-5"><h3 class="text-lg font-semibold text-[#2c3e50]"><i class="fa-solid fa-user-plus text-menta mr-2"></i>Nuevo Cliente</h3><button onclick="closeSubModal()" class="text-[#9ca3af] hover:text-[#6b7280] text-xl"><i class="fa-solid fa-xmark"></i></button></div><div class="space-y-3.5"><div><label class="block text-xs font-semibold text-[#6b7280] mb-1.5">Nombre *</label><input type="text" id="rapidClienteNombre" class="w-full px-4 py-2.5 border border-[#d1d5db] rounded-xl text-sm"></div><div><label class="block text-xs font-semibold text-[#6b7280] mb-1.5">CI *</label><input type="text" id="rapidClienteCi" class="w-full px-4 py-2.5 border border-[#d1d5db] rounded-xl text-sm"></div><div><label class="block text-xs font-semibold text-[#6b7280] mb-1.5">Teléfono</label><input type="text" id="rapidClienteTelefono" class="w-full px-4 py-2.5 border border-[#d1d5db] rounded-xl text-sm"></div><div><label class="block text-xs font-semibold text-[#6b7280] mb-1.5">Email</label><input type="email" id="rapidClienteEmail" class="w-full px-4 py-2.5 border border-[#d1d5db] rounded-xl text-sm"></div></div><div class="flex gap-2 mt-6"><button onclick="closeSubModal()" class="flex-1 px-4 py-2.5 bg-gray-100 text-[#6b7280] rounded-xl text-sm font-medium hover:bg-gray-200">Cancelar</button><button onclick="guardarClienteRapido(\'' +
      origen +
      '\')" class="flex-1 px-4 py-2.5 bg-menta text-white rounded-xl text-sm font-medium shadow-sm">Crear Cliente</button></div></div>',
  );
}
async function guardarClienteRapido(origen) {
  const nombre = $("rapidClienteNombre")?.value?.trim(),
    ci = $("rapidClienteCi")?.value?.trim(),
    telefono = $("rapidClienteTelefono")?.value?.trim(),
    email = $("rapidClienteEmail")?.value?.trim();
  if (!nombre) return toast("El nombre es requerido", false);
  if (!ci) return toast("La CI es requerida", false);
  try {
    const d = await api.post("/api/clientes", {
      nombre,
      ci,
      telefono: telefono || null,
      email: email || null,
    });
    if (!d.success) {
      toast(d.error || "Error al crear cliente", false);
      return;
    }
    toast("Cliente creado");
    closeSubModal();
    if (origen === "cita") {
      $("citaClienteId").value = d.data.idcliente;
      $("citaClienteInput").value = d.data.nombre;
      const ac = $("clienteAutocomplete");
      if (ac) ac.classList.add("hidden");
    } else if (origen === "vta") {
      $("vtaClienteId").value = d.data.idcliente;
      $("vtaClienteInput").value = d.data.nombre;
      const ac = $("vtaClienteAutocomplete");
      if (ac) ac.classList.add("hidden");
    }
  } catch (e) {
    toast(e.message || "Error de conexión", false);
  }
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
      const cRes = await api.get("/api/citas/paquete/" + id);
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
