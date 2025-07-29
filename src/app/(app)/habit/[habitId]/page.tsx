
"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { getHabitById, getHabitHistory, Habit, HabitHistory } from '@/services/habits';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export default function HabitDetailPage({ params }: { params: { habitId: string } }) {
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();
    const [habit, setHabit] = useState<Habit | null>(null);
    const [history, setHistory] = useState<HabitHistory>({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user && params.habitId) {
            Promise.all([
                getHabitById(user.uid, params.habitId as string),
                getHabitHistory(user.uid, params.habitId as string)
            ]).then(([habitData, historyData]) => {
                setHabit(habitData);
                setHistory(historyData);
                setLoading(false);
            });
        }
    }, [user, params.habitId]);

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
    
    return (
        <div className="p-4 md:p-8 space-y-4">
             <Button variant="ghost" onClick={() => router.back()} className="mb-4">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Dashboard
            </Button>
            <Card>
                <CardHeader>
                    <CardTitle className="font-headline text-3xl">{habit.text}</CardTitle>
                    <CardDescription>{habit.time}</CardDescription>
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
