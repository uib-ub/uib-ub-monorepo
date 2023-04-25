<template>
  <div class="px-1">
    <div class="rounded-t border border-b-0 border-gray-300">
      <button
        class="h-9 min-w-full rounded-t px-2 text-left hover:bg-gray-100"
        @click="displayDomainMenu = !displayDomainMenu"
      >
        <span v-if="searchInterface.domain[0] !== 'all'"
          >{{ $t("global.domain.domain") }}:
        </span>
        <span class="pr-2">{{
          $t("global.domain." + searchInterface.domain[0])
        }}</span>
        <Icon
          v-if="!displayDomainMenu"
          name="mdi:chevron-down"
          aria-hidden="true"
        />
        <Icon v-else name="mdi:chevron-up" aria-hidden="true" />
      </button>
      <ul
        v-if="displayDomainMenu"
        id="domainTab"
        class="gap-x-2 border-t border-gray-300"
      >
        <li
          v-for="domain in ['all'].concat(Object.keys(domainNesting))"
          :key="`${domain}Menu`"
          class="hover:bg-gray-100"
          :class="{ activeDomain: searchInterface.domain[0] == domain }"
        >
          <button
            class="min-w-full px-2 py-2 text-left"
            :aria-current="searchInterface.domain[0] == domain"
            @click="
              (searchInterface.domain = [domain]), (displayDomainMenu = false)
            "
          >
            {{ $t("global.domain." + domain) }}
          </button>
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup lang="ts">
const searchInterface = useSearchInterface();
const displayDomainMenu = ref(false);
</script>
