import { useState, useEffect } from "react";
import { authManager, AdminUser } from "@/lib/auth";

export function useAuth() {
  const [admin, setAdmin] = useState<AdminUser | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const currentAdmin = authManager.getCurrentAdmin();
    setAdmin(currentAdmin);
    setIsAuthenticated(currentAdmin !== null);
  }, []);

  const login = async (username: string, password: string): Promise<void> => {
    try {
      const adminUser = await authManager.login(username, password);
      setAdmin(adminUser);
      setIsAuthenticated(true);
    } catch (error) {
      throw error;
    }
  };

  const logout = () => {
    authManager.logout();
    setAdmin(null);
    setIsAuthenticated(false);
  };

  return {
    admin,
    isAuthenticated,
    login,
    logout,
  };
}
