<template>
  <div>
    <h3 class="pb-1 text-xl">
      <AppLink to="#symbol"> {{ $t("id.symbol") }}</AppLink>
    </h3>
    <TermpostTermSection>
      <TermpostTermProp label="">
        <TermpostTermDescription
          :data="displayInfo?.symbol"
          prop="nonLingusticLabel"
        />
      </TermpostTermProp>
    </TermpostTermSection>
  </div>
</template>

<script setup lang="ts">
const props = defineProps({ displayInfo: { type: Object, required: true } });
</script>
