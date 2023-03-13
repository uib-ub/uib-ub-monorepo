<template>
  <div>
    <div class="mx-auto max-w-screen-xl bg-white pt-[48px]"></div>
    <nav
      ref="navBar"
      class="bg-tpblue-400 tp-transition-slow fixed top-0 h-12 w-full text-white"
    >
      <div
        class="xs:px-3 mx-auto flex max-w-screen-xl grow justify-between py-2 px-2 sm:px-4 md:px-5"
      >
        <div
          class="text-[1.4em] font-medium leading-tight decoration-inherit hover:text-gray-200 hover:underline"
        >
          <AppLink id="anchor" to="/">Termportalen.no</AppLink>
        </div>
        <div class="text-lg">
          <div class="xs:hidden">
            <button
              class="ml-auto mr-0 flex rounded border border-white px-2 py-1 hover:border-gray-200 hover:text-gray-200"
              :aria-label="
                navMenuExpanded
                  ? $t('navBar.menuButtonHide')
                  : $t('navBar.menuButtonShow')
              "
              :title="
                navMenuExpanded
                  ? $t('navBar.menuButtonHide')
                  : $t('navBar.menuButtonShow')
              "
              @click="navMenuExpanded = !navMenuExpanded"
            >
              <Icon name="tabler:menu-2" aria-hidden="true" size="1.2em" />
            </button>
          </div>
          <ul
            id="NavMenuContent"
            class="xs:flex xs:gap-4 xs:pt-0 xs:space-y-0 bg-tpblue-400 xs:mt-0 xs:rounded-none xs:border-none xs:p-0 right-0 mt-[8.5px] space-y-2 rounded-b border border-t-0 border-white p-4"
            :class="{ hidden: !navMenuExpanded }"
          >
            <li>
              <AppLink
                to="/om"
                class="decoration-inherit hover:text-gray-200 hover:underline"
                @click="navMenuExpanded = false"
              >
                {{ $t("navBar.om") }}</AppLink
              >
            </li>
            <li>
              <AppLink
                to="/innstillinger"
                class="decoration-inherit hover:text-gray-200 hover:underline"
                @click="navMenuExpanded = false"
              >
                {{ $t("navBar.innstillinger") }}</AppLink
              >
            </li>
          </ul>
        </div>
      </div>
    </nav>
  </div>
</template>

<script setup lang="ts">
const navMenuExpanded = ref(false);
const navBar = ref();

function toggleNavBar(prevScrollpos: number) {
  const currentScrollPos = window.pageYOffset;
  if (prevScrollpos < currentScrollPos && currentScrollPos > 32) {
    navMenuExpanded.value = false;
    navBar.value.style.top = "-48px";
  } else {
    navBar.value.style.top = "0px";
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
