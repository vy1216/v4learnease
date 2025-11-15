
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Bell, Bot, LayoutDashboard, LogOut, Search, Settings, Trophy, Users, ArrowRight, HelpCircle, Users2, Plus, Send } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ChangeEvent, useState, FormEvent } from "react";

// Define the shape of a message for the chat
interface Message {
  text: string;
  sender: 'user' | 'ai';
}

const Mentor = () => {
  const navigate = useNavigate();

  // State for uploaded materials
  const [materials, setMaterials] = useState([
    { name: "Data Structures.pdf", pages: 80 },
    { name: "Algorithm Notes", pages: 45 },
    { name: "Python Basics", pages: 32 },
  ]);

  // State for chat
  const [messages, setMessages] = useState<Message[]>([
      { sender: 'ai', text: "Hello! I'm your AI Mentor. I am now connected to a real backend. Let's get started!" }
  ]);
  const [userInput, setUserInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSignOut = () => {
    localStorage.removeItem('authToken');
    navigate("/auth");
  };

  // --- FILE UPLOAD HANDLER ---
  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      alert(`Uploading ${file.name}...`);
      const formData = new FormData();
      formData.append('file', file);

      try {
        const response = await fetch('http://localhost:3002/api/upload', {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) throw new Error('Upload failed');

        setMaterials(prevMaterials => [...prevMaterials, { name: file.name, pages: 0 }]); // Note: page count is a mock value
        alert("File uploaded successfully!");
      } catch (error) {
        console.error("Error uploading file:", error);
        alert("Failed to upload file.");
      }
    }
  };

  // --- CHAT SUBMISSION HANDLER ---
  const handleSendMessage = async (e: FormEvent) => {
    e.preventDefault();
    if (!userInput.trim() || isLoading) return;

    const userMessage: Message = { text: userInput, sender: 'user' };
    setMessages(prevMessages => [...prevMessages, userMessage]);
    const currentInput = userInput;
    setUserInput("");
    setIsLoading(true);

    try {
      const response = await fetch('http://localhost:3002/api/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ user: currentInput }),
      });

      if (!response.ok) {
        throw new Error('Failed to get response from AI');
      }

      const aiMessage: Message = await response.json();
      aiMessage.sender = 'ai'; // Ensure sender is 'ai'
      setMessages(prevMessages => [...prevMessages, aiMessage]);

    } catch (error) {
      console.error("Error calling AI function:", error);
      const errorMessage: Message = { text: "Sorry, I couldn't get a response from the backend.", sender: 'ai' };
      setMessages(prevMessages => [...prevMessages, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleSuggestedQuestion = (question: string) => {
      setUserInput(question);
  }

  return (
    <div className="min-h-screen bg-[#0b0b0f] text-gray-200 flex">
      {/* Sidebar */}
      <aside className="w-80 bg-[#121216] p-6 flex flex-col gap-8 sticky top-0 h-screen overflow-y-auto no-scrollbar">
        <div>
          <nav className="flex flex-col space-y-4 mb-8">
            <Link to="/chat" className="flex items-center gap-3 p-2 rounded-md hover:bg-gray-700/50"><Bot className="w-5 h-5" /><span>Chat</span></Link>
            <Link to="/dashboard" className="flex items-center gap-3 p-2 rounded-md hover:bg-gray-700/50"><LayoutDashboard className="w-5 h-5" /><span>Dashboard</span></Link>
            <Link to="/mentor" className="flex items-center gap-3 p-2 rounded-md bg-gray-700/50 text-white"><Bot className="w-5 h-5" /><span>AI Tutor</span></Link>
            <Link to="/community" className="flex items-center gap-3 p-2 rounded-md hover:bg-gray-700/50"><Users className="w-5 h-5" /><span>Community</span></Link>
            <Link to="/leaderboard" className="flex items-center gap-3 p-2 rounded-md hover:bg-gray-700/50"><Trophy className="w-5 h-5" /><span>Leaderboard</span></Link>
          </nav>
        </div>

        <div>
          <h2 className="text-lg font-semibold mb-4">Your Materials</h2>
          <div className="space-y-4">
              <label htmlFor="file-upload" className="w-full cursor-pointer">
                <div className="w-full flex justify-center items-center gap-2 p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md"><Plus className="w-4 h-4"/> Add New</div>
              </label>
              <input type="file" onChange={handleFileChange} className="hidden" id="file-upload" />
              {materials.map((material, index) => (
                <div key={index} className="p-3 rounded-md bg-gray-700/50 flex items-start gap-3">
                    <svg className="w-6 h-6 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                    <div><p className="font-semibold text-sm">{material.name}</p><p className="text-xs text-gray-400">{material.pages || '...'} pages</p></div>
                </div>
              ))}
          </div>
        </div>

        <div>
             <h2 className="text-lg font-semibold mb-4">Suggested Questions</h2>
             <div className="space-y-3">
                 <div onClick={() => handleSuggestedQuestion('Explain recursion')} className="text-sm p-3 rounded-md bg-gray-700/50 cursor-pointer hover:bg-gray-700">Explain recursion</div>
                 <div onClick={() => handleSuggestedQuestion('What is Big O notation?')} className="text-sm p-3 rounded-md bg-gray-700/50 cursor-pointer hover:bg-gray-700">What is Big O notation?</div>
                 <div onClick={() => handleSuggestedQuestion('Compare BFS vs DFS')} className="text-sm p-3 rounded-md bg-gray-700/50 cursor-pointer hover:bg-gray-700">Compare BFS vs DFS</div>
             </div>
        </div>

        <div className="mt-auto">
            <nav className="flex flex-col space-y-4">
                <Link to="/profile" className="flex items-center gap-3 p-2 rounded-md hover:bg-gray-700/50"><Users2 className="w-5 h-5" /><span>Profile</span></Link>
                <Link to="/settings" className="flex items-center gap-3 p-2 rounded-md hover:bg-gray-700/50"><Settings className="w-5 h-5" /><span>Settings</span></Link>
                <Link to="#" className="flex items-center gap-3 p-2 rounded-md hover:bg-gray-700/50"><HelpCircle className="w-5 h-5" /><span>Help</span></Link>
            </nav>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 flex flex-col h-screen overflow-hidden">
        <header className="flex items-center justify-between mb-4 flex-shrink-0">
          <div className="relative w-full max-w-xs"><Input type="search" placeholder="Quick search..." className="bg-[#121216] border-gray-700 rounded-full pl-10" /><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" /></div>
          <div className="flex items-center gap-4"><Button variant="outline" className="rounded-full border-gray-700 bg-[#121216] hover:bg-gray-800"><Bell className="w-5 h-5" /></Button><Button onClick={handleSignOut} className="bg-blue-600 hover:bg-blue-700 rounded-full flex items-center gap-2"><span>Logout</span><LogOut className="w-4 h-4" /></Button><Link to="/profile"><div className="p-0.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-full"><Avatar><AvatarImage src="/avatars/user.png" alt="User" /><AvatarFallback>U</AvatarFallback></Avatar></div></Link></div>
        </header>

        {/* Chat Area */}
        <div className="flex-1 overflow-y-auto pr-4 space-y-6">
            {messages.map((message, index) => (
                <div key={index} className={`flex items-start gap-4 ${message.sender === 'user' ? 'justify-end' : ''}`}>
                    {message.sender === 'ai' && <div className="p-2 bg-blue-600 rounded-full text-white flex-shrink-0"><Bot className="w-6 h-6"/></div>}
                    <div className={`p-4 rounded-lg max-w-lg ${message.sender === 'user' ? 'bg-blue-600 text-white' : 'bg-[#121216]'}`}>
                        <p>{message.text}</p>
                    </div>
                </div>
            ))}
            {isLoading && (
                <div className="flex items-start gap-4">
                    <div className="p-2 bg-blue-600 rounded-full text-white flex-shrink-0"><Bot className="w-6 h-6"/></div>
                    <div className="p-4 rounded-lg bg-[#121216] max-w-lg">
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse"></div>
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse delay-75"></div>
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse delay-150"></div>
                        </div>
                    </div>
                </div>
            )}
        </div>

        {/* Chat Input */}
        <div className="mt-auto pt-6 flex-shrink-0">
            <form onSubmit={handleSendMessage}>
                <div className="relative">
                  <Input placeholder="Ask anything about your materials..." value={userInput} onChange={e => setUserInput(e.target.value)} className="pr-16 h-12 bg-[#121216] border-gray-700 text-white rounded-full"/>
                  <Button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 bg-blue-600 hover:bg-blue-700 rounded-full" size="icon" disabled={isLoading}><Send className="w-4 h-4"/></Button>
                </div>
                <p className="text-xs text-center text-gray-500 mt-2">AI trained on your uploaded materials • Context-aware responses</p>
            </form>
        </div>
      </main>
    </div>
  );
};

export default Mentor; 
