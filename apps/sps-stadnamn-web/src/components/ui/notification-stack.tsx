'use client'

import { CSSProperties } from "react";
import type { NotificationItem } from "@/state/zustand/notification-store";
import { useNotificationStore } from "@/state/zustand/notification-store";
import { cn } from "@/lib/utils";
import { ErrorSnackbar, InfoSnackbar, TooltipSnackbar, WarningSnackbar } from "./snackbar";

const STACK_OFFSET_PX = 4;

/** One palette step darker than each snackbar background (see tailwind.config.ts). */
function variantStackShellClass(variant?: NotificationItem["variant"]) {
  switch (variant) {
    case "warning":
      return "bg-accent-900 border border-accent-950 box-border";
    case "error":
      return "bg-primary-900 border border-primary-950 box-border";
    case "tooltip":
      return "bg-neutral-200 border border-neutral-300 box-border";
    default:
      return "bg-neutral-900 border border-neutral-950 box-border";
  }
}

type NotificationStackProps = {
  className?: string;
  style?: CSSProperties;
};

export default function NotificationStack({ className, style }: NotificationStackProps) {
  const notifications = useNotificationStore((s) => s.notifications);
  const topItem = notifications[0];
  const stackDepth = notifications.length - 1;

  if (!topItem) {
    return null;
  }

  const stackOffsetPx = stackDepth * STACK_OFFSET_PX;
  const stackTransform: CSSProperties | undefined =
    stackDepth > 0 ? { transform: `translate(${stackOffsetPx}px, ${stackOffsetPx}px)` } : undefined;

  const snackbarProps = {
    className: cn("relative max-w-full", stackDepth > 0 && "z-10"),
    style: stackTransform,
    id: topItem.id,
    message: topItem.message,
  };
  const snackbarPropsWithPermanentDismiss = {
    ...snackbarProps,
    persistentDismiss: topItem.permanentDismiss ?? false,
  };

  return (
    <div className={className} style={style}>
      <div className="relative w-full max-w-[80%]">
        {Array.from({ length: stackDepth }, (_, i) => {
          const indexInStack = notifications.length - 1 - i;
          const item = notifications[indexInStack]!;
          const step = notifications.length - 1 - indexInStack;
          const offsetPx = step * STACK_OFFSET_PX;
          return (
            <div
              key={item.id}
              aria-hidden="true"
              className={cn(
                "pointer-events-none absolute inset-0 z-0 rounded-md min-h-12 shadow-md",
                variantStackShellClass(item.variant)
              )}
              style={{
                transform: `translate(${offsetPx}px, ${offsetPx}px)`,
              }}
            />
          );
        })}
        {topItem.variant === "warning" ? <WarningSnackbar {...snackbarPropsWithPermanentDismiss} /> : null}
        {topItem.variant === "error" ? <ErrorSnackbar {...snackbarProps} /> : null}
        {topItem.variant === "tooltip" ? <TooltipSnackbar {...snackbarProps} /> : null}
        {!topItem.variant || topItem.variant === "info" ? <InfoSnackbar {...snackbarPropsWithPermanentDismiss} /> : null}
      </div>
    </div>
  );
}
