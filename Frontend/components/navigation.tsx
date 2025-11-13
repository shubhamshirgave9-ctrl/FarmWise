"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Sprout, LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"

export function Navigation({ showAuthOnly = false }: { showAuthOnly?: boolean }) {
  const pathname = usePathname()
  const router = useRouter()

  const links = pathname.includes("/farm") ? [{ href: "/home", label: "Home" }] : [{ href: "/home", label: "Home" }]

  return (
    <nav className="border-b border-border/30 bg-card/50 backdrop-blur-sm sticky top-0 z-50 shadow-sm transition-smooth hover:shadow-md">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link
            href={showAuthOnly ? "/" : "/home"}
            className="flex items-center gap-2 font-bold text-lg bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent hover:opacity-80 transition-smooth group"
          >
            <div className="bg-gradient-to-br from-primary to-accent p-2 rounded-lg transition-smooth group-hover:scale-110 group-hover:shadow-lg">
              <Sprout className="w-5 h-5 text-white" />
            </div>
            FarmTracker
          </Link>

          <div className="hidden md:flex items-center gap-1">
            {links.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-smooth ${
                  pathname === href
                    ? "bg-primary text-primary-foreground shadow-md scale-100 animate-scale-in"
                    : "text-foreground hover:bg-muted/50 hover:scale-105"
                }`}
              >
                {label}
              </Link>
            ))}
          </div>

          {!showAuthOnly && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push("/")}
              className="gap-2 hover:bg-muted/50 transition-smooth hover:scale-105 active:scale-95"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </Button>
          )}
        </div>
      </div>
    </nav>
  )
}
