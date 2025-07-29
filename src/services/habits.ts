
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, doc, updateDoc, addDoc, serverTimestamp, orderBy, writeBatch } from 'firebase/firestore';

export interface Habit {
  id: string;
  text: string;
  time: string;
  completed: boolean;
  iconName: string;
  userId: string;
  createdAt: any;
  order: number;
}

const initialHabits = [
    { text: "Wake up", time: "4:00 AM", iconName: 'Sunrise', order: 1 },
    { text: "Make bed", time: "4:01 AM", iconName: 'Bed', order: 2 },
    { text: "Brush teeth", time: "4:03 AM", iconName: 'Tooth', order: 3 },
    { text: "Drink a glass of water", time: "4:06 AM", iconName: 'GlassWater', order: 4 },
    { text: "Shower", time: "4:07 AM", iconName: 'ShowerHead', order: 5 },
    { text: "Meditation (20 min)", time: "4:20 AM", iconName: 'BrainCircuit', order: 6 },
    { text: "Warm up and pushups", time: "4:40 AM", iconName: 'Flame', order: 7 },
    { text: "Coffee/Tea", time: "4:50 AM", iconName: 'Coffee', order: 8 },
    { text: "Study session 1", time: "5:00 AM - 5:50 AM", iconName: 'BookOpen', order: 9 },
    { text: "Break", time: "5:50 AM - 6:00 AM", iconName: 'Timer', order: 10 },
    { text: "Study session 2", time: "6:00 AM - 6:50 AM", iconName: 'BookOpen', order: 11 },
    { text: "Watch sunrise", time: "6:50 AM - 7:00 AM", iconName: 'Sun', order: 12 },
    { text: "Breakfast & prepare for work", time: "7:00 AM - 8:00 AM", iconName: 'Utensils', order: 13 },
    { text: "Study session 3", time: "8:00 AM - 8:50 AM", iconName: 'BookOpen', order: 14 },
    { text: "Study session 4", time: "9:00 AM - 9:50 AM", iconName: 'BookOpen', order: 15 },
    { text: "Study session 5", time: "10:00 AM - 10:50 AM", iconName: 'BookOpen', order: 16 },
    { text: "Study session 6", time: "11:00 AM - 11:50 AM", iconName: 'BookOpen', order: 17 },
    { text: "Break/Relax", time: "12:00 PM - 1:00 PM", iconName: 'Gamepad2', order: 18 },
    { text: "Lunch", time: "1:00 PM - 2:00 PM", iconName: 'Pizza', order: 19 },
    { text: "Study session 7", time: "2:00 PM - 2:50 PM", iconName: 'BookOpen', order: 20 },
    { text: "Study session 8", time: "3:00 PM - 3:50 PM", iconName: 'BookOpen', order: 21 },
    { text: "Study session 9", time: "4:00 PM - 4:50 PM", iconName: 'BookOpen', order: 22 },
    { text: "Study session 10", time: "5:00 PM - 5:50 PM", iconName: 'BookOpen', order: 23 },
    { text: "Watch sunset", time: "6:00 PM - 7:00 PM", iconName: 'Sunset', order: 24 },
    { text: "Workout", time: "7:00 PM - 7:50 PM", iconName: 'Dumbbell', order: 25 },
    { text: "Shower", time: "7:50 PM", iconName: 'ShowerHead', order: 26 },
    { text: "Dinner & relax", time: "8:00 PM - 9:00 PM", iconName: 'Clapperboard', order: 27 },
    { text: "Study session 11", time: "9:00 PM - 9:50 PM", iconName: 'BookOpen', order: 28 },
    { text: "Go to bed", time: "9:50 PM", iconName: 'BedDouble', order: 29 },
];


export const getUserHabits = async (userId: string): Promise<Habit[]> => {
  const habitsRef = collection(db, 'habits');
  const q = query(habitsRef, where('userId', '==', userId), orderBy('order', 'asc'));
  const querySnapshot = await getDocs(q);

  if (querySnapshot.empty) {
    // Create initial habits for new user using a batch write
    const batch = writeBatch(db);
    for (const habit of initialHabits) {
        const newHabitRef = doc(collection(db, 'habits'));
        const newHabit = {
            ...habit,
            userId,
            completed: false,
            createdAt: serverTimestamp()
        };
        batch.set(newHabitRef, newHabit);
    }
    await batch.commit();

    // Fetch the newly created habits to return them
    const newSnapshot = await getDocs(q);
    return newSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Habit));
  }
  
  const habits = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Habit));
  return habits;
};

export const updateHabit = async (habitId: string, completed: boolean) => {
  const habitRef = doc(db, 'habits', habitId);
  await updateDoc(habitRef, { completed });
};

    