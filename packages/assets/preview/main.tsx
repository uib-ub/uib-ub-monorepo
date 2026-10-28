import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  useSyncExternalStore,
} from "react";
import type { ComponentType, CSSProperties } from "react";
import { createRoot } from "react-dom/client";

import "./preview.css";
import configJson from "../assets.config.json";

/**
 * Dev-only preview of every asset in the package.
 *
 * Logos are shown on the background that suits their color capability:
 *
 * - adaptive:  the svg restyles itself via CSS — either a
 *   `prefers-color-scheme` media rule or `currentColor` — so the card
 *   follows the preview's light/dark toggle. The dark rules are mirrored
 *   under `[data-mode='dark']` so the logos follow the app toggle even
 *   when it disagrees with the OS setting.
 * - negative:  white artwork, always shown on a dark background.
 * - positive:  dark/colored artwork, always shown on a light background.
 *
 * The sidebar filters by asset name, type, org (from assets.config.json),
 * deprecation and currentColor capability. Every filter group is
 * multi-select and starts empty: an empty selection means "no filter",
 * so with nothing selected all assets show. Edits to assets.config.json
 * are accepted as an HMR dependency, so the preview updates in place —
 * without a page reload — and the selected filters survive.
 */

const svgRawModules = import.meta.glob("../src/assets/*.svg", {
  eager: true,
  query: "?raw",
  import: "default",
}) as Record<string, string>;

const reactModules = import.meta.glob("../src/react/*.tsx", {
  eager: true,
  import: "default",
}) as Record<string, ComponentType>;

type Category = "adaptive" | "negative" | "positive";

/**
 * Asset types from the naming grammar (`{org}-{type}-…`). The type is
 * the first segment after the org key that matches a known type, so
 * dashed org keys like `uib-ub` parse correctly.
 */
const TYPES = ["lockup", "mark", "initials", "icon", "wordmark"] as const;
type AssetType = (typeof TYPES)[number];

function parseType(name: string): AssetType | undefined {
  const segments = name.split("-");
  for (let i = 1; i < segments.length; i++) {
    if ((TYPES as readonly string[]).includes(segments[i])) {
      return segments[i] as AssetType;
    }
  }
  return undefined;
}

interface Entry {
  name: string;
  raw?: string;
  Component?: ComponentType;
  category: Category;
  built: boolean;
  /** Org key from assets.config.json, undefined for unmanaged assets */
  org?: string;
  type?: AssetType;
  deprecated: boolean;
  currentColor: boolean;
}

interface ConfigAsset {
  output: string;
  deprecated?: boolean;
}

interface ConfigOrg {
  label: string;
  /** Link to the org's logo/design documentation, shown in the group header */
  docs?: string;
  assets: ConfigAsset[];
}

interface AssetsConfig {
  orgs: Record<string, ConfigOrg>;
}

/**
 * Hot-reloadable copy of assets.config.json. The import is accepted as an
 * HMR dependency below, so config edits swap this value in place instead
 * of triggering a full page reload (which would reset the filters).
 */
let config = configJson as AssetsConfig;
const configListeners = new Set<() => void>();

if (import.meta.hot) {
  import.meta.hot.accept(["../assets.config.json"], (modules) => {
    const next = modules?.[0]?.default as AssetsConfig | undefined;
    if (next) {
      config = next;
      configListeners.forEach((listener) => listener());
    }
  });
}

function useConfig(): AssetsConfig {
  const subscribe = useCallback((listener: () => void) => {
    configListeners.add(listener);
    return () => {
      configListeners.delete(listener);
    };
  }, []);
  return useSyncExternalStore(subscribe, () => config);
}

const basename = (path: string) =>
  path
    .split("/")
    .pop()!
    .replace(/\.(svg|tsx)$/, "");

function categorize(name: string, raw?: string): Category {
  if (raw?.includes("prefers-color-scheme")) return "adaptive";
  if (raw?.includes("currentColor")) return "adaptive";
  if (/(^|-)negative(-|$)/.test(name)) return "negative";
  if (raw && /fill="(?:white|#fff(?:fff)?)"/i.test(raw)) return "negative";
  return "positive";
}

