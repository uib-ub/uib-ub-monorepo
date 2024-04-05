<template>
  <div>
    <h3 id="relasjon" class="pb-1 text-xl">
      <AppLink to="#relasjon"> {{ $t("id.relasjon") }}</AppLink>
    </h3>
    <TermSection>
      <template v-for="relationType in semanticRelationTypes">
        <TermProp
          v-if="displayInfo.semanticRelations[relationType]"
          :key="relationType"
          :label="$t('id.' + relationType)"
        >
          <TermDescription
            prop="link"
            :data="displayInfo.semanticRelations[relationType]"
          />
        </TermProp>
      </template>
    </TermSection>
  </div>
</template>

<script setup lang="ts">
const props = defineProps({ displayInfo: { type: Object, required: true } });
</script>
