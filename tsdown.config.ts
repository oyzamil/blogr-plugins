import { readFileSync } from "node:fs";
import { defineConfig, type UserConfig } from "tsdown";

const pkg = JSON.parse(
	readFileSync(new URL("./package.json", import.meta.url), "utf8"),
);

const shared: UserConfig = {
	sourcemap: false,
	target: "es2020",
	banner(ctx) {
		return {
			js: `/* blogr-plugins v${pkg.version} - ${ctx.format} | M.Muzammil <https://muzammil.work/> | MIT License */`,
		};
	},
};

// Rolldown always stamps a format tag into IIFE filenames (".iife.js"), so
// CDN-facing builds still need entryFileNames driven manually. ESM/CJS
// don't: tsdown's own defaults (.mjs/.cjs/.d.mts/.d.cts) are already clean,
// so those builds are left alone below — no postbuild rename step needed.
function namedOutput(
	fileName: string,
	globalName?: string,
): UserConfig["outputOptions"] {
	return (options) => {
		options.entryFileNames = fileName;
		if (globalName) options.name = globalName;
		return options;
	};
}

export default defineConfig([
	// Plain ESM + CJS, with declaration files (tsdown's defaults: .mjs, .cjs,
	// .d.mts, .d.cts — no naming overrides needed here).
	{
		...shared,
		entry: { "blogr-plugins": "src/index.ts" },
		format: ["esm", "cjs"],
		dts: true,
		clean: true,
		minify: false,
	},
	// Minified twins. dts stays off here (already emitted above), so there's
	// no format-tag/dts naming collision to work around — just add ".min".
	{
		...shared,
		entry: { "blogr-plugins": "src/index.ts" },
		format: ["esm", "cjs"],
		dts: false,
		clean: false,
		minify: true,
		outputOptions(options, format) {
			options.entryFileNames =
				format === "cjs" ? "blogr-plugins.min.cjs" : "blogr-plugins.min.mjs";
			return options;
		},
	},
	{
		...shared,
		entry: { "blogr-plugins": "src/browser.ts" },
		format: ["iife"],
		globalName: "BlogrPlugins",
		dts: false,
		clean: false,
		minify: false,
		outputOptions: namedOutput("blogr-plugins.js"),
	},
	{
		...shared,
		entry: { "blogr-plugins": "src/browser.ts" },
		format: ["iife"],
		globalName: "BlogrPlugins",
		dts: false,
		clean: false,
		minify: true,
		outputOptions: namedOutput("blogr-plugins.min.js"),
	},
	// standalone per-plugin CDN builds — each merges onto window.BlogrPlugins
	// on its own, so a page can load just `stickify.min.js` instead of the
	// full bundle. Rolldown can't code-split IIFE output, so each plugin
	// gets its own single-entry config rather than one multi-entry block.
	...(
		[
			"stickify",
			"menuify",
			"lazify",
			"tocify",
			"replacify",
			"cookify",
			"resizeImage",
		] as const
	).flatMap((name): UserConfig[] => [
		{
			...shared,
			entry: { [name]: `src/browser/${name}.ts` },
			format: ["iife"],
			dts: false,
			clean: false,
			minify: false,
			outputOptions: namedOutput(
				`${name}.js`,
				`Blogr${name[0].toUpperCase()}${name.slice(1)}`,
			),
		},
		{
			...shared,
			entry: { [name]: `src/browser/${name}.ts` },
			format: ["iife"],
			dts: false,
			clean: false,
			minify: true,
			outputOptions: namedOutput(
				`${name}.min.js`,
				`Blogr${name[0].toUpperCase()}${name.slice(1)}`,
			),
		},
	]),
]);
