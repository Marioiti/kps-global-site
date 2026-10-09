import { useEffect } from "react";
import { Outlet } from "react-router-dom";
import { ThemeProvider, useTheme } from "next-themes";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { applyThemeColor } from "@/lib/theme-color";

/** Keeps the browser bar colour in step with the theme: the switch, the system or a saved choice. */
const ThemeColorSync = () => {
  const { resolvedTheme } = useTheme();
  useEffect(() => {
    if (resolvedTheme === "dark" || resolvedTheme === "light") applyThemeColor(resolvedTheme);
  }, [resolvedTheme]);
  return null;
};

/** App-wide providers shared by every route. */
const RootLayout = () => (
  <ThemeProvider attribute="class" defaultTheme="system" enableSystem storageKey="kps-theme" disableTransitionOnChange>
    <ThemeColorSync />
    <LanguageProvider>
      <Outlet />
    </LanguageProvider>
  </ThemeProvider>
);

export default RootLayout;
