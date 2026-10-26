import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from "react";
import { jwtDecode } from "jwt-decode";

const AuthContext = createContext(null);

const INACTIVITY_LIMIT = 5 * 60 * 60 * 1000;
const ACTIVITY_KEY = "lastActivity";

function readValidUser() {
  const token = localStorage.getItem("token");
  if (!token) return null;
  try {
    const decoded = jwtDecode(token);
    const expired = decoded.exp * 1000 <= Date.now();
    const last = Number(localStorage.getItem(ACTIVITY_KEY)) || Date.now();
    const idle = Date.now() - last > INACTIVITY_LIMIT;
    if (expired || idle) {
      localStorage.removeItem("token");
      localStorage.removeItem(ACTIVITY_KEY);
      return null;
    }
    return decoded;
  } catch {
    localStorage.removeItem("token");
    return null;
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => readValidUser());
  const [loading] = useState(false);
  const idleTimer = useRef(null);
  const expiryTimer = useRef(null);
  const logout = useCallback(() => {
    localStorage.removeItem("token");
    localStorage.removeItem(ACTIVITY_KEY);
    sessionStorage.removeItem("masterToken");
    sessionStorage.removeItem("masterUnlockUntil");
    setUser(null);
  }, []);

  const login = (token) => {
    localStorage.setItem("token", token);
    localStorage.setItem(ACTIVITY_KEY, String(Date.now()));
    setUser(jwtDecode(token));
  };

  useEffect(() => {
    clearTimeout(expiryTimer.current);
    if (!user) return;
    const ms = user.exp * 1000 - Date.now();
    if (ms <= 0) return logout();
    expiryTimer.current = setTimeout(logout, ms);
    return () => clearTimeout(expiryTimer.current);
  }, [user, logout]);

  useEffect(() => {
    if (!user) return;

    const MAX_DELAY = 2 ** 31 - 1;

    const schedule = (delay) => {
      clearTimeout(idleTimer.current);
      idleTimer.current = setTimeout(check, Math.min(delay, MAX_DELAY));
    };

    const check = () => {
      const last = Number(localStorage.getItem(ACTIVITY_KEY)) || 0;
      const remaining = INACTIVITY_LIMIT - (Date.now() - last);
      if (remaining <= 0) logout();
      else schedule(remaining); // another tab was active, so wait out the rest
    };

    let lastWrite = 0;
    const onActivity = () => {
      const now = Date.now();
      if (now - lastWrite > 10_000) { // write at most once every 10s
        lastWrite = now;
        localStorage.setItem(ACTIVITY_KEY, String(now));
      }
    };

    const events = ["mousemove", "keydown", "click", "scroll", "touchstart"];
    events.forEach((e) => window.addEventListener(e, onActivity, { passive: true }));
    onActivity();
    schedule(INACTIVITY_LIMIT);

    return () => {
      events.forEach((e) => window.removeEventListener(e, onActivity));
      clearTimeout(idleTimer.current);
    };
  }, [user, logout]);

  useEffect(() => {
    const onStorage = (e) => {
      if (e.key === "token") setUser(readValidUser());
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);