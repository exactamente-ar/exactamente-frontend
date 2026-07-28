/**
 * Puente entre el contrato de la API y los tipos que usa el frontend.
 *
 * A diferencia del panel admin, acá los tipos de dominio NO son un espejo de la
 * API: son view models que mezclan datos del backend con datos locales (las
 * correlativas, por ejemplo, salen de constantes de este repo).
 *
 * Por eso se toman campos puntuales con `Pick` en vez de alias completos. La
 * garantía es la misma: si el backend renombra o elimina un campo, el `Pick`
 * deja de compilar y el error apunta acá.
 *
 * Los tipos base se generan con `pnpm gen:api`. No editar `api.d.ts` a mano.
 */
import type { components } from './api';

export type ApiSchemas = components['schemas'];

/** Recurso tal como lo devuelve `GET /resources`. */
export type ApiResource = ApiSchemas['Resource'];

/** Materia del listado `GET /subjects`, con carreras y contadores. */
export type ApiSubject = ApiSchemas['SubjectWithCareers'];

/** Materia del detalle `GET /subjects/:id` — sin `resourceCounts`. */
export type ApiSubjectDetail = ApiSchemas['SubjectDetail'];

export type ApiSubjectCareer = ApiSchemas['SubjectCareer'];
export type ApiResourceCounts = ApiSchemas['ResourceCounts'];
export type ApiPublicUser = ApiSchemas['PublicUser'];
export type ApiResourceType = ApiSchemas['ResourceType'];
export type ApiResourceSubtype = ApiSchemas['ResourceSubtype'];
