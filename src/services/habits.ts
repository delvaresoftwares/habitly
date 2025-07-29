import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, doc, updateDoc, addDoc, serverTimestamp, deleteDoc } from 'firebase/firestore';

export interface Habit {
  id: string;
  text: string;
  time: string;
  completed: boolean;
  iconName: string;
  userId: string;
  createdAt: any;
}

const initialHabits = [
  { text: "Wake up at 5:30 AM", time: "5:30 AM", iconName: 'Sun' },
  { text: "15 minutes of Mindfulness Meditation", time: "6:00 AM", iconName: 'Flame' },
  { text: "30-minute HIIT workout", time: "6:30 AM", iconName: 'Activity' },
  { text: "Read for 20 minutes", time: "7:15 AM", iconName: 'User' },
  { text: "Plan your day", time: "8:00 AM", iconName: 'Calendar' },
  { text: "Reflect and journal before bed", time: "10:00 PM", iconName: 'Moon' },
];


export const getUserHabits = async (userId: string): Promise<Habit[]> => {
  const habitsRef = collection(db, 'habits');
  const q = query(habitsRef, where('userId', '==', userId));
  const querySnapshot = await getDocs(q);

  if (querySnapshot.empty) {
    // Create initial habits for new user
    const batch = [];
    for (const habit of initialHabits) {
        const newHabit = {
            ...habit,
            userId,
            completed: false,
            createdAt: serverTimestamp()
        };
        batch.push(addDoc(habitsRef, newHabit));
    }
    await Promise.all(batch);
    return getUserHabits(userId); // Re-fetch after creation
  }
  
  const habits = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Habit));
  return habits.sort((a,b) => a.time.localeCompare(b.time));
};

export const updateHabit = async (habitId: string, completed: boolean) => {
  const habitRef = doc(db, 'habits', habitId);
  await updateDoc(habitRef, { completed });
};