function buildEntries(config: AssetsConfig): Entry[] {
  /** output name -> org key + config flags */
  const configByOutput = new Map<
    string,
    { org: string; deprecated: boolean }
  >();
  for (const [orgKey, org] of Object.entries(config.orgs)) {
    for (const asset of org.assets) {
      configByOutput.set(asset.output, {
        org: orgKey,
        deprecated: Boolean(asset.deprecated),
      });
    }
  }

  const rawByName = new Map(
    Object.entries(svgRawModules).map(([path, raw]) => [basename(path), raw]),
  );
  const componentByName = new Map(
    Object.entries(reactModules).map(([path, Component]) => [
      basename(path),
      Component,
    ]),
  );
  const names = new Set([...rawByName.keys(), ...componentByName.keys()]);
  return [...names].sort().map((name) => {
    const raw = rawByName.get(name);
    const Component = componentByName.get(name);
    const configEntry = configByOutput.get(name);
    return {
      name,
      raw,
      Component,
      category: categorize(name, raw),
      built: Boolean(Component),
      org: configEntry?.org,
      type: parseType(name),
      deprecated: Boolean(configEntry?.deprecated),
      currentColor: Boolean(raw?.includes("currentColor")),
    };
  });
}

/**
 * Mirror each svg's `@media (prefers-color-scheme: dark)` rules under the
 * preview's own dark mode, scoped to adaptive cards. This makes CSS-driven
 * logos follow the app toggle instead of only the OS setting.
 */
const darkRuleOverrides = Object.values(svgRawModules)
  .flatMap((raw) => {
    const media = raw.match(
      /@media \(prefers-color-scheme:\s*dark\)\s*\{([\s\S]*?)\}\s*\}/,
    );
    if (!media) return [];
    return [...media[1].matchAll(/\.([a-zA-Z0-9_-]+)\s*\{([^}]*)/g)].map(
      (rule) => `[data-mode='dark'] .card-adaptive .${rule[1]} { ${rule[2]} }`,
    );
  })
  .join("\n");

const CATEGORY_LABELS: Record<Category, string> = {
  adaptive: "adaptive · follows mode",
  negative: "negative · dark bg",
  positive: "positive · light bg",
};

const UNMANAGED = "__unmanaged__";

type Mode = "light" | "dark";
type Status = "active" | "deprecated";
type ColorCapability = "currentColor" | "fixed";
type ColumnCount = 2 | 3 | 4;

interface FilterOption<T extends string> {
  value: T;
  label: string;
  count: number;
}

/**
 * Multi-select filter group: clicking an option toggles it in the
 * selection. An empty selection means "no filter" — everything shows.
 */
function FilterGroup<T extends string>({
  title,
  options,
  selected,
  onToggle,
}: {
  title: string;
  options: FilterOption<T>[];
  selected: ReadonlySet<T>;
  onToggle: (value: T) => void;
}) {
  return (
    <section className="filter-group">
      <h2>{title}</h2>
      {options.map((option) => (
        <button
          key={option.value}
          aria-pressed={selected.has(option.value)}
          className={selected.has(option.value) ? "active" : ""}
          onClick={() => onToggle(option.value)}
        >
          <span className="filter-label">{option.label}</span>
          <span className="filter-count">{option.count}</span>
        </button>
      ))}
    </section>
  );
}

function useMultiSelect<T extends string>(): [
  ReadonlySet<T>,
  (value: T) => void,
  () => void,
] {
  const [selected, setSelected] = useState<ReadonlySet<T>>(new Set());
  const toggle = useCallback((value: T) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(value)) {
        next.delete(value);
      } else {
        next.add(value);
      }
      return next;
    });
  }, []);
  const clear = useCallback(() => setSelected(new Set()), []);
  return [selected, toggle, clear];
}

