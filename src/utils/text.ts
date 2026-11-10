/** Counts words via whitespace splitting — same technique used across the plugin suite. */
export function countWords(text: string): number {
	const trimmed = text.trim();
	if (!trimmed) return 0;
	return trimmed.split(/\s+/).length;
}
