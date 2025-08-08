
"use client";

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { getHabitById, getHabitHistory, Habit, HabitHistory, updateHabit, getHabitOwner } from '@/services/habits';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, Edit, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';


export default function HabitDetailPage({ params }: { params: { habitId: string } }) {
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();
    const { toast } = useToast();
    const [habit, setHabit] = useState<Habit | null>(null);
    const [ownerId, setOwnerId] = useState<string | null>(null);
    const [history, setHistory] = useState<HabitHistory>({});
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [newTime, setNewTime] = useState("");
    
    useEffect(() => {
        if (params.habitId) {
            getHabitOwner(params.habitId as string).then(ownerUid => {
                setOwnerId(ownerUid);
                if (ownerUid) {
                    Promise.all([
                        getHabitById(ownerUid, params.habitId as string),
                        getHabitHistory(ownerUid, params.habitId as string)
                    ]).then(([habitData, historyData]) => {
                        setHabit(habitData);
                        if (habitData) {
                            setNewTime(habitData.time);
                        }
                        setHistory(historyData);
                        setLoading(false);
                    });
                } else {
                    setLoading(false);
                }
            });
        }
    }, [params.habitId]);

    const handleSaveTime = async () => {
        if (!user || !habit || !ownerId) return;
        if (user.uid !== ownerId) return;

        try {
            await updateHabit(user.uid, habit.id, { time: newTime });
            setHabit({ ...habit, time: newTime });
            setIsEditing(false);
            toast({ title: "Success", description: "Habit time updated." });
        } catch (error: any) {
            toast({ title: "Error", description: "Failed to update time.", variant: "destructive" });
        }
    };

    if (authLoading || loading) {
        return (
            <div className="p-4 md:p-8 space-y-4">
                <Skeleton className="h-10 w-24" />
                <Skeleton className="h-32 w-full" />
                <Skeleton className="h-96 w-full" />
            </div>
        );
    }

    if (!habit) {
        return <div>Habit not found.</div>;
    }

    const canEdit = user?.uid === ownerId;
    
    return (
        <div className="p-4 md:p-8 space-y-4">
             <Button variant="ghost" onClick={() => router.back()} className="mb-4">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
            </Button>
            <Card>
                <CardHeader>
                    <CardTitle className="font-headline text-3xl">{habit.text}</CardTitle>
                     <div className="flex items-center gap-4">
                        {isEditing ? (
                            <Input 
                                value={newTime}
                                onChange={(e) => setNewTime(e.target.value)}
                                className="max-w-xs"
                            />
                        ) : (
                            <CardDescription>{habit.time}</CardDescription>
                        )}
                         {canEdit && (
                            isEditing ? (
                                <Button size="icon" onClick={handleSaveTime}><Save className="h-4 w-4" /></Button>
                            ) : (
                                <Button size="icon" variant="ghost" onClick={() => setIsEditing(true)}><Edit className="h-4 w-4" /></Button>
                            )
                        )}
                    </div>
                </CardHeader>
                <CardContent>
                    <p className="text-lg">{habit.description}</p>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Completion History</CardTitle>
                </CardHeader>
                <CardContent className="flex justify-center">
                    <Calendar
                        numberOfMonths={1}
                        mode="multiple"
                        selected={Object.keys(history).map(dateStr => new Date(dateStr))}
                        modifiers={{
                            completed: (date) => history[date.toISOString().split('T')[0]] === 'completed',
                            skipped: (date) => history[date.toISOString().split('T')[0]] === 'skipped',
                        }}
                        modifiersClassNames={{
                            completed: 'bg-green-500/50 text-white rounded-md',
                            skipped: 'bg-red-500/50 text-white rounded-md',
                        }}
                        className="p-0"
                    />
                </CardContent>
            </Card>
        </div>
    );
}
