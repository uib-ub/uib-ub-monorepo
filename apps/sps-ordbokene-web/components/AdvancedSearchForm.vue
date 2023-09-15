<template>
  <div class="my-1 md:mt-0 pb-6">
    <form  @submit.prevent="submitForm" ref="form" class="flex flex-col gap-4 mx-2">

      <div class="grid gap-3 md:grid-cols-2 lg:grid-cols-5 xl:grid-cols-7">
        <fieldset class="gap-4 lg:col-span-2 xl:col-span-2 grid xl:grid-cols-3 sm:gap-3 border border-1 px-6 pb-4 pt-2 rounded">
          <legend>{{$t('options.dict')}}</legend>
          <FormRadio v-for="(item, idx) in dicts" :key="store.dict + idx" :value="item" name="dict" :labelId="'dict-radio-'+idx" :current="store.dict" @submit="update_dict">
            {{$t(`dicts_short.${item}`)}}
          </FormRadio>
        </fieldset>
        
        <fieldset class="gap-4 lg:col-span-2 xl:col-span-3 grid xl:grid-cols-3 sm:gap-3 border border-1 px-6 pb-4 pt-2 rounded">
          <legend>{{$t('options.scope.title')}}</legend>
          <FormRadio v-for="(item, idx) in ['e', 'ei', 'eif']" :key="store.scope + idx" :value="item" name="scope" :labelId="'scope-radio-'+idx" :current="store.scope" @submit="update_scope">
            {{$t(`options.scope.value.${item}`)}}
          </FormRadio>
        </fieldset>  

      <div class="grid sm:grid-cols-2 xl:grid-cols-2 lg:grid-cols-1 md:col-span-2 lg:col-span-1 xl:col-span-2 gap-2 sm:gap-4 lg:gap-4">
        <div class="relative mt-5"> 
            <label for="pos-select" class="absolute left-2 top-0 transform -translate-y-1/2 bg-tertiary px-1 mb-4">{{ $t('pos') }}:</label>
            <select id="pos-select" name="pos" @change="update_pos" class="w-full border border-1 bg-tertiary py-4 pl-6 pr-2 focus:border-blue-400 focus:outline-none" v-bind:class="{not_null: store.pos}">
                <option v-for="(tag, idx) in  pos_tags" :key="idx" :value="tag" :selected="store.pos == tag" v-bind:class="{selected: store.pos == tag}">{{tag ? $t("tags." + tag) : $t("all_pos")}}</option>
            </select>
        </div>

          <button class="btn sm:mt-4 sm:mb-2 md:mb-0 py-2 lg:py-4" v-if="!(store.pos == null &&  store.scope == 'ei' && store.dict == 'bm,nn')" type="reset" @click="reset"> <Icon name="bi:arrow-clockwise" size="1.25em" class="mr-3" />{{$t('reset')}}</button>
          
      </div>
      
    </div>
      
        <div class="grid grid-cols-10 gap-4 xl:gap-4">
 
          <div class="col-span-10 lg:col-span-6 xl:col-span-7" :class="{activeAutocomplete: store.autocomplete && store.autocomplete.length}">
            <Autocomplete  v-on:dropdown-submit="submitForm"/>
          </div>

          <div class="col-span-10 lg:col-span-4 xl:col-span-3 flex flex-wrap justify-evenly gap-4">
            
            
            <div class="flex justify-center items-center">
        <FormCheckbox labelId="toggle-list-view" v-model="settings.$state.listView" :checked="settings.listView" class="text-blue-700 font-semibold">
            {{$t('show_list')}}
        </FormCheckbox>
    </div>
            <div class="flex justify-center items-center"><NuxtLink to="/help/advanced"><Icon name="bi:info-circle-fill" size="1.25rem" class="mr-2 mb-1 text-primary"/><span class="hoverlink">{{$t('advanced_help')}}</span></NuxtLink></div>
          </div>
        </div>
      
    </form>
  <div v-if="mini_help" id="advanced-info" class="secondary-page container !mb-0 mt-4">

  
        <ContentDoc :path="$i18n.locale + '/help/advanced'"/>
  
  
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
const input_element = useState('input_element')


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
  if (store.input && input_element.value) {
    if (settings.autoSelect) {
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

</style>
  