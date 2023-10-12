<template>
<div class="flex mt-4 mb-4 md:mb-0 flex-wrap gap-y-6">
  <client-only>
    <div role="toolbar" class="flex justify-center sm:justify-normal gap-2 flex-wrap gap-y-2">
    <button v-if="showLinkCopy" 
            type="button" 
            class="btn btn-borderless px-3"
            :class="{'hidden xl:block': store.dict == 'bm,nn' && $route.name!= 'article', 'hidden md:block': store.dict != 'bm,nn' && $route.name != 'article'}" 
            @click="copy_link">
      <Icon :name="session.copied_link == create_link() ? 'bi:clipboard-check-fill' : 'bi:clipboard'" class="mr-3 mb-1 text-primary"/>
      <span>{{ session.copied_link == create_link() ? $t('article.link_copied') : $t('article.copy_link', 1, { locale: content_locale }) }} </span>
    </button>
    <button v-if="webShareApiSupported" type="button" class="btn btn-borderless px-3" @click="shareViaWebShare">
        <Icon name="bi:share-fill" class="mr-3 mb-1 text-primary"/>{{$t("article.share", 1, { locale: content_locale})}}
    </button>
      <button type="button" class="btn btn-borderless px-3" :aria-expanded="cite_expanded" :aria-controls="cite_expanded?  'cite-'+article_id : null" @click="cite_expanded = !cite_expanded">
        <Icon name="bi:quote" class="mr-3 mb-1 text-primary"/>{{$t("article.cite", 1, { locale: content_locale})}}
      </button>
      <div v-if="cite_expanded" :id="'cite-'+article_id" class="cite-container p-4 pb-1 pt-2 text-1 basis-full">
        <h4>{{$t('article.cite_title')}}</h4>
        <p>{{$t("article.cite_description[0]", 1, { locale: content_locale})}}<em>{{$t('dicts.'+$props.dict)}}</em>{{$t("article.cite_description[1]", 1, { locale: content_locale})}}</p>

        <blockquote class="break-all sm:break-keep">
          <i18n-t id="citation" keypath="article.citation" tag="div">
            <template #lemma>{{citation.lemma}}</template>>
            <template #link>
              &lt;<a :href="citation.link">{{citation.link}}</a>&gt;
            </template>
            <template #dict>
              <em>{{citation.dict}}</em>
            </template>
            <template #dd>
              {{citation.dd}}
            </template>
            <template #mm>
              {{citation.mm}}
            </template>
            <template #yyyy>
              {{citation.yyyy}}
            </template>
          </i18n-t>

        </blockquote>
          <button type="button" class="mt-4 mb-2 btn btn-borderless" @click="copy_citation">
            <Icon :name="copycitation ? 'bi:file-earmark-plus' : 'bi:file-earmark-check-fill'" class="mb-1 mr-3 text-primary" />{{ citationCopied ? $t('article.citation_copied') : $t('article.copy') }}
          </button>
          <button type="button" class="mt-4 mb-2 btn btn-borderless" @click="download_ris"><Icon name="bi:download" class="mb-1 mr-3 text-primary" /> {{$t("article.download")}}</button>
    </div>
    </div>
  </client-only>

<span v-if="$route.name != 'article'" class="px-4 pt-1 ml-auto">
    <NuxtLink class="whitespace-nowrap"  :to="`/${$i18n.locale}/${dict}/${article_id}`">
       <span>{{$t("article.open", 1, { locale: content_locale})}}</span>
    </NuxtLink>
    </span>
    
</div>
  


</template>

<script setup>

import { useSearchStore } from '~/stores/searchStore'
import { useSessionStore } from '~/stores/sessionStore'
const store = useSearchStore()
const session = useSessionStore()

const props = defineProps({
    lemmas: Array,
    dict: String,
    article_id: Number,
    content_locale: String
})

const cite_expanded = ref(false)
const citationCopied = ref(false);


const create_link = () => {
      return `https://ordbokene.no/${props.dict}/${props.article_id}`
    };

const webShareApiSupported = computed(() => {
  return navigator.share
})

const showLinkCopy = computed(() => {
  return navigator.clipboard
})

const shareViaWebShare = () => {
        navigator.share({
        title: "Ordbøkene.no: " + props.lemmas[0].lemma,
        text: "",
        url: "/" + props.dict + '/' + props.article_id
      })
      };


const copy_link = (event) => {
  const link = create_link();
  navigator.clipboard.writeText(link).then(() => {
    session.copied_link = link;
  }).catch(err => {
    console.log("ERROR COPYING:", err);
  });
};

const get_citation_info = () => {
      const date = new Date();
      const dd = (date.getDate() < 10? '0' : '') + date.getDate()
      const mm = (date.getMonth() < 9? '0' : '') + (date.getMonth()+1)
      const yyyy = date.getFullYear()
      const link = create_link()
      const lemma = props.lemmas[0].lemma
      const dict = {"bm":"Bokmålsordboka", "nn":"Nynorskordboka"}[props.dict]
      return [lemma, dd, mm, yyyy, link, dict]
    }

const citation = computed(() => {
      const [lemma, dd, mm, yyyy, link, dict] = get_citation_info()
      const citation = {lemma, link, dd, mm, yyyy, dict}

      return citation
    })

const download_ris = () => {
      const [lemma, dd, mm, yyyy, link] = get_citation_info()
      const a = document.createElement("a")
      a.style = "display: none"
      a.setAttribute("download", `${lemma}_${props.dict}.ris`)
      const dict = {"bm":"Bokmålsordboka", "nn": "Nynorskordboka"}[props.dict]
      const text = `TY  - DICT\nTI  - ${lemma}\nT2  - ${dict}\nPB  - Språkrådet og Universitetet i Bergen\nUR  - ${link}\nY2  - ${yyyy}/${mm}/${dd}/\nER  - `
      a.setAttribute('href', 'data:application/x-research-info-systems;charset=utf-8,' + encodeURIComponent(text));
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
    }

const copycitation = ref(true);

const copy_citation = () => {
  const citation = document.getElementById("citation").textContent;
  navigator.clipboard.writeText(citation);
  copycitation.value = !copycitation.value;
  citationCopied.value = !citationCopied.value; // Toggle the citationCopied value
};


</script>

<style scoped>

.cite-container {
    border-radius: 1.5rem;
    @apply mt-4  border border-gray shadow-[4.0px_8.0px_8.0px_rgba(0,0,0,0.38)] ;
}


h4 {
  @apply text-primary text-2xl font-semibold;
  font-variant: all-small-caps;
  }

</style>