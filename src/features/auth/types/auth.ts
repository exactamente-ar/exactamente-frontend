export interface PublicUser {
  id: string;
  email: string;
  displayName: string;
  role: 'user' | 'admin' | 'superadmin';
}

export interface AuthState {
  user: PublicUser | null;
  token: string | null;
  loading: boolean;
}

export interface LoginFormData {
  email: string;
  password: string;
}

export interface RegisterFormData {
  email: string;
  password: string;
  displayName: string;
}
