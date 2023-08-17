<template>
  <div>
    <input
      :model-value="modelValue"
      type="checkbox"
      :value="label"
      @change="onChange"
    />
    <Icon
      name="mdi:checkbox-intermediate"
      size="1.3em"
      class="text-tpblue-400"
      aria-hidden="true"
    /><button class="pl-1.5">{{ lazyLocales[locale][label] || label }}</button>
  </div>
</template>

<script setup lang="ts">
const locale = useLocale();
const lazyLocales = useLazyLocales();

const props = defineProps({
  modelValue: { type: Array, required: true },
  label: { type: String, required: true },
  activeParents: { type: Array, default: [] },
  deactivatedParents: { type: Array, default: [] },
});

const emit = defineEmits(["update:modelValue"]);

function onChange(event) {
  const eventValue = event.target.value;
  const newValue = [...props.modelValue];
  const index = newValue.indexOf(eventValue);
  if (index > -1) {
    newValue.splice(index, 1);
  } else {
    newValue.push(eventValue);
  }
  emit("update:modelValue", newValue);
}
</script>
