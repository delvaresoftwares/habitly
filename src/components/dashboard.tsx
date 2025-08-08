
"use client";

import React, { useState, useEffect } from "react";
import Link from 'next/link';
import {
  Activity, Bed, BedDouble, BookOpen, BrainCircuit, Check, CheckCircle2, Clapperboard, Coffee, Dumbbell, Flame, Gamepad2, GlassWater, Moon, Pizza, ShowerHead, Sun, Sunrise, Sunset, Timer, Utensils, X, Undo2
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/use-auth";
import { getUserHabits, updateHabitCompletion, type Habit, listenForHabitCompletions } from "@/services/habits";
import { getUserProfile, updateUserScores, type UserProfile } from "@/services/users";
import { Skeleton } from "./ui/skeleton";
import { useToast } from "@/hooks/use-toast";

const getIcon = (iconName: string) => {
    const className = "h-8 w-8";
    switch (iconName) {
        case 'Sunrise': return <Sunrise className={`${className} text-orange-400`} />;
        case 'Bed': return <Bed className={`${className} text-indigo-400`} />;
        case 'Tooth': return <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className + " text-blue-300"}><path d="M11.2 3.193c.15-.386.44-.693.8-.893C14.7 1.3 15 2.5 15 3c0 .667 0 1.333 0 2h2c.5 0 1 .5 1 1v2c0 .5-.5 1-1 1h-2c0 .667 0 1.333 0 2 0 .5-.5 1-1 1H9c-.5 0-1-.5-1-1 0-.667 0-1.333 0-2H6c-.5 0-1-.5-1-1V7c0-.5.5-1 1-1h2c0-.667 0-1.333 0-2 0-.5.3-1.7 2.2-2.807Z"/><path d="M6 12h12c0 1.5-1 3-3 3H9c-2 0-3-1.5-3-3Z"/><path d="M18 15v2a3 3 0 0 1-3 3H9a3 3 0 0 1-3-3v-2"/><path d="M14 15.5v.5"/><path d="M10 15.5v.5"/></svg>;
        case 'GlassWater': return <GlassWater className={`${className} text-sky-400`} />;
        case 'ShowerHead': return <ShowerHead className={`${className} text-cyan-400`} />;
        case 'BrainCircuit': return <BrainCircuit className={`${className} text-purple-400`} />;
        case 'Flame': return <Flame className={`${className} text-red-500`} />;
        case 'Coffee': return <Coffee className={`${className} text-yellow-700`} />;
        case 'BookOpen': return <BookOpen className={`${className} text-green-500`} />;
        case 'Timer': return <Timer className={`${className} text-gray-500`} />;
        case 'Sun': return <Sun className={`${className} text-yellow-400`} />;
        case 'Utensils': return <Utensils className={`${className} text-lime-500`} />;
        case 'Gamepad2': return <Gamepad2 className={`${className} text-blue-500`} />;
        case 'Pizza': return <Pizza className={`${className} text-amber-500`} />;
        case 'Sunset': return <Sunset className={`${className} text-orange-600`} />;
        case 'Dumbbell': return <Dumbbell className={`${className} text-rose-500`} />;
        case 'Clapperboard': return <Clapperboard className={`${className} text-fuchsia-500`} />;
        case 'BedDouble': return <BedDouble className={`${className} text-indigo-500`} />;
        default: return <Activity className={`${className} text-gray-500`} />;
    }
}

const HabitCard = ({ habit, onComplete, onUndo }: { habit: Habit, onComplete: (id: string) => void, onUndo: (id: string) => void }) => {
  const [isDragging, setIsDragging] = useState(false);
  
  return (
    <div className="relative group">
        <motion.div
            layout
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ x: -300, opacity: 0, transition: { duration: 0.2 } }}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElasticity={0.2}
            onDragStart={() => setIsDragging(true)}
            onDragEnd={(event, info) => {
                setIsDragging(false);
                if (info.offset.x < -100) { // Slide left to complete
                    onComplete(habit.id);
                } else if (info.offset.x > 100) { // Slide right to undo
                    onUndo(habit.id);
                }
            }}
            className="relative z-10"
        >
            <Link href={`/habit/${habit.id}`} className="block">
                <Card className={`overflow-hidden shadow-lg transition-all duration-300 ${isDragging ? 'shadow-2xl' : 'hover:shadow-xl'} active:scale-[0.98] bg-card`}>
                <CardContent className="flex items-center gap-4 p-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-muted flex-shrink-0">
                    {getIcon(habit.iconName)}
                    </div>
                    <div className="flex-grow overflow-hidden">
                        <p className="font-bold truncate">{habit.text}</p>
                        <p className="text-sm text-muted-foreground">{habit.time}</p>
                    </div>
                </CardContent>
                </Card>
            </Link>
        </motion.div>
        <div className="absolute inset-y-0 left-0 flex items-center pl-6 pr-8 bg-green-500 rounded-lg -z-10 opacity-100 transition-opacity">
            <Check className="h-8 w-8 text-white" />
        </div>
        <div className="absolute inset-y-0 right-0 flex items-center pr-6 pl-8 bg-gray-500 rounded-lg -z-10 opacity-100 transition-opacity">
            <Undo2 className="h-8 w-8 text-white" />
        </div>
    </div>
  );
};


