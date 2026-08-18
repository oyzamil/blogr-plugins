// import * as BlogrPlugins from "../../dist/blogr-plugins.esm.js";

const logger = createLogger({
	containerSelector: "#avatarify-logs",
	scrollable: true,
});

let commentN = 0;

const styles = [
	"adventurer",
	"adventurer-neutral",
	"avataaars",
	"avataaars-neutral",
	"big-ears",
	"big-ears-neutral",
	"big-smile",
	"blobs",
	"bottts",
	"bottts-neutral",
	"clay",
	"constellation",
	"critters",
	"croodles",
	"croodles-neutral",
	"disco",
	"dylan",
	"fun-emoji",
	"glass",
	"glyphs",
	"icons",
	"identicon",
	"initial-face",
	"initials",
	"landscape",
	"loops",
	"lorelei",
	"lorelei-neutral",
	"micah",
	"miniavs",
	"moods",
	"notionists",
	"notionists-neutral",
	"open-peeps",
	"personas",
	"pixel-art",
	"pixel-art-neutral",
	"pixelbot",
	"planets",
	"rings",
	"shape-grid",
	"shapes",
	"sprouts",
	"squircles",
	"stripes",
	"thumbs",
	"toon-head",
	"triangles",
	"waves",
	"weave",
];

function randomItem(arr) {
	return arr[Math.floor(Math.random() * arr.length)];
}

function readOptions() {
	return {
		container: ".comments",
		commentSelector: ".comment",
		avatarSelector: ".avatar",
		usernameSelector: ".meta .name",
		timestampSelector: ".meta .date",
		timestampAttribute: "data-datetime",
		avatarStyle: randomItem(styles),
		setRandomAvatarForAll: false,
		onAvatarSet: (d) => logger(`avatar set for "${d.username}"`),
		onError: (msg) => logger(`error: ${msg}`),
	};
}

BlogrPlugins.avatarify(readOptions());
logger("avatarify() called — waiting for #comments to scroll into view...");

document.getElementById("add-comment").addEventListener("click", () => {
	commentN++;
	const names = [
		"Bruce Banner",
		"Wanda Maximoff",
		"Peter Parker",
		"Natasha Romanoff",
	];
	const name = names[commentN % names.length];
	document.querySelector("main #avatarify .comments").insertAdjacentHTML(
		"beforeend",
		`<div class="comment flex gap-3 border border-slate-200 rounded-lg p-4 bg-white">
					<div class="avatar-container"><div class="avatar" style="background-image: url(//resources.blogblog.com/img/blank.gif);"></div></div>
					<div class="flex-1">
						<div class="meta flex items-baseline gap-2">
							<span class="name font-semibold text-sm"><bdi>${name}</bdi></span>
							<span class="date text-xs text-slate-400" data-datetime="${new Date().toISOString()}">just now</span>
						</div>
						<p class="text-sm text-slate-600 mt-1">Dynamically added comment — picked up by the MutationObserver.</p>
					</div>
				</div>`,
	);
	logger(
		`comment added for "${name} #${commentN}" — waiting for the debounced rescan...`,
	);
});

// --- jQuery usage ---
// avatarify has no jQuery bridge (its `container` lives inside the
// config object rather than being the jQuery target) — call
// BlogrPlugins.avatarify({...}) directly either way.
