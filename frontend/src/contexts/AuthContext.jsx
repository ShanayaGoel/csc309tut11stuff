
import React, { createContext, useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext(null);

// Get backend URL from environment or default
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";

export const AuthProvider = ({ children }) => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  // Persist authentication state across reloads
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      fetch(`${BACKEND_URL}/user/me`, {
        headers: { Authorization: `Bearer ${token}` }
      })
        .then(res => res.json())
        .then(data => setUser(data.user))
        .catch(() => setUser(null));
    } else {
      setUser(null);
    }
  }, []);

  // Logout function
  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    navigate("/");
  };

  // Login function
  const login = async (username, password) => {
    try {
      const res = await fetch(`${BACKEND_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });

      if (!res.ok) {
        let errorMessage = "Invalid credentials";
        try {
          const error = await res.json();
          if (error && error.message) {
            errorMessage = error.message;
          }
        } catch {
          // Keep fallback message
        }
        return errorMessage;
      }

      const data = await res.json();
      localStorage.setItem('token', data.token);

      const userRes = await fetch(`${BACKEND_URL}/user/me`, {
        headers: { Authorization: `Bearer ${data.token}` }
      });
      const userData = await userRes.json();
      setUser(userData.user);

      navigate('/profile');
      return "success";
    } catch {
      return "Network error. Please try again.";
    }
  };

  // Register function
  const register = async (userData) => {
    const res = await fetch(`${BACKEND_URL}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData)
    });

    if (!res.ok) {
      const error = await res.json();
      return error.message;
    }

    navigate('/success');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, register }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};
