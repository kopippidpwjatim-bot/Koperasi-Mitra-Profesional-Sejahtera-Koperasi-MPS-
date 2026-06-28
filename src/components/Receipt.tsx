import React from 'react';
import { Transaction, CooperativeSettings, Member } from '../types';

interface ReceiptProps {
  transaction: Transaction;
  member?: Member;
  settings: CooperativeSettings;
  onClose: () => void;
}

// Helper to convert number to Indonesian words (Terbilang)
function penyebut(nilai: number): string {
  const sisa = Math.abs(nilai);
  const huruf = ["", "Satu", "Dua", "Tiga", "Empat", "Lima", "Enam", "Tujuh", "Delapan", "Sembilan", "Sepuluh", "Sebelas"];
  let temp = "";
  
  if (sisa < 12) {
    temp = " " + huruf[sisa];
  } else if (sisa < 20) {
    temp = penyebut(sisa - 10) + " Belas";
  } else if (sisa < 100) {
    temp = penyebut(Math.floor(sisa / 10)) + " Puluh" + penyebut(sisa % 10);
  } else if (sisa < 200) {
    temp = " Seratus" + penyebut(sisa - 100);
  } else if (sisa < 1000) {
    temp = penyebut(Math.floor(sisa / 100)) + " Ratus" + penyebut(sisa % 100);
  } else if (sisa < 2000) {
    temp = " Seribu" + penyebut(sisa - 1000);
  } else if (sisa < 1000000) {
    temp = penyebut(Math.floor(sisa / 1000)) + " Ribu" + penyebut(sisa % 1000);
  } else if (sisa < 1000000000) {
    temp = penyebut(Math.floor(sisa / 1000000)) + " Juta" + penyebut(sisa % 1000000);
  }
  return temp;
}

export function terbilang(nilai: number): string {
  if (nilai === 0) return "Nol Rupiah";
  return (penyebut(nilai) + " Rupiah").trim().replace(/\s+/g, ' ');
}

