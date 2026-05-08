import { createContext, useContext, useState, useEffect } from 'react';
import authService from '../services/authService';
import { getToken, setToken, removeToken, getUser, setUser, removeUser, getDashboardRoute } from '../utils/helpers';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUserState] = useState(getUser());
  const [token, setTokenState] = useState(getToken());
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  // ─── On mount — verify token still valid ────────────────────────────────────
  useEffect(() => {
    const verifyUser = async () => {
      if (token) {
        try {
          const res = await authService.getMe();
          setUserState(res.data.user);
          setUser(res.data.user);
        } catch {
          removeToken();
          removeUser();
          setUserState(null);
          setTokenState(null);
        }
      }
      setInitialLoading(false);
    };
    verifyUser();
  }, []);

  // ─── Login ───────────────────────────────────────────────────────────────────
  const login = async (credentials) => {
    setLoading(true);
    try {
      const res = await authService.login(credentials);
      const { token: newToken, user: newUser } = res.data;
      setToken(newToken);
      setUser(newUser);
      setTokenState(newToken);
      setUserState(newUser);
      return { success: true, redirectTo: getDashboardRoute(newUser.role) };
    } catch (error) {
      return { success: false, message: error.response?.data?.message || 'Login failed' };
    } finally {
      setLoading(false);
    }
  };

  // ─── Register ────────────────────────────────────────────────────────────────
  const register = async (data) => {
    setLoading(true);
    try {
      const res = await authService.register(data);
      return { success: true, message: res.data.message };
    } catch (error) {
      return { success: false, message: error.response?.data?.message || 'Registration failed' };
    } finally {
      setLoading(false);
    }
  };

  // ─── Logout ──────────────────────────────────────────────────────────────────
  const logout = async () => {
    try {
      await authService.logout();
    } catch {}
    removeToken();
    removeUser();
    setTokenState(null);
    setUserState(null);
  };

  const isAuthenticated = !!token && !!user;

  return (
    <AuthContext.Provider value={{ user, token, loading, initialLoading, isAuthenticated, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};

export default AuthContext;