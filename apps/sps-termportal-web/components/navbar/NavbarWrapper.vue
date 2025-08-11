<template>
  <nav
    ref="navBar"
    class="box-content h-[50px] w-full bg-white"
    :class="{ '': headersize != headerSize.Minimal }"
  >
    <div class="mx-auto flex h-full grow items-center justify-between">
      <div class="flex grow">
        <NavbarLogos :headersize="headersize" />
        <SearchField
          v-if="headersize !== headerSize.Minimal"
          class="max-w-[51em] grow"
        />
      </div>
      <div class="hidden lg:flex">
        <ul
          class="flex items-center gap-x-1 px-4 text-lg font-semibold text-gray-600"
        >
          <NavbarLanguage />
          <NavbarTermbases
            :key="'termbaseslst_' + (bootstrapData ? Object.keys(bootstrapData) : 'not_loaded')"
          />
          <NavBarLink to="/om">
            {{ $t("navBar.om") }}
          </NavBarLink>
          <NavBarLink to="/innstillinger">
            {{ $t("navBar.innstillinger") }}
          </NavBarLink>
        </ul>
      </div>
      <div class="px-3 lg:hidden">
        <NavbarMenu />
      </div>
    </div>
  </nav>
</template>

<script setup lang="ts">
import { useI18n } from "vue-i18n";
import { HeaderSize } from "~/types/enums";

const appConfig = useAppConfig();

const i18n = useI18n();
const bootstrapData = useBootstrapData();

const headerSize = HeaderSize;
const props = defineProps<{
  headersize: HeaderSize;
}>();

const navBar = ref<HTMLElement | null>(null);

defineExpose({ navBar });

watch(i18n.locale, () => {
  const locale = useCookie("locale", appConfig.cookie.localeOptions);
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
