---
marp: true
theme: rose-pine-moon
title: Why a registry?
paginate: true
---

# **Why a UI registry?**

shadcn/ui registry _vs_ npm packages

---

## The problem

**UI packages create friction:**
- Code is hidden in `node_modules/`
- Upgrades are all-or-nothing
- Customization is painful
- Building packages and publishing to npm is painful

**Solution:** shared components **and** local control.

---

## The idea in one sentence

**Copy components into your repo instead of installing them.**

---

## What is a UI registry?

A registry is a **collection of components** distributed via **URLs**.

Components are **copied into your codebase** rather than installed as dependencies.

**Example:**
```bash
npx shadcn@latest add https://chc-registry.vercel.app/r/iiif-manifest.json
```

---

## Built on shadcn/ui

**shadcn/ui** pioneered the registry approach for React components.

**We reuse their CLI:**
- Same `shadcn` CLI tool
- Same JSON registry format
- Same workflow developers already know
- Works with any registry URL

**The CLI is now language agnostic, "Universal items".**

---

## Prepare your repo

**Before you add components:**
- Run `npx shadcn@latest init` once
- Or ensure `components.json` exists

**What `components.json` does:**
- Tells the CLI where to write components (aliases/paths)
- Points to Tailwind config and style settings

---

## Registry vs npm (quick contrast)

**npm packages**
- Live in `node_modules/`
- Updates are global
- Customization is limited

**Registry**
- Lives in `src/`
- You control updates
- Easy to customize

---

## The 5 core benefits

1. **Ownership** - Code lives in your repo
2. **Customization** - Edit components directly
3. **No version conflicts** - Each project is independent
4. **Safer updates** - Merge diffs on your terms
5. **Team flexibility** - Adopt gradually, per project
6. **Multi-framework support** - React, Vue, Svelte, etc.

---

## Updates without drama

**npm packages:**
```bash
npm update @uib-ub/chc-components
# Hope nothing breaks!
```

**Registry:**
```bash
npx shadcn@latest add https://chc-registry.vercel.app/r/button.json
# Review the diff, merge what you want
```

**Git is your friend.**

---

## Real example: CHC Registry

**Our registry:** https://chc-registry.vercel.app/docs

Built with Fumadocs and customized build scripts.

**Available components (examples):**
- `iiif-manifest` - IIIF viewer component
- `iiif-image` - IIIF image display
- `content-grid` - Content layout grid

**Documented · Customizable · Ready to copy**

---

## How to create a new minimal component (high level)

1. Create a new component in `src/registry/{team}/items/{name}`
   1. `registry-item.ts`
   2. The actual component source code `components/{name}.tsx`
2. We run `npm run build:registry`
3. JSON files are generated in `public/r/{name}.json`
4. The shadcn CLI downloads JSON and writes files into your app

---

## Source code in the registry

```
src/registry/uib-ub/items/iiif-manifest/
  ├── components/
  │   └── iiif-manifest.tsx
  ├── examples/
  │   └── iiif-manifest-demo.tsx
  ├── styles/
  │   └── iiif-manifest.css
  ├── utils/
  │   └── index.ts
  ├── types/
  │   └── index.ts
  ├── hooks/
  │   └── index.ts
  └── registry-item.ts
```

---

## The `registry-item.ts` file

```ts
export const blocks: Registry['items'] = [
  {
    name: 'iiif-image',
    type: 'registry:block',
    files: [
      {
        path: 'uib-ub/items/iiif-image/components/iiif-image.tsx',
        type: 'registry:component',
        target: 'components/ui/chc/iiif-image.tsx',
      },
    ],
    dependencies: [ '@samvera/clover-iiif', 'next', ],
  },
  {
    name: 'iiif-image-demo',
    ...
    registryDependencies: ['https://chc-registry.vercel.app/r/iiif-image.json'],
  },
];
```

---

## Build step → JSON

**Running `npm run build:registry`:**

1. **Scans** `src/registry/` for `registry-item.ts`
2. **Reads** component source (`.tsx`)
3. **Embeds** source as strings in JSON
4. **Outputs** to `public/r/component-name.json`

---

## The JSON structure of a registry item in `public/r/`

```json
{
  "$schema": "https://ui.shadcn.com/schema/registry-item.json",
  "name": "iiif-image",
  "type": "registry:block",
  "title": "IIIF Image",
  "description": "IIIF Image",
  "dependencies": ["@samvera/clover-iiif", "next"],
  "files": [
    {
      "path": "src/registry/uib-ub/items/iiif-image/components/iiif-image.tsx",
      "content": "'use client';\n\nimport ...",
      "type": "registry:component",
      "target": "components/ui/chc/iiif-image.tsx"
    }
  ]
}
```

---

## Distribution via URL

```
https://chc-registry.vercel.app/r/iiif-manifest.json
https://chc-registry.vercel.app/r/button.json
```

**shadcn CLI:**
- Downloads JSON
- Writes files into your project
- Installs dependencies

---

## Remember the trade-offs

**Registry downsides:**
- No automatic updates
- Some code duplication
- Manual syncing between projects
- More git commits

**Usually worth it for UI components.**

---

## When to use npm vs registry

**Use npm packages for:**
- Utility libraries (`lodash`, `date-fns`)
- Core frameworks (`react`, `next`)
- Third-party dependencies

**Use registry for:**
- UI components
- Design system elements
- Team-specific blocks

---

## The CHC Registry strategy

✅ Shared components across projects  
✅ Easy customization per project  
✅ Gradual adoption  
✅ Full transparency  

---

## Summary

**Registry approach wins because:**
- You own the code
- You customize freely
- You update on your terms

**npm for libraries. Registry for UI.**

---

## Questions?

**Try it yourself:**
```bash
npx shadcn@latest add https://chc-registry.vercel.app/r/iiif-manifest.json
```

**Explore the registry:**
https://chc-registry.vercel.app/docs

