import React, { useState } from 'react';
import { 
  Settings, Users, ShieldAlert, History, RefreshCw, Printer, 
  Trash2, Edit, Plus, FileText, CheckCircle2, UserCheck, Search, Eye, Upload, Wallet, BookOpen, CheckSquare
} from 'lucide-react';
import { Member, Transaction, CooperativeSettings, VisitorLog, StoreProduct, Article, Announcement, TentangItem, LayananItem, GalleryItem, LMSCourse, LMSUserProgress, Regulation, PollSettings, PollCandidate, PollVote } from '../types';
import { DEFAULT_LOGO_SVG } from '../data/defaultData';
// @ts-ignore
import bestBadgeImg from '../assets/images/best_badge_1781354597229.jpg';
import { LMSPortal } from './LMSPortal';

interface DashboardAdminProps {
  adminMember: Member;
  settings: CooperativeSettings;
  members: Member[];
  visitorLogs: VisitorLog[];
  products: StoreProduct[];
  setProducts: React.Dispatch<React.SetStateAction<StoreProduct[]>>;
  articles: Article[];
  setArticles: React.Dispatch<React.SetStateAction<Article[]>>;
  tentangItems: TentangItem[];
  setTentangItems: React.Dispatch<React.SetStateAction<TentangItem[]>>;
  layananItems: LayananItem[];
  setLayananItems: React.Dispatch<React.SetStateAction<LayananItem[]>>;
  galleryItems: GalleryItem[];
  setGalleryItems: React.Dispatch<React.SetStateAction<GalleryItem[]>>;
  onUpdateSettings: (newSettings: Partial<CooperativeSettings>) => void;
  onUpdateMember: (id: string, updatedData: Partial<Member>) => void;
  onDeleteMember: (id: string) => void;
  onAddMember: (memberData: Omit<Member, 'id' | 'saldoPokok' | 'saldoWajib' | 'saldoSukarela' | 'saldoPenyertaan' | 'registeredAt'>) => void;
  onClearLogs: () => void;
  onRefreshLogs: () => void;
  onEmulateRole: (role: string) => void;
  courses: LMSCourse[];
  progressList: LMSUserProgress[];
  onSaveProgress: (updatedProgress: LMSUserProgress) => Promise<void>;
  onSaveCourses: (updatedCourses: LMSCourse[]) => Promise<void>;
  onLogActivity: (activity: string) => void;
  announcements: Announcement[];
  onAddAnnouncement: (ann: Omit<Announcement, 'id' | 'date'>) => void;
  onEditAnnouncement: (id: string, ann: Omit<Announcement, 'id' | 'date'>) => void;
  onDeleteAnnouncement: (id: string) => void;
  regulations: Regulation[];
  onAddRegulation: (reg: Omit<Regulation, 'id'>) => void;
  onEditRegulation: (id: string, reg: Omit<Regulation, 'id'>) => void;
  onDeleteRegulation: (id: string) => void;

  // Polling states
  pollSettings: PollSettings;
  onUpdatePollSettings: (newSettings: PollSettings) => void;
  pollCandidates: PollCandidate[];
  onUpdatePollCandidates: (newCandidates: PollCandidate[]) => void;
  pollVotes: PollVote[];
  onClearPollVotes: () => void;
}

const compressImage = (file: File, maxWidth = 200, maxHeight = 200, quality = 0.7): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(event.target?.result as string);
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);
        const dataUrl = canvas.toDataURL('image/jpeg', quality);
        resolve(dataUrl);
      };
      img.onerror = (err) => {
        reject(err);
      };
      img.src = event.target?.result as string;
    };
    reader.onerror = (err) => {
      reject(err);
    };
    reader.readAsDataURL(file);
  });
};

