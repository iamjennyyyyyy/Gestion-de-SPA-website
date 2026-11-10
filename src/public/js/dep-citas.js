let citasFilterPeriodo = "hoy";
SCREENS.citas = async () => {
  const ct = $("pageContent");
  ct.innerHTML = showLoading();
  try {
    let url = "/api/citas";
    const d = await api.get(url);
    if (!d.success) {
      ct.innerHTML = showEmpty(
        "fa-solid fa-calendar-xmark",
        "Sin datos",
        "No se pudieron cargar las citas.",
        "Reintentar",
        "navigate('citas')",
      );
      return;
    }
    let citas = d.data || [];
    const today = todayStr();
    if (citasFilterPeriodo === "hoy")
      citas = citas.filter(
        (c) => dayjs(c.fecha).format("YYYY-MM-DD") === today,
      );
    else if (citasFilterPeriodo === "pasadas")
      citas = citas.filter((c) => dayjs(c.fecha).format("YYYY-MM-DD") < today);
    else if (citasFilterPeriodo === "futuras")
      citas = citas.filter((c) => dayjs(c.fecha).format("YYYY-MM-DD") > today);
    if (citasFilterPeriodo === "pasadas") {
      citas.sort(
        (a, b) =>
          new Date(b.fecha || 0) - new Date(a.fecha || 0) ||
          (b.hora || "").localeCompare(a.hora || ""),
      );
    } else {
      citas.sort(
        (a, b) =>
          new Date(a.fecha || 0) - new Date(b.fecha || 0) ||
          (a.hora || "").localeCompare(b.hora || ""),
      );
    }
    ct.innerHTML =
      '<div class="fade-in relative"><div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5"><div class="flex items-center gap-2"><h3 class="text-lg font-semibold text-[#2c3e50]">Citas</h3><span class="px-2.5 py-0.5 bg-menta-50 text-menta-700 text-xs font-semibold rounded-full">' +
      citas.length +
      '</span></div><div class="flex items-center gap-2"><div class="flex bg-[#f1f5f9] rounded-xl p-1"><button class="btn-filtro px-3 py-1.5 text-xs font-medium rounded-lg transition-all ' +
      (citasFilterPeriodo === "pasadas"
        ? "bg-white text-[#2c3e50] shadow-sm"
        : "text-[#6b7280] hover:text-[#2c3e50]") +
      '" onclick="citasFilterPeriodo=\'pasadas\';SCREENS.citas()">Pasadas</button><button class="btn-filtro px-3 py-1.5 text-xs font-medium rounded-lg transition-all ' +
      (citasFilterPeriodo === "hoy"
        ? "bg-white text-[#2c3e50] shadow-sm"
        : "text-[#6b7280] hover:text-[#2c3e50]") +
      '" onclick="citasFilterPeriodo=\'hoy\';SCREENS.citas()">Hoy</button><button class="btn-filtro px-3 py-1.5 text-xs font-medium rounded-lg transition-all ' +
      (citasFilterPeriodo === "futuras"
        ? "bg-white text-[#2c3e50] shadow-sm"
        : "text-[#6b7280] hover:text-[#2c3e50]") +
      '" onclick="citasFilterPeriodo=\'futuras\';SCREENS.citas()">Futuras</button></div></div></div><div class="flex justify-end mb-4"><button onclick="citaModal()" class="px-4 py-2 bg-menta text-white text-sm font-medium rounded-xl hover:bg-menta-600 shadow-sm flex items-center gap-1.5"><i class="fa-solid fa-plus"></i> Agendar Cita</button></div><button onclick="citaModal()" class="fixed bottom-6 right-6 z-40 w-14 h-14 rounded-full bg-gradient-to-r from-menta to-menta-600 text-white shadow-xl hover:shadow-2xl hover:scale-105 transition-all flex items-center justify-center text-xl sm:hidden"><i class="fa-solid fa-plus"></i></button>';

    if (citas.length) {
      ct.querySelector(".fade-in").insertAdjacentHTML(
        "beforeend",
        renderTable(
          [
            { label: "Fecha", render: (c) => formatDateShort(c.fecha) },
            { label: "Hora", render: (c) => formatTime(c.hora) },
            { label: "Cliente", render: (c) => c.clientenombre || "-" },
            { label: "Teléfono", render: (c) => c.telefonocliente || "-" },
            { label: "Tratamiento", render: (c) => c.tratamientonombre || "-" },
            { label: "Precio", render: (c) => $$(c.precio) },
            {
              label: "Estado",
              render: (c) =>
                '<span class="px-2.5 py-0.5 text-xs font-semibold rounded-full border ' +
                sc(c.estado) +
                ' cursor-pointer" onclick="cambioEstadoCita(' +
                c.idcita +
                ",'" +
                c.estado +
                "')\">" +
                cap(c.estado) +
                "</span>",
            },
            {
              label: "",
              render: (c) => {
                let html = '<div class="flex gap-1.5 justify-end">';

                if (c.estado === "pendiente") {
                  html +=
                    '<button onclick="realizarCita(' +
                    c.idcita +
                    ')" class="px-2 py-1 text-xs font-semibold text-white bg-green-500 hover:bg-green-600 rounded-lg flex items-center gap-1"><i class="fa-solid fa-check"></i> Realizar</button>';
                  html +=
                    '<button onclick="cancelarCita(' +
                    c.idcita +
                    ')" class="px-2 py-1 text-xs font-semibold text-white bg-red-400 hover:bg-red-500 rounded-lg flex items-center gap-1"><i class="fa-solid fa-xmark"></i> Cancelar</button>';
                }

                html +=
                  '<button onclick="verCita(' +
                  c.idcita +
                  ')" class="p-1.5 text-[#6b7280] hover:text-menta hover:bg-menta-50 rounded-lg transition-all" title="Ver"><i class="fa-solid fa-eye"></i></button>';

                if (c.estado === "pendiente") {
                  html +=
                    '<button onclick="editarCita(' +
                    c.idcita +
                    ')" class="p-1.5 text-[#6b7280] hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-all" title="Editar"><i class="fa-solid fa-pen-to-square"></i></button>';
                }

                html += "</div>";
                return html;
              },
            },
          ],
          citas,
        ),
      );
    } else {
      ct.querySelector(".fade-in").insertAdjacentHTML(
        "beforeend",
        showEmpty(
          "fa-solid fa-calendar-check",
          "No hay citas " +
            (citasFilterPeriodo === "hoy"
              ? "para hoy"
              : citasFilterPeriodo === "pasadas"
                ? "pasadas"
                : "futuras"),
          "Agenda la primera cita para comenzar.",
          "Agendar Cita",
          "citaModal()",
        ),
      );
    }
  } catch (e) {
    ct.innerHTML = showEmpty(
      "fa-solid fa-circle-exclamation",
      "Error",
      "Ocurrió un error.",
      "Reintentar",
      "navigate('citas')",
    );
  }
};
async function verCita(id) {
  try {
    const d = await api.get("/api/citas/" + id);
    if (!d.success) return toast(d.error || "Error", false);
    const c = d.data;

    openModal(
      '<div class="p-6" style="max-width: 520px"><div class="flex items-center justify-between mb-5"><h3 class="text-lg font-semibold text-[#2c3e50]"><i class="fa-solid fa-circle-info text-menta mr-2"></i>Detalle de Cita</h3><span class="px-2.5 py-0.5 text-xs font-semibold rounded-full border ' +
        sc(c.estado) +
        '">' +
        cap(c.estado) +
        '</span></div><div class="space-y-3 text-sm"><div class="flex justify-between py-2 border-b border-[#e8ecf1]"><span class="text-[#6b7280]">Cliente</span><span class="font-medium text-[#2c3e50]">' +
        c.clientenombre +
        '</span></div><div class="flex justify-between py-2 border-b border-[#e8ecf1]"><span class="text-[#6b7280]">Teléfono</span><span class="font-medium text-[#2c3e50]">' +
        c.telefonocliente +
        '</span></div><div class="flex justify-between py-2 border-b border-[#e8ecf1]"><span class="text-[#6b7280]">Tratamiento</span><span class="font-medium text-[#2c3e50]">' +
        c.tratamientonombre +
        '</span></div><div class="flex justify-between py-2 border-b border-[#e8ecf1]"><span class="text-[#6b7280]">Precio</span><span class="font-medium text-[#2c3e50]">' +
        $$(c.precio) +
        '</span></div><div class="flex justify-between py-2 border-b border-[#e8ecf1]"><span class="text-[#6b7280]">Fecha</span><span class="font-medium text-[#2c3e50]">' +
        formatDate(c.fecha) +
        '</span></div><div class="flex justify-between py-2 border-b border-[#e8ecf1]"><span class="text-[#6b7280]">Hora</span><span class="font-medium text-[#2c3e50]">' +
        formatTime(c.hora) +
        "</span></div>" +
        (c.empleadonombre
          ? '<div class="flex justify-between py-2 border-b border-[#e8ecf1]"><span class="text-[#6b7280]">Empleado</span><span class="font-medium text-[#2c3e50]">' +
            c.empleadonombre +
            "</span></div>"
          : "") +
        (c.observaciones
          ? '<div class="flex justify-between py-2 border-b border-[#e8ecf1]"><span class="text-[#6b7280]">Observaciones</span><span class="font-medium text-[#2c3e50]">' +
            c.observaciones +
            "</span></div>"
          : "") +
        '</div><div class="flex gap-2 mt-6 justify-end"><button onclick="closeModal()" class="px-5 py-2.5 bg-gray-100 text-[#6b7280] rounded-xl text-sm font-medium hover:bg-gray-200">Cerrar</button>' +
        (c.estado === "pendiente"
          ? '<button onclick=\"closeModal();cancelarCita(' +
            id +
            ')\" class=\"px-5 py-2.5 bg-red-100 text-red-600 rounded-xl text-sm font-medium hover:bg-red-200\"><i class=\"fa-solid fa-xmark mr-1.5\"></i>Cancelar</button><button onclick=\"closeModal();realizarCita(' +
            id +
            ')\" class=\"px-5 py-2.5 bg-menta text-white rounded-xl text-sm font-medium shadow-sm hover:bg-menta-600\"><i class=\"fa-solid fa-check mr-1.5\"></i>Realizar</button>'
          : "") +
        "</div></div>",
    );
  } catch (e) {
    toast("Error al cargar detalle", false);
  }
}
async function cambioEstadoCita(id, estadoActual) {
  const estados = ["pendiente", "realizada", "cancelada"];
  let idx = estados.indexOf(estadoActual);
  if (idx < 0) idx = 0;
  const nuevos = estados.filter((e) => e !== estadoActual);
  openModal(
    '<div class="p-6" style="max-width: 380px"><h3 class="text-lg font-semibold text-[#2c3e50] mb-4"><i class="fa-solid fa-pen-to-square text-menta mr-2"></i>Cambiar Estado</h3><p class="text-sm text-[#6b7280] mb-4">Selecciona el nuevo estado para la cita:</p><div class="space-y-2">' +
      nuevos
        .map(
          (s) =>
            '<button onclick="aplicarCambioEstado(' +
            id +
            ",'" +
            s +
            '\')" class="w-full text-left px-4 py-3 rounded-xl border border-[#e8ecf1] hover:border-menta-200 hover:bg-menta-50 transition-all flex items-center gap-3"><div class="w-3 h-3 rounded-full" style="background:' +
            sb(s) +
            '"></div><span class="font-medium text-sm text-[#2c3e50]">' +
            cap(s) +
            "</span></button>",
        )
        .join("") +
      '</div><button onclick="closeModal()" class="mt-4 w-full px-4 py-2.5 bg-gray-100 text-[#6b7280] rounded-xl text-sm font-medium hover:bg-gray-200">Cancelar</button></div>',
  );
}
async function aplicarCambioEstado(id, estado) {
  try {
    const d = await api.put("/api/citas/" + id, { estado });
    if (!d.success) return toast(d.error || "Error al actualizar", false);
    toast("Estado actualizado a " + cap(estado));
    closeModal();
    SCREENS.citas();
  } catch (e) {
    toast(e.message || "Error de conexión", false);
  }
}
function eliminarCita(id) {
  toast(
    "Las citas no se pueden eliminar. Puedes cancelarlas o marcarlas como realizadas.",
    false,
  );
}

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
async function citaModal(editData) {
  editId = editData?.idcita || null;
  try {
    const t = await api.get("/api/tratamientos");
    if (!t.success) {
      toast("Error al cargar tratamientos", false);
      return;
    }

    const loadEmps = async (tratId) => {
      var sel = $("citaEmpleado");
      if (!tratId) {
        if (sel)
          sel.innerHTML =
            '<option value="">Selecciona un tratamiento primero</option>';
        return;
      }
      try {
        const e = await api.get(
          "/api/tratamientos/" + tratId + "/empleados-disponibles",
        );
        if (e.success && e.data) {
          sel.innerHTML = "";
          const fijos = e.data.fijos || [];
          const suplentes = e.data.suplentes || [];
          if (!fijos.length && !suplentes.length) {
            sel.innerHTML =
              '<option value="">No hay empleados disponibles</option>';
            return;
          }
          if (fijos.length) {
            var g = document.createElement("optgroup");
            g.label = "Fijos del tratamiento";
            fijos.forEach(function (en) {
              var opt = document.createElement("option");
              opt.value = en.idempleado;
              if (editData && editData.idempleado == en.idempleado)
                opt.selected = true;
              opt.textContent = en.nombre;
              g.appendChild(opt);
            });
            sel.appendChild(g);
          }
          if (suplentes.length) {
            var g2 = document.createElement("optgroup");
            g2.label = "Suplentes del área";
            suplentes.forEach(function (en) {
              var opt = document.createElement("option");
              opt.value = en.idempleado;
              if (editData && editData.idempleado == en.idempleado)
                opt.selected = true;
              opt.textContent = en.nombre;
              g2.appendChild(opt);
            });
            sel.appendChild(g2);
          }
        } else {
          sel.innerHTML = '<option value="">Error al cargar empleados</option>';
        }
      } catch (e2) {
        var sel2 = $("citaEmpleado");
        if (sel2) sel2.innerHTML = '<option value="">Error</option>';
      }
    };

    // Construir opciones del tratamiento con data-precio
    var tratOpts = "";
    t.data.forEach(function (tr) {
      tratOpts +=
        '<option value="' +
        tr.idtratamiento +
        '" data-precio="' +
        tr.precio +
        '"' +
        (editData && editData.idtratamiento == tr.idtratamiento
          ? " selected"
          : "") +
        ">" +
        tr.nombre +
        "</option>";
    });

    var obsVal = editData ? editData.observaciones || "" : "";

    // Calcular precio inicial
    let precioInicial = 0;
    if (editData && editData.precio) {
      precioInicial = editData.precio;
    } else if (t.data && t.data.length > 0) {
      precioInicial = t.data[0].precio;
    }

    var body =
      '<div class="p-6" style="max-width:520px">' +
      '<h3 class="text-lg font-semibold text-[#2c3e50] mb-5">' +
      '<i class="fa-solid fa-calendar-plus text-menta mr-2"></i>' +
      (editData ? "Editar Cita" : "Agendar Cita") +
      "</h3>";

    body += '<div class="space-y-3.5">';

    // Cliente
    body +=
      '<div><label class="block text-xs font-semibold text-[#6b7280] mb-1.5">Cliente *</label>' +
      '<div class="relative">' +
      '<input type="text" id="citaClienteInput" autocomplete="off" class="w-full px-4 py-2.5 border border-[#d1d5db] rounded-xl text-sm" placeholder="Nombre del cliente" value="' +
      (editData ? editData.clientenombre || "" : "") +
      '">' +
      '<input type="hidden" id="citaClienteId" value="' +
      (editData ? editData.idcliente || "" : "") +
      '">' +
      '<div id="clienteAutocomplete" class="absolute z-50 w-full bg-white border border-[#e8ecf1] rounded-xl shadow-lg mt-1 max-h-48 overflow-y-auto hidden"></div>' +
      "</div></div>";

    // Tratamiento
    body +=
      '<div><label class="block text-xs font-semibold text-[#6b7280] mb-1.5">Tratamiento *</label>' +
      '<select id="citaTratamiento" class="w-full px-4 py-2.5 border border-[#d1d5db] rounded-xl text-sm" onchange="actualizarPrecioMostrado()">' +
      tratOpts +
      "</select></div>";

    // Precio (SOLO LECTURA)
    body +=
      '<div><label class="block text-xs font-semibold text-[#6b7280] mb-1.5">Precio</label>' +
      '<div class="w-full px-4 py-2.5 bg-gray-100 border border-[#e8ecf1] rounded-xl text-sm text-[#6b7280] flex items-center gap-2">' +
      '<i class="fa-solid fa-dollar-sign text-menta text-xs"></i>' +
      '<span id="precioMostrado">' +
      $$(precioInicial) +
      "</span>" +
      '<span class="ml-auto text-xs text-[#9ca3af]"><i class="fa-solid fa-lock mr-1"></i>El precio lo asigna el sistema</span>' +
      "</div></div>";

    // Fecha
    body +=
      '<div><label class="block text-xs font-semibold text-[#6b7280] mb-1.5">Fecha *</label>' +
      '<input type="date" id="citaFecha" value="' + (editData ? dayjs(editData.fecha).format('YYYY-MM-DD') : todayStr())  +
      '" class="w-full px-4 py-2.5 border border-[#d1d5db] rounded-xl text-sm"></div>';

    // Hora
    // Hora
    body += '<div><label class="block text-xs font-semibold text-[#6b7280] mb-1.5">Hora *</label>' +
  '<select id="citaHora" class="w-full px-4 py-2.5 border border-[#d1d5db] rounded-xl text-sm">' +
  horasOptions(editData ? formatTime(editData.hora) : '10:00') + '</select></div>';
    // Empleado
    body +=
      '<div><label class="block text-xs font-semibold text-[#6b7280] mb-1.5">Empleado *</label>' +
      '<select id="citaEmpleado" class="w-full px-4 py-2.5 border border-[#d1d5db] rounded-xl text-sm"><option value="">Cargando...</option></select></div>';

    // Observaciones
    body +=
      '<div><label class="block text-xs font-semibold text-[#6b7280] mb-1.5">Observaciones</label>' +
      '<textarea id="citaObservaciones" class="w-full px-4 py-2.5 border border-[#d1d5db] rounded-xl text-sm">' +
      obsVal +
      "</textarea></div>";

    body +=
      '</div><div class="flex gap-2 mt-6">' +
      '<button onclick="closeModal()" class="flex-1 px-4 py-2.5 bg-gray-100 text-[#6b7280] rounded-xl text-sm font-medium hover:bg-gray-200">Cancelar</button>' +
      '<button onclick="guardarCita()" class="flex-1 px-4 py-2.5 bg-menta text-white rounded-xl text-sm font-medium shadow-sm hover:bg-menta-600">' +
      (editData ? "Guardar Cambios" : "Agendar") +
      "</button></div></div>";

    openModal(body, function () {
      var inp = $("citaClienteInput");
      if (inp)
        inp.addEventListener("input", debounce(autocompleteClientes, 300));

      var selTrat = $("citaTratamiento");
      if (selTrat && selTrat.value) loadEmps(selTrat.value);
      actualizarPrecioMostrado();
      selTrat.addEventListener("change", function () {
        if (this.value) loadEmps(this.value);
        actualizarPrecioMostrado(); // Asegurar que se actualice
      });
    });
  } catch (e) {
    toast(e.message || "Error al cargar formulario", false);
  }
}

