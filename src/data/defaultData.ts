import { CooperativeSettings, Member, StoreProduct, Article, Announcement, Transaction, TentangItem, LayananItem, GalleryItem } from '../types';

export const DEFAULT_LOGO_SVG = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 500" width="100%" height="100%">
  <circle cx="250" cy="250" r="230" fill="none" stroke="%230c4a80" stroke-width="20"/>
  <circle cx="250" cy="250" r="215" fill="none" stroke="%231a5f97" stroke-width="2"/>
  <circle cx="250" cy="250" r="200" fill="%23ffffff"/>
  
  <path id="curve-top" d="M 60,250 A 190,190 0 0,1 440,250" fill="none"/>
  <path id="curve-bottom" d="M 440,250 A 190,190 0 0,1 60,250" fill="none"/>
  
  <text font-family="'Inter', 'Helvetica', 'Arial', sans-serif" font-weight="900" font-size="34" fill="%230c4a80" letter-spacing="1.5">
    <textPath href="%23curve-top" startOffset="50%" text-anchor="middle">KOPERASI IPPI</textPath>
  </text>
  
  <text font-family="'Inter', 'Helvetica', 'Arial', sans-serif" font-weight="800" font-size="34" fill="%230c4a80" letter-spacing="1">
    <textPath href="%23curve-bottom" startOffset="50%" text-anchor="middle">DPW JATIM</textPath>
  </text>
  
  <g id="people" fill="%231a5f97" stroke="%23ffffff" stroke-width="4">
    <!-- Left Person -->
    <circle cx="160" cy="180" r="35"/>
    <path d="M 100,280 C 100,225 150,225 160,225 C 170,225 220,225 220,280" />

    <!-- Right Person -->
    <circle cx="340" cy="180" r="35"/>
    <path d="M 280,280 C 280,225 330,225 340,225 C 350,225 400,225 400,280" />

    <!-- Center Person (Front) -->
    <circle cx="250" cy="150" r="45" fill="%230c4a80"/>
    <path d="M 165,300 C 165,220 220,210 250,210 C 280,210 335,220 335,300" fill="%230c4a80"/>
  </g>
  
  <!-- Yellow Book Wings -->
  <path d="M 250,370 C 190,320 120,320 75,325 C 115,350 185,410 250,425 C 315,410 385,350 425,325 C 380,320 310,320 250,370 Z" fill="%23dca415" stroke="%23ffffff" stroke-width="2"/>
