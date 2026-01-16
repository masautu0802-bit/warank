import Link from 'next/link';

export function Footer() {
  return (
    <footer className="border-t bg-background">
      <div className="container py-6 px-4">
        <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
          <div className="flex flex-col items-center gap-2 md:flex-row md:gap-4">
            <p className="text-sm text-muted-foreground">
              © 2025 Wa-Rank. All rights reserved.
            </p>
          </div>
          <div className="flex items-center gap-4">
            <Link
              href="/about"
              className="text-sm text-muted-foreground hover:text-primary"
            >
              このサイトについて
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
