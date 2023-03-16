<template>
  <AppLink
    v-if="displayButton"
    to="#main"
    role="button"
    class="xs:right-4 xs:bottom-4 fixed bottom-2 right-2 rounded border border-gray-400 bg-white p-1 sm:right-5 sm:bottom-5 md:right-7 md:bottom-7 lg:bottom-8 lg:right-9 xl:bottom-8 xl:right-8"
    :aria-label="$t('buttonScrollTop.srLabel')"
    :title="$t('buttonScrollTop.srLabel')"
    @click="scrollToTop()"
  >
    <Icon
      name="material-symbols:vertical-align-top"
      size="2.8em"
      class="text-gray-700"
      aria-hidden="true"
    ></Icon>
  </AppLink>
</template>

<script setup lang="ts">
const displayButton = ref(false);

function scrollToTop() {
  window.scrollTo(0, 0);
}

onMounted(() => {
  let tick = false;
  window.addEventListener("scroll", () => {
    if (!tick) {
      setTimeout(function () {
        if (window.pageYOffset > 290) {
          displayButton.value = true;
        } else {
          displayButton.value = false;
        }
        tick = false;
      }, 100);
    }
    tick = true;
  });
});
</script>
