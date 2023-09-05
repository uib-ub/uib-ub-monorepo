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
    <div
      v-if="!Array.isArray(mainValue(d))"
      :lang="dataLang"
      class="max-w-prose"
      v-html="mainValue(d)"
    ></div>
    <AppLink v-else class="underline hover:decoration-2" :to="d[1]">{{
      d[0]
    }}</AppLink>
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
      class="ml-0 mt-2 flex flex-wrap gap-x-8 gap-y-3"
    >
      <TermProp v-if="d.isOfAbbreviationType" :label="$t('id.forkortelseType')">
        <dd class="max-w-prose">{{ d.isOfAbbreviationType }}</dd></TermProp
      >
      <TermProp v-if="d.isAbbreviationOf" :label="$t('id.forkortelseAv')">
        <dd class="max-w-prose">{{ d.isAbbreviationOf }}</dd></TermProp
      >
      <TermProp v-if="d.isCollocatedWith" :label="$t('id.kollokasjon')">
        <dd class="max-w-prose">
          {{ d.isCollocatedWith.map((el) => el["@value"]).join(", ") }}
        </dd></TermProp
      >
      <TermProp v-if="d.subject" :label="$t('id.kontekstAv')">
        <dd class="max-w-prose">
          {{ d.subject[0] }}
        </dd>
      </TermProp>
      <TermProp
        v-if="d?.['skosp:dctSource'] || d.source"
        :label="$t('id.referanse')"
      >
        <dd class="max-w-prose">
          {{ d?.["skosp:dctSource"]?.["skosp:rdfsLabel"] }} {{ d?.source }}
        </dd>
      </TermProp>
      <TermProp v-if="d.note" :label="$t('id.note')">
        <dd class="max-w-prose" :lang="d.note?.['@language']">
          {{ d.note?.["@value"] }}
        </dd>
      </TermProp>
      <TermProp v-if="d.scopeNote" :label="$t('id.note')">
        <dd class="max-w-prose" :lang="d.scopeNote?.['@language']">
          {{ d.scopeNote?.["@value"] }}
        </dd>
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
  console.log(data);
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
    case "link":
      console.log(data);
      return data;
    default:
      return data;
  }
};
</script>
