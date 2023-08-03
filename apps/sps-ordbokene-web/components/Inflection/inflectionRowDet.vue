<template>
    <tr>
      <td class="notranslate infl-cell"
          v-for="([[rowspan,rowindex,forms],headers], index) in cells"
          :key="index"
          :rowspan="rowspan"
          :index="rowindex"
          :headers="headers"
          v-bind:class="{hilite: $parent.highlighted(rowindex, lemmaId)}"
            v-on:mouseover="$emit('hilite', rowindex, lemmaId)"
            v-on:mouseleave="$emit('unhilite')">
        <span class='comma'
              v-for="(form, i) in forms"
              :key="i">
        {{form}}</span>
      </td>
    </tr>
    </template>
    
    <script>
    
    
    
    import { inflectedForm, tagToName
           } from './mixins/ordbankUtils.js' 
    
    export default {
        name: 'inflectionRowPron',
        props: ['paradigm','language','lemmaId'],
        data: function () {
            return {
                cells: [ this.inflForm(['Masc'],'Sing Masc'),
                         this.inflForm(['Fem'],'Sing Frem'),
                         this.inflForm(['Neuter'],'Sing Neuter'),
                         this.inflForm(['Def'],'Sing Def'),
                         this.inflForm([ 'Plur'],'Plur')
                       ].filter(r => r[0])
            }
        },
        computed: {
        },
        methods: {
            inflForm: function (tagList, headers) {
                return [inflectedForm(this.paradigm, tagList), headers]
            },
            tagToName: function (tag) {
                return tagToName(tag, this.language)
            }    }
    }
    </script>
    