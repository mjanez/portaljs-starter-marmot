import { useTheme } from "@/components/theme/theme-provider";
import { MoonIcon, SunIcon } from "@heroicons/react/20/solid";
import { useEffect, useState } from "react";

export default function ThemeSelector({ variant = "auto" }: { variant?: "dark" | "light" | "auto" }) {
    const { currentTheme, setTheme } = useTheme();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const isDark = currentTheme === "default";

    const toggleTheme = () => {
        if (isDark) {
            setTheme("lighter");
        } else {
            setTheme("default");
        }
    };

    if (!mounted) return null;

    // Determine visual style
    const effectiveVariant = variant === "auto" ? (isDark ? "dark" : "light") : variant;

    const btnClass =
        effectiveVariant === "dark"
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
