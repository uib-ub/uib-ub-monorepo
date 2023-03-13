# UiB-UB Monorepo

This is a monorepo containing the web sites, APIs, a link shortener and related packages created by UiB-UB.

## What's inside?

This Turborepo uses [npm](https://npmjs.com) as a packages manager. It uses Next.js v13, React v18 and Sanity Studio v3. 

It includes the following packages/apps:

### Apps

- `chc-web`: the WIP Marcus website, a [Next.js](https://nextjs.org) app and a [Sanity](https://sanity.io) Studio.
- `chc-exh-nt-web`: the exhibition _Never-ending and temporary_, a [Next.js](https://nextjs.org) app and a [Sanity](https://sanity.io) Studio.
- `api`: the API for the Special collection at the University of Bergen Library, a [Next.js](https://nextjs.org) app
- `docs`: the documentation site, a [Nextra](https://nextra.site) app
- `link-shortener`: WIP, a url redirect service with QR, a [Next.js](https://nextjs.org) app


### Packages

- `eslint-preset-custom`: ESLint preset
- `tailwind-config`: shared tailwindcss config
- `tailwind-ui`: React components with Tailwind CSS. Depreciated.
- `tsconfig`: shared tsconfig.jsons used throughout the monorepo
- `utils`: shared utility functions

Each package/app is aims to react 100% [TypeScript](https://www.typescriptlang.org/).

### Utilities

This Turborepo has some additional tools already setup for you:

- [TypeScript](https://www.typescriptlang.org/) for static type checking
- [ESLint](https://eslint.org/) for code linting
- [Prettier](https://prettier.io) for code formatting

## Setup

```sh
git clone ...
cd chc-monorepo
```

### Build

To build all apps and packages, run the following command:

```
npm build
```

### Develop

To develop all apps and packages, run the following command:

```
npm dev
```

### Useful commands

Examples here use `npm`, but this is easy to fudge up. Do not install packages directly in the apps or packages folders. Use the commands below. See [Turborepo docs](https://turbo.build/repo/docs/core-concepts/monorepos/filtering) for more info.

* npm install
* npm install <package> – Add package to root (mainly for devDependencies)
* npm install <package> --workspace=<workspace>
* npm install <package> -w <workspace>
* npm uninstall <package> --workspace=<workspace>
* npm update <package> --workspace=<workspace>
* npm run build - Build all packages and apps
* npm run dev - Develop all packages and apps
* npm run lint - Lint all packages
* npm run changeset - Generate a changeset
* npm run clean - Clean up all node_modules and dist folders (runs each package's clean script)

### Changesets

We are not currently using chengesets, but it is ready when we want it.

```sh
# Create feature branch
# Commit change(s)
# Merge
npm changeset
# Answer the questions
git add . && git commit -m "<message>"
git push
# New PR should have been created by Github Action
git fetch && git reset --hard origin/main
```

### Remote Caching

Turborepo can use a technique known as [Remote Caching](https://turborepo.org/docs/core-concepts/remote-caching) to share cache artifacts across machines, enabling you to share build caches with your team and CI/CD pipelines.

By default, Turborepo will cache locally. To enable Remote Caching you will need an account with Vercel. If you don't have an account you can [create one](https://vercel.com/signup), then enter the following commands:

```
npx turbo login
```

This will authenticate the Turborepo CLI with your [Vercel account](https://vercel.com/docs/concepts/personal-accounts/overview).

Next, you can link your Turborepo to your Remote Cache by running the following command from the root of your turborepo:

```
npx turbo link
```

## Useful Links

Learn more about the power of Turborepo:

- [Pipelines](https://turborepo.org/docs/core-concepts/pipelines)
- [Caching](https://turborepo.org/docs/core-concepts/caching)
- [Remote Caching](https://turborepo.org/docs/core-concepts/remote-caching)
- [Scoped Tasks](https://turborepo.org/docs/core-concepts/scopes)
- [Configuration Options](https://turborepo.org/docs/reference/configuration)
- [CLI Usage](https://turborepo.org/docs/reference/command-line-reference)
