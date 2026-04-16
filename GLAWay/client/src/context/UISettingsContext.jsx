import {
  createContext,
  startTransition,
  useContext,
  useEffect,
  useMemo,
  useState
} from "react";
import { useReducedMotion } from "framer-motion";
import { animationService } from "../services/animationService";

const THEME_KEY = "glaway_theme";

const defaultAnimationSettings = {
  animationEnabled: true,
  animationType: "slide",
  animationSpeed: "normal"
};

const UISettingsContext = createContext(null);

const speedMap = {
  slow: 0.9,
  normal: 0.55,
  fast: 0.32
};

export const UISettingsProvider = ({ children }) => {
  const reducedMotion = useReducedMotion();
  const [theme, setTheme] = useState(
    () => localStorage.getItem(THEME_KEY) || "light"
  );
  const [animationSettings, setAnimationSettings] = useState(
    defaultAnimationSettings
  );
  const [settingsLoading, setSettingsLoading] = useState(true);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
    document.documentElement.style.colorScheme = theme;
    localStorage.setItem(THEME_KEY, theme);
  }, [theme]);

  const refreshAnimationSettings = async () => {
    try {
      const data = await animationService.getSettings();
      startTransition(() => {
        setAnimationSettings({
          animationEnabled: data.animationEnabled,
          animationType: data.animationType,
          animationSpeed: data.animationSpeed
        });
      });
    } catch (error) {
      console.error(error);
    } finally {
      setSettingsLoading(false);
    }
  };

  useEffect(() => {
    refreshAnimationSettings();
  }, []);

  const shouldAnimate =
    animationSettings.animationEnabled && reducedMotion !== true;

  const duration = speedMap[animationSettings.animationSpeed] || speedMap.normal;

  const value = useMemo(
    () => ({
      theme,
      setTheme,
      toggleTheme: () =>
        setTheme((currentTheme) =>
          currentTheme === "dark" ? "light" : "dark"
        ),
      animationSettings,
      setAnimationSettings,
      refreshAnimationSettings,
      settingsLoading,
      shouldAnimate,
      duration
    }),
    [animationSettings, duration, settingsLoading, shouldAnimate, theme]
  );

  return (
    <UISettingsContext.Provider value={value}>
      {children}
    </UISettingsContext.Provider>
  );
};

export const useUISettings = () => useContext(UISettingsContext);

