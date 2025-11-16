import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Bell, Bot, HelpCircle, LayoutDashboard, LogOut, Search, Settings, Trophy, Users, Users2 } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const leaderboardData = {
  global: [
    { rank: 1, team: 'Nova Squad', score: 9950 },
    { rank: 2, team: 'Matrix Guild', score: 9480 },
    { rank: 3, team: 'Prompthsmiths', score: 9020 },
  ],
  seasonal: [
    { rank: 1, team: 'Summer Sprinters', score: 4500 },
    { rank: 2, team: 'Winter Wizards', score: 4320 },
    { rank: 3, team: 'Autumn Architects', score: 4100 },
  ],
};

const Leaderboard = () => {
  const [activeTab, setActiveTab] = useState('global');
  const navigate = useNavigate();

  const data = leaderboardData[activeTab as keyof typeof leaderboardData];

  const handleSignOut = () => {
    navigate("/auth");
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex">
      {/* Sidebar */}
      <aside className="w-64 bg-muted/20 p-6 flex flex-col justify-between sticky top-0 h-screen">
        <div>
          <div className="mb-10">
            <p className="text-xs text-muted-foreground">NOW VIEWING</p>
            <h1 className="text-lg font-bold">LEADERBOARD</h1>
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
            <Link to="/community" className="flex items-center gap-3 p-2 rounded-md hover:bg-muted">
              <Users className="w-5 h-5" />
              <span>Community</span>
            </Link>
            <Link to="/leaderboard" className="flex items-center gap-3 p-2 rounded-md bg-muted text-foreground">
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
          <div className="relative w-full max-w-xs">
            <Input type="search" placeholder="Quick search..." className="bg-muted/50 border-border rounded-full pl-10" />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          </div>
          <div className="flex items-center gap-4">
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

        <h1 className="text-2xl font-bold mb-6">REWARD ENGINE</h1>

        <div className="grid grid-cols-3 gap-8">
            {/* Left Column */}
            <div className="col-span-2 space-y-8">
                <Card className="bg-muted/20 border-border">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle>Competition ladders</CardTitle>
                        <div>
                          <Button 
                            variant={activeTab === 'global' ? "secondary" : "ghost"} 
                            onClick={() => setActiveTab('global')}
                            className="rounded-r-none"
                          >
                            Global
                          </Button>
                          <Button 
                            variant={activeTab === 'seasonal' ? "secondary" : "ghost"} 
                            onClick={() => setActiveTab('seasonal')}
                            className="rounded-l-none"
                          >
                            Seasonal
                          </Button>
                        </div>
                    </CardHeader>
                    <CardContent>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="text-muted-foreground">#</TableHead>
                            <TableHead className="text-muted-foreground">Team</TableHead>
                            <TableHead className="text-muted-foreground text-right">Score</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {data.map((entry) => (
                            <TableRow key={entry.rank}>
                              <TableCell>{entry.rank}</TableCell>
                              <TableCell>{entry.team}</TableCell>
                              <TableCell className="text-right">{entry.score}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </CardContent>
                </Card>
            </div>

            {/* Right Column */}
            <div className="col-span-1 space-y-8">
                <Card className="bg-muted/20 border-border">
                    <CardHeader>
                        <CardTitle>Tournaments</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <p className="font-semibold">Autumn Sprint</p>
                            <p className="text-sm text-muted-foreground">Live</p>
                            <p className="text-sm text-primary">Reward: +150 tokens</p>
                        </div>
                        <div>
                            <p className="font-semibold">City Olympiad</p>
                            <p className="text-sm text-muted-foreground">Starts Monday</p>
                            <p className="text-sm text-primary">Reward: Scholarship slot</p>
                        </div>
                    </CardContent>
                </Card>
                <Card className="bg-muted/20 border-border">
                    <CardHeader>
                        <CardTitle>Token Wallet</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-3xl font-bold">240</p>
                        <p className="text-sm text-muted-foreground">Current tokens: 240</p>
                        <p className="text-sm text-muted-foreground">Pending streak bonus: +40</p>
                        <p className="text-xs mt-2">Redeem tokens for mentor sessions, merch, or tournament entries.</p>
                        <Button variant="secondary" className="w-full mt-4">View rewards</Button>
                    </CardContent>
                </Card>
            </div>
        </div>
      </main>
    </div>
  );
};

export default Leaderboard;
