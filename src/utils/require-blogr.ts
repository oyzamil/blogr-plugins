/**
 * `blogr` is an external peer dependency for plugins that talk to the feed
 * API (currently {@link relatify} and {@link createWidget}) — it's no
 * longer bundled into their output, so it must be resolvable at runtime:
 *
 * - npm / ESM / CJS consumers get it from their own module graph
 *   (`npm install blogr`); a missing install fails at import time with
 *   Node/the bundler's own "Cannot find module" error.
 * - IIFE / browser consumers have no module system, so the external import
 *   is mapped to a `Blogr` global instead. If that script tag is missing
 *   or loaded in the wrong order, the import silently resolves to
 *   `undefined` rather than throwing — this check is what catches that
 *   case with an actionable message instead of a cryptic
 *   "Blogr is not a constructor" deep inside the plugin.
 *
 * @param ctor - The imported (or global-mapped) `Blogr` binding.
 * @param pluginName - Name of the calling plugin, used in the error message.
 * @throws If `ctor` isn't a usable constructor.
 */
export function requireBlogr(
	ctor: unknown,
	pluginName: string,
): asserts ctor is new (...args: any[]) => any {
	if (typeof ctor === "function") return;

	throw new Error(
		`[blogr-plugins] ${pluginName}() requires the "blogr" package, but it wasn't found.\n` +
			`  - npm / ESM / CJS: npm install blogr\n` +
			"  - Browser / IIFE: load it as a separate script BEFORE this one:\n" +
			'      <script src="https://cdn.jsdelivr.net/npm/blogr"></script>',
	);
}
