import React, { useState } from 'react';
import { 
  Building2, Users, FileText, ShoppingBag, Truck, Info, Phone, 
  MapPin, Clock, Calendar, ChevronRight, Eye, ShieldCheck, HelpCircle, 
  ShoppingCart, ArrowRight, ExternalLink, Bookmark, Search, Filter 
} from 'lucide-react';
import { CooperativeSettings, StoreProduct, Article, Announcement, CartItem, Member, TentangItem, LayananItem, GalleryItem } from '../types';

interface LandingPageProps {
  settings: CooperativeSettings;
  products: StoreProduct[];
  articles: Article[];
  announcements: Announcement[];
  tentangItems: TentangItem[];
  layananItems: LayananItem[];
  galleryItems: GalleryItem[];
  onOpenAuth: (tab: 'login' | 'register') => void;
  guestCart: CartItem[];
  setGuestCart: React.Dispatch<React.SetStateAction<CartItem[]>>;
  activeMember: Member | null;
  onDeductBalanceForPurchase: (total: number, orderDetails: string) => boolean;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  settings,
  products,
  articles,
  announcements,
  tentangItems,
  layananItems,
  galleryItems,
  onOpenAuth,
  guestCart,
  setGuestCart,
  activeMember,
  onDeductBalanceForPurchase
}) => {
  const [activeTab, setActiveTab] = useState<'beranda' | 'tentang' | 'layanan' | 'berita' | 'galeri' | 'kontak'>('beranda');
  const [selectedCategory, setSelectedCategory] = useState<string>('Semua');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [showCartModal, setShowCartModal] = useState<boolean>(false);
  const [checkoutSuccess, setCheckoutSuccess] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'sukarela' | 'pos_cash'>('pos_cash');

  // Contact form state
  const [contactForm, setContactForm] = useState({ nama: '', email: '', pesan: '' });
  const [contactSuccess, setContactSuccess] = useState(false);

  const categories = ['Semua', ...Array.from(new Set(products.map(p => p.kategori)))];

  const filteredProducts = products.filter(p => {
    const matchesCategory = selectedCategory === 'Semua' || p.kategori === selectedCategory;
    const matchesSearch = p.nama.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          p.deskripsi.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const addToCart = (product: StoreProduct) => {
    setGuestCart(prev => {
      const existing = prev.find(item => item.product.id === product.id);
      if (existing) {
        return prev.map(item => 
          item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
  };

  const updateCartQty = (productId: string, delta: number) => {
    setGuestCart(prev => prev.map(item => {
      if (item.product.id === productId) {
        const nq = item.quantity + delta;
        return nq > 0 ? { ...item, quantity: nq } : item;
      }
      return item;
    }).filter(i => i.quantity > 0));
  };

  const getSubtotal = () => {
    return guestCart.reduce((sum, item) => sum + (item.product.harga * item.quantity), 0);
  };

  const handleCheckout = (e: React.FormEvent) => {
    e.preventDefault();
    const total = getSubtotal();
    const details = guestCart.map(i => `${i.product.nama} x ${i.quantity}`).join(', ');

    if (paymentMethod === 'sukarela') {
      if (!activeMember) {
        alert("Silakan login terlebih dahulu untuk membayar didebet dari Saldo Sukarela Anda.");
        onOpenAuth('login');
        return;
      }
      const success = onDeductBalanceForPurchase(total, `Belanja Online: ${details}`);
      if (!success) {
        alert("Gagal melakukan penarikan otomatis. Saldo Sukarela Anda tidak mencukupi.");
        return;
      }
    }

    setCheckoutSuccess(`Pesanan berhasil diserahkan! Total transaksi: ${new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(total)}. Silakan ambil barang di unit Swalayan IPPI atau hubungi admin logistik.`);
    setGuestCart([]);
    setTimeout(() => {
      setCheckoutSuccess(null);
      setShowCartModal(false);
    }, 6000);
  };

  const handleSubmitContact = (e: React.FormEvent) => {
    e.preventDefault();
    setContactSuccess(true);
    setContactForm({ nama: '', email: '', pesan: '' });
    setTimeout(() => setContactSuccess(false), 4000);
  };

  const openWAToSecretary = () => {
    const cleanPhone = settings.noTelpWA.replace(/[^0-9]/g, '').replace(/^0/, '62');
    const msg = encodeURIComponent(`Halo Sekretaris IPPI DPW Jatim, saya ingin mengajukan verifikasi keanggotaan baru koperasi.`);
    window.open(`https://wa.me/${cleanPhone}?text=${msg}`, '_blank');
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-100 font-sans text-slate-800 antialiased selection:bg-indigo-600 selection:text-white">
      {/* 1. TOP HEADER BRAND LOGO */}
      <header className="bg-indigo-900 border-b border-indigo-800 sticky top-0 z-40 text-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16 sm:h-20">
            {/* Brand Logo & Name */}
            <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveTab('beranda')}>
              <div className="w-11 h-11 bg-white rounded-full p-1 border border-indigo-200 overflow-hidden flex items-center justify-center shadow-xs shrink-0">
                <img 
                  src={settings.logo} 
                  alt="Logo Koperasi IPPI" 
                  className="w-full h-full object-contain"
                />
              </div>
              <div>
                <span className="text-[10px] font-black uppercase text-yellow-400 tracking-wider block leading-none">KOPERASI IPPI</span>
                <h1 className="text-sm sm:text-base font-extrabold text-white tracking-tight leading-tight">DPW Provinsi Jawa Timur</h1>
                <p className="text-[9px] text-indigo-200 hidden sm:block">Ikatan Profesional & Pensiunan Indonesia | Akreditasi Legalitas & Kesejahteraan Mandiri</p>
              </div>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex space-x-1">
              {(['beranda', 'tentang', 'layanan', 'berita', 'galeri', 'kontak'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all capitalize cursor-pointer ${
                    activeTab === tab 
                      ? 'bg-yellow-500 text-slate-950 shadow-xs' 
                      : 'text-indigo-100 hover:bg-indigo-850 hover:text-white'
                  }`}
                >
                  {tab === 'tentang' ? 'Tentang Kami' : tab === 'berita' ? 'Berita & Kegiatan' : tab === 'kontak' ? 'Hubungi Kami' : tab}
                </button>
              ))}
            </nav>

            {/* Actions button */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowCartModal(true)}
                className="relative p-2 text-indigo-100 hover:text-white hover:bg-indigo-800 rounded-lg transition-all cursor-pointer"
                title="Keranjang Belanja"
              >
                <ShoppingCart className="w-5 h-5" />
                {guestCart.length > 0 && (
                  <span className="absolute top-0 right-0 inline-flex items-center justify-center px-1.5 py-0.5 text-[8.5px] font-black leading-none text-slate-955 transform translate-x-1 -translate-y-1 bg-yellow-400 rounded-full">
                    {guestCart.reduce((s, i) => s + i.quantity, 0)}
                  </span>
                )}
              </button>

              {activeMember ? (
                <div className="flex items-center gap-2">
                  <span className="hidden md:inline-block text-[10px] font-bold px-2.5 py-1 bg-indigo-950 text-indigo-200 border border-indigo-850 rounded-full font-mono">
                    ● {activeMember.nama.split(',')[0]}
                  </span>
                  <button
                    onClick={() => setActiveTab('beranda')} // Triggers active member action in parent
                    className="px-3.5 py-1.5 bg-yellow-500 hover:bg-yellow-600 text-slate-950 font-black text-xs rounded-lg transition"
                  >
                    Portal Anggota
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => onOpenAuth('login')}
                    className="px-3 py-1.5 text-indigo-100 hover:bg-indigo-800 hover:text-white font-bold text-xs rounded-lg border border-indigo-750 transition cursor-pointer"
                  >
                    Masuk
                  </button>
                  <button
                    onClick={() => onOpenAuth('register')}
                    className="px-3 py-1.5 bg-yellow-500 hover:bg-yellow-600 text-slate-950 font-black text-xs rounded-lg shadow-sm transition active:scale-95 cursor-pointer"
                  >
                    Daftar Anggota
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* MOBILE NAVIGATION BAR (SCROLLABLE ON SUB-HEADER) */}
      <div className="lg:hidden bg-slate-900 text-slate-300 border-b border-slate-800 overflow-x-auto whitespace-nowrap hide-scrollbar py-2 px-3 sticky top-16 z-30">
        <div className="flex space-x-1 max-w-full">
          {(['beranda', 'tentang', 'layanan', 'berita', 'galeri', 'kontak'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3.5 py-1.5 text-xs font-semibold rounded-full min-w-[70px] uppercase tracking-wide transition ${
                activeTab === tab 
                  ? 'bg-[#dca415] text-slate-950 font-extrabold' 
                  : 'text-slate-300 hover:bg-slate-800'
              }`}
            >
              {tab === 'tentang' ? 'Profil' : tab === 'berita' ? 'Berita' : tab}
            </button>
          ))}
        </div>
      </div>

      {/* 2. MAIN VIEW CONTROLLER */}
      <main className="flex-1">
        
        {/* ================= BERANDA SECTION ================= */}
        {activeTab === 'beranda' && (
          <div className="space-y-16 pb-12 animate-fade-in">
            {/* HERO BANNER */}
            <div className="relative bg-gradient-to-r from-blue-950 via-slate-900 to-blue-900 text-white py-14 sm:py-20 md:py-24 overflow-hidden border-b-4 border-yellow-500">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,_var(--tw-gradient-stops))] from-blue-900/30 via-transparent to-transparent"></div>
              
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                <div className="lg:col-span-8 space-y-6">
                  <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#dca415]/15 border border-yellow-500/25 rounded-full text-[#dca415]">
                    <Building2 className="w-4 h-4" />
                    <span className="text-[10.5px] font-bold tracking-widest uppercase">KOP IPPI DPW JATIM</span>
                  </div>
                  <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight leading-tight uppercase font-sans">
                    Mewujudkan Purnatugas Mandiri, <span className="text-yellow-400">Sejahtera</span> & Bermartabat
                  </h1>
                  <p className="text-slate-300 text-sm sm:text-base max-w-xl font-medium leading-relaxed">
                    Koperasi Serba Usaha Ikatan Profesional & Pensiunan Indonesia (IPPI) DPW Jawa Timur bertekad mendampingi kesejahteraan finansial, sosial, dan kesehatan purnabakti lewat layanan Koperasi terpercaya.
                  </p>
                  <div className="flex flex-wrap gap-3 pt-2">
                    <button 
                      onClick={() => onOpenAuth('register')}
                      className="px-6 py-3 bg-[#dca415] hover:bg-yellow-600 text-slate-950 font-bold rounded-lg shadow-lg hover:shadow-yellow-500/10 flex items-center gap-2 transform active:scale-95 transition cursor-pointer"
                    >
                      Daftar Anggota Baru <ArrowRight className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => setActiveTab('tentang')}
                      className="px-6 py-3 bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold rounded-lg transition"
                    >
                      Pelajari Profil Koperasi
                    </button>
                  </div>
                </div>

                <div className="lg:col-span-4 flex justify-center">
                  <div className="w-56 h-56 md:w-64 md:h-64 bg-white/95 rounded-full p-4 border-4 border-yellow-500 shadow-2xl flex items-center justify-center animate-pulse">
                    <img src={settings.logo} className="w-full h-full object-contain" alt="Coop Big Emblem" />
                  </div>
                </div>
              </div>
            </div>

            {/* KEY METRICS SUMMARY */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { icon: <Users className="text-blue-900 w-6 h-6" />, val: "1.250+", lbl: "Anggota Aktif", desc: "Pensiunan Se-Jatim" },
                  { icon: <Building2 className="text-[#dca415] w-6 h-6" />, val: "38 Kota", lbl: "Kabupaten/Kota", desc: "Koordinasi Wilayah" },
                  { icon: <FileText className="text-blue-900 w-6 h-6" />, val: "4 Unit", lbl: "Unit Usaha KSU", desc: "Simpan Pinjam, Swalayan, Kargo" },
                  { icon: <ShieldCheck className="text-green-600 w-6 h-6" />, val: "Legal", lbl: "Kemenkop RI", desc: "AHU Legal Terdaftar" }
                ].map((m, idx) => (
                  <div key={idx} className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col items-center text-center space-y-2">
                    <div className="p-2.5 bg-slate-50 rounded-full">{m.icon}</div>
                    <span className="text-xl sm:text-2xl font-black text-blue-950 leading-none">{m.val}</span>
                    <h3 className="text-xs font-black text-slate-800 uppercase tracking-wide">{m.lbl}</h3>
                    <p className="text-[10px] text-slate-500 font-medium">{m.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* IMPORTANT ANNOUNCEMENT SLIDEOUT BANNER */}
            {announcements.length > 0 && (
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="bg-amber-50 border-l-4 border-[#dca415] p-5 rounded-r-xl shadow-xs">
                  <div className="flex items-start gap-3">
                    <div className="p-1 px-2.5 bg-[#dca415] text-slate-950 rounded-full text-[10px] font-black uppercase mt-0.5">PENTING</div>
                    <div className="space-y-1">
                      <h4 className="text-sm font-black text-amber-950">{announcements[0].title}</h4>
                      <p className="text-xs text-amber-900 leading-relaxed max-w-4xl">{announcements[0].content}</p>
                      <p className="text-[10px] text-amber-700 font-mono flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 inline" /> {announcements[0].date}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 1. TENTANG KAMI DYNAMIC HIGHLIGHTS */}
            <div className="space-y-12">
              {tentangItems
                .filter(item => item.showOnBeranda !== false)
                .sort((a, b) => a.order - b.order)
                .map((item, idx) => (
                  <div key={item.id} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-2 gap-8 items-center bg-white p-8 rounded-2xl border border-slate-200 shadow-xs">
                    <div className={`space-y-6 ${idx % 2 === 1 ? 'lg:order-last' : ''}`}>
                      <span className="text-xs uppercase tracking-widest text-[#dca415] font-black">{item.title}</span>
                      <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0c4a80] leading-tight mb-2">{item.title} KSU IPPI JATIM</h2>
                      <p className="text-slate-600 text-xs sm:text-sm leading-relaxed whitespace-pre-line">
                        {item.content}
                      </p>
                      <div className="flex flex-wrap gap-2 pt-2">
                        <button 
                          onClick={() => setActiveTab('tentang')}
                          className="px-5 py-2.5 bg-blue-900 hover:bg-blue-950 text-white font-bold text-xs rounded-lg inline-flex items-center gap-1.5 cursor-pointer"
                        >
                          Lihat Selengkapnya <ChevronRight className="w-4 h-4" />
                        </button>
                        {item.externalUrl && (
                          <a 
                            href={item.externalUrl.startsWith('http') ? item.externalUrl : `https://${item.externalUrl}`}
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="px-5 py-2.5 bg-yellow-500 hover:bg-yellow-600 text-slate-950 font-bold text-xs rounded-lg inline-flex items-center gap-1.5 cursor-pointer"
                          >
                            Buka Tautan <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        )}
                      </div>
                    </div>

                    <div className="relative">
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/40 to-transparent rounded-lg"></div>
                      <img 
                        src={item.image || "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&q=80&w=630"} 
                        className="rounded-xl w-full h-72 md:h-80 object-cover shadow-lg border border-slate-100" 
                        alt={item.title}
                      />
                    </div>
                  </div>
                ))}
            </div>

            {/* 2. DYNAMIC LAYANAN HIGHLIGHTS ON HOMEPAGE */}
            {layananItems.some(l => l.showOnBeranda) && (
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
                <div>
                  <span className="text-xs uppercase tracking-widest text-[#dca415] font-black">UNIT USAHA KOPERASI</span>
                  <h2 className="text-2xl font-extrabold text-[#0c4a80] leading-tight">Layanan Unggulan Kami di Beranda</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {layananItems.filter(l => l.showOnBeranda).sort((a,b) => a.order - b.order).map((item) => (
                    <div key={item.id} className="bg-white border rounded-2xl overflow-hidden p-5 flex flex-col sm:flex-row gap-4 items-center hover:shadow-md transition">
                      <img src={item.image} className="w-32 h-32 object-cover rounded-xl shrink-0" alt={item.title} />
                      <div className="space-y-2 flex-1 w-full">
                        <span className="px-2 py-0.5 bg-indigo-50 text-indigo-700 text-[9px] font-black rounded-full uppercase">{item.badge || "UNIT"}</span>
                        <h3 className="text-xs sm:text-sm font-black text-slate-900 leading-none">{item.title}</h3>
                        <p className="text-[10px] text-slate-500 line-clamp-2 leading-relaxed">{item.content}</p>
                        <div className="flex gap-4 pt-1">
                          <button onClick={() => setActiveTab('layanan')} className="text-[11px] text-blue-900 hover:underline font-bold flex items-center gap-0.5 cursor-pointer">
                            Buka Layanan <ChevronRight className="w-3.5 h-3.5" />
                          </button>
                          {item.externalUrl && (
                            <a 
                              href={item.externalUrl.startsWith('http') ? item.externalUrl : `https://${item.externalUrl}`} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-[11px] text-yellow-600 hover:underline font-bold flex items-center gap-0.5 cursor-pointer"
                            >
                              Tautan Luar <ExternalLink className="w-3 h-3" />
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 3. DYNAMIC BERITA HIGHLIGHTS ON HOMEPAGE */}
            {articles.some(a => a.showOnBeranda) && (
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
                <div className="flex justify-between items-end">
                  <div>
                    <span className="text-xs uppercase tracking-widest text-[#dca415] font-black">BULLETIN TERBARU</span>
                    <h2 className="text-2xl font-extrabold text-[#0c4a80] leading-tight">Berita d& Kegiatan Beranda</h2>
                  </div>
                  <button onClick={() => setActiveTab('berita')} className="text-xs font-bold text-blue-950 hover:underline flex items-center gap-1 cursor-pointer">
                    Lihat Semua Berita <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {articles.filter(a => a.showOnBeranda).sort((a,b) => (a.order || 0) - (b.order || 0)).map((art) => (
                    <div key={art.id} className="bg-white border rounded-xl overflow-hidden shadow-xs flex flex-col justify-between hover:shadow-md transition">
                      <div className="h-40 overflow-hidden bg-slate-100 relative">
                        <img src={art.image || "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&q=80&w=200"} className="w-full h-full object-cover" alt={art.title} />
                        <span className="absolute top-2 right-2 px-2 py-0.5 bg-yellow-500 text-slate-900 text-[8px] font-black uppercase rounded-full">{art.category}</span>
                      </div>
                      <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                        <div className="space-y-1">
                          <p className="text-[9px] font-mono text-slate-400">{art.date}</p>
                          <h4 className="text-xs font-black text-blue-950 line-clamp-2">{art.title}</h4>
                          <p className="text-[11px] text-slate-500 line-clamp-3 leading-relaxed">{art.summary}</p>
                        </div>
                        <div className="flex justify-between items-center pt-2 border-t border-slate-50">
                          <button onClick={() => alert(`${art.title}\n\n${art.content}`)} className="text-xs font-bold text-blue-900 hover:underline flex items-center gap-0.5 cursor-pointer">
                            Baca Detail <ChevronRight className="w-3.5 h-3.5" />
                          </button>
                          {art.externalUrl && (
                            <a 
                              href={art.externalUrl.startsWith('http') ? art.externalUrl : `https://${art.externalUrl}`} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-xs text-yellow-600 hover:underline font-bold flex items-center gap-0.5"
                            >
                              Link <ExternalLink className="w-3 h-3" />
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 4. DYNAMIC GALERI HIGHLIGHTS ON HOMEPAGE */}
            {galleryItems.some(g => g.showOnBeranda) && (
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
                <div className="flex justify-between items-end">
                  <div>
                    <span className="text-xs uppercase tracking-widest text-[#dca415] font-black">DOKUMENTASI KOPERASI</span>
                    <h2 className="text-2xl font-extrabold text-[#0c4a80] leading-tight">Galeri Foto Beranda</h2>
                  </div>
                  <button onClick={() => setActiveTab('galeri')} className="text-xs font-bold text-blue-950 hover:underline flex items-center gap-1 cursor-pointer">
                    Lihat Semua Galeri <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {galleryItems.filter(g => g.showOnBeranda).sort((a,b) => a.order - b.order).map((g) => (
                    <div key={g.id} className="bg-white border rounded-xl overflow-hidden group cursor-pointer hover:shadow-md transition">
                      <div className="h-32 overflow-hidden bg-slate-100 relative">
                        <img src={g.image} className="w-full h-full object-cover group-hover:scale-105 transition duration-305" alt={g.title} />
                      </div>
                      <div className="p-3">
                        <h4 className="text-[11px] font-black text-slate-800 line-clamp-1 block leading-none">{g.title}</h4>
                        {g.externalUrl && (
                          <a 
                            href={g.externalUrl.startsWith('http') ? g.externalUrl : `https://${g.externalUrl}`} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-[10px] text-yellow-600 font-bold hover:underline inline-flex items-center gap-0.5 mt-1 cursor-pointer"
                          >
                            Tautan URL <ExternalLink className="w-3 h-3" />
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 5. DYNAMIC SWALAYAN CATALOG TEASER */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
              <div className="flex justify-between items-end">
                <div>
                  <span className="text-xs uppercase tracking-widest text-[#dca415] font-black">BELANJA ONLINE ANGGOTA</span>
                  <h2 className="text-2xl font-extrabold text-[#0c4a80] leading-tight">Katalog Produk Swalayan Koperasi</h2>
                </div>
                <button 
                  onClick={() => { setActiveTab('layanan'); setSelectedCategory('Semua'); }}
                  className="text-xs font-bold text-blue-900 hover:underline flex items-center gap-1 cursor-pointer"
                >
                  Lihat Katalog Lengkap <ChevronRight className="w-4.5 h-4.5" />
                </button>
              </div>

              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {(products.filter(p => p.showOnBeranda !== false).length > 0
                  ? products.filter(p => p.showOnBeranda !== false).sort((a,b) => (a.order || 0) - (b.order || 0))
                  : products
                ).slice(0, 4).map((p) => (
                  <div key={p.id} className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs flex flex-col justify-between p-3.5 hover:shadow-md transition">
                    <div className="relative h-32 bg-slate-100 rounded-lg overflow-hidden mb-3">
                      <img src={p.image} className="w-full h-full object-cover" alt={p.nama} />
                      <span className="absolute top-1.5 left-1.5 text-[8.5px] font-bold px-2 py-0.5 bg-[#dca415]/95 text-slate-950 rounded-full">
                        {p.kategori}
                      </span>
                    </div>
                    <div>
                      <h3 className="text-xs font-bold text-slate-900 line-clamp-1">{p.nama}</h3>
                      <p className="text-[10px] text-slate-500 mt-0.5 line-clamp-2 leading-relaxed">{p.deskripsi}</p>
                      <p className="text-sm font-black text-blue-900 mt-2">
                        {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(p.harga)}
                      </p>
                    </div>
                    <div className="flex flex-col gap-2 mt-3">
                      <button
                        onClick={() => addToCart(p)}
                        className="w-full py-1.5 bg-slate-900 text-white font-bold rounded-md hover:bg-blue-900 transition-all text-[11px] leading-none active:scale-95 cursor-pointer animate-fade-in"
                      >
                        + Keranjang
                      </button>
                      {p.externalUrl && (
                        <a 
                          href={p.externalUrl.startsWith('http') ? p.externalUrl : `https://${p.externalUrl}`} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="w-full py-1 border border-slate-305 text-center text-slate-700 hover:bg-slate-50 font-bold rounded text-[10px] leading-normal flex items-center justify-center gap-1 cursor-pointer"
                        >
                          Buka Link <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

        {/* ================= TENTANG KAMI SECTION ================= */}
        {activeTab === 'tentang' && (
          <div className="max-w-5xl mx-auto px-4 py-12 space-y-12 animate-fade-in">
            {/* Page Header */}
            <div className="text-center space-y-2">
              <span className="text-xs uppercase tracking-widest text-[#dca415] font-black">TENTANG KAMI</span>
              <h2 className="text-2xl sm:text-3xl font-black text-blue-950">PROFIL & STRUKTUR ORGANISASI IPPI JATIM</h2>
              <div className="h-1 w-20 bg-yellow-500 mx-auto rounded-full mt-2"></div>
            </div>

            {/* DYNAMIC SECTIONS LOADED FROM CMS ADMIN */}
            <div className="space-y-8">
              {tentangItems
                .sort((a,b) => a.order - b.order)
                .map((item) => (
                  <div key={item.id} className="bg-white rounded-xl border border-slate-200 p-6 md:p-8 shadow-xs flex flex-col md:flex-row gap-6 items-center">
                    <div className="w-full md:w-1/3 h-44 bg-slate-100 rounded-xl overflow-hidden shrink-0 shadow-sm border border-slate-100">
                      <img src={item.image} className="w-full h-full object-cover" alt={item.title} />
                    </div>
                    <div className="space-y-4 flex-1">
                      <div className="inline-flex items-center gap-1.5 text-[#dca415] font-black uppercase text-xs">
                        <Bookmark className="w-4 h-4" />
                        <span>{item.title}</span>
                      </div>
                      <h3 className="text-lg font-extrabold text-blue-950 leading-tight uppercase font-sans">{item.title} KOPERASI</h3>
                      <p className="text-slate-600 text-xs sm:text-sm leading-relaxed whitespace-pre-line font-medium">
                        {item.content}
                      </p>
                      {item.externalUrl && (
                        <div className="pt-2">
                          <a 
                            href={item.externalUrl.startsWith('http') ? item.externalUrl : `https://${item.externalUrl}`}
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 px-3 py-2 bg-slate-900 hover:bg-black text-[#ffffff] text-xs font-bold rounded-lg cursor-pointer transition"
                          >
                            Buka Tautan Lebih Lanjut <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
            </div>

            {/* LEGALITAS / BADAN HUKUM */}
            <div className="bg-slate-900 text-white rounded-xl p-6 flex flex-col sm:flex-row justify-between items-center gap-4 shadow-md border-b-4 border-yellow-500">
              <div className="space-y-1">
                <h4 className="text-sm font-black text-yellow-400">LEGALITAS & BADAN HUKUM RESMI</h4>
                <p className="text-xs text-slate-300">Koperasi Jasa KSU IPPI DPW Jatim telah terdaftar resmi di Kementerian Koperasi & UKM RI.</p>
                <p className="text-[10px] font-mono text-slate-400">NO. IZIN PENDIRIAN : {settings.noIjinPendirian}</p>
              </div>
              <button 
                onClick={() => alert(`Sertifikat Legalitas Koperasi: ${settings.noIjinPendirian}\nDPW Jatim terverifikasi legal sejak Maret 2024.`)}
                className="px-4 py-2 bg-[#dca415] hover:bg-yellow-600 text-slate-950 font-bold rounded-lg text-xs cursor-pointer"
              >
                Lihat Berkas Ahli
              </button>
            </div>
          </div>
        )}

        {/* ================= LAYANAN SECTION ================= */}
        {activeTab === 'layanan' && (
          <div className="max-w-7xl mx-auto px-4 py-12 space-y-16 animate-fade-in">
            {/* SERVICES BANNER */}
            <div className="text-center space-y-2 max-w-2xl mx-auto">
              <span className="text-xs uppercase tracking-widest text-[#dca415] font-black">UNIT USAHA KSU</span>
              <h2 className="text-2xl sm:text-3xl font-black text-blue-950">CORE BUSINESS KOPERASI IPPI DPW JATIM</h2>
              <p className="text-slate-500 text-xs sm:text-sm">
                Empat pilar layanan ekonomi bersama yang kokoh untuk menjamin kemudahan pembiayaan, logistik, belanja pangan, dan jasa umum keanggotaan.
              </p>
            </div>            {/* DYNAMIC UNIT USAHA GENERATOR FROM ADMIN PANEL */}
            <div className="space-y-16">
              {layananItems
                .sort((a,b) => a.order - b.order)
                .map((item) => {
                  const isSimpanPinjam = item.title.toLowerCase().includes('simpan') || item.title.toLowerCase().includes('pinjam') || item.id === 'layanan-1';
                  const isSwalayan = item.title.toLowerCase().includes('swalayan_not_used') || item.title.toLowerCase().includes('swalayan') || item.title.toLowerCase().includes('toko') || item.id === 'layanan-2';
                  const isLogistik = item.title.toLowerCase().includes('logistik') || item.title.toLowerCase().includes('kargo') || item.id === 'layanan-3';
                  const isPPOB = item.title.toLowerCase().includes('ppob') || item.title.toLowerCase().includes('lainnya') || item.id === 'layanan-4';

                  return (
                    <div key={item.id} className="space-y-6">
                      {/* Layanan Card Details */}
                      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center bg-white p-6 sm:p-8 rounded-2xl border border-slate-200">
                        <div className="lg:col-span-5 space-y-4">
                          <span className="p-2 bg-blue-105 text-blue-905 rounded-lg inline-block text-xs font-black font-mono">
                            {item.badge || "UNIT USAHA"}
                          </span>
                          <h3 className="text-xl font-bold text-slate-900 uppercase">{item.title}</h3>
                          <p className="text-slate-600 text-xs sm:text-sm leading-relaxed whitespace-pre-line">
                            {item.content}
                          </p>
                          <div className="flex flex-wrap gap-2 pt-2">
                            {isSimpanPinjam && (
                              <button
                                onClick={() => {
                                  if (activeMember) {
                                    alert("Silakan arahkan ke Portal Anggota untuk melakukan pengajuan pinjaman online secara real-time.");
                                  } else {
                                    alert("Layanan Simpan Pinjam online memerlukan login anggota terdaftar.");
                                    onOpenAuth('login');
                                  }
                                }}
                                className="px-4 py-2 bg-blue-900 hover:bg-blue-950 text-white font-bold text-xs rounded-lg cursor-pointer"
                              >
                                Ajukan Pinjaman Online
                              </button>
                            )}
                            {item.externalUrl && (
                              <a
                                href={item.externalUrl.startsWith('http') ? item.externalUrl : `https://${item.externalUrl}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-slate-950 font-bold text-xs rounded-lg inline-flex items-center gap-1 cursor-pointer"
                              >
                                Buka Tautan Unit <ExternalLink className="w-3.5 h-3.5" />
                              </a>
                            )}
                          </div>
                        </div>

                        {/* Interactive UI blocks or Image preview depending on type */}
                        <div className="lg:col-span-7 w-full">
                          {isSimpanPinjam ? (
                            <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 space-y-4">
                              <h4 className="text-sm font-black text-slate-900 uppercase flex items-center gap-1.5">
                                <ChevronRight className="w-5 h-5 text-[#dca415]" /> Simulasi Kredit & Angsuran ({item.title})
                              </h4>
                              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                <div>
                                  <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">Jumlah Pinjaman</label>
                                  <select id="sim-amount" className="w-full text-xs font-mono p-2 border border-slate-300 rounded-lg bg-white outline-none">
                                    <option value="2000000">Rp 2.000.000</option>
                                    <option value="5000000">Rp 5.000.000</option>
                                    <option value="10000000">Rp 10.000.000</option>
                                    <option value="15000000">Rp 15.000.000</option>
                                  </select>
                                </div>
                                <div>
                                  <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">Tenor (Bulan)</label>
                                  <select id="sim-tenor" className="w-full text-xs font-mono p-2 border border-slate-300 rounded-lg bg-white outline-none">
                                    <option value="6">6 Bulan (Bunga 1.2%)</option>
                                    <option value="12">12 Bulan (Bunga 1.0%)</option>
                                    <option value="24">24 Bulan (Bunga 0.8%)</option>
                                  </select>
                                </div>
                                <div className="flex items-end">
                                  <button
                                    onClick={() => {
                                      const amt = parseFloat((document.getElementById('sim-amount') as HTMLSelectElement).value);
                                      const ten = parseFloat((document.getElementById('sim-tenor') as HTMLSelectElement).value);
                                      const rate = ten === 6 ? 1.2 : ten === 12 ? 1.0 : 0.8;
                                      const interest = amt * (rate/100) * ten;
                                      const total = amt + interest;
                                      const install = total / ten;
                                      alert(
                                        `--- HASIL SIMULASI ANGSURAN ---\n` +
                                        `Nilai Pengajuan : Rp ${new Intl.NumberFormat('id-ID').format(amt)}\n` +
                                        `Tenor Waktu: ${ten} Bulan\n` +
                                        `Bunga Bulanan: ${rate}%\n` +
                                        `Total Estimasi Bunga: Rp ${new Intl.NumberFormat('id-ID').format(interest)}\n` +
                                        `Total Pengembalian: Rp ${new Intl.NumberFormat('id-ID').format(total)}\n` +
                                        `Angsuran per Bulan: Rp ${new Intl.NumberFormat('id-ID').format(Math.round(install))}\n\n` +
                                        `*Ajukan langsung melalui portal setelah Anda ter-approve login.`
                                      );
                                    }}
                                    className="w-full py-2 bg-[#dca415] hover:bg-yellow-600 text-slate-950 font-black rounded-lg text-xs cursor-pointer"
                                  >
                                    Hitung Simulasi
                                  </button>
                                </div>
                              </div>
                            </div>
                          ) : isLogistik ? (
                            <div className="bg-slate-900 text-white p-6 rounded-xl border border-slate-700 space-y-4">
                              <h4 className="text-xs uppercase tracking-wider text-yellow-400 font-extrabold">Informasi Penjemputan Logistik</h4>
                              <p className="text-[11px] text-slate-300 leading-relaxed">
                                Nikmati diskon kiriman s/d 15% untuk paket pos domestik. Penjemputan gratis se-Surabaya & Sidoarjo. Hubungi Sekretariat Koperasi di nomor {settings.noTelpWA} untuk registrasi kurir logistik.
                              </p>
                              <button
                                onClick={() => alert(`Tarif Khusus Jasa Logistik IPPI Jatim:\nSurabaya -> Jakarta p/Kg : Rp 12.000\nSurabaya -> Malang p/Kg : Rp 7.500\n\nHubungi WA di ${settings.noTelpWA}`)}
                                className="px-4 py-1.5 bg-yellow-500 hover:bg-yellow-600 text-slate-950 text-[10px] font-black rounded cursor-pointer"
                              >
                                Cek Tarif Ekspedisi
                              </button>
                            </div>
                          ) : isPPOB ? (
                            <div className="grid grid-cols-2 gap-2 text-center col-span-12">
                              {[
                                { t: "Token Listrik PLN", d: "Isi pulsa PLN murah bebas biaya admin berlebih." },
                                { t: "Pulsa Prabayar", d: "Dukung semua provider nasional." },
                                { t: "BPJS Kesehatan", d: "Pembayaran kolektif pensiunan." },
                                { t: "PDAM Regional Jatim", d: "Instan cair dari saldo anggota." }
                              ].map((x, i) => (
                                <div key={i} className="p-2.5 bg-slate-50 border rounded-lg text-left">
                                  <h5 className="text-[11.5px] font-extrabold text-slate-800 leading-none">{x.t}</h5>
                                  <p className="text-[9px] text-slate-400 mt-1">{x.d}</p>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="rounded-xl overflow-hidden shadow-sm h-48 sm:h-52 border border-slate-105 bg-slate-100">
                              <img src={item.image} className="w-full h-full object-cover" alt={item.title} />
                            </div>
                          )}
                        </div>
                      </div>

                      {/* SWALAYAN SHOPPING MODULE INTEGRATION */}
                      {isSwalayan && (
                        <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 mt-4 space-y-6">
                          <div className="flex flex-col sm:flex-row justify-between gap-3 items-center">
                            <span className="text-xs font-black text-[#0c4a80] uppercase tracking-wide font-sans">Katalog Belanja Swalayan & Toko</span>
                            <div className="flex flex-col sm:flex-row justify-between gap-3 w-full sm:w-auto">
                              <div className="flex flex-wrap gap-1">
                                {['Semua', 'Sembako', 'Elektronik', 'Kesehatan', 'Pakaian'].map((cat) => (
                                  <button
                                    key={cat}
                                    onClick={() => setSelectedCategory(cat)}
                                    className={`px-2.5 py-0.5 text-[10px] font-bold rounded-full transition-all border ${
                                      selectedCategory === cat 
                                        ? 'bg-blue-900 border-blue-900 text-white' 
                                        : 'bg-white border-slate-350 text-slate-600 hover:bg-slate-100'
                                    }`}
                                  >
                                    {cat}
                                  </button>
                                ))}
                              </div>
                              <div className="relative">
                                <span className="absolute inset-y-0 left-0 flex items-center pl-2.5 text-slate-400 font-mono">
                                  <Search className="w-3.5 h-3.5" />
                                </span>
                                <input
                                  type="text"
                                  placeholder="Cari..."
                                  value={searchTerm}
                                  onChange={(e) => setSearchTerm(e.target.value)}
                                  className="pl-8 pr-3 py-1 w-full sm:w-44 text-xs border border-slate-300 bg-white rounded outline-none focus:border-blue-900 focus:ring-1 focus:ring-blue-900"
                                />
                              </div>
                            </div>
                          </div>

                          {/* Dynamic product collection filtered inside Swalayan */}
                          {products.filter(p => {
                            const matchCat = selectedCategory === 'Semua' || p.kategori.toLowerCase() === selectedCategory.toLowerCase();
                            const matchSearch = p.nama.toLowerCase().includes(searchTerm.toLowerCase());
                            return matchCat && matchSearch;
                          }).length === 0 ? (
                            <div className="text-center py-8 bg-white border rounded shadow-xs text-xs text-slate-400">
                              Barang sembako belum ditemukan.
                            </div>
                          ) : (
                            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 col-span-12">
                              {products.filter(p => {
                                const matchCat = selectedCategory === 'Semua' || p.kategori.toLowerCase() === selectedCategory.toLowerCase();
                                const matchSearch = p.nama.toLowerCase().includes(searchTerm.toLowerCase());
                                return matchCat && matchSearch;
                              }).map((p) => (
                                <div key={p.id} className="bg-white border border-slate-205 rounded-xl overflow-hidden p-3 flex flex-col justify-between hover:shadow shadow-xs">
                                  <div className="h-28 bg-slate-50 relative rounded-lg overflow-hidden mb-2">
                                    <img src={p.image} className="w-full h-full object-cover" alt={p.nama} />
                                    <span className="absolute top-1 left-1 px-1.5 py-0.5 bg-yellow-500 text-slate-950 text-[7px] font-black uppercase rounded">
                                      {p.kategori}
                                    </span>
                                  </div>
                                  <div>
                                    <h4 className="text-[11px] font-bold text-slate-900 line-clamp-1 leading-none">{p.nama}</h4>
                                    <p className="text-[9.5px] text-slate-400 mt-1 line-clamp-2 leading-tight">{p.deskripsi}</p>
                                    <p className="text-[11px] font-black text-blue-905 mt-1.5">
                                      {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(p.harga)}
                                    </p>
                                  </div>
                                  <button
                                    onClick={() => addToCart(p)}
                                    className="mt-3 w-full py-1 bg-slate-900 border border-transparent text-white font-extrabold text-[10px] uppercase rounded hover:bg-blue-900 active:scale-95 transition cursor-pointer"
                                  >
                                    + Keranjang
                                  </button>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
              );
            })}
          </div>
        </div>
      )}

        {/* ================= BERITA SECTION ================= */}
        {activeTab === 'berita' && (
          <div className="max-w-5xl mx-auto px-4 py-12 space-y-12 animate-fade-in">
            {/* Page Header */}
            <div className="text-center space-y-2">
              <span className="text-xs uppercase tracking-widest text-[#dca415] font-black">BULLETIN & KEGIATAN</span>
              <h2 className="text-2xl sm:text-3xl font-black text-blue-950">BERITA TERBARU & PENGUMUMAN KOPERASI</h2>
              <div className="h-1 w-20 bg-yellow-500 mx-auto rounded-full mt-2"></div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* NEWS ARTICLES */}
              <div className="lg:col-span-8 space-y-6">
                <h3 className="text-sm font-black uppercase text-slate-500 tracking-wider border-b border-slate-200 pb-2">Artikel & Tips</h3>
                {articles.map((art) => (
                  <article key={art.id} className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs flex flex-col sm:flex-row gap-4 p-4 hover:shadow-md transition">
                    <div className="w-full sm:w-44 h-36 bg-slate-100 rounded-lg overflow-hidden flex-shrink-0">
                      <img 
                        src={art.image || "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&q=80&w=200"} 
                        className="w-full h-full object-cover" 
                        alt={art.title} 
                      />
                    </div>
                    <div className="flex flex-col justify-between space-y-2">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-[9.5px] font-mono text-[#dca415] font-black uppercase">
                          <span>{art.category}</span>
                          <span>|</span>
                          <span>{art.date}</span>
                        </div>
                        <h4 className="text-sm font-bold text-[#0c4a80] hover:underline cursor-pointer" onClick={() => alert(`${art.title}\n\n${art.content}`)}>
                          {art.title}
                        </h4>
                        <p className="text-xs text-slate-500 leading-relaxed font-sans">{art.summary}</p>
                      </div>
                      <button
                        onClick={() => alert(`${art.title}\n\n${art.content}`)}
                        className="text-xs font-bold text-blue-900 hover:text-blue-950 self-start flex items-center gap-1 cursor-pointer"
                      >
                        Baca Selengkapnya <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </article>
                ))}
              </div>

              {/* ANNOUNCEMENT BOARD */}
              <div className="lg:col-span-4 space-y-4">
                <h3 className="text-sm font-black uppercase text-slate-500 tracking-wider border-b border-slate-200 pb-2">Pengumuman Resmi</h3>
                {announcements.map((ann) => (
                  <div key={ann.id} className={`p-4 rounded-xl border shadow-xs space-y-2 ${ann.important ? 'bg-amber-50/70 border-amber-200' : 'bg-white border-slate-200'}`}>
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono text-slate-400">{ann.date}</span>
                      {ann.important && (
                        <span className="px-2 py-0.5 bg-red-100 text-red-700 font-extrabold text-[8px] uppercase rounded-full">PENTING</span>
                      )}
                    </div>
                    <h4 className="text-xs font-black text-slate-900 leading-snug">{ann.title}</h4>
                    <p className="text-[11px] text-slate-600 leading-snug">{ann.content}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ================= GALERI SECTION ================= */}
        {activeTab === 'galeri' && (
          <div className="max-w-6xl mx-auto px-4 py-12 space-y-8 animate-fade-in">
            {/* Page Header */}
            <div className="text-center space-y-2">
              <span className="text-xs uppercase tracking-widest text-[#dca415] font-black">GALERI & DOKUMENTASI</span>
              <h2 className="text-2xl sm:text-3xl font-black text-blue-950">AKTIVITAS & KEGIATAN KSU IPPI JATIM</h2>
              <div className="h-1 w-20 bg-yellow-500 mx-auto rounded-full mt-2"></div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {galleryItems
                .sort((a, b) => a.order - b.order)
                .map((g) => (
                  <div 
                    key={g.id} 
                    onClick={() => {
                      if (g.externalUrl) {
                        window.open(g.externalUrl.startsWith('http') ? g.externalUrl : `https://${g.externalUrl}`, '_blank');
                      } else {
                        alert(`${g.title}\n\n${g.description || ''}`);
                      }
                    }}
                    className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs group cursor-pointer hover:shadow-md transition"
                  >
                    <div className="h-48 overflow-hidden bg-slate-100 relative">
                      <img src={g.image} className="w-full h-full object-cover group-hover:scale-105 transition-all duration-300" alt={g.title} />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all flex items-end p-3">
                        <span className="text-[10px] text-white font-mono uppercase tracking-widest bg-yellow-500/80 px-2.5 py-0.5 rounded-full font-bold">
                          {g.externalUrl ? "Buka Link" : "Detail"}
                        </span>
                      </div>
                    </div>
                    <div className="p-4 space-y-1">
                      <h4 className="text-xs font-black text-slate-800 uppercase leading-none">{g.title}</h4>
                      <p className="text-[10px] text-slate-500 font-medium leading-normal">{g.description}</p>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* ================= KONTAK SECTION ================= */}
        {activeTab === 'kontak' && (
          <div className="max-w-6xl mx-auto px-4 py-12 space-y-12 animate-fade-in">
            {/* Page Header */}
            <div className="text-center space-y-2">
              <span className="text-xs uppercase tracking-widest text-[#dca415] font-black">HUBUNGI KAMI</span>
              <h2 className="text-2xl sm:text-3xl font-black text-blue-950">ALAMAT SEKRETARIAT & LAYANAN INFORMASI</h2>
              <div className="h-1 w-20 bg-yellow-500 mx-auto rounded-full mt-2"></div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* CONTACT FORM */}
              <div className="lg:col-span-7 bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-xs space-y-6">
                <h3 className="text-sm font-black text-slate-900 uppercase">Kirim Pesan Ke Pengurus</h3>
                
                {contactSuccess ? (
                  <div className="p-4 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-lg text-xs leading-relaxed font-bold">
                    Pesan Anda berhasil dikirim! Pengurus Koperasi IPPI DPW Jatim akan segera menghubungi email/nomor telfon Anda. Terima kasih.
                  </div>
                ) : (
                  <form onSubmit={handleSubmitContact} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 mb-1 uppercase">Nama Anda</label>
                        <input
                          type="text"
                          required
                          value={contactForm.nama}
                          onChange={(e) => setContactForm({ ...contactForm, nama: e.target.value })}
                          className="w-full text-xs p-2.5 border border-slate-300 rounded-lg bg-white outline-none focus:border-blue-900"
                          placeholder="Masukkan nama Anda"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 mb-1 uppercase">Alamat Email / No Handphone</label>
                        <input
                          type="text"
                          required
                          value={contactForm.email}
                          onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                          className="w-full text-xs p-2.5 border border-slate-300 rounded-lg bg-white outline-none focus:border-blue-900"
                          placeholder="Contoh: 08123xxx / email@coop.com"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 mb-1 uppercase">Isi Pesan / Pertanyaan</label>
                      <textarea
                        required
                        rows={4}
                        value={contactForm.pesan}
                        onChange={(e) => setContactForm({ ...contactForm, pesan: e.target.value })}
                        className="w-full text-xs p-2.5 border border-slate-300 rounded-lg bg-white outline-none focus:border-blue-900"
                        placeholder="Tulis pesan lengkap..."
                      />
                    </div>
                    <button
                      type="submit"
                      className="px-6 py-2.5 bg-blue-900 hover:bg-blue-950 text-white font-bold rounded-lg text-xs tracking-wider uppercase transition cursor-pointer"
                    >
                      Kirim Pesan
                    </button>
                  </form>
                )}
              </div>

              {/* COOP META DATA */}
              <div className="lg:col-span-5 bg-slate-900 text-white p-6 sm:p-8 rounded-2xl border-l-4 border-[#dca415] space-y-6">
                <h3 className="text-sm font-black text-yellow-400 uppercase tracking-widest">Informasi Kantor Pusat</h3>
                
                <div className="space-y-4 text-xs">
                  <div className="flex gap-3 items-start">
                    <MapPin className="w-5 h-5 text-[#dca415] flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold">Sekretariat Utama Jatim</p>
                      <p className="text-slate-300 leading-relaxed mt-1">
                        {settings.alamatSecretariat || settings.alamatSekretariat}
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-3 items-start">
                    <Phone className="w-5 h-5 text-[#dca415] flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold">WhatsApp Hotline & CS</p>
                      <p className="text-slate-300 leading-relaxed mt-1">
                        {settings.noTelpWA} (Drs. Mohammad Anshori, M.Si.)
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-3 items-start">
                    <Clock className="w-5 h-5 text-[#dca415] flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold">Jam Operasional Pelayanan</p>
                      <p className="text-slate-300 leading-relaxed mt-1">
                        Senin s/d Jumat : 08:00 - 15:00 WIB<br />
                        Sabtu, Minggu & Hari Libur Nasional : Libur
                      </p>
                    </div>
                  </div>
                </div>

                <div className="border-t border-slate-800 pt-6">
                  <button 
                    onClick={openWAToSecretary}
                    className="w-full flex items-center justify-center gap-2 py-3 bg-emerald-600 hover:bg-emerald-700 font-extrabold text-[#ffffff] rounded-lg tracking-wider text-xs uppercase shadow-lg transition active:scale-95 cursor-pointer"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="w-4 h-4" viewBox="0 0 16 16">
                      <path d="M13.601 2.326A7.85 7.85 0 0 0 7.994 0C3.627 0 .068 3.558.064 7.926c0 1.399.366 2.76 1.057 3.965L0 16l4.204-1.102a7.9 7.9 0 0 0 3.79.949h.004c4.368 0 7.927-3.558 7.93-7.93a7.9 7.9 0 0 0-2.327-5.594ZM7.995 14.52a6.57 6.57 0 0 1-3.356-.92l-.24-.144-2.494.654.666-2.433-.156-.251a6.56 6.56 0 0 1-1.007-3.505c0-3.626 2.957-6.584 6.591-6.584a6.56 6.56 0 0 1 4.66 1.931 6.56 6.56 0 0 1 1.928 4.66c-.004 3.639-2.961 6.592-6.592 6.592"/>
                    </svg>
                    Hubungi via WhatsApp
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

      </main>

      {/* 3. COOPERATIVE PUBLIC FOOTER */}
      <footer className="bg-slate-900 text-slate-400 text-xs py-10 border-t-4 border-[#dca415]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 bg-white rounded-full p-1 flex items-center justify-center">
                <img src={settings.logo} className="h-full w-full object-contain" alt="Logo Footer" />
              </div>
              <span className="font-extrabold text-white text-sm">KSU IPPI JAWA TIMUR</span>
            </div>
            <p className="leading-relaxed text-[11px] text-slate-400">
              Membangun kemandirian ekonomi purnabakti logistik IPPI terintegrasi se-Provinsi Jawa Timur. Dedikasi tiada henti untuk hari tua bermartabat.
            </p>
          </div>

          <div className="space-y-2">
            <h4 className="font-bold text-white uppercase tracking-wider text-xs">Layanan Anggota</h4>
            <ul className="space-y-1 text-[11px]">
              <li><button onClick={() => onOpenAuth('login')} className="hover:text-white transition">Portal Member Area</button></li>
              <li><button onClick={() => { setActiveTab('layanan'); }} className="hover:text-white transition">Simulasi Pinjaman</button></li>
              <li><button onClick={() => onOpenAuth('register')} className="hover:text-white transition">Pendaftaran Online</button></li>
              <li><button onClick={() => setActiveTab('layanan')} className="hover:text-white transition">Katalog Produk Sembako</button></li>
            </ul>
          </div>

          <div className="space-y-2">
            <h4 className="font-bold text-white uppercase tracking-wider text-xs">Kebijakan & Regulasi</h4>
            <ul className="space-y-1 text-[11px]">
              <li><button onClick={() => alert("FAQ Pertanyaan Umum:\n1. Siapa yang boleh mendaftar?\nSeluruh pensiunan PT Pos / veteran logistik Jatim.\n2. Berapa iuran bulanan?\nIuran Pokok Rp 500.000 (sekali) & Wajib Rp 50.000/bulan.\nUntuk bantuan lain, silakan klik WhatsApp Floating button.")} className="hover:text-white transition">FAQ - Pertanyaan Umum</button></li>
              <li><button onClick={() => alert("Syarat & Ketentuan Keanggotaan:\n1. Anggota wajib mengisi formulir pendaftaran secara detail & mengupload pas-foto resmi.\n2. Login memerlukan persetujuan Sekretaris DPW Jatim.\n3. Saldo simpanan wajib ditarik sepenuhnya saat keluar keanggotaan.")} className="hover:text-white transition">Syarat & Ketentuan</button></li>
              <li><button onClick={() => alert("Kebijakan Privasi Anggota:\nKoperasi menjamin 100% data pribadi, pas foto, nomor handphone, nomor rekening, dan riwayat transaksi finansial Anda disimpan terenkripsi di database internal dan tidak disebarluaskan.")} className="hover:text-white transition">Kebijakan Privasi</button></li>
            </ul>
          </div>

          <div className="space-y-3">
            <h4 className="font-bold text-white uppercase tracking-wider text-xs">Aksesibilitas</h4>
            <p className="text-[11px] leading-relaxed text-slate-400">No Ijin Pendirian Kementerian Koperasi RI: {settings.noIjinPendirian}</p>
            <p className="text-[10px] text-yellow-400 font-mono">Bekerjasama dengan PT Pos Jatim & Bank Jatim</p>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-t border-slate-800 mt-8 pt-6 flex flex-col sm:flex-row justify-between items-center text-[10px] text-slate-500">
          <p>© 2026 Koperasi Jasa KSU IPPI DPW Jawa Timur. All Rights Reserved.</p>
          <div className="flex gap-4 mt-2 sm:mt-0">
            <span>Server: CLOUD-RUN IDR</span>
            <span>Local Time: UTC+7</span>
          </div>
        </div>
      </footer>

      {/* ================= GUEST CART MODAL OVERLAY ================= */}
      {showCartModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full flex flex-col max-h-[85vh]">
            <div className="bg-slate-900 text-white p-4 flex justify-between items-center border-b border-yellow-500">
              <h3 className="font-black text-xs uppercase tracking-wider flex items-center gap-2">
                <ShoppingCart className="w-4 h-4 text-yellow-400" /> Keranjang Belanja Anda
              </h3>
              <button onClick={() => setShowCartModal(false)} className="text-slate-400 hover:text-white cursor-pointer">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="p-6 overflow-y-auto flex-1 space-y-4">
              {checkoutSuccess && (
                <div className="p-4 bg-green-50 text-green-800 border border-green-200 rounded-lg text-xs leading-relaxed font-bold">
                  {checkoutSuccess}
                </div>
              )}

              {guestCart.length === 0 ? (
                <p className="text-center py-6 text-slate-400 text-xs">Keranjang belanja kosong. Silakan tambah barang kebutuhan harian Anda.</p>
              ) : (
                <div className="space-y-4">
                  <div className="divide-y divide-slate-100 max-h-56 overflow-y-auto pr-1">
                    {guestCart.map((item) => (
                      <div key={item.product.id} className="py-2.5 flex justify-between items-center gap-3">
                        <div className="flex items-center gap-3">
                          <img src={item.product.image} className="w-10 h-10 object-cover rounded" alt="Item cart" />
                          <div>
                            <h4 className="text-xs font-bold text-slate-800 line-clamp-1">{item.product.nama}</h4>
                            <p className="text-[10px] text-[#0c4a80] font-mono">
                              {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(item.product.harga)}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <button 
                            onClick={() => updateCartQty(item.product.id, -1)}
                            className="w-5 h-5 flex items-center justify-center bg-slate-100 text-slate-800 hover:bg-slate-200 rounded text-xs cursor-pointer font-bold"
                          >
                            -
                          </button>
                          <span className="text-xs font-bold w-4 text-center">{item.quantity}</span>
                          <button 
                            onClick={() => updateCartQty(item.product.id, 1)}
                            className="w-5 h-5 flex items-center justify-center bg-slate-100 text-slate-800 hover:bg-slate-200 rounded text-xs cursor-pointer font-bold"
                          >
                            +
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  <hr className="border-slate-100" />

                  {/* Summary */}
                  <div className="flex justify-between items-center text-sm font-black text-slate-900 bg-slate-50 p-3 rounded-lg border border-slate-200">
                    <span>TOTAL NOMINAL :</span>
                    <span className="text-blue-900">
                      {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(getSubtotal())}
                    </span>
                  </div>

                  {/* Checkout Form */}
                  <form onSubmit={handleCheckout} className="space-y-3 pt-2">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 mb-1 uppercase">Metode Pembayaran</label>
                      <select 
                        value={paymentMethod}
                        onChange={(e) => setPaymentMethod(e.target.value as 'sukarela' | 'pos_cash')}
                        className="w-full text-xs p-2 bg-white border border-slate-300 rounded-lg"
                      >
                        <option value="pos_cash">Bayar Tunai di Kantor Swalayan / Kasir POS</option>
                        {activeMember && (
                          <option value="sukarela">Debet Otomatis Saldo Sukarela Koperasi ({new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(activeMember.saldoSukarela)})</option>
                        )}
                      </select>
                    </div>

                    <button
                      type="submit"
                      className="w-full py-2.5 bg-blue-900 hover:bg-blue-950 text-white font-extrabold rounded-lg text-xs tracking-wider uppercase shadow transition active:scale-95 cursor-pointer"
                    >
                      Bayar & Selesaikan Pembelian
                    </button>
                  </form>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 4. OFFICIAL FLOATING WHATSAPP BUTTON */}
      <div className="fixed bottom-6 right-6 z-40 group flex flex-col items-end">
        <div className="bg-slate-950 text-white text-[10px] py-1.5 px-3 rounded-lg shadow-md mb-2 opacity-0 group-hover:opacity-100 transition-all font-bold tracking-wide leading-tight border border-yellow-500 pointer-events-none max-w-[200px] text-center">
          Persetujuan Login? Hubungi Sekretaris IPPI DPW Jatim
        </div>
        <button
          onClick={openWAToSecretary}
          className="w-14 h-14 bg-emerald-600 hover:bg-emerald-700 hover:scale-105 active:scale-95 text-white rounded-full flex items-center justify-center shadow-xl transition-all border-2 border-white cursor-pointer relative"
          title="Hubungi Sekretaris IPPI setempat untuk mendapatkan persetujuan login"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" fill="currentColor" className="w-7 h-7" viewBox="0 0 16 16">
            <path d="M13.601 2.326A7.85 7.85 0 0 0 7.994 0C3.627 0 .068 3.558.064 7.926c0 1.399.366 2.76 1.057 3.965L0 16l4.204-1.102a7.9 7.9 0 0 0 3.79.949h.004c4.368 0 7.927-3.558 7.93-7.93a7.9 7.9 0 0 0-2.327-5.594ZM7.995 14.52a6.57 6.57 0 0 1-3.356-.92l-.24-.144-2.494.654.666-2.433-.156-.251a6.56 6.56 0 0 1-1.007-3.505c0-3.626 2.957-6.584 6.591-6.584a6.56 6.56 0 0 1 4.66 1.931 6.56 6.56 0 0 1 1.928 4.66c-.004 3.639-2.961 6.592-6.592 6.592m3.615-4.934c-.197-.099-1.17-.578-1.353-.646-.182-.065-.315-.099-.445.099-.133.197-.513.646-.627.775-.114.133-.232.148-.43.05-.197-.1-.836-.308-1.592-.985-.59-.525-.985-1.175-1.103-1.372-.114-.198-.011-.304.088-.403.087-.088.197-.232.296-.346.1-.114.133-.198.198-.33.065-.134.034-.248-.015-.347-.05-.099-.445-1.076-.612-1.47-.16-.389-.323-.335-.445-.34-.114-.007-.247-.007-.38-.007a.73.73 0 0 0-.529.247c-.182.198-.691.677-.691 1.654s.71 1.916.81 2.049c.098.133 1.394 2.132 3.383 2.992.47.205.84.326 1.129.418.475.152.904.129 1.246.08.38-.058 1.171-.48 1.338-.943.164-.464.164-.86.114-.943-.049-.084-.182-.133-.38-.232"/>
          </svg>
          <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-yellow-500"></span>
          </span>
        </button>
      </div>

    </div>
  );
};
