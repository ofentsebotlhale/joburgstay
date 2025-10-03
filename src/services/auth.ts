// Admin authentication service
export interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'super-admin';
  lastLogin: string;
}

export class AuthService {
  private static readonly ADMIN_EMAILS = [
    'admin@bluehaven.co.za',
    'owner@bluehaven.co.za',
    'manager@bluehaven.co.za'
  ];

  private static readonly ADMIN_PASSWORD = 'BlueHaven2024!'; // Change this in production

  // Check if user is authenticated
  static isAuthenticated(): boolean {
    const token = localStorage.getItem('adminToken');
    const user = localStorage.getItem('adminUser');
    return !!(token && user);
  }

  // Get current admin user
  static getCurrentUser(): AdminUser | null {
    try {
      const userStr = localStorage.getItem('adminUser');
      if (!userStr) return null;
      
      const user = JSON.parse(userStr);
      const token = localStorage.getItem('adminToken');
      
      if (!token) return null;
      
      // Check if token is expired (24 hours)
      const tokenData = JSON.parse(atob(token.split('.')[1]));
      if (Date.now() > tokenData.exp * 1000) {
        this.logout();
        return null;
      }
      
      return user;
    } catch (error) {
      console.error('Error getting current user:', error);
      this.logout();
      return null;
    }
  }

  // Login admin
  static async login(email: string, password: string): Promise<{ success: boolean; message: string; user?: AdminUser }> {
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return { success: false, message: 'Please enter a valid email address' };
    }

    // Check if email is authorized
    if (!this.ADMIN_EMAILS.includes(email.toLowerCase())) {
      return { success: false, message: 'Access denied. Unauthorized email address.' };
    }

    // Check password
    if (password !== this.ADMIN_PASSWORD) {
      return { success: false, message: 'Invalid password' };
    }

    // Create admin user
    const adminUser: AdminUser = {
      id: 'admin-' + Date.now(),
      email: email.toLowerCase(),
      name: this.getNameFromEmail(email),
      role: email.toLowerCase() === 'admin@bluehaven.co.za' ? 'super-admin' : 'admin',
      lastLogin: new Date().toISOString()
    };

    // Create token (simple JWT-like structure)
    const tokenPayload = {
      sub: adminUser.id,
      email: adminUser.email,
      role: adminUser.role,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60) // 24 hours
    };

    const token = btoa(JSON.stringify(tokenPayload));

    // Store in localStorage
    localStorage.setItem('adminToken', token);
    localStorage.setItem('adminUser', JSON.stringify(adminUser));

    return { 
      success: true, 
      message: 'Login successful! Welcome to Blue Haven Admin Panel.',
      user: adminUser
    };
  }

  // Logout admin
  static logout(): void {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
  }

  // Check if user has admin role
  static hasAdminRole(): boolean {
    const user = this.getCurrentUser();
    return user?.role === 'admin' || user?.role === 'super-admin';
  }

  // Check if user has super admin role
  static hasSuperAdminRole(): boolean {
    const user = this.getCurrentUser();
    return user?.role === 'super-admin';
  }

  // Get name from email
  private static getNameFromEmail(email: string): string {
    const emailMap: Record<string, string> = {
      'admin@bluehaven.co.za': 'Super Administrator',
      'owner@bluehaven.co.za': 'Property Owner',
      'manager@bluehaven.co.za': 'Property Manager'
    };
    
    return emailMap[email.toLowerCase()] || 'Administrator';
  }

  // Validate session
  static validateSession(): boolean {
    if (!this.isAuthenticated()) {
      return false;
    }

    const user = this.getCurrentUser();
    if (!user) {
      this.logout();
      return false;
    }

    return true;
  }
}
