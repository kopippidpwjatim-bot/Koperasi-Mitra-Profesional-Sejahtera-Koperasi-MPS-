import React, { useState } from 'react';
import { 
  User, Wallet, ArrowDownUp, TrendingUp, Cpu, PhoneCall, 
  HelpCircle, CreditCard, Sparkles, LogOut, Edit, Save, 
  ArrowUpRight, ArrowDownLeft, ReceiptText, Sparkle, Percent, CheckCircle,
  GraduationCap, CheckSquare
} from 'lucide-react';
import { Member, Transaction, CooperativeSettings, LoanApplication, WithdrawalRequest, LMSCourse, LMSUserProgress, PollSettings, PollCandidate, PollVote } from '../types';
import { KTA } from './KTA';
import { LMSPortal } from './LMSPortal';

interface DashboardAnggotaProps {
  member: Member;
  settings: CooperativeSettings;
  transactions: Transaction[];
  loans: LoanApplication[];
  withdrawals: WithdrawalRequest[];
  onUpdateProfile: (updatedData: Partial<Member>) => void;
  onApplyLoan: (loanData: { jumlah: number, tenor: number, tujuan: string }) => void;
  onApplyWithdrawal: (withdrawalData: { jumlah: number, jenisSimpanan: 'Sukarela' | 'Penyertaan' }) => void;
  onBuyPPOB: (amount: number, ppobType: string, refDetail: string) => boolean;
  onLogout: () => void;
  
  // LMS
  courses: LMSCourse[];
  progressList: LMSUserProgress[];
  onSaveProgress: (updatedProgress: LMSUserProgress) => Promise<void>;
  onSaveCourses: (updatedCourses: LMSCourse[]) => Promise<void>;
  onLogActivity: (activity: string) => void;
  members: Member[];

  // Polling
  pollSettings: PollSettings;
  pollCandidates: PollCandidate[];
  pollVotes: PollVote[];
  onCastVote: (candidateId: string) => void;
}

