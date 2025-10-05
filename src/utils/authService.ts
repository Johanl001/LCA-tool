// Authentication Service with Token Management
// Handles JWT token validation, refresh, and error recovery

interface AuthTokens {
  token: string;
  refreshToken?: string;
  expiresAt: number;
}

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

class AuthService {
  private static instance: AuthService;
  private refreshPromise: Promise<string | null> | null = null;

  public static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  // Check if token is valid and not expired
  public isTokenValid(token: string): boolean {
    try {
      if (!token) return false;
      
      const payload = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Date.now() / 1000;
      
      // Check if token expires in next 5 minutes (300 seconds buffer)
      return payload.exp > currentTime + 300;
    } catch (error) {
      console.error('Invalid token format:', error);
      return false;
    }
  }

  // Get current valid token or refresh if needed
  public async getValidToken(): Promise<string | null> {
    const token = localStorage.getItem('lca_token');
    
    if (!token) {
      console.log('No token found');
      return null;
    }

    if (this.isTokenValid(token)) {
      return token;
    }

    console.log('Token expired or expiring soon, attempting refresh...');
    return await this.refreshToken();
  }

  // Refresh the JWT token
  private async refreshToken(): Promise<string | null> {
    // Prevent multiple refresh requests
    if (this.refreshPromise) {
      return await this.refreshPromise;
    }

    this.refreshPromise = this.performTokenRefresh();
    
    try {
      const newToken = await this.refreshPromise;
      return newToken;
    } finally {
      this.refreshPromise = null;
    }
  }

  private async performTokenRefresh(): Promise<string | null> {
    try {
      const refreshToken = localStorage.getItem('lca_refresh_token');
      const user = localStorage.getItem('lca_user');
      
      if (!refreshToken || !user) {
        throw new Error('No refresh token or user data available');
      }

      const response = await fetch('http://localhost:5000/api/auth/refresh', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          refreshToken,
          user: JSON.parse(user)
        })
      });

      if (!response.ok) {
        throw new Error('Token refresh failed');
      }

      const data = await response.json();
      
      // Store new token
      localStorage.setItem('lca_token', data.token);
      if (data.refreshToken) {
        localStorage.setItem('lca_refresh_token', data.refreshToken);
      }
      
      console.log('Token refreshed successfully');
      return data.token;
      
    } catch (error) {
      console.error('Token refresh failed:', error);
      this.clearAuthData();
      this.redirectToLogin();
      return null;
    }
  }

  // Make authenticated API request with automatic token refresh
  public async makeAuthenticatedRequest(
    url: string, 
    options: RequestInit = {}
  ): Promise<Response> {
    const token = await this.getValidToken();
    
    if (!token) {
      throw new Error('No valid authentication token available');
    }

    const requestOptions: RequestInit = {
      ...options,
      headers: {
        ...options.headers,
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    };

    try {
      const response = await fetch(url, requestOptions);
      
      // Handle token expiration during request
      if (response.status === 401) {
        console.log('Received 401 - attempting token refresh and retry');
        
        const newToken = await this.refreshToken();
        if (newToken) {
          // Retry request with new token
          const retryOptions: RequestInit = {
            ...options,
            headers: {
              ...options.headers,
              'Authorization': `Bearer ${newToken}`,
              'Content-Type': 'application/json'
            }
          };
          
          return await fetch(url, retryOptions);
        } else {
          throw new Error('Authentication failed - please login again');
        }
      }
      
      return response;
    } catch (error) {
      console.error('Authenticated request failed:', error);
      throw error;
    }
  }

  // Check authentication status
  public isAuthenticated(): boolean {
    const token = localStorage.getItem('lca_token');
    const user = localStorage.getItem('lca_user');
    
    return !!(token && user && this.isTokenValid(token));
  }

  // Get current user
  public getCurrentUser(): User | null {
    try {
      const userData = localStorage.getItem('lca_user');
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.error('Error parsing user data:', error);
      return null;
    }
  }

  // Clear authentication data
  public clearAuthData(): void {
    localStorage.removeItem('lca_token');
    localStorage.removeItem('lca_refresh_token');
    localStorage.removeItem('lca_user');
    console.log('Authentication data cleared');
  }

  // Redirect to login page
  public redirectToLogin(): void {
    // Use React Router navigation if available, otherwise use window.location
    if (window.location.pathname !== '/login') {
      window.location.href = '/login';
    }
  }

  // Handle authentication errors
  public handleAuthError(error: any): void {
    console.error('Authentication error:', error);
    
    if (error.message && error.message.includes('TokenExpiredError')) {
      console.log('Token expired - clearing auth data and redirecting to login');
      this.clearAuthData();
      this.redirectToLogin();
    } else if (error.message && error.message.includes('JsonWebTokenError')) {
      console.log('Invalid token - clearing auth data and redirecting to login');
      this.clearAuthData();
      this.redirectToLogin();
    }
  }

  // Login with credentials
  public async login(email: string, password: string): Promise<{success: boolean, user?: User, error?: string}> {
    try {
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (!response.ok) {
        return { success: false, error: data.error || 'Login failed' };
      }

      // Store authentication data
      localStorage.setItem('lca_token', data.token);
      if (data.refreshToken) {
        localStorage.setItem('lca_refresh_token', data.refreshToken);
      }
      localStorage.setItem('lca_user', JSON.stringify(data.user));

      console.log('Login successful');
      return { success: true, user: data.user };

    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: 'Network error - please try again' };
    }
  }

  // Logout
  public async logout(): Promise<void> {
    try {
      const token = localStorage.getItem('lca_token');
      
      if (token) {
        // Notify server about logout
        await fetch('http://localhost:5000/api/auth/logout', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
      }
    } catch (error) {
      console.error('Logout request failed:', error);
    } finally {
      this.clearAuthData();
      this.redirectToLogin();
    }
  }
}

// Export singleton instance
export const authService = AuthService.getInstance();
export default authService;