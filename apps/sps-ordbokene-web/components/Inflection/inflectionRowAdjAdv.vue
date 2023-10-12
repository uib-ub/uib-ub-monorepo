<template>
    <tr>
      <td class="notranslate infl-cell"
          v-for="([rowspan,rowindex,forms], index) in rows"
          :key="index"
          :rowspan="rowspan"
          :index="rowindex"
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
        name: 'inflectionRowAdjAdv',
        props: ['paradigm','lemmaId'],
        data: function () {
            return {
                rows: [ this.inflForm(['Pos']),
                        this.inflForm(['Cmp']),
                        this.inflForm(['Sup'])
                      ].filter(r => r)
                   }
        },
        methods: {
            inflForm: function (tagList,exclTagList) {
                return inflectedForm(this.paradigm, tagList, exclTagList)
            }    }
    }
    </script>