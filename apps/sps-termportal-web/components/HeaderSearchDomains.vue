<template>
  <div ref="wrapper" class="w-full">
    <div ref="topWrapper">
      <div class="flex flex-wrap gap-x-1 gap-y-1 lg:flex-nowrap">
        <div
          v-for="domain in Object.keys(domainData)"
          :key="domain"
          class="group flex min-h-[2.3em]"
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
            class="tp-transition-shadow flex w-fit cursor-pointer items-center rounded-[7px] border border-gray-300 py-1 pl-1.5 pr-2 group-hover:border-tpblue-300 peer-focus:border-tpblue-300 peer-focus:shadow-tphalo"
            :class="{
              'bg-tpblue-400 text-white': Object.keys(
                searchInterface.domain
              ).includes(domain),
            }"
            @click="updateTopdomain(domain)"
          >
            <div class="w-5 flex justify-center">
              <Icon
                v-if="
                  Object.keys(searchInterface.domain).includes(domain) ||
                  noDomain
                "
                name="mdi:checkbox-marked-outline"
                size="1.2em"
                :class="{
                  'text-gray-400 group-hover:text-tpblue-400': noDomain,
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
            <span class="pl-1.5">{{ $t("global.domain." + domain) }}</span>
          </label>
        </div>
      </div>
      <div class="flex justify-center">
        <button
          v-if="!noDomain"
          class="absolute border border-t-white border-gray-300 rounded-b-md bg-white h-[1.1em] mt-[6px] flex justify-center w-16"
          @click="panel = !panel"
        >
          <Icon
            name="mdi:chevron-down"
            size="1.6em"
            class="text-gray-600 mt-[-7px]"
            aria-hidden="true"
          />
        </button>
      </div>
    </div>
    <div>
      <div
        v-if="panel"
        class="absolute z-10 max-w-fit rounded-b-[7px] border border-gray-300 border-t-white bg-white shadow-lg mt-[6px]"
        :style="{ width: `${topWrapper.offsetWidth}px` }"
      >
        <button
          class="absolute top-0 right-0 border hover:border-gray-300 border-transparent rounded-sm hover:bg-gray-100 text-gray-600 mr-1 mt-1 flex justify-center"
          @click="panel = false"
        >
          <Icon name="material-symbols:close" size="1.4rem" />
        </button>
        <div
          class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
        >
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
                v-for="(v, k) of domainData[topdomain].subdomains"
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
  </div>
</template>

<script setup lang="ts">
const panel = ref();
const wrapper = ref(null);
const topWrapper = ref();
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

const noDomain = computed(() => {
  return Object.keys(searchInterface.value.domain).length === 0;
});

const deactivatedDomains = computed(() => {
  specifiedDomains.value.filter(
    (domain) => !searchInterface.value.domain[domain]
  );
});

onClickOutside(wrapper, () => (panel.value = false));

function updateTopdomain(pdomain: string) {
  if (searchInterface.value.domain[pdomain]) {
    // delete topdomain
    delete searchInterface.value.domain[pdomain];
    // delete all subdomain data from interface
    const subdomains = getAllKeys(domainData.value[pdomain]);
    subdomains.forEach((subdomain) => {
      delete searchInterface.value.domain[subdomain];
    });
    // hide panel if no topdomain selected
    if (panel && Object.keys(searchInterface.value.domain).length === 0) {
      panel.value = false;
    }
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
