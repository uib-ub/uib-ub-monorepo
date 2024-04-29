<template>
  <dd
    v-for="d in data"
    :key="d + 'key'"
    class="px-2"
    :class="{
      'border-l-solid my-1 border-2 border-transparent border-l-gray-300 border-r-transparent hover:border-l-tpblue-200':
        !flex,
    }"
  >
    <!-- Links are passed as Arrays -->
    <div v-if="mainValue(d)">
      <div
        v-if="!Array.isArray(mainValue(d))"
        :lang="dataLang"
        class="max-w-prose"
        v-html="mainValue(d)"
      />
      <AppLink
        v-else
        class="underline hover:decoration-2 max-w-prose"
        :to="mainValue(d)[1]"
        >{{ mainValue(d)[0] }}</AppLink
      >
    </div>
    <dl
      v-if="
        d?.note ||
        d?.scopeNote ||
        d?.isOfAbbreviationType ||
        d?.isAbbreviationOf ||
        d?.isCollocatedWith ||
        d?.subject ||
        d?.description ||
        d?.source ||
        d?.['skosp:dctSource']
      "
      class="grid-col-3 ml-2 flex max-w-prose flex-wrap gap-x-8 gap-y-1 md:ml-5"
      :class="{ 'mt-3': mainValue(d) }"
    >
      <TermpostTermProp
        v-if="d.isOfAbbreviationType"
        :label="$t('id.forkortelseType')"
      >
        <dd class="max-w-prose" v-html="d.isOfAbbreviationType" />
      </TermpostTermProp>
      <TermpostTermProp
        v-if="d.isAbbreviationOf"
        :label="$t('id.forkortelseAv')"
      >
        <dd class="max-w-prose" v-html="d.isAbbreviationOf" />
      </TermpostTermProp>
      <TermpostTermProp v-if="d.isCollocatedWith" :label="$t('id.kollokasjon')">
        <dd
          class="max-w-prose"
          v-html="d.isCollocatedWith.map((el) => el['@value']).join(', ')"
        />
      </TermpostTermProp>
      <!-- TODO: fix after change in export -->
      <TermpostTermProp
        v-if="d.description"
        :label="$t('id.inndelingskriterium')"
      >
        <dd class="max-w-prose" v-html="d.description.und" />
      </TermpostTermProp>
      <TermpostTermProp v-if="d.subject" :label="$t('id.kontekstAv')">
        <dd class="max-w-prose" v-html="d.subject[0]" />
      </TermpostTermProp>
      <TermpostTermProp
        v-if="d?.['skosp:dctSource'] || d.source"
        :label="$t('id.referanse')"
      >
        <dd
          v-if="
            typeof d?.['skosp:dctSource']?.['skosp:rdfsLabel'] === 'string' ||
            typeof d?.source?.label?.['@value'] === 'string' ||
            typeof d?.source === 'string'
          "
          class="max-w-prose"
          v-html="
            `
        ${d?.['skosp:dctSource']?.['skosp:rdfsLabel'] || ''}
        ${d?.source?.label?.['@value'] || d?.source || ''}
        `
          "
        />
        <template v-else-if="Array.isArray(d?.source)">
          <dd
            v-for="source of d?.source"
            :key="source"
            :lang="source?.['@language']"
            v-html="source?.['@value']"
          />
        </template>
        <dd
          v-else
          :lang="d?.source?.['@language']"
          v-html="d.source?.['@value']"
        />
      </TermpostTermProp>
      <TermpostTermProp
        v-if="d.note && prop !== 'equivalence' && prop !== 'equivalencenote'"
        :label="$t('id.note')"
      >
        <dd
          class="max-w-prose"
          :lang="d.note?.['@language']"
          v-html="d.note?.['@value']"
        />
        <dd v-if="d.note?.source" v-html="`(${d.note?.source})`" />
      </TermpostTermProp>
      <TermpostTermProp v-if="d.scopeNote" :label="$t('id.note')">
        <dd
          class="max-w-prose"
          :lang="d.scopeNote?.['@language']"
          v-html="d.scopeNote?.['@value']"
        />
        <dd v-if="d.scopeNote?.source" v-html="`(${d.scopeNote?.source})`" />
      </TermpostTermProp>
    </dl>
  </dd>
</template>

<script setup lang="ts">
import { useI18n } from "vue-i18n";

const i18n = useI18n();

const props = defineProps({
  data: { type: Array, required: true },
  prop: { type: String, default: undefined },
  dataLang: { type: String, default: undefined },
  flex: { type: Boolean, default: false },
  meta: {
    type: Object,
    default() {
      return {};
    },
  },
});

const mainValue = (data) => {
  switch (props.prop) {
    case "equivalence": {
      const value = data?.value?.["@id"];
      if (value) {
        const key = value.split("/").slice(-1)[0];
        if (key !== "startingLanguage") {
          return (
            i18n.t(`global.equivalence.${key}`) +
            " " +
            i18n.t(`global.lang.${props.meta.startingLanguage}`, 0)
          );
        } else {
          return false;
        }
      } else {
        return false;
      }
    }
    case "equivalencenote":
      return data?.note?.["@value"];
    case "definition":
      return data?.label["@value"];
    case "prefLabel":
      return data?.literalForm["@value"];
    case "altLabel":
      return data?.literalForm["@value"];
    case "hiddenLabel":
      return data?.literalForm["@value"];
    case "context":
      return data?.label["@value"];
    case "nonLingusticLabel":
      return data?.nonLingusticLabel;
    case "link":
      return data?.target;
    default:
      return data;
  }
};
</script>
