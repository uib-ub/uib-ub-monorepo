<template>
  <tr class="infl-row">
    <template v-if="tags.tags">
      <th class="infl-label xs"
          :id="tags.label"
          scope="row">
        {{tagToName(tags.label)}}
      </th>
      <td class="notranslate infl-cell"
          v-for="([prefix, [rowspan,rowindex,forms], suffix], index) in cells"
          :key="index"
          :colspan="rowspan"
          :index="rowindex"
          :headers="(tags.block || '') + ' ' + (tags.label || '')"
          v-bind:class="{hilite: $parent.highlighted(rowindex, lemmaId)}"
          v-on:mouseover="$emit('hilite', rowindex, lemmaId)"
          v-on:mouseleave="$emit('unhilite')">
        <span class='comma'
              v-for="(form, index) in forms"
              :key="index">
          <em v-if="prefix" class="context">{{prefix}}</em>
          {{form}}<span v-if="suffix!='!'"> </span><em v-if="suffix" class="context nobr">{{suffix}}</em>
        </span>
      </td>
    </template>
    <template v-else>
      <th class="infl-group"
          :id="tags.title"
          scope="col"
          :colspan="paradigms.length+1">
        {{tagToName(tags.title)}}
      </th>
    </template>
  </tr>
  </template>
  
  <script>
  
  
  
  import { inflectedForm, tagToName
         } from './mixins/ordbankUtils.js' 
  
  export default {
      name: 'inflectionRowsVerb',
      props: ['paradigms','tags','language','lemmaId'],
      data: function () {
          return {
              cells: !this.tags.title ?
                  this.paradigms.map(
                      p => this.inflForm(p,
                                         this.tags.tags,
                                         this.tags.excl,
                                         this.tags.prefix,
                                         this.tags.suffix))
                  .filter(r => r) :
              []
          }
      },
      computed: {
      },
      methods: {
          inflForm: function (paradigm, tagList, exclTagList, prefix, suffix) {
              let forms = inflectedForm(paradigm, tagList, exclTagList)
              if (forms) {
                  return [prefix, forms, suffix]
              } else {
                  return null
              }
          },
          tagToName: function (tag) {
              return tagToName(tag, this.language) || tag
          }
      }
  }
  </script>