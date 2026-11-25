/**
 * Study mode is a local prototype (phase 1): off unless the build sets
 * `PUBLIC_STUDY_MODE=true`. Any other value, or none, keeps it off, so a merge
 * to `master` never exposes it in production or previews.
 */
export function isStudyModeEnabled(): boolean {
  return import.meta.env.PUBLIC_STUDY_MODE === 'true';
}
