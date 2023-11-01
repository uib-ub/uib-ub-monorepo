<template>
  <main>
    <ul class="text-lg space-y-2 ml-6">
      <li>Overview</li>
      <li>
        Insights
        <ul class="ml-4">
          <li>Termbase</li>
          <li>Domains</li>
        </ul>
      </li>
      <li>
        Explore Data
        <ul class="ml-4">
          <li>Termportalen</li>
          <li>Korpuskel? Term extraction?</li>
        </ul>
      </li>
      <li>Admin documentation?</li>
      <li><NuxtLink to="/studio">Studio</NuxtLink></li>
    </ul>
  </main>
</template>

<script setup lang="ts">
const router = useRouter();
</script>
