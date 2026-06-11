import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, doc, getDoc, setDoc, collection, getDocs } from 'firebase/firestore';
import firebaseConfig from './firebase-applet-config.json';

import {
  DEFAULT_SETTINGS,
  DEFAULT_MEMBERS,
  DEFAULT_PRODUCTS,
  DEFAULT_TRANSACTIONS,
  DEFAULT_ARTICLES,
  DEFAULT_ANNOUNCEMENTS,
  DEFAULT_TENTANG_ITEMS,
  DEFAULT_LAYANAN_ITEMS,
  DEFAULT_GALLERY_ITEMS
} from './data/defaultData';

import {
  CooperativeSettings,
  Member,
  StoreProduct,
  Transaction,
  Article,
  Announcement,
  TentangItem,
  LayananItem,
  GalleryItem,
  LoanApplication,
  WithdrawalRequest,
  VisitorLog
} from './types';

// Check if Firebase was provisioned and active
const isFirebaseReady = !!(firebaseConfig && firebaseConfig.projectId && firebaseConfig.apiKey);

let app;
let db: any = null;
let auth: any = null;

if (isFirebaseReady) {
  try {
    app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
    db = getFirestore(app);
    auth = getAuth(app);
  } catch (err) {
    console.error("Failed to initialize Firebase:", err);
  }
}

// ----------------- Error Handling conforming to system rules -----------------
export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
  }
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth?.currentUser?.uid || null,
      email: auth?.currentUser?.email || null,
      emailVerified: auth?.currentUser?.emailVerified || null,
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// ----------------- Database APIs (Unified LocalStorage + Firestore Sync) -----------------

// Helper to load simple array/object with fallback to default and LocalStorage
async function loadData<T>(key: string, collectionName: string, defaultValue: T): Promise<T> {
  // 1. Try to fetch from LocalStorage first (super fast and persistent)
  let localData: T | null = null;
  try {
    const saved = localStorage.getItem(key);
    if (saved) {
      localData = JSON.parse(saved);
    }
  } catch (e) {
    console.warn(`Failed reading ${key} from localStorage:`, e);
  }

  // 2. Try Firestore if it's prepared and available
  if (isFirebaseReady && db) {
    try {
      if (Array.isArray(defaultValue)) {
        // Fetch list
        const snapshot = await getDocs(collection(db, collectionName));
        if (!snapshot.empty) {
          const list: any[] = [];
          snapshot.forEach(doc => {
            list.push({ ...doc.data() });
          });
          // Update LocalStorage cache
          localStorage.setItem(key, JSON.stringify(list));
          return list as unknown as T;
        }
      } else {
        // Fetch single doc config
        const docRef = doc(db, collectionName, 'main');
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data() as T;
          // Update LocalStorage cache
          localStorage.setItem(key, JSON.stringify(data));
          return data;
        }
      }
    } catch (err) {
      // Gracefully log & fallback to LocalStorage if permission/quota issues occur
      console.warn(`Firestore read failed for ${collectionName}, falling back to localStorage:`, err);
    }
  }

  // Fallback pattern
  return localData !== null ? localData : defaultValue;
}

// Helper to save data to both Firestore & LocalStorage
async function saveData<T>(key: string, collectionName: string, data: T): Promise<void> {
  // 1. Always save to LocalStorage immediately
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    console.warn(`Failed writing ${key} to localStorage:`, e);
  }

  // 2. Async save to Firestore if initialized
  if (isFirebaseReady && db) {
    try {
      if (Array.isArray(data)) {
        // To preserve simple setup, we store as item documents or grouped doc for fast batching.
        // Let's store elements as individually named docs for list reliability.
        for (const item of data) {
          if (item && item.id) {
            await setDoc(doc(db, collectionName, String(item.id)), item);
          }
        }
      } else {
        await setDoc(doc(db, collectionName, 'main'), data as any);
      }
    } catch (err) {
      // conform to Firestore security instructions
      handleFirestoreError(err, OperationType.WRITE, collectionName);
    }
  }
}

// ----------------- Public CRUD Services -----------------

export async function getCooperativeSettings(): Promise<CooperativeSettings> {
  return loadData<CooperativeSettings>('kop_settings', 'settings', DEFAULT_SETTINGS);
}

export async function saveCooperativeSettings(settings: CooperativeSettings): Promise<void> {
  await saveData<CooperativeSettings>('kop_settings', 'settings', settings);
}

export async function getMembers(): Promise<Member[]> {
  return loadData<Member[]>('kop_members', 'members', DEFAULT_MEMBERS);
}

export async function saveMembers(members: Member[]): Promise<void> {
  await saveData<Member[]>('kop_members', 'members', members);
}

export async function getProducts(): Promise<StoreProduct[]> {
  return loadData<StoreProduct[]>('kop_products', 'products', DEFAULT_PRODUCTS);
}

export async function saveProducts(products: StoreProduct[]): Promise<void> {
  await saveData<StoreProduct[]>('kop_products', 'products', products);
}

export async function getTransactions(): Promise<Transaction[]> {
  return loadData<Transaction[]>('kop_transactions', 'transactions', DEFAULT_TRANSACTIONS);
}

