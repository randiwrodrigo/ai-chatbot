export type ThemePreference = "light" | "dark" | "system";

const STORAGE_KEY = "theme-preference";

export function getThemePreference(): ThemePreference {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === "light" || stored === "dark") return stored;
  } catch {
    // localStorage unavailable — fall through to system default.
  }
  return "system";
}

export function setThemePreference(pref: ThemePreference): void {
  try {
    if (pref === "system") {
      localStorage.removeItem(STORAGE_KEY);
      document.documentElement.removeAttribute("data-theme");
    } else {
      localStorage.setItem(STORAGE_KEY, pref);
      document.documentElement.setAttribute("data-theme", pref);
    }
  } catch (err) {
    console.error("Failed to save theme preference:", err);
  }
}
