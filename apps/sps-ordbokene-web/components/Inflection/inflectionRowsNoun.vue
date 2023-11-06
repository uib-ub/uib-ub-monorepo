<template>
    <tr :id="'lemma'+lemma.id" class="infl-row" >
      <template v-if="tags.tags">
        <th :id="tags.tags.map(tag => tag + lemma.id).join('')"
            class="infl-label xs"
            :tag="langTag"
            scope="row">
          {{tags.label? $t('infl_table_tags.'+tags.label, 1, {locale}) : '' }}
        </th>
        <template v-for="([prefix, [rowspan,rowindex,forms], headers], index) in cells" :key="index">
          <th v-if="tags.tags[0]=='_gender'"
              :id="forms[0]"
              class="infl-label"
              scope="row"
              :colspan="rowspan"
              :class="{hilite: $parent.highlighted(rowindex, lemma.id)}"
              @mouseover="$emit('hilite', rowindex, lemma.id)"
              @mouseleave="$emit('unhilite')">
            <span v-html="formattedForm(tags,forms[0])" :lang="langTag"/>
          </th>
          <td v-else
              class="notranslate nfl-cell"
              :colspan="rowspan"
              :headers="headers"
              :class="{hilite: $parent.highlighted(rowindex, lemma.id)}"
              @mouseover="$emit('hilite', rowindex, lemma.id)"
              @mouseleave="$emit('unhilite')">
            <span v-for="(form, index1) in forms"
                  :key="index1"
                  class='comma'>
              <em v-if="prefix" class="context">{{prefix}}&nbsp;</em>
              <span v-html="formattedForm(tags,form)" :lang="langTag"/>
            </span>
          </td>
        </template>
      </template>
      <template v-if="tags.title">
        <th :id="tags.title"
            class="infl-group"
            :colspan="paradigms.length+1"
            :tag="langTag"
            scope="col">
          {{tags.title? $t('infl_table_tags.'+tags.title, 1, {locale}) : '' }}
        </th>
      </template>
    </tr>
</template>
    
<script>



import { inflectedForm, markdownToHTML
        } from './mixins/ordbankUtils.js' 

export default {
    name: 'inflectionRowsNoun',
    props: ['paradigms','tags','locale', 'langTag', 'lemma', 'showGender'],
    emits: ['hilite', 'unhilite'],
    data: function () {
        return {
            cells: !this.tags.title ?
                this.paradigms.map(
                    p => this.tags.gender ?
                        this.genderCat(p) :
                        this.inflForm(p,
                                        this.tags.tags,
                                        this.tags.indefArt ? this.indefArticle(p) : null) 
                ).filter(r => r) :
            []
        }
    },
    methods: {
        isMasc: function (paradigm) {
            return paradigm.tags.find(tag => tag === 'Masc')
        },
        isFem: function (paradigm) {
            return paradigm.tags.find(tag => tag === 'Fem')
        },
        isNeuter: function (paradigm) {
            return paradigm.tags.find(tag => tag === 'Neuter')
        },
        indefArticle: function (paradigm) {
            if (this.isMasc(paradigm) && this.dict === 'bm') {
                return "en"
            } else if (this.isMasc(paradigm) && this.dict === 'nn') {
                return "ein"
            } else if (this.isFem(paradigm) && this.dict === 'bm') {
                return "ei/en"
            } else if (this.isFem(paradigm) && this.dict === 'nn') {
                return "ei"
            } else if (this.isNeuter(paradigm) && this.dict === 'bm') {
                return "et"
            } else if (this.isNeuter(paradigm) && this.dict === 'nn') {
                return "eit"
            }
        },
        genderCat: function (paradigm) {
            if (this.isMasc(paradigm)) {
                return this.$t('infl_table_tags.Masc', 1, {locale: this.locale})
            } else if (this.isFem(paradigm)) {
                return this.$t('infl_table_tags.Fem', 1, {locale: this.locale})
            } else if (this.isNeuter(paradigm)) {
                return this.$t('infl_table_tags.Neuter', 1, {locale: this.locale})
            }
        },
        inflForm: function (paradigm, tagList, prefix) {
            const forms = inflectedForm(paradigm, tagList, [])
            if (!forms) {
                return null
            } else {
                const gender = (this.showGender && forms[3]) ? forms[3].join(' ') + ' ' : ''
                return [prefix, forms, gender + tagList[0] +  ' ' + tagList[0] + tagList[1]]
            }
        },
        formattedForm: function (tags,form) {
            return tags.tags[0] === '_gender' ? this.$t('infl_table_tags.' + form) : markdownToHTML(form)
        }
    }
}
</script>