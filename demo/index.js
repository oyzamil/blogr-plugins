import * as BlogrPlugins from "./../dist/blogr-plugins.esm.js";

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

/* ---- page log, shared by lazify/shortcodify/cookify/createWidget below ---- */
function pageLog(msg) {
	const el = document.getElementById("page-log");
	el.textContent += `${msg}\n`;
}

/* ---- sidebar: stickify + tocify | header: menuify ---- */
// containerSelector "body" so the sidebar has the full page height to
// stick within — its own parent (<aside>) is only as tall as itself.
BlogrPlugins.stickify("#sidebar", {
	additionalMarginTop: 10,
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

BlogrPlugins.tocify("#toc", { content: "main", headings: "h2, h3" });

/* ---- lazify: gallery images ---- */
BlogrPlugins.lazify("img[data-src], iframe[data-src], video, [data-bg-image]", {
	onLoad: (el) => log("lazify", `loaded ${el.tagName.toLowerCase()}`),
	onError: (el, event) =>
		log("lazify", `error on ${el.tagName.toLowerCase()}`, event),
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

const blogUrl = "https://softwebtuts.blogspot.com";

/* ---- createWidget: related posts, deferred fetch until sidebar nears view ---- */
BlogrPlugins.createWidget({
	containerSelector: "#relatedPosts",
	blogUrl,
	type: "recent",
	labels: ["tool"],
	maxVisibleItems: 6,
	loadMore: false,
	summaryLength: 70,
	afterFetch: (entries) =>
		pageLog(`createWidget: fetched ${entries.length} entries`),
	onError: (err) => pageLog(`createWidget: error - ${err}`),
	onEmpty: () => pageLog("createWidget: no entries found"),
	loading: () => `<div class="loader-wrap"><div class="loader"/></div>`,
	template: (entry) => `
<a href="${entry.url}" class="entry group/card">
		<div data-slot="card-content" class="entry-content">
			<div class="entry-layout">
				<div class="entry-thumbnail">
					<img
						alt="${entry.title}"
						class="entry-image"
						src="${entry.thumbnail}"
					/>
				</div>

				<div class="entry-body">
					<h3 class="entry-title">${entry.title}</h3>

					<p class="entry-description">
						${entry.content}
					</p>
				</div>
			</div>
	</div>
</a>`,
});

const featuredPostTemplate = (entry) => `
  <article class="featured-post">
    <img src="${entry.thumbnail}" alt="${entry.title}" loading="lazy">
    <h2><a href="${entry.url}">${entry.title}</a></h2>
    <p>${entry.content}</p>
    <div class="post-meta">
      <span>${entry.author}</span>
      <time>${entry.published}</time>
    </div>
  </article>
`;

const authorBioTemplate = (entry) => `
  <div class="author-bio">
    <img src="${entry.thumbnail}" alt="${entry.title}" width="80" height="80" class="avatar">
    <h3>${entry.title}</h3>
    <p>${entry.content || "Author on this blog"}</p>
    <a href="${entry.url}" target="_blank">View posts</a>
  </div>
`;

const categoryCloudTemplate = (entry) => `
  <a href="${entry.url}" class="label">${entry.title}</a>
`;

const commentTemplate = (entry) => `
  <div class="recent-comment">
    <strong>${entry.author}</strong>
    <time>${entry.published}</time>
    <p>${entry.content}</p>
    <a href="${entry.url}">View on post</a>
  </div>
`;

const categoryTransform = (entry) => {
	// Replace hyphens with spaces
	const cleaned = entry.title.replace(/-/g, " ");
	// Capitalize each word
	const capitalized = cleaned
		.split(" ")
		.map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
		.join(" ");

	return {
		...entry,
		title: capitalized,
		// Also update URL to use original label
		url: `${entry.url.split("/search/label/")[0]}/search/label/${encodeURIComponent(entry.raw)}`,
	};
};

// 1. Featured posts
const featuredWidget = BlogrPlugins.createWidget({
	containerSelector: "#featuredPosts",
	blogUrl,
	type: "posts",
	source: "recent",
	maxVisibleItems: 3,
	labels: ["Featured"],
	template: featuredPostTemplate,
});

// 2. Author bios
const authorWidget = BlogrPlugins.createWidget({
	containerSelector: "#blogAuthors",
	blogUrl,
	type: "authors",
	maxVisibleItems: 5,
	template: authorBioTemplate,
});

// 3. Category cloud
const categoryWidget = BlogrPlugins.createWidget({
	containerSelector: "#categoryCloud",
	blogUrl,
	type: "labels",
	transformers: [categoryTransform],
	template: categoryCloudTemplate,
});

// 4. Recent comments
const commentWidget = BlogrPlugins.createWidget({
	containerSelector: "#recentComments",
	blogUrl,
	type: "posts",
	feed: "comments",
	maxVisibleItems: 10,
	template: commentTemplate,
});
