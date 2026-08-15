import { describe, expect, it } from "vitest";

import { replacify } from "../src/plugins/replacify.js";

describe("replacify", () => {
	it("replaces plain text matches", () => {
		document.body.innerHTML = `<p id="p">Welcome to Blogr, the Blogr blog engine.</p>`;
		replacify("#p", /Blogr/g, "Blogr\u2122");
		expect(document.getElementById("p")!.textContent).toBe(
			"Welcome to Blogr\u2122, the Blogr\u2122 blog engine.",
		);
	});

	it("leaves markup structure untouched", () => {
		document.body.innerHTML = `<p id="p">Hello <b>World</b></p>`;
		replacify("#p", "World", "Universe");
		expect(document.getElementById("p")!.innerHTML).toBe(
			"Hello <b>Universe</b>",
		);
	});

	it("destroy reverts replaced text", () => {
		document.body.innerHTML = `<p id="p">Hello World</p>`;
		const instance = replacify("#p", "World", "Universe");
		instance.destroy();
		expect(document.getElementById("p")!.textContent).toBe("Hello World");
	});
});
