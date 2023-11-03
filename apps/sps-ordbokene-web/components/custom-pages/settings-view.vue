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
    if (default_settings[item] !== settings.$state[item]) {
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
    <label class="checkbox-label">
    <input  v-model="settings.simpleListView" type="checkbox">
      {{$t('settings.simple_search_list')}}
    </label>
    <label class="checkbox-label">
    <input  v-model="settings.autoSelect" type="checkbox">
      {{$t('settings.auto_select')}}
    </label>
    <label class="checkbox-label">
    <input  v-model="settings.inflectionExpanded" type="checkbox">
      {{$t('settings.inflection_expanded')}}
    </label>
    <label class="checkbox-label">
    <input  v-model="settings.inflectionNo" type="checkbox">
      {{$t('settings.inflection_no')}}
    </label>
    <label class="checkbox-label">
    <input  v-model="settings.inflectionTableContext" type="checkbox">
      {{$t('settings.inflection_table_context')}}
    </label>
    

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
