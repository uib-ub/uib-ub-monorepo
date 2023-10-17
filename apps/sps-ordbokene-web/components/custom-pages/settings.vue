<script setup>
import {useSettingsStore } from '~/stores/settingsStore'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
const settings = useSettingsStore()
const cookies_accepted = useCookie("cookiesAccepted")
const stored_settings = useCookie("settings")

const resetSettings = (settings) => {
  cookies_accepted.value = null
  stored_settings.value = null
    settings.$patch({
      simpleListView:false,
      autoSelect: true, 
      inflectionExpanded: false, 
      inflectionTableContext: false, 
      inflectionNo: false,

    })
};

useHead({
title: t('settings.title')
})

const resetAnimation = ref(false);

const startAnimation = () => {
  resetAnimation.value = true;
  setTimeout(() => {
    resetAnimation.value = false;
  }, 1500); 
};


</script>

<template>
<main id="main" tabindex="-1" class="secondary-page flex flex-col gap-2">
  <h2>{{$t('settings.title')}}</h2>
  <div v-if="!cookies_accepted" class="flex flex-col">
    {{$t('settings.cookie_prompt')}}
    <div class="mt-3 mb-6">
    <button @click="cookies_accepted = 'true'" class="bg-primary text-white bg-primary text-white p-1 rounded px-3 mt-3 border-none cursor-pointer focus:bg-primary-lighten">{{$t('settings.accept_cookies')}}</button>
    </div>
  </div>
  <client-only>
  <FormCheckbox v-model="settings.$state.simpleListView" :checked="settings.simpleListView">
      {{$t('settings.simple_search_list')}}
    </FormCheckbox>
    <FormCheckbox v-model="settings.$state.autoSelect" :checked="settings.autoSelect">
      {{$t('settings.auto_select')}}
    </FormCheckbox>
    <FormCheckbox v-model="settings.$state.inflectionExpanded" :checked="settings.inflectionExpanded">
      {{$t('settings.inflection_expanded')}}
    </FormCheckbox>
    <FormCheckbox v-model="settings.$state.inflectionNo" :checked="settings.inflectionNo">
      {{$t('settings.inflection_no')}}
    </FormCheckbox>
    <FormCheckbox v-model="settings.$state.inflectionTableContext" :checked="settings.inflectionTableContext">
      {{$t('settings.inflection_table_context')}}
    </FormCheckbox>



  <div class="mt-4">
    <button type="button" class="btn btn-primary disabled:text-gray-500" :disabled="!cookies_accepted" @click="resetSettings(settings)">
      <Icon name="bi:trash-fill" class="mr-3 mb-1 text-primary" />
      <span>{{$t('settings.reset')}}</span>
    </button>
  </div>
  </client-only>
</main>
</template>


<style scoped>
button[disabled] svg {
  @apply !text-gray-500;
}
</style>
