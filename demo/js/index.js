// import * as BlogrPlugins from "../../dist/blogr-plugins.esm.js";

const logger = createLogger();

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
	const result = BlogrPlugins.resizeImage(url, options);
	renderDiff(
		document.getElementById("bg-diff-before"),
		document.getElementById("bg-diff-after"),
		url,
		result,
	);
	document.getElementById("bg-status").textContent =
		`isSupportedImage: ${BlogrPlugins.isSupportedImage(url)}`;
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
	const result = BlogrPlugins.resizeImage(url, options);
	renderDiff(
		document.getElementById("yt-diff-before"),
		document.getElementById("yt-diff-after"),
		url,
		result,
	);
	document.getElementById("yt-status").textContent =
		`isSupportedImage: ${BlogrPlugins.isSupportedImage(url)}`;
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
	BlogrPlugins.resizeImageInDom(document.querySelectorAll(".thumb"), {
		ytThumbnail: "mqdefault",
	});
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

/* ---- sidebar: stickify + tocify | header: menuify ---- */
// containerSelector "body" so the sidebar has the full page height to
// stick within — its own parent (<aside>) is only as tall as itself.
BlogrPlugins.stickify("#sidebar", {
	additionalMarginTop: 70,
	sidebarBehavior: "modern",
});
// menuify adds keyboard/touch behavior on top of the CSS hover
// dropdown already wired into #menu-nav below.
BlogrPlugins.menuify("header #menuify");

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
BlogrPlugins.readMeter("main", {
	format: "text",
	appendTo: ".readTime",
});

BlogrPlugins.tocify("#toc", {
	title: "TOC",
	content: "main",
	headings: "h2, h3",
});

/* ---- lazify: gallery images ---- */
BlogrPlugins.lazify("img[data-src], iframe[data-src], video, [data-bg-image]", {
	onLoad: (el) => logger("lazify", `loaded ${el.tagName.toLowerCase()}`),
	onError: (el, event) =>
		logger("lazify", `error on ${el.tagName.toLowerCase()}`, event),
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
		logger(`cookify.set("resize-image-tab", "${btn.dataset.tab}")`);
	});
});
logger(
	`cookify.get("resize-image-tab") = ${BlogrPlugins.cookify.get("resize-image-tab")}`,
);
const capitalizeFirstChar = (text) => text[0].toUpperCase() + text.slice(1);
const blogUrl = "https://softwebtuts.blogspot.com";
const LOADER = `<div class="loader-wrap"><div class="loader"/></div>`;

/* ---- createWidget: related posts, deferred fetch until sidebar nears view ---- */
BlogrPlugins.createWidget({
	containerSelector: "#relatedPosts",
	blogUrl,
	type: "recent",
	labels: ["tool"],
	maxVisibleItems: 3,
	loadMore: false,
	summaryLength: 70,
	afterFetch: (entries) =>
		logger(`createWidget: fetched ${entries.length} entries`),
	onError: (err) => logger(`createWidget: error - ${err}`),
	onEmpty: () => logger("createWidget: no entries found"),
	loading: () => LOADER,
	template: (entry) => {
		return `
<a href="${entry.url}" class="entry group/card">
		<div data-slot="card-content" class="entry-content">
			<div class="entry-layout">
				<div class="entry-thumbnail">
					<img alt="${entry.title}" class="entry-image" src="${entry.thumbnail}" />
				</div>

				<div class="entry-body">
					<h3 class="entry-title">${entry.title}</h3>
					<p class="entry-description">${entry.content}</p>
				</div>
			</div>
	</div>
</a>`;
	},
});

