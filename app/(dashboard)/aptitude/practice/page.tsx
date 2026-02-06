
"use client"

import { useState, useEffect, Suspense } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { CheckCircle, XCircle, AlertCircle, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { ProgressRing } from "@/components/ui/progress-ring"

function PracticeContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const topic = searchParams.get("topic") || "General Aptitude"

  const [questions, setQuestions] = useState<any[]>([])
  const [currentQ, setCurrentQ] = useState(0)
  const [answers, setAnswers] = useState<Record<number, string>>({})
  const [submitted, setSubmitted] = useState(false)
  const [score, setScore] = useState(0)
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false) // For creating questions

  useEffect(() => {
    generateQuiz()
  }, [topic])

  async function generateQuiz() {
    setLoading(true)
    try {
      // In a real app, this would call an API. For now, we simulate AI generation or fetch from an endpoint.
      // Let's call our Gemini API to get questions dynamically!
      const res = await fetch("/api/aptitude/generate", {
        method: "POST",
        body: JSON.stringify({ topic }),
        headers: { "Content-Type": "application/json" }
      })

      if (!res.ok) throw new Error("Failed to generate quiz")

      const data = await res.json()
      setQuestions(data.questions)
    } catch (error) {
      console.error(error)
      toast.error("Failed to load questions")
    } finally {
      setLoading(false)
    }
  }

  function handleOptionSelect(value: string) {
    if (submitted) return
    setAnswers(prev => ({ ...prev, [currentQ]: value }))
  }

  async function handleSubmit() {
    let correct = 0
    questions.forEach((q, idx) => {
      if (answers[idx] === q.correctAnswer) correct++
    })

    const percentage = (correct / questions.length) * 100
    setScore(percentage)
    setSubmitted(true)

    if (percentage >= 70) {
      toast.success(`You passed with ${percentage}%!`)
    } else {
      toast.error(`You scored ${percentage}%. You need 70% to pass.`)
    }
  }

  if (loading) return (
    <div className="flex flex-col items-center justify-center h-[60vh] space-y-4">
      <Loader2 className="w-12 h-12 animate-spin text-primary" />
      <p className="text-muted-foreground">AI is crafting tricky questions for {topic}...</p>
    </div>
  )

  if (submitted) {
    const passed = score >= 70
    const correctCount = questions.filter((_, i) => answers[i] === questions[i].correctAnswer).length

    return (
      <div className="p-8 max-w-5xl mx-auto space-y-8 animate-in fade-in duration-700">

        {/* Modern Glassmorphism Score Card */}
        <div className="relative overflow-hidden rounded-3xl bg-slate-950 shadow-2xl border border-slate-800 text-white">
          {/* Ambient Background Glows */}
          <div className={`absolute top-0 right-0 w-96 h-96 ${passed ? "bg-green-600/20" : "bg-red-600/20"} blur-3xl rounded-full -translate-y-1/2 translate-x-1/2`} />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-600/10 blur-3xl rounded-full translate-y-1/2 -translate-x-1/2" />

          <div className="relative z-10 grid md:grid-cols-2 gap-8 p-10 md:p-14 items-center">
            <div className="space-y-6 text-center md:text-left">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/10 text-sm font-semibold tracking-wide uppercase">
                {passed ? <CheckCircle className="w-4 h-4 text-green-400" /> : <XCircle className="w-4 h-4 text-red-500" />}
                {passed ? "Mission Accomplished" : "Mission Failed"}
              </div>

              <div className="space-y-2">
                <h1 className="text-5xl md:text-6xl font-black tracking-tight text-white mb-2">
                  {passed ? "Outstanding!" : "Nice Try!"}
                </h1>
                <p className="text-lg text-slate-400 max-w-md leading-relaxed">
                  {passed
                    ? "You've crushed this topic with flying colors. Your coding journey is on fire! 🔥"
                    : "Don't sweat it. Review your mistakes below, learn the patterns, and come back stronger. 💪"}
                </p>
              </div>

              <div className="flex flex-wrap gap-4 justify-center md:justify-start pt-4">
                <Button
                  size="lg"
                  onClick={() => router.push("/dashboard")}
                  className="bg-white text-slate-950 hover:bg-slate-200 font-bold px-8 rounded-full"
                >
                  Continue Journey
                </Button>
                {!passed && (
                  <Button
                    size="lg"
                    variant="outline"
                    onClick={() => window.location.reload()}
                    className="border-slate-700 hover:border-slate-500 text-white hover:bg-white/5 rounded-full"
                  >
                    Retry Quiz
                  </Button>
                )}
              </div>
            </div>

            <div className="flex justify-center md:justify-end">
              <div className="relative bg-slate-900/50 p-6 rounded-3xl backdrop-blur-sm border border-white/5">
                <ProgressRing
                  radius={100}
                  stroke={12}
                  progress={score}
                  color={passed ? "text-green-500" : "text-red-500"}
                  label={`${score.toFixed(0)}%`}
                  subLabel={passed ? "MASTERY" : "SCORE"}
                  className="text-white scale-110"
                />
              </div>
            </div>
          </div>

          {/* Quick Stats Footer */}
          <div className="grid grid-cols-3 border-t border-white/10 bg-white/5 divide-x divide-white/10">
            <div className="p-6 text-center hover:bg-white/5 transition-colors">
              <div className="text-3xl font-bold text-green-400 mb-1">{correctCount}</div>
              <div className="text-xs uppercase tracking-wider text-slate-500 font-semibold">Correct</div>
            </div>
            <div className="p-6 text-center hover:bg-white/5 transition-colors">
              <div className="text-3xl font-bold text-red-400 mb-1">{questions.length - correctCount}</div>
              <div className="text-xs uppercase tracking-wider text-slate-500 font-semibold">Mistakes</div>
            </div>
            <div className="p-6 text-center hover:bg-white/5 transition-colors">
              <div className="text-3xl font-bold text-blue-400 mb-1">{questions.length}</div>
              <div className="text-xs uppercase tracking-wider text-slate-500 font-semibold">Total</div>
            </div>
          </div>
        </div>

        {/* Detailed Question Analysis */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <span className="bg-primary/10 w-8 h-8 rounded-lg flex items-center justify-center text-primary">📝</span>
              Detailed Analysis
            </h2>
          </div>

          <div className="grid gap-6">
            {questions.map((q, idx) => {
              const isCorrect = answers[idx] === q.correctAnswer;
              return (
                <div key={idx} className={`group relative bg-card hover:bg-accent/50 border transition-all duration-300 rounded-2xl overflow-hidden ${isCorrect ? "border-green-500/20" : "border-red-500/20"}`}>
                  {/* Accent Bar */}
                  <div className={`absolute top-0 bottom-0 left-0 w-1.5 ${isCorrect ? "bg-green-500" : "bg-red-500 transition-all group-hover:w-2"}`} />

                  <div className="p-6 pl-8">
                    <div className="flex justify-between items-start gap-4 mb-4">
                      <h3 className="text-lg font-semibold leading-snug text-foreground">
                        <span className="text-muted-foreground mr-3 text-base font-normal">Q{idx + 1}.</span>
                        {q.question}
                      </h3>
                      {isCorrect ? (
                        <div className="flex-shrink-0 bg-green-500/10 text-green-600 dark:text-green-400 px-3 py-1 rounded-full text-xs font-bold border border-green-500/20">
                          Correct
                        </div>
                      ) : (
                        <div className="flex-shrink-0 bg-red-500/10 text-red-600 dark:text-red-400 px-3 py-1 rounded-full text-xs font-bold border border-red-500/20">
                          Incorrect
                        </div>
                      )}
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      {/* User Answer */}
                      {/* Use generic backgrounds (muted/accent) instead of specific colors to respect theme */}
                      <div className={`p-4 rounded-xl border ${isCorrect
                        ? "bg-muted/50 border-green-500/30"
                        : "bg-muted/50 border-red-500/30"}`}>
                        <div className="text-xs uppercase font-bold opacity-60 mb-2 flex items-center gap-2">
                          Your Selection {isCorrect && <CheckCircle className="w-3 h-3" />}
                        </div>
                        <div className={`font-medium ${isCorrect ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}>
                          {answers[idx] || "Not Answered"}
                        </div>
                      </div>

                      {/* Correct Answer (only show if wrong) */}
                      {!isCorrect && (
                        <div className="p-4 rounded-xl border bg-muted/50 border-emerald-500/30">
                          <div className="text-xs uppercase font-bold opacity-60 mb-2 flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
                            Correct Answer <CheckCircle className="w-3 h-3" />
                          </div>
                          <div className="font-medium text-emerald-700 dark:text-emerald-400">
                            {q.correctAnswer}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Explanation */}
                    <div className="mt-4 pt-4 border-t border-border/50">
                      <div className="flex text-sm text-foreground/80 leading-relaxed gap-3">
                        <div className="mt-0.5 bg-primary/10 p-1 rounded-md h-fit">
                          <AlertCircle className="w-4 h-4 text-primary" />
                        </div>
                        <div className="flex-1">
                          <span className="font-semibold text-foreground mr-1">Explanation:</span>
                          {q.explanation}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    )
  }

  // Handle case where API fails or returns no questions (CRASH FIX)
  if (!questions || questions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 h-[60vh] text-center space-y-6">
        <div className="bg-red-100 dark:bg-red-900/20 p-6 rounded-full">
          <AlertCircle className="w-12 h-12 text-red-500" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-bold">Failed to load quiz</h2>
          <p className="text-muted-foreground max-w-sm mx-auto">
            We encountered an issue creating your questions. This might be a temporary connection issue.
          </p>
        </div>
        <Button onClick={() => window.location.reload()}>Try Again</Button>
      </div>
    )
  }

  const q = questions[currentQ]

  return (
    <div className="p-8 max-w-3xl mx-auto h-[calc(100vh-100px)] flex flex-col text-slate-100">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">{topic} Quiz</h1>
          <p className="text-sm text-slate-400">Question {currentQ + 1} of {questions.length}</p>
        </div>
        <div className="text-right">
          <div className="px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm font-mono font-medium">
            {/* Timer placeholder */}
            00:00
          </div>
        </div>
      </div>

      <Progress value={((currentQ) / questions.length) * 100} className="mb-6 h-2 bg-slate-800" indicatorClassName="bg-blue-500" />

      <Card className="flex-1 flex flex-col bg-[#0F172A]/80 border-white/5 backdrop-blur-xl shadow-2xl relative overflow-hidden">
        {/* Glow Effect */}
        <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-blue-600/10 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>

        <CardHeader className="relative z-10 pb-2">
          <CardTitle className="leading-relaxed text-xl text-white font-semibold">{q.question}</CardTitle>
        </CardHeader>
        <CardContent className="flex-1 space-y-4 pt-4 relative z-10 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent pr-2">
          <RadioGroup onValueChange={handleOptionSelect} value={answers[currentQ]} className="space-y-3">
            {q.options.map((opt: string, idx: number) => (
              <div
                key={idx}
                onClick={() => handleOptionSelect(opt)}
                className={`flex items-center space-x-3 border p-4 rounded-xl cursor-pointer transition-all duration-200 group
                  ${answers[currentQ] === opt
                    ? "bg-blue-600/20 border-blue-500/50 shadow-[0_0_15px_rgba(37,99,235,0.15)]"
                    : "bg-[#1E293B]/50 border-white/5 hover:bg-[#1E293B] hover:border-white/10"
                  }`}
              >
                <RadioGroupItem
                  value={opt}
                  id={`opt-${idx}`}
                  className={`border-slate-500 text-blue-500 ${answers[currentQ] === opt ? "border-blue-500" : ""}`}
                />
                <Label
                  htmlFor={`opt-${idx}`}
                  className={`flex-1 cursor-pointer font-medium leading-relaxed py-1 transition-colors ${answers[currentQ] === opt ? "text-blue-100" : "text-slate-300 group-hover:text-white"}`}
                >
                  {opt}
                </Label>
              </div>
            ))}
          </RadioGroup>
        </CardContent>
        <CardFooter className="flex justify-between border-t border-white/5 p-6 bg-white/5 relative z-10">
          <Button
            variant="ghost"
            onClick={() => setCurrentQ(p => Math.max(0, p - 1))}
            disabled={currentQ === 0}
            className="text-slate-400 hover:text-white hover:bg-white/5"
          >
            Previous
          </Button>

          {currentQ === questions.length - 1 ? (
            <Button
              onClick={handleSubmit}
              disabled={Object.keys(answers).length < questions.length}
              className="bg-green-600 hover:bg-green-500 text-white font-bold px-8 shadow-lg shadow-green-900/20"
            >
              Submit Quiz
            </Button>
          ) : (
            <Button
              onClick={() => setCurrentQ(p => Math.min(questions.length - 1, p + 1))}
              className="bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-900/20"
            >
              Next
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  )
}

export default function AptitudePracticePage() {
  return (
    <Suspense fallback={
      <div className="flex flex-col items-center justify-center h-[60vh] space-y-4">
        <Loader2 className="w-12 h-12 animate-spin text-blue-500" />
        <p className="text-slate-400">Loading quiz environment...</p>
      </div>
    }>
      <PracticeContent />
    </Suspense>
  )
}
