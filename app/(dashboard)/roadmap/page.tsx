"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Badge } from "@/components/ui/badge"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Brain, Code, Cpu, CheckCircle2, Circle, Trophy, Map, Zap } from "lucide-react"
import { cn } from "@/lib/utils"

export default function RoadmapPage() {
  const router = useRouter()
  const [roadmap, setRoadmap] = useState<any>(null)
  const [progress, setProgress] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const stored = localStorage.getItem("user")
    if (stored) {
      const user = JSON.parse(stored)
      fetchRoadmap(user.email)
    } else {
      router.push("/login")
    }
  }, [router])

  async function fetchRoadmap(email: string) {
    try {
      const res = await fetch(`/api/roadmap?email=${email}`)
      if (res.ok) {
        const data = await res.json()
        setRoadmap(data.roadmap)
        if (typeof data.percentCompleted === 'number') {
          setProgress(data.percentCompleted)
        }
      }
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) return (
    <div className="flex flex-col items-center justify-center h-[80vh] space-y-4 text-white">
      <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      <p className="text-slate-400 animate-pulse font-medium">Charting your course to success...</p>
    </div>
  )

  if (!roadmap) return (
    <div className="flex flex-col items-center justify-center h-[80vh] space-y-6 text-center text-slate-300">
      <div className="bg-slate-800/50 p-6 rounded-full border border-slate-700">
        <Map className="w-16 h-16 text-slate-500" />
      </div>
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">No Roadmap Found</h1>
        <p className="text-slate-400 max-w-md mx-auto">
          Head to the dashboard to generate your personalized AI learning plan.
        </p>
      </div>
      <button onClick={() => router.push('/dashboard')} className="px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-full font-medium transition-colors">
        Go to Dashboard
      </button>
    </div>
  )

  return (
    <div className="p-6 md:p-10 max-w-[1200px] mx-auto space-y-12">

      {/* Header Area */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-slate-800/50 pb-8">
        <div className="space-y-4">
          <div>
            <div className="flex items-center gap-2 text-sm font-medium text-blue-400 mb-2">
              <Map className="w-4 h-4" /> YOUR MASTER PLAN
            </div>
            <h1 className="text-4xl md:text-5xl font-black tracking-tight text-white mb-2">
              My Learning Journey
            </h1>
            <p className="text-slate-400 text-lg">
              Targeting <span className="text-white font-semibold">{roadmap.role}</span> in {roadmap.months.length} Months
            </p>
          </div>
        </div>

        <div className="flex gap-4">
          <div className="bg-[#0F172A]/60 backdrop-blur-md border border-slate-800 rounded-xl p-4 flex items-center gap-3">
            <div className="p-2 bg-yellow-500/10 rounded-lg">
              <Trophy className="w-6 h-6 text-yellow-500" />
            </div>
            <div>
              <div className="text-xs text-slate-500 uppercase font-bold tracking-wider">Current Level</div>
              <div className="text-white font-bold">Beginner</div>
            </div>
          </div>
          <div className="bg-[#0F172A]/60 backdrop-blur-md border border-slate-800 rounded-xl p-4 flex items-center gap-3">
            <div className="p-2 bg-blue-500/10 rounded-lg">
              <Zap className="w-6 h-6 text-blue-500" />
            </div>
            <div>
              <div className="text-xs text-slate-500 uppercase font-bold tracking-wider">Progress</div>
              <div className="text-white font-bold">{progress}% Completed</div>
            </div>
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="space-y-12">
        {roadmap.months.map((month: any, mIdx: number) => (
          <div key={mIdx} className="space-y-6 animate-in fade-in slide-in-from-bottom-8 duration-700">

            <div className="flex items-center gap-4">
              <div className="bg-blue-600 shadow-lg shadow-blue-500/20 text-white font-bold px-6 py-2 rounded-full text-lg z-10">
                Month {month.month}
              </div>
              <div className="h-[2px] flex-1 bg-gradient-to-r from-blue-600/50 to-transparent" />
            </div>

            <Accordion type="single" collapsible className="w-full space-y-4" defaultValue={`week-${mIdx}-0`}>
              {month.weeks.map((week: any, wIdx: number) => (
                <AccordionItem
                  key={wIdx}
                  value={`week-${mIdx}-${wIdx}`}
                  className="border border-slate-800 bg-[#0F172A]/40 backdrop-blur-sm rounded-2xl overflow-hidden shadow-sm hover:border-slate-700 transition-colors"
                >
                  <AccordionTrigger className="hover:no-underline px-6 py-5 group">
                    <div className="flex items-center gap-6 w-full">
                      <div className="w-14 h-14 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center shrink-0 group-hover:bg-blue-500/20 transition-colors">
                        <span className="font-bold text-blue-400 text-lg">W{week.week}</span>
                      </div>
                      <div className="text-left space-y-1">
                        <h3 className="font-bold text-xl text-slate-200 group-hover:text-white transition-colors">{week.theme}</h3>
                        <div className="flex flex-wrap gap-2">
                          {week.goals.map((g: string, i: number) => (
                            <Badge key={i} variant="secondary" className="bg-slate-800 text-slate-400 font-normal border-slate-700">{g}</Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </AccordionTrigger>

                  <AccordionContent className="px-6 pb-8 pt-2">
                    {/* Vertical Timeline for Daily Tasks */}
                    <div className="relative border-l-2 border-slate-800 ml-7 space-y-8 pl-10 py-4">
                      {week.dailyTasks.map((day: any, dIdx: number) => (
                        <div key={dIdx} className="relative group/day">
                          {/* Timeline Dot */}
                          <div className={cn(
                            "absolute -left-[49px] top-1 w-5 h-5 rounded-full border-4 border-[#0F172A] flex items-center justify-center transition-all duration-300 z-10",
                            day.isCompleted
                              ? "bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]"
                              : "bg-slate-700 group-hover/day:bg-blue-500 group-hover/day:shadow-[0_0_10px_rgba(59,130,246,0.5)]"
                          )}>
                          </div>

                          {/* Day Content */}
                          <div className="space-y-4">
                            <h4 className="font-bold text-lg text-slate-300 flex items-center gap-3">
                              <span className="text-blue-400 font-mono">Day {day.day}</span>
                              <span className="text-slate-600">|</span>
                              <span>{day.title}</span>
                            </h4>

                            {/* Task Cards Grid */}
                            <div className="grid md:grid-cols-3 gap-4">
                              <StudyCard
                                icon={<Brain className="w-5 h-5 text-orange-400" />}
                                title="Aptitude"
                                content={day.aptitudeTask}
                                color="bg-orange-500/5 hover:bg-orange-500/10 border-orange-500/20 text-orange-200"
                              />
                              <StudyCard
                                icon={<Code className="w-5 h-5 text-purple-400" />}
                                title="DSA"
                                content={day.dsaTask}
                                color="bg-purple-500/5 hover:bg-purple-500/10 border-purple-500/20 text-purple-200"
                              />
                              <StudyCard
                                icon={<Cpu className="w-5 h-5 text-emerald-400" />}
                                title="Core"
                                content={day.coreTask}
                                color="bg-emerald-500/5 hover:bg-emerald-500/10 border-emerald-500/20 text-emerald-200"
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        ))}
      </div>
    </div>
  )
}

function StudyCard({ icon, title, content, color }: any) {
  // Extract main topic and description
  const [topic, ...descParts] = content.split(":")
  const description = descParts.join(":") || topic

  return (
    <div className={cn("p-5 rounded-xl border transition-all duration-300 hover:-translate-y-1 hover:shadow-lg", color)}>
      <div className="flex items-center gap-3 mb-3">
        <div className="p-2 rounded-lg bg-black/20">
          {icon}
        </div>
        <span className="font-bold tracking-wide opacity-90">{title}</span>
      </div>
      <p className="font-semibold text-lg mb-2 line-clamp-1 text-white" title={topic}>{topic}</p>
      <p className="text-sm opacity-70 line-clamp-2 leading-relaxed" title={description}>
        {description.trim()}
      </p>
    </div>
  )
}
