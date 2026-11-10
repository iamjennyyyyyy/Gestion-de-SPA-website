/* utils.js — Globales, helpers y componentes UI compartidos */
/* SPA Belleza & Relax */
try {
  dayjs.locale("es");
} catch (e) {} // CDN fallback
const $ = (id) => document.getElementById(id);
const qq = (sel) => document.querySelectorAll(sel);
let user = null,
  token = null,
  sidebarCollapsed = false,
  currentPage = "";
let editId = null,
  expandedTratamiento = null,
  expandedDistrito = null,
  expandedArea = null,
  citasFilterEstado = "todas";
const $$ = (n) => "$" + Number(n || 0).toFixed(2);
function cap(s) {
  return s ? s[0].toUpperCase() + s.slice(1) : "";
}
function todayStr() {
  return dayjs().format("YYYY-MM-DD");
}
function today() {
  return dayjs().format("DD [de] MMMM [de] YYYY");
}
function formatDate(d) {
  return d ? dayjs(d).format("DD [de] MMMM [de] YYYY") : "-";
}
function formatDateShort(d) {
  return d ? dayjs(d).format("DD/MM/YYYY") : "-";
}
function formatTime(t) {
  return t ? t.slice(0, 5) : "-";
}
function togglePassword() {
  const pwd = $("loginPassword"),
    ico = $("passIcon");
  if (!pwd || !ico) return;
  const isPassword = pwd.type === "password";
  pwd.type = isPassword ? "text" : "password";
  ico.className = isPassword ? "fa-solid fa-eye-slash" : "fa-solid fa-eye";
}
const EST = {
  pendiente: "bg-amber-100 text-amber-700 border-amber-200",
  realizada: "bg-mentaverde-100 text-mentaverde-700 border-mentaverde-200",
  cancelada: "bg-red-100 text-red-600 border-red-200",
};
function sc(e) {
  return EST[e] || "bg-gray-100 text-gray-600";
}
function sb(e) {
  return (
    { pendiente: "#f59e0b", realizada: "#34d399", cancelada: "#ef4444" }[e] ||
    "#9ca3af"
  );
}
function toast(msg, ok = true) {
  const c = $("toastContainer");
  if (!c) return;
  const t = document.createElement("div");
  t.className =
    "toast-enter pointer-events-auto flex items-center gap-2.5 px-5 py-3 rounded-xl shadow-lg border text-sm font-medium " +
    (ok
      ? "bg-white text-[#2c3e50] border-mentaverde-200"
      : "bg-white text-red-600 border-red-200");
  t.innerHTML =
    (ok
      ? '<i class="fa-solid fa-circle-check text-menta"></i>'
      : '<i class="fa-solid fa-circle-exclamation text-red-500"></i>') + msg;
  c.appendChild(t);
  setTimeout(() => {
    t.className = t.className.replace("toast-enter", "toast-exit");
    setTimeout(() => t.remove(), 300);
  }, 3000);
}
function openModal(html, cb) {
  const mc = $("modalContainer"),
    mb = $("modalBody");
  mc.classList.remove("hidden");
  mc.style.display = "flex";
  document.body.style.overflow = "hidden";
  mb.innerHTML = html;
  modalCallback = cb;
  if (cb) setTimeout(cb, 50);
}
function closeModal(e) {
  if (e && e.target !== $("modalContainer")) return;
  $("modalContainer").classList.add("hidden");
  $("modalContainer").style.display = "none";
  document.body.style.overflow = "";
}
let modalCallback = null;
function openConfirm(title, msg, cb, danger = true) {
  const cc = $("confirmContainer"),
    cbEl = $("confirmBody");
  cc.classList.remove("hidden");
  cc.style.display = "flex";
  cbEl.innerHTML =
    '<div class="text-center"><div class="w-14 h-14 mx-auto mb-4 rounded-full ' +
    (danger ? "bg-red-100" : "bg-menta-100") +
    ' flex items-center justify-center"><i class="fa-solid ' +
    (danger
      ? "fa-triangle-exclamation text-red-500"
      : "fa-circle-check text-menta") +
    ' text-xl"></i></div><h3 class="text-lg font-semibold text-[#2c3e50] mb-2">' +
    title +
    '</h3><p class="text-sm text-[#6b7280] mb-6">' +
    msg +
    '</p><div class="flex gap-3 justify-center"><button onclick="closeConfirm()" class="px-5 py-2.5 bg-gray-100 text-[#6b7280] rounded-xl text-sm font-medium hover:bg-gray-200">Cancelar</button><button id="confirmOkBtn" class="px-5 py-2.5 ' +
    (danger ? "bg-red-500 hover:bg-red-600" : "bg-menta hover:bg-menta-600") +
    ' text-white rounded-xl text-sm font-medium shadow-sm">Confirmar</button></div></div>';
  confirmCallback = cb;
  $("confirmOkBtn").onclick = () => {
    closeConfirm();
    if (confirmCallback) confirmCallback();
  };
}
function closeConfirm(e) {
  if (e && e.target !== $("confirmContainer")) return;
  $("confirmContainer").classList.add("hidden");
  $("confirmContainer").style.display = "none";
}
function showLoading(m = "Cargando...") {
  return '<div class="space-y-4 p-4 fade-in"><div class="flex items-center justify-center py-8"><div class="w-10 h-10 border-3 border-[#e8ecf1] border-t-menta rounded-full spin mb-4"></div></div><div class="grid grid-cols-1 md:grid-cols-3 gap-4"><div class="bg-white rounded-2xl p-5 border border-[#e8ecf1]"><div class="skeleton h-5 w-24 mb-3"></div><div class="skeleton h-8 w-16 mb-2"></div><div class="skeleton h-3 w-32"></div></div><div class="bg-white rounded-2xl p-5 border border-[#e8ecf1]"><div class="skeleton h-5 w-24 mb-3"></div><div class="skeleton h-8 w-16 mb-2"></div><div class="skeleton h-3 w-32"></div></div><div class="bg-white rounded-2xl p-5 border border-[#e8ecf1]"><div class="skeleton h-5 w-24 mb-3"></div><div class="skeleton h-8 w-16 mb-2"></div><div class="skeleton h-3 w-32"></div></div></div><div class="bg-white rounded-2xl p-5 border border-[#e8ecf1]"><div class="skeleton h-5 w-40 mb-4"></div><div class="space-y-3"><div class="skeleton h-12 w-full"></div><div class="skeleton h-12 w-full"></div><div class="skeleton h-12 w-full"></div></div></div></div>';
}
function showEmpty(icon, title, desc, btnText, btnAction) {
  return (
    '<div class="flex flex-col items-center justify-center py-20 fade-in"><div class="w-20 h-20 rounded-full bg-lavender-100 flex items-center justify-center mb-5"><i class="' +
    icon +
    ' text-spa text-3xl"></i></div><h3 class="text-lg font-semibold text-[#2c3e50] mb-1.5">' +
    title +
    '</h3><p class="text-sm text-[#6b7280] mb-6 max-w-xs text-center">' +
    desc +
    "</p>" +
    (btnText
      ? '<button onclick="' +
        btnAction +
        '" class="px-6 py-2.5 bg-menta text-white rounded-xl text-sm font-medium hover:bg-menta-600 shadow-sm">' +
        btnText +
        "</button>"
      : "") +
    "</div>"
  );
}
function renderTable(cols, rows, emptyMsg) {
  if (!rows || !rows.length)
    return (
      '<div class="text-center py-12 text-sm text-[#6b7280]"><i class="fa-solid fa-folder-open text-2xl text-[#d1d5db] mb-3 block"></i>' +
      (emptyMsg || "No hay datos") +
      "</div>"
    );
  return (
    '<div class="overflow-x-auto"><table class="w-full text-sm"><thead><tr class="border-b-2 border-[#e8ecf1]">' +
    cols
      .map(
        (c) =>
          '<th class="text-left py-3 px-4 font-semibold text-[#6b7280] text-xs uppercase tracking-wider">' +
          c.label +
          "</th>",
      )
      .join("") +
    '</tr></thead><tbody class="divide-y divide-[#f1f5f9]">' +
    rows
      .map(
        (r, i) =>
          '<tr class="hover:bg-[#f8fafc] transition-colors ' +
          (i % 2 === 0 ? "bg-white" : "bg-[#fafbfc]") +
          '">' +
          cols
            .map(
              (c) =>
                '<td class="py-3 px-4 text-[#2c3e50]">' +
                (c.render ? c.render(r) : (r[c.field] ?? "-")) +
                "</td>",
            )
            .join("") +
          "</tr>",
      )
      .join("") +
    "</tbody></table></div>"
  );
}

