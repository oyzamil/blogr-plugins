// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { avatarify } from "../src/plugins/avatarify";

/**
 * jsdom has no real `IntersectionObserver` and no real layout/rendering, so
 * intersection can't happen naturally. This mock captures every observed
 * target per instance and lets tests fire `isIntersecting` manually.
 */
class MockIntersectionObserver implements IntersectionObserver {
	static instances: MockIntersectionObserver[] = [];

	readonly root = null;
	readonly rootMargin: string;
	readonly scrollMargin: string;
	readonly thresholds: ReadonlyArray<number> = [0];
	observed = new Set<Element>();

	constructor(
		public callback: IntersectionObserverCallback,
		options?: IntersectionObserverInit,
	) {
		this.rootMargin = (options?.rootMargin as string) ?? "0px";
		this.scrollMargin = (options?.rootMargin as string) ?? "0px";
		MockIntersectionObserver.instances.push(this);
	}

	observe(target: Element): void {
		this.observed.add(target);
	}
	unobserve(target: Element): void {
		this.observed.delete(target);
	}
	disconnect(): void {
		this.observed.clear();
	}
	takeRecords(): IntersectionObserverEntry[] {
		return [];
	}

	trigger(target: Element, isIntersecting = true): void {
		this.callback(
			[{ target, isIntersecting } as IntersectionObserverEntry],
			this as unknown as IntersectionObserver,
		);
	}
}

/** Fires `isIntersecting: true` on every mock instance currently watching `el`. */
function intersect(el: Element): void {
	for (const inst of MockIntersectionObserver.instances) {
		if (inst.observed.has(el)) inst.trigger(el, true);
	}
}

/** jsdom's `Image` never actually loads (no real network). Deterministic stand-in: `onload` fires next microtask whenever `src` is set. */
class MockImage {
	onload: (() => void) | null = null;
	onerror: (() => void) | null = null;
	private _src = "";
	set src(value: string) {
		this._src = value;
		queueMicrotask(() => this.onload?.());
	}
	get src(): string {
		return this._src;
	}
}

function flush(): Promise<void> {
	return new Promise((resolve) => setTimeout(resolve, 0));
}

beforeEach(() => {
	MockIntersectionObserver.instances = [];
	vi.stubGlobal("IntersectionObserver", MockIntersectionObserver);
	vi.stubGlobal("Image", MockImage);
	document.body.innerHTML = "";
});

afterEach(() => {
	vi.unstubAllGlobals();
});

/** Builds one `.comment` block: username + timestamp + avatar span, siblings under `.meta`. */
function makeComment({
	username = "alice",
	dataAvatar,
	dataImage,
	tag = "span",
}: {
	username?: string;
	dataAvatar?: string;
	dataImage?: string;
	tag?: "span" | "img";
} = {}): HTMLElement {
	const wrapper = document.createElement("div");
	wrapper.className = "comment";
	const attrs = [
		dataAvatar !== undefined ? `data-avatar="${dataAvatar}"` : "",
		dataImage !== undefined ? `data-image="${dataImage}"` : "",
	]
		.filter(Boolean)
		.join(" ");
	wrapper.innerHTML = `
		<div class="meta">
			<${tag} class="img" ${attrs}></${tag}>
			<span class="name">${username}</span>
			<span class="time" data-datetime="2024-01-01T00:00:00Z">a while ago</span>
		</div>
	`;
	document.body.appendChild(wrapper);
	return wrapper;
}

const baseConfig = {
	container: document.body,
	usernameSelector: ".name",
	commentSelector: ".comment",
	avatarSelector: ".img",
	timestampSelector: ".time",
	timestampAttribute: "data-datetime",
};

