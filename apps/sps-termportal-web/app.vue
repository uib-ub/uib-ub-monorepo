<template>
  <div>
    <ul class="skip-links">
      <li>
        <AppLink ref="skipLink" to="#main" class="skip-link">{{
          $t("global.skipLink")
        }}</AppLink>
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
});

if (process.client) {
  useHead({
    script: [
      {
        src: "/mathjax-config.js",
        type: "text/javascript",
        defer: true
      },
      {
        id: "MathJax-script",
        type: "text/javascript",
        src: "https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-chtml.js",
        defer: true,
      },
    ],
  });
}

const route = useRoute();
const searchBarWasFocused = useSearchBarWasFocused();
const allowSearchFetch = useAllowSearchFetch();
const skipLink = ref();
const domainData = useDomainData();
const lazyLocales = useLazyLocales();

onMounted(() => {
  /*
  Get subdomains and relations between conceptual domains that are maintained in the CMS.
  */
  $fetch("/api/domain", { retry: 1 }).then((data) => {
    for (const domain in domainData.value) {
      domainData.value[domain].subdomains = parseRelationsRecursively(
        data,
        domain,
        "narrower",
        "subdomains"
      );
    }
  });

  /*
   Get localiztion data where data is produced in the CMS.
   This applies to:
   - termbase names
   - conceptual domain names
   */
  $fetch("/api/lazyLocales", { retry: 1 }).then((data) => {
    data.forEach((entry) => {
      const lang = entry.label["xml:lang"];
      const pagelst = entry.page.value.split("/");
      const page = pagelst[pagelst.length - 1];
      lazyLocales.value[lang][page] = entry.label.value;
    });
  });

  /*
  SearchInterface watchers trigger when setting options from route.
  Only watcher for search term should trigger fetch.
  null value is handled by other options watcher to avoid two fetches.
  */
  if (route.path === "/search") {
    allowSearchFetch.value = null;
  }
});

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

.tp-sidebar {
  @apply lg:w-[14vw] lg:min-w-[14em] lg:max-w-[20em];
}
</style>
