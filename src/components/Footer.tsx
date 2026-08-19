import { LINKS } from "../config";
import { ExternalIcon, Logo } from "./ui";

const FOOTER_COLUMNS = [
  {
    title: "Протокол",
    links: [
      { label: "Whitepaper", href: LINKS.whitepaper, external: false },
      { label: "Техническая документация", href: LINKS.technicalOverview, external: false },
      { label: "GitHub · ENRG", href: LINKS.docs, external: true },
      { label: "Explorer Solana", href: LINKS.explorer, external: true },
    ],
  },
  {
    title: "Продукт",
    links: [
      { label: "Axis Connect PWA", href: LINKS.axisConnect, external: true },
      { label: "Скачать приложение", href: LINKS.axisConnect, external: true },
    ],
  },
  {
    title: "Сообщество",
    links: [
      { label: "X (Twitter)", href: LINKS.x, external: true },
      { label: "Telegram", href: LINKS.telegram, external: true },
      { label: "Связаться", href: LINKS.contact, external: false },
    ],
  },
];

export default function Footer() {
  return (
    <footer className="relative border-t border-line bg-abyss/60">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-10 md:grid-cols-4">
          <div className="col-span-2 md:col-span-1">
            <Logo size="sm" />
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-slate-500">
              Открытый стандарт доверия между физическим и цифровым миром. Первая
              референсная реализация — на Solana.
            </p>
            <p className="mt-4 font-mono text-[10px] uppercase tracking-[0.25em] text-slate-600">
              The protocol is governed.
              <br />
              The protocol is not owned.
            </p>
          </div>

          {FOOTER_COLUMNS.map((col) => (
            <nav key={col.title} aria-label={col.title}>
              <h3 className="font-mono text-[11px] uppercase tracking-[0.3em] text-neon-soft">
                {col.title}
              </h3>
              <ul className="mt-4 space-y-3">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      target={link.external ? "_blank" : undefined}
                      rel={link.external ? "noopener noreferrer" : undefined}
                      className="group inline-flex items-center gap-1.5 text-sm text-slate-400 transition-colors hover:text-neon-soft"
                    >
                      {link.label}
                      {link.external && (
                        <ExternalIcon className="h-3 w-3 opacity-50 transition-opacity group-hover:opacity-100" />
                      )}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-line pt-6 sm:flex-row">
          <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-slate-600">
            © 2026 ENRG Protocol. Built on Solana.
          </p>
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-slate-700">
            SRC · Axis Connect · ESP32
          </p>
        </div>
      </div>
    </footer>
  );
}
