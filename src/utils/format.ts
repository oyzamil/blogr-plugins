export const humanize = (str: string) =>
	str.replace(/-/g, " ").replace(/\b\w/g, (char) => char.toUpperCase());
