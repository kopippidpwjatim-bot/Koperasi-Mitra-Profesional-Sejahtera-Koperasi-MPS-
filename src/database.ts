import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, doc, getDoc, getDocFromServer, setDoc, collection, getDocs } from 'firebase/firestore';
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
  DEFAULT_GALLERY_ITEMS,
  DEFAULT_REGULATIONS
} from './data/defaultData';

import { DEFAULT_LMS_COURSES } from './data/lmsData';

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
  VisitorLog,
  LMSCourse,
  LMSUserProgress,
  Regulation,
  PollCandidate,
  PollVote,
  PollSettings
} from './types';

// Check if Firebase was provisioned and active
const isFirebaseReady = !!(firebaseConfig && firebaseConfig.projectId && firebaseConfig.apiKey);

let app;
let db: any = null;
let auth: any = null;

if (isFirebaseReady) {
  try {
    app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
    db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
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
  let localUpdatedAt = 0;
  try {
    const saved = localStorage.getItem(key);
    if (saved) {
      localData = JSON.parse(saved);
    }
    const savedTime = localStorage.getItem(`${key}_updatedAt`);
    if (savedTime) {
      localUpdatedAt = Number(savedTime) || 0;
    }
  } catch (e) {
    console.warn(`Failed reading ${key} from localStorage:`, e);
  }

  // 2. Try Firestore if it's prepared and available
  if (isFirebaseReady && db) {
    try {
      const docRef = doc(db, collectionName, 'main');
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const loaded = docSnap.data();
        const firestoreUpdatedAt = loaded?._updatedAt || 0;

        // Compare timestamps: if local storage has a newer updated time, use local but sync Firestore
        if (localData !== null && localUpdatedAt > firestoreUpdatedAt) {
          console.log(`Local data for ${collectionName} is newer than Firestore (${localUpdatedAt} > ${firestoreUpdatedAt}). Syncing back to Firestore...`);
          const listPayload = Array.isArray(localData)
            ? { list: localData, _updatedAt: localUpdatedAt }
            : { ...localData as any, _updatedAt: localUpdatedAt };
          
          setDoc(doc(db, collectionName, 'main'), listPayload).catch(err => {
            console.warn(`Background sync to Firestore failed for ${collectionName}:`, err);
          });
          return localData;
        }

        // Otherwise, Firestore is newer or equal
        if (loaded) {
          if (Array.isArray(defaultValue)) {
            const listData = Array.isArray(loaded.list) ? loaded.list : [];
            localStorage.setItem(key, JSON.stringify(listData));
            localStorage.setItem(`${key}_updatedAt`, String(firestoreUpdatedAt || Date.now()));
            return listData as unknown as T;
          } else {
            const objData = { ...loaded };
            // Clean up framework-injected metadata fields
            delete objData._updatedAt;
            delete objData.list;
            
            localStorage.setItem(key, JSON.stringify(objData));
            localStorage.setItem(`${key}_updatedAt`, String(firestoreUpdatedAt || Date.now()));
            return objData as unknown as T;
          }
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
  const timestamp = Date.now();

  // 1. Always save to LocalStorage immediately
  try {
    localStorage.setItem(key, JSON.stringify(data));
    localStorage.setItem(`${key}_updatedAt`, String(timestamp));
  } catch (e) {
    console.warn(`Failed writing ${key} to localStorage:`, e);
  }

  // 2. Async save to Firestore if initialized
  if (isFirebaseReady && db) {
    try {
      const payload = Array.isArray(data)
        ? { list: data, _updatedAt: timestamp }
        : { ...data as any, _updatedAt: timestamp };

      await setDoc(doc(db, collectionName, 'main'), payload);
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

export async function getRegulations(): Promise<Regulation[]> {
  return loadData<Regulation[]>('kop_regulations', 'regulations', DEFAULT_REGULATIONS);
}

export async function saveRegulations(items: Regulation[]): Promise<void> {
  await saveData<Regulation[]>('kop_regulations', 'regulations', items);
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

export async function getLMSCourses(): Promise<LMSCourse[]> {
  return loadData<LMSCourse[]>('kop_lms_courses', 'lms_courses', DEFAULT_LMS_COURSES);
}

export async function saveLMSCourses(courses: LMSCourse[]): Promise<void> {
  await saveData<LMSCourse[]>('kop_lms_courses', 'lms_courses', courses);
}

export async function getLMSProgress(): Promise<LMSUserProgress[]> {
  return loadData<LMSUserProgress[]>('kop_lms_progress', 'lms_progress', []);
}

export async function saveLMSProgress(progress: LMSUserProgress[]): Promise<void> {
  await saveData<LMSUserProgress[]>('kop_lms_progress', 'lms_progress', progress);
}

// ----------------- Polling & Voting Services -----------------

export const DEFAULT_POLL_SETTINGS: PollSettings = {
  isPollingActive: true,
  endDate: "2026-07-31T23:59",
  showResultsToMembers: true,
  pollTitle: "Pemilihan Ketua Koperasi IPPI DPW Jawa Timur Periode 2026-2030"
};

export const DEFAULT_POLL_CANDIDATES: PollCandidate[] = [
  {
    id: "candidate-1",
    nama: "H. Sugeng Riyanto, M.M.",
    visiMisi: "Visi:\nMewujudkan Koperasi IPPI DPW Jatim sebagai pilar ekonomi digital anggota yang modern, mandiri, dan transparan.\n\nMisi:\n1. Digitalisasi layanan keuangan simpan pinjam secara berkelanjutan.\n2. Pengembangan program inkubator bisnis dan pelatihan UMKM bagi anggota.\n3. Peningkatan alokasi serta pembagian SHU yang transparan dan adil."
  },
  {
    id: "candidate-2",
    nama: "Hj. Endang Setyowati, S.E.",
    visiMisi: "Visi:\nMemperkokoh solidaritas gotong royong demi kesejahteraan bersama ekonomi purnatugas.\n\nMisi:\n1. Optimalisasi kemudahan fasilitas kredit permodalan usaha bagi anggota.\n2. Membangun kemitraan strategis dengan BUMD dan instansi regional.\n3. Melaksanakan pelatihan vokasi berkala berbasis potensi dan keunggulan lokal."
  },
  {
    id: "candidate-3",
    nama: "Ir. H. Bambang Wijanarko",
    visiMisi: "Visi:\nKoperasi adaptif, akseleratif, dan inklusif di era teknologi digital.\n\nMisi:\n1. Implementasi platform manajemen koperasi berbasis cloud yang transparan.\n2. Mengembangkan divisi usaha perdagangan umum kreatif.\n3. Program apresiasi loyalitas anggota seperti umroh dan asuransi kesehatan."
  }
];

export async function getPollSettings(): Promise<PollSettings> {
  return loadData<PollSettings>('kop_poll_settings', 'poll_settings', DEFAULT_POLL_SETTINGS);
}

export async function savePollSettings(settings: PollSettings): Promise<void> {
  await saveData<PollSettings>('kop_poll_settings', 'poll_settings', settings);
}

export async function getPollCandidates(): Promise<PollCandidate[]> {
  return loadData<PollCandidate[]>('kop_poll_candidates', 'poll_candidates', DEFAULT_POLL_CANDIDATES);
}

export async function savePollCandidates(candidates: PollCandidate[]): Promise<void> {
  await saveData<PollCandidate[]>('kop_poll_candidates', 'poll_candidates', candidates);
}

export async function getPollVotes(): Promise<PollVote[]> {
  return loadData<PollVote[]>('kop_poll_votes', 'poll_votes', []);
}

export async function savePollVotes(votes: PollVote[]): Promise<void> {
  await saveData<PollVote[]>('kop_poll_votes', 'poll_votes', votes);
}

// Multi-resource database initialization seed function
export { DEFAULT_REGULATIONS } from './data/defaultData';

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
  await saveRegulations(DEFAULT_REGULATIONS);
  await saveLoans(DEFAULT_LOANS);
  await saveWithdrawals(DEFAULT_WITHDRAWALS);
  await saveVisitorLogs(DEFAULT_VISITOR_LOGS);
  await saveLMSCourses(DEFAULT_LMS_COURSES);
  await saveLMSProgress([]);
  await savePollSettings(DEFAULT_POLL_SETTINGS);
  await savePollCandidates(DEFAULT_POLL_CANDIDATES);
  await savePollVotes([]);
}

// Global persistence tester as required by Firestore Security verification
export async function testFirestoreConnection() {
  if (isFirebaseReady && db) {
    try {
      const docRef = doc(db, 'test', 'connection');
      await getDocFromServer(docRef);
    } catch (error) {
      if (error instanceof Error && error.message.includes('the client is offline')) {
        console.error("Please check your Firebase configuration.");
      }
    }
  }
}
testFirestoreConnection();
