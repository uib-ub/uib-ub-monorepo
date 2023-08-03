<template>
    <tr>
      <td class="notranslate infl-cell"
          v-for="([prefix, [rowspan,rowindex,forms], suffix, headers], index) in rows"
          :key="index"
          :rowspan="rowspan"
          :index="rowindex"
          :headers="headers"
          v-bind:class="{hilite: $parent.highlighted(rowindex, lemmaId)}"
            v-on:mouseover="$emit('hilite', rowindex, lemmaId)"
            v-on:mouseleave="$emit('unhilite')">
        <span class='comma'
              v-for="(form, index) in forms"
              :key="index">
          <em v-if="prefix" class="context">{{prefix}}</em>
          {{form}}
          <em v-if="suffix" class="context nobr">{{suffix}}</em>
        </span>
      </td>
      
    </tr>
    </template>
    
    <script>
    
    // needed for hiliting
    
    
    import { inflectedForm, indefArticle
           } from './mixins/ordbankUtils.js' 
    
    export default {
        name: 'inflectionRowParticiple',
        props: ['paradigm','hasPerfPart','language','part','lemmaId', 'context'],
        data: function () {
            return { rows: [
                this.hasPerfPart && this.part!=4 ?
                    this.inflForm(['Adj','Masc/Fem'],
                                  this.context ? indefArticle(['Masc/Fem'], this.language) : null,
                                  this.context ? '+ substantiv' : null,
                                  'PerfPart Masc') : null,
                this.hasPerfPart && this.part!=4 ?
                    this.inflForm(['Adj','Neuter'],
                                  this.context ? indefArticle(['Neuter'], this.language) : null,
                                  this.context ? '+ substantiv' : null,
                                  'PerfPart Neuter') : null,
                this.hasPerfPart && this.part!=4 ?
                    this.inflForm(['Adj','Def'],
                                  this.context ? 'den/det' : null,
                                  this.context ? '+ substantiv' : null,
                                  'PerfPart Def') : null,
                this.hasPerfPart && this.part!=3 ?
                    this.inflForm(['Adj','Plur'],
                                  null,
                                  this.context ? '+ substantiv' : null,
                                  'PerfPart Plur') : null,
                this.part!=3 ? this.inflForm(['Adj','<PresPart>'],
                                             null,
                                             null,
                                             'PresPart') : null
            ].filter(r => r) }
        },
        methods: {
            inflForm: function (tagList,prefix,suffix,headers) {
                let forms = inflectedForm(this.paradigm, tagList)
                if (forms) {
                    return [prefix, forms, suffix, headers]
                } else {
                    return null
                }
            }    }
    }
    
    </script>
    