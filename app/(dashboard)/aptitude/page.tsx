
"use client"

import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Calculator, Clock, TrendingUp, Briefcase, Brain, ChevronRight, Percent, CircleDollarSign, Coins, BarChart3, Binary, Code, Users, Map, Hourglass, Gauge, Hash, Compass, Landmark, Scale, Sigma } from "lucide-react"

const categories = [
  {
    name: "Arithmetic",
    icon: Calculator,
    color: "text-blue-400",
    topics: [
      { name: "Percentages", icon: Percent, color: "text-green-400", bg: "bg-green-500/10" },
      { name: "Profit & Loss", icon: CircleDollarSign, color: "text-yellow-400", bg: "bg-yellow-500/10" },
      { name: "Simple Interest", icon: Landmark, color: "text-blue-400", bg: "bg-blue-500/10" },
      { name: "Compound Interest", icon: TrendingUp, color: "text-indigo-400", bg: "bg-indigo-500/10" },
      { name: "Time & Work", icon: Hourglass, color: "text-orange-400", bg: "bg-orange-500/10" },
      { name: "Time Speed Distance", icon: Gauge, color: "text-red-400", bg: "bg-red-500/10" },
      { name: "Ratio & Proportion", icon: Scale, color: "text-cyan-400", bg: "bg-cyan-500/10" },
      { name: "Averages", icon: Sigma, color: "text-teal-400", bg: "bg-teal-500/10" }
    ]
  },
  {
    name: "Reasoning",
    icon: Brain,
    color: "text-purple-400",
    topics: [
      { name: "Number Series", icon: Hash, color: "text-purple-400", bg: "bg-purple-500/10" },
      { name: "Coding Decoding", icon: Code, color: "text-pink-400", bg: "bg-pink-500/10" },
      { name: "Blood Relations", icon: Users, color: "text-red-400", bg: "bg-red-500/10" },
      { name: "Direction Sense", icon: Compass, color: "text-teal-400", bg: "bg-teal-500/10" },
      { name: "Seating Arrangement", icon: Briefcase, color: "text-orange-400", bg: "bg-orange-500/10" }, // Placeholder icon
      { name: "Syllogism", icon: Brain, color: "text-fuchsia-400", bg: "bg-fuchsia-500/10" },
      { name: "Clocks & Calendars", icon: Clock, color: "text-sky-400", bg: "bg-sky-500/10" }
    ]
  }
]

export default function AptitudePage() {
  return (
    <div className="p-8 max-w-7xl mx-auto text-slate-100">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white mb-2">Aptitude Practice Arena 🧠</h1>
          <p className="text-slate-400">Master the essential topics for your placement exams.</p>
        </div>
      </div>

      <div className="grid gap-10">
        {categories.map((cat, idx) => (
          <div key={idx} className="space-y-4">
            <h2 className="text-xl font-bold flex items-center gap-3 text-white">
              <div className={`p-2 rounded-lg bg-white/5 ${cat.color}`}>
                <cat.icon className="w-5 h-5" />
              </div>
              {cat.name}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {cat.topics.map((topic) => (
                <Link href={`/aptitude/practice?topic=${encodeURIComponent(topic.name)}`} key={topic.name}>
                  <Card className="bg-[#1E293B]/40 border-white/5 hover:border-blue-500/50 hover:bg-[#1E293B]/80 hover:shadow-[0_0_15px_rgba(59,130,246,0.1)] transition-all duration-300 cursor-pointer h-full group">
                    <CardHeader className="p-5 flex flex-row items-center gap-4 space-y-0">
                      <div className={`w-10 h-10 shrink-0 rounded-lg ${topic.bg} flex items-center justify-center transition-transform group-hover:scale-110`}>
                        <topic.icon className={`w-5 h-5 ${topic.color}`} />
                      </div>
                      <CardTitle className="text-base font-medium text-slate-200 group-hover:text-white transition-colors flex-1">
                        {topic.name}
                      </CardTitle>
                      <ChevronRight className="w-5 h-5 text-slate-600 group-hover:text-blue-400 transition-colors shrink-0" />
                    </CardHeader>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
