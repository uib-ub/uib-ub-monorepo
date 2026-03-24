'use client'

import { CSSProperties, PropsWithChildren, ReactNode, useId, useState } from "react";
import { PiInfoFill, PiQuestionFill, PiWarningFill, PiWarningOctagonFill, PiX } from "react-icons/pi";
import { cn } from "@/lib/utils";
import { useNotificationStore } from "@/state/zustand/notification-store";
import ClickableIcon from "./clickable/clickable-icon";

const snackbarBaseClass =
  "box-border rounded-md min-h-12 px-4 py-3 text-white flex items-start justify-between gap-3 w-full max-w-[80%] relative transition-opacity duration-300 shadow-md border";
/** Border one palette step darker than fill (tailwind.config.ts). */
const infoSnackbarClass = "bg-neutral-900 border-neutral-950 text-white";
const warningSnackbarClass = "bg-accent-900 border-accent-950 text-white";
const tooltipSnackbarClass = "bg-neutral-200 border-neutral-300 text-neutral-900";
const errorSnackbarClass = "bg-primary-900 border-primary-950 text-white";

type SnackbarProps = {
  id?: string;
  persistentDismiss?: boolean;
  children: ReactNode;
  details?: ReactNode;
  className?: string;
  style?: CSSProperties;
  dismissTooltip?: string;
  dismissButtonClassName?: string;
};

export function Snackbar({
  id,
  persistentDismiss = false,
  children,
  details,
  className,
  style,
  dismissTooltip = "Lukk melding",
  dismissButtonClassName = "shrink-0 self-start mt-0.5"
}: SnackbarProps) {
  const [expanded, setExpanded] = useState(false);
  const detailsId = useId();
  const dismissNotification = useNotificationStore((s) => s.dismissNotification);

  return (
    <div role="status" aria-live="polite" className={cn(snackbarBaseClass, className)} style={style}>
      <div className="min-w-0 flex-1">
        <div className="flex items-start gap-2 min-w-0">
          {children}
          {details ? (
            <button
              type="button"
              className="text-sm underline hover:opacity-100 opacity-90 transition-opacity"
              aria-expanded={expanded}
              aria-controls={detailsId}
              onClick={() => setExpanded((prev) => !prev)}
            >
              {expanded ? "Skjul detaljer" : "Vis detaljer"}
            </button>
          ) : null}
        </div>
        {details && expanded ? (
          <div id={detailsId} className="mt-1 text-sm opacity-95">
            {details}
          </div>
        ) : null}
      </div>

      {id ? (
        <ClickableIcon
          className={dismissButtonClassName}
          onClick={() => dismissNotification(id, persistentDismiss)}
          label={dismissTooltip}
        >
          <PiX className="text-2xl align-middle transition-transform" aria-hidden="true" />
        </ClickableIcon>
      ) : null}
    </div>
  );
}

type StyledSnackbarProps = PropsWithChildren<{
  message: ReactNode;
  id?: string;
  persistentDismiss?: boolean;
  className?: string;
  style?: CSSProperties;
}>;
type StaticDismissSnackbarProps = Omit<StyledSnackbarProps, "persistentDismiss">;

export function WarningSnackbar({
  message,
  id,
  persistentDismiss = false,
  className,
  style,
  children
}: StyledSnackbarProps) {
  return (
    <Snackbar
      id={id}
      persistentDismiss={persistentDismiss}
      className={cn(warningSnackbarClass, className)}
      style={style}
      dismissTooltip="Lukk advarsel"
      details={children}
    >
      <span className="text-xl shrink-0 mt-0.5" aria-hidden="true"><PiWarningFill /></span>
      <span className="min-w-0 flex-1 whitespace-normal break-words">{message}</span>
    </Snackbar>
  );
}

export function InfoSnackbar({
  message,
  id,
  persistentDismiss = false,
  className,
  style,
  children
}: StyledSnackbarProps) {
  return (
    <Snackbar
      id={id}
      persistentDismiss={persistentDismiss}
      className={cn(infoSnackbarClass, className)}
      style={style}
      dismissTooltip="Lukk informasjon"
      details={children}
    >
      <span className="text-xl shrink-0 mt-0.5" aria-hidden="true"><PiInfoFill /></span>
      <span className="min-w-0 flex-1 whitespace-normal break-words">{message}</span>
    </Snackbar>
  );
}

export function TooltipSnackbar({
  message,
  id,
  className,
  style,
  children
}: StaticDismissSnackbarProps) {
  return (
    <Snackbar
      id={id}
      persistentDismiss={false}
      className={cn(tooltipSnackbarClass, className)}
      style={style}
      dismissTooltip="Lukk verktøytips"
      details={children}
    >
      <span className="text-xl shrink-0 mt-0.5" aria-hidden="true"><PiQuestionFill /></span>
      <span className="min-w-0 flex-1 whitespace-normal break-words">{message}</span>
    </Snackbar>
  );
}

export function ErrorSnackbar({
  message,
  id,
  className,
  style,
  children
}: StaticDismissSnackbarProps) {
  return (
    <Snackbar
      id={id}
      persistentDismiss={true}
      className={cn(errorSnackbarClass, className)}
      style={style}
      dismissTooltip="Lukk feilmelding"
      details={children}
    >
      <span className="text-xl text-red-100 shrink-0 mt-0.5" aria-hidden="true"><PiWarningOctagonFill /></span>
      <span className="min-w-0 flex-1 whitespace-normal break-words">{message}</span>
    </Snackbar>
  );
}