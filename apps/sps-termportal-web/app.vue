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
useHead({
  htmlAttrs: {
    lang: "nb",
  },
});

const searchBarWasFocused = useSearchBarWasFocused();
const route = useRoute();
const skipLink = ref();

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
  @apply bg-tpblue-100;
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
  z-index: 1  ;
}
</style>
