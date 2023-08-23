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
      class="tp-transition-shadow flex cursor-pointer items-center rounded-[7px] border border-transparent px-2 py-1 group-hover:border-tpblue-300 peer-focus:border-tpblue-300 peer-focus:shadow-tphalo"
    >
      <Icon
        v-if="modelValue[label] === true"
        name="mdi:checkbox-marked-outline"
        size="1.3em"
        class="text-tpblue-400"
        aria-hidden="true"
      />
      <Icon
        v-else-if="modelValue[label] === false"
        name="mdi:checkbox-blank-off-outline"
        size="1.3em"
        class="text-tpblue-400"
        rotate="135"
        aria-hidden="true"
      />
      <Icon
        v-else-if="
          (modelValue[label] === null || true) &&
          (parents[0] === true ||
            ((parents[0] === null || parents[0] === undefined) &&
              parents[1] === true))
        "
        name="mdi:checkbox-intermediate"
        size="1.3em"
        class="text-tpblue-400"
        aria-hidden="true"
      />
      <Icon
        v-else
        name="mdi:checkbox-blank-outline"
        size="1.3em"
        class="text-tpblue-400"
        aria-hidden="true"
      />
      <span class="pl-2">{{ lazyLocales[locale][label] || label }}</span>
    </label>
  </div>
</template>

<script setup lang="ts">
const locale = useLocale();
const lazyLocales = useLazyLocales();

const props = defineProps({
  modelValue: { type: Object, required: true },
  label: { type: String, required: true },
  parents: { type: Array, required: true },
});

const emit = defineEmits(["update:modelValue"]);

function onChange(event) {
  const eventValue = event.target.value;
  const newObject = { ...props.modelValue };
  let newValue;
  switch (props.modelValue[eventValue]) {
    case undefined:
      newValue = false;
      break;
    case null:
      newValue = false;
      break;
    case false:
      newValue = true;
      break;
    case true:
      newValue = null;
      break;
  }
  if (newValue === null) {
    delete newObject[eventValue];
  } else {
    newObject[eventValue] = newValue;
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
