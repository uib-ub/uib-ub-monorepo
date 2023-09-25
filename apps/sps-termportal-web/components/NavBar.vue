<template>
  <nav
    ref="navBar"
    class="box-content h-12 w-full bg-white"
    :class="{ '': context != 'minimal' }"
  >
    <div class="mx-auto flex h-full grow items-center justify-between">
      <div class="grow">
        <div v-if="context !== 'minimal'" class="flex grow items-center">
          <SideBar class="w-16">
            <AppLink
              id="anchor"
              to="/"
              aria-label="Termportalen.no"
              class="tp-hover-focus mx-1.5 flex h-10 justify-center border-transparent py-1"
            >
              <div class="-mt-[2px] hidden w-[9.5em] xl:block">
                <img
                  class=""
                  src="/logo-wordmark-termportalen.svg"
                  aria-hidden="true"
                />
              </div>
              <div class="block w-[2.35em] xl:hidden">
                <img src="/logo-symbol-termportalen.svg" aria-hidden="true" />
              </div>
            </AppLink>
          </SideBar>

          <SearchField class="max-w-[51em]" />
        </div>
      </div>
      <div class="hidden lg:flex">
        <ul
          class="flex items-center gap-x-1 px-4 text-lg font-semibold text-gray-500"
        >
          <div>
            <button
              class="tp-hover-focus group border-transparent pb-1.5 pl-2.5 pr-1.5 pt-0.5"
              :aria-label="`${$t('navBar.language')}: ${$t(
                'global.lang.' + locale
              )}`"
              aria-haspopup="true"
              aria-controls="overlayLangMenu"
              @click="langMenu.toggle"
            >
              <div class="relative">
                <div class="absolute -bottom-[9px] -left-[8px]">
                  <span class="rounded-[5px] bg-white text-[0.6em]">
                    <span
                      class="h-1 px-[3px] font-semibold uppercase group-hover:text-gray-700 group-focus:text-gray-700"
                      >{{ locale }}</span
                    >
                  </span>
                </div>
                <Icon
                  class="text-gray-500 group-hover:text-gray-700 group-focus:text-gray-700"
                  name="material-symbols:language"
                  size="1.4em"
                  aria-hidden="true"
                />
              </div>
            </button>
            <Menu
              id="overlayLangMenu"
              ref="langMenu"
              :model="langOptions"
              :popup="true"
            />
          </div>
          <div>
            <button
              class="tp-hover-focus group border-transparent px-2 py-1 hover:text-gray-700 focus:text-gray-700"
              aria-haspopup="menu"
              aria-controls="termbaseMenu"
              @click="termbaseMenu.toggle"
            >
              {{ $t("global.termbase", 2) }}
            </button>
            <Menu
              id="overlayTermbaseMenu"
              ref="termbaseMenu"
              :model="termbaseOptions"
              :popup="true"
            >
              <template #item="{ item }">
                <NuxtLink class="p-menuitem-link" :href="item.route"
                  ><span class="p-menuitem-text">
                    {{ item.label }}
                  </span>
                </NuxtLink>
              </template>
            </Menu>
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
const locale = useLocale();
const lalo = useLazyLocales();
const navMenuExpanded = useNavMenuExpanded();
const navBar = ref<HTMLElement | null>(null);
const navPageLinks = ref<HTMLElement | null>(null);

const menu = ref();
const menuOptions = computed(() => [
  {
    label: `${i18n.t("navBar.navigation")}`,
    items: [
      { label: `${i18n.t("global.termbase", 2)}`, to: "/termbaser" },
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

const termbaseMenu = ref();
const termbaseOptions = computed(() =>
  termbaseOrder.map((tb) => {
    const key = `${tb}-3A${tb}`;
    return { label: `${lalo.value[locale.value][key]}`, route: `/${tb}` };
  })
);

defineExpose({ navBar });

const props = defineProps({
  context: { type: String, required: true },
});

onClickOutside(navPageLinks, () => {
  if (navMenuExpanded.value) {
    navMenuExpanded.value = false;
  }
});

watch(i18n.locale, () => {
  const locale = useCookie("locale", cookieLocaleOptions);
  locale.value = i18n.locale.value;
});
</script>

<style>
.p-menu {
  width: auto;
}

.p-menuitem-link {
  padding-top: 2px;
}
</style>