function getInitialMode(): Mode {
  const stored = localStorage.getItem("assets-preview-mode");
  if (stored === "light" || stored === "dark") return stored;
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

function getInitialColumns(): ColumnCount {
  const stored = Number(localStorage.getItem("assets-preview-columns"));
  if (stored === 2 || stored === 3 || stored === 4) return stored;
  return 3;
}

/** Fullscreen preview of a single asset. Escape or backdrop click closes. */
function AssetModal({
  entry,
  onClose,
}: {
  entry: Entry;
  onClose: () => void;
}) {
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  return (
    <div
      className="modal-backdrop"
      role="dialog"
      aria-modal="true"
      aria-label={entry.name}
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <figure className={`modal-card card-${entry.category}`}>
        <button className="modal-close" onClick={onClose} aria-label="Close">
          ×
        </button>
        <div className="modal-logo">
          {entry.Component ? (
            <entry.Component aria-label={entry.name} />
          ) : (
            <span dangerouslySetInnerHTML={{ __html: entry.raw! }} />
          )}
        </div>
        <figcaption>
          <span className={entry.deprecated ? "deprecated-name" : ""}>
            {entry.name}
          </span>
          {entry.org && (
            <span className="badge badge-org">{entry.org}</span>
          )}
          {!entry.org && (
            <span className="badge badge-warn">not in config</span>
          )}
          <span className="badge">{CATEGORY_LABELS[entry.category]}</span>
          {entry.currentColor && (
            <span className="badge badge-current-color">currentColor</span>
          )}
          {entry.deprecated && (
            <span className="badge badge-deprecated">deprecated</span>
          )}
          {!entry.built && <span className="badge">not built</span>}
        </figcaption>
      </figure>
    </div>
  );
}

/** Single logo card. Click/Enter opens the fullscreen modal. */
function AssetCard({
  entry,
  onSelect,
}: {
  entry: Entry;
  onSelect: (entry: Entry) => void;
}) {
  return (
    <figure
      className={`card card-${entry.category}`}
      role="button"
      tabIndex={0}
      aria-label={`Preview ${entry.name} fullscreen`}
      onClick={() => onSelect(entry)}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onSelect(entry);
        }
      }}
    >
      <div className="logo">
        {entry.Component ? (
          <entry.Component aria-label={entry.name} />
        ) : (
          <span dangerouslySetInnerHTML={{ __html: entry.raw! }} />
        )}
      </div>
      <figcaption className="card-footer">
        <span
          className={`card-name${entry.deprecated ? " deprecated-name" : ""}`}
        >
          {entry.name}
        </span>
        <span className="card-tags">
          {entry.org && (
            <span className="badge badge-org">{entry.org}</span>
          )}
          {!entry.org && (
            <span className="badge badge-warn">not in config</span>
          )}
          <span className="badge">{CATEGORY_LABELS[entry.category]}</span>
          {entry.currentColor && (
            <span className="badge badge-current-color">currentColor</span>
          )}
          {entry.deprecated && (
            <span className="badge badge-deprecated">deprecated</span>
          )}
          {!entry.built && <span className="badge">not built</span>}
        </span>
      </figcaption>
    </figure>
  );
}

