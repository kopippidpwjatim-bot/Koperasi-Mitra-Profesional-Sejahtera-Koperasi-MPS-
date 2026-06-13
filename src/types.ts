export type UserRole = 'admin' | 'anggota' | 'sekretaris' | 'ketua' | 'bendahara';

export type MemberStatus = 'pending' | 'approved' | 'rejected';

export interface Member {
  id: string;
  nama: string; // lengkap dengan gelar
  tempatLahir: string;
  tanggalLahir: string;
  institusiPensiun: string;
  jenisKelamin: 'Laki-Laki' | 'Perempuan';
  agama: 'Islam' | 'Kristen' | 'Budha' | 'Hindu' | 'Konghucu' | 'Kepercayaan';
  pekerjaanKeahlian: string;
  noHp: string;
  email: string;
  alamatLengkap: string;
  photo?: string; // base64 DataURL or fallback SVG URL
  noAnggota?: string; // 10 digit, e.g. 999000011
  noRekening?: string; // 10 digit
  password?: string;
  status: MemberStatus;
  role: UserRole;
  registeredAt: string;
  
  // Balances
  saldoPokok: number;
  saldoWajib: number;
  saldoSukarela: number;
  saldoPenyertaan: number;
}

export type TransactionCategory = 'Uang Masuk' | 'Uang Keluar';
export type TransactionSourceType = 'Iuran Anggota' | 'Nota Dana Masuk' | 'Dana DPP' | 'SPJ' | 'Operasional' | 'Lainnya';

export interface Transaction {
  id: string;
  tanggal: string;
  kategori: TransactionCategory;
  sumberTujuan: TransactionSourceType;
  deskripsi: string;
  noRekening: string; // Nomor Rekening Tujuan/Sumber
  namaBankPemilik: string; // Nama Bank dan Pemilik Rekening
  jumlahMasuk: number;
  jumlahKeluar: number;
  saldoAkhir: number;
  approvedByKetua: boolean; // For exit transactions 'Uang Keluar'
  createdBy: string; // Who entered the transaction
  memberId?: string; // Links member context automatically if applicable (e.g. paying iuran)
}

export interface CooperativeSettings {
  logo: string; // Base64
  logoBrand?: string; // Base64 / Image/SVG brand logo (Certificates)
  namaSekretariat: string;
  alamatSekretariat: string;
  noIjinPendirian: string;
  noTelpWA: string;
  email: string;
  tandatanganKetua?: string; // Base64 / Image/SVG
  tandatanganSekretaris?: string; // Base64 / Image/SVG
}

export interface StoreProduct {
  id: string;
  nama: string;
  harga: number;
  image: string;
  kategori: string;
  stok: number;
  deskripsi: string;
  externalUrl?: string;
  showOnBeranda?: boolean;
  order?: number;
}

export interface CartItem {
  product: StoreProduct;
  quantity: number;
}

export interface LoanApplication {
  id: string;
  memberId: string;
  memberName: string;
  jumlah: number;
  tenor: number; // in months
  bungaBulanan: number; // percentage
  angsuranBulanan: number;
  tujuan: string;
  status: 'pending' | 'approved' | 'rejected';
  tanggalPengajuan: string;
}

export interface WithdrawalRequest {
  id: string;
  memberId: string;
  memberName: string;
  jumlah: number;
  jenisSimpanan: 'Sukarela' | 'Penyertaan';
  status: 'pending' | 'approved' | 'rejected';
  tanggalPengajuan: string;
}

export interface Article {
  id: string;
  title: string;
  summary: string;
  content: string;
  date: string;
  category: string;
  image?: string;
  externalUrl?: string;
  showOnBeranda?: boolean;
  order?: number;
}

export interface TentangItem {
  id: string;
  title: string;
  content: string;
  image: string;
  externalUrl?: string;
  showOnBeranda: boolean;
  order: number;
}

export interface LayananItem {
  id: string;
  title: string;
  content: string;
  image: string;
  externalUrl?: string;
  showOnBeranda: boolean;
  order: number;
  badge?: string;
}

export interface GalleryItem {
  id: string;
  title: string;
  description: string;
  image: string;
  externalUrl?: string;
  showOnBeranda: boolean;
  order: number;
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  date: string;
  important: boolean;
}

export interface Regulation {
  id: string;
  title: string;
  content: string;
  order: number;
}

export interface VisitorLog {
  id: string;
  nama: string;
  email: string;
  role: UserRole;
  timestamp: string;
  activity: string;
}

// Learning Management System (LMS) Interfaces
export interface LMSLesson {
  id: string;
  title: string;
  content: string; // Detail materi (HTML/Text)
  duration: string; // Durasi baca
  order: number;
  externalUrl?: string; // Tautan/Link luar Zoom, Drive, PDF
}

export interface LMSQuestion {
  id: string;
  questionText: string;
  options: string[];
  correctOptionIndex: number;
}

export interface LMSQuiz {
  questions: LMSQuestion[];
  passingScore: number; // e.g. 70
}

export interface LMSCourse {
  id: string;
  title: string;
  category: 'UMKM Modern' | 'Pecinta Koperasi' | 'Manajemen Keuangan' | 'Digitalisasi Bisnis';
  instructor: string;
  description: string;
  duration: string; // e.g. "3 Jam"
  image: string; // URL / SVG base64
  lessons: LMSLesson[];
  quiz: LMSQuiz;
  externalUrl?: string; // Tautan/Link luar Zoom, Drive, PDF
}

export interface LMSUserProgress {
  id: string; // same as memberId
  memberId: string;
  memberName: string;
  completedCourseIds: string[]; // List ID kursus yang lulus
  quizScores: { [courseId: string]: number }; // Skor kuis tiap kursus
  certifiedAt: { [courseId: string]: string }; // Tanggal kelulusan tiap kursus
}

