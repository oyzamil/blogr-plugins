import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { type OutputOptions } from "rolldown";
import { defineConfig, type UserConfig } from "tsdown";

const pkg = JSON.parse(
	readFileSync(new URL("./package.json", import.meta.url), "utf8"),
);

const PLUGINS = [
	"stickify",
	"menuify",
	"lazify",
	"tocify",
	"replacify",
	"cookify",
	"shortcodify",
	"stackify",
	"avatarify",
	"relatify",
	"marqify",
	"resizeImage",
	"createWidget",
	"adsenseLoader",
	"readMeter",
] as const;

const BANNER = (format: string) =>
	`/*! ${pkg.name} v${pkg.version} - ${format} | M.Muzammil <https://muzammil.work/> | MIT License */`;

// IIFE builds only: resolves `import Blogr from "blogr"` to a small shim
// that reads `globalThis.Blogr` defensively, instead of leaving `blogr`
// external. See src/utils/blogr-global.ts for why.
const BLOGR_BROWSER_SHIM = fileURLToPath(
	new URL("./src/utils/blogr-global.ts", import.meta.url),
);

const applyOutputOptions = (
	options: OutputOptions,
	format: string,
	globalName?: string,
	entryFileName?: string,
) => {
	options.banner = BANNER(format);
	options.comments = { legal: true };
	if (globalName) options.name = globalName;
	if (entryFileName) options.entryFileNames = entryFileName;
	return options;
};

const shared: UserConfig = {
	sourcemap: false,
	target: "es2020",
	deps: {
		onlyBundle: false,
		alwaysBundle: ["blogr"],
	},
};

// Main package build (ESM + CJS + types)
const packageBuild = (minify: boolean): UserConfig => ({
	...shared,
	entry: {
		"blogr-plugins": "src/index.ts",
	},
	format: ["esm", "cjs"],
	dts: !minify,
	clean: !minify,
	minify,
	outExtensions({ format }) {
		return {
			js: minify
				? format === "es"
					? ".esm.min.js"
					: ".min.cjs"
				: format === "es"
					? ".esm.js"
					: ".cjs",
			...(minify
				? {}
				: {
						dts: format === "es" ? ".d.ts" : ".d.cts",
					}),
		};
	},
	outputOptions(options, format) {
		applyOutputOptions(options, format);
		return options;
	},
});

// Browser IIFE builds (for <script> tags)
const browserBuild = (
	entry: string,
	fileName: string,
	globalName: string,
	minify: boolean,
): UserConfig => ({
	...shared,
	entry: { [fileName]: entry },
	format: ["iife"],
	dts: false,
	clean: false,
	minify,
	// "blogr" is external for the npm package build (shared.external), but
	// IIFE builds must resolve it locally so the alias below can redirect
	// it to the shim — override both the deprecated `external` (passed
	// straight to rolldown) and the peerDependency auto-detection that
	// `deps.alwaysBundle` bypasses. Only relatify/createWidget actually
	// import "blogr"; this is a no-op for every other plugin's browser build.
	deps: { alwaysBundle: ["blogr"] },
	alias: { blogr: BLOGR_BROWSER_SHIM },
	outputOptions(options, format) {
		return applyOutputOptions(
			options,
			format,
			globalName,
			`${fileName}${minify ? ".min" : ""}.js`,
		);
	},
});

export default defineConfig([
	packageBuild(false),
	packageBuild(true),

	// All plugins in one IIFE
	browserBuild("src/browser.ts", pkg.name, "BlogrPlugins", false),
	browserBuild("src/browser.ts", pkg.name, "BlogrPlugins", true),

	// Individual plugin IIFE builds
	...PLUGINS.flatMap((plugin) => {
		const globalName = `Blogr${plugin[0].toUpperCase()}${plugin.slice(1)}`;
		return [
			browserBuild(`src/browser/${plugin}.ts`, plugin, globalName, false),
			browserBuild(`src/browser/${plugin}.ts`, plugin, globalName, true),
		];
	}),
]);
