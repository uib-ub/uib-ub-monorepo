import { listenQuery } from 'sanity';
<template>
  <nav>
    <div class="box-content h-12 w-full bg-white">
      <div
        class="flex h-full items-center"
        :class="{
          'justify-end': context === 'minimal',
          'justify-between': context === 'default',
        }"
      >
        <div
          class="flex h-full items-center"
          :class="{ hidden: context === 'minimal' }"
        >
          <SideBar class="flex justify-center">
            <NuxtLink to="/">
              <LogoTermportalen
                class="mt-[2px]"
                logo-type="wordmark"
                img-style="height: 38px"
              />
            </NuxtLink>
          </SideBar>
          <div class="flex w-[15em] justify-center xl:hidden">
            <NuxtLink to="/">
              <LogoTermportalen
                class="mt-[2px]"
                logo-type="wordmark"
                img-style="height: 38px"
              />
            </NuxtLink>
          </div>
          <ul
            class="flex items-center space-x-7 text-lg font-semibold text-gray-500"
          >
            <NavBarLink to="/overview">Overview</NavBarLink>
            <NavBarLink to="/insights">Insights</NavBarLink>
            <NavBarLink to="/explore/termbase">Explore</NavBarLink>
            <NavBarLink to="/studio">Studio</NavBarLink>
            <NavBarLink to="/docs">Documentation</NavBarLink>
          </ul>
        </div>
        <div class="">
          <button
            class="flex items-center space-x-2 px-9 text-lg font-semibold text-gray-500 hover:text-gray-700 focus:text-gray-700"
            @click="signOut()"
          >
            <div class="">Sign Out</div>
            <Icon name="mdi:sign-out" size="1.1em" class=""></Icon>
          </button>
        </div>
      </div>
    </div>
    <div
      class="border-x border-b-[1px] border-gray-300 border-x-white"
      :class="{ hidden: context === 'minimal' }"
    />
  </nav>
</template>

<script setup lang="ts">
const { signOut } = useAuth();
const route = useRoute();

const context = computed(() => {
  if (route.path === "/") {
    return "minimal";
  } else {
    return "default";
  }
});
</script>
