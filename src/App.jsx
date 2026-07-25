import React, { useState, useEffect } from "react";
import Navbar from "./components/Navbar";
import AuthModal from "./components/AuthModal";
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";

function App() {
  const [user, setUser] = useState(() => {
    try {
      const token = localStorage.getItem("token");
      const savedUser = localStorage.getItem("user");

      if (!token && savedUser) {
        localStorage.removeItem("user");
        return null;
      }

      return savedUser ? JSON.parse(savedUser) : null;
    } catch (error) {
      console.error("Failed to parse user from localStorage", error);
      localStorage.removeItem("user");
      localStorage.removeItem("token");
      return null;
    }
  });

  const [authModalState, setAuthModalState] = useState({
    isOpen: false,
    mode: "login",
  });

  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === "user" || e.key === "token") {
        try {
          const updatedUser = e.newValue ? JSON.parse(e.newValue) : null;
          setUser(updatedUser);
        } catch {
          setUser(null);
        }
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  const handleOpenAuth = (mode) => {
    setAuthModalState({ isOpen: true, mode });
  };

  const handleLoginSuccess = (userData) => {
    setUser(userData);
    localStorage.setItem("user", JSON.stringify(userData));
  };

  const handleUserUpdate = (updatedUser) => {
    setUser(updatedUser);
    localStorage.setItem("user", JSON.stringify(updatedUser));
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
  };

  return (
    <>
      {user ? (
        <Dashboard
          user={user}
          onLogout={handleLogout}
          onUserUpdate={handleUserUpdate}
        />
      ) : (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-200">
          <Navbar onOpenAuth={handleOpenAuth} />

          <main>
            <Home onOpenAuth={handleOpenAuth} />
          </main>

          <AuthModal
            isOpen={authModalState.isOpen}
            initialMode={authModalState.mode}
            onClose={() =>
              setAuthModalState((prev) => ({ ...prev, isOpen: false }))
            }
            onLoginSuccess={handleLoginSuccess}
          />
        </div>
      )}
    </>
  );
}

export default App;
