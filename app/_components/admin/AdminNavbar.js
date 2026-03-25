"use client"

import Link from "next/link"
import { signOut } from "next-auth/react"
import { usePathname } from "next/navigation"

export default function AdminNavbar({ user }) {
  const pathname = usePathname()
  const navItems = [
    { href: "/admin", label: "Dashboard" },
    { href: "/admin/students", label: "Students" },
    { href: "/admin/events", label: "Events" },
    { href: "/admin/results", label: "Results" },
  ]

  return (
    <nav className="sticky top-0 z-40 border-b border-white/[0.06] bg-[#111111]/95 px-4 py-4 text-white backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-amber-400/80">
            SKF Admin
          </p>
          <div className="mt-1 flex items-center gap-2">
            <span className="text-sm font-medium text-white/85">
              {user?.name || "Admin"}
            </span>
            <span className="inline-flex rounded-full border border-white/[0.08] bg-white/[0.05] px-2.5 py-0.5 text-xs font-medium capitalize text-white/55">
              {user?.role || "staff"}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {navItems.map((item) => {
            const isActive =
              item.href === "/admin"
                ? pathname === item.href
                : pathname.startsWith(item.href)

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`rounded-lg px-3 py-2 text-sm transition ${
                  isActive
                    ? "bg-white/[0.08] text-white"
                    : "text-white/55 hover:bg-white/[0.04] hover:text-white/85"
                }`}
              >
                {item.label}
              </Link>
            )
          })}
        </div>

        <button
          onClick={() => signOut({ callbackUrl: "/admin/login" })}
          className="rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-2 text-sm text-red-300 transition hover:bg-red-500/20"
        >
          Sign Out
        </button>
      </div>
    </nav>
  )
}
