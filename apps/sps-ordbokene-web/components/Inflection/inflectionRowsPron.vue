<template>
    <tr class="infl-row">
      <template v-if="tags.tags">
        <th v-if="tags.label"
            class="infl-label xs"
            :id="tags.label"
            scope="row">
          {{tagToName(tags.label)}}
        </th>
        <td class="notranslate infl-cell"
            v-for="([rowspan,rowindex,forms], index) in cells"
            :key="index"
            :colspan="rowspan"
            v-bind:class="{hilite: $parent.highlighted(rowindex, lemmaId)}"
            v-on:mouseover="$emit('hilite', rowindex, lemmaId)"
            v-on:mouseleave="$emit('unhilite')">
          <span class='comma'
                v-for="(form, index) in forms"
                :key="index">
            {{form}}</span>
        </td>
      </template>
    </tr>
    </template>
    
    <script>
    
    
    
    import { inflectedForm, tagToName
           } from './mixins/ordbankUtils.js' 
    
    export default {
        name: 'inflectionRowsPron',
        props: ['paradigms','lemma','tags','language','lemmaId'],
        data: function () {
            return {
                cells: this.paradigms.map(p => this.inflForm(p, this.tags.tags))
            }
        },
        computed: {
        },
        methods: {
            inflForm: function (paradigm, tagList) {
                let forms = inflectedForm(paradigm, tagList, [])
                return forms || [1,0,[this.lemma]] // workaround for missing inflection
            },
            tagToName: function (tag) {
                return tagToName(tag, this.language)
            }
        }
    }
    </script>