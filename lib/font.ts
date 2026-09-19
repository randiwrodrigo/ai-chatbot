export type FontPreference = "sans" | "serif" | "system";

const STORAGE_KEY = "font-preference";

export function getFontPreference(): FontPreference {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === "sans" || stored === "serif" || stored === "system") {
      return stored;
    }
  } catch {
    // localStorage unavailable — fall through to the default.
  }
  return "sans";
}

export function setFontPreference(pref: FontPreference): void {
  try {
    if (pref === "sans") {
      localStorage.removeItem(STORAGE_KEY);
      document.documentElement.removeAttribute("data-font");
    } else {
      localStorage.setItem(STORAGE_KEY, pref);
      document.documentElement.setAttribute("data-font", pref);
    }
  } catch (err) {
    console.error("Failed to save font preference:", err);
  }
}
