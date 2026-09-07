// Datos y config del pedido de colaboración. Un único lugar para no tener el
// alias, la URL o la fecha escritos a mano en varios componentes.

export const CAFECITO_URL = 'https://cafecito.app/exactamente';

export const MERCADOPAGO_ALIAS = 'exactamente.web';

/** Costo mensual real que se comunica, sin vueltas. En USD. */
export const MONTHLY_COST_USD = 10;

/**
 * Fecha (`YYYY-MM-DD`) a partir de la cual el banner "puede cerrar" deja de
 * mostrarse. Es a propósito temporal: pasada esta fecha hay que tomar una
 * decisión consciente de renovarlo, no dejar un cartel de alarma para siempre.
 */
export const SUPPORT_BANNER_DEADLINE = '2026-10-06';

/** Clave de localStorage donde se guarda que el usuario cerró el banner. */
export const SUPPORT_BANNER_DISMISS_KEY = 'exactamente:supportBannerDismissed:v1';
