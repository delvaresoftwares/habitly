
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, doc, updateDoc, serverTimestamp, writeBatch, orderBy, getDoc, setDoc, Timestamp } from 'firebase/firestore';

export interface Habit {
  id: string;
  text: string;
  time: string;
  description: string;
  completedToday: boolean;
  iconName: string;
  userId: string;
  order: number;
}

export interface HabitHistory {
    [date: string]: 'completed' | 'skipped';
}

const initialHabits = [
    { text: "Wake up", time: "4:00 AM", iconName: 'Sunrise', order: 1, description: "Start your day early to maximize productivity and enjoy the quiet morning hours." },
    { text: "Make bed", time: "4:01 AM", iconName: 'Bed', order: 2, description: "A simple task to start your day with a sense of accomplishment." },
    { text: "Brush teeth", time: "4:03 AM", iconName: 'Tooth', order: 3, description: "Maintain oral hygiene for a fresh start." },
    { text: "Drink a glass of water", time: "4:06 AM", iconName: 'GlassWater', order: 4, description: "Hydrate your body after a long night's sleep." },
    { text: "Shower", time: "4:07 AM", iconName: 'ShowerHead', order: 5, description: "Freshen up and get ready for the day ahead." },
    { text: "Meditation (20 min)", time: "4:20 AM", iconName: 'BrainCircuit', order: 6, description: "Clear your mind, reduce stress, and improve focus." },
    { text: "Warm up and pushups", time: "4:40 AM", iconName: 'Flame', order: 7, description: "Get your blood flowing and build strength." },
    { text: "Coffee/Tea", time: "4:50 AM", iconName: 'Coffee', order: 8, description: "Enjoy a warm beverage to kickstart your morning." },
    { text: "Study session 1", time: "5:00 AM - 5:50 AM", iconName: 'BookOpen', order: 9, description: "First focused study block of the day." },
    { text: "Break", time: "5:50 AM - 6:00 AM", iconName: 'Timer', order: 10, description: "A short break to recharge before the next session." },
    { text: "Study session 2", time: "6:00 AM - 6:50 AM", iconName: 'BookOpen', order: 11, description: "Continue your learning journey with another focused session." },
    { text: "Watch sunrise", time: "6:50 AM - 7:00 AM", iconName: 'Sun', order: 12, description: "Take a moment to appreciate the beauty of a new day." },
    { text: "Breakfast & prepare for work", time: "7:00 AM - 8:00 AM", iconName: 'Utensils', order: 13, description: "Fuel your body and mind for the tasks ahead." },
    { text: "Study session 3", time: "8:00 AM - 8:50 AM", iconName: 'BookOpen', order: 14, description: "Dive back into your studies with renewed energy." },
    { text: "Study session 4", time: "9:00 AM - 9:50 AM", iconName: 'BookOpen', order: 15, description: "Consistency is key. Keep up the great work." },
    { text: "Study session 5", time: "10:00 AM - 10:50 AM", iconName: 'BookOpen', order: 16, description: "Another block of focused learning." },
    { text: "Study session 6", time: "11:00 AM - 11:50 AM", iconName: 'BookOpen', order: 17, description: "Push through the morning with a final study session before lunch." },
    { text: "Break/Relax", time: "12:00 PM - 1:00 PM", iconName: 'Gamepad2', order: 18, description: "Take a well-deserved break to relax and recharge." },
    { text: "Lunch", time: "1:00 PM - 2:00 PM", iconName: 'Pizza', order: 19, description: "Enjoy a nutritious meal to refuel your body." },
    { text: "Study session 7", time: "2:00 PM - 2:50 PM", iconName: 'BookOpen', order: 20, description: "Get back to your studies with a fresh perspective." },
    { text: "Study session 8", time: "3:00 PM - 3:50 PM", iconName: 'BookOpen', order: 21, description: "Stay focused and keep making progress." },
    { text: "Study session 9", time: "4:00 PM - 4:50 PM", iconName: 'BookOpen', order: 22, description: "The afternoon push. You're doing great." },
    { text: "Study session 10", time: "5:00 PM - 5:50 PM", iconName: 'BookOpen', order: 23, description: "Final study block for the afternoon." },
    { text: "Watch sunset", time: "6:00 PM - 7:00 PM", iconName: 'Sunset', order: 24, description: "Reflect on your day and enjoy the evening sky." },
    { text: "Workout", time: "7:00 PM - 7:50 PM", iconName: 'Dumbbell', order: 25, description: "Physical activity to de-stress and stay healthy." },
    { text: "Shower", time: "7:50 PM", iconName: 'ShowerHead', order: 26, description: "Wash away the day's efforts and relax." },
    { text: "Dinner & relax", time: "8:00 PM - 9:00 PM", iconName: 'Clapperboard', order: 27, description: "Enjoy your evening meal and unwind." },
    { text: "Study session 11", time: "9:00 PM - 9:50 PM", iconName: 'BookOpen', order: 28, description: "One last session to wrap up your learning for the day." },
    { text: "Go to bed", time: "9:50 PM", iconName: 'BedDouble', order: 29, description: "Get a good night's rest to prepare for tomorrow." },
];

