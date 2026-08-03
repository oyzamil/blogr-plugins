import * as BlogrPlugins from "./../dist/blogr-plugins.esm.js";

const BOOLEAN_PARAMS = new Set([
	"nu",
	"c",
	"cc",
	"ci",
	"p",
	"fh",
	"fv",
	"pd",
	"rj",
	"rp",
	"rw",
	"rwa",
	"rg",
	"rh",
	"h",
	"d",
	"no",
	"o",
	"k",
]);
const NUMBER_PARAMS = new Set(["w", "h", "s", "r", "ba", "br", "b", "e", "a"]);
const FORMAT_PARAMS = ["rj", "rp", "rw", "rwa", "rg", "rh"];
const FLIP_PARAMS = ["fh", "fv"];
const CROP_PARAMS = ["cc", "ci"];
const HOST_PATTERN =
	/^(https?:)?(\/\/)[^/]*\.(googleusercontent\.com|blogspot\.com)/;
const PARAM_SEGMENT_PATTERN =
	/[^/]+(?=\/[^/]+\.[^/?]+(?:\?|$))|(?<==)[^=&?/]+(?=\?|$)/;
const YOUTUBE_THUMBNAIL_PATTERN =
	/^(https?:)?(\/\/)(?:i[1-4]?\.ytimg\.com|img\.youtube\.com)\/vi(?:_webp)?\/([^/]+)\/[a-z0-9]+\.(?:jpe?g|webp)((?:\?[^#]*)?)$/i;
const defaults = {
	height: 360,
	width: 640,
	format: "webp",
	ytThumbnail: "maxresdefault",
};

function toUrlString(url) {
	return String(url);
}

function getParamInfo(part) {
	const hexMatch = /^(c|bc|pc)(0x[0-9A-Fa-f]{6,8})$/.exec(part);
	if (hexMatch) return ["hex", hexMatch[1], hexMatch[2]];
	const numMatch = /^([a-z]{1,3})(\d+)$/i.exec(part);
	if (numMatch && NUMBER_PARAMS.has(numMatch[1]))
		return ["num", numMatch[1], Number(numMatch[2])];
	if (BOOLEAN_PARAMS.has(part)) return ["bool", part, true];
	return null;
}

function parseParams(segment) {
	const params = new Map();
	for (const part of segment.split("-")) {
		const info = getParamInfo(part);
		if (!info) continue;
		params.set(info[1], { kind: info[0], value: info[2] });
	}
	return params;
}

function serializeParams(params) {
	const parts = [];
	for (const [prefix, { kind, value }] of params)
		parts.push(kind === "bool" ? prefix : `${prefix}${value}`);
	return parts.join("-");
}

function setExclusive(params, group, prefix) {
	for (const other of group) if (other !== prefix) params.delete(other);
	params.set(prefix, { kind: "bool", value: true });
}

function resizeYouTubeThumbnail(match, options) {
	const protocol = match[1] || "https:";
	const videoId = match[3];
	const query = match[4] || "";
	const quality = options.ytThumbnail || defaults.ytThumbnail;
	return `${protocol}//i.ytimg.com/vi_webp/${videoId}/${quality}.webp${query}`;
}

function isSupportedImage(url) {
	const str = toUrlString(url);
	if (YOUTUBE_THUMBNAIL_PATTERN.test(str)) return true;
	return HOST_PATTERN.test(str) && PARAM_SEGMENT_PATTERN.test(str);
}

function resizeImage(url, options) {
	options = options || {};
	const str = toUrlString(url);
	const ytMatch = str.match(YOUTUBE_THUMBNAIL_PATTERN);
	if (ytMatch) return resizeYouTubeThumbnail(ytMatch, options);
	if (!HOST_PATTERN.test(str)) return str;
	const match = str.match(PARAM_SEGMENT_PATTERN);
	if (!match || match.index === undefined) return str;
	const params = parseParams(match[0]);
	params.delete("s");
	params.set("w", { kind: "num", value: options.width ?? defaults.width });
	params.set("h", { kind: "num", value: options.height ?? defaults.height });
	const format = options.format || defaults.format;
	if (format === "jpeg") setExclusive(params, FORMAT_PARAMS, "rj");
	else if (format === "png") setExclusive(params, FORMAT_PARAMS, "rp");
	else if (format === "webp") setExclusive(params, FORMAT_PARAMS, "rw");
	if (options.crop === "circle") setExclusive(params, CROP_PARAMS, "cc");
	else if (options.crop === "square") setExclusive(params, CROP_PARAMS, "ci");
	if (options.flip === "horizontally") setExclusive(params, FLIP_PARAMS, "fh");
	else if (options.flip === "vertically")
		setExclusive(params, FLIP_PARAMS, "fv");
	if (options.rotate !== undefined && options.rotate !== "") {
		const r = Number(options.rotate);
		if (r === 90 || r === 180 || r === 270)
			params.set("r", { kind: "num", value: r });
		else params.delete("r");
	}
	const newSegment = serializeParams(params);
	return (
		str.slice(0, match.index) +
		newSegment +
		str.slice(match.index + match[0].length)
	);
}

function extractBackgroundImageUrl(value) {
	const match = /url\((['"]?)(.*?)\1\)/.exec(value);
	return match ? match[2] : null;
}

function applyResizeImageToElement(el, options) {
	if (el instanceof HTMLImageElement) {
		if (el.src) el.src = resizeImage(el.src, options);
		return;
	}
	if (el instanceof HTMLElement && el.style.backgroundImage) {
		const bgUrl = extractBackgroundImageUrl(el.style.backgroundImage);
		if (bgUrl)
			el.style.backgroundImage = `url("${resizeImage(bgUrl, options)}")`;
	}
}

function installResizeImagePrototypes() {
	if (!Object.hasOwn(String.prototype, "resizeImage")) {
		Object.defineProperty(String.prototype, "resizeImage", {
			value: function (options) {
				return resizeImage(String(this), options || {});
			},
			writable: true,
			configurable: true,
			enumerable: false,
		});
	}
	if (!Object.hasOwn(Array.prototype, "resizeImage")) {
		Object.defineProperty(Array.prototype, "resizeImage", {
			value: function (options) {
				const opts = options || {};
				return this.map((item) => {
					if (typeof item === "string") return resizeImage(item, opts);
					if (item instanceof Element) {
						applyResizeImageToElement(item, opts);
						return item;
					}
					return item;
				});
			},
			writable: true,
			configurable: true,
			enumerable: false,
		});
	}
	if (!Object.hasOwn(Element.prototype, "resizeImage")) {
		Object.defineProperty(Element.prototype, "resizeImage", {
			value: function (options) {
				applyResizeImageToElement(this, options || {});
				return this;
			},
			writable: true,
			configurable: true,
			enumerable: false,
		});
	}
	if (!Object.hasOwn(NodeList.prototype, "resizeImage")) {
		Object.defineProperty(NodeList.prototype, "resizeImage", {
			value: function (options) {
				const opts = options || {};
				this.forEach((node) => {
					if (node instanceof Element) applyResizeImageToElement(node, opts);
				});
				return this;
			},
			writable: true,
			configurable: true,
			enumerable: false,
		});
	}
}

function diffHighlight(before, after) {
	let start = 0;
	const minLen = Math.min(before.length, after.length);
	while (start < minLen && before[start] === after[start]) start++;
	let endB = before.length,
		endA = after.length;
	while (endB > start && endA > start && before[endB - 1] === after[endA - 1]) {
		endB--;
		endA--;
	}
	return {
		beforePre: before.slice(0, start),
		beforeMid: before.slice(start, endB),
		beforePost: before.slice(endB),
		afterPre: after.slice(0, start),
		afterMid: after.slice(start, endA),
		afterPost: after.slice(endA),
	};
}

function esc(s) {
	return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function renderDiff(beforeEl, afterEl, before, after) {
	const d = diffHighlight(before, after);
	beforeEl.innerHTML =
		esc(d.beforePre) +
		(d.beforeMid ? `<del>${esc(d.beforeMid)}</del>` : "") +
		esc(d.beforePost);
	afterEl.innerHTML =
		esc(d.afterPre) +
		(d.afterMid ? `<ins>${esc(d.afterMid)}</ins>` : "") +
		esc(d.afterPost);
}

function wireImagePreview(imgEl, fallbackEl, url) {
	if (!url) return;
	imgEl.onerror = () => {
		imgEl.style.display = "none";
		if (fallbackEl) fallbackEl.style.display = "flex";
	};
	imgEl.onload = () => {
		imgEl.style.display = "block";
		if (fallbackEl) fallbackEl.style.display = "none";
	};
	imgEl.src = url;
}

/* ---- tabs ---- */
document.querySelectorAll(".tab-btn").forEach((btn) => {
	btn.addEventListener("click", () => {
		document
			.querySelectorAll(".tab-btn")
			.forEach((b) => b.classList.remove("active"));
		document
			.querySelectorAll(".tab-panel")
			.forEach((p) => p.classList.remove("active"));
		btn.classList.add("active");
		document.getElementById(`panel-${btn.dataset.tab}`).classList.add("active");
	});
});

/* ---- blogger playground ---- */
function updateBlogger() {
	const url = document.getElementById("bg-url").value.trim();
	const options = {
		width: Number(document.getElementById("bg-width").value) || undefined,
		height: Number(document.getElementById("bg-height").value) || undefined,
		format: document.getElementById("bg-format").value || undefined,
		crop: document.getElementById("bg-crop").value || undefined,
		flip: document.getElementById("bg-flip").value || undefined,
		rotate: document.getElementById("bg-rotate").value || undefined,
	};
	const result = resizeImage(url, options);
	renderDiff(
		document.getElementById("bg-diff-before"),
		document.getElementById("bg-diff-after"),
		url,
		result,
	);
	document.getElementById("bg-status").textContent =
		`isSupportedImage: ${isSupportedImage(url)}`;
	wireImagePreview(
		document.getElementById("bg-img-before"),
		document.getElementById("bg-fallback-before"),
		url,
	);
	wireImagePreview(
		document.getElementById("bg-img-after"),
		document.getElementById("bg-fallback-after"),
		result,
	);
	document.getElementById("bg-copy").onclick = () =>
		navigator.clipboard.writeText(result);
}
[
	"bg-url",
	"bg-width",
	"bg-height",
	"bg-format",
	"bg-crop",
	"bg-flip",
	"bg-rotate",
].forEach((id) => {
	document.getElementById(id).addEventListener("input", updateBlogger);
	document.getElementById(id).addEventListener("change", updateBlogger);
});

/* ---- youtube playground ---- */
function updateYouTube() {
	const url = document.getElementById("yt-url").value.trim();
	const options = { ytThumbnail: document.getElementById("yt-quality").value };
	const result = resizeImage(url, options);
	renderDiff(
		document.getElementById("yt-diff-before"),
		document.getElementById("yt-diff-after"),
		url,
		result,
	);
	document.getElementById("yt-status").textContent =
		`isSupportedImage: ${isSupportedImage(url)}`;
	document.getElementById("yt-img-before").src = url;
	document.getElementById("yt-img-after").src = result;
	document.getElementById("yt-copy").onclick = () =>
		navigator.clipboard.writeText(result);
}
["yt-url", "yt-quality"].forEach((id) => {
	document.getElementById(id).addEventListener("input", updateYouTube);
	document.getElementById(id).addEventListener("change", updateYouTube);
});

/* ---- dom api demo ---- */
installResizeImagePrototypes();
const DEMO_IDS = ["dQw4w9WgXcQ", "9bZkp7q19f0", "kJQP7kiw5Fk", "jNQXAC9IVRw"];
const grid = document.getElementById("thumb-grid");
DEMO_IDS.forEach((id, i) => {
	const fig = document.createElement("figure");
	const img = document.createElement("img");
	img.className = "thumb";
	img.src = `https://i.ytimg.com/vi/${id}/hqdefault.jpg`;
	img.alt = `YouTube thumbnail demo ${i + 1}`;
	const cap = document.createElement("figcaption");
	cap.textContent = "hqdefault.jpg";
	fig.appendChild(img);
	fig.appendChild(cap);
	grid.appendChild(fig);
});

document.getElementById("run-nodelist").addEventListener("click", () => {
	document.querySelectorAll(".thumb").resizeImage({ ytThumbnail: "mqdefault" });
	document
		.querySelectorAll(".thumb-grid figcaption")
		.forEach((c) => (c.textContent = "mqdefault.webp"));
	document.getElementById("dom-status").textContent =
		"ran: document.querySelectorAll('.thumb').resizeImage({ ytThumbnail: 'mqdefault' })";
});
document.getElementById("run-reset").addEventListener("click", () => {
	document
		.querySelectorAll(".thumb")
		.forEach(
			(img, i) =>
				(img.src = `https://i.ytimg.com/vi/${DEMO_IDS[i]}/hqdefault.jpg`),
		);
	document
		.querySelectorAll(".thumb-grid figcaption")
		.forEach((c) => (c.textContent = "hqdefault.jpg"));
	document.getElementById("dom-status").textContent = "";
});

updateBlogger();
updateYouTube();

/* ---- page log, shared by lazify/shortcodify/cookify/createWidget below ---- */
function pageLog(msg) {
	const el = document.getElementById("page-log");
	el.textContent += `${msg}\n`;
}

/* ---- sidebar: stickify + tocify | header: menuify ---- */
// containerSelector "body" so the sidebar has the full page height to
// stick within — its own parent (<aside>) is only as tall as itself.
// additionalMarginTop clears the 64px fixed header.
BlogrPlugins.stickify(".sidebar", {
	containerSelector: "body",
	additionalMarginTop: 80,
	sidebarBehavior: "modern",
});
// menuify adds keyboard/touch behavior on top of the CSS hover
// dropdown already wired into #menu-nav below.
BlogrPlugins.menuify("#menu");
BlogrPlugins.menuify("#menuify-demo"); // plain, unstyled — the header above is the styled version

// Belt-and-braces click toggle, in case a touch device has no
// hover state — works alongside whatever menuify itself does.
document.querySelectorAll(".menu-toggle").forEach((toggle) => {
	toggle.addEventListener("click", (e) => {
		e.preventDefault();
		toggle.parentElement.classList.toggle("open");
	});
});
document.addEventListener("click", (e) => {
	if (!e.target.closest("#menu-nav")) {
		document
			.querySelectorAll("#menu-nav li.open")
			.forEach((li) => li.classList.remove("open"));
	}
});

BlogrPlugins.tocify("#toc", { content: "main.wrap", headings: "h2, h3" });

/* ---- lazify: gallery images ---- */
BlogrPlugins.lazify("img[data-src]", {
	onLoad: (el) => pageLog(`lazify: loaded ${el.getAttribute("data-src")}`),
});

/* ---- replacify: trademark the plugin name in the hero copy ---- */
BlogrPlugins.replacify(".eyebrow", /blogr-plugins/g, "blogr-plugins\u2122");

/* ---- shortcodify: bracket tags -> HTML ---- */
BlogrPlugins.shortcodify("#shortcode-demo", {
	tags: { ...BlogrPlugins.defaultShortcodeTags },
	allowHtml: true,
});

/* ---- cookify: remember the last-viewed tab ---- */
const savedTab = BlogrPlugins.cookify.get("resize-image-tab");
if (savedTab) {
	const btn = document.querySelector(`.tab-btn[data-tab="${savedTab}"]`);
	if (btn) btn.click();
}
document.querySelectorAll(".tab-btn").forEach((btn) => {
	btn.addEventListener("click", () => {
		BlogrPlugins.cookify.set("resize-image-tab", btn.dataset.tab, {
			expiresDays: 30,
		});
		pageLog(`cookify.set("resize-image-tab", "${btn.dataset.tab}")`);
	});
});
pageLog(
	`cookify.get("resize-image-tab") = ${BlogrPlugins.cookify.get("resize-image-tab")}`,
);

/* ---- createWidget: related posts, deferred fetch until sidebar nears view ---- */
BlogrPlugins.createWidget({
	containerSelector: "#relatedPosts",
	blogUrl: "https://softwebtuts.blogspot.com",
	type: "recent",
	labels: ["tool"],
	maxVisibleItems: 3,
	loadMore: false,
	summaryLength: 70,
	afterFetch: (entries) =>
		pageLog(`createWidget: fetched ${entries.length} entries`),
	onError: (err) => pageLog(`createWidget: error - ${err}`),
	onEmpty: () => pageLog("createWidget: no entries found"),
	loading: () => `<div class="loader-wrap"><div class="loader"/></div>`,
	template: (entry) => `
				<article class="related-post">
					<img src="${entry.thumbnail}" alt="${entry.title}" />
					<h5>${entry.title}</h5>
					<p>${entry.content}</p>
				</article>
			`,
});
