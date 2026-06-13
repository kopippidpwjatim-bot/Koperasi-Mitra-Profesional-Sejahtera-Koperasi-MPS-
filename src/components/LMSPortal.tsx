import React, { useState } from 'react';
// @ts-ignore
import bestBadgeImg from '../assets/images/best_badge_1781354597229.jpg';
import { 
  Award, 
  BookOpen, 
  CheckCircle, 
  Clock, 
  Plus, 
  Trash2, 
  Play, 
  ArrowLeft, 
  ArrowRight, 
  User, 
  Calendar, 
  Sparkles, 
  Printer, 
  CheckSquare, 
  ChevronRight, 
  FileText,
  BookmarkCheck,
  AlertCircle,
  ExternalLink,
  Edit
} from 'lucide-react';
import { LMSCourse, LMSUserProgress, Member, UserRole, CooperativeSettings } from '../types';

interface LMSPortalProps {
  currentUser: Member | null;
  courses: LMSCourse[];
  progressList: LMSUserProgress[];
  onSaveProgress: (updatedProgress: LMSUserProgress) => Promise<void>;
  onSaveCourses: (updatedCourses: LMSCourse[]) => Promise<void>;
  onLogActivity: (activity: string) => void;
  settings: CooperativeSettings;
  members: Member[];
}

