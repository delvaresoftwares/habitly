
"use client";

import React, { useState, useMemo, useEffect } from "react";
import {
  Activity, BarChart, Bed, BedDouble, BookOpen, BrainCircuit, Calendar, Check, CheckCircle2, Clapperboard, Coffee, Dumbbell, Flame, Gamepad2, GlassWater, LineChart, LogOut, Megaphone, Moon, Pizza, Settings, ShowerHead, Sun, Sunrise, Sunset, Timer, User, Utensils, X, Trophy, Users,
} from "lucide-react";
import {
  Bar,
  BarChart as RechartsBarChart,
  CartesianGrid,
  Line,
  LineChart as RechartsLineChart,
  XAxis,
  YAxis,
} from "recharts";
import { motion, AnimatePresence } from "framer-motion";


import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { useAuth } from "@/hooks/use-auth";
import { getUserHabits, updateHabit, type Habit } from "@/services/habits";
import { getUserProfile, updateUserScores, type UserProfile } from "@/services/users";
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
    const className = "h-8 w-8";
    switch (iconName) {
        case 'Sunrise': return <Sunrise className={`${className} text-yellow-400`} />;
        case 'Bed': return <Bed className={`${className} text-blue-400`} />;
        case 'Tooth': return <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className + " text-gray-300"}><path d="M11.2 3.193c.15-.386.44-.693.8-.893C14.7 1.3 15 2.5 15 3c0 .667 0 1.333 0 2h2c.5 0 1 .5 1 1v2c0 .5-.5 1-1 1h-2c0 .667 0 1.333 0 2 0 .5-.5 1-1 1H9c-.5 0-1-.5-1-1 0-.667 0-1.333 0-2H6c-.5 0-1-.5-1-1V7c0-.5.5-1 1-1h2c0-.667 0-1.333 0-2 0-.5.3-1.7 2.2-2.807Z"/><path d="M6 12h12c0 1.5-1 3-3 3H9c-2 0-3-1.5-3-3Z"/><path d="M18 15v2a3 3 0 0 1-3 3H9a3 3 0 0 1-3-3v-2"/><path d="M14 15.5v.5"/><path d="M10 15.5v.5"/></svg>;
        case 'GlassWater': return <GlassWater className={`${className} text-cyan-400`} />;
        case 'ShowerHead': return <ShowerHead className={`${className} text-sky-400`} />;
        case 'BrainCircuit': return <BrainCircuit className={`${className} text-purple-400`} />;
        case 'Flame': return <Flame className={`${className} text-orange-400`} />;
        case 'Coffee': return <Coffee className={`${className} text-amber-600`} />;
        case 'BookOpen': return <BookOpen className={`${className} text-green-400`} />;
        case 'Timer': return <Timer className={`${className} text-gray-400`} />;
        case 'Sun': return <Sun className={`${className} text-yellow-300`} />;
        case 'Utensils': return <Utensils className={`${className} text-lime-400`} />;
        case 'Gamepad2': return <Gamepad2 className={`${className} text-indigo-400`} />;
        case 'Pizza': return <Pizza className={`${className} text-red-400`} />;
        case 'Sunset': return <Sunset className={`${className} text-orange-500`} />;
        case 'Dumbbell': return <Dumbbell className={`${className} text-rose-400`} />;
        case 'Clapperboard': return <Clapperboard className={`${className} text-fuchsia-400`} />;
        case 'BedDouble': return <BedDouble className={`${className} text-blue-500`} />;
        default: return <Activity className={`${className} text-gray-500`} />;
    }
}

const HabitCard = ({ habit, onToggle, onRemove }: { habit: Habit, onToggle: (id: string, completed: boolean) => void, onRemove: (id: string) => void }) => {
  
  const handleDragEnd = (event: any, info: any) => {
    if (info.offset.x < -100) { // Slide left to complete
      if(!habit.completed) {
        onToggle(habit.id, true);
      }
      onRemove(habit.id);
    } else if (info.offset.x > 100) { // Slide right to un-complete
       if(habit.completed) {
        onToggle(habit.id, false);
      }
    }
  };

  return (
    <motion.div
      layout
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ x: -300, opacity: 0 }}
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      dragElasticity={0.2}
      onDragEnd={handleDragEnd}
      className="relative"
    >
      <Card className="overflow-hidden shadow-lg transition-all duration-300 hover:shadow-xl active:scale-95">
        <CardContent className="flex items-center gap-4 p-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-muted">
            {getIcon(habit.iconName)}
          </div>
          <div className="flex-grow">
              <p className="font-bold">{habit.text}</p>
              <p className="text-sm text-muted-foreground">{habit.time}</p>
          </div>
          <div className="flex gap-2 items-center text-muted-foreground/50">
            <Check className="text-green-500" />
          </div>
        </CardContent>
      </Card>
       <div className="absolute inset-y-0 left-0 flex items-center pl-4 pr-8 bg-green-500/20 rounded-l-lg -z-10">
          <Check className="text-green-500" />
      </div>
      <div className="absolute inset-y-0 right-0 flex items-center pr-4 pl-8 bg-red-500/20 rounded-r-lg -z-10">
          <X className="text-red-500" />
      </div>
    </motion.div>
  );
};


