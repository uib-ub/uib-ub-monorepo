<template>
  <div>
    <SideBar v-if="context !== 'minimal'" class="w-16">
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

    <AppLink
      v-else-if="context === 'minimal'"
      :hide-icon="true"
      to="https://www.uib.no"
      :aria-label="$t('navBar.uibHomepage')"
      class=""
    >
      <LogoUiB
        class="ml-5 mt-6 lg:hidden"
        img-style="max-height: 60px"
        logo-type="symbol"
      />
      <LogoUiB
        class="ml-1 mt-6 hidden md:ml-3 md:mt-8 lg:block"
        img-style="max-height: 85px"
        logo-type="2lines"
        :logo-language="locale == 'en' ? 'en' : 'no'"
      />
    </AppLink>
  </div>
</template>

<script setup lang="ts">
import AppLink from "termportal-ui/components/AppLink.vue";

const locale = useLocale();

const defProps = defineProps({
  context: { type: String, required: true },
});
</script>
