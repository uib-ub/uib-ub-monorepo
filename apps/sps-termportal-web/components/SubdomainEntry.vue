<template>
  <div class="group flex">
    <input
      :id="label"
      :model-value="modelValue[label]"
      class="peer cursor-pointer outline-none"
      type="checkbox"
      :value="label"
      @change="onChange"
    />
    <label
      :for="label"
      class="tp-transition-shadow flex cursor-pointer rounded-[7px] border border-transparent px-2 py-1 group-hover:border-tpblue-300 peer-focus:border-tpblue-300 peer-focus:shadow-tphalo"
    >
      <div class="-mt-[1px]">
        <Icon
          v-if="
            modelValue[label] === true ||
            (modelValue[label] === undefined &&
              (parents[0] === true ||
                (parents[0] === undefined && parents[1] === true)))
          "
          name="mdi:checkbox-marked-outline"
          size="1.2em"
          class="text-tpblue-400 mb-0.5"
          aria-hidden="true"
        />
        <Icon
          v-else
          name="mdi:checkbox-blank-outline"
          size="1.2em"
          class="text-tpblue-400 mb-0.5"
          aria-hidden="true"
        />
      </div>
      <div class="pl-1.5">{{ lalof(label) }}</div>
    </label>
  </div>
</template>

<script setup lang="ts">
const bootstrapData = useBootstrapData();

const props = defineProps({
  modelValue: { type: Object, required: true },
  label: { type: String, required: true },
  parents: { type: Array, required: true },
  topdomain: { type: String, default: null },
});

const emit = defineEmits(["update:modelValue"]);

function onChange(event) {
  const domain = event.target.value;
  const newObject = { ...props.modelValue };

  // applies to second level domains
  if (props.topdomain) {
    const subdomains = getAllKeys(
      bootstrapData.value.domain[props.topdomain].subdomains[domain]
    ).filter((key) => key.startsWith("DOMENE"));
    subdomains.forEach((subdomain) => {
      delete newObject[subdomain];
    });

    // second level domains inherit 'true' from active topdomain
    // the only necessary setting is thus the deactivation of second level domains
    if (props.modelValue[domain] === false) {
      delete newObject[domain];
    } else {
      newObject[domain] = false;
    }
  }
  // applies to third level domains they inherit from topdomain and second level domains
  // they don't have subdomains
  // when parent is undefined, it domain inherits 'true' from topdomain
  else if (
    props.parents[0] ||
    props.parents[0] === undefined ||
    props.parents[0] === null
  ) {
    if (props.modelValue[domain] === false) {
      delete newObject[domain];
    } else {
      newObject[domain] = false;
    }
    // inherits false from parent
    // delete key if current value is true
  } else if (props.modelValue[domain]) {
    delete newObject[domain];
    // current value is false or undefined, set to true
  } else {
    newObject[domain] = true;
  }

  emit("update:modelValue", newObject);
}
</script>

<style scoped>
input[type="checkbox"] {
  -webkit-appearance: none;
  appearance: none;
}
</style>
