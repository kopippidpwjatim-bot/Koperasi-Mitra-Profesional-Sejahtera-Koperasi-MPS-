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
        // Fetch single doc list wrapper to ensure absolute deletion recovery with no orphaned records
        const docRef = doc(db, collectionName, 'main');
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const loaded = docSnap.data();
          if (loaded && Array.isArray(loaded.list)) {
            // Update LocalStorage cache
            localStorage.setItem(key, JSON.stringify(loaded.list));
            return loaded.list as unknown as T;
          }
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
        // Store as a single document wrapper to bypass multiple doc overhead and securely keep additions/updates/deletions atomically synchronized
        await setDoc(doc(db, collectionName, 'main'), { list: data });
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

// Sub-resource defaults
export const DEFAULT_LOANS: LoanApplication[] = [
  {
    id: 'loan-sample-1',
    memberId: 'member-2',
    memberName: 'Slamet Purwanto',
    jumlah: 5000000,
    tenor: 12,
    bungaBulanan: 1.0,
    angsuranBulanan: 466667,
    tujuan: 'Tambahan modal kios sembako purnatugas',
    status: 'pending',
    tanggalPengajuan: '2026-06-10'
  }
];

export const DEFAULT_WITHDRAWALS: WithdrawalRequest[] = [
  {
    id: 'withdraw-sample-1',
    memberId: 'member-2',
    memberName: 'Slamet Purwanto',
    jumlah: 150000,
    jenisSimpanan: 'Sukarela',
    status: 'pending',
    tanggalPengajuan: '2026-06-11'
  }
];

export const DEFAULT_VISITOR_LOGS: VisitorLog[] = [
  { 
    id: 'log-1', 
    nama: 'H. Sugeng Riyanto, M.M.', 
    email: 'admin@koperasi-ippi.com', 
    role: 'admin', 
    timestamp: new Date().toLocaleTimeString('id-ID') + ' WIB', 
    activity: 'Inisialisasi database aman berhasil dilakukan' 
  }
];

export async function getLoans(): Promise<LoanApplication[]> {
  return loadData<LoanApplication[]>('kop_loans', 'loans', DEFAULT_LOANS);
}

export async function saveLoans(loans: LoanApplication[]): Promise<void> {
  await saveData<LoanApplication[]>('kop_loans', 'loans', loans);
}

export async function getWithdrawals(): Promise<WithdrawalRequest[]> {
  return loadData<WithdrawalRequest[]>('kop_withdrawals', 'withdrawals', DEFAULT_WITHDRAWALS);
}

export async function saveWithdrawals(withdrawals: WithdrawalRequest[]): Promise<void> {
  await saveData<WithdrawalRequest[]>('kop_withdrawals', 'withdrawals', withdrawals);
}

export async function getVisitorLogs(): Promise<VisitorLog[]> {
  return loadData<VisitorLog[]>('kop_visitor_logs', 'visitor_logs', DEFAULT_VISITOR_LOGS);
}

export async function saveVisitorLogs(logs: VisitorLog[]): Promise<void> {
  await saveData<VisitorLog[]>('kop_visitor_logs', 'visitor_logs', logs);
}

// Multi-resource database initialization seed function
export async function seedInitialData(): Promise<void> {
  await saveCooperativeSettings(DEFAULT_SETTINGS);
  await saveMembers(DEFAULT_MEMBERS);
  await saveProducts(DEFAULT_PRODUCTS);
  await saveTransactions(DEFAULT_TRANSACTIONS);
  await saveArticles(DEFAULT_ARTICLES);
  await saveAnnouncements(DEFAULT_ANNOUNCEMENTS);
  await saveTentangItems(DEFAULT_TENTANG_ITEMS);
  await saveLayananItems(DEFAULT_LAYANAN_ITEMS);
  await saveGalleryItems(DEFAULT_GALLERY_ITEMS);
  await saveLoans(DEFAULT_LOANS);
  await saveWithdrawals(DEFAULT_WITHDRAWALS);
  await saveVisitorLogs(DEFAULT_VISITOR_LOGS);
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
