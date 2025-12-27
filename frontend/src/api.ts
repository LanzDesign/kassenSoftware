import axios from "axios";
import { Kassenabrechnung } from "./types";

const API_BASE_URL = "http://localhost:8000/api";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

export const kassenService = {
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
};

export default api;
