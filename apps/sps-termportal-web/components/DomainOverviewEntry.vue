<template>
  <li
    class="rounded border border-transparent px-2 py-1 hover:border hover:border-gray-300"
  >
    <details>
      <summary class="cursor-pointer text-xl">
        {{ $t("global.domain." + domain) }} ({{
          domainData[domain].bases.length
        }})
      </summary>
      <ul class="list-disc space-y-1 pl-8 pt-1 text-lg">
        <li
          v-for="base in intersectUnique(
            termbaseOrder,
            domainData[domain].bases
          )"
          :key="base"
          class="rounded hover:bg-gray-100"
        >
          <NuxtLink :to="base" class="block hover:underline">{{
            $t("global.samling." + base)
          }}</NuxtLink>
        </li>
      </ul>
    </details>
  </li>
</template>

<script setup>
const props = defineProps({
  domain: { type: String, required: true },
});
const domainData = useDomainData();
</script>