export default function Dashboard() {
  const [allHabits, setAllHabits] = useState<Habit[]>([]);
  const [displayedHabits, setDisplayedHabits] = useState<Habit[]>([]);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loadingHabits, setLoadingHabits] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      setLoadingHabits(true);
      getUserHabits(user.uid)
        .then(userHabits => {
            setAllHabits(userHabits);
            setDisplayedHabits(userHabits.filter(h => !h.completed));
            setLoadingHabits(false);
        });
      getUserProfile(user.uid)
        .then(profile => setUserProfile(profile));
    }
  }, [user]);

  const progress = useMemo(() => {
    if (allHabits.length === 0) return 0;
    const completedCount = allHabits.filter((h) => h.completed).length;
    return (completedCount / allHabits.length) * 100;
  }, [allHabits]);
  
  const handleRemoveFromDisplay = (id: string) => {
    setDisplayedHabits(prev => prev.filter(h => h.id !== id));
  };


  const handleHabitToggle = async (id: string, newCompletedState: boolean) => {
    if (!user || !userProfile) return;

    const habitToToggle = allHabits.find(h => h.id === id);
    if (!habitToToggle || habitToToggle.completed === newCompletedState) return;
    
    const oldCompletedState = habitToToggle.completed;
    
    // Optimistically update the main habits list
    const newAllHabits = allHabits.map(habit => 
      habit.id === id ? { ...habit, completed: newCompletedState } : habit
    );
    setAllHabits(newAllHabits);
    
    let newStreak = userProfile.streak;
    let newHabitScore = userProfile.habitScore;

    if (newCompletedState && !oldCompletedState) { 
        newHabitScore++;
    } else if (!newCompletedState && oldCompletedState) { 
        newHabitScore = Math.max(0, newHabitScore - 1);
    }
    
    const allCompleted = newAllHabits.every(h => h.completed);
    if (allCompleted) {
        newStreak++;
    } else {
        // Check if the user just un-completed the final habit
        const wasPreviouslyAllCompleted = allHabits.every(h => h.completed);
        if(wasPreviouslyAllCompleted && !newCompletedState){
             newStreak = Math.max(0, newStreak - 1);
        }
    }

    const newProfile = { ...userProfile, streak: newStreak, habitScore: newHabitScore };
    setUserProfile(newProfile);

    try {
        await updateHabit(id, newCompletedState);
        await updateUserScores(user.uid, { streak: newStreak, habitScore: newHabitScore });
    } catch (error) {
       // Revert optimistic updates on failure
        setAllHabits(allHabits);
        setUserProfile(userProfile);
        // Put the card back in view if it was removed
        if (!displayedHabits.some(h => h.id === id)) {
            setDisplayedHabits(prev => [...prev, habitToToggle]);
        }
        console.error("Failed to update habit:", error);
    }
  };
  
  const DailyRoutineSkeleton = () => (
    <div className="space-y-4">
      {[...Array(5)].map((_, i) => (
        <Card key={i} className="flex items-center gap-4 p-4">
            <Skeleton className="h-12 w-12 rounded-lg" />
            <div className="flex-grow space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/4" />
            </div>
        </Card>
      ))}
    </div>
  );

  return (
    <div className="p-4 md:p-8 space-y-8">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card className="shadow-lg">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Daily Progress</CardTitle>
                 <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{Math.round(progress)}%</div>
                <p className="text-xs text-muted-foreground">{allHabits.filter(h => h.completed).length} of {allHabits.length} habits completed</p>
                 <Progress value={progress} className="h-2 mt-2" />
              </CardContent>
            </Card>
            <Card className="shadow-lg">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium">Current Streak</CardTitle>
                    <Flame className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{userProfile?.streak ?? 0} days</div>
                    <p className="text-xs text-muted-foreground">Keep it up!</p>
                </CardContent>
            </Card>
            <Card className="shadow-lg">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium">Habit Score</CardTitle>
                    <Trophy className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{userProfile?.habitScore ?? 0}</div>
                    <p className="text-xs text-muted-foreground">Total habits completed</p>
                </CardContent>
            </Card>
            <Card className="shadow-lg">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium">Motivation</CardTitle>
                    <Megaphone className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-xl font-bold">"The first step is the hardest."</div>
                    <p className="text-xs text-muted-foreground">- Confucius</p>
                </CardContent>
            </Card>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
            <div className="lg:col-span-2 space-y-8">
                <Card className="shadow-lg overflow-hidden">
                    <CardHeader>
                        <CardTitle className="font-headline text-3xl">Your Daily Routine</CardTitle>
                        <CardDescription>Slide left to complete, slide right to undo. Build the life you want.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                         {loadingHabits ? (
                            <DailyRoutineSkeleton />
                         ) : displayedHabits.length > 0 ? (
                            <AnimatePresence>
                                {displayedHabits.map((habit) => (
                                    <HabitCard key={habit.id} habit={habit} onToggle={handleHabitToggle} onRemove={handleRemoveFromDisplay} />
                                ))}
                            </AnimatePresence>
                         ) : (
                            <div className="text-center py-12">
                                <CheckCircle2 className="mx-auto h-12 w-12 text-green-500" />
                                <h3 className="mt-2 text-xl font-semibold">All Done for Today!</h3>
                                <p className="mt-1 text-sm text-muted-foreground">You've completed all your habits. Great job!</p>
                            </div>
                         )}
                    </CardContent>
                </Card>
            </div>

            <div className="space-y-8">
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
            </div>
        </div>
    </div>
  );
}

    