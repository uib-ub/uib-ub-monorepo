<template>
  <div ref="wrapper" class="px-1">
    <div class="flex flex-wrap gap-x-1.5 gap-y-1">
      <div
        v-for="domain in Object.keys(domainData)"
        :key="domain"
        class="group flex flex-nowrap"
      >
        <input
          :id="domain"
          :value="searchInterface.domain[domain]"
          type="checkbox"
          class="peer outline-none"
          @update="updateTopdomain(domain)"
          @keydown.space="updateTopdomain(domain)"
        />
        <label
          :for="domain"
          class="tp-transition-shadow flex cursor-pointer items-center rounded-[7px] border border-gray-300 px-2 py-1 group-hover:border-tpblue-300 peer-focus:border-tpblue-300 peer-focus:shadow-tphalo"
          @click="updateTopdomain(domain)"
        >
          <div class="w-6">
            <Icon
              v-if="Object.keys(searchInterface.domain).includes(domain)"
              name="mdi:checkbox-marked-outline"
              size="1.4em"
              class="text-tpblue-400"
              aria-hidden="true"
            />
            <Icon
              v-else-if="Object.keys(searchInterface.domain).length === 0"
              name="mdi:checkbox-intermediate"
              size="1.4em"
              class="text-tpblue-400"
              aria-hidden="true"
            />
            <Icon
              v-else
              name="mdi:checkbox-blank-outline"
              size="1.4em"
              class="text-tpblue-400"
              aria-hidden="true"
            />
          </div>
          <span class="whitespace-nowrap pl-1.5">{{
            $t("global.domain." + domain)
          }}</span>
        </label>
      </div>
      <button @click="panel = !panel">EXPAND</button>
    </div>
    <div class="">
      <div
        v-if="panel"
        class="absolute grid w-[53.5em] grid-cols-3 rounded-[7px] border border-gray-300 bg-white shadow-md"
      >
        <div
          v-for="topdomain of panelTopdomains"
          :key="topdomain"
          class="px-3 py-2"
        >
          <div class="pb-2 text-lg">{{ $t("global.domain." + topdomain) }}</div>
          <ul>
            <li
              v-for="(v, k) of domainData[topdomain].subdomains"
              :key="k"
              class=""
            >
              <SubdomainEntry
                v-model="searchInterface.domain"
                :label="k"
                :parents="[searchInterface.domain[topdomain] || null]"
              />
              <ul>
                <li
                  v-for="(v, sublabel) of v.subdomains"
                  :key="sublabel"
                  class="pl-6"
                >
                  <SubdomainEntry
                    v-model="searchInterface.domain"
                    :label="sublabel"
                    :parents="[
                      searchInterface.domain[k],
                      searchInterface.domain[topdomain],
                    ]"
                  />
                </li>
              </ul>
            </li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const panel = ref();
const wrapper = ref(null);
const topdomains = ref<Array<string>>([]);

const searchInterface = useSearchInterface();
const domainData = useDomainData();

const specifiedDomains = computed(() =>
  Object.keys(searchInterface.value.domain)
);
const activeDomains = computed(() =>
  specifiedDomains.value.filter(
    (domain) => searchInterface.value.domain[domain]
  )
);
const panelTopdomains = computed(() =>
  intersectUnique(Object.keys(domainData.value), activeDomains.value)
);

const deactivatedDomains = computed(() => {
  specifiedDomains.value.filter(
    (domain) => !searchInterface.value.domain[domain]
  );
});

onClickOutside(wrapper, () => (panel.value = false));

function updateTopdomain(pdomain: string) {
  if (searchInterface.value.domain[pdomain]) {
    delete searchInterface.value.domain[pdomain];
    // delete all subdomain data from interface
    const subdomains = getAllKeys(domainData.value[pdomain]);
    subdomains.forEach((subdomain) => {
      delete searchInterface.value.domain[subdomain];
    });
  } else {
    searchInterface.value.domain[pdomain] = true;
  }
}
</script>

<style scoped>
input[type="checkbox"] {
  -webkit-appearance: none;
  appearance: none;
}
</style>
