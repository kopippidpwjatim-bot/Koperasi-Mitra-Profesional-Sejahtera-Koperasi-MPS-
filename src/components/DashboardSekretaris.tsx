import React, { useState } from 'react';
import { 
  UserCheck, FileText, Newspaper, Megaphone, Printer, 
  Trash2, Plus, LogOut, CheckCircle, Smartphone, MapPin, ExternalLink, BookOpen
} from 'lucide-react';
import { Member, Article, Announcement, CooperativeSettings, LMSCourse, LMSUserProgress, Regulation } from '../types';
import { LMSPortal } from './LMSPortal';

interface DashboardSekretarisProps {
  secretaryMember: Member;
  settings: CooperativeSettings;
  members: Member[];
  articles: Article[];
  announcements: Announcement[];
  onApproveMember: (id: string) => void;
  onRejectMember: (id: string) => void;
  onAddArticle: (art: Omit<Article, 'id' | 'date'>) => void;
  onEditArticle: (id: string, art: Omit<Article, 'id' | 'date'>) => void;
  onDeleteArticle: (id: string) => void;
  onAddAnnouncement: (ann: Omit<Announcement, 'id' | 'date'>) => void;
  onEditAnnouncement: (id: string, ann: Omit<Announcement, 'id' | 'date'>) => void;
  onDeleteAnnouncement: (id: string) => void;
  onLogout: () => void;
  courses: LMSCourse[];
  progressList: LMSUserProgress[];
  onSaveProgress: (updatedProgress: LMSUserProgress) => Promise<void>;
  onSaveCourses: (updatedCourses: LMSCourse[]) => Promise<void>;
  onLogActivity: (activity: string) => void;
  regulations: Regulation[];
  onAddRegulation: (reg: Omit<Regulation, 'id'>) => void;
  onEditRegulation: (id: string, reg: Omit<Regulation, 'id'>) => void;
  onDeleteRegulation: (id: string) => void;
}

