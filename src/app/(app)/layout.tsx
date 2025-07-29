
"use client";

import { useAuth } from "@/hooks/use-auth";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";
import { Card } from "@/components/ui/card";
import Link from "next/link";
import { Home, Trophy, User, LogOut } from "lucide-react";
import { RhythmFlowLogo } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const AppLayout = ({ children }: { children: React.ReactNode }) => {
    const { user, loading, signOut } = useAuth();
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        if (!loading && !user) {
            router.push("/login");
        }
    }, [user, loading, router]);

    if (loading || !user) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <p>Loading...</p>
            </div>
        );
    }
    
    const navItems = [
        { href: "/dashboard", icon: Home, label: "Home" },
        { href: "/leaderboard", icon: Trophy, label: "Leaderboard" },
        { href: "/profile", icon: User, label: "Profile" },
    ];

    return (
        <div className="flex flex-col min-h-screen w-full bg-background md:flex-row">
            {/* Desktop Sidebar */}
            <aside className="hidden md:flex md:flex-col md:w-64 md:border-r">
                <div className="flex items-center gap-2 p-4 border-b">
                    <RhythmFlowLogo className="h-8 w-8 text-primary" />
                    <h1 className="font-headline text-2xl font-bold tracking-tighter text-foreground">
                        RhythmFlow
                    </h1>
                </div>
                <nav className="flex-1 p-4 space-y-2">
                    {navItems.map((item) => (
                        <Button
                            key={item.href}
                            variant={pathname === item.href ? "secondary" : "ghost"}
                            className="w-full justify-start gap-2"
                            asChild
                        >
                            <Link href={item.href}>
                                <item.icon className="h-5 w-5" />
                                {item.label}
                            </Link>
                        </Button>
                    ))}
                </nav>
                <div className="p-4 border-t">
                    <Button variant="ghost" className="w-full justify-start gap-2" onClick={signOut}>
                        <LogOut className="h-5 w-5" />
                        Logout
                    </Button>
                </div>
            </aside>
            
            <div className="flex flex-col flex-1">
                <main className="flex-1 pb-20 md:pb-0 overflow-y-auto">
                    {children}
                </main>

                {/* Mobile Bottom Navigation */}
                <Card className="fixed bottom-0 left-0 right-0 z-50 rounded-t-2xl border-t md:hidden">
                    <nav className="grid grid-cols-3 items-center justify-center p-2">
                        {navItems.map((item) => (
                            <Link key={item.href} href={item.href} className="flex flex-col items-center justify-center gap-1 p-2 rounded-lg">
                               <item.icon className={cn("h-6 w-6 transition-colors", pathname.startsWith(item.href) ? "text-primary" : "text-muted-foreground")} />
                               <span className={cn("text-xs font-medium transition-colors", pathname.startsWith(item.href) ? "text-primary" : "text-muted-foreground")}>
                                   {item.label}
                               </span>
                            </Link>
                        ))}
                    </nav>
                </Card>
            </div>
        </div>
    );
}

export default AppLayout;
