/** Options accepted when writing a cookie with {@link cookify}. */
export interface CookifySetOptions {
	/** Days until expiry. Omit for a session cookie. */
	expiresDays?: number;
	/** Cookie path. Default `"/"`. */
	path?: string;
	/** Cookie domain. */
	domain?: string;
	/** Send only over HTTPS. */
	secure?: boolean;
	/** SameSite policy. Default `"Lax"`. */
	sameSite?: "Strict" | "Lax" | "None";
}

export interface Cookify {
	/**
	 * Writes a cookie.
	 * @param name - Cookie name.
	 * @param value - Any JSON-serializable value.
	 * @param options Configuration object.
	 * See {@link CookifySetOptions}.
	 */
	set(name: string, value: unknown, options?: CookifySetOptions): void;

	/**
	 * Reads a cookie.
	 * @param name - Cookie name.
	 * @returns Parsed value, or `undefined` if not set.
	 */
	get<T = string>(name: string): T | undefined;

	/**
	 * Reads every cookie.
	 * @returns Record containing all cookies.
	 */
	getAll(): Record<string, unknown>;

	/**
	 * Deletes a cookie.
	 * @param name - Cookie name.
	 * @param options - Must match `path`/`domain` used when setting cookie.
	 * @returns `true` if cookie existed.
	 */
	remove(
		name: string,
		options?: Pick<CookifySetOptions, "path" | "domain">,
	): boolean;
}

/**
 * Small, dependency-free cookie utility (a typed replacement for the classic
 * `js-cookie` plugin). Values are JSON-encoded automatically, so you can
 * store strings, numbers, booleans, or plain objects/arrays.
 *
 * @example
 * ```ts
 * import { cookify } from "blogr-plugins";
 * cookify.set("theme", "dark", { expiresDays: 365 });
 * cookify.get("theme"); // "dark"
 * cookify.remove("theme");
 * ```
 */
export const cookify: Cookify = {
	/**
	 * Writes a cookie.
	 * @param name - Cookie name.
	 * @param value - Any JSON-serializable value.
	 * @param options - {@link CookifySetOptions}
	 */
	set(name: string, value: unknown, options: CookifySetOptions = {}): void {
		const encoded = encodeURIComponent(JSON.stringify(value));
		const parts = [`${encodeURIComponent(name)}=${encoded}`];

		if (options.expiresDays != null) {
			const date = new Date();
			date.setTime(date.getTime() + options.expiresDays * 864e5);
			parts.push(`expires=${date.toUTCString()}`);
		}
		parts.push(`path=${options.path ?? "/"}`);
		if (options.domain) parts.push(`domain=${options.domain}`);
		if (options.secure) parts.push("secure");
		parts.push(`samesite=${options.sameSite ?? "Lax"}`);

		// biome-ignore lint/suspicious/noDocumentCookie: Expected because its a plugin file
		document.cookie = parts.join("; ");
	},

	/**
	 * Reads a cookie.
	 * @param name - Cookie name.
	 * @returns The parsed value, or `undefined` if not set.
	 */
	get<T = string>(name: string): T | undefined {
		const target = encodeURIComponent(name);
		for (const pair of document.cookie ? document.cookie.split("; ") : []) {
			const idx = pair.indexOf("=");
			const key = idx === -1 ? pair : pair.slice(0, idx);
			if (key !== target) continue;
			const raw = idx === -1 ? "" : pair.slice(idx + 1);
			try {
				return JSON.parse(decodeURIComponent(raw)) as T;
			} catch {
				return decodeURIComponent(raw) as unknown as T;
			}
		}
		return undefined;
	},

	/**
	 * Reads every cookie.
	 * @returns A record of all cookies, parsed the same way as {@link cookify.get}.
	 */
	getAll(): Record<string, unknown> {
		const result: Record<string, unknown> = {};
		for (const pair of document.cookie ? document.cookie.split("; ") : []) {
			const idx = pair.indexOf("=");
			if (idx === -1) continue;
			const key = decodeURIComponent(pair.slice(0, idx));
			result[key] = this.get(key);
		}
		return result;
	},

	/**
	 * Deletes a cookie.
	 * @param name - Cookie name.
	 * @param options - Must match the `path`/`domain` used when setting it.
	 * @returns `true` if the cookie was present beforehand.
	 */
	remove(
		name: string,
		options: Pick<CookifySetOptions, "path" | "domain"> = {},
	): boolean {
		const existed = this.get(name) !== undefined;
		this.set(name, "", { ...options, expiresDays: -1 });
		return existed;
	},
};
