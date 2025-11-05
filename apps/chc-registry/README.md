# Next.js + Shadcn + Fumadocs Registry Template

This is a template project that uses Next.js, Fumadocs and Shadcn to create a registry and documentation. Feel free to fork or clone this repository to start your own registry with documentation.

## Getting Started

Run development server:

```sh
pnpm run dev
```

Open http://localhost:3000 with your browser to see the result.

## Resources

- [Next.JS](https://nextjs.org/)
- [shadcn/ui](https://ui.shadcn.com/docs/registry)
- [Fumadocs](https://fumadocs.dev/)

### shadcn/ui Registry

Build shadcn/ui registry:

```sh
pnpm run build:registry
```

This build script compiles all the registry items into a json file that is compatible with both v0 and the shadcn/ui cli. Read the [documentation](https://ui.shadcn.com/docs/registry) for further details.

### Fumadocs MDX

Build fumadocs mdx:

```sh
pnpm run build:docs
```

A `source.config.ts` config file has been included, you can customize different options like frontmatter schema. Read the [Introduction](https://fumadocs.dev/docs/mdx) for further details.
