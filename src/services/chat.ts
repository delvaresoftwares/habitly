
import { db } from '@/lib/firebase';
import { collection, query, orderBy, onSnapshot, addDoc, serverTimestamp, Timestamp } from 'firebase/firestore';

export interface ChatMessage {
    id: string;
    text: string;
    timestamp: Timestamp;
    userId: string;
    userName: string;
    userPhotoURL: string | null;
}

export const listenForMessages = (callback: (messages: ChatMessage[]) => void) => {
    const messagesRef = collection(db, 'chat');
    const q = query(messagesRef, orderBy('timestamp', 'asc'));

    return onSnapshot(q, (snapshot) => {
        const messages = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        } as ChatMessage));
        callback(messages);
    });
};

export const sendMessage = async (userId: string, userName: string, userPhotoURL: string | null, text: string) => {
    if (!text.trim()) return;

    const messagesRef = collection(db, 'chat');
    await addDoc(messagesRef, {
        userId,
        userName,
        userPhotoURL,
        text,
        timestamp: serverTimestamp(),
    });
};
