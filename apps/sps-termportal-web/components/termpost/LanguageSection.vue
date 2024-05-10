<template>
  <div class="">
    <h3 :id="lang" class="pb-1 text-xl">
      <AppLink :to="`#${lang}`"
        >{{ $t("global.lang." + lang) }}
        <span v-if="lang === meta.startingLanguage" class="font-light"
          >({{ $t("global.equivalence.startingLanguage") }})</span
        ></AppLink
      >
    </h3>
    <TermpostTermSection>
      <!--Equivalence -->
      <TermpostTermProp
        v-if="meta.startingLanguage && meta.startingLanguage !== lang"
        :flex="true"
        :label="$t('global.equivalence.equivalence')"
      >
        <TermpostTermDescription
          :flex="true"
          :data="concept?.hasEquivalenceData?.[lang]"
          :meta="meta"
          prop="equivalence"
        ></TermpostTermDescription>
      </TermpostTermProp>
      <!--Equivalencemerknad -->
      <!-- TODO: Fix RTT edge case -->
      <TermpostTermProp
        v-if="
          concept?.hasEquivalenceData?.[lang] &&
          concept?.hasEquivalenceData?.[lang][0]?.note &&
          !concept?.hasEquivalenceData?.[lang][0]?.note['@value'].startsWith(
            'RTT'
          )
        "
        :flex="true"
        :label="$t('global.equivalence.equivalencenote')"
      >
        <TermpostTermDescription
          :flex="true"
          :data="concept?.hasEquivalenceData?.[lang]"
          :meta="meta"
          prop="equivalencenote"
        ></TermpostTermDescription>
      </TermpostTermProp>

      <!--Definition-->
      <TermpostTermProp
        v-if="
          concept?.definisjon?.[lang] || concept?.betydningsbeskrivelse?.[lang]
        "
        :label="$t('id.definisjon')"
      >
        <TermpostTermDescription
          :data="
            concept.definisjon?.[lang] || concept?.betydningsbeskrivelse?.[lang]
          "
          prop="definition"
          :data-lang="lang"
        >
        </TermpostTermDescription>
      </TermpostTermProp>

      <!--Anbefalt term-->
      <TermpostTermProp
        v-if="concept?.prefLabel?.[lang]"
        :label="$t('id.prefLabel')"
      >
        <TermpostTermDescription
          prop="prefLabel"
          :data="concept?.prefLabel[lang]"
          :data-lang="lang"
        >
        </TermpostTermDescription>
      </TermpostTermProp>

      <!--Tillatt term-->
      <TermpostTermProp
        v-if="concept?.altLabel?.[lang]"
        :label="$t('id.altLabel')"
      >
        <TermpostTermDescription
          prop="altLabel"
          :data="concept?.altLabel[lang]"
          :data-lang="lang"
        >
        </TermpostTermDescription>
      </TermpostTermProp>
      <!--Frarådet term-->
      <TermpostTermProp
        v-if="concept?.hiddenLabel?.[lang]"
        :label="$t('id.hiddenLabel')"
      >
        <TermpostTermDescription
          prop="altLabel"
          :data="concept?.hiddenLabel[lang]"
          :data-lang="lang"
        >
        </TermpostTermDescription>
      </TermpostTermProp>
      <!--Kontekst-->
      <TermpostTermProp
        v-if="concept?.hasUsage?.[lang]"
        :label="$t('id.kontekst')"
      >
        <TermpostTermDescription
          prop="context"
          :data="concept?.hasUsage[lang]"
          :data-lang="lang"
        />
      </TermpostTermProp>
    </TermpostTermSection>
  </div>
</template>

<script setup lang="ts">
const props = defineProps({
  meta: { type: Object, required: true },
  concept: { type: Object, required: true },
  lang: { type: String, required: true },
});
</script>