export const DashboardAdmin: React.FC<DashboardAdminProps> = ({
  adminMember,
  settings,
  members,
  visitorLogs,
  products,
  setProducts,
  articles,
  setArticles,
  tentangItems,
  setTentangItems,
  layananItems,
  setLayananItems,
  galleryItems,
  setGalleryItems,
  onUpdateSettings,
  onUpdateMember,
  onDeleteMember,
  onAddMember,
  onClearLogs,
  onRefreshLogs,
  onEmulateRole,
  courses,
  progressList,
  onSaveProgress,
  onSaveCourses,
  onLogActivity,
  announcements,
  onAddAnnouncement,
  onEditAnnouncement,
  onDeleteAnnouncement,
  regulations,
  onAddRegulation,
  onEditRegulation,
  onDeleteRegulation,
  pollSettings,
  onUpdatePollSettings,
  pollCandidates,
  onUpdatePollCandidates,
  pollVotes,
  onClearPollVotes
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'pengaturan' | 'user' | 'rekening' | 'log' | 'emulasi' | 'cms' | 'lms' | 'pemilu'>('pengaturan');
  
  // Settings Form State
  const [coopName, setCoopName] = useState(settings.namaSekretariat);
  const [coopAddress, setCoopAddress] = useState(settings.alamatSekretariat);
  const [coopIjin, setCoopIjin] = useState(settings.noIjinPendirian);
  const [coopPhone, setCoopPhone] = useState(settings.noTelpWA);
  const [coopEmail, setCoopEmail] = useState(settings.email);
  const [coopLogo, setCoopLogo] = useState(settings.logo);
  const [coopLogoBrand, setCoopLogoBrand] = useState(settings.logoBrand || '');
  const [coopTtdKetua, setCoopTtdKetua] = useState(settings.tandatanganKetua || '');
  const [coopTtdSekretaris, setCoopTtdSekretaris] = useState(settings.tandatanganSekretaris || '');

  // Polling Admin State
  const [pollTitle, setPollTitle] = useState(pollSettings.pollTitle);
  const [pollEndDate, setPollEndDate] = useState(pollSettings.endDate);
  const [isPollActive, setIsPollActive] = useState(pollSettings.isPollingActive);
  const [showResultsToMembers, setShowResultsToMembers] = useState(pollSettings.showResultsToMembers);
  const [editingCandidates, setEditingCandidates] = useState<PollCandidate[]>(pollCandidates);
  const [showResetVotesConfirm, setShowResetVotesConfirm] = useState(false);
  const [candidateToConfirmDelete, setCandidateToConfirmDelete] = useState<string | null>(null);

  // Sync settings and poll when they change dynamically
  React.useEffect(() => {
    setCoopName(settings.namaSekretariat);
    setCoopAddress(settings.alamatSekretariat);
    setCoopIjin(settings.noIjinPendirian);
    setCoopPhone(settings.noTelpWA);
    setCoopEmail(settings.email);
    setCoopLogo(settings.logo);
    setCoopLogoBrand(settings.logoBrand || '');
    setCoopTtdKetua(settings.tandatanganKetua || '');
    setCoopTtdSekretaris(settings.tandatanganSekretaris || '');
  }, [settings]);

  React.useEffect(() => {
    setPollTitle(pollSettings.pollTitle);
    setPollEndDate(pollSettings.endDate);
    setIsPollActive(pollSettings.isPollingActive);
    setShowResultsToMembers(pollSettings.showResultsToMembers);
  }, [pollSettings]);

  React.useEffect(() => {
    setEditingCandidates(pollCandidates);
  }, [pollCandidates]);

  // CMS (Content Management System) Web Pages Editor States
  const [activeCmsTab, setActiveCmsTab] = useState<'tentang' | 'layanan' | 'berita' | 'galeri' | 'produk' | 'pengumuman' | 'kebijakan'>('tentang');
  const [showCmsModal, setShowCmsModal] = useState<boolean>(false);
  const [editingCmsItemId, setEditingCmsItemId] = useState<string | null>(null);
  
  const [cmsForm, setCmsForm] = useState({
    title: '',
    content: '',
    image: '',
    externalUrl: '',
    showOnBeranda: true,
    order: 1,
    badge: '',
    category: 'Tips',
    summary: '',
    harga: 0,
    stok: 10,
    important: false,
  });

  const handleOpenCmsEdit = (item: any) => {
    setEditingCmsItemId(item.id);
    setCmsForm({
      title: item.title || item.nama || '',
      content: item.content || item.description || item.deskripsi || '',
      image: item.image || '',
      externalUrl: item.externalUrl || '',
      showOnBeranda: item.showOnBeranda !== undefined ? item.showOnBeranda : true,
      order: item.order !== undefined ? item.order : 1,
      badge: item.badge || '',
      category: item.category || (activeCmsTab === 'produk' ? 'Swalayan' : 'Tips'),
      summary: item.summary || '',
      harga: item.harga || 0,
      stok: item.stok !== undefined ? item.stok : 10,
      important: item.important || false,
    });
    setShowCmsModal(true);
  };

  const handleOpenCmsAdd = () => {
    setEditingCmsItemId(null);
    setCmsForm({
      title: '',
      content: '',
      image: '',
      externalUrl: '',
      showOnBeranda: true,
      order: 1,
      badge: '',
      category: activeCmsTab === 'produk' ? 'Swalayan' : 'Tips',
      summary: '',
      harga: 0,
      stok: 10,
      important: false,
    });
    setShowCmsModal(true);
  };

  const handlePhotoUploadCms = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert("Ukuran file maksimal adalah 2MB!");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setCmsForm(prev => ({ ...prev, image: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCmsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cmsForm.title) {
      alert("Judul atau Nama wajib diisi!");
      return;
    }

    const payloadId = editingCmsItemId || `cms-${Date.now()}`;
    
    if (activeCmsTab === 'tentang') {
      const newItem: TentangItem = {
        id: payloadId,
        title: cmsForm.title,
        content: cmsForm.content,
        image: cmsForm.image || 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&q=80&w=400',
        externalUrl: cmsForm.externalUrl || undefined,
        showOnBeranda: cmsForm.showOnBeranda,
        order: Number(cmsForm.order) || 1,
      };

      if (editingCmsItemId) {
        setTentangItems(prev => prev.map(item => item.id === editingCmsItemId ? newItem : item));
      } else {
        setTentangItems(prev => [...prev, newItem]);
      }
      alert("Item Halaman Tentang Kami berhasil disimpan!");

    } else if (activeCmsTab === 'layanan') {
      const newItem: LayananItem = {
        id: payloadId,
        title: cmsForm.title,
        content: cmsForm.content,
        image: cmsForm.image || 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=400',
        badge: cmsForm.badge || undefined,
        externalUrl: cmsForm.externalUrl || undefined,
        showOnBeranda: cmsForm.showOnBeranda,
        order: Number(cmsForm.order) || 1,
      };

      if (editingCmsItemId) {
        setLayananItems(prev => prev.map(item => item.id === editingCmsItemId ? newItem : item));
      } else {
        setLayananItems(prev => [...prev, newItem]);
      }
      alert("Unit Layanan Koperasi berhasil disimpan!");

    } else if (activeCmsTab === 'berita') {
      const newItem: Article = {
        id: payloadId,
        title: cmsForm.title,
        content: cmsForm.content,
        summary: cmsForm.summary || cmsForm.content.slice(0, 100),
        category: cmsForm.category || 'Tips',
        date: new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }),
        image: cmsForm.image || 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&q=80&w=400',
        externalUrl: cmsForm.externalUrl || undefined,
        showOnBeranda: cmsForm.showOnBeranda,
        order: Number(cmsForm.order) || 1,
      };

      if (editingCmsItemId) {
        setArticles(prev => prev.map(item => item.id === editingCmsItemId ? newItem : item));
      } else {
        setArticles(prev => [...prev, newItem]);
      }
      alert("Berita & Artikel kegiatan berhasil disimpan!");

    } else if (activeCmsTab === 'galeri') {
      const newItem: GalleryItem = {
        id: payloadId,
        title: cmsForm.title,
        description: cmsForm.content,
        image: cmsForm.image || 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&q=80&w=400',
        externalUrl: cmsForm.externalUrl || undefined,
        showOnBeranda: cmsForm.showOnBeranda,
        order: Number(cmsForm.order) || 1,
      };

      if (editingCmsItemId) {
        setGalleryItems(prev => prev.map(item => item.id === editingCmsItemId ? newItem : item));
      } else {
        setGalleryItems(prev => [...prev, newItem]);
      }
      alert("Dokumentasi Galeri & Foto berhasil disimpan!");

    } else if (activeCmsTab === 'produk') {
      const newItem: StoreProduct = {
        id: payloadId,
        nama: cmsForm.title,
        deskripsi: cmsForm.content,
        harga: Number(cmsForm.harga) || 0,
        kategori: cmsForm.category || 'Swalayan',
        stok: Number(cmsForm.stok) || 10,
        image: cmsForm.image || 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=400',
        externalUrl: cmsForm.externalUrl || undefined,
        showOnBeranda: cmsForm.showOnBeranda,
        order: Number(cmsForm.order) || 1,
      };

      if (editingCmsItemId) {
        setProducts(prev => prev.map(item => item.id === editingCmsItemId ? newItem : item));
      } else {
        setProducts(prev => [...prev, newItem]);
      }
      alert("Katalog Produk Swalayan Koperasi berhasil disimpan!");
    } else if (activeCmsTab === 'pengumuman') {
      if (editingCmsItemId) {
        onEditAnnouncement(editingCmsItemId, {
          title: cmsForm.title,
          content: cmsForm.content,
          important: cmsForm.important
        });
      } else {
        onAddAnnouncement({
          title: cmsForm.title,
          content: cmsForm.content,
          important: cmsForm.important
        });
      }
      alert("Pengumuman Resmi Koperasi berhasil disimpan!");
    } else if (activeCmsTab === 'kebijakan') {
      if (editingCmsItemId) {
        onEditRegulation(editingCmsItemId, {
          title: cmsForm.title,
          content: cmsForm.content,
          order: Number(cmsForm.order) || 1
        });
      } else {
        onAddRegulation({
          title: cmsForm.title,
          content: cmsForm.content,
          order: Number(cmsForm.order) || 1
        });
      }
      alert("Kebijakan & Regulasi Resmi berhasil disimpan!");
    }

    setShowCmsModal(false);
    setEditingCmsItemId(null);
  };

  const handleCmsDelete = (id: string) => {
    if (!confirm("Apakah Anda yakin ingin menghapus item ini? Tindakan ini tidak dapat dibatalkan.")) return;
    
    if (activeCmsTab === 'tentang') {
      setTentangItems(prev => prev.filter(item => item.id !== id));
    } else if (activeCmsTab === 'layanan') {
      setLayananItems(prev => prev.filter(item => item.id !== id));
    } else if (activeCmsTab === 'berita') {
      setArticles(prev => prev.filter(item => item.id !== id));
    } else if (activeCmsTab === 'galeri') {
      setGalleryItems(prev => prev.filter(item => item.id !== id));
    } else if (activeCmsTab === 'produk') {
      setProducts(prev => prev.filter(item => item.id !== id));
    } else if (activeCmsTab === 'pengumuman') {
      onDeleteAnnouncement(id);
    } else if (activeCmsTab === 'kebijakan') {
      onDeleteRegulation(id);
    }
    alert("Item berhasil dihapus!");
  };

  // User list search & filter
  const [userSearchText, setUserSearchText] = useState('');
  
  // User Add/Edit Modal States
  const [showUserModal, setShowUserModal] = useState<boolean>(false);
  const [selectedUserForEdit, setSelectedUserForEdit] = useState<Member | null>(null);

  // Form add member
  const [userForm, setUserForm] = useState({
    nama: '',
    tempatLahir: '',
    tanggalLahir: '',
    institusiPensiun: '',
    jenisKelamin: 'Laki-Laki' as 'Laki-Laki' | 'Perempuan',
    agama: 'Islam' as 'Islam' | 'Kristen' | 'Budha' | 'Hindu' | 'Konghucu' | 'Kepercayaan',
    pekerjaanKeahlian: '',
    noHp: '',
    email: '',
    alamatLengkap: '',
    password: 'password',
    photo: '',
    role: 'anggota' as any,
    status: 'approved' as any
  });

  const handleUpdateSettings = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateSettings({
      namaSekretariat: coopName,
      alamatSekretariat: coopAddress,
      noIjinPendirian: coopIjin,
      noTelpWA: coopPhone,
      email: coopEmail,
      logo: coopLogo,
      logoBrand: coopLogoBrand,
      tandatanganKetua: coopTtdKetua,
      tandatanganSekretaris: coopTtdSekretaris
    });
    alert("Pengaturan Koperasi Berhasil Diperbarui!");
  };

  const handleLogoUploadInSettings = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert("Ukuran file logo maksimal adalah 2MB!");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setCoopLogo(reader.result as string);
        onUpdateSettings({ logo: reader.result as string });
        alert("Logo Koperasi diperbarui!");
      };
      reader.readAsDataURL(file);
    }
  };

  const handleResetLogo = () => {
    if (window.confirm("Apakah Anda yakin ingin mengembalikan logo koperasi ke default?")) {
      setCoopLogo(DEFAULT_LOGO_SVG);
      onUpdateSettings({ logo: DEFAULT_LOGO_SVG });
      alert("Logo Koperasi telah dikembalikan ke default!");
    }
  };

  const handleLogoBrandUploadInSettings = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert("Ukuran file logo brand maksimal adalah 2MB!");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setCoopLogoBrand(reader.result as string);
        onUpdateSettings({ logoBrand: reader.result as string });
        alert("Logo Brand Sertifikat diperbarui!");
      };
      reader.readAsDataURL(file);
    }
  };

  const handleResetLogoBrand = () => {
    if (window.confirm("Apakah Anda yakin ingin mengembalikan logo brand sertifikat ke default?")) {
      setCoopLogoBrand('');
      onUpdateSettings({ logoBrand: '' });
      alert("Logo Brand Sertifikat telah dikembalikan ke default!");
    }
  };

  const handleTtdKetuaUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert("Ukuran file tanda tangan Ketua maksimal adalah 2MB!");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setCoopTtdKetua(reader.result as string);
        onUpdateSettings({ tandatanganKetua: reader.result as string });
        alert("Tanda tangan Ketua berhasil diupload!");
      };
      reader.readAsDataURL(file);
    }
  };

  const handleTtdSekretarisUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert("Ukuran file tanda tangan Sekretaris maksimal adalah 2MB!");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setCoopTtdSekretaris(reader.result as string);
        onUpdateSettings({ tandatanganSekretaris: reader.result as string });
        alert("Tanda tangan Sekretaris berhasil diupload!");
      };
      reader.readAsDataURL(file);
    }
  };

  const handleResetTtdKetua = () => {
    setCoopTtdKetua('');
    onUpdateSettings({ tandatanganKetua: '' });
    alert("Tanda tangan Ketua dikosongkan!");
  };

  const handleResetTtdSekretaris = () => {
    setCoopTtdSekretaris('');
    onUpdateSettings({ tandatanganSekretaris: '' });
    alert("Tanda tangan Sekretaris dikosongkan!");
  };

  const handlePrintKopSurat = () => {
    const printWindow = window.open('', '', 'width=800,height=500');
    if (!printWindow) return;
    
    printWindow.document.write('<html><head><title>Print Kop Surat Resmi</title>');
    printWindow.document.write('<link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">');
    printWindow.document.write('<style>body { padding: 40px; font-family: sans-serif; }</style>');
    printWindow.document.write('</head><body>');
    printWindow.document.write(`
      <div class="border-b-4 border-double border-slate-900 pb-5 mb-6 text-center select-none">
        <table class="w-full">
          <tr>
            <td class="w-1/6 text-center">
              <img src="${settings.logo}" class="h-24 w-24 object-contain inline-block" />
            </td>
            <td class="w-5/6 pl-4 text-center">
              <h2 class="text-xs font-black uppercase tracking-widest text-amber-600 block leading-none">KOPERASI JASA SERBA USAHA</h2>
              <h1 class="text-2xl font-black text-blue-900 leading-tight">IKATAN PROFESIONAL & PENSIUNAN INDONESIA (IPPI)</h1>
              <p class="text-lg font-bold text-slate-800">DPW PROVINSI JAWA TIMUR</p>
              <p class="text-xs text-slate-500 font-medium leading-relaxed">${settings.alamatSekretariat}</p>
              <p class="text-[10px] text-slate-400 font-mono mt-1">
                Kemenkop RI BH: ${settings.noIjinPendirian} | Telp/WA: ${settings.noTelpWA} | Email: ${settings.email}
              </p>
            </td>
          </tr>
        </table>
      </div>
      <div class="mt-20 leading-relaxed text-xs text-slate-400 text-center italic">
        --- Batas Bawah Kop Surat Resmi (Selesai Print) ---
      </div>
    `);
    printWindow.document.write('</body></html>');
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 500);
  };

  const handleAddEditUserSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userForm.nama || !userForm.noHp || !userForm.email) {
      alert("Nama, Handphone, dan Email wajib diisi.");
      return;
    }

    if (selectedUserForEdit) {
      // Edit
      onUpdateMember(selectedUserForEdit.id, userForm);
      alert("Detail akun pengguna berhasil diupdate!");
    } else {
      // Add
      onAddMember(userForm);
      alert("Anggota Koperasi Baru Berhasil Diinstal!");
    }

    setShowUserModal(false);
    setSelectedUserForEdit(null);
    // Reset Form
    setUserForm({
      nama: '', tempatLahir: '', tanggalLahir: '', institusiPensiun: '',
      jenisKelamin: 'Laki-Laki', agama: 'Islam', pekerjaanKeahlian: '',
      noHp: '', email: '', alamatLengkap: '', password: 'password', photo: '',
      role: 'anggota', status: 'approved'
    });
  };

  const handleOpenEditUserModal = (u: Member) => {
    setSelectedUserForEdit(u);
    setUserForm({
      nama: u.nama,
      tempatLahir: u.tempatLahir,
      tanggalLahir: u.tanggalLahir,
      institusiPensiun: u.institusiPensiun,
      jenisKelamin: u.jenisKelamin,
      agama: u.agama,
      pekerjaanKeahlian: u.pekerjaanKeahlian,
      noHp: u.noHp,
      email: u.email,
      alamatLengkap: u.alamatLengkap,
      password: u.password || 'password',
      photo: u.photo || '',
      role: u.role,
      status: u.status
    });
    setShowUserModal(true);
  };

  const handlePhotoUploadUserForm = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      compressImage(file, 200, 200, 0.7)
        .then((compressedBase64) => {
          setUserForm(prev => ({ ...prev, photo: compressedBase64 }));
        })
        .catch((err) => {
          console.error("Gagal mengompresi foto: ", err);
          alert("Gagal memproses gambar. Coba gambar lain.");
        });
    }
  };

  // Searching users
  const searchedMembers = members.filter(m => 
    m.nama.toLowerCase().includes(userSearchText.toLowerCase()) ||
    m.noAnggota?.includes(userSearchText) ||
    m.noRekening?.includes(userSearchText) ||
    m.role.toLowerCase().includes(userSearchText.toLowerCase())
  );

  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(val);
  };

  return (
    <div className="bg-slate-50 min-h-screen pb-12 animate-fade-in text-xs text-slate-800">
      
      {/* SECTION BANNER HERO */}
      <div className="bg-slate-900 border-b-4 border-yellow-500 text-white p-6 sm:p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <span className="text-[10px] bg-yellow-500 text-slate-950 font-black px-2 py-0.5 rounded-full select-none uppercase tracking-widest">Akses Admin Utama</span>
          <h2 className="text-xl sm:text-2xl font-black text-white mt-1 uppercase">SISTEM ADMINISTRATIF KOPERASI JASA IPPI</h2>
          <p className="text-slate-400 text-xs mt-0.5">Mempunyai akses penuh mengontrol log data, user, legalitas kop, dan balance sheet.</p>
        </div>

        <button
          onClick={handlePrintKopSurat}
          className="flex items-center gap-1.5 px-4 py-2.5 bg-[#dca415] hover:bg-yellow-600 font-extrabold text-[#000000] rounded-lg tracking-wider text-xs uppercase cursor-pointer"
        >
          <Printer className="w-4 h-4" /> Cetak Kop Surat Resmi
        </button>
      </div>

      {/* DASH PANEL TABS */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        <div className="flex border-b border-slate-200 bg-white p-2.5 rounded-xl border flex-wrap gap-1.5">
          {[
            { id: 'pengaturan', lbl: 'Pengaturan Koperasi', icon: <Settings className="w-4 h-4" /> },
            { id: 'cms', lbl: 'Kelola Konten & Beranda', icon: <FileText className="w-4 h-4" /> },
            { id: 'user', lbl: 'Kelola User / Pengguna', icon: <Users className="w-4 h-4" /> },
            { id: 'lms', lbl: 'Pengaturan Kurikulum LMS', icon: <BookOpen className="w-4 h-4" /> },
            { id: 'pemilu', lbl: 'Pengaturan Polling / Pemilu', icon: <CheckSquare className="w-4 h-4" /> },
            { id: 'rekening', lbl: 'Otoritas No Rekening', icon: <Wallet className="w-4 h-4" /> },
            { id: 'log', lbl: 'Log Visitor & Aktivitas', icon: <History className="w-4 h-4" /> },
            { id: 'emulasi', lbl: 'Emulasi Role Pengawas', icon: <UserCheck className="w-4 h-4" /> }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id as any)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-black uppercase tracking-wide leading-none transition-all cursor-pointer ${
                activeSubTab === tab.id 
                  ? 'bg-blue-900 text-white shadow-sm' 
                  : 'text-slate-600 hover:bg-slate-50 hover:text-blue-900'
              }`}
            >
              {tab.icon}
              {tab.lbl}
            </button>
          ))}
        </div>

        {/* ================= TAB 1: EDIT SECRETARY SETTINGS ================= */}
        {activeSubTab === 'pengaturan' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-6">
            <div className="lg:col-span-8 bg-white border rounded-xl p-6 shadow-xs space-y-6">
              <h3 className="text-sm font-black border-b border-slate-100 pb-2.5 uppercase tracking-wide text-blue-950">
                Informasi & Legalitas Kantor Sekretariat (Kop / Profil)
              </h3>

              <form onSubmit={handleUpdateSettings} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 mb-1 uppercase">Nama Sekretariat Wilayah</label>
                  <input
                    type="text"
                    required
                    className="w-full text-xs p-2.5 bg-slate-50 border border-slate-350 rounded-lg outline-none focus:border-blue-900"
                    value={coopName}
                    onChange={(e) => setCoopName(e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-500 mb-1 uppercase">Nomor Izin Pendirian / Legalitas</label>
                  <input
                    type="text"
                    required
                    className="w-full text-xs p-2.5 bg-slate-50 border border-slate-350 rounded-lg font-mono outline-none focus:border-blue-900"
                    value={coopIjin}
                    onChange={(e) => setCoopIjin(e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-500 mb-1 uppercase">No Telp / WhatsApp Sekretaris</label>
                  <input
                    type="text"
                    required
                    className="w-full text-xs p-2.5 bg-slate-50 border border-slate-350 rounded-lg font-mono outline-none focus:border-blue-900"
                    value={coopPhone}
                    onChange={(e) => setCoopPhone(e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-500 mb-1 uppercase">Kontak Email Koperasi</label>
                  <input
                    type="email"
                    required
                    className="w-full text-xs p-2.5 bg-slate-50 border border-slate-350 rounded-lg outline-none focus:border-blue-900"
                    value={coopEmail}
                    onChange={(e) => setCoopEmail(e.target.value)}
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-[10px] font-bold text-slate-500 mb-1 uppercase">Alamat Lengkap Kantor Sekretariat</label>
                  <textarea
                    required
                    rows={3}
                    className="w-full text-xs p-2.5 bg-slate-50 border border-slate-350 rounded-lg outline-none focus:border-blue-900"
                    value={coopAddress}
                    onChange={(e) => setCoopAddress(e.target.value)}
                  />
                </div>

                <div className="sm:col-span-2 flex justify-end gap-2 pt-2 border-t border-slate-100">
                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-blue-900 hover:bg-blue-950 text-white font-extrabold rounded-lg tracking-wider uppercase leading-none cursor-pointer"
                  >
                    Simpan & Perbarui Global Settings
                  </button>
                </div>
              </form>
            </div>

             {/* Logo and Signatures column */}
             <div className="lg:col-span-4 space-y-6">
               {/* Logo upload block */}
               <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs flex flex-col items-center justify-between space-y-6">
                 <div className="text-center">
                   <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Logo Lambang Koperasi</h4>
                   <div className="w-36 h-36 border border-slate-200 rounded-full p-2 bg-slate-50 flex items-center justify-center overflow-hidden mx-auto mt-4 shadow-sm">
                     <img src={coopLogo} className="w-full h-full object-contain" alt="Coop Logo Preview" />
                   </div>
                   <p className="text-[10px] text-slate-500 mt-2 max-w-[180px] mx-auto leading-relaxed font-sans">
                     Kop surat dan KTA menggunakan logo resmi Koperasi ini secara real-time.
                   </p>
                 </div>

                 <div className="w-full space-y-2">
                   <label className="w-full flex items-center justify-center gap-2 py-3 bg-slate-900 hover:bg-black text-[#ffffff] font-extrabold rounded-lg text-xs uppercase cursor-pointer select-none">
                     <Upload className="w-4 h-4 text-slate-400" />
                     Upload Logo Baru
                     <input type="file" accept="image/*" className="hidden" onChange={handleLogoUploadInSettings} />
                   </label>
                   <button
                     type="button"
                     onClick={handleResetLogo}
                     className="w-full py-2.5 bg-slate-50 hover:bg-slate-100 text-slate-700 font-extrabold rounded-lg text-[10px] uppercase cursor-pointer select-none border border-slate-300"
                   >
                     Reset Logo Ke Default
                   </button>
                 </div>

                {/* Logo Brand upload block */}
                <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs flex flex-col items-center justify-between space-y-6">
                  <div className="text-center">
                    <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Logo Brand Sertifikat (Kanan Atas)</h4>
                    <div className="w-36 h-36 border border-slate-200 rounded-full p-2 bg-slate-50 flex items-center justify-center overflow-hidden mx-auto mt-4 shadow-sm">
                      <img src={coopLogoBrand || bestBadgeImg} className="w-full h-full object-contain" alt="Brand Logo Preview" />
                    </div>
                    <p className="text-[10px] text-slate-500 mt-2 max-w-[180px] mx-auto leading-relaxed font-sans">
                      Disematkan di pojok kanan atas seluruh lembaran Sertifikat Kelulusan resmi.
                    </p>
                  </div>

                  <div className="w-full space-y-2">
                    <label className="w-full flex items-center justify-center gap-2 py-3 bg-slate-900 hover:bg-black text-[#ffffff] font-extrabold rounded-lg text-xs uppercase cursor-pointer select-none">
                      <Upload className="w-4 h-4 text-slate-400" />
                      Upload Brand Baru
                      <input type="file" accept="image/*" className="hidden" onChange={handleLogoBrandUploadInSettings} />
                    </label>
                    <button
                      type="button"
                      onClick={handleResetLogoBrand}
                      className="w-full py-2.5 bg-slate-50 hover:bg-slate-100 text-slate-700 font-extrabold rounded-lg text-[10px] uppercase cursor-pointer select-none border border-slate-300"
                    >
                      Reset Brand Ke Default
                    </button>
                  </div>
                </div>
               </div>

               {/* Signatures upload block */}
               <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-6">
                 <div>
                   <h4 className="text-[11px] font-black uppercase text-blue-950 tracking-wider">Tanda Tangan Pengurus (LMS)</h4>
                   <p className="text-[10px] text-slate-500 mt-1 leading-relaxed">
                     Upload gambar tanda tangan digital transparan (PNG/SVG) untuk disematkan otomatis pada cetakan Sertifikat Kelulusan.
                   </p>
                 </div>

                 {/* TTD Ketua */}
                 <div className="border border-slate-150 rounded-xl p-4 bg-slate-50/50 space-y-3">
                   <div className="flex justify-between items-center pb-2 border-b border-slate-155">
                     <span className="text-[10px] font-black text-slate-600 uppercase tracking-wider">Tanda Tangan Ketua</span>
                     {coopTtdKetua && (
                       <button
                         type="button"
                         onClick={handleResetTtdKetua}
                         className="text-[9px] text-red-650 hover:underline font-bold"
                       >
                         Kosongkan
                       </button>
                     )}
                   </div>
                   <div className="h-16 border border-slate-200 rounded-lg bg-white flex items-center justify-center overflow-hidden p-2 shadow-xs relative">
                     {coopTtdKetua ? (
                       <img src={coopTtdKetua} className="max-h-full max-w-full object-contain" alt="Tanda Tangan Ketua" />
                     ) : (
                       <span className="text-[10px] text-slate-400 italic font-mono">[ Belum Diupload / Kosong ]</span>
                     )}
                   </div>
                   <label className="w-full flex items-center justify-center gap-1.5 py-2 bg-slate-900 hover:bg-black text-[#ffffff] font-extrabold rounded-lg text-[10px] uppercase cursor-pointer select-none">
                     <Upload className="w-3.5 h-3.5 text-slate-400" />
                     Upload TTD Ketua
                     <input type="file" accept="image/*" className="hidden" onChange={handleTtdKetuaUpload} />
                   </label>
                 </div>

                 {/* TTD Sekretaris */}
                 <div className="border border-slate-150 rounded-xl p-4 bg-slate-50/50 space-y-3">
                   <div className="flex justify-between items-center pb-2 border-b border-slate-155">
                     <span className="text-[10px] font-black text-slate-600 uppercase tracking-wider">Tanda Tangan Sekretaris</span>
                     {coopTtdSekretaris && (
                       <button
                         type="button"
                         onClick={handleResetTtdSekretaris}
                         className="text-[9px] text-red-650 hover:underline font-bold"
                       >
                         Kosongkan
                       </button>
                     )}
                   </div>
                   <div className="h-16 border border-slate-200 rounded-lg bg-white flex items-center justify-center overflow-hidden p-2 shadow-xs relative">
                     {coopTtdSekretaris ? (
                       <img src={coopTtdSekretaris} className="max-h-full max-w-full object-contain" alt="Tanda Tangan Sekretaris" />
                     ) : (
                       <span className="text-[10px] text-slate-400 italic font-mono">[ Belum Diupload / Kosong ]</span>
                     )}
                   </div>
                   <label className="w-full flex items-center justify-center gap-1.5 py-2 bg-slate-900 hover:bg-black text-[#ffffff] font-extrabold rounded-lg text-[10px] uppercase cursor-pointer select-none">
                     <Upload className="w-3.5 h-3.5 text-slate-400" />
                     Upload TTD Sekretaris
                     <input type="file" accept="image/*" className="hidden" onChange={handleTtdSekretarisUpload} />
                   </label>
                 </div>
               </div>
             </div>
          </div>
        )}

        {/* ================= TAB 2: USER MANAGEMENT (KELOLA USER) ================= */}
        {activeSubTab === 'user' && (
          <div className="bg-white border rounded-xl p-6 shadow-xs mt-6 space-y-4">
            
            <div className="flex flex-col sm:flex-row justify-between items-center gap-3">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 bg-blue-900 rounded-full"></span>
                <span className="text-sm font-extrabold text-blue-950 uppercase tracking-tight">Kolektabilitas Anggota & Pengurus Koperasi ({members.length})</span>
              </div>

              <div className="flex gap-2 w-full sm:w-auto">
                <div className="relative flex-1 sm:flex-initial">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400"><Search className="w-4.5 h-4.5" /></span>
                  <input
                    type="text"
                    placeholder="Cari user (nama, role).."
                    value={userSearchText}
                    onChange={(e) => setUserSearchText(e.target.value)}
                    className="pl-9 pr-4 py-2 w-full sm:w-56 bg-slate-50 border border-slate-300 rounded-lg outline-none text-xs focus:bg-white focus:border-blue-900"
                  />
                </div>
                <button
                  onClick={() => { setSelectedUserForEdit(null); setUserForm({ nama: '', tempatLahir: '', tanggalLahir: '', institusiPensiun: '', jenisKelamin: 'Laki-Laki', agama: 'Islam', pekerjaanKeahlian: '', noHp: '', email: '', alamatLengkap: '', password: 'password', photo: '', role: 'anggota', status: 'approved' }); setShowUserModal(true); }}
                  className="px-3 py-2 bg-blue-900 hover:bg-blue-950 text-white font-bold rounded-lg flex items-center gap-1.5 text-xs select-none cursor-pointer"
                >
                  <Plus className="w-4.5 h-4.5" /> Tambah User
                </button>
              </div>
            </div>

            {/* USER REPETITION WARNING CONTROL LIST */}
            <div className="overflow-x-auto">
              <table className="w-full text-left font-sans text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-slate-400 uppercase tracking-widest text-[9px] border-b">
                    <th className="py-2.5 px-3">Avatar/Foto</th>
                    <th className="py-2.5 px-3">Nama Anggota (Gelar)</th>
                    <th className="py-2.5 px-3">No. Anggota / HP</th>
                    <th className="py-2.5 px-3">Email & Institusi</th>
                    <th className="py-2.5 px-3">Peran / Role</th>
                    <th className="py-2.5 px-3">Status Verif</th>
                    <th className="py-2.5 px-3 text-right">Tindakan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {searchedMembers.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="text-center py-6 text-slate-400 font-sans text-xs italic">
                        Pengguna terdaftar tidak ditemukan dalam sistem.
                      </td>
                    </tr>
                  ) : (
                    searchedMembers.map((u) => (
                      <tr key={u.id} className="hover:bg-slate-50 transition">
                        <td className="py-2.5 px-3">
                          <img src={u.photo || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=60"} className="w-9 h-9 object-cover rounded border border-slate-350" alt="avatar" />
                        </td>
                        <td className="py-2.5 px-3 font-bold text-slate-900">{u.nama}</td>
                        <td className="py-2.5 px-3 font-mono">
                          <p className="text-yellow-600 font-black">{u.noAnggota || 'PENDING'}</p>
                          <p>{u.noHp}</p>
                        </td>
                        <td className="py-2.5 px-3 leading-relaxed">
                          <p className="font-semibold text-slate-900">{u.email}</p>
                          <p className="text-[10px] text-slate-400 truncate max-w-[150px]">{u.institusiPensiun}</p>
                        </td>
                        <td className="py-2.5 px-3 uppercase text-[10px] font-black tracking-wider text-blue-950 font-mono">{u.role}</td>
                        <td className="py-2.5 px-3 uppercase text-[10px]">
                          <span className={`px-2 py-0.5 font-bold rounded-full text-[9px] ${
                            u.status === 'approved' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-amber-50 text-amber-700 border border-amber-200'
                          }`}>
                            {u.status}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-right space-x-1 whitespace-nowrap">
                          <button
                            onClick={() => handleOpenEditUserModal(u)}
                            className="p-1 px-2.5 text-blue-700 hover:bg-blue-50 border border-blue-200 hover:text-blue-900 rounded font-bold cursor-pointer"
                            title="Edit"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => {
                              if (confirm(`Apakah Anda yakin ingin menghapus akun ${u.nama}? Tindakan ini tidak dapat dibatalkan.`)) {
                                onDeleteMember(u.id);
                              }
                            }}
                            className="p-1 px-2 text-red-600 hover:bg-red-50 border border-red-200 hover:text-red-800 rounded font-bold cursor-pointer"
                            title="Hapus"
                          >
                            Hapus
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

          </div>
        )}

        {/* ================= TAB 3: ACCOUNT NUMBER OVERSIGHT (PENGAWASAN REKENING) ================= */}
        {activeSubTab === 'rekening' && (
          <div className="bg-white border rounded-xl p-6 shadow-xs mt-6 space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-sm font-black uppercase text-blue-950">Otoritas & Pengawasan Transaksi Nomor Rekening Anggota</h3>
                <p className="text-slate-500 text-[11px]">Memantau alokasi saldo simpanan wajib, pokok, sukarela dan total panyertaan per nomor rekening.</p>
              </div>
              <span className="p-2 py-1 bg-yellow-100 text-yellow-900 border border-yellow-300 font-extrabold uppercase rounded-lg text-[10px]">
                Pre: 999xxxxxx
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse font-sans">
                <thead>
                  <tr className="bg-slate-50 text-slate-450 uppercase tracking-widest text-[9px] border-b">
                    <th className="py-2.5 px-3">No. Rekening</th>
                    <th className="py-2.5 px-3">Nama Anggota</th>
                    <th className="py-2.5 px-3 text-right">S. Pokok (Rp)</th>
                    <th className="py-2.5 px-3 text-right">S. Wajib (Rp)</th>
                    <th className="py-2.5 px-3 text-right">S. Sukarela (Rp)</th>
                    <th className="py-2.5 px-3 text-right">Penyertaan (Rp)</th>
                    <th className="py-2.5 px-3 text-right font-black">Total Kekayaan (Rp)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {members.filter(m => m.role === 'anggota' || m.noRekening).map((m) => {
                    const total = m.saldoPokok + m.saldoWajib + m.saldoSukarela + m.saldoPenyertaan;
                    return (
                      <tr key={m.id} className="hover:bg-slate-50 transition font-sans">
                        <td className="py-3 px-3 font-mono font-bold text-blue-900 tracking-wider">
                          {m.noRekening || 'Belum Terbit (Pending)'}
                        </td>
                        <td className="py-3 px-3">
                          <p className="font-bold text-slate-800 leading-none">{m.nama}</p>
                          <p className="text-[10px] text-slate-400 mt-1">No Anggota: {m.noAnggota || '-'}</p>
                        </td>
                        <td className="py-3 px-3 text-right font-mono text-slate-600">{formatRupiah(m.saldoPokok)}</td>
                        <td className="py-3 px-3 text-right font-mono text-slate-600">{formatRupiah(m.saldoWajib)}</td>
                        <td className="py-3 px-3 text-right font-mono text-emerald-600 font-bold">{formatRupiah(m.saldoSukarela)}</td>
                        <td className="py-3 px-3 text-right font-mono text-purple-600">{formatRupiah(m.saldoPenyertaan)}</td>
                        <td className="py-3 px-3 text-right font-mono font-black text-blue-950 bg-slate-50/50">{formatRupiah(total)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ================= TAB 4: LOG VISITOR & REFRESH ================= */}
        {activeSubTab === 'log' && (
          <div className="bg-white border rounded-xl p-6 shadow-xs mt-6 space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-sm font-black uppercase text-blue-950 flex items-center gap-1.5">
                  <History className="w-5 h-5 text-yellow-600 animate-pulse" /> Telemetri Monitor Akses Login & Aktivitas Audit
                </h3>
                <p className="text-slate-500 text-[11px]">Merinci nama pengurus/anggota yang sedang login, logout, atau mendaftarkan transaksi dengan cap waktu.</p>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={onRefreshLogs}
                  className="flex items-center gap-1.5 px-3 py-2 bg-slate-900 text-white font-bold rounded-lg text-xs leading-none uppercase transition active:scale-95 cursor-pointer hover:bg-black"
                >
                  <RefreshCw className="w-3.5 h-3.5" /> Refresh Real-time
                </button>
                <button
                  onClick={onClearLogs}
                  className="px-3 py-2 text-red-600 hover:bg-red-50 border border-red-200 rounded-lg text-[10.5px] font-bold"
                >
                  Clear Logs
                </button>
              </div>
            </div>

            <div className="overflow-y-auto max-h-96 pr-2">
              <div className="divide-y divide-slate-100">
                {visitorLogs.length === 0 ? (
                  <p className="text-center py-10 text-slate-400 text-xs italic">Belum ada kunjungan telemetri audit log terpantau dalam sesi ini.</p>
                ) : (
                  visitorLogs.map((log) => (
                    <div key={log.id} className="py-3 flex hover:bg-slate-50 p-2 rounded transition justify-between items-center text-xs font-sans">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-extrabold text-slate-900 uppercase font-mono">{log.nama}</span>
                          <span className={`px-1.5 py-0.5 rounded text-[8px] uppercase tracking-wide font-black ${
                            log.role === 'admin' ? 'bg-red-100 text-red-700' :
                            log.role === 'bendahara' ? 'bg-purple-100 text-purple-700' :
                            log.role === 'ketua' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'
                          }`}>
                            {log.role}
                          </span>
                        </div>
                        <p className="text-slate-600 italic font-medium leading-tight">Aktivitas: &ldquo;{log.activity}&rdquo;</p>
                      </div>

                      <span className="text-[10px] text-slate-400 font-mono font-semibold">{log.timestamp}</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* ================= TAB 5: MULTI-ROLE EMULATOR ================= */}
        {activeSubTab === 'emulasi' && (
          <div className="bg-white border rounded-xl p-6 shadow-xs mt-6 space-y-4">
            <div>
              <h3 className="text-sm font-black uppercase text-blue-950">Aplikasi Otoritas Segenap Aktivitas (Emulasi Jabatan Pengawas)</h3>
              <p className="text-slate-500 text-[11px]">Sebagai Dewan Pengawas / Admin Utama, Anda dapat melompati sesi dan mensimulasi dashboard pengurus lainnya untuk memeriksa kepatuhan operasional.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 pt-3 text-center">
              {[
                { r: 'sekretaris', color: 'bg-indigo-600 hover:bg-indigo-700 text-white', lbl: "1. SEKRETARIS", desc: "Pendaftaran, edit depan, approve login" },
                { r: 'ketua', color: 'bg-[#dca415] hover:bg-yellow-600 text-slate-950 font-black', lbl: "2. KETUA KOPERASI", desc: "Melihat Neraca finansial, menyaring ajuan keluar" },
                { r: 'bendahara', color: 'bg-emerald-600 hover:bg-emerald-700 text-white', lbl: "3. BENDAHARA", desc: "Entry jurnal rugi laba, cetak iuran, WA" },
                { r: 'anggota', color: 'bg-slate-700 hover:bg-slate-800 text-white', lbl: "4. PORTAL ANGGOTA", desc: "KTA digital, pinjaman, tabungan, bayar PPOB" }
              ].map((em) => (
                <div key={em.r} className="bg-slate-50 p-4 border border-slate-200 rounded-xl flex flex-col justify-between space-y-3 shadow-xs">
                  <div>
                    <h5 className="font-extrabold text-[#0c4a80] tracking-wide text-xs">{em.lbl}</h5>
                    <p className="text-[10px] text-slate-400 mt-1 font-medium leading-normal">{em.desc}</p>
                  </div>
                  <button
                    onClick={() => {
                      onEmulateRole(em.r);
                    }}
                    className={`w-full py-2 rounded-lg text-[11px] leading-none uppercase font-extrabold tracking-wide transition transform active:scale-95 cursor-pointer ${em.color}`}
                  >
                    Simulasi Akses
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ================= TAB 6: CMS DYNAMIC WEB MANAGER ================= */}
        {activeSubTab === 'cms' && (
          <div className="bg-white border rounded-xl overflow-hidden shadow-xs mt-6 space-y-4 p-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-sm font-black uppercase text-blue-950 flex items-center gap-1.5">
                  <FileText className="w-5 h-5 text-[#dca415]" /> Web Content Management & Penataan Beranda
                </h3>
                <p className="text-slate-500 text-[11px]">Tambahkan, ubah, atau hapus konten dinamis di Landing Page disertai file foto, link eksternal, nomor urutan dan filter beranda.</p>
              </div>
              <button
                onClick={handleOpenCmsAdd}
                className="px-4 py-2 bg-blue-900 hover:bg-blue-950 text-white font-extrabold rounded-lg flex items-center gap-1 text-xs select-none uppercase tracking-wide cursor-pointer leading-none"
              >
                <Plus className="w-4 h-4" /> Tambah Konten Baru
              </button>
            </div>

            {/* CMS SECTIONS SELECTOR TABS */}
            <div className="flex border-b border-slate-100 pb-2 flex-wrap gap-1">
              {[
                { id: 'tentang', lbl: '1. Tentang Kami (Profil/Visi/Sejarah)' },
                { id: 'layanan', lbl: '2. Unit Layanan KSU IPPI' },
                { id: 'berita', lbl: '3. Berita, Tips & Kegiatan' },
                { id: 'galeri', lbl: '4. Galeri Foto & Dokumentasi' },
                { id: 'produk', lbl: '5. Katalog Barang Swalayan' },
                { id: 'pengumuman', lbl: '6. Pengumuman Beranda (PENTING)' },
                { id: 'kebijakan', lbl: '7. Kebijakan & Regulasi' }
              ].map((sub) => (
                <button
                  key={sub.id}
                  onClick={() => setActiveCmsTab(sub.id as any)}
                  className={`px-3.5 py-2 text-[11px] font-bold rounded-md leading-none border transition-all cursor-pointer ${
                    activeCmsTab === sub.id
                      ? 'bg-amber-400 text-slate-950 border-amber-400 font-extrabold shadow-sm'
                      : 'text-slate-600 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  {sub.lbl}
                </button>
              ))}
            </div>

            {/* CMS DATA LIST / TABLES */}
            <div className="overflow-x-auto pt-2">
              <table className="w-full text-left text-xs border-collapse font-sans">
                <thead>
                  <tr className="bg-slate-50 text-slate-400 uppercase tracking-widest text-[9px] border-b">
                    <th className="py-2.5 px-3">Gambar</th>
                    <th className="py-2.5 px-3">Judul / Nama Item</th>
                    <th className="py-2.5 px-3">Deskripsi / Detail Konten</th>
                    <th className="py-2.5 px-3 text-center">No. Urut</th>
                    <th className="py-2.5 px-3 text-center">Tampil Beranda</th>
                    <th className="py-2.5 px-3">Link Eksternal</th>
                    <th className="py-2.5 px-3 text-right">Tindakan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700 font-sans">
                  {/* Item filtering/mapping according to activeCmsTab */}
                  {(() => {
                    let itemsToRender: any[] = [];
                    if (activeCmsTab === 'tentang') itemsToRender = tentangItems;
                    else if (activeCmsTab === 'layanan') itemsToRender = layananItems;
                    else if (activeCmsTab === 'berita') itemsToRender = articles;
                    else if (activeCmsTab === 'galeri') itemsToRender = galleryItems;
                    else if (activeCmsTab === 'produk') itemsToRender = products;
                    else if (activeCmsTab === 'pengumuman') itemsToRender = announcements;
                    else if (activeCmsTab === 'kebijakan') itemsToRender = regulations;

                    if (itemsToRender.length === 0) {
                      return (
                        <tr>
                          <td colSpan={7} className="text-center py-8 text-slate-400 italic">
                            Belum ada entri data untuk kategori ini. Klik "Tambah Konten Baru" di atas.
                          </td>
                        </tr>
                      );
                    }

                    // Sort items by order so they appear exactly as they do in layout
                    const sortedItems = [...itemsToRender].sort((a, b) => (a.order || 0) - (b.order || 0));

                    return sortedItems.map((item) => {
                      const displayTitle = item.title || item.nama || '';
                      const displayDesc = item.content || item.description || item.deskripsi || '';
                      const displayImg = item.image;
                      
                      return (
                        <tr key={item.id} className="hover:bg-slate-50 transition">
                          <td className="py-3 px-3">
                            {activeCmsTab === 'pengumuman' ? (
                              <div className="w-12 h-10 bg-amber-500/10 border border-amber-500/20 rounded flex items-center justify-center text-amber-500 text-base font-bold select-none">
                                📣
                              </div>
                            ) : activeCmsTab === 'kebijakan' ? (
                              <div className="w-12 h-10 bg-indigo-50 border border-indigo-200 rounded flex items-center justify-center text-indigo-900 text-base font-bold select-none">
                                ⚖️
                              </div>
                            ) : (
                              <img 
                                src={displayImg || "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&q=80&w=60"} 
                                className="w-12 h-10 object-cover rounded border border-slate-300"
                                alt="Item Preview" 
                              />
                            )}
                          </td>
                          <td className="py-3 px-3 font-bold text-slate-900 max-w-[180px] truncate" title={displayTitle}>
                            {displayTitle}
                            {item.badge && (
                              <span className="ml-1.5 px-1.5 py-0.5 bg-blue-100 text-blue-800 text-[8px] rounded uppercase font-black tracking-wide font-mono">
                                {item.badge}
                              </span>
                            )}
                            {item.category && (
                              <span className="ml-1.5 px-1.5 py-0.5 bg-yellow-100 text-amber-800 text-[8px] rounded font-black font-sans">
                                {item.category}
                              </span>
                            )}
                            {activeCmsTab === 'pengumuman' && item.important && (
                              <span className="ml-1.5 px-1.5 py-0.5 bg-red-100 text-red-700 text-[8px] rounded uppercase font-black tracking-wide font-mono animate-pulse">
                                PENTING
                              </span>
                            )}
                          </td>
                          <td className="py-3 px-3 text-slate-500 max-w-[280px] truncate" title={displayDesc}>
                            {displayDesc}
                          </td>
                          <td className="py-3 px-3 text-center font-mono font-bold text-yellow-600">
                            {activeCmsTab === 'pengumuman' ? '-' : (item.order !== undefined ? item.order : '-')}
                          </td>
                          <td className="py-3 px-3 text-center">
                            <span className={`px-2 py-0.5 font-bold rounded-full text-[9px] ${
                              activeCmsTab === 'pengumuman' || activeCmsTab === 'kebijakan' || item.showOnBeranda ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-slate-100 text-slate-500 border border-slate-200'
                            }`}>
                              {activeCmsTab === 'pengumuman' || activeCmsTab === 'kebijakan' || item.showOnBeranda ? 'YA' : 'TIDAK'}
                            </span>
                          </td>
                          <td className="py-3 px-3 truncate max-w-[120px] font-mono text-slate-400" title={item.externalUrl || "Tidak ada"}>
                            {item.externalUrl || '-'}
                          </td>
                          <td className="py-3 px-3 text-right space-x-1 whitespace-nowrap">
                            <button
                              onClick={() => handleOpenCmsEdit(item)}
                              className="p-1 px-2.5 text-blue-700 hover:bg-blue-50 border border-blue-200 rounded font-bold cursor-pointer hover:text-blue-900"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleCmsDelete(item.id)}
                              className="p-1 px-2 text-red-600 hover:bg-red-50 border border-red-200 rounded font-bold cursor-pointer hover:text-red-800"
                            >
                              Hapus
                            </button>
                          </td>
                        </tr>
                      );
                    });
                  })()}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </div>

      {/* ================= CMS WORKSPACE DYNAMIC MODAL ================= */}
      {showCmsModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-2xl max-w-xl w-full flex flex-col overflow-hidden max-h-[88vh]">
            <div className="bg-slate-900 text-white p-4 flex justify-between items-center border-b border-yellow-500">
              <h4 className="font-black uppercase tracking-wider text-xs">
                {editingCmsItemId ? "Ubah Konten Website" : "Tambah Konten Website"} - {activeCmsTab.toUpperCase()}
              </h4>
              <button onClick={() => setShowCmsModal(false)} className="text-slate-400 hover:text-white cursor-pointer select-none">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleCmsSubmit} className="p-6 overflow-y-auto space-y-4 text-xs font-sans">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                
                {/* Title Input */}
                <div className="sm:col-span-2">
                  <label className="block text-[10px] font-bold text-slate-500 mb-0.5 uppercase mb-1">
                    {activeCmsTab === 'produk' ? 'Nama Produk' : activeCmsTab === 'pengumuman' ? 'Headline Pengumuman Koperasi (Megaphone)' : activeCmsTab === 'kebijakan' ? 'Judul Kebijakan & Regulasi Resmi' : 'Judul Konten Utama'}
                  </label>
                  <input
                    type="text"
                    required
                    className="w-full bg-slate-50 border border-slate-350 p-2.5 rounded text-xs outline-none focus:border-blue-900"
                    placeholder={activeCmsTab === 'pengumuman' ? "Contoh: Pengumuman Jadwal RAT Koperasi / Libur Hari Raya" : activeCmsTab === 'kebijakan' ? "Contoh: Syarat & Ketentuan Keanggotaan" : "Contoh: Profil Pengurus Baru / Susu Bayi Ultra"}
                    value={cmsForm.title}
                    onChange={(e) => setCmsForm({ ...cmsForm, title: e.target.value })}
                  />
                </div>

                {/* Optional Layanan Badge */}
                {activeCmsTab === 'layanan' && (
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 mb-0.5 uppercase mb-1">Badge Label (Pembeda Jasa)</label>
                    <input
                      type="text"
                      className="w-full bg-slate-50 border border-slate-350 p-2 rounded text-xs"
                      placeholder="Contoh: UNIT I / UNIT JASA"
                      value={cmsForm.badge}
                      onChange={(e) => setCmsForm({ ...cmsForm, badge: e.target.value })}
                    />
                  </div>
                )}

                {/* Optional Article or Product Category */}
                {(activeCmsTab === 'berita' || activeCmsTab === 'produk') && (
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 mb-0.5 uppercase mb-1">Kategori Koperasi</label>
                    <select
                      className="w-full bg-slate-50 border border-slate-350 p-1.5 rounded text-xs bg-white"
                      value={cmsForm.category}
                      onChange={(e) => setCmsForm({ ...cmsForm, category: e.target.value })}
                    >
                      {activeCmsTab === 'produk' ? (
                        <>
                          <option value="Sembako">Kebutuhan Sembako</option>
                          <option value="Makanan">Makanan & Minuman</option>
                          <option value="Kesehatan">Kesehatan & Higienitas</option>
                          <option value="Alat Tulis">Alat Tulis & Rumah Tangga</option>
                        </>
                      ) : (
                        <>
                          <option value="Tips">Artikel & Tips Sehat Pensiun</option>
                          <option value="Pengumuman">Pengumuman Resmi Koperasi</option>
                          <option value="Kegitatan">Update Kegiatan Korwil</option>
                        </>
                      )}
                    </select>
                  </div>
                )}

                {/* Product Fields (Price & Stock) */}
                {activeCmsTab === 'produk' && (
                  <>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 mb-0.5 uppercase mb-1">Harga Jual Swalayan (Rp)</label>
                      <input
                        type="number"
                        required
                        min="0"
                        className="w-full bg-slate-50 border border-slate-350 p-2 rounded text-xs font-mono"
                        value={cmsForm.harga}
                        onChange={(e) => setCmsForm({ ...cmsForm, harga: Number(e.target.value) || 0 })}
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 mb-0.5 uppercase mb-1">Jumlah Stok Barang</label>
                      <input
                        type="number"
                        required
                        min="0"
                        className="w-full bg-slate-50 border border-slate-350 p-2 rounded text-xs font-mono"
                        value={cmsForm.stok}
                        onChange={(e) => setCmsForm({ ...cmsForm, stok: Number(e.target.value) || 10 })}
                      />
                    </div>
                  </>
                )}

                {/* Sorting order & display order */}
                {activeCmsTab !== 'pengumuman' && (
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 mb-0.5 uppercase mb-1">NoUrutan Tampilan (Order)</label>
                    <input
                      type="number"
                      required
                      min="1"
                      className="w-full bg-slate-50 border border-slate-350 p-2 rounded text-xs font-mono"
                      value={cmsForm.order}
                      onChange={(e) => setCmsForm({ ...cmsForm, order: Number(e.target.value) || 1 })}
                    />
                  </div>
                )}

                 {/* Show on beranda checkbox */}
                 {activeCmsTab !== 'pengumuman' && activeCmsTab !== 'kebijakan' && (
                   <div className="flex items-center gap-2 pt-4">
                     <input
                       type="checkbox"
                       id="showOnBerandaCheckbox"
                       className="w-4 h-4 text-blue-900 border-slate-300 rounded focus:ring-blue-900 cursor-pointer"
                       checked={cmsForm.showOnBeranda}
                       onChange={(e) => setCmsForm({ ...cmsForm, showOnBeranda: e.target.checked })}
                     />
                     <label htmlFor="showOnBerandaCheckbox" className="text-[10px] uppercase tracking-wide font-black select-none text-slate-700 cursor-pointer">
                       Tampilkan di Beranda (Homepage)
                     </label>
                   </div>
                 )}

                 {/* Important Flag (Contreng PENTING) for Announcements */}
                 {activeCmsTab === 'pengumuman' && (
                   <div className="flex items-center gap-2.5 pt-2 sm:col-span-2 bg-amber-50 rounded-lg p-3 border border-amber-200">
                     <input
                       type="checkbox"
                       id="cmsForm-important"
                       className="w-4 h-4 text-amber-600 border-slate-300 bg-white cursor-pointer rounded focus:ring-amber-550 shrink-0"
                       checked={cmsForm.important}
                       onChange={(e) => setCmsForm({ ...cmsForm, important: e.target.checked })}
                     />
                     <label htmlFor="cmsForm-important" className="text-[10px] uppercase tracking-wider font-extrabold select-none text-amber-900 cursor-pointer leading-wide">
                       Flag / Tandai sebagai Pengumuman Resmi Paling Penting (Tampilkan Label &ldquo;PENTING&rdquo; di Beranda)
                     </label>
                   </div>
                 )}

                 {/* External externalUrl Link */}
                 {activeCmsTab !== 'pengumuman' && activeCmsTab !== 'kebijakan' && (
                   <div className="sm:col-span-2">
                     <label className="block text-[10px] font-bold text-slate-500 mb-0.5 uppercase mb-1">Link Tautan Luar (External URL - Optional)</label>
                     <input
                       type="text"
                       className="w-full bg-slate-50 border border-slate-350 p-2 rounded text-xs font-mono outline-none"
                       placeholder="Contoh: https://facebook.com/ippi-jatim atau link luar lainnya"
                       value={cmsForm.externalUrl}
                       onChange={(e) => setCmsForm({ ...cmsForm, externalUrl: e.target.value })}
                     />
                     <p className="text-[9px] text-slate-400 mt-0.5">Jika diisi, pengunjung yang mengeklik item ini akan dialihkan ke halaman/alamat URL eksternal tersebut.</p>
                   </div>
                 )}

                 {/* Image Upload Block */}
                 {activeCmsTab !== 'pengumuman' && activeCmsTab !== 'kebijakan' && (
                   <div className="sm:col-span-2">
                     <label className="block text-[10px] font-bold text-slate-500 mb-0.5 uppercase mb-1 font-sans">File Foto Utama (Upload Maksimal 2MB)</label>
                     <div className="flex gap-2.5 items-center">
                       <label className="flex-1 text-center bg-slate-50 hover:bg-slate-100 p-3 border border-dashed border-slate-350 rounded font-bold cursor-pointer text-[10px] uppercase">
                         PILIH GAMBAR/FOTO
                         <input type="file" accept="image/*" className="hidden" onChange={handlePhotoUploadCms} />
                       </label>
                       {cmsForm.image && (
                         <div className="w-16 h-12 rounded overflow-hidden shrink-0 border border-slate-300">
                           <img src={cmsForm.image} className="w-full h-full object-cover" alt="CMS upload preview" />
                         </div>
                       )}
                     </div>
                   </div>
                 )}

                {/* Main Content Description */}
                <div className="sm:col-span-2">
                  <label className="block text-[10px] font-bold text-slate-500 mb-0.5 uppercase mb-1">
                    {activeCmsTab === 'pengumuman' ? 'Isi Deskripsi / Detail Pengumuman Resmi' : activeCmsTab === 'kebijakan' ? 'Isi Dokumen / Kebijakan Lengkap (Mendukung Newline)' : 'Deskripsi / Detail Narasi Konten'}
                  </label>
                  <textarea
                    rows={activeCmsTab === 'kebijakan' ? 8 : 4}
                    required
                    className="w-full bg-slate-50 border border-slate-350 p-2.5 rounded text-xs outline-none focus:border-blue-900 leading-relaxed font-sans"
                    placeholder={activeCmsTab === 'kebijakan' ? "Tulis isi kebijakan, peraturan, syarat, atau FAQ secara detail di sini..." : "Tulis informasi detailnya di sini dengan lengkap..."}
                    value={cmsForm.content}
                    onChange={(e) => setCmsForm({ ...cmsForm, content: e.target.value })}
                  />
                </div>

              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowCmsModal(false)}
                  className="px-4 py-2 hover:bg-slate-100 font-bold uppercase transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-blue-900 hover:bg-blue-950 text-white font-extrabold rounded-lg tracking-wider uppercase leading-none cursor-pointer"
                >
                  Simpan Konten Dynamic
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* ================= TAB 7: LMS COURSE CURRICULUM MANAGEMENT ================= */}
      {activeSubTab === 'lms' && (
        <div className="bg-slate-950 text-white border border-slate-800 rounded-xl overflow-hidden shadow-xs mt-6 p-6">
          <div className="border-b border-white/5 pb-4 mb-4">
            <h3 className="text-sm font-black uppercase text-amber-400 flex items-center gap-1.5 font-sans">
              <BookOpen className="w-5 h-5 text-blue-450" /> Kurikulum LMS & Manajemen Soal Kuis
            </h3>
            <p className="text-slate-400 text-[11px] mt-0.5">Tambah, ubah, dan hapus modul kursus, pembelajaran sub-bab materi, tautan media luar, serta pertanyaan kuis secara terintegrasi.</p>
          </div>
          
          <LMSPortal
            currentUser={adminMember}
            courses={courses}
            progressList={progressList}
            onSaveProgress={onSaveProgress}
            onSaveCourses={onSaveCourses}
            onLogActivity={onLogActivity}
            settings={settings}
            members={members}
          />
        </div>
      )}

      {/* ================= TAB 8: PEMILU / POLLING MANAGEMENT ================= */}
      {activeSubTab === 'pemilu' && (
        <div className="space-y-6 mt-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-6 animate-fade-in">
            <div className="border-b border-slate-100 pb-4">
              <h3 className="text-sm font-black uppercase text-blue-900 flex items-center gap-1.5">
                <CheckSquare className="w-5 h-5 text-amber-500" /> Kontrol Panel Pemilu & Polling Ketua Koperasi
              </h3>
              <p className="text-slate-500 text-xs mt-0.5">Atur judul pemilihan, masa berlaku waktu aktif, status kemunculan, hak suara masuk, serta manajemen data visi misi setiap calon kandidat.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              {/* Box 1: General Settings Form */}
              <form 
                onSubmit={(e) => {
                  e.preventDefault();
                  onUpdatePollSettings({
                    pollTitle,
                    endDate: pollEndDate,
                    isPollingActive: isPollActive,
                    showResultsToMembers
                  });
                }}
                className="space-y-4 bg-slate-50 p-5 rounded-xl border border-slate-200"
              >
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-500 mb-2">Konfigurasi Umum Polling</h4>
                
                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-slate-500 uppercase">Judul Polling Pemilihan</label>
                  <input 
                    type="text"
                    required
                    className="w-full bg-white border border-slate-250 p-2.5 rounded-lg text-xs outline-none focus:border-blue-900 font-bold"
                    placeholder="Contoh: Pemilihan Ketua DPW Jawa Timur Periode 2026-2030"
                    value={pollTitle}
                    onChange={(e) => setPollTitle(e.target.value)}
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-slate-500 uppercase">Batas Waktu Berakhir (End Date)</label>
                  <input 
                    type="datetime-local"
                    required
                    className="w-full bg-white border border-slate-250 p-2.5 rounded-lg text-xs outline-none focus:border-blue-900 font-mono"
                    value={pollEndDate}
                    onChange={(e) => setPollEndDate(e.target.value)}
                  />
                </div>

                <div className="pt-2 space-y-3">
                  <div className="flex items-start gap-2.5">
                    <input 
                      type="checkbox"
                      id="isPollActive"
                      className="mt-0.5 rounded border-slate-350 text-blue-900 focus:ring-blue-900/40 cursor-pointer"
                      checked={isPollActive}
                      onChange={(e) => setIsPollActive(e.target.checked)}
                    />
                    <label htmlFor="isPollActive" className="block text-xs font-black text-slate-700 cursor-pointer select-none">
                      Aktifkan poling suara (Bisa dipilih oleh anggota terdaftar)
                    </label>
                  </div>

                  <div className="flex items-start gap-2.5">
                    <input 
                      type="checkbox"
                      id="showResultsToMembers"
                      className="mt-0.5 rounded border-slate-350 text-blue-900 focus:ring-blue-900/40 cursor-pointer"
                      checked={showResultsToMembers}
                      onChange={(e) => setShowResultsToMembers(e.target.checked)}
                    />
                    <label htmlFor="showResultsToMembers" className="block text-xs font-black text-slate-700 cursor-pointer select-none">
                      Tampilkan hasil perolehan suara sementara di login anggota (Pilihan Contreng ✓)
                    </label>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-200 flex justify-end">
                  <button 
                    type="submit"
                    className="px-4 py-2.5 bg-blue-900 hover:bg-blue-950 text-white font-extrabold uppercase tracking-wide text-xs rounded-lg transition-all cursor-pointer"
                  >
                    Simpan Konfigurasi Umum & Batas Akhir
                  </button>
                </div>
              </form>

              {/* Box 2: Live Stats & Results */}
              <div className="bg-slate-900 text-white p-5 rounded-xl border border-slate-800 flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="text-xs font-black uppercase tracking-wider text-amber-400">Status & Perolehan Suara Terkini</h4>
                    <span className="bg-white/10 text-white font-mono font-bold text-[10px] px-2.5 py-1 rounded">
                      Total: {pollVotes.length} Pemilih
                    </span>
                  </div>

                  <div className="space-y-4">
                    {editingCandidates.map((c, index) => {
                      const votesCount = pollVotes.filter(v => v.candidateId === c.id).length;
                      const percentage = pollVotes.length === 0 ? 0 : Math.round((votesCount / pollVotes.length) * 100);
                      
                      return (
                        <div key={c.id} className="space-y-1">
                          <div className="flex justify-between items-center text-xs font-mono font-semibold">
                            <span>0{index+1}. {c.nama || "Calon Tanpa Nama"}</span>
                            <span className="text-amber-400">{votesCount} suara ({percentage}%)</span>
                          </div>
                          <div className="w-full bg-slate-800 h-3 rounded-full overflow-hidden">
                            <div className="bg-amber-500 h-full rounded-full transition-all duration-1000" style={{ width: `${percentage}%` }}></div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-800 flex flex-wrap gap-2 justify-end items-center mt-4">
                  {showResetVotesConfirm ? (
                    <div className="flex flex-wrap items-center gap-2 bg-rose-950/80 border border-rose-500 rounded-lg p-2.5">
                      <span className="text-[10px] font-bold text-rose-200 uppercase">⚠️ YAKIN HAPUS SELURUH SUARA? TIDAK BISA DI-UNDO!</span>
                      <button 
                        type="button"
                        onClick={() => {
                          onClearPollVotes();
                          setShowResetVotesConfirm(false);
                        }}
                        className="px-2.5 py-1 bg-rose-600 hover:bg-rose-700 text-white font-extrabold uppercase text-[10px] rounded transition"
                      >
                        YA, RESET SEKARANG
                      </button>
                      <button 
                        type="button"
                        onClick={() => setShowResetVotesConfirm(false)}
                        className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold uppercase text-[10px] rounded transition"
                      >
                        Batal
                      </button>
                    </div>
                  ) : (
                    <button 
                      type="button"
                      onClick={() => setShowResetVotesConfirm(true)}
                      className="flex items-center gap-1 px-3 py-2 bg-rose-950/40 hover:bg-rose-900 text-rose-400 border border-rose-900 font-bold uppercase text-[10px] rounded-lg transition"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Reset Seluruh Suara Pemilih
                    </button>
                  )}
                </div>

              </div>

            </div>

            {/* Candidate Configuration */}
            <div className="border-t border-slate-200 pt-6 space-y-4">
              <div className="flex justify-between items-center bg-slate-50 p-4 border border-slate-200 rounded-lg">
                <div>
                  <h4 className="text-xs font-black uppercase text-slate-850">Manajemen Calon Kandidat Ketua</h4>
                  <p className="text-slate-550 text-[10px] font-bold">Tambahkan kandidat, ganti nama calon, dan sesuaikan pernyataan visi misi mereka.</p>
                </div>
                <button 
                  onClick={() => {
                    const newC: PollCandidate = {
                      id: `candidate-${Date.now()}`,
                      nama: `Bakal Calon Baru`,
                      visiMisi: "Visi:\n...\n\nMisi:\n1. ...\n2. ..."
                    };
                    setEditingCandidates([...editingCandidates, newC]);
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-100 hover:bg-blue-200 text-blue-900 rounded-lg text-xs font-black cursor-pointer transition"
                >
                  <Plus className="w-4 h-4" /> Tambah Calon Baru
                </button>
              </div>

              {editingCandidates.length === 0 ? (
                <div className="text-center py-6 border border-dashed border-slate-250 text-slate-400 text-xs">
                  Belum ada kandidat yang terdaftar. Hubungi administrator/klik tombol di atas untuk menambah calon.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {editingCandidates.map((c, i) => (
                    <div key={c.id} className="bg-slate-50/50 border border-slate-200 rounded-xl p-4.5 space-y-3 relative">
                      <div className="absolute top-4 right-4 flex items-center gap-1.5 z-10">
                        {candidateToConfirmDelete === c.id ? (
                          <div className="flex items-center gap-1 bg-red-55 border border-red-200 rounded-lg p-1">
                            <span className="text-[9px] font-black text-red-600 uppercase">Yakin?</span>
                            <button
                              type="button"
                              onClick={() => {
                                setEditingCandidates(editingCandidates.filter(item => item.id !== c.id));
                                setCandidateToConfirmDelete(null);
                              }}
                              className="px-1.5 py-0.5 bg-red-600 hover:bg-red-700 text-white font-extrabold uppercase text-[8px] rounded cursor-pointer transition"
                            >
                              Ya
                            </button>
                            <button
                              type="button"
                              onClick={() => setCandidateToConfirmDelete(null)}
                              className="px-1 py-0.5 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold uppercase text-[8px] rounded cursor-pointer transition"
                            >
                              No
                            </button>
                          </div>
                        ) : (
                          <button 
                            type="button"
                            onClick={() => setCandidateToConfirmDelete(c.id)}
                            className="p-1.5 hover:bg-red-50 text-red-600 rounded-lg transition cursor-pointer"
                            title="Hapus Calon"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>

                      <div className="flex gap-4 items-center border-b border-slate-200 pb-3">
                        <div className="w-14 h-14 bg-blue-900 border border-[#dca415] rounded-full overflow-hidden flex items-center justify-center text-white font-extrabold text-base uppercase shadow-inner shrink-0 relative">
                          {c.photo ? (
                            <img src={c.photo} className="w-full h-full object-cover" alt={c.nama} />
                          ) : (
                            c.nama ? (
                              c.nama.split(' ').filter(n => !n.includes('.') && n.length > 1).map(b => b.charAt(0)).slice(0, 2).join('')
                            ) : "P"
                          )}
                        </div>
                        <div className="flex-1 space-y-1">
                          <label className="block text-[9px] font-bold text-slate-500 uppercase">Foto Calon Ketua</label>
                          <input 
                            type="file"
                            accept="image/*"
                            className="block w-full text-xs text-slate-500 file:mr-3 file:py-1 file:px-2.5 file:rounded-md file:border-0 file:text-[10px] file:font-bold file:bg-blue-50 file:text-blue-900 hover:file:bg-blue-100 cursor-pointer text-[10px]"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                // Mengompresi gambar otomatis agar ukurannya kecil (5-15KB) sehingga sinkronisasi antar perangkat lancar dan cepat
                                compressImage(file, 200, 200, 0.7)
                                  .then((compressedBase64) => {
                                    const updated = [...editingCandidates];
                                    updated[i] = {
                                      ...updated[i],
                                      photo: compressedBase64
                                    };
                                    setEditingCandidates(updated);
                                  })
                                  .catch((err) => {
                                    console.error("Gagal mengompresi foto: ", err);
                                    alert("Gagal memproses gambar. Coba gambar lain.");
                                  });
                              }
                            }}
                          />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <span className="text-[10px] font-mono font-bold text-amber-600">No. Urut 0{i+1}</span>
                        <input 
                          type="text"
                          className="w-full bg-white border border-slate-250 p-2 rounded text-xs outline-none focus:border-blue-950 font-black text-slate-800"
                          placeholder="Nama lengkap calon beserta gelar"
                          value={c.nama}
                          onChange={(e) => {
                            const updated = [...editingCandidates];
                            updated[i] = {
                              ...updated[i],
                              nama: e.target.value
                            };
                            setEditingCandidates(updated);
                          }}
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="block text-[9px] font-bold text-slate-400 uppercase">Pernyataan Visi & Misi</label>
                        <textarea
                          rows={4}
                          className="w-full bg-white border border-slate-250 p-2 rounded text-xs outline-none focus:border-blue-950 text-slate-650 leading-relaxed font-semibold whitespace-pre-wrap"
                          placeholder="Masukkan Visi & Misi calon..."
                          value={c.visiMisi}
                          onChange={(e) => {
                            const updated = [...editingCandidates];
                            updated[i] = {
                              ...updated[i],
                              visiMisi: e.target.value
                            };
                            setEditingCandidates(updated);
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex justify-end pt-2 border-t border-slate-100">
                <button 
                  onClick={() => {
                    onUpdatePollCandidates(editingCandidates);
                    alert("Daftar Calon Ketua Koperasi berhasil disinkronkan ke cloud secara real-time!");
                  }}
                  className="px-5 py-2.5 bg-blue-900 hover:bg-blue-950 text-white font-extrabold uppercase text-xs tracking-wider rounded-lg shadow-sm transition-all cursor-pointer"
                >
                  Simpan Perubahan Daftar Calon Ketua Koperasi ✓
                </button>
              </div>

            </div>

            {/* Audit Logs of Votes (Riwayat Penyalur Suara) */}
            <div className="border-t border-slate-200 pt-6 space-y-4">
              <h4 className="text-xs font-black uppercase text-slate-850">Audit Penyalur Hak Suara Masuk</h4>
              
              <div className="bg-white border rounded-lg overflow-hidden shadow-xs">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-50 text-slate-500 font-bold uppercase border-b text-[10px]">
                      <th className="p-3"># No</th>
                      <th className="p-3">ID Anggota / Nama</th>
                      <th className="p-3">Kandidat Terpilih</th>
                      <th className="p-3 font-mono">Timestamp WIB</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y text-slate-700">
                    {pollVotes.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="p-4 text-center text-slate-400 font-medium">Belum ada suara masuk yang tercatat di database kearsipan.</td>
                      </tr>
                    ) : (
                      pollVotes.map((v, i) => {
                        const candName = editingCandidates.find(item => item.id === v.candidateId)?.nama || "Unknown Candidate";
                        return (
                          <tr key={i} className="hover:bg-slate-50 font-medium border-b border-slate-100">
                            <td className="p-3 text-slate-400">{i+1}</td>
                            <td className="p-3 text-slate-800 font-bold">{v.memberName}</td>
                            <td className="p-3 text-blue-900 font-semibold">{candName}</td>
                            <td className="p-3 font-mono text-slate-400">{v.timestamp}</td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>

          </div>

        </div>
      )}

      {/* ================= USER FORM ADD / EDIT MODAL ================= */}
      {showUserModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-2xl max-w-xl w-full flex flex-col overflow-hidden max-h-[88vh]">
            <div className="bg-slate-900 text-white p-4 flex justify-between items-center border-b border-yellow-500">
              <h4 className="font-black uppercase tracking-wider text-xs">
                {selectedUserForEdit ? "Edit Profile Pengguna" : "Instalasi Akun Baru Koperasi"}
              </h4>
              <button onClick={() => setShowUserModal(false)} className="text-slate-400 hover:text-white cursor-pointer">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleAddEditUserSubmit} className="p-6 overflow-y-auto space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 mb-0.5 uppercase">Nama Lengkap & Gelar</label>
                  <input
                    type="text"
                    required
                    className="w-full bg-slate-50 border p-2 rounded text-xs outline-none focus:border-blue-900"
                    placeholder="Contoh: Drs. H. Malik, M.Si"
                    value={userForm.nama}
                    onChange={(e) => setUserForm({ ...userForm, nama: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-500 mb-0.5 uppercase">Role / Peran Jabatan</label>
                  <select
                    className="w-full bg-slate-50 border p-1 rounded text-xs bg-white"
                    value={userForm.role}
                    onChange={(e) => setUserForm({ ...userForm, role: e.target.value as any })}
                  >
                    <option value="anggota">Anggota Biasa</option>
                    <option value="sekretaris">Sekretaris Wilayah</option>
                    <option value="ketua">Ketua Umum</option>
                    <option value="bendahara">Bendahara Keuangan</option>
                    <option value="admin">Administrator Sistem</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-500 mb-0.5 uppercase">No HP / WhatsApp (Aktif)</label>
                  <input
                    type="tel"
                    required
                    className="w-full bg-slate-50 border p-2 rounded text-xs font-mono outline-none focus:border-blue-900"
                    placeholder="Contoh: 08123456789"
                    value={userForm.noHp}
                    onChange={(e) => setUserForm({ ...userForm, noHp: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-500 mb-0.5 uppercase">Email Akun</label>
                  <input
                    type="email"
                    required
                    className="w-full bg-slate-50 border p-2 rounded text-xs outline-none focus:border-blue-900"
                    placeholder="Contoh: malik@ippi.com"
                    value={userForm.email}
                    onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-500 mb-0.5 uppercase">Institusi Pensiunan</label>
                  <input
                    type="text"
                    required
                    className="w-full bg-slate-50 border p-2 rounded text-xs"
                    placeholder="PT Pos Indonesia"
                    value={userForm.institusiPensiun}
                    onChange={(e) => setUserForm({ ...userForm, institusiPensiun: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-500 mb-0.5 uppercase">Status Keanggotaan</label>
                  <select
                    className="w-full bg-slate-50 border p-1 rounded text-xs bg-white"
                    value={userForm.status}
                    onChange={(e) => setUserForm({ ...userForm, status: e.target.value as any })}
                  >
                    <option value="approved">Disetujui Aktivatif (Approved)</option>
                    <option value="pending">Menunggu Verifikasi (Pending)</option>
                    <option value="rejected">Ditolak Sementara (Rejected)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-500 mb-0.5 uppercase">Password Utama</label>
                  <input
                    type="text"
                    required
                    className="w-full bg-slate-50 border p-2 rounded text-xs font-mono"
                    placeholder="Kunci rahasia"
                    value={userForm.password}
                    onChange={(e) => setUserForm({ ...userForm, password: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-500 mb-0.5 uppercase">Pas Foto (KTA)</label>
                  <div className="flex gap-1.5 items-center">
                    <label className="flex-1 text-center bg-slate-100 hover:bg-slate-200 p-2 border rounded font-bold cursor-pointer text-[10px] leading-none">
                      Pilih Gambar
                      <input type="file" accept="image/*" className="hidden" onChange={handlePhotoUploadUserForm} />
                    </label>
                    {userForm.photo && (
                      <img src={userForm.photo} className="w-8 h-8 rounded shrink-0 object-cover border border-yellow-500" alt="Preview modal" />
                    )}
                  </div>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-[10px] font-bold text-slate-500 mb-0.5 uppercase">Alamat Sesuai KTP (Lengkap)</label>
                  <textarea
                    rows={2}
                    required
                    className="w-full bg-slate-50 border p-2 rounded text-xs outline-none focus:border-blue-900"
                    placeholder="Masukkan alamat lengkap rumah"
                    value={userForm.alamatLengkap}
                    onChange={(e) => setUserForm({ ...userForm, alamatLengkap: e.target.value })}
                  />
                </div>

              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-slate-150">
                <button
                  type="button"
                  onClick={() => setShowUserModal(false)}
                  className="px-4 py-2 hover:bg-slate-100 font-bold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-blue-900 hover:bg-blue-950 text-white font-extrabold rounded-lg tracking-wider uppercase leading-none cursor-pointer"
                >
                  Selesaikan & Simpan Akun
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
};
