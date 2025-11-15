import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Bell, Bot, HelpCircle, LayoutDashboard, LogOut, Search, Settings, Trophy, Users, Moon, Sun, Users2 } from "lucide-react";
import { useTheme } from "@/components/theme-provider";

const SettingsPage = () => {
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();

  const handleSignOut = () => {
    navigate("/auth");
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex">
      {/* Sidebar */}
      <aside className="w-64 bg-muted/20 p-6 flex flex-col justify-between">
        <div>
          <div className="mb-10">
            <p className="text-xs text-muted-foreground">NOW VIEWING</p>
            <h1 className="text-lg font-bold">SETTINGS</h1>
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
            <Link to="/settings" className="flex items-center gap-3 p-2 rounded-md bg-muted text-foreground">
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
            <h1 className="text-2xl font-bold">Settings</h1>
            <Button onClick={handleSignOut} className="bg-primary hover:bg-primary/90 rounded-full flex items-center gap-2">
                <span>Logout</span>
                <LogOut className="w-4 h-4" />
            </Button>
        </header>

        <div className="space-y-8 max-w-2xl">
            <Card className="bg-muted/20 border-border">
                <CardHeader>
                    <CardTitle>Appearance</CardTitle>
                    <CardDescription>Customize the look and feel of your workspace.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center justify-between">
                        <Label htmlFor="theme-switcher" className="flex items-center gap-2">
                            <Sun className="w-5 h-5" />
                            <span>Light / Dark Mode</span>
                            <Moon className="w-5 h-5" />
                        </Label>
                        <Switch 
                            id="theme-switcher"
                            checked={theme === 'dark'}
                            onCheckedChange={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                        />
                    </div>
                </CardContent>
            </Card>

            <Card className="bg-muted/20 border-border">
                <CardHeader>
                    <CardTitle>Account</CardTitle>
                    <CardDescription>Manage your account settings.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input id="email" type="email" defaultValue="user@example.com" disabled className="bg-background/50" />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="password">Password</Label>
                        <Button variant="outline">Change Password</Button>
                    </div>
                </CardContent>
            </Card>

             <Card className="bg-muted/20 border-border">
                <CardHeader>
                    <CardTitle>Notifications</CardTitle>
                    <CardDescription>Manage how you receive notifications.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                        <Label htmlFor="email-notifications">Email Notifications</Label>
                        <Switch id="email-notifications" defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                        <Label htmlFor="push-notifications">Push Notifications</Label>
                        <Switch id="push-notifications" />
                    </div>
                </CardContent>
            </Card>
        </div>
      </main>
    </div>
  );
};

export default SettingsPage;
