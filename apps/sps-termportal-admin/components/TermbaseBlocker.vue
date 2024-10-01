<template>
  <div class="space-y-2">
    <h2 class="mt-6 mb-2 text-xl font-semibold">
      Termbase Status Blocker and Notifications
    </h2>
    <div class="space-y-5">
      <template v-for="tb in termbases" :key="tb.id">
        <section v-if="tb.blocker.status !== 'ok'">
          <h3 v-if="!inline" class="text-lg mb-1">
            {{ tb.label }}: {{ tb.status }}
          </h3>
          <div class="space-y-2">
            <div v-if="Object.keys(tb.blocker.hard).length > 0">
              <h4 v-if="tb.status === '5. publisert'" class="font-semibold">
                Error
                <Icon
                  name="fa6-solid:triangle-exclamation"
                  size="1.1em"
                  :color="blockerColorMapping.hard.color"
                  class="ml-[6px] mt-[-4px]"
                />
              </h4>
              <h4 v-else class="font-semibold">
                Hard blocker
                <Icon
                  name="mdi:stop"
                  size="1.6em"
                  :color="blockerColorMapping.hard.color"
                />
              </h4>
              <ul class="list-disc ml-4">
                <li
                  v-for="[key, value] in Object.entries(tb.blocker.hard)"
                  :key="key"
                >
                  <div class="flex">
                    <div class="w-[8em]">{{ key }}</div>
                    {{ value }}
                  </div>
                </li>
              </ul>
            </div>
            <div v-if="Object.keys(tb.blocker.soft).length > 0">
              <h4 v-if="tb.status === '5. publisert'" class="font-semibold">
                Warning
                <Icon
                  name="fa6-solid:triangle-exclamation"
                  size="1.1em"
                  :color="blockerColorMapping.soft.color"
                  class="ml-[6px] mt-[-4px]"
                />
              </h4>
              <h4 v-else class="font-semibold">
                Soft blocker
                <Icon
                  name="mdi:pause"
                  size="1.6em"
                  :color="blockerColorMapping.soft.color"
                />
              </h4>
              <ul class="list-disc ml-4">
                <li
                  v-for="[key, value] in Object.entries(tb.blocker.soft)"
                  :key="key"
                >
                  <div class="flex">
                    <div class="w-[8em]">{{ key }}</div>
                    {{ value }}
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </section>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps({
  termbases: { type: Object, required: true },
  inline: { type: Boolean, default: false },
});
</script>