function App() {
  const config = useConfig();
  const entries = useMemo(() => buildEntries(config), [config]);
  const orgKeys = useMemo(() => Object.keys(config.orgs), [config]);
  /** org key -> { label, docs } from the config */
  const orgMeta = useMemo(
    () =>
      new Map(
        Object.entries(config.orgs).map(([key, org]) => [
          key,
          { label: org.label, docs: org.docs },
        ]),
      ),
    [config],
  );

  const [mode, setMode] = useState<Mode>(getInitialMode);
  const [columns, setColumns] = useState<ColumnCount>(getInitialColumns);
  const [selected, setSelected] = useState<Entry | null>(null);
  const [filter, setFilter] = useState("");
  const [orgFilter, toggleOrg, clearOrg] = useMultiSelect<string>();
  const [typeFilter, toggleType, clearType] = useMultiSelect<AssetType>();
  const [statusFilter, toggleStatus, clearStatus] = useMultiSelect<Status>();
  const [colorFilter, toggleColor, clearColor] = useMultiSelect<ColorCapability>();

  useEffect(() => {
    document.documentElement.dataset.mode = mode;
    localStorage.setItem("assets-preview-mode", mode);
  }, [mode]);

  useEffect(() => {
    localStorage.setItem("assets-preview-columns", String(columns));
  }, [columns]);

  const deprecatedCount = useMemo(
    () => entries.filter((entry) => entry.deprecated).length,
    [entries],
  );
  const currentColorCount = useMemo(
    () => entries.filter((entry) => entry.currentColor).length,
    [entries],
  );
  const orgCounts = useMemo(() => {
    const counts = new Map<string, number>();
    for (const entry of entries) {
      const key = entry.org ?? UNMANAGED;
      counts.set(key, (counts.get(key) ?? 0) + 1);
    }
    return counts;
  }, [entries]);

  const orgOptions = useMemo<FilterOption<string>[]>(
    () => [
      ...orgKeys.map((org) => ({
        value: org,
        label: orgMeta.get(org)?.label ?? org,
        count: orgCounts.get(org) ?? 0,
      })),
      {
        value: UNMANAGED,
        label: "Not in config",
        count: orgCounts.get(UNMANAGED) ?? 0,
      },
    ],
    [orgKeys, orgCounts, orgMeta],
  );

  const typeOptions = useMemo<FilterOption<AssetType>[]>(
    () =>
      TYPES.map((type) => ({
        value: type,
        label: type,
        count: entries.filter((entry) => entry.type === type).length,
      })),
    [entries],
  );

  const statusOptions = useMemo<FilterOption<Status>[]>(
    () => [
      {
        value: "active",
        label: "Active",
        count: entries.length - deprecatedCount,
      },
      {
        value: "deprecated",
        label: "Deprecated",
        count: deprecatedCount,
      },
    ],
    [entries.length, deprecatedCount],
  );

  const colorOptions = useMemo<FilterOption<ColorCapability>[]>(
    () => [
      {
        value: "currentColor",
        label: "currentColor",
        count: currentColorCount,
      },
      {
        value: "fixed",
        label: "Fixed colors",
        count: entries.length - currentColorCount,
      },
    ],
    [entries.length, currentColorCount],
  );

  // Empty selection in any group means "no filter" for that dimension.
  const visible = entries.filter((entry) => {
    if (!entry.name.toLowerCase().includes(filter.trim().toLowerCase())) {
      return false;
    }
    if (orgFilter.size > 0) {
      const key = entry.org ?? UNMANAGED;
      if (!orgFilter.has(key)) return false;
    }
    if (typeFilter.size > 0 && (!entry.type || !typeFilter.has(entry.type))) {
      return false;
    }
    if (
      statusFilter.size > 0 &&
      !statusFilter.has(entry.deprecated ? "deprecated" : "active")
    ) {
      return false;
    }
    if (
      colorFilter.size > 0 &&
      !colorFilter.has(entry.currentColor ? "currentColor" : "fixed")
    ) {
      return false;
    }
    return true;
  });

  return (
    <>
      <style>{darkRuleOverrides}</style>
      <div className="toolbar">
        <h1>Assets preview</h1>
        <button
          className={mode === "light" ? "active" : ""}
          onClick={() => setMode("light")}
        >
          Light
        </button>
        <button
          className={mode === "dark" ? "active" : ""}
          onClick={() => setMode("dark")}
        >
          Dark
        </button>
        <span className="toolbar-separator" />
        {[2, 3, 4].map((count) => (
          <button
            key={count}
            className={columns === count ? "active" : ""}
            onClick={() => setColumns(count as ColumnCount)}
          >
            {count} cols
          </button>
        ))}
        <span>
          {visible.length} / {entries.length}
        </span>
      </div>

      <div className="layout">
        <aside className="sidebar">
          <input
            type="search"
            placeholder="Filter by asset name…"
            value={filter}
            onChange={(event) => setFilter(event.target.value)}
          />
          <FilterGroup
            title="Type"
            options={typeOptions}
            selected={typeFilter}
            onToggle={toggleType}
          />
          <FilterGroup
            title="Org"
            options={orgOptions}
            selected={orgFilter}
            onToggle={toggleOrg}
          />
          <FilterGroup
            title="Status"
            options={statusOptions}
            selected={statusFilter}
            onToggle={toggleStatus}
          />
          <FilterGroup
            title="Color capability"
            options={colorOptions}
            selected={colorFilter}
            onToggle={toggleColor}
          />
        </aside>

        <main className="content">
          <p className="hint">
            Each logo sits on the background its color capability calls for:
            adaptive logos (currentColor or embedded dark-mode rules) follow
            the mode toggle, negative variants always get a dark background,
            positive variants always a light one.
          </p>

          {visible.length === 0 ? (
            <div className="empty-state">
              <div className="empty-art" aria-hidden="true">
                ¯\_(ツ)_/¯
              </div>
              <h2>No logo found</h2>
              <p>
                Your filters were thorough. Suspiciously thorough. Not a
                single logo made it through.
              </p>
              <button
                className="empty-reset"
                onClick={() => {
                  setFilter("");
                  clearType();
                  clearOrg();
                  clearStatus();
                  clearColor();
                }}
              >
                Show everything
              </button>
            </div>
          ) : (
            orgKeys
              .concat(UNMANAGED)
              .map((orgKey) => {
                const groupEntries = visible.filter(
                  (entry) => (entry.org ?? UNMANAGED) === orgKey,
                );
                if (groupEntries.length === 0) return null;
                const meta =
                  orgKey === UNMANAGED ? undefined : orgMeta.get(orgKey);
                return (
                  <section className="org-group" key={orgKey}>
                    <header className="org-group-header">
                      <h2>{meta?.label ?? "Not in config"}</h2>
                      {meta?.docs && (
                        <a
                          className="org-group-docs"
                          href={meta.docs}
                          target="_blank"
                          rel="noreferrer"
                        >
                          Documentation ↗
                        </a>
                      )}
                      <span className="org-group-count">
                        {groupEntries.length}
                      </span>
                    </header>
                    <div
                      className="grid"
                      style={{ "--grid-cols": columns } as CSSProperties}
                    >
                      {groupEntries.map((entry) => (
                        <AssetCard
                          key={entry.name}
                          entry={entry}
                          onSelect={setSelected}
                        />
                      ))}
                    </div>
                  </section>
                );
              })
          )}
        </main>
      </div>

      {selected && (
        <AssetModal entry={selected} onClose={() => setSelected(null)} />
      )}
    </>
  );
}

createRoot(document.getElementById("root")!).render(<App />);
