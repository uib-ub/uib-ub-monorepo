<template>
  <div>
    <div>
      <ul
        id="domainTab"
        class="flex w-screen max-w-full gap-2 overflow-x-auto px-1 pt-1"
        role="tablist"
      >
        <DomainTab tab-id="all" />
        <DomainTab tab-id="DOMENE-3AHumaniora" />
        <DomainTab tab-id="DOMENE-3ANaturvitenskapTeknologi" />
        <DomainTab tab-id="DOMENE-3ASamfunnsfag" />
        <DomainTab tab-id="DOMENE-3AOkonomiAdministrasjon" />
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
        v-if="searchInterface.domain[0] === 'DOMENE-3AHumaniora'"
        tab-id="DOMENE-3AHumaniora"
      />
      <DomainTabDetails
        v-if="searchInterface.domain[0] === 'DOMENE-3ANaturvitenskapTeknologi'"
        tab-id="DOMENE-3ANaturvitenskapTeknologi"
      />
      <DomainTabDetails
        v-if="searchInterface.domain[0] === 'DOMENE-3ASamfunnsfag'"
        tab-id="DOMENE-3ASamfunnsfag"
      />
      <DomainTabDetails
        v-if="searchInterface.domain[0] === 'DOMENE-3AOkonomiAdministrasjon'"
        tab-id="DOMENE-3AOkonomiAdministrasjon"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
const searchInterface = useSearchInterface();
const displayDetails = ref(false);
</script>
