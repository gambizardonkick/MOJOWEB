import { initializeApp } from "firebase/app";
import { getDatabase, ref, onValue, off, type Database } from "firebase/database";
import type { LeaderboardEntry, LeaderboardSettings, Challenge, FreeSpinsOffer } from "@shared/schema";

const firebaseConfig = {
  apiKey: "AIzaSyDNSSsiMI-6jSMEkNv-l6HUHjhef89PAxM",
  authDomain: "mojo-80d6e.firebaseapp.com",
  databaseURL: "https://mojo-80d6e-default-rtdb.firebaseio.com",
  projectId: "mojo-80d6e",
  storageBucket: "mojo-80d6e.firebasestorage.app",
  messagingSenderId: "150961926057",
  appId: "1:150961926057:web:36be7e8970144082539eb8"
};

const app = initializeApp(firebaseConfig);
export const database = getDatabase(app);

// Helper function to normalize Firebase snapshots to arrays
function snapshotToArray<T>(snapshot: any): T[] {
  const items: T[] = [];
  snapshot.forEach((child: any) => {
    items.push({ id: child.key, ...child.val() } as T);
  });
  return items;
}

// Real-time listener for leaderboard entries
export function subscribeToLeaderboardEntries(
  callback: (entries: LeaderboardEntry[]) => void
): () => void {
  const entriesRef = ref(database, 'leaderboardEntries');
  
  const listener = (snapshot: any) => {
    const entries = snapshotToArray<LeaderboardEntry>(snapshot);
    // Sort by rank
    entries.sort((a, b) => (a.rank || 0) - (b.rank || 0));
    callback(entries);
  };
  
  const errorHandler = (error: Error) => {
    console.error('Firebase error fetching leaderboard entries:', error);
    callback([]);
  };
  
  onValue(entriesRef, listener, errorHandler);
  
  // Return unsubscribe function
  return () => off(entriesRef, 'value', listener);
}

// Real-time listener for leaderboard settings
export function subscribeToLeaderboardSettings(
  callback: (settings: LeaderboardSettings | null) => void
): () => void {
  const settingsRef = ref(database, 'leaderboardSettings');
  
  const listener = (snapshot: any) => {
    let settings: LeaderboardSettings | null = null;
    snapshot.forEach((child: any) => {
      settings = { id: child.key, ...child.val() } as LeaderboardSettings;
      return true; // Stop after first item
    });
    callback(settings);
  };
  
  const errorHandler = (error: Error) => {
    console.error('Firebase error fetching leaderboard settings:', error);
    callback(null);
  };
  
  onValue(settingsRef, listener, errorHandler);
  
  return () => off(settingsRef, 'value', listener);
}

// Real-time listener for challenges
export function subscribeToChallenges(
  callback: (challenges: Challenge[]) => void
): () => void {
  const challengesRef = ref(database, 'challenges');
  
  const listener = (snapshot: any) => {
    const challenges = snapshotToArray<Challenge>(snapshot);
    // Sort by creation date (newest first)
    challenges.sort((a, b) => {
      const dateA = new Date(a.createdAt || 0).getTime();
      const dateB = new Date(b.createdAt || 0).getTime();
      return dateB - dateA;
    });
    callback(challenges);
  };
  
  const errorHandler = (error: Error) => {
    console.error('Firebase error fetching challenges:', error);
    callback([]);
  };
  
  onValue(challengesRef, listener, errorHandler);
  
  return () => off(challengesRef, 'value', listener);
}

// Real-time listener for free spins offers
export function subscribeToFreeSpinsOffers(
  callback: (offers: FreeSpinsOffer[]) => void
): () => void {
  const offersRef = ref(database, 'freeSpinsOffers');
  
  const listener = (snapshot: any) => {
    const offers = snapshotToArray<FreeSpinsOffer>(snapshot);
    // Sort by creation date (newest first)
    offers.sort((a, b) => {
      const dateA = new Date(a.createdAt || 0).getTime();
      const dateB = new Date(b.createdAt || 0).getTime();
      return dateB - dateA;
    });
    callback(offers);
  };
  
  const errorHandler = (error: Error) => {
    console.error('Firebase error fetching free spins offers:', error);
    callback([]);
  };
  
  onValue(offersRef, listener, errorHandler);
  
  return () => off(offersRef, 'value', listener);
}
