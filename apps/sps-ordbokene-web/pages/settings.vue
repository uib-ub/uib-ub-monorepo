<script setup>
import {useSettingsStore } from '~/stores/settingsStore'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
const settings = useSettingsStore()

const resetSettings = (settings) => {
    settings.$patch({
      submitSelect: false, 
      inflectionExpanded: false, 
      inflectionTableContext: false, 
      inflectionNo: false,

    })
};

useHead({
title: t('settings.title')
})

</script>

<template>
<main id="main" tabindex="-1" class="secondary-page flex flex-col gap-2">
  <h2>{{$t('settings.title')}}</h2>
  <FormCheckbox labelId="toggle-simple-list-view" v-model="settings.$state.simpleListView" :checked="settings.simpleListView">
      {{$t('settings.simple_search_list')}}
    </FormCheckbox>
    <FormCheckbox labelId="toggle-auto-select" v-model="settings.$state.autoSelect" :checked="settings.autoSelect">
      {{$t('settings.auto_select')}}
    </FormCheckbox>
  <FormCheckbox v-if="false" labelId="toggle-submit-select" v-model="settings.$state.submitSelect" :checked="settings.submitSelect">
      {{$t('settings.submit_select')}}
    </FormCheckbox>
<FormCheckbox labelId="toggle-inflection-expanded" v-model="settings.$state.inflectionExpanded" :checked="settings.inflectionExpanded">
      {{$t('settings.inflection_expanded')}}
    </FormCheckbox>
    <FormCheckbox labelId="toggle-inflection-no" v-model="settings.$state.inflectionNo" :checked="settings.inflectionNo">
      {{$t('settings.inflection_no')}}
    </FormCheckbox>
    <FormCheckbox labelId="toggle-inflection-context" v-model="settings.$state.inflectionTableContext" :checked="settings.inflectionTableContext">
      {{$t('settings.inflection_table_context')}}
    </FormCheckbox>



<div class="mt-4">
  <button class="btn btn-primary" @click="resetSettings(settings)">
    <Icon name="bi:trash-fill" class="mr-3 mb-1 text-primary"/><span>{{$t('settings.reset')}}</span>
  </button>
</div>
</main>
</template>

<style scoped>


</style>
