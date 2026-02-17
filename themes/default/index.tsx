import DefaultThemeLayout from "./layout";
import styles from "./styles.module.scss";
import LighterThemeHeader from "../lighter/header";
import LighterThemeFooter from "../lighter/footer";

const DefaultTheme = {
  header: LighterThemeHeader,
  footer: LighterThemeFooter, // Use the same footer structure
  layout: DefaultThemeLayout, // Use the same layout structure (particles, etc)
  styles: styles,
};

export { DefaultTheme };
