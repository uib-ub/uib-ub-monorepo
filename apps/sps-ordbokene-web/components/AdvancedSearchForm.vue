<template>
  <div class="my-1 md:mt-0 pb-6">
    <form  @submit.prevent="submitForm" ref="form" class="flex flex-col gap-4">
      <div class="grid gap-3 gap-y-6 md:grid-cols-4 lg:grid-cols-5">
      <fieldset class="md:col-span-2 grid xl:grid-cols-3 gap-8 sm:gap-3 border border-1 px-6 pb-4 pt-2 rounded max-md:basis-full">
      <legend>{{$t('options.dict')}}</legend>
        <FormRadio v-for="(item, idx) in dicts" :key="store.dict + idx" :value="item" name="dict" :labelId="'dict-radio-'+idx" :current="store.dict" @submit="update_dict">
          {{$t(`dicts_short.${item}`)}}
        </FormRadio>
      </fieldset>
      
      <fieldset class="md:col-span-2 grid xl:grid-cols-3 gap-8 sm:gap-3 border border-1 px-6 pb-4 pt-2 rounded max-md:basis-full">
      <legend>{{$t('options.scope.title')}}</legend>
        <FormRadio v-for="(item, idx) in ['e', 'ei', 'eif']" :key="store.scope + idx" :value="item" name="scope" :labelId="'scope-radio-'+idx" :current="store.scope" @submit="update_scope">
          {{$t(`options.scope.value.${item}`)}}
        </FormRadio>
      </fieldset>  

      <div class="md:mx-6 md:col-span-1 flex lg:flex-col xl:flex-row justify-between">
        <fieldset class="rounded min-w-max">
          <legend id="pos-legend" class="bg-tertiary ">{{$t('pos')}}:</legend>
          <div class="!py-3 duration-200 ">
          <select aria-labelledby="pos-legend" name="pos" class="bg-tertiary w-full border border-1 py-1 px-2 pr-2 mr-2" @change="update_pos" v-bind:class="{not_null: store.pos}">
            <option class="w-full mr-2 pr-2" v-for="(tag, idx) in  pos_tags" :key="idx" :value="tag" :selected="store.pos == tag" v-bind:class="{selected: store.pos == tag}">{{tag ? $t("tags." + tag) : $t("all_pos")}}</option>
          </select>
          </div>
        </fieldset>
        <button class="btn btn-primary ml-auto" v-if="!(store.pos == null &&  store.scope == 'ei' && store.dict == 'bm,nn')" type="reset" @click="reset"> <Icon name="bi:trash" size="1.25em" class="mr-3" />{{$t('reset')}}</button>
      </div>
    </div>
      
        <div class="grid grid-cols-8 gap-4 xl:gap-4">
              <div class="col-span-8 lg:col-span-4 xl:col-span-5" :class="{activeAutocomplete: store.autocomplete && store.autocomplete.length}">
            <Autocomplete  v-on:dropdown-submit="submitForm"/>
          </div>
          <div class="col-span-8 lg:col-span-4 xl:col-span-3 grid grid-cols-2 gap-4">

            <button v-if="store.q" class="btn p-2 px-4 col-span-2 sm:col-span-1" type="button" @click="(settings.listView = !settings.listView)" ><Icon :name='settings.listView ? "bi:list" : "bi:file-text"' class="mb-1 mr-2"/>{{settings.listView ? $t('show_articles') : $t('show_list',store.dict==='bm,nn'? 0 : 1)}}</button>


            <button class="btn p-2 px-4 col-span-2 sm:col-span-1" :aria-expanded="mini_help" aria-controls="advanced-info" type="button" @click="mini_help = !mini_help"><Icon :name="mini_help ? 'bi:x-lg' : 'bi:question-lg'" class="mb-1 mr-2"/>{{$t('advanced_help')}}</button>
          </div>
        </div>
      
    </form>
  <div v-if="mini_help" id="advanced-info" class="secondary-page container !mb-0 mt-4">
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
    @apply !bg-primary text-white;
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


#pos-legend{
    margin:-.75rem 0;

    }



  
  </style>
  