import Link from "next/link";

export function SiteFooter() {
  const year = new Date().getFullYear();
  return (
    <footer className="border-t border-foreground/10 mt-16">
      <div className="mx-auto max-w-6xl flex flex-col sm:flex-row items-center justify-between gap-4 px-4 sm:px-6 lg:px-8 py-6 text-sm text-foreground/60">
        <p>© {year} PunkFlow</p>
        <nav aria-label="Secondary" className="flex items-center gap-5">
          <Link href="/api/rss" className="hover:text-foreground">
            RSS
          </Link>
          <a
            href="https://bsky.app/profile/punkflow.com"
            target="_blank"
            rel="me noopener noreferrer"
            className="hover:text-foreground"
          >
            Bluesky
          </a>
        </nav>
      </div>
    </footer>
  );
}
