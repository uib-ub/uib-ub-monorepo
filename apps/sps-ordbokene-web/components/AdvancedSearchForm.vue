<template>
<div class="my-1 md:mt-0">
<form  @submit.prevent="submitForm" ref="form" class="flex flex-col lg:flex-row flex-wrap my-3 gap-6 justify-between">
  <div class="flex flex-col sm:flex-row gap-8 sm:gap-3 m-3 sm:m-0">
  <fieldset class="flex flex-col gap-8 sm:gap-3">
  <legend class="sr-only">Ordbok</legend>
    <FormRadio v-for="(item, idx) in dicts" :key="store.dict + idx" :model="store.dict || 'bm,nn'" @change="dict_radio" :value="item" name="dict" :labelId="'dict-radio-'+idx">
      {{$t(`dicts.${item}`)}}
    </FormRadio>
  </fieldset>

<div class="flex flex-col gap-8 sm:gap-3">

<FormCheckbox labelId="inflectedCheckbox" :checked="inflection_enabled" v-model="inflection_enabled">
    {{$t('options.inflected')}}
</FormCheckbox>
<FormCheckbox labelId="fulltextCheckbox" :checked="fulltext_enabled" v-model="fulltext_enabled">
    {{$t('options.fulltext')}}
</FormCheckbox>

<div class="flex flex-row gap-4 sm:gap-2">
  <label for="pos-select">{{$t('pos')}}:</label>
  <div class="select-wrapper py-1 px-4 sm:px-2 sm:py-0.5" v-bind:class="{not_null: store.pos}">
  <select id="pos-select" name="pos" class="bg-tertiary" @change="store.pos = $event.target.value">
    <option v-for="(tag, idx) in  pos_tags" :key="idx" :value="tag" :selected="store.pos == tag" v-bind:class="{selected: store.pos == tag}">{{tag ? $t("tags." + tag) : $t("all_pos")}}</option>
  </select>
  </div>
</div>

</div>

</div>


<div class="flex-1">
<div class="flex-auto" :class="{activeAutocomplete: store.autocomplete && store.autocomplete.length}">
  <Autocomplete  v-on:dropdown-submit="submitForm"/>
</div>
  <div class="flex gap-4 mt-3 flex-wrap flex-col sm:justify-start sm:flex-row-reverse">
  <button class="btn !py-2 !sm:py-1 !sm:px-2 sm:min-w-[8rem] xl:min-w-[12rem] btn-primary bg-primary text-white border-primary-lighten" type="submit"> <Icon name="bi:search" size="1.25rem" class="mr-3 m-"/>{{$t('search')}}</button>
  <button class="btn !py-2 !sm:py-1 !sm:px-2 sm:min-w-[8rem] xl:min-w-[12rem] btn-secondary bg-gray-500 border-gray-600 text-white" v-if="!(store.pos == null &&  store.scope == 'ei' && fulltext_enabled == false && inflection_enabled == true && store.dict == 'bm,nn')" type="reset" @click="reset"> <Icon name="bi:trash" size="1.25rem" class="mr-3" />{{$t('reset')}}</button>
  <button class="btn !py-2 !sm:py-1 !sm:px-2 sm:min-w-[8rem] xl:min-w-[12rem] btn-light" type="button" @click="(settings.listView = !settings.listView)" ><Icon :name='settings.listView ? "bi:list" : "bi:file-text"' class="mb-1 mr-2"/>{{settings.listView ? $t('show_articles') : $t('show_list',store.dict==='bm,nn'? 0 : 1)}}</button>
  <button class="btn !py-2 !sm:py-1 !sm:px-2 sm:min-w-[8rem] xl:min-w-[12rem] btn-light" :aria-expanded="mini_help" aria-controls="advanced-info" type="button" @click="mini_help = !mini_help"><Icon :name="mini_help ? 'bi:x-lg' : 'bi:question-lg'" class="mb-1 mr-2"/>{{$t(mini_help ? 'advanced_help_hide' : 'advanced_help')}}</button>
  
  </div>
</div>
</form>
<div v-if="mini_help" id="advanced-info" class="secondary-page container">
      <h2>{{$t('advanced')}}</h2>
      <p>Enkelt søk viser kun treff på oppslagsord i resultatlisten, og vi prøver å gi deg det beste alternativet hvis det du søker etter ikke er et oppslagsord. I avansert søk kan du derimot vise treff på bøyde former og i definisjonene (fritekstsøk). Du kan også filtrere etter ordklasse, og trunkere og kombinere søkene med spesialtegn.</p>

      <AdvancedHelp/>


    </div>
</div>
</template>

<script setup>

import { useStore } from '~/stores/searchStore'
import { useRoute } from 'vue-router'
import {useSettingsStore } from '~/stores/settingsStore'
const settings = useSettingsStore()
const store = useStore()
const route = useRoute()

const dicts = ['bm,nn', 'bm', 'nn']
const pos_tags = ['', 'VERB', 'NOUN', 'ADJ', 'PRON', 'DET', 'ADV', 'ADP', 'CCONJ', 'SCONJ', 'INTJ']

const fulltext_enabled = ref(store.scope.includes('f'))
const inflection_enabled = ref(store.scope.includes('i'))

const mini_help = ref(!store.q)

const dict_radio = (value) => {
  store.dict = value

}


const reset = () => {
  store.pos = null
  store.scope = "ei"
  fulltext_enabled.value = false
  inflection_enabled.value = true
  store.dict = "bm,nn"
}

watch(fulltext_enabled, () => {
  if (fulltext_enabled.value) {
    store.scope = store.scope + "f"
  }
  else {
    store.scope = store.scope.replace('f', '')
  }
})

watch(inflection_enabled, () => {
  if (inflection_enabled.value) {
    store.scope = store.scope + "i"
  }
  else {
    store.scope = store.scope.replace('i', '')
  }
})


const submitForm = async (item) => {
  //store.autocomplete = []
  if (store.input) {
    store.q = store.input
    mini_help.value = false
    let query = {q: store.input, dict: store.dict, scope: store.scope}
    if (store.pos) {
      query.pos = store.pos
    }
    return navigateTo({query})
  }
}

</script>

<style scoped>

.welcome .advanced-search {
  @apply bg-tertiary border-tertiary-darken2;

}

option {
    @apply text-text bg-canvas;
}

option.selected {
  @apply text-white bg-primary;
}

.select-wrapper:focus-within {
  box-shadow: 2px 2px 0px theme("colors.primary.DEFAULT");

}

.select-wrapper.not_null {
      border: solid 1px;
      border-radius: 1rem;
      @apply border-primary;
}


.btn-primary i, button.btn-secondary i {
  @apply text-white

}


.btn-primary:hover {
  @apply bg-primary-lighten;
}

.btn-primary:focus {
  @apply bg-primary-lighten2;
}

.btn-primary:focus i {
    @apply text-white
}

.btn-secondary:hover {
  @apply bg-secondary;
}

.btn-secondary:focus {
  @apply bg-secondary-darken;
}


</style>