export const LMSPortal: React.FC<LMSPortalProps> = ({
  currentUser,
  courses,
  progressList,
  onSaveProgress,
  onSaveCourses,
  onLogActivity,
  settings,
  members
}) => {
  // If not logged in, show a state prompting him to log in to track progress, but allow browsing courses
  const isGuest = !currentUser;

  // Dynamically resolve Chairman & Secretary from managed users
  const ketuaMember = members.find(m => m.role === 'ketua');
  const sekretarisMember = members.find(m => m.role === 'sekretaris');

  const ketuaFullName = ketuaMember ? ketuaMember.nama : "Prof. Dr. H. Slamet Purwanto, M.E.";
  const sekretarisFullName = sekretarisMember ? sekretarisMember.nama : "Drs. Mohammad Anshori, M.Si.";
  
  const ketuaSignLabel = ketuaMember ? ketuaMember.nama.split(',')[0].trim() : "Prof. Slamet";
  const sekretarisSignLabel = sekretarisMember ? sekretarisMember.nama.split(',')[0].trim() : "Drs. M. Anshori";
  
  // Find current user's progress or return a default empty progress
  const userProgress = progressList.find(p => p.memberId === currentUser?.id) || {
    id: currentUser?.id || 'guest',
    memberId: currentUser?.id || 'guest',
    memberName: currentUser?.nama || 'Tamu / Umum',
    completedCourseIds: [],
    quizScores: {},
    certifiedAt: {}
  };

  // State Management
  const [selectedCourse, setSelectedCourse] = useState<LMSCourse | null>(null);
  const [activeLessonIndex, setActiveLessonIndex] = useState<number>(0);
  const [completedLessonIds, setCompletedLessonIds] = useState<string[]>([]);
  const [quizMode, setQuizMode] = useState<boolean>(false);
  
  // Quiz answers state
  const [quizAnswers, setQuizAnswers] = useState<Record<string, number>>({});
  const [quizResult, setQuizResult] = useState<{ score: number; passed: boolean } | null>(null);
  const [viewingCertificateCourseId, setViewingCertificateCourseId] = useState<string | null>(null);

  // Admin and category filter states
  const [activeCategory, setActiveCategory] = useState<string>('Semua');
  const [showAdminTab, setShowAdminTab] = useState<boolean>(false);
  const [editingCourseId, setEditingCourseId] = useState<string | null>(null);

  // Custom course creator state (admin only)
  const [newCourse, setNewCourse] = useState({
    title: '',
    category: 'UMKM Modern' as any,
    instructor: '',
    description: '',
    duration: '2 Jam',
    image: '',
    externalUrl: '',
    lessons: [
      { id: 'new-l1', title: 'Materi Bab 1', content: 'Tulis detail isi materi Bab 1 di sini...', duration: '15 Menit', order: 1, externalUrl: '' }
    ],
    quiz: {
      passingScore: 70,
      questions: [
        { id: 'new-q1', questionText: 'Apa pengertian wirausaha menurut UU?', options: ['Pilihan A', 'Pilihan B', 'Pilihan C', 'Pilihan D'], correctOptionIndex: 0 }
      ]
    }
  });

  // Calculate stats for current member UI
  const totalCoursesCount = courses.length;
  const completedCoursesCount = userProgress.completedCourseIds.length;

  // Filter terms
  const categories = ['Semua', 'UMKM Modern', 'Pecinta Koperasi', 'Manajemen Keuangan', 'Digitalisasi Bisnis'];

  const filteredCourses = activeCategory === 'Semua' 
    ? courses 
    : courses.filter(c => c.category === activeCategory);

  // Handlers
  const handleStartCourse = (course: LMSCourse) => {
    setSelectedCourse(course);
    setActiveLessonIndex(0);
    setQuizMode(false);
    setQuizResult(null);
    setQuizAnswers({});
    
    // Clear / initialize lesson ticks
    setCompletedLessonIds([]);
  };

  const handleMarkLessonComplete = (lessonId: string) => {
    if (!completedLessonIds.includes(lessonId)) {
      setCompletedLessonIds([...completedLessonIds, lessonId]);
    }
    
    if (selectedCourse && activeLessonIndex < selectedCourse.lessons.length - 1) {
      setActiveLessonIndex(prev => prev + 1);
    }
  };

  const allLessonsCompleted = selectedCourse 
    ? selectedCourse.lessons.every(lesson => completedLessonIds.includes(lesson.id))
    : false;

  const handleStartQuiz = () => {
    setQuizMode(true);
    setQuizAnswers({});
    setQuizResult(null);
  };

  const handleSelectAnswer = (questionId: string, optionIndex: number) => {
    setQuizAnswers(prev => ({
      ...prev,
      [questionId]: optionIndex
    }));
  };

  const handleSubmitQuiz = async () => {
    if (!selectedCourse) return;
    
    let correctCount = 0;
    const questions = selectedCourse.quiz.questions;
    
    questions.forEach(q => {
      if (quizAnswers[q.id] === q.correctOptionIndex) {
        correctCount++;
      }
    });

    const score = Math.round((correctCount / questions.length) * 100);
    const passed = score >= selectedCourse.quiz.passingScore;

    setQuizResult({ score, passed });

    if (passed && currentUser) {
      // Save progress
      const updatedCompleted = [...userProgress.completedCourseIds];
      if (!updatedCompleted.includes(selectedCourse.id)) {
        updatedCompleted.push(selectedCourse.id);
      }

      const updatedScores = { ...userProgress.quizScores, [selectedCourse.id]: score };
      const updatedDates = { 
        ...userProgress.certifiedAt, 
        [selectedCourse.id]: new Date().toLocaleDateString('id-ID', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        })
      };

      const pathProgress: LMSUserProgress = {
        ...userProgress,
        memberId: currentUser.id,
        memberName: currentUser.nama,
        completedCourseIds: updatedCompleted,
        quizScores: updatedScores,
        certifiedAt: updatedDates
      };

      await onSaveProgress(pathProgress);
      onLogActivity(`Menyelesaikan Kursus "${selectedCourse.title}" dengan Skor ${score}%`);
    }
  };

  // Admin Handlers
  const handleAddLessonField = () => {
    const nextIdx = newCourse.lessons.length + 1;
    setNewCourse(prev => ({
      ...prev,
      lessons: [
        ...prev.lessons,
        {
          id: `new-l${nextIdx}`,
          title: `Materi Bab ${nextIdx}`,
          content: 'Tulis detail isi bab rincian pembelajaran...',
          duration: '15 Menit',
          order: nextIdx
        }
      ]
    }));
  };

  const handleAddQuestionField = () => {
    const nextIdx = newCourse.quiz.questions.length + 1;
    setNewCourse(prev => ({
      ...prev,
      quiz: {
        ...prev.quiz,
        questions: [
          ...prev.quiz.questions,
          {
            id: `new-q${nextIdx}`,
            questionText: 'Pertanyaan baru?',
            options: ['Jawaban A', 'Jawaban B', 'Jawaban C', 'Jawaban D'],
            correctOptionIndex: 0
          }
        ]
      }
    }));
  };

  const handleCreateCourse = async () => {
    if (!newCourse.title || !newCourse.instructor) {
      alert("Harap isi nama kursus dan instruktur pengajar!");
      return;
    }

    const defaultImg = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 250" width="100%" height="100%"><rect width="400" height="250" rx="15" fill="%231e293b"/><text x="200" y="120" font-family="sans-serif" font-weight="bold" font-size="16" fill="%23ffffff" text-anchor="middle">${newCourse.title.substring(0, 30)}...</text><text x="200" y="150" font-family="sans-serif" font-size="12" fill="%2338bdf8" text-anchor="middle">Instruktur: ${newCourse.instructor}</text></svg>`;

    if (editingCourseId) {
      // Edit mode
      const updated = courses.map(c => {
        if (c.id === editingCourseId) {
          return {
            ...c,
            title: newCourse.title,
            category: newCourse.category,
            instructor: newCourse.instructor,
            description: newCourse.description || 'Tidak ada deskripsi rincian.',
            duration: newCourse.duration,
            image: newCourse.image || defaultImg,
            lessons: newCourse.lessons,
            quiz: newCourse.quiz,
            externalUrl: newCourse.externalUrl
          };
        }
        return c;
      });

      await onSaveCourses(updated);
      onLogActivity(`Memperbarui data kursus LMS "${newCourse.title}"`);
      alert("Kursus LMS berhasil diperbarui secara permanen!");
      setEditingCourseId(null);
    } else {
      // Create mode
      const created: LMSCourse = {
        id: `course-${Date.now()}`,
        title: newCourse.title,
        category: newCourse.category,
        instructor: newCourse.instructor,
        description: newCourse.description || 'Tidak ada deskripsi rincian.',
        duration: newCourse.duration,
        image: newCourse.image || defaultImg,
        lessons: newCourse.lessons,
        quiz: newCourse.quiz,
        externalUrl: newCourse.externalUrl
      };

      const updated = [...courses, created];
      await onSaveCourses(updated);
      onLogActivity(`Menambahkan materi kursus pembelajaran baru "${created.title}"`);
      alert("Kursus LMS baru berhasil didaftarkan secara permanen!");
    }
    
    // reset form
    setNewCourse({
      title: '',
      category: 'UMKM Modern',
      instructor: '',
      description: '',
      duration: '2 Jam',
      image: '',
      externalUrl: '',
      lessons: [{ id: 'new-l1', title: 'Materi Bab 1', content: 'Tulis detail isi materi Bab 1 di sini...', duration: '15 Menit', order: 1, externalUrl: '' }],
      quiz: { passingScore: 70, questions: [{ id: 'new-q1', questionText: 'Apa pengertian wirausaha menurut UU?', options: ['Pilihan A', 'Pilihan B', 'Pilihan C', 'Pilihan D'], correctOptionIndex: 0 }] }
    });
    setShowAdminTab(false);
  };

  const handleEditClick = (course: LMSCourse) => {
    setEditingCourseId(course.id);
    setNewCourse({
      title: course.title,
      category: course.category,
      instructor: course.instructor,
      description: course.description,
      duration: course.duration,
      image: course.image || '',
      externalUrl: course.externalUrl || '',
      lessons: course.lessons.map(l => ({
        id: l.id,
        title: l.title,
        content: l.content,
        duration: l.duration,
        order: l.order,
        externalUrl: l.externalUrl || ''
      })),
      quiz: course.quiz
    });
    setShowAdminTab(true);
  };

  const handleDeleteCourse = async (courseId: string) => {
    if (window.confirm("Apakah Anda yakin ingin menghapus kursus pembelajaran LMS ini?")) {
      const updated = courses.filter(c => c.id !== courseId);
      await onSaveCourses(updated);
      onLogActivity(`Menghapus materi kursus pembelajaran LMS ${courseId}`);
    }
  };

  // Certificate render parameters
  const activeCertCourse = courses.find(c => c.id === viewingCertificateCourseId);

  return (
    <div className="bg-slate-900 border border-slate-800 text-white rounded-3xl p-6 shadow-2xl relative overflow-hidden" id="lms-portal-root">
      
      {/* Decorative background grid and flares conforming to design-philosophy */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl pointer-events-none -ml-20 -mb-20"></div>

      {/* Header section with back navigation if studying */}
      <div className="relative z-10">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-white/10 pb-6 mb-6">
          <div>
            <div className="flex items-center gap-2 mb-1.5Packed">
              <span className="bg-blue-500/25 text-blue-300 font-extrabold text-[10px] uppercase tracking-wider px-2.5 py-1 rounded-full border border-blue-500/30">
                Pendidikan Anggota & UMKM
              </span>
              <span className="bg-amber-500/20 text-amber-300 font-extrabold text-[10px] uppercase tracking-wider px-2.5 py-1 rounded-full border border-amber-500/20">
                LMS Platform v1.1
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-black tracking-tight text-white flex items-center gap-2">
              <BookOpen className="w-7 h-7 text-blue-400" />
              LMS Pembelajaran Interaktif
            </h1>
            <p className="text-slate-400 text-xs mt-1 font-medium max-w-2xl">
              Modul sertifikasi koperasi, pelatihan literasi keuangan, pengembangan kewirausahaan, serta strategi pemasaran digital guna mendongkrak omset pemasaran UMKM di Jawa Timur.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {/* Admin tab entry */}
            {currentUser && (currentUser.role === 'admin' || currentUser.role === 'ketua' || currentUser.role === 'sekretaris') && (
              <button
                onClick={() => {
                  setShowAdminTab(!showAdminTab);
                  setSelectedCourse(null);
                  setViewingCertificateCourseId(null);
                }}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider border transition-all duration-300 ${
                  showAdminTab 
                    ? 'bg-amber-600 border-amber-500 text-white' 
                    : 'bg-slate-800 border-slate-700 hover:bg-slate-750 text-slate-300 hover:text-white'
                }`}
              >
                <Plus className="w-4 h-4 text-amber-400" />
                {showAdminTab ? "Tutup Kelola LMS" : "Kelola Kursus (Admin)"}
              </button>
            )}

            {selectedCourse && (
              <button
                onClick={() => {
                  setSelectedCourse(null);
                  setQuizMode(false);
                  setQuizResult(null);
                }}
                className="flex items-center gap-1.5 px-4 py-2 bg-slate-800 border border-slate-705 rounded-xl text-xs font-black uppercase tracking-wider text-slate-300 hover:bg-slate-750 hover:text-white transition-all"
              >
                <ArrowLeft className="w-4 h-4" />
                Kembali ke Kursus
              </button>
            )}
          </div>
        </div>

        {/* Guest Warning Card */}
        {isGuest && (
          <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-4 mb-6 flex gap-3 text-slate-300 text-xs items-start z-10 relative">
            <AlertCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-amber-300 uppercase tracking-wide text-[10px]">Akses Pengunjung Publik (Demo Mode)</p>
              <p className="leading-relaxed mt-1">Anda saat ini belum login sebagai anggota. Anda dipersilakan untuk membaca modul pembelajaran dan mengikuti kuis evaluasi, namun progres belajar serta sertifikat kelulusan tidak akan dapat disimpan secara permanen di database. Silakan masuk / daftar terlebih dahulu melalui portal utama Koperasi.</p>
            </div>
          </div>
        )}

        {/* Mini progress tracker if loaded and not guest */}
        {!isGuest && !selectedCourse && !showAdminTab && (
          <div className="bg-slate-800/40 border border-slate-800 rounded-2xl p-4 mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-500/10 rounded-xl border border-blue-500/20">
                <Award className="w-6 h-6 text-blue-400" />
              </div>
              <div>
                <p className="text-[10px] text-slate-400 font-extrabold uppercase tracking-widest leading-none">Rapor Pembelajaran Pemilik</p>
                <p className="text-sm font-black text-white mt-0.5">{currentUser?.nama}</p>
                <p className="text-xs text-slate-400 font-semibold mt-0.5">Sertifikasi Selesai: {completedCoursesCount} dari {totalCoursesCount} Kursus Utama</p>
              </div>
            </div>

            <div className="w-full md:w-64">
              <div className="flex justify-between text-[10px] font-bold text-slate-400 mb-1">
                <span>PROGRES KELULUSAN</span>
                <span>{totalCoursesCount > 0 ? Math.round((completedCoursesCount / totalCoursesCount) * 100) : 0}%</span>
              </div>
              <div className="w-full bg-slate-700 h-2 rounded-full overflow-hidden">
                <div 
                  className="bg-emerald-500 h-full rounded-full transition-all duration-500" 
                  style={{ width: `${totalCoursesCount > 0 ? (completedCoursesCount / totalCoursesCount) * 100 : 0}%` }}
                ></div>
              </div>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* VIEW 1: DISPATCH DIGITAL CERTIFICATE MODAL/SUB-SHEET   */}
        {/* ======================================================== */}
        {viewingCertificateCourseId && activeCertCourse && (
          <div className="bg-slate-950/80 border border-slate-800 p-8 rounded-3xl mb-8 z-20 relative">
            
            {/* Header control */}
            <div className="flex justify-between items-center mb-6 border-b border-white/5 pb-4">
              <div className="flex items-center gap-2">
                <Award className="w-5 h-5 text-amber-500 animate-bounce" />
                <span className="text-xs font-black uppercase text-slate-300 tracking-wider">Arsip Sertifikat Kelulusan Resmi</span>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-3.5 py-1.5 bg-emerald-700 hover:bg-emerald-600 text-white text-[11px] font-bold rounded-xl flex items-center gap-1 cursor-pointer transition-all uppercase tracking-wide"
                >
                  <Printer className="w-3.5 h-3.5" /> Cetak / PDF
                </button>
                <button
                  onClick={() => setViewingCertificateCourseId(null)}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-750 text-[11px] font-bold rounded-xl transition cursor-pointer text-slate-300 hover:text-white uppercase tracking-wide"
                >
                  Tutup Sertifikat
                </button>
              </div>
            </div>

            {/* THE AWESOME PRINTABLE CERTIFICATE */}
            <div 
              id="printable-cert-frame"
              className="text-slate-900 border-[10px] border-double border-amber-500/80 p-8 md:p-12 rounded-3xl relative overflow-hidden shadow-2xl mx-auto max-w-4xl text-center transition-all duration-300"
              style={{ 
                fontFamily: "'Inter', sans-serif",
                background: "linear-gradient(135deg, rgba(255,245,245,0.92) 0%, rgba(255,251,240,0.96) 25%, rgba(240,253,244,0.94) 50%, rgba(240,249,255,0.95) 75%, rgba(250,245,255,0.93) 100%)" 
              }}
            >
              {/* Soft Rainbow Modern Decorative Backdrops (Aurora Pastel) */}
              <div className="absolute top-[-120px] left-[-120px] w-[380px] h-[380px] rounded-full bg-pink-300/25 blur-3xl pointer-events-none"></div>
              <div className="absolute top-[-80px] right-[-120px] w-[350px] h-[350px] rounded-full bg-violet-300/20 blur-3xl pointer-events-none"></div>
              <div className="absolute bottom-[-150px] left-[15%] w-[420px] h-[420px] rounded-full bg-yellow-200/30 blur-3xl pointer-events-none"></div>
              <div className="absolute bottom-[-100px] right-[-120px] w-[350px] h-[350px] rounded-full bg-teal-100/30 blur-3xl pointer-events-none"></div>
              <div className="absolute top-[25%] left-[25%] w-[380px] h-[280px] rounded-full bg-orange-200/15 blur-3xl pointer-events-none"></div>
              
              {/* Brand Logo/Badge di Kanan Atas */}
              <div className="absolute top-4 right-6 md:top-6 md:right-8 select-none pointer-events-none z-20">
                <img 
                  src={settings.logoBrand || bestBadgeImg} 
                  className="h-20 w-20 object-contain transform hover:scale-105 transition-transform duration-300"
                  alt="Premium IPPI Brand Badge" 
                  referrerPolicy="no-referrer"
                />
              </div>

              {/* Gold watermark logos */}
              <div className="absolute inset-0 bg-[radial-gradient(#dca41508_1.5px,transparent_1.5px)] [background-size:20px_20px] pointer-events-none"></div>
              
              <div className="relative z-10 flex flex-col items-center">
                
                {/* Logo Koperasi di tengah-tengah diatas tulisan KOPERASI IPPI DPW JAWA TIMUR */}
                <div className="flex justify-center items-center mb-3">
                  {settings.logo ? (
                    <img src={settings.logo} className="h-20 w-20 object-contain drop-shadow-sm transform transition duration-300 hover:scale-105" alt="Logo Resmi Koperasi" />
                  ) : (
                    <div className="w-16 h-16 bg-amber-50/90 border-2 border-dashed border-amber-500 rounded-full flex items-center justify-center text-amber-600 shadow-xs">
                      <Award className="w-8 h-8" />
                    </div>
                  )}
                </div>

                <p className="text-[#0c4a80] font-extrabold tracking-widest text-xs md:text-sm uppercase mb-1 drop-shadow-xs">
                  KOPERASI IPPI DPW JAWA TIMUR
                </p>
                <p className="text-[9px] text-[#dca415] font-bold tracking-widest uppercase mb-4 max-w-xs md:max-w-md mx-auto">
                  SK PENDIRIAN: {settings.noIjinPendirian || 'AHU-0008412.AH.01.26.TAHUN-2024'}
                </p>

                <h1 className="text-2xl md:text-3xl font-serif font-black text-slate-950 tracking-tight leading-none mb-1">
                  SERTIFIKAT KELULUSAN
                </h1>
                <p className="text-xs md:text-sm text-slate-600 font-medium tracking-wide uppercase border-t border-b border-slate-300 py-1 px-8 mb-6">
                  Certificate of Professional Achievement
                </p>

                <p className="text-xs text-slate-500 font-medium italic mb-2">Dengan ini menyatakan bahwa anggota koperasi:</p>
                
                <h2 className="text-xl md:text-3xl font-black text-blue-950 tracking-tight mb-2 underline ornament underline-offset-8 font-serif">
                  {userProgress.memberName || currentUser?.nama || 'Nama Peserta'}
                </h2>
                
                {currentUser?.noAnggota && (
                  <p className="text-[11px] text-slate-500 font-mono font-bold uppercase tracking-wider mb-6">
                    Nomor Anggota Resmi: {currentUser.noAnggota}
                  </p>
                )}

                <p className="text-xs text-slate-500 font-medium max-w-md leading-relaxed mx-auto mb-4">
                  Telah merampungkan seluruh kurikulum, uji bab, serta evaluasi komprehensif interaktif secara penuh, dengan pencapaian akademis memuaskan untuk program pembelajaran:
                </p>

                <h3 className="text-md md:text-lg font-bold text-slate-900 bg-slate-50 border border-slate-200/80 px-6 py-2 rounded-xl inline-block mb-6 shadow-sm">
                  {activeCertCourse.title}
                </h3>

                <p className="text-[11px] text-slate-400 font-mono italic mb-8">
                  Kelulusan tervalidasi pada tanggal {userProgress.certifiedAt[activeCertCourse.id] || new Date().toLocaleDateString('id-ID')} dengan Skor Sempurna {userProgress.quizScores[activeCertCourse.id] || 100}%
                </p>

                {/* Dynamic Signatures from managed user database / settings upload */}
                <div className="grid grid-cols-2 gap-12 w-full max-w-lg border-t border-slate-200 pt-6 mt-4">
                  <div className="text-center">
                    <p className="text-[10px] text-slate-400 uppercase font-black tracking-wider leading-none">Mengesahkan,</p>
                    <div className="h-12 flex items-center justify-center py-1">
                      {settings.tandatanganKetua ? (
                        <img src={settings.tandatanganKetua} className="max-h-full max-w-[120px] object-contain mx-auto" alt="Tanda Tangan Ketua Koperasi" />
                      ) : (
                        <div className="h-12"></div>
                      )}
                    </div>
                    <p className="text-[11px] font-bold text-slate-900 border-t border-slate-300 pt-1 mt-1 leading-none">
                      {ketuaFullName}
                    </p>
                    <p className="text-[9px] text-slate-500 font-mono uppercase mt-0.5">Ketua Koperasi</p>
                  </div>

                  <div className="text-center">
                    <p className="text-[10px] text-slate-400 uppercase font-black tracking-wider leading-none">Menyetujui,</p>
                    <div className="h-12 flex items-center justify-center py-1">
                      {settings.tandatanganSekretaris ? (
                        <img src={settings.tandatanganSekretaris} className="max-h-full max-w-[120px] object-contain mx-auto" alt="Tanda Tangan Sekretaris Koperasi" />
                      ) : (
                        <div className="h-12"></div>
                      )}
                    </div>
                    <p className="text-[11px] font-bold text-slate-900 border-t border-slate-300 pt-1 mt-1 leading-none">
                      {sekretarisFullName}
                    </p>
                    <p className="text-[9px] text-slate-500 font-mono uppercase mt-0.5">Sekretaris Koperasi</p>
                  </div>
                </div>

              </div>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* VIEW 2: COURSE INTERACTIVE STUDYING PLAYER             */}
        {/* ======================================================== */}
        {selectedCourse && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 relative z-10">
            
            {/* Left sidebar: lessons list & syllabus panel */}
            <div className="lg:col-span-4 bg-slate-950 p-5 rounded-2xl border border-slate-800 flex flex-col justify-between">
              <div>
                <span className="bg-blue-500/15 text-blue-300 text-[10px] font-extrabold uppercase px-2 py-0.5 rounded border border-blue-500/20">
                  {selectedCourse.category}
                </span>
                <h3 className="text-sm font-black text-white mt-1.5 leading-snug">
                  {selectedCourse.title}
                </h3>
                <p className="text-[11px] text-slate-400 font-medium mt-1">
                  Oleh: {selectedCourse.instructor}
                </p>

                {/* Main Course-level Dynamic External URL (Zoom/Meet/Drive/PDF) */}
                {selectedCourse.externalUrl && (
                  <div className="mt-4 p-3 bg-blue-500/10 border border-blue-500/20 rounded-xl space-y-1.5">
                    <p className="text-[9px] font-black text-blue-400 uppercase tracking-widest leading-none">Tautan Utama Pembelajaran</p>
                    <a
                      href={selectedCourse.externalUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between gap-1.5 px-3 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-[10px] font-extrabold uppercase tracking-wide leading-none transition-all cursor-pointer shadow-sm active:scale-95"
                    >
                      <span className="flex items-center gap-1.5 truncate">
                        <ExternalLink className="w-3.5 h-3.5" />
                        Buka Kelas / Jurnal Luar
                      </span>
                      <span>&rarr;</span>
                    </a>
                  </div>
                )}

                <div className="mt-6 space-y-2.5">
                  <p className="text-[10px] font-extrabold tracking-wider text-slate-500 uppercase">DAFTAR SILABUS MATERI</p>
                  
                  {selectedCourse.lessons.map((lesson, idx) => {
                    const isCurrent = idx === activeLessonIndex && !quizMode;
                    const isFinished = completedLessonIds.includes(lesson.id);
                    const isLocked = idx > activeLessonIndex && !isFinished;

                    return (
                      <button
                        key={lesson.id}
                        type="button"
                        onClick={() => {
                          if (!isLocked) {
                            setActiveLessonIndex(idx);
                            setQuizMode(false);
                            setQuizResult(null);
                          }
                        }}
                        disabled={isLocked}
                        className={`w-full flex items-center gap-3 p-3 rounded-xl border text-left transition-all ${
                          isCurrent 
                            ? 'bg-blue-600/20 border-blue-500 text-white' 
                            : isFinished 
                            ? 'bg-emerald-600/10 border-emerald-500/20 text-slate-300'
                            : isLocked
                            ? 'bg-transparent border-slate-900 text-slate-600 cursor-not-allowed'
                            : 'bg-slate-900 border-slate-800 hover:border-slate-700 text-slate-300'
                        }`}
                      >
                        <div className="shrink-0 font-bold font-mono text-xs">
                          {isFinished ? (
                            <CheckCircle className="w-4 h-4 text-emerald-400" />
                          ) : (
                            <span>{idx + 1}</span>
                          )}
                        </div>
                        <div className="grow">
                          <p className={`text-xs font-black line-clamp-1 ${isCurrent ? 'text-white' : 'text-slate-300'}`}>
                            {lesson.title}
                          </p>
                          <p className="text-[10px] text-slate-400 font-medium mt-0.5 flex items-center gap-1">
                            <Clock className="w-3 h-3 text-slate-500" /> {lesson.duration}
                          </p>
                        </div>
                        <ChevronRight className="w-3 h-3 text-slate-500" />
                      </button>
                    );
                  })}

                  {/* Quiz Option in Menu */}
                  <button
                    type="button"
                    onClick={handleStartQuiz}
                    disabled={!allLessonsCompleted}
                    className={`w-full flex items-center gap-3 p-3 rounded-xl border text-left transition-all ${
                      quizMode 
                        ? 'bg-amber-600/20 border-amber-500 text-white animate-pulse' 
                        : allLessonsCompleted 
                        ? 'bg-amber-600/10 border-amber-500/30 text-amber-200'
                        : 'bg-slate-950 border-slate-900 text-slate-600 cursor-not-allowed'
                    }`}
                  >
                    <div className="shrink-0 p-1 bg-amber-500/10 rounded border border-amber-500/20">
                      <Award className="w-4 h-4 text-amber-500" />
                    </div>
                    <div className="grow">
                      <p className="text-xs font-black">Evaluasi Kuis Akhir</p>
                      <p className="text-[10px] text-slate-400 mt-0.5">Syarat Kelulusan sertifikat (SKOR {selectedCourse.quiz.passingScore}%)</p>
                    </div>
                    {!allLessonsCompleted && <div className="text-[9px] bg-slate-800 text-slate-500 px-1.5 py-0.5 rounded font-bold">TERKUNCI</div>}
                  </button>
                </div>
              </div>

              {/* Back out button */}
              <div className="mt-8 pt-4 border-t border-slate-900">
                <button
                  onClick={() => setSelectedCourse(null)}
                  className="w-full py-2 bg-slate-900 hover:bg-slate-850 rounded-xl border border-slate-800 text-xs text-slate-400 hover:text-white font-bold uppercase transition"
                >
                  Keluar Kelas & Simpan
                </button>
              </div>
            </div>

            {/* Right panel: core studying frame OR quiz frame */}
            <div className="lg:col-span-8 bg-slate-950/60 p-6 md:p-8 rounded-2xl border border-slate-800/80 min-h-[400px] flex flex-col justify-between">
              
              {!quizMode ? (
                // STUDYING MODE
                <div>
                  <div className="flex justify-between items-center border-b border-white/5 pb-4 mb-5">
                    <div>
                      <span className="text-[10px] text-blue-400 font-extrabold uppercase tracking-wider">MATERI BAB {activeLessonIndex + 1} DARI {selectedCourse.lessons.length}</span>
                      <h2 className="text-lg md:text-xl font-black text-white leading-tight">
                        {selectedCourse.lessons[activeLessonIndex].title}
                      </h2>
                    </div>
                    <span className="bg-slate-850 font-mono text-[11px] text-slate-300 border border-slate-804 p-2 rounded-lg shrink-0">
                      ⏱️ {selectedCourse.lessons[activeLessonIndex].duration}
                    </span>
                  </div>

                  {/* Dynamic sub-bab lesson-level external url link block (Zoom, Meet, GDrive, Youtube, slides etc.) */}
                  {selectedCourse.lessons[activeLessonIndex].externalUrl && (
                    <div className="mb-6 p-4 bg-emerald-500/10 border border-emerald-550/20 rounded-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 text-xs">
                      <div className="space-y-0.5">
                        <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest leading-none">Bahan Pendukung Interaktif</p>
                        <p className="text-slate-400 text-[11px] leading-relaxed">Tersedia tautan luar jurnalis, presentasi, zoom meeting, slide, atau referensi media khalayak bab ini.</p>
                      </div>
                      <a
                        href={selectedCourse.lessons[activeLessonIndex].externalUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold uppercase rounded-lg text-[10px] tracking-wider shrink-0 transition-all cursor-pointer shadow-sm active:scale-95 whitespace-nowrap"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        Buka Referensi Bab
                      </a>
                    </div>
                  )}

                  {/* Render Lesson Content conforming to Markdown rules */}
                  <div 
                    className="prose-slate text-sm text-slate-300 leading-relaxed font-normal space-y-4 max-w-none"
                    dangerouslySetInnerHTML={{ __html: selectedCourse.lessons[activeLessonIndex].content }}
                  ></div>

                  {/* Navigation footer of player */}
                  <div className="mt-12 pt-6 border-t border-white/5 flex flex-col sm:flex-row justify-between items-center gap-4">
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          if (activeLessonIndex > 0) {
                            setActiveLessonIndex(prev => prev - 1);
                          }
                        }}
                        disabled={activeLessonIndex === 0}
                        className="p-2.5 bg-slate-900 rounded-xl hover:bg-slate-800 text-slate-300 disabled:opacity-20 transition"
                      >
                        <ArrowLeft className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          if (activeLessonIndex < selectedCourse.lessons.length - 1) {
                            setActiveLessonIndex(prev => prev + 1);
                          }
                        }}
                        disabled={activeLessonIndex === selectedCourse.lessons.length - 1}
                        className="p-2.5 bg-slate-900 rounded-xl hover:bg-slate-800 text-slate-300 disabled:opacity-20 transition"
                      >
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleMarkLessonComplete(selectedCourse.lessons[activeLessonIndex].id)}
                      className={`px-6 py-3 rounded-xl font-black uppercase text-xs tracking-wider transition-all cursor-pointer flex items-center gap-2 ${
                        completedLessonIds.includes(selectedCourse.lessons[activeLessonIndex].id)
                          ? 'bg-slate-800 border border-slate-705 text-emerald-400'
                          : 'bg-blue-600 hover:bg-blue-500 text-white hover:scale-[1.02]'
                      }`}
                    >
                      <CheckSquare className="w-4 h-4" />
                      {completedLessonIds.includes(selectedCourse.lessons[activeLessonIndex].id) 
                        ? "Selesai Dipelajari" 
                        : "Tandai Selesai & Lanjut"}
                    </button>
                  </div>
                </div>
              ) : (
                // INTEGRATED QUIZ SECTION MODE
                <div>
                  <div className="flex justify-between items-center border-b border-white/5 pb-4 mb-6">
                    <div>
                      <span className="text-[10px] text-amber-400 font-extrabold uppercase tracking-wider">EVALUASI KUIS KELULUSAN</span>
                      <h2 className="text-lg md:text-xl font-black text-white leading-tight">Uji Kompetensi Interaktif</h2>
                    </div>
                    <span className="bg-amber-400/10 text-amber-300 border border-amber-500/20 text-xs font-black p-2 rounded-lg">
                      Passing Score: {selectedCourse.quiz.passingScore}%
                    </span>
                  </div>

                  {quizResult === null ? (
                    // Quiz questions loop
                    <div className="space-y-6">
                      <p className="text-xs text-slate-400 font-medium">Silakan jawab seluruh soal pilihan ganda di bawah ini dengan cermat. Nilai kelulusan minimal akan divalidasi langsung untuk merilis Sertifikat Pembelajaran.</p>
                      
                      {selectedCourse.quiz.questions.map((q, qIndex) => (
                        <div key={q.id} className="p-4 bg-slate-900/80 rounded-2xl border border-slate-850 space-y-3">
                          <p className="text-xs font-black text-slate-200">
                            {qIndex + 1}. {q.questionText}
                          </p>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                            {q.options.map((opt, optIndex) => {
                              const isChecked = quizAnswers[q.id] === optIndex;
                              return (
                                <button
                                  type="button"
                                  key={optIndex}
                                  onClick={() => handleSelectAnswer(q.id, optIndex)}
                                  className={`w-full text-left p-3 rounded-xl text-xs font-medium border transition-all ${
                                    isChecked 
                                      ? 'bg-amber-600/20 border-amber-500 text-white' 
                                      : 'bg-slate-950 border-slate-850 text-slate-400 hover:border-slate-700'
                                  }`}
                                >
                                  <span className="font-bold mr-2 uppercase">{String.fromCharCode(97 + optIndex)})</span> 
                                  {opt}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      ))}

                      <div className="pt-4 flex justify-end">
                        <button
                          type="button"
                          onClick={handleSubmitQuiz}
                          disabled={Object.keys(quizAnswers).length < selectedCourse.quiz.questions.length}
                          className="px-6 py-3 bg-amber-600 hover:bg-amber-500 hover:scale-[1.02] text-white font-black uppercase text-xs tracking-wider rounded-xl transition cursor-pointer disabled:opacity-30 disabled:pointer-events-none"
                        >
                          Kirim Hasil Jawaban Kuis
                        </button>
                      </div>
                    </div>
                  ) : (
                    // Quiz result display and processing
                    <div className="text-center py-6 space-y-6 max-w-md mx-auto">
                      <div className="flex justify-center">
                        {quizResult.passed ? (
                          <div className="w-20 h-20 bg-emerald-500/10 border border-emerald-500/30 rounded-full flex items-center justify-center text-emerald-400 animate-pulse">
                            <Award className="w-10 h-10" />
                          </div>
                        ) : (
                          <div className="w-20 h-20 bg-red-500/10 border border-red-500/30 rounded-full flex items-center justify-center text-red-400">
                            <AlertCircle className="w-10 h-10" />
                          </div>
                        )}
                      </div>

                      <div>
                        <h3 className="text-xl font-serif font-black">
                          {quizResult.passed ? "Selamat, Anda Lulus!" : "Belum Lulus Evaluasi"}
                        </h3>
                        <p className="text-3xl font-black mt-2 tracking-tight font-mono text-white">
                          Skor Kelayakan: {quizResult.score}%
                        </p>
                        <p className="text-xs text-slate-400 font-medium mt-2 leading-relaxed">
                          {quizResult.passed 
                            ? "Sertifikat Kelulusan Anda kini telah dibuka dan diterbitkan oleh Dewan Pengurus Koperasi DPW Jatim secara sah."
                            : "Skor Anda minimal harus mencapai 70% untuk dinyatakan berhak mendapatkan sertifikasi modul ini. Jangan patah semangat, silakan tonton ulasan bab materi kembali."}
                        </p>
                      </div>

                      <div className="pt-4 flex justify-center gap-3">
                        {quizResult.passed ? (
                          <>
                            <button
                              type="button"
                              onClick={() => {
                                setViewingCertificateCourseId(selectedCourse.id);
                                setSelectedCourse(null);
                              }}
                              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 hover:scale-[1.02] text-white rounded-xl text-xs font-black uppercase tracking-wider transition cursor-pointer flex items-center gap-1.5"
                            >
                              <Award className="w-4 h-4 text-amber-300" /> Lihat Sertifikat
                            </button>
                            <button
                              type="button"
                              onClick={() => setSelectedCourse(null)}
                              className="px-5 py-2.5 bg-slate-800 hover:bg-slate-750 text-slate-300 rounded-xl text-xs font-black uppercase tracking-wider transition"
                            >
                              Selesai Kelas
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              type="button"
                              onClick={handleStartQuiz}
                              className="px-5 py-2.5 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs font-black uppercase tracking-wider transition cursor-pointer"
                            >
                              Coba Evaluasi Lagi
                            </button>
                            <button
                              type="button"
                              onClick={() => setQuizMode(false)}
                              className="px-5 py-2.5 bg-slate-800 text-slate-300 rounded-xl text-xs font-black uppercase tracking-wider transition"
                            >
                              Ulas Materi Bab
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  )}

                </div>
              )}

            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* VIEW 3: ADMIN MODE (MANAGE COURSES & VIEW CERTIFICATIONS) */}
        {/* ======================================================== */}
        {showAdminTab && (
          <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 z-10 relative space-y-8">
            <div>
              <h2 className="text-lg font-black text-white flex items-center gap-1.5">
                <Sparkles className="w-5 h-5 text-amber-500" />
                Panel Administrasi & Editor Kurikulum LMS
              </h2>
              <p className="text-slate-400 text-xs mt-0.5">Edit kurikulum dinamis yang langsung terekam pada storage database koperasi.</p>
            </div>

            {/* Sub-section 1: Add New Course */}
            <div className="bg-slate-900/60 p-5 rounded-xl border border-slate-850 space-y-4">
              <div className="flex justify-between items-center border-b border-white/5 pb-2">
                <h3 className="text-sm font-black text-amber-400 uppercase tracking-widest">
                  {editingCourseId ? "Sunting Modul Pelatihan / Kursus" : "Buat Modul Pelatihan / Kursus Baru"}
                </h3>
                {editingCourseId && (
                  <button
                    type="button"
                    onClick={() => {
                      setEditingCourseId(null);
                      setNewCourse({
                        title: '',
                        category: 'UMKM Modern',
                        instructor: '',
                        description: '',
                        duration: '2 Jam',
                        image: '',
                        externalUrl: '',
                        lessons: [{ id: 'new-l1', title: 'Materi Bab 1', content: 'Tulis detail isi materi Bab 1 di sini...', duration: '15 Menit', order: 1, externalUrl: '' }],
                        quiz: { passingScore: 70, questions: [{ id: 'new-q1', questionText: 'Apa pengertian wirausaha menurut UU?', options: ['Pilihan A', 'Pilihan B', 'Pilihan C', 'Pilihan D'], correctOptionIndex: 0 }] }
                      });
                    }}
                    className="px-3 py-1 bg-red-600/20 hover:bg-red-600 text-red-200 text-[10px] font-bold rounded-lg transition"
                  >
                    Batal Sunting
                  </button>
                )}
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] text-slate-400 font-extrabold uppercase mb-1">Judul Kursus Pendidikan</label>
                  <input
                    type="text"
                    value={newCourse.title}
                    onChange={(e) => setNewCourse(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Contoh: Akuntansi Koperasi Syariah Dasar"
                    className="w-full bg-slate-950 text-white border border-slate-800 px-3 py-2 rounded-xl text-xs placeholder:text-slate-600 focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-[10px] text-slate-400 font-extrabold uppercase mb-1">Kategori Rumpun Ilmu</label>
                  <select
                    value={newCourse.category}
                    onChange={(e) => setNewCourse(prev => ({ ...prev, category: e.target.value as any }))}
                    className="w-full bg-slate-950 text-white border border-slate-800 px-3 py-2 rounded-xl text-xs focus:outline-none focus:border-blue-500"
                  >
                    <option value="UMKM Modern">UMKM Modern</option>
                    <option value="Pecinta Koperasi">Pecinta Koperasi</option>
                    <option value="Manajemen Keuangan">Manajemen Keuangan</option>
                    <option value="Digitalisasi Bisnis">Digitalisasi Bisnis</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] text-slate-400 font-extrabold uppercase mb-1">Dosen / Instruktur Ahli</label>
                  <input
                    type="text"
                    value={newCourse.instructor}
                    onChange={(e) => setNewCourse(prev => ({ ...prev, instructor: e.target.value }))}
                    placeholder="Contoh: Hj. Kartika Wardhani, S.E., Ak."
                    className="w-full bg-slate-950 text-white border border-slate-800 px-3 py-2 rounded-xl text-xs placeholder:text-slate-600 focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-[10px] text-slate-400 font-extrabold uppercase mb-1">Estimasi Durasi Belajar</label>
                  <input
                    type="text"
                    value={newCourse.duration}
                    onChange={(e) => setNewCourse(prev => ({ ...prev, duration: e.target.value }))}
                    placeholder="Contoh: 3 Jam"
                    className="w-full bg-slate-950 text-white border border-slate-800 px-3 py-2 rounded-xl text-xs placeholder:text-slate-600 focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-[10px] text-slate-400 font-extrabold uppercase mb-1">Tautan URL Luar Kursus (Opsional, e.g. Link Zoom / Meet)</label>
                  <input
                    type="text"
                    value={newCourse.externalUrl}
                    onChange={(e) => setNewCourse(prev => ({ ...prev, externalUrl: e.target.value }))}
                    placeholder="https://zoom.us/j/examples..."
                    className="w-full bg-slate-950 text-white border border-slate-800 px-3 py-2 rounded-xl text-xs placeholder:text-slate-600 focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-[10px] text-slate-400 font-extrabold uppercase mb-1">Foto Sampul Kursus (Opsional)</label>
                  <div className="flex gap-2 items-center">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onloadend = () => {
                            setNewCourse(prev => ({ ...prev, image: reader.result as string }));
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                      className="text-xs text-slate-400 bg-slate-950 border border-slate-800 rounded-xl px-2 py-1.5 w-full cursor-pointer focus:outline-none"
                    />
                    {newCourse.image && (
                      <img src={newCourse.image} alt="Sampul preview" className="w-10 h-10 object-cover rounded-lg border border-slate-800 shrink-0" />
                    )}
                  </div>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-[10px] text-slate-400 font-extrabold uppercase mb-1">Deskripsi Singkat Silabus</label>
                  <textarea
                    rows={2}
                    value={newCourse.description}
                    onChange={(e) => setNewCourse(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Tulis ulasan silabus di sini..."
                    className="w-full bg-slate-950 text-white border border-slate-800 px-3 py-2 rounded-xl text-xs placeholder:text-slate-600 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Dynamic lessons container */}
              <div className="space-y-2 pt-2 border-t border-white/5">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] text-slate-400 font-bold uppercase">STRUKTUR BAB MATERI ({newCourse.lessons.length} Bab)</span>
                  <button
                    type="button"
                    onClick={handleAddLessonField}
                    className="px-2.5 py-1 bg-slate-850 hover:bg-slate-800 text-[10px] font-bold text-blue-400 rounded-lg border border-slate-800 cursor-pointer"
                  >
                    + Tambah Slot Bab Baru
                  </button>
                </div>

                {newCourse.lessons.map((less, lessIdx) => (
                  <div key={lessIdx} className="bg-slate-950 p-3.5 rounded-xl border border-slate-850 space-y-2.5 text-xs text-slate-300">
                    <div className="flex justify-between items-center border-b border-white/5 pb-1.5">
                      <span className="font-extrabold text-[10px] text-blue-400 uppercase">Bab {lessIdx + 1}</span>
                      {newCourse.lessons.length > 1 && (
                        <button
                          type="button"
                          onClick={() => {
                            const updated = newCourse.lessons.filter((_, i) => i !== lessIdx);
                            setNewCourse(prev => ({ ...prev, lessons: updated }));
                          }}
                          className="text-[9px] font-black text-red-400 hover:text-red-300 uppercase tracking-wider"
                        >
                          Hapus Slot Bab
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-12 gap-2">
                      <div className="md:col-span-4">
                        <label className="block text-[9px] text-slate-500 font-bold uppercase mb-0.5">Judul Materi Bab</label>
                        <input
                          type="text"
                          value={less.title}
                          onChange={(e) => {
                            const updated = [...newCourse.lessons];
                            updated[lessIdx].title = e.target.value;
                            setNewCourse(prev => ({ ...prev, lessons: updated }));
                          }}
                          placeholder="Nama sub-materi"
                          className="w-full bg-slate-900 border border-slate-800 px-2.5 py-1.5 rounded-lg text-xs"
                        />
                      </div>
                      <div className="md:col-span-6">
                        <label className="block text-[9px] text-slate-500 font-bold uppercase mb-0.5">Isi Ringkasan / Buku Bacaan Pembelajaran</label>
                        <textarea
                          rows={2}
                          value={less.content}
                          onChange={(e) => {
                            const updated = [...newCourse.lessons];
                            updated[lessIdx].content = e.target.value;
                            setNewCourse(prev => ({ ...prev, lessons: updated }));
                          }}
                          placeholder="Isi pembelajaran materi..."
                          className="w-full bg-slate-900 border border-slate-800 px-2.5 py-1.5 rounded-lg text-xs"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-[9px] text-slate-500 font-bold uppercase mb-0.5">Durasi</label>
                        <input
                          type="text"
                          value={less.duration}
                          onChange={(e) => {
                            const updated = [...newCourse.lessons];
                            updated[lessIdx].duration = e.target.value;
                            setNewCourse(prev => ({ ...prev, lessons: updated }));
                          }}
                          placeholder="15 Menit"
                          className="w-full bg-slate-900 border border-slate-800 px-2.5 py-1.5 rounded-lg text-xs"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[9px] text-slate-500 font-bold uppercase mb-0.5">Tautan URL Luar Materi Bab (Opsional, e.g. Video YouTube / Slides / GDrive)</label>
                      <input
                        type="text"
                        value={less.externalUrl || ''}
                        onChange={(e) => {
                          const updated = [...newCourse.lessons];
                          updated[lessIdx].externalUrl = e.target.value;
                          setNewCourse(prev => ({ ...prev, lessons: updated }));
                        }}
                        placeholder="https://youtube.com/watch?v=..."
                        className="w-full bg-slate-900 border border-slate-800 px-2.5 py-1 rounded-lg text-xs"
                      />
                    </div>
                  </div>
                ))}
              </div>

              {/* Dynamic quiz questions container */}
              <div className="space-y-2 pt-2 border-t border-white/5">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] text-slate-400 font-bold uppercase">PERTANYAAN EVALUASI KUIS KELULUSAN</span>
                  <button
                    type="button"
                    onClick={handleAddQuestionField}
                    className="px-2.5 py-1 bg-slate-850 hover:bg-slate-800 text-[10px] font-bold text-amber-400 rounded-lg border border-slate-800 cursor-pointer"
                  >
                    + Tambah Soal MCQ
                  </button>
                </div>

                {newCourse.quiz.questions.map((q, qIndex) => (
                  <div key={qIndex} className="p-3 bg-slate-950 rounded-lg border border-slate-850 space-y-2 text-xs">
                    <div className="flex justify-between items-center">
                      <span className="font-extrabold text-[10px] text-amber-500 mr-2 uppercase">Soal {qIndex + 1}</span>
                      {newCourse.quiz.questions.length > 1 && (
                        <button
                          type="button"
                          onClick={() => {
                            const updated = newCourse.quiz.questions.filter((_, idx) => idx !== qIndex);
                            setNewCourse(prev => ({ ...prev, quiz: { ...prev.quiz, questions: updated } }));
                          }}
                          className="text-[9px] font-black text-red-450 hover:text-red-400 hover:underline uppercase tracking-wider transition-all cursor-pointer"
                        >
                          Hapus Soal
                        </button>
                      )}
                    </div>
                    <div>
                      <input
                        type="text"
                        value={q.questionText}
                        onChange={(e) => {
                          const updated = [...newCourse.quiz.questions];
                          updated[qIndex].questionText = e.target.value;
                          setNewCourse(prev => ({ ...prev, quiz: { ...prev.quiz, questions: updated } }));
                        }}
                        placeholder="Tulis butir pertanyaan kuis..."
                        className="w-full bg-slate-900 border border-slate-850 px-2.5 py-1 rounded-lg text-xs mt-1"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {q.options.map((option, optIdx) => (
                        <input
                          key={optIdx}
                          type="text"
                          value={option}
                          onChange={(e) => {
                            const updated = [...newCourse.quiz.questions];
                            updated[qIndex].options[optIdx] = e.target.value;
                            setNewCourse(prev => ({ ...prev, quiz: { ...prev.quiz, questions: updated } }));
                          }}
                          placeholder={`Pilihan Opsi ${String.fromCharCode(97 + optIdx).toUpperCase()}`}
                          className="bg-slate-900 border border-slate-850 px-2 py-1 rounded text-xs"
                        />
                      ))}
                    </div>

                    <div className="flex items-center gap-2 pt-1">
                      <span className="text-[10px] text-slate-400 font-bold">Opsi Kunci Jawaban Benar:</span>
                      <select
                        value={q.correctOptionIndex}
                        onChange={(e) => {
                          const updated = [...newCourse.quiz.questions];
                          updated[qIndex].correctOptionIndex = parseInt(e.target.value, 10);
                          setNewCourse(prev => ({ ...prev, quiz: { ...prev.quiz, questions: updated } }));
                        }}
                        className="bg-slate-900 text-amber-400 font-black border border-slate-800 rounded px-2 py-0.5 text-[11px]"
                      >
                        <option value="0">Pilihan A</option>
                        <option value="1">Pilihan B</option>
                        <option value="2">Pilihan C</option>
                        <option value="3">Pilihan D</option>
                      </select>
                    </div>
                  </div>
                ))}
              </div>

              <div>
                <button
                  type="button"
                  onClick={handleCreateCourse}
                  className="w-full py-3 bg-blue-600 hover:bg-blue-500 hover:scale-[1.01] text-white font-black text-xs uppercase tracking-wider rounded-xl transition cursor-pointer"
                >
                  Daftarkan & Rilis Kursus Ke Publik
                </button>
              </div>
            </div>

            {/* List and manage current courses */}
            <div className="space-y-2.5">
              <h3 className="text-sm font-black text-slate-300 uppercase tracking-widest border-b border-white/5 pb-2">Manajemen Modul Terdaftar</h3>
              
              <div className="grid grid-cols-1 gap-2">
                {courses.map(course => (
                  <div key={course.id} className="flex justify-between items-center bg-slate-900 p-4 rounded-xl border border-slate-850 gap-4">
                    <div>
                      <span className="text-[9px] bg-blue-500/10 text-blue-300 font-bold border border-blue-500/20 px-2 py-0.5 rounded">
                        {course.category}
                      </span>
                      <h4 className="text-xs font-black text-white mt-1 leading-snug">{course.title}</h4>
                      <p className="text-[10px] text-slate-400 font-medium mt-0.5">Instruktur: {course.instructor} • {course.lessons.length} Bab</p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => handleEditClick(course)}
                        className="p-2.5 bg-amber-500/10 hover:bg-amber-500 text-amber-400 hover:text-white rounded-xl border border-amber-500/20 hover:border-amber-400 transition cursor-pointer"
                        title="Edit Kursus"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteCourse(course.id)}
                        className="p-2.5 bg-red-500/10 hover:bg-red-500 text-red-400 hover:text-white rounded-xl border border-red-500/20 hover:border-red-500 transition cursor-pointer"
                        title="Hapus Kelas"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Students completion stats */}
            <div className="space-y-2.5 pt-2">
              <h3 className="text-sm font-black text-emerald-400 uppercase tracking-widest border-b border-white/5 pb-2">Arsip Riwayat & Kelulusan Anggota</h3>
              
              <div className="bg-slate-900 rounded-xl overflow-hidden border border-slate-850 text-xs">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-slate-950 font-bold text-[10px] text-slate-400 uppercase border-b border-slate-850">
                      <th className="p-3">Nama Anggota</th>
                      <th className="p-3">Modul Selesai</th>
                      <th className="p-3">Skor Tertinggi</th>
                      <th className="p-3">Sertifikasi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-850 text-slate-300 leading-normal">
                    {progressList.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="p-4 text-center text-slate-500 font-medium italic">
                          Belum ada aktivitas pembelajaran terdaftar di server.
                        </td>
                      </tr>
                    ) : (
                      progressList.map(prog => (
                        <tr key={prog.id} className="hover:bg-slate-850/40">
                          <td className="p-3 font-bold text-white">{prog.memberName}</td>
                          <td className="p-3">
                            <span className="font-extrabold text-blue-400">{prog.completedCourseIds.length} Modul</span>
                          </td>
                          <td className="p-3 font-mono text-[11px]">
                            {Object.entries(prog.quizScores).map(([cId, score]) => (
                              <div key={cId} className="flex gap-2">
                                <span className="text-slate-400 truncate max-w-[120px]">{courses.find(c=>c.id===cId)?.title || cId}:</span>
                                <span className="font-bold text-amber-400">{score}%</span>
                              </div>
                            ))}
                          </td>
                          <td className="p-3">
                            {prog.completedCourseIds.map(cId => (
                              <button
                                key={cId}
                                onClick={() => {
                                  // Emulate viewing progress
                                  setViewingCertificateCourseId(cId);
                                  setShowAdminTab(false);
                                }}
                                className="inline-flex items-center gap-1.5 px-2 py-1 bg-emerald-600/10 hover:bg-emerald-600 text-emerald-400 hover:text-white rounded-lg border border-emerald-500/20 text-[10px] mt-1 mr-1 transition font-bold"
                              >
                                <Award className="w-3 h-3" /> Unduh Cert
                              </button>
                            ))}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}

        {/* ======================================================== */}
        {/* VIEW 4: PUBLIC SUMMARY & COURSE DISCOVERY BRICK LIST   */}
        {/* ======================================================== */}
        {!selectedCourse && !showAdminTab && (
          <div className="space-y-6 relative z-10">
            
            {/* Filter buttons */}
            <div className="flex flex-wrap gap-2">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
                    activeCategory === cat 
                      ? 'bg-blue-600 border border-blue-500 text-white shadow-lg' 
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-755 border border-slate-705'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Interactive Cards list */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCourses.map((course) => {
                const isCompleted = userProgress.completedCourseIds.includes(course.id);
                const quizScore = userProgress.quizScores[course.id];
                
                return (
                  <div 
                    key={course.id} 
                    className="bg-slate-950 p-4.5 rounded-2xl border border-slate-850 hover:border-slate-700 transition-all flex flex-col justify-between group h-full"
                  >
                    <div>
                      {/* Embedded dynamic illustration conforming to design-philosophy */}
                      <div className="aspect-video w-full rounded-xl overflow-hidden bg-slate-900 border border-slate-850 relative mb-4">
                        <img 
                          src={course.image} 
                          className="w-full h-full object-contain group-hover:scale-105 transition-all duration-300" 
                          alt={course.title} 
                          referrerPolicy="no-referrer"
                        />
                        <div className="absolute top-2.5 right-2.5 bg-slate-950/80 p-1.5 rounded-lg border border-white/5">
                          <span className="text-[9px] font-extrabold uppercase text-amber-300">{course.category}</span>
                        </div>
                      </div>

                      <h3 className="text-sm font-black text-white group-hover:text-amber-300 transition line-clamp-2 leading-snug">
                        {course.title}
                      </h3>
                      <p className="text-slate-400 text-xs font-medium line-clamp-3 mt-1.5 leading-relaxed">
                        {course.description}
                      </p>
                    </div>

                    <div className="mt-5 pt-4 border-t border-white/5">
                      <div className="flex justify-between items-center text-[11px] text-slate-400 font-medium mb-3.5">
                        <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5 text-slate-500" /> {course.duration}</span>
                        <span>{course.lessons.length} Bab Materi</span>
                      </div>

                      <div className="flex gap-2">
                        {isCompleted ? (
                          <>
                            <button
                              type="button"
                              onClick={() => setViewingCertificateCourseId(course.id)}
                              className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 hover:scale-[1.01] text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-1 cursor-pointer"
                            >
                              <Award className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
                              Sertifikat ({quizScore}%)
                            </button>
                            <button
                              type="button"
                              onClick={() => handleStartCourse(course)}
                              className="px-3 bg-slate-900 hover:bg-slate-850 text-slate-300 border border-slate-800 rounded-xl text-xs font-bold uppercase transition"
                              title="Tinjau Ulang Materi"
                            >
                              Ulas
                            </button>
                          </>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleStartCourse(course)}
                            className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                          >
                            <Play className="w-3.5 h-3.5" /> Mulai Belajar Sekarang
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
