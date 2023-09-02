# Ordbøkene: nuxt
:warning: Git history not transferred from previous repos :warning:
## Before migration to monorepo
<p>https://git.app.uib.no/spraksamlingane/ordbok-nuxt/-/tree/main</p>

## Before migration to Nuxt
* https://git.app.uib.no/spraksamlingane/beta.ordbok.uib.no (Mainly developed by Ole Voldsæter and Henrik Askjer)
* https://git.app.uib.no/spraksamlingane/vue-inflection (Mainly developed by Ole Voldsæter and Paul Maurer)


## New features
* Migrated from vue 2 to Nuxt 3 (vue 3)
* Search split into two:
    - Simple search: redirects to inflected result if no exact matches
    - Advanced search: all additional query parameters moved here, wildcards, pagination.
* Vuetify => TailwindCSS with custom components
    - Custom search bar/autocomplete
    - New styling closer to the design from Netlife (since we no longer depend on Vuetify and Meterial Design)