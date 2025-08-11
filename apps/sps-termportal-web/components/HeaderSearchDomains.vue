<template>
  <div
    ref="wrapper"
    class="w-full"
  >
    <div ref="topWrapper">
      <div class="flex flex-wrap gap-x-1 gap-y-1 lg:flex-nowrap">
        <div
          v-for="topdomain in appConfig.domain.topdomains"
          :key="topdomain"
          class="group flex min-h-[2.3em]"
        >
          <input
            :id="topdomain"
            :value="searchInterface.domain[topdomain]"
            type="checkbox"
            class="peer outline-none"
            @update="updateTopdomain(topdomain)"
            @keydown.space="updateTopdomain(topdomain)"
          >
          <label
            :for="topdomain"
            class="tp-transition-shadow flex w-fit cursor-pointer items-center rounded-[7px] border border-gray-300 py-1 pl-1.5 pr-2 group-hover:border-tpblue-300 peer-focus:border-tpblue-300 peer-focus:shadow-tphalo"
            :class="{
              'bg-tpblue-400 text-white': Object.keys(
                searchInterface.domain,
              ).includes(topdomain),
            }"
            @click="updateTopdomain(topdomain)"
          >
            <div class="flex w-5 justify-center">
              <Icon
                v-if="
                  Object.keys(searchInterface.domain).includes(topdomain)
                    || !domainSelected
                "
                name="mdi:checkbox-marked-outline"
                size="1.2em"
                :class="{
                  'text-gray-400 group-hover:text-tpblue-400': !domainSelected,
                }"
                aria-hidden="true"
              />
              <Icon
                v-else
                name="mdi:checkbox-blank-outline"
                size="1.2em"
                class="text-tpblue-400"
                aria-hidden="true"
              />
            </div>
            <span class="pl-1.5">{{ $t("global.domain." + topdomain) }}</span>
          </label>
        </div>
      </div>
      <div class="flex justify-center">
        <button
          v-if="domainSelected"
          class="absolute mt-[6px] flex h-[1.1em] w-16 justify-center rounded-b-md border-[2px] border-gray-200 border-t-white bg-white"
          @click="panel = !panel"
        >
          <Icon
            name="mdi:chevron-down"
            size="1.6em"
            class="mt-[-7px] text-gray-600"
            aria-hidden="true"
          />
          <span class="sr-only">{{ $t("searchBar.expandDomainMenu") }}</span>
        </button>
      </div>
    </div>
    <div>
      <div
        v-if="panel"
        class="absolute z-20 mt-[6px] max-w-fit rounded-b-[7px] border border-gray-300 border-t-white bg-white shadow-lg"
        :style="{ width: `${topWrapper.offsetWidth}px` }"
      >
        <div class="absolute right-0 top-0 mr-1 mt-1 flex space-x-2">
          <button
            v-if="subdomainSpecified"
            class="rounded-sm border border-transparent p-0.5 text-gray-600 hover:border-gray-300 hover:bg-gray-100 hover:text-gray-800"
            @click="resetSubdomainOptions()"
          >
            <IconReset
              class="text-lg"
              size="1.35em"
            />
            <span class="sr-only">{{
              $t("searchBar.resetDomainOptions")
            }}</span>
          </button>
          <button
            class="flex justify-center rounded-sm border border-transparent text-gray-600 hover:border-gray-300 hover:bg-gray-100 hover:text-gray-800"
            @click="panel = false"
          >
            <IconClose class="text-lg" />
            <span class="sr-only">Close</span>
          </button>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          <div
            v-for="topdomain of panelTopdomains"
            :key="topdomain"
            class="px-3 py-2"
          >
            <div class="pb-2 text-lg">
              {{ $t("global.domain." + topdomain) }}
            </div>
            <ul>
              <li
                v-for="(v, k) of bootstrapData.domain[topdomain].subdomains"
                :key="k"
                class=""
              >
                <SubdomainEntry
                  v-model="searchInterface.domain"
                  :label="k"
                  :parents="[searchInterface.domain[topdomain] || null]"
                  :topdomain="topdomain"
                />
                <ul>
                  <li
                    v-for="(_, sublabel) of v.subdomains"
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
  </div>
</template>

<script setup lang="ts">
const appConfig = useAppConfig();

const panel = ref();
const wrapper = ref(null);
const topWrapper = ref();
const searchInterface = useSearchInterface();
const bootstrapData = useBootstrapData();

const specifiedDomains = computed(() =>
  Object.keys(searchInterface.value.domain),
);
const activeDomains = computed(() =>
  specifiedDomains.value.filter(
    domain => searchInterface.value.domain[domain],
  ),
);
const panelTopdomains = computed(() =>
  intersectUnique(Object.keys(bootstrapData.value.domain), activeDomains.value),
);

const domainSelected = computed(() => {
  return Object.keys(searchInterface.value.domain).length > 0;
});

const subdomainSpecified = computed(() => {
  const topDomains = Object.keys(bootstrapData.value.domain);
  return (
    specifiedDomains.value.filter(domain => !topDomains.includes(domain))
      .length > 0
  );
});

const deactivatedDomains = computed(() => {
  specifiedDomains.value.filter(
    domain => !searchInterface.value.domain[domain],
  );
});

function resetSubdomainOptions() {
  const searchInterface = useSearchInterface();
  const topDomains = Object.keys(bootstrapData.value.domain);
  const flatSubDomains = flattenOrderDomains()
    .map(d => d[0])
    .filter(domain => !topDomains.includes(domain));

  Object.keys(searchInterface.value.domain).forEach((domain) => {
    if (flatSubDomains.includes(domain)) {
      delete searchInterface.value.domain[domain];
    }
  });
}

onClickOutside(wrapper, () => (panel.value = false));

function updateTopdomain(pdomain: string) {
  if (searchInterface.value.domain[pdomain]) {
    // delete topdomain
    delete searchInterface.value.domain[pdomain];
    // delete all subdomain data from interface
    const subdomains = getAllKeys(bootstrapData.value.domain[pdomain]);
    subdomains.forEach((subdomain) => {
      delete searchInterface.value.domain[subdomain];
    });
    // hide panel if no topdomain selected
    if (panel.value && Object.keys(searchInterface.value.domain).length === 0) {
      panel.value = false;
    }
  }
  else {
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
