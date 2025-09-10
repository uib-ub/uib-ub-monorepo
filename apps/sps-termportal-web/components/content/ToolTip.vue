<template>
  <HoverCard v-if="definition">
    <HoverCardTrigger
      class="underline hover:decoration-2"
      tabindex="0"
    >
      {{ label }}
    </HoverCardTrigger>
    <HoverCardContent>
      <div class="font-semibold mb-2">
        {{ title }}
      </div>
      <span v-if="definition">{{ definition }} </span>
    </HoverCardContent>
  </HoverCard>
  <span v-else>{{ label }}</span>
</template>

<script setup lang="ts">
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";

const locale = useLocale();
const appConfig = useAppConfig();

const props = defineProps<{
  label: string;
  title: string;
  contentId: string; }>();

const definition = computed(() => appConfig.tmp?.[props.contentId]?.[locale.value]);
</script>
