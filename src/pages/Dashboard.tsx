import { apiUrl, supabase } from "@/lib/utils";
import { useNavigate, Link } from "react-router-dom";
import { ChangeEvent, useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Bot, HelpCircle, LayoutDashboard, LogOut, Search, Settings, Trophy, Users, ChevronRight, UploadCloud, FileText, MessageSquare, Plus, Star, Zap, Users2 } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const Dashboard = () => {
  const navigate = useNavigate();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState("");
  const [latestQuiz, setLatestQuiz] = useState<{ score: number; total: number; avgTimeMs: number; improvements: { topic: string; count: number }[] } | null>(null);
  const [latestResultId, setLatestResultId] = useState<string | null>(null);
  const [showReport, setShowReport] = useState(false);
  const [report, setReport] = useState<{ quizId: string; topic: string; score: number; total: number; avgTimeMs: number; items: { id: string; type: string; question: string; options: string[]; correctAnswer: string; userAnswer: string; correct: boolean; difficulty: string; timeMs: number; explanation: string; topic: string }[]; advice: string[] } | null>(null);

  const handleSignOut = () => {
    localStorage.removeItem('authToken');
    navigate("/auth");
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
      setFileName(e.target.files[0].name);
    }
  };

    const handleFileUpload = async () => {
    if (selectedFile) {
      if (!supabase) {
        alert("Supabase is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.");
        return;
      }
      try {
        const filePath = `dashboard-uploads/${Date.now()}_${selectedFile.name}`;
        const { error } = await supabase.storage.from('uploads').upload(filePath, selectedFile, { upsert: true });
        if (error) throw error;
        alert("File uploaded successfully!");
        setSelectedFile(null);
        setFileName("");
      } catch (error) {
        alert("Failed to upload file.");
      }
    }
  };

  useEffect(() => {
    const fetchResults = async () => {
      try {
        const res = await fetch(apiUrl('/api/quiz-results'));
        if (res.ok) {
          const js = await res.json();
          const last = js[js.length - 1];
          if (last) {
            setLatestQuiz({ score: last.score, total: last.total, avgTimeMs: last.avgTimeMs, improvements: last.improvements });
            setLatestResultId(last.id);
          }
        }
      } catch { void 0; }
    };
    fetchResults();
  }, []);

  const openReport = async () => {
    if (!latestResultId) return;
    try {
      const res = await fetch(`http://localhost:3002/api/quiz-report/${latestResultId}`);
      if (!res.ok) {
        alert('No detailed report found. Please complete a new quiz.');
        return;
      }
      const js = await res.json();
      setReport(js);
      setShowReport(true);
    } catch {
      alert('Could not load quiz details. Please try again.');
    }
  };
  const closeReport = () => setShowReport(false);


  return (
    <div className="min-h-screen bg-background text-foreground flex">
      {/* Sidebar */}
      <aside className="w-64 bg-muted/20 p-6 flex flex-col justify-between sticky top-0 h-screen">
        <div>
          <div className="mb-10">
            <p className="text-xs text-muted-foreground">NOW VIEWING</p>
            <h1 className="text-lg font-bold">DASHBOARD</h1>
          </div>
          <nav className="flex flex-col space-y-4">
            <Link to="/chat" className="flex items-center gap-3 p-2 rounded-md hover:bg-muted">
              <Bot className="w-5 h-5" />
              <span>Chat</span>
            </Link>
            <Link to="/dashboard" className="flex items-center gap-3 p-2 rounded-md bg-muted text-foreground">
              <LayoutDashboard className="w-5 h-5" />
              <span>Dashboard</span>
            </Link>
            <Link to="/mentor" className="flex items-center gap-3 p-2 rounded-md hover:bg-muted">
              <Bot className="w-5 h-5" />
              <span>AI Tutor</span>
            </Link>
            <Link to="/community" className="flex items-center gap-3 p-2 rounded-md hover:bg-muted">
              <Users className="w-5 h-5" />
              <span>Community</span>
            </Link>
            <Link to="/leaderboard" className="flex items-center gap-3 p-2 rounded-md hover:bg-muted">
              <Trophy className="w-5 h-5" />
              <span>Leaderboard</span>
            </Link>
          </nav>
        </div>
        <div>
            <nav className="flex flex-col space-y-4">
                <Link to="/profile" className="flex items-center gap-3 p-2 rounded-md hover:bg-muted">
                    <Users2 className="w-5 h-5" />
                    <span>Profile</span>
                </Link>
                <Link to="/settings" className="flex items-center gap-3 p-2 rounded-md hover:bg-muted">
                    <Settings className="w-5 h-5" />
                    <span>Settings</span>
                </Link>
                <Link to="/help" className="flex items-center gap-3 p-2 rounded-md hover:bg-muted">
                    <HelpCircle className="w-5 h-5" />
                    <span>Help</span>
                </Link>
            </nav>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 overflow-y-auto">
        {/* Header */}
        <header className="flex items-center justify-between mb-8">
          <div></div>
          <div className="flex items-center gap-4">
             <Input type="search" placeholder="Quick search" className="bg-muted/50 border-border rounded-full w-64" />
            <Button onClick={handleSignOut} className="bg-primary hover:bg-primary/90 rounded-full flex items-center gap-2">
              <span>Logout</span>
              <LogOut className="w-4 h-4" />
            </Button>
            <Link to="/profile">
              <div className="p-0.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-full">
                <Avatar>
                  <AvatarImage src="/avatars/user.png" alt="User" />
                  <AvatarFallback>U</AvatarFallback>
                </Avatar>
              </div>
            </Link>
          </div>
        </header>

        {/* Learning Pulse */}
        <section className="mb-12">
            <div className="flex items-center justify-between mb-4">
                <div>
                    <h2 className="text-lg font-semibold text-muted-foreground">LEARNING PULSE</h2>
                    <p className="text-3xl font-bold">Today's focus</p>
                </div>
                <div className="text-right">
                    <p className="text-sm text-muted-foreground">Active streak: 14 days</p>
                    <p className="text-sm text-muted-foreground">Next block: 1h:15 Calculus sprint</p>
                </div>
            </div>
            <div className="grid grid-cols-3 gap-8">
                <Card className="bg-muted/20 border-border">
                    <CardContent className="pt-6">
                        <div className="flex justify-between items-start">
                            <h3 className="font-bold">Calculus</h3>
                            <Badge variant="outline" className="text-orange-400 border-orange-400">Fragile</Badge>
                        </div>
                        <p className="text-5xl font-bold my-4">72%</p>
                        <p className="text-sm text-muted-foreground">Integration by parts and substitution require attention.</p>
                    </CardContent>
                </Card>
                 <Card className="bg-muted/20 border-border">
                    <CardContent className="pt-6">
                        <div className="flex justify-between items-start">
                            <h3 className="font-bold">AI Ethics</h3>
                            <Badge variant="outline" className="text-green-400 border-green-400">Strong</Badge>
                        </div>
                        <p className="text-5xl font-bold my-4">88%</p>
                        <p className="text-sm text-muted-foreground">Ready for tournament debate prompts.</p>
                    </CardContent>
                </Card>
                 <Card className="bg-muted/20 border-border">
                    <CardContent className="pt-6">
                        <div className="flex justify-between items-start">
                            <h3 className="font-bold">Prompt Engineering</h3>
                            <Badge variant="outline" className="text-yellow-400 border-yellow-400">Emerging</Badge>
                        </div>
                        <p className="text-5xl font-bold my-4">79%</p>
                        <p className="text-sm text-muted-foreground">Complete the live lab to unlock the sprint quest.</p>
                    </CardContent>
                </Card>
            </div>
        </section>

        {/* Action Items, Recommendations, Mentor Nudges, Priority Alerts */}
        <div className="grid grid-cols-2 gap-8 mb-12">
            <div>
                <h3 className="font-semibold mb-4">ACTION ITEMS</h3>
                <Card className="bg-muted/20 border-border">
                    <CardContent className="pt-6 space-y-4">
                        <div className="flex justify-between items-center">
                            <div><p>Integrals checkpoint</p><p className="text-xs text-muted-foreground">Due today</p></div>
                            <div className="w-1/3"><Progress value={40} /></div>
                        </div>
                         <div className="flex justify-between items-center">
                            <div><p>AI Ethics essay feedback</p><p className="text-xs text-muted-foreground">Mentor review</p></div>
                            <div className="w-1/3"><Progress value={75} /></div>
                        </div>
                         <div className="flex justify-between items-center">
                            <div><p>Upload robotics lab notes</p><p className="text-xs text-muted-foreground">Pending upload</p></div>
                            <div className="w-1/3"><Progress value={5} /></div>
                        </div>
                    </CardContent>
                </Card>
            </div>
             <div>
                <h3 className="font-semibold mb-4">RECOMMENDATIONS</h3>
                <div className="grid grid-cols-3 gap-4 text-center">
                    <div><p className="text-lg font-bold">+1.4h</p><p className="text-xs text-muted-foreground">Focus hours</p></div>
                    <div><p className="text-lg font-bold text-red-500">-3%</p><p className="text-xs text-muted-foreground">Quiz accuracy</p></div>
                    <div><p className="text-lg font-bold">+120</p><p className="text-xs text-muted-foreground">Tokens earned</p></div>
                </div>
            </div>
            <div>
                 <h3 className="font-semibold mb-4">MENTOR NUDGES</h3>
                <Card className="bg-muted/20 border-border">
                    <CardContent className="pt-6 space-y-2">
                        <p className="text-sm">Join the Calculus sprint at 19:00 to push fragile topics.</p>
                        <p className="text-sm">Help two peers in the Ethics lounge to earn Mentor Ally tokens.</p>
                        <p className="text-sm">Claim the Prompt Lab tournament slot before it fills.</p>
                    </CardContent>
                </Card>
            </div>
            <div>
                <h3 className="font-semibold mb-4">PRIORITY ALERTS</h3>
                 <Card className="bg-muted/20 border-border">
                    <CardContent className="pt-6 space-y-4">
                        <div><Badge variant="destructive">Action</Badge><p className="font-semibold mt-1">Mentor review pending</p><p className="text-xs text-muted-foreground">AI Ethics essay needs revision before 18:00.</p></div>
                        <div><Badge>Embed</Badge><p className="font-semibold mt-1">Upload stalled</p><p className="text-xs text-muted-foreground">Robotics lab PDF has not been embedded yet.</p></div>
                        <div><Badge variant="secondary">Compete</Badge><p className="font-semibold mt-1">Tournament slot</p><p className="text-xs text-muted-foreground">City Olympiad qualifiers close in 2 hours.</p></div>
                    </CardContent>
                </Card>
            </div>
        </div>

        {/* Resource Studio */}
        <section className="mb-12">
            <h2 className="text-lg font-semibold text-muted-foreground mb-4">RESOURCE STUDIO</h2>
            <Card className="bg-muted/20 border-border">
                <CardHeader>
                    <div className="flex justify-between items-center">
                        <h3 className="font-bold">Uploads & notes</h3>
                        <div className="flex items-center gap-2">
                          <Input type="text" value={fileName} placeholder="Document name" readOnly className="bg-background w-48 mr-2" />
                          <Input type="file" onChange={handleFileChange} className="hidden" id="file-upload" />
                          <label htmlFor="file-upload" className="cursor-pointer">
                            <Button asChild>
                              <span><Plus className="w-4 h-4 mr-2"/> Add file</span>
                            </Button>
                          </label>
                          <Button onClick={handleFileUpload} disabled={!selectedFile}>Upload</Button>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="grid grid-cols-2 gap-8">
                    <div>
                        <p className="text-sm font-semibold mb-4">Recent uploads</p>
                         <div className="space-y-4">
                             <div className="flex items-center justify-between p-2 rounded-md bg-background/50">
                                 <div><p className="font-semibold">Calculus 101.pdf</p><p className="text-xs text-muted-foreground">Tags: calc, semester1 | Chunks: 18</p></div>
                                 <p className="text-sm">2.5 MB</p>
                             </div>
                              <div className="flex items-center justify-between p-2 rounded-md bg-background/50">
                                 <div><p className="font-semibold">AI Ethics Playbook.pdf</p><p className="text-xs text-muted-foreground">Tags: ethics, debate | Chunks: 22</p></div>
                                 <p className="text-sm">1.2 MB</p>
                             </div>
                             <p className="text-xs text-muted-foreground">Drop PDFs to see them embed.</p>
                         </div>
                    </div>
                    <div>
                         <div className="flex justify-between items-center mb-4">
                            <p className="text-sm font-semibold">Pinned notes</p>
                             <div>
                                <Input type="text" placeholder="Title" className="bg-background w-32 mr-2"/>
                                <Input type="text" placeholder="Summary" className="bg-background w-32 mr-2"/>
                                <Button>Save</Button>
                            </div>
                         </div>
                        <Textarea placeholder="Start typing your note..." className="bg-background" rows={5}/>
                    </div>
                </CardContent>
            </Card>
        </section>

         <div className="grid grid-cols-4 gap-8 mb-12">
            <div className="col-span-3 grid grid-cols-3 gap-8">
                <div>
                    <h3 className="font-semibold mb-4">COMMUNITY SIGNALS</h3>
                    <Card className="bg-muted/20 border-border p-4 space-y-4">
                        <div className="flex items-center justify-between"><p className="font-bold">Calculus sprint circle</p><Badge>18 learners</Badge></div>
                        <div className="flex items-center justify-between"><p className="font-bold">Ethics lounge</p><Badge>9 learners</Badge></div>
                        <div className="flex items-center justify-between"><p className="font-bold">Prompt lab</p><Badge>14 learners</Badge></div>
                    </Card>
                </div>
                <div>
                    <h3 className="font-semibold mb-4">STUDY TIMELINE</h3>
                     <Card className="bg-muted/20 border-border p-4 space-y-4">
                        <p className="text-sm font-semibold">17:00: Upload robotics lab</p>
                        <p className="text-sm font-semibold">18:15: Calculus sprint</p>
                        <p className="text-sm font-semibold">20:30: Quiz reflection</p>
                    </Card>
                </div>
                 <div>
                    <h3 className="font-semibold mb-4">FOCUS HABITS</h3>
                     <Card className="bg-muted/20 border-border p-4 space-y-2">
                        <p className="text-3xl font-bold">2h 40m</p>
                        <p className="text-sm text-muted-foreground">+0.8h vs last week</p>
                        <p className="text-2xl font-bold mt-2">34</p>
                        <p className="text-sm text-muted-foreground">+6 mentor assists</p>
                    </Card>
                </div>
            </div>
            <div className="text-center">
                 <h3 className="font-semibold mb-4">TOKENS</h3>
                 <p className="text-5xl font-bold">240</p>
                 <p className="text-sm text-muted-foreground">+40 streak bonus</p>
            </div>
        </div>

         <div className="grid grid-cols-2 gap-8 mb-12">
            <div>
                 <h3 className="font-semibold mb-4">MENTOR AI: Grounded chat</h3>
                 <Card className="bg-muted/20 border-border">
                     <CardContent className="pt-6">
                        <Button variant="secondary" className="w-full mb-4">Uploads ready. Ask grounded questions.</Button>
                        <div className="flex gap-2">
                         <Textarea placeholder="Ask the mentor..." className="bg-background"/>
                         <Button>Send</Button>
                        </div>
                     </CardContent>
                 </Card>
                 <div className="flex gap-2 mt-2">
                    <Button variant="outline" size="sm">Summarize robotics lab</Button>
                    <Button variant="outline" size="sm">Design integrals quiz</Button>
                    <Button variant="outline" size="sm">Prep ethics debate</Button>
                 </div>
            </div>
             <div>
                 <h3 className="font-semibold mb-4">LEADERBOARDS: Friendly competition</h3>
                 <Card className="bg-muted/20 border-border">
                    <CardHeader className="flex flex-row justify-between items-center">
                        <p className="font-bold"># Team</p>
                        <div className="flex gap-2">
                            <Button variant="secondary" size="sm">Global</Button>
                            <Button variant="ghost" size="sm">Seasonal</Button>
                        </div>
                    </CardHeader>
                     <CardContent>
                         <div className="space-y-2">
                            <div className="flex justify-between items-center"><p>1 Nova Squad</p><p>9950</p></div>
                            <div className="flex justify-between items-center"><p>2 Matrix Guild</p><p>9480</p></div>
                            <div className="flex justify-between items-center"><p>3 Prompthsmiths</p><p>9020</p></div>
                         </div>
                     </CardContent>
                 </Card>
                 <div className="grid grid-cols-2 gap-4 mt-4">
                     <div className="text-center"><p className="font-bold text-lg">240</p><p className="text-xs text-muted-foreground">Token Wallet</p></div>
                     <div className="text-center"><p className="font-bold text-lg">Global ladder</p><p className="text-xs text-muted-foreground">Top score: 9950 pts</p></div>
                 </div>
             </div>
         </div>

        <section>
            <h2 className="text-xl font-bold mb-4">Quest board: <span className="text-primary">Keep the streak alive</span></h2>
            <div className="grid grid-cols-3 gap-8">
                <Card className="bg-muted/20 border-border text-center">
                    <CardContent className="pt-6">
                        <Zap className="mx-auto w-10 h-10 text-yellow-400 mb-2"/>
                        <p className="font-bold">Focus Flame</p>
                        <p className="text-sm text-muted-foreground mb-4">Complete 5 sprints this week.</p>
                        <Button variant="secondary">Track</Button>
                    </CardContent>
                </Card>
                <Card className="bg-muted/20 border-border text-center">
                    <CardContent className="pt-6">
                        <Users className="mx-auto w-10 h-10 text-blue-400 mb-2"/>
                        <p className="font-bold">Mentor Ally</p>
                        <p className="text-sm text-muted-foreground mb-4">Answer 3 doubts in 24h.</p>
                        <Button variant="secondary">View</Button>
                    </CardContent>
                </Card>
                <Card className="bg-muted/20 border-border text-center">
                    <CardContent className="pt-6">
                        <UploadCloud className="mx-auto w-10 h-10 text-green-400 mb-2"/>
                        <p className="font-bold">Uploader Supreme</p>
                        <p className="text-sm text-muted-foreground mb-4">Embed 10 documents.</p>
                        <Button variant="secondary">Open</Button>
                    </CardContent>
                </Card>
            </div>
        </section>

        <section className="mt-8">
          <h2 className="text-lg font-semibold text-muted-foreground mb-4">Latest Quiz Result</h2>
          <Card className="bg-muted/20 border-border">
            <CardContent className="pt-6">
              {latestQuiz ? (
                <>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Score</p>
                    <p className="text-2xl font-bold">{latestQuiz.score} / {latestQuiz.total}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Avg time</p>
                    <p className="text-2xl font-bold">{Math.round(latestQuiz.avgTimeMs)} ms</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Focus</p>
                    {latestQuiz.improvements.length === 0 ? (
                      <p>None</p>
                    ) : (
                      latestQuiz.improvements.slice(0,3).map((imp, idx) => (
                        <p key={idx} className="text-sm">{imp.topic}: {imp.count}</p>
                      ))
                    )}
                  </div>
                </div>
                <div className="mt-4">
                  <Button variant="secondary" onClick={openReport}>View full quiz details</Button>
                </div>
                </>
              ) : (
                <p className="text-sm text-muted-foreground">No recent quiz</p>
              )}
            </CardContent>
          </Card>
        </section>

        {showReport && report && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
            <Card className="w-full max-w-4xl max-h-[80vh] overflow-y-auto">
              <CardHeader>
                <CardTitle>Quiz Details</CardTitle>
                <CardDescription>Topic: {report.topic} • Score: {report.score}/{report.total} • Avg time: {Math.round(report.avgTimeMs)} ms</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {report.items.map((it, idx) => (
                    <div key={it.id} className="border rounded-md p-4">
                      <p className="text-sm text-muted-foreground">Question {idx + 1} • {it.difficulty}</p>
                      <p className="font-semibold mt-1">{it.question}</p>
                      {it.options && it.options.length > 0 && (
                        <div className="mt-2 text-sm">
                          <p className="text-muted-foreground">Options: {it.options.join(', ')}</p>
                        </div>
                      )}
                      <div className="mt-2 text-sm">
                        <p>Your answer: <span className={it.correct ? 'text-green-500' : 'text-red-500'}>{it.userAnswer || '—'}</span></p>
                        <p>Correct answer: <span className="text-green-500">{it.correctAnswer}</span></p>
                        <p>Time: {it.timeMs} ms</p>
                      </div>
                      <p className="mt-2 text-sm">Explanation: {it.explanation}</p>
                    </div>
                  ))}
                  <div>
                    <p className="font-semibold mb-2">Advice</p>
                    {report.advice.length === 0 ? (
                      <p className="text-sm text-muted-foreground">No specific advice — great work.</p>
                    ) : (
                      <ul className="list-disc ml-6 text-sm">
                        {report.advice.map((a, i) => (
                          <li key={i}>{a}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
                <div className="mt-4 flex justify-end">
                  <Button onClick={closeReport}>Close</Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

      </main>
    </div>
  );
};

export default Dashboard;

