<template>
  <div class="flex min-h-screen flex-col">
    <div
      class="flex grow"
      :class="{ 'items-center justify-center': route.path === '/' }"
    >
      <div
        class="flex-1"
        :class="{
          'max-w-screen-2xl px-2 pb-3 pt-2 xs:pb-4 sm:px-3 md:px-4 lg:px-5 xl:pl-0':
            route.path !== '/',
          'container mb-[10vh] max-w-[73em] p-5': route.path === '/',
        }"
      >
        <header>
          <h1
            v-if="route.path === '/'"
            class="text-6xl xs:text-6xl sm:text-7xl md:text-6xl pb-9"
          >
            <div
              class="mb-6 ml-2 mr-14 max-w-[25rem] sm:mb-8 md:mb-11 md:ml-7"
            ></div>
            Termportalen admin
          </h1>
        </header>
        <slot />
      </div>
    </div>
  </div>
</template>

<script setup>
const route = useRoute();
</script>
