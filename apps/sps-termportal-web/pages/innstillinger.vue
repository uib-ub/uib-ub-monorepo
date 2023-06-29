<template>
  <main>
    <Head>
      <Title>{{ $t("innstillinger.title") }} | {{ $t("index.title") }}</Title>
    </Head>
    <h1 id="main" class="pb-2 pt-5 text-3xl">
      <AppLink to="#main">{{ $t("innstillinger.title") }}</AppLink>
    </h1>
    <section>
      <h2 id="global" class="pb-2 text-2xl">
        <AppLink to="#global">{{ $t("innstillinger.global") }}</AppLink>
      </h2>
      <label for="locale-select" class="text-lg"
        >{{ $t("global.language") }}:
      </label>
      <select
        id="locale-select"
        v-model="i18n.locale.value"
        class="tp-search-dd cursor-pointer px-2 py-1 text-lg"
      >
        <option v-for="lang in locales" :key="lang" :value="lang">
          {{ $t("global.lang." + lang) }}
        </option>
      </select>
    </section>
    <section>
      <h2 id="conceptview" class="pb-2 pt-3 text-2xl">
        <AppLink to="#conceptview">{{
          $t("innstillinger.conceptview")
        }}</AppLink>
      </h2>
      <fieldset>
        <legend id="dataDispLang" class="pb-1 text-xl">
          <AppLink to="#dataDispLang">{{
            $t("innstillinger.dataDispLang")
          }}</AppLink>
        </legend>
        <div class="grid w-72 grid-flow-col grid-rows-6 gap-x-3 gap-y-2">
          <div v-for="lang in localeLangOrder" :key="lang">
            <input
              :id="`ddl-${lang}`"
              v-model="dataDisplayLanguages"
              class="checked:bg-tpblue-400 cursor-pointer"
              type="checkbox"
              :value="lang"
            />
            <label
              class="cursor-pointer px-1 py-1 text-lg"
              :for="`ddl-${lang}`"
              >{{ $t("global.lang." + lang) }}</label
            >
          </div>
        </div>
      </fieldset>
    </section>
  </main>
</template>

<script setup>
import { useI18n } from "vue-i18n";
const i18n = useI18n();
const dataDisplayLanguages = useDataDisplayLanguages();
const locales = useLocales();
const localeLangOrder = useLocaleLangOrder();
</script>
