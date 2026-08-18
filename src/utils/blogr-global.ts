/**
 * Stand-in for the real `blogr` package, used ONLY by the standalone IIFE
 * browser builds (aliased in place of `import Blogr from "blogr"` — see
 * `tsdown.config.ts`).
 *
 * Plain `external + output.globals` (what the npm ESM/CJS builds use)
 * compiles a *bare* `Blogr` identifier reference into the bundle. If the
 * `<script src=".../blogr">` tag is missing entirely, that bare reference
 * throws a native `ReferenceError` the instant the plugin script loads —
 * before {@link requireBlogr} ever gets a chance to run.
 *
 * Reading `globalThis.Blogr` defensively here means the import always
 * resolves to *something* (possibly `undefined`), so the friendly,
 * actionable {@link requireBlogr} error is what the user sees in every
 * missing/late/misnamed-script scenario, not just some of them.
 */
const Blogr: unknown = (globalThis as any).Blogr;

export default Blogr;
