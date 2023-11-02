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
              <LogoTermportalen
                class="-mt-[2px] hidden w-[9.5em] xl:block"
                logo-type="wordmark"
              />
              <LogoTermportalen
                class="block w-[2.35em] xl:hidden"
                logo-type="symbol"
              />
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
              aria-controls="langMenu"
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
              id="langMenu"
              ref="langMenu"
              :model="langOptions"
              :popup="true"
            >
              <template #start>
                <div class="px-3 pb-3 pt-1 font-semibold">
                  {{ $t("navBar.language") }}
                </div>
              </template>
              <template #item="{ item, props }">
                <a
                  class="p-menuitem-link"
                  v-bind="props.action"
                  :aria-current="locale === item.label"
                >
                  <div class="p-menuitem-text space-x-2">
                    <span class="">
                      {{ $t("global.lang." + item.label) }}
                    </span>
                    <span aria-hidden="true">
                      <Icon
                        v-if="locale === item.label"
                        class="-mt-1.5"
                        name="mdi:check"
                        size="1.3em"
                      />
                    </span>
                  </div>
                </a>
              </template>
            </Menu>
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
              id="termbaseMenu"
              ref="termbaseMenu"
              :model="termbaseOptions"
              :popup="true"
            >
              <template #item="{ item, props }">
                <NuxtLink
                  class="p-menuitem-link"
                  :href="item.route"
                  v-bind="props.action"
                  ><span class="p-menuitem-text">
                    {{ lalof(item.label) }}
                  </span>
                </NuxtLink>
              </template>
            </Menu>
          </div>
          <NavBarLink to="/om">
            {{ $t("navBar.om") }}
          </NavBarLink>
          <NavBarLink to="/innstillinger">
            {{ $t("navBar.innstillinger") }}
          </NavBarLink>
        </ul>
      </div>
      <div class="px-3 lg:hidden">
        <button
          class="tp-hover-focus ml-auto mr-0 flex rounded border border-transparent p-1"
          aria-haspopup="true"
          aria-controls="overlayMenu"
          :aria-label="$t('navBar.menuButtonShow')"
          :title="$t('navBar.menuButtonShow')"
          @click="menu.toggle"
        >
          <Icon name="tabler:menu-2" aria-hidden="true" size="2em" />
        </button>
        <Menu id="overlayMenu" ref="menu" :model="menuOptions" :popup="true">
          <template #item="{ item, props }">
            <NuxtLink
              v-if="item.to"
              class="p-menuitem-link"
              :to="item.to"
              v-bind="props.action"
              ><span class="p-menuitem-text">
                {{ item.label }}
              </span>
            </NuxtLink>
            <a
              v-else
              class="p-menuitem-link"
              v-bind="props.action"
              :aria-current="locale === item.label"
            >
              <div class="p-menuitem-text space-x-2">
                <span class="">
                  {{ $t("global.lang." + item.label) }}
                </span>
                <span aria-hidden="true">
                  <Icon
                    v-if="locale === item.label"
                    class="-mt-1.5"
                    name="mdi:check"
                    size="1.3em"
                  />
                </span>
              </div>
            </a>
          </template>
        </Menu>
      </div>
    </div>
  </nav>
</template>

<script setup lang="ts">
import { useI18n } from "vue-i18n";

const i18n = useI18n();
const locale = useLocale();
const locales = useLocales();
const navBar = ref<HTMLElement | null>(null);

const getLangOptions = () => {
  return locales.map((loc) => ({
    label: loc,
    command: () => {
      i18n.locale.value = loc;
    },
  }));
};

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
    items: getLangOptions(),
  },
]);

const langMenu = ref();
const langOptions = ref(getLangOptions());

const termbaseMenu = ref();
const termbaseOptions = computed(() =>
  termbaseOrder.map((tb) => {
    return {
      label: `${tb}-3A${tb}`,
      route: `/${tb}`,
    };
  })
);

defineExpose({ navBar });

const defProps = defineProps({
  context: { type: String, required: true },
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
