import React from 'react';
import { Member, CooperativeSettings } from '../types';

interface KTAProps {
  member: Member;
  settings: CooperativeSettings;
}

export const KTA: React.FC<KTAProps> = ({ member, settings }) => {
  const handlePrint = () => {
    const printContent = document.getElementById('kta-card-printable');
    if (!printContent) return;
    
    const originalContent = document.body.innerHTML;
    const printWindow = window.open('', '', 'height=600,width=800');
    if (!printWindow) return;
    
    printWindow.document.write('<html><head><title>Cetak Kartu Anggota Koperasi MPS Jatim</title>');
    printWindow.document.write('<link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">');
    printWindow.document.write('<style>body { -webkit-print-color-adjust: exact; padding: 20px; }</style>');
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

  const defaultPhoto = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="%239ca3af"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"/></svg>`;

  return (
    <div className="flex flex-col items-center gap-6 p-4">
      <div id="kta-card-printable" className="flex flex-col md:flex-row gap-6 justify-center items-center">
        {/* KARTU DEPAN */}
        <div id="kta-front" className="relative w-96 h-56 rounded-2xl overflow-hidden shadow-2xl flex flex-col justify-between text-white border border-yellow-500 bg-linear-to-br from-blue-900 via-blue-950 to-slate-900 p-4 select-none">
          {/* Background Decorative Circles */}
          <div className="absolute -right-10 -top-10 w-40 h-40 bg-yellow-500/10 rounded-full blur-xl"></div>
          <div className="absolute -left-10 -bottom-10 w-40 h-40 bg-blue-500/10 rounded-full blur-xl"></div>
          
          {/* Header */}
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white rounded-full p-0.5 flex-shrink-0 flex items-center justify-center overflow-hidden">
              <img 
                src={settings.logo} 
                alt="Logo Koperasi MPS" 
                className="w-full h-full object-contain"
                onError={(e) => {
                  (e.target as HTMLImageElement).onerror = null;
                }}
              />
            </div>
            <div>
              <h2 className="text-[12px] font-black uppercase tracking-wider leading-none text-yellow-400">KOPERASI MPS</h2>
              <p className="text-[7px] text-slate-300">Badan Hukum: {settings.noIjinPendirian}</p>
            </div>
          </div>

          {/* Body Content */}
          <div className="flex gap-4 mt-2">
            {/* Photo Frame with Photo Upload compatibility */}
            <div className="w-20 h-24 bg-slate-800 rounded-lg border border-yellow-500/50 overflow-hidden flex-shrink-0 flex items-center justify-center">
              <img 
                src={member.photo || defaultPhoto} 
                alt={member.nama} 
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = defaultPhoto;
                }}
              />
            </div>
            
            {/* Information */}
            <div className="flex flex-col justify-center min-w-0">
              <span className="text-[8px] uppercase tracking-widest text-[#dca415] font-bold">Nama Lengkap</span>
              <h3 className="text-sm font-bold text-white leading-tight truncate" title={member.nama}>
                {member.nama}
              </h3>
              
              <span className="text-[8px] uppercase tracking-widest text-[#dca415] font-bold mt-1">Nomor Anggota</span>
              <p className="text-base font-mono font-black text-yellow-300 leading-none tracking-wider">
                {member.noAnggota || '9990000000'}
              </p>

              <span className="text-[8px] uppercase tracking-widest text-[#dca415] font-bold mt-1">Spesialisasi / Asal</span>
              <p className="text-[10px] text-slate-300 truncate font-semibold">
                {member.pekerjaanKeahlian || member.institusiPensiun || '-'}
              </p>
            </div>
          </div>

          {/* Footer Card */}
          <div className="flex justify-between items-end border-t border-slate-700/50 pt-1.5 mt-1 text-[8px] text-slate-300 font-mono">
            <span>KARTU ANGGOTA ELEKTRONIK (KTA)</span>
            <span className="text-[8px] font-sans font-semibold text-yellow-400 uppercase">KOPERASI MPS JATIM</span>
          </div>
        </div>

        {/* KARTU BELAKANG */}
        <div id="kta-back" className="relative w-96 h-56 rounded-2xl overflow-hidden shadow-2xl flex flex-col justify-between text-white border border-slate-700 bg-linear-to-br from-slate-900 via-slate-950 to-blue-950 p-4 select-none">
          <div className="absolute inset-0 bg-radial-to-t from-slate-950 to-blue-950/20 opacity-90 z-0"></div>
          
          <div className="relative z-10 flex flex-col h-full justify-between">
            {/* Top Logo and Terms title */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-white rounded-full p-0.5 flex items-center justify-center">
                  <img src={settings.logo} className="w-full h-full object-contain" alt="Logo mini" />
                </div>
                <span className="text-[11px] font-bold tracking-wider uppercase text-yellow-400">KETENTUAN KARTU ANGGOTA</span>
              </div>
              <span className="text-[8px] font-semibold text-slate-400">Koperasi MPS</span>
            </div>

            {/* Terms List and Information */}
            <div className="text-[7.5px] text-slate-300 space-y-1 my-2">
              <p>1. Kartu ini merupakan bukti keanggotaan sah Koperasi Mitra Profesional Sejahtera (Koperasi MPS).</p>
              <p>2. Hak-hak pemegang kartu berpaku pada Anggaran Dasar/Anggaran Rumah Tangga (AD/ART) Koperasi.</p>
              <p>3. Apabila kartu ini ditemukan di jalan, mohon hubungi sekretariat tertera di bawah ini.</p>
            </div>

            {/* Secretariat details from Admin settings */}
            <div className="border-t border-slate-800 pt-2 text-[8px] text-slate-300">
              <p className="font-bold text-yellow-400 uppercase text-[8.5px]">Sekretariat Utama:</p>
              <p className="font-sans leading-relaxed text-slate-200 mt-0.5">
                {settings.alamatSekretariat}
              </p>
              <div className="flex justify-between items-center mt-1 text-slate-400 font-mono text-[7px]">
                <span>Telp/WA: {settings.noTelpWA}</span>
                <span>Email: {settings.email}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <button
        id="btn-print-kta"
        onClick={handlePrint}
        className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-semibold rounded-lg shadow-md transition-all text-sm mt-2"
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-4 h-4">
          <path strokeLinecap="round" strokeLinejoin="round" d="M6.72 13.82l-.15-.03a3.375 3.375 0 00-.469-.023H3h18h-3.101c-.161 0-.323.015-.469.023l-.15.03M6.72 13.82A3.101 3.101 0 016 14.1s-.421-.01-.469-.023m1.189-.257a3.102 3.102 0 01.319-1.294M18.72 13.82c-.048.013-.469.023-.469.023a3.101 3.101 0 01-.72-.28m1.189-.257a3.102 3.102 0 00-.319-1.294m0 0a3.374 3.374 0 00-2.435-2.25L15 9.07m-5.435 2.193a3.374 3.374 0 012.435-2.25L12 9.07m0 0V3.75" />
        </svg>
        Cetak Kartu PDF / Printer
      </button>
    </div>
  );
};
