const TOKEN_KEY = "spa_token";
const USER_KEY = "spa_user";

function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}
function getUser() {
  return JSON.parse(localStorage.getItem(USER_KEY) || "null");
}
function setSession(token, user) {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}
function clearSession() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

function getHeaders() {
  const h = { "Content-Type": "application/json" };
  const t = getToken();
  if (t) h["Authorization"] = "Bearer " + t;
  return h;
}

async function apiGet(url) {
  const r = await fetch(url, { headers: getHeaders() });
  if (r.status === 401) {
    clearSession();
    window.location.reload();
    throw new Error("Sesión expirada");
  }
  const j = await r.json();
  if (!r.ok) throw new Error(j.error || "Error " + r.status);
  return j;
}

async function apiPost(url, data) {
  const r = await fetch(url, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify(data),
  });
  if (r.status === 401) {
    clearSession();
    window.location.reload();
    throw new Error("Sesión expirada");
  }
  const j = await r.json();
  if (!r.ok) throw new Error(j.error || "Error " + r.status);
  return j;
}

async function apiPut(url, data) {
  const r = await fetch(url, {
    method: "PUT",
    headers: getHeaders(),
    body: JSON.stringify(data),
  });
  if (r.status === 401) {
    clearSession();
    window.location.reload();
    throw new Error("Sesión expirada");
  }
  const j = await r.json();
  if (!r.ok) throw new Error(j.error || "Error " + r.status);
  return j;
}

async function apiDelete(url) {
  const r = await fetch(url, { method: "DELETE", headers: getHeaders() });
  if (r.status === 401) {
    clearSession();
    window.location.reload();
    throw new Error("Sesión expirada");
  }
  const j = await r.json();
  if (!r.ok) throw new Error(j.error || "Error " + r.status);
  return j;
}

const api = {
  get: apiGet,
  post: apiPost,
  put: apiPut,
  del: apiDelete,
};
