<template>
  <TermpostTermProp
    :label="$t('id.referanse')"
  >
    <!-- TODO: refactor -->
    <dd
      v-if="
        typeof data?.['skosp:dctSource']?.['skosp:rdfsLabel'] === 'string'
          || typeof data?.source?.label?.['@value'] === 'string'
          || typeof data?.source === 'string'
      "
      class="max-w-prose"
      v-html="
        `
        ${data?.['skosp:dctSource']?.['skosp:rdfsLabel'] || ''}
        ${data?.source?.label?.['@value'] || data?.source || ''}
        `
      "
    />
    <template v-else-if="Array.isArray(data?.source)">
      <dd
        v-for="source of data?.source"
        :key="source"
        :lang="source?.['@language']"
        v-html="source?.['@value']"
      />
    </template>
    <template v-else-if="router?.currentRoute.value.params.termbase === 'FBK'">
      <dd>
        <AppLink
          v-if="data.source['@id']"
          :to="data.source['@id']"
        >
          {{ data.source.value || data.source['@id'] }}
        </AppLink>
        <div v-else-if="data.source?.value">
          {{ data.source?.value }}
        </div>
      </dd>
    </template>
    <dd
      v-else
      :lang="data?.source?.['@language']"
      v-html="data.source?.['@value']"
    />
  </TermpostTermProp>
</template>

<script setup lang="ts">
const router = useRouter();
defineProps<{ data: any }>();
</script>
