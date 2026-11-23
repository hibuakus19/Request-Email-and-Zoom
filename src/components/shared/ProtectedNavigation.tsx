"use client";

import { useEffect, useRef, useState, type RefObject } from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { authLogout } from "@/lib/auth/actions";
import { CloseIcon, LogOutIcon, MailIcon, VideoIcon } from "@/components/icons";

type ProtectedNavigationProps = {
  isAdmin: boolean;
  userName: string;
};

type SidebarLink = {
  label: string;
  href: string;
  active: boolean;
  icon: "dashboard" | "email" | "zoom";
};

export default function ProtectedNavigation({
  isAdmin,
  userName,
}: ProtectedNavigationProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isDesktopSidebarHidden, setIsDesktopSidebarHidden] = useState(false);
  const mobileMenuButtonRef = useRef<HTMLButtonElement>(null);
  const mobileCloseButtonRef = useRef<HTMLButtonElement>(null);
  const currentView = searchParams.get("view") === "user" ? "user" : "admin";
  const isEmailPage = pathname === "/home/email";
  const isZoomPage = pathname === "/home/zoom";
  const isAccountPage = pathname === "/home/account";
  const pageTitle = isEmailPage
    ? "Request Email"
    : isZoomPage
      ? "Request Zoom"
      : isAccountPage
        ? "Informasi Akun"
        : "Dashboard";
  const dashboardHref = isAdmin ? `/home?view=${currentView}` : "/home";
  const accountHref = isAdmin
    ? `/home/account?view=${currentView}`
    : "/home/account";
  const links: SidebarLink[] = [
    {
      label: "Dashboard",
      href: dashboardHref,
      active: pathname === "/home",
      icon: "dashboard",
    },
  ];

  if (isAdmin && isEmailPage) {
    links.push(
      {
        label: "Permohonan Email (User)",
        href: "/home/email?view=user",
        active: currentView === "user",
        icon: "email",
      },
      {
        label: "Manajemen Email (Admin)",
        href: "/home/email?view=admin",
        active: currentView === "admin",
        icon: "email",
      },
    );
  } else if (isAdmin && isZoomPage) {
    links.push(
      {
        label: "Permohonan Link Zoom (User)",
        href: "/home/zoom?view=user",
        active: currentView === "user",
        icon: "zoom",
      },
      {
        label: "Manajemen Link Zoom (Admin)",
        href: "/home/zoom?view=admin",
        active: currentView === "admin",
        icon: "zoom",
      },
    );
  } else if (isEmailPage) {
    links.push({
      label: "Permohonan Email",
      href: "/home/email",
      active: true,
      icon: "email",
    });
  } else if (isZoomPage) {
    links.push({
      label: "Permohonan Link Zoom",
      href: "/home/zoom",
      active: true,
      icon: "zoom",
    });
  }

  const initials = userName.trim().charAt(0).toUpperCase() || "U";
  const roleLabel = isAdmin ? "ADMINISTRATOR" : "KARYAWAN";
  const closeMobileMenu = () => {
    setIsMobileOpen(false);
    mobileMenuButtonRef.current?.focus();
  };

  useEffect(() => {
    if (!isMobileOpen) {
      return;
    }

    mobileCloseButtonRef.current?.focus();

    function handleMobileMenuKeys(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsMobileOpen(false);
        mobileMenuButtonRef.current?.focus();
        return;
      }

      if (event.key !== "Tab") {
        return;
      }

      const focusable = document.querySelectorAll<HTMLElement>(
        "#protected-sidebar-mobile-panel a[href], #protected-sidebar-mobile-panel button:not([disabled])",
      );
      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (!first || !last) {
        return;
      }

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }

    document.addEventListener("keydown", handleMobileMenuKeys);

    return () => document.removeEventListener("keydown", handleMobileMenuKeys);
  }, [isMobileOpen]);

  return (
    <>
      <div className="sticky top-0 z-30 flex min-h-14 items-center gap-3 border-b border-white/10 bg-ink px-4 text-white lg:hidden">
        <button
          type="button"
          aria-label="Buka menu navigasi"
          aria-expanded={isMobileOpen}
          aria-controls="protected-sidebar-mobile"
          ref={mobileMenuButtonRef}
          onClick={() => setIsMobileOpen(true)}
          className="grid size-10 shrink-0 place-items-center rounded-lg text-white/80 transition hover:bg-white/10 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
        >
          <svg
            aria-hidden="true"
            viewBox="0 0 24 24"
            width="21"
            height="21"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
          >
            <path d="M4 7h16M4 12h16M4 17h16" />
          </svg>
        </button>
        <p className="truncate text-title-xs font-semibold">{pageTitle}</p>
      </div>

      <div className="hidden lg:block">
        {isDesktopSidebarHidden ? null : (
          <SidebarPanel
            id="protected-sidebar"
            title={pageTitle}
            links={links}
            userName={userName}
            initials={initials}
            roleLabel={roleLabel}
            accountHref={accountHref}
            onHide={() => setIsDesktopSidebarHidden(true)}
          />
        )}
      </div>

      {isDesktopSidebarHidden ? (
        <button
          type="button"
          aria-label="Tampilkan sidebar"
          title="Tampilkan sidebar"
          onClick={() => setIsDesktopSidebarHidden(false)}
          className="fixed left-4 top-4 z-40 hidden size-10 place-items-center rounded-xl border border-line bg-surface text-ink-soft shadow-card transition hover:border-accent/30 hover:bg-accent-soft hover:text-accent-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent lg:grid"
        >
          <SidebarToggleIcon direction="right" />
        </button>
      ) : null}

      {isMobileOpen ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            aria-label="Tutup menu navigasi"
            onClick={closeMobileMenu}
            className="absolute inset-0 bg-ink/55"
          />
          <div
            id="protected-sidebar-mobile"
            role="dialog"
            aria-modal="true"
            aria-label="Menu navigasi"
            className="relative h-full w-fit"
          >
            <SidebarPanel
              id="protected-sidebar-mobile-panel"
              title={pageTitle}
              links={links}
              userName={userName}
              initials={initials}
              roleLabel={roleLabel}
              accountHref={accountHref}
              onNavigate={closeMobileMenu}
              onClose={closeMobileMenu}
              closeButtonRef={mobileCloseButtonRef}
            />
          </div>
        </div>
      ) : null}
    </>
  );
}

