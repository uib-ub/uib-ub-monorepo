'use client'

import { CSSProperties, PropsWithChildren, ReactNode, useId, useState } from "react";
import { PiCaretDown, PiCaretUp, PiInfoFill, PiQuestionFill, PiWarningFill, PiWarningOctagonFill, PiX } from "react-icons/pi";
import { cn } from "@/lib/utils";
import { useNotificationStore } from "@/state/zustand/notification-store";
import ClickableIcon from "./clickable/clickable-icon";
import Clickable from "./clickable/clickable";
import { useSessionStore } from "@/state/zustand/session-store";

/** Matches `#search-form` / home search input: `h-14` mobile, `h-12` desktop. */
const snackbarSearchBarHeightClass = "h-14 lg:h-12";

/** Full width on small screens; cap width on large screens. */
const snackbarWidthClass = "w-full min-w-0 max-w-full lg:max-w-[80%]";

/** Square on mobile full-bleed; rounded from `lg` up. */
const snackbarRadiusClass = "rounded-none lg:rounded-md";

const snackbarBaseClass =
  `box-border min-h-12 px-4 py-3 text-white flex justify-between gap-4 ${snackbarWidthClass} ${snackbarRadiusClass} relative transition-opacity duration-300 shadow-md border`;
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
  /** Shown in the row instead of «Vis detaljer»; no expand panel (mutually exclusive with `details` in practice). */
  link?: ReactNode;
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
  link,
  className,
  style,
  dismissTooltip = "Lukk melding",
  dismissButtonClassName
}: SnackbarProps) {
  const [expanded, setExpanded] = useState(false);
  const detailsId = useId();
  const dismissNotification = useNotificationStore((s) => s.dismissNotification);
  const snappedPosition = useSessionStore((s) => s.snappedPosition);
  const setSnappedPosition = useSessionStore((s) => s.setSnappedPosition);

  if (details) {
    return (
      <div
        role="status"
        aria-live="polite"
        data-expanded={expanded ? "true" : "false"}
        className={cn(
          "box-border flex flex-col overflow-hidden border text-white shadow-sm transition-opacity duration-300",
          snackbarWidthClass,
          snackbarRadiusClass,
          // Total height matches search bar (h-14 / h-12); border is inside this box, not added on top.
          !expanded ? snackbarSearchBarHeightClass : undefined,
          className
        )}
        style={style}
      >
        <div
          className={cn(
            "box-border flex w-full min-w-0 shrink-0 items-center justify-between gap-4 px-4",
            // Keep row height stable between collapsed/expanded to avoid baseline jumps.
            snackbarSearchBarHeightClass
          )}
        >
          <div className="min-w-0 flex-1">
            <Clickable
              className={cn(
                // Don't stretch to the X; button ends at caret.
                "inline-flex w-fit min-h-0 min-w-0 max-w-full items-center gap-2 text-left",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/35 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent"
              )}
              aria-expanded={expanded}
              aria-controls={detailsId}
              aria-label="detaljar"
              onClick={() => {
                if (!expanded && snappedPosition === "top") {
                  setSnappedPosition("bottom");
                }
                setExpanded((prev) => !prev);
              }}
            >
              {children}
              <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center">
                {expanded ? <PiCaretUp className="text-lg" /> : <PiCaretDown className="text-lg" />}
              </span>
            </Clickable>
          </div>
          {id ? (
            <ClickableIcon
              className={dismissButtonClassName ?? "inline-flex h-8 w-8 shrink-0 items-center justify-center self-center p-0"}
              onClick={() => dismissNotification(id, persistentDismiss)}
              label={dismissTooltip}
            >
              <PiX className="text-lg align-middle transition-transform lg:text-2xl" aria-hidden="true" />
            </ClickableIcon>
          ) : null}
        </div>
        {expanded ? (
          <div
            id={detailsId}
            className="border-t border-current/15 px-4 pb-3 pt-2 text-sm opacity-95"
          >
            {details}
          </div>
        ) : null}
      </div>
    );
  }

  if (link) {
    return (
      <div
        role="status"
        aria-live="polite"
        className={cn(
          "box-border flex items-center justify-between gap-2 overflow-hidden border px-4 text-white shadow-sm transition-opacity duration-300",
          snackbarWidthClass,
          snackbarRadiusClass,
          snackbarSearchBarHeightClass,
          className
        )}
        style={style}
      >
        <div className="flex min-h-0 min-w-0 flex-1 items-center gap-2">
          {children}
          <span className="inline-flex shrink-0 items-center text-sm [&_a]:underline opacity-90 transition-opacity hover:opacity-100 [&_a]:text-inherit [&_a]:leading-none">
            {link}
          </span>
        </div>
        {id ? (
          <ClickableIcon
            className={dismissButtonClassName ?? "inline-flex h-8 w-8 shrink-0 items-center justify-center p-0"}
            onClick={() => dismissNotification(id, persistentDismiss)}
            label={dismissTooltip}
          >
            <PiX className="text-lg align-middle transition-transform lg:text-2xl" aria-hidden="true" />
          </ClickableIcon>
        ) : null}
      </div>
    );
  }

  return (
    <div
      role="status"
      aria-live="polite"
      className={cn(snackbarBaseClass, "items-start", className)}
      style={style}
    >
      <div className="min-w-0 flex-1">
        <div className="flex min-w-0 items-start gap-2">{children}</div>
      </div>

      {id ? (
        <ClickableIcon
          className={dismissButtonClassName ?? "inline-flex shrink-0 self-start p-0.5 mt-0.5"}
          onClick={() => dismissNotification(id, persistentDismiss)}
          label={dismissTooltip}
        >
          <PiX className="text-lg align-middle transition-transform lg:text-2xl" aria-hidden="true" />
        </ClickableIcon>
      ) : null}
    </div>
  );
}

