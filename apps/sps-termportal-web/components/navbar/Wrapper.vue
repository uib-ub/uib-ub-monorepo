<template>
  <nav
    ref="navBar"
    class="box-content h-12 w-full bg-white"
    :class="{ '': context != 'minimal' }"
  >
    <div class="mx-auto flex h-full grow items-center justify-between">
      <div class="flex grow">
        <NavbarLogos :context="context" />
        <SearchField v-if="context !== 'minimal'" class="grow max-w-[51em]" />
      </div>
      <div class="hidden lg:flex">
        <ul
          class="flex items-center gap-x-1 px-4 text-lg font-semibold text-gray-600"
        >
          <NavbarLanguage />
          <NavbarTermbases />
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

const i18n = useI18n();
const orderedTermbases = useOrderedTermbases();

const defProps = defineProps({
  context: { type: String, required: true },
});

const navBar = ref<HTMLElement | null>(null);

defineExpose({ navBar });

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
