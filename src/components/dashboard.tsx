"use client";

import React, { useState, useMemo, useEffect } from "react";
import {
  Activity,
  BarChart,
  Calendar,
  CheckCircle2,
  Flame,
  LineChart,
  LogOut,
  Megaphone,
  Moon,
  Settings,
  Sun,
  User,
} from "lucide-react";
import Link from "next/link";
import {
  Bar,
  BarChart as RechartsBarChart,
  CartesianGrid,
  Line,
  LineChart as RechartsLineChart,
  XAxis,
  YAxis,
} from "recharts";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RhythmFlowLogo } from "./icons";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { useAuth } from "@/hooks/use-auth";
import { getUserHabits, updateHabit, type Habit } from "@/services/habits";
import { Skeleton } from "./ui/skeleton";

const weeklyData = [
  { day: "Mon", habits: 4 },
  { day: "Tue", habits: 5 },
  { day: "Wed", habits: 6 },
  { day: "Thu", habits: 5 },
  { day: "Fri", habits: 7 },
  { day: "Sat", habits: 6 },
  { day: "Sun", habits: 5 },
];

const monthlyData = [
  { week: "W1", habits: 30 },
  { week: "W2", habits: 35 },
  { week: "W3", habits: 32 },
  { week: "W4", habits: 38 },
];

const yearlyData = [
    { month: "Jan", habits: 120 }, { month: "Feb", habits: 130 }, { month: "Mar", habits: 150 },
    { month: "Apr", habits: 140 }, { month: "May", habits: 160 }, { month: "Jun", habits: 155 },
    { month: "Jul", habits: 170 }, { month: "Aug", habits: 165 }, { month: "Sep", habits: 180 },
    { month: "Oct", habits: 175 }, { month: "Nov", habits: 190 }, { month: "Dec", habits: 185 },
];


const chartConfig: ChartConfig = {
  habits: {
    label: "Habits Completed",
    color: "hsl(var(--accent))",
    icon: CheckCircle2,
  },
};

const getIcon = (iconName: string) => {
    switch (iconName) {
        case 'Sun': return <Sun className="h-5 w-5 text-yellow-500" />;
        case 'Flame': return <Flame className="h-5 w-5 text-orange-500" />;
        case 'Activity': return <Activity className="h-5 w-5 text-red-500" />;
        case 'User': return <User className="h-5 w-5 text-green-500" />;
        case 'Calendar': return <Calendar className="h-5 w-5 text-blue-500" />;
        case 'Moon': return <Moon className="h-5 w-5 text-purple-500" />;
        default: return <Activity className="h-5 w-5 text-gray-500" />;
    }
}

