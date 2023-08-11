<template>
  <nav
    ref="navBar"
    class="box-content h-12 w-full bg-white"
    :class="{ '': context != 'minimal' }"
  >
    <div class="mx-auto flex h-full grow items-center justify-between">
      <div class="grow">
        <div v-if="context !== 'minimal'" class="flex grow items-center">
          <div
            class="w-12 px-2 lg:w-40 xl:w-[10vw] xl:min-w-[10rem] xl:max-w-[13rem]"
          >
            <AppLink
              id="anchor"
              to="/"
              aria-label="Termportalen.no"
              class="tp-hover-focus flex justify-center border-transparent px-3 py-0.5 text-[1.4em]"
            >
              <span class="font-semibold lg:font-normal" aria-hidden="true"
                >T</span
              ><span
                class="hidden font-normal transition lg:inline"
                aria-hidden="true"
                >ermportalen</span
              >
            </AppLink>
          </div>
          <SearchField class="max-w-[51em]" />
        </div>
      </div>
      <div class="hidden lg:flex">
        <ul
          class="flex items-center gap-x-1 px-4 text-lg font-semibold text-gray-500"
        >
          <div>
            <button
              class="tp-hover-focus group border-transparent px-1.5 pb-1 pt-0.5"
              :aria-label="`${$t('navBar.language')}`"
              aria-haspopup="menu"
              aria-controls="overlayLangMenu"
              @click="langMenu.toggle"
            >
              <Icon
                class="text-gray-500 group-hover:text-black"
                name="material-symbols:language"
                size="1.4em"
              />
            </button>
            <Menu
              id="overlayLangMenu"
              ref="langMenu"
              :model="langOptions"
              :popup="true"
            />
          </div>
          <NavBarPageLink to="/om">
            {{ $t("navBar.om") }}
          </NavBarPageLink>
          <NavBarPageLink to="/innstillinger">
            {{ $t("navBar.innstillinger") }}
          </NavBarPageLink>
        </ul>
      </div>
      <div class="px-3 lg:hidden">
        <button
          class="tp-hover-focus ml-auto mr-0 flex rounded border border-transparent p-1"
          aria-haspopup="true"
          aria-controls="overlayMenu"
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
          @click="menu.toggle"
        >
          <Icon name="tabler:menu-2" aria-hidden="true" size="2em" />
        </button>
        <Menu id="overlayMenu" ref="menu" :model="menuOptions" :popup="true" />
      </div>
    </div>
  </nav>
</template>

<script setup lang="ts">
import { useI18n } from "vue-i18n";

const i18n = useI18n();
const navMenuExpanded = useNavMenuExpanded();
const navBar = ref<HTMLElement | null>(null);
const navPageLinks = ref<HTMLElement | null>(null);

const menu = ref();
const menuOptions = computed(() => [
  {
    label: `${i18n.t("navBar.navigation")}`,
    items: [
      { label: `${i18n.t("navBar.om")}`, to: "/om" },
      { label: `${i18n.t("navBar.innstillinger")}`, to: "/innstillinger" },
    ],
  },
  {
    label: `${i18n.t("navBar.language")}`,
    items: [
      {
        label: `${i18n.t("global.lang.nb")}`,
        command: () => {
          i18n.locale.value = "nb";
        },
      },
      {
        label: `${i18n.t("global.lang.nn")}`,
        command: () => {
          i18n.locale.value = "nn";
        },
      },
      {
        label: `${i18n.t("global.lang.en")}`,
        command: () => {
          i18n.locale.value = "en";
        },
      },
    ],
  },
]);

const langMenu = ref();
const langOptions = computed(() => [
  {
    label: `${i18n.t("navBar.language")}`,
    items: [
      {
        label: `${i18n.t("global.lang.nb")}`,
        command: () => {
          i18n.locale.value = "nb";
        },
      },
      {
        label: `${i18n.t("global.lang.nn")}`,
        command: () => {
          i18n.locale.value = "nn";
        },
      },
      {
        label: `${i18n.t("global.lang.en")}`,
        command: () => {
          i18n.locale.value = "en";
        },
      },
    ],
  },
]);

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
