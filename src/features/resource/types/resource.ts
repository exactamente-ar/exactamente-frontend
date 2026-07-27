import type { ApiResource } from '@/shared/types/contract';

/**
 * Los campos del recurso que la UI realmente usa.
 *
 * Se toman con `Pick` del contrato generado en vez de escribirlos a mano: si el
 * backend renombra o elimina alguno, esto deja de compilar y el error apunta al
 * campo exacto.
 */
type ResourceFields = Pick<
  ApiResource,
  'id' | 'title' | 'type' | 'subtype' | 'examYear' | 'examMonth' | 'topic'
>;

/**
 * `fileUrl` se estrecha a `string`. En el contrato es `string | null` porque un
 * recurso pendiente todavía no tiene archivo publicado, pero `GET /resources`
 * solo devuelve los `published`, que siempre lo tienen.
 */
export type ResourceFetch = ResourceFields & {
  fileUrl: string;
};

export type StringResource = 'Parciales' | 'Resumenes' | 'Finales';
