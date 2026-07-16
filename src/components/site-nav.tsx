"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { AccountMenu } from "@/components/account-menu";
import { cn } from "@/lib/utils";

const primaryLinks = [
  { href: "/", label: "Home" },
  { href: "/quick-generating", label: "Image" },
  { href: "/audio", label: "Audio" },
  { href: "/project", label: "Project" },
];

function isActivePath(pathname: string, href: string) {
  if (href === "/") {
    return pathname === "/";
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

function NavLink({ href, label }: { href: string; label: string }) {
  const pathname = usePathname();
  const active = isActivePath(pathname, href);

  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={cn(
        "inline-flex h-9 items-center rounded-md px-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none sm:px-3 sm:text-sm",
        active && "bg-foreground text-background hover:bg-foreground hover:text-background",
      )}
    >
      {label}
    </Link>
  );
}

export function SiteNav() {
  const pathname = usePathname();

  if (pathname.startsWith("/project/assets/")) {
    return null;
  }

  return (
    <header className="sticky top-0 z-50 border-b bg-background/90 backdrop-blur">
      <nav
        aria-label="Main navigation"
        className="grid min-h-14 grid-cols-[1fr_auto_1fr] items-center gap-2 px-3 sm:px-6"
      >
        <div aria-hidden="true" />
        <div className="flex items-center justify-center gap-1 sm:gap-2">
          {primaryLinks.map((link) => (
            <NavLink key={link.href} href={link.href} label={link.label} />
          ))}
        </div>
        <div className="flex justify-end">
          <AccountMenu />
        </div>
      </nav>
    </header>
  );
}
