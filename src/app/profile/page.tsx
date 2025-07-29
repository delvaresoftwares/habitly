
"use client";

import { useAuth } from "@/hooks/use-auth";
import { useRouter } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getUserProfile, updateUserProfile, uploadProfilePhoto } from "@/services/users";
import type { UserProfile } from "@/services/users";
import { Camera, LogOut, Users } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";
import { RhythmFlowLogo } from "@/components/icons";

export default function ProfilePage() {
  const { user, loading, signOut } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [displayName, setDisplayName] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
    if (user) {
      getUserProfile(user.uid).then(p => {
        setProfile(p);
        setDisplayName(p?.displayName ?? "");
      });
    }
  }, [user, loading, router]);

  const handleSave = async () => {
    if (!user || !profile) return;
    setIsSaving(true);
    try {
      await updateUserProfile(user.uid, { displayName });
      // This is a bit of a hack to get the user object to update
      // In a real app you might want to re-fetch the user or use a global state manager
      if (user.updateProfile) {
          await user.updateProfile({ displayName });
      }
      setProfile({ ...profile, displayName });
      toast({ title: "Success", description: "Profile updated successfully." });
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!user || !profile) return;
    const file = e.target.files?.[0];
    if (!file) return;

    setIsSaving(true);
    try {
      const photoURL = await uploadProfilePhoto(user.uid, file);
      await updateUserProfile(user.uid, { photoURL });
      if (user.updateProfile) {
          await user.updateProfile({ photoURL });
      }
      setProfile({ ...profile, photoURL });
      toast({ title: "Success", description: "Profile photo updated." });
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  };
  
  if (loading || !user || !profile) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen w-full flex-col bg-background">
      <header className="sticky top-0 z-40 flex h-16 items-center justify-between gap-4 border-b bg-card px-4 md:px-6">
        <Link href="/" className="flex items-center gap-2">
          <RhythmFlowLogo className="h-6 w-6 text-primary" />
          <h1 className="font-headline text-xl font-bold tracking-tighter text-foreground">
            RhythmFlow
          </h1>
        </Link>
        <div className="flex items-center gap-4">
            <Button variant="ghost" asChild>
                <Link href="/leaderboard"><Users /> <span className="hidden sm:inline ml-2">Leaderboard</span></Link>
            </Button>
            <Button variant="ghost" onClick={signOut}><LogOut /> <span className="hidden sm:inline ml-2">Logout</span></Button>
        </div>
      </header>
      <main className="flex-1 overflow-auto p-4 md:p-8">
        <div className="mx-auto max-w-2xl">
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="font-headline text-3xl">Your Profile</CardTitle>
              <CardDescription>
                View and edit your public profile information.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center gap-6">
                <div className="relative">
                  <Avatar className="h-24 w-24 border-4 border-primary/20">
                    <AvatarImage src={profile.photoURL ?? undefined} alt={profile.displayName} />
                    <AvatarFallback className="text-3xl">{profile.displayName.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <Button
                    size="icon"
                    className="absolute bottom-0 right-0 rounded-full"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Camera size={18} />
                  </Button>
                  <Input
                    type="file"
                    ref={fileInputRef}
                    onChange={handlePhotoUpload}
                    className="hidden"
                    accept="image/*"
                  />
                </div>
                <div className="grid gap-1">
                  <h2 className="text-2xl font-bold">{profile.displayName}</h2>
                  <p className="text-muted-foreground">{profile.email}</p>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="displayName">Display Name</Label>
                <Input
                  id="displayName"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="max-w-sm"
                />
              </div>

              <div className="flex items-center justify-between rounded-lg bg-muted p-4">
                <div className="text-center">
                    <p className="text-sm font-medium text-muted-foreground">Streak</p>
                    <p className="text-2xl font-bold">{profile.streak}</p>
                </div>
                <div className="text-center">
                    <p className="text-sm font-medium text-muted-foreground">Habit Score</p>
                    <p className="text-2xl font-bold">{profile.habitScore}</p>
                </div>
                 <div className="text-center">
                    <p className="text-sm font-medium text-muted-foreground">Rank</p>
                    <p className="text-2xl font-bold">#1</p>
                </div>
              </div>

              <Button onClick={handleSave} disabled={isSaving}>
                {isSaving ? "Saving..." : "Save Changes"}
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
