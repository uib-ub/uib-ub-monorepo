<template>
  <div class="flex h-screen flex-col">
    <NavBar />
    <div
      class="xs:pb-4 xs:px-4 container mx-auto max-w-screen-xl flex-1 bg-white px-2 pb-2 sm:px-5 sm:pb-5 md:px-7 md:pb-7 lg:px-9 lg:pb-9 xl:px-10 xl:pb-10"
    >
      <h1
        v-if="route.path === '/'"
        class="xs:text-6xl pt-[0.2em] text-5xl font-light tracking-tight text-black/75 antialiased sm:text-7xl md:text-8xl"
      >
        Termportalen
      </h1>
      <SearchBar />
      <slot />
    </div>
    <ButtonScrollTop />
    <FooterTP />
  </div>
</template>

<script setup>
const route = useRoute();
</script>
