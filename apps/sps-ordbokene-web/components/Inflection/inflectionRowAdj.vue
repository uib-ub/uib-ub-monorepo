<template>
    <tr>
      <td class="notranslate infl-cell"
          v-for="([[rowspan,rowindex,forms], headers], index) in rows"
          :key="index"
          :headers="headers"
          :rowspan="rowspan"
          v-bind:class="{hilite: $parent.highlighted(rowindex, lemmaId)}"
            v-on:mouseover="$emit('hilite', rowindex, lemmaId)"
            v-on:mouseleave="$emit('unhilite')">
        <span class='comma'
              v-for="form in forms"
              :key="form"
              v-html="formattedForm(form)"/>
      </td>
    </tr>
    </template>
    
    <script>
    
    
    
    import { inflectedForm, markdownToHTML
           } from './mixins/ordbankUtils.js'
    
    export default {
        name: 'inflectionRowAdj',
        props: ['paradigm','hasFem','hasSing','lemmaId'],
        data: function () {
            return {
                rows: [ this.hasSing ? this.inflForm(['Pos',['Masc/Fem','Masc']], 'Sing Masc') : null,
                        this.hasFem && this.hasSing ? this.inflForm(['Pos','Fem'], 'Sing Fem') : null,
                        this.hasSing ? this.inflForm(['Pos','Neuter'], 'Sing Neuter') : null,
                        this.hasSing ? this.inflForm(['Pos','Def','Sing'],'Sing Def') : null,
                        this.inflForm(['Pos','Plur'], 'Plur')
                      ].filter(r => r && r[0])
            }
        },
        methods: {
            inflForm: function (tagList,headers) {
                return [inflectedForm(this.paradigm, tagList, []), headers]
            },
            formattedForm: function (form) {
                return markdownToHTML(form)
            }    }
    }
    </script>
