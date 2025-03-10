<template>
  <div>
    <ul class="skip-links">
      <li>
        <AppLink ref="skipLink" to="#main" class="skip-link">
          {{ $t("global.skipLink") }}
        </AppLink>
      </li>
    </ul>
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </div>
</template>

<script setup>
import { useI18n } from "vue-i18n";
const i18n = useI18n();

useHead({
  htmlAttrs: {
    lang: i18n.locale,
  },
  script: [
    {
      src: "/mathjax-config.js",
      type: "text/javascript",
      defer: true,
    },
    {
      id: "MathJax-script",
      type: "text/javascript",
      src: "https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-chtml.js",
      defer: true,
    },
  ],
});

const route = useRoute();
const searchBarWasFocused = useSearchBarWasFocused();
const allowSearchFetch = useAllowSearchFetch();
const skipLink = ref();

onMounted(() => {
  /*
  SearchInterface watchers trigger when setting options from route.
  Only watcher for search term should trigger fetch.
  null value is handled by other options watcher to avoid two fetches.
  */
  if (route.path === "/search") {
    allowSearchFetch.value = null;
  }
});

// TODO Fix when refactoring navbar expansion etc
watch(
  () => route.path,
  () => {
    searchBarWasFocused.value = false;
    // skipLink.value.focus();
  }
);
</script>

<style>
body {
  overflow-y: scroll;
}

.tp-shighlight {
  @apply bg-tpblue-100;
}

.tp-search-dd {
  margin-right: 7px;
  margin-bottom: 7px;
  background-color: white;
  border: solid;
  border-color: #d1d5db;
  border-width: 1px;
  border-radius: 4px;
}

.tp-transition-slow {
  transition: all 450ms cubic-bezier(0.235, 0.615, 0.115, 0.995);
}

.skip-link {
  white-space: nowrap;
  margin: 0.2em auto;
  top: 0;
  position: fixed;
  left: 50%;
  margin-left: -72px;
  opacity: 0;
  z-index: -1;
}
.skip-link:focus {
  opacity: 1;
  background-color: white;
  padding: 0.5em;
  border: 1px solid black;
  z-index: 50;
}

.tp-hover-focus {
  @apply tp-transition-shadow rounded-[7px] border outline-none hover:cursor-pointer hover:border hover:border-tpblue-300 focus:border-tpblue-300 focus:shadow-tphalo;
}

.tp-transition-shadow {
  transition-property: box-shadow;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 100ms;
}

blockquote {
  display: block;
  margin-left: 2.5em;
  margin-right: 0em;
}

.content-wrapper {
  @apply space-y-2;
}

.content-wrapper ul:not(.plain-list),
.content-wrapper ol {
  text-indent: -1em;
  padding-left: 1.5em;
  list-style-position: inside;
  @apply space-y-0.5;
}

.content-wrapper ul:not(.plain-list) {
  list-style-type: disc;
}

.content-wrapper ol {
  list-style-type: decimal;
}
</style>
