
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Send, FileUp, Mic, Paperclip, Bot, LayoutDashboard, Users, Trophy, Users2, Settings, HelpCircle, Plus } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ChangeEvent, useState, useEffect, useRef } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

const Chat = () => {
  const navigate = useNavigate();
  const [message, setMessage] = useState("");
  const [chatHistory, setChatHistory] = useState<{ user: string; text: string }[]>([]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState("");
  const [uploadedFiles, setUploadedFiles] = useState<{id: string, name: string, url: string}[]>([]);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const response = await fetch("http://localhost:3002/api/messages");
        const data = await response.json();
        setChatHistory(data);
      } catch (error) {
        console.error("Error fetching messages:", error);
      }
    };

    fetchMessages();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory]);

  const handleSendMessage = async () => {
    if (message.trim() !== "") {
      try {
        const response = await fetch("http://localhost:3002/api/messages", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ user: message, fileIds: uploadedFiles.map(f => f.id) }),
        });
        if (!response.ok) throw new Error('Failed to send message');
        const newMessage = await response.json();
        setChatHistory([...chatHistory, newMessage]);
        setMessage("");
      } catch (error) {
        console.error("Error sending message:", error);
      }
    }
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
      setFileName(e.target.files[0].name);
    }
  };

  const handleFileUpload = async () => {
    if (!selectedFile) {
      alert("Please select a file first");
      return;
    }
    
    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      
      const response = await fetch("http://localhost:3002/api/upload", {
        method: "POST",
        body: formData,
      });
      
      if (!response.ok) throw new Error('Upload failed');
      const data = await response.json();
      
      setUploadedFiles([...uploadedFiles, { id: data.id, name: data.name || selectedFile.name, url: data.url }]);
      setSelectedFile(null);
      setFileName("");
      alert("File uploaded successfully!");
    } catch (error) {
      console.error("Error uploading file:", error);
      alert("Failed to upload file");
    }
  };

  const handleAttachClick = () => {
    const fileInput = document.getElementById('chat-file-upload') as HTMLInputElement;
    if (fileInput) fileInput.click();
  };

  const handleGenerateQuiz = async () => {
    const topic = (message || '').trim() || (chatHistory[chatHistory.length - 1]?.user || '').trim();
    try {
      const response = await fetch('http://localhost:3002/api/quiz/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic, history: chatHistory }),
      });
      if (!response.ok) throw new Error('Failed to generate quiz');
      const data = await response.json();
      navigate(`/quiz?quizId=${data.id}`);
    } catch (e) {
      alert('Could not generate quiz');
    }
  };

  return (
    <div className="min-h-screen bg-[#0b0b0f] text-gray-200 flex">
      <aside className="w-80 bg-[#121216] p-6 flex flex-col gap-8 sticky top-0 h-screen overflow-y-auto no-scrollbar">
        <div>
          <nav className="flex flex-col space-y-4 mb-8">
            <Link to="/chat" className="flex items-center gap-3 p-2 rounded-md bg-gray-700/50 text-white"><Bot className="w-5 h-5" /><span>Chat</span></Link>
            <Link to="/dashboard" className="flex items-center gap-3 p-2 rounded-md hover:bg-gray-700/50"><LayoutDashboard className="w-5 h-5" /><span>Dashboard</span></Link>
            <Link to="/mentor" className="flex items-center gap-3 p-2 rounded-md hover:bg-gray-700/50"><Bot className="w-5 h-5" /><span>AI Tutor</span></Link>
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
              <input type="file" className="hidden" id="file-upload" onChange={handleFileChange} />
              {fileName && <p className="text-sm text-gray-400">Selected file: {fileName}</p>}
              {selectedFile && <Button onClick={handleFileUpload} className="w-full bg-purple-600 hover:bg-purple-700">Upload</Button>}
          </div>
          <div className="mt-4">
            {uploadedFiles.map((file, index) => (
              <div key={index} className="flex items-center justify-between p-2 rounded-md bg-gray-700/50">
                <p className="text-sm">{file.name}</p>
                <a href={file.url} target="_blank" rel="noopener noreferrer">
                  <Button variant="ghost" size="sm">Open</Button>
                </a>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-auto">
            <nav className="flex flex-col space-y-4">
                <Link to="/profile" className="flex items-center gap-3 p-2 rounded-md hover:bg-gray-700/50"><Users2 className="w-5 h-5" /><span>Profile</span></Link>
                <Link to="/settings" className="flex items-center gap-3 p-2 rounded-md hover:bg-gray-700/50"><Settings className="w-5 h-5" /><span>Settings</span></Link>
                <Link to="/help" className="flex items-center gap-3 p-2 rounded-md hover:bg-gray-700/50"><HelpCircle className="w-5 h-5" /><span>Help</span></Link>
            </nav>
        </div>
      </aside>
      <main className="flex-1 p-8 flex flex-col h-screen overflow-hidden">
        <div className="flex-1 overflow-y-auto mb-8">
          <div className="max-w-3xl mx-auto px-2 space-y-6">
          {chatHistory.length === 0 ? (
            <div className="flex flex-col items-center justify-center text-center h-full">
              <div className="mb-8">
                <Avatar className="w-24 h-24 mx-auto mb-4">
                  <AvatarImage src="/avatars/spark-e.png" alt="Spark.E" />
                  <AvatarFallback>SE</AvatarFallback>
                </Avatar>
                <h1 className="text-3xl font-bold">Hello, I'm Spark.E</h1>
              </div>

              <div className="grid grid-cols-2 gap-4 max-w-2xl mx-auto w-full mb-8">
                <div className="bg-[#121216] p-4 rounded-lg text-left cursor-pointer hover:bg-gray-800/50">
                  <p className="font-semibold">Difference between acids and bases</p>
                </div>
                <div className="bg-[#121216] p-4 rounded-lg text-left cursor-pointer hover:bg-gray-800/50">
                  <p className="font-semibold">Generate a test about DNA</p>
                </div>
                <div className="bg-[#121216] p-4 rounded-lg text-left cursor-pointer hover:bg-gray-800/50">
                  <p className="font-semibold">Make a rap about the periodic table</p>
                </div>
                <div className="bg-[#121216] p-4 rounded-lg text-left cursor-pointer hover:bg-gray-800/50">
                  <p className="font-semibold">Walk through calculus problem</p>
                </div>
              </div>
            </div>
          ) : (
            chatHistory.map((chat, index) => (
              <div key={index} className="space-y-2">
                <div className="flex justify-end">
                  <div className="inline-block rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-3 shadow-lg max-w-[80%]">
                    {chat.user}
                  </div>
                </div>
                <div className="flex justify-start">
                  <div className="inline-block rounded-2xl bg-[#1c1d22] border border-gray-700 text-white px-4 py-4 shadow-lg max-w-[80%] prose prose-invert prose-sm">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>{chat.text}</ReactMarkdown>
                  </div>
                </div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
          </div>
        </div>

        <div className="w-full max-w-3xl mx-auto">
            <div className="relative max-w-3xl mx-auto w-full">
              <Input
                placeholder="Ask your AI tutor anything..."
                className="h-14 bg-[#121216] border-0 ring-1 ring-gray-700 focus-visible:ring-2 focus-visible:ring-indigo-500 text-white rounded-full pl-14 pr-24 shadow-lg"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              />
              <button type="button" onClick={handleAttachClick} className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white cursor-pointer">
                <Paperclip className="w-6 h-6" />
              </button>
              <input type="file" className="hidden" id="chat-file-upload" onChange={handleFileChange} />
              <Button type="submit" className="absolute right-4 top-1/2 -translate-y-1/2 h-10 w-10 bg-indigo-600 hover:bg-indigo-700 rounded-full shadow" size="icon" onClick={handleSendMessage}>
                <Send className="w-5 h-5" />
              </Button>
            </div>
            <div className="flex justify-center items-center gap-6 mt-4 text-sm text-gray-400">
              <button className="flex items-center gap-2 hover:text-white"><FileUp className="w-4 h-4" />Web Browsing</button>
              <button className="flex items-center gap-2 hover:text-white"><Search className="w-4 h-4" />Search Academic Papers</button>
              <button className="flex items-center gap-2 hover:text-white"><Mic className="w-4 h-4" />Using {uploadedFiles.length} material(s)</button>
            </div>
            <div className="flex justify-center mt-6">
              <Button onClick={handleGenerateQuiz} className="px-8 py-6 rounded-full bg-gradient-to-r from-fuchsia-600 via-purple-600 to-blue-600 hover:from-fuchsia-500 hover:via-purple-500 hover:to-blue-500 text-white font-semibold shadow-lg">
                Generate 10-Question Quiz
              </Button>
            </div>
          </div>
      </main>
    </div>
  );
};

export default Chat;
