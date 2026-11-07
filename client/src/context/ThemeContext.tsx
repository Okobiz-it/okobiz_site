"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

type Theme = "dark" | "light";

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>("dark");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Read persisted theme from localStorage or system preference
    try {
      const savedTheme = localStorage.getItem("okobiz-theme") as Theme | null;
      if (savedTheme === "light" || savedTheme === "dark") {
        setThemeState(savedTheme);
        applyThemeClass(savedTheme);
      } else {
        // Default to dark theme for okobiz brand identity
        setThemeState("dark");
        applyThemeClass("dark");
      }
    } catch (e) {
      // Fallback
      setThemeState("dark");
      applyThemeClass("dark");
    }
    setMounted(true);
  }, []);

  const applyThemeClass = (newTheme: Theme) => {
    const root = document.documentElement;
    if (newTheme === "light") {
      root.classList.remove("dark");
      root.classList.add("light");
    } else {
      root.classList.remove("light");
      root.classList.add("dark");
    }
  };

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    applyThemeClass(newTheme);
    try {
      localStorage.setItem("okobiz-theme", newTheme);
    } catch (e) {}
  };

  const toggleTheme = () => {
    const nextTheme = theme === "dark" ? "light" : "dark";
    setTheme(nextTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}

