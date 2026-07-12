import { api } from './api';

export interface AuthUser {
  _id: string;
  name: string;
  email: string;
  avatar?: string | null;
  profileImage?: string | null;
  saveUltrasoundImages?: boolean;
  provider: 'local' | 'google';
}

export interface AuthResponse {
  token: string;
  user: AuthUser;
}

const TOKEN_KEY = 'ovacare_token';
const USER_KEY = 'ovacare_user';

// ─── Token helpers ──────────────────────────────────────────────────────────

export function saveSession(token: string, user: AuthUser) {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function getStoredUser(): AuthUser | null {
  const raw = localStorage.getItem(USER_KEY);
  return raw ? (JSON.parse(raw) as AuthUser) : null;
}

export function clearSession() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

export function isLoggedIn(): boolean {
  return !!getToken();
}

// ─── API calls ──────────────────────────────────────────────────────────────

export async function signup(data: {
  name: string;
  email: string;
  password: string;
  agreedToTerms: boolean;
}): Promise<AuthResponse> {
  const res = await api.post<AuthResponse>('/api/auth/signup', data);
  saveSession(res.data.token, res.data.user);
  return res.data;
}

export async function login(data: {
  email: string;
  password: string;
}): Promise<AuthResponse> {
  const res = await api.post<AuthResponse>('/api/auth/login', data);
  saveSession(res.data.token, res.data.user);
  return res.data;
}

export async function googleAuth(credential: string): Promise<AuthResponse> {
  const res = await api.post<AuthResponse>('/api/auth/google', { credential });
  saveSession(res.data.token, res.data.user);
  return res.data;
}
