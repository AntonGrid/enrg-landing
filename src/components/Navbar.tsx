import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { LINKS, NAV_ITEMS } from "../config";
import { ExternalIcon, Logo } from "./ui";

function NavLink({
  label,
  href,
  external,
  onClick,
}: {
  label: string;
  href: string;
  external: boolean;
  onClick?: () => void;
}) {
  const classes =
    "font-mono text-[12px] uppercase tracking-[0.22em] text-slate-400 transition-colors duration-300 hover:text-neon-soft hover:[text-shadow:0_0_12px_rgba(103,232,249,0.6)]";
  if (external) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={classes}
        onClick={onClick}
      >
        {label}
        <ExternalIcon className="ml-1 inline h-3 w-3 opacity-60" />
      </a>
    );
  }
  return (
    <a href={href} className={classes} onClick={onClick}>
      {label}
    </a>
  );
}

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <motion.header
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className={`fixed inset-x-0 top-0 z-50 border-b transition-all duration-300 ${
        scrolled
          ? "border-neon/15 bg-void/80 backdrop-blur-xl shadow-[0_4px_30px_rgba(34,211,238,0.06)]"
          : "border-transparent bg-transparent"
      }`}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <a href="#home" className="flex items-center gap-3" onClick={() => setOpen(false)}>
          <Logo size="sm" />
        </a>

        {/* Desktop menu */}
        <nav className="hidden items-center gap-7 lg:flex" aria-label="Основная навигация">
          {NAV_ITEMS.map((item) => (
            <NavLink key={item.label} {...item} />
          ))}
        </nav>

        <div className="hidden items-center gap-4 lg:flex">
          <a
            href={LINKS.axisConnect}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-neon !px-5 !py-2 !text-[12px]"
          >
            Подключить устройство
            <ExternalIcon className="h-3.5 w-3.5" />
          </a>
        </div>

        {/* Mobile burger */}
        <button
          type="button"
          aria-label={open ? "Закрыть меню" : "Открыть меню"}
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
          className="flex h-10 w-10 items-center justify-center rounded-md border border-neon/25 text-neon-soft lg:hidden"
        >
          <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            {open ? (
              <path d="M6 6l12 12M18 6 6 18" />
            ) : (
              <path d="M4 7h16M4 12h16M4 17h16" />
            )}
          </svg>
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <motion.nav
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.25 }}
          className="border-t border-neon/15 bg-void/95 backdrop-blur-xl lg:hidden"
          aria-label="Мобильная навигация"
        >
          <div className="flex flex-col gap-1 px-4 py-4">
            {NAV_ITEMS.map((item) => (
              <NavLink key={item.label} {...item} onClick={() => setOpen(false)} />
            ))}
            <a
              href={LINKS.axisConnect}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-neon mt-3 w-full"
              onClick={() => setOpen(false)}
            >
              Подключить устройство
              <ExternalIcon className="h-4 w-4" />
            </a>
          </div>
        </motion.nav>
      )}
    </motion.header>
  );
}
