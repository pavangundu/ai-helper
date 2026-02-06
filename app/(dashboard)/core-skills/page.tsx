"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ProgressRing } from "@/components/ui/progress-ring"
import { CheckCircle, PlayCircle, BookOpen, ExternalLink, Code, Database, Server, Smartphone, Loader2 } from "lucide-react"
import { toast } from "sonner"

// Resource Database
const YOUTUBE_CHANNELS: Record<string, any[]> = {
  "React / Next.js": [
    { name: "Web Dev Simplified", url: "https://www.youtube.com/@WebDevSimplified", desc: "Complex concepts explained simply." },
    { name: "Cosden Solutions", url: "https://www.youtube.com/@cosdensolutions", desc: "Advanced React & Next.js patterns." },
    { name: "Jack Herrington", url: "https://www.youtube.com/@jherr", desc: "Blue collar coder. Deep dives." },
    { name: "Codevolution", url: "https://www.youtube.com/@Codevolution", desc: "Comprehensive tutorials." }
  ],
  "Java / Spring": [
    { name: "Amigoscode", url: "https://www.youtube.com/@amigoscode", desc: "Top-tier Spring Boot tutorials." },
    { name: "Telusko", url: "https://www.youtube.com/@Telusko", desc: "Java fundamentals to advanced." },
    { name: "Java Brains", url: "https://www.youtube.com/@JavaBrainsChannel", desc: "Enterprise Java concepts." }
  ],
  "Python / Django": [
    { name: "Corey Schafer", url: "https://www.youtube.com/@coreyms", desc: "The gold standard for Python." },
    { name: "Programming with Mosh", url: "https://www.youtube.com/@programmingwithmosh", desc: "Fast-paced, clear intros." },
    { name: "Dennis Ivy", url: "https://www.youtube.com/@DennisIvy", desc: "Django project-based learning." }
  ],
  "Node.js / Express": [
    { name: "Dave Gray", url: "https://www.youtube.com/@DaveGrayTeachesCode", desc: "Full stack Node & Express guides." },
    { name: "Traversy Media", url: "https://www.youtube.com/@TraversyMedia", desc: "Project-heavy tutorials." },
    { name: "Hussein Nasser", url: "https://www.youtube.com/@hnasr", desc: "Backend engineering deep dives." }
  ],
  "C++ / Systems": [
    { name: "The Cherno", url: "https://www.youtube.com/@TheCherno", desc: "Game engine dev & C++ mastery." },
    { name: "CodeBeauty", url: "https://www.youtube.com/@CodeBeauty", desc: "Visual C++ explanations." },
    { name: "Low Level Learning", url: "https://www.youtube.com/@LowLevelLearning", desc: "Systems programming concepts." }
  ],
  "Data Analyst": [
    { name: "Krish Naik", url: "https://www.youtube.com/@krishnaik06", desc: "Data Science & Analytics mentor." },
    { name: "StatQuest", url: "https://www.youtube.com/@statquest", desc: "Statistics visualized beautifully." },
    { name: "Alex The Analyst", url: "https://www.youtube.com/@AlexTheAnalyst", desc: "Career guides & SQL/Tableau." }
  ],
  "Data Scientist": [
    { name: "Krish Naik", url: "https://www.youtube.com/@krishnaik06", desc: "End-to-end ML projects." },
    { name: "Sentdex", url: "https://www.youtube.com/@sentdex", desc: "Python for Finance & ML." },
    { name: "CampusX", url: "https://www.youtube.com/@campusx-official", desc: "In-depth ML theory." }
  ]
}