export const Receipt: React.FC<ReceiptProps> = ({ transaction, member, settings, onClose }) => {
  const amount = transaction.jumlahMasuk > 0 ? transaction.jumlahMasuk : transaction.jumlahKeluar;
  const spelledOut = terbilang(amount);

  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(val);
  };

  const handlePrint = () => {
    const printContent = document.getElementById('receipt-print-area');
    if (!printContent) return;
    const printWindow = window.open('', '', 'width=600,height=800');
    if (!printWindow) return;
    printWindow.document.write('<html><head><title>Struk Transaksi - ' + transaction.id + '</title>');
    printWindow.document.write('<link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">');
    printWindow.document.write('<style>body { -webkit-print-color-adjust: exact; padding: 30px; font-family: monospace; }</style>');
    printWindow.document.write('</head><body>');
    printWindow.document.write(printContent.innerHTML);
    printWindow.document.write('</body></html>');
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 500);
  };

  const handleSendWA = () => {
    if (!member && !transaction.noRekening) {
      alert("No HP tujuan tidak teridentifikasi.");
      return;
    }
    
    const targetPhone = member?.noHp || settings.noTelpWA;
    const cleanPhone = targetPhone.replace(/[^0-9]/g, '').replace(/^0/, '62');
    
    const textMsg = `*STRUK BUKTI TRANSAKSI KOPERASI MPS*\n\n` +
      `No Transaksi: ${transaction.id}\n` +
      `Tanggal: ${transaction.tanggal}\n` +
      `Jenis: ${transaction.kategori} (${transaction.sumberTujuan})\n` +
      `Anggota: ${member?.nama || 'Umum/Lainnya'} (${member?.noAnggota || '-'})\n` +
      `Keterangan: ${transaction.deskripsi}\n` +
      `Jumlah: *${formatRupiah(amount)}*\n` +
      `Terbilang: _${spelledOut}_\n\n` +
      `Status: SUCCESS / LUNAS\n` +
      `Petugas: ${transaction.createdBy}\n\n` +
      `Terima kasih atas partisipasi aktif Anda di Koperasi Mitra Profesional Sejahtera (Koperasi MPS) Jawa Timur.`;
      
    const waUrl = `https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encodeURIComponent(textMsg)}`;
    window.open(waUrl, '_blank');
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="bg-slate-900 px-6 py-4 flex items-center justify-between text-white border-b border-yellow-500">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 bg-green-500 rounded-full animate-ping"></span>
            <span className="font-semibold text-sm">Bukti Transaksi Keuangan</span>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition cursor-pointer">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Printable Area */}
        <div className="p-6 overflow-y-auto flex-1" id="receipt-print-area">
          <div className="border border-slate-300 p-4 rounded-lg bg-slate-50 font-mono text-xs text-slate-800 space-y-4">
            
            {/* Header Sekolah/Koperasi */}
            <div className="text-center pb-3 border-b border-dashed border-slate-400">
              <div className="w-16 h-16 bg-white rounded-full p-1 mx-auto flex items-center justify-center border border-slate-200 shadow-xs mb-1">
                <img src={settings.logo} className="max-w-full max-h-full object-contain" alt="Coop Logo" />
              </div>
              <h1 className="font-extrabold text-sm uppercase text-blue-900 leading-tight">KOPERASI MPS</h1>
              <p className="text-[10px] text-slate-600 mt-1 max-w-[280px] mx-auto leading-tight">
                {settings.alamatSecretariat || settings.alamatSekretariat}
              </p>
              <p className="text-[9px] text-slate-500 font-sans mt-0.5">Ibu Ijin Pendirian: {settings.noIjinPendirian}</p>
            </div>

            {/* Meta data */}
            <div className="space-y-1 text-[10px]">
              <div className="flex justify-between">
                <span>NO. TRANSAKSI :</span>
                <span className="font-bold">{transaction.id}</span>
              </div>
              <div className="flex justify-between">
                <span>TANGGAL :</span>
                <span>{transaction.tanggal}</span>
              </div>
              <div className="flex justify-between">
                <span>KATEGORI :</span>
                <span className="font-bold text-blue-800">{transaction.kategori.toUpperCase()}</span>
              </div>
              <div className="flex justify-between">
                <span>SUMBER DATA :</span>
                <span>{transaction.sumberTujuan}</span>
              </div>
              <div className="flex justify-between">
                <span>OPERATOR :</span>
                <span>{transaction.createdBy.toUpperCase()}</span>
              </div>
            </div>

            <hr className="border-dashed border-slate-300" />

            {/* Member Details */}
            <div className="bg-white p-2.5 rounded border border-slate-200 space-y-1 text-[10.5px]">
              <p className="font-bold border-b border-slate-200 pb-1 mb-1 text-blue-950 font-sans">INFORMASI ANGGOTA / PIHAK KEDUA</p>
              {member ? (
                <>
                  <div className="flex justify-between">
                    <span>NAMA ANGGOTA :</span>
                    <span className="font-bold uppercase">{member.nama}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>NO ANGGOTA :</span>
                    <span className="font-bold text-yellow-700">{member.noAnggota}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>NO REKENING :</span>
                    <span className="font-mono">{member.noRekening}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>INSTITUSI :</span>
                    <span className="truncate max-w-[170px]">{member.institusiPensiun}</span>
                  </div>
                </>
              ) : (
                <div className="flex justify-between">
                  <span>TRANSFER KE / DARI :</span>
                  <span className="font-bold text-slate-700 break-all truncate max-w-[180px]">
                    {transaction.namaBankPemilik || 'Non-Anggota / Umum'}
                  </span>
                </div>
              )}
            </div>

            {/* Description item block */}
            <div className="space-y-1.5 pt-1 text-[11px]">
              <p className="font-bold text-slate-500 font-sans">DESKRIPSI TRANSAKSI:</p>
              <p className="bg-slate-100 p-2 rounded text-slate-700 leading-normal border border-slate-200 italic font-sans">
                &ldquo;{transaction.deskripsi}&rdquo;
              </p>
            </div>

            <hr className="border-dashed border-slate-300" />

            {/* Payment total */}
            <div className="space-y-1.5 pt-1 text-right text-xs">
              <div className="flex justify-between items-center bg-blue-50 p-2 rounded shadow-xs border border-blue-100 text-blue-950">
                <span className="font-bold text-[11px] font-sans">TOTAL NOMINAL :</span>
                <span className="text-sm font-bold tracking-wide">{formatRupiah(amount)}</span>
              </div>
              <div className="pt-2 text-left text-[9.5px] leading-relaxed text-slate-500">
                <span className="font-bold font-sans">TERBILANG :</span> <span className="italic uppercase font-sans font-medium text-slate-800">{spelledOut}</span>
              </div>
            </div>

            {/* Signatures */}
            <div className="grid grid-cols-2 gap-4 text-center pt-6 text-[9.5px]">
              <div>
                <p className="font-bold">Pihak Kedua/Anggota</p>
                <div className="h-12 border-b border-dashed border-slate-300 mx-auto w-3/4"></div>
                <p className="mt-1 truncate max-w-[120px] mx-auto font-medium">{member?.nama || "Penerima Dana"}</p>
              </div>
              <div>
                <p className="font-bold">Bendahara Koperasi MPS Jatim</p>
                <div className="h-12 border-b border-dashed border-slate-300 mx-auto w-3/4"></div>
                <p className="mt-1 font-medium">{settings.namaSekretariat ? "Kartika Wardhani, S.E." : "Koperasi MPS"}</p>
              </div>
            </div>

            <div className="text-center pt-4 border-t border-dashed border-slate-300 text-[8.5px] text-slate-400">
              <p>Simpan tanda bukti ini sebagai dokumen sah Koperasi.</p>
              <p className="font-sans mt-0.5">KOPERASI MPS &copy; 2026</p>
            </div>

          </div>
        </div>

        {/* Buttons Panel */}
        <div className="bg-slate-50 p-4 border-t border-slate-200 flex flex-col sm:flex-row gap-2">
          <button
            onClick={handlePrint}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 bg-slate-800 hover:bg-slate-900 active:scale-95 text-white font-semibold rounded-lg text-xs leading-none shadow-sm transition"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-4 h-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6.72 13.82l-.15-.03a3.375 3.375 0 00-.469-.023H3h18h-3.101c-.161 0-.323.015-.469.023l-.15.03" />
            </svg>
            Print Struk PDF
          </button>

          <button
            onClick={handleSendWA}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-semibold rounded-lg text-xs leading-none shadow-sm transition"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="w-4 h-4" viewBox="0 0 16 16">
              <path d="M13.601 2.326A7.85 7.85 0 0 0 7.994 0C3.627 0 .068 3.558.064 7.926c0 1.399.366 2.76 1.057 3.965L0 16l4.204-1.102a7.9 7.9 0 0 0 3.79.949h.004c4.368 0 7.927-3.558 7.93-7.93a7.9 7.9 0 0 0-2.327-5.594ZM7.995 14.52a6.57 6.57 0 0 1-3.356-.92l-.24-.144-2.494.654.666-2.433-.156-.251a6.56 6.56 0 0 1-1.007-3.505c0-3.626 2.957-6.584 6.591-6.584a6.56 6.56 0 0 1 4.66 1.931 6.56 6.56 0 0 1 1.928 4.66c-.004 3.639-2.961 6.592-6.592 6.592m3.615-4.934c-.197-.099-1.17-.578-1.353-.646-.182-.065-.315-.099-.445.099-.133.197-.513.646-.627.775-.114.133-.232.148-.43.05-.197-.1-.836-.308-1.592-.985-.59-.525-.985-1.175-1.103-1.372-.114-.198-.011-.304.088-.403.087-.088.197-.232.296-.346.1-.114.133-.198.198-.33.065-.134.034-.248-.015-.347-.05-.099-.445-1.076-.612-1.47-.16-.389-.323-.335-.445-.34-.114-.007-.247-.007-.38-.007a.73.73 0 0 0-.529.247c-.182.198-.691.677-.691 1.654s.71 1.916.81 2.049c.098.133 1.394 2.132 3.383 2.992.47.205.84.326 1.129.418.475.152.904.129 1.246.08.38-.058 1.171-.48 1.338-.943.164-.464.164-.86.114-.943-.049-.084-.182-.133-.38-.232"/>
            </svg>
            Kirim WhatsApp
          </button>
        </div>
      </div>
    </div>
  );
};
