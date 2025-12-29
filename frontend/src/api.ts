import axios from "axios";
import { Kassenabrechnung } from "./types";

const API_BASE_URL = process.env.REACT_APP_API_URL || "/api";

// Helper function to get CSRF token from cookie
const getCSRFToken = (): string | null => {
  const name = "csrftoken";
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) {
    return parts.pop()?.split(";").shift() || null;
  }
  return null;
};

// Helper function to get auth token from localStorage
const getAuthToken = (): string | null => {
  return localStorage.getItem("authToken");
};

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true, // Enable sending cookies
});

// Add CSRF token and Auth token to every request
api.interceptors.request.use((config) => {
  const csrfToken = getCSRFToken();
  if (csrfToken) {
    config.headers["X-CSRFToken"] = csrfToken;
  }

  const authToken = getAuthToken();
  if (authToken) {
    config.headers["Authorization"] = `Token ${authToken}`;
  }

  return config;
});

// Handle 401 errors (unauthorized) by redirecting to login
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("authToken");
      window.location.href = "/";
    }
    return Promise.reject(error);
  }
);

export interface KassenEinstellungen {
  kassenstand_anfang_default: string;
  bezeichnung_position1: string;
  bezeichnung_position2: string;
  bezeichnung_position3: string;
  preis_position1: string;
  preis_position2: string;
  preis_position3: string;
}

export const kassenService = {
  // Hole CSRF Token
  initCSRF: async (): Promise<void> => {
    await api.get("/csrf/");
  },

  // Hole Einstellungen
  getEinstellungen: async (): Promise<KassenEinstellungen> => {
    const response = await api.get("/einstellungen/");
    return response.data;
  },

  // Hole aktuelle Kassenabrechnung
  getAktuelle: async (): Promise<Kassenabrechnung> => {
    const response = await api.get("/abrechnungen/aktuelle/");
    return response.data;
  },

  // Hole alle Kassenabrechnungen
  getAll: async (): Promise<Kassenabrechnung[]> => {
    const response = await api.get("/abrechnungen/");
    return response.data.results || response.data;
  },

  // Erstelle neue Kassenabrechnung
  create: async (
    data: Partial<Kassenabrechnung>
  ): Promise<Kassenabrechnung> => {
    const response = await api.post("/abrechnungen/", data);
    return response.data;
  },

  // Aktualisiere Kassenabrechnung
  update: async (
    id: number,
    data: Partial<Kassenabrechnung>
  ): Promise<Kassenabrechnung> => {
    const response = await api.patch(`/abrechnungen/${id}/`, data);
    return response.data;
  },

  // Setze alle Zähler zurück
  reset: async (id: number): Promise<Kassenabrechnung> => {
    const response = await api.post(`/abrechnungen/${id}/reset/`);
    return response.data;
  },

  // Aktualisiere Preise aus Einstellungen
  aktualisiere_preise: async (id: number): Promise<Kassenabrechnung> => {
    const response = await api.post(`/abrechnungen/${id}/aktualisiere_preise/`);
    return response.data;
  },
};

// Auth Service
export const authService = {
  login: async (
    username: string,
    password: string
  ): Promise<{ token: string; username: string; user_id: number }> => {
    const response = await api.post("/login/", { username, password });
    const { token } = response.data;
    localStorage.setItem("authToken", token);
    return response.data;
  },

  logout: async (): Promise<void> => {
    try {
      await api.post("/logout/");
    } catch (err) {
      // Ignoriere Fehler beim Logout
    }
    localStorage.removeItem("authToken");
  },

  isAuthenticated: (): boolean => {
    return !!localStorage.getItem("authToken");
  },
};

export default api;
