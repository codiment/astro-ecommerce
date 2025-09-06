import { apiService } from "../services/api";
import type { User } from "../types/index";

// Function to decode JWT (basic, without signature verification)
function decodeJWT(token: string): any {
  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join(""),
    );
    return JSON.parse(jsonPayload);
  } catch (error) {
    return null;
  }
}

// Check if the token is valid and has not expired
export function isTokenValid(token: string): boolean {
  try {
    const decoded = decodeJWT(token);
    if (!decoded || !decoded.exp) {
      return false;
    }

    // Check if the token has expired
    const currentTime = Math.floor(Date.now() / 1000);
    return decoded.exp > currentTime;
  } catch (error) {
    return false;
  }
}

// Get user information from the token
export function getUserFromToken(token: string): Partial<User> | null {
  try {
    const decoded = decodeJWT(token);
    if (!decoded) {
      return null;
    }

    return {
      id: decoded.sub,
      email: decoded.email,
      name: decoded.name,
      role: decoded.role,
    };
  } catch (error) {
    return null;
  }
}

// Check if the user is an administrator
export function isAdmin(token: string): boolean {
  const user = getUserFromToken(token);
  return user?.role === "ADMIN";
}

// Verify authentication and administrator role
export async function requireAdmin(
  request: Request,
): Promise<{ isValid: boolean; user?: Partial<User>; redirectTo?: string }> {
  // Get token from cookies
  const cookieHeader = request.headers.get("cookie");
  const cookies = cookieHeader
    ? Object.fromEntries(
        cookieHeader.split("; ").map((c) => {
          const [key, value] = c.split("=");
          return [key, decodeURIComponent(value)];
        }),
      )
    : {};

  const token = cookies.token;

  if (!token) {
    return { isValid: false, redirectTo: "/login" };
  }

  if (!isTokenValid(token)) {
    return { isValid: false, redirectTo: "/login" };
  }

  const user = getUserFromToken(token);
  if (!user) {
    return { isValid: false, redirectTo: "/login" };
  }

  if (user.role !== "ADMIN") {
    return { isValid: false, redirectTo: "/" };
  }

  return { isValid: true, user };
}

// Verify authentication only (without specific role)
export async function requireAuth(
  request: Request,
): Promise<{ isValid: boolean; user?: Partial<User>; redirectTo?: string }> {
  // Get token from cookies
  const cookieHeader = request.headers.get("cookie");
  const cookies = cookieHeader
    ? Object.fromEntries(
        cookieHeader.split("; ").map((c) => {
          const [key, value] = c.split("=");
          return [key, decodeURIComponent(value)];
        }),
      )
    : {};

  const token = cookies.token;

  if (!token) {
    return { isValid: false, redirectTo: "/login" };
  }

  if (!isTokenValid(token)) {
    return { isValid: false, redirectTo: "/login" };
  }

  const user = getUserFromToken(token);
  if (!user) {
    return { isValid: false, redirectTo: "/login" };
  }

  return { isValid: true, user };
}

// Function for the client side
export function getClientAuth(): {
  isAuthenticated: boolean;
  isAdmin: boolean;
  user?: Partial<User>;
} {
  if (typeof window === "undefined") {
    return { isAuthenticated: false, isAdmin: false };
  }

  const token = document.cookie
    .split("; ")
    .find((row) => row.startsWith("token="))
    ?.split("=")[1];

  if (!token || !isTokenValid(token)) {
    return { isAuthenticated: false, isAdmin: false };
  }

  const user = getUserFromToken(token);
  if (!user) {
    return { isAuthenticated: false, isAdmin: false };
  }

  return {
    isAuthenticated: true,
    isAdmin: user.role === "ADMIN",
    user,
  };
}

// Function for logout
export function logout(): void {
  if (typeof window !== "undefined") {
    // Remove token from cookies
    document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    // Remove token from API service
    apiService.removeToken();
    // Redirect to login
    window.location.href = "/login";
  }
}

// Function to set the token on the client
export function setAuthToken(token: string): void {
  if (typeof window !== "undefined") {
    // Set cookie with token (expires in 1 day)
    const expirationDate = new Date();
    expirationDate.setDate(expirationDate.getDate() + 1);
    document.cookie = `token=${token}; expires=${expirationDate.toUTCString()}; path=/; SameSite=Strict`;

    // Set token in the API service
    apiService.setToken(token);
  }
}