export const DashboardSekretaris: React.FC<DashboardSekretarisProps> = ({
  secretaryMember,
  settings,
  members,
  articles,
  announcements,
  onApproveMember,
  onRejectMember,
  onAddArticle,
  onEditArticle,
  onDeleteArticle,
  onAddAnnouncement,
  onEditAnnouncement,
  onDeleteAnnouncement,
  onLogout,
  courses,
  progressList,
  onSaveProgress,
  onSaveCourses,
  onLogActivity,
  regulations,
  onAddRegulation,
  onEditRegulation,
  onDeleteRegulation,
}) => {
  const [activeTabSec, setActiveTabSec] = useState<'pendaftaran' | 'berita_editor' | 'kebijakan_editor' | 'kop_pdf' | 'lms'>('pendaftaran');

  // Article Form State
  const [artForm, setArtForm] = useState({ title: '', summary: '', content: '', category: 'Tips Keuangan' });
  const [editingArtId, setEditingArtId] = useState<string | null>(null);
  
  // Announcement Form State
  const [annForm, setAnnForm] = useState({ title: '', content: '', important: false });
  const [editingAnnId, setEditingAnnId] = useState<string | null>(null);

  // Regulation Form State
  const [regForm, setRegForm] = useState({ title: '', content: '', order: 1 });
  const [editingRegId, setEditingRegId] = useState<string | null>(null);

  // Get pending members
  const pendingMembers = members.filter(m => m.status === 'pending');

  const handlePrintKopSurat = () => {
    const printWindow = window.open('', '', 'width=800,height=500');
    if (!printWindow) return;
    printWindow.document.write('<html><head><title>Print Kop Surat Resmi | Sekretaris</title>');
    printWindow.document.write('<link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">');
    printWindow.document.write('</head><body>');
    printWindow.document.write(`
      <div class="border-b-4 border-double border-slate-900 pb-5 mb-6 text-center m-10">
        <table class="w-full">
          <tr>
            <td class="w-1/6 text-center">
              <img src="${settings.logo}" class="h-20 w-20 object-contain inline-block" />
            </td>
            <td class="w-5/6 pl-4 text-center">
              <h2 class="text-xs font-black uppercase tracking-widest text-[#dca415] block leading-none">KOPERASI JASA SERBA USAHA</h2>
              <h1 class="text-xl font-black text-blue-900 leading-tight">IKATAN PROFESIONAL & PENSIUNAN INDONESIA (IPPI)</h1>
              <p class="text-[15px] font-bold text-slate-800">DPW PROVINSI JAWA TIMUR</p>
              <p class="text-[10px] text-slate-500 font-medium leading-relaxed">${settings.alamatSekretariat}</p>
              <p class="text-[8.5px] text-slate-400 font-mono mt-0.5">
                BH: ${settings.noIjinPendirian} | Telp/WA: ${settings.noTelpWA} | Email: ${settings.email}
              </p>
            </td>
          </tr>
        </table>
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

  const handleApproveWithWA = (m: Member) => {
    onApproveMember(m.id);
    
    // Automatically trigger WA prompt as specified by guidelines
    const cleanPhone = m.noHp.replace(/[^0-9]/g, '').replace(/^0/, '62');
    const msg = encodeURIComponent(`Selamat Anda telah bergabung dengan IPPI, silahkan login dengan user dan password yang sudah didaftarkan.`);
    const parentWaUrl = `https://api.whatsapp.com/send?phone=${cleanPhone}&text=${msg}`;
    
    alert(`Sukses disetujui!\nNo Anggota murni terbit dan No Rekening digital dialokasikan.\nSeketika membuka WhatsApp untuk mengirim konfirmasi aktivasi ke ${m.nama}.`);
    window.open(parentWaUrl, '_blank');
  };

  const handleCreateArticle = (e: React.FormEvent) => {
    e.preventDefault();
    if (!artForm.title || !artForm.content) {
      alert("Kolom judul dan konten artikel wajib diisi!");
      return;
    }
    if (editingArtId) {
      onEditArticle(editingArtId, artForm);
      alert("Artikel berhasil diperbarui!");
      setEditingArtId(null);
    } else {
      onAddArticle(artForm);
      alert("Artikel berita murni dipublikasikan ke Landing Page!");
    }
    setArtForm({ title: '', summary: '', content: '', category: 'Tips Keuangan' });
  };

  const handleCreateAnnouncement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!annForm.title || !annForm.content) {
      alert("Kolom pengumuman wajib diisi seluruhnya!");
      return;
    }
    if (editingAnnId) {
      onEditAnnouncement(editingAnnId, annForm);
      alert("Pengumuman berhasil diperbarui!");
      setEditingAnnId(null);
    } else {
      onAddAnnouncement(annForm);
      alert("Pengumuman berhasil disematkan di beranda depan!");
    }
    setAnnForm({ title: '', content: '', important: false });
  };

  const handleCreateOrUpdateRegulation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!regForm.title || !regForm.content) {
      alert("Kolom judul dan detail kebijakan wajib diisi!");
      return;
    }
    if (editingRegId) {
      onEditRegulation(editingRegId, regForm);
      alert("Kebijakan/Regulasi berhasil diperbarui!");
      setEditingRegId(null);
    } else {
      onAddRegulation(regForm);
      alert("Kebijakan/Regulasi baru berhasil ditambahkan!");
    }
    setRegForm({ title: '', content: '', order: regulations.length + 2 });
  };

  const handleStartEditRegulation = (reg: Regulation) => {
    setRegForm({ title: reg.title, content: reg.content, order: reg.order || 1 });
    setEditingRegId(reg.id);
  };

  const handleCancelEditRegulation = () => {
    setRegForm({ title: '', content: '', order: regulations.length + 1 });
    setEditingRegId(null);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in text-xs text-slate-800">
      
      {/* Head Welcome info */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 shadow-xs">
        <div className="flex gap-4 items-center">
          <div className="w-14 h-14 bg-indigo-900 border-2 border-[#dca415] rounded-full flex items-center justify-center text-white font-bold text-xl">
            S
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase bg-indigo-100 text-indigo-800 px-2.5 py-0.5 rounded-full select-none">SEKRETARIS DAERAH</span>
              <span className="text-[10px] text-slate-400">Verifikator Keanggotaan</span>
            </div>
            <h2 className="text-base sm:text-lg font-black text-slate-950">{secretaryMember.nama}</h2>
            <p className="text-xs text-slate-500">Kancah Sekretariat DPW Jatim: <span className="font-bold">{settings.namaSekretariat}</span></p>
          </div>
        </div>

        <button
          onClick={onLogout}
          className="flex items-center gap-1.5 px-4 py-2 bg-red-50 hover:bg-red-100 text-red-700 font-bold rounded-lg text-xs leading-none transition cursor-pointer"
        >
          Logout Sesi
        </button>
      </div>

      <div className="flex border-b border-slate-200 bg-white p-2.5 rounded-xl border flex-wrap gap-1.5 mb-6 shadow-xs">
        {[
          { id: 'pendaftaran', lbl: 'Verifikasi & Approve Anggota Baru', icon: <UserCheck className="w-4 h-4" /> },
          { id: 'berita_editor', lbl: 'Edit Konten Landing Page', icon: <Newspaper className="w-4 h-4" /> },
          { id: 'kebijakan_editor', lbl: 'Kebijakan & Regulasi Resmi', icon: <FileText className="w-4 h-4" /> },
          { id: 'lms', lbl: 'Pengaturan Kurikulum LMS', icon: <BookOpen className="w-4 h-4" /> },
          { id: 'kop_pdf', lbl: 'Kop Surat & Cetak PDF', icon: <Printer className="w-4 h-4" /> }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTabSec(tab.id as any)}
            className={`flex items-center gap-1.5 px-4 py-2.5 rounded-lg text-xs font-black uppercase tracking-wide leading-none transition-all cursor-pointer ${
              activeTabSec === tab.id 
                ? 'bg-indigo-900 text-white shadow-xs' 
                : 'text-slate-600 hover:bg-slate-50 hover:text-indigo-900'
            }`}
          >
            {tab.icon}
            {tab.lbl}
          </button>
        ))}
      </div>

      {/* ================= TAB 1: SCREENING PENDAFTARAN ANGGOTA BARU ================= */}
      {activeTabSec === 'pendaftaran' && (
        <div className="bg-white border rounded-xl p-6 shadow-xs space-y-4">
          <div className="flex justify-between items-center border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-sm font-black uppercase text-slate-900">Antrian Dokumen Calon Anggota Baru ({pendingMembers.length})</h3>
              <p className="text-slate-500 text-[11px]">Silakan klik tombol WA secara langsung untuk menyetujui, mencetak KTA digital, dan mengalokasikan nomor rekening.</p>
            </div>
          </div>

          {pendingMembers.length === 0 ? (
            <div className="text-center py-10 text-slate-400 text-xs italic bg-slate-50 rounded-lg border border-dashed">
              Semua pendaftaran anggota baru telah terverifikasi penuh. Antrean kosong.
            </div>
          ) : (
            <div className="space-y-4">
              {pendingMembers.map((m) => (
                <div key={m.id} className="p-5 border border-slate-200 rounded-xl bg-slate-50/50 flex flex-col md:flex-row gap-6 md:items-center justify-between">
                  <div className="flex gap-4 items-start">
                    <div className="w-14 h-16 border rounded bg-slate-100 overflow-hidden shrink-0">
                      {m.photo ? (
                        <img src={m.photo} className="w-full h-full object-cover" alt="pas foto" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-350">Foto</div>
                      )}
                    </div>
                    <div className="space-y-1 text-[11px]">
                      <h4 className="font-extrabold text-[#0c4a80] text-sm leading-none">{m.nama}</h4>
                      <p className="font-mono text-slate-500">Lahir: {m.tempatLahir}, {m.tanggalLahir} | {m.jenisKelamin}</p>
                      <p className="font-medium text-slate-800">Institusi Pensiun: <span className="font-bold">{m.institusiPensiun}</span></p>
                      <p className="font-medium text-slate-850">Keahlian: {m.pekerjaanKeahlian}</p>
                      <p className="text-slate-500 flex items-center gap-1 text-[10px] bg-slate-100 p-1.5 rounded border border-slate-200 max-w-lg">
                        <MapPin className="w-3.5 h-3.5" /> {m.alamatLengkap}
                      </p>
                      <div className="flex gap-3 text-[10px] text-slate-400 pt-1">
                        <span>WA: {m.noHp}</span>
                        <span>•</span>
                        <span>Email: {m.email}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2 shrink-0 md:self-center">
                    <button
                      onClick={() => {
                        if (confirm(`Apakah Anda yakin ingin menolak berkas pendataran ${m.nama}?`)) {
                          onRejectMember(m.id);
                        }
                      }}
                      className="px-3 py-2 text-slate-500 hover:bg-slate-150 font-bold border rounded-lg hover:text-slate-800"
                    >
                      Tolak
                    </button>
                    <button
                      onClick={() => handleApproveWithWA(m)}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 font-extrabold text-white rounded-lg shadow-sm flex items-center gap-1 leading-none uppercase tracking-wide cursor-pointer text-[10.5px]"
                    >
                      <Smartphone className="w-4 h-4 shrink-0" /> Setujui & Kirim WA
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ================= TAB 2: EDIT FRONT INFORMATION (BERITA EDITOR) ================= */}
      {activeTabSec === 'berita_editor' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* ARTICLE WRITER FORM */}
          <div className="bg-white border rounded-xl p-6 shadow-xs space-y-4">
            <h3 className="text-xs font-black uppercase text-blue-950 flex items-center gap-1 pb-2 border-b">
              <Newspaper className="w-4 h-4 text-[#dca415]" /> Publikasikan Tips & Artikel Baru
            </h3>

            <form onSubmit={handleCreateArticle} className="space-y-3.5">
              <div>
                <label className="block text-[9.5px] font-bold text-slate-500 mb-1 uppercase">Judul Artikel</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Optimalisasi SHU Melalui Program Terstruktur"
                  className="w-full text-xs p-2.5 bg-slate-50 border rounded-lg focus:border-blue-900 focus:bg-white"
                  value={artForm.title}
                  onChange={(e) => setArtForm({ ...artForm, title: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-[9.5px] font-bold text-slate-500 mb-1 uppercase">Ringkasan Singkat (Summary)</label>
                <input
                  type="text"
                  required
                  placeholder="Tulis ringkasan satu kalimat.."
                  className="w-full text-xs p-2.5 bg-slate-50 border rounded-lg focus:border-blue-900 focus:bg-white"
                  value={artForm.summary}
                  onChange={(e) => setArtForm({ ...artForm, summary: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-[9.5px] font-bold text-slate-500 mb-1 uppercase">Struktur Kategori</label>
                <select
                  className="w-full text-xs p-2 bg-white border border-slate-300 rounded-lg focus:border-blue-900"
                  value={artForm.category}
                  onChange={(e) => setArtForm({ ...artForm, category: e.target.value })}
                >
                  <option value="Tips Keuangan">Tips Keuangan & Kesejahteraan</option>
                  <option value="Unit Usaha">Sekilas Unit Usaha Koperasi</option>
                  <option value="Lainnya">Berita Umum & Kegiatan Sosial</option>
                </select>
              </div>

              <div>
                <label className="block text-[9.5px] font-bold text-slate-500 mb-1 uppercase">Isi Konten Artikel Lengkap</label>
                <textarea
                  required
                  rows={4}
                  placeholder="Tulis artikel lengkap di sini..."
                  className="w-full text-xs p-2.5 bg-slate-50 border rounded-lg focus:border-blue-900 focus:bg-white"
                  value={artForm.content}
                  onChange={(e) => setArtForm({ ...artForm, content: e.target.value })}
                />
              </div>

              <div className="flex gap-2">
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-indigo-900 hover:bg-black font-extrabold text-[#ffffff] rounded-lg text-xs leading-none uppercase tracking-wide cursor-pointer"
                >
                  {editingArtId ? "Perbarui Artikel" : "Simpan & Upload Artikel"}
                </button>
                {editingArtId && (
                  <button
                    type="button"
                    onClick={() => {
                      setEditingArtId(null);
                      setArtForm({ title: '', summary: '', content: '', category: 'Tips Keuangan' });
                    }}
                    className="px-4 py-2.5 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold rounded-lg text-xs leading-none uppercase cursor-pointer"
                  >
                    Batal
                  </button>
                )}
              </div>
            </form>

            {/* Existing Articles manager */}
            <div className="pt-4 border-t border-slate-150 space-y-2">
              <h4 className="text-[10px] font-black uppercase text-slate-400">Draf Artikel Terbit ({articles.length})</h4>
              <div className="divide-y divide-slate-100 max-h-44 overflow-y-auto pr-1">
                {articles.map((art) => (
                  <div key={art.id} className="py-2 flex justify-between items-center text-[10.5px]">
                    <span className="truncate max-w-[150px] font-bold text-slate-800">{art.title}</span>
                    <div className="flex gap-1">
                      <button
                        type="button"
                        onClick={() => {
                          setEditingArtId(art.id);
                          setArtForm({
                            title: art.title,
                            summary: art.summary,
                            content: art.content,
                            category: art.category
                          });
                        }}
                        className="text-blue-600 px-2 py-0.5 hover:bg-blue-50 rounded font-bold"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          if (confirm("Hapus artikel ini dari frontpage?")) onDeleteArticle(art.id);
                        }}
                        className="text-red-650 px-2 py-0.5 hover:bg-red-50 rounded font-bold"
                      >
                        Hapus
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* ANNOUNCEMENT BOARD EDITOR */}
          <div className="bg-white border rounded-xl p-6 shadow-xs space-y-4">
            <h3 className="text-xs font-black uppercase text-blue-950 flex items-center gap-1 pb-2 border-b">
              <Megaphone className="w-4 h-4 text-emerald-600 animate-bounce" /> Sematkan Pengumuman Urgent Koperasi
            </h3>

            <form onSubmit={handleCreateAnnouncement} className="space-y-4">
              <div>
                <label className="block text-[9.5px] font-bold text-slate-500 mb-1 uppercase">Headline Pengumuman</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Pelunasan Simpanan Wajib Sebelum Tutup Buku"
                  className="w-full text-xs p-2.5 bg-slate-50 border rounded-lg focus:border-blue-900 focus:bg-white"
                  value={annForm.title}
                  onChange={(e) => setAnnForm({ ...annForm, title: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-[9.5px] font-bold text-slate-500 mb-1 uppercase">Deskripsi Detail Pengumuman</label>
                <textarea
                  required
                  rows={3}
                  placeholder="Tulis petunjuk lengkap di sini..."
                  className="w-full text-xs p-2.5 bg-slate-50 border rounded-lg focus:border-blue-900 focus:bg-white"
                  value={annForm.content}
                  onChange={(e) => setAnnForm({ ...annForm, content: e.target.value })}
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="ann-important"
                  className="rounded border-slate-350 bg-slate-50 w-4 h-4 cursor-pointer"
                  checked={annForm.important}
                  onChange={(e) => setAnnForm({ ...annForm, important: e.target.checked })}
                />
                <label htmlFor="ann-important" className="text-[10px] font-bold text-slate-650 cursor-pointer uppercase">
                  Flag/Tandai sebagai Pengumuman Paling Penting (Highlight Amber)
                </label>
              </div>

              <div className="flex gap-2">
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-slate-900 hover:bg-slate-950 font-extrabold text-white rounded-lg text-xs leading-none uppercase tracking-wide cursor-pointer"
                >
                  {editingAnnId ? "Perbarui Pengumuman" : "Sematkan Pengumuman"}
                </button>
                {editingAnnId && (
                  <button
                    type="button"
                    onClick={() => {
                      setEditingAnnId(null);
                      setAnnForm({ title: '', content: '', important: false });
                    }}
                    className="px-4 py-2.5 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold rounded-lg text-xs leading-none uppercase cursor-pointer"
                  >
                    Batal
                  </button>
                )}
              </div>
            </form>

            <div className="pt-4 border-t border-slate-150 space-y-2">
              <h4 className="text-[10px] font-black uppercase text-slate-400">Pengumuman Aktif ({announcements.length})</h4>
              <div className="divide-y divide-slate-100 max-h-44 overflow-y-auto pr-1">
                {announcements.map((ann) => (
                  <div key={ann.id} className="py-2 flex justify-between items-center text-[10.5px]">
                    <span className="truncate max-w-[150px] font-bold text-slate-850">
                      {ann.title} {ann.important && '⚠️'}
                    </span>
                    <div className="flex gap-1">
                      <button
                        type="button"
                        onClick={() => {
                          setEditingAnnId(ann.id);
                          setAnnForm({
                            title: ann.title,
                            content: ann.content,
                            important: ann.important
                          });
                        }}
                        className="text-blue-600 px-2 py-0.5 hover:bg-blue-50 rounded font-bold"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          if (confirm("Hapus pengumuman ini?")) onDeleteAnnouncement(ann.id);
                        }}
                        className="text-red-500 px-2 py-0.5 hover:bg-red-50 rounded font-bold"
                      >
                        Hapus
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>

        </div>
      )}

      {/* ================= TAB 2.5: KEBIJAKAN & REGULASI EDITOR ================= */}
      {activeTabSec === 'kebijakan_editor' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-fade-in text-xs mb-6">
          
          {/* REGULATION WRITER FORM */}
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-4">
            <h3 className="text-xs font-black uppercase text-slate-900 flex items-center gap-1.5 pb-2 border-b border-slate-100">
              <FileText className="w-4 h-4 text-amber-500" /> {editingRegId ? 'Ubah Regulasi & Kebijakan' : 'Tambahkan Regulasi & Kebijakan Baru'}
            </h3>

            <form onSubmit={handleCreateOrUpdateRegulation} className="space-y-4">
              <div>
                <label className="block text-[9.5px] font-bold text-slate-500 mb-1 uppercase">Judul Regulasi / Kebijakan resmi</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: AD/ART Bab I Ketentuan Keanggotaan"
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:border-blue-950 focus:bg-white text-slate-900 font-medium outline-none"
                  value={regForm.title}
                  onChange={(e) => setRegForm({ ...regForm, title: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[9.5px] font-bold text-slate-500 mb-1 uppercase">No. Urutan Tampilan</label>
                  <input
                    type="number"
                    required
                    min={1}
                    className="w-full text-xs p-2 bg-slate-50 border border-slate-300 rounded-lg focus:border-blue-950 text-slate-900 font-mono font-bold outline-none"
                    value={regForm.order}
                    onChange={(e) => setRegForm({ ...regForm, order: Number(e.target.value) || 1 })}
                  />
                </div>
                
                <div className="flex items-end justify-end">
                  {editingRegId && (
                    <button
                      type="button"
                      onClick={handleCancelEditRegulation}
                      className="px-3.5 py-2 text-xs font-bold text-red-600 hover:bg-red-50 rounded-lg border border-red-200 cursor-pointer"
                    >
                      Batal Edit
                    </button>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-[9.5px] font-bold text-slate-500 mb-1 uppercase font-sans">Isi / Narasi Detail Dokumen Kebijakan (Mendukung Newline/Baris baru)</label>
                <textarea
                  rows={8}
                  required
                  placeholder="Tulis pasal-pasal, syarat, aturan, regulasi, AD/ART secara lengkap di sini..."
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:border-blue-950 focus:bg-white leading-relaxed font-sans text-slate-800 outline-none"
                  value={regForm.content}
                  onChange={(e) => setRegForm({ ...regForm, content: e.target.value })}
                />
              </div>

              <button
                type="submit"
                className="w-full bg-amber-400 hover:bg-amber-500 text-slate-950 font-black py-2.5 px-4 rounded-lg uppercase tracking-wider text-[11px] select-none cursor-pointer transition shadow-xs"
              >
                {editingRegId ? 'Simpan Perubahan Regulasi' : 'Publikasikan Regulasi Baru'}
              </button>
            </form>
          </div>

          {/* REGULATION DATABASE LISTS */}
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-4">
            <h3 className="text-xs font-black uppercase text-blue-950 flex items-center gap-1.5 pb-2 border-b border-slate-100">
               ⚖️ Dokumen Kebijakan & Regulasi Terpublikasi ({regulations.length})
            </h3>

            <div className="space-y-3 max-h-[460px] overflow-y-auto pr-1">
              {regulations.length === 0 ? (
                <p className="text-slate-400 italic text-center py-8">Belum ada dokumen kebijakan yang terdaftar.</p>
              ) : (
                [...regulations]
                  .sort((a, b) => (a.order || 0) - (b.order || 0))
                  .map((reg) => (
                    <div key={reg.id} className="p-3 border rounded-lg bg-slate-50/50 hover:bg-slate-50 transition border-slate-200">
                      <div className="flex justify-between items-start gap-2">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="bg-indigo-900 text-white text-[9px] font-black w-5 h-5 rounded-full flex items-center justify-center font-mono shrink-0">
                              {reg.order || '-'}
                            </span>
                            <h4 className="font-bold text-xs text-slate-900 leading-tight truncate">{reg.title}</h4>
                          </div>
                          <p className="text-[11px] text-slate-500 mt-1.5 line-clamp-3 leading-relaxed whitespace-pre-wrap">
                            {reg.content}
                          </p>
                        </div>

                        <div className="flex flex-col gap-1 items-end shrink-0 ml-2">
                          <button
                            type="button"
                            onClick={() => handleStartEditRegulation(reg)}
                            className="px-2 py-1 bg-white hover:bg-slate-100 text-slate-700 text-[10px] font-bold border border-slate-300 rounded-md cursor-pointer transition"
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              if (confirm(`Anda yakin ingin menghapus kebijakan: "${reg.title}"?`)) {
                                onDeleteRegulation(reg.id);
                                onLogActivity(`Menghapus kebijakan: ${reg.title}`);
                              }
                            }}
                            className="px-2 py-1 bg-white hover:bg-red-50 text-red-600 hover:text-red-750 text-[10px] font-bold border border-red-200 rounded-md cursor-pointer transition"
                          >
                            Hapus
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* ================= TAB 3: PRINT KOP SURAT PDF ================= */}
      {activeTabSec === 'kop_pdf' && (
        <div className="bg-white border rounded-xl p-6 shadow-xs space-y-6">
          <div className="text-center">
            <h3 className="text-sm font-black text-[#0c4a80] uppercase tracking-wider">Cari & Cetak Kop Surat Resmi Koperasi</h3>
            <p className="text-slate-500 max-w-md mx-auto leading-normal mt-0.5">
              Kop surat memuat metadata logo, nama kantor sekretariat utama, alamat fisik, nomor legalitas izin pendirian, telfon (WA), serta email korespondensi secara transparan.
            </p>
          </div>

          <div className="border border-slate-350 p-6 rounded-lg bg-white relative max-w-3xl mx-auto shadow-xs select-none">
            {/* Kop Preview */}
            <div className="border-b-4 border-double border-slate-950 pb-4 text-center">
              <table className="w-full">
                <tbody>
                  <tr>
                    <td className="w-1/6 text-center">
                      <img src={settings.logo} className="h-20 w-20 object-contain mx-auto" alt="Logo Pre" />
                    </td>
                    <td className="w-5/6 text-center pl-4">
                      <p className="text-[10px] font-black text-amber-600 block uppercase tracking-wider leading-none">KOPERASI JASA SERBA USAHA</p>
                      <h4 className="text-[18px] font-black text-blue-900 tracking-tight leading-tight uppercase font-sans">IKATAN PROFESIONAL & PENSIUNAN INDONESIA</h4>
                      <p className="text-xs font-black uppercase text-slate-800 leading-snug">DPW PROVINSI JAWA TIMUR</p>
                      <p className="text-[10px] text-slate-550 leading-relaxed max-w-[450px] mx-auto mt-0.5">{settings.alamatSekretariat}</p>
                      <p className="font-mono text-[8.5px] text-slate-400 mt-1">
                        Ijin Pendirian: {settings.noIjinPendirian} | Hotline WA: {settings.noTelpWA} | Email: {settings.email}
                      </p>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="h-44 flex items-center justify-center text-slate-400 italic font-mono text-[10.5px]">
              [ Ruang Penulisan Dokumen Surat Resmi / SPJ Koperasi ]
            </div>
          </div>

          <div className="flex justify-center pt-2">
            <button
              onClick={handlePrintKopSurat}
              className="flex items-center gap-2 px-6 py-2.5 bg-indigo-900 hover:bg-black font-extrabold text-white rounded-lg shadow-md transition-all uppercase tracking-wider text-xs cursor-pointer active:scale-95 leading-none"
            >
              <Printer className="w-4 h-4" /> Cetak Kop Surat Resmi ke PDF
            </button>
          </div>
        </div>
      )}

      {/* ================= TAB 4: LMS COURSE CURRICULUM MANAGEMENT ================= */}
      {activeTabSec === 'lms' && (
        <div className="bg-slate-950 text-white border border-slate-800 rounded-xl overflow-hidden shadow-xs p-6">
          <div className="border-b border-white/5 pb-4 mb-4">
            <h3 className="text-sm font-black uppercase text-amber-400 flex items-center gap-1.5 font-sans">
              <BookOpen className="w-5 h-5 text-indigo-400" /> Kurikulum LMS & Manajemen Soal Kuis (Sekretaris)
            </h3>
            <p className="text-slate-400 text-[11px] mt-0.5">Tambah, ubah, dan hapus modul kursus, pembelajaran sub-bab materi, tautan media luar, serta pertanyaan kuis secara terintegrasi.</p>
          </div>
          
          <LMSPortal
            currentUser={secretaryMember}
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

    </div>
  );
};
