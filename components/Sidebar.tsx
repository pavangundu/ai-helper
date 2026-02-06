"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  BookOpen,
  Code2,
  GraduationCap,
  Map,
  Bot,
  Shield,
  Settings,
  FileText,
  LogOut,
  Trash2
} from "lucide-react"
import { cn } from "@/lib/utils"
import { ApiKeyDialog } from "@/components/ApiKeyDialog"

const sidebarLinks = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/roadmap", label: "My Roadmap", icon: Map },
  { href: "/aptitude", label: "Aptitude", icon: BookOpen },
  { href: "/dsa/practice", label: "DSA", icon: Code2 },
  { href: "/core-skills", label: "Core Skills", icon: GraduationCap },
  { href: "/resume", label: "Resume Builder", icon: FileText },
  { href: "/mentor", label: "AI Mentor", icon: Bot },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="w-64 bg-[#0B1120] border-r border-[#1E293B] flex flex-col hidden md:flex text-slate-300">
      {/* Logo */}
      <div className="p-6 flex items-center gap-3">
        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-500/20">
          <GraduationCap className="w-5 h-5 text-white" />
        </div>
        <div className="font-bold text-xl text-white tracking-tight">AI JobPrep</div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-4 space-y-2">
        {sidebarLinks.map((link) => {
          const isActive = pathname.startsWith(link.href) && link.href !== "/dashboard" || pathname === link.href

          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group font-medium",
                isActive
                  ? "bg-blue-600 text-white shadow-lg shadow-blue-900/20"
                  : "hover:bg-[#1E293B] hover:text-white"
              )}
            >
              <link.icon className={cn("w-5 h-5", isActive ? "text-white" : "text-slate-400 group-hover:text-white")} />
              {link.label}
            </Link>
          )
        })}
      </nav>

      {/* Footer / Shield */}
      <div className="p-4 mt-auto">
        <div className="bg-[#1E293B]/50 rounded-xl p-4 border border-[#334155] backdrop-blur-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-yellow-500/10 rounded-lg">
              <Shield className="w-5 h-5 text-yellow-500" />
            </div>
            <div>
              <div className="text-sm font-semibold text-white">Streak Shield</div>
              <div className="text-xs text-slate-400">1 Left</div>
            </div>
          </div>
          <Link
            href="/settings"
            className="flex items-center gap-2 text-sm text-slate-400 hover:text-white mt-4 px-1 transition-colors"
          >
            <Settings className="w-4 h-4" /> Preferences
          </Link>
          <button
            onClick={() => {
              localStorage.removeItem("user")
              localStorage.removeItem("roadmap")
              document.cookie = "token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;"
              window.location.href = "/login"
            }}
            className="flex items-center gap-2 text-sm text-slate-400 hover:text-white mt-2 px-1 transition-colors w-full text-left"
          >
            <LogOut className="w-4 h-4" /> Logout
          </button>

          <button
            onClick={async () => {
              if (window.confirm("Are you sure you want to delete your account? This action cannot be undone.")) {
                const stored = localStorage.getItem("user");
                if (stored) {
                  const user = JSON.parse(stored);
                  try {
                    await fetch(`/api/user/delete?email=${user.email}`, { method: 'DELETE' });
                  } catch (e) {
                    console.error("Delete failed", e);
                  }
                }

                localStorage.clear();
                document.cookie = "token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;"
                window.location.href = "/";
              }
            }}
            className="flex items-center gap-2 text-sm text-red-500/70 hover:text-red-500 mt-2 px-1 transition-colors w-full text-left"
          >
            <Trash2 className="w-4 h-4" /> Delete Account
          </button>

          <ApiKeyDialog className="flex items-center gap-2 text-sm text-slate-400 hover:text-white mt-2 px-1 transition-colors cursor-pointer group" />
        </div>
      </div>
    </aside>
  )
}
