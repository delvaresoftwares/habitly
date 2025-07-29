
"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getAllUsers, type UserProfile } from '@/services/users';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { RhythmFlowLogo } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { LogOut, User } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { Flame, Trophy } from 'lucide-react';

export default function LeaderboardPage() {
    const [users, setUsers] = useState<UserProfile[]>([]);
    const [loading, setLoading] = useState(true);
    const { user: currentUser, signOut } = useAuth();

    useEffect(() => {
        getAllUsers().then(data => {
            setUsers(data);
            setLoading(false);
        });
    }, []);

    const LeaderboardSkeleton = () => (
        <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
                 <Card key={i} className="flex items-center justify-between p-4">
                    <div className="flex items-center gap-4">
                        <Skeleton className="h-6 w-6" />
                        <Skeleton className="h-12 w-12 rounded-full" />
                        <div className="space-y-2">
                           <Skeleton className="h-4 w-32" />
                           <Skeleton className="h-3 w-24" />
                        </div>
                    </div>
                     <div className="flex items-center gap-8">
                        <Skeleton className="h-6 w-16" />
                        <Skeleton className="h-6 w-16" />
                    </div>
                </Card>
            ))}
        </div>
    );

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
                     {currentUser && (
                         <>
                            <Button variant="ghost" asChild>
                                <Link href="/profile"><User /> <span className="hidden sm:inline ml-2">Profile</span></Link>
                            </Button>
                            <Button variant="ghost" onClick={signOut}><LogOut /> <span className="hidden sm:inline ml-2">Logout</span></Button>
                         </>
                     )}
                </div>
            </header>
            <main className="flex-1 overflow-auto p-4 md:p-8">
                <div className="mx-auto max-w-4xl">
                    <Card className="shadow-lg">
                        <CardHeader>
                            <CardTitle className="font-headline text-3xl">Leaderboard</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {loading ? <LeaderboardSkeleton /> : (
                                <ul className="space-y-4">
                                    {users.map((user, index) => (
                                        <li key={user.uid}>
                                            <Card className={`flex items-center justify-between p-4 transition-all duration-300 ${currentUser?.uid === user.uid ? 'border-primary ring-2 ring-primary' : ''}`}>
                                                <div className="flex items-center gap-4">
                                                    <span className="text-lg font-bold w-6 text-center text-muted-foreground">{index + 1}</span>
                                                    <Avatar className="h-12 w-12">
                                                        <AvatarImage src={user.photoURL ?? undefined} alt={user.displayName} />
                                                        <AvatarFallback>{user.displayName.charAt(0)}</AvatarFallback>
                                                    </Avatar>
                                                    <div>
                                                        <p className="font-semibold">{user.displayName}</p>
                                                        <p className="text-sm text-muted-foreground">{user.email}</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-8 text-lg">
                                                    <div className="flex items-center gap-2" title="Streak">
                                                       <Flame className="text-orange-400" />
                                                       <span className="font-bold">{user.streak}</span>
                                                    </div>
                                                    <div className="flex items-center gap-2" title="Habit Score">
                                                       <Trophy className="text-yellow-400" />
                                                       <span className="font-bold">{user.habitScore}</span>
                                                    </div>
                                                </div>
                                            </Card>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </main>
        </div>
    );
}
