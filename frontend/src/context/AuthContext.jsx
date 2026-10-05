import { createContext, useContext, useState, useEffect } from "react";
import { authApi } from "../api/services";
import { subscribeBackendStatus, pingBackend, getApiMode, setApiMode as updateApiMode } from "../api/client";

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const PRESET_USERS = [
  { username: "johndoe", password: "password123", role: "OFFICER", name: "John Doe (Officer)", branchId: 1 },
  { username: "sarahsmith", password: "password123", role: "BRANCH_MANAGER", name: "Sarah Smith (Manager)", branchId: 1 },
  { username: "davidkumar", password: "password123", role: "AUDITOR", name: "David Kumar (Auditor)", branchId: 1 },
  { username: "priyasharma", password: "password123", role: "BRANCH_MANAGER", name: "Priya Sharma (Manager)", branchId: 2 },
  { username: "alexchen", password: "password123", role: "OFFICER", name: "Alex Chen (Officer)", branchId: 3 },
];

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem("securevault_user");
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const [backendOnline, setBackendOnline] = useState(false);
  const [apiMode, setApiModeState] = useState(getApiMode());

  useEffect(() => {
    // Subscribe to client connectivity
    const unsub = subscribeBackendStatus((online) => {
      setBackendOnline(online);
    });

    // Check health initially
    pingBackend();

    // Periodic heartbeat check
    const interval = setInterval(() => {
      pingBackend();
    }, 15000);

    return () => {
      unsub();
      clearInterval(interval);
    };
  }, []);

  const changeApiMode = (newMode) => {
    updateApiMode(newMode);
    setApiModeState(newMode);
  };

  const login = async (username, password) => {
    const { data } = await authApi.login(username, password);
    localStorage.setItem("securevault_token", data.token);
    localStorage.setItem("securevault_user", JSON.stringify(data));
    setUser(data);
    return data;
  };

  const logout = () => {
    localStorage.removeItem("securevault_token");
    localStorage.removeItem("securevault_user");
    setUser(null);
  };

  const quickSwitchUser = async (username) => {
    const preset = PRESET_USERS.find((u) => u.username === username);
    if (preset) {
      return await login(preset.username, preset.password);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        quickSwitchUser,
        backendOnline,
        apiMode,
        setApiMode: changeApiMode,
        isManager: user?.role === "BRANCH_MANAGER",
        isOfficer: user?.role === "OFFICER",
        isAuditor: user?.role === "AUDITOR",
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}