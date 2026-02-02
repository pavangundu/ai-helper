
"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Plus, Trash2, Printer, Download, ChevronDown, ChevronUp, Sparkles, Loader2 } from "lucide-react"

export default function ResumeBuilderPage() {
  const [activeTab, setActiveTab] = useState("optimize")
  const [jobDescription, setJobDescription] = useState("")
  const [isOptimizing, setIsOptimizing] = useState(false)

  const [resumeData, setResumeData] = useState({
    fullName: "",
    email: "",
    phone: "",
    linkedin: "",
    github: "",
    careerObjective: "",
    education: [] as any[],
    skills: [
      { category: "Languages", items: "Java, Python, C++" },
      { category: "Web Technologies", items: "React, Next.js, Tailwind CSS" },
      { category: "Tools", items: "Git, Docker, VS Code" }
    ] as { category: string, items: string }[],
    projects: [] as any[],
    certifications: [] as string[]
  })

  const printRef = useRef<HTMLDivElement>(null)

  const handlePrint = () => {
    window.print()
  }

  const updateField = (field: string, value: any) => {
    setResumeData(prev => ({ ...prev, [field]: value }))
  }

  // --- Skills Helpers ---
  const addSkillCategory = () => {
    setResumeData(prev => ({
      ...prev,
      skills: [...(prev.skills || []), { category: "", items: "" }]
    }))
  }

  const updateSkillCategory = (index: number, field: 'category' | 'items', value: string) => {
    setResumeData(prev => {
      const newSkills = [...(prev.skills || [])];
      newSkills[index] = { ...newSkills[index], [field]: value };
      return { ...prev, skills: newSkills };
    })
  }

  const removeSkillCategory = (index: number) => {
    setResumeData(prev => {
      const newSkills = [...(prev.skills || [])];
      newSkills.splice(index, 1);
      return { ...prev, skills: newSkills };
    })
  }

  const handleOptimize = async () => {
    if (!jobDescription.trim()) return;
    setIsOptimizing(true);
    try {
      const res = await fetch('/api/resume/optimize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          resumeData,
          jobDescription
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || 'Optimization failed');
      }

      const optimizedData = await res.json();

      // Merge safely, ensuring arrays are arrays
      setResumeData(prev => {
        const sanitizedCerts = (optimizedData.certifications || prev.certifications || []).map((c: any) => {
          if (typeof c === 'string') return c;
          if (typeof c === 'object' && c !== null) {
            return `${c.name || c.title || ''} ${c.issuer ? '- ' + c.issuer : ''} ${c.date ? '(' + c.date + ')' : ''}`.trim();
          }
          return String(c);
        });

        const sanitizedProjects = (optimizedData.projects || prev.projects || []).map((p: any) => {
          // AI might return points in various keys despite prompt
          const rawPoints = p.points || p.bullets || p.description || p.achievements || [];

          // Ensure points is an array of strings
          const pointsArray = Array.isArray(rawPoints)
            ? rawPoints
            : typeof rawPoints === 'string'
              ? [rawPoints] // If AI returns a single string paragraph
              : [];

          return {
            ...p,
            points: pointsArray.map((pt: any) => {
              if (typeof pt === 'string') return pt;
              if (typeof pt === 'object' && pt !== null) {
                return pt.description || pt.point || JSON.stringify(pt);
              }
              return String(pt);
            })
          };
        });

        // Sanitize Skills: Ensure it's an array of objects
        let sanitizedSkills = optimizedData.skills;
        if (!Array.isArray(sanitizedSkills)) {
          // Check if it's the old object format and convert
          if (typeof sanitizedSkills === 'object' && sanitizedSkills !== null) {
            sanitizedSkills = Object.entries(sanitizedSkills).map(([cat, items]) => ({
              category: cat.replace(/([A-Z])/g, ' $1').trim(), // camelCase directly to Title Case if possible
              items: String(items)
            }));
          } else {
            sanitizedSkills = prev.skills || [];
          }
        }

        return {
          ...prev,
          ...optimizedData,
          education: optimizedData.education || prev.education || [],
          projects: sanitizedProjects,
          certifications: sanitizedCerts,
          skills: sanitizedSkills
        };
      });

      setActiveTab("bio"); // Go back to bio to see changes (Objective usually first)
      alert("Resume Optimized with AI Magic! ✨");

    } catch (error: any) {
      console.error(error);
      alert(`Failed to optimize resume: ${error.message}`);
    } finally {
      setIsOptimizing(false);
    }
  }

  // --- Education Helpers ---
  const addEducation = () => {
    setResumeData(prev => ({
      ...prev,
      education: [...(prev.education || []), { school: "", degree: "", year: "", gpa: "" }]
    }))
  }
  const updateEducation = (index: number, field: string, value: string) => {
    setResumeData(prev => {
      const newEdu = [...(prev.education || [])].map((item, i) =>
        i === index ? { ...item, [field]: value } : item
      );
      return { ...prev, education: newEdu };
    })
  }
  const removeEducation = (index: number) => {
    setResumeData(prev => {
      const newEdu = [...(prev.education || [])];
      newEdu.splice(index, 1);
      return { ...prev, education: newEdu };
    })
  }

  // --- Project Helpers (Immutable) ---
  const addProject = () => {
    setResumeData(prev => ({
      ...prev,
      projects: [...(prev.projects || []), { name: "", date: "", points: [""] }]
    }))
  }
  const updateProject = (index: number, field: string, value: any) => {
    setResumeData(prev => {
      const newProj = [...(prev.projects || [])].map((item, i) =>
        i === index ? { ...item, [field]: value } : item
      );
      return { ...prev, projects: newProj };
    })
  }
  const updateProjectPoint = (pIndex: number, ptIndex: number, value: string) => {
    setResumeData(prev => {
      const newProj = [...(prev.projects || [])].map((proj, i) => {
        if (i === pIndex) {
          const newPoints = [...(proj.points || [])];
          newPoints[ptIndex] = value;
          return { ...proj, points: newPoints };
        }
        return proj;
      });
      return { ...prev, projects: newProj };
    })
  }
  const addProjectPoint = (pIndex: number) => {
    setResumeData(prev => {
      const newProj = [...(prev.projects || [])].map((proj, i) => {
        if (i === pIndex) {
          return { ...proj, points: [...(proj.points || []), ""] };
        }
        return proj;
      });
      return { ...prev, projects: newProj };
    })
  }
  const removeProjectPoint = (pIndex: number, ptIndex: number) => {
    setResumeData(prev => {
      const newProj = [...(prev.projects || [])].map((proj, i) => {
        if (i === pIndex) {
          const newPoints = [...(proj.points || [])];
          newPoints.splice(ptIndex, 1);
          return { ...proj, points: newPoints };
        }
        return proj;
      });
      return { ...prev, projects: newProj };
    })
  }
  const removeProject = (index: number) => {
    setResumeData(prev => {
      const newProj = [...(prev.projects || [])];
      newProj.splice(index, 1);
      return { ...prev, projects: newProj };
    })
  }

  // --- Certification Helpers ---
  const addCertification = () => {
    setResumeData(prev => ({
      ...prev,
      certifications: [...(prev.certifications || []), ""]
    }))
  }
  const updateCertification = (index: number, value: string) => {
    setResumeData(prev => {
      const newCerts = [...(prev.certifications || [])];
      newCerts[index] = value;
      return { ...prev, certifications: newCerts };
    })
  }
  const removeCertification = (index: number) => {
    setResumeData(prev => {
      const newCerts = [...(prev.certifications || [])];
      newCerts.splice(index, 1);
      return { ...prev, certifications: newCerts };
    })
  }


  return (
    <div className="p-4 md:p-8 max-w-[1800px] mx-auto space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 no-print">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-2">
            Resume Builder <span className="text-sm bg-blue-600/20 text-blue-400 px-2 py-0.5 rounded-full border border-blue-500/30">AI Powered</span>
          </h1>
          <p className="text-slate-400">Craft a resume that gets you hired. Matches top ATS standards.</p>
        </div>
        <div className="flex gap-2">
          {/* <Button variant="outline" className="text-slate-900 bg-white">
             <Download className="w-4 h-4 mr-2" /> Download JSON
          </Button> */}
          <Button onClick={handlePrint} className="bg-blue-600 hover:bg-blue-500">
            <Printer className="w-4 h-4 mr-2" /> Print / Save PDF
          </Button>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-8 items-start">

        {/* === EDITOR SECTION (Left) === */}
        <div className="space-y-6 no-print h-[calc(100vh-100px)] overflow-y-auto pr-4 scrollbar-thin scrollbar-thumb-slate-700 pb-20">

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-6 bg-slate-800 text-slate-400">
              <TabsTrigger value="optimize" className="text-blue-400 data-[state=active]:text-blue-300 data-[state=active]:bg-blue-900/30"><Sparkles className="w-3 h-3 mr-1" /> AI</TabsTrigger>
              <TabsTrigger value="bio">Bio</TabsTrigger>
              <TabsTrigger value="edu">Edu</TabsTrigger>
              <TabsTrigger value="skills">Skills</TabsTrigger>
              <TabsTrigger value="projects">Work</TabsTrigger>
              <TabsTrigger value="certs">Certs</TabsTrigger>
            </TabsList>

            {/* 1. PERSONAL (Bio) */}
            <TabsContent value="bio" className="space-y-4 mt-4">
              <Card className="bg-slate-900 border-slate-800">
                <CardHeader><CardTitle className="text-white">Header & Objective</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-slate-300">Full Name</Label>
                      <Input className="bg-slate-950 border-slate-800 text-white" value={resumeData.fullName} onChange={e => updateField("fullName", e.target.value)} />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-slate-300">Email</Label>
                      <Input className="bg-slate-950 border-slate-800 text-white" value={resumeData.email} onChange={e => updateField("email", e.target.value)} />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-slate-300">Phone</Label>
                      <Input
                        className="bg-slate-950 border-slate-800 text-white"
                        value={resumeData.phone}
                        onChange={e => {
                          const val = e.target.value.replace(/\D/g, '').slice(0, 10);
                          updateField("phone", val);
                        }}
                        maxLength={10}
                        placeholder="1234567890"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-slate-300">LinkedIn URL</Label>
                      <Input className="bg-slate-950 border-slate-800 text-white" value={resumeData.linkedin} onChange={e => updateField("linkedin", e.target.value)} />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <Label className="text-slate-300">GitHub URL</Label>
                      <Input className="bg-slate-950 border-slate-800 text-white" value={resumeData.github} onChange={e => updateField("github", e.target.value)} />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-slate-300">Career Objective</Label>
                    <Textarea
                      className="bg-slate-950 border-slate-800 text-white min-h-[120px] leading-relaxed"
                      value={resumeData.careerObjective}
                      onChange={e => updateField("careerObjective", e.target.value)}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* 2. EDUCATION */}
            <TabsContent value="edu" className="space-y-4 mt-4">
              <Card className="bg-slate-900 border-slate-800">
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="text-white">Education</CardTitle>
                  <Button size="sm" onClick={addEducation} className="bg-blue-600 hover:bg-blue-500"><Plus className="w-4 h-4 mr-1" /> Add</Button>
                </CardHeader>
                <CardContent className="space-y-4">
                  {resumeData.education?.map((edu, idx) => (
                    <div key={idx} className="p-4 border border-slate-700 rounded-lg bg-slate-950/50 space-y-3 relative">
                      <Button size="icon" variant="ghost" className="absolute top-2 right-2 text-red-400" onClick={() => removeEducation(idx)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                      <Input className="bg-slate-900 border-slate-700 text-white font-bold" placeholder="Institution Name" value={edu.school} onChange={e => updateEducation(idx, "school", e.target.value)} />
                      <Input className="bg-slate-900 border-slate-700 text-white" placeholder="Degree / Stream" value={edu.degree} onChange={e => updateEducation(idx, "degree", e.target.value)} />
                      <div className="grid grid-cols-2 gap-4">
                        <Input className="bg-slate-900 border-slate-700 text-white" placeholder="Year / Duration" value={edu.year} onChange={e => updateEducation(idx, "year", e.target.value)} />
                        <Input className="bg-slate-900 border-slate-700 text-white" placeholder="GPA / Percentage" value={edu.gpa} onChange={e => updateEducation(idx, "gpa", e.target.value)} />
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </TabsContent>

            {/* 3. SKILLS (Dynamic) */}
            <TabsContent value="skills" className="space-y-4 mt-4">
              <Card className="bg-slate-900 border-slate-800">
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="text-white">Technical Skills</CardTitle>
                    <CardDescription>Add, remove, or rename skill categories.</CardDescription>
                  </div>
                  <Button size="sm" onClick={addSkillCategory} className="bg-blue-600 hover:bg-blue-500"><Plus className="w-4 h-4 mr-1" /> Add Category</Button>
                </CardHeader>
                <CardContent className="space-y-4">
                  {(resumeData.skills || []).map((skill, idx) => (
                    <div key={idx} className="p-4 border border-slate-700 rounded-lg bg-slate-950/50 space-y-2 relative">
                      <Button size="icon" variant="ghost" className="absolute top-2 right-2 text-red-400 hover:bg-red-900/20" onClick={() => removeSkillCategory(idx)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                      <Label className="text-slate-400 text-xs uppercase">Category Name</Label>
                      <Input
                        className="bg-slate-900 border-slate-700 text-blue-200 font-semibold mb-2"
                        value={skill.category}
                        onChange={e => updateSkillCategory(idx, 'category', e.target.value)}
                        placeholder="e.g. Languages"
                      />
                      <Label className="text-slate-400 text-xs uppercase">Skills List</Label>
                      <Input
                        className="bg-slate-950 border-slate-800 text-white"
                        value={skill.items}
                        onChange={e => updateSkillCategory(idx, 'items', e.target.value)}
                        placeholder="e.g. Java, Python, C++"
                      />
                    </div>
                  ))}
                </CardContent>
              </Card>
            </TabsContent>

            {/* 4. PROJECTS (Work) */}
            <TabsContent value="projects" className="space-y-4 mt-4">
              <Card className="bg-slate-900 border-slate-800">
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="text-white">Projects</CardTitle>
                  <Button size="sm" onClick={addProject} className="bg-blue-600 hover:bg-blue-500"><Plus className="w-4 h-4 mr-1" /> Add Project</Button>
                </CardHeader>
                <CardContent className="space-y-6">
                  {resumeData.projects?.map((proj, idx) => (
                    <div key={idx} className="p-4 border border-slate-700 rounded-lg bg-slate-950/50 space-y-3 relative">
                      <Button size="icon" variant="ghost" className="absolute top-2 right-2 text-red-400 hover:text-red-300 hover:bg-red-900/20" onClick={() => removeProject(idx)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>

                      <div className="grid gap-3 pr-10">
                        <Input className="bg-slate-900 border-slate-700 text-white font-semibold" placeholder="Project Name" value={proj.name} onChange={e => updateProject(idx, "name", e.target.value)} />
                        <Input className="bg-slate-900 border-slate-700 text-white" placeholder="Date (e.g. Aug 2024 - Dec 2024)" value={proj.date} onChange={e => updateProject(idx, "date", e.target.value)} />
                      </div>

                      <div className="space-y-2 pl-2 border-l-2 border-slate-700">
                        <Label className="text-slate-400 text-xs uppercase">Bullet Points</Label>
                        {(proj.points || []).map((pt: string, ptIdx: number) => (
                          <div key={ptIdx} className="flex gap-2">
                            <Input
                              className="bg-slate-900 border-slate-700 text-slate-200 text-sm"
                              value={pt}
                              onChange={e => updateProjectPoint(idx, ptIdx, e.target.value)}
                            />
                            <Button size="icon" variant="ghost" className="h-10 w-10 text-slate-500 hover:text-red-400" onClick={() => removeProjectPoint(idx, ptIdx)}>
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                        ))}
                        <Button size="sm" variant="outline" onClick={() => addProjectPoint(idx)} className="text-slate-400 border-slate-700 hover:bg-slate-800 w-full mt-2">
                          <Plus className="w-3 h-3 mr-2" /> Add Point
                        </Button>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </TabsContent>

            {/* 5. CERTIFICATIONS */}
            <TabsContent value="certs" className="space-y-4 mt-4">
              <Card className="bg-slate-900 border-slate-800">
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="text-white">Certifications</CardTitle>
                  <Button size="sm" onClick={addCertification} className="bg-blue-600 hover:bg-blue-500"><Plus className="w-4 h-4 mr-1" /> Add</Button>
                </CardHeader>
                <CardContent className="space-y-3">
                  {resumeData.certifications?.map((cert, idx) => (
                    <div key={idx} className="flex gap-2">
                      <Input className="bg-slate-950 border-slate-800 text-white" value={cert} onChange={e => updateCertification(idx, e.target.value)} placeholder="Certification Name - Issuer" />
                      <Button size="icon" variant="ghost" className="text-red-400" onClick={() => removeCertification(idx)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </TabsContent>

            {/* 6. AI OPTIMIZER */}
            <TabsContent value="optimize" className="space-y-4 mt-4">
              <Card className="bg-slate-900 border-slate-800 border-l-4 border-l-blue-500">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2"><Sparkles className="w-5 h-5 text-blue-400" /> Optimize for Job Description</CardTitle>
                  <CardDescription>Paste a JD below. AI will tailor your Resume's Objective, Skills, and Projects for this role.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Textarea
                    placeholder="Paste the Job Description here..."
                    className="min-h-[300px] bg-slate-950 border-slate-800 text-white resize-none"
                    value={jobDescription}
                    onChange={(e) => setJobDescription(e.target.value)}
                  />
                  <Button
                    onClick={handleOptimize}
                    disabled={isOptimizing || !jobDescription.trim()}
                    className="w-full bg-blue-600 hover:bg-blue-500 py-6 text-lg font-semibold shadow-lg shadow-blue-900/20"
                  >
                    {isOptimizing ? <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Optimizing...</> : <><Sparkles className="w-5 h-5 mr-2" /> Optimize Resume</>}
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

          </Tabs>
        </div>


        {/* === PREVIEW SECTION (Right) === */}
        {/* Using standard A4 proportions (roughly 1:1.414) */}
        {/* Font size 10pt-11pt equivalent */}
        <div className="border border-white/10 shadow-2xl bg-white text-black print:w-[210mm] print:h-[297mm] print:absolute print:top-0 print:left-0 print:m-0 print:z-50 print:overflow-hidden overflow-hidden min-h-[1100px] w-full max-w-[850px] mx-auto p-[40px]" ref={printRef}>

          {/* HEADER */}
          <div className="text-center mb-6">
            <h1 className="text-[24px] font-bold uppercase tracking-wide mb-1.5">{resumeData.fullName}</h1>
            <div className="text-[10pt] text-black space-y-0.5">
              <div>
                <span className="mr-2">{resumeData.phone}</span>
                <span className="mx-1">·</span>
                <a href={`mailto:${resumeData.email}`} className="text-blue-700 underline mx-2">{resumeData.email}</a>
              </div>
              <div className="flex justify-center gap-4">
                <a href={resumeData.linkedin} className="text-blue-700 underline" target="_blank">{resumeData.linkedin}</a>
              </div>
              <div className="flex justify-center gap-4">
                <a href={resumeData.github} className="text-blue-700 underline" target="_blank">{resumeData.github}</a>
              </div>
            </div>
          </div>

          {/* OBJECTIVE */}
          <div className="mb-5">
            <div className="font-bold text-[11pt] uppercase border-b-2 border-black mb-2">CAREER OBJECTIVE:</div>
            <p className="text-[10pt] leading-snug text-justify">
              {resumeData.careerObjective}
            </p>
          </div>

          {/* EDUCATION */}
          <div className="mb-5">
            <div className="font-bold text-[11pt] uppercase border-b-2 border-black mb-2">EDUCATION QUALIFICATION:</div>
            <div className="space-y-3">
              {resumeData.education?.map((edu, i) => (
                <div key={i} className="flex justify-between items-start text-[10pt]">
                  <div>
                    <div className="font-bold uppercase">{edu.school}</div>
                    <div>{edu.degree}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold">{edu.year}</div>
                    <div className="font-bold">{edu.gpa}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* TECHNICAL SKILLS */}
          <div className="mb-5">
            <div className="font-bold text-[11pt] uppercase border-b-2 border-black mb-2">TECHNICAL SKILLS:</div>
            <div className="text-[10pt] space-y-1">
              {(resumeData.skills || []).map((skill, idx) => (
                <div key={idx} className="flex">
                  <span className="font-bold w-[220px] shrink-0">{skill.category}:</span>
                  <span>{skill.items}</span>
                </div>
              ))}
            </div>
          </div>

          {/* PROJECTS */}
          <div className="mb-5">
            <div className="font-bold text-[11pt] uppercase border-b-2 border-black mb-2">PROJECTS:</div>
            <div className="space-y-4">
              {resumeData.projects?.map((proj, i) => (
                <div key={i}>
                  <div className="flex justify-between items-baseline mb-1">
                    <h3 className="text-[10pt] font-bold">{proj.name}</h3>
                    <span className="text-[10pt] font-bold">{proj.date}</span>
                  </div>
                  <ul className="list-disc ml-5 space-y-0.5">
                    {(proj.points || []).map((pt: string, idx: number) => (
                      <li key={idx} className="text-[10pt] text-justify pl-1">{pt}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          {/* CERTIFICATIONS */}
          <div className="mb-5">
            <div className="font-bold text-[11pt] uppercase border-b-2 border-black mb-2">CERTIFICATIONS:</div>
            <ul className="list-disc ml-5 space-y-1">
              {resumeData.certifications?.map((cert, idx) => (
                <li key={idx} className="text-[10pt]">{cert}</li>
              ))}
            </ul>
          </div>

        </div>
      </div>

      <style jsx global>{`
          @media print {
              .no-print { display: none !important; }
              body { background: white; margin: 0; padding: 0; }
              @page { margin: 0; size: A4; }
          }
      `}</style>
    </div>
  )
}
