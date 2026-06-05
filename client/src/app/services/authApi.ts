import type { SigninFormData } from "@/lib/validationSchemas";
import type { AuthResponse, User } from "@/types/User";
import apiClient from "@/lib/axios";



const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;


export async function signin(data: SigninFormData): Promise<AuthResponse> {
  const res = await apiClient.post<AuthResponse>(
    `${API_BASE_URL}/auth/login`,
    data
  );
  return res.data;
}

export async function getCurrentUser(): Promise<AuthResponse> {
  const res = await apiClient.get<AuthResponse>(`${API_BASE_URL}/auth/me`);
  return res.data;
}

export async function updateProfile(data: {
  firstName: string;
  lastName: string;
  email: string;
}): Promise<User> {
  const res = await apiClient.put<{ user: User }>(
    `${API_BASE_URL}/auth/update-profile`,
    data
  );
  return res.data.user;
}

export async function updatePassword(data: {
  currentPassword: string;
  newPassword: string;
}): Promise<void> {
  await apiClient.put<void>(`${API_BASE_URL}/auth/update-password`, data);
}

export async function logoutUser(): Promise<void> {
  await apiClient.post(
    `${API_BASE_URL}/auth/logout`,
    {}
  );
}



export async function updateAvatar(style: string): Promise<AuthResponse> {
  const res = await apiClient.put<AuthResponse>(
    `${API_BASE_URL}/auth/update-avatar`,
    { style }
  );
  return res.data;
}
