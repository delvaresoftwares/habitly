
"use client";

import { useAuth } from "@/hooks/use-auth";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { getPublicUserProfileData } from "@/services/users";
import type { UserProfile, PublicUserProfileData } from "@/services/users";
import { BarChart, CalendarDays, Flame, Trophy, Check, ListChecks } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Bar, BarChart as RechartsBarChart, XAxis, YAxis } from "recharts";
import Link from "next/link";

const chartConfig = {
  habits: {
    label: "Habits Completed",
    color: "hsl(var(--chart-1))",
  },
};

export default function UserProfilePage({ params }: { params: { userId: string } }) {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [profileData, setProfileData] = useState<PublicUserProfileData | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);

  useEffect(() => {
    if (params.userId) {
      setProfileLoading(true);
      getPublicUserProfileData(params.userId)
        .then((data) => {
          setProfileData(data);
          setProfileLoading(false);
        })
        .catch(() => {
          setProfileData(null);
          setProfileLoading(false);
        });
    }
  }, [params.userId]);
  
  if (authLoading || profileLoading) {
    return (
      <div className="p-4 md:p-8 space-y-6">
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-64 w-full" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (!profileData || !profileData.profile) {
      return <div className="p-4 md:p-8">User not found.</div>
  }
  
  const { profile, habits, chartData } = profileData;
  const isCurrentUser = user?.uid === profile.uid;
  const completedToday = habits.filter(h => h.completedToday);

  return (
    <div className="p-4 md:p-8 space-y-6">
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

                <div className="grid grid-cols-2 gap-4 rounded-lg bg-muted p-4 text-center">
                    <div>
                        <p className="text-sm font-medium text-muted-foreground">Streak</p>
                        <p className="text-2xl font-bold flex items-center justify-center gap-2"><Flame className="text-orange-400" />{profile.streak}</p>
                    </div>
                    <div>
                        <p className="text-sm font-medium text-muted-foreground">Habit Score</p>
                        <p className="text-2xl font-bold flex items-center justify-center gap-2"><Trophy className="text-yellow-400" />{profile.habitScore}</p>
                    </div>
                </div>
            </CardContent>
            {isCurrentUser && (
                 <CardFooter>
                    <Button onClick={() => router.push('/profile')}>
                        Edit Your Profile
                    </Button>
                </CardFooter>
            )}
        </Card>

         <Card>
            <CardHeader>
                <CardTitle className="text-xl flex items-center gap-2"><ListChecks />Today's Progress</CardTitle>
                <CardDescription>Completed {completedToday.length} of {habits.length} habits today.</CardDescription>
            </CardHeader>
            <CardContent>
                {completedToday.length > 0 ? (
                    <ul className="space-y-2">
                        {completedToday.map(habit => (
                            <li key={habit.id} className="flex items-center gap-3 text-sm">
                                <Check className="h-4 w-4 text-green-500" />
                                <span className="text-muted-foreground">{habit.time}</span>
                                <span>{habit.text}</span>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p className="text-muted-foreground text-sm">No habits completed yet today.</p>
                )}
            </CardContent>
        </Card>

        <Card>
            <CardHeader>
                <CardTitle className="text-xl flex items-center gap-2"><BarChart />Monthly Completion Chart</CardTitle>
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
        
        <Card>
            <CardHeader>
                <CardTitle className="text-xl flex items-center gap-2"><CalendarDays />All Habits</CardTitle>
                <CardDescription>Click on any habit to see its detailed history.</CardDescription>
            </CardHeader>
            <CardContent>
                 <div className="space-y-2">
                    {habits.map((habit) => (
                        <Link href={`/habit/${habit.id}`} key={habit.id}>
                            <div className="p-3 rounded-lg hover:bg-muted transition-colors flex justify-between items-center">
                                <div>
                                    <p className="font-semibold">{habit.text}</p>
                                    <p className="text-sm text-muted-foreground">{habit.time}</p>
                                </div>
                                {habit.completedToday && <Check className="h-5 w-5 text-green-500" />}
                            </div>
                        </Link>
                    ))}
                </div>
            </CardContent>
        </Card>
    </div>
  );
}
