<template>
  <div class="space-y-2">
    <h2 class="mt-6 mb-2 text-xl font-semibold">
      Termbase status varsler
    </h2>
    <div class="space-y-5">
      <template
        v-for="tb in termbases"
        :key="tb.id"
      >
        <section v-if="tb.blocker.status !== 'ok'">
          <h3
            v-if="!inline && termbases.length > 1"
            class="text-lg mb-1"
          >
            {{ tb.label }}: {{ tb.status }}
          </h3>
          <div class="space-y-2">
            <div v-if="Object.keys(tb.blocker.hard).length > 0">
              <h4
                v-if="tb.status === '5. publisert'"
                class="font-semibold"
              >
                <Icon
                  name="fa6-solid:triangle-exclamation"
                  size="1.1em"
                  class="-mb-0.5 mr-2"
                  :class="appConfig.ui.color.status.error.class"
                />Error: Problemer i den publiserte termbasen må løses
              </h4>
              <h4
                v-else
                class="font-semibold"
              >
                <Icon
                  name="mdi:stop"
                  size="1.6em"
                  class="-mb-2 mr-2"
                  :class="appConfig.ui.color.status.error.class"
                />Absolutt blokkering: Termbasen kan ikke flyttes til neste status
              </h4>
              <ul class="list-disc ml-4">
                <li
                  v-for="[key, value] in Object.entries(tb.blocker.hard)"
                  :key="key"
                >
                  <div class="flex">
                    <div class="w-[8em]">
                      {{ key }}
                    </div>
                    {{ value }}
                  </div>
                </li>
              </ul>
            </div>
            <div v-if="Object.keys(tb.blocker.soft).length > 0">
              <h4
                v-if="tb.status === '5. publisert'"
                class="font-semibold"
              >
                <Icon
                  name="fa6-solid:triangle-exclamation"
                  size="1.1em"
                  class="-mb-0.5"
                  :class="appConfig.ui.color.status.warning.class"
                /> Advarsel: Problemer i den publiserte termbasen bør løses
              </h4>
              <h4
                v-else
                class="font-semibold"
              >
                <Icon
                  name="mdi:pause"
                  size="1.6em"
                  class="-mb-2 mr-2"
                  :class="appConfig.ui.color.status.warning.class"
                /> Myk blokkering: Termbasen bør ikke flyttes til neste status
              </h4>
              <ul class="list-disc ml-4">
                <li
                  v-for="[key, value] in Object.entries(tb.blocker.soft)"
                  :key="key"
                >
                  <div class="flex">
                    <div class="w-[8em]">
                      {{ key }}
                    </div>
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
const appConfig = useAppConfig();

defineProps({
  termbases: { type: Object, required: true },
  inline: { type: Boolean, default: false },
});
</script>
