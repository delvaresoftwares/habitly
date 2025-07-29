
"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getAllUsers, type UserProfile } from '@/services/users';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/hooks/use-auth';
import { Flame, Trophy } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function LeaderboardPage() {
    const [users, setUsers] = useState<UserProfile[]>([]);
    const [loading, setLoading] = useState(true);
    const { user: currentUser } = useAuth();

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
                     <div className="flex items-center gap-4">
                        <Skeleton className="h-6 w-16" />
                        <Skeleton className="h-6 w-16" />
                    </div>
                </Card>
            ))}
        </div>
    );
    
    if (!currentUser) {
        return null; // Layout handles loading states
    }

    return (
        <div className="p-4 md:p-8">
            <Card className="shadow-lg">
                <CardHeader>
                    <CardTitle className="font-headline text-3xl">Leaderboard</CardTitle>
                </CardHeader>
                <CardContent>
                    {loading ? <LeaderboardSkeleton /> : (
                        <ul className="space-y-4">
                            {users.map((user, index) => (
                                <li key={user.uid}>
                                    <Link href={`/profile/${user.uid}`}>
                                        <Card className={cn(
                                            "flex items-center justify-between p-3 sm:p-4 transition-all duration-300 hover:bg-muted",
                                            currentUser?.uid === user.uid ? 'border-primary ring-2 ring-primary' : ''
                                        )}>
                                            <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
                                                <span className="text-base sm:text-lg font-bold w-6 text-center text-muted-foreground">{index + 1}</span>
                                                <Avatar className="h-10 w-10 sm:h-12 sm:w-12">
                                                    <AvatarImage src={user.photoURL ?? undefined} alt={user.displayName} />
                                                    <AvatarFallback>{user.displayName.charAt(0)}</AvatarFallback>
                                                </Avatar>
                                                <div className="flex-1 min-w-0">
                                                    <p className="font-semibold truncate">{user.displayName}</p>
                                                    <p className="text-xs sm:text-sm text-muted-foreground truncate">{user.email}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3 sm:gap-6 text-base">
                                                <div className="flex items-center gap-1.5" title="Streak">
                                                    <Flame className="text-orange-400 h-5 w-5" />
                                                    <span className="font-bold">{user.streak}</span>
                                                </div>
                                                <div className="flex items-center gap-1.5" title="Habit Score">
                                                    <Trophy className="text-yellow-400 h-5 w-5" />
                                                    <span className="font-bold">{user.habitScore}</span>
                                                </div>
                                            </div>
                                        </Card>
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
