/**
 * Merges user-supplied options over a set of defaults, dropping any key
 * whose value is explicitly `undefined` first.
 *
 * Plain `{ ...defaults, ...options }` lets `{ someOption: undefined }` (e.g.
 * from a form field that's blank, or a variable that happens to be
 * `undefined`) silently overwrite a real default instead of falling back to
 * it — a common footgun. This closes that gap.
 *
 * @param defaultValues - The base/default option values.
 * @param options - User-supplied options; `undefined`-valued keys are ignored.
 * @returns A merged object with every default preserved unless the caller
 * gave it an actual (non-`undefined`) value.
 */
export function mergeOptions<T extends object>(
	defaultValues: T,
	options: Partial<T>,
): T {
	const cleaned: Partial<T> = {};
	for (const key of Object.keys(options) as (keyof T)[]) {
		if (options[key] !== undefined) cleaned[key] = options[key];
	}
	return { ...defaultValues, ...cleaned };
}
