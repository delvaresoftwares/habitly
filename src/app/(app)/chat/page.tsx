
"use client";

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { listenForMessages, sendMessage, type ChatMessage } from '@/services/chat';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Send } from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

export default function ChatPage() {
    const { user } = useAuth();
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const messagesEndRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        const unsubscribe = listenForMessages((loadedMessages) => {
            setMessages(loadedMessages);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (user && newMessage.trim()) {
            await sendMessage(user.uid, user.displayName || 'Anonymous', user.photoURL, newMessage);
            setNewMessage('');
        }
    };
    
    const ChatSkeleton = () => (
        <div className="space-y-4 p-4">
            {[...Array(8)].map((_, i) => (
                <div key={i} className={cn("flex items-start gap-3", i % 2 !== 0 && "justify-end")}>
                   {i % 2 === 0 && <Skeleton className="h-10 w-10 rounded-full" />}
                    <div className={cn("flex flex-col gap-1", i % 2 !== 0 && "items-end")}>
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-8 w-48" />
                    </div>
                   {i % 2 !== 0 && <Skeleton className="h-10 w-10 rounded-full" />}
                </div>
            ))}
        </div>
    );

    return (
        <div className="flex flex-col h-full max-h-[calc(100vh-80px)] md:max-h-screen">
             <CardHeader className="flex-shrink-0">
                <CardTitle className="font-headline text-3xl">Community Chat</CardTitle>
            </CardHeader>
            <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
                {loading ? <ChatSkeleton /> : messages.map((msg) => (
                    <div
                        key={msg.id}
                        className={cn(
                            'flex items-end gap-3 max-w-[80%]',
                            msg.userId === user?.uid ? 'ml-auto flex-row-reverse' : 'mr-auto'
                        )}
                    >
                        <Avatar className="h-8 w-8">
                            <AvatarImage src={msg.userPhotoURL ?? undefined} alt={msg.userName} />
                            <AvatarFallback>{msg.userName.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div
                            className={cn(
                                'rounded-lg px-4 py-2',
                                msg.userId === user?.uid
                                    ? 'bg-primary text-primary-foreground'
                                    : 'bg-muted'
                            )}
                        >
                            <p className="text-sm font-semibold">{msg.userId === user?.uid ? 'You' : msg.userName}</p>
                            <p className="text-base">{msg.text}</p>
                            <p className="text-xs opacity-70 mt-1">
                                {msg.timestamp ? format(msg.timestamp.toDate(), 'p') : 'sending...'}
                            </p>
                        </div>
                    </div>
                ))}
                 <div ref={messagesEndRef} />
            </CardContent>
            <div className="p-4 border-t bg-background flex-shrink-0">
                <form onSubmit={handleSendMessage} className="flex items-center gap-2">
                    <Input
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Type a message..."
                        autoComplete="off"
                    />
                    <Button type="submit" size="icon" disabled={!newMessage.trim()}>
                        <Send className="h-4 w-4" />
                        <span className="sr-only">Send</span>
                    </Button>
                </form>
            </div>
        </div>
    );
}

