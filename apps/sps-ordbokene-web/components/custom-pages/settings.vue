<script setup>
import {useSettingsStore } from '~/stores/settingsStore'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
const settings = useSettingsStore()

const resetSettings = (settings) => {
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
    <button class="btn btn-primary" @click="resetSettings(settings); startAnimation()">
      <Icon :name="resetAnimation ? 'bi:trash' : 'bi:trash-fill'" class="mr-3 mb-1 text-primary" />
      <span>{{$t(resetAnimation ? 'settings.reset_done' : 'settings.reset')}}</span>
    </button>
  </div>
</main>
</template>
