<template>
  <section v-if="true">
    <h2 class="text-lg font-semibold pb-2 text-gray-800">
      Planlagte aktiviteter
    </h2>
    <ol class="space-y-0.5 text-lg ml-1">
      <slot />
    </ol>
  </section>
</template>

<script setup lang="ts"></script>
