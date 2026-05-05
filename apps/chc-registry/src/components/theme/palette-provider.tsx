"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

// Provide both neutral and red palette options
const PALETTES = ["neutral", "red"] as const;

export type Palette = (typeof PALETTES)[number];

type PaletteContextValue = {
  palette: Palette;
  setPalette: (palette: Palette) => void;
  availablePalettes: readonly Palette[];
};

const PaletteContext = createContext<PaletteContextValue | undefined>(
  undefined,
);

export function PaletteProvider({ children }: { children: ReactNode }) {
  const [palette, setPalette] = useState<Palette>("red");

  // Hydrate initial palette from localStorage on the client
  useEffect(() => {
    if (typeof window === "undefined") return;
    const stored = window.localStorage.getItem("uib-palette");
    if (stored && (PALETTES as readonly string[]).includes(stored)) {
      setPalette(stored as Palette);
    }
  }, []);

  // Apply palette class to <html> and persist
  useEffect(() => {
    if (typeof document === "undefined") return;
    const root = document.documentElement;

    // Keep only the active palette class on <html>
    root.classList.remove("palette-neutral", "palette-red");
    if (palette === "neutral") {
      root.classList.add("palette-neutral");
    }
    if (palette === "red") {
      root.classList.add("palette-red");
    }

    window.localStorage.setItem("uib-palette", palette);
  }, [palette]);

  return (
    <PaletteContext.Provider
      value={{ palette, setPalette, availablePalettes: PALETTES }}
    >
      {children}
    </PaletteContext.Provider>
  );
}

export function usePalette() {
  const ctx = useContext(PaletteContext);
  if (!ctx) {
    throw new Error("usePalette must be used within a PaletteProvider");
  }
  return ctx;
}
