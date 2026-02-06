"use client";

import { useState, useEffect } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { toast } from "sonner";
import { Key, X } from "lucide-react";

interface ApiKeyDialogProps {
  trigger?: React.ReactNode;
  className?: string;
  defaultOpen?: boolean;
}

export function ApiKeyDialog({ trigger, className, defaultOpen = false }: ApiKeyDialogProps) {
  const [open, setOpen] = useState(defaultOpen);
  const [key, setKey] = useState("");

  useEffect(() => {
    if (open) {
      setKey(localStorage.getItem("gemini_api_key") || "");
    }
  }, [open]);

  const save = async () => {
    if (key.trim()) {
      try {
        const res = await fetch("/api/settings/apikey", {
          method: "POST",
          body: JSON.stringify({ apiKey: key.trim() }),
          headers: { "Content-Type": "application/json" }
        });

        if (res.ok) {
          toast.success("API Key saved globally! (Server restarting...)");
        } else {
          toast.warning("Saved locally only (Server write failed)");
        }
      } catch (e) {
        console.error("Failed to save to server", e);
      }
      localStorage.setItem("gemini_api_key", key.trim());
    } else {
      localStorage.removeItem("gemini_api_key");
      toast.info("API Key removed");
    }
    setOpen(false);
  };

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>
        <div className={className}>
          {trigger || (
            <Button variant="outline" size="sm" className="bg-slate-800 border-slate-700 hover:bg-slate-700 hover:text-white transition-all w-full justify-start">
              <Key className="w-4 h-4 mr-2 text-blue-400" />
              <span className="bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent font-bold">GEMINI KEY</span>
            </Button>
          )}
        </div>
      </Dialog.Trigger>

      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/60 backdrop-blur-md z-[9999] animate-in fade-in duration-300" />
        <Dialog.Content className="fixed left-[50%] top-[50%] z-[10000] w-full max-w-lg translate-x-[-50%] translate-y-[-50%] outline-none animate-in zoom-in-95 slide-in-from-bottom-5 duration-300">

          <div className="bg-[#0F172A] border border-white/10 rounded-2xl shadow-2xl shadow-blue-500/10 overflow-hidden">
            {/* Header */}
            <div className="relative p-6 pb-8 bg-gradient-to-b from-blue-500/10 to-transparent">
              <Dialog.Close asChild>
                <button className="absolute top-4 right-4 p-2 rounded-full hover:bg-white/10 text-slate-400 hover:text-white transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </Dialog.Close>

              <div className="flex flex-col items-center text-center space-y-2">
                <div className="p-3 bg-blue-500/20 rounded-full mb-2 ring-1 ring-blue-500/40 shadow-[0_0_15px_rgba(59,130,246,0.5)]">
                  <Key className="w-8 h-8 text-blue-400" />
                </div>
                <Dialog.Title className="text-2xl font-bold text-white tracking-tight">
                  Unlock AI Powers
                </Dialog.Title>
                <Dialog.Description className="text-slate-400 text-sm max-w-xs leading-relaxed">
                  Enter your <span className="text-blue-400 font-medium">Gemini API Key</span> to enable unlimited usage.
                </Dialog.Description>
              </div>
            </div>

            {/* Body */}
            <div className="p-6 pt-0 space-y-6">
              <div className="space-y-3">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500 ml-1">
                  Your API Key
                </label>
                <div className="relative group">
                  <Input
                    value={key}
                    onChange={(e) => setKey(e.target.value)}
                    type="password"
                    placeholder="AIzaSy..."
                    className="h-12 bg-[#1E293B]/50 border-slate-700 text-white placeholder:text-slate-600 font-mono text-sm focus:border-blue-500 focus:ring-blue-500/20 transition-all pl-4 pr-4 rounded-xl group-hover:border-slate-600"
                  />
                </div>
                <p className="text-[10px] text-slate-500 flex justify-between px-1">
                  <span>Stored securely in .env.local</span>
                  <a href="https://aistudio.google.com/app/apikey" target="_blank" className="text-blue-400 hover:text-blue-300 hover:underline flex items-center gap-1 transition-colors">
                    Get API Key &rarr;
                  </a>
                </p>
              </div>

              <div className="flex gap-3 pt-2">
                <Dialog.Close asChild>
                  <Button variant="ghost" className="flex-1 h-11 rounded-xl text-slate-400 hover:text-white hover:bg-white/5">
                    Cancel
                  </Button>
                </Dialog.Close>
                <Button
                  onClick={save}
                  className="flex-1 h-11 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold shadow-lg shadow-blue-500/25 transition-all hover:scale-[1.02] active:scale-[0.98]"
                >
                  Save Configuration
                </Button>
              </div>
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
