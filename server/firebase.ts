import { initializeApp, cert, getApps, type ServiceAccount } from 'firebase-admin/app';
import { getDatabase } from 'firebase-admin/database';
import type { Database } from 'firebase-admin/database';

let db: Database | null = null;
let isInitialized = false;

const DATABASE_URL = "https://mojo-80d6e-default-rtdb.firebaseio.com";

export function initializeFirebase() {
  if (getApps().length === 0) {
    const serviceAccountKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
    
    if (!serviceAccountKey) {
      console.warn(
        '\n⚠️  FIREBASE_SERVICE_ACCOUNT_KEY is not set!\n' +
        'The app may work in development if your database rules allow unauthenticated access,\n' +
        'but for production you should add your Firebase service account key as a Replit Secret.\n'
      );
      initializeApp({
        databaseURL: DATABASE_URL
      });
    } else {
      try {
        const serviceAccount = JSON.parse(serviceAccountKey) as ServiceAccount;
        console.log('✓ Firebase Admin initialized with service account credentials');
        initializeApp({
          credential: cert(serviceAccount),
          databaseURL: DATABASE_URL
        });
      } catch (error) {
        console.error('❌ Failed to parse Firebase service account key:', error);
        console.warn('Falling back to unauthenticated access. This may fail if database rules require authentication.');
        initializeApp({
          databaseURL: DATABASE_URL
        });
      }
    }
  }
  
  if (!db) {
    db = getDatabase();
    isInitialized = true;
  }
  
  return db;
}

export function getDb() {
  if (!db) {
    return initializeFirebase();
  }
  return db;
}
