// jsdom doesn't implement ResizeObserver; stickify relies on it to react to
// sidebar size changes, so tests get a harmless no-op stand-in.
class ResizeObserverStub {
	observe() {}
	unobserve() {}
	disconnect() {}
}

globalThis.ResizeObserver ??= ResizeObserverStub;
