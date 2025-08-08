import "@nuxt/types";
import { Composer } from "vue-i18n";

declare module "#app" {
  interface NuxtApp {
    $i18n: Composer;
  }
}

declare module "@vue/runtime-core" {
  interface ComponentCustomProperties {
    $t: (key: string, ...args: any[]) => string;
    $i18n: Composer;
  }
}

export {};
