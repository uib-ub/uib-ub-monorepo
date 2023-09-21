<template>
  <div ref="wrapper">
    <div ref="topWrapper" class="flex flex-wrap gap-x-2 md:flex-nowrap">
      <div class="flex flex-wrap gap-x-1 gap-y-1 lg:flex-nowrap">
        <div
          v-for="domain in Object.keys(domainData)"
          :key="domain"
          class="group flex"
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
            <div class="w-5">
              <Icon
                v-if="
                  Object.keys(searchInterface.domain).includes(domain) ||
                  noDomain
                "
                name="mdi:checkbox-marked-outline"
                size="1.3em"
                :class="{
                  'text-gray-400 group-hover:text-tpblue-400': noDomain,
                }"
                aria-hidden="true"
              />
              <Icon
                v-else
                name="mdi:checkbox-blank-outline"
                size="1.3em"
                class="text-tpblue-400"
                aria-hidden="true"
              />
            </div>
            <span class="pl-1.5">{{ $t("global.domain." + domain) }}</span>
          </label>
        </div>
      </div>
      <button
        class="tp-transition-shadow group h-full rounded-[7px] border border-gray-300 px-2 outline-none focus:border-tpblue-300 focus:shadow-tphalo"
        :disabled="noDomain"
        :class="{
          'hover:border-gray-300': noDomain,
          'cursor-pointer hover:border-tpblue-300': !noDomain,
        }"
        @click="panel = !panel"
      >
        <Icon
          name="mdi:chevron-down"
          size="2.2em"
          class="ml-[-8px] mr-[-8px] text-gray-600"
          :class="{
            'text-gray-400 ': noDomain,
            'group-hover:text-gray-900': !noDomain,
          }"
          aria-hidden="true"
        />
      </button>
    </div>
    <div>
      <div
        v-if="panel"
        class="absolute z-10 grid grid-cols-3 rounded-[7px] border border-gray-300 bg-white shadow-md"
        :style="{ width: `${topWrapper.offsetWidth}px` }"
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
</template>

<script setup lang="ts">
const panel = ref();
const wrapper = ref(null);
const topWrapper = ref(null);
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
