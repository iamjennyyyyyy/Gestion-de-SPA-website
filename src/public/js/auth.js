/* auth.js — Autenticación, sidebar y navegación */
// Auth
$("loginForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const btn = $("loginBtn"),
    err = $("loginError"),
    fd = new FormData(e.target);
  btn.disabled = true;
  btn.innerHTML =
    '<div class="w-5 h-5 border-2 border-white/30 border-t-white rounded-full spin"></div>';
  err.classList.add("hidden");
  try {
    const j = await (
      await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: fd.get("username"),
          contrasena: fd.get("contrasena"),
        }),
      })
    ).json();
    if (!j.success) throw new Error(j.error || "Credenciales inválidas");
    setSession(j.token, j.usuario);
    user = j.usuario;
    token = j.token;
    enterApp();
  } catch (e) {
    err.querySelector("span").textContent = e.message;
    err.classList.remove("hidden");
    btn.disabled = false;
    btn.innerHTML =
      '<span>Iniciar Sesión</span><i class="fa-solid fa-arrow-right text-xs"></i>';
  }
});
function logout() {
  clearSession();
  user = null;
  token = null;
  $("appLayout").classList.add("hidden");
  $("loginScreen").classList.remove("hidden");
  $("loginScreen").style.display = "flex";
}
async function checkAuth() {
  // Always show login first; hide it if valid session confirmed
  const ls = $("loginScreen");
  if (ls) {
    ls.style.display = "flex";
    ls.classList.remove("hidden");
  }
  token = getToken();
  user = getUser();
  if (token && user) {
    try {
      await api.get("/api/tratamientos?limit=1");
      enterApp();
      return true;
    } catch (e) {
      clearSession();
    }
  }
  return false;
}
if (location.search.includes("clear=1") && clearSession) clearSession();
function enterApp() {
  $("loginScreen").classList.add("hidden");
  $("loginScreen").style.display = "none";
  $("appLayout").classList.remove("hidden");
  const init = user.rol === "administrador" ? "admin-tratamientos" : "inicio";
  $("userAvatar").textContent = (user.username || "U")[0].toUpperCase();
  $("userName").textContent = user.username;
  renderSidebar();
  navigate(init);
  window.addEventListener("hashchange", () => {
    const h = location.hash.slice(1);
    if (h) navigate(h);
  });
}

// Sidebar & Navigation
const MENU_DEP = [
  { id: "inicio", icon: "fa-house", label: "Inicio" },
  { id: "citas", icon: "fa-calendar-check", label: "Citas" },
  { id: "paquetes", icon: "fa-box", label: "Paquetes" },
  { id: "paquetes-vendidos", icon: "fa-receipt", label: "Paquetes Vendidos" },
  { id: "tratamientos", icon: "fa-spa", label: "Tratamientos" },
  { id: "reportes", icon: "fa-chart-bar", label: "Reportes" },
  { id: "mapa", icon: "fa-map-location-dot", label: "Mapa y Contactos" },
];
const MENU_ADM = [
  { id: "admin-tratamientos", icon: "fa-spa", label: "Tratamientos" },
  { id: "admin-paquetes", icon: "fa-box", label: "Paquetes" },
  { id: "admin-ventas", icon: "fa-chart-line", label: "Ventas" },
  { id: "admin-empleados", icon: "fa-user-tie", label: "Empleados" },
  { id: "admin-clientes", icon: "fa-users", label: "Clientes" },
  { id: "admin-materiales", icon: "fa-oil-can", label: "Materiales" },
  { id: "admin-categorias", icon: "fa-tags", label: "Categorías" },
  { id: "admin-distritos", icon: "fa-map-pin", label: "Distritos" },
  { id: "admin-areas", icon: "fa-building", label: "Áreas" },
  { id: "admin-reportes", icon: "fa-chart-bar", label: "Reportes" },
  {
    id: "admin-informe-ingresos",
    icon: "fa-file-invoice-dollar",
    label: "Informe Ingresos",
  },
  {
    id: "admin-informe-discrepancia",
    icon: "fa-file-excel",
    label: "Informe Discrepancia",
  },
];
const TITLES = {
  inicio: "Inicio",
  citas: "Citas",
  paquetes: "Paquetes",
  "admin-ventas": "Ventas",
  tratamientos: "Tratamientos",
  reportes: "Reportes",
  mapa: "Mapa y Contactos",
  "admin-tratamientos": "Tratamientos",
  "admin-paquetes": "Paquetes",
  "admin-empleados": "Empleados",
  "admin-clientes": "Clientes",
  "admin-materiales": "Materiales",
  "admin-categorias": "Categorías",
  "admin-distritos": "Distritos",
  "admin-areas": "Áreas",
  "admin-reportes": "Reportes",
  "admin-informe-ingresos": "Informe de Ingresos",
  "admin-informe-discrepancia": "Informe de Discrepancia",
  "paquetes-vendidos": "Paquetes Vendidos",
};
const SCREENS = {};
function renderSidebar() {
  const nav = $("sidebarNav");
  if (!nav) return;
  const items = user?.rol === "administrador" ? MENU_ADM : MENU_DEP;
  nav.innerHTML = items
    .map(
      (i) =>
        '<a href="#' +
        i.id +
        '" class="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all ' +
        (currentPage === i.id
          ? "bg-menta text-white font-medium shadow-sm"
          : "text-[#6b7280] hover:bg-lavender-50 hover:text-[#2c3e50]") +
        '"><i class="fa-solid ' +
        i.icon +
        ' w-5 text-center text-base"></i><span class="sidebar-text">' +
        i.label +
        "</span></a>",
    )
    .join("");
}
function toggleSidebar() {
  const sb = $("sidebar"),
    mc = $("mainContent");
  if (window.innerWidth <= 768) {
    sb.style.transform =
      sb.style.transform === "translateX(0%)"
        ? "translateX(-100%)"
        : "translateX(0%)";
    $("sidebarOverlay").classList.toggle("hidden");
  } else {
    sidebarCollapsed = !sidebarCollapsed;
    sb.style.width = sidebarCollapsed ? "70px" : "260px";
    mc.style.marginLeft = sidebarCollapsed ? "70px" : "260px";
    qq(".sidebar-text").forEach(
      (el) => (el.style.display = sidebarCollapsed ? "none" : ""),
    );
    $("sidebarBrand").style.display = sidebarCollapsed ? "none" : "";
  }
}
function navigate(page) {
  currentPage = page;
  renderSidebar();
  $("pageTitle").textContent = TITLES[page] || "Inicio";
  location.hash = "#" + page;
  expandedTratamiento = null;
  expandedDistrito = null;
  expandedArea = null;
  const fn = SCREENS[page];
  if (fn) fn();
  else if (user?.rol === "administrador") SCREENS["admin-tratamientos"]();
  else SCREENS.inicio();
}
document.addEventListener("click", (e) => {
  if (window.innerWidth > 768) return;
  const sb = $("sidebar");
  if (!sb?.contains(e.target)) {
    sb.style.transform = "translateX(-100%)";
    $("sidebarOverlay")?.classList.add("hidden");
  }
});
// Inicialización gestionada por app.js
