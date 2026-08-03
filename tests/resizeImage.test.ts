import { beforeEach, describe, expect, it } from "vitest";

import {
	installResizeImagePrototypes,
	isSupportedImage,
	resizeImage,
} from "../src/plugins/resizeImage.js";

const oldShapeUrl = "https://1.bp.blogspot.com/-abc/s1600/placeholder.jpg";
const newShapeUrl =
	"https://lh3.googleusercontent.com/placeholder.jpg=w1200-h675-rw";
const unsupportedUrl = "https://example.com/image.jpg";
const ytUrl = "https://i.ytimg.com/vi/dQw4w9WgXcQ/hqdefault.jpg";
const ytMirrorUrl =
	"https://i3.ytimg.com/vi_webp/dQw4w9WgXcQ/sddefault.webp?x=1";

describe("isSupportedImage", () => {
	it("recognizes the old path-segment Blogger URL shape", () => {
		expect(isSupportedImage(oldShapeUrl)).toBe(true);
	});

	it("recognizes the new =-suffixed Blogger URL shape", () => {
		expect(isSupportedImage(newShapeUrl)).toBe(true);
	});

	it("recognizes YouTube thumbnail URLs, including mirrors", () => {
		expect(isSupportedImage(ytUrl)).toBe(true);
		expect(isSupportedImage(ytMirrorUrl)).toBe(true);
	});

	it("rejects unrelated hosts", () => {
		expect(isSupportedImage(unsupportedUrl)).toBe(false);
	});

	it("accepts URL objects", () => {
		expect(isSupportedImage(new URL(oldShapeUrl))).toBe(true);
	});
});

describe("resizeImage — Blogger images", () => {
	it("applies default width/height/format when no options given", () => {
		const url = resizeImage(oldShapeUrl);
		expect(url).toContain("w640");
		expect(url).toContain("h360");
		expect(url).toContain("rw"); // default format: webp
	});

	it("applies custom width, height, and format", () => {
		const url = resizeImage(oldShapeUrl, {
			width: 400,
			height: 400,
			format: "webp",
		});
		expect(url).toContain("w400");
		expect(url).toContain("h400");
		expect(url).toContain("rw");
	});

	it("maps format option to the right flag, mutually exclusive", () => {
		expect(resizeImage(oldShapeUrl, { format: "jpeg" })).toContain("rj");
		expect(resizeImage(oldShapeUrl, { format: "png" })).toContain("rp");

		const url = resizeImage(newShapeUrl, { format: "jpeg" }); // was rw
		expect(url).toContain("rj");
		expect(url).not.toContain("rw");
	});

	it("drops the legacy s{size} shorthand in favor of explicit w/h", () => {
		const url = resizeImage(oldShapeUrl, { width: 200, height: 200 });
		expect(url).not.toContain("s1600");
		expect(url).toContain("w200");
		expect(url).toContain("h200");
	});

	it("leaves crop/flip/rotate untouched unless explicitly requested", () => {
		const cropped = resizeImage(oldShapeUrl.replace("s1600", "s1600-cc"), {
			width: 300,
		});
		expect(cropped).toContain("cc");

		const url = resizeImage(oldShapeUrl, { width: 300 });
		expect(url).not.toMatch(/-c[ci]?\b/);
	});

	it("applies crop/flip/rotate when requested, mutually exclusive within each group", () => {
		let url = resizeImage(oldShapeUrl, { crop: "circle" });
		expect(url).toContain("cc");
		url = resizeImage(url.replace("s0", "cc"), { crop: "square" });
		expect(url).toContain("ci");
		expect(url).not.toContain("cc");

		expect(resizeImage(oldShapeUrl, { flip: "horizontally" })).toContain("fh");
		expect(resizeImage(oldShapeUrl, { flip: "vertically" })).toContain("fv");

		expect(resizeImage(oldShapeUrl, { rotate: 90 })).toContain("r90");
		expect(resizeImage(oldShapeUrl, { rotate: 270 })).toContain("r270");
	});

	it("ignores an invalid rotate value and clears any existing rotation", () => {
		const rotated = resizeImage(oldShapeUrl, { rotate: 90 });
		const cleared = resizeImage(rotated, { rotate: 45 });
		expect(cleared).not.toMatch(/-r\d+/);
	});

	it("preserves other recognized existing params (e.g. nu, pd, d)", () => {
		const withExtras = oldShapeUrl.replace("s1600", "s1600-nu-pd-d");
		const url = resizeImage(withExtras, { width: 100, height: 100 });
		expect(url).toContain("nu");
		expect(url).toContain("pd");
		expect(url).toContain("d");
	});

	it("replaces the existing param segment rather than appending to it", () => {
		const url = resizeImage(oldShapeUrl, { width: 200, height: 200 });
		expect(url).toContain("/placeholder.jpg");
		expect(url.match(/\/[^/]+\/placeholder\.jpg$/)).toBeTruthy();
	});

	it("returns the original URL unchanged for unsupported hosts", () => {
		expect(resizeImage(unsupportedUrl, { width: 200 })).toBe(unsupportedUrl);
	});

	it("accepts URL objects as input", () => {
		const url = resizeImage(new URL(oldShapeUrl), { width: 100, height: 100 });
		expect(url).toContain("w100");
	});

	it("throws for invalid url types", () => {
		expect(() => resizeImage(123 as any)).toThrow(TypeError);
	});
});

