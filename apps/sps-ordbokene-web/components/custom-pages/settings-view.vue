<script setup>
import { useI18n } from 'vue-i18n'
import {useSettingsStore } from '~/stores/settingsStore'


const { t } = useI18n()
const settings = useSettingsStore()
const settings_cookie = useCookie('settings')
const locale_cookie = useCookie('currentLocale')

const default_settings = {
      simpleListView:false,
      autoSelect: true, 
      inflectionExpanded: false, 
      inflectionTableContext: false, 
      inflectionNo: false,
    }

const not_default = computed(() => {
  for (const item in default_settings) {
    if (default_settings[item] != settings.$state[item]) {
      return true
    }
  }
})

const resetSettings = (settings) => {
    settings.$patch(default_settings)
};

const clearCookies = () => {
    settings_cookie.value = null
    locale_cookie.value = null
};

useHead({
  title: t('settings.title')
})



</script>

<template>
<main id="main" tabindex="-1" class="secondary-page flex flex-col gap-4">
  <h1>{{$t('settings.title')}}</h1>
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



  <div class="mt-4 flex flex-col md:flex-row gap-3">
    <button v-if="not_default" class="btn btn-primary" @click="resetSettings(settings)">
      <Icon name="bi:arrow-clockwise" class="mr-3 mb-1 text-primary" />
      <span>{{$t('reset')}}</span>
    </button>
        <button v-if="locale_cookie || settings_cookie" class="btn btn-primary" @click="clearCookies(settings)">
      <Icon name="bi:trash-fill" class="mr-3 mb-1 text-primary"/>
      <span>{{$t('settings.clear_cookies')}}</span>
    </button>
  </div>
  </client-only>
</main>
</template>
