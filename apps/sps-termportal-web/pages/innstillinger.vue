<template>
  <div>
    <Head>
      <Title>{{ $t("innstillinger.title") }} | {{ $t("index.title") }}</Title>
    </Head>
    <div class="flex">
      <SideBar />
      <main class="max-w-[37em]">
        <h1 id="main" class="pb-3 pt-6">
          <AppLink
            to="#main"
            class="tp-hover-focus border-transparent px-2 py-1 text-3xl"
            >{{ $t("innstillinger.title") }}</AppLink
          >
        </h1>
        <section>
          <h2 id="global" class="pb-1 text-2xl">
            <AppLink
              to="#global"
              class="tp-hover-focus border-transparent px-2 py-1"
              >{{ $t("innstillinger.global") }}</AppLink
            >
          </h2>
          <div class="pl-2.5">
            <p>{{ $t("innstillinger.globalLangComment") }}</p>
          </div>
          <div class="flex flex-col gap-0.5 pt-2">
            <div
              v-for="lang in locales"
              :key="'rbv' + lang"
              class="align-items-center group flex w-fit"
            >
              <input
                :id="'rb-' + lang"
                v-model="i18n.locale.value"
                type="radio"
                class="peer outline-none"
                :value="lang"
                @keydown.enter="setLocale(lang)"
              />
              <label
                :for="'rb-' + lang"
                class="tp-transition-shadow flex gap-2 rounded-[7px] border border-transparent px-1.5 py-1 pr-3 group-hover:cursor-pointer group-hover:border group-hover:border-tpblue-300 peer-focus:border peer-focus:border-tpblue-300 peer-focus:shadow-tphalo"
                @click="setLocale(lang)"
              >
                <Icon
                  v-if="i18n.locale.value === lang"
                  class="text-tpblue-400"
                  name="akar-icons:radio-fill"
                  aria-hidden="true"
                  size="1.5em"
                />
                <Icon
                  v-else
                  name="akar-icons:radio"
                  class="text-tpblue-400"
                  aria-hidden="true"
                  size="1.5em"
                />
                <span class="text-base text-black">
                  {{ $t("global.lang." + lang) }}</span
                ></label
              >
            </div>
          </div>
          <select
            v-if="false"
            id="locale-select"
            v-model="i18n.locale.value"
            class="tp-search-dd cursor-pointer px-2 py-1"
          >
            <option v-for="lang in locales" :key="lang" :value="lang">
              {{ $t("global.lang." + lang) }}
            </option>
          </select>
        </section>
        <section>
          <h2 id="conceptview" class="pb-2 pt-6 text-2xl">
            <AppLink
              to="#conceptview"
              class="tp-hover-focus border-transparent px-2 py-1"
              >{{ $t("innstillinger.conceptview") }}</AppLink
            >
          </h2>
          <fieldset>
            <legend id="dataDispLang" class="pb-1 text-xl">
              <AppLink
                to="#dataDispLang"
                class="tp-hover-focus border-transparent px-2 py-1"
                >{{ $t("innstillinger.dataDispLang") }}</AppLink
              >
            </legend>
            <div class="pl-2.5">
              <p>{{ $t("innstillinger.dataDispLangComment") }}</p>
            </div>
            <div
              class="grid w-fit grid-flow-row grid-cols-2 gap-x-6 gap-y-0.5 pt-2 xs:grid-cols-3"
            >
              <div
                v-for="lang in localeLangOrder"
                :key="lang"
                class="group flex"
              >
                <input
                  :id="'ddl-' + lang"
                  v-model="dataDisplayLanguages"
                  class="peer cursor-pointer outline-none"
                  type="checkbox"
                  :value="lang"
                  @keydown.enter="toggleLang(lang)"
                />
                <label
                  class="tp-transition-shadow flex cursor-pointer items-center gap-x-1.5 rounded-[7px] border border-transparent px-2 py-1 pr-3 group-hover:border-tpblue-300 peer-focus:border-tpblue-300 peer-focus:shadow-tphalo"
                  :for="'ddl-' + lang"
                >
                  <Icon
                    v-if="dataDisplayLanguages.includes(lang)"
                    name="mdi:checkbox-marked-outline"
                    size="1.4em"
                    class="text-tpblue-400"
                    aria-hidden="true"
                  />
                  <Icon
                    v-else
                    name="mdi:checkbox-blank-outline"
                    size="1.4em"
                    class="text-tpblue-400"
                    aria-hidden="true"
                  />
                  <span>{{ $t("global.lang." + lang) }}</span></label
                >
              </div>
            </div>
          </fieldset>
        </section>
      </main>
    </div>
  </div>
</template>

<script setup>
import { useI18n } from "vue-i18n";

const i18n = useI18n();
const dataDisplayLanguages = useDataDisplayLanguages();
const locales = useLocales();
const localeLangOrder = useLocaleLangOrder();

watch(i18n.locale, () => {
  const locale = useCookie("locale", cookieLocaleOptions);
  locale.value = i18n.locale.value;
});

function setLocale(language) {
  i18n.locale.value = language;
}

function toggleLang(language) {
  const index = dataDisplayLanguages.value.indexOf(language);
  if (index !== -1) {
    dataDisplayLanguages.value.splice(index, 1);
  } else {
    dataDisplayLanguages.value.push(language);
  }
}
</script>

<style scoped>
input[type="radio"] {
  -webkit-appearance: none;
  appearance: none;
}

input[type="checkbox"] {
  -webkit-appearance: none;
  appearance: none;
}
</style>
