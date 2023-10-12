<template>
    <tr>
      <td class="notranslate infl-cell"
          v-for="([[rowspan,rowindex,forms], headers], index) in rows"
          :key="index"
          :rowspan="rowspan"
          :index="rowindex"
          :headers="headers"
          v-bind:class="{hilite: $parent.highlighted(rowindex, lemmaId)}"
            @mouseover="$emit('hilite', rowindex, lemmaId)"
            @mouseleave="$emit('unhilite')">
        <span class='comma'
              v-for="form in forms"
              :key="form">
          {{form}}</span>
      </td>
      
    </tr>
    </template>
    
    <script>
    
    
    import { inflectedForm
           } from './mixins/ordbankUtils.js' 
    
    export default {
        name: 'inflectionRowAdjDeg',
        props: ['paradigm','lemmaId'],
        data: function () {
            return {
                rows: [ this.inflForm(['Cmp'],'Deg Cmp'),
                        this.inflForm(['Sup','Ind'], 'Deg SupInd'),
                        this.inflForm(['Sup','Def'], 'Deg SupDef')
                      ].filter(r => r && r[0])
                   }
        },
        methods: {
            inflForm: function (tagList, headers) {
                return [inflectedForm(this.paradigm, tagList), headers]
            }
        

        }
    }
    </script>