const featuredPostTemplate = (entry) => {
	return `
  <div class="max-w-md bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden transition-shadow duration-300 hover:shadow-md">
  
  <!-- Post Header (Author Info) -->
  <div class="flex items-center justify-between p-4">
    <div class="flex items-center space-x-3">
      <img 
        class="w-10 h-10 rounded-full object-cover ring-2 ring-gray-50" 
        src="${entry.author.image}" 
        alt="${entry.author.name}"
      />
      <div>
        <h4 class="text-sm font-semibold text-gray-900 mb-0!">${entry.author.name}</h4>
        <p class="text-xs text-gray-500">${entry.published}</p>
      </div>
    </div>
  </div>

  <!-- Post Main Image -->
  <div class="relative aspect-[16/10] overflow-hidden bg-gray-100">
    <img 
      class="w-full h-full object-cover" 
      src="${entry.thumbnail}" 
      alt="${entry.title}"
    />
  </div>

  <!-- Post Interaction Bar -->
  <div class="flex flex-col justify-between p-4 gap-3">
    <div class="labels-container s-1">${entry.labels.map((label) => `<a href="/search/label/${label}" class="label">#${label}</a>`).join("")}</div>
	<p class="text-sm text-gray-800 leading-relaxed">
      ${entry.content}
    </p>
  </div>

</div>`;
};

const labelsTransform = (entry) => {
	// Replace hyphens with spaces
	const cleaned = entry.name.replace(/-/g, " ");
	// Capitalize each word
	const capitalized = cleaned
		.split(" ")
		.map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
		.join(" ");

	return {
		...entry,
		name: capitalized,
	};
};

// // 1. Featured posts — fine as-is
const featuredWidget = BlogrPlugins.createWidget({
	containerSelector: "#featuredPosts",
	blogUrl,
	type: "posts",
	source: "recent",
	maxVisibleItems: 1,
	labels: ["earning"],
	loading: () => LOADER,
	template: featuredPostTemplate,
});

const dropUnknownAuthors = (author) => {
	const name = author.name?.trim();
	if (!name || name.toLowerCase() === "unknown") return null;
	return author;
};

// 2. Author bios — fine as-is
const authorWidget = BlogrPlugins.createWidget({
	containerSelector: "#blogAuthors",
	blogUrl,
	type: "authors",
	maxVisibleItems: 1,
	transformers: [dropUnknownAuthors],
	loading: () => LOADER,
	template: (
		author,
	) => `<div class="flex items-center gap-2.5 px-3 py-2 bg-white rounded-xl shadow w-full border">
		<img alt="${author.name}" src="${author.image}" class="w-10 h-10 rounded-full shrink-0 bg-neutral-800" viewBox="0 0 40 40"/>

		<div class="flex flex-col gap-0.5">
			<span class="text-sm font-bold text-slate-900 leading-tight">${author.name}</span>
			<div class="flex items-center gap-1.5 text-[12.5px] leading-tight">
				<span class="relative flex size-1.5">
  					<span class="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75"></span>
  					<span class="relative inline-flex size-1.5 rounded-full bg-green-500"></span>
				</span>
				<span class="text-green-600 font-base text-xs">Online</span>
			</div>
		</div>
	</div>`,
});

// 3. Category cloud — fine as-is
const categoryWidget = BlogrPlugins.createWidget({
	containerSelector: "#categoryCloud",
	blogUrl,
	type: "labels",
	transformers: [labelsTransform],
	loading: () => LOADER,
	template: (entry) => `<a href="${entry.url}" class="label">${entry.name}</a>`,
});

// 4. Recent comments — was type:"posts" + feed:"comments", just type:"comments" now
const commentWidget = BlogrPlugins.createWidget({
	containerSelector: "#recentComments",
	blogUrl,
	type: "comments",
	maxVisibleItems: 3,
	loading: () => LOADER,
	template: (comment) => {
		return `
		<div class="comment flex gap-3 border border-slate-200 rounded-lg p-4 bg-white w-full">
			<div class="avatar-container"><div class="avatar" data-avatar="${comment.author.image}"></div></div>
			<div class="flex-1">
				<div class="meta flex items-baseline gap-2">
					<span class="name font-semibold text-sm"><bdi>${comment.author.name}</bdi></span>
					<span class="date text-xs text-slate-400" data-datetime="2026-01-04T10:00:00Z">${comment.published}</span>
				</div>
				<p class="text-sm text-slate-600 mt-1">${capitalizeFirstChar(comment.content)}</p>
			</div>
		</div>`;
	},
});
