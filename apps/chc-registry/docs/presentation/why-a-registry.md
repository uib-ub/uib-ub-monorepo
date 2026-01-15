---
marp: true
theme: rose-pine-moon
title: Why a registry?
paginate: true
---

# **Why a UI registry?**

**shadcn/ui registry vs npm packages**

---

## What is a UI registry?

A registry is a **collection of components** distributed via **URLs** instead of npm packages.

Components are **copied directly into your codebase** rather than installed as dependencies.

**Example:**
```bash
npx shadcn@latest add https://chc-registry.vercel.app/r/iiif-manifest.json
```

---

## Built on shadcn/ui

**shadcn/ui** pioneered the registry approach for React components.

**Key insight:** Copy components, don't install them.

**We reuse their CLI:**
- Same `shadcn` CLI tool
- Same JSON registry format
- Same workflow developers already know
- Works with any registry URL

---

## The traditional approach: npm packages

**How it usually works:**

```bash
npm install @uib-ub/chc-components
```

**Components live in `node_modules/`**
- Black box dependencies
- Version conflicts
- Breaking changes
- Hard to customize
- Bundle size concerns

---

## The registry approach: copy, don't install

**How it works:**

```bash
npx shadcn@latest add https://chc-registry.vercel.app/r/button.json
```

**Components are copied to your `src/` directory**
- Full source code ownership
- Easy to customize
- No version conflicts
- No breaking changes
- You control the code

---

## Key benefit #1: **Ownership**

**npm packages:**
- Code lives in `node_modules/`
- Hidden from developers
- Hard to understand or modify

**Registry:**
- Code lives in your `src/` directory
- Visible and accessible
- Easy to read, modify, and understand

**You own the code, not a dependency.**

---

## Key benefit #2: **Customization**

**npm packages:**
```tsx
// Want to change styling? Good luck!
import { Button } from '@uib/chc-components'
// Stuck with what's published
```

**Registry:**
```tsx
// Full control from day one
import { Button } from '@/components/ui/chc/button'
// Edit directly, customize freely
```

**Every component is yours to modify.**

---

## Key benefit #3: **No version hell**

**npm packages:**
- `package.json` version conflicts
- Breaking changes between versions
- Multiple projects need different versions
- Dependency resolution nightmares

**Registry:**
- No version numbers
- Each project has its own copy
- Update when you want, not when forced
- No conflicts between projects

---

## Key benefit #4: **Easier updates**

**npm packages:**
```bash
npm update @uib/chc-components
# Hope nothing breaks!
```

**Registry:**
```bash
npx shadcn@latest add https://chc-registry.vercel.app/r/button.json
# Review the diff, merge what you want
# Keep your customizations
```

**Update on your terms, keep your changes.**

---

## Key benefit #5: **Better for teams**

**npm packages:**
- Centralized releases
- All projects (must?) upgrade together
- Breaking changes affect everyone

**Registry:**
- Each project evolves independently
- Gradual adoption of new components
- Teams can customize for their needs
- No forced migrations

---

## Real example: CHC Registry

**Our registry:** https://chc-registry.vercel.app/docs

**Available components (examples):**
- `iiif-manifest` - IIIF viewer component
- `iiif-image` - IIIF image display
- `content-grid` - Content layout grid

**Documented · Customizable · Ready to copy**

---

## How it works technically

**High-level flow:**

1. We write components + `registry-item.ts` metadata in `src/registry/`
2. We run `npm run build:registry`
3. The build script generates JSON files in `public/r/*.json`
4. The shadcn CLI downloads a JSON file and writes components into your app

**The next slides go into each step.**

---

## How components are stored in the registry

**Components live as real source files:**

```
src/registry/uib-ub/items/iiif-manifest/
  ├── components/
  │   └── iiif-manifest.tsx     ← Real React component
  ├── examples/
  │   └── iiif-manifest-demo.tsx ← Demo/example code
  └── registry-item.ts          ← Metadata definition
```

**`registry-item.ts` defines:**
- Component name and description
- File paths to component source
- Dependencies (`@samvera/clover-iiif`) and registry dependencies
- Target path in consuming projects

---

## The build process

**Running `npm run build:registry`:**

1. **Scans** `src/registry/` for all `registry-item.ts` files
2. **Reads** metadata from each registry item
3. **Reads** actual component source files (`.tsx`)
4. **Embeds** source code as escaped strings in JSON
5. **Outputs** to `public/r/component-name.json`

**Each component becomes a JSON file ready to distribute.**

---

## The JSON structure

**Simplified example:**

```json
{
  "name": "iiif-manifest",
  "files": [{
    "path": "components/ui/chc/iiif-manifest.tsx",
    "content": "..."
  }],
  "dependencies": ["@samvera/clover-iiif"]
}
```

**Remember:**
- `files.content` is the component source code
- `files.path` is where the CLI writes it in your project
- `dependencies` lists npm packages to install

---

## Distribution via URL

**JSON files are served statically:**

```
https://chc-registry.vercel.app/r/iiif-manifest.json
https://chc-registry.vercel.app/r/button.json
https://chc-registry.vercel.app/r/content-grid.json
```

**shadcn CLI fetches the JSON:**
- Downloads from URL
- Extracts `content` strings
- Writes files to your project
- Installs dependencies

**The JSON contains the full source code as a string!**

---

## Prepare your repo

**Before you add components:**
- Run `shadcn init` once
- Or ensure `components.json` exists

**What `components.json` does:**
- Tells the CLI where to write components (aliases/paths)
- Points to Tailwind config and style settings

**No need to build custom tooling!**

---

## When to use npm vs registry

**Use npm packages for:**
- Utility libraries (`lodash`, `date-fns`)
- Heavy dependencies (`react`, `next`)
- Stable, rarely-changing code
- Third-party libraries

**Use registry for:**
- UI components
- Design system elements
- Team-specific components
- Code you want to customize

---

## Downsides of the registry approach

**Trade-offs to consider:**

❌ **No automatic updates** - Must manually pull changes
❌ **Code duplication** - Same component in multiple repos
❌ **Manual sync** - Keeping components in sync across projects
❌ **More git commits** - Component code lives in your repo

**But these are often acceptable trade-offs**
**for the benefits of ownership and customization.**

---

## The CHC Registry strategy

**Benefits for our team:**

✅ **Shared components** across projects
✅ **Easy customization** per project
✅ **No version conflicts** between apps
✅ **Gradual adoption** - add components as needed
✅ **Full transparency** - see all component code

---

## Summary

**Registry approach wins because:**

1. **Ownership** - You control the code
2. **Customization** - Modify anything easily
3. **No version conflicts** - Each project independent
4. **Easier updates** - Merge changes on your terms
5. **Better for teams** - Gradual, independent adoption

**npm packages are great for libraries,**
**registries are perfect for UI components.**

---

## Questions?

**Try it yourself:**

```bash
npx shadcn@latest add https://chc-registry.vercel.app/r/iiif-manifest.json
```

**Explore the registry:**
https://chc-registry.vercel.app/docs

---

## Thank you!
