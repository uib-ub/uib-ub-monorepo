<template>
  <HoverCard>
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

      {{ contentId }}
    </HoverCardContent>
  </HoverCard>
</template>

<script setup lang="ts">
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";

defineProps<{
  label: string;
  title: string;
  contentId: string; }>();
</script>
