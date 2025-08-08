<template>
  <header>
    <div style="height: 50px">
      <NavbarWrapper
        ref="navBarRef"
        :key="'navbar' + locale + orderedTermbases.length"
        :headersize="headerDisplayScope"
        class="tp-transition-slow z-50"
        :class="{
          'fixed top-0 drop-shadow-md': fixPosition,
        }"
        style="top: -54px"
      />
    </div>
    <div
      v-if="headerDisplayScope === headerSize.Full"
      class="flex w-full px-4 xl:pl-0"
    >
      <SideBar class="w-0" />
      <div class="w-full max-w-6xl">
        <div class="flex justify-between">
          <HeaderSearchOptions />
          <button
            class="ml-2 flex h-7 justify-center rounded-[4px] border border-transparent text-gray-600 hover:border-gray-300 hover:bg-gray-100 hover:text-gray-800"
            @click="headerDisplayScope = headerSize.Default"
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
        v-if="headerDisplayScope === headerSize.Default"
        class="mt-[-6px] flex w-full max-w-6xl justify-center"
      >
        <button
          class="absolute mt-[6px] flex h-[1.1em] w-16 justify-center rounded-b-md border border-gray-300 border-t-white bg-white"
          @click="headerDisplayScope = headerSize.Full"
        >
          <Icon
            name="mdi:chevron-down"
            size="1.6em"
            class="mt-[-7px] text-gray-600"
            aria-hidden="true"
          />
          <span class="sr-only">Expand domain panel</span>
        </button>
      </div>
    </div>

    <div
      v-if="headerDisplayScope != 'minimal'"
      class="w-full pt-0"
      :class="{ 'pt-1': headerDisplayScope === headerSize.Full }"
    >
      <div class="border-x border-b border-gray-300 border-x-white"></div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { HeaderSize } from "~/types/enums";

const route = useRoute();
const locale = useLocale();
const orderedTermbases = useOrderedTermbases();

const headerSize = HeaderSize;
const headerDisplayScope = ref<HeaderSize>(HeaderSize.Default);

watch(
  () => route.name,
  () => {
    if (route.name === "index") {
      headerDisplayScope.value = HeaderSize.Minimal;
    } else if (route.name === "search") {
      headerDisplayScope.value = HeaderSize.Full;
    } else {
      headerDisplayScope.value = HeaderSize.Default;
    }
  },
  { immediate: true }
);

const navBarRef = ref(null);
const fixPosition = ref(false);

function toggleNavBar(prevScrollpos: number) {
  const currentScrollPos = window.pageYOffset;
  if (route.path !== "/") {
    // scrolling down
    if (prevScrollpos < currentScrollPos) {
      if (
        currentScrollPos > 54 &&
        navBarRef.value?.navBar?.style?.top === "0px"
      ) {
        navBarRef.value.navBar.style.top = "-54px";
      }
      // scroll up
    } else {
      // reset fixed display
      if (
        currentScrollPos === 0 ||
        (currentScrollPos < 200 &&
          navBarRef.value?.navBar?.style?.top === "-54px")
      ) {
        fixPosition.value = false;
        navBarRef.value.navBar.style.top = "0px";
      }

      // show navbar when further down on the page and when scrolling a certain height up
      if (currentScrollPos > 200 && prevScrollpos - currentScrollPos > 105) {
        navBarRef.value.navBar.style.top = "0px";
        fixPosition.value = true;
      }
    }
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