type SidebarPanelProps = {
  id: string;
  title: string;
  links: SidebarLink[];
  userName: string;
  initials: string;
  roleLabel: string;
  accountHref: string;
  onNavigate?: () => void;
  onClose?: () => void;
  onHide?: () => void;
  closeButtonRef?: RefObject<HTMLButtonElement | null>;
};

function SidebarPanel({
  id,
  title,
  links,
  userName,
  initials,
  roleLabel,
  accountHref,
  onNavigate,
  onClose,
  onHide,
  closeButtonRef,
}: SidebarPanelProps) {
  return (
    <aside
      id={id}
      aria-label="Navigasi utama"
      className="flex h-dvh w-[min(18rem,86vw)] flex-col bg-ink text-white lg:sticky lg:top-0 lg:w-72"
    >
      <div className="flex min-h-20 items-center justify-between gap-3 border-b border-white/10 px-5 py-3">
        <p className="min-w-0 flex-1 text-title font-semibold tracking-[-0.02em]">
          {title}
        </p>
        {onHide ? (
          <button
            type="button"
            onClick={onHide}
            aria-label="Sembunyikan sidebar"
            title="Sembunyikan sidebar"
            className="grid size-9 shrink-0 place-items-center rounded-lg text-white/70 transition hover:bg-white/10 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
          >
            <SidebarToggleIcon />
          </button>
        ) : null}
        {onClose ? (
          <button
            type="button"
            ref={closeButtonRef}
            onClick={onClose}
            aria-label="Tutup menu navigasi"
            className="grid size-10 shrink-0 place-items-center rounded-lg text-white/70 transition hover:bg-white/10 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
          >
            <CloseIcon size={19} />
          </button>
        ) : null}
      </div>

      <nav
        aria-label="Menu aplikasi"
        className="flex-1 overflow-y-auto px-3 py-5"
      >
        <ul className="space-y-2">
          {links.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                aria-current={link.active ? "page" : undefined}
                onClick={onNavigate}
                className={`flex min-h-12 items-center gap-3 rounded-xl px-4 text-body transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white ${
                  link.active
                    ? "bg-accent font-semibold text-white"
                    : "text-white/70 hover:bg-white/10 hover:text-white"
                }`}
              >
                <SidebarIcon icon={link.icon} />
                <span className="min-w-0">{link.label}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      <div className="border-t border-white/10 p-4">
        <div className="flex items-center gap-2">
          <Link
            href={accountHref}
            onClick={onNavigate}
            aria-label={`Account: ${userName}`}
            className="flex min-h-12 min-w-0 flex-1 items-center gap-3 rounded-xl px-1.5 text-left transition hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
          >
            <span
              aria-hidden="true"
              className="grid size-11 shrink-0 place-items-center rounded-full bg-accent text-body-lg font-semibold text-white"
            >
              {initials}
            </span>
            <span className="min-w-0">
              <span className="block truncate text-label font-medium text-white">
                {userName}
              </span>
              <span className="mt-0.5 block truncate text-micro font-medium tracking-[0.06em] text-white/55">
                Account · {roleLabel}
              </span>
            </span>
          </Link>

          <form action={authLogout}>
            <button
              type="submit"
              aria-label="Log out"
              className="grid size-11 shrink-0 place-items-center rounded-xl bg-danger text-white transition hover:bg-danger/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
            >
              <LogOutIcon size={19} />
            </button>
          </form>
        </div>
      </div>
    </aside>
  );
}

function SidebarToggleIcon({
  direction = "left",
}: {
  direction?: "left" | "right";
}) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      width="19"
      height="19"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="3.5" y="4.5" width="17" height="15" rx="2" />
      <path
        d={
          direction === "left"
            ? "M9 5v14M15 9l-3 3 3 3"
            : "M9 5v14M12 9l3 3-3 3"
        }
      />
    </svg>
  );
}

function SidebarIcon({ icon }: { icon: SidebarLink["icon"] }) {
  if (icon === "email") {
    return <MailIcon size={19} className="shrink-0" />;
  }

  if (icon === "zoom") {
    return <VideoIcon size={19} className="shrink-0" />;
  }

  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      width="19"
      height="19"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinejoin="round"
      className="shrink-0"
    >
      <rect x="4" y="4" width="6" height="6" rx="1" />
      <rect x="14" y="4" width="6" height="6" rx="1" />
      <rect x="4" y="14" width="6" height="6" rx="1" />
      <rect x="14" y="14" width="6" height="6" rx="1" />
    </svg>
  );
}
