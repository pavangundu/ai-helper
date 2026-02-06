"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"


import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Zap, Shield, Brain, Code, Terminal, ChevronRight, MessageSquare, BarChart3, Percent, TrendingUp, Coins, Bot, CheckCircle, Clock, Binary, Users, Map, Hourglass, CircleDollarSign, Gauge, Hash, Compass } from "lucide-react"
import { ProgressRing } from "@/components/ui/progress-ring"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

export default function DashboardPage() {
  const router = useRouter()

  function formatTaskTitle(taskStr: string) {
    if (!taskStr) return "";
    const parts = taskStr.split(":");
    if (parts.length < 2) return taskStr;

    const topic = parts[0].trim();
    // extraction logic: Topic: Subtopic - Activity -> Topic - Subtopic
    const subtopic = parts[1].split("-")[0].trim();

    return `${topic} - ${subtopic}`;
  }
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [currentTask, setCurrentTask] = useState<any>(null)
  const [roadmapId, setRoadmapId] = useState<string>("")
  const [generating, setGenerating] = useState(false)
  const [roadmap, setRoadmap] = useState<any>(null)
  const [progress, setProgress] = useState({ aptitude: 0, dsa: 0, core: 0 })

  useEffect(() => {
    const stored = localStorage.getItem("user")
    if (stored) {
      const parsedUser = JSON.parse(stored)
      setUser(parsedUser)
      fetchDashboardData(parsedUser.email)
    } else {
      router.push("/login")
    }
  }, [router])

  async function fetchDashboardData(email: string) {
    try {
      const res = await fetch(`/api/dashboard?email=${email}`)
      const data = await res.json()

      if (data.user) {
        setUser((prev: any) => ({ ...prev, ...data.user }))
      }
      if (data.currentTask) {
        setCurrentTask(data.currentTask)
        setRoadmapId(data.roadmapId)
      }
      if (data.progress) {
        setProgress(data.progress)
      }
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  async function markComplete(taskType: string) {
    try {
      const tempTask = { ...currentTask }
      if (!tempTask.resources) tempTask.resources = []
      tempTask.resources.push(`completed_${taskType}`)
      setCurrentTask(tempTask)

      const res = await fetch("/api/task/complete", {
        method: "POST",
        body: JSON.stringify({
          email: user.email,
          roadmapId,
          month: currentTask.month,
          week: currentTask.week,
          day: currentTask.day,
          taskType
        }),
        headers: { "Content-Type": "application/json" }
      })

      const data = await res.json()
      if (data.streakIncremented) {
        toast.success("Streak Increased! 🔥")
        setUser((prev: any) => ({ ...prev, streak: (prev.streak || 0) + 1 }))
      } else {
        toast.success("Task Completed!")
      }

      // Always refresh to show updated Time Spent
      setTimeout(() => fetchDashboardData(user.email), 500)

    } catch (error) {
      toast.error("Failed to update task")
    }
  }

  function isTaskDone(task: any, type: string) {
    if (!task || !task.resources) return false
    return task.resources.includes(`completed_${type}`)
  }

  if (loading) return (
    <div className="flex h-screen items-center justify-center bg-[#020617] text-white">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-slate-400 animate-pulse">Loading Headquarters...</p>
      </div>
    </div>
  )

  return (
    <div className="p-8 max-w-[1600px] mx-auto space-y-8 text-slate-100">

      {/* 1. Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 p-[2px]">
            <Avatar className="w-full h-full border-4 border-[#0B1120]">
              <AvatarImage src={user?.image} className="object-cover" />
              <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.name}`} className="object-cover" />
              <AvatarFallback className="bg-slate-800 text-white text-lg font-bold">
                {user?.name?.charAt(0).toUpperCase() || "U"}
              </AvatarFallback>
            </Avatar>
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-white">Hello, {user?.name?.split(' ')[0]}!</h1>
            <p className="text-slate-400 flex items-center gap-2">
              Aspiring {user?.targetRole || "Software Engineer"}
              <Badge variant="outline" className="text-blue-400 border-blue-400/30 bg-blue-400/10 text-[10px] px-1 py-0 h-5">PRO</Badge>
            </p>
          </div>
        </div>

        <div className="flex gap-4">
          <div className="hidden md:block text-right mr-4">
            <div className="text-sm text-slate-400">Current Roadmap</div>
            <div className="font-semibold text-white flex items-center justify-end gap-2">
              {user?.goalTimeline || "6 Months"} Plan <ChevronRight className="w-4 h-4" />
            </div>
          </div>
          {/* Notification Bell Placeholder */}
          <div className="w-10 h-10 rounded-full bg-[#1E293B] flex items-center justify-center border border-white/5 cursor-pointer hover:bg-white/10 transition-colors relative">
            <div className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
            <Shield className="w-5 h-5 text-slate-300" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">

        {/* LEFT COLUMN (2/3 width) */}
        <div className="xl:col-span-2 space-y-8">

          {/* 2. Today's Mission Hero Card */}
          <Card className="border-none bg-[#0F172A]/80 backdrop-blur-xl shadow-2xl relative overflow-hidden group">
            {/* Glow Effects */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2 group-hover:bg-blue-600/20 transition-all duration-700"></div>

            <CardHeader className="relative z-10 pb-2">
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle className="text-2xl font-bold text-white flex items-center gap-3">
                    Today's Mission
                    <span className="text-sm font-normal text-slate-400 bg-white/5 px-3 py-1 rounded-full border border-white/5">
                      Day {currentTask?.day || 1}
                    </span>
                  </CardTitle>
                </div>
                <div className="flex items-center gap-2 text-orange-400 font-bold bg-orange-400/10 px-4 py-1.5 rounded-full border border-orange-400/20">
                  <Zap className="w-4 h-4 fill-orange-400" /> STREAK: {user?.streak || 0} DAYS
                </div>
              </div>
            </CardHeader>

            <CardContent className="relative z-10 space-y-4 pt-6">
              {!currentTask ? (
                <div className="text-center py-12">
                  <Button onClick={() => window.location.reload()} variant="outline" className="border-slate-700 text-white">Refresh Mission</Button>
                </div>
              ) : (
                <>
                  {/* Task Rows */}

                  {/* Aptitude Task */}
                  <div className={`group/task flex items-center justify-between p-4 rounded-xl border border-white/5 transition-all ${isTaskDone(currentTask, "aptitude")
                    ? "bg-green-500/5 border-green-500/10 cursor-default"
                    : "bg-[#1E293B]/50 hover:border-blue-500/30 cursor-pointer"
                    }`}
                    onClick={() => !isTaskDone(currentTask, "aptitude") && router.push(`/aptitude/practice?topic=${encodeURIComponent(currentTask.aptitudeTask.split(":")[0])}`)}>
                    <div className="flex items-center gap-4">
                      <div className={`p-3 rounded-lg border ${isTaskDone(currentTask, "aptitude")
                        ? "bg-green-500/10 border-green-500/20 text-green-500"
                        : "bg-orange-500/20 border-orange-500/30 text-orange-400"
                        }`}>
                        {isTaskDone(currentTask, "aptitude") ? <CheckCircle className="w-6 h-6" /> : <Brain className="w-6 h-6" />}
                      </div>
                      <div className={isTaskDone(currentTask, "aptitude") ? "opacity-50" : ""}>
                        <div className="font-semibold text-lg text-slate-200">{formatTaskTitle(currentTask.aptitudeTask)}</div>
                        <div className="text-sm text-slate-500">Quiz: 5 Questions • 10 Mins</div>
                      </div>
                    </div>
                    {isTaskDone(currentTask, "aptitude") ? (
                      <Badge className="bg-green-500/20 text-green-400 border-green-500/30 px-3 py-1">Completed</Badge>
                    ) : (
                      <div className="flex gap-2 items-center">
                        <div role="button" className="text-sm font-medium text-green-400 hover:text-green-300 flex items-center gap-1 px-2 py-1 rounded hover:bg-green-400/10 transition-colors z-20"
                          onClick={(e) => {
                            e.stopPropagation();
                            markComplete("aptitude");
                          }}>
                          <CheckCircle className="w-4 h-4" /> Done
                        </div>
                        <Badge variant="outline" className="border-slate-700 text-slate-400 group-hover/task:bg-blue-500 group-hover/task:text-white group-hover/task:border-blue-500 transition-all">Start</Badge>
                      </div>
                    )}
                  </div>

                  {/* DSA Task */}
                  <div className={`group/task flex items-center justify-between p-4 rounded-xl border border-white/5 transition-all ${isTaskDone(currentTask, "dsa")
                    ? "bg-green-500/5 border-green-500/10 cursor-default"
                    : "bg-[#1E293B]/50 hover:border-blue-500/30 cursor-pointer"
                    }`}
                    onClick={() => !isTaskDone(currentTask, "dsa") && router.push(`/dsa/practice?topic=${encodeURIComponent(currentTask.dsaTask.split(":")[0])}`)}>
                    <div className="flex items-center gap-4">
                      <div className={`p-3 rounded-lg border ${isTaskDone(currentTask, "dsa")
                        ? "bg-green-500/10 border-green-500/20 text-green-500"
                        : "bg-blue-500/20 border-blue-500/30 text-blue-400"
                        }`}>
                        {isTaskDone(currentTask, "dsa") ? <CheckCircle className="w-6 h-6" /> : <Terminal className="w-6 h-6" />}
                      </div>
                      <div className={isTaskDone(currentTask, "dsa") ? "opacity-50" : ""}>
                        <div className="font-semibold text-lg text-slate-200">{formatTaskTitle(currentTask.dsaTask)}</div>
                        <div className="text-sm text-slate-500">Solve the Problem • 20 Mins</div>
                      </div>
                    </div>
                    {isTaskDone(currentTask, "dsa") ? (
                      <Badge className="bg-green-500/20 text-green-400 border-green-500/30 px-3 py-1">Completed</Badge>
                    ) : (
                      <div className="flex gap-2 items-center">
                        <div role="button" className="text-sm font-medium text-green-400 hover:text-green-300 flex items-center gap-1 px-2 py-1 rounded hover:bg-green-400/10 transition-colors z-20"
                          onClick={(e) => {
                            e.stopPropagation();
                            markComplete("dsa");
                          }}>
                          <CheckCircle className="w-4 h-4" /> Done
                        </div>
                        <Badge variant="outline" className="border-slate-700 text-slate-400 group-hover/task:bg-blue-500 group-hover/task:text-white group-hover/task:border-blue-500 transition-all">Start</Badge>
                      </div>
                    )}
                  </div>

                  {/* Core Task */}
                  <div className={`group/task flex items-center justify-between p-4 rounded-xl border border-white/5 transition-all ${isTaskDone(currentTask, "core")
                    ? "bg-green-500/5 border-green-500/10 cursor-default"
                    : "bg-[#1E293B]/50 hover:border-blue-500/30 cursor-pointer"
                    }`}
                    onClick={() => !isTaskDone(currentTask, "core") && router.push("/core-skills")}>
                    <div className="flex items-center gap-4">
                      <div className={`p-3 rounded-lg border ${isTaskDone(currentTask, "core")
                        ? "bg-green-500/10 border-green-500/20 text-green-500"
                        : "bg-emerald-500/20 border-emerald-500/30 text-emerald-400"
                        }`}>
                        {isTaskDone(currentTask, "core") ? <CheckCircle className="w-6 h-6" /> : <Code className="w-6 h-6" />}
                      </div>
                      <div className={isTaskDone(currentTask, "core") ? "opacity-50" : ""}>
                        <div className="font-semibold text-lg text-slate-200">{formatTaskTitle(currentTask.coreTask)}</div>
                        <div className="text-sm text-slate-500">Read & Implement • 30 Mins</div>
                      </div>
                    </div>
                    {isTaskDone(currentTask, "core") ? (
                      <Badge className="bg-green-500/20 text-green-400 border-green-500/30 px-3 py-1">Completed</Badge>
                    ) : (
                      <div className="flex gap-2 items-center">
                        <div role="button" className="text-sm font-medium text-green-400 hover:text-green-300 flex items-center gap-1 px-2 py-1 rounded hover:bg-green-400/10 transition-colors z-20"
                          onClick={(e) => {
                            e.stopPropagation();
                            markComplete("core");
                          }}>
                          <CheckCircle className="w-4 h-4" /> Done
                        </div>
                        <Badge variant="outline" className="border-slate-700 text-slate-400 group-hover/task:bg-blue-500 group-hover/task:text-white group-hover/task:border-blue-500 transition-all">Start</Badge>
                      </div>
                    )}
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* 3. Aptitude Practice Grid */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold flex items-center gap-2">
                Aptitude Practice
                <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
              </h2>
              <Button variant="ghost" size="sm" onClick={() => router.push('/aptitude')} className="text-sm text-blue-400 hover:text-blue-300">
                View All <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { title: "Percentages", icon: Percent, color: "text-green-400", bg: "bg-green-400/10" },
                { title: "Time & Work", icon: Hourglass, color: "text-blue-400", bg: "bg-blue-400/10" },
                { title: "Profit & Loss", icon: CircleDollarSign, color: "text-yellow-400", bg: "bg-yellow-400/10" },
                { title: "Time Speed Distance", icon: Gauge, color: "text-orange-400", bg: "bg-orange-400/10" },
                { title: "Number Series", icon: Hash, color: "text-purple-400", bg: "bg-purple-400/10" },
                { title: "Coding Decoding", icon: Code, color: "text-pink-400", bg: "bg-pink-400/10" },
                { title: "Blood Relations", icon: Users, color: "text-red-400", bg: "bg-red-400/10" },
                { title: "Direction Sense", icon: Compass, color: "text-teal-400", bg: "bg-teal-400/10" }
              ].map((item, i) => (
                <div key={i} className="bg-[#1E293B]/40 hover:bg-[#1E293B] border border-white/5 hover:border-blue-500/30 p-5 rounded-2xl transition-all cursor-pointer group space-y-3"
                  onClick={() => router.push(`/aptitude/practice?topic=${encodeURIComponent(item.title)}`)}>
                  <div className={`w-10 h-10 rounded-lg ${item.bg} flex items-center justify-center`}>
                    <item.icon className={`w-5 h-5 ${item.color}`} />
                  </div>
                  <h3 className="font-semibold text-slate-200">{item.title}</h3>
                  <Button size="sm" className="w-full bg-white/5 hover:bg-blue-600 text-slate-300 hover:text-white border border-white/10 group-hover:border-transparent transition-all">Start Quiz</Button>
                </div>
              ))}
            </div>
          </div>

          {/* 4. Achievements & Badges Section */}
          <div className="space-y-4">
            <h2 className="text-xl font-bold flex items-center gap-2">
              Achievements & Badges
              <span className="w-2 h-2 rounded-full bg-purple-500 animate-pulse"></span>
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { id: "streak_7", title: "Week Warrior", desc: "7 Day Streak", icon: Zap, color: "text-orange-400", bg: "bg-orange-400/10", border: "border-orange-500/30" },
                { id: "quiz_master", title: "Quiz Wizard", desc: "Scored 100% in Aptitude", icon: Brain, color: "text-blue-400", bg: "bg-blue-400/10", border: "border-blue-500/30" },
                { id: "dsa_solver", title: "DSA Crusher", desc: "Solved 10 DSA Problems", icon: Code, color: "text-purple-400", bg: "bg-purple-400/10", border: "border-purple-500/30" },
                { id: "early_bird", title: "Early Bird", desc: "Completed tasks before 9AM", icon: Clock, color: "text-yellow-400", bg: "bg-yellow-400/10", border: "border-yellow-500/30" },
              ].map((badge, i) => {
                const isUnlocked = user?.badges?.includes(badge.id);
                return (
                  <div key={i} className={cn(
                    "relative p-5 rounded-2xl border transition-all space-y-3 overflow-hidden group",
                    isUnlocked
                      ? `bg-[#1E293B]/60 ${badge.border} shadow-lg shadow-${badge.color.split('-')[1]}-500/10`
                      : "bg-[#1E293B]/20 border-white/5 opacity-60 grayscale hover:grayscale-0 hover:opacity-100"
                  )}>
                    {isUnlocked && (
                      <div className={`absolute top-0 right-0 p-1.5 rounded-bl-xl ${badge.bg} border-b border-l ${badge.border}`}>
                        <CheckCircle className={`w-3 h-3 ${badge.color}`} />
                      </div>
                    )}

                    <div className={`w-12 h-12 rounded-xl ${isUnlocked ? badge.bg : "bg-slate-800"} flex items-center justify-center`}>
                      <badge.icon className={`w-6 h-6 ${isUnlocked ? badge.color : "text-slate-500"}`} />
                    </div>

                    <div>
                      <h3 className={`font-semibold ${isUnlocked ? "text-slate-200" : "text-slate-500"}`}>{badge.title}</h3>
                      <p className="text-xs text-slate-500 mt-1">{badge.desc}</p>
                    </div>

                    {isUnlocked ? (
                      <Badge variant="outline" className={`text-[10px] ${badge.color} ${badge.bg} border-0`}>Unlocked</Badge>
                    ) : (
                      <Badge variant="outline" className="text-[10px] text-slate-600 border-slate-800">Locked</Badge>
                    )}
                  </div>
                )
              })}
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN (1/3 width) */}
        <div className="space-y-6">

          {/* 4. Progress Overview */}
          <Card className="bg-[#0F172A]/80 border-white/5 backdrop-blur-md">
            <CardHeader>
              <CardTitle className="text-lg">Progress Overview</CardTitle>
            </CardHeader>
            <CardContent className="flex justify-around items-center px-4 py-8">
              <div className="flex flex-col items-center gap-3">
                <ProgressRing progress={progress.aptitude} radius={42} stroke={6} color="text-blue-500" label={`${progress.aptitude}%`} />
                <span className="text-sm font-semibold text-slate-300 tracking-wide">Aptitude</span>
              </div>
              <div className="flex flex-col items-center gap-3">
                <ProgressRing progress={progress.dsa} radius={42} stroke={6} color="text-purple-500" label={`${progress.dsa}%`} />
                <span className="text-sm font-semibold text-purple-300 tracking-wide">DSA</span>
              </div>
              <div className="flex flex-col items-center gap-3">
                <ProgressRing progress={progress.core} radius={42} stroke={6} color="text-emerald-500" label={`${progress.core}%`} />
                <span className="text-sm font-semibold text-emerald-300 tracking-wide">Core</span>
              </div>
            </CardContent>
          </Card>

          {/* 5. Streak & Stats Card */}
          <Card className="bg-[#0F172A]/80 border-white/5 backdrop-blur-md overflow-hidden relative">
            <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-orange-500 via-red-500 to-yellow-500"></div>
            <CardContent className="pt-8 pb-6 px-6">
              <div className="flex flex-col items-center text-center space-y-2 mb-6">
                <div className="relative">
                  <div className="absolute inset-0 bg-orange-500/20 blur-xl rounded-full"></div>
                  <Zap className="w-16 h-16 text-orange-500 relative z-10 fill-orange-500 animate-pulse" />
                </div>

                <h2 className="text-3xl font-black text-white tracking-tight">
                  {user?.streak || 0} days strong!
                </h2>
                <p className="text-sm text-slate-400 max-w-[200px]">
                  Keep coding to maintain your legendary status!
                </p>

                <div className="flex gap-2 mt-4">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-400 to-red-500 shadow-lg shadow-orange-500/20 transform hover:-translate-y-1 transition-transform"></div>
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-slate-400 to-slate-600 shadow-lg shadow-slate-500/20 transform hover:-translate-y-1 transition-transform"></div>
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-yellow-400 to-yellow-600 shadow-lg shadow-yellow-500/20 transform hover:-translate-y-1 transition-transform"></div>
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-400 to-cyan-500 shadow-lg shadow-blue-500/20 transform hover:-translate-y-1 transition-transform"></div>
                </div>
              </div>

              {/* Weekly Calendar */}
              <div className="bg-[#1E293B]/50 rounded-2xl p-4 border border-white/5">
                <div className="grid grid-cols-7 gap-1 text-center mb-2">
                  {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, i) => (
                    <div key={i} className="text-xs font-bold text-slate-500">{day}</div>
                  ))}
                </div>
                <div className="grid grid-cols-7 gap-1 text-center">
                  {(() => {
                    const today = new Date();
                    today.setHours(0, 0, 0, 0);

                    const currentDay = today.getDay(); // 0 is Sunday
                    // Adjust to make Monday 0, Sunday 6
                    const currentDayAdjusted = currentDay === 0 ? 6 : currentDay - 1;

                    const startOfWeek = new Date(today);
                    startOfWeek.setDate(today.getDate() - currentDayAdjusted);

                    return Array.from({ length: 7 }).map((_, i) => {
                      const date = new Date(startOfWeek);
                      date.setDate(startOfWeek.getDate() + i);
                      date.setHours(0, 0, 0, 0);

                      const isToday = date.getTime() === today.getTime();

                      // Calculate if this date is part of the streak
                      // Streak includes today and (streak-1) days backwards
                      const streakDays = user?.streak || 0;
                      const diffTime = today.getTime() - date.getTime();
                      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                      const isStreakDay = diffDays >= 0 && diffDays < streakDays;

                      const isFuture = date > today;

                      return (
                        <div key={i} className="flex flex-col items-center gap-1">
                          <span className={cn(
                            "text-sm font-medium transition-colors",
                            isStreakDay ? "text-white" : "text-slate-500",
                            isFuture && "opacity-30"
                          )}>
                            {date.getDate()}
                          </span>
                          {isStreakDay ? (
                            <div className="w-6 h-1 mt-1 rounded-full bg-orange-500 shadow-[0_0_10px_rgba(249,115,22,0.8)]"></div>
                          ) : (
                            <div className={`w-1 h-1 mt-1 rounded-full ${isFuture ? "bg-slate-800" : "bg-slate-700"}`}></div>
                          )}
                        </div>
                      )
                    })
                  })()}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 6. AI Mentor Widget */}
          <Card className="bg-gradient-to-br from-blue-900/40 to-slate-900 border-white/5 backdrop-blur-md relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/20 rounded-full blur-2xl"></div>
            <CardHeader className="pb-2">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-500 rounded-lg">
                  <Bot className="w-5 h-5 text-white" />
                </div>
                <CardTitle className="text-white">AI Mentor</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-3 relative z-10">
              <div className="bg-white/10 p-3 rounded-tr-xl rounded-bl-xl rounded-br-xl text-sm text-slate-200">
                How can I help you crush your interview prep today? 🚀
              </div>
              <Button className="w-full bg-blue-600 hover:bg-blue-500 text-white" onClick={() => router.push('/mentor')}>
                Chat Now <MessageSquare className="w-4 h-4 ml-2" />
              </Button>
              <div className="grid grid-cols-1 gap-2">
                <button className="text-left text-xs text-slate-400 hover:text-white p-2 rounded bg-white/5 hover:bg-white/10 transition-colors">
                  ⚡ Explain Dynamic Programming
                </button>
                <button className="text-left text-xs text-slate-400 hover:text-white p-2 rounded bg-white/5 hover:bg-white/10 transition-colors">
                  📝 Review my Resume
                </button>
              </div>
            </CardContent>
          </Card>

        </div>
      </div>
    </div>
  )
}