describe("resizeImage — YouTube thumbnails", () => {
	it("rewrites to the requested quality preset, always as webp", () => {
		const url = resizeImage(ytUrl, { ytThumbnail: "maxresdefault" });
		expect(url).toBe(
			"https://i.ytimg.com/vi_webp/dQw4w9WgXcQ/maxresdefault.webp",
		);
	});

	it("defaults to maxresdefault when no quality is given", () => {
		const url = resizeImage(ytUrl);
		expect(url).toContain("maxresdefault.webp");
	});

	it("normalizes mirror hosts to i.ytimg.com/vi_webp", () => {
		const url = resizeImage(ytMirrorUrl, { ytThumbnail: "hqdefault" });
		expect(url).toBe(
			"https://i.ytimg.com/vi_webp/dQw4w9WgXcQ/hqdefault.webp?x=1",
		);
	});

	it("ignores width/height/format/crop/flip/rotate for YouTube URLs", () => {
		const url = resizeImage(ytUrl, {
			width: 999,
			format: "png",
			crop: "circle",
		});
		expect(url).toBe(
			"https://i.ytimg.com/vi_webp/dQw4w9WgXcQ/maxresdefault.webp",
		);
	});
});

describe("installResizeImagePrototypes", () => {
	beforeEach(() => {
		installResizeImagePrototypes();
	});

	it("adds a non-enumerable String.prototype.resizeImage", () => {
		expect(oldShapeUrl.resizeImage({ width: 100, height: 100 })).toContain(
			"w100",
		);
		expect(
			Object.getOwnPropertyDescriptor(String.prototype, "resizeImage")
				?.enumerable,
		).toBe(false);
	});

	it("is safe to call more than once", () => {
		expect(() => installResizeImagePrototypes()).not.toThrow();
	});

	it("resizes every string in an array via Array.prototype.resizeImage", () => {
		const result = [oldShapeUrl, unsupportedUrl].resizeImage({
			width: 50,
			height: 50,
		});
		expect(result[0]).toContain("w50");
		expect(result[1]).toBe(unsupportedUrl);
	});

	it("resizes an <img>'s src and srcset via Element.prototype.resizeImage", () => {
		document.body.innerHTML = `
			<img id="pic" src="${oldShapeUrl}"
				srcset="${oldShapeUrl} 1x, ${newShapeUrl} 2x" />
		`;
		const img = document.getElementById("pic") as HTMLImageElement;
		img.resizeImage({ width: 320, height: 240 });

		expect(img.src).toContain("w320");
		const [first, second] = img.srcset.split(", ");
		expect(first).toContain("w320");
		expect(first.trim().endsWith("1x")).toBe(true);
		expect(second).toContain("w320");
		expect(second.trim().endsWith("2x")).toBe(true);
	});

	it("rewrites a background-image url() via Element.prototype.resizeImage", () => {
		document.body.innerHTML = `<div id="box" style="background-image: url('${oldShapeUrl}')"></div>`;
		const box = document.getElementById("box") as HTMLElement;
		box.resizeImage({ width: 150, height: 150 });

		expect(box.style.backgroundImage).toContain("w150");
	});

	it("resizes every element in a NodeList via NodeList.prototype.resizeImage", () => {
		document.body.innerHTML = `
			<img class="pic" src="${oldShapeUrl}" />
			<img class="pic" src="${oldShapeUrl}" />
		`;
		const list = document.querySelectorAll(
			".pic",
		) as NodeListOf<HTMLImageElement>;
		list.resizeImage({ width: 64, height: 64 });

		list.forEach((img) => expect(img.src).toContain("w64"));
	});
});
