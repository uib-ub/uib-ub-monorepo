# Assets

Svg assets used across the monorepo, exposed as react components.

The svg files in `src/assets` are the **single source of truth**. React
components in `src/react` are **generated** from them — never edit them by
hand. The pipeline is driven by [`assets.config.json`](./assets.config.json)
and run with the `cli` package:

```sh
# from the repo root (or packages/cli)
npx cli assets update     # fetch -> convert -> optimize -> build, for all orgs
npx cli assets update uib # ...for a single org
```

Individual steps (useful when adding a new org or debugging):

```sh
npx cli assets list              # show configured orgs/assets and local state
npx cli assets fetch [org]       # download sources into .cache/source/<org>/
npx cli assets convert [org]     # pdf/eps/ai -> svg (inkscape), svg passthrough
npx cli assets optimize [org]    # svgo (geometric autocrop) -> src/assets/*.svg
npx cli assets build             # svgr -> src/react/*.tsx + index.ts
npx cli assets prune             # report files not in the config (dry-run)
npx cli assets prune --delete    # ...and delete them + refresh index.ts
```

Removing an asset: delete its entry from `assets.config.json`, then run
`npx cli assets prune --delete` — the pipeline never deletes on its own, so
prune is what cleans up the svg and component the entry used to manage.

## Directory structure

- `assets.config.json` — org/asset mapping that drives the pipeline (see below).
- `svgo.config.js` — svgo config used by the `optimize` step. The
  `{ name: "autocrop-geometric" }` entry is a marker: the cli swaps it for the
  actual plugin (implemented in `packages/cli/src/assets/autocrop.ts`) so the
  plugin order stays declared here.
- `scripts/verify-crop.js` — checks that no asset is cropped: the artwork
  visible within the source viewBox must fit the final viewBox (uses inkscape
  as ground truth; see Autocrop below).
- `src/assets/` — optimized svgs, the source of truth for generated components.
- `src/react/` — generated react components and `index.ts`. Do not edit.
- `preview/` + `vite.config.ts` — dev-only logo preview (`npm run preview`).
- `.cache/` — scratch space for the CLI (gitignored): `zips/` downloaded
  archives, `source/` extracted upstream files, `stage/` converted svgs.
  Everything here is re-creatable via `cli assets fetch` + `convert` and is
  deliberately not committed — the optimized svgs in `src/assets/` are the
  committed source of truth.

## Naming

Every output name follows an explicit grammar:

```
{org}-{type}-{polarity?}-{layout?}-{lang?}
```

- `org` — the owning organization (`uib`, `nb`, `termportalen`, …).
- `type` — what the asset is: `lockup` (mark + name), `mark` (the mark
  alone), `initials` (monogram lockup), `icon` (app/ui pictogram),
  `wordmark` (name alone, where a brand ships it separately). One
  standard vocabulary across orgs — no per-org synonyms. A bare `logo`
  segment is not
  allowed — it carries no information.
- `polarity` — `positive` (on light) or `negative` (on dark), only when
  the asset ships fixed brand colors. currentColor variants drop this
  segment: `uib-lockup-positive-centered-no` (fixed colors) vs
  `uib-lockup-centered-no` (follows CSS `color`).
- `layout` — centered/left/twolines where the brand offers variants.
- `lang` — `no`/`en` when the lockup contains text.

Deprecated assets keep the grammar too (`iiif-lockup-old`,
`uib-ub-lockup-en`) — the preview badges them.

## Publishing

Publishing as `@uib-ub/logos` to the org's GitLab npm registry is planned
but intentionally not started — see [PUBLISH.md](./PUBLISH.md).

## Config format

Each org declares where its assets come from and maps every source file to an
output name:

```jsonc
{
  "orgs": {
    "uib": {
      "label": "Universitetet i Bergen",
      // optional: link to the org's logo/design documentation.
      // Shown in the preview's org group header.
      "docs": "https://…/profil",
      "source": { "type": "zip", "url": "https://…/logo.zip" },
      "assets": [
        {
          "file": "PDF/UiB_PositivMidtstilt.pdf",
          "output": "uib-lockup-positive-centered-no",
        },
        // an asset with neither "file" nor "url" is local (see below)
        { "output": "uib-icon" },
      ],
    },
    "hvl": {
      "source": { "type": "files" },
      "assets": [
        // per-asset url; if the url is a zip, "file" selects the entry inside it
        {
          "url": "https://…/hvl_logo_cmyk.ai.zip",
          "file": "HVL_logo_cmyk.ai",
          "output": "hvl-lockup-positive-no",
        },
        { "output": "hvl-icon" }, // local
      ],
    },
    // an org can also be local as a whole
    "termportalen": {
      "source": { "type": "local" },
      "assets": [{ "output": "termportalen-lockup" }],
    },
  },
}
```

Source types:

- `zip` — one shared zip per org; each asset names its `file` (path inside the
  zip). Files in the zip that are not mapped are reported, never imported.
- `files` — each asset has its own `url`. If the url points to a zip, `file`
  selects the entry inside it (e.g. HVL serves one `.ai` per zip). For plain
  urls `file` optionally overrides the cache basename — use it when the url
  does not end in a usable filename (e.g. Google Drive direct-download links:
  `https://drive.google.com/uc?export=download&id=<fileId>`).
- `local` — no upstream source. The svg in `src/assets/` is maintained by
  hand; the pipeline only cleans editor junk from it and generates the
  component.

**Local assets** — an asset with neither `file` nor `url` is local, even
inside a `zip`/`files` org. Use this for logos that have no published
download source (e.g. `uib-ub-marcus`, the Termportalen logos) or hand-made
variants: they belong under their real org, not in a catch-all bucket. The
pipeline never fetches, converts or autocrops them — the svg in `src/assets/`
is the source of truth, including its viewBox and any embedded dark-mode
`<style>` block.

