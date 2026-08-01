import { beforeEach, describe, expect, it } from "vitest";
import { cookify } from "../src/plugins/cookify.js";

function clearCookies() {
	for (const key of Object.keys(cookify.getAll())) cookify.remove(key);
}

describe("cookify", () => {
	beforeEach(() => {
		clearCookies();
	});

	it("sets and gets a string value", () => {
		cookify.set("theme", "dark");
		expect(cookify.get("theme")).toBe("dark");
	});

	it("round-trips objects via JSON", () => {
		cookify.set("prefs", { a: 1, b: [1, 2, 3] });
		expect(cookify.get("prefs")).toEqual({ a: 1, b: [1, 2, 3] });
	});

	it("returns undefined for missing cookies", () => {
		expect(cookify.get("nope")).toBeUndefined();
	});

	it("removes a cookie", () => {
		cookify.set("temp", "x");
		expect(cookify.remove("temp")).toBe(true);
		expect(cookify.get("temp")).toBeUndefined();
	});

	it("getAll returns every cookie", () => {
		cookify.set("a", 1);
		cookify.set("b", 2);
		expect(cookify.getAll()).toEqual({ a: 1, b: 2 });
	});
});
