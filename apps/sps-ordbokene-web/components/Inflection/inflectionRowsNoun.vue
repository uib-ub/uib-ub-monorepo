<template>
    <tr :id="'lemma'+lemma.id" class="infl-row">
      <template v-if="tags.tags">
        <th :id="tags.tags.join('')"
            class="infl-label xs"
            scope="row">
          {{tagToName(tags.label)}}
        </th>
        <template v-for="([prefix, [rowspan,rowindex,forms], headers], index) in cells" :key="index">
          <th v-if="tags.tags[0]=='_gender'"
              :id="forms[0]"
              class="infl-label"
              scope="row"
              :colspan="rowspan"
              :index="rowindex"
              :class="{hilite: $parent.highlighted(rowindex, lemma.id)}"
            @mouseover="$emit('hilite', rowindex, lemma.id)"
            @mouseleave="$emit('unhilite')">
            <span v-html="formattedForm(tags,forms[0])"/>
          </th>
          <td v-else
              class="notranslate nfl-cell"
              :colspan="rowspan"
              :index="rowindex"
              :headers="headers"
              :class="{hilite: $parent.highlighted(rowindex, lemma.id)}"
            @mouseover="$emit('hilite', rowindex, lemma.id)"
            @mouseleave="$emit('unhilite')">
            <span v-for="(form, index2) in forms"
                  :key="index2"
                  class='comma'>
              <em v-if="prefix" class="context">{{prefix}} </em>
              <span v-html="formattedForm(tags,form)"/>
            </span>
          </td>
        </template>
      </template>
      <template v-if="tags.title">
        <th :id="tags.title"
            class="infl-group"
            :colspan="paradigms.length+1"
            scope="col">
          {{tagToName(tags.title)}}
        </th>
      </template>
    </tr>
    
</template>
    
<script>



import { inflectedForm, tagToName, markdownToHTML
        } from './mixins/ordbankUtils.js' 

export default {
    name: 'inflectionRowsNoun',
    props: ['paradigms','tags','language','lemma', 'show-gender'],
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
            if (this.isMasc(paradigm) && this.language ==='nob') {
                return "en"
            } else if (this.isMasc(paradigm) && this.language ==='nno') {
                return "ein"
            } else if (this.isFem(paradigm) && this.language ==='nob') {
                return "ei/en"
            } else if (this.isFem(paradigm) && this.language ==='nno') {
                return "ei"
            } else if (this.isNeuter(paradigm) && this.language ==='nob') {
                return "et"
            } else if (this.isNeuter(paradigm) && this.language ==='nno') {
                return "eit"
            }
        },
        genderCat: function (paradigm) {
            if (this.isMasc(paradigm)) {
                return "hankjønn"
            } else if (this.isFem(paradigm) && this.language ==='nob') {
                return "hunkjønn"
            } else if (this.isFem(paradigm) && this.language ==='nno') {
                return "hokjønn"
            } else if (this.isNeuter(paradigm) && this.language ==='nob') {
                return "intetkjønn"
            } else if (this.isNeuter(paradigm) && this.language ==='nno') {
                return "inkjekjønn"
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
        tagToName: function (tag) {
            return tagToName(tag, this.language)
        },
        formattedForm: function (tags,form) {
            return tags.tags[0] ==='_gender' ? this.tagToName(form) : markdownToHTML(form)
        }
    }
}
</script>