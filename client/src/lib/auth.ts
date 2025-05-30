import { apiRequest } from "./queryClient";

export interface AdminUser {
  id: number;
  username: string;
}

export class AuthManager {
  private static instance: AuthManager;
  private currentAdmin: AdminUser | null = null;

  static getInstance(): AuthManager {
    if (!AuthManager.instance) {
      AuthManager.instance = new AuthManager();
    }
    return AuthManager.instance;
  }

  async login(username: string, password: string): Promise<AdminUser> {
    try {
      const response = await apiRequest("POST", "/api/admin/login", {
        username,
        password,
      });
      
      const data = await response.json();
      
      if (data.success) {
        this.currentAdmin = data.admin;
        localStorage.setItem("admin", JSON.stringify(data.admin));
        return data.admin;
      } else {
        throw new Error("Invalid credentials");
      }
    } catch (error) {
      throw new Error("Authentication failed");
    }
  }

  logout(): void {
    this.currentAdmin = null;
    localStorage.removeItem("admin");
  }

  getCurrentAdmin(): AdminUser | null {
    if (!this.currentAdmin) {
      const stored = localStorage.getItem("admin");
      if (stored) {
        try {
          this.currentAdmin = JSON.parse(stored);
        } catch {
          localStorage.removeItem("admin");
        }
      }
    }
    return this.currentAdmin;
  }

  isAuthenticated(): boolean {
    return this.getCurrentAdmin() !== null;
  }
}

export const authManager = AuthManager.getInstance();
