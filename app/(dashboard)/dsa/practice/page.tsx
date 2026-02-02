
"use client"

import { useSearchParams } from "next/navigation"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Loader2, Play, Lightbulb, RefreshCcw } from "lucide-react"
import { toast } from "sonner"

export default function DSAPracticePage() {
  const searchParams = useSearchParams()
  const topic = searchParams.get('topic') || "General"

  const [problem, setProblem] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [code, setCode] = useState("")
  const [verifying, setVerifying] = useState(false)
  const [hint, setHint] = useState("")
  const [language, setLanguage] = useState("javascript")

  useEffect(() => {
    // Check local storage first to prevent question changing on reload
    const stored = localStorage.getItem(`dsa_problem_${topic}`)
    if (stored) {
      try {
        const parsed = JSON.parse(stored)
        setProblem(parsed)
        setLoading(false)
        updateStarterCode(parsed, language)
      } catch (e) { fetchProblem() }
    } else {
      fetchProblem()
    }
  }, [topic])

  // When language changes, update the code.
  // Note: In a real app, we might want to cache user code per language so they don't lose it.
  useEffect(() => {
    if (problem) {
      updateStarterCode(problem, language)
    }
  }, [language, problem])

  function updateStarterCode(prob: any, lang: string) {
    if (!prob) return
    if (lang === "javascript") setCode(prob.starterCode || "// Write your solution here")
    else if (lang === "python") setCode("# Write your solution here\ndef solve():\n    pass")
    else if (lang === "java") setCode("// Write your solution here\nclass Solution {\n    public void solve() {\n        \n    }\n}")
    else if (lang === "cpp") setCode("// Write your solution here\n#include <iostream>\nusing namespace std;\n\nvoid solve() {\n    \n}")
  }

  async function fetchProblem() {
    setLoading(true)
    setHint("")
    try {
      const res = await fetch("/api/dsa/generate", {
        method: "POST",
        body: JSON.stringify({ topic }),
        headers: { "Content-Type": "application/json" }
      })
      const data = await res.json()
      setProblem(data)
      localStorage.setItem(`dsa_problem_${topic}`, JSON.stringify(data))
    } catch (error) {
      toast.error("Failed to load problem.")
    } finally {
      setLoading(false)
    }
  }

  async function handleGetHint() {
    setHint(problem.hint || "Try using a hash map to store visited elements.")
  }

  async function handleSubmit() {
    setVerifying(true)
    try {
      const res = await fetch("/api/dsa/judge", {
        method: "POST",
        body: JSON.stringify({ code, problem: problem, language }),
        headers: { "Content-Type": "application/json" }
      })
      const result = await res.json()

      if (result.passed) {
        toast.success(`Correct! Score: ${result.score}/100. Task Complete! 🎉`)
      } else {
        toast.error(`Solution Incorrect. Feedback: ${result.feedback}`)
      }
    } catch (e) {
      toast.error("Judge disconnected. Try again.")
    } finally {
      setVerifying(false)
    }
  }

  if (loading) return <div className="flex justify-center items-center h-[50vh]"><Loader2 className="animate-spin" /></div>

  return (
    <div className="p-6 h-[calc(100vh-4rem)] flex flex-col md:flex-row gap-6 text-slate-100">
      {/* Problem Description Panel */}
      <Card className="md:w-1/2 flex flex-col overflow-hidden bg-[#1E293B]/40 border-white/5 backdrop-blur-md shadow-xl">
        <CardHeader className="bg-black/20 border-b border-white/5 pb-4">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-xs font-bold bg-blue-500/20 text-blue-300 px-2.5 py-1 rounded mb-2 inline-block uppercase tracking-wider">{problem?.difficulty}</span>
              <CardTitle className="text-xl text-white">{problem?.title}</CardTitle>
            </div>
            <Button variant="outline" size="sm" onClick={fetchProblem} className="border-white/10 text-slate-300 hover:bg-white/5 hover:text-white">
              <RefreshCcw className="w-4 h-4 mr-2" /> New Problem
            </Button>
          </div>
        </CardHeader>
        <CardContent className="flex-1 overflow-auto p-6 space-y-4 text-slate-300 leading-relaxed">
          <div className="prose prose-invert max-w-none prose-p:text-slate-300 prose-headings:text-white prose-pre:bg-[#0F172A] prose-pre:border prose-pre:border-white/10">
            <p>{problem?.description}</p>

            <h4 className="font-semibold mt-4 text-white">Example 1:</h4>
            <pre className="bg-[#0F172A] p-3 rounded-md text-sm text-slate-300 border border-white/5">{problem?.examples?.[0] || "No example provided"}</pre>

            {problem?.examples?.[1] && (
              <>
                <h4 className="font-semibold mt-4 text-white">Example 2:</h4>
                <pre className="bg-[#0F172A] p-3 rounded-md text-sm text-slate-300 border border-white/5">{problem?.examples?.[1]}</pre>
              </>
            )}
          </div>

          {hint && (
            <div className="bg-yellow-500/10 border border-yellow-500/20 p-4 rounded-lg text-sm mt-4 text-yellow-200">
              <strong className="text-yellow-400">💡 Hint:</strong> {hint}
            </div>
          )}
        </CardContent>
        <div className="p-4 border-t border-white/5 bg-black/20 flex justify-between">
          <Button variant="ghost" size="sm" onClick={handleGetHint} className="text-slate-400 hover:text-yellow-400 hover:bg-yellow-400/10"><Lightbulb className="w-4 h-4 mr-2" /> Get Hint</Button>
        </div>
      </Card>

      {/* Code Editor Panel */}
      <Card className="md:w-1/2 flex flex-col bg-[#1E293B]/40 border-white/5 backdrop-blur-md shadow-xl overflow-hidden">
        <Tabs defaultValue="code" className="flex-1 flex flex-col">
          <div className="px-4 py-2 border-b border-white/5 flex justify-between items-center bg-black/20">
            <div className="flex items-center gap-4">
              <TabsList className="bg-[#0F172A]">
                <TabsTrigger value="code" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">Code</TabsTrigger>
                <TabsTrigger value="solution">Solution</TabsTrigger>
              </TabsList>

              <select
                className="h-8 rounded-md border border-white/10 bg-[#0F172A] px-3 text-sm text-slate-300 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-blue-500 cursor-pointer"
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
              >
                <option value="javascript">JavaScript</option>
                <option value="python">Python</option>
                <option value="java">Java</option>
                <option value="cpp">C++</option>
              </select>
            </div>

            <div className="flex gap-2">
              <Button size="sm" onClick={handleSubmit} disabled={verifying} className="bg-green-600 hover:bg-green-500 text-white shadow-lg shadow-green-900/20 border-0">
                {verifying && <Loader2 className="w-3 h-3 animate-spin mr-2" />}
                {verifying ? "Judge..." : "Run Code"} <Play className="w-3 h-3 ml-2 fill-current" />
              </Button>
            </div>
          </div>
          <TabsContent value="code" className="flex-1 p-0 m-0 relative">
            <Textarea
              className="w-full h-full font-mono resize-none border-0 focus-visible:ring-0 p-4 text-sm bg-[#0F172A] text-slate-300 leading-6"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder={`Write your ${language} code here...`}
              spellCheck={false}
            />
          </TabsContent>
          <TabsContent value="solution" className="flex-1 p-4 bg-[#0F172A]">
            <div className="text-sm text-slate-400 p-4 text-center border border-dashed border-slate-700 rounded-lg h-full flex items-center justify-center">
              Please try solving it first! Solution will unlock after 1 attempt.
            </div>
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  )
}
