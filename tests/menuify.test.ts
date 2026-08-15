import { describe, expect, it } from "vitest";

import { menuify } from "../src/plugins/menuify.js";

function makeMenu(): HTMLUListElement {
	document.body.innerHTML = `
		<ul id="menu">
			<li><a>Home</a></li>
			<li><a>Blog</a></li>
			<li><a>_Web Design</a></li>
			<li><a>_SEO</a></li>
			<li><a>Contact</a></li>
		</ul>
	`;
	return document.getElementById("menu") as HTMLUListElement;
}

describe("menuify", () => {
	it("nests underscore-prefixed items under the previous item", () => {
		makeMenu();
		menuify("#menu");

		const blog = document.querySelectorAll("#menu > li")[1];
		expect(blog.classList.contains("has-sub")).toBe(true);

		const submenu = blog.querySelector("ul.sub-menu");
		expect(submenu).not.toBeNull();
		const subItems = submenu!.querySelectorAll("li a");
		expect(subItems).toHaveLength(2);
		expect(subItems[0].textContent).toBe("Web Design");
		expect(subItems[1].textContent).toBe("SEO");
	});

	it("leaves top-level item count correct after nesting", () => {
		makeMenu();
		menuify("#menu");
		const topLevel = document.querySelectorAll("#menu > li");
		expect(topLevel).toHaveLength(3); // Home, Blog, Contact
	});

	it("destroy restores the original flat structure", () => {
		makeMenu();
		const instance = menuify("#menu");
		instance.destroy();

		const topLevel = document.querySelectorAll("#menu > li");
		expect(topLevel).toHaveLength(5);
		expect(document.querySelector(".sub-menu")).toBeNull();
		expect(topLevel[2].querySelector("a")!.textContent).toBe("_Web Design");
	});
});
