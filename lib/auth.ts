export type AuthUser = {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: "customer" | "business" | "admin";
  status: string;
  emailVerified?: boolean;
  phoneVerified?: boolean;
  location?: {
    latitude?: number;
    longitude?: number;
    label?: string;
  };
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
  selectedRole?: "customer" | "business" | "admin"
): Promise<LoginResponse> {
  const response = await fetch(`${API_URL}/api/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email,
      password,
      ...(selectedRole ? { selectedRole } : {}),
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Login failed");
  }

  localStorage.setItem("metrovybe_token", data.token);
  document.cookie = `metrovybe_token=${encodeURIComponent(data.token)}; path=/; SameSite=Lax`;
  localStorage.setItem("metrovybe_user", JSON.stringify(data.user));

  if (data.business) {
    localStorage.setItem(
      "metrovybe_business",
      JSON.stringify(data.business)
    );
  }

  return data;
}


export async function sendLoginPhoneOtp(
  phone: string,
  selectedRole: "customer" | "business"
): Promise<{ message: string; sent: boolean }> {
  const response = await fetch(
    `${API_URL}/api/auth/send-login-phone-otp`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        phone,
        selectedRole,
      }),
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Unable to send WhatsApp OTP");
  }

  return data;
}

export async function verifyLoginPhoneOtp(
  phone: string,
  otp: string,
  selectedRole: "customer" | "business"
): Promise<LoginResponse> {
  const response = await fetch(
    `${API_URL}/api/auth/verify-login-phone-otp`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        phone,
        otp,
        selectedRole,
      }),
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Invalid WhatsApp OTP");
  }

  localStorage.setItem("metrovybe_token", data.token);
  document.cookie = `metrovybe_token=${encodeURIComponent(data.token)}; path=/; SameSite=Lax`;
  localStorage.setItem(
    "metrovybe_user",
    JSON.stringify(data.user)
  );

  if (data.business) {
    localStorage.setItem(
      "metrovybe_business",
      JSON.stringify(data.business)
    );
  } else {
    localStorage.removeItem("metrovybe_business");
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




export async function getMyProfile(): Promise<AuthUser> {
  const response = await authenticatedFetch("/api/auth/me");
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Unable to load profile");
  }

  localStorage.setItem("metrovybe_user", JSON.stringify(data.user));
  return data.user;
}

export async function updateMyProfile(payload: {
  name: string;
  phone: string;
  gender?: AuthUser extends any ? string : never;
  dateOfBirth?: string;
  location?: {
    latitude?: number;
    longitude?: number;
    label?: string;
  };
}): Promise<AuthUser> {
  const response = await authenticatedFetch("/api/auth/me", {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Unable to update profile");
  }

  localStorage.setItem("metrovybe_user", JSON.stringify(data.user));
  return data.user;
}


export async function forgotPassword(email: string) {
  const response = await fetch(
    `${API_URL}/api/auth/forgot-password`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
      }),
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Unable to send password reset email");
  }

  return data;
}

export async function resetPassword(
  email: string,
  token: string,
  password: string
) {
  const response = await fetch(
    `${API_URL}/api/auth/reset-password`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        token,
        password,
      }),
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Unable to reset password");
  }

  return data;
}
