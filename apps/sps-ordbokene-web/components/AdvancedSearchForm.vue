<template>
  <div class="my-1 md:mt-0 pb-6">
  <form  @submit.prevent="submitForm" ref="form" class="lg:flex-row flex-wrap my-3 gap-6 justify-between">
    <div class="flex flex-wrap  gap-8 sm:gap-3 m-3 sm:m-0">
    <fieldset class="flex flex-col md:flex-row gap-8 sm:gap-3 border border-1 px-2">
    <legend>{{$t('options.dict')}}</legend>
      <FormRadio v-for="(item, idx) in dicts" :key="store.dict + idx" :value="item" name="dict" :labelId="'dict-radio-'+idx" :current="store.dict" @submit="update_dict">
        {{$t(`dicts.${item}`)}}
      </FormRadio>
    </fieldset>
  
  <div class="flex gap-8 sm:gap-3">

    <fieldset class="flex flex-col md:flex-row gap-8 sm:gap-3 border border-1 px-2">
    <legend>{{$t('options.scope.title')}}</legend>
      <FormRadio v-for="(item, idx) in ['e', 'ei', 'eif']" :key="store.scope + idx" :value="item" name="scope" :labelId="'scope-radio-'+idx" :current="store.scope" @submit="update_scope">
        {{$t(`options.scope.value.${item}`)}}
      </FormRadio>
    </fieldset>  
  
  
    

  
  </div>
  <div>
    <label class="relative" for="pos-select">{{$t('pos')}}:</label>
    <div class="select-wrapper !p-2 px-4 sm:px-2 sm:py-0.5 duration-200 border border-1" v-bind:class="{not_null: store.pos}">
    <select id="pos-select" name="pos" class="bg-tertiary focus:outline-none" @change="update_pos">
      <option v-for="(tag, idx) in  pos_tags" :key="idx" :value="tag" :selected="store.pos == tag" v-bind:class="{selected: store.pos == tag}">{{tag ? $t("tags." + tag) : $t("all_pos")}}</option>
    </select>
    </div>
  </div>

  <button class="btn !py-2 !sm:py-1 !sm:px-2 sm:min-w-[8rem] xl:min-w-[12rem] btn-secondary bg-gray-500 border-gray-600 text-white" v-if="!(store.pos == null &&  store.scope == 'ei' && store.dict == 'bm,nn')" type="reset" @click="reset"> <Icon name="bi:trash" size="1.25em" class="mr-3" />{{$t('reset')}}</button>
  
  </div>
  
  
  <div class="flex-1">
    
  
    <div class="flex gap-4 mt-3 flex-wrap flex-col sm:flex-row sm:justify-start">
      <div class="flex-auto" :class="{activeAutocomplete: store.autocomplete && store.autocomplete.length}">
    <Autocomplete  v-on:dropdown-submit="submitForm"/>
  </div>
    <button class="btn !py-2 !sm:py-1 !sm:px-2 sm:min-w-[8rem] xl:min-w-[12rem] btn-light" type="button" @click="(settings.listView = !settings.listView)" ><Icon :name='settings.listView ? "bi:list" : "bi:file-text"' class="mb-1 mr-2"/>{{settings.listView ? $t('show_articles') : $t('show_list',store.dict==='bm,nn'? 0 : 1)}}</button>
    <button class="btn !py-2 !sm:py-1 !sm:px-2 sm:min-w-[8rem] xl:min-w-[12rem] btn-light" :aria-expanded="mini_help" aria-controls="advanced-info" type="button" @click="mini_help = !mini_help"><Icon :name="mini_help ? 'bi:x-lg' : 'bi:question-lg'" class="mb-1 mr-2"/>{{$t(mini_help ? 'advanced_help_hide' : 'advanced_help')}}</button>
    
    </div>
  </div>
  </form>
  <div v-if="mini_help" id="advanced-info" class="secondary-page container !mb-0">
        <h2>{{$t('advanced.title')}}</h2>
        <p>{{$t('advanced.description')}}</p>
  
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


const mini_help = ref(!store.q)

const update_pos = event => {
  store.pos = event.target.value
  submitForm()

}

const update_dict = (value) => {
  store.dict = value
  if (store.q) {
    submitForm()
  }
  
}

const update_scope = (value) => {
  console.log(value)
  store.scope = value
  if (store.q) {
    submitForm()
  }
}


const reset = () => {
  store.pos = null
  store.scope = "ei"
  store.dict = "bm,nn"

  if (store.q) {
    submitForm()
  }

}


const submitForm = async (item) => {
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
  @apply text-text bg-canvas-darken;
}

option:hover {
  @apply text-text bg-tertiary;
}

option.selected {
  @apply text-white bg-primary;
}

.select-wrapper:focus-within {
  box-shadow: 2px 2px 0px theme("colors.primary.DEFAULT");

}

.select-wrapper.not_null {
    @apply border-primary border;
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

legend, label {
  font-variant: all-small-caps;
  font-size: 1.25rem;
  letter-spacing: .1rem;
}

  
  </style>
  