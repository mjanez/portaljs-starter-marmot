import { useTheme } from "@/components/theme/theme-provider";
import { MoonIcon, SunIcon } from "@heroicons/react/20/solid";
import { useEffect, useState } from "react";

export default function ThemeSelector({ variant = "auto" }: { variant?: "dark" | "light" | "auto" }) {
    const { theme, setTheme } = useTheme();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    // Determine current theme name by checking the layout constructor name or property
    // This is a bit hacky since theme object doesn't have a name property, 
    // but looking at imports in theme-provider:
    // default -> DefaultTheme
    // lighter -> LighterTheme
    // We can try to infer or just toggle based on what we see.
    // Actually, we can just track it in local state if we had access to the name.
    // But theme-provider only exposes the theme object, not the name.
    // However, we know LighterTheme has a specific structure.

    // A better way might be to check a specific property or style if available.
    // Or, we can just assume if we are in LighterThemeHeader (which calls this with variant="auto"), we are in lighter theme.
    // And if we are in TopBar (variant="dark"), we are in default theme.

    // BUT, let's look at how to switch. setTheme takes a string name ("default" or "lighter").

    // Let's rely on the variant prop to infer current state for visual toggle, 
    // or checks if we can identify the theme object.
    // DefaultTheme uses TopBar. LighterTheme uses LighterThemeHeader.
    // We can toggle based on that? No, `theme` object has the components.

    // Let's assume:
    // if variant is "dark" (Default/TopBar) -> We are in Dark Mode -> Show Sun Icon to switch to Light
    // if variant is "auto" or "light" (Lighter) -> We are in Light Mode -> Show Moon Icon to switch to Dark

    // Wait, if I am in Default theme (TopBar), variant is "dark". 
    // Clicking button should switch to "lighter".
    // If I am in Lighter theme (LighterHeader), variant is "auto".
    // Clicking button should switch to "default".

    const isDark = variant === "dark";

    const toggleTheme = () => {
        if (isDark) {
            setTheme("lighter");
        } else {
            setTheme("default");
        }
    };

    if (!mounted) return null;

    // Style variants
    const btnClass =
        variant === "dark"
            ? "text-white bg-white/10 hover:bg-white/20 border-white/20"
            : "text-gray-700 bg-gray-100 hover:bg-gray-200 border-gray-300";

    return (
        <button
            type="button"
            onClick={toggleTheme}
            className={`flex items-center justify-center p-1.5 rounded-md backdrop-blur-sm transition-all duration-200 border ${btnClass}`}
            aria-label="Toggle Theme"
        >
            {isDark ? (
                <SunIcon className="h-5 w-5" />
            ) : (
                <MoonIcon className="h-5 w-5" />
            )}
        </button>
    );
}