export async function saveTransactions(transactions: Transaction[]): Promise<void> {
  await saveData<Transaction[]>('kop_transactions', 'transactions', transactions);
}

export async function getArticles(): Promise<Article[]> {
  return loadData<Article[]>('kop_articles', 'articles', DEFAULT_ARTICLES);
}

export async function saveArticles(articles: Article[]): Promise<void> {
  await saveData<Article[]>('kop_articles', 'articles', articles);
}

export async function getAnnouncements(): Promise<Announcement[]> {
  return loadData<Announcement[]>('kop_announcements', 'announcements', DEFAULT_ANNOUNCEMENTS);
}

export async function saveAnnouncements(announcements: Announcement[]): Promise<void> {
  await saveData<Announcement[]>('kop_announcements', 'announcements', announcements);
}

export async function getTentangItems(): Promise<TentangItem[]> {
  return loadData<TentangItem[]>('kop_tentang_items', 'tentang_items', DEFAULT_TENTANG_ITEMS);
}

export async function saveTentangItems(items: TentangItem[]): Promise<void> {
  await saveData<TentangItem[]>('kop_tentang_items', 'tentang_items', items);
}

export async function getLayananItems(): Promise<LayananItem[]> {
  return loadData<LayananItem[]>('kop_layanan_items', 'layanan_items', DEFAULT_LAYANAN_ITEMS);
}

export async function saveLayananItems(items: LayananItem[]): Promise<void> {
  await saveData<LayananItem[]>('kop_layanan_items', 'layanan_items', items);
}

export async function getGalleryItems(): Promise<GalleryItem[]> {
  return loadData<GalleryItem[]>('kop_gallery_items', 'gallery_items', DEFAULT_GALLERY_ITEMS);
}

export async function saveGalleryItems(items: GalleryItem[]): Promise<void> {
  await saveData<GalleryItem[]>('kop_gallery_items', 'gallery_items', items);
}

export async function getLoans(): Promise<LoanApplication[]> {
  const defaultLoans: LoanApplication[] = [
    {
      id: 'loan-sample-1',
      memberId: 'anggota-1',
      memberName: 'Mohammad Muslih, S.H., M.M.',
      jumlah: 5000000,
      tenor: 12,
      bungaBulanan: 1.0,
      angsuranBulanan: 466667,
      tujuan: 'Tambahan modal kios sembako purnatugas',
      status: 'pending',
      tanggalPengajuan: '2026-06-10'
    }
  ];
  return loadData<LoanApplication[]>('kop_loans', 'loans', defaultLoans);
}

export async function saveLoans(loans: LoanApplication[]): Promise<void> {
  await saveData<LoanApplication[]>('kop_loans', 'loans', loans);
}

export async function getWithdrawals(): Promise<WithdrawalRequest[]> {
  const defaultWithdrawals: WithdrawalRequest[] = [
    {
      id: 'withdraw-sample-1',
      memberId: 'anggota-1',
      memberName: 'Mohammad Muslih, S.H., M.M.',
      jumlah: 150000,
      jenisSimpanan: 'Sukarela',
      status: 'pending',
      tanggalPengajuan: '2026-06-11'
    }
  ];
  return loadData<WithdrawalRequest[]>('kop_withdrawals', 'withdrawals', defaultWithdrawals);
}

export async function saveWithdrawals(withdrawals: WithdrawalRequest[]): Promise<void> {
  await saveData<WithdrawalRequest[]>('kop_withdrawals', 'withdrawals', withdrawals);
}

export async function getVisitorLogs(): Promise<VisitorLog[]> {
  const defaultLogs: VisitorLog[] = [
    { 
      id: 'log-1', 
      nama: 'H. Sugeng Riyanto, M.M.', 
      email: 'admin@koperasi-ippi.com', 
      role: 'admin', 
      timestamp: new Date().toLocaleTimeString('id-ID') + ' WIB', 
      activity: 'Login administratif berhasil' 
    },
    { 
      id: 'log-2', 
      nama: 'Mohammad Muslih, S.H.', 
      email: 'Ikatanppi@gmail.com', 
      role: 'anggota', 
      timestamp: new Date(Date.now() - 1700000).toLocaleTimeString('id-ID') + ' WIB', 
      activity: 'Mengunduh digital KTA elektrik' 
    }
  ];
  return loadData<VisitorLog[]>('kop_visitor_logs', 'visitor_logs', defaultLogs);
}

export async function saveVisitorLogs(logs: VisitorLog[]): Promise<void> {
  await saveData<VisitorLog[]>('kop_visitor_logs', 'visitor_logs', logs);
}

// Global persistence tester as required by Firestore Security verification
export async function testFirestoreConnection() {
  if (isFirebaseReady && db) {
    try {
      const docRef = doc(db, 'test', 'connection');
      await getDoc(docRef);
    } catch (error) {
      if (error instanceof Error && error.message.includes('the client is offline')) {
        console.error("Please check your Firebase configuration.");
      }
    }
  }
}
testFirestoreConnection();
