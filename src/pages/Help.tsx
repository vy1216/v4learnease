import { supabase } from "@/lib/utils";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Bot, HelpCircle, LayoutDashboard, Search, Settings, Trophy, Users, Users2, CheckCircle, AlertTriangle, FileUp } from "lucide-react";

type Diagnostic = {
  name: string;
  status: "ok" | "error" | "pending";
  detail?: string;
};

const Help = () => {
  const [diagnostics, setDiagnostics] = useState<Diagnostic[]>([
    { name: "Frontend", status: "pending" },
    { name: "Backend", status: "pending" },
    { name: "AI Model", status: "pending" },
  ]);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadResult, setUploadResult] = useState<string>("");

  const runDiagnostics = async () => {
    const next: Diagnostic[] = [];
    next.push({ name: "Frontend", status: "ok", detail: "Running at http://localhost:8080" });
    try {
      const res = await fetch("http://localhost:3002/");
      if (res.ok) {
        const js = await res.json();
        next.push({ name: "Backend", status: "ok", detail: `Version ${js.version}` });
      } else {
        next.push({ name: "Backend", status: "error", detail: `HTTP ${res.status}` });
      }
    } catch (e: any) {
      next.push({ name: "Backend", status: "error", detail: String(e?.message || e) });
    }
    try {
      const res = await fetch("http://localhost:3002/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user: "ping" }),
      });
      if (res.ok) {
        const js = await res.json();
        next.push({ name: "AI Model", status: "ok", detail: js.text?.slice(0, 80) || "OK" });
      } else {
        next.push({ name: "AI Model", status: "error", detail: `HTTP ${res.status}` });
      }
    } catch (e: any) {
      next.push({ name: "AI Model", status: "error", detail: String(e?.message || e) });
    }
    setDiagnostics(next);
  };

  useEffect(() => {
    runDiagnostics();
  }, []);

  const submitSupport = async () => {
    if (!name.trim() || !email.trim() || !message.trim()) return;
    setSubmitting(true);
    try {
      const res = await fetch("http://localhost:3002/api/help", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, message }),
      });
      if (!res.ok) throw new Error("Failed to submit");
      const js = await res.json();
      setMessage("");
      setName("");
      setEmail("");
      alert(`Ticket submitted: ${js.id}`);
    } catch (e) {
      alert("Failed to submit ticket");
    } finally {
      setSubmitting(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) setSelectedFile(e.target.files[0]);
  };

      const handleTestUpload = async () => {
    if (!selectedFile) return;
    setUploading(true);
    if (!supabase) { setUploadResult("Supabase not configured"); setUploading(false); return; }
    try {
      const filePath = `help-uploads/${Date.now()}_${selectedFile.name}`;
      const { error } = await supabase.storage.from('uploads').upload(filePath, selectedFile, { upsert: true });
      if (error) throw error;
      const { data } = supabase.storage.from('uploads').getPublicUrl(filePath);
      setUploadResult(`Uploaded: ${selectedFile.name}  url ${data.publicUrl}`);
    } catch (e) {
      setUploadResult("Upload failed");
    } finally {
      setUploading(false);
      setSelectedFile(null);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex">
      <aside className="w-64 bg-muted/20 p-6 flex flex-col justify-between">
        <div>
          <div className="mb-10">
            <p className="text-xs text-muted-foreground">NOW VIEWING</p>
            <h1 className="text-lg font-bold">HELP</h1>
          </div>
          <nav className="flex flex-col space-y-4">
            <Link to="/chat" className="flex items-center gap-3 p-2 rounded-md hover:bg-muted"><Bot className="w-5 h-5" /><span>Chat</span></Link>
            <Link to="/dashboard" className="flex items-center gap-3 p-2 rounded-md hover:bg-muted"><LayoutDashboard className="w-5 h-5" /><span>Dashboard</span></Link>
            <Link to="/mentor" className="flex items-center gap-3 p-2 rounded-md hover:bg-muted"><Bot className="w-5 h-5" /><span>AI Tutor</span></Link>
            <Link to="/community" className="flex items-center gap-3 p-2 rounded-md hover:bg-muted"><Users className="w-5 h-5" /><span>Community</span></Link>
            <Link to="/leaderboard" className="flex items-center gap-3 p-2 rounded-md hover:bg-muted"><Trophy className="w-5 h-5" /><span>Leaderboard</span></Link>
          </nav>
        </div>
        <div>
          <nav className="flex flex-col space-y-4">
            <Link to="/profile" className="flex items-center gap-3 p-2 rounded-md hover:bg-muted"><Users2 className="w-5 h-5" /><span>Profile</span></Link>
            <Link to="/settings" className="flex items-center gap-3 p-2 rounded-md hover:bg-muted"><Settings className="w-5 h-5" /><span>Settings</span></Link>
            <Link to="/help" className="flex items-center gap-3 p-2 rounded-md bg-muted text-foreground"><HelpCircle className="w-5 h-5" /><span>Help</span></Link>
          </nav>
        </div>
      </aside>

      <main className="flex-1 p-8 overflow-y-auto space-y-8">
        <section>
          <h2 className="font-semibold mb-4">Diagnostics</h2>
          <div className="grid md:grid-cols-3 gap-4">
            {diagnostics.map((d, i) => (
              <Card key={i} className="bg-muted/20 border-border">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    {d.status === "ok" && <CheckCircle className="w-4 h-4 text-green-500" />}
                    {d.status === "error" && <AlertTriangle className="w-4 h-4 text-red-500" />}
                    {d.status === "pending" && <Search className="w-4 h-4" />}
                    <span>{d.name}</span>
                  </CardTitle>
                  <CardDescription>{d.detail || ""}</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button variant="outline" onClick={runDiagnostics}>Re-run</Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <section>
          <h2 className="font-semibold mb-4">Test Upload</h2>
          <Card className="bg-muted/20 border-border">
            <CardContent className="pt-6 space-y-3">
              <div className="flex items-center gap-3">
                <Input type="file" onChange={handleFileChange} />
                <Button onClick={handleTestUpload} disabled={uploading} className="flex items-center gap-2"><FileUp className="w-4 h-4" />Upload</Button>
              </div>
              {uploadResult && <p className="text-sm text-muted-foreground">{uploadResult}</p>}
            </CardContent>
          </Card>
        </section>

        <section>
          <h2 className="font-semibold mb-4">Contact Support</h2>
          <Card className="bg-muted/20 border-border">
            <CardContent className="pt-6 space-y-3">
              <div className="grid md:grid-cols-2 gap-4">
                <Input placeholder="Your name" value={name} onChange={(e) => setName(e.target.value)} />
                <Input placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>
              <Textarea placeholder="Describe your issue" value={message} onChange={(e) => setMessage(e.target.value)} />
              <Button onClick={submitSupport} disabled={submitting}>Submit Ticket</Button>
            </CardContent>
          </Card>
        </section>

        <section>
          <h2 className="font-semibold mb-4">FAQ</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <Card className="bg-muted/20 border-border"><CardHeader><CardTitle>How do I upload materials?</CardTitle><CardDescription>Use the sidebar in Chat or AI Tutor to upload files. They are indexed for context.</CardDescription></CardHeader></Card>
            <Card className="bg-muted/20 border-border"><CardHeader><CardTitle>Why does AI say it cannot read my PDFs?</CardTitle><CardDescription>Ensure you re-upload after updates and the backend is running. The AI uses parsed text from your materials.</CardDescription></CardHeader></Card>
            <Card className="bg-muted/20 border-border"><CardHeader><CardTitle>How do I fix connection issues?</CardTitle><CardDescription>Check the Diagnostics above. Restart backend on port 3002 if needed.</CardDescription></CardHeader></Card>
            <Card className="bg-muted/20 border-border"><CardHeader><CardTitle>Is my API key required?</CardTitle><CardDescription>With a valid Groq key, AI returns full responses; otherwise, you still get helpful offline replies.</CardDescription></CardHeader></Card>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Help;


