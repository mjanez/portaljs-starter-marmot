import { useRouter } from "next/router";
import { useState, useRef, useEffect } from "react";

const LANGUAGES = [
    { code: "en", label: "English", flag: "🇬🇧" },
    { code: "es", label: "Español", flag: "🇪🇸" },
];

export default function LanguageSelector({ variant = "auto" }: { variant?: "dark" | "light" | "auto" }) {
    const router = useRouter();
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    const currentLang =
        LANGUAGES.find((l) => l.code === router.locale) ?? LANGUAGES[0];

    // Close dropdown on outside click
    useEffect(() => {
        function handleClickOutside(e: MouseEvent) {
            if (ref.current && !ref.current.contains(e.target as Node)) {
                setOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    function switchLocale(code: string) {
        setOpen(false);
        router.push(router.asPath, router.asPath, { locale: code });
    }

    // Style variants
    const btnClass =
        variant === "dark"
            ? "text-white bg-white/10 hover:bg-white/20 border-white/20"
            : "text-gray-700 bg-gray-100 hover:bg-gray-200 border-gray-300";

    const dropdownBg =
        variant === "dark"
            ? "bg-[#1a1a2e] border-white/10"
            : "bg-white border-gray-200";

    const itemClass = (isActive: boolean) =>
        variant === "dark"
            ? isActive
                ? "bg-accent/20 text-accent font-semibold"
                : "text-white/80 hover:bg-white/10 hover:text-white"
            : isActive
                ? "bg-accent/10 text-accent font-semibold"
                : "text-gray-700 hover:bg-gray-100 hover:text-gray-900";

    return (
        <div ref={ref} className="relative inline-block text-left">
            <button
                type="button"
                id="language-selector-btn"
                onClick={() => setOpen(!open)}
                className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium backdrop-blur-sm transition-all duration-200 border ${btnClass}`}
                aria-haspopup="true"
                aria-expanded={open}
            >
                <span className="text-base leading-none">{currentLang.flag}</span>
                <span className="hidden sm:inline">{currentLang.code.toUpperCase()}</span>
                <svg
                    className={`h-4 w-4 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
            </button>

            {open && (
                <div className={`absolute right-0 z-50 mt-2 w-40 origin-top-right rounded-lg border shadow-xl ring-1 ring-black/5 overflow-hidden ${dropdownBg}`}>
                    {LANGUAGES.map((lang) => (
                        <button
                            key={lang.code}
                            id={`lang-option-${lang.code}`}
                            onClick={() => switchLocale(lang.code)}
                            className={`flex w-full items-center gap-3 px-4 py-2.5 text-sm transition-colors duration-150 ${itemClass(lang.code === currentLang.code)}`}
                        >
                            <span className="text-lg leading-none">{lang.flag}</span>
                            <span>{lang.label}</span>
                            {lang.code === currentLang.code && (
                                <svg
                                    className="ml-auto h-4 w-4 text-accent"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                    strokeWidth={2.5}
                                >
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                </svg>
                            )}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
