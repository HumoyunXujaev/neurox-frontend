import { jwtDecode } from 'jwt-decode';

interface TokenPayload {
  sub: string;
  exp: number;
  iat: number;
  jti: string;
  company_id?: number;
  role?: string;
}

class TokenManager {
  private readonly ACCESS_TOKEN_KEY = 'neurox_access_token';
  private readonly REFRESH_TOKEN_KEY = 'neurox_refresh_token';
  private readonly USER_KEY = 'neurox_user';

  // Token management
  setTokens(accessToken: string, refreshToken: string) {
    if (typeof window !== 'undefined') {
      localStorage.setItem(this.ACCESS_TOKEN_KEY, accessToken);
      localStorage.setItem(this.REFRESH_TOKEN_KEY, refreshToken);
    }
  }

  getAccessToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(this.ACCESS_TOKEN_KEY);
  }

  getRefreshToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(this.REFRESH_TOKEN_KEY);
  }

  clearTokens() {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(this.ACCESS_TOKEN_KEY);
      localStorage.removeItem(this.REFRESH_TOKEN_KEY);
      localStorage.removeItem(this.USER_KEY);
    }
  }

  // User management
  setUser(user: any) {
    if (typeof window !== 'undefined') {
      localStorage.setItem(this.USER_KEY, JSON.stringify(user));
    }
  }

  getUser(): any | null {
    if (typeof window === 'undefined') return null;
    const userStr = localStorage.getItem(this.USER_KEY);
    if (!userStr) return null;
    try {
      return JSON.parse(userStr);
    } catch {
      return null;
    }
  }

  // Token validation
  isTokenExpired(token: string): boolean {
    try {
      const decoded = jwtDecode<TokenPayload>(token);
      const currentTime = Date.now() / 1000;
      return decoded.exp < currentTime;
    } catch {
      return true;
    }
  }

  isAuthenticated(): boolean {
    const accessToken = this.getAccessToken();
    if (!accessToken) return false;
    return !this.isTokenExpired(accessToken);
  }

  // Token payload
  getTokenPayload(token?: string): TokenPayload | null {
    const targetToken = token || this.getAccessToken();
    if (!targetToken) return null;

    try {
      return jwtDecode<TokenPayload>(targetToken);
    } catch {
      return null;
    }
  }

  getUserRole(): string | null {
    const user = this.getUser();
    return user?.role || null;
  }

  getCompanyId(): number | null {
    const user = this.getUser();
    return user?.company_id || null;
  }

  isAdmin(): boolean {
    return this.getUserRole() === 'admin';
  }

  isOperator(): boolean {
    return this.getUserRole() === 'operator';
  }

  isViewer(): boolean {
    return this.getUserRole() === 'viewer';
  }

  // Session management
  hasValidSession(): boolean {
    const accessToken = this.getAccessToken();
    const refreshToken = this.getRefreshToken();

    if (!accessToken || !refreshToken) return false;

    if (this.isTokenExpired(refreshToken)) {
      this.clearTokens();
      return false;
    }

    return true;
  }

  // Get time until token expiry
  getTokenExpiryTime(): number | null {
    const accessToken = this.getAccessToken();
    if (!accessToken) return null;

    try {
      const decoded = jwtDecode<TokenPayload>(accessToken);
      const currentTime = Date.now() / 1000;
      return Math.max(0, decoded.exp - currentTime);
    } catch {
      return null;
    }
  }

  // Check if token needs refresh (less than 5 minutes remaining)
  shouldRefreshToken(): boolean {
    const expiryTime = this.getTokenExpiryTime();
    if (expiryTime === null) return false;
    return expiryTime < 300; // 5 minutes
  }
}

export const tokenManager = new TokenManager();

export type { TokenPayload };
