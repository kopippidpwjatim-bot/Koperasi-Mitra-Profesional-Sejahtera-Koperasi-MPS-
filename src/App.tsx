import React, { useState } from 'react';
import { 
  LandingPage 
} from './components/LandingPage';
import { 
  AuthModal 
} from './components/AuthModal';
import { 
  DashboardAnggota 
} from './components/DashboardAnggota';
import { 
  DashboardAdmin 
} from './components/DashboardAdmin';
import { 
  DashboardSekretaris 
} from './components/DashboardSekretaris';
import { 
  DashboardKetua 
} from './components/DashboardKetua';
import { 
  DashboardBendahara 
} from './components/DashboardBendahara';
import {
  LMSPortal
} from './components/LMSPortal';

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

import { DEFAULT_LMS_COURSES } from './data/lmsData';

import { 
  Member, 
  CooperativeSettings, 
  StoreProduct, 
  Transaction, 
  Article, 
  Announcement, 
  VisitorLog, 
  LoanApplication, 
  WithdrawalRequest, 
  CartItem, 
  UserRole,
  TentangItem,
  LayananItem,
  GalleryItem,
  LMSCourse,
  LMSUserProgress
} from './types';

import {
  getCooperativeSettings,
  saveCooperativeSettings,
  getMembers,
  saveMembers,
  getProducts,
  saveProducts,
  getTransactions,
  saveTransactions,
  getArticles,
  saveArticles,
  getAnnouncements,
  saveAnnouncements,
  getTentangItems,
  saveTentangItems,
  getLayananItems,
  saveLayananItems,
  getGalleryItems,
  saveGalleryItems,
  getLoans,
  saveLoans,
  getWithdrawals,
  saveWithdrawals,
  getVisitorLogs,
  saveVisitorLogs,
  getLMSCourses,
  saveLMSCourses,
  getLMSProgress,
  saveLMSProgress,
  seedInitialData,
  DEFAULT_LOANS,
  DEFAULT_WITHDRAWALS,
  DEFAULT_VISITOR_LOGS
} from './database';

const getLocalOrFallback = <T,>(key: string, fallback: T): T => {
  try {
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : fallback;
  } catch (e) {
    return fallback;
  }
};

