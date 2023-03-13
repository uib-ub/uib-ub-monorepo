<template>
  <tr class="hover:bg-gray-100">
    <th :class="thClass + ' pr-3 text-left font-semibold'" scope="row">
      {{ label }}
    </th>
    <td
      v-if="to"
      :lang="dataLang"
      class="max-w-prose"
      :class="{ 'text-right': langRtoL(dataLang as LangCode) }"
    >
      <AppLink class="underline hover:decoration-2" :to="to">{{
        data || to
      }}</AppLink>
    </td>
    <td
      v-else
      class="max-w-prose"
      :class="{ 'text-right': langRtoL(dataLang as LangCode) }"
      :lang="dataLang"
    >
      {{ data }}
    </td>
  </tr>
</template>

<script setup lang="ts">
import { LangCode } from "../utils/vars-language";

const props = defineProps({
  data: { type: String, default: "" },
  thClass: { type: String, default: "" },
  label: { type: String, required: true },
  to: { type: String, default: "" },
  dataLang: { type: String, default: null },
});
</script>
