export interface SupportBannerState {
  /** Momento actual. Se inyecta para poder testear el corte por fecha. */
  now?: Date;
  /** Fecha límite en formato `YYYY-MM-DD`. Pasada esa fecha el banner no se muestra más. */
  deadline: string;
  /** Timestamp ISO guardado cuando el usuario cerró el banner, o `null` si nunca lo cerró. */
  dismissedAt: string | null;
}

/**
 * Decide si el banner de colaboración tiene que mostrarse.
 *
 * Reglas, en orden:
 * 1. Si el usuario lo cerró alguna vez, no vuelve.
 * 2. Si ya pasó la fecha límite, no se muestra (es un aviso a propósito temporal:
 *    un cartel de catástrofe permanente deja de leerse).
 * 3. Si la fecha límite está mal escrita, se muestra igual — un error de config
 *    no debería silenciar el pedido.
 */
export function shouldShowSupportBanner({
  now = new Date(),
  deadline,
  dismissedAt,
}: SupportBannerState): boolean {
  if (dismissedAt) return false;

  const deadlineDate = new Date(`${deadline}T23:59:59`);
  if (Number.isNaN(deadlineDate.getTime())) return true;

  return now.getTime() <= deadlineDate.getTime();
}
