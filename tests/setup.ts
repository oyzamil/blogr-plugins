// jsdom doesn't implement ResizeObserver; stickify relies on it to react to
// sidebar size changes, so tests get a harmless no-op stand-in.
class ResizeObserverStub {
	observe() {}
	unobserve() {}
	disconnect() {}
}

globalThis.ResizeObserver ??= ResizeObserverStub;

// jsdom doesn't implement media loading; lazify's video handling calls
// .load() after filling in sources, which would otherwise spam
// "Not implemented" console errors during tests.
if (typeof HTMLMediaElement !== "undefined") {
	HTMLMediaElement.prototype.load = () => {};
}
