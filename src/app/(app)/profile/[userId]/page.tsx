
"use client";

import { useAuth } from "@/hooks/use-auth";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { getUserProfile, getMonthlyCompletionData } from "@/services/users";
import type { UserProfile } from "@/services/users";
import { BarChart, CalendarDays, Flame, Trophy } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Bar, BarChart as RechartsBarChart, XAxis, YAxis } from "recharts";

const chartConfig = {
  habits: {
    label: "Habits Completed",
    color: "hsl(var(--chart-1))",
  },
};

export default function UserProfilePage({ params }: { params: { userId: string } }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [chartData, setChartData] = useState<{ month: string; habits: number }[]>([]);
  const [profileLoading, setProfileLoading] = useState(true);

  useEffect(() => {
    if (params.userId) {
      setProfileLoading(true);
      Promise.all([
        getUserProfile(params.userId),
        getMonthlyCompletionData(params.userId),
      ]).then(([p, data]) => {
        setProfile(p);
        setChartData(data);
        setProfileLoading(false);
      });
    }
  }, [params.userId]);
  
  if (loading || profileLoading) {
    return (
      <div className="p-4 md:p-8 space-y-6">
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!profile) {
      return <div className="p-4 md:p-8">User not found.</div>
  }

  const isCurrentUser = user?.uid === profile.uid;

  return (
    <div className="p-4 md:p-8">
        <Card className="shadow-lg">
        <CardHeader>
            <CardTitle className="font-headline text-3xl">{profile.displayName}'s Profile</CardTitle>
            <CardDescription>
                Public profile and habit statistics.
            </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
            <div className="flex items-center gap-6">
            <Avatar className="h-24 w-24 border-4 border-primary/20">
                <AvatarImage src={profile.photoURL ?? undefined} alt={profile.displayName} />
                <AvatarFallback className="text-3xl">{profile.displayName.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="grid gap-1">
                <h2 className="text-2xl font-bold">{profile.displayName}</h2>
                <p className="text-muted-foreground">{profile.email}</p>
            </div>
            </div>

            <div className="flex items-center justify-around rounded-lg bg-muted p-4">
            <div className="text-center">
                <p className="text-sm font-medium text-muted-foreground">Streak</p>
                <p className="text-2xl font-bold flex items-center justify-center gap-2"><Flame className="text-orange-400" />{profile.streak}</p>
            </div>
            <div className="text-center">
                <p className="text-sm font-medium text-muted-foreground">Habit Score</p>
                <p className="text-2xl font-bold flex items-center justify-center gap-2"><Trophy className="text-yellow-400" />{profile.habitScore}</p>
            </div>
            </div>
            
            <Card>
                <CardHeader>
                    <CardTitle className="text-xl flex items-center gap-2"><BarChart />Habit Completion Chart</CardTitle>
                </CardHeader>
                <CardContent>
                     <ChartContainer config={chartConfig} className="h-64 w-full">
                        <RechartsBarChart accessibilityLayer data={chartData}>
                            <XAxis dataKey="month" tickLine={false} tickMargin={10} axisLine={false} />
                            <YAxis tickLine={false} axisLine={false} tickMargin={10}/>
                            <ChartTooltip content={<ChartTooltipContent />} />
                            <Bar dataKey="habits" fill="var(--color-habits)" radius={4} />
                        </RechartsBarChart>
                    </ChartContainer>
                </CardContent>
            </Card>

            {isCurrentUser && (
                <Button onClick={() => router.push('/profile')}>
                    Edit Your Profile
                </Button>
            )}
        </CardContent>
        </Card>
    </div>
  );
}

    