import { supabase } from "@/lib/utils";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Bot, HelpCircle, LayoutDashboard, LogOut, Settings, Trophy, Users, Users2 } from "lucide-react";
import { ChangeEvent, useState } from "react";

const Profile = () => {
  const navigate = useNavigate();
  const [userImage, setUserImage] = useState("/avatars/user.png");

  const handleSignOut = () => {
    navigate("/auth");
  };

    const handleImageUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (!supabase) {
        alert("Supabase is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.");
        return;
      }
      try {
        const filePath = `profile-images/${Date.now()}_${file.name}`;
        const { error } = await supabase.storage.from('uploads').upload(filePath, file, { upsert: true });
        if (error) throw error;
        const { data } = supabase.storage.from('uploads').getPublicUrl(filePath);
        setUserImage(data.publicUrl);
        alert("Profile picture updated successfully!");
      } catch (error) {
        alert("Failed to upload image.");
      }
    }
  };

  const mentors = [
    { name: "Mentor 1", avatar: "/avatars/mentor1.png" },
    { name: "Mentor 2", avatar: "/avatars/mentor2.png" },
  ];

  const friends = [
    { name: "Friend 1", avatar: "/avatars/friend1.png" },
    { name: "Friend 2", avatar: "/avatars/friend2.png" },
    { name: "Friend 3", avatar: "/avatars/friend3.png" },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground flex">
      <aside className="w-64 bg-muted/20 p-6 flex flex-col justify-between sticky top-0 h-screen">
        <div>
          <div className="mb-10">
            <p className="text-xs text-muted-foreground">NOW VIEWING</p>
            <h1 className="text-lg font-bold">PROFILE</h1>
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
                <Link to="/profile" className="flex items-center gap-3 p-2 rounded-md bg-muted text-foreground">
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
      <main className="flex-1 p-8 overflow-y-auto">
        <header className="flex items-center justify-end mb-8">
          <div className="flex items-center gap-4">
            <Button onClick={handleSignOut} className="bg-primary hover:bg-primary/90 rounded-full flex items-center gap-2">
              <span>Logout</span>
              <LogOut className="w-4 h-4" />
            </Button>
            <Avatar>
              <AvatarImage src={userImage} alt="User" />
              <AvatarFallback>U</AvatarFallback>
            </Avatar>
          </div>
        </header>

        <div className="flex items-center mb-8">
          <div className="relative">
            <Avatar className="h-24 w-24 mr-6">
              <AvatarImage src={userImage} alt="User" />
              <AvatarFallback>U</AvatarFallback>
            </Avatar>
            <input type="file" accept="image/*" onChange={handleImageUpload} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" id="profile-picture-upload" />
            <label htmlFor="profile-picture-upload" className="absolute bottom-0 right-6 bg-primary text-primary-foreground rounded-full p-1 cursor-pointer">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" />
                <path fillRule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clipRule="evenodd" />
              </svg>
            </label>
          </div>
          <div>
            <h2 className="text-3xl font-bold">User Name</h2>
            <p className="text-muted-foreground">user.name@example.com</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Card className="bg-muted/20 border-border">
            <CardHeader>
              <CardTitle>My Mentors</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {mentors.map((mentor, index) => (
                <div key={index} className="flex items-center">
                  <Avatar className="h-10 w-10 mr-4">
                    <AvatarImage src={mentor.avatar} alt={mentor.name} />
                    <AvatarFallback>{mentor.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <span>{mentor.name}</span>
                </div>
              ))}
            </CardContent>
          </Card>
          <Card className="bg-muted/20 border-border">
            <CardHeader>
              <CardTitle>My Friends</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {friends.map((friend, index) => (
                <div key={index} className="flex items-center">
                  <Avatar className="h-10 w-10 mr-4">
                    <AvatarImage src={friend.avatar} alt={friend.name} />
                    <AvatarFallback>{friend.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <span>{friend.name}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Profile;

