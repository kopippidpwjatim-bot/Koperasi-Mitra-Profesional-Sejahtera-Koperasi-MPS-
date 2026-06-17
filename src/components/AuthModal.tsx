import React, { useState } from 'react';
import { Eye, EyeOff, Lock, User, FileText, Phone, Mail, MapPin, Briefcase, Calendar, GraduationCap, Sparkles, Upload } from 'lucide-react';
import { Member, UserRole } from '../types';

interface AuthModalProps {
  onClose: () => void;
  onLogin: (member: Member) => void;
  onRegister: (memberData: Omit<Member, 'id' | 'saldoPokok' | 'saldoWajib' | 'saldoSukarela' | 'saldoPenyertaan' | 'registeredAt'>) => void;
  members: Member[];
  initialTab?: 'login' | 'register';
  settings: { noTelpWA: string };
  onSeed?: () => Promise<void>;
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

export const AuthModal: React.FC<AuthModalProps> = ({
  onClose,
  onLogin,
  onRegister,
  members,
  initialTab = 'login',
  settings,
  onSeed
}) => {
  const [activeTab, setActiveTab] = useState<'login' | 'register'>(initialTab);
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [isSeeding, setIsSeeding] = useState<boolean>(false);
  
  // Login Form
  const [loginForm, setLoginForm] = useState({ identifier: '', password: '' });
  const [loginError, setLoginError] = useState<string | null>(null);

  // Register Form
  const [registerForm, setRegisterForm] = useState({
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
    password: '',
    photo: '' // Base64
  });

  const [registerSuccessMsg, setRegisterSuccessMsg] = useState<string | null>(null);

  // File to DataURL
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      compressImage(file, 200, 200, 0.7)
        .then((compressedBase64) => {
          setRegisterForm(prev => ({ ...prev, photo: compressedBase64 }));
        })
        .catch((err) => {
          console.error("Gagal mengompresi foto: ", err);
          alert("Gagal memproses gambar. Coba gambar lain.");
        });
    }
  };

  const executeLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginForm.identifier || !loginForm.password) {
      setLoginError("Kolom login tidak boleh kosong.");
      return;
    }

    // Check by email or noAnggota or noRekening or nama (lowercase match)
    const found = members.find(m => 
      (m.email.toLowerCase() === loginForm.identifier.toLowerCase() || 
       m.noAnggota === loginForm.identifier || 
       m.noRekening === loginForm.identifier ||
       m.nama.toLowerCase().includes(loginForm.identifier.toLowerCase())) &&
      m.password === loginForm.password
    );

    if (!found) {
      setLoginError("Username/No Anggota atau Password salah.");
      return;
    }

    if (found.status === 'pending') {
      alert(`Pemberitahuan: Akun Anda sedang diajukan untuk disetujui.\nSilakan hubungi Sekretaris IPPI Jatim di ${settings.noTelpWA} untuk persetujuan login.`);
      return;
    }

    onLogin(found);
    onClose();
  };

  const executeRegister = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate all fields strictly as requested: "Semua kolom diatas harus di isi, dengan tanda merah Bintang"
    const {
      nama, tempatLahir, tanggalLahir, institusiPensiun,
      pekerjaanKeahlian, noHp, email, alamatLengkap, password, photo
    } = registerForm;

    if (
      !nama || !tempatLahir || !tanggalLahir || !institusiPensiun ||
      !pekerjaanKeahlian || !noHp || !email || !alamatLengkap || !password || !photo
    ) {
      alert("⚠️ Peringatan: Semua kolom bertanda bintang merah (*) dan Pas Foto wajib diisi untuk mendaftarkan keanggotaan.");
      return;
    }

    onRegister({
      ...registerForm,
      role: 'anggota',
      status: 'pending' // requires sekretaris approval
    });

    setRegisterSuccessMsg("Pendaftaran berhasil diajukan!");
  };

  const openWAToSekretarisDirect = () => {
    const cleanPhone = settings.noTelpWA.replace(/[^0-9]/g, '').replace(/^0/, '62');
    const textMsg = encodeURIComponent(
      `Selamat siang Koperasi IPPI DPW Jatim, saya ${registerForm.nama} baru saja melakukan registrasi online di Portal Koperasi. Mohon dibantu untuk persetujuan (approval) masuk ke Member Area. Terima kasih.`
    );
    window.open(`https://wa.me/${cleanPhone}?text=${textMsg}`, '_blank');
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full overflow-hidden flex flex-col md:flex-row max-h-[92vh] md:max-h-none">
        
        {/* Left Side Banner */}
        <div className="hidden md:flex md:w-5/12 bg-linear-to-br from-blue-950 via-blue-900 to-slate-900 text-white p-6 justify-between flex-col border-r border-yellow-500 relative">
          <div className="absolute inset-0 bg-radial-to-bl from-amber-500/10 to-transparent"></div>
          
          <div className="space-y-4 relative z-10">
            <span className="text-[10px] bg-yellow-500/20 text-yellow-400 font-extrabold uppercase px-2.5 py-1 rounded-full border border-yellow-500/20 tracking-wider">
              PORTAL KSU IPPI JATIM
            </span>
            <h3 className="text-xl font-bold uppercase leading-tight font-sans text-white">
              Satu Akses Layanan Pensiunan Sukses
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed font-sans font-medium">
              Akses cepat simulasi pinjaman, iuran iuran berkala, belanja ritel swalayan, KTA digital, dan perincian Sisa Hasil Usaha (SHU) secara transparan.
            </p>
          </div>

          <div className="space-y-6 pt-6 relative z-10 border-t border-slate-800">
            {/* Quick Demo Credentials */}
            <p className="text-[9.5px] uppercase tracking-widest font-bold text-[#dca415]">PROFIL LOGIN EVALUASI:</p>
            <div className="grid grid-cols-2 gap-2 text-[9px] font-mono text-slate-200">
              <div 
                className="bg-slate-950/50 p-1.5 rounded cursor-pointer hover:bg-[#dca415]/20 hover:text-[#ffffff] transition border border-slate-800"
                onClick={() => setLoginForm({ identifier: 'admin@koperasi-ippi.com', password: 'admin' })}
              >
                <p className="font-bold text-yellow-400">1. ADMIN</p>
                <p>U: admin@koperasi-ippi.com</p>
                <p>P: admin</p>
              </div>
              <div 
                className="bg-slate-950/50 p-1.5 rounded cursor-pointer hover:bg-[#dca415]/20 hover:text-[#ffffff] transition border border-slate-800"
                onClick={() => setLoginForm({ identifier: 'sekretaris@koperasi-ippi.com', password: 'sekretaris' })}
              >
                <p className="font-bold text-yellow-400">2. SEKRETARIS</p>
                <p>U: sekretaris@koperasi-ippi.com</p>
                <p>P: sekretaris</p>
              </div>
              <div 
                className="bg-slate-950/50 p-1.5 rounded cursor-pointer hover:bg-[#dca415]/20 hover:text-[#ffffff] transition border border-slate-800"
                onClick={() => setLoginForm({ identifier: 'ketua@koperasi-ippi.com', password: 'ketua' })}
              >
                <p className="font-bold text-yellow-400">3. KETUA</p>
                <p>U: ketua@koperasi-ippi.com</p>
                <p>P: ketua</p>
              </div>
              <div 
                className="bg-slate-950/50 p-1.5 rounded cursor-pointer hover:bg-[#dca415]/20 hover:text-[#ffffff] transition border border-slate-800"
                onClick={() => setLoginForm({ identifier: 'bendahara@koperasi-ippi.com', password: 'bendahara' })}
              >
                <p className="font-bold text-yellow-400">4. BENDAHARA</p>
                <p>U: bendahara@koperasi-ippi.com</p>
                <p>P: bendahara</p>
              </div>
              <div 
                className="col-span-2 bg-slate-950/50 p-1.5 rounded cursor-pointer hover:bg-[#dca415]/20 hover:text-[#ffffff] transition border border-slate-800"
                onClick={() => setLoginForm({ identifier: '9990000110', password: 'anggota' })}
              >
                <p className="font-bold text-yellow-400">5. ANGGOTA (M. Muslih)</p>
                <p>U: 9990000110 (No. Rekening)</p>
                <p>P: anggota</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side Form Content */}
        <div className="flex-1 p-6 flex flex-col overflow-y-auto max-h-[80vh] md:max-h-[92vh]">
          {/* Header Close button */}
          <div className="flex justify-between items-center pb-3 border-b border-slate-100">
            <h2 className="font-black text-sm uppercase tracking-wide text-blue-950">
              {activeTab === 'login' ? "Masuk Portal Koperasi" : "Registrasi Keanggotaan Baru"}
            </h2>
            <button onClick={onClose} className="p-1 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-800 cursor-pointer">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Toggle Tab */}
          {!registerSuccessMsg && (
            <div className="flex border-b border-slate-200 mt-4 text-xs font-bold bg-slate-50 p-1 rounded-lg">
              <button
                onClick={() => { setActiveTab('login'); setLoginError(null); }}
                className={`flex-1 py-2 rounded-md transition ${activeTab === 'login' ? 'bg-white shadow-xs text-blue-900' : 'text-slate-500 hover:text-slate-800'}`}
              >
                Masuk Portal
              </button>
              <button
                onClick={() => setActiveTab('register')}
                className={`flex-1 py-1 px-2 py-2 rounded-md transition ${activeTab === 'register' ? 'bg-white shadow-xs text-blue-900' : 'text-slate-500 hover:text-slate-800'}`}
              >
                Daftar Baru
              </button>
            </div>
          )}

          {/* ================= SUCCESS STATUS SCREEN ================= */}
          {registerSuccessMsg ? (
            <div className="py-8 text-center space-y-6">
              <div className="w-16 h-16 bg-blue-100 text-blue-950 rounded-full mx-auto flex items-center justify-center">
                <Sparkles className="w-8 h-8 text-yellow-600 animate-spin" />
              </div>
              <div className="space-y-4">
                <h4 className="text-base font-black text-blue-950 uppercase">{registerSuccessMsg}</h4>
                <div className="p-4 bg-yellow-50 border border-yellow-300/60 rounded-xl space-y-1">
                  <p className="text-xs font-black text-yellow-950 uppercase">PEMBERITAHUAN VERIFIKASI SEKERETARIS</p>
                  <p className="text-[11px] text-slate-700 italic leading-relaxed">
                    &ldquo;Silahkan hubungi, Sekretaris IPPI setempat untuk mendapatkan persetujuan login&rdquo;
                  </p>
                </div>
              </div>
              <div className="space-y-2 pt-2">
                <button
                  onClick={openWAToSekretarisDirect}
                  className="w-full flex items-center justify-center gap-2 py-3 bg-emerald-600 hover:bg-emerald-700 font-black text-white rounded-lg text-xs leading-none uppercase tracking-wider transition cursor-pointer"
                >
                  Hubungi Sekretaris (WhatsApp)
                </button>
                <button
                  onClick={() => { setRegisterSuccessMsg(null); setActiveTab('login'); }}
                  className="w-full py-2.5 text-center text-slate-500 hover:text-slate-800 text-xs font-bold leading-none cursor-pointer"
                >
                  Kembali ke Halaman Login
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* ================= LOGIN ACTIVE FORM ================= */}
              {activeTab === 'login' && (
                <form onSubmit={executeLogin} className="space-y-4 pt-4">
                  {members.length === 0 && onSeed && (
                    <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 mb-2 text-xs">
                      <div className="flex gap-2">
                        <Sparkles className="w-4 h-4 text-amber-600 shrink-0 mt-0.5 animate-pulse" />
                        <div>
                          <p className="font-bold text-amber-900 uppercase tracking-wide text-[10px]">Database Firestore Kosong</p>
                          <p className="text-amber-700 font-medium leading-relaxed mt-0.5">Pangkalan data tidak mendeteksi adanya anggota terdaftar. Silakan klik tombol di bawah untuk menginisialisasi akun pengurus bawaan (Admin, dll) agar bisa log in.</p>
                          <button
                            type="button"
                            onClick={async () => {
                              setIsSeeding(true);
                              try {
                                await onSeed();
                                alert("Database berhasil diinisialisasi secara permanen!");
                              } catch (err: any) {
                                alert("Gagal menginisialisasi database: " + err.message);
                              } finally {
                                setIsSeeding(false);
                              }
                            }}
                            disabled={isSeeding}
                            className="mt-2.5 px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-md font-bold transition flex items-center gap-1.5 text-[10px] uppercase tracking-wide cursor-pointer disabled:opacity-50"
                          >
                            {isSeeding ? "Menginisialisasi..." : "Inisialisasi Database Sekarang"}
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {loginError && (
                    <div className="text-xs font-black bg-red-50 text-red-700 border border-red-200 p-2.5 rounded-lg leading-relaxed">
                      ❌ {loginError}
                    </div>
                  )}

                  <div className="space-y-3">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 mb-1 uppercase">Username / Email / No Rekening</label>
                      <div className="relative">
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                          <User className="w-4 h-4" />
                        </span>
                        <input
                          type="text"
                          required
                          value={loginForm.identifier}
                          onChange={(e) => setLoginForm({ ...loginForm, identifier: e.target.value })}
                          className="w-full text-xs pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-lg outline-none focus:border-blue-900 focus:bg-white"
                          placeholder="Masukkan username, email, atau rekening"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 mb-1 uppercase">Password</label>
                      <div className="relative">
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                          <Lock className="w-4 h-4" />
                        </span>
                        <input
                          type={showPassword ? "text" : "password"}
                          required
                          value={loginForm.password}
                          onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                          className="w-full text-xs pl-9 pr-10 py-2.5 bg-slate-50 border border-slate-300 rounded-lg outline-none focus:border-blue-900 focus:bg-white font-mono"
                          placeholder="••••••••"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-800"
                        >
                          {showPassword ? <EyeOff className="w-4.5 h-4.5" /> : <Eye className="w-4.5 h-4.5" />}
                        </button>
                      </div>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 bg-blue-900 hover:bg-blue-950 active:scale-95 text-white font-extrabold rounded-lg text-xs leading-none uppercase tracking-wider transition-all shadow-sm cursor-pointer"
                  >
                    Masuk Portal Sekarang
                  </button>
                </form>
              )}

              {/* ================= REGISTER ACTIVE FORM ================= */}
              {activeTab === 'register' && (
                <form onSubmit={executeRegister} className="space-y-4 pt-4 text-xs">
                  <p className="text-[10px] bg-slate-100 p-2.5 border border-slate-200 text-slate-600 rounded-lg leading-relaxed mb-2 font-medium">
                    Mohon lengkapi seluruh isian berikut secara valid. Data ini akan dipasok ke Kartu Tanda Anggota (KTA) secara otomatis setelah disetujui Sekretaris Jatim.
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    
                    {/* Nama Lengkap */}
                    <div>
                      <label className="block text-[10px] font-black text-slate-500 mb-0.5 uppercase">
                        Nama Lengkat s/d Gelar <span className="text-red-500 font-sans font-black">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        className="w-full min-h-[36px] bg-slate-50 border border-slate-350 p-2.5 rounded-lg text-xs outline-none focus:border-blue-900"
                        placeholder="Contoh: Mohammad Muslih, S.H., M.M."
                        value={registerForm.nama}
                        onChange={(e) => setRegisterForm({ ...registerForm, nama: e.target.value })}
                      />
                    </div>

                    {/* Pas Foto */}
                    <div>
                      <label className="block text-[10px] font-black text-slate-500 mb-0.5 uppercase">
                        Pas Foto Anggota (KTA) <span className="text-red-500 font-sans font-black">*</span>
                      </label>
                      <div className="flex gap-2 items-center">
                        <label className="flex-1 flex gap-2 items-center justify-center border border-dashed border-slate-400 bg-slate-50 hover:bg-slate-100 p-2 text-slate-600 rounded-lg cursor-pointer transition">
                          <Upload className="w-4 h-4 text-slate-400" />
                          <span className="text-[10.5px] font-bold leading-none">Ambil Foto Pas</span>
                          <input type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} />
                        </label>
                        {registerForm.photo && (
                          <div className="w-10 h-10 border border-yellow-500 rounded bg-slate-200 overflow-hidden shrink-0">
                            <img src={registerForm.photo} className="w-full h-full object-cover" alt="preview" />
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Tempat Lahir */}
                    <div>
                      <label className="block text-[10px] font-black text-slate-500 mb-0.5 uppercase">
                        Tempat Lahir <span className="text-red-500 font-sans font-black">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        className="w-full min-h-[36px] bg-slate-50 border border-slate-350 p-2.5 rounded-lg text-xs outline-none focus:border-blue-900"
                        placeholder="Contoh: Malang"
                        value={registerForm.tempatLahir}
                        onChange={(e) => setRegisterForm({ ...registerForm, tempatLahir: e.target.value })}
                      />
                    </div>

                    {/* Tanggal Lahir */}
                    <div>
                      <label className="block text-[10px] font-black text-slate-500 mb-0.5 uppercase">
                        Tanggal Lahir <span className="text-red-500 font-sans font-black">*</span>
                      </label>
                      <input
                        type="date"
                        required
                        className="w-full min-h-[36px] bg-slate-50 border border-slate-350 p-2.5 rounded-lg text-xs outline-none focus:border-blue-900"
                        value={registerForm.tanggalLahir}
                        onChange={(e) => setRegisterForm({ ...registerForm, tanggalLahir: e.target.value })}
                      />
                    </div>

                    {/* Institusi Purnabakti */}
                    <div>
                      <label className="block text-[10px] font-black text-slate-500 mb-0.5 uppercase">
                        Institusi Pensiunan <span className="text-red-500 font-sans font-black">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        className="w-full min-h-[36px] bg-slate-50 border border-slate-350 p-2.5 rounded-lg text-xs outline-none focus:border-blue-900"
                        placeholder="Contoh: PT Pos Indonesia (Persero)"
                        value={registerForm.institusiPensiun}
                        onChange={(e) => setRegisterForm({ ...registerForm, institusiPensiun: e.target.value })}
                      />
                    </div>

                    {/* Jenis Kelamin */}
                    <div>
                      <label className="block text-[10px] font-black text-slate-500 mb-0.5 uppercase">
                        Jenis Kelamin <span className="text-red-500 font-sans font-black">*</span>
                      </label>
                      <select
                        className="w-full min-h-[36px] bg-slate-50 border border-slate-350 p-2 rounded-lg text-xs bg-white"
                        value={registerForm.jenisKelamin}
                        onChange={(e) => setRegisterForm({ ...registerForm, jenisKelamin: e.target.value as 'Laki-Laki' | 'Perempuan' })}
                      >
                        <option value="Laki-Laki">Laki-Laki</option>
                        <option value="Perempuan">Perempuan</option>
                      </select>
                    </div>

                    {/* Agama */}
                    <div>
                      <label className="block text-[10px] font-black text-slate-500 mb-0.5 uppercase">
                        Agama <span className="text-red-500 font-sans font-black">*</span>
                      </label>
                      <select
                        className="w-full min-h-[36px] bg-slate-50 border border-slate-350 p-2 rounded-lg text-xs bg-white"
                        value={registerForm.agama}
                        onChange={(e) => setRegisterForm({ ...registerForm, agama: e.target.value as any })}
                      >
                        <option value="Islam">Islam</option>
                        <option value="Kristen">Kristen</option>
                        <option value="Budha">Budha</option>
                        <option value="Hindu">Hindu</option>
                        <option value="Konghucu">Konghucu</option>
                        <option value="Kepercayaan">Kepercayaan</option>
                      </select>
                    </div>

                    {/* Pekerjaan / Keahlian */}
                    <div>
                      <label className="block text-[10px] font-black text-slate-500 mb-0.5 uppercase">
                        Pekerjaan/Keahlian <span className="text-red-500 font-sans font-black">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        className="w-full min-h-[36px] bg-slate-50 border border-slate-350 p-2.5 rounded-lg text-xs outline-none focus:border-blue-900"
                        placeholder="Contoh: kurir dan logistik, ekpedisi"
                        value={registerForm.pekerjaanKeahlian}
                        onChange={(e) => setRegisterForm({ ...registerForm, pekerjaanKeahlian: e.target.value })}
                      />
                    </div>

                    {/* No HP / WhatsApp */}
                    <div>
                      <label className="block text-[10px] font-black text-slate-500 mb-0.5 uppercase">
                        No. Telp. / HP./WhatsApp <span className="text-red-500 font-sans font-black">*</span>
                      </label>
                      <input
                        type="tel"
                        required
                        className="w-full min-h-[36px] bg-slate-50 border border-slate-350 p-2.5 rounded-lg text-xs outline-none focus:border-blue-900"
                        placeholder="Contoh: 081234567890"
                        value={registerForm.noHp}
                        onChange={(e) => setRegisterForm({ ...registerForm, noHp: e.target.value })}
                      />
                    </div>

                    {/* Email */}
                    <div>
                      <label className="block text-[10px] font-black text-slate-500 mb-0.5 uppercase">
                        Email <span className="text-red-500 font-sans font-black">*</span>
                      </label>
                      <input
                        type="email"
                        required
                        className="w-full min-h-[36px] bg-slate-50 border border-slate-350 p-2.5 rounded-lg text-xs outline-none focus:border-blue-900"
                        placeholder="Contoh: Ikatanppi@gmail.com"
                        value={registerForm.email}
                        onChange={(e) => setRegisterForm({ ...registerForm, email: e.target.value })}
                      />
                    </div>

                    {/* Password */}
                    <div className="sm:col-span-2">
                      <label className="block text-[10px] font-black text-slate-500 mb-0.5 uppercase">
                        Password Login Utama <span className="text-red-500 font-sans font-black">*</span>
                      </label>
                      <div className="relative">
                        <input
                          type={showPassword ? "text" : "password"}
                          required
                          className="w-full min-h-[36px] bg-slate-50 border border-slate-350 p-2.5 pr-10 rounded-lg text-xs outline-none focus:border-blue-900 font-mono"
                          placeholder="Masukkan password rahasia Anda"
                          value={registerForm.password}
                          onChange={(e) => setRegisterForm({ ...registerForm, password: e.target.value })}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-700"
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    {/* Alamat Lengkap */}
                    <div className="sm:col-span-2">
                      <label className="block text-[10px] font-black text-slate-500 mb-0.5 uppercase">
                        Alamat Rumah Sesuai KTP (Lengkap) <span className="text-red-500 font-sans font-black">*</span>
                      </label>
                      <textarea
                        required
                        rows={2}
                        className="w-full bg-slate-50 border border-slate-350 p-2.5 rounded-lg text-xs outline-none focus:border-blue-900"
                        placeholder="Contoh: Jl Pahlawan 24 Madiun RT. 003 RW. 001 Madiun Lor, Kec. Manguharjo Kota Madiun 63122"
                        value={registerForm.alamatLengkap}
                        onChange={(e) => setRegisterForm({ ...registerForm, alamatLengkap: e.target.value })}
                      />
                    </div>

                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 bg-blue-900 hover:bg-blue-950 text-white font-extrabold rounded-lg text-xs leading-none uppercase tracking-wider transition-all shadow-md cursor-pointer mt-3 shrink-0"
                  >
                    Kirim Form Pendaftaran Anggota
                  </button>
                </form>
              )}
            </>
          )}

        </div>
      </div>
    </div>
  );
};