export default function CoreSkillsPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [currentTask, setCurrentTask] = useState<any>(null)
  const [roadmapId, setRoadmapId] = useState("")

  useEffect(() => {
    const stored = localStorage.getItem("user")
    if (stored) {
      const parsedUser = JSON.parse(stored)
      setUser(parsedUser)
      fetchData(parsedUser.email)
    } else {
      router.push("/login")
    }
  }, [router])

  async function fetchData(email: string) {
    try {
      const res = await fetch(`/api/dashboard?email=${email}`)
      const data = await res.json()
      if (data.user) setUser(data.user)
      if (data.currentTask) {
        setCurrentTask(data.currentTask)
        setRoadmapId(data.roadmapId)
      }
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  async function markComplete() {
    if (!currentTask) return
    try {
      const res = await fetch("/api/task/complete", {
        method: "POST",
        body: JSON.stringify({
          email: user.email,
          roadmapId,
          month: currentTask.month,
          week: currentTask.week,
          day: currentTask.day,
          taskType: "core"
        }),
        headers: { "Content-Type": "application/json" }
      })

      if (res.ok) {
        toast.success("Skill Module Completed! +50 XP")
        // Optimistic update
        const temp = { ...currentTask }
        if (!temp.resources) temp.resources = []
        temp.resources.push("completed_core")
        setCurrentTask(temp)
      }
    } catch (error) {
      toast.error("Failed to update status")
    }
  }

  if (loading) return (
    <div className="flex h-[80vh] items-center justify-center text-slate-400">
      <Loader2 className="w-10 h-10 animate-spin" />
    </div>
  )

  const isCompleted = currentTask?.resources?.includes("completed_core")
  // Fallback if user's exact string isn't in map, try to find partial match or default
  const userSkill = user?.coreSkill || "React / Next.js"
  const resources = YOUTUBE_CHANNELS[userSkill] || YOUTUBE_CHANNELS["React / Next.js"]

  return (
    <div className="p-8 max-w-[1600px] mx-auto space-y-8 text-slate-100 animate-in fade-in duration-500">

      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white mb-2">Core Engineering Skills</h1>
          <p className="text-slate-400">Mastering {userSkill} one day at a time.</p>
        </div>
        <div className="hidden md:block">
          <Badge variant="outline" className="text-emerald-400 border-emerald-400/20 bg-emerald-400/10 px-3 py-1">
            {user?.targetRole || "Software Engineer"} Track
          </Badge>
        </div>
      </div>

      <div className="grid xl:grid-cols-3 gap-8">

        {/* LEFT: Main Focus Area */}
        <div className="xl:col-span-2 space-y-8">

          {/* Today's Task Card */}
          <Card className="bg-[#0F172A]/80 border-white/5 backdrop-blur-xl shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-emerald-600/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2 pointer-events-none" />

            <CardHeader>
              <CardTitle className="text-xl flex items-center gap-3">
                <div className="p-2 bg-emerald-500/20 rounded-lg text-emerald-400">
                  <Code className="w-6 h-6" />
                </div>
                Today's Focus Topic
              </CardTitle>
            </CardHeader>

            <CardContent className="space-y-6 relative z-10">
              {!currentTask ? (
                <div className="text-slate-500 italic">No active mission found. Generating your roadmap...</div>
              ) : (
                <>
                  <div>
                    <h2 className="text-3xl font-bold text-white mb-2">
                      {currentTask.coreTask.replace(":", " -")}
                    </h2>
                    <p className="text-slate-400 text-lg leading-relaxed">
                      {/* Extract description if available or generic text */}
                      Study the core concepts of this topic. Ensure you understand the underlying principles before moving to implementation.
                    </p>
                  </div>

                  <div className="flex items-center gap-4 pt-4">
                    {isCompleted ? (
                      <Button disabled className="bg-emerald-600/20 text-emerald-400 border border-emerald-500/20">
                        <CheckCircle className="w-5 h-5 mr-2" /> Completed
                      </Button>
                    ) : (
                      <Button onClick={markComplete} className="bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-900/20">
                        Mark Topic Learned
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      className="border-slate-700 text-slate-300 hover:text-white hover:bg-white/5"
                      onClick={() => window.open(`https://www.google.com/search?q=${encodeURIComponent(currentTask.coreTask.replace(":", " ") + " documentation")}`, "_blank")}
                    >
                      <BookOpen className="w-4 h-4 mr-2" /> Read Docs
                    </Button>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* YouTube Recommendations */}
          <div>
            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <PlayCircle className="w-5 h-5 text-red-500" /> Recommended Channels
            </h3>
            <div className="grid md:grid-cols-2 gap-4">
              {resources.map((channel, idx) => (
                <a
                  key={idx}
                  href={channel.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group block p-4 rounded-xl bg-[#1E293B]/40 border border-white/5 hover:bg-[#1E293B] hover:border-red-500/30 transition-all"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-semibold text-slate-200 group-hover:text-white transition-colors">
                        {channel.name}
                      </h4>
                      <p className="text-sm text-slate-400 mt-1">{channel.desc}</p>
                    </div>
                    <ExternalLink className="w-4 h-4 text-slate-600 group-hover:text-red-400 transition-colors" />
                  </div>
                </a>
              ))}
            </div>
          </div>

        </div>

        {/* RIGHT: Stats & Helper */}
        <div className="space-y-6">
          <Card className="bg-[#1E293B]/30 border-white/5 backdrop-blur-md">
            <CardHeader>
              <CardTitle className="text-lg">Skill Mastery</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center">
              {(() => {
                const minutes = user?.totalStudyTime?.core || 0;
                const hours = (minutes / 60).toFixed(1);
                const progress = Math.min(100, (minutes / 60 / 50) * 100); // Goal: 50 Hours

                return (
                  <>
                    <ProgressRing
                      radius={70}
                      stroke={8}
                      progress={progress}
                      color="text-emerald-500"
                      label={`${hours}h`}
                      subLabel="STUDIED"
                      className="scale-110"
                    />
                    <p className="text-center text-sm text-slate-400 mt-6 px-4">
                      You've spent {hours} hours mastering {userSkill}. Keep pushing!
                    </p>
                  </>
                );
              })()}
            </CardContent>
          </Card>

          <div className="p-4 rounded-xl bg-gradient-to-br from-blue-900/20 to-indigo-900/20 border border-blue-500/20">
            <h4 className="font-bold text-blue-300 mb-2 flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" /> Rapid Fire Tip
            </h4>
            <p className="text-sm text-blue-100/80 italic">
              "Don't just watch tutorials. Build something with what you learned immediately to retain 90% more info."
            </p>
          </div>
        </div>

      </div>
    </div>
  )
}