</svg>`;

export const DEFAULT_SETTINGS: CooperativeSettings = {
  logo: DEFAULT_LOGO_SVG,
  namaSekretariat: "DPW Jawa Timur",
  alamatSekretariat: "Jl. Gayung Kebonsari No. 35, Ketintang, Gayungan, Kota Surabaya, Jawa Timur 60235",
  noIjinPendirian: "AHU-0008412.AH.01.26.TAHUN-2024",
  noTelpWA: "081803100222",
  email: "kopippidpwjatim@gmail.com"
};

export const DEFAULT_MEMBERS: Member[] = [
  {
    id: "admin-1",
    nama: "H. Sugeng Riyanto, M.M.",
    tempatLahir: "Surabaya",
    tanggalLahir: "1960-05-12",
    institusiPensiun: "Dinas Pendidikan Prov. Jatim",
    jenisKelamin: "Laki-Laki",
    agama: "Islam",
    pekerjaanKeahlian: "Manajemen, Koperasi Sekolah, Humas",
    noHp: "08123456789",
    email: "admin@koperasi-ippi.com",
    alamatLengkap: "Rungkut Menanggal Harapan VII C/12 Surabaya, Jawa Timur 60293",
    status: "approved",
    role: "admin",
    password: "admin",
    registeredAt: "2026-01-10T08:00:00Z",
    noAnggota: "999000001",
    noRekening: "9990000010",
    saldoPokok: 500000,
    saldoWajib: 1200000,
    saldoSukarela: 1500000,
    saldoPenyertaan: 5000000
  },
  {
    id: "sec-1",
    nama: "Drs. Mohammad Anshori, M.Si.",
    tempatLahir: "Sidoarjo",
    tanggalLahir: "1961-08-19",
    institusiPensiun: "PT Pos Indonesia (Persero)",
    jenisKelamin: "Laki-Laki",
    agama: "Islam",
    pekerjaanKeahlian: "Logistik, Kurir Ekspres, Pengembangan Ekosistem Bisnis",
    noHp: "081803100222",
    email: "sekretaris@koperasi-ippi.com",
    alamatLengkap: "Perumahan Jade Sidokare Asri Blok C-15, Sidoarjo 61214",
    status: "approved",
    role: "sekretaris",
    password: "sekretaris",
    registeredAt: "2026-01-15T09:00:00Z",
    noAnggota: "999000002",
    noRekening: "9990000020",
    saldoPokok: 500000,
    saldoWajib: 800000,
    saldoSukarela: 300000,
    saldoPenyertaan: 2000000
  },
  {
    id: "ketua-1",
    nama: "Prof. Dr. H. Slamet Purwanto, M.E.",
    tempatLahir: "Malang",
    tanggalLahir: "1958-11-03",
    institusiPensiun: "Universitas Airlangga (UNAIR)",
    jenisKelamin: "Laki-Laki",
    agama: "Islam",
    pekerjaanKeahlian: "Analisis Makroekonomi, Hukum Bisnis Koperasi",
    noHp: "081122334455",
    email: "ketua@koperasi-ippi.com",
    alamatLengkap: "Jl. Kertajaya Indah Timur XI/180 Surabaya 60116",
    status: "approved",
    role: "ketua",
    password: "ketua",
    registeredAt: "2026-01-05T07:30:00Z",
    noAnggota: "999000003",
    noRekening: "9990000030",
    saldoPokok: 500000,
    saldoWajib: 2000000,
    saldoSukarela: 5000000,
    saldoPenyertaan: 10000000
  },
  {
    id: "bendahara-1",
    nama: "Hj. Kartika Wardhani, S.E., Ak.",
    tempatLahir: "Gresik",
    tanggalLahir: "1964-10-24",
    institusiPensiun: "Bank Jatim",
    jenisKelamin: "Perempuan",
    agama: "Islam",
    pekerjaanKeahlian: "Akuntansi Publik, Audit Finansial, Manajemen Resiko Simpan Pinjam",
    noHp: "082233445566",
    email: "bendahara@koperasi-ippi.com",
    alamatLengkap: "Perum Graha Bunder Asri G-32, Kebomas, Gresik 61121",
    status: "approved",
    role: "bendahara",
    password: "bendahara",
    registeredAt: "2026-01-12T10:15:00Z",
    noAnggota: "999000004",
    noRekening: "9990000040",
    saldoPokok: 500000,
    saldoWajib: 1500000,
    saldoSukarela: 2200000,
    saldoPenyertaan: 4000000
  },
  {
    id: "anggota-1",
    nama: "Mohammad Muslih, S.H., M.M.",
    tempatLahir: "Malang",
    tanggalLahir: "1965-06-01",
    institusiPensiun: "PT Pos Indonesia (Persero)",
    jenisKelamin: "Laki-Laki",
    agama: "Islam",
    pekerjaanKeahlian: "Kurir, Ekspeditur, Logistik Regional",
    noHp: "081234567890",
    email: "Ikatanppi@gmail.com",
    alamatLengkap: "Jl Pahlawan 24 Madiun RT. 003 RW. 001 Madiun Lor, Kec. Manguharjo Kota Madiun 63122",
    status: "approved",
    role: "anggota",
    password: "anggota",
    registeredAt: "2026-05-18T14:24:00Z",
    noAnggota: "999000011",
    noRekening: "9990000110",
    saldoPokok: 500000,
    saldoWajib: 1000000,
    saldoSukarela: 850000,
    saldoPenyertaan: 2500000
  }
];

export const DEFAULT_PRODUCTS: StoreProduct[] = [
  {
    id: "prod-1",
    nama: "Beras Premium IPPI Jatim SLY (5 Kg)",
    harga: 72500,
    image: "https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&q=80&w=200",
    kategori: "Kebutuhan Pokok",
    stok: 120,
    deskripsi: "Beras poles kualitas super, pulen, wangi pandan alami, langsung dari penggilingan padi anggota IPPI Jatim."
  },
  {
    id: "prod-2",
    nama: "Minyak Goreng Sawit Kita (1 Liter)",
    harga: 16500,
    image: "https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&q=80&w=200",
    kategori: "Kebutuhan Pokok",
    stok: 85,
    deskripsi: "Minyak goreng kelapa sawit premium, jernih, tahan panas, sehat untuk kebutuhan keluarga."
  },
  {
    id: "prod-3",
    nama: "Madura Honey Original (250 ml)",
    harga: 65000,
    image: "https://images.unsplash.com/photo-1587049352846-4a222e784d38?auto=format&fit=crop&q=80&w=200",
    kategori: "Kesehatan",
    stok: 40,
    deskripsi: "Madu hutan murni 100% dari pegunungan Pulau Madura. Sangat baik untuk menjaga imunitas tubuh pensiunan."
  },
  {
    id: "prod-4",
    nama: "Kopi Arabika Dampit Malang (200g)",
    harga: 32000,
    image: "https://images.unsplash.com/photo-1559056199-641a0ac8b55e?auto=format&fit=crop&q=80&w=200",
    kategori: "Minuman",
    stok: 50,
    deskripsi: "Kopi Arabika premium pilihan dari lereng Gunung Semeru Dampit Malang. Cita rasa cokelat berempah premium."
  },
  {
    id: "prod-5",
    nama: "Gula Pasir Kristal Manis Jatim (1 Kg)",
    harga: 17500,
    image: "https://images.unsplash.com/photo-1581781870027-04212e231e96?auto=format&fit=crop&q=80&w=200",
    kategori: "Kebutuhan Pokok",
    stok: 200,
    deskripsi: "Gula tebu murni, putih, bersih, diproduksi pabrik tebu terkemuka di Jawa Timur."
  }
];

export const DEFAULT_TRANSACTIONS: Transaction[] = [
  {
    id: "tx-1",
    tanggal: "2026-06-01",
    kategori: "Uang Masuk",
    sumberTujuan: "Iuran Anggota",
    deskripsi: "Setoran Simpanan Wajib & Pokok Anggota Baru (Mohammad Muslih)",
    noRekening: "9990000110",
    namaBankPemilik: "Simpanan Koperasi - Mohammad Muslih",
    jumlahMasuk: 1500000,
    jumlahKeluar: 0,
    saldoAkhir: 1500000,
    approvedByKetua: true,
    createdBy: "Bendahara"
  },
  {
    id: "tx-2",
    tanggal: "2026-06-03",
    kategori: "Uang Masuk",
    sumberTujuan: "Nota Dana Masuk",
    deskripsi: "Pendapatan Usaha Penjualan Sembako Swalayan Periode Mei 2026",
    noRekening: "8881239901",
    namaBankPemilik: "Bank Jatim - Giro KSU IPPI Jatim",
    jumlahMasuk: 4500000,
    jumlahKeluar: 0,
    saldoAkhir: 600000,
    approvedByKetua: true,
    createdBy: "Bendahara"
  },
  {
    id: "tx-3",
    tanggal: "2026-06-05",
    kategori: "Uang Keluar",
    sumberTujuan: "Operasional",
    deskripsi: "Sewa Tempat Rapat Tahunan & Pengadaan ATK DPW Jawa Timur",
    noRekening: "7128391212",
    namaBankPemilik: "BCA - CV Pratama Jaya",
    jumlahMasuk: 0,
    jumlahKeluar: 1200000,
    saldoAkhir: 4800000,
    approvedByKetua: true,
    createdBy: "Bendahara"
  },
  {
    id: "tx-4",
    tanggal: "2026-06-08",
    kategori: "Uang Keluar",
    sumberTujuan: "SPJ",
    deskripsi: "Bantuan Dana Sosial Penyaluran Sembako Duafa DPW Jatim",
    noRekening: "1098231221",
    namaBankPemilik: "Bank Jatim - Pengurus Sosial IPPI",
    jumlahMasuk: 0,
    jumlahKeluar: 2500000,
    saldoAkhir: 2300000,
    approvedByKetua: true,
    createdBy: "Bendahara"
  }
];

export const DEFAULT_ARTICLES: Article[] = [
  {
    id: "art-1",
    title: "Mengelola Dana Pensiun dengan Prinsip Gotong Royong Koperasi",
    summary: "Mari pelajari bagaimana memaksimalkan sisa hasil usaha (SHU) melalui keikutsertaan aktif dalam unit simpan pinjam koperasi korps pensiunan.",
    content: "Masa pensiun bukanlah akhir dari produktivitas finansial. Melalui Koperasi KSU IPPI DPW Jatim, para purnatugas dapat saling bahu membahu menghidupkan ekosistem ekonomi. Pensiunan tidak hanya menyimpan dana, tetapi dana tersebut dikembangkan lewat unit pinjaman modal usaha kecil sesama pensiunan. Pada akhir tahun buku, keuntungan tersebut dikembalikan secara transparan dalam bentuk Sisa Hasil Usaha (SHU), menciptakan siklus berkah gotong royong yang sehat.",
    date: "2026-06-05",
    category: "Tips Keuangan"
  },
  {
    id: "art-2",
    title: "Kemitraan Logistik IPPI Jawa Timur dengan Ekosistem Pos Indonesia",
    summary: "Koperasi IPPI DPW Jatim meluncurkan unit jasa logistik untuk melayani pengiriman barang anggota menggunakan jaringan terluas.",
    content: "Sejalan dengan sejarah panjang para anggota yang sebagian besar merupakan pensiunan PT Pos Indonesia (Persero), Unit Jasa Logistik Koperasi IPPI DPW Jatim berkolaborasi strategis guna memberikan tarif khusus kargo dan pengiriman dokumen bagi anggota sekalian. Layanan ini mencakup diskon khusus bagi UKM yang dikelola oleh anggota atau keluarga inti anggota IPPI Jawa Timur.",
    date: "2026-05-24",
    category: "Unit Usaha"
  }
];

export const DEFAULT_ANNOUNCEMENTS: Announcement[] = [
  {
    id: "ann-1",
    title: "Rapat Anggota Tahunan Kelompok (RAT) Buku 2025 Jatim",
    content: "Diberitahukan kepada seluruh anggota Koperasi IPPI DPW Jawa Timur bahwa RAT Buku Keuangan 2025 akan diselenggarakan secara hybrid pada tanggal 20 Juni 2026 bertempat di Gedung Sekretariat Gayungan, Surabaya. Harap melakukan konfirmasi kehadiran melalui portal anggota atau menghubungi koordinator kabupaten/kota setempat.",
    date: "2026-06-10",
    important: true
  },
  {
    id: "ann-2",
    title: "Sosialisasi Program Simpanan Berjangka Khusus Pensiunan Jatim",
    content: "Koperasi membuka pendaftaran Simpanan Berjangka (Deposito Syariah) Mulai Juni 2026 dengan margin hasil bagi usaha yang menarik dan berkah demi meningkatkan kesejahteraan purnatugas.",
    date: "2026-06-03",
    important: false
  }
];

export const DEFAULT_TENTANG_ITEMS: TentangItem[] = [
  {
    id: "tentang-1",
    title: "Visi Koperasi",
    content: "Menjadi Koperasi Serba Usaha terdepan di Jawa Timur dalam mewujudkan jaminan kesejahteraan hari tua bagi segenap pensiunan logam-ekspres Pos Indonesia yang mandiri, berkeadaban, sehat walafiat, dan taat asas syariah.",
    image: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&q=80&w=400",
    showOnBeranda: true,
    order: 1
  },
  {
    id: "tentang-2",
    title: "Misi Koperasi",
    content: "1. Menyelenggarakan Unit Simpan Pinjam dengan tata kelola profesional dan bunga rendah yang meringankan.\n2. Memajukan UMKM serta pemenuhan kebutuhan sembako pangan harian lewat Swalayan IPPI Sejahtera.\n3. Mengoptimalkan keahlian ekspedisi anggota purnatugas PT Pos melalui kolaborasi Unit Jasa Logistik.\n4. Memberikan pelayanan sosial, santunan duka cita, serta advokasi kesehatan pensiunan di daerah Jawa Timur secara merata.",
    image: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&q=80&w=400",
    showOnBeranda: true,
    order: 2
  },
  {
    id: "tentang-3",
    title: "Sejarah Koperasi IPPI DPW Jatim",
    content: "Koperasi didirikan bertepatan dengan menguatnya kebutuhan pensiunan korps PT Pos Jatim untuk bersatu mengelola perekonomian pasca masa dinas aktif. Diinisiasi pada tahun 2018 melalui rapat gabungan dewan purnakarya se-Karesidenan Madiun dan Kediri, kemudian diresmikan di tingkat DPW Jawa Timur dengan status Koperasi KSU berbadan hukum lengkap pada tahun 2024.",
    image: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&q=80&w=630",
    showOnBeranda: true,
    order: 3
  },
  {
    id: "tentang-4",
    title: "Struktur Kepengurusan DPW Jatim",
    content: "Prof. Dr. H. Slamet Purwanto, M.E. (Ketua Koperasi IPPI DPW Jatim - Pensiunan UNAIR)\nDrs. Mohammad Anshori, M.Si. (Sekretaris I Koperasi - Pensiunan PT Pos Indonesia)\nHj. Kartika Wardhani, S.E., Ak. (Bendahara & Kepala Keuangan - Purnatugas Bank Jatim / Akuntan)\nIr. H. Budi Setiawan (Dewan Pengawas Utama - Mantan Kepala Regional Pos IV)",
    image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=400",
    showOnBeranda: false,
    order: 4
  }
];

export const DEFAULT_LAYANAN_ITEMS: LayananItem[] = [
  {
    id: "layanan-1",
    title: "Unit Simpan Pinjam (USP)",
    badge: "UNIT I",
    content: "Menawarkan berbagai fasilitas penyimpanan produktif dan pengajuan pembiayaan lunak pinjaman modal usaha purnatugas dengan tenor fleksibel serta suku bunga sangat bersahabat bagi purnakarya lansia.",
    image: "https://images.unsplash.com/photo-1559056199-641a0ac8b55e?auto=format&fit=crop&q=80&w=400",
    showOnBeranda: true,
    order: 1
  },
  {
    id: "layanan-2",
    title: "Unit Usaha Swalayan & Toko IPPI",
    badge: "UNIT II",
    content: "Nikmati transaksi belanja online kebutuhan sembako pokok harian dengan sistem pemotongan saldo simpanan secara aman. Terbuka pula layanan kas umum (POS) di sekretariat DPW.",
    image: "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=400",
    showOnBeranda: true,
    order: 2
  },
  {
    id: "layanan-3",
    title: "Unit Jasa Pengiriman & Logistik IPPI",
    badge: "UNIT III",
    content: "Menyediakan pengiriman paket domestik kargo yang dikelola mandiri oleh Koperasi bekerjasama penuh dengan PT Pos Indonesia (Persero). Solusi logistik andal dengan penjemputan barang ke alamat para anggota di wilayah Jawa Timur.",
    image: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&q=80&w=400",
    showOnBeranda: true,
    order: 3
  },
  {
    id: "layanan-4",
    title: "UNIT JASA LAINNYA (PPOB & PENERIMAAN)",
    badge: "UNIT IV",
    content: "Koperasi memfasilitasi transaksi tagihan bulanan (Listrik PLN, Token, BPJS, PDAM, Pulsa HP) melalui counter fisik maupun portal anggota terintegrasi dengan saldo tabungan secara aman.",
    image: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&q=80&w=400",
    showOnBeranda: true,
    order: 4
  }
];

export const DEFAULT_GALLERY_ITEMS: GalleryItem[] = [
  {
    id: "gal-1",
    title: "Rapat Koordinasi Pengurus Jatim",
    description: "Penyusunan pelaporan keuangan kas triwulan I tahun buku 2026.",
    image: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&q=80&w=400",
    showOnBeranda: true,
    order: 1
  },
  {
    id: "gal-2",
    title: "Silahturahmi Purnatugas Probolinggo",
    description: "Pembukaan korwil koperasi baru dan sosialisasi program tabungan wajib.",
    image: "https://images.unsplash.com/photo-1491438590914-bc09fcaaf77a?auto=format&fit=crop&q=80&w=400",
    showOnBeranda: true,
    order: 2
  },
  {
    id: "gal-3",
    title: "Unit Bisrak Sembako Swalayan Jatim",
    description: "Penerimaan beras unggul langsung dari petani anggota koperasi.",
    image: "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=400",
    showOnBeranda: true,
    order: 3
  },
  {
    id: "gal-4",
    title: "Penyaluran Santunan Sosial Logistik",
    description: "Bakti sosial purnabakti korps pensiunan Surabaya.",
    image: "https://images.unsplash.com/photo-1593113598332-cd288d649433?auto=format&fit=crop&q=80&w=400",
    showOnBeranda: true,
    order: 4
  },
  {
    id: "gal-5",
    title: "Kunjungan Komisariat Kemenkop RI",
    description: "Verifikasi standar operasional kesehatan simpan pinjam digital.",
    image: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&q=80&w=400",
    showOnBeranda: true,
    order: 5
  },
  {
    id: "gal-6",
    title: "Penyuluhan Usaha Komoditas Madu",
    description: "Pelatihan logistik madu hutan Madura bagi anggota profesional dan pensiunan di Sidoarjo.",
    image: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&q=80&w=400",
    showOnBeranda: true,
    order: 6
  }
];
