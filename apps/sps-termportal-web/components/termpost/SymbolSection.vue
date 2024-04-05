<template>
  <div>
    <h3 class="pb-1 text-xl">
      <AppLink to="#symbol"> {{ $t("id.symbol") }}</AppLink>
    </h3>
    <TermSection>
      <TermProp label="">
        <TermDescription :data="displayInfo?.symbol" prop="nonLingusticLabel" />
      </TermProp>
    </TermSection>
  </div>
</template>

<script setup lang="ts">
const props = defineProps({ displayInfo: { type: Object, required: true } });
</script>