export default function App() {
  // Database status loading flag: initialized to false so the user can browse instantly using local/fallback states
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [hasLoadedFromDB, setHasLoadedFromDB] = useState<boolean>(false);

  // Global States (synchronously loaded from localStorage or imports for a 0ms fully populated first paint)
  const [settings, setSettings] = useState<CooperativeSettings>(() => getLocalOrFallback('kop_settings', DEFAULT_SETTINGS));
  const [members, setMembers] = useState<Member[]>(() => getLocalOrFallback('kop_members', DEFAULT_MEMBERS));
  const [products, setProducts] = useState<StoreProduct[]>(() => getLocalOrFallback('kop_products', DEFAULT_PRODUCTS));
  const [transactions, setTransactions] = useState<Transaction[]>(() => getLocalOrFallback('kop_transactions', DEFAULT_TRANSACTIONS));
  const [articles, setArticles] = useState<Article[]>(() => getLocalOrFallback('kop_articles', DEFAULT_ARTICLES));
  const [announcements, setAnnouncements] = useState<Announcement[]>(() => getLocalOrFallback('kop_announcements', DEFAULT_ANNOUNCEMENTS));
  const [tentangItems, setTentangItems] = useState<TentangItem[]>(() => getLocalOrFallback('kop_tentang_items', DEFAULT_TENTANG_ITEMS));
  const [layananItems, setLayananItems] = useState<LayananItem[]>(() => getLocalOrFallback('kop_layanan_items', DEFAULT_LAYANAN_ITEMS));
  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>(() => getLocalOrFallback('kop_gallery_items', DEFAULT_GALLERY_ITEMS));
  
  const [activeMember, setActiveMember] = useState<Member | null>(null);
  const [impersonatedRole, setImpersonatedRole] = useState<UserRole | null>(null);
  const [showAuthModal, setShowAuthModal] = useState<boolean>(false);
  const [authTab, setAuthTab] = useState<'login' | 'register'>('login');
  const [guestCart, setGuestCart] = useState<CartItem[]>([]);

  // Telemetry logs state
  const [visitorLogs, setVisitorLogs] = useState<VisitorLog[]>(() => getLocalOrFallback('kop_visitor_logs', DEFAULT_VISITOR_LOGS));

  // Loans and Withdrawals States
  const [loans, setLoans] = useState<LoanApplication[]>(() => getLocalOrFallback('kop_loans', DEFAULT_LOANS));
  const [withdrawals, setWithdrawals] = useState<WithdrawalRequest[]>(() => getLocalOrFallback('kop_withdrawals', DEFAULT_WITHDRAWALS));

  // LMS States
  const [courses, setCourses] = useState<LMSCourse[]>(() => getLocalOrFallback('kop_lms_courses', DEFAULT_LMS_COURSES));
  const [progressList, setProgressList] = useState<LMSUserProgress[]>(() => getLocalOrFallback('kop_lms_progress', []));

  // 1. ASYNC PROGRESSIVE FETCHING ON PORTAL INITIALIZATION (NO-BLOCKING, SEAMLESS DB RETRIEVAL)
  React.useEffect(() => {
    let active = true;
    async function loadCofigurationFromDatabase() {
      try {
        await Promise.all([
          getCooperativeSettings().then(val => { if (active) setSettings(val); }),
          getMembers().then(val => { if (active) setMembers(val); }),
          getProducts().then(val => { if (active) setProducts(val); }),
          getTransactions().then(val => { if (active) setTransactions(val); }),
          getArticles().then(val => { if (active) setArticles(val); }),
          getAnnouncements().then(val => { if (active) setAnnouncements(val); }),
          getTentangItems().then(val => { if (active) setTentangItems(val); }),
          getLayananItems().then(val => { if (active) setLayananItems(val); }),
          getGalleryItems().then(val => { if (active) setGalleryItems(val); }),
          getLoans().then(val => { if (active) setLoans(val); }),
          getWithdrawals().then(val => { if (active) setWithdrawals(val); }),
          getVisitorLogs().then(val => { if (active) setVisitorLogs(val); }),
          getLMSCourses().then(val => { if (active) setCourses(val); }),
          getLMSProgress().then(val => { if (active) setProgressList(val); })
        ]);
      } catch (e) {
        console.error("Database connection fallback default:", e);
      } finally {
        if (active) {
          setHasLoadedFromDB(true);
          setIsLoading(false);
        }
      }
    }
    loadCofigurationFromDatabase();
    return () => {
      active = false;
    };
  }, []);

  // 2. REACTIVE WRITERS BACKWARD SYNCING
  React.useEffect(() => {
    if (hasLoadedFromDB) {
      saveCooperativeSettings(settings);
    }
  }, [settings, hasLoadedFromDB]);

  React.useEffect(() => {
    if (hasLoadedFromDB) {
      saveMembers(members);
    }
  }, [members, hasLoadedFromDB]);

  React.useEffect(() => {
    if (hasLoadedFromDB) {
      saveProducts(products);
    }
  }, [products, hasLoadedFromDB]);

  React.useEffect(() => {
    if (hasLoadedFromDB) {
      saveTransactions(transactions);
    }
  }, [transactions, hasLoadedFromDB]);

  React.useEffect(() => {
    if (hasLoadedFromDB) {
      saveArticles(articles);
    }
  }, [articles, hasLoadedFromDB]);

  React.useEffect(() => {
    if (hasLoadedFromDB) {
      saveAnnouncements(announcements);
    }
  }, [announcements, hasLoadedFromDB]);

  React.useEffect(() => {
    if (hasLoadedFromDB) {
      saveTentangItems(tentangItems);
    }
  }, [tentangItems, hasLoadedFromDB]);

  React.useEffect(() => {
    if (hasLoadedFromDB) {
      saveLayananItems(layananItems);
    }
  }, [layananItems, hasLoadedFromDB]);

  React.useEffect(() => {
    if (hasLoadedFromDB) {
      saveGalleryItems(galleryItems);
    }
  }, [galleryItems, hasLoadedFromDB]);

  React.useEffect(() => {
    if (hasLoadedFromDB) {
      saveLoans(loans);
    }
  }, [loans, hasLoadedFromDB]);

  React.useEffect(() => {
    if (hasLoadedFromDB) {
      saveWithdrawals(withdrawals);
    }
  }, [withdrawals, hasLoadedFromDB]);

  React.useEffect(() => {
    if (hasLoadedFromDB) {
      saveVisitorLogs(visitorLogs);
    }
  }, [visitorLogs, hasLoadedFromDB]);

  React.useEffect(() => {
    if (hasLoadedFromDB) {
      saveLMSCourses(courses);
    }
  }, [courses, hasLoadedFromDB]);

  React.useEffect(() => {
    if (hasLoadedFromDB) {
      saveLMSProgress(progressList);
    }
  }, [progressList, hasLoadedFromDB]);

  // Auth triggers
  const handleOpenAuth = (tab: 'login' | 'register') => {
    setAuthTab(tab);
    setShowAuthModal(true);
  };

  const handleLogin = (member: Member) => {
    setActiveMember(member);
    setImpersonatedRole(null); // Reset simulation
    
    // Log login action
    const newLog: VisitorLog = {
      id: `log-${Date.now()}`,
      nama: member.nama,
      email: member.email,
      role: member.role,
      timestamp: new Date().toLocaleTimeString('id-ID') + ' WIB',
      activity: `LogIn sukses ke dalam portal (${member.role.toUpperCase()})`
    };
    setVisitorLogs(prev => [newLog, ...prev]);
  };

  const handleLogout = () => {
    if (activeMember) {
      const newLog: VisitorLog = {
        id: `log-${Date.now()}`,
        nama: activeMember.nama,
        email: activeMember.email,
        role: activeMember.role,
        timestamp: new Date().toLocaleTimeString('id-ID') + ' WIB',
        activity: 'Logout dari aplikasi portal'
      };
      setVisitorLogs(prev => [newLog, ...prev]);
    }
    setActiveMember(null);
    setImpersonatedRole(null);
  };

  const handleRegister = (memberData: Omit<Member, 'id' | 'saldoPokok' | 'saldoWajib' | 'saldoSukarela' | 'saldoPenyertaan' | 'registeredAt'>) => {
    const newMember: Member = {
      ...memberData,
      id: `member-${Date.now()}`,
      registeredAt: new Date().toISOString(),
      saldoPokok: 0,
      saldoWajib: 0,
      saldoSukarela: 0,
      saldoPenyertaan: 0
    };

    setMembers(prev => [...prev, newMember]);

    // Log registration
    const newLog: VisitorLog = {
      id: `log-${Date.now()}`,
      nama: memberData.nama,
      email: memberData.email,
      role: 'anggota',
      timestamp: new Date().toLocaleTimeString('id-ID') + ' WIB',
      activity: `Registrasi online anggota baru status: PENDING`
    };
    setVisitorLogs(prev => [newLog, ...prev]);
  };

  // Admin and Settings handlers
  const handleUpdateSettings = (newSettings: Partial<CooperativeSettings>) => {
    setSettings(prev => ({
      ...prev,
      ...newSettings
    }));
    
    // Add to visitor logs
    const newLog: VisitorLog = {
      id: `log-${Date.now()}`,
      nama: activeMember?.nama || 'System Admin',
      email: activeMember?.email || 'admin@coop.com',
      role: 'admin',
      timestamp: new Date().toLocaleTimeString('id-ID') + ' WIB',
      activity: 'Meng-update metadata legalitas dan kontak Koperasi JSU'
    };
    setVisitorLogs(prev => [newLog, ...prev]);
  };

  const handleUpdateMember = (id: string, updatedData: Partial<Member>) => {
    setMembers(prev => prev.map(m => m.id === id ? { ...m, ...updatedData } : m));
    
    // Update activeMember reference if the edits were of the logged in user themselves
    if (activeMember && activeMember.id === id) {
      setActiveMember(prev => prev ? { ...prev, ...updatedData } : null);
    }

    const newLog: VisitorLog = {
      id: `log-${Date.now()}`,
      nama: activeMember?.nama || 'System Admin',
      email: activeMember?.email || 'admin@coop.com',
      role: 'admin',
      timestamp: new Date().toLocaleTimeString('id-ID') + ' WIB',
      activity: `Meng-edit profile dan otoritas user ID: ${id}`
    };
    setVisitorLogs(prev => [newLog, ...prev]);
  };

  const handleDeleteMember = (id: string) => {
    setMembers(prev => prev.filter(m => m.id !== id));
    
    const newLog: VisitorLog = {
      id: `log-${Date.now()}`,
      nama: activeMember?.nama || 'System Admin',
      email: activeMember?.email || 'admin@coop.com',
      role: 'admin',
      timestamp: new Date().toLocaleTimeString('id-ID') + ' WIB',
      activity: `Menghapus keanggotaan user ID: ${id}`
    };
    setVisitorLogs(prev => [newLog, ...prev]);
  };

  const handleAddMember = (memberData: any) => {
    const isFirstTime = members.length;
    const sequentialNoString = String(10 + isFirstTime).padStart(3, '0');
    
    const newMember: Member = {
      ...memberData,
      id: `member-${Date.now()}`,
      noAnggota: `999000${sequentialNoString}`,
      noRekening: `999000${sequentialNoString}0`,
      registeredAt: new Date().toISOString(),
      saldoPokok: 500000,
      saldoWajib: 100000,
      saldoSukarela: 100000,
      saldoPenyertaan: 0
    };

    setMembers(prev => [...prev, newMember]);
    
    const newLog: VisitorLog = {
      id: `log-${Date.now()}`,
      nama: activeMember?.nama || 'System Admin',
      email: activeMember?.email || 'admin@coop.com',
      role: 'admin',
      timestamp: new Date().toLocaleTimeString('id-ID') + ' WIB',
      activity: `Menambahkan user baru ke pangkalan data: ${memberData.nama}`
    };
    setVisitorLogs(prev => [newLog, ...prev]);
  };

  // Secretary actions
  const handleApproveMember = (id: string) => {
    const approvedMember = members.find(m => m.id === id);
    if (!approvedMember) return;

    const totalCurrentMembers = members.length;
    // Sequential generation e.g. 999000021 sequentially
    const randomSuffix = String(totalCurrentMembers + 10).padStart(3, '0');
    const computedNoAnggota = `999000${randomSuffix}`;
    const computedNoRekening = `999000${randomSuffix}0`;

    // Establish default approved savings (Pokok Rp500.000 + Sukarela Rp250.000)
    setMembers(prev => prev.map(m => m.id === id ? {
      ...m,
      status: 'approved',
      noAnggota: computedNoAnggota,
      noRekening: computedNoRekening,
      saldoPokok: 500000,
      saldoSukarela: 150000,
      saldoWajib: 100000
    } : m));

    // Post to transactions
    const feedTx: Transaction = {
      id: `tx-approve-${Date.now()}`,
      tanggal: new Date().toISOString().split('T')[0],
      kategori: 'Uang Masuk',
      sumberTujuan: 'Iuran Anggota',
      deskripsi: `Penyetoran dana iuran awal ang. baru (${approvedMember.nama})`,
      noRekening: computedNoRekening,
      namaBankPemilik: `Koperasi - ${approvedMember.nama}`,
      jumlahMasuk: 750000,
      jumlahKeluar: 0,
      saldoAkhir: 750000,
      approvedByKetua: true,
      createdBy: 'Sekretaris'
    };
    setTransactions(prev => [feedTx, ...prev]);

    // Log approval
    const newLog: VisitorLog = {
      id: `log-${Date.now()}`,
      nama: activeMember?.nama || 'Sekretaris',
      email: activeMember?.email || 'sec@coop.com',
      role: 'sekretaris',
      timestamp: new Date().toLocaleTimeString('id-ID') + ' WIB',
      activity: `MEYETUJUI pendaftaran & meng-generate no rekening untuk ${approvedMember.nama}`
    };
    setVisitorLogs(prev => [newLog, ...prev]);
  };

  const handleRejectMember = (id: string) => {
    setMembers(prev => prev.map(m => m.id === id ? { ...m, status: 'rejected' } : m));
    
    const newLog: VisitorLog = {
      id: `log-${Date.now()}`,
      nama: activeMember?.nama || 'Sekretaris',
      email: activeMember?.email || 'sec@coop.com',
      role: 'sekretaris',
      timestamp: new Date().toLocaleTimeString('id-ID') + ' WIB',
      activity: `MENOLAK permohonan keanggotaan ID: ${id}`
    };
    setVisitorLogs(prev => [newLog, ...prev]);
  };

  // Article / Announcement edits
  const handleAddArticle = (art: any) => {
    const newArt: Article = {
      ...art,
      id: `art-${Date.now()}`,
      date: new Date().toISOString().split('T')[0]
    };
    setArticles(prev => [newArt, ...prev]);
  };

  const handleEditArticle = (id: string, updated: Omit<Article, 'id' | 'date'>) => {
    setArticles(prev => prev.map(a => a.id === id ? { ...a, ...updated } : a));
  };

  const handleDeleteArticle = (id: string) => {
    setArticles(prev => prev.filter(a => a.id !== id));
  };

  const handleAddAnnouncement = (ann: any) => {
    const newAnn: Announcement = {
      ...ann,
      id: `ann-${Date.now()}`,
      date: new Date().toISOString().split('T')[0]
    };
    setAnnouncements(prev => [newAnn, ...prev]);
  };

  const handleEditAnnouncement = (id: string, updated: Omit<Announcement, 'id' | 'date'>) => {
    setAnnouncements(prev => prev.map(a => a.id === id ? { ...a, ...updated } : a));
  };

  const handleDeleteAnnouncement = (id: string) => {
    setAnnouncements(prev => prev.filter(a => a.id !== id));
  };

  // Log controls
  const handleClearLogs = () => {
    setVisitorLogs([]);
  };

  const handleRefreshLogs = () => {
    const seedRefresh: VisitorLog = {
      id: `log-refresh-${Date.now()}`,
      nama: activeMember?.nama || 'System Auditor',
      email: activeMember?.email || 'auditor@coop.com',
      role: 'admin',
      timestamp: new Date().toLocaleTimeString('id-ID') + ' WIB',
      activity: 'Melakukan penyegaran (Refresh) telemetri audit logs'
    };
    setVisitorLogs(prev => [seedRefresh, ...prev]);
    alert("Berhasil melakukan refresh telemetry logs!");
  };

  const handleEmulateRole = (role: string) => {
    setImpersonatedRole(role as UserRole);
    alert(`Mensimulasi hak akses jabatan pengawas: ${role.toUpperCase()}`);
  };

  // Treasurer double entries
  const handleAddTransaction = (newTx: any) => {
    const tx: Transaction = {
      ...newTx,
      id: `tx-${Date.now()}`,
      tanggal: new Date().toISOString().split('T')[0],
      namaBankPemilik: `Bank Jatim - ${newTx.memberName}`,
      saldoAkhir: 0,
      approvedByKetua: true,
      createdBy: activeMember?.nama || 'Bendahara'
    };
    setTransactions(prev => [tx, ...prev]);

    // Log action
    const newLog: VisitorLog = {
      id: `log-${Date.now()}`,
      nama: activeMember?.nama || 'Bendahara',
      email: activeMember?.email || 'bend@coop.com',
      role: 'bendahara',
      timestamp: new Date().toLocaleTimeString('id-ID') + ' WIB',
      activity: `Mengantre entry jurnal baru (${newTx.kategori}) untuk an. ${newTx.memberName}`
    };
    setVisitorLogs(prev => [newLog, ...prev]);
  };

  const handleUpdateMemberBalances = (memberId: string, diffs: { Pokok?: number, Wajib?: number, Sukarela?: number, Penyertaan?: number }) => {
    setMembers(prev => prev.map(m => {
      if (m.id === memberId) {
        return {
          ...m,
          saldoPokok: m.saldoPokok + (diffs.Pokok || 0),
          saldoWajib: m.saldoWajib + (diffs.Wajib || 0),
          saldoSukarela: m.saldoSukarela + (diffs.Sukarela || 0),
          saldoPenyertaan: m.saldoPenyertaan + (diffs.Penyertaan || 0),
        };
      }
      return m;
    }));
  };

  // Member Online Actions
  const handleApplyLoan = (loanForm: { jumlah: number, tenor: number, tujuan: string }) => {
    if (!activeMember) return;
    const intRate = loanForm.tenor === 6 ? 1.2 : loanForm.tenor === 12 ? 1.0 : 0.8;
    const totalWithInterest = loanForm.jumlah + (loanForm.jumlah * (intRate / 100) * loanForm.tenor);
    const install = Math.round(totalWithInterest / loanForm.tenor);

    const newLoan: LoanApplication = {
      id: `loan-${Date.now()}`,
      memberId: activeMember.id,
      memberName: activeMember.nama,
      jumlah: loanForm.jumlah,
      tenor: loanForm.tenor,
      bungaBulanan: intRate,
      angsuranBulanan: install,
      tujuan: loanForm.tujuan,
      status: 'pending',
      tanggalPengajuan: new Date().toISOString().split('T')[0]
    };
    setLoans(prev => [newLoan, ...prev]);

    const newLog: VisitorLog = {
      id: `log-${Date.now()}`,
      nama: activeMember.nama,
      email: activeMember.email,
      role: 'anggota',
      timestamp: new Date().toLocaleTimeString('id-ID') + ' WIB',
      activity: `Mengajukan PEMBIAYAAN KREDIT sebesar Rp ${new Intl.NumberFormat('id-ID').format(loanForm.jumlah)}`
    };
    setVisitorLogs(prev => [newLog, ...prev]);
  };

  const handleApplyWithdrawal = (withdrawForm: { jumlah: number, jenisSimpanan: 'Sukarela' | 'Penyertaan' }) => {
    if (!activeMember) return;

    const newWithdrawal: WithdrawalRequest = {
      id: `withdraw-${Date.now()}`,
      memberId: activeMember.id,
      memberName: activeMember.nama,
      jumlah: withdrawForm.jumlah,
      jenisSimpanan: withdrawForm.jenisSimpanan,
      status: 'pending',
      tanggalPengajuan: new Date().toISOString().split('T')[0]
    };
    setWithdrawals(prev => [newWithdrawal, ...prev]);

    const newLog: VisitorLog = {
      id: `log-${Date.now()}`,
      nama: activeMember.nama,
      email: activeMember.email,
      role: 'anggota',
      timestamp: new Date().toLocaleTimeString('id-ID') + ' WIB',
      activity: `Mengajukan PENARIKAN DANA simpanan ${withdrawForm.jenisSimpanan} Rp ${new Intl.NumberFormat('id-ID').format(withdrawForm.jumlah)}`
    };
    setVisitorLogs(prev => [newLog, ...prev]);
  };

  // Immediate PPOB transactions
  const handleBuyPPOB = (amount: number, ppobType: string, refDetail: string): boolean => {
    if (!activeMember) return false;
    const priceWithAdmin = amount + 500; // Adding a nominal 500 rupiah admin fee to cooperative balances
    if (activeMember.saldoSukarela < priceWithAdmin) return false;

    // Deduct member balance
    setMembers(prev => prev.map(m => m.id === activeMember.id ? {
      ...m,
      saldoSukarela: m.saldoSukarela - priceWithAdmin
    } : m));

    // Post outgoing transaction officially
    const fuelPPOBTx: Transaction = {
      id: `tx-ppob-${Date.now()}`,
      tanggal: new Date().toISOString().split('T')[0],
      kategori: 'Uang Keluar',
      sumberTujuan: 'Operasional',
      deskripsi: `Sertifikasi Pembayaran ${ppobType} (${refDetail})`,
      noRekening: activeMember.noRekening || '',
      namaBankPemilik: `Koperasi - ${activeMember.nama}`,
      jumlahMasuk: 0,
      jumlahKeluar: priceWithAdmin,
      saldoAkhir: 0,
      approvedByKetua: true,
      createdBy: 'Sistem PPOB'
    };
    setTransactions(prev => [fuelPPOBTx, ...prev]);

    // Sync state
    setActiveMember(prev => prev ? {
      ...prev,
      saldoSukarela: prev.saldoSukarela - priceWithAdmin
    } : null);

    const newLog: VisitorLog = {
      id: `log-${Date.now()}`,
      nama: activeMember.nama,
      email: activeMember.email,
      role: 'anggota',
      timestamp: new Date().toLocaleTimeString('id-ID') + ' WIB',
      activity: `Melakukan transaksi online PPOB: ${ppobType} senilai ${amount}`
    };
    setVisitorLogs(prev => [newLog, ...prev]);

    return true;
  };

  // Dedicated e-Swalayan checkout balancer
  const handleDeductBalanceForPurchase = (total: number, orderDetails: string): boolean => {
    if (!activeMember) return false;
    if (activeMember.saldoSukarela < total) return false;

    setMembers(prev => prev.map(m => m.id === activeMember.id ? {
      ...m,
      saldoSukarela: m.saldoSukarela - total
    } : m));

    // Post to transactions
    const fuelPurchaseTx: Transaction = {
      id: `tx-buy-${Date.now()}`,
      tanggal: new Date().toISOString().split('T')[0],
      kategori: 'Uang Keluar',
      sumberTujuan: 'Lainnya',
      deskripsi: `Order e-Swalayan: ${orderDetails}`,
      noRekening: activeMember.noRekening || '',
      namaBankPemilik: `Koperasi - ${activeMember.nama}`,
      jumlahMasuk: 0,
      jumlahKeluar: total,
      saldoAkhir: 0,
      approvedByKetua: true,
      createdBy: 'Swalayan Virtual'
    };
    setTransactions(prev => [fuelPurchaseTx, ...prev]);

    setActiveMember(prev => prev ? {
      ...prev,
      saldoSukarela: prev.saldoSukarela - total
    } : null);

    const newLog: VisitorLog = {
      id: `log-${Date.now()}`,
      nama: activeMember.nama,
      email: activeMember.email,
      role: 'anggota',
      timestamp: new Date().toLocaleTimeString('id-ID') + ' WIB',
      activity: `Pembayaran online belanja Swalayan IPPI via Saldo Sukarela: ${total}`
    };
    setVisitorLogs(prev => [newLog, ...prev]);

    return true;
  };

  // Chairman approval mechanics
  const handleStatusApproveLoan = (loanId: string) => {
    const loan = loans.find(l => l.id === loanId);
    if (!loan) return;

    setLoans(prev => prev.map(l => l.id === loanId ? { ...l, status: 'approved' } : l));

    // Disburse funds directly into active user's Sukarela account
    setMembers(prev => prev.map(m => m.id === loan.memberId ? {
      ...m,
      saldoSukarela: m.saldoSukarela + loan.jumlah
    } : m));

    // Book the checkout transaction officially
    const feedTx: Transaction = {
      id: `tx-loan-out-${Date.now()}`,
      tanggal: new Date().toISOString().split('T')[0],
      kategori: 'Uang Keluar',
      sumberTujuan: 'Lainnya',
      deskripsi: `Penyaluran dana pinjaman modal kerja disetujui Ketua`,
      noRekening: members.find(m => m.id === loan.memberId)?.noRekening || '',
      namaBankPemilik: `Koperasi - ${loan.memberName}`,
      jumlahMasuk: 0,
      jumlahKeluar: loan.jumlah,
      saldoAkhir: 0,
      approvedByKetua: true,
      createdBy: 'Ketua Umum'
    };
    setTransactions(prev => [feedTx, ...prev]);

    // Sync logged in member balances if applicable
    if (activeMember && activeMember.id === loan.memberId) {
      setActiveMember(prev => prev ? {
        ...prev,
        saldoSukarela: prev.saldoSukarela + loan.jumlah
      } : null);
    }

    const newLog: VisitorLog = {
      id: `log-${Date.now()}`,
      nama: activeMember?.nama || 'Ketua Umum',
      email: activeMember?.email || 'ketua@coop.com',
      role: 'ketua',
      timestamp: new Date().toLocaleTimeString('id-ID') + ' WIB',
      activity: `MENYETUJUI Pencairan Kredit sebesar ${loan.jumlah} an. ${loan.memberName}`
    };
    setVisitorLogs(prev => [newLog, ...prev]);
  };

  const handleStatusRejectLoan = (loanId: string) => {
    setLoans(prev => prev.map(l => l.id === loanId ? { ...l, status: 'rejected' } : l));
  };

  const handleStatusApproveWithdrawal = (withdrawId: string) => {
    const req = withdrawals.find(w => w.id === withdrawId);
    if (!req) return;

    setWithdrawals(prev => prev.map(w => w.id === withdrawId ? { ...w, status: 'approved' } : w));

    // Deduct from member structural balance in list
    setMembers(prev => prev.map(m => {
      if (m.id === req.memberId) {
        if (req.jenisSimpanan === 'Sukarela') {
          return { ...m, saldoSukarela: m.saldoSukarela - req.jumlah };
        } else {
          return { ...m, saldoPenyertaan: m.saldoPenyertaan - req.jumlah };
        }
      }
      return m;
    }));

    // Post outgoing transactional record
    const feedTx: Transaction = {
      id: `tx-withdraw-out-${Date.now()}`,
      tanggal: new Date().toISOString().split('T')[0],
      kategori: 'Uang Keluar',
      sumberTujuan: 'Lainnya',
      deskripsi: `Realisasi pencairan simpanan ${req.jenisSimpanan} disetujui Ketua`,
      noRekening: members.find(m => m.id === req.memberId)?.noRekening || '',
      namaBankPemilik: `Koperasi - ${req.memberName}`,
      jumlahMasuk: 0,
      jumlahKeluar: req.jumlah,
      saldoAkhir: 0,
      approvedByKetua: true,
      createdBy: 'Ketua Umum'
    };
    setTransactions(prev => [feedTx, ...prev]);

    // Sync logged in member reference
    if (activeMember && activeMember.id === req.memberId) {
      setActiveMember(prev => {
        if (!prev) return null;
        if (req.jenisSimpanan === 'Sukarela') {
          return { ...prev, saldoSukarela: prev.saldoSukarela - req.jumlah };
        } else {
          return { ...prev, saldoPenyertaan: prev.saldoPenyertaan - req.jumlah };
        }
      });
    }

    const newLog: VisitorLog = {
      id: `log-${Date.now()}`,
      nama: activeMember?.nama || 'Ketua Umum',
      email: activeMember?.email || 'ketua@coop.com',
      role: 'ketua',
      timestamp: new Date().toLocaleTimeString('id-ID') + ' WIB',
      activity: `MENYETUJUI penarikan dana harian ${req.jumlah} an. ${req.memberName}`
    };
    setVisitorLogs(prev => [newLog, ...prev]);
  };

  const handleStatusRejectWithdrawal = (withdrawId: string) => {
    setWithdrawals(prev => prev.map(w => w.id === withdrawId ? { ...w, status: 'rejected' } : w));
  };

  const handleSaveLMSProgress = async (updatedProgress: LMSUserProgress) => {
    setProgressList(prev => {
      const idx = prev.findIndex(p => p.memberId === updatedProgress.memberId);
      if (idx > -1) {
        const copy = [...prev];
        copy[idx] = updatedProgress;
        return copy;
      } else {
        return [...prev, updatedProgress];
      }
    });
  };

  const handleSaveLMSCourses = async (updatedCourses: LMSCourse[]) => {
    setCourses(updatedCourses);
  };

  const handleLMSLogActivity = (activity: string) => {
    const newLog: VisitorLog = {
      id: `log-${Date.now()}`,
      nama: activeMember ? activeMember.nama : 'Pengunjung Umum',
      email: activeMember ? activeMember.email : 'guest@lms.com',
      role: activeMember ? activeMember.role : 'anggota',
      timestamp: new Date().toLocaleTimeString('id-ID') + ' WIB',
      activity: `LMS: ${activity}`
    };
    setVisitorLogs(prev => [newLog, ...prev]);
  };

  // Determine active view based on log status (and emulation role)
  const resolvedRole: UserRole | null = impersonatedRole || (activeMember ? activeMember.role : null);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#070d19] flex flex-col justify-center items-center text-[#ffffff] font-sans antialiased">
        <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
        <h2 className="mt-8 text-xl font-bold tracking-tight">Koperasi IPPI DPW Jawa Timur</h2>
        <p className="mt-2 text-xs text-indigo-300 font-mono tracking-widest uppercase">Ikatan Profesional & Pensiunan Indonesia</p>
        <p className="mt-4 text-xs text-slate-500">Menghubungkan ke database aman...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col">
      
      {/* 1. MASTER PORTAL DECORATIVE OVERRIDE BRANDING FOR EMULATED VIEW */}
      {impersonatedRole && (
        <div className="bg-yellow-500 text-slate-950 font-black px-4 py-2 text-center text-xs flex justify-between items-center tracking-wider select-none border-b-2 border-slate-900 shadow-sm z-50">
          <span>⚠️ MODE SIMULASI JABATAN AKTIF: <strong className="underline text-blue-900">{impersonatedRole.toUpperCase()}</strong></span>
          <button
            onClick={() => setImpersonatedRole(null)}
            className="px-3 py-1 bg-slate-950 hover:bg-black text-[#ffffff] font-extrabold text-[10px] uppercase rounded transition"
          >
            Kembali ke Sesi Asli ({activeMember?.role.toUpperCase()})
          </button>
        </div>
      )}

      {/* 2. ROUTING CONTROLLER VIEW ENGINE */}
      <div className="flex-1">
        {resolvedRole === null ? (
          <LandingPage
            settings={settings}
            products={products}
            articles={articles}
            announcements={announcements}
            tentangItems={tentangItems}
            layananItems={layananItems}
            galleryItems={galleryItems}
            onOpenAuth={handleOpenAuth}
            guestCart={guestCart}
            setGuestCart={setGuestCart}
            activeMember={activeMember}
            onDeductBalanceForPurchase={handleDeductBalanceForPurchase}
            courses={courses}
            progressList={progressList}
            onSaveProgress={handleSaveLMSProgress}
            onSaveCourses={handleSaveLMSCourses}
            onLogActivity={handleLMSLogActivity}
            members={members}
          />
        ) : (
          <div className="min-h-screen flex flex-col bg-slate-100">
            
            {/* Top Back Nav to Landing for logged members */}
            <header className="bg-indigo-900 text-white h-16 flex items-center shrink-0 border-b border-indigo-800 shadow-md">
              <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 flex justify-between items-center text-xs">
                <div className="flex items-center gap-3 cursor-pointer" onClick={() => setImpersonatedRole(null)}>
                  <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center p-0.5 shadow-sm">
                    <img src={settings.logo} className="w-8 h-8 object-contain" alt="Coop logo mini" />
                  </div>
                  <div>
                    <h1 className="font-bold text-sm sm:text-base leading-tight">Koperasi IPPI DPW Jawa Timur</h1>
                    <p className="text-[10px] uppercase tracking-wider opacity-75 font-semibold">Sistem Portal {resolvedRole.toUpperCase()} - Ikatan Profesional & Pensiunan Indonesia</p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-3 bg-indigo-850 px-3 py-1.5 rounded-lg border border-indigo-800 shrink-0">
                    <div className="text-right">
                      <p className="text-xs font-semibold text-white">{activeMember?.nama}</p>
                      <p className="text-[9px] text-indigo-300 font-medium">Status: Terverifikasi</p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      if (impersonatedRole) {
                        setImpersonatedRole(null);
                      } else {
                        handleLogout();
                      }
                    }}
                    className="p-1.5 px-3 bg-indigo-800 hover:bg-rose-750 text-white font-extrabold uppercase rounded-lg tracking-wide text-[10px] leading-none transition shrink-0"
                  >
                    {impersonatedRole ? "Tutup" : "Keluar"}
                  </button>
                </div>
              </div>
            </header>

            {/* RENDER THE CORRESPONDING PANEL */}
            <div className="flex-1 bg-slate-100">
              {resolvedRole === 'anggota' && (
                <DashboardAnggota
                  member={activeMember!}
                  settings={settings}
                  transactions={transactions}
                  loans={loans}
                  withdrawals={withdrawals}
                  onUpdateProfile={(updatedData) => {
                    handleUpdateMember(activeMember!.id, updatedData);
                  }}
                  onApplyLoan={handleApplyLoan}
                  onApplyWithdrawal={handleApplyWithdrawal}
                  onBuyPPOB={handleBuyPPOB}
                  onLogout={handleLogout}
                  courses={courses}
                  progressList={progressList}
                  onSaveProgress={handleSaveLMSProgress}
                  onSaveCourses={handleSaveLMSCourses}
                  onLogActivity={handleLMSLogActivity}
                  members={members}
                />
              )}

              {resolvedRole === 'admin' && (
                <DashboardAdmin
                  adminMember={activeMember!}
                  settings={settings}
                  members={members}
                  visitorLogs={visitorLogs}
                  products={products}
                  setProducts={setProducts}
                  articles={articles}
                  setArticles={setArticles}
                  tentangItems={tentangItems}
                  setTentangItems={setTentangItems}
                  layananItems={layananItems}
                  setLayananItems={setLayananItems}
                  galleryItems={galleryItems}
                  setGalleryItems={setGalleryItems}
                  onUpdateSettings={handleUpdateSettings}
                  onUpdateMember={handleUpdateMember}
                  onDeleteMember={handleDeleteMember}
                  onAddMember={handleAddMember}
                  onClearLogs={handleClearLogs}
                  onRefreshLogs={handleRefreshLogs}
                  onEmulateRole={handleEmulateRole}
                  courses={courses}
                  progressList={progressList}
                  onSaveProgress={handleSaveLMSProgress}
                  onSaveCourses={handleSaveLMSCourses}
                  onLogActivity={handleLMSLogActivity}
                />
              )}

              {resolvedRole === 'sekretaris' && (
                <DashboardSekretaris
                  secretaryMember={activeMember!}
                  settings={settings}
                  members={members}
                  articles={articles}
                  announcements={announcements}
                  onApproveMember={handleApproveMember}
                  onRejectMember={handleRejectMember}
                  onAddArticle={handleAddArticle}
                  onEditArticle={handleEditArticle}
                  onDeleteArticle={handleDeleteArticle}
                  onAddAnnouncement={handleAddAnnouncement}
                  onEditAnnouncement={handleEditAnnouncement}
                  onDeleteAnnouncement={handleDeleteAnnouncement}
                  onLogout={handleLogout}
                  courses={courses}
                  progressList={progressList}
                  onSaveProgress={handleSaveLMSProgress}
                  onSaveCourses={handleSaveLMSCourses}
                  onLogActivity={handleLMSLogActivity}
                />
              )}

              {resolvedRole === 'ketua' && (
                <DashboardKetua
                  ketuaMember={activeMember!}
                  settings={settings}
                  loans={loans}
                  withdrawals={withdrawals}
                  transactions={transactions}
                  onApproveLoan={handleStatusApproveLoan}
                  onRejectLoan={handleStatusRejectLoan}
                  onApproveWithdrawal={handleStatusApproveWithdrawal}
                  onRejectWithdrawal={handleStatusRejectWithdrawal}
                  onLogout={handleLogout}
                />
              )}

              {resolvedRole === 'bendahara' && (
                <DashboardBendahara
                  bendaharaMember={activeMember!}
                  settings={settings}
                  members={members}
                  transactions={transactions}
                  onAddTransaction={handleAddTransaction}
                  onUpdateMemberBalances={handleUpdateMemberBalances}
                  onLogout={handleLogout}
                />
              )}
            </div>

          </div>
        )}
      </div>

      {/* 3. POPUP MODALS ELEMENT */}
      {showAuthModal && (
        <AuthModal
          onClose={() => setShowAuthModal(false)}
          onLogin={handleLogin}
          onRegister={handleRegister}
          members={members}
          initialTab={authTab}
          settings={settings}
          onSeed={async () => {
            await seedInitialData();
            // Reload all states from newly seeded Firebase collections instantly
            const [
              dbSettings,
              dbMembers,
              dbProducts,
              dbTransactions,
              dbArticles,
              dbAnnouncements,
              dbTentang,
              dbLayanan,
              dbGallery,
              dbLoans,
              dbWithdrawals,
              dbLogs
            ] = await Promise.all([
              getCooperativeSettings(),
              getMembers(),
              getProducts(),
              getTransactions(),
              getArticles(),
              getAnnouncements(),
              getTentangItems(),
              getLayananItems(),
              getGalleryItems(),
              getLoans(),
              getWithdrawals(),
              getVisitorLogs()
            ]);
            setSettings(dbSettings);
            setMembers(dbMembers);
            setProducts(dbProducts);
            setTransactions(dbTransactions);
            setArticles(dbArticles);
            setAnnouncements(dbAnnouncements);
            setTentangItems(dbTentang);
            setLayananItems(dbLayanan);
            setGalleryItems(dbGallery);
            setLoans(dbLoans);
            setWithdrawals(dbWithdrawals);
            setVisitorLogs(dbLogs);
          }}
        />
      )}

      {/* Footer copyright */}
      <footer className="bg-slate-900 border-t border-slate-800 text-slate-500 py-6 text-center text-[10px] tracking-wide select-none">
        <p>© 2026 Koperasi Serba Usaha IPPI DPW Jawa Timur. All Rights Reserved. Hak Cipta dilindungi Undang-Undang RI.</p>
        <p className="mt-1 text-slate-650">Binaan Ikatan Profesional & Pensiunan Indonesia Wilayah Provinsi Jawa Timur | AHU Legal Terdaftar</p>
      </footer>

    </div>
  );
}
