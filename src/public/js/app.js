function bindStaticEvents() {
  $("btnTogglePassword")?.addEventListener("click", togglePassword);
  $("btnToggleSidebar")?.addEventListener("click", toggleSidebar);
  $("sidebarOverlay")?.addEventListener("click", toggleSidebar);
  $("btnLogout")?.addEventListener("click", logout);
  $("confirmContainer")?.addEventListener("click", closeConfirm);
  $("modalBody")?.addEventListener("click", (e) => e.stopPropagation());
  $("confirmBody")?.addEventListener("click", (e) => e.stopPropagation());
}

document.addEventListener("DOMContentLoaded", async () => {
  bindStaticEvents();

  if (typeof checkAuth !== "function") {
    console.error(
      "checkAuth no está definida. ¿auth.js se cargó correctamente?",
    );
    return;
  }

  const autenticado = await checkAuth();

  if (!autenticado) {
    console.log("Usuario no autenticado, mostrando login");
    const loginScreen = document.getElementById("loginScreen");
    const appLayout = document.getElementById("appLayout");

    if (loginScreen) {
      loginScreen.classList.remove("hidden");
      loginScreen.style.display = "flex";
    }
    if (appLayout) {
      appLayout.classList.add("hidden");
    }
  } else {
    console.log("Usuario autenticado");
  }
});