type StyledSnackbarProps = PropsWithChildren<{
  message: ReactNode;
  /** Shown in the row when `children` (details) or `link` is set; falls back to `message`. */
  title?: ReactNode;
  /** Row action in place of «Vis detaljer» (no expand). */
  link?: ReactNode;
  id?: string;
  persistentDismiss?: boolean;
  className?: string;
  style?: CSSProperties;
}>;
type StaticDismissSnackbarProps = Omit<StyledSnackbarProps, "persistentDismiss">;

export function WarningSnackbar({
  message,
  title,
  id,
  persistentDismiss = false,
  className,
  style,
  children,
  link,
}: StyledSnackbarProps) {
  const compactRow = Boolean(children) || Boolean(link);
  const rowText = compactRow ? (title ?? message) : message;
  return (
    <Snackbar
      id={id}
      persistentDismiss={persistentDismiss}
      className={cn(warningSnackbarClass, className)}
      style={style}
      dismissTooltip="Lukk advarsel"
      details={children}
      link={link}
    >
      <span
        className={cn(
          "flex shrink-0 items-center leading-none",
          compactRow ? "text-lg lg:text-xl" : "text-xl"
        )}
        aria-hidden="true"
      >
        <PiWarningFill />
      </span>
      <span
        className={cn(
          "min-w-0",
          compactRow
            ? "truncate text-sm leading-tight whitespace-nowrap"
            : "flex-1 whitespace-normal break-words"
        )}
      >
        {rowText}
      </span>
    </Snackbar>
  );
}

export function InfoSnackbar({
  message,
  title,
  id,
  persistentDismiss = false,
  className,
  style,
  children,
  link,
}: StyledSnackbarProps) {
  const compactRow = Boolean(children) || Boolean(link);
  const rowText = compactRow ? (title ?? message) : message;
  return (
    <Snackbar
      id={id}
      persistentDismiss={persistentDismiss}
      className={cn(infoSnackbarClass, className)}
      style={style}
      dismissTooltip="Lukk informasjon"
      details={children}
      link={link}
    >
      <span
        className={cn(
          "flex shrink-0 items-center leading-none",
          compactRow ? "text-lg lg:text-xl" : "text-xl"
        )}
        aria-hidden="true"
      >
        <PiInfoFill />
      </span>
      <span
        className={cn(
          "min-w-0",
          compactRow
            ? "truncate text-sm leading-tight whitespace-nowrap"
            : "flex-1 whitespace-normal break-words"
        )}
      >
        {rowText}
      </span>
    </Snackbar>
  );
}

export function TooltipSnackbar({
  message,
  title,
  id,
  persistentDismiss = false,
  className,
  style,
  children,
  link,
}: StyledSnackbarProps) {
  const compactRow = Boolean(children) || Boolean(link);
  const rowText = compactRow ? (title ?? message) : message;
  return (
    <Snackbar
      id={id}
      persistentDismiss={persistentDismiss}
      className={cn(tooltipSnackbarClass, className)}
      style={style}
      dismissTooltip="Lukk verktøytips"
      details={children}
      link={link}
    >
      <span
        className={cn(
          "flex shrink-0 items-center leading-none",
          compactRow ? "text-lg lg:text-xl" : "text-xl mt-0.5"
        )}
        aria-hidden="true"
      >
        <PiQuestionFill />
      </span>
      <span
        className={cn(
          "min-w-0",
          compactRow
            ? "truncate text-sm leading-tight whitespace-nowrap"
            : "flex-1 whitespace-normal break-words"
        )}
      >
        {rowText}
      </span>
    </Snackbar>
  );
}

export function ErrorSnackbar({
  message,
  title,
  id,
  className,
  style,
  children,
  link,
}: StaticDismissSnackbarProps) {
  const compactRow = Boolean(children) || Boolean(link);
  const rowText = compactRow ? (title ?? message) : message;
  return (
    <Snackbar
      id={id}
      persistentDismiss={true}
      className={cn(errorSnackbarClass, className)}
      style={style}
      dismissTooltip="Lukk feilmelding"
      details={children}
      link={link}
    >
      <span
        className={cn(
          "flex shrink-0 items-center leading-none text-red-100",
          compactRow ? "text-lg lg:text-xl" : "text-xl"
        )}
        aria-hidden="true"
      >
        <PiWarningOctagonFill />
      </span>
      <span
        className={cn(
          "min-w-0",
          compactRow
            ? "truncate text-sm leading-tight whitespace-nowrap"
            : "flex-1 whitespace-normal break-words"
        )}
      >
        {rowText}
      </span>
    </Snackbar>
  );
}