function openSubModal(html, cb) {
  let sm = document.getElementById("subModalContainer");
  if (!sm) {
    sm = document.createElement("div");
    sm.id = "subModalContainer";
    sm.className = "fixed inset-0 z-[60] flex items-center justify-center p-4";
    sm.style.cssText = "background:rgba(0,0,0,0.45);backdrop-filter:blur(2px)";
    sm.addEventListener("click", function (e) {
      if (e.target === sm) closeSubModal();
    });
    document.body.appendChild(sm);
  }
  sm.innerHTML =
    '<div id="subModalBody" class="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto scale-in" onclick="event.stopPropagation()">' +
    html +
    "</div>";
  sm.style.display = "flex";
  if (cb) setTimeout(cb, 50);
}
function closeSubModal() {
  const sm = document.getElementById("subModalContainer");
  if (sm) sm.style.display = "none";
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
function debounce(fn, ms) {
  let t;
  return (...a) => {
    clearTimeout(t);
    t = setTimeout(() => fn(...a), ms);
  };
}
const HORAS=[];
for(let h=9;h<=18;h++){HORAS.push(('0'+h).slice(-2)+':00');if(h<18)HORAS.push(('0'+h).slice(-2)+':30')}
function horasOptions(sel){return HORAS.map(h=>'<option value="'+h+'"'+(sel===h?' selected':'')+'>'+h+'</option>').join('')}
function esc(s){return String(s??'').replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;').replace(/>/g,'&gt;')}
function debounce(fn,ms){let t;return(...a)=>{clearTimeout(t);t=setTimeout(()=>fn(...a),ms)}}
