<template>
  <div>
    <NavBar
      ref="navBarRef"
      :context="context"
      class="tp-transition-slow z-10"
      :class="{
        'fixed top-0 drop-shadow-md': fixPosition,
      }"
      style="top: -52px"
    />
    <div v-if="context === 'full'" class="flex pl-4 xl:pl-0">
      <div class="w-0 xl:w-[10vw] xl:min-w-[10rem] xl:max-w-[13rem]"></div>
      <div>
        <HeaderSearchOptions />
        <HeaderDomains />
      </div>
    </div>

    <div v-if="context != 'minimal'" class="w-full">
      <div class="border-x border-b-[1px] border-gray-300 border-x-white"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
const route = useRoute();

const context = computed(() => {
  if (route.path === "/") {
    return "minimal";
  } else if (route.path === "/search" || route.name === "termbase-id") {
    return "full";
  } else {
    return "default";
  }
});

const navBarRef = ref(null);
const fixPosition = ref(false);
const fixedBarDisplayed = ref(false);

function toggleNavBar(prevScrollpos: number) {
  const currentScrollPos = window.pageYOffset;
  if (prevScrollpos < currentScrollPos) {
    if (currentScrollPos > 48 && !fixedBarDisplayed.value) {
      fixPosition.value = true;
    }
    navBarRef.value.navBar.style.top = "-52px";
    fixedBarDisplayed.value = false;
  } else if (prevScrollpos > currentScrollPos) {
    if (
      currentScrollPos === 0 ||
      (currentScrollPos < 200 && !fixedBarDisplayed.value)
    ) {
      fixedBarDisplayed.value = true;
      fixPosition.value = false;
      navBarRef.value.navBar.style.top = "0px";
    }

    fixedBarDisplayed.value = true;
    navBarRef.value.navBar.style.top = "0px";
  }
  return currentScrollPos;
}

onMounted(() => {
  let prevScrollPos: number = window.pageYOffset;
  let tick = false;
  window.addEventListener("scroll", function (e) {
    if (!tick) {
      setTimeout(function () {
        prevScrollPos = toggleNavBar(prevScrollPos);
        tick = false;
      }, 180);
    }
    tick = true;
  });
});
</script>
