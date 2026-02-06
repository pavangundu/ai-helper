"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Slider } from "@/components/ui/slider"
import { toast } from "sonner"
import { Save, Loader2 } from "lucide-react"
import { ApiKeyDialog } from "@/components/ApiKeyDialog"

export default function SettingsPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [user, setUser] = useState<any>(null)

  const [formData, setFormData] = useState({
    targetRole: "",
    goalTimeline: "6 Months",
    coreSkill: "",
    dailyStudyTime: 60,
    currentLevel: "Beginner"
  })

  useEffect(() => {
    const stored = localStorage.getItem("user")
    if (stored) {
      const parsedUser = JSON.parse(stored)
      setUser(parsedUser)
      setFormData({
        targetRole: parsedUser.targetRole || "",
        goalTimeline: parsedUser.goalTimeline || "6 Months",
        coreSkill: parsedUser.coreSkill || "",
        dailyStudyTime: Number(parsedUser.dailyStudyTime) || 60,
        currentLevel: parsedUser.currentLevel || "Beginner"
      })
    } else {
      router.push("/login")
    }
  }, [router])

  async function handleSave() {
    setSaving(true)
    try {
      const res = await fetch("/api/user/profile", {
        method: "PATCH",
        body: JSON.stringify({
          email: user.email,
          targetRole: formData.targetRole,
          goalTimeline: formData.goalTimeline,
          coreSkill: formData.coreSkill,
          dailyStudyTime: formData.dailyStudyTime,
          currentLevel: formData.currentLevel
        }),
        headers: { "Content-Type": "application/json" }
      })

      if (!res.ok) throw new Error("Failed to update profile")

      const data = await res.json()

      const updatedUser = { ...user, ...data.user }
      localStorage.setItem("user", JSON.stringify(updatedUser))
      setUser(updatedUser)

      // Trigger Roadmap Generation
      const apiKey = localStorage.getItem("gemini_api_key");
      const headers: any = { "Content-Type": "application/json" };
      if (apiKey) headers["x-gemini-api-key"] = apiKey;

      const genRes = await fetch("/api/roadmap/generate", {
        method: "POST",
        body: JSON.stringify({ email: user.email }),
        headers: headers,
      })

      if (!genRes.ok) {
        console.error("Roadmap generation failed")
      }

      toast.success("Roadmap updated! 🚀")
      router.push("/dashboard") // Redirect to dashboard to see new roadmap
    } catch (error) {
      console.error(error)
      toast.error("Failed to save changes")
    } finally {
      setSaving(false)
    }
  }

  if (!user) return null

  return (
    <div className="p-8 max-w-2xl mx-auto space-y-8 text-slate-100">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-white mb-2">Setting Up Your AI Mentor</h1>
        <p className="text-slate-400">Tell us about your goals so we can generate the perfect roadmap for you.</p>
      </div>

      <div className="space-y-8">

        {/* Target Role */}
        <div className="space-y-3">
          <Label className="text-white font-semibold text-lg">Target Job Role</Label>
          <Select
            value={formData.targetRole}
            onValueChange={(val) => setFormData({ ...formData, targetRole: val })}
          >
            <SelectTrigger className="bg-[#1E293B] border-slate-700 text-white h-12">
              <SelectValue placeholder="Select Role" />
            </SelectTrigger>
            <SelectContent className="bg-[#1E293B] border-slate-700 text-white">
              <SelectItem value="Software Developer">Software Developer</SelectItem>
              <SelectItem value="Frontend Developer">Frontend Developer</SelectItem>
              <SelectItem value="Backend Developer">Backend Developer</SelectItem>
              <SelectItem value="Full Stack Developer">Full Stack Developer</SelectItem>
              <SelectItem value="Data Analyst">Data Analyst</SelectItem>
              <SelectItem value="Data Scientist">Data Scientist</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Primary Tech Stack / Skill */}
        <div className="space-y-3">
          <Label className="text-white font-semibold text-lg">Primary Tech Stack / Skill</Label>
          <Select
            value={formData.coreSkill}
            onValueChange={(val) => setFormData({ ...formData, coreSkill: val })}
          >
            <SelectTrigger className="bg-[#1E293B] border-slate-700 text-white h-12">
              <SelectValue placeholder="Select Tech Stack" />
            </SelectTrigger>
            <SelectContent className="bg-[#1E293B] border-slate-700 text-white">
              <SelectItem value="React / Next.js">React / Next.js</SelectItem>
              <SelectItem value="Java / Spring">Java / Spring</SelectItem>
              <SelectItem value="Python / Django">Python / Django</SelectItem>
              <SelectItem value="Node.js / Express">Node.js / Express</SelectItem>
              <SelectItem value="C++ / Systems">C++ / Systems</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Experience Level */}
        <div className="space-y-3">
          <Label className="text-white font-semibold text-lg">Current Experience Level</Label>
          <RadioGroup
            value={formData.currentLevel}
            onValueChange={(val) => setFormData({ ...formData, currentLevel: val })}
            className="flex flex-col space-y-2"
          >
            <div className="flex items-center space-x-3">
              <RadioGroupItem value="Beginner" id="r1" className="border-slate-500 text-blue-500" />
              <Label htmlFor="r1" className="text-slate-300 font-normal cursor-pointer">Beginner (Learning basics)</Label>
            </div>
            <div className="flex items-center space-x-3">
              <RadioGroupItem value="Intermediate" id="r2" className="border-slate-500 text-blue-500" />
              <Label htmlFor="r2" className="text-slate-300 font-normal cursor-pointer">Intermediate (Built a few projects)</Label>
            </div>
            <div className="flex items-center space-x-3">
              <RadioGroupItem value="Advanced" id="r3" className="border-slate-500 text-blue-500" />
              <Label htmlFor="r3" className="text-slate-300 font-normal cursor-pointer">Advanced (Job ready, need polish)</Label>
            </div>
          </RadioGroup>
        </div>

        {/* Daily Study Time */}
        <div className="space-y-4">
          <div className="flex justify-between">
            <Label className="text-white font-semibold text-lg">Daily Study Time: {formData.dailyStudyTime} minutes</Label>
          </div>
          <Slider
            defaultValue={[formData.dailyStudyTime]}
            max={180}
            min={15}
            step={15}
            value={[formData.dailyStudyTime]}
            onValueChange={(val) => setFormData({ ...formData, dailyStudyTime: val[0] })}
            className="py-4"
          />
          <p className="text-slate-500 text-sm">Be realistic! Consistency &gt; Intensity.</p>
        </div>

        {/* Goal Timeline */}
        <div className="space-y-3">
          <Label className="text-white font-semibold text-lg">Goal Timeline</Label>
          <RadioGroup
            value={formData.goalTimeline}
            onValueChange={(val) => setFormData({ ...formData, goalTimeline: val })}
            className="flex space-x-6"
          >
            <div className="flex items-center space-x-3">
              <RadioGroupItem value="3 Months" id="t1" className="border-slate-500 text-blue-500" />
              <Label htmlFor="t1" className="text-slate-300 cursor-pointer">3 Months</Label>
            </div>
            <div className="flex items-center space-x-3">
              <RadioGroupItem value="6 Months" id="t2" className="border-slate-500 text-blue-500" />
              <Label htmlFor="t2" className="text-slate-300 cursor-pointer">6 Months</Label>
            </div>
          </RadioGroup>
        </div>

        {/* API Key Config */}
        <div className="space-y-3">
          <Label className="text-white font-semibold text-lg">AI Configuration</Label>
          <div className="bg-[#1E293B] border border-slate-700 rounded-xl p-4 flex items-center justify-between">
            <div>
              <div className="text-white font-medium">Custom API Key</div>
              <div className="text-slate-400 text-sm">Use your own Gemini API Key for higher rate limits.</div>
            </div>
            <ApiKeyDialog />
          </div>
        </div>

        <div className="pt-6">
          <Button
            onClick={handleSave}
            disabled={saving}
            className="w-full bg-white hover:bg-slate-200 text-slate-900 font-bold py-6 text-lg rounded-xl"
          >
            {saving ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : "Generate Roadmap 🚀"}
          </Button>
        </div>

      </div>
    </div>
  )
}
