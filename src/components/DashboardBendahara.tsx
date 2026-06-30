import React, { useState } from 'react';
import { 
  Banknote, Receipt, Copy, Check, Printer, FileText, Download,
  Plus, Search, ArrowUpRight, ArrowDownLeft, X, CheckSquare, Calendar, ChevronRight 
} from 'lucide-react';
import { Member, Transaction, CooperativeSettings } from '../types';
import { Receipt as ReceiptComponent } from './Receipt';

interface DashboardBendaharaProps {
  bendaharaMember: Member;
  settings: CooperativeSettings;
  members: Member[];
  transactions: Transaction[];
  onAddTransaction: (tx: Omit<Transaction, 'id' | 'tanggal' | 'bendaharaName'>) => void;
  onUpdateMemberBalances: (memberId: string, diffs: { Pokok?: number, Wajib?: number, Sukarela?: number, Penyertaan?: number }) => void;
  onLogout: () => void;
}

export const DashboardBendahara: React.FC<DashboardBendaharaProps> = ({
  bendaharaMember,
  settings,
  members,
  transactions,
  onAddTransaction,
  onUpdateMemberBalances,
  onLogout
}) => {
  const [activeTabBend, setActiveTabBend] = useState<'jurnal' | 'iuran' | 'laporan'>('jurnal');

  // Search members for copy-paste auto integration
  const [memberSearchText, setMemberSearchText] = useState('');
  const [copiedSuccessId, setCopiedSuccessId] = useState<string | null>(null);

  // Form Transaction
  const [txForm, setTxForm] = useState({
    memberId: '',
    noRekening: '',
    memberName: '',
    kategori: 'Uang Masuk' as 'Uang Masuk' | 'Uang Keluar',
    jumlahMasuk: 100000,
    jumlahKeluar: 0,
    sumberTujuan: 'Simpanan Sukarela' as 'Simpanan Pokok' | 'Simpanan Wajib' | 'Simpanan Sukarela' | 'Penyertaan Modal' | 'Unit Usaha Swalayan' | 'Unit Jasa Logistik' | 'Biaya Operasional Koperasi',
    deskripsi: ''
  });

  // Selected Member for Iuran Card Grid
  const [selectedIuranMember, setSelectedIuranMember] = useState<Member | null>(members[0] || null);

  // Receipt State
  const [selectedTxForReceipt, setSelectedTxForReceipt] = useState<Transaction | null>(null);

  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(val);
  };

  const handleCopyNoRekening = (m: Member) => {
    // Paste automatiser as requested: "Paling urgent adalah copy paste no siswa/anggota otomatis saat entry iuran simpanan"
    setTxForm(prev => ({
      ...prev,
      memberId: m.id,
      noRekening: m.noRekening || '',
      memberName: m.nama,
      deskripsi: `Sertifikasi iuran ${prev.sumberTujuan} an. ${m.nama}`
    }));
    setCopiedSuccessId(m.id);
    setTimeout(() => setCopiedSuccessId(null), 2000);
  };

  const handleTxSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!txForm.noRekening && txForm.sumberTujuan !== 'Biaya Operasional Koperasi') {
      alert("Mohon pasangkan Nomor Rekening anggota yang sah terlebih dahulu.");
      return;
    }

    const value = txForm.kategori === 'Uang Masuk' ? txForm.jumlahMasuk : txForm.jumlahKeluar;
    if (value <= 0) {
      alert("Nominal keuangan harus di atas Rp 0.");
      return;
    }

    // Submit transaction
    onAddTransaction({
      memberId: txForm.memberId,
      noRekening: txForm.noRekening,
      memberName: txForm.memberName || "Umum Koperasi",
      kategori: txForm.kategori,
      jumlahMasuk: txForm.kategori === 'Uang Masuk' ? txForm.jumlahMasuk : 0,
      jumlahKeluar: txForm.kategori === 'Uang Keluar' ? txForm.jumlahKeluar : 0,
      sumberTujuan: txForm.sumberTujuan,
      deskripsi: txForm.deskripsi || `Mutasi ${txForm.sumberTujuan}`
    });

    // Update member individual savings balances in state dynamically (Pokok, Wajib, Sukarela, Penyertaan dkk)
    if (txForm.memberId) {
      const balanceType = txForm.sumberTujuan;
      const multiplier = txForm.kategori === 'Uang Masuk' ? 1 : -1;
      const diff: { Pokok?: number, Wajib?: number, Sukarela?: number, Penyertaan?: number } = {};
      
      if (balanceType === 'Simpanan Pokok') diff.Pokok = value * multiplier;
      if (balanceType === 'Simpanan Wajib') diff.Wajib = value * multiplier;
      if (balanceType === 'Simpanan Sukarela') diff.Sukarela = value * multiplier;
      if (balanceType === 'Penyertaan Modal') diff.Penyertaan = value * multiplier;

      onUpdateMemberBalances(txForm.memberId, diff);

      // Instantly sync the currently active Card view if same member
      if (selectedIuranMember && selectedIuranMember.id === txForm.memberId) {
        setSelectedIuranMember(prev => {
          if (!prev) return null;
          return {
            ...prev,
            saldoPokok: prev.saldoPokok + (diff.Pokok || 0),
            saldoWajib: prev.saldoWajib + (diff.Wajib || 0),
            saldoSukarela: prev.saldoSukarela + (diff.Sukarela || 0),
            saldoPenyertaan: prev.saldoPenyertaan + (diff.Penyertaan || 0),
          };
        });
      }
    }

    alert(`Entry jurnal berhasil dibukukan!\nDana ${txForm.kategori} nominal ${formatRupiah(value)} dipasang.`);
    
    // Clear form
    setTxForm({
      memberId: '',
      noRekening: '',
      memberName: '',
      kategori: 'Uang Masuk',
      jumlahMasuk: 100000,
      jumlahKeluar: 0,
      sumberTujuan: 'Simpanan Sukarela',
      deskripsi: ''
    });
  };

  const handleRecordWajibLunas = (monthName: string) => {
    if (!selectedIuranMember) return;
    const nominalWajibBulanan = 100000; // Standard simulated wajib Rp 100,000

    // Add financial entry officially
    onAddTransaction({
      memberId: selectedIuranMember.id,
      noRekening: selectedIuranMember.noRekening || '',
      memberName: selectedIuranMember.nama,
      kategori: 'Uang Masuk',
      jumlahMasuk: nominalWajibBulanan,
      jumlahKeluar: 0,
      sumberTujuan: 'Simpanan Wajib',
      deskripsi: `Sertifikasi Simpanan Wajib Bulan ${monthName} (Lunas)`
    });

    onUpdateMemberBalances(selectedIuranMember.id, { Wajib: nominalWajibBulanan });
    
    setSelectedIuranMember(prev => {
      if (!prev) return null;
      return {
        ...prev,
        saldoWajib: prev.saldoWajib + nominalWajibBulanan
      };
    });

    alert(`Simpanan Wajib bulan ${monthName} an. ${selectedIuranMember.nama} berhasil di-input Lunas (Ditambah Rp 100.000)!`);
  };

  const handlePrintJurnalLaporan = () => {
    const printWindow = window.open('', '', 'width=900,height=600');
    if (!printWindow) return;

    printWindow.document.write('<html><head><title>Jurnal Buku Besar Finansial Koperasi MPS</title>');
    printWindow.document.write('<link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">');
    printWindow.document.write('</head><body class="p-8">');
    printWindow.document.write(`
      <div class="border-b-4 border-double border-slate-900 pb-4 mb-6 text-center">
        <h2 class="text-xs font-black uppercase text-amber-600 block leading-none">KOPERASI JASA SERBA USAHA</h2>
        <h1 class="text-xl font-bold text-blue-900">KOPERASI MITRA PROFESIONAL SEJAHTERA (KOPERASI MPS)</h1>
        <p class="text-xs text-slate-500">${settings.alamatSekretariat}</p>
      </div>

      <h3 class="text-sm font-bold text-slate-900 uppercase text-center mb-4">LAPORAN BUKU UTAMA JURNAL TRANSAKSI</h3>
      
      <table class="w-full text-left text-xs border border-collapse">
        <thead class="bg-gray-100">
          <tr class="border-b">
            <th class="p-2 border">Waktu</th>
            <th class="p-2 border">Nama Sandi / Ref Rekening</th>
            <th class="p-2 border">Jenis Mutasi</th>
            <th class="p-2 border text-right">Debit Masuk (Rp)</th>
            <th class="p-2 border text-right">Kredit Keluar (Rp)</th>
          </tr>
        </thead>
        <tbody>
          ${transactions.map(t => `
            <tr class="border-b">
              <td class="p-2 border">${t.tanggal}</td>
              <td class="p-2 border font-bold">${t.memberName} (${t.noRekening || 'KOPERASI'})</td>
              <td class="p-2 border">${t.sumberTujuan}</td>
              <td class="p-2 border text-right">${t.jumlahMasuk > 0 ? formatRupiah(t.jumlahMasuk) : '-'}</td>
              <td class="p-2 border text-right">${t.jumlahKeluar > 0 ? formatRupiah(t.jumlahKeluar) : '-'}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `);
    printWindow.document.write('</body></html>');
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 500);
  };

  const filteredMembers = members.filter(m => 
    m.role === 'anggota' && 
    (m.nama.toLowerCase().includes(memberSearchText.toLowerCase()) || 
     (m.noAnggota && m.noAnggota.includes(memberSearchText)) ||
     (m.noRekening && m.noRekening.includes(memberSearchText)))
  );

  // Accounting totals
  const totalIn = transactions.filter(t => t.kategori === 'Uang Masuk').reduce((acc, current) => acc + current.jumlahMasuk, 0);
  const totalOut = transactions.filter(t => t.kategori === 'Uang Keluar').reduce((acc, current) => acc + current.jumlahKeluar, 0);
  const netBalanceLoss = totalIn - totalOut;

  // 12 Months list for contributors
  const months = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in text-xs text-slate-800">
      
      {/* Head Welcome info */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 shadow-xs">
        <div className="flex gap-4 items-center">
          <div className="w-14 h-14 bg-emerald-950 border-2 border-yellow-500 rounded-full flex items-center justify-center text-white font-bold text-xl">
            B
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded-full select-none">BENDAHARA KAS</span>
              <span className="text-[10px] text-slate-400">Pembuku & Kasir Aktif</span>
            </div>
            <h2 className="text-base sm:text-lg font-black text-slate-950">{bendaharaMember.nama}</h2>
            <p className="text-xs text-slate-500">Mutasi Buku Kas: <span className="font-mono font-bold text-blue-900">AKTIF / LIVE</span></p>
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
          { id: 'jurnal', lbl: 'Entry Jurnal Masuk & Keluar', icon: <Banknote className="w-4 h-4" /> },
          { id: 'iuran', lbl: 'Input Kartu Iuran Anggota', icon: <ChevronRight className="w-4 h-4" /> },
          { id: 'laporan', lbl: 'Detail Ringkasan Buku Kas ', icon: <FileText className="w-4 h-4" /> }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTabBend(tab.id as any)}
            className={`flex items-center gap-1.5 px-4 py-2.5 rounded-lg text-xs font-black uppercase tracking-wide leading-none transition-all cursor-pointer ${
              activeTabBend === tab.id 
                ? 'bg-emerald-700 text-white shadow-xs' 
                : 'text-slate-600 hover:bg-slate-50 hover:text-emerald-700'
            }`}
          >
            {tab.icon}
            {tab.lbl}
          </button>
        ))}
      </div>

      {/* ================= TAB 1: DOUBLE ENTRY JURNAL ================= */}
      {activeTabBend === 'jurnal' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* LEFT SIDE: SEARCH MEMBERS & AUTO COPY-PASTE */}
          <div className="lg:col-span-5 bg-white border border-slate-200 rounded-xl p-5 space-y-4 shadow-xs">
            <div>
              <span className="p-1 px-2.5 bg-yellow-150 text-slate-950 font-black rounded text-[9.5px] uppercase select-none">
                Copy Paste Nomor Siswa/Anggota Otomatis
              </span>
              <h4 className="text-sm font-black uppercase text-[#0c4a80] mt-2">Daftar Anggota Koperasi</h4>
              <p className="text-slate-500 text-[10.5px]">Cari nama anggota, klik tombol &quot;Auto Fill&quot; untuk mem-paste nomor rekening/biodatanya secara instan ke form.</p>
            </div>

            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400"><Search className="w-4.5 h-4.5" /></span>
              <input
                type="text"
                placeholder="Cari nama / no anggota..."
                value={memberSearchText}
                onChange={(e) => setMemberSearchText(e.target.value)}
                className="pl-9 pr-4 py-2 bg-slate-50 border border-slate-300 w-full rounded-lg text-xs outline-none focus:bg-white focus:border-emerald-700"
              />
            </div>

            <div className="space-y-1.5 max-h-[280px] overflow-y-auto pr-1">
              {filteredMembers.map((m) => (
                <div key={m.id} className="p-2.5 border rounded-lg hover:border-emerald-500 transition-all flex justify-between items-center bg-slate-50/50">
                  <div>
                    <p className="font-extrabold text-slate-800 leading-none">{m.nama}</p>
                    <p className="text-[10px] text-slate-550 mt-1">Rek: <span className="font-mono font-bold text-blue-900">{m.noRekening}</span></p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleCopyNoRekening(m)}
                    className="flex items-center gap-1 px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-[10px] leading-none uppercase tracking-wide rounded cursor-pointer"
                  >
                    {copiedSuccessId === m.id ? (
                      <>✔ Copied</>
                    ) : (
                      <>Auto Fill <Copy className="w-3 h-3 shrink-0" /></>
                    )}
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* RIGHT SIDE: TRANSACTION FORM JURNAL */}
          <div className="lg:col-span-7 bg-white border border-slate-200 rounded-xl p-5 space-y-4 shadow-xs">
            <h3 className="text-xs font-black uppercase text-blue-955 border-b pb-2">Manual Form Jurnal Keuangan</h3>
            
            <form onSubmit={handleTxSubmit} className="space-y-3.5">
              
              <div className="grid grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-[9.5px] font-bold text-slate-500 mb-1 uppercase">Arah Arus Keuangan</label>
                  <select
                    className="w-full text-xs p-2 bg-white border border-slate-300 rounded-lg focus:border-emerald-750"
                    value={txForm.kategori}
                    onChange={(e) => {
                      const kat = e.target.value as any;
                      setTxForm(prev => ({
                        ...prev,
                        kategori: kat,
                        jumlahMasuk: kat === 'Uang Masuk' ? 100000 : 0,
                        jumlahKeluar: kat === 'Uang Keluar' ? 100000 : 0
                      }));
                    }}
                  >
                    <option value="Uang Masuk">1. UANG MASUK (DEBIT MASUK KAS)</option>
                    <option value="Uang Keluar">2. UANG KELUAR (KREDIT KELUAR KAS)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[9.5px] font-bold text-slate-500 mb-1 uppercase">Pos Pos Angaran Mutasi</label>
                  <select
                    className="w-full text-xs p-2 bg-white border border-slate-300 rounded-lg focus:border-emerald-750"
                    value={txForm.sumberTujuan}
                    onChange={(e) => setTxForm({ ...txForm, sumberTujuan: e.target.value as any })}
                  >
                    <option value="Simpanan Pokok">Simpanan Pokok Anggota</option>
                    <option value="Simpanan Wajib">Simpanan Wajib Bulanan</option>
                    <option value="Simpanan Sukarela">Simpanan Sukarela Harian</option>
                    <option value="Penyertaan Modal">Penyertaan Modal Berjangka</option>
                    <option value="Unit Usaha Swalayan">Pendapatan Swalyan/Toko</option>
                    <option value="Unit Jasa Logistik">Pendapatan Jasa Logistik Pos</option>
                    <option value="Biaya Operasional Koperasi">Biaya Pengeluaran Kantor</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-[9.5px] font-bold text-slate-500 mb-1 uppercase">Sandi Rekening Penyetor</label>
                  <input
                    type="text"
                    required
                    readOnly
                    placeholder="Auto fill dari pencarian kiri"
                    className="w-full text-xs p-2.5 bg-slate-100 border rounded-lg font-mono text-slate-600 outline-none"
                    value={txForm.noRekening}
                  />
                </div>

                <div>
                  <label className="block text-[9.5px] font-bold text-slate-500 mb-1 uppercase">Nama Pembayar / Terkait</label>
                  <input
                    type="text"
                    required
                    readOnly
                    placeholder="Nama Anggota otomatis"
                    className="w-full text-xs p-2.5 bg-slate-100 border rounded-lg text-slate-600 outline-none"
                    value={txForm.memberName}
                  />
                </div>
              </div>

              <div>
                <label className="block text-[9.5px] font-bold text-slate-500 mb-1 uppercase">Nominal Transaksi (Rp)</label>
                <input
                  type="number"
                  required
                  placeholder="Masukkan nominal murni"
                  className="w-full text-xs p-2.5 border rounded-lg font-mono focus:border-emerald-700"
                  value={txForm.kategori === 'Uang Masuk' ? txForm.jumlahMasuk : txForm.jumlahKeluar}
                  onChange={(e) => {
                    const v = parseFloat(e.target.value) || 0;
                    setTxForm(prev => ({
                      ...prev,
                      jumlahMasuk: prev.kategori === 'Uang Masuk' ? v : 0,
                      jumlahKeluar: prev.kategori === 'Uang Keluar' ? v : 0
                    }));
                  }}
                />
              </div>

              <div>
                <label className="block text-[9.5px] font-bold text-slate-500 mb-1 uppercase">Narasi Jurnal / Detail Referensi</label>
                <textarea
                  required
                  rows={2}
                  placeholder="Contoh: Setoran Simpanan wajib bulanan atau pelunasan iuran pokok."
                  className="w-full text-xs p-2 bg-slate-50 border rounded-lg focus:bg-white focus:border-emerald-700"
                  value={txForm.deskripsi}
                  onChange={(e) => setTxForm({ ...txForm, deskripsi: e.target.value })}
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold text-[11px] leading-none uppercase tracking-wide rounded-lg cursor-pointer transition"
              >
                Simpan Transaksi Ke Jurnal Utama
              </button>
            </form>
          </div>

        </div>
      )}

      {/* ================= TAB 2: INPUT KARTU IURAN ANGGOTA ================= */}
      {activeTabBend === 'iuran' && (
        <div className="bg-white border rounded-xl p-6 shadow-xs mt-6 space-y-6">
          <div className="border-b pb-3 flex justify-between items-center flex-wrap gap-2">
            <div>
              <h3 className="text-sm font-black uppercase text-blue-955">Sertifikasi & Input Kartu Iuran Anggota</h3>
              <p className="text-slate-500 text-[11px]">Memantau histori lunas iuran Wajib bulanan an. Anggota yang terdaftar.</p>
            </div>

            <div className="flex gap-2">
              <span className="text-[10px] text-slate-550 self-center">Pilih Anggota:</span>
              <select
                className="p-1 px-3 bg-white border rounded text-xs focus:border-emerald-700 outline-none"
                value={selectedIuranMember?.id || ''}
                onChange={(e) => {
                  const selectedId = e.target.value;
                  const found = members.find(m => m.id === selectedId);
                  if (found) setSelectedIuranMember(found);
                }}
              >
                {members.filter(m => m.role === 'anggota').map(m => (
                  <option key={m.id} value={m.id}>{m.nama} ({m.noAnggota || 'PENDING'})</option>
                ))}
              </select>
            </div>
          </div>

          {selectedIuranMember ? (
            <div className="space-y-6">
              
              {/* Member card summary */}
              <div className="p-4 bg-emerald-50/50 border border-emerald-200 rounded-xl grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-sans">
                <div>
                  <span className="text-[9px] uppercase tracking-wider text-slate-400 font-bold block">Pemegang Kartu</span>
                  <span className="font-extrabold text-slate-900 u-name text-sm mt-0.5 block">{selectedIuranMember.nama}</span>
                  <span className="text-[10px] text-slate-500">Rekening: {selectedIuranMember.noRekening}</span>
                </div>
                <div>
                  <span className="text-[9px] uppercase tracking-wider text-slate-400 font-bold block">Saldo Simpanan Pokok (Lunas)</span>
                  <span className="font-mono font-bold text-slate-800 text-sm mt-0.5 block">{formatRupiah(selectedIuranMember.saldoPokok)}</span>
                </div>
                <div>
                  <span className="text-[9px] uppercase tracking-wider text-slate-400 font-bold block">Akumulasi Simpanan Wajib</span>
                  <span className="font-mono font-bold text-[#0c4a80] text-sm mt-0.5 block">{formatRupiah(selectedIuranMember.saldoWajib)}</span>
                </div>
              </div>

              {/* 12 MONTH MATRIX CARD GRID */}
              <div>
                <h4 className="text-[10px] font-black uppercase text-amber-600 tracking-wider mb-3">Matriks Pelunasan Simpanan Wajib Bulanan (Format Tahunan Buku Berjalan)</h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {months.map((month, index) => {
                    // Check if total wajib is sufficient to cover months up to this index * 100,000 threshold
                    const thresholdRequired = (index + 1) * 100000;
                    const paid = selectedIuranMember.saldoWajib >= thresholdRequired;

                    return (
                      <div key={index} className={`p-4 rounded-xl border flex flex-col justify-between space-y-3 transition shadow-xs ${
                        paid 
                          ? 'bg-green-50/75 border-green-250 text-green-900' 
                          : 'bg-white border-slate-200 text-slate-700'
                      }`}>
                        <div>
                          <span className="text-[10px] font-black uppercase tracking-wider font-mono">{month}</span>
                          <p className="text-[10.5px] mt-0.5 font-bold">{paid ? formatRupiah(100000) : "Tunggakan / Belum lunas"}</p>
                        </div>
                        {paid ? (
                          <span className="text-[9.5px] font-black text-green-700 uppercase flex items-center gap-0.5">
                            ✔ LUNAS AKTIF
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleRecordWajibLunas(month)}
                            className="py-1 px-3 bg-slate-900 hover:bg-black text-[#ffffff] font-extrabold text-[9px] uppercase tracking-wider rounded cursor-pointer text-center leading-none"
                          >
                            Setujui Lunas (Instan)
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

            </div>
          ) : (
            <p className="text-center py-6 text-slate-400 italic">Belum ada anggota biasa teraktivasi di dalam pangkalan data.</p>
          )}

        </div>
      )}

      {/* ================= TAB 3: CASH FLOW AND PRINTABLE RECEIPTS ================= */}
      {activeTabBend === 'laporan' && (
        <div className="space-y-6">
          
          {/* STATS ACCOUNTING */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-5 border border-slate-200 rounded-xl shadow-xs flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-green-50 text-green-700 flex items-center justify-center font-bold text-lg">
                <ArrowUpRight className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-450 block">DEBIT MASUK KAS (JOURNAL IN)</span>
                <p className="text-base font-black font-mono text-slate-850 mt-0.5">{formatRupiah(totalIn)}</p>
              </div>
            </div>

            <div className="bg-white p-5 border border-slate-200 rounded-xl shadow-xs flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-red-50 text-red-700 flex items-center justify-center font-bold text-lg">
                <ArrowDownLeft className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-450 block">KREDIT KELUAR OPERASIONAL (JOURNAL OUT)</span>
                <p className="text-base font-black font-mono text-slate-850 mt-0.5">{formatRupiah(totalOut)}</p>
              </div>
            </div>

            <div className="bg-slate-900 text-white p-5 border rounded-xl shadow-xs flex items-center gap-4 border-l-4 border-yellow-500">
              <div className="w-12 h-12 rounded-full bg-yellow-500 text-slate-950 flex items-center justify-center font-bold text-lg">
                <Banknote className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[10px] uppercase font-black text-yellow-500 block">SISA SALDO KAS OPERASIONAL KSU</span>
                <p className="text-base font-black font-mono text-white mt-0.5">{formatRupiah(netBalanceLoss)}</p>
              </div>
            </div>
          </div>

          {/* MASTER JOURNAL TABLE */}
          <div className="bg-white border rounded-xl p-6 shadow-xs space-y-4">
            <div className="flex justify-between items-center border-b pb-3 flex-wrap gap-2">
              <div>
                <h3 className="text-xs font-black uppercase text-blue-955">Buku Besar Transaksi Jurnal Berjalan</h3>
                <p className="text-slate-550 text-[10.5px]">Menyusun draf mutasi segenap iuran bulanan dan pengeluaran.</p>
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handlePrintJurnalLaporan}
                  className="flex items-center gap-1.5 px-3 py-2 bg-slate-900 text-white font-bold rounded-lg text-xs tracking-wider uppercase transition hover:bg-black cursor-pointer leading-none"
                >
                  <Download className="w-3.5 h-3.5 shrink-0" /> Eksport Jurnal ke PDF
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse font-sans">
                <thead>
                  <tr className="bg-slate-50 text-slate-450 uppercase tracking-widest text-[9px] border-b">
                    <th className="py-2.5 px-3">Tanggal</th>
                    <th className="py-2.5 px-3">Nama Anggota / Referensi</th>
                    <th className="py-2.5 px-3">Pos Anggaran</th>
                    <th className="py-2.5 px-3 text-right">Debit Masuk (Rp)</th>
                    <th className="py-2.5 px-3 text-right">Kredit Keluar (Rp)</th>
                    <th className="py-2.5 px-3 text-center">Kwitansi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {transactions.map((t) => (
                    <tr key={t.id} className="hover:bg-slate-50 transition">
                      <td className="py-3 px-3 font-mono font-medium">{t.tanggal}</td>
                      <td className="py-3 px-3">
                        <span className="font-extrabold text-slate-900 block leading-none">{t.memberName}</span>
                        <span className="text-[10px] text-slate-400 font-mono mt-0.5 block">{t.noRekening || "Koperasi Umum"}</span>
                      </td>
                      <td className="py-3 px-3 font-medium">{t.sumberTujuan}</td>
                      <td className="py-3 px-3 text-right font-mono font-bold text-green-600">
                        {t.jumlahMasuk > 0 ? formatRupiah(t.jumlahMasuk) : '-'}
                      </td>
                      <td className="py-3 px-3 text-right font-mono font-bold text-red-600">
                        {t.jumlahKeluar > 0 ? formatRupiah(t.jumlahKeluar) : '-'}
                      </td>
                      <td className="py-3 px-3 text-center">
                        <button
                          onClick={() => setSelectedTxForReceipt(t)}
                          className="p-1 text-blue-900 hover:bg-blue-50 hover:text-blue-950 border rounded font-black inline-flex items-center gap-1 cursor-pointer"
                        >
                          <Printer className="w-3 h-3" /> Cetak
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

      {/* ================= RECEIPT VIEW MODAL OVERLAY ================= */}
      {selectedTxForReceipt && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl overflow-hidden max-w-md w-full relative">
            <div className="absolute right-3 top-3 text-slate-400 hover:text-slate-800 cursor-pointer z-10" onClick={() => setSelectedTxForReceipt(null)}>
              <X className="w-5 h-5" />
            </div>

            <div className="p-6">
              {/* Receipt custom component */}
              <ReceiptComponent transaction={selectedTxForReceipt} settings={settings} />
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
