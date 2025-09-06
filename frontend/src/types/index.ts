// User types
export interface User {
  id: string;
  email: string;
  name: string;
  role: "USER" | "ADMIN";
  createdAt: string;
  updatedAt: string;
}

// Authentication types
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  name: string;
}

export interface AuthResponse {
  user: User;
  access_token: string;
  message: string;
}

// Product types
export interface Product {
  id: number;
  title: string;
  description?: string;
  price: number;
  image?: string;
  category?: string;
  stock: number;
  createdAt?: string;
  updatedAt?: string;
}

// Cart types
export interface CartItem {
  id: string;
  productId: string;
  product: Product;
  quantity: number;
  userId: string;
}

export interface Cart {
  id: string;
  userId: string;
  items: CartItem[];
  total: number;
}

// Order types
export interface Order {
  id: string;
  userId: string;
  items: CartItem[];
  total: number;
  status: "PENDING" | "PROCESSING" | "SHIPPED" | "DELIVERED" | "CANCELLED";
  createdAt: string;
  updatedAt: string;
}

// API response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

// Form types
export interface FormErrors {
  [key: string]: string;
}

export interface FormState {
  isLoading: boolean;
  errors: FormErrors;
  success: boolean;
}
