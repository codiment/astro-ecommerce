import type {
  ApiResponse,
  AuthResponse,
  LoginCredentials,
  RegisterData,
  User,
  Product,
  Cart,
  CartItem,
} from "../types";

const API_BASE_URL =
  import.meta.env.PUBLIC_API_URL || "http://localhost:3000/api";

class ApiService {
  private baseURL: string;
  private token: string | null = null;

  constructor() {
    this.baseURL = API_BASE_URL;
    // Retrieve token from cookies if it exists
    if (typeof window !== "undefined") {
      const token = document.cookie
        .split("; ")
        .find((row) => row.startsWith("token="))
        ?.split("=")[1];
      this.token = token || localStorage.getItem("auth_token");
    }
  }

  private getHeaders(): HeadersInit {
    const headers: HeadersInit = {
      "Content-Type": "application/json",
    };

    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`;
    }

    return headers;
  }

  private async handleResponse<T>(response: Response): Promise<ApiResponse<T>> {
    try {
      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: data.message || "Request Error",
        };
      }

      return {
        success: true,
        data,
      };
    } catch (error) {
      return {
        success: false,
        error: "Error processing the response",
      };
    }
  }

  // Authentication methods
  async login(
    credentials: LoginCredentials,
  ): Promise<ApiResponse<AuthResponse>> {
    const response = await fetch(`${this.baseURL}/auth/login`, {
      method: "POST",
      headers: this.getHeaders(),
      body: JSON.stringify(credentials),
    });

    const result = await this.handleResponse<AuthResponse>(response);

    if (result.success && result.data) {
      this.setToken(result.data.access_token);
    }

    return result;
  }

  async register(userData: RegisterData): Promise<ApiResponse<AuthResponse>> {
    const response = await fetch(`${this.baseURL}/auth/register`, {
      method: "POST",
      headers: this.getHeaders(),
      body: JSON.stringify(userData),
    });

    const result = await this.handleResponse<AuthResponse>(response);

    if (result.success && result.data) {
      this.setToken(result.data.access_token);
    }

    return result;
  }

  async getCurrentUser(): Promise<ApiResponse<User>> {
    const response = await fetch(`${this.baseURL}/auth/me`, {
      headers: this.getHeaders(),
    });

    return this.handleResponse<User>(response);
  }

  // Product methods
  async getProducts(): Promise<ApiResponse<Product[]>> {
    const response = await fetch(`${this.baseURL}/product`, {
      headers: this.getHeaders(),
    });

    return this.handleResponse<Product[]>(response);
  }

  async getProduct(id: string): Promise<ApiResponse<Product>> {
    const response = await fetch(`${this.baseURL}/product/${id}`, {
      headers: this.getHeaders(),
    });

    return this.handleResponse<Product>(response);
  }

  async createProduct(
    productData: Omit<Product, "id" | "createdAt" | "updatedAt">,
  ): Promise<ApiResponse<Product>> {
    const response = await fetch(`${this.baseURL}/product`, {
      method: "POST",
      headers: this.getHeaders(),
      body: JSON.stringify(productData),
    });

    return this.handleResponse<Product>(response);
  }

  async updateProduct(
    id: number,
    productData: Partial<Omit<Product, "id" | "createdAt" | "updatedAt">>,
  ): Promise<ApiResponse<Product>> {
    const response = await fetch(`${this.baseURL}/product/${id}`, {
      method: "PATCH",
      headers: this.getHeaders(),
      body: JSON.stringify(productData),
    });

    return this.handleResponse<Product>(response);
  }

  async deleteProduct(id: number): Promise<ApiResponse<void>> {
    const response = await fetch(`${this.baseURL}/product/${id}`, {
      method: "DELETE",
      headers: this.getHeaders(),
    });

    return this.handleResponse<void>(response);
  }

  // Cart methods
  async getCart(): Promise<ApiResponse<Cart>> {
    const response = await fetch(`${this.baseURL}/cart`, {
      headers: this.getHeaders(),
    });

    return this.handleResponse<Cart>(response);
  }

  async addToCart(
    productId: string,
    quantity: number,
  ): Promise<ApiResponse<CartItem>> {
    const response = await fetch(`${this.baseURL}/cart/add`, {
      method: "POST",
      headers: this.getHeaders(),
      body: JSON.stringify({ productId: parseInt(productId), quantity }),
    });

    return this.handleResponse<CartItem>(response);
  }

  async updateCartItem(
    itemId: string,
    quantity: number,
  ): Promise<ApiResponse<CartItem>> {
    const response = await fetch(`${this.baseURL}/cart/update`, {
      method: "PATCH",
      headers: this.getHeaders(),
      body: JSON.stringify({ cartItemId: parseInt(itemId), quantity }),
    });

    return this.handleResponse<CartItem>(response);
  }

  async removeFromCart(itemId: string): Promise<ApiResponse<void>> {
    const response = await fetch(`${this.baseURL}/cart/remove/${itemId}`, {
      method: "DELETE",
      headers: this.getHeaders(),
    });

    return this.handleResponse<void>(response);
  }

  // Order methods
  async createOrder(): Promise<ApiResponse<any>> {
    const response = await fetch(`${this.baseURL}/order`, {
      method: "POST",
      headers: this.getHeaders(),
      body: JSON.stringify({}),
    });

    return this.handleResponse<any>(response);
  }

  async getUserOrders(): Promise<ApiResponse<any[]>> {
    const response = await fetch(`${this.baseURL}/order`, {
      headers: this.getHeaders(),
    });

    return this.handleResponse<any[]>(response);
  }

  // Admin order methods
  async getAllOrders(params?: {
    page?: number;
    limit?: number;
    status?: string;
    search?: string;
  }): Promise<ApiResponse<any>> {
    let url = `${this.baseURL}/dashboard/orders`;

    if (params) {
      const searchParams = new URLSearchParams();
      if (params.page) searchParams.append("page", params.page.toString());
      if (params.limit) searchParams.append("limit", params.limit.toString());
      if (params.status) searchParams.append("status", params.status);
      if (params.search) searchParams.append("search", params.search);

      if (searchParams.toString()) {
        url += `?${searchParams.toString()}`;
      }
    }

    const response = await fetch(url, {
      headers: this.getHeaders(),
    });

    return this.handleResponse<any>(response);
  }

  async getOrderById(id: number): Promise<ApiResponse<any>> {
    const response = await fetch(`${this.baseURL}/dashboard/orders/${id}`, {
      headers: this.getHeaders(),
    });

    return this.handleResponse<any>(response);
  }

  async updateOrderStatus(
    id: number,
    status: string,
  ): Promise<ApiResponse<any>> {
    const response = await fetch(
      `${this.baseURL}/dashboard/orders/${id}/status`,
      {
        method: "PATCH",
        headers: this.getHeaders(),
        body: JSON.stringify({ status }),
      },
    );

    return this.handleResponse<any>(response);
  }

  async getDashboardStats(): Promise<ApiResponse<any>> {
    const response = await fetch(`${this.baseURL}/dashboard/stats`, {
      headers: this.getHeaders(),
    });

    return this.handleResponse<any>(response);
  }

  // User management methods
  async getUsers(): Promise<ApiResponse<User[]>> {
    const response = await fetch(`${this.baseURL}/user`, {
      headers: this.getHeaders(),
    });

    return this.handleResponse<User[]>(response);
  }

  async getUser(id: number): Promise<ApiResponse<User>> {
    const response = await fetch(`${this.baseURL}/user/${id}`, {
      headers: this.getHeaders(),
    });

    return this.handleResponse<User>(response);
  }

  async createUser(userData: {
    email: string;
    name?: string;
    password: string;
    role?: "USER" | "ADMIN";
  }): Promise<ApiResponse<User>> {
    const response = await fetch(`${this.baseURL}/user`, {
      method: "POST",
      headers: this.getHeaders(),
      body: JSON.stringify(userData),
    });

    return this.handleResponse<User>(response);
  }

  async updateUser(
    id: number,
    userData: {
      email?: string;
      name?: string;
      password?: string;
      role?: "USER" | "ADMIN";
    },
  ): Promise<ApiResponse<User>> {
    const response = await fetch(`${this.baseURL}/user/${id}`, {
      method: "PATCH",
      headers: this.getHeaders(),
      body: JSON.stringify(userData),
    });

    return this.handleResponse<User>(response);
  }

  async deleteUser(id: number): Promise<ApiResponse<void>> {
    const response = await fetch(`${this.baseURL}/user/${id}`, {
      method: "DELETE",
      headers: this.getHeaders(),
    });

    return this.handleResponse<void>(response);
  }

  // Profile management methods
  async getProfile(): Promise<ApiResponse<User>> {
    const response = await fetch(`${this.baseURL}/user/profile`, {
      headers: this.getHeaders(),
    });

    return this.handleResponse<User>(response);
  }

  async updateProfile(profileData: {
    name?: string;
    email?: string;
  }): Promise<ApiResponse<User>> {
    const response = await fetch(`${this.baseURL}/user/profile`, {
      method: "PATCH",
      headers: this.getHeaders(),
      body: JSON.stringify(profileData),
    });

    return this.handleResponse<User>(response);
  }

  async changePassword(passwordData: {
    currentPassword: string;
    newPassword: string;
  }): Promise<ApiResponse<{ message: string }>> {
    const response = await fetch(`${this.baseURL}/user/password`, {
      method: "PATCH",
      headers: this.getHeaders(),
      body: JSON.stringify(passwordData),
    });

    return this.handleResponse<{ message: string }>(response);
  }

  // Token management
  setToken(token: string): void {
    this.token = token;
    if (typeof window !== "undefined") {
      // Set in localStorage for compatibility
      localStorage.setItem("auth_token", token);
      // Set cookie with token (expires in 1 day)
      const expirationDate = new Date();
      expirationDate.setDate(expirationDate.getDate() + 1);
      document.cookie = `token=${token}; expires=${expirationDate.toUTCString()}; path=/; SameSite=Strict`;
    }
  }

  removeToken(): void {
    this.token = null;
    if (typeof window !== "undefined") {
      // Remove from localStorage
      localStorage.removeItem("auth_token");
      // Remove cookie
      document.cookie =
        "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    }
  }

  getToken(): string | null {
    return this.token;
  }

  isAuthenticated(): boolean {
    return !!this.token;
  }
}

export const apiService = new ApiService();
export default apiService;
