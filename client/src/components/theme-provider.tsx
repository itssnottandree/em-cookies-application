import { createContext, useContext, useEffect, useState } from "react";

type Theme = "dark" | "light";

type ThemeProviderContextType = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
};

const ThemeProviderContext = createContext<ThemeProviderContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>("light");

  useEffect(() => {
    const root = window.document.documentElement;
    const stored = localStorage.getItem("theme") as Theme;
    
    if (stored) {
      setTheme(stored);
      root.classList.toggle("dark", stored === "dark");
    }
  }, []);

  const handleSetTheme = (newTheme: Theme) => {
    const root = window.document.documentElement;
    root.classList.toggle("dark", newTheme === "dark");
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
  };

  const toggleTheme = () => {
    handleSetTheme(theme === "light" ? "dark" : "light");
  };

  const value = {
    theme,
    setTheme: handleSetTheme,
    toggleTheme,
  };

  return (
    <ThemeProviderContext.Provider value={value}>
      {children}
    </ThemeProviderContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeProviderContext);

  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }

  return context;
}
