<template>
  <div class="pb-2">
    
    <form  @submit.prevent="submitForm" ref="form" class="flex flex-col gap-4">
        <div class="flex flex-col sm:flex-row sm:flex-wrap w-full gap-3 xl:items-end mt-2 lg:mt-0">

        <div class="whitespace-nowrap">
            <NuxtLink class="" :to="`/${$i18n.locale}/${store.dict}/${advancedSpecialSymbols(store.q) ? '' : store.q}`"><Icon name="bi:arrow-left-short" size="1.5rem" class="mb-1 text-primary"/>{{$t('notifications.simple')}} </NuxtLink>
        </div>


        <div class="whitespace-nowrap p-1 xl:bg-tertiary xl:shadow-none flex sm:flex-col xl:flex-row flex-grow-0 items-baseline"> 
          
            <label for="dict-select">{{ $t('options.dict') }} </label>
            <select id="dict-select" name="dict" @change="update_dict" class="bg-tertiary flex-grow">
                <option v-for="(dict, idx) in  dicts" :key="idx" :value="dict" :selected="store.dict == dict" v-bind:class="{selected: store.dict == dict}">{{$t("dicts." + dict)}}</option>
            </select>

        </div>


        <div class="whitespace-nowrap p-1 xl:bg-tertiary xl:shadow-none  flex sm:flex-col xl:flex-row flex-grow-0 items-baseline"> 
            <label for="scope-select">{{ $t('options.scope.title') }}</label>
            <select id="scope-select" name="scope" @change="update_scope"  class="bg-tertiary flex-grow">
                <option v-for="(scope, idx) in  ['e', 'ei', 'eif']" :key="idx" :value="scope" :selected="store.scope == scope" v-bind:class="{selected: store.scope == scope}">{{$t("options.scope.value." + scope)}}</option>
            </select>
        </div>


        <div class="whitespace-nowrap p-1 xl:bg-tertiary xl:shadow-none  flex sm:flex-col xl:flex-row xl:flex-grow-0 items-baseline"> 
            <label for="pos-select">{{ $t('pos') }}</label>
            <select id="pos-select" name="pos" @change="update_pos" class="bg-tertiary flex-grow">
                <option v-for="(tag, idx) in  pos_tags" :key="idx" :value="tag" :selected="store.pos == tag" v-bind:class="{selected: store.pos == tag}">{{tag ? $t("tags." + tag) : $t("all_pos")}}</option>
            </select>
        </div>
        <div class="flex w-full sm:w-[128px] sm:min-w-[128px] sm:max-w-[128px] !py-0" :class="{'hidden lg:flex': store.pos == null &&  store.scope == 'ei' && store.dict == 'bm,nn'}">
            <button class="btn w-full" v-if="!(store.pos == null &&  store.scope == 'ei' && store.dict == 'bm,nn')" type="reset" @click="reset"> <Icon name="bi:arrow-clockwise" size="1.25em" class="mr-3 text-primary" />{{$t('reset')}}</button>
          </div>

        </div>
      

        <div class="flex flex-col lg:flex-row lg:flex-wrap w-full gap-x-6 gap-y-3">
          <div class="flex-grow" :class="{activeAutocomplete: store.autocomplete && store.autocomplete.length}">
            <Autocomplete  v-on:dropdown-submit="submitForm"/>
          </div>

          <div class="flex gap-6" v-if="store.q">
            <div class="flex justify-center items-center">
              <FormCheckbox v-model="settings.$state.listView" :checked="settings.listView" class="text-blue-700 font-semibold">
                  {{$t('show_list')}}
              </FormCheckbox>
            </div>
            <div class="flex justify-center items-center"><NuxtLink :to="`/${$i18n.locale}/help/advanced`"><Icon name="bi:info-circle-fill" size="1.25rem" class="mr-2 mb-1 text-primary"/><span class="hoverlink">{{$t('advanced_help')}}</span></NuxtLink></div>
          </div>
        </div>
    </form>
  </div>
</template>
  
<script setup>
import { useSearchStore } from '~/stores/searchStore'
import { useRoute } from 'vue-router'
import {useSettingsStore } from '~/stores/settingsStore'
const settings = useSettingsStore()
const store = useSearchStore()
const route = useRoute()

const dicts = ['bm,nn', 'bm', 'nn']
const pos_tags = ['', 'VERB', 'NOUN', 'ADJ', 'PRON', 'DET', 'ADV', 'ADP', 'CCONJ', 'SCONJ', 'INTJ']
const input_element = useState('input_element')


const mini_help = ref(!store.q)

const update_pos = event => {
  store.pos = event.target.value
  submitForm()

}

const update_dict = (event) => {
  store.dict = event.target.value
  if (store.q) {
    submitForm()
  }
  
}

const update_scope = (event) => {
  store.scope = event.target.value
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
  if (store.input && input_element.value) {
    if (settings.autoSelect && !isMobileDevice()) {
      input_element.value.select()
    }
    else {
      input_element.value.blur()
    }
    
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


label {
  @apply px-1 whitespace-nowrap font-semibold;
}

</style>
  