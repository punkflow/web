import Link from "next/link";

export function SiteHeader() {
  return (
    <header className="border-b border-foreground/10">
      <div className="mx-auto max-w-6xl flex items-center justify-between px-4 sm:px-6 lg:px-8 py-4">
        <Link
          href="/"
          className="text-lg font-semibold tracking-tight hover:opacity-80"
        >
          PunkFlow
        </Link>
        <nav
          aria-label="Primary"
          className="flex items-center gap-4 text-sm text-foreground/70"
        >
          {/* about + manifesto links land here once those pages exist */}
        </nav>
      </div>
    </header>
  );
}