async function editarCita(id) {
  try {
    const d = await api.get("/api/citas/" + id);
    if (!d.success) return toast(d.error || "Error al cargar cita", false);
    citaModal(d.data);
  } catch (e) {
    toast(e.message || "Error de conexión", false);
  }
}


async function autocompleteClientes() {
  const q = $("citaClienteInput")?.value;
  if (!q || q.length < 2) {
    $("clienteAutocomplete")?.classList.add("hidden");
    return;
  }
  try {
    const d = await api.get("/api/clientes?q=" + encodeURIComponent(q));
    if (!d.success) return;
    const ac = $("clienteAutocomplete");
    let html = '<div class="p-2 space-y-1">';
    if (d.data.length) {
      html += d.data
        .map(
          (c) =>
            '<div class="px-3 py-2 hover:bg-menta-50 rounded-lg cursor-pointer text-sm text-[#2c3e50] flex items-center justify-between" onclick="seleccionarCliente(' +
            c.idcliente +
            ",'" +
            c.nombre.replace(/'/g, "\\'") +
            "')\"><span>" +
            c.nombre +
            '</span><span class="text-xs text-[#6b7280]">' +
            c.telefono +
            "</span></div>",
        )
        .join("");
    } else {
      html +=
        '<div class="px-3 py-2 text-sm text-[#9ca3af]">Sin resultados</div>';
    }
    html +=
      '<div class="border-t border-[#e8ecf1] mt-1 pt-1"><div class="px-3 py-2 hover:bg-menta-50 rounded-lg cursor-pointer text-sm text-menta font-medium flex items-center gap-2" onclick="crearClienteRapido(\'cita\')"><i class="fa-solid fa-plus"></i> Agregar nuevo cliente</div></div></div>';
    ac.innerHTML = html;
    ac.classList.remove("hidden");
  } catch (e) {}
}
function seleccionarCliente(id, nombre) {
  $("citaClienteId").value = id;
  $("citaClienteInput").value = nombre;
  $("clienteAutocomplete").classList.add("hidden");
}
async function guardarCita() {
  const idcliente = $("citaClienteId").value;
  const idtratamiento = $("citaTratamiento").value;
  const fecha = $("citaFecha").value;
  const hora = $("citaHora").value;
  const idempleado = $("citaEmpleado").value;
  const observaciones = $("citaObservaciones")?.value || "";

  // Obtener el precio del tratamiento seleccionado
  const selTrat = $("citaTratamiento");
  const precio = selTrat
    ? selTrat.options[selTrat.selectedIndex]?.dataset?.precio
    : null;

  if (!idcliente) return toast("Selecciona un cliente", false);
  if (!idtratamiento) return toast("Selecciona un tratamiento", false);
  if (!fecha) return toast("Selecciona una fecha", false);
  if (!hora) return toast("Selecciona una hora", false);
  if (!idempleado) return toast("Selecciona un empleado", false);

  const data = {
    idcliente: Number(idcliente),
    idtratamiento: Number(idtratamiento),
    fecha,
    hora,
    idempleado: Number(idempleado),
    observaciones,
    precio: Number(precio) || 0,
  };
  // if (estado) data.estado = estado;

  try {
    const d = editId
      ? await api.put("/api/citas/" + editId, data)
      : await api.post("/api/citas", data);
    if (!d.success) {
      toast(d.error || "Error al guardar", false);
      return;
    }
    toast(editId ? "Cita actualizada" : "Cita agendada exitosamente");
    closeModal();
    SCREENS.citas();
  } catch (e) {
    toast(e.message || "Error de conexión", false);
  }
}
