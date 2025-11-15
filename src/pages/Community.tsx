import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Bot, HelpCircle, LayoutDashboard, LogOut, Search, Settings, Trophy, Users, Users2 } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const Community = () => {
  const navigate = useNavigate();

  const handleSignOut = () => {
    navigate("/auth");
  };

  const studyCircles = [
    {
      name: "Python Beginners",
      description: "Learn Python from scratch with fellow beginners",
      members: 142,
      category: "Beginner",
      tags: ["Programming"],
      live: true,
      joined: true,
    },
    {
      name: "Data Structures & Algorithms",
      description: "Master DSA for technical interviews",
      members: 89,
      category: "Intermediate",
      tags: ["Computer Science"],
      live: true,
      joined: true,
    },
    {
      name: "Machine Learning Study Group",
      description: "Dive deep into ML concepts and implementations",
      members: 67,
      category: "Advanced",
      tags: ["AI/ML"],
      live: false,
      joined: false,
    },
    {
      name: "Web Development Bootcamp",
      description: "Full-stack web development with React and Node",
      members: 124,
      category: "Intermediate",
      tags: ["Web Dev"],
      live: true,
      joined: false,
    },
    {
      name: "DBMS Fundamentals",
      description: "Database management systems and SQL",
      members: 56,
      category: "Beginner",
      tags: ["Database"],
      live: false,
      joined: false,
    },
    {
      name: "Competitive Programming",
      description: "Prepare for coding competitions",
      members: 93,
      category: "Advanced",
      tags: ["Programming"],
      live: true,
      joined: false,
    },
  ];

  const myStudyCircles = studyCircles.filter((circle) => circle.joined);
  const discoverStudyCircles = studyCircles.filter((circle) => !circle.joined);

  return (
    <div className="min-h-screen bg-background text-foreground flex">
      {/* Sidebar */}
      <aside className="w-64 bg-muted/20 p-6 flex flex-col justify-between sticky top-0 h-screen">
        <div>
          <div className="mb-10">
            <p className="text-xs text-muted-foreground">NOW VIEWING</p>
            <h1 className="text-lg font-bold">COMMUNITY</h1>
          </div>
          <nav className="flex flex-col space-y-4">
            <Link to="/chat" className="flex items-center gap-3 p-2 rounded-md hover:bg-muted">
              <Bot className="w-5 h-5" />
              <span>Chat</span>
            </Link>
            <Link to="/dashboard" className="flex items-center gap-3 p-2 rounded-md hover:bg-muted">
              <LayoutDashboard className="w-5 h-5" />
              <span>Dashboard</span>
            </Link>
            <Link to="/mentor" className="flex items-center gap-3 p-2 rounded-md hover:bg-muted">
              <Bot className="w-5 h-5" />
              <span>AI Tutor</span>
            </Link>
            <Link to="/community" className="flex items-center gap-3 p-2 rounded-md bg-muted text-foreground">
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
                <Link to="#" className="flex items-center gap-3 p-2 rounded-md hover:bg-muted">
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
            <div className="relative w-full max-w-md">
                <Input type="search" placeholder="Search study circles..." className="bg-muted/50 border-border rounded-full pl-10" />
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            </div>
             <div className="flex items-center gap-4">
                <Button variant="outline" className="rounded-full">All</Button>
                <Button variant="ghost" className="rounded-full">Programming</Button>
                <Button variant="ghost" className="rounded-full">Computer Science</Button>
                <Button variant="ghost" className="rounded-full">AI/ML</Button>
                <Button variant="ghost" className="rounded-full">Web Dev</Button>
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

        <div className="grid grid-cols-3 gap-8 mb-12">
            {/* Left & Middle Column */}
            <div className="col-span-2 space-y-8">
                <div className="grid grid-cols-2 gap-8">
                    {/* Study Rooms */}
                    <section>
                        <h2 className="text-xl font-semibold mb-4">STUDY ROOMS: Live + scheduled</h2>
                        <Card className="bg-muted/20 border-border">
                            <CardContent className="pt-6 space-y-4">
                                <div className="flex justify-between items-center">
                                    <div>
                                        <p>AI Ethics Lounge</p>
                                        <p className="text-sm text-muted-foreground">Live</p>
                                    </div>
                                    <Button variant="outline" size="sm">Join | 12</Button>
                                </div>
                                <div className="flex justify-between items-center">
                                    <div>
                                        <p>Calculus Sprint</p>
                                        <p className="text-sm text-muted-foreground">Starts 19:00</p>
                                    </div>
                                    <Button variant="outline" size="sm">Join | 8</Button>
                                </div>
                                <div className="flex justify-between items-center">
                                    <div>
                                        <p>Prompt Engineering Lab</p>
                                        <p className="text-sm text-muted-foreground">Live</p>
                                    </div>
                                    <Button variant="outline" size="sm">Join | 5</Button>
                                </div>
                            </CardContent>
                        </Card>
                    </section>

                    {/* Community Feed */}
                    <section>
                        <h2 className="text-xl font-semibold mb-4">COMMUNITY FEED</h2>
                         <Card className="bg-muted/20 border-border">
                            <CardContent className="pt-6">
                                <p className="text-sm text-muted-foreground mb-4">Say hi to your cohort or drop a blocker.</p>
                                <Input placeholder="Share an update" className="bg-background mb-2" />
                                <Button className="w-full">Send</Button>
                            </CardContent>
                        </Card>
                    </section>
                </div>

                <div className="grid grid-cols-2 gap-8">
                     {/* Doubt Desk */}
                    <section>
                        <h2 className="text-xl font-semibold mb-4">DOUBT DESK: Mentor queue</h2>
                        <Card className="bg-muted/20 border-border">
                            <CardContent className="pt-6 space-y-4">
                                <div className="flex justify-between items-center">
                                    <p>Gradient clipping</p>
                                    <p className="text-sm text-muted-foreground">Needs mentor</p>
                                </div>
                                <div className="flex justify-between items-center">
                                    <p>Bias mitigation</p>
                                    <p className="text-sm text-muted-foreground">Peer answering</p>
                                </div>
                            </CardContent>
                        </Card>
                    </section>

                    {/* Help Center */}
                    <section>
                        <h2 className="text-xl font-semibold mb-4">HELP CENTER</h2>
                         <Card className="bg-muted/20 border-border">
                            <CardContent className="pt-6">
                                <p className="text-sm text-muted-foreground mb-4">Ping mentors, review FAQs, or escalate blockers. Need white-glove onboarding? Email support@learnease.dev.</p>
                                <Button variant="secondary" className="w-full">Open help docs</Button>
                            </CardContent>
                        </Card>
                    </section>
                </div>
            </div>

             {/* Right Column - Empty for now */}
            <div className="col-span-1"></div>
        </div>

        {/* My Study Circles */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-6">My Study Circles</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {myStudyCircles.map((circle, index) => (
              <Card key={index} className="bg-muted/20 border-border">
                <CardContent className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-xl font-semibold">{circle.name}</h3>
                    {circle.live && <Badge className="bg-green-500 text-white">Live</Badge>}
                  </div>
                  <p className="text-muted-foreground mb-4">{circle.description}</p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                            <Users2 className="w-4 h-4" />
                            <span>{circle.members}</span>
                        </div>
                        <Badge variant="secondary">{circle.category}</Badge>
                        {circle.tags.map(tag => <Badge key={tag} variant="secondary">{tag}</Badge>)}
                    </div>
                    <Button>Enter Room</Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Discover Study Circles */}
        <section>
          <h2 className="text-2xl font-bold mb-6">Discover Study Circles</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {discoverStudyCircles.map((circle, index) => (
              <Card key={index} className="bg-muted/20 border-border">
                <CardContent className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-xl font-semibold">{circle.name}</h3>
                    {circle.live && <Badge className="bg-green-500 text-white">Live</Badge>}
                  </div>
                  <p className="text-muted-foreground mb-4">{circle.description}</p>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                    <Users2 className="w-4 h-4" />
                    <span>{circle.members} members</span>
                  </div>
                  <div className="flex items-center gap-2 mb-6">
                    <Badge variant="secondary">{circle.category}</Badge>
                    {circle.tags.map(tag => <Badge key={tag} variant="secondary">{tag}</Badge>)}
                  </div>
                  <Button variant="outline" className="w-full">Join Circle</Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
};

export default Community;
