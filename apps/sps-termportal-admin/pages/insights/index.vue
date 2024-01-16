<template>
  <div class="flex">
    <SideBar></SideBar>
    <main class="space-y-8 py-8">
      <h1 class="text-2xl">Insights</h1>
      <InsightInstitutions />
      <InsightPeople />
      <InsightReferenceGroup />
      <section>
        <h2 class="mb-3 text-xl">People participating in reference groups</h2>
        <div class="">
          Name, institution, role, start-end, filter for inactive
        </div>
      </section>
      <section>
        <h2 class="mb-3 text-xl">Number of domains</h2>
        <div class="">Could be displayed as a nested list.</div>
        <ul>
          <li>- Add and mark lacking domains?</li>
          <li>- Add count of termbases, concepts, terms?</li>
        </ul>
        <div class="">Include aggregation for inherited etc. data?</div>
      </section>
      <section>
        <h2 class="mb-3 text-xl">Number of termbases by domain</h2>
        <div class="">Combine with previous?</div>
      </section>
      <section>
        <h2 class="mb-3 text-xl">Subdomain(s) lacking terminology</h2>
        <div class="">Separate entry or combined with previous entries?</div>
      </section>
      <section>
        <h2 class="mb-3 text-xl">Termbase overview</h2>
        <div class="">
          name, concept count, languages defined, languages present
        </div>
        <div class="">count of concepts with nb/nn term/definition</div>
      </section>
      <section>
        <h2 class="mb-3 text-xl">Analytics data</h2>
        <div class="">total number of searches</div>
        <div class="">Expand: Visits? time period? comparisons? etc.</div>
      </section>
      <section>
        <h2 class="mb-3 text-xl">Planned/unpublished termbases</h2>
        <div class="">name, domain, ...</div>
      </section>
    </main>
  </div>
</template>

<script setup lang="ts">
const { data } = await useLazyFetch("/api/overview/fuseki");

const termbases = computed(() => {
  return data.value?.results?.bindings.map((e) => {
    return {
      label: e.label.value,
      id: e.id.value,
      conceptCount: e.concepts.value,
    };
  });
});
const columns = [
  { field: "label", header: "Label" },
  { field: "id", header: "ID" },
  { field: "conceptCount", header: "Concepts" },
];

const selectedTermbase = ref();
</script>