Per-asset options:

- `exportName` — override the generated export name in `src/react/index.ts`
  (default is the PascalCase form of `output`).
- `build: false` — keep the svg but do not generate a react component.
- `deprecated: true` — mark the asset as deprecated. It is still fetched,
  built and exported (consumers keep working), but flagged in
  `cli assets list` and badged/filterable in the preview app. Use this when
  an asset is superseded by a newer variant instead of deleting it.
- `currentColor: true` — replace the logo's single fill color with
  `currentColor`, so it follows the CSS `color` of its surroundings instead
  of shipping pos/neg color variants. Only valid for monochrome logos: the
  optimize step verifies there is exactly one effective fill color and skips
  the asset with an error reason otherwise (e.g. HVL's positive logo is
  two-tone, so it gets no variant). Reuse the positive source file and drop
  the polarity segment from the output name:

  ```jsonc
  {
    "file": "PDF/UiB_PositivMidtstilt.pdf",
    "output": "uib-lockup-positive-centered-no",
  },
  {
    "file": "PDF/UiB_PositivMidtstilt.pdf",
    "output": "uib-lockup-centered-no", // no polarity — comes from CSS `color`
    "currentColor": true,
  },
  ```

  Naming convention: `uib-lockup-positive-centered-no` /
  `uib-lockup-negative-centered-no` carry explicit brand colors;
  `uib-lockup-centered-no` is the polarity-free `currentColor` variant.

## How to add a new asset

1. Add an entry to `assets.config.json` under the right org (or add a new org
   with its source url(s)). Follow the naming grammar above.
2. Run `npx cli assets update [org]`.
3. Check the report: new svgs land in `src/assets/`, components in `src/react/`,
   and `index.ts` is regenerated. Unmapped files in zips are reported so
   nothing gets imported silently.

For an asset with no upstream source, drop a cleaned svg into `src/assets/`
named after its output (kebab-case, following the grammar) and register it
under its real org with neither `file` nor `url`.

## Autocrop

The `optimize` step crops each svg's `viewBox` to the exact bounding box of
the painted artwork, so logos carry no transparent padding. This is done by
a local svgo plugin (`packages/cli/src/assets/autocrop.ts`) that computes
the bounding box geometrically: it walks the svg, composes `transform`
attributes into affine matrices and computes exact curve/arc extrema, then
intersects the result with the authored viewBox (the svg root clips
overflow) and snaps outward to integers. The new viewBox keeps its offset
(e.g. `49 43 427 279`) — coordinates are never rewritten.

Anything the plugin cannot measure exactly (text, `<use>`, `<image>`,
remaining `<style>` blocks, `clip-path`/`mask`/`filter` attributes,
non-none strokes) makes it bail and keep the authored viewBox, so it can
never crop a logo wrongly.

It replaces the `svgo-autocrop` package, which measured rendered pixels in
headless Chrome: in that setup content beyond the browser's default 800px
viewport *width* is never painted, so every logo wider than 800 units was
silently cropped to 800 (the NB lockup, 1337 units wide, came out as
`viewBox="0 0 800 182"` with the wordmark cut off).

After changing the pipeline, verify that nothing is cropped:

```sh
npm run verify-crop -w assets   # or: node scripts/verify-crop.js
```

The script measures the artwork with inkscape (ground truth independent of
the plugin's own math) and checks that everything visible within the source
viewBox fits the final viewBox of every asset in `src/assets/`.

## Preview

Render every asset on one page for manual verification after running the
pipeline:

```sh
npm run preview -w assets   # http://localhost:3011
```

Each logo sits on the background its color capability calls for:

- **adaptive** — the svg restyles itself via CSS: either an embedded
  `prefers-color-scheme` rule or `currentColor`. The card follows the
  preview's light/dark toggle (the dark rules are mirrored under the toggle,
  so logos follow it even when it disagrees with the OS).
- **negative** — white artwork, always on a dark background.
- **positive** — dark/colored artwork, always on a light background.

The sidebar filters the grid, with entry counts per option:

- text search on the asset name,
- org (from `assets.config.json`; "Not in config" shows stray svgs),
- status (active / deprecated),
- color capability (`currentColor` vs fixed colors).

Assets without a generated component (e.g. `build: false`) are rendered from
the raw svg and marked "not built". Deprecated assets are struck through and
badged.

While the preview is running, edits to `assets.config.json` hot-update the
page in place (org badges, deprecation, filter counts) — your selected
filters and mode are kept. Changes to the svgs themselves still trigger a
full page reload.

## Dark mode

Some monochrome marks (e.g. `uib-icon`, `uib-ub-no`) carry an embedded
`<style>` block with a `prefers-color-scheme: dark` rule inside the svg in
`src/assets/`. The build passes these through untouched, so the generated
component follows the system color scheme. Colored logos instead come in
positive/negative pairs (e.g. `uib-positive-centered-no` /
`uib-negative-centered-no`) — pick the right variant for your background.

Do not run the full svgo config over svgs with embedded `<style>` blocks; the
`optimize` step already handles local svgs with a conservative cleanup profile.

## Requirements

- [inkscape](https://inkscape.org) — required for pdf/eps/ai conversion
  (`brew install inkscape`). `pdftocairo` is used as a fallback for pdf.
- [ghostscript](https://www.ghostscript.com) — required for `.ps` sources
  (e.g. Fritt Ord's logos): `ps2pdf` flattens them to pdf before inkscape
  converts (`brew install ghostscript`).
