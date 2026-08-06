import { readFileSync } from "node:fs";
import type { OutputOptions } from "rolldown";
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
	"resizeImage",
	"shortcodify",
	"createWidget",
	"stackify",
] as const;

const BANNER = (format: string) =>
	`/*! ${pkg.name} v${pkg.version} - ${format} | M.Muzammil <https://muzammil.work/> | MIT License */`;

const applyOutputOptions = (
	options: OutputOptions,
	format: string,
	globalName?: string,
	entryFileName?: string,
) => {
	options.banner = BANNER(format);

	options.comments = {
		legal: true,
	};

	if (globalName) {
		options.name = globalName;
	}

	if (entryFileName) {
		options.entryFileNames = entryFileName;
	}

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

const packageBuild = (minify: boolean): UserConfig => ({
	...shared,
	entry: {
		[pkg.name]: "src/index.ts",
	},
	format: ["esm", "cjs"],
	dts: !minify,
	clean: !minify,
	minify,
	outputOptions(options, format) {
		applyOutputOptions(options, format);

		// options.entryFileNames =
		// 	format === "cjs"
		// 		? `${pkg.name}${minify ? ".min" : ""}.cjs`
		// 		: `${pkg.name}${minify ? ".min" : ""}.mjs`;

		return options;
	},
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
						dts: format === "es" ? ".ts" : ".cts",
					}),
		};
	},
});

const browserBuild = (
	entry: string,
	fileName: string,
	globalName: string,
	minify: boolean,
): UserConfig => ({
	...shared,
	entry: {
		[fileName]: entry,
	},
	format: ["iife"],
	dts: false,
	clean: false,
	minify,
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

	browserBuild("src/browser.ts", pkg.name, "BlogrPlugins", false),
	browserBuild("src/browser.ts", pkg.name, "BlogrPlugins", true),

	...PLUGINS.flatMap((plugin) => {
		const globalName = `Blogr${plugin[0].toUpperCase()}${plugin.slice(1)}`;

		return [
			browserBuild(`src/browser/${plugin}.ts`, plugin, globalName, false),
			browserBuild(`src/browser/${plugin}.ts`, plugin, globalName, true),
		];
	}),
]);
