"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Sprout, LogOut, Moon, Sun, Menu } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useTheme } from "next-themes"
import { useEffect, useState } from "react"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"

export function Navigation({ showAuthOnly = false }: { showAuthOnly?: boolean }) {
  const pathname = usePathname()
  const router = useRouter()
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const links = pathname.includes("/farm")
    ? [
        { href: "/home", label: "Home" },
        { href: "/crop-prediction", label: "Crop Predictor" },
      ]
    : [
        { href: "/home", label: "Home" },
        { href: "/crop-prediction", label: "Crop Predictor" },
      ]

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link
            href={showAuthOnly ? "/" : "/home"}
            className="flex items-center gap-2 font-bold text-lg bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent hover:from-green-700 hover:to-emerald-700 transition-all"
          >
            <div className="p-1.5 rounded-lg bg-gradient-to-br from-green-500 to-emerald-600 shadow-lg shadow-green-500/20">
              <Sprout className="w-5 h-5 text-white" />
            </div>
            <span className="hidden sm:inline">FarmTracker</span>
          </Link>

          <div className="hidden md:flex items-center gap-1">
            {links.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  pathname === href
                    ? "bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-md shadow-green-500/20"
                    : "text-foreground hover:bg-muted/80 hover:text-foreground"
                }`}
              >
                {label}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-2">
            {mounted && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                className="h-9 w-9"
              >
                <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                <span className="sr-only">Toggle theme</span>
              </Button>
            )}

          {!showAuthOnly && (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => router.push("/")}
                  className="hidden sm:flex gap-2"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </Button>
                <Sheet>
                  <SheetTrigger asChild className="md:hidden">
                    <Button variant="ghost" size="icon" className="md:hidden">
                      <Menu className="h-5 w-5" />
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="right" className="w-[300px] sm:w-[400px]">
                    <div className="flex flex-col gap-4 mt-8">
                      {links.map(({ href, label }) => (
                        <Link
                          key={href}
                          href={href}
                          className={`px-4 py-3 rounded-lg text-base font-medium transition-all ${
                            pathname === href
                              ? "bg-gradient-to-r from-green-500 to-emerald-500 text-white"
                              : "hover:bg-muted"
                          }`}
                        >
                          {label}
                        </Link>
                      ))}
                      <Button
                        variant="outline"
                        onClick={() => router.push("/")}
                        className="w-full justify-start gap-2"
                      >
              <LogOut className="w-4 h-4" />
              Logout
            </Button>
                    </div>
                  </SheetContent>
                </Sheet>
              </>
          )}
          </div>
        </div>
      </div>
    </nav>
  )
}
