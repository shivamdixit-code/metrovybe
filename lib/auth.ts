export type AuthUser = {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: "customer" | "business" | "admin";
  status: string;
};

export type LoginResponse = {
  message: string;
  token: string;
  user: AuthUser;
  business?: any;
};

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001";

export async function login(
  email: string,
  password: string,
  selectedRole: "customer" | "business" | "admin"
): Promise<LoginResponse> {
  const response = await fetch(`${API_URL}/api/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email,
      password,
      selectedRole,
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Login failed");
  }

  localStorage.setItem("metrovybe_token", data.token);
  localStorage.setItem("metrovybe_user", JSON.stringify(data.user));

  if (data.business) {
    localStorage.setItem(
      "metrovybe_business",
      JSON.stringify(data.business)
    );
  }

  return data;
}

export function getToken(): string | null {
  if (typeof window === "undefined") {
    return null;
  }

  return localStorage.getItem("metrovybe_token");
}

export function getUser(): AuthUser | null {
  if (typeof window === "undefined") {
    return null;
  }

  const value = localStorage.getItem("metrovybe_user");

  if (!value) {
    return null;
  }

  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
}

export function logout() {
  if (typeof window === "undefined") {
    return;
  }

  localStorage.removeItem("metrovybe_token");
  localStorage.removeItem("metrovybe_user");
  localStorage.removeItem("metrovybe_business");
}

export async function authenticatedFetch(
  path: string,
  options: RequestInit = {}
) {
  const token = getToken();

  const headers = new Headers(options.headers);

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  return fetch(`${API_URL}${path}`, {
    ...options,
    headers,
  });
}


