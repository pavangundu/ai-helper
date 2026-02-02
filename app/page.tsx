
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { ArrowRight, CheckCircle, Target, Trophy, Clock, Sparkles } from "lucide-react";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-[#0F172A] text-slate-100 selection:bg-blue-500/30">
      {/* Header */}
      <header className="px-6 lg:px-12 h-20 flex items-center justify-between border-b border-white/5 bg-[#0F172A]/80 backdrop-blur-md sticky top-0 z-50">
        <div className="flex items-center gap-3 font-bold text-xl tracking-tight">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
            <Sparkles className="w-6 h-6 fill-white" />
          </div>
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">JobPrep.AI</span>
        </div>
        <nav className="hidden md:flex gap-8 text-sm font-medium text-slate-300">
          <Link href="#how-it-works" className="hover:text-blue-400 transition-colors">How It Works</Link>
          <Link href="#features" className="hover:text-blue-400 transition-colors">Features</Link>
        </nav>
        <div className="flex items-center gap-4">
          <Link href="/login">
            <Button variant="ghost" className="text-slate-300 hover:text-white hover:bg-white/5">Log In</Button>
          </Link>
          <Link href="/signup">
            <Button className="bg-blue-600 hover:bg-blue-500 text-white font-semibold shadow-lg shadow-blue-900/20">Get Started</Button>
          </Link>
        </div>
      </header>

      <main className="flex-1 relative overflow-hidden">
        {/* Background Gradients */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
          <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[100px]" />
          <div className="absolute bottom-[-10%] left-[-5%] w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[100px]" />
        </div>

        {/* Hero Section */}
        <section className="py-24 lg:py-32 px-6 lg:px-12 text-center flex flex-col items-center relative z-10">
          <div className="inline-flex items-center rounded-full border border-blue-500/30 bg-blue-500/10 px-3 py-1 text-xs font-semibold text-blue-300 mb-6 backdrop-blur-md shadow-[0_0_15px_rgba(59,130,246,0.3)]">
            🚀 Your AI-Powered Placement Mentor
          </div>
          <h1 className="text-4xl lg:text-7xl font-black tracking-tight mb-6 text-white leading-tight">
            Crack Your Dream Job <br className="hidden md:block" /> with <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">Intelligent Guidance</span>
          </h1>
          <p className="text-lg lg:text-xl text-slate-400 max-w-2xl mb-10 leading-relaxed">
            Personalized roadmaps, daily targets, and AI-driven mock interviews for Aptitude, DSA, and Core Subjects. Everything you need in one dashboard.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
            <Link href="/signup">
              <Button size="lg" className="h-14 px-8 text-lg bg-blue-600 hover:bg-blue-500 text-white shadow-xl shadow-blue-900/30 transition-all hover:scale-105 w-full sm:w-auto">
                Start Preparing Free <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Button size="lg" variant="outline" className="h-14 px-8 text-lg border-slate-700 text-slate-300 hover:bg-white/5 hover:text-white hover:border-slate-500 transition-all w-full sm:w-auto">
              View Demo
            </Button>
          </div>

          <div className="mt-20 w-full max-w-6xl rounded-2xl border border-white/10 bg-[#1E293B]/40 backdrop-blur-sm shadow-2xl relative overflow-hidden group">
            <div className="relative aspect-video w-full">
              <Image
                src="/dashboard-real.png"
                alt="Dashboard Preview"
                fill
                className="object-cover"
              />
            </div>
          </div>
        </section>

        {/* Features Grid */}
        <section id="features" className="py-24 px-6 lg:px-12 bg-[#0F172A] relative">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">Everything needed to succeed</h2>
              <p className="text-slate-400 max-w-2xl mx-auto">Stop searching for resources randomly. We organize everything into a structured, achievable path.</p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              <FeatureCard
                icon={<Target className="h-6 w-6 text-blue-400" />}
                title="AI Roadmaps"
                description="Custom generated schedules based on your target role and timeline."
                color="blue"
              />
              <FeatureCard
                icon={<CheckCircle className="h-6 w-6 text-green-400" />}
                title="Daily Missions"
                description="Bite-sized tasks for Aptitude, DSA, and Core skills to keep you consistent."
                color="green"
              />
              <FeatureCard
                icon={<Trophy className="h-6 w-6 text-yellow-400" />}
                title="Gamified Growth"
                description="Earn XP, streaks, and badges. Making preparation addictive."
                color="yellow"
              />
              <FeatureCard
                icon={<Clock className="h-6 w-6 text-purple-400" />}
                title="Smart Tracking"
                description="Detailed analytics on your study hours and topic mastery."
                color="purple"
              />
            </div>
          </div>
        </section>
      </main>

      <footer className="py-10 text-center text-sm text-slate-500 border-t border-white/5 bg-[#0F172A]">
        <p>© 2026 AI JobPrep. Built for the Hackathon.</p>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, description, color }: { icon: React.ReactNode, title: string, description: string, color: string }) {
  const colorMap: any = {
    blue: "bg-blue-500/10 border-blue-500/20 group-hover:border-blue-500/50",
    green: "bg-green-500/10 border-green-500/20 group-hover:border-green-500/50",
    yellow: "bg-yellow-500/10 border-yellow-500/20 group-hover:border-yellow-500/50",
    purple: "bg-purple-500/10 border-purple-500/20 group-hover:border-purple-500/50",
  }

  return (
    <div className={`p-6 rounded-2xl border bg-[#1E293B]/40 hover:bg-[#1E293B]/60 transition-all duration-300 group ${colorMap[color]}`}>
      <div className={`mb-4 p-3 w-fit rounded-xl ${colorMap[color].split(" ")[0]}`}>
        {icon}
      </div>
      <h3 className="text-lg font-bold text-white mb-2">{title}</h3>
      <p className="text-slate-400 text-sm leading-relaxed">{description}</p>
    </div>
  )
}
