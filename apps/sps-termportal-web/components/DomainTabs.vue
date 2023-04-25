<template>
  <div>
    <div>
      <ul
        id="domainTab"
        class="flex w-screen max-w-full gap-2 overflow-x-auto px-1 pt-1"
        role="tablist"
      >
        <DomainTab tab-id="all" />
        <DomainTab tab-id="humaniora" />
        <DomainTab tab-id="naturvitenskap" />
        <DomainTab tab-id="sammfunnsfag" />
        <DomainTab tab-id="okonomAdmin" />
      </ul>
      <button
        id="expand-bt"
        class="hidden"
        type="button"
        @click="displayDetails = !displayDetails"
      >
        Utvide subdomener
      </button>
    </div>
    <div
      v-if="displayDetails"
      id="domainTabDetails"
      class="rounded border border-solid border-gray-300"
    >
      <DomainTabDetails
        v-if="searchInterface.domain[0] === 'all'"
        tab-id="all"
      />
      <DomainTabDetails
        v-if="searchInterface.domain[0] === 'humaniora'"
        tab-id="humaniora"
      />
      <DomainTabDetails
        v-if="searchInterface.domain[0] === 'naturvitenskap'"
        tab-id="naturvitenskap"
      />
      <DomainTabDetails
        v-if="searchInterface.domain[0] === 'sammfunnsfag'"
        tab-id="sammfunnsfag"
      />
      <DomainTabDetails
        v-if="searchInterface.domain[0] === 'okonomAdmin'"
        tab-id="okonomAdmin"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
const searchInterface = useSearchInterface();
const displayDetails = ref(false);
</script>
