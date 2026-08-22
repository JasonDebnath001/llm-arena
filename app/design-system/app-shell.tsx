"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { Brand } from "./brand";
import { Icon, type IconName } from "./icons";

type NavigationItem = Readonly<{
  href: string;
  icon: IconName;
  label: string;
}>;

const navigation: readonly NavigationItem[] = [
  { href: "/", icon: "arena", label: "Arena" },
  { href: "/leaderboard", icon: "leaderboard", label: "Leaderboard" },
  { href: "/models", icon: "models", label: "Models" },
  { href: "/history", icon: "history", label: "History" },
];

function isCurrentPath(pathname: string, href: string) {
  return href === "/" ? pathname === href : pathname.startsWith(href);
}

function NavigationLink({ href, icon, label }: NavigationItem) {
  const pathname = usePathname();
  const isCurrent = isCurrentPath(pathname, href);

  return (
    <Link
      className="navigation-link"
      href={href}
      aria-current={isCurrent ? "page" : undefined}
    >
      <Icon className="navigation-icon" name={icon} />
      <span>{label}</span>
    </Link>
  );
}

export function AppShell({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <div className="app-shell">
      <a className="skip-link" href="#main-content">
        Skip to main content
      </a>

      <aside className="sidebar">
        <Brand />
        <nav className="primary-navigation" aria-label="Primary navigation">
          {navigation.map((item) => (
            <NavigationLink key={item.href} {...item} />
          ))}
        </nav>
        <div className="sidebar-foot">
          <button className="account-button" type="button">
            <span className="account-avatar" aria-hidden="true">
              <Icon name="user" />
            </span>
            <span>
              <strong>Guest session</strong>
              <small>Sign in to vote</small>
            </span>
          </button>
        </div>
      </aside>

      <div className="mobile-topbar">
        <Brand />
        <button
          className="icon-button"
          type="button"
          aria-label="Open account menu"
        >
          <Icon name="user" />
        </button>
      </div>

      <main className="main-content" id="main-content" tabIndex={-1}>
        {children}
      </main>

      <nav className="mobile-navigation" aria-label="Primary navigation">
        {navigation.map((item) => (
          <NavigationLink key={item.href} {...item} />
        ))}
      </nav>
    </div>
  );
}
