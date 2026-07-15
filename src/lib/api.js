export const API_URL = "https://glowsalon-backend-production-a15b.up.railway.app/api";

export function decodeToken(token) {
  const base64 = token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
  return JSON.parse(decodeURIComponent(escape(atob(base64))));
}

export async function apiFetch(endpoint, options = {}) {
  const res = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {})
    }
  });
  const data = await res.json();
  if (!res.ok) {
    const message = data.errors
      ? data.errors.map((e) => e.message).join(", ")
      : data.error || "Une erreur est survenue";
    throw new Error(message);
  }
  return data;
}

// Persistance de session via localStorage
export function saveSession(token) {
  localStorage.setItem("glowsalon_token", token);
}

export function loadSession() {
  return localStorage.getItem("glowsalon_token");
}

export function clearSession() {
  localStorage.removeItem("glowsalon_token");
}

export async function restoreSession() {
  const token = loadSession();
  if (!token) return null;

  try {
    const res = await fetch(`${API_URL}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (!res.ok) {
      clearSession();
      return null;
    }
    const user = await res.json();
    return { token, ...user };
  } catch {
    clearSession();
    return null;
  }
}