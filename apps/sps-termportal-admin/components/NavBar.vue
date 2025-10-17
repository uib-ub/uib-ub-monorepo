<template>
  <nav>
    <div class="box-content h-12 w-full bg-white">
      <div class="flex h-full items-center justify-between">
        <div
          class="flex h-full items-center"
          :class="{ 'ps-6 xl:ps-0': context === 'minimal' }"
        >
          <div
            class="flex w-[14em] justify-center"
          >
            <NuxtLink
              v-if="context !== 'minimal'"
              to="/"
            >
              <LogoTermportalen
                class="mt-[2px]"
                logo-type="wordmark"
                img-style="height: 38px"
              />
            </NuxtLink>
          </div>
          <ul
            class="flex items-center space-x-2 xl:space-x-4 2xl:space-x-7 text-lg font-semibold text-gray-500"
          >
            <NavBarLink to="/overview">
              Termbaser
            </NavBarLink>
            <NavBarLink to="/domain">
              Domener
            </NavBarLink>
            <NavBarLink to="/activities">
              Aktiviteter
            </NavBarLink>
            <NavBarLink to="/personbase">
              Personbank
            </NavBarLink>
            <NavBarLink to="/insights">
              Statistikk
            </NavBarLink>
            <NavBarLink to="/docs">
              Dokumentasjon
            </NavBarLink>
            <NavBarLink to="/studio">
              Studio
            </NavBarLink>
          </ul>
        </div>
      </div>
    </div>
    <div
      class="border-x border-b border-gray-300 border-x-white"
      :class="{ hidden: context === 'minimal' }"
    />
  </nav>
</template>

<script setup lang="ts">
const route = useRoute();

const context = computed(() => {
  if (route.path === "/") {
    return "minimal";
  }
  else {
    return "default";
  }
});
</script>
