import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { BookOpen, PlusCircle, Loader2 } from "lucide-react";

interface Material {
  id: string;
  name: string;
  description: string;
  file_url: string;
  uploader_id: string;
  created_at: string;
}

const Materials = () => {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [loading, setLoading] = useState(true);
  const [isUploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [newMaterialName, setNewMaterialName] = useState("");
  const [newMaterialDescription, setNewMaterialDescription] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const { toast } = useToast();

  const fetchMaterials = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:3002/api/materials');
      if (!response.ok) throw new Error('Failed to fetch materials');
      const data = await response.json();
      setMaterials(data || []);
    } catch (error: any) {
      toast({
        title: "Error fetching materials",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMaterials();
  }, []);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      setSelectedFile(event.target.files[0]);
    }
  };

  const handleUploadMaterial = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const token = localStorage.getItem('authToken');
    if (!token) {
      toast({ title: "Authentication Error", description: "You must be logged in to upload.", variant: "destructive" });
      return;
    }

    if (!newMaterialName.trim() || !selectedFile) {
      toast({ title: "Validation Error", description: "Material name and file are required.", variant: "destructive" });
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append('name', newMaterialName);
    formData.append('description', newMaterialDescription);
    formData.append('file', selectedFile);

    try {
      const response = await fetch('http://localhost:3002/api/materials', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to upload material');
      }

      fetchMaterials(); // Refresh the list
      toast({ title: "Success", description: "Material uploaded successfully." });
      setUploadDialogOpen(false);
      setNewMaterialName("");
      setNewMaterialDescription("");
      setSelectedFile(null);
    } catch (error: any) {
      toast({ title: "Upload Error", description: error.message, variant: "destructive" });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold">My Materials</h1>
          <Dialog open={isUploadDialogOpen} onOpenChange={setUploadDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <PlusCircle className="w-4 h-4 mr-2" />
                Upload Material
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <form onSubmit={handleUploadMaterial}>
                <DialogHeader>
                  <DialogTitle>Upload a new Material</DialogTitle>
                  <DialogDescription>
                    Share your study resources with the community.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="name" className="text-right">Name</Label>
                    <Input id="name" value={newMaterialName} onChange={(e) => setNewMaterialName(e.target.value)} className="col-span-3" placeholder="e.g. React Cheatsheet" />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="description" className="text-right">Description</Label>
                    <Input id="description" value={newMaterialDescription} onChange={(e) => setNewMaterialDescription(e.target.value)} className="col-span-3" placeholder="A quick guide to React hooks." />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="file" className="text-right">File</Label>
                    <Input id="file" type="file" onChange={handleFileChange} className="col-span-3" />
                  </div>
                </div>
                <DialogFooter>
                  <Button type="submit" disabled={uploading}>
                    {uploading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Uploading...</> : "Upload"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </header>
      
      <main className="container mx-auto px-4 py-8">
        {loading ? (
          <div className="flex justify-center items-center h-64"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
        ) : materials.length === 0 ? (
          <div className="text-center py-16">
            <BookOpen className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold">No materials found</h3>
            <p className="text-muted-foreground">Upload some study materials to get started.</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {materials.map((material) => (
              <Card key={material.id}>
                <CardHeader>
                  <CardTitle>{material.name}</CardTitle>
                  <CardDescription>{material.description || "No description."}</CardDescription>
                </CardHeader>
                <CardContent>
                  <a href={material.file_url} target="_blank" rel="noopener noreferrer">
                    <Button variant="outline" className="w-full">View Material</Button>
                  </a>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default Materials;
