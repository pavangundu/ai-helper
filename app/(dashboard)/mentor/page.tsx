
"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Send, Bot, User, RefreshCw } from "lucide-react"
import { toast } from "sonner"

interface Message {
  role: "user" | "bot";
  content: string;
}

export default function MentorChatPage() {
  const [messages, setMessages] = useState<Message[]>([
    { role: "bot", content: "Hello! I'm your AI Mentor. Ask me anything about DSA, Aptitude, or Career guidance. 🚀" }
  ])
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" })
    }
  }, [messages])

  async function handleSend() {
    if (!input.trim()) return

    const newMsg: Message = { role: "user", content: input }
    setMessages(prev => [...prev, newMsg])
    setInput("")
    setLoading(true)

    try {
      const res = await fetch("/api/mentor/chat", {
        method: "POST",
        body: JSON.stringify({
          message: newMsg.content,
          previousMessages: messages.slice(-5),
          userEmail: JSON.parse(localStorage.getItem("user") || "{}").email
        }),
        headers: { "Content-Type": "application/json" }
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "API Failed");

      if (data.reply) {
        setMessages(prev => [...prev, { role: "bot", content: data.reply }])
      }
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || "Failed to get response");
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] max-w-4xl mx-auto p-4 text-slate-100">
      <h1 className="text-2xl font-bold mb-4 flex items-center gap-2 text-white">
        <Bot className="w-8 h-8 text-blue-500" /> AI Mentor Chat
      </h1>

      <Card className="flex-1 flex flex-col overflow-hidden mb-4 bg-[#1E293B]/40 border-white/5 backdrop-blur-md shadow-xl">
        <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
          <div className="space-y-4">
            {messages.map((m, idx) => (
              <div key={idx} className={`flex gap-3 ${m.role === "user" ? "flex-row-reverse" : ""}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${m.role === "user" ? "bg-blue-600 text-white shadow-lg shadow-blue-500/30" : "bg-[#334155] text-slate-200"
                  }`}>
                  {m.role === "user" ? <User className="w-5 h-5" /> : <Bot className="w-5 h-5" />}
                </div>
                <div className={`p-3 rounded-lg max-w-[80%] text-sm leading-relaxed shadow-sm ${m.role === "user" ? "bg-blue-600 text-white" : "bg-[#334155] text-slate-200"
                  }`}>
                  <p className="whitespace-pre-wrap">{m.content}</p>
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-[#334155] flex items-center justify-center shrink-0">
                  <Bot className="w-5 h-5 text-slate-400" />
                </div>
                <div className="p-3 bg-[#334155] rounded-lg flex items-center gap-2 text-slate-400 text-sm">
                  <RefreshCw className="w-3 h-3 animate-spin" /> Thinking...
                </div>
              </div>
            )}
            <div ref={scrollRef} />
          </div>
        </div>
      </Card>

      <div className="flex gap-2 relative">
        <Input
          placeholder="Ask about Two Pointers, Resume tips..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          disabled={loading}
          className="bg-[#1E293B] border-slate-700 text-white focus:border-blue-500 hover:bg-[#1E293B]/80 h-12 pl-4"
        />
        <Button onClick={handleSend} disabled={loading} className="h-12 w-12 bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-900/20">
          <Send className="w-5 h-5" />
        </Button>
      </div>
    </div>
  )
}
