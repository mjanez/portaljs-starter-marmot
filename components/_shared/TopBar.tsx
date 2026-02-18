import { Dialog } from "@headlessui/react";
import { Bars3Icon, XMarkIcon } from "@heroicons/react/20/solid";
import Link from "next/link";
import { useState } from "react";
import { useTranslation } from "next-i18next";
import LanguageSelector from "./LanguageSelector";
import ThemeSelector from "./ThemeSelector";

export default function TopBar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { t } = useTranslation("common");

  return (
    <header className="bg-transparent">
      <nav
        className="mx-auto flex max-w-7xl items-center justify-between p-6 lg:px-8"
        aria-label="Global"
      >
        <div className="flex items-center gap-x-12">
          <span className="sr-only">Datopian</span>
          <Link href="/">
            <img
              src="/images/logos/MainLogo.svg"
              width="60px"
              height="60px"
              alt={t("nav.logoAlt")}
            ></img>
          </Link>
          <div className="hidden lg:flex lg:gap-x-12">
            <li className="flex gap-x-8 align-center">
              <Link href="/search" className="font-semibold text-white my-auto">
                {t("nav.datasets")}
              </Link>
              <Link
                href="/organizations"
                className="font-semibold text-white my-auto"
              >
                {t("nav.organizations")}
              </Link>
              <Link href="/glossaries" className="font-semibold text-white my-auto">
                {t("nav.glossary")}
              </Link>
            </li>
          </div>
        </div>
        <div className="hidden lg:flex items-center gap-2">
          <ThemeSelector variant="dark" />
          <LanguageSelector variant="dark" />
        </div>
        <div className="flex items-center gap-2 lg:hidden">
          <ThemeSelector variant="dark" />
          <LanguageSelector variant="dark" />
          <button
            type="button"
            className="-m-2.5 inline-flex items-center justify-center rounded-md p-2.5 text-gray-700 bg-white"
            onClick={() => setMobileMenuOpen(true)}
          >
            <span className="sr-only">{t("nav.openMainMenu")}</span>
            <Bars3Icon className="h-6 w-6" aria-hidden="true" />
          </button>
        </div>
      </nav>
      <Dialog
        as="div"
        className="lg:hidden"
        open={mobileMenuOpen}
        onClose={setMobileMenuOpen}
      >
        <div className="fixed inset-0 z-10" />
        <Dialog.Panel className="fixed inset-y-0 right-0 z-10 w-full overflow-y-auto bg-black px-6 py-6 sm:max-w-sm sm:ring-1 sm:ring-gray-900/10">
          <div className="flex items-center justify-between">
            <span className="sr-only">Datopian</span>
            <Link href="/" className="-m-1.5 p-1.5">
              <img
                src="/images/logos/MainLogo.svg"
                width="60px"
                height="60px"
                alt={t("nav.logoAlt")}
              ></img>
            </Link>
            <button
              type="button"
              className="-m-2.5 rounded-md p-2.5 text-white"
              onClick={() => setMobileMenuOpen(false)}
            >
              <span className="sr-only">{t("nav.closeMenu")}</span>
              <XMarkIcon className="h-6 w-6" aria-hidden="true" />
            </button>
          </div>
          <div className="mt-6 flow-root">
            <div className="-my-6 divide-y divide-gray-500/10">
              <div className="space-y-2 py-6 flex flex-col">
                <Link
                  href="/search"
                  className="font-semibold text-white my-auto"
                >
                  {t("nav.datasets")}
                </Link>
                <Link
                  href="/organizations"
                  className="font-semibold text-white my-auto"
                >
                  {t("nav.organizations")}
                </Link>
                <Link
                  href="/glossaries"
                  className="font-semibold text-white my-auto"
                >
                  {t("nav.glossary")}
                </Link>
              </div>
            </div>
          </div>
        </Dialog.Panel>
      </Dialog>
    </header>
  );
}
