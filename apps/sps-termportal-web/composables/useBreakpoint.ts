import { useWindowSize } from "@vueuse/core";
import config from "@/tailwind.config";

export const useBreakpoint = (): Ref<string> => {
  if (process.client) {
    const { width } = useWindowSize();
    const breakpoints =
      config?.theme?.screens || ({} as Record<string, string>);
    const sortedBreakpoints = Object.entries(breakpoints).sort(
      (a, b) =>
        parseInt(a[1].replace(/\D/g, "")) + parseInt(b[1].replace(/\D/g, ""))
    );

    const activeBreakpoint = computed(() => {
      const bpMatch = sortedBreakpoints.find(
        ([bp, size]) => width.value >= parseInt(size.replace(/\D/g, ""))
      ) || ["min", 0];

      return bpMatch[0];
    });

    return activeBreakpoint;
  } else {
    return ref("min");
  }
};
