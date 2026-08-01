import { describe, expect, it } from "vitest";
import { isSupportedImage, resizeImage } from "../src/plugins/resizeImage.js";

const supportedUrl = "https://1.bp.blogspot.com/-abc/s1600/placeholder.jpg";
const unsupportedUrl = "https://example.com/image.jpg";

describe("isSupportedImage", () => {
	it("recognizes Blogger/Google-hosted image URLs", () => {
		expect(isSupportedImage(supportedUrl)).toBe(true);
	});

	it("rejects unrelated hosts", () => {
		expect(isSupportedImage(unsupportedUrl)).toBe(false);
	});

	it("accepts URL objects", () => {
		expect(isSupportedImage(new URL(supportedUrl))).toBe(true);
	});
});

describe("resizeImage", () => {
	it("applies default width/height/format when no options given", () => {
		const url = resizeImage(supportedUrl);
		expect(url).toContain("w640");
		expect(url).toContain("h360");
		expect(url).toContain("rw"); // default format: webp
	});

	it("applies custom width, height, and format", () => {
		const url = resizeImage(supportedUrl, { width: 400, height: 400, format: "webp" });
		expect(url).toContain("w400");
		expect(url).toContain("h400");
		expect(url).toContain("rw");
	});

	it("maps format option to the right flag", () => {
		expect(resizeImage(supportedUrl, { format: "jpeg" })).toContain("rj");
		expect(resizeImage(supportedUrl, { format: "png" })).toContain("rp");
		expect(resizeImage(supportedUrl, { format: "webp" })).toContain("rw");
	});

	it("maps crop option to the right flag", () => {
		expect(resizeImage(supportedUrl, { crop: "circle" })).toContain("cc");
		expect(resizeImage(supportedUrl, { crop: "square" })).toContain("ci");
		expect(resizeImage(supportedUrl)).not.toMatch(/-c[ci]/);
	});

	it("maps flip option to the right flag", () => {
		expect(resizeImage(supportedUrl, { flip: "horizontally" })).toContain("fh");
		expect(resizeImage(supportedUrl, { flip: "vertically" })).toContain("fv");
	});

	it("only adds a rotate flag for 90/180/270", () => {
		expect(resizeImage(supportedUrl, { rotate: 90 })).toContain("r90");
		expect(resizeImage(supportedUrl, { rotate: 180 })).toContain("r180");
		expect(resizeImage(supportedUrl, { rotate: 270 })).toContain("r270");
		expect(resizeImage(supportedUrl, { rotate: 45 })).not.toMatch(/-r45/);
		expect(resizeImage(supportedUrl)).not.toMatch(/-r\d/); // default 0: no rotate flag
	});

	it("adds a grayscale flag when requested", () => {
		expect(resizeImage(supportedUrl, { grayscale: true })).toContain("bw");
		expect(resizeImage(supportedUrl)).not.toContain("-bw");
	});

	it("replaces the existing size segment rather than appending to it", () => {
		const url = resizeImage(supportedUrl, { width: 200, height: 200 });
		expect(url).not.toContain("s1600");
		expect(url).toContain("/placeholder.jpg");
	});

	it("returns the original URL unchanged for unsupported hosts", () => {
		expect(resizeImage(unsupportedUrl, { width: 200 })).toBe(unsupportedUrl);
	});

	it("accepts URL objects as input", () => {
		const url = resizeImage(new URL(supportedUrl), { width: 100, height: 100 });
		expect(url).toContain("w100");
	});

	it("throws for invalid url types", () => {
		expect(() => resizeImage(123 as any)).toThrow(TypeError);
	});
});