export default function Dashboard() {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [streak, setStreak] = useState(21);
  const [loadingHabits, setLoadingHabits] = useState(true);
  const { user, signOut } = useAuth();

  useEffect(() => {
    if (user) {
      getUserHabits(user.uid)
        .then(userHabits => {
            setHabits(userHabits);
            setLoadingHabits(false);
        });
    }
  }, [user]);

  const progress = useMemo(() => {
    if (habits.length === 0) return 0;
    const completedCount = habits.filter((h) => h.completed).length;
    return (completedCount / habits.length) * 100;
  }, [habits]);

  const handleHabitToggle = async (id: string) => {
    const habitToToggle = habits.find(h => h.id === id);
    if (!habitToToggle) return;

    const newCompletedState = !habitToToggle.completed;
    
    // Optimistic UI update
    setHabits(prevHabits =>
        prevHabits.map(habit =>
            habit.id === id ? { ...habit, completed: newCompletedState } : habit
        )
    );

    // Update streak
    let newStreak = streak;
    if (newCompletedState) {
        newStreak++;
    } else if (newStreak > 0) {
        newStreak--;
    }
    setStreak(newStreak);

    // Persist change to Firestore
    try {
        await updateHabit(id, newCompletedState);
    } catch (error) {
        // Revert UI on error
        setHabits(prevHabits =>
            prevHabits.map(habit =>
                habit.id === id ? { ...habit, completed: !newCompletedState } : habit
            )
        );
        // Revert streak
        setStreak(streak);
        console.error("Failed to update habit:", error);
    }
  };
  
  const DailyRoutineSkeleton = () => (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="font-headline text-3xl">Your Daily Routine</CardTitle>
        <CardDescription>Stay on track to build the life you want.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {[...Array(6)].map((_, i) => (
          <Card key={i}>
            <CardContent className="flex items-center gap-4 p-4">
              <Skeleton className="h-6 w-6 rounded-full" />
              <div className="flex-grow space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/4" />
              </div>
              <Skeleton className="h-6 w-6 rounded-full" />
            </CardContent>
          </Card>
        ))}
      </CardContent>
    </Card>
  );

  return (
    <div className="flex min-h-screen w-full flex-col bg-background">
      <header className="sticky top-0 z-40 flex h-16 items-center justify-between gap-4 border-b bg-card px-4 md:px-6">
        <div className="flex items-center gap-2">
          <RhythmFlowLogo className="h-6 w-6 text-primary" />
          <h1 className="font-headline text-xl font-bold tracking-tighter text-foreground">
            RhythmFlow
          </h1>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="rounded-full">
              <Avatar>
                <AvatarImage src={user?.photoURL ?? "https://placehold.co/100x100"} alt={user?.displayName ?? "User"} />
                <AvatarFallback>{user?.displayName?.charAt(0) ?? 'U'}</AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>{user?.displayName ?? 'My Account'}</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <User className="mr-2" />
              Profile
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Settings className="mr-2" />
              Settings
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={signOut}>
              <LogOut className="mr-2" />
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </header>

      <main className="flex-1 overflow-auto p-4 md:p-8">
        <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-8">
            {loadingHabits ? <DailyRoutineSkeleton /> : (
                <Card className="shadow-lg">
                    <CardHeader>
                        <CardTitle className="font-headline text-3xl">Your Daily Routine</CardTitle>
                        <CardDescription>Stay on track to build the life you want.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {habits.map((habit) => (
                            <Card key={habit.id} className={`transition-all duration-300 ${habit.completed ? 'bg-accent/10 border-accent' : 'bg-card'}`}>
                                <CardContent className="flex items-center gap-4 p-4">
                                    <div className="text-accent">{getIcon(habit.iconName)}</div>
                                    <div className="flex-grow">
                                        <p className="font-semibold">{habit.text}</p>
                                        <p className="text-sm text-muted-foreground">{habit.time}</p>
                                    </div>
                                    <Checkbox
                                        id={`habit-${habit.id}`}
                                        checked={habit.completed}
                                        onCheckedChange={() => handleHabitToggle(habit.id)}
                                        className="h-6 w-6 rounded-full data-[state=checked]:bg-accent data-[state=checked]:border-accent-foreground border-muted-foreground"
                                        aria-label={`Mark ${habit.text} as complete`}
                                    />
                                </CardContent>
                            </Card>
                        ))}
                    </CardContent>
                </Card>
            )}
          </div>

          <div className="space-y-8">
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="font-headline">Daily Progress</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col items-center gap-4">
                <div
                  className="relative h-32 w-32 rounded-full bg-muted flex items-center justify-center"
                  style={{ background: `conic-gradient(hsl(var(--accent)) ${progress}%, hsl(var(--muted)) 0)` }}
                >
                    <div className="h-[7rem] w-[7rem] rounded-full bg-card flex items-center justify-center">
                       <span className="text-2xl font-bold text-accent">{Math.round(progress)}%</span>
                    </div>
                </div>
                <Progress value={progress} className="h-2 w-full" />
                <p className="text-sm text-muted-foreground">You've completed {habits.filter(h => h.completed).length} of {habits.length} habits.</p>
              </CardContent>
            </Card>

            <Card className="shadow-lg text-center bg-gradient-to-br from-primary/80 to-primary">
              <CardHeader>
                <CardTitle className="font-headline text-primary-foreground">Completion Streak</CardTitle>
              </CardHeader>
              <CardContent className="flex items-center justify-center gap-4">
                <Flame className="h-12 w-12 text-yellow-300" />
                <span className="text-6xl font-bold text-primary-foreground">{streak}</span>
                <span className="text-lg text-primary-foreground/80">days</span>
              </CardContent>
            </Card>

            <Card className="shadow-lg">
                <CardHeader>
                    <CardTitle className="font-headline">Progress Tracker</CardTitle>
                </CardHeader>
                <CardContent>
                    <Tabs defaultValue="weekly">
                        <TabsList className="grid w-full grid-cols-3">
                            <TabsTrigger value="weekly">Weekly</TabsTrigger>
                            <TabsTrigger value="monthly">Monthly</TabsTrigger>
                            <TabsTrigger value="yearly">Yearly</TabsTrigger>
                        </TabsList>
                        <TabsContent value="weekly">
                            <ChartContainer config={chartConfig} className="h-60 w-full">
                                <RechartsBarChart accessibilityLayer data={weeklyData}>
                                    <CartesianGrid vertical={false} />
                                    <XAxis dataKey="day" tickLine={false} tickMargin={10} axisLine={false} />
                                    <YAxis tickLine={false} axisLine={false} tickMargin={10}/>
                                    <ChartTooltip content={<ChartTooltipContent />} />
                                    <Bar dataKey="habits" fill="var(--color-habits)" radius={4} />
                                </RechartsBarChart>
                            </ChartContainer>
                        </TabsContent>
                        <TabsContent value="monthly">
                            <ChartContainer config={chartConfig} className="h-60 w-full">
                                <RechartsBarChart accessibilityLayer data={monthlyData}>
                                    <CartesianGrid vertical={false} />
                                    <XAxis dataKey="week" tickLine={false} tickMargin={10} axisLine={false} />
                                    <YAxis tickLine={false} axisLine={false} tickMargin={10}/>
                                    <ChartTooltip content={<ChartTooltipContent />} />
                                    <Bar dataKey="habits" fill="var(--color-habits)" radius={4} />
                                </RechartsBarChart>
                            </ChartContainer>
                        </TabsContent>
                        <TabsContent value="yearly">
                             <ChartContainer config={chartConfig} className="h-60 w-full">
                                <RechartsLineChart accessibilityLayer data={yearlyData}>
                                    <CartesianGrid vertical={false} />
                                    <XAxis dataKey="month" tickLine={false} tickMargin={10} axisLine={false} />
                                    <YAxis tickLine={false} axisLine={false} tickMargin={10} />
                                    <ChartTooltip content={<ChartTooltipContent />} />
                                    <Line type="monotone" dataKey="habits" stroke="var(--color-habits)" strokeWidth={2} dot={false} />
                                </RechartsLineChart>
                            </ChartContainer>
                        </TabsContent>
                    </Tabs>
                </CardContent>
            </Card>

             <Card className="shadow-lg">
                <CardHeader className="flex flex-row items-center gap-4">
                    <div className="p-2 bg-accent/20 rounded-full">
                      <Megaphone className="h-6 w-6 text-accent" />
                    </div>
                    <CardTitle className="font-headline m-0">Motivation Boost</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground">"The secret of getting ahead is getting started." - Mark Twain</p>
                </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
