# Assets

This directory contains assets used by the monorepo, mainly svg files.

NB! The svg files are not used directly, but are converted to react components. The react components have inline styles for darkmode support. This might not be the best approach, but it works for now. Some svgs have issues with viewBox and sizing.

## Directory structure

* `build`: temporary directory used to generate assets.
* `src`: contains svg assets used by the monorepo, but with some modifications.
  * `src/assets`: contains svg assets "as is" used by the monorepo.
  * `src/react`: react components generated from svg assets.

## How to add a new asset

1. Add the svg asset to the `assets` directory (use *kebab-case*).
2. `npm run build-assets -w assets` to generate the react components in `build`.
3. Copy new react components from `build` to `src/react`, and modify as needed.