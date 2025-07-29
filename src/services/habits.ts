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
    { text: "Wake up", time: "4:00 AM", iconName: 'Sunrise' },
    { text: "Make bed", time: "4:01 AM", iconName: 'Bed' },
    { text: "Brush teeth", time: "4:03 AM", iconName: 'Tooth' },
    { text: "Drink a glass of water", time: "4:06 AM", iconName: 'GlassWater' },
    { text: "Shower", time: "4:07 AM", iconName: 'ShowerHead' },
    { text: "Meditation (20 min)", time: "4:20 AM", iconName: 'BrainCircuit' },
    { text: "Warm up and pushups", time: "4:40 AM", iconName: 'Flame' },
    { text: "Coffee/Tea", time: "4:50 AM", iconName: 'Coffee' },
    { text: "Study session 1", time: "5:00 AM - 5:50 AM", iconName: 'BookOpen' },
    { text: "Break", time: "5:50 AM - 6:00 AM", iconName: 'Timer' },
    { text: "Study session 2", time: "6:00 AM - 6:50 AM", iconName: 'BookOpen' },
    { text: "Watch sunrise", time: "6:50 AM - 7:00 AM", iconName: 'Sun' },
    { text: "Breakfast & prepare for work", time: "7:00 AM - 8:00 AM", iconName: 'Utensils' },
    { text: "Study session 3", time: "8:00 AM - 8:50 AM", iconName: 'BookOpen' },
    { text: "Study session 4", time: "9:00 AM - 9:50 AM", iconName: 'BookOpen' },
    { text: "Study session 5", time: "10:00 AM - 10:50 AM", iconName: 'BookOpen' },
    { text: "Study session 6", time: "11:00 AM - 11:50 AM", iconName: 'BookOpen' },
    { text: "Break/Relax", time: "12:00 PM - 1:00 PM", iconName: 'Gamepad2' },
    { text: "Lunch", time: "1:00 PM - 2:00 PM", iconName: 'Pizza' },
    { text: "Study session 7", time: "2:00 PM - 2:50 PM", iconName: 'BookOpen' },
    { text: "Study session 8", time: "3:00 PM - 3:50 PM", iconName: 'BookOpen' },
    { text: "Study session 9", time: "4:00 PM - 4:50 PM", iconName: 'BookOpen' },
    { text: "Study session 10", time: "5:00 PM - 5:50 PM", iconName: 'BookOpen' },
    { text: "Watch sunset", time: "6:00 PM - 7:00 PM", iconName: 'Sunset' },
    { text: "Workout", time: "7:00 PM - 7:50 PM", iconName: 'Dumbbell' },
    { text: "Shower", time: "7:50 PM", iconName: 'ShowerHead' },
    { text: "Dinner & relax", time: "8:00 PM - 9:00 PM", iconName: 'Clapperboard' },
    { text: "Study session 11", time: "9:00 PM - 9:50 PM", iconName: 'BookOpen' },
    { text: "Go to bed", time: "9:50 PM", iconName: 'BedDouble' },
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
  
  // Custom sort to handle AM/PM and time ranges
  return habits.sort((a, b) => {
    const timeA = a.time.split(' ')[0];
    const timeB = b.time.split(' ')[0];
    
    const dateA = new Date(`1970-01-01 ${timeA}`);
    const dateB = new Date(`1970-01-01 ${timeB}`);

    if (a.time.includes('PM') && !a.time.startsWith('12')) dateA.setHours(dateA.getHours() + 12);
    if (b.time.includes('PM') && !b.time.startsWith('12')) dateB.setHours(dateB.getHours() + 12);
    if (a.time.includes('AM') && a.time.startsWith('12')) dateA.setHours(dateA.getHours() - 12);
    if (b.time.includes('AM') && b.time.startsWith('12')) dateB.setHours(dateB.getHours() - 12);

    return dateA.getTime() - dateB.getTime();
  });
};

export const updateHabit = async (habitId: string, completed: boolean) => {
  const habitRef = doc(db, 'habits', habitId);
  await updateDoc(habitRef, { completed });
};
