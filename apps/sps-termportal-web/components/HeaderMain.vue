<template>
  <header>
    <div style="height: 50px">
      <NavbarWrapper
        ref="navBarRef"
        :key="'navbar' + locale + orderedTermbases.length"
        :context="headerDisplayScope"
        class="tp-transition-slow z-10"
        :class="{
          'fixed top-0 drop-shadow-md': fixPosition,
        }"
        style="top: -54px"
      />
    </div>
    <div v-if="headerDisplayScope === 'full'" class="flex px-4 xl:pl-0 w-full">
      <SideBar class="w-0" />
      <div class="w-full max-w-7xl">
        <div class="flex justify-between">
          <HeaderSearchOptions />
          <button
            class="border hover:border-gray-300 border-transparent rounded-[4px] hover:bg-gray-100 text-gray-600 hover:text-gray-800 flex justify-center h-7 ml-2"
            @click="headerDisplayScope = 'default'"
          >
            <IconClose class="text-lg" />
            <span class="sr-only">Close</span>
          </button>
        </div>
        <HeaderSearchScope />
      </div>
    </div>
    <div class="flex">
      <SideBar class="w-0" />
      <div
        v-if="headerDisplayScope === 'default'"
        class="flex justify-center max-w-7xl w-full mt-[-6px]"
      >
        <button
          class="absolute border border-t-white border-gray-300 rounded-b-md bg-white h-[1.1em] mt-[6px] flex justify-center w-16"
          @click="headerDisplayScope = 'full'"
        >
          <Icon
            name="mdi:chevron-down"
            size="1.6em"
            class="text-gray-600 mt-[-7px]"
            aria-hidden="true"
          />
          <span class="sr-only">Expand domain panel</span>
        </button>
      </div>
    </div>

    <div
      v-if="headerDisplayScope != 'minimal'"
      class="w-full pt-0"
      :class="{ 'pt-1': headerDisplayScope === 'full' }"
    >
      <div class="border-x border-b border-gray-300 border-x-white"></div>
    </div>
  </header>
</template>

<script setup lang="ts">
const route = useRoute();
const locale = useLocale();
const orderedTermbases = useOrderedTermbases();
const headerDisplayScope = ref("default");

watch(
  () => route.name,
  () => {
    if (route.name === "index") {
      headerDisplayScope.value = "minimal";
    } else if (
      typeof route.name === "string" &&
      ["tb-termbase", "om", "instillinger"].includes(route.name)
    ) {
      headerDisplayScope.value = "default";
    } else if (route.name === "search") {
      headerDisplayScope.value = "full";
    }
  },
  { immediate: true }
);

const navBarRef = ref(null);
const fixPosition = ref(false);
const fixedBarDisplayed = ref(false);

function toggleNavBar(prevScrollpos: number) {
  const currentScrollPos = window.pageYOffset;
  if (route.path !== "/" && prevScrollpos < currentScrollPos) {
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
