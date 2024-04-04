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
    <div
      v-if="!Array.isArray(mainValue(d))"
      :lang="dataLang"
      class="max-w-prose"
      v-html="mainValue(d)"
    />
    <AppLink
      v-else
      class="underline hover:decoration-2 max-w-prose"
      :to="d[1]"
      >{{ d[0] }}</AppLink
    >
    <dl
      v-if="
        d?.note ||
        d?.scopeNote ||
        d?.isOfAbbreviationType ||
        d?.isAbbreviationOf ||
        d?.isCollocatedWith ||
        d?.subject ||
        d?.source ||
        d?.['skosp:dctSource']
      "
      class="grid-col-3 ml-2 mt-3 flex max-w-prose flex-wrap gap-x-8 gap-y-1 md:ml-5"
    >
      <TermProp v-if="d.isOfAbbreviationType" :label="$t('id.forkortelseType')">
        <dd class="max-w-prose" v-html="d.isOfAbbreviationType" />
      </TermProp>
      <TermProp v-if="d.isAbbreviationOf" :label="$t('id.forkortelseAv')">
        <dd class="max-w-prose" v-html="d.isAbbreviationOf" />
      </TermProp>
      <TermProp v-if="d.isCollocatedWith" :label="$t('id.kollokasjon')">
        <dd
          class="max-w-prose"
          v-html="d.isCollocatedWith.map((el) => el['@value']).join(', ')"
        />
      </TermProp>
      <TermProp v-if="d.subject" :label="$t('id.kontekstAv')">
        <dd class="max-w-prose" v-html="d.subject[0]" />
      </TermProp>
      <TermProp
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
        ${d?.source?.label?.['@value'] || d?.source ||''}
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
      </TermProp>
      <TermProp v-if="d.note" :label="$t('id.note')">
        <dd
          class="max-w-prose"
          :lang="d.note?.['@language']"
          v-html="d.note?.['@value']"
        />
        <dd v-if="d.note?.source" v-html="`(${d.note?.source})`" />
      </TermProp>
      <TermProp v-if="d.scopeNote" :label="$t('id.note')">
        <dd
          class="max-w-prose"
          :lang="d.scopeNote?.['@language']"
          v-html="d.scopeNote?.['@value']"
        />
        <dd v-if="d.scopeNote?.source" v-html="`(${d.scopeNote?.source})`" />
      </TermProp>
    </dl>
  </dd>
</template>

<script setup lang="ts">
const props = defineProps({
  data: { type: Array, required: true },
  prop: { type: String, default: undefined },
  dataLang: { type: String, default: undefined },
  flex: { type: Boolean, default: false },
});

const mainValue = (data) => {
  switch (props.prop) {
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
      return data;
    default:
      return data;
  }
};
</script>
