import axios from "axios";
import { mockEngine } from "./mockEngine";

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8080/api/v1";

export const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 5000,
});

// Attach JWT token from localStorage
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("securevault_token");
    if (token && !token.startsWith("mock-jwt-")) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response error handler
api.interceptors.response.use(
  (response) => {
    // Notify listeners that backend is alive
    notifyBackendStatus(true);
    return response;
  },
  (error) => {
    if (error.code === "ERR_NETWORK" || error.code === "ECONNREFUSED") {
      notifyBackendStatus(false);
    }
    if (error.response?.status === 401) {
      // Don't auto-clear if in mock mode
      const token = localStorage.getItem("securevault_token");
      if (token && !token.startsWith("mock-jwt-")) {
        localStorage.removeItem("securevault_token");
        localStorage.removeItem("securevault_user");
      }
    }
    return Promise.reject(error);
  }
);

// Connectivity listeners
const statusListeners = new Set();
let isBackendOnline = false;

export function subscribeBackendStatus(listener) {
  statusListeners.add(listener);
  listener(isBackendOnline);
  return () => statusListeners.delete(listener);
}

function notifyBackendStatus(online) {
  isBackendOnline = online;
  statusListeners.forEach((l) => l(online));
}

// Check backend health directly
export async function pingBackend() {
  try {
    // Spring Boot endpoint check
    await axios.get(`${BASE_URL}/branches`, { timeout: 2000 });
    notifyBackendStatus(true);
    return true;
  } catch (err) {
    if (err.response && err.response.status !== 502 && err.response.status !== 503) {
      // Any HTTP response (including 401/403) means the Spring Boot server IS running!
      notifyBackendStatus(true);
      return true;
    }
    notifyBackendStatus(false);
    return false;
  }
}

// Active mode state: "auto" (prefers live, falls back gracefully), "live" (strict), "mock" (offline demo)
let activeMode = localStorage.getItem("securevault_api_mode") || "auto";

export function getApiMode() {
  return activeMode;
}

export function setApiMode(mode) {
  activeMode = mode;
  localStorage.setItem("securevault_api_mode", mode);
  window.dispatchEvent(new CustomEvent("securevault_mode_changed", { detail: mode }));
}

/**
 * Universal caller that tries the live Spring Boot API,
 * and gracefully falls back to mockEngine when appropriate.
 */
export async function callApi(liveFn, mockFn, endpointName = "endpoint") {
  if (activeMode === "mock") {
    const data = await mockFn();
    return { data, source: "mock" };
  }

  try {
    const response = await liveFn();
    notifyBackendStatus(true);
    return { data: response.data, source: "live" };
  } catch (error) {
    // If strict live mode, bubble error
    if (activeMode === "live") {
      throw error;
    }

    // In auto mode: if network unreachable, 404 (endpoint unmerged), or 501
    const isUnreachable =
      error.code === "ERR_NETWORK" ||
      error.code === "ECONNREFUSED" ||
      !error.response ||
      error.response.status === 404 ||
      error.response.status === 501;

    if (isUnreachable && mockFn) {
      console.warn(`[SecureVault Dual-Mode] Live ${endpointName} unavailable, falling back to mock contract engine:`, error.message);
      const data = await mockFn();
      return { data, source: "fallback" };
    }

    throw error;
  }
}

export default api;