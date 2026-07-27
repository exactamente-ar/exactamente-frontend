import type { ApiPublicUser } from '@/shared/types/contract';

/**
 * Los campos del usuario que la UI usa. `emailVerified` y `createdAt` también
 * llegan en la respuesta, pero no se muestran en ningún lado.
 */
export type PublicUser = Pick<ApiPublicUser, 'id' | 'email' | 'displayName' | 'photoUrl' | 'role'>;

export interface AuthState {
  user: PublicUser | null;
  token: string | null;
  loading: boolean;
}
