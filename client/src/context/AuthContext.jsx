import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService, profileService } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('careerlink_token'));
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load user on mount if token exists
  useEffect(() => {
    const loadUser = async () => {
      const storedToken = localStorage.getItem('careerlink_token');
      if (!storedToken) {
        setIsLoading(false);
        return;
      }
      try {
        const data = await authService.getMe();
        if (data.success && data.user) {
          setUser(data.user);
        } else {
          logout();
        }
      } catch (err) {
        console.warn('Failed to restore session:', err.message);
        logout();
      } finally {
        setIsLoading(false);
      }
    };

    loadUser();

    const handleAuthInvalid = () => {
      logout();
    };

    window.addEventListener('careerlink_auth_invalid', handleAuthInvalid);
    return () => window.removeEventListener('careerlink_auth_invalid', handleAuthInvalid);
  }, []);

  const login = async (email, password) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await authService.login({ email, password });
      if (data.success) {
        localStorage.setItem('careerlink_token', data.token);
        setToken(data.token);
        setUser(data.user);
        return { success: true, user: data.user };
      }
      throw new Error(data.message || 'Login failed');
    } catch (err) {
      setError(err.message);
      return { success: false, message: err.message };
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (userData) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await authService.register(userData);
      if (data.success) {
        localStorage.setItem('careerlink_token', data.token);
        setToken(data.token);
        setUser(data.user);
        return { success: true, user: data.user };
      }
      throw new Error(data.message || 'Registration failed');
    } catch (err) {
      setError(err.message);
      return { success: false, message: err.message };
    } finally {
      setIsLoading(false);
    }
  };

  const loginWithGoogle = async (googleData) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await authService.googleLogin(googleData);
      if (data.success && data.token) {
        localStorage.setItem('careerlink_token', data.token);
        setToken(data.token);
        setUser(data.user);
        return { success: true, user: data.user };
      }
      throw new Error(data.message || 'Google authentication failed');
    } catch (err) {
      setError(err.message);
      return { success: false, message: err.message };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('careerlink_token');
    setToken(null);
    setUser(null);
  };

  // Demo login helper for instant testing
  const demoLogin = async (role = 'candidate') => {
    let email = 'alex.rivera@example.com'; // Candidate
    if (role === 'recruiter') email = 'elena.rostova@example.com'; // Recruiter
    if (role === 'admin') email = 'admin@careerlink.io'; // Admin
    if (role === 'candidate_ml') email = 'priya.sharma@example.com'; // ML Candidate
    if (role === 'candidate_java') email = 'rahul.mehta@example.com'; // Senior Java Developer
    if (role === 'recruiter_cloud') email = 'jason.reid@example.com'; // CloudSphere Recruiter

    return await login(email, 'password123');
  };

  const updateProfileState = (updatedProfile) => {
    if (user) {
      setUser((prev) => ({
        ...prev,
        profile: updatedProfile,
      }));
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile: user?.profile,
        token,
        isAuthenticated: Boolean(user),
        isCandidate: user?.role === 'candidate',
        isRecruiter: user?.role === 'recruiter' || user?.role === 'admin',
        isAdmin: user?.role === 'admin',
        isLoading,
        error,
        login,
        register,
        loginWithGoogle,
        logout,
        demoLogin,
        updateProfileState,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
