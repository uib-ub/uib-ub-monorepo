<template>
  <footer
    class="bg-tpblue-400 text-white"
    :class="{ 'fixed-footer': previewVersion == 1 }"
  >
    <div class="flex flex-wrap items-center justify-center gap-x-6 p-2">
      <LogoUiB img-style="width: 100px" />
      <div class="flex flex-col space-y-2 text-lg">
        <AppLink
          to="mailto:termportalen@uib.no"
          class="group inline-block leading-snug hover:text-gray-200"
        >
          <span>{{ $t("footer.contact") }}: </span><br />
          <span class="group-hover:underline"
            >termportalen@uib.no</span
          ></AppLink
        >
        <AppLink
          class="hover:text-gray-200 hover:underline"
          to="https://uustatus.no/nb/erklaringer/publisert/a139f9ba-80eb-4176-bb6d-b784efaf205a"
          >{{ $t("footer.accDeclaration") }}</AppLink
        >
      </div>
    </div>
  </footer>
</template>
<script setup>
const previewVersion = usePreviewVersion();
</script>

<style scoped>
.fixed-footer {
  @apply lg:fixed lg:bottom-0 lg:left-0 lg:w-full lg:z-50;
}
</style>
