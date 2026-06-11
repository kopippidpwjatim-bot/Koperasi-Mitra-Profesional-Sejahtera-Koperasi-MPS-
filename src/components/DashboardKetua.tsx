import React, { useState } from 'react';
import { 
  ShieldCheck, FileSpreadsheet, Percent, Check, X, Printer, 
  LogOut, Landmark, TrendingUp, TrendingDown, RefreshCcw, DollarSign 
} from 'lucide-react';
import { Member, CooperativeSettings, LoanApplication, WithdrawalRequest, Transaction } from '../types';

interface DashboardKetuaProps {
  ketuaMember: Member;
  settings: CooperativeSettings;
  loans: LoanApplication[];
  withdrawals: WithdrawalRequest[];
  transactions: Transaction[];
  onApproveLoan: (loanId: string) => void;
  onRejectLoan: (loanId: string) => void;
  onApproveWithdrawal: (withdrawId: string) => void;
  onRejectWithdrawal: (withdrawId: string) => void;
  onLogout: () => void;
}

export const DashboardKetua: React.FC<DashboardKetuaProps> = ({
  ketuaMember,
  settings,
  loans,
  withdrawals,
  transactions,
  onApproveLoan,
  onRejectLoan,
  onApproveWithdrawal,
  onRejectWithdrawal,
  onLogout
}) => {
  const [activeTabKet, setActiveTabKet] = useState<'otoritas' | 'laporan' | 'kop_preview'>('otoritas');

  // Filter pending items
  const pendingLoans = loans.filter(l => l.status === 'pending');
  const pendingWithdrawals = withdrawals.filter(w => w.status === 'pending');

  // Print Kop Surat PDF
  const handlePrintKopSurat = () => {
    const printWindow = window.open('', '', 'width=800,height=500');
    if (!printWindow) return;
    printWindow.document.write('<html><head><title>Print Kop Surat Resmi | Ketua</title>');
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
              <h1 class="text-xl font-black text-blue-900 leading-tight">IKATAN PENSIUNAN POS INDONESIA (IPPI)</h1>
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

  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(val);
  };

  // Finance calculations
  const totalIn = transactions.filter(t => t.kategori === 'Uang Masuk').reduce((acc, current) => acc + current.jumlahMasuk, 0);
  const totalOut = transactions.filter(t => t.kategori === 'Uang Keluar').reduce((acc, current) => acc + current.jumlahKeluar, 0);
  const rawBalance = totalIn - totalOut;

  // Static/Simulated asset structure of cooperative units
  const shopUnitCash = 18500000;      // Toko/Swalayan inventory value
  const logisticsUnitCash = 24700000; // Logistik unit assets
  const totalAssetKoperasi = rawBalance + shopUnitCash + logisticsUnitCash;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in text-xs text-slate-800">
      
      {/* Top Welcome Title */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 shadow-xs">
        <div className="flex gap-4 items-center">
          <div className="w-14 h-14 bg-amber-600 border-2 border-slate-900 rounded-full flex items-center justify-center text-slate-950 font-bold text-xl">
            K
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase bg-[#dca415] text-slate-950 px-2.5 py-0.5 rounded-full select-none">KETUA UMUM KOPERASI</span>
              <span className="text-[10px] text-slate-500">Otorisator Keuangan Utama</span>
            </div>
            <h2 className="text-base sm:text-lg font-black text-slate-950">{ketuaMember.nama}</h2>
            <p className="text-xs text-slate-550">Legalitas IPPI DPW Jatim: <span className="font-bold underline text-blue-900">{settings.noIjinPendirian}</span></p>
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
          { id: 'otoritas', lbl: 'Persetujuan Biaya Pengeluaran (Beban Kas)', icon: <ShieldCheck className="w-4 h-4" /> },
          { id: 'laporan', lbl: 'Neraca Keuangan & Unit Usaha KSU', icon: <FileSpreadsheet className="w-4 h-4" /> },
          { id: 'kop_preview', lbl: 'Kop Surat & Cetak PDF', icon: <Printer className="w-4 h-4" /> }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTabKet(tab.id as any)}
            className={`flex items-center gap-1.5 px-4 py-2.5 rounded-lg text-xs font-black uppercase tracking-wide leading-none transition-all cursor-pointer ${
              activeTabKet === tab.id 
                ? 'bg-amber-600 text-slate-950 shadow-xs font-black' 
                : 'text-slate-600 hover:bg-slate-50 hover:text-amber-600'
            }`}
          >
            {tab.icon}
            {tab.lbl}
          </button>
        ))}
      </div>

      {/* ================= TAB 1: PERSETUJUAN BIAYA PENGELUARAN ================= */}
      {activeTabKet === 'otoritas' && (
        <div className="space-y-6">
          
          {/* LOAN APPLICATIONS */}
          <div className="bg-white border rounded-xl p-6 shadow-xs space-y-4">
            <div>
              <h3 className="text-xs font-black uppercase text-blue-950">1. Otorisasi Pengajuan Pinjaman Modal Kerja ({pendingLoans.length})</h3>
              <p className="text-slate-500 text-[11px]">Setiap penyaluran modal kredit koperasi wajib mendapatkan tanda tangan basah & persetujuan Ketua.</p>
            </div>

            {pendingLoans.length === 0 ? (
              <div className="text-center py-8 text-slate-400 italic bg-slate-50 border border-dashed rounded-lg">
                Tidak ada sisa draf pengajuan kredit aktif waiting list.
              </div>
            ) : (
              <div className="space-y-3">
                {pendingLoans.map((l) => (
                  <div key={l.id} className="p-4 border rounded-xl bg-slate-50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 text-xs font-sans">
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5">
                        <span className="font-extrabold text-blue-900 uppercase text-xs">{l.memberName}</span>
                        <span className="font-mono text-[9px] text-slate-400">ID Anggota: {l.memberId}</span>
                      </div>
                      <p className="font-medium text-slate-800">Nominal Pengajuan: <span className="font-extrabold font-mono text-amber-600">{formatRupiah(l.jumlah)}</span> (Tenor: {l.tenor} Bulan)</p>
                      <p className="text-[11px] text-slate-600 italic">Tujuan: &ldquo;{l.tujuan}&rdquo;</p>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          if (confirm("Tolak pengajuan modal kerja untuk anggota ini?")) onRejectLoan(l.id);
                        }}
                        className="px-3 py-1.5 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg font-bold"
                      >
                        Tolak
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(`Setujui pengajuan kredit ${formatRupiah(l.jumlah)} untuk ${l.memberName}? Saldo wajib anggota akan mendebet pengeluaran kas.`)) {
                            onApproveLoan(l.id);
                          }
                        }}
                        className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-extrabold flex items-center gap-1 uppercase tracking-wider text-[10px]"
                      >
                        <Check className="w-3.5 h-3.5" /> Approve Cair
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* WITHDRAWALS */}
          <div className="bg-white border rounded-xl p-6 shadow-xs space-y-4">
            <div>
              <h3 className="text-xs font-black uppercase text-blue-955">2. Kontrol Penarikan Dana Simpanan Anggota ({pendingWithdrawals.length})</h3>
              <p className="text-slate-500 text-[11px]">Memeriksa kepatuhan ketersediaan likuiditas kas atas dana sukarela atau penyertaan modal yang akan dicairkan.</p>
            </div>

            {pendingWithdrawals.length === 0 ? (
              <div className="text-center py-8 text-slate-400 italic bg-slate-50 border border-dashed rounded-lg">
                Tidak ada berkas sisa antrian permohonan tarik tunai.
              </div>
            ) : (
              <div className="space-y-3">
                {pendingWithdrawals.map((w) => (
                  <div key={w.id} className="p-4 border rounded-xl bg-slate-50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 text-xs font-sans">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-blue-955 uppercase">{w.memberName}</span>
                        <span className="text-[10px] bg-slate-200 text-slate-700 px-1.5 py-0.5 rounded font-bold">Simpanan {w.jenisSimpanan}</span>
                      </div>
                      <p className="font-medium text-slate-800">Nominal Tarik Dana: <span className="font-extrabold font-mono text-red-600">{formatRupiah(w.jumlah)}</span></p>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          if (confirm("Tolak permohonan tarik dana harian ini?")) onRejectWithdrawal(w.id);
                        }}
                        className="px-3 py-1.5 bg-red-50 text-red-650 hover:bg-red-100 rounded-lg font-bold"
                      >
                        Tolak
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(`Approve penarikan sukarela sebesar ${formatRupiah(w.jumlah)}?`)) {
                            onApproveWithdrawal(w.id);
                          }
                        }}
                        className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-extrabold flex items-center gap-1 uppercase tracking-wider text-[10px]"
                      >
                        <Check className="w-3.5 h-3.5" /> Approve Penarikan
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      )}

      {/* ================= TAB 2: NERACA KEUANGAN & UNIT BISNIS ================= */}
      {activeTabKet === 'laporan' && (
        <div className="space-y-6">
          
          {/* STATS PANELS */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white p-4 border rounded-xl shadow-xs">
              <span className="text-[9.5px] uppercase tracking-wider text-slate-400 font-bold block">Saldo Kas Operasional (Liquid)</span>
              <p className="text-lg font-black tracking-tight text-slate-800 font-mono mt-1">{formatRupiah(rawBalance)}</p>
              <div className="text-[9px] text-[#0c4a80] mt-1.5 font-bold flex items-center gap-1">
                <Landmark className="w-3.5 h-3.5 shrink-0" /> Mutasi Jurnal Bendahara
              </div>
            </div>

            <div className="bg-white p-4 border rounded-xl shadow-xs">
              <span className="text-[9.5px] uppercase tracking-wider text-slate-400 font-bold block">Aset inventory Swalayan/Toko</span>
              <p className="text-lg font-black tracking-tight text-slate-800 font-mono mt-1">{formatRupiah(shopUnitCash)}</p>
              <span className="text-[8.5px] text-slate-450 mt-1 block">Stok barang belanja basah & kering</span>
            </div>

            <div className="bg-white p-4 border rounded-xl shadow-xs">
              <span className="text-[9.5px] uppercase tracking-wider text-slate-400 font-bold block">Aset Pendapatan Logistik Jasa</span>
              <p className="text-lg font-black tracking-tight text-slate-800 font-mono mt-1">{formatRupiah(logisticsUnitCash)}</p>
              <span className="text-[8.5px] text-slate-450 mt-1 block">Aset ekosistem kurir purna</span>
            </div>

            <div className="bg-slate-900 text-white p-4 border rounded-xl shadow-xs border-l-4 border-[#dca415]">
              <span className="text-[9.5px] uppercase tracking-wide text-yellow-500 font-black block">AKUMULASI TOTAL AKTIVA NERACA</span>
              <p className="text-lg font-black tracking-tight text-white font-mono mt-1">{formatRupiah(totalAssetKoperasi)}</p>
              <span className="text-[8.5px] text-slate-400 mt-1 block font-bold">KSU IPPI DPW JATIM</span>
            </div>
          </div>

          {/* BALANCE SHEET DETAILED STATEMENT */}
          <div className="bg-white border rounded-xl p-6 shadow-xs space-y-4">
            <h3 className="text-xs font-black uppercase text-blue-955 pb-2.5 border-b">Detail Neraca Konsolidasi Lajur Keuangan (Simulasi RAT)</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-xs leading-relaxed text-slate-700">
              {/* Aktiva Lancar dkk */}
              <div className="space-y-3">
                <h4 className="text-[10px] font-black uppercase text-blue-900 border-b border-dashed pb-1">Sisi Aktiva (Kekayaan)</h4>
                
                <div className="space-y-1.5 font-mono text-[11px]">
                  <div className="flex justify-between">
                    <span>Kas & Setara Bank:</span>
                    <span className="font-bold">{formatRupiah(rawBalance * 0.7)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Kas Tunai di Bendahara:</span>
                    <span className="font-bold">{formatRupiah(rawBalance * 0.3)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Persediaan Unit Toko Swalayan:</span>
                    <span className="font-bold">{formatRupiah(shopUnitCash)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Aset Logistik & Jasa Lintas Pos:</span>
                    <span className="font-bold">{formatRupiah(logisticsUnitCash)}</span>
                  </div>
                  <div className="flex justify-between border-t pt-1 font-bold text-slate-900 border-slate-350 bg-slate-50 px-2.5 rounded">
                    <span>TOTAL AKTIVA :</span>
                    <span>{formatRupiah(totalAssetKoperasi)}</span>
                  </div>
                </div>
              </div>

              {/* Kewajiban / Pasiva */}
              <div className="space-y-3">
                <h4 className="text-[10px] font-black uppercase text-amber-600 border-b border-dashed pb-1">Sisi Pasiva (Kewajiban & Modal)</h4>
                
                <div className="space-y-1.5 font-mono text-[11px]">
                  <div className="flex justify-between">
                    <span>Simpanan Pokok Anggota:</span>
                    <span className="font-bold">{formatRupiah(totalAssetKoperasi * 0.2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Simpanan Wajib Anggota (Rutin):</span>
                    <span className="font-bold">{formatRupiah(totalAssetKoperasi * 0.35)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Simpanan Sukarela Anggota (Liquid):</span>
                    <span className="font-bold">{formatRupiah(totalAssetKoperasi * 0.15)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Penyertaan Modal Anggota (Berjangka):</span>
                    <span className="font-bold">{formatRupiah(totalAssetKoperasi * 0.2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Modal Cadangan Koperasi IPPI:</span>
                    <span className="font-bold">{formatRupiah(totalAssetKoperasi * 0.1)}</span>
                  </div>
                  <div className="flex justify-between border-t pt-1 font-bold text-slate-900 border-slate-350 bg-slate-50 px-2.5 rounded">
                    <span>TOTAL PASIVA :</span>
                    <span>{formatRupiah(totalAssetKoperasi)}</span>
                  </div>
                </div>
              </div>

            </div>
          </div>

        </div>
      )}

      {/* ================= TAB 3: KOP SURAT PRINT ================= */}
      {activeTabKet === 'kop_preview' && (
        <div className="bg-white border rounded-xl p-6 shadow-xs space-y-6">
          <div className="text-center">
            <h3 className="text-sm font-black text-[#0c4a80] uppercase tracking-wider">Kop Surat Kelembagaan DPW IPPI</h3>
            <p className="text-slate-500 max-w-md mx-auto mt-0.5 leading-normal">
              Melakukan generate instan kop surat resmi untuk pelaporan tahunan ke Kementerian Koperasi RI Provinsi Jawa Timur.
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
                      <h4 className="text-[18px] font-black text-blue-900 tracking-tight leading-tight uppercase font-sans">IKATAN PENSIUNAN POS INDONESIA</h4>
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
              Surat Keterangan Kepatuhan Keuangan (SKKK) IPPI DPW Jatim
            </div>
          </div>

          <div className="flex justify-center pt-2">
            <button
              onClick={handlePrintKopSurat}
              className="px-6 py-2.5 bg-slate-900 hover:bg-black font-extrabold text-white rounded-lg shadow-sm font-sans uppercase tracking-wider text-xs cursor-pointer inline-flex items-center gap-1.5 leading-none"
            >
              <Printer className="w-4 h-4" /> Cetak Kop Surat Sebagai PDF
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
