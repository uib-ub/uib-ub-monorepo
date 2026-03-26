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

/** Square on mobile full-bleed; rounded from `lg` up. */
const snackbarRadiusClass = "rounded-none lg:rounded-md";

const snackbarBaseClass =
  `box-border min-h-12 px-4 py-3 text-white flex justify-between gap-4 ${snackbarRadiusClass} relative transition-opacity duration-300 shadow-md border`;
/** Border one palette step darker than fill (tailwind.config.ts). */
const infoSnackbarClass = "bg-neutral-900 border-neutral-950 text-white";
const warningSnackbarClass = "bg-accent-900 border-accent-950 text-white";
const tooltipSnackbarClass = "bg-neutral-200 border-neutral-300 text-neutral-900";
const errorSnackbarClass = "bg-primary-900 border-primary-950 text-white";

type SnackbarProps = {
  id?: string;
  persistentDismiss?: boolean;
  /**
   * Default mode: provide complete row content.
   * Notification mode: provide `icon` + `message` (and optional `title`).
   */
  children?: ReactNode;
  /** When set (together with `message`), `Snackbar` renders a standard notification row (icon + text). */
  icon?: ReactNode;
  /** When set, `Snackbar` renders a standard notification row (icon + text). */
  message?: ReactNode;
  /** Used instead of `message` when `details` or `link` is provided. */
  title?: ReactNode;
  /** Extra icon classes (applied to the icon wrapper span). */
  iconClassName?: string;
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
  icon,
  message,
  title,
  iconClassName,
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

  const showDetails = Boolean(details);
  const showLink = !showDetails && Boolean(link);
  const rowText = message !== undefined ? (title ?? message) : undefined;
  const rowContent =
    message !== undefined ? (
      <span className="flex h-full min-w-0 items-center gap-3">
        <span
          className={cn(
            "inline-flex h-full shrink-0 items-center justify-center text-xl leading-none [&_svg]:block",
            iconClassName
          )}
          aria-hidden="true"
        >
          {icon}
        </span>
        <span
          className={cn(
            "flex h-full min-w-0 items-center flex-auto whitespace-normal xl:text-lg break-words lg:break-normal"
          )}
        >
          {rowText}
        </span>
      </span>
    ) : (
      children
    );

  const dismissControl = id ? (
    <ClickableIcon
      className={dismissButtonClassName ?? "inline-flex shrink-0 items-center justify-center p-0"}
      onClick={() => dismissNotification(id, persistentDismiss)}
      label={dismissTooltip}
    >
      <PiX className="text-2xl align-middle transition-transform" aria-hidden="true" />
    </ClickableIcon>
  ) : null;

  return (
    <div
      role="status"
      aria-live="polite"
      data-expanded={showDetails ? (expanded ? "true" : "false") : undefined}
      className={cn(
        "box-border overflow-hidden border shadow-sm  flex items-center transition-opacity duration-300",
        snackbarRadiusClass,
        showDetails ? "flex flex-col" : undefined,
        // One-row snackbars always match the search bar height.
        !showDetails ? snackbarSearchBarHeightClass : undefined,
        // Expandable snackbars match the search bar height when collapsed.
        showDetails && !expanded ? snackbarSearchBarHeightClass : undefined,
        className
      )}
      style={style}
    >
      <div
        className={cn(
          "box-border flex w-full min-w-0 items-center justify-between gap-4",
          // Expandable snackbars historically used slightly tighter horizontal padding.
          showDetails ? "px-3" : "px-4",
          // Keep row height stable between collapsed/expanded for expandable snackbars.
          showDetails ? snackbarSearchBarHeightClass : undefined,
          // One-row snackbars need the same vertical padding regardless of link.
          !showDetails ? "py-3" : undefined
        )}
      >
        <div className={cn("min-w-0 flex-1", showDetails ? "h-full" : undefined)}>
          {showDetails ? (
            <Clickable
              className={cn(
                // Don't stretch to the X; button ends at caret.
                "inline-flex h-full w-fit min-h-0 min-w-0 max-w-full items-center gap-2 text-left",
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
              {rowContent}
              <span className="inline-flex shrink-0 items-center justify-center">
                {expanded ? <PiCaretUp className="text-lg" /> : <PiCaretDown className="text-lg" />}
              </span>
            </Clickable>
          ) : (
            <div className="flex min-h-0 min-w-0 items-center gap-2">
              {rowContent}
              {showLink ? (
                <span className="inline-flex shrink-0 items-center [&_a]:underline opacity-90 transition-opacity hover:opacity-100 [&_a]:text-inherit [&_a]:leading-none">
                  {link}
                </span>
              ) : null}
            </div>
          )}
        </div>
        {dismissControl}
      </div>

      {showDetails && expanded ? (
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
  return (
    <Snackbar
      id={id}
      persistentDismiss={persistentDismiss}
      className={cn(warningSnackbarClass, className)}
      style={style}
      dismissTooltip="Lukk advarsel"
      details={children}
      link={link}
      message={message}
      title={title}
      icon={<PiWarningFill />}
    >
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
  return (
    <Snackbar
      id={id}
      persistentDismiss={persistentDismiss}
      className={cn(infoSnackbarClass, className)}
      style={style}
      dismissTooltip="Lukk informasjon"
      details={children}
      link={link}
      message={message}
      title={title}
      icon={<PiInfoFill />}
    >
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
  return (
    <Snackbar
      id={id}
      persistentDismiss={persistentDismiss}
      className={cn(tooltipSnackbarClass, className)}
      style={style}
      dismissTooltip="Lukk verktøytips"
      details={children}
      link={link}
      message={message}
      title={title}
      icon={<PiQuestionFill />}
    >
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
  return (
    <Snackbar
      id={id}
      persistentDismiss={true}
      className={cn(errorSnackbarClass, className)}
      style={style}
      dismissTooltip="Lukk feilmelding"
      details={children}
      link={link}
      message={message}
      title={title}
      iconClassName="text-red-100"
      icon={<PiWarningOctagonFill />}
    >
    </Snackbar>
  );
}