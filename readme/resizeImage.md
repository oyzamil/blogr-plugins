# resizeImage / isSupportedImage

Rewrites Blogger/Google-hosted image URLs (`googleusercontent.com` /
`bp.blogspot.com`) with new size, crop, format, flip, rotation and
grayscale parameters. Unsupported URLs are returned unchanged — safe to
run any image URL through it without checking first.

```ts
import { resizeImage, isSupportedImage } from "blogr-plugins";

const url = resizeImage("https://1.bp.blogspot.com/path/s72-c/image.jpg", {
	width: 400,
	height: 400,
	format: "webp",
});

isSupportedImage(url); // true
```

---

## `resizeImage(url, options?)`

Rewrites a Blogger/Google image URL with new parameters.

```ts
function resizeImage(
	url: string,
	options?: ResizeImageOptions,
): string;
```

### Parameters

| Parameter | Type                    | Description |
| --------- | ----------------------- | ------------- |
| `url`     | `string`                | Original image URL |
| `options` | `ResizeImageOptions`    | Size, format, and transform options |

### Return value

The rewritten URL (if a Blogger/Google-hosted image) or the original URL unchanged
(if unsupported).

### Options

| Option      | Type                             | Default   | Description |
| ----------- | --------------------------------- | --------- | ------------- |
| `width`     | `number`                          | `640`     | Output width in px |
| `height`    | `number`                          | `360`     | Output height in px |
| `crop`      | `"circle" \| "square"`            | —         | Crop shape |
| `format`    | `"jpeg" \| "png" \| "webp"`       | `"webp"`  | Output image format |
| `flip`      | `"horizontally" \| "vertically"`  | —         | Flip direction |
| `rotate`    | `90 \| 180 \| 270`                | `0`       | Rotation in degrees |
| `grayscale` | `boolean`                         | `false`   | Convert to grayscale |

---

## `isSupportedImage(url)`

Checks whether a URL can be resized by `resizeImage`.

```ts
function isSupportedImage(url: string): boolean;
```

Returns `true` if the URL is a Blogger/Google-hosted image, `false` otherwise.

```ts
isSupportedImage("https://1.bp.blogspot.com/path/image.jpg"); // true
isSupportedImage("https://example.com/image.jpg");            // false
```

---

## Formats & builds

Like every plugin in this package, `resizeImage` ships in three forms:

- **ESM / CJS** (`import { resizeImage, isSupportedImage } from "blogr-plugins"`),
  for bundled projects.
- **Standalone IIFE** — `dist/resizeImage.js` — exposes
  `window.BlogrPlugins.resizeImage` and `window.BlogrPlugins.isSupportedImage`,
  for a plain `<script>` tag with no build step.
- No jQuery bridge — these are utility functions, not jQuery plugins.

```html
<script src="https://unpkg.com/blogr-plugins/dist/resizeImage.min.js"></script>
<script>
	const { resizeImage } = BlogrPlugins;
	const newUrl = resizeImage("https://1.bp.blogspot.com/path/s72-c/image.jpg", {
		width: 400,
		height: 400,
		format: "webp",
	});
	console.log(newUrl);
</script>
```