// Helper to get the start of the day for a given date
const getStartOfDay = (date: Date) => {
  const start = new Date(date);
  start.setHours(0, 0, 0, 0);
  return start;
};

export const getUserHabits = async (userId: string): Promise<Habit[]> => {
  const habitsRef = collection(db, 'users', userId, 'habits');
  const q = query(habitsRef, orderBy('order', 'asc'));
  const querySnapshot = await getDocs(q);

  // Check if today's completion status needs to be reset
  const today = getStartOfDay(new Date());
  const userStateRef = doc(db, 'users', userId, 'state', 'daily');
  const userStateSnap = await getDoc(userStateRef);
  const lastReset = userStateSnap.exists() ? (userStateSnap.data().lastReset as Timestamp).toDate() : new Date(0);
  
  let habits: Habit[] = [];

  const createInitialHabits = async () => {
    const batch = writeBatch(db);
    for (const habit of initialHabits) {
        const newHabitRef = doc(habitsRef);
        const newHabit = {
            ...habit,
            userId,
            id: newHabitRef.id,
        };
        batch.set(newHabitRef, newHabit);
    }
    await batch.commit();
    const newSnapshot = await getDocs(q);
    return newSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Habit));
  };
  
  if (querySnapshot.empty) {
    habits = await createInitialHabits();
  } else {
    habits = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Habit));
  }
  
  // If last reset was before today, reset all habit completion statuses
  if (getStartOfDay(lastReset) < today) {
    const batch = writeBatch(db);
    const historyRef = collection(db, 'users', userId, 'habitHistory');
    
    // Reset all completion statuses for today
    const todayStr = today.toISOString().split('T')[0];
    const qHistory = query(historyRef, where('date', '==', todayStr));
    const historySnapshot = await getDocs(qHistory);
    
    historySnapshot.forEach(historyDoc => {
        batch.delete(historyDoc.ref);
    });

    batch.set(userStateRef, { lastReset: Timestamp.fromDate(today) });
    await batch.commit();
    
    // Return habits with completedToday as false
    return habits.map(h => ({ ...h, completedToday: false }));
  }

  // Fetch today's completion status
  const todayStr = today.toISOString().split('T')[0];
  const habitHistory: Record<string, boolean> = {};
  const qHistory = query(collection(db, 'users', userId, 'habitHistory'), where('date', '==', todayStr));
  const historySnapshot = await getDocs(qHistory);
  historySnapshot.forEach(doc => {
      habitHistory[doc.data().habitId] = doc.data().completed;
  });

  return habits.map(h => ({...h, completedToday: habitHistory[h.id] ?? false}));
};

export const updateHabitCompletion = async (userId: string, habitId: string, completed: boolean) => {
    const today = getStartOfDay(new Date()).toISOString().split('T')[0];
    const historyId = `${habitId}_${today}`;
    const historyRef = doc(db, 'users', userId, 'habitHistory', historyId);
    await setDoc(historyRef, { habitId, date: today, completed });
};

export const getHabitById = async (userId: string, habitId: string): Promise<Habit | null> => {
    const habitRef = doc(db, 'users', userId, 'habits', habitId);
    const docSnap = await getDoc(habitRef);
    if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() } as Habit;
    }
    return null;
}

export const getHabitHistory = async (userId: string, habitId: string): Promise<HabitHistory> => {
    const historyCol = collection(db, 'users', userId, 'habitHistory');
    const q = query(historyCol, where('habitId', '==', habitId));
    const querySnapshot = await getDocs(q);

    const history: HabitHistory = {};
    querySnapshot.forEach(doc => {
        const data = doc.data();
        history[data.date] = data.completed ? 'completed' : 'skipped';
    });
    return history;
};
