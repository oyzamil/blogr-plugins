/**
 * Merges one or more named exports onto the shared `window.BlogrPlugins`
 * global. Used by every `src/browser/*.ts` entry so the
 * `(window as any).BlogrPlugins = Object.assign(...)` boilerplate exists in
 * exactly one place instead of being copy-pasted per plugin.
 *
 * @param exports - Map of export name -> value, e.g. `{ lazify }` or
 * `{ resizeImage, isSupportedImage }` for plugins with multiple exports.
 */
export function registerGlobalPlugin(exports: Record<string, unknown>): void {
	(window as any).BlogrPlugins = Object.assign(
		(window as any).BlogrPlugins ?? {},
		exports,
	);
}
