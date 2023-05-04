<template>
  <nav
    ref="navBar"
    class="box-content h-12 w-full bg-white"
    :class="{ '': context != 'minimal' }"
  >
    <div class="mx-auto flex h-full grow items-center justify-between">
      <div class="grow">
        <div v-if="context !== 'minimal'" class="flex grow">
          <AppLink id="anchor" to="/"
            ><div
              class="flex w-12 justify-center font-medium lg:w-40 xl:w-[10vw] xl:min-w-[10rem] xl:max-w-[13rem]"
            >
              <span class="text-[1.4em] font-semibold lg:font-normal">T</span
              ><span class="hidden text-[1.4em] transition lg:inline"
                >ermportalen</span
              >
            </div></AppLink
          >
          <SearchField class="max-w-[51em]" />
        </div>
      </div>
      <div ref="navPageLinks" class="px-4 text-lg font-semibold text-gray-500">
        <div class="md:hidden">
          <button
            class="ml-auto mr-0 flex rounded border px-2 py-1"
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
          class="xs:gap-4 xs:pt-0 xs:space-y-0 xs:mt-0 xs:rounded-none xs:border-none xs:p-0 right-0 mt-[8.5px] space-y-2 rounded-b border border-t-0 p-4 md:flex"
          :class="{ hidden: !navMenuExpanded }"
        >
          <NavBarPageLink to="/om">
            {{ $t("navBar.om") }}
          </NavBarPageLink>
          <NavBarPageLink to="/innstillinger">
            {{ $t("navBar.innstillinger") }}
          </NavBarPageLink>
        </ul>
      </div>
    </div>
  </nav>
</template>

<script setup lang="ts">
const navMenuExpanded = useNavMenuExpanded();
const navBar = ref<HTMLElement | null>(null);
const navPageLinks = ref<HTMLElement | null>(null);

defineExpose({ navBar });

const props = defineProps({
  context: { type: String, required: true },
});

onClickOutside(navPageLinks, () => {
  if (navMenuExpanded.value) {
    navMenuExpanded.value = false;
  }
});
</script>
