'use client'

import { CSSProperties } from "react";
import { useNotificationStore } from "@/state/zustand/notification-store";
import { ErrorSnackbar, InfoSnackbar, TooltipSnackbar, WarningSnackbar } from "./snackbar";

type NotificationStackProps = {
  className?: string;
  style?: CSSProperties;
};

export default function NotificationStack({ className, style }: NotificationStackProps) {
  const notifications = useNotificationStore((s) => s.notifications);
  const topItem = notifications[0];
  const showBackdrop = notifications.length > 1;

  if (!topItem) {
    return null;
  }

  const snackbarProps = {
    className: showBackdrop ? "relative translate-x-1 translate-y-1" : "relative",
    id: topItem.id,
    message: topItem.message,
  };
  const snackbarPropsWithPermanentDismiss = {
    ...snackbarProps,
    persistentDismiss: topItem.permanentDismiss ?? false,
  };

  return (
    <div className={className} style={style}>
      <div className="relative w-fit">
        {showBackdrop ? (
          <div
            aria-hidden="true"
            className="absolute inset-0 rounded-md bg-neutral-400"
          />
        ) : null}
        {topItem.variant === "warning" ? <WarningSnackbar {...snackbarPropsWithPermanentDismiss} /> : null}
        {topItem.variant === "error" ? <ErrorSnackbar {...snackbarProps} /> : null}
        {topItem.variant === "tooltip" ? <TooltipSnackbar {...snackbarProps} /> : null}
        {!topItem.variant || topItem.variant === "info" ? <InfoSnackbar {...snackbarPropsWithPermanentDismiss} /> : null}
      </div>
    </div>
  );
}
