import { db, storage } from '@/lib/firebase';
import { collection, doc, getDoc, setDoc, updateDoc, getDocs, query, orderBy, Timestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { User } from 'firebase/auth';

export interface UserProfile {
  uid: string;
  displayName: string;
  email: string;
  photoURL: string | null;
  streak: number;
  habitScore: number;
  lastLogin: Timestamp;
}

export const createUserProfile = async (user: User) => {
    const userRef = doc(db, 'users', user.uid);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
        const { uid, displayName, email, photoURL } = user;
        await setDoc(userRef, {
            uid,
            displayName: displayName ?? 'Anonymous',
            email,
            photoURL: photoURL ?? null,
            streak: 0,
            habitScore: 0,
            lastLogin: Timestamp.now()
        });
    } else {
        await updateDoc(userRef, {
            lastLogin: Timestamp.now()
        });
    }
};

export const getUserProfile = async (userId: string): Promise<UserProfile | null> => {
    const userRef = doc(db, 'users', userId);
    const userSnap = await getDoc(userRef);

    if (userSnap.exists()) {
        return userSnap.data() as UserProfile;
    }
    return null;
}

export const updateUserProfile = async (userId: string, data: { displayName?: string, photoURL?: string }) => {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, data);
}

export const uploadProfilePhoto = async (userId: string, file: File): Promise<string> => {
    const storageRef = ref(storage, `profile-photos/${userId}/${file.name}`);
    await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(storageRef);
    return downloadURL;
}

export const updateUserScores = async (userId: string, scores: { streak: number, habitScore: number }) => {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, scores);
}

export const getAllUsers = async (): Promise<UserProfile[]> => {
    const usersRef = collection(db, 'users');
    const q = query(usersRef, orderBy('habitScore', 'desc'));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => doc.data() as UserProfile);
}
