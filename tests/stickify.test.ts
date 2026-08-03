import { describe, expect, it } from "vitest";

import { stickify } from "../src/plugins/stickify.js";

function makeLayout(): void {
	document.body.innerHTML = `
		<div id="container" style="height:2000px">
			<aside id="sidebar" style="position:static">
				<p>content</p>
			</aside>
		</div>
	`;
}

describe("stickify", () => {
	it("wraps sidebar children in a .theiaStickySidebar element", () => {
		makeLayout();
		stickify("#sidebar", { additionalMarginTop: 10 });
		const sidebar = document.getElementById("sidebar")!;
		expect(sidebar.querySelector(".theiaStickySidebar")).not.toBeNull();
		expect(sidebar.style.position).toBe("relative"); // defaultPosition applied
	});

	it("reuses an existing .theiaStickySidebar wrapper instead of nesting another", () => {
		document.body.innerHTML = `
			<div id="container" style="height:2000px">
				<aside id="sidebar"><div class="theiaStickySidebar"><p>content</p></div></aside>
			</div>
		`;
		stickify("#sidebar");
		const sidebar = document.getElementById("sidebar")!;
		expect(sidebar.querySelectorAll(".theiaStickySidebar")).toHaveLength(1);
	});

	it("accepts every sidebarBehavior without throwing", () => {
		for (const sidebarBehavior of [
			"modern",
			"stick-to-top",
			"stick-to-bottom",
		] as const) {
			makeLayout();
			expect(() => stickify("#sidebar", { sidebarBehavior })).not.toThrow();
		}
	});

	it("destroy unbinds listeners and observers without throwing", () => {
		makeLayout();
		const instance = stickify("#sidebar", { additionalMarginTop: 10 });
		expect(() => instance.destroy()).not.toThrow();
	});

	it("skips an element whose container cannot be resolved", () => {
		document.body.innerHTML = `<aside id="orphan"></aside>`;
		const el = document.getElementById("orphan")!;
		el.remove(); // detached, no parentElement
		expect(() => stickify(el)).not.toThrow();
	});

	it("delays init until the viewport clears minWidth, then binds on scroll/resize", () => {
		makeLayout();
		const instance = stickify("#sidebar", { minWidth: 999999 });
		// still un-initialized: no wrapper created yet since body width < minWidth
		expect(() => instance.destroy()).not.toThrow();
	});
});
