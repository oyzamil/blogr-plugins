import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { readMeter } from "../src/plugins/readMeter";

/** Builds a string of N space-separated words, e.g. words(200) -> "word word word ...". */
function words(count: number): string {
	return Array.from({ length: count }, () => "word").join(" ");
}

beforeEach(() => {
	document.body.innerHTML = "";
});

afterEach(() => {
	vi.useRealTimers();
});

describe("readMeter", () => {
	describe("word counting / defaults", () => {
		it("computes minutes at the default 200wpm and defaults to the 'minutes' format", () => {
			document.body.innerHTML = `<article id="a">${words(400)}</article>`;
			const onUpdate = vi.fn();
			readMeter("#a", { onUpdate });

			// 400 words / 200wpm = 2 minutes exactly.
			expect(onUpdate).toHaveBeenCalledWith("2", 2);
		});

		it("rounds a fractional 'minutes'/'text' result up, never down to 0", () => {
			document.body.innerHTML = `<article id="a">${words(10)}</article>`;
			const onUpdate = vi.fn();
			readMeter("#a", { onUpdate });

			// 10 words / 200wpm = 0.05 minutes -> still shows "1", never "0".
			expect(onUpdate).toHaveBeenCalledWith("1", 0.05);
		});

		it("respects a custom wordsPerMinute", () => {
			document.body.innerHTML = `<article id="a">${words(100)}</article>`;
			const onUpdate = vi.fn();
			readMeter("#a", { wordsPerMinute: 100, onUpdate });

			expect(onUpdate).toHaveBeenCalledWith("1", 1);
		});

		it("measures the whole target by default (no includeElements given)", () => {
			document.body.innerHTML = `<div id="post">${words(200)}</div>`;
			const onUpdate = vi.fn();
			readMeter("#post", { onUpdate });

			expect(onUpdate).toHaveBeenCalledWith("1", 1);
		});

		it("processes multiple matched targets independently", () => {
			document.body.innerHTML = `
				<article class="post">${words(200)}</article>
				<article class="post">${words(400)}</article>
			`;
			const onUpdate = vi.fn();
			readMeter(".post", { onUpdate });

			expect(onUpdate).toHaveBeenNthCalledWith(1, "1", 1);
			expect(onUpdate).toHaveBeenNthCalledWith(2, "2", 2);
		});
	});

	describe("includeElements", () => {
		it("only counts text from matching descendants, not the rest of the target", () => {
			document.body.innerHTML = `
				<div id="post">
					${words(1000)}
					<div class="body">${words(200)}</div>
				</div>
			`;
			const onUpdate = vi.fn();
			readMeter("#post", { includeElements: [".body"], onUpdate });

			// Only the 200 words inside .body should count, not the 1000
			// sitting directly in #post.
			expect(onUpdate).toHaveBeenCalledWith("1", 1);
		});

		it("unions matches across multiple selectors", () => {
			document.body.innerHTML = `
				<div id="post">
					${words(1000)}
					<div class="intro">${words(100)}</div>
					<div class="body">${words(100)}</div>
				</div>
			`;
			const onUpdate = vi.fn();
			readMeter("#post", {
				includeElements: [".intro", ".body"],
				onUpdate,
			});

			// 100 (.intro) + 100 (.body) = 200 words, not the 1000 outside them.
			expect(onUpdate).toHaveBeenCalledWith("1", 1);
		});

		it("deduplicates elements matched by more than one selector", () => {
			document.body.innerHTML = `
				<div id="post">
					<article class="body">${words(200)}</article>
				</div>
			`;
			const onUpdate = vi.fn();
			// Both selectors match the same <article> — should count once, not twice.
			readMeter("#post", {
				includeElements: ["article", ".body"],
				onUpdate,
			});

			expect(onUpdate).toHaveBeenCalledWith("1", 1);
		});

		it("falls back to the whole target when none of the selectors match anything", () => {
			document.body.innerHTML = `<div id="post">${words(200)}</div>`;
			const onUpdate = vi.fn();
			readMeter("#post", { includeElements: [".missing"], onUpdate });

			expect(onUpdate).toHaveBeenCalledWith("1", 1);
		});
	});

	describe("excludeElements", () => {
		it("removes matching descendants from the word count", () => {
			document.body.innerHTML = `
				<article id="a">
					${words(200)}
					<div class="share-buttons">${words(50)}</div>
				</article>
			`;
			const onUpdate = vi.fn();
			readMeter("#a", { excludeElements: [".share-buttons"], onUpdate });

			// 250 total words minus the 50 excluded = 200 -> 1 minute at 200wpm.
			expect(onUpdate).toHaveBeenCalledWith("1", 1);
		});

		it("removes matches from every selector in the list", () => {
			document.body.innerHTML = `
				<article id="a">
					${words(200)}
					<div class="ad">${words(50)}</div>
					<div class="share-buttons">${words(50)}</div>
				</article>
			`;
			const onUpdate = vi.fn();
			readMeter("#a", {
				excludeElements: [".ad", ".share-buttons"],
				onUpdate,
			});

			expect(onUpdate).toHaveBeenCalledWith("1", 1);
		});

		it("applies within elements matched by includeElements, not just the whole target", () => {
			document.body.innerHTML = `
				<div id="post">
					<div class="body">
						${words(200)}
						<div class="ad">${words(50)}</div>
					</div>
					<div class="ad">${words(9999)}</div>
				</div>
			`;
			const onUpdate = vi.fn();
			// The outer .ad (9999 words) is never included in the first place;
			// the nested .ad (50 words) inside .body must still be excluded.
			readMeter("#post", {
				includeElements: [".body"],
				excludeElements: [".ad"],
				onUpdate,
			});

			expect(onUpdate).toHaveBeenCalledWith("1", 1);
		});

		it("does not affect image counting for excluded elements", () => {
			document.body.innerHTML = `
				<article id="a">
					${words(200)}
					<div class="ad"><img /><img /></div>
				</article>
			`;
			const onUpdate = vi.fn();
			readMeter("#a", {
				excludeElements: [".ad"],
				includeImages: true,
				onUpdate,
			});

			// Both images live inside the excluded .ad, so none should count.
			expect(onUpdate).toHaveBeenCalledWith("1", 1);
		});
	});

	describe("includeImages", () => {
		it("ignores images by default", () => {
			document.body.innerHTML = `<article id="a">${words(200)}<img /><img /></article>`;
			const onUpdate = vi.fn();
			readMeter("#a", { onUpdate });

			expect(onUpdate).toHaveBeenCalledWith("1", 1);
		});

		it("adds imageTimeSeconds per image when enabled", () => {
			document.body.innerHTML = `<article id="a">${words(200)}<img /><img /><img /></article>`;
			const onUpdate = vi.fn();
			// 200 words / 200wpm = 1 minute of text.
			// 3 images * 10s = 30s = 0.5 minutes. Total = 1.5 minutes.
			readMeter("#a", { includeImages: true, onUpdate });

			expect(onUpdate).toHaveBeenCalledWith("2", 1.5);
		});

		it("respects a custom imageTimeSeconds", () => {
			document.body.innerHTML = `<article id="a"><img /></article>`;
			const onUpdate = vi.fn();
			// 1 image * 60s = 1 minute, 0 words.
			readMeter("#a", {
				includeImages: true,
				imageTimeSeconds: 60,
				onUpdate,
			});

			expect(onUpdate).toHaveBeenCalledWith("1", 1);
		});
	});

	describe("includeCode", () => {
		it("folds code text into the regular word count by default", () => {
			document.body.innerHTML = `<article id="a">${words(100)} <pre>${words(100)}</pre></article>`;
			const onUpdate = vi.fn();
			// All 200 words counted together at 200wpm = 1 minute.
			readMeter("#a", { onUpdate });

			expect(onUpdate).toHaveBeenCalledWith("1", 1);
		});

		it("counts code separately at codeWordsPerMinute when enabled", () => {
			document.body.innerHTML = `<article id="a">${words(200)}<pre>${words(100)}</pre></article>`;
			const onUpdate = vi.fn();
			// 200 plain words / 200wpm = 1 minute.
			// 100 code words / 100wpm (default) = 1 minute.
			// Total = 2 minutes.
			readMeter("#a", { includeCode: true, onUpdate });

			expect(onUpdate).toHaveBeenCalledWith("2", 2);
		});

		it("respects a custom codeWordsPerMinute", () => {
			document.body.innerHTML = `<article id="a"><code>${words(50)}</code></article>`;
			const onUpdate = vi.fn();
			// 50 code words / 50wpm = 1 minute, 0 plain words.
			readMeter("#a", {
				includeCode: true,
				codeWordsPerMinute: 50,
				onUpdate,
			});

			expect(onUpdate).toHaveBeenCalledWith("1", 1);
		});

		it("does not double count code words that were also removed from plain text", () => {
			document.body.innerHTML = `<article id="a"><pre>${words(200)}</pre></article>`;
			const onUpdate = vi.fn();
			// 0 plain words + 200 code words / 100wpm (default) = 2 minutes.
			// If code text leaked into the plain-word count too this would
			// come out much higher.
			readMeter("#a", { includeCode: true, onUpdate });

			expect(onUpdate).toHaveBeenCalledWith("2", 2);
		});
	});

	describe("format", () => {
		it("formats 'minutes+seconds' as e.g. '5m 30s'", () => {
			// 1100 words / 200wpm = 5.5 minutes = 5m 30s.
			document.body.innerHTML = `<article id="a">${words(1100)}</article>`;
			const onUpdate = vi.fn();
			readMeter("#a", { format: "minutes+seconds", onUpdate });

			expect(onUpdate).toHaveBeenCalledWith("5m 30s", 5.5);
		});

		it("formats 'text' as e.g. '5 minute read'", () => {
			document.body.innerHTML = `<article id="a">${words(1000)}</article>`;
			const onUpdate = vi.fn();
			readMeter("#a", { format: "text", onUpdate });

			expect(onUpdate).toHaveBeenCalledWith("5 minute read", 5);
		});
	});

	describe("template", () => {
		it("renders the default template as 'Read time: <time>'", () => {
			document.body.innerHTML = `
				<article id="a">${words(200)}</article>
				<div id="meta"></div>
			`;
			readMeter("#a", { appendTo: "#meta" });

			expect(document.getElementById("meta")!.textContent).toBe("Read time: 1");
		});

		it("uses a custom template's return value as innerHTML verbatim", () => {
			document.body.innerHTML = `
				<article id="a">${words(200)}</article>
				<div id="meta"></div>
			`;
			readMeter("#a", {
				template: (time) => `<strong>${time}</strong> min read`,
				appendTo: "#meta",
			});

			const meta = document.getElementById("meta")!;
			expect(meta.querySelector("strong")?.textContent).toBe("1");
			expect(meta.textContent).toBe("1 min read");
		});
	});

	describe("appendTo", () => {
		it("does not insert anything when appendTo is null (the default)", () => {
			document.body.innerHTML = `<article id="a">${words(200)}</article>`;
			readMeter("#a");

			expect(document.querySelector(".readmeter")).toBeNull();
		});

		it("still fires onUpdate even when appendTo is null", () => {
			document.body.innerHTML = `<article id="a">${words(200)}</article>`;
			const onUpdate = vi.fn();
			readMeter("#a", { onUpdate });

			expect(onUpdate).toHaveBeenCalledTimes(1);
		});

		it("appends into a selector match without clearing existing content", () => {
			document.body.innerHTML = `
				<article id="a">${words(200)}</article>
				<div id="meta"><span id="existing">existing</span></div>
			`;
			readMeter("#a", { appendTo: "#meta" });

			const meta = document.getElementById("meta")!;
			expect(meta.querySelector("#existing")).not.toBeNull();
			expect(meta.querySelector(".readmeter")).not.toBeNull();
		});

		it("appends into a given HTMLElement directly", () => {
			document.body.innerHTML = `<article id="a">${words(200)}</article>`;
			const mount = document.createElement("div");
			document.body.appendChild(mount);

			readMeter("#a", { appendTo: mount });

			expect(mount.querySelector(".readmeter")).not.toBeNull();
		});

		it("reuses (rather than duplicates) the badge across recalculations", () => {
			document.body.innerHTML = `
				<article id="a">${words(200)}</article>
				<div id="meta"></div>
			`;
			const instance = readMeter("#a", { appendTo: "#meta" });
			instance.refresh();
			instance.refresh();

			expect(document.querySelectorAll("#meta .readmeter")).toHaveLength(1);
		});
	});

	describe("refresh", () => {
		it("recalculates and re-fires onUpdate on demand", () => {
			document.body.innerHTML = `<article id="a">${words(200)}</article>`;
			const onUpdate = vi.fn();
			const instance = readMeter("#a", { onUpdate });
			expect(onUpdate).toHaveBeenCalledTimes(1);

			document.getElementById("a")!.textContent = words(400);
			instance.refresh();

			expect(onUpdate).toHaveBeenCalledTimes(2);
			expect(onUpdate).toHaveBeenNthCalledWith(2, "2", 2);
		});

		it("does nothing after destroy", () => {
			document.body.innerHTML = `<article id="a">${words(200)}</article>`;
			const onUpdate = vi.fn();
			const instance = readMeter("#a", { onUpdate });
			instance.destroy();
			onUpdate.mockClear();

			instance.refresh();

			expect(onUpdate).not.toHaveBeenCalled();
		});
	});

	describe("updateOnResize", () => {
		it("does not listen for resize by default", () => {
			document.body.innerHTML = `<article id="a">${words(200)}</article>`;
			const onUpdate = vi.fn();
			readMeter("#a", { onUpdate });
			onUpdate.mockClear();

			window.dispatchEvent(new Event("resize"));

			expect(onUpdate).not.toHaveBeenCalled();
		});

		it("recalculates after a debounced resize when enabled", () => {
			vi.useFakeTimers();
			document.body.innerHTML = `<article id="a">${words(200)}</article>`;
			const onUpdate = vi.fn();
			readMeter("#a", { updateOnResize: true, debounceMs: 250, onUpdate });
			onUpdate.mockClear();

			window.dispatchEvent(new Event("resize"));
			vi.advanceTimersByTime(249);
			expect(onUpdate).not.toHaveBeenCalled();

			vi.advanceTimersByTime(1);
			expect(onUpdate).toHaveBeenCalledTimes(1);
		});

		it("debounces bursts of resize events into a single recalculation", () => {
			vi.useFakeTimers();
			document.body.innerHTML = `<article id="a">${words(200)}</article>`;
			const onUpdate = vi.fn();
			readMeter("#a", { updateOnResize: true, onUpdate });
			onUpdate.mockClear();

			window.dispatchEvent(new Event("resize"));
			vi.advanceTimersByTime(100);
			window.dispatchEvent(new Event("resize"));
			vi.advanceTimersByTime(100);
			window.dispatchEvent(new Event("resize"));
			vi.advanceTimersByTime(250);

			expect(onUpdate).toHaveBeenCalledTimes(1);
		});

		it("respects a custom debounceMs", () => {
			vi.useFakeTimers();
			document.body.innerHTML = `<article id="a">${words(200)}</article>`;
			const onUpdate = vi.fn();
			readMeter("#a", { updateOnResize: true, debounceMs: 50, onUpdate });
			onUpdate.mockClear();

			window.dispatchEvent(new Event("resize"));
			vi.advanceTimersByTime(50);

			expect(onUpdate).toHaveBeenCalledTimes(1);
		});

		it("stops listening for resize after destroy", () => {
			vi.useFakeTimers();
			document.body.innerHTML = `<article id="a">${words(200)}</article>`;
			const onUpdate = vi.fn();
			const instance = readMeter("#a", { updateOnResize: true, onUpdate });
			instance.destroy();
			onUpdate.mockClear();

			window.dispatchEvent(new Event("resize"));
			vi.advanceTimersByTime(1000);

			expect(onUpdate).not.toHaveBeenCalled();
		});
	});

	describe("destroy", () => {
		it("removes any inserted badges", () => {
			document.body.innerHTML = `
				<article id="a">${words(200)}</article>
				<div id="meta"></div>
			`;
			const instance = readMeter("#a", { appendTo: "#meta" });
			expect(document.querySelector(".readmeter")).not.toBeNull();

			instance.destroy();

			expect(document.querySelector(".readmeter")).toBeNull();
		});
	});
});
