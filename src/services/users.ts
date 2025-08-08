
import { db, storage } from '@/lib/firebase';
import { collection, doc, getDoc, setDoc, updateDoc, getDocs, query, orderBy, Timestamp, collectionGroup, where } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { User } from 'firebase/auth';
import { format, subMonths, startOfMonth } from 'date-fns';
import { Habit, getUserHabits } from './habits';

export interface UserProfile {
  uid: string;
  displayName: string;
  email: string;
  photoURL: string | null;
  streak: number;
  habitScore: number;
  lastLogin: Timestamp;
  dailyProgress?: number;
  totalHabits?: number;
}

export interface PublicUserProfileData {
    profile: UserProfile;
    habits: Habit[];
    chartData: { month: string; habits: number }[];
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
        // This will create the initial habits for the new user
        await getUserHabits(user.uid);
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
    const users = querySnapshot.docs.map(doc => doc.data() as UserProfile);

    // Fetch daily progress for each user
    const progressPromises = users.map(async (user) => {
        const userHabits = await getUserHabits(user.uid);
        const completedToday = userHabits.filter(h => h.completedToday).length;
        return {
            ...user,
            dailyProgress: completedToday,
            totalHabits: userHabits.length,
        };
    });

    return Promise.all(progressPromises);
}

export const getMonthlyCompletionData = async (userId: string): Promise<{ month: string; habits: number }[]> => {
    const months = [];
    const today = new Date();
    for (let i = 5; i >= 0; i--) {
        months.push(startOfMonth(subMonths(today, i)));
    }

    const historyRef = collection(db, 'users', userId, 'habitHistory');
    const monthlyData: { [key: string]: number } = {};

    // Initialize months
    for (const monthDate of months) {
        const monthKey = format(monthDate, 'yyyy-MM');
        monthlyData[monthKey] = 0;
    }
    
    const sixMonthsAgo = format(months[0], 'yyyy-MM-dd');

    const q = query(historyRef, where('date', '>=', sixMonthsAgo), where('completed', '==', true));
    const querySnapshot = await getDocs(q);

    querySnapshot.forEach(doc => {
        const data = doc.data();
        // Ensure date is treated correctly
        const date = new Date(data.date + 'T00:00:00'); // Assume UTC date
        const monthKey = format(date, 'yyyy-MM');
        if (monthlyData.hasOwnProperty(monthKey)) {
            monthlyData[monthKey]++;
        }
    });

    return months.map(monthDate => {
        const monthKey = format(monthDate, 'yyyy-MM');
        const monthName = format(monthDate, 'MMM');
        return {
            month: monthName,
            habits: monthlyData[monthKey]
        };
    });
};

export const getPublicUserProfileData = async (userId: string): Promise<PublicUserProfileData | null> => {
    const [profile, habits, chartData] = await Promise.all([
        getUserProfile(userId),
        getUserHabits(userId),
        getMonthlyCompletionData(userId)
    ]);

    if (!profile) {
        return null;
    }

    return {
        profile,
        habits,
        chartData
    };
};
