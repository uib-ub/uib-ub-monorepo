<template>
  <UtilsTableWrapper>
    <template #header>
      Domener
    </template>
    <template #description>
      Domener i publiserte termposter.
    </template>
    <div class="max-w-xl">
      <DataTable
        v-if="data && data.length > 0"
        ref="datatable"
        :value="displayData"
        removable-sort
        sort-field="domain"
        :sort-order="1"
        table-style="min-width: 1rem"
      >
        <Column
          field="domain"
          header="Domene"
          sortable
        />
        <Column
          field="count"
          header="Antall"
          sortable
        />
      </DataTable>
    </div>
  </UtilsTableWrapper>
</template>

<script setup lang="ts">
const datatable = ref();

const props = defineProps({ termbase: { type: Object, required: true } });

const { data } = useLazyFetch(`/api/tb/${props.termbase.id}/domains`);

const displayData = computed(() => {
  const tmp = data.value?.map((domain) => {
    return { domain: domain.domainLiteral.value, count: domain.count.value };
  });

  return tmp;
});
</script>
