export interface PublicUser {
  id: string;
  email: string;
  displayName: string;
  photoUrl: string | null;
  role: 'user' | 'admin' | 'superadmin';
}

export interface AuthState {
  user: PublicUser | null;
  token: string | null;
  loading: boolean;
}

