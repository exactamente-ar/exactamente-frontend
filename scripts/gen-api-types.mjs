/**
 * Genera `src/shared/types/api.d.ts` desde el OpenAPI del backend.
 *
 *   pnpm gen:api          regenera los tipos
 *   pnpm gen:api --check  falla si quedaron viejos (lo usa el CI)
 *
 * Fuentes, en orden:
 *   1. ../exactamente-backend/openapi.json — el caso normal en el workspace
 *   2. $EXACTAMENTE_OPENAPI_URL o la API de producción — para un clon suelto
 *
 * El archivo generado se versiona: así el repo compila sin el backend al lado
 * y sin red, y cualquier cambio del contrato aparece como diff en el PR.
 */
import { execFileSync } from 'node:child_process';
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const OUT = resolve(root, 'src/shared/types/api.d.ts');
const LOCAL_SPEC = resolve(root, '../exactamente-backend/openapi.json');
const REMOTE_SPEC =
  process.env.EXACTAMENTE_OPENAPI_URL ?? 'https://api.exactamente.com.ar/openapi.json';

const source = existsSync(LOCAL_SPEC) ? LOCAL_SPEC : REMOTE_SPEC;
console.log(`· spec: ${source === LOCAL_SPEC ? 'backend local' : REMOTE_SPEC}`);

let generated;
try {
  generated = execFileSync('pnpm', ['exec', 'openapi-typescript', source], {
    encoding: 'utf-8',
    cwd: root,
    stdio: ['ignore', 'pipe', 'inherit'],
  });
} catch {
  console.error('\n✗ No se pudo generar desde', source);
  if (source !== LOCAL_SPEC) {
    console.error('  Cloná exactamente-backend al lado de este repo, o definí');
    console.error('  EXACTAMENTE_OPENAPI_URL apuntando a un /openapi.json accesible.');
  }
  process.exit(1);
}

const header = `/**
 * GENERADO — no editar a mano.
 *
 * Se produce con \`pnpm gen:api\` desde el OpenAPI de exactamente-backend.
 * Para cambiar algo de acá, tocá los schemas del backend (src/schemas/) y
 * volvé a generar.
 */

`;

const output = header + generated;

if (process.argv.includes('--check')) {
  const current = existsSync(OUT) ? readFileSync(OUT, 'utf-8') : '';
  if (current !== output) {
    console.error('\n✗ Los tipos de la API están desactualizados.');
    console.error('  El contrato del backend cambió. Corré `pnpm gen:api` y commiteá.');
    process.exit(1);
  }
  console.log('✓ Tipos de la API al día');
  process.exit(0);
}

mkdirSync(dirname(OUT), { recursive: true });
writeFileSync(OUT, output);
console.log(`✓ ${OUT.replace(root + '/', '')} generado`);
