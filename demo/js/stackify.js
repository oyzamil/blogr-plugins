// import * as BlogrPlugins from "../../dist/blogr-plugins.esm.js";

const logger = createLogger({
	containerSelector: "#stackify-logs",
	scrollable: true,
});

function skReadOptions() {
	return {
		layout: document.getElementById("sk-layout").value,
		stackDirection: document.getElementById("sk-stackDirection").value,
		orientation: document.getElementById("sk-orientation").value,
		offset: Number(document.getElementById("sk-offset").value),
		scaleStep: Number(document.getElementById("sk-scaleStep").value),
		peekWidth: document.getElementById("sk-peekWidth").value,
		interval: Number(document.getElementById("sk-interval").value),
		direction: document.getElementById("sk-direction").value,
		pauseOnHover: document.getElementById("sk-pauseOnHover").checked,
		draggable: document.getElementById("sk-draggable").checked,
		onBeforeChange: (d) => logger(`before: #${d.fromIndex} -> #${d.toIndex}`),
		onAfterChange: (d) =>
			logger(`after:  #${d.fromIndex} -> #${d.toIndex} (settled)`),
		size: { stack: { height: "200px" }, marquee: { width: "50%" } },
	};
}

let skStack = BlogrPlugins.stackify(
	"#stackify-demo, #recentComments",
	skReadOptions(),
);

document
	.getElementById("sk-prev")
	.addEventListener("click", () => skStack.prev());
document
	.getElementById("sk-next")
	.addEventListener("click", () => skStack.next());
document
	.getElementById("sk-play")
	.addEventListener("click", () => skStack.play());
document
	.getElementById("sk-pause")
	.addEventListener("click", () => skStack.pause());

// live options: any change in the panel rebuilds the stack, no
// "rebuild" button, debounced so dragging a number doesn't thrash it
let skRebuildTimer = null;
function skRebuild() {
	skStack.destroy();
	skStack = BlogrPlugins.stackify(
		"#stackify-demo, #recentComments",
		skReadOptions(),
	);
}
for (const el of document.querySelectorAll(
	"#sk-options input, #sk-options select",
)) {
	el.addEventListener("input", () => {
		clearTimeout(skRebuildTimer);
		skRebuildTimer = setTimeout(skRebuild, 150);
	});
	el.addEventListener("change", () => {
		clearTimeout(skRebuildTimer);
		skRebuildTimer = setTimeout(skRebuild, 150);
	});
}
