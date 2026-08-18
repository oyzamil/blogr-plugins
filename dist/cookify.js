/*! blogr-plugins v0.0.3 - iife | M.Muzammil <https://muzammil.work/> | MIT License */
var BlogrCookify = (function(exports) {

Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
//#region src/plugins/cookify.ts
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
	const cookify = {
		/**
		* Writes a cookie.
		* @param name - Cookie name.
		* @param value - Any JSON-serializable value.
		* @param options - {@link CookifySetOptions}
		*/
		set(name, value, options = {}) {
			const encoded = encodeURIComponent(JSON.stringify(value));
			const parts = [`${encodeURIComponent(name)}=${encoded}`];
			if (options.expiresDays != null) {
				const date = /* @__PURE__ */ new Date();
				date.setTime(date.getTime() + options.expiresDays * 864e5);
				parts.push(`expires=${date.toUTCString()}`);
			}
			parts.push(`path=${options.path ?? "/"}`);
			if (options.domain) parts.push(`domain=${options.domain}`);
			if (options.secure) parts.push("secure");
			parts.push(`samesite=${options.sameSite ?? "Lax"}`);
			document.cookie = parts.join("; ");
		},
		/**
		* Reads a cookie.
		* @param name - Cookie name.
		* @returns The parsed value, or `undefined` if not set.
		*/
		get(name) {
			const target = encodeURIComponent(name);
			for (const pair of document.cookie ? document.cookie.split("; ") : []) {
				const idx = pair.indexOf("=");
				if ((idx === -1 ? pair : pair.slice(0, idx)) !== target) continue;
				const raw = idx === -1 ? "" : pair.slice(idx + 1);
				try {
					return JSON.parse(decodeURIComponent(raw));
				} catch {
					return decodeURIComponent(raw);
				}
			}
		},
		/**
		* Reads every cookie.
		* @returns A record of all cookies, parsed the same way as {@link cookify.get}.
		*/
		getAll() {
			const result = {};
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
		remove(name, options = {}) {
			const existed = this.get(name) !== void 0;
			this.set(name, "", {
				...options,
				expiresDays: -1
			});
			return existed;
		}
	};

//#endregion
//#region src/browser/cookify.ts
	window.BlogrPlugins = Object.assign(window.BlogrPlugins ?? {}, { cookify });

//#endregion
exports.cookify = cookify;
return exports;
})({});