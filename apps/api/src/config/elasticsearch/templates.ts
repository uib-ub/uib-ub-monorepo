import { mappings } from './mappings';
import { settings } from './settings';

export const choTemplate = {
  "name": "cho-demo-settings",
  "index_patterns": ["search-chc-*"],
  "template": {
    "settings": {
      "index.default_pipeline": "cho-demo-pipeline",
      ...settings.chc.settings
    },
    "mappings": {
      "_source": {
        "enabled": true
      },
      "properties": mappings.chc.properties
    },
  },
  "priority": 500,
  "version": 3,
  "_meta": {
    "description": "my custom"
  }
}

export const skaTemplate = {
  "name": "ska-demo-settings",
  "index_patterns": ["search-ska-*"],
  "template": {
    "settings": {
      "index.default_pipeline": "cho-demo-pipeline",
      ...settings.ska.settings
    },
    "mappings": {
      "_source": {
        "enabled": true
      },
      "properties": mappings.ska.properties
    },
  },
  "priority": 500,
  "version": 3,
  "_meta": {
    "description": "my custom"
  }
}

export const wabTemplate = {
  "name": "wab-demo-settings",
  "index_patterns": ["search-wab-*"],
  "template": {
    "settings": {
      "index.default_pipeline": "cho-demo-pipeline",
      ...settings.wab.settings
    },
    "mappings": {
      "_source": {
        "enabled": true
      },
      "properties": mappings.wab.properties
    },
  },
  "priority": 500,
  "version": 3,
  "_meta": {
    "description": "my custom"
  }
}

/* 
Can be used to start with some already created templates
"composed_of": ["component_template1", "runtime_component_template"], 

Add aliases, but i dont know what it means
"aliases": {
  "mydata": { }
}
*/