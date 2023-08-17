<template>
  <div class="mb-2">
    <div class="article-title" v-for="(lemma_group, i) in lemma_groups" :key="i">
    <h3>
                
   <span v-for="(lemma, index) in lemma_group.lemmas"
          :key="index">
          <DefElement v-if="lemma.annotated_lemma" :body="lemma.annotated_lemma" tag="span" :content_locale="content_locale"/><span v-else>{{lemma.lemma}}</span>
         <span v-if="lemma.hgno"
                   :title="$t('accessibility.homograph')+parseInt(lemma.hgno)"
                   class="hgno"><span class="sr-only">{{$t('accessibility.homograph') + parseInt(lemma.hgno)}}</span><span aria-hidden="true">{{" "+roman_hgno(lemma)}}</span></span>
                   <span
                   class="title_comma"
                   v-if="lemma_group.lemmas[1] && index < lemma_group.lemmas.length-1">{{", "}}
                  </span>
    </span>
</h3>
<h3 v-if="secondary_header_text">{{secondary_header_text}}</h3>  
    <span v-if="lemma_group.description" class="subheader">
    <span class="header_group_list">{{lemma_group.description}}</span>
          {{lemma_group.pos_group}}
    <span v-if="settings.inflectionNo" class="inflection_classes">{{lemma_group.inflection_classes}}</span>

    </span>
  </div>
  </div>
</template>


<script setup>
import {useSettingsStore } from '~/stores/settingsStore'
const settings = useSettingsStore()

const props = defineProps({
    lemma_groups: Array,
    secondary_header_text: String,
    dict: String,
    article_id: Number,
    title_id: String,
    content_locale: String
})

</script>

<style scoped>
h3 {
    font-family: Inria Serif;
  @apply text-primary;
  font-weight:600;
  margin-bottom: 0rem;

}

.header_group_list {
    font-variant: all-small-caps;
    font-style: normal;
    font-size: 1.5rem;
}

.subheader {
  font-size: 1.17rem;

}

.hgno {
  color: rgba(0,0,0,.6) !important;
  font-family: unset;
  font-size: 1rem;
  cursor: help;
}

div>.article-title:not(:first-child) {
  margin-top: 1rem;
}

div>.article-title:not(:only-child) h3 {
  margin-bottom: 0rem;
}

.article-title>h3:not(:only-child) {
  margin-bottom: 0.5rem;
}

</style>
