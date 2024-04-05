<template>
  <div class="">
    <h3 :id="lang" class="pb-1 text-xl">
      <AppLink :to="`#${lang}`">{{ $t("global.lang." + lang) }}</AppLink>
    </h3>
    <TermSection>
      <!--Equivalence -->
      <TermProp
        v-if="concept?.hasEquivalenceData?.[lang]"
        :flex="
          concept?.hasEquivalenceData?.[lang][0]?.['note']?.['@value']
            ? false
            : true
        "
        :label="$t('global.equivalence.equivalence')"
      >
        <TermDescription
          :flex="
            concept?.hasEquivalenceData?.[lang][0]?.['note']?.['@value']
              ? false
              : true
          "
          :data="concept?.hasEquivalenceData?.[lang]"
          prop="equivalence"
        ></TermDescription>
      </TermProp>

      <!--Definition-->
      <TermProp
        v-if="
          concept?.definisjon?.[lang] || concept?.betydningsbeskrivelse?.[lang]
        "
        :label="$t('id.definisjon')"
      >
        <TermDescription
          :data="
            concept.definisjon?.[lang] || concept?.betydningsbeskrivelse?.[lang]
          "
          prop="definition"
          :data-lang="lang"
        >
        </TermDescription>
      </TermProp>

      <!--Anbefalt term-->
      <TermProp v-if="concept?.prefLabel?.[lang]" :label="$t('id.prefLabel')">
        <TermDescription
          prop="prefLabel"
          :data="concept?.prefLabel[lang]"
          :data-lang="lang"
        >
        </TermDescription>
      </TermProp>

      <!--Tillatt term-->
      <TermProp v-if="concept?.altLabel?.[lang]" :label="$t('id.altLabel')">
        <TermDescription
          prop="altLabel"
          :data="concept?.altLabel[lang]"
          :data-lang="lang"
        >
        </TermDescription>
      </TermProp>
      <!--Frarådet term-->
      <TermProp
        v-if="concept?.hiddenLabel?.[lang]"
        :label="$t('id.hiddenLabel')"
      >
        <TermDescription
          prop="altLabel"
          :data="concept?.hiddenLabel[lang]"
          :data-lang="lang"
        >
        </TermDescription>
      </TermProp>
      <!--Kontekst-->
      <TermProp v-if="concept?.hasUsage?.[lang]" :label="$t('id.kontekst')">
        <TermDescription
          prop="context"
          :data="concept?.hasUsage[lang]"
          :data-lang="lang"
        />
      </TermProp>
    </TermSection>
  </div>
</template>

<script setup lang="ts">
const props = defineProps({
  concept: { type: Object, required: true },
  lang: { type: String, required: true },
});
</script>
