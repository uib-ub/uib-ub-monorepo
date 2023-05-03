<template>
  <div class="flex min-h-screen flex-col">
    <HeaderMain />
    <div class="flex grow" :class="{ 'justify-center': route.path === '/' }">
      <div
        v-if="route.path !== '/'"
        class="h-7 w-0 xl:w-[10vw] xl:min-w-[10em] xl:max-w-[13em]"
      ></div>
      <div class="xs:pb-4 container max-w-screen-xl flex-1 px-4 pt-2 xl:pl-0">
        <h1
          v-if="route.path === '/'"
          class="xs:text-6xl pt-[0.2em] text-5xl font-light tracking-tight text-black/75 antialiased sm:text-7xl md:text-8xl"
        >
          Termportalen
        </h1>
        <slot />
      </div>
    </div>
    <ButtonScrollTop />
    <FooterTP />
  </div>
</template>

<script setup>
const route = useRoute();
</script>