export default function Dashboard() {
  const [allHabits, setAllHabits] = useState<Habit[]>([]);
  const [displayedHabits, setDisplayedHabits] = useState<Habit[]>([]);
  const [completedHabits, setCompletedHabits] = useState<Habit[]>([]);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loadingHabits, setLoadingHabits] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      setLoadingHabits(true);
      Promise.all([
        getUserHabits(user.uid),
        getUserProfile(user.uid)
      ]).then(([userHabits, profile]) => {
          setAllHabits(userHabits);
          setDisplayedHabits(userHabits.filter(h => !h.completedToday));
          setCompletedHabits(userHabits.filter(h => h.completedToday));
          setUserProfile(profile);
          setLoadingHabits(false);
      });
      
      const unsubscribe = listenForHabitCompletions((completion) => {
        if (completion.userId !== user.uid) {
           toast({
             title: "🎉 Habit Completed!",
             description: `${completion.userName} just completed "${completion.habitText}". Keep it up!`,
           });
        }
      });

      return () => unsubscribe();
    }
  }, [user, toast]);
  
  const handleHabitComplete = async (id: string) => {
    if (!user || !userProfile) return;
    
    const habitToUpdate = allHabits.find(h => h.id === id);
    if (!habitToUpdate || habitToUpdate.completedToday) return;

    const newAllHabits = allHabits.map(h => h.id === id ? { ...h, completedToday: true } : h);
    setAllHabits(newAllHabits);
    setDisplayedHabits(newAllHabits.filter(h => !h.completedToday));
    setCompletedHabits(newAllHabits.filter(h => h.completedToday));
    
    let newStreak = userProfile.streak;
    const newHabitScore = userProfile.habitScore + 1;
    
    const allCompleted = newAllHabits.every(h => h.completedToday);
    if (allCompleted) {
        newStreak++;
    }

    const newProfile = { ...userProfile, streak: newStreak, habitScore: newHabitScore };
    setUserProfile(newProfile);

    try {
        await updateHabitCompletion(user.uid, id, true, user.displayName || "Someone", habitToUpdate.text);
        await updateUserScores(user.uid, { streak: newStreak, habitScore: newHabitScore });
    } catch (error) {
       console.error("Failed to update habit:", error);
       // Revert on failure
       setAllHabits(allHabits);
       setUserProfile(userProfile);
       setDisplayedHabits(allHabits.filter(h => !h.completedToday));
       setCompletedHabits(allHabits.filter(h => h.completedToday));
    }
  };

  const handleHabitUndo = async (id: string) => {
    if (!user || !userProfile) return;

    const habitToUpdate = allHabits.find(h => h.id === id);
    if (!habitToUpdate || !habitToUpdate.completedToday) return;

    const newAllHabits = allHabits.map(h => h.id === id ? { ...h, completedToday: false } : h);
    setAllHabits(newAllHabits);
    setDisplayedHabits(newAllHabits.filter(h => !h.completedToday));
    setCompletedHabits(newAllHabits.filter(h => h.completedToday));
    
    let newStreak = userProfile.streak;
    const newHabitScore = Math.max(0, userProfile.habitScore - 1);
    
    const wasPreviouslyAllCompleted = allHabits.every(h => h.completedToday);
    if(wasPreviouslyAllCompleted){
        newStreak = Math.max(0, newStreak - 1);
    }
    
    const newProfile = { ...userProfile, streak: newStreak, habitScore: newHabitScore };
    setUserProfile(newProfile);
    
    try {
        await updateHabitCompletion(user.uid, id, false, user.displayName || "Someone", habitToUpdate.text);
        await updateUserScores(user.uid, { streak: newStreak, habitScore: newHabitScore });
    } catch (error) {
        console.error("Failed to undo habit completion:", error);
        // Revert on failure
        setAllHabits(allHabits);
        setUserProfile(userProfile);
        setDisplayedHabits(allHabits.filter(h => !h.completedToday));
        setCompletedHabits(allHabits.filter(h => h.completedToday));
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
    <div className="p-4 md:p-8 space-y-6">
        <div className="space-y-4">
            <h2 className="font-headline text-3xl">Your Daily Routine</h2>
            <p className="text-muted-foreground">Slide left to complete, right to undo. Tap for details.</p>
        </div>
        
        {loadingHabits ? (
        <DailyRoutineSkeleton />
        ) : displayedHabits.length > 0 ? (
        <AnimatePresence>
            {displayedHabits.map((habit) => (
                <HabitCard key={habit.id} habit={habit} onComplete={handleHabitComplete} onUndo={handleHabitUndo} />
            ))}
        </AnimatePresence>
        ) : (
        <div className="text-center py-12">
            <CheckCircle2 className="mx-auto h-12 w-12 text-green-500" />
            <h3 className="mt-2 text-xl font-semibold">All Done for Today!</h3>
            <p className="mt-1 text-sm text-muted-foreground">You've completed all your habits. Great job!</p>
        </div>
        )}

        {completedHabits.length > 0 && (
            <div className="space-y-4 pt-8">
                <h3 className="font-headline text-2xl">Completed</h3>
                {completedHabits.map((habit) => (
                    <Link href={`/habit/${habit.id}`} key={habit.id} className="block">
                         <Card className="bg-muted/50">
                            <CardContent className="flex items-center gap-4 p-4">
                                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-background flex-shrink-0">
                                {getIcon(habit.iconName)}
                                </div>
                                <div className="flex-grow overflow-hidden">
                                    <p className="font-bold truncate text-muted-foreground line-through">{habit.text}</p>
                                    <p className="text-sm text-muted-foreground">{habit.time}</p>
                                </div>
                                <Check className="text-green-500" />
                            </CardContent>
                        </Card>
                    </Link>
                ))}
            </div>
        )}
    </div>
  );
}
