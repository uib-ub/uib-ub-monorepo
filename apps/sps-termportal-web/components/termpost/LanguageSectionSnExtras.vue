<template>
  <TermpostTermProp
    v-if="concept?.xlScopeNote?.[lang]"
    :label="$t('id.note')"
  >
    <TermpostTermDescription
      :data="concept.xlScopeNote[lang]"
      prop="xlScopeNote"
      :data-lang="lang"
    />
  </TermpostTermProp>
  <TermpostTermProp
    v-if="concept?.example?.[lang]"
    :label="$t('id.example')"
  >
    <TermpostTermDescription
      :data="concept.example[lang]"
      prop="example"
      :data-lang="lang"
    />
  </TermpostTermProp>
</template>

<script setup lang="ts">
defineProps<{
  concept: object;
  lang: string; }>();
</script>
