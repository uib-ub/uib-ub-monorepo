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
  /** When true, show only the front snackbar (no layered shells / offset transforms). */
  disableStackEffect?: boolean;
};

export default function NotificationStack({ className, style, disableStackEffect }: NotificationStackProps) {
  const notifications = useNotificationStore((s) => s.notifications);
  const topItem = notifications[0];
  const stackDepth = disableStackEffect ? 0 : notifications.length - 1;

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
    title: topItem.title,
    link: topItem.link,
  };
  const snackbarPropsWithPermanentDismiss = {
    ...snackbarProps,
    persistentDismiss: topItem.permanentDismiss ?? false,
  };

  return (
    <div className={className} style={style} data-notification-stack="true">
      <div className="relative w-full max-w-full xl:max-w-[calc(100%-2rem)]">
        {!disableStackEffect && Array.from({ length: stackDepth }, (_, i) => {
          const indexInStack = notifications.length - 1 - i;
          const item = notifications[indexInStack]!;
          const step = notifications.length - 1 - indexInStack;
          const offsetPx = step * STACK_OFFSET_PX;
          return (
            <div
              key={item.id}
              aria-hidden="true"
              className={cn(
                "pointer-events-none absolute inset-0 z-0 rounded-none lg:rounded-md min-h-14 lg:min-h-12 shadow-sm",
                variantStackShellClass(item.variant)
              )}
              style={{
                transform: `translate(${offsetPx}px, ${offsetPx}px)`,
              }}
            />
          );
        })}
        {topItem.variant === "warning" ? (
          <WarningSnackbar {...snackbarPropsWithPermanentDismiss}>{topItem.details}</WarningSnackbar>
        ) : null}
        {topItem.variant === "error" ? (
          <ErrorSnackbar {...snackbarProps}>{topItem.details}</ErrorSnackbar>
        ) : null}
        {topItem.variant === "tooltip" ? (
          <TooltipSnackbar {...snackbarPropsWithPermanentDismiss}>{topItem.details}</TooltipSnackbar>
        ) : null}
        {!topItem.variant || topItem.variant === "info" ? (
          <InfoSnackbar {...snackbarPropsWithPermanentDismiss}>{topItem.details}</InfoSnackbar>
        ) : null}
      </div>
    </div>
  );
}
