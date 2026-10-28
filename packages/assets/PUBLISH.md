# Plan: publish `@uib-ub/logos` to the GitLab npm registry

Status: **not started — do not implement yet.** This is the agreed plan for
when we're ready to publish. Nothing below is wired up today; the package
is still workspace-only (`main: src/index.ts`).

Decisions still open:

- [ ] Package name — suggested `@uib-ub/logos`
- [ ] Publish trigger — git tag (`v*`) vs manual CI button
- [ ] Ship raw SVGs alongside the React components?

## 1. Package setup (`package.json`)

Follow the `packages/types` convention (tsc → `dist/`, ESM, `exports` map):

```jsonc
{
  "name": "@uib-ub/logos",        // scope must match the GitLab group path
  "version": "0.1.0",
  "type": "module",
  "sideEffects": false,           // enables tree-shaking of the react components
  "files": ["dist"],
  "exports": {
    ".": {
      "import": "./dist/react/index.js",
      "types": "./dist/react/index.d.ts"
    },
    "./svg/*": "./dist/svg/*"     // optional: raw svgs as static subpaths
  },
  "peerDependencies": { "react": "^19.0.0" },   // react moves from deps → peers
  "publishConfig": {
    "@uib-ub:registry": "https://<GITLAB_HOST>/api/v4/projects/<PROJECT_ID>/packages/npm/"
  }
}
```

Notes:

- The scope `@uib-ub` must match a GitLab **group** — that's how the
  registry routes `@uib-ub/*` names.
- Build step: `tsc` compiles `src/react/*.tsx` → `dist/react/`. The svgs
  are inlined in the components; copying `src/assets/*.svg` to `dist/svg/`
  is optional (open decision above).
- Tree-shaking works because the generated `src/react/index.ts` barrel has
  named exports and the build is ESM + `sideEffects: false`.
- The project-level registry URL pins publishing to one project; the
  group-level endpoint (`/api/v4/packages/npm/`) accepts any project in
  the group.

## 2. CI publish job (`.gitlab-ci.yml`)

The npm registry is available on every project (Settings → Packages &
Registries) — nothing to enable server-side.

```yaml
publish:assets:
  stage: deploy
  rules:
    - if: $CI_COMMIT_TAG   # or: when: manual
  script:
    - npm ci
    - npm run build -w @uib-ub/logos
    - npm config --location project set "@uib-ub:registry" "${CI_API_V4_URL}/projects/${CI_PROJECT_ID}/packages/npm/"
    - npm config --location project set "//${CI_SERVER_HOST}/api/v4/projects/${CI_PROJECT_ID}/packages/npm/:_authToken" "${CI_JOB_TOKEN}"
    - npm publish -w @uib-ub/logos
```

- `CI_JOB_TOKEN` works for publishing on recent GitLab versions. On older
  instances use a project access token (`api` scope) as a masked CI var.
- Published versions are immutable — same version can't be republished.

## 3. Consumers

Every consumer needs an `.npmrc` (repo-level or `~/.npmrc`):

```
@uib-ub:registry=https://<GITLAB_HOST>/api/v4/packages/npm/
//<GITLAB_HOST>/api/v4/packages/npm/:_authToken=<token>
```

- CI on the same instance: `CI_JOB_TOKEN` covers reads.
- Humans: personal access token with `read_api`, or group deploy token
  with `read_package_registry`.

## Gotchas

- Older GitLab versions don't support `npm dist-tag` writes — don't build
  workflows around tag aliases.
- Deleting a published version via UI/API leaves the version name consumed.
- Monorepo workspaces keep working unchanged: workspace consumers resolve
  `@uib-ub/logos` locally; `publishConfig.registry` only applies at publish
  time.

## Prerequisites before starting

- Naming grammar + org reorganization settled (done, branch `update-assets`)
- Broken app imports resolved (docs `UibIcon` / `UibUbLockupEn`,
  dashboard `UibIcon`)
- Decide on the three open decisions above
