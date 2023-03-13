# Release

Not 100% on this... :-/. See links:

* https://github.com/changesets/changesets/blob/main/docs/automating-changesets.md
* https://github.com/changesets/changesets/blob/main/docs/adding-a-changeset.md
* https://jakeginnivan.medium.com/continuous-deployments-with-changesets-github-actions-1002862e2d40
* https://github.com/vercel/turborepo/tree/main/examples/with-changesets
* https://pnpm.io/using-changesets
* https://leerob.io/blog/turborepo-design-system-monorepo

* Create feature branch
* Commit change(s)
* [RESEARCH MORE]
* `pnpm run changeset`
  * Answer the questions
* `git add . && git commit -m "<message>"`
* `git push`
* New PR should have been created by Github Action
* Merge
* `git fetch && git reset --hard origin/main`