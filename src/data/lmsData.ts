import { LMSCourse } from '../types';

export const COURSE_1_SVG = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 250" width="100%" height="100%">
  <rect width="400" height="250" rx="15" fill="%230f172a"/>
  <circle cx="200" cy="110" r="60" fill="%231e293b" />
  <circle cx="200" cy="110" r="50" fill="none" stroke="%23dca415" stroke-width="4" stroke-dasharray="8 4" />
  <path d="M 170,120 L 195,145 L 235,95" fill="none" stroke="%2338bdf8" stroke-width="6" stroke-linecap="round" stroke-linejoin="round" />
  <text x="200" y="210" font-family="sans-serif" font-weight="bold" font-size="16" fill="%23f8fafc" text-anchor="middle">Sertifikasi Keanggotaan</text>
  <text x="200" y="230" font-family="sans-serif" font-size="12" fill="%2394a3b8" text-anchor="middle">Koperasi IPPI DPW Jatim</text>
</svg>`;

export const COURSE_2_SVG = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 250" width="100%" height="100%">
  <rect width="400" height="250" rx="15" fill="%230c4a80"/>
  <circle cx="150" cy="120" r="40" fill="%231d4ed8" opacity="0.6"/>
  <circle cx="250" cy="120" r="40" fill="%230284c7" opacity="0.6"/>
  <path d="M 120,130 L 160,100 L 210,140 L 280,90" fill="none" stroke="%23f8fafc" stroke-width="5" stroke-linecap="round" />
  <circle cx="280" cy="90" r="7" fill="%23dca415" />
  <text x="200" y="200" font-family="sans-serif" font-weight="bold" font-size="16" fill="%23f8fafc" text-anchor="middle">Digital Marketing UMKM</text>
  <text x="200" y="220" font-family="sans-serif" font-size="12" fill="%23bae6fd" text-anchor="middle">Optimasi Medsos & WA Business</text>
</svg>`;

export const COURSE_3_SVG = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 250" width="100%" height="100%">
  <rect width="400" height="250" rx="15" fill="%23065f46"/>
  <g transform="translate(140, 60)">
    <rect width="120" height="80" rx="8" fill="%23047857" stroke="%2334d399" stroke-width="3" />
    <line x1="20" y1="30" x2="100" y2="30" stroke="%236ee7b7" stroke-width="4" stroke-linecap="round" />
    <line x1="20" y1="50" x2="70" y2="50" stroke="%236ee7b7" stroke-width="4" stroke-linecap="round" />
    <circle cx="95" cy="55" r="10" fill="%23fbbf24" />
  </g>
  <text x="200" y="190" font-family="sans-serif" font-weight="bold" font-size="16" fill="%23f8fafc" text-anchor="middle">Manajemen Keuangan Praktis</text>
  <text x="200" y="210" font-family="sans-serif" font-size="12" fill="%23a7f3d0" text-anchor="middle">Arus Kas & Pembukuan Sederhana</text>
</svg>`;

export const DEFAULT_LMS_COURSES: LMSCourse[] = [
  {
    id: 'course-1',
    title: 'Sertifikasi Keanggotaan & Hak Koperasi IPPI Jatim',
    category: 'Pecinta Koperasi',
    instructor: 'Prof. Dr. H. Slamet Purwanto, M.E.',
    description: 'Membekali anggota dengan pemahaman mendalam tentang prinsip koperasi modern, hak & kewajiban partisipasi, pengelolaan simpanan modal, serta pengawasan akuntabilitas organisasi IPPI DPW Jawa Timur.',
    duration: '1.5 Jam',
    image: COURSE_1_SVG,
    lessons: [
      {
        id: 'c1-l1',
        title: 'Pengantar Koperasi IPPI DPW Jatim',
        content: `<h3>Selamat Datang di Portal Pembelajaran IPPI DPW Jawa Timur</h3>
<p>Koperasi IPPI (Ikatan Profesional & Pensiunan Indonesia) DPW Jawa Timur didirikan dengan visi luhur untuk meningkatkan kesejahteraan pensiunan, profesional, serta pelaku UMKM binaan di wilayah Jawa Timur. Melalui platform gotong royong ini, setiap anggota bukan hanya sekadar nasabah, melainkan pemilik sah dari Koperasi.</p>
<h4>Prinsip Dasar Koperasi IPPI:</h4>
<ul>
  <li><b>Keanggotaan Sukarela dan Terbuka:</b> Terbuka untuk seluruh pensiunan, profesional, dan pengusaha UMKM tanpa diskriminasi.</li>
  <li><b>Pengendalian Demokratis oleh Anggota:</b> Keputusan tertinggi berada pada RAT (Rapat Anggota Tahunan). Satu anggota memiliki hak satu suara (one member, one vote).</li>
  <li><b>Partisipasi Ekonomi Anggota:</b> Mengumpulkan Simpanan Pokok dan Simpanan Wajib sebagai modal usaha produktif bersama.</li>
  <li><b>Otonomi dan Kemandirian:</b> Menjamin keputusan dikelola secara mandiri demi kepentingan bersama tanpa pengaruh dari luar yang merugikan.</li>
</ul>
<p>Dengan mengikuti kelas ini, Anda akan memahami bagaimana dana Anda dikelola secara aman, amanah, dan dilaporkan secara transparan melalui modul-modul sistem database koperasi kami.</p>`,
        duration: '15 Menit',
        order: 1
      },
      {
        id: 'c1-l2',
        title: 'Memahami Simpanan Pokok, Wajib, Sukarela & Pinjaman',
        content: `<h3>Struktur Keuangan dan Permodalan Koperasi</h3>
<p>Koperasi IPPI DPW Jatim menggunakan skema permodalan gotong royong yang dibagi menjadi beberapa komponen berdasar Anggaran Dasar/Anggaran Rumah Tangga (AD/ART):</p>
<ol>
  <li><b>Simpanan Pokok:</b> Dibayarkan sekali saja saat pertama kali mendaftar sebagai anggota resmi. Simpanan ini tidak dapat ditarik selama masih menjadi anggota koperasi.</li>
  <li><b>Simpanan Wajib:</b> Iuran berkala bulanan yang wajib disetorkan oleh setiap anggota aktif guna memperkuat likuiditas modal koperasi.</li>
  <li><b>Simpanan Sukarela:</b> Tabungan bebas yang dapat disetor maupun ditarik sewaktu-waktu oleh anggota tanpa batasan berkala. Di dalam aplikasi ini, anggota dapat mengajukan penarikan Simpanan Sukarela secara instan di menu penarikan simpanan.</li>
  <li><b>Simpanan Penyertaan:</b> Investasi modal tambahan dari anggota untuk membiayai usaha-usaha strategis koperasi dengan imbalan bagi hasil (SHU) yang menarik.</li>
</ol>
<h3>Pengajuan Pinjaman Yang Bertanggung Jawab</h3>
<p>Koperasi IPPI DPW Jatim menyediakan sistem penyaluran pinjaman produktif bagi anggota dengan tenor pembayaran yang bersahabat dan bunga bersaing (1% per bulan flat). Pengajuan dapat diajukan langsung melalui Dashboard Anggota dan akan divalidasi langsung oleh Pengurus (Admin, Sekretaris, Bendahara, dan Ketua).</p>`,
        duration: '20 Menit',
        order: 2
      },
      {
        id: 'c1-l3',
        title: 'Hak Suara, Transparansi, & Rapat Anggota Tahunan (RAT)',
        content: `<h3>Kedaulatan Anggota di Koperasi IPPI</h3>
<p>Berbeda dengan perseroan terbatas atau perbankan komersial di mana pemilik saham terbesar berkuasa penuh, di koperasi kedudukan setiap anggota adalah <b>setara</b>.</p>
<h4>Hak-Hak Utama Anggota Koperasi IPPI:</h4>
<ul>
  <li><b>Hak Bersuara (Voice):</b> Mengajukan usul, saran, serta kritik membangun pada saat Rapat Anggota Tahunan (RAT).</li>
  <li><b>Hak Memilih & Dipilih:</b> Hak suara untuk memilih pengurus (Ketua, Sekretaris, Bendahara) dan pengawas, serta hak untuk dipilih menjadi pengurus jika memenuhi syarat kualifikasi.</li>
  <li><b>Hak Transparansi:</b> Berhak melihat laporan keuangan bulanan, mutasi simpanan pribadi, serta histori log aktivitas pengurus secara real-time demi mencegah penyalahgunaan kekuasaan (akuntabilitas).</li>
  <li><b>Pembagian Sisa Hasil Usaha (SHU):</b> Menerima pembagian keuntungan di akhir tahun buku secara proporsional sesuai dengan keaktifan transaksi dan besaran simpanan masing-masing di koperasi.</li>
</ul>`,
        duration: '15 Menit',
        order: 3
      }
    ],
    quiz: {
      passingScore: 70,
      questions: [
        {
          id: 'q1-1',
          questionText: 'Siapakah pemilik tertinggi dari kekuasaan dan keputusan di Koperasi IPPI DPW Jawa Timur?',
          options: [
            'Ketua Koperasi saja',
            'Rapat Anggota Tahunan (RAT) yang dihadiri seluruh anggota',
            'Dinas Koperasi Provinsi Jatim',
            'Pihak Perbankan Mitra'
          ],
          correctOptionIndex: 1
        },
        {
          id: 'q1-2',
          questionText: 'Jenis simpanan apa yang wajib disetorkan sekali saja saat pertama kali bergabung menjadi anggota?',
          options: [
            'Simpanan Sukarela',
            'Simpanan Wajib',
            'Simpanan Pokok',
            'Simpanan Penyertaan'
          ],
          correctOptionIndex: 2
        },
        {
          id: 'q1-3',
          questionText: 'Berapakah persen suku bunga flat per bulan yang ditawarkan Koperasi IPPI DPW Jatim untuk pinjaman anggota?',
          options: [
            '1.0% flat per bulan',
            '5.5% flat per bulan',
            'Bebas bunga tanpa batas',
            '15% per bulan'
          ],
          correctOptionIndex: 0
        }
      ]
    }
  },
  {
    id: 'course-2',
    title: 'Digital Marketing & WhatsApp Business untuk UMKM',
    category: 'Digitalisasi Bisnis',
    instructor: 'Drs. Mohammad Anshori, M.Si.',
    description: 'Panduan taktis bagi pelaku UMKM Jawa Timur untuk mendominasi pasar lokal lewat integrasi media sosial, manajemen konten kreatif, dan optimalisasi WhatsApp Business sebagai mesin penjualan otomatis.',
    duration: '2 Jam',
    image: COURSE_2_SVG,
    lessons: [
      {
        id: 'c2-l1',
        title: 'Mengapa UMKM Wajib Go-Digital Sekarang?',
        content: `<h3>Peluang Besar Pasar Digital di Jawa Timur</h3>
<p>Dengan populasi lebih dari 40 juta jiwa, Provinsi Jawa Timur memiliki basis konsumen digital yang sangat masif. UMKM konvensional yang tidak beralih ke ranah digital akan tertinggal oleh kompetitor yang responsif. Go-Digital bukan lagi sekadar tren, melainkan strategi bertahan hidup pasca pandemi.</p>
<h4>Manfaat Utama Digital Marketing bagi UMKM:</h4>
<ul>
  <li><b>Efisiensi Biaya Jangkauan:</b> Beriklan atau memposting konten di Instagram/TikTok tidak membutuhkan biaya sewa ruko fisik yang mahal untuk mencakup kota Madiun, Surabaya, Malang, maupun Banyuwangi sekaligus.</li>
  <li><b>Analitik Presisi:</b> Anda bisa tahu persis siapa pembeli produk Anda (jenis kelamin, rentang usia, kota asal, produk terpopuler).</li>
  <li><b>Kecepatan Interaksi:</b> Komunikasi dengan pembeli jauh lebih cepat sehingga menghemat waktu dan meningkatkan kepuasan pelanggan.</li>
</ul>`,
        duration: '20 Menit',
        order: 1
      },
      {
        id: 'c2-l2',
        title: 'Strategi Optimasi WhatsApp Business sebagai CRM & Kasir Otomatis',
        content: `<h3>Mengubah WhatsApp Biasa Menjadi Katalog Penjualan</h3>
<p>WhatsApp Business adalah senjata terkuat bagi UMKM Indonesia karena hampir 90% pengguna ponsel aktif menggunakan WhatsApp setiap hari. Jangan gunakan akun pribadi untuk bisnis!</p>
<h4>Fitur WhatsApp Business yang Wajib Anda Aktifkan:</h4>
<ol>
  <li><b>Profil Bisnis:</b> Pasang nama UMKM Anda, logo resmi, jam operasional, alamat sekretariat/toko fisik, dan tautan website koperasi/toko Anda.</li>
  <li><b>Katalog Produk:</b> Unggah foto produk sembako, kerajinan, atau layanan Anda lengkap dengan harga dan deskripsi singkat. Ini memudahkan konsumen memilih tanpa perlu mengunduh brosur manual.</li>
  <li><b>Greeting Message & Away Message:</b> Balasan otomatis saat konsumen baru mengirim pesan pertama, serta jawaban otomatis saat toko sudah tutup.</li>
  <li><b>Quick Replies:</b> Pintasan balasan cepat untuk pertanyaan berulang (misal: format order, nomor rekening pembayaran, ongkos kirim). Cukup ketik "/ongkir" atau "/order" untuk mengirim pesan panjang instan.</li>
  <li><b>Label:</b> Mengkategorikan pelanggan Anda (misal: "Pelanggan Baru", "Menunggu Pembayaran", "Pesanan Dikirim", "Selesai").</li>
</ol>`,
        duration: '25 Menit',
        order: 2
      },
      {
        id: 'c2-l3',
        title: 'Membuat Konten Viral Bermodal HP (Smartphone Copywriting)',
        content: `<h3>Kerangka Copywriting Menggunakan Metode AIDA</h3>
<p>Agar promosi produk UMKM Anda dibaca dan mendatangkan pembeli, hindari menulis iklan yang kaku. Gunakan struktur AIDA:</p>
<ul>
  <li><b>Attention (Perhatian):</b> Buat 1 baris judul pembuka yang mengejutkan atau memicu rasa penasaran pelanggan. <br><i>Contoh: "Bosan Beras Cepat Kutu dan Bau Apek? Cobalah Ini!"</i></li>
  <li><b>Interest (Ketertarikan):</b> Jelaskan fakta menarik atau masalah yang sedang dihadapi calon pembeli. <br><i>Contoh: "Koperasi IPPI DPW Jatim kini menyediakan Beras Premium sehat tanpa bahan pemutih kimia langsung dari petani lokal."</i></li>
  <li><b>Desire (Keinginan):</b> Berikan penawaran spesial, diskon, atau testimoni kepuasan pelanggan agar calon pembeli tergoda. <br><i>Contoh: "Khusus anggota koperasi bulan ini, dapatkan potongan harga 10% dan gratis ongkir wilayah Surabaya!"</i></li>
  <li><b>Action (Tindakan):</b> Berikan instruksi jelas ke mana mereka harus bertransaksi. <br><i>Contoh: "Stok terbatas! Klik tombol WA di bawah atau pesan via e-commerce Koperasi sekarang."</i></li>
</ul>`,
        duration: '20 Menit',
        order: 3
      }
    ],
    quiz: {
      passingScore: 70,
      questions: [
        {
          id: 'q2-1',
          questionText: 'Mengapa UMKM disarankan menggunakan WhatsApp Business dibanding WhatsApp Personal?',
          options: [
            'WhatsApp Business memiliki fitur katalog, profil bisnis, label, dan pesan otomatis',
            'WhatsApp Business gratis sedangkan WhatsApp Personal berbayar',
            'WhatsApp Business otomatis mengirimkan transfer uang dari bank',
            'WhatsApp Business hanya bisa diakses di komputer'
          ],
          correctOptionIndex: 0
        },
        {
          id: 'q2-2',
          questionText: 'Apakah kepanjangan dari metode copywriting populer "A-I-D-A" yang digunakan untuk merancang konten penjualan?',
          options: [
            'Action, Insight, Decision, Authority',
            'Attention, Interest, Desire, Action',
            'Association, Integration, Development, Automation',
            'Anggota, IPPI, Daerah, Asosiasi'
          ],
          correctOptionIndex: 1
        },
        {
          id: 'q2-3',
          questionText: 'Fitur WhatsApp Business apa yang paling tepat digunakan untuk menyimpan format jawaban pertanyaan berulang agar hemat waktu ketik?',
          options: [
            'Katalog',
            'Quick Replies (Balasan Cepat)',
            'Profile Bisnis',
            'Label Pelanggan'
          ],
          correctOptionIndex: 1
        }
      ]
    }
  },
  {
    id: 'course-3',
    title: 'Manajemen Keuangan & Arus Kas Mudah bagi UMKM',
    category: 'Manajemen Keuangan',
    instructor: 'Hj. Kartika Wardhani, S.E., Ak.',
    description: 'Belajar cara mencatatkan keuangan usaha dengan disiplin, menghitung Harga Pokok Penjualan (HPP) yang akurat, serta memisahkan rekening pribadi dengan kas usaha agar bisnis Anda bankable.',
    duration: '2 Jam',
    image: COURSE_3_SVG,
    lessons: [
      {
        id: 'c3-l1',
        title: 'Aturan Emas Keuangan UMKM: Pisahkan Uang Pribadi!',
        content: `<h3>Kesalahan Paling Fatal Pelaku UMKM</h3>
<p>Banyak bisnis UMKM bangkrut bukan karena produknya tidak laku, melainkan karena manajemen keuangannya tercampur dengan kebutuhan dapur rumah tangga pribadi pemilik. Tanpa pemisahan rekening, Anda tidak akan pernah tahu apakah usaha Anda benar-benar untung atau buntung.</p>
<h4>Langkah Praktis Pemisahan Keuangan:</h4>
<ul>
  <li><b>Buat Rekening Terpisah:</b> Memiliki minimal dua rekening bank berbeda (satu khusus kas masuk & keluar usaha, satu untuk kehidupan pribadi keluarga).</li>
  <li><b>Gaji Diri Sendiri:</b> Tetapkan angka tetap untuk menggaji diri Anda sendiri setiap bulan sesuai kontribusi Anda. Jangan mengambil uang kas bisnis sesuka hati di tengah jalan.</li>
  <li><b>Catat Setiap Rupiah:</b> Sekecil apa pun pengeluarannya (bahkan biaya parkir saat belanja bahan baku), harus dicatatkan ke kas pengeluaran usaha.</li>
</ul>`,
        duration: '20 Menit',
        order: 1
      },
      {
        id: 'c3-l2',
        title: 'Mengenal Arus Kas (Cash Flow) & Pembukuan Sederhana',
        content: `<h3>Memahami Arus Kas Masuk & Keluar</h3>
<p>Arus kas adalah urat nadi bisnis Anda. Bisnis Anda bisa saja mencatatkan laba kertas yang tinggi, namun jika kas riil kosong karena piutang macet dari pembeli, maka bisnis Anda akan kolaps.</p>
<h4>Tiga Bagian Utama Laporan Arus Kas Sederhana:</h4>
<ol>
  <li><b>Penerimaan Kas (Inflow):</b> Uang tunai yang benar-benar masuk ke kas Anda dari hasil penjualan produk, pelunasan piutang pembeli, atau modal awal.</li>
  <li><b>Pengeluaran Kas (Outflow):</b> Uang tunai yang dibayarkan untuk biaya bahan baku, sewa tempat, gaji karyawan, langganan air/listrik, atau cicilan modal.</li>
  <li><b>Saldo Akhir Kas:</b> Sisa kas yang dipegang (Penerimaan dikurangi Pengeluaran). Selisih ini harus dicocokkan dengan fisik uang di laci atau saldo rekening bank secara berkala setiap sore/minggu.</li>
</ol>`,
        duration: '25 Menit',
        order: 2
      },
      {
        id: 'c3-l3',
        title: 'Cara Menghitung HPP (Harga Pokok Penjualan) & Margin Profit',
        content: `<h3>Jangan Salah Menentukan Harga Jual!</h3>
<p>Menentukan harga hanya berdasarkan melihat harga pasar bisa sangat merugikan jika HPP produksi Anda ternyata lebih tinggi. Anda harus menghitung semua pengeluaran bahan secara sistematis.</p>
<h4>Rumus Dasar Pembentukan Harga Jual:</h4>
<p><b>HPP = Biaya Bahan Baku Langsung + Biaya Tenaga Kerja + Biaya Overhead (Gas, Listrik, Kemasan, Transportasi)</b></p>
<p><b>Harga Jual = HPP + Profit Margin yang Diinginkan</b></p>
<p><i>Contoh Kasus:</i> Bubur Ayam UMKM membutuhkan bahan Rp4.000 per porsi. Gaji pembuat bubur Rp1.000 per porsi, biaya cup kemasan dan sendok plastik Rp1.000. Maka total HPP = Rp6.000. Jika ingin mengambil margin profit sebesar 40% (Rp4.000), maka harga jual yang pantas adalah Rp10.000 per porsi.</p>`,
        duration: '20 Menit',
        order: 3
      }
    ],
    quiz: {
      passingScore: 70,
      questions: [
        {
          id: 'q3-1',
          questionText: 'Apa tindakan pertama yang paling disarankan bagi pelaku UMKM agar keuangan usahanya teratur?',
          options: [
            'Segera menyewa akuntan profesional bersertifikat',
            'Memisahkan rekening bank pribadi dengan rekening khusus operasional bisnis',
            'Mengajukan pinjaman maksimal ke bank',
            'Menaikkan harga jual produk setinggi mungkin'
          ],
          correctOptionIndex: 1
        },
        {
          id: 'q3-2',
          questionText: 'Manakah pengeluaran di bawah ini yang dikategorikan sebagai biaya bahan baku langsung dalam HPP usaha bakso?',
          options: [
            'Biaya penyusutan mangkok bakso',
            'Daging sapi segar, tepung tapioka, dan bumbu rempah kuah bakso',
            'Biaya sewa ruko tahunan',
            'Biaya kuota internet promosi Instagram'
          ],
          correctOptionIndex: 1
        },
        {
          id: 'q3-3',
          questionText: 'Apa yang akan terjadi bila bisnis UMKM Anda memiliki angka laba penjualan tinggi di pembukuan tapi tidak memiliki kas riil?',
          options: [
            'Bisnis tetap berjalan lancar tanpa kendala apapun',
            'Koperasi otomatis memberikan modal hibah cuma-cuma',
            'Bisnis bisa kolaps atau bangkrut karena tidak bisa membayar kewajiban operasional harian (gaji, supplier, listrik)',
            'Bank akan langsung memberikan pinjaman tanpa jaminan'
          ],
          correctOptionIndex: 2
        }
      ]
    }
  }
];
