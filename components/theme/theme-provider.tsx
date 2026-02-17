import _ThemeBase from "../../themes/default/layout";
import { DefaultTheme } from "../../themes/default";
import { LighterTheme } from "../../themes/lighter";
import { createContext, FC, ReactNode, useContext, useState } from "react";
import { Theme } from "@/types/theme";

const themes: Record<string, Theme> = {
  lighter: LighterTheme,
  default: DefaultTheme,
};

interface ThemeContextProps {
  theme: Theme;
  currentTheme: string;
  setTheme: (themeName: string) => void;
}

const ThemeContext = createContext<ThemeContextProps | undefined>(undefined);

const ThemeProvider: FC<{ children: ReactNode; themeName?: string }> = ({
  children,
  themeName = "default",
}) => {
  const [currentTheme, setCurrentTheme] = useState<string>(themeName);

  const switchTheme = (name: string) => {
    setCurrentTheme(name);
  };

  const theme = themes[currentTheme] || themes.default;
  const ThemeBase = theme.layout || _ThemeBase;

  return (
    <ThemeContext.Provider
      value={{ theme, currentTheme, setTheme: switchTheme }}
    >
      <ThemeBase
        Header={theme?.header}
        Sidebar={theme?.sidebar}
        Footer={theme?.footer}
      >
        {children}
      </ThemeBase>
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextProps => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};

export default ThemeProvider;