export const DashboardAnggota: React.FC<DashboardAnggotaProps> = ({
  member,
  settings,
  transactions,
  loans,
  withdrawals,
  onUpdateProfile,
  onApplyLoan,
  onApplyWithdrawal,
  onBuyPPOB,
  onLogout,
  courses,
  progressList,
  onSaveProgress,
  onSaveCourses,
  onLogActivity,
  members,
  pollSettings,
  pollCandidates,
  pollVotes,
  onCastVote
}) => {
  const [activeTab, setActiveTab] = useState<'ringkasan' | 'layanan' | 'kta' | 'profil' | 'lms' | 'pemilu'>('ringkasan');

  // Polling helper data
  const totalVotesCast = pollVotes.length;
  const voterVote = pollVotes.find(v => v.memberId === member.id);
  const hasVoted = !!voterVote;
  const isExpired = new Date() > new Date(pollSettings.endDate);
  const isPollingOn = pollSettings.isPollingActive && !isExpired;

  const formatDateString = (dtStr: string) => {
    try {
      const d = new Date(dtStr);
      return d.toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' }) + " WIB";
    } catch(e) {
      return dtStr;
    }
  };

  const getCandidateVotes = (candidateId: string) => {
    return pollVotes.filter(v => v.candidateId === candidateId).length;
  };

  const getCandidatePercentage = (candidateId: string) => {
    if (totalVotesCast === 0) return 0;
    return Math.round((getCandidateVotes(candidateId) / totalVotesCast) * 100);
  };

  const [isEditingProfile, setIsEditingProfile] = useState<boolean>(false);
  
  // Profile edits
  const [namaEdit, setNamaEdit] = useState(member.nama);
  const [tempatLahirEdit, setTempatLahirEdit] = useState(member.tempatLahir);
  const [tanggalLahirEdit, setTanggalLahirEdit] = useState(member.tanggalLahir);
  const [institusiPensiunEdit, setInstitusiPensiunEdit] = useState(member.institusiPensiun);
  const [jenisKelaminEdit, setJenisKelaminEdit] = useState(member.jenisKelamin);
  const [agamaEdit, setAgamaEdit] = useState(member.agama);
  const [pekerjaanKeahlianEdit, setPekerjaanKeahlianEdit] = useState(member.pekerjaanKeahlian);
  const [jenisUmkmEdit, setJenisUmkmEdit] = useState(member.jenisUmkm || '');
  const [phoneEdit, setPhoneEdit] = useState(member.noHp);
  const [emailEdit, setEmailEdit] = useState(member.email);
  const [addressEdit, setAddressEdit] = useState(member.alamatLengkap);
  const [photoEdit, setPhotoEdit] = useState(member.photo || '');
  const [passwordEdit, setPasswordEdit] = useState(member.password || '');

  // Loan application
  const [loanForm, setLoanForm] = useState({ jumlah: 2000000, tenor: 12, tujuan: '' });
  const [loanSuccessMsg, setLoanSuccessMsg] = useState<string | null>(null);

  // Withdrawal form
  const [withdrawForm, setWithdrawForm] = useState({ jumlah: 100000, jenisSimpanan: 'Sukarela' as 'Sukarela' | 'Penyertaan' });
  const [withdrawSuccessMsg, setWithdrawSuccessMsg] = useState<string | null>(null);

  // PPOB form
  const [ppobType, setPpobType] = useState<'token' | 'pulsa'>('pulsa');
  const [ppobForm, setPpobForm] = useState({ number: '', nominal: 25000 });
  const [ppobSuccess, setPpobSuccess] = useState<string | null>(null);

  // Filter transactions owned by this member account number
  const memberTxs = transactions.filter(t => t.noRekening === member.noRekening || t.memberId === member.id);

  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(val);
  };

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateProfile({
      nama: namaEdit,
      tempatLahir: tempatLahirEdit,
      tanggalLahir: tanggalLahirEdit,
      institusiPensiun: institusiPensiunEdit,
      jenisKelamin: jenisKelaminEdit,
      agama: agamaEdit,
      pekerjaanKeahlian: pekerjaanKeahlianEdit,
      jenisUmkm: jenisUmkmEdit,
      noHp: phoneEdit,
      email: emailEdit,
      alamatLengkap: addressEdit,
      photo: photoEdit,
      password: passwordEdit
    });
    setIsEditingProfile(false);
    alert("Profil berhasil diperbarui!");
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoEdit(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleLoanSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!loanForm.tujuan) {
      alert("Mohon isi tujuan pengajuan pinjaman modal.");
      return;
    }
    onApplyLoan(loanForm);
    setLoanSuccessMsg(`Pengajuan pinjaman sebesar ${formatRupiah(loanForm.jumlah)} dengan tenor ${loanForm.tenor} bulan sukses dikirim! Status: MENUNGGU SELEKSI KETUA KOPERASI.`);
    setTimeout(() => setLoanSuccessMsg(null), 7000);
    setLoanForm({ jumlah: 2000000, tenor: 12, tujuan: '' });
  };

  const handleWithdrawSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const balance = withdrawForm.jenisSimpanan === 'Sukarela' ? member.saldoSukarela : member.saldoPenyertaan;
    if (withdrawForm.jumlah <= 0) {
      alert("Masukkan nominal penarikan dana yang valid.");
      return;
    }
    if (withdrawForm.jumlah > balance) {
      alert(`Saldo Simpanan ${withdrawForm.jenisSimpanan} Anda tidak mencukupi untuk penarikan sebesar ${formatRupiah(withdrawForm.jumlah)}.`);
      return;
    }
    onApplyWithdrawal(withdrawForm);
    setWithdrawSuccessMsg(`Permohonan tarik dana sebesar ${formatRupiah(withdrawForm.jumlah)} berhasil diajukan! Hubungi Bendahara setempat untuk pencairan.`);
    setTimeout(() => setWithdrawSuccessMsg(null), 7000);
  };

  const handlePpobSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (ppobForm.number.length < 8) {
      alert("Masukkan nomor tujuan/nomor meteran PLN yang valid.");
      return;
    }
    const success = onBuyPPOB(ppobForm.nominal, ppobType === 'pulsa' ? "PULSA HP" : "TOKEN LISTRIK", `No: ${ppobForm.number}`);
    if (success) {
      setPpobSuccess(`Transaksi PPOB Berhasil! Pengisian ${ppobType.toUpperCase()} nominal ${formatRupiah(ppobForm.nominal)} ke ${ppobForm.number} sukses. Saldo Sukarela Anda terpotong otomatis.`);
      setPpobForm({ number: '', nominal: 25000 });
      setTimeout(() => setPpobSuccess(null), 6000);
    } else {
      alert("Transaksi Gagal. Saldo Sukarela koperasi Anda tidak mencukupi.");
    }
  };

  // SHU statement calculation
  const totalSavings = member.saldoPokok + member.saldoWajib + member.saldoSukarela + member.saldoPenyertaan;
  const estimatedSHU = Math.round(totalSavings * 0.085); // 8.5% annual yield SHU simulation

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
      
      {/* Top Welcome Title */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 shadow-xs">
        <div className="flex gap-4 items-center">
          <div className="w-14 h-14 bg-blue-900 border-2 border-[#dca415] rounded-full overflow-hidden flex items-center justify-center text-white font-bold text-xl">
            {member.photo ? (
              <img src={member.photo} className="w-full h-full object-cover" alt="Avatar" />
            ) : (
              member.nama.charAt(0)
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase bg-blue-100 text-blue-900 px-2 py-0.5 rounded-full select-none">ANGGOTA AKTIF</span>
              <span className="text-[10px] font-mono text-slate-500">ID: {member.noAnggota}</span>
            </div>
            <h2 className="text-base sm:text-lg font-black text-slate-900">{member.nama}</h2>
            <p className="text-xs text-slate-550">Rekening Koperasi: <span className="font-mono font-bold text-blue-950">{member.noRekening}</span></p>
          </div>
        </div>

        <button
          onClick={onLogout}
          className="flex items-center gap-1.5 px-4 py-2 bg-red-50 hover:bg-red-100 text-red-700 font-bold rounded-lg text-xs transition cursor-pointer"
        >
          <LogOut className="w-4 h-4" /> Log Out
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Side Tab Navigation */}
        <div className="lg:col-span-3 flex flex-row lg:flex-col gap-1 overflow-x-auto lg:overflow-x-visible pb-2 lg:pb-0 bg-white p-3 rounded-xl border border-slate-200 shadow-xs max-h-fit">
          {[
            { id: 'ringkasan', lbl: 'Ringkasan & Finansial', icon: <Wallet className="w-4 h-4" /> },
            { id: 'layanan', lbl: 'Layanan Pengajuan', icon: <ArrowDownUp className="w-4 h-4" /> },
            { id: 'kta', lbl: 'Cetak KTA', icon: <CreditCard className="w-4 h-4" /> },
            { id: 'lms', lbl: 'LMS Pembelajaran', icon: <GraduationCap className="w-4 h-4" /> },
            { id: 'pemilu', lbl: 'Pemilihan Ketua', icon: <CheckSquare className="w-4 h-4" /> },
            { id: 'profil', lbl: 'Sunting Identitas', icon: <User className="w-4 h-4" /> }
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id as any)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-black transition-all text-left whitespace-nowrap lg:whitespace-normal cursor-pointer ${
                activeTab === t.id 
                  ? 'bg-blue-900 text-white shadow-xs' 
                  : 'text-slate-600 hover:bg-slate-50 hover:text-blue-900'
              }`}
            >
              {t.icon}
              {t.lbl}
            </button>
          ))}
        </div>

        {/* Right Side Content Pane */}
        <div className="lg:col-span-9 space-y-6">
          
          {/* ================= TAB 1: RINGKASAN & FINANSIAL ================= */}
          {activeTab === 'ringkasan' && (
            <div className="space-y-6">
              
              {/* SAVINGS BLOCKS GRID */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                {[
                  { lbl: "Simpanan Pokok", amount: member.saldoPokok, desc: "Sertifikat dasar saham", border: "border-l-4 border-blue-900" },
                  { lbl: "Simpanan Wajib", amount: member.saldoWajib, desc: "Iuran rutin wajib bulanan", border: "border-l-4 border-yellow-500" },
                  { lbl: "Simpanan Sukarela", amount: member.saldoSukarela, desc: "Tabungan liquid harian", border: "border-l-4 border-emerald-500" },
                  { lbl: "Penyertaan Modal", amount: member.saldoPenyertaan, desc: "Deposito dana berjangka", border: "border-l-4 border-purple-500" }
                ].map((s, idx) => (
                  <div key={idx} className={`bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between ${s.border}`}>
                    <div>
                      <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold block">{s.lbl}</span>
                      <p className="text-base font-black text-slate-800 tracking-tight mt-1">{formatRupiah(s.amount)}</p>
                    </div>
                    <span className="text-[9px] text-slate-500 leading-none mt-2 font-medium">{s.desc}</span>
                  </div>
                ))}
              </div>

              {/* TOTAL BALANCE & SHU PANEL */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* Cumulative Totals */}
                <div className="bg-slate-900 text-white rounded-xl p-5 border-l-4 border-yellow-500 flex flex-col justify-between shadow-sm relative overflow-hidden">
                  <div className="absolute right-0 bottom-0 translate-x-4 translate-y-4 text-white/5 font-black text-8xl">RP</div>
                  <div className="space-y-1">
                    <span className="text-[9.5px] uppercase tracking-widest text-[#dca415] font-black">TOTAL KEPEMILIKAN DANA</span>
                    <h3 className="text-2xl font-black font-mono text-white tracking-tight">{formatRupiah(totalSavings)}</h3>
                  </div>
                  <p className="text-[10px] text-slate-400 font-medium leading-relaxed mt-4">
                    Merupakan akumulasi dari seluruh tabungan Anda, berhak atas andil perhitungan deviden penutupan buku tahunan.
                  </p>
                </div>

                {/* SHU STATEMENT */}
                <div className="bg-emerald-50/50 border border-emerald-250 rounded-xl p-5 flex flex-col justify-between relative overflow-hidden">
                  <div className="absolute right-2 top-2">
                    <Percent className="w-10 h-10 text-emerald-100" />
                  </div>
                  <div className="space-y-1">
                    <span className="text-[9.5px] uppercase tracking-widest text-emerald-800 font-black">ESTIMASI LAPORAN SISA HASIL USAHA (SHU)</span>
                    <h3 className="text-2xl font-black font-mono text-emerald-950 tracking-tight">{formatRupiah(estimatedSHU)}</h3>
                  </div>
                  <div className="mt-4 text-[9px] text-slate-600 leading-normal space-y-1">
                    <p className="font-bold text-emerald-900 flex items-center gap-1">✔ Estimasi Margin Deviden Keaktifan: 8.5% p.a.</p>
                    <p>Pembagian SHU dibagikan tertib setiap RAT Koperasi pertengahan tahun buku berjalan.</p>
                  </div>
                </div>

              </div>

              {/* ACCOUNT MUTATION / MUTASI REKENING */}
              <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-4">
                <h3 className="text-xs uppercase tracking-wider font-extrabold text-blue-950 flex items-center gap-1.5">
                  <ArrowDownUp className="w-4 h-4 text-yellow-600" /> Histori Mutasi & Buku Tabungan Anggota
                </h3>
                
                {memberTxs.length === 0 ? (
                  <div className="text-center py-6 text-slate-400 text-xs italic">
                    Belum ada riwayat transaksi finansial tercatat pada rekening {member.noRekening}.
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="bg-slate-50 text-slate-500 uppercase tracking-wide text-[9.5px] border-b border-slate-200">
                          <th className="py-2.5 px-3">Tanggal</th>
                          <th className="py-2.5 px-3">Jenis</th>
                          <th className="py-2.5 px-3">Deskripsi / Keterangan</th>
                          <th className="py-2.5 px-3 text-right">Debit / Masuk (Rp)</th>
                          <th className="py-2.5 px-3 text-right">Kredit / Keluar (Rp)</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-slate-700">
                        {memberTxs.map((t) => (
                          <tr key={t.id} className="hover:bg-slate-50 transition">
                            <td className="py-2.5 px-3 font-mono">{t.tanggal}</td>
                            <td className="py-2.5 px-3">
                              <span className={`px-2 py-0.5 rounded-full text-[9px] font-black ${
                                t.kategori === 'Uang Masuk' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
                              }`}>
                                {t.sumberTujuan}
                              </span>
                            </td>
                            <td className="py-2.5 px-3 truncate max-w-[200px]" title={t.deskripsi}>{t.deskripsi}</td>
                            <td className="py-2.5 px-3 text-right font-mono font-bold text-green-600">
                              {t.jumlahMasuk > 0 ? formatRupiah(t.jumlahMasuk) : '-'}
                            </td>
                            <td className="py-2.5 px-3 text-right font-mono font-bold text-red-600">
                              {t.jumlahKeluar > 0 ? formatRupiah(t.jumlahKeluar) : '-'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

            </div>
          )}

          {/* ================= TAB 2: LAYANAN LAYANAN ================= */}
          {activeTab === 'layanan' && (
            <div className="space-y-6">
              
              {/* SUB NAV LAYANAN */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                {/* COL 1: ONLINE LOAN APPLICATION */}
                <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-4">
                  <h3 className="text-xs font-black uppercase text-blue-950 flex items-center gap-1 border-b border-slate-100 pb-2">
                    <TrendingUp className="w-4 h-4 text-amber-500" /> Pengajuan Pinjaman
                  </h3>

                  {loanSuccessMsg ? (
                    <div className="p-3 bg-green-50 text-green-800 border border-green-200 rounded-lg text-[10.5px] leading-relaxed font-bold">
                      {loanSuccessMsg}
                    </div>
                  ) : (
                    <form onSubmit={handleLoanSubmit} className="space-y-3">
                      <div>
                        <label className="block text-[9.5px] font-bold text-slate-500 mb-1 uppercase">Nominal Ajuan</label>
                        <select
                          className="w-full text-xs p-2 bg-white border border-slate-300 rounded-lg font-mono focus:border-blue-900"
                          value={loanForm.jumlah}
                          onChange={(e) => setLoanForm({ ...loanForm, jumlah: parseInt(e.target.value) })}
                        >
                          <option value="2000000">Rp 2.000.000</option>
                          <option value="5000000">Rp 5.000.000</option>
                          <option value="10000000">Rp 10.000.000</option>
                          <option value="15000000">Rp 15.000.000</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[9.5px] font-bold text-slate-500 mb-1 uppercase">Tenor Angsuran</label>
                        <select
                          className="w-full text-xs p-2 bg-white border border-slate-300 rounded-lg focus:border-blue-900"
                          value={loanForm.tenor}
                          onChange={(e) => setLoanForm({ ...loanForm, tenor: parseInt(e.target.value) })}
                        >
                          <option value="6">6 Bulan (Bunga 1.2% / Bln)</option>
                          <option value="12">12 Bulan (Bunga 1.0% / Bln)</option>
                          <option value="24">24 Bulan (Bunga 0.8% / Bln)</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[9.5px] font-bold text-slate-500 mb-1 uppercase">Tujuan Penggunaan Dana</label>
                        <textarea
                          required
                          rows={2}
                          placeholder="Contoh: Tambahan modal budidaya tambak udang pensiunan atau modal toko."
                          className="w-full text-xs p-2 border border-slate-300 rounded-lg focus:border-blue-900"
                          value={loanForm.tujuan}
                          onChange={(e) => setLoanForm({ ...loanForm, tujuan: e.target.value })}
                        />
                      </div>

                      {/* Display Simulation right inside tool */}
                      <div className="bg-slate-50 p-2.5 rounded text-[10px] space-y-1 font-mono">
                        <div className="flex justify-between">
                          <span>Estimasi Bunga:</span>
                          <span>{loanForm.tenor === 6 ? '1.2%' : loanForm.tenor === 12 ? '1.0%' : '0.8%'} / Bln</span>
                        </div>
                        <div className="flex justify-between font-bold text-blue-900 border-t border-slate-200 pt-1 mt-1">
                          <span>Total Angsuran :</span>
                          <span>
                            {formatRupiah(
                              Math.round(
                                (loanForm.jumlah + (loanForm.jumlah * (loanForm.tenor === 6 ? 1.2 : loanForm.tenor === 12 ? 1.0 : 0.8) / 100 * loanForm.tenor)) / loanForm.tenor
                              )
                            )} / Bln
                          </span>
                        </div>
                      </div>

                      <button
                        type="submit"
                        className="w-full py-2 bg-blue-900 hover:bg-blue-950 text-white font-extrabold text-[11px] leading-none uppercase tracking-wide rounded-lg cursor-pointer"
                      >
                        Kirim Pengajuan Modul
                      </button>
                    </form>
                  )}
                </div>

                {/* COL 2: WITHDRAWAL FORM */}
                <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-4">
                  <h3 className="text-xs font-black uppercase text-blue-950 flex items-center gap-1 border-b border-slate-100 pb-2">
                    <ArrowDownLeft className="w-4 h-4 text-emerald-500" /> Tarik Dana Simpanan
                  </h3>

                  {withdrawSuccessMsg ? (
                    <div className="p-3 bg-green-50 text-green-800 border border-green-200 rounded-lg text-[10.5px] leading-relaxed font-bold">
                      {withdrawSuccessMsg}
                    </div>
                  ) : (
                    <form onSubmit={handleWithdrawSubmit} className="space-y-4">
                      <div>
                        <label className="block text-[9.5px] font-bold text-slate-500 mb-1 uppercase">pilih Jenis Simpanan</label>
                        <select
                          className="w-full text-xs p-2 bg-white border border-slate-300 rounded-lg focus:border-blue-900"
                          value={withdrawForm.jenisSimpanan}
                          onChange={(e) => setWithdrawForm({ ...withdrawForm, jenisSimpanan: e.target.value as any })}
                        >
                          <option value="Sukarela">Simpanan Sukarela ({formatRupiah(member.saldoSukarela)})</option>
                          <option value="Penyertaan">Penyertaan Modal ({formatRupiah(member.saldoPenyertaan)})</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[9.5px] font-bold text-slate-500 mb-1 uppercase">Nominal Penarikan (Rp)</label>
                        <input
                          type="number"
                          required
                          className="w-full text-xs p-2.5 border border-slate-300 rounded-lg font-mono focus:border-blue-900"
                          placeholder="Masukkan nominal, contoh: 50000"
                          value={withdrawForm.jumlah}
                          onChange={(e) => setWithdrawForm({ ...withdrawForm, jumlah: parseFloat(e.target.value) || 0 })}
                        />
                      </div>

                      <div className="p-2.5 bg-yellow-50 text-[10px] text-yellow-900 leading-normal rounded border border-yellow-200">
                        Pencairan simpanan sukarela cair instant s/d limit plafon harian bendahara. Nominal di atas 5 juta memerlukan verifikasi.
                      </div>

                      <button
                        type="submit"
                        className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-[11px] leading-none uppercase tracking-wide rounded-lg cursor-pointer"
                      >
                        Ajukan Penarikan Dana
                      </button>
                    </form>
                  )}
                </div>

                {/* COL 3: DIGITAL PPOB CHEKOUT */}
                <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-4">
                  <h3 className="text-xs font-black uppercase text-blue-950 flex items-center gap-1 border-b border-slate-100 pb-2">
                    <Cpu className="w-4 h-4 text-purple-600" /> Transaksi PPOB / Pulsa
                  </h3>

                  {ppobSuccess ? (
                    <div className="p-3 bg-indigo-50 text-indigo-800 border border-indigo-200 rounded-lg text-[10.5px] leading-relaxed font-bold">
                      {ppobSuccess}
                    </div>
                  ) : (
                    <form onSubmit={handlePpobSubmit} className="space-y-3">
                      <div className="flex bg-slate-50 p-1 rounded-lg">
                        <button
                          type="button"
                          onClick={() => setPpobType('pulsa')}
                          className={`flex-1 py-1 rounded-md text-[10px] font-bold transition-all ${ppobType === 'pulsa' ? 'bg-white shadow-xs text-blue-900' : 'text-slate-500'}`}
                        >
                          Isi Pulsa HP
                        </button>
                        <button
                          type="button"
                          onClick={() => setPpobType('token')}
                          className={`flex-1 py-1 rounded-md text-[10px] font-bold transition-all ${ppobType === 'token' ? 'bg-white shadow-xs text-blue-900' : 'text-slate-500'}`}
                        >
                          Token Listrik
                        </button>
                      </div>

                      <div>
                        <label className="block text-[9.5px] font-bold text-slate-500 mb-1 uppercase">
                          {ppobType === 'pulsa' ? "Nomor Handphone" : "ID Pelanggan PLN / Meteran"}
                        </label>
                        <input
                          type="text"
                          required
                          className="w-full text-xs p-2 border border-slate-300 rounded-lg font-mono focus:border-blue-900"
                          placeholder={ppobType === 'pulsa' ? "Contoh: 081803100222" : "Contoh: 1403212891"}
                          value={ppobForm.number}
                          onChange={(e) => setPpobForm({ ...ppobForm, number: e.target.value })}
                        />
                      </div>

                      <div>
                        <label className="block text-[9.5px] font-bold text-slate-500 mb-1 uppercase">Nominal Beli</label>
                        <select
                          className="w-full text-xs p-2 bg-white border border-slate-300 rounded-lg font-mono focus:border-blue-900"
                          value={ppobForm.nominal}
                          onChange={(e) => setPpobForm({ ...ppobForm, nominal: parseInt(e.target.value) })}
                        >
                          <option value="25000">Rp 25.000 (Harga: Rp 25.500)</option>
                          <option value="50000">Rp 50.000 (Harga: Rp 50.500)</option>
                          <option value="100000">Rp 100.000 (Harga: Rp 100.500)</option>
                          <option value="200000">Rp 200.000 (Harga: Rp 200.500)</option>
                        </select>
                      </div>

                      <p className="text-[9px] text-slate-400 italic">
                        Pembayaran didebet langsung dari Saldo Tabungan Sukarela Anda.
                      </p>

                      <button
                        type="submit"
                        className="w-full py-2 bg-slate-900 hover:bg-slate-950 text-white font-extrabold text-[11px] leading-none uppercase tracking-wide rounded-lg cursor-pointer"
                      >
                        Bayar PPOB Sekarang
                      </button>
                    </form>
                  )}
                </div>

              </div>

              {/* OUTSTANDING APPLICATIONS TABLE */}
              <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-4">
                <h3 className="text-xs uppercase tracking-wider font-extrabold text-blue-950">
                  Status Pengajuan Layanan Mandiri Anda
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Pinjaman Log */}
                  <div className="space-y-2.5">
                    <h4 className="text-[10px] font-black uppercase text-[#dca415] tracking-widest">Riwayat Pinjaman Online</h4>
                    {loans.filter(l => l.memberId === member.id).length === 0 ? (
                      <p className="p-3 bg-slate-50 text-[10.5px] text-slate-500 rounded border border-dashed border-slate-200 text-center">Belum ada ajuan kredit aktif.</p>
                    ) : (
                      <div className="space-y-1.5 max-h-40 overflow-y-auto">
                        {loans.filter(l => l.memberId === member.id).map(l => (
                          <div key={l.id} className="p-3 bg-slate-50 border border-slate-200 rounded-lg flex justify-between items-center text-[10px]">
                            <div>
                              <p className="font-bold text-slate-800">{formatRupiah(l.jumlah)} / {l.tenor} Bln</p>
                              <p className="text-[9px] text-slate-550 truncate max-w-[170px] italic">Tujuan: {l.tujuan}</p>
                            </div>
                            <span className={`px-2 py-0.5 rounded-full text-[8.5px] font-black uppercase ${
                              l.status === 'approved' ? 'bg-green-100 text-green-700' : l.status === 'rejected' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'
                            }`}>
                              {l.status}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Penarikan Log */}
                  <div className="space-y-2.5">
                    <h4 className="text-[10px] font-black uppercase text-blue-950 tracking-widest">Riwayat Tarik Dana / Withdrawal</h4>
                    {withdrawals.filter(w => w.memberId === member.id).length === 0 ? (
                      <p className="p-3 bg-slate-50 text-[10.5px] text-slate-500 rounded border border-dashed border-slate-200 text-center">Belum ada permohonan tarik dana.</p>
                    ) : (
                      <div className="space-y-1.5 max-h-40 overflow-y-auto">
                        {withdrawals.filter(w => w.memberId === member.id).map(w => (
                          <div key={w.id} className="p-3 bg-slate-50 border border-slate-200 rounded-lg flex justify-between items-center text-[10px]">
                            <div>
                              <span className="font-semibold px-1.5 py-0.5 bg-slate-200 text-slate-700 rounded text-[8px] mr-1">Simpanan {w.jenisSimpanan}</span>
                              <p className="font-bold text-slate-800 mt-1">{formatRupiah(w.jumlah)}</p>
                            </div>
                            <span className={`px-2 py-0.5 rounded-full text-[8.5px] font-black uppercase ${
                              w.status === 'approved' ? 'bg-green-100 text-green-700' : w.status === 'rejected' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'
                            }`}>
                              {w.status}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>

            </div>
          )}

          {/* ================= TAB 3: KTA CARD DISPLAY ================= */}
          {activeTab === 'kta' && (
            <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-6">
              <div className="text-center">
                <h3 className="text-sm font-black uppercase text-[#0c4a80] tracking-wider leading-none">Kartu Anggota Elektronik (KTA)</h3>
                <p className="text-[11px] text-slate-500 mt-1 max-w-md mx-auto">
                  Cetak atau simpan Kartu Tanda Anggota elegan representatif Anda sendiri secara langsung untuk pelbagai program bantuan purnatugas.
                </p>
              </div>

              {/* Call clean KTA card */}
              <KTA member={member} settings={settings} />
            </div>
          )}

          {/* ================= TAB 4: SUNTING IDENTITAS ================= */}
          {activeTab === 'profil' && (
            <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-6">
              <div className="border-b border-slate-100 pb-3 flex justify-between items-center">
                <div>
                  <h3 className="text-xs uppercase tracking-wider font-extrabold text-blue-950">Informasi Diri & Identitas Anggota</h3>
                  <p className="text-[10px] text-slate-550">Sesuai data registrasi berkas purnatugas resmi Koperasi.</p>
                </div>
                {!isEditingProfile && (
                  <button
                    onClick={() => {
                      setNamaEdit(member.nama);
                      setTempatLahirEdit(member.tempatLahir);
                      setTanggalLahirEdit(member.tanggalLahir);
                      setInstitusiPensiunEdit(member.institusiPensiun);
                      setJenisKelaminEdit(member.jenisKelamin);
                      setAgamaEdit(member.agama);
                      setPekerjaanKeahlianEdit(member.pekerjaanKeahlian);
                      setJenisUmkmEdit(member.jenisUmkm || '');
                      setPhoneEdit(member.noHp);
                      setEmailEdit(member.email);
                      setAddressEdit(member.alamatLengkap);
                      setPhotoEdit(member.photo || '');
                      setPasswordEdit(member.password || '');
                      setIsEditingProfile(true);
                    }}
                    className="px-3 py-1.5 bg-slate-900 text-white font-bold text-xs rounded-lg inline-flex items-center gap-1 cursor-pointer"
                  >
                    <Edit className="w-3.5 h-3.5" /> Ubah Profil
                  </button>
                )}
              </div>

              {isEditingProfile ? (
                <form onSubmit={handleUpdate} className="space-y-4 text-xs">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-black text-slate-500 mb-1 uppercase">Nama Lengkap & Gelar</label>
                      <input
                        type="text"
                        required
                        className="w-full bg-slate-50 border border-slate-300 p-2.5 rounded-lg outline-none focus:border-blue-900"
                        value={namaEdit}
                        onChange={(e) => setNamaEdit(e.target.value)}
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-black text-slate-500 mb-1 uppercase">Tempat Lahir</label>
                      <input
                        type="text"
                        required
                        className="w-full bg-slate-50 border border-slate-300 p-2.5 rounded-lg outline-none focus:border-blue-900"
                        value={tempatLahirEdit}
                        onChange={(e) => setTempatLahirEdit(e.target.value)}
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-black text-slate-500 mb-1 uppercase">Tanggal Lahir</label>
                      <input
                        type="date"
                        required
                        className="w-full bg-slate-50 border border-slate-300 p-2.5 rounded-lg outline-none focus:border-blue-900"
                        value={tanggalLahirEdit}
                        onChange={(e) => setTanggalLahirEdit(e.target.value)}
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-black text-slate-500 mb-1 uppercase">Institusi Pensiunan</label>
                      <input
                        type="text"
                        required
                        className="w-full bg-slate-50 border border-slate-300 p-2.5 rounded-lg outline-none focus:border-blue-900"
                        value={institusiPensiunEdit}
                        onChange={(e) => setInstitusiPensiunEdit(e.target.value)}
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-black text-slate-500 mb-1 uppercase">Jenis Kelamin</label>
                      <select
                        className="w-full bg-slate-50 border border-slate-300 p-2 rounded-lg text-xs bg-white"
                        value={jenisKelaminEdit}
                        onChange={(e) => setJenisKelaminEdit(e.target.value as 'Laki-Laki' | 'Perempuan')}
                      >
                        <option value="Laki-Laki">Laki-Laki</option>
                        <option value="Perempuan">Perempuan</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10px] font-black text-slate-500 mb-1 uppercase">Agama</label>
                      <select
                        className="w-full bg-slate-50 border border-slate-300 p-2 rounded-lg text-xs bg-white"
                        value={agamaEdit}
                        onChange={(e) => setAgamaEdit(e.target.value as any)}
                      >
                        <option value="Islam">Islam</option>
                        <option value="Kristen">Kristen</option>
                        <option value="Budha">Budha</option>
                        <option value="Hindu">Hindu</option>
                        <option value="Konghucu">Konghucu</option>
                        <option value="Kepercayaan">Kepercayaan</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10px] font-black text-slate-500 mb-1 uppercase">Pekerjaan / Keahlian</label>
                      <input
                        type="text"
                        required
                        className="w-full bg-slate-50 border border-slate-300 p-2.5 rounded-lg outline-none focus:border-blue-900"
                        value={pekerjaanKeahlianEdit}
                        onChange={(e) => setPekerjaanKeahlianEdit(e.target.value)}
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-black text-slate-500 mb-1 uppercase">Jenis UMKM yang Digeluti</label>
                      <input
                        type="text"
                        required
                        className="w-full bg-slate-50 border border-slate-300 p-2.5 rounded-lg outline-none focus:border-blue-900"
                        value={jenisUmkmEdit}
                        onChange={(e) => setJenisUmkmEdit(e.target.value)}
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-black text-slate-500 mb-1 uppercase">Nomor Telpon / HP / WA</label>
                      <input
                        type="tel"
                        required
                        className="w-full bg-slate-50 border border-slate-300 p-2.5 rounded-lg font-mono outline-none focus:border-blue-900"
                        value={phoneEdit}
                        onChange={(e) => setPhoneEdit(e.target.value)}
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-black text-slate-500 mb-1 uppercase">Alamat Email</label>
                      <input
                        type="email"
                        required
                        className="w-full bg-slate-50 border border-slate-300 p-2.5 rounded-lg outline-none focus:border-blue-950"
                        value={emailEdit}
                        onChange={(e) => setEmailEdit(e.target.value)}
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-black text-slate-500 mb-1 uppercase">Password Login</label>
                      <input
                        type="text"
                        required
                        className="w-full bg-slate-50 border border-slate-300 p-2.5 rounded-lg font-mono outline-none focus:border-blue-900"
                        placeholder="Ubah password jika diinginkan"
                        value={passwordEdit}
                        onChange={(e) => setPasswordEdit(e.target.value)}
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-black text-slate-500 mb-1 uppercase">Foto Profil Baru (KTA)</label>
                      <div className="flex gap-2 items-center">
                        <label className="flex-1 flex gap-2 items-center justify-center p-2.5 bg-slate-100 border border-dashed border-slate-400 rounded-lg text-slate-600 font-bold cursor-pointer hover:bg-slate-200">
                          <span>Upload File Foto</span>
                          <input type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} />
                        </label>
                        {photoEdit && (
                          <img src={photoEdit} className="w-10 h-10 object-cover border rounded border-yellow-500 shrink-0" alt="New Profile" />
                        )}
                      </div>
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-[10px] font-black text-slate-500 mb-1 uppercase">Alamat Rumah Lengkap</label>
                      <textarea
                        required
                        rows={3}
                        className="w-full bg-slate-50 border border-slate-300 p-2.5 rounded-lg outline-none focus:border-blue-900"
                        value={addressEdit}
                        onChange={(e) => setAddressEdit(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="flex gap-2 justify-end pt-2">
                    <button
                      type="button"
                      onClick={() => setIsEditingProfile(false)}
                      className="px-4 py-2 text-slate-500 font-bold hover:bg-slate-100 rounded-lg"
                    >
                      Batal
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold rounded-lg tracking-wider uppercase leading-none inline-flex items-center gap-1.5 cursor-pointer"
                    >
                      <Save className="w-4 h-4" /> Simpan Perubahan
                    </button>
                  </div>
                </form>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs text-slate-800 leading-normal">
                  <div className="space-y-4">
                    <div>
                      <span className="text-[9px] uppercase tracking-wider text-slate-400 font-bold block">Nama Anggota (Gelar)</span>
                      <p className="font-semibold text-slate-900 mt-1 text-sm">{member.nama}</p>
                    </div>

                    <div>
                      <span className="text-[9px] uppercase tracking-wider text-slate-400 font-bold block">Tempat/Tanggal Lahir</span>
                      <p className="font-semibold text-slate-900 mt-1">{member.tempatLahir}, {member.tanggalLahir}</p>
                    </div>

                    <div>
                      <span className="text-[9px] uppercase tracking-wider text-slate-400 font-bold block">Jenis Kelamin / Agama</span>
                      <p className="font-semibold text-slate-900 mt-1">{member.jenisKelamin} / {member.agama}</p>
                    </div>

                    <div>
                      <span className="text-[9px] uppercase tracking-wider text-slate-400 font-bold block">Institusi Asal</span>
                      <p className="font-semibold text-slate-900 mt-1">{member.institusiPensiun}</p>
                    </div>

                    <div>
                      <span className="text-[9px] uppercase tracking-wider text-slate-400 font-bold block">Spesialisasi / Keahlian</span>
                      <p className="font-semibold text-slate-800 mt-1">{member.pekerjaanKeahlian}</p>
                    </div>

                    <div>
                      <span className="text-[9px] uppercase tracking-wider text-[#0c4a80] font-black block">Jenis UMKM yang Digeluti</span>
                      <p className="font-bold text-blue-900 mt-1 bg-blue-55/70 px-2 py-1 rounded w-fit border border-blue-200/50">{member.jenisUmkm || 'Belum diisi'}</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <span className="text-[9px] uppercase tracking-wider text-slate-400 font-bold block">No Handphone (WhatsApp)</span>
                      <p className="font-mono font-semibold text-slate-900 mt-1">{member.noHp}</p>
                    </div>

                    <div>
                      <span className="text-[9px] uppercase tracking-wider text-slate-400 font-bold block">Email Terdaftar</span>
                      <p className="font-semibold text-slate-900 mt-1">{member.email}</p>
                    </div>

                    <div>
                      <span className="text-[9px] uppercase tracking-wider text-slate-400 font-bold block">Password Terkunci</span>
                      <p className="font-mono text-slate-900 mt-1">••••••••</p>
                    </div>

                    <div>
                      <span className="text-[9px] uppercase tracking-wider text-slate-400 font-bold block">Alamat Tinggal</span>
                      <p className="font-medium text-slate-700 mt-1 leading-relaxed">{member.alamatLengkap}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ================= TAB 5: LMS LEARNING PORTAL ================= */}
          {activeTab === 'lms' && (
            <LMSPortal
              currentUser={member}
              courses={courses}
              progressList={progressList}
              onSaveProgress={onSaveProgress}
              onSaveCourses={onSaveCourses}
              onLogActivity={onLogActivity}
              settings={settings}
              members={members}
            />
          )}

          {/* ================= TAB 6: PEMILIHAN KETUA (POLLING SYSTEM) ================= */}
          {activeTab === 'pemilu' && (
            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-8 animate-fade-in">
              
              {/* Poll Banner / Header */}
              <div className="border-b border-slate-100 pb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="p-1 bg-amber-50 rounded-lg text-amber-600 block">
                      <Sparkles className="w-5 h-5 animate-pulse" />
                    </span>
                    <h3 className="text-base sm:text-lg font-black text-slate-900">E-Voting Pemilihan Ketua Koperasi</h3>
                  </div>
                  <p className="text-xs text-slate-500 font-bold">{pollSettings.pollTitle}</p>
                </div>

                <div className="flex flex-col items-start md:items-end gap-1 font-mono">
                  <div className="flex items-center gap-1.5">
                    {isPollingOn ? (
                      <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                        <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping"></span>
                        MEMILIH SEKARANG (AKTIF)
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-[10px] font-bold text-rose-700 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-full">
                        TERTUTUP / BERAKHIR
                      </span>
                    )}
                  </div>
                  <p className="text-[10px] text-slate-400 font-bold">Batas Waktu: {formatDateString(pollSettings.endDate)}</p>
                </div>
              </div>

              {/* Voter Status Notice */}
              <div className={`p-4 rounded-xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
                hasVoted 
                  ? 'bg-emerald-50/50 border-emerald-200 text-emerald-950' 
                  : isPollingOn 
                    ? 'bg-blue-50/50 border-blue-200 text-blue-950' 
                    : 'bg-slate-50 border-slate-250 text-slate-700'
              }`}>
                <div className="space-y-1">
                  <h4 className="text-xs sm:text-sm font-black flex items-center gap-2">
                    {hasVoted ? (
                      <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
                    ) : (
                      <CheckSquare className="w-5 h-5 text-blue-600 shrink-0" />
                    )}
                    Status Hak Suara Anda
                  </h4>
                  <p className="text-xs opacity-90 leading-relaxed font-medium">
                    {hasVoted 
                      ? `Anda telah menyalurkan hak suara Anda. Terima kasih atas partisipasi aktif Anda demi kemajuan Koperasi MPS!` 
                      : isPollingOn 
                        ? `Hak suara Anda tersedia! Silakan telaah Visi & Misi masing-masing calon di bawah ini sebelum menjatuhkan pilihan terbaik Anda.` 
                        : `Pemilihan suara saat ini tidak aktif atau telah ditutup.`
                    }
                  </p>
                </div>
                {hasVoted && (
                  <div className="px-3.5 py-1.5 bg-emerald-700 font-bold font-mono text-white text-[10px] uppercase rounded-full tracking-wide">
                    SUARA MASUK ✓
                  </div>
                )}
              </div>

              {/* Candidate Grid */}
              <div className="space-y-4">
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-400">Daftar Calon Ketua Koperasi</h4>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {pollCandidates.map((c, i) => {
                    const isMyCandidate = voterVote?.candidateId === c.id;
                    const cVotes = pollVotes.filter(v => v.candidateId === c.id).length;
                    
                    return (
                      <div 
                        key={c.id} 
                        className={`flex flex-col bg-slate-50 rounded-xl border transition-all duration-200 relative overflow-hidden h-full justify-between shadow-xs ${
                          isMyCandidate 
                            ? 'border-emerald-500 ring-2 ring-emerald-500/20 bg-emerald-50/10' 
                            : 'border-slate-200 hover:border-slate-350 hover:bg-white'
                        }`}
                      >
                        {/* Candidate Accent Card Header */}
                        <div className="p-5 space-y-4 flex-1">
                          
                          {/* Candidate Avatar & Label */}
                          <div className="flex gap-4 items-center">
                            <div className="w-12 h-12 bg-blue-900 border border-[#dca415] rounded-full overflow-hidden flex items-center justify-center text-white font-extrabold text-base uppercase shadow-inner">
                              {c.photo ? (
                                <img src={c.photo} className="w-full h-full object-cover" alt={c.nama} />
                              ) : (
                                c.nama.split(' ').filter(n => !n.includes('.') && n.length > 1).map(b => b.charAt(0)).slice(0, 2).join('')
                              )}
                            </div>
                            <div>
                              <span className="text-[10px] font-extrabold text-amber-600 uppercase font-mono tracking-wider">No. Urut 0{i+1}</span>
                              <h5 className="text-xs sm:text-sm font-black text-slate-800 line-clamp-1">{c.nama}</h5>
                            </div>
                          </div>

                          {/* Visi & Misi Box */}
                          <div className="bg-white/70 p-4 rounded-lg border border-slate-100 min-h-[160px] max-h-[220px] overflow-y-auto shadow-xs text-xs">
                            <span className="text-[9px] font-black uppercase text-slate-400 block tracking-wider mb-2">Pernyataan Visi & Misi</span>
                            <div className="text-slate-600 leading-relaxed font-semibold whitespace-pre-wrap">
                              {c.visiMisi}
                            </div>
                          </div>
                        </div>

                        {/* Button Action footer */}
                        <div className="p-4 bg-slate-100/60 border-t border-slate-100 mt-auto">
                          {hasVoted ? (
                            isMyCandidate ? (
                              <div className="w-full text-center py-2 bg-emerald-700 text-white font-black text-xs rounded-lg shadow-sm flex items-center justify-center gap-1">
                                <CheckCircle className="w-4 h-4" /> Pilihan Anda
                              </div>
                            ) : (
                              <button 
                                disabled 
                                className="w-full text-center py-2 bg-slate-200 text-slate-400 font-extrabold text-xs rounded-lg cursor-not-allowed"
                              >
                                Sudah Memilih Calon Lain
                              </button>
                            )
                          ) : isPollingOn ? (
                            <button
                              onClick={() => {
                                if (window.confirm(`Apakah Anda yakin ingin memberikan suara Anda kepada ${c.nama} sebagai Ketua Koperasi MPS? Tindakan ini tidak dapat dibatalkan.`)) {
                                  onCastVote(c.id);
                                }
                              }}
                              className="w-full py-2 bg-blue-900 hover:bg-blue-950 text-white font-black text-xs rounded-lg transition-all text-center cursor-pointer shadow-xs hover:shadow-md"
                            >
                              PILIH CALON INI ✓
                            </button>
                          ) : (
                            <button 
                              disabled 
                              className="w-full text-center py-2 bg-rose-50 text-rose-500 border border-rose-100 font-extrabold text-xs rounded-lg cursor-not-allowed"
                            >
                              Pemilihan Ditutup
                            </button>
                          )}
                        </div>

                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Polling Results Section */}
              <div className="pt-6 border-t border-slate-150">
                {pollSettings.showResultsToMembers ? (
                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 md:p-6 space-y-6">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                      <div className="space-y-0.5">
                        <h4 className="text-sm font-black text-slate-900">Perolehan Suara Sementara</h4>
                        <p className="text-xs text-slate-500 font-medium">Berdasarkan data yang disinkronkan secara real-time dari database.</p>
                      </div>
                      <div className="bg-emerald-100 text-emerald-900 font-bold font-mono text-xs px-3 py-1.5 rounded-lg border border-emerald-200 shrink-0">
                        Total Suara: <span className="font-extrabold text-sm">{totalVotesCast}</span> suara masuk
                      </div>
                    </div>

                    <div className="space-y-5">
                      {pollCandidates.map((c, idx) => {
                        const votes = getCandidateVotes(c.id);
                        const percent = getCandidatePercentage(c.id);
                        return (
                          <div key={c.id} className="space-y-1.5">
                            <div className="flex justify-between items-center text-xs font-bold font-mono">
                              <span className="text-slate-700">0{idx+1}. {c.nama}</span>
                              <span className="text-slate-800 bg-white px-2 py-0.5 border border-slate-150 rounded-md">
                                {votes} suara ({percent}%)
                              </span>
                            </div>
                            <div className="w-full h-3.5 bg-slate-200 rounded-full overflow-hidden relative shadow-inner">
                              <div 
                                className="h-full bg-blue-900 transition-all duration-1000 rounded-full" 
                                style={{ width: `${percent}%` }}
                              ></div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-6 text-center space-y-2">
                    <HelpCircle className="w-10 h-10 text-slate-400 mx-auto" />
                    <h5 className="text-sm font-black text-slate-800">Perolehan Suara Ditangguhkan</h5>
                    <p className="text-xs text-slate-550 max-w-md mx-auto leading-relaxed">
                      Atas kebijakan panitia dan ketentuan administrator demi kelancaran proses pemilu, hasil perolehan suara sementara saat ini ditutup dan hanya dapat diakses oleh admin pengawas koperasi.
                    </p>
                  </div>
                )}
              </div>

            </div>
          )}

        </div>
      </div>
    </div>
  );
};
