<template>
  <div>
    <h3 id="relasjon" class="pb-1 text-xl">
      <AppLink to="#relasjon"> {{ $t("id.relasjon") }}</AppLink>
    </h3>
    <TermpostTermSection>
      <template v-for="relationType in Object.keys(semanticRelationTypes)">
        <TermpostTermProp
          v-if="displayInfo.semanticRelations[relationType]"
          :key="relationType"
          :label="$t('id.' + relationType)"
        >
          <TermpostTermDescription
            prop="link"
            :data="displayInfo.semanticRelations[relationType]"
          />
        </TermpostTermProp>
      </template>
    </TermpostTermSection>
  </div>
</template>

<script setup lang="ts">
const props = defineProps({ displayInfo: { type: Object, required: true } });
</script>