describe("avatarify", () => {
	it("fills a blank avatar with a generated one once in view", () => {
		const comment = makeComment({
			dataImage: "//www.blogger.com/img/blogger_logo_round_35.png",
		});
		const avatarEl = comment.querySelector(".img") as HTMLElement;

		avatarify({ ...baseConfig, avatarDataAttribute: "data-image" });
		intersect(avatarEl);

		expect(avatarEl.dataset.avatarSet).toBe("true");
		expect(avatarEl.style.backgroundImage).toContain("api.dicebear.com");
	});

	it("leaves a real avatar's image alone but syncs it onto the render target", () => {
		const realUrl = "//blogger.googleusercontent.com/img/b/real-photo.jpg";
		const comment = makeComment({ dataImage: realUrl });
		const avatarEl = comment.querySelector(".img") as HTMLElement;

		avatarify({ ...baseConfig, avatarDataAttribute: "data-image" });
		intersect(avatarEl);

		expect(avatarEl.style.backgroundImage).toContain(realUrl);
		expect(avatarEl.style.backgroundImage).not.toContain("dicebear");
	});

	it("setRandomAvatarForAll overwrites real avatars too", () => {
		const realUrl = "//blogger.googleusercontent.com/img/b/real-photo.jpg";
		const comment = makeComment({ dataImage: realUrl });
		const avatarEl = comment.querySelector(".img") as HTMLElement;

		avatarify({
			...baseConfig,
			avatarDataAttribute: "data-image",
			setRandomAvatarForAll: true,
		});
		intersect(avatarEl);

		expect(avatarEl.style.backgroundImage).toContain("dicebear");
	});

	it("respects a custom avatarDataAttribute name", () => {
		const comment = makeComment({ dataImage: "//example.com/photo.jpg" });
		const avatarEl = comment.querySelector(".img") as HTMLElement;

		// default attribute is "data-avatar" — with the wrong name configured,
		// the real url is invisible and treated as blank.
		avatarify({ ...baseConfig, avatarDataAttribute: "data-avatar" });
		intersect(avatarEl);

		expect(avatarEl.style.backgroundImage).toContain("dicebear");
	});

	it("mode 'src' forces src attr even on a non-<img> element via avatarAttribute override", () => {
		const comment = makeComment({
			dataImage: "//www.blogger.com/img/blogger_logo_round_35.png",
		});
		const avatarEl = comment.querySelector(".img") as HTMLElement;

		avatarify({
			...baseConfig,
			avatarDataAttribute: "data-image",
			avatarAttribute: "src",
		});
		intersect(avatarEl);

		expect(avatarEl.getAttribute("src")).toContain("dicebear");
		expect(avatarEl.style.backgroundImage).toBe("");
	});

	it("gives a nested reply its OWN avatar, not the parent comment's (regression)", () => {
		// Mirrors real Blogger markup: main comment + reply both live inside
		// the same outer .comment wrapper, sharing structure but each with
		// their own .meta > (img, name, time) siblings.
		const wrapper = document.createElement("details");
		wrapper.className = "comment";
		wrapper.innerHTML = `
			<summary>
				<div class="meta">
					<span class="img" data-image="//www.blogger.com/img/blogger_logo_round_35.png"></span>
					<span class="name">main</span>
					<span class="time" data-datetime="2024-01-01T00:00:00Z"></span>
				</div>
			</summary>
			<div class="comment-replies">
				<div class="reply">
					<div class="meta">
						<span class="img" data-image="//example.com/reply-photo.jpg"></span>
						<span class="name">replier</span>
						<span class="time" data-datetime="2024-01-02T00:00:00Z"></span>
					</div>
				</div>
			</div>
		`;
		document.body.appendChild(wrapper);

		const mainAvatar = wrapper.querySelectorAll(".img")[0] as HTMLElement;
		const replyAvatar = wrapper.querySelectorAll(".img")[1] as HTMLElement;

		avatarify({ ...baseConfig, avatarDataAttribute: "data-image" });
		intersect(mainAvatar);
		intersect(replyAvatar);

		expect(mainAvatar.style.backgroundImage).toContain("dicebear");
		expect(replyAvatar.style.backgroundImage).toContain("reply-photo.jpg");
		expect(replyAvatar.style.backgroundImage).not.toBe(
			mainAvatar.style.backgroundImage,
		);
	});

	it("force-loads content revealed by opening a closed <details>", () => {
		const wrapper = document.createElement("details");
		wrapper.className = "comment";
		wrapper.innerHTML = `
			<summary>
				<div class="meta">
					<span class="img" data-image="//www.blogger.com/img/blogger_logo_round_35.png"></span>
					<span class="name">main</span>
					<span class="time" data-datetime="2024-01-01T00:00:00Z"></span>
				</div>
			</summary>
			<div class="meta">
				<span class="img" data-image="//example.com/reply-photo.jpg"></span>
				<span class="name">replier</span>
				<span class="time" data-datetime="2024-01-02T00:00:00Z"></span>
			</div>
		`;
		document.body.appendChild(wrapper);
		const replyAvatar = wrapper.querySelectorAll(".img")[1] as HTMLElement;

		avatarify({ ...baseConfig, avatarDataAttribute: "data-image" });

		// never intersects — <details> stays closed, so the observer above
		// legitimately never fires for it. Opening it should still load it.
		wrapper.open = true;
		wrapper.dispatchEvent(new Event("toggle"));

		expect(replyAvatar.style.backgroundImage).toContain("reply-photo.jpg");
	});

	it("fires onAvatarSet with the right detail", () => {
		const comment = makeComment({
			username: "bob",
			dataImage: "//www.blogger.com/img/blogger_logo_round_35.png",
		});
		const avatarEl = comment.querySelector(".img") as HTMLElement;
		const onAvatarSet = vi.fn();

		avatarify({
			...baseConfig,
			avatarDataAttribute: "data-image",
			onAvatarSet,
		});
		intersect(avatarEl);

		expect(onAvatarSet).toHaveBeenCalledTimes(1);
		const detail = onAvatarSet.mock.calls[0][0];
		expect(detail.username).toBe("bob");
		expect(detail.avatarEl).toBe(avatarEl);
		expect(detail.url).toContain("dicebear");
	});

	it("fires onSuccess separately per avatar, after real load, with increasing index", async () => {
		const c1 = makeComment({
			username: "a",
			dataImage: "//www.blogger.com/img/blogger_logo_round_35.png",
		});
		const c2 = makeComment({
			username: "b",
			dataImage: "//www.blogger.com/img/blogger_logo_round_35.png",
		});
		const a1 = c1.querySelector(".img") as HTMLElement;
		const a2 = c2.querySelector(".img") as HTMLElement;
		const onSuccess = vi.fn();

		avatarify({ ...baseConfig, avatarDataAttribute: "data-image", onSuccess });
		intersect(a1);
		intersect(a2);

		expect(onSuccess).not.toHaveBeenCalled(); // MockImage resolves next microtask
		await flush();

		expect(onSuccess).toHaveBeenCalledTimes(2);
		const [first, second] = onSuccess.mock.calls.map((c) => c[0]);
		expect(first.index).toBe(0);
		expect(second.index).toBe(1);
		expect(first.id).toBe(`avatar-${first.index}`);
	});

	it("onSuccess uses avatarEl's own id when it has one", async () => {
		const comment = makeComment({
			dataImage: "//www.blogger.com/img/blogger_logo_round_35.png",
		});
		const avatarEl = comment.querySelector(".img") as HTMLElement;
		avatarEl.id = "custom-id";
		const onSuccess = vi.fn();

		avatarify({ ...baseConfig, avatarDataAttribute: "data-image", onSuccess });
		intersect(avatarEl);
		await flush();

		expect(onSuccess.mock.calls[0][0].id).toBe("custom-id");
	});

	it("refresh() force-loads everything, bypassing the in-view gate", () => {
		const comment = makeComment({
			dataImage: "//www.blogger.com/img/blogger_logo_round_35.png",
		});
		const avatarEl = comment.querySelector(".img") as HTMLElement;

		const instance = avatarify({
			...baseConfig,
			avatarDataAttribute: "data-image",
		});
		expect(avatarEl.dataset.avatarSet).toBeUndefined();

		instance.refresh();

		expect(avatarEl.dataset.avatarSet).toBe("true");
	});

	it("does nothing once an avatar is already set (idempotent)", () => {
		const comment = makeComment({
			dataImage: "//www.blogger.com/img/blogger_logo_round_35.png",
		});
		const avatarEl = comment.querySelector(".img") as HTMLElement;

		const instance = avatarify({
			...baseConfig,
			avatarDataAttribute: "data-image",
		});
		instance.refresh();
		const firstUrl = avatarEl.style.backgroundImage;

		instance.refresh();
		expect(avatarEl.style.backgroundImage).toBe(firstUrl);
	});

	it("destroy() stops watching — later intersections do nothing", () => {
		const comment = makeComment({
			dataImage: "//www.blogger.com/img/blogger_logo_round_35.png",
		});
		const avatarEl = comment.querySelector(".img") as HTMLElement;

		const instance = avatarify({
			...baseConfig,
			avatarDataAttribute: "data-image",
		});
		instance.destroy();
		intersect(avatarEl);

		expect(avatarEl.dataset.avatarSet).toBeUndefined();
	});

	it("calls onError when avatarSelector matches nothing for a comment", () => {
		const wrapper = document.createElement("div");
		wrapper.className = "comment";
		wrapper.innerHTML = `<span class="name">nopic</span>`;
		document.body.appendChild(wrapper);
		const onError = vi.fn();

		const instance = avatarify({ ...baseConfig, onError });
		instance.refresh();

		expect(onError).toHaveBeenCalled();
		expect(onError.mock.calls[0][0]).toContain("avatarSelector");
	});

	it("newly-added comments (pagination/async) get picked up via MutationObserver", async () => {
		vi.useFakeTimers();

		avatarify({
			...baseConfig,
			avatarDataAttribute: "data-image",
			debounce: 0,
		});

		const comment = makeComment({
			dataImage: "//www.blogger.com/img/blogger_logo_round_35.png",
		});
		const avatarEl = comment.querySelector(".img") as HTMLElement;

		await vi.advanceTimersByTimeAsync(0);

		intersect(avatarEl);
		expect(avatarEl.dataset.avatarSet).toBe("true");

		vi.useRealTimers();
	});
});
