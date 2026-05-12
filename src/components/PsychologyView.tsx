import { useState, useMemo, useEffect } from 'react';
import { X, BookOpen, Heart, Brain, MessageCircle, Search, Shield, Zap, RefreshCw, Star, Info, Target, User, Trophy, PlayCircle, CheckCircle2, XCircle, ArrowRight, Layers, Flame, Ghost, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';

interface PsychologyViewProps {
  onClose: () => void;
}

interface QuizQuestion {
  question: string;
  correctAnswer: string;
  options: string[];
  definition: string;
}

const PSYCH_TERMS = [
  // ... (stays the same, but I'll make sure to use all terms for the quiz)
  {
    term: "Gaslighting",
    category: "Manipulasi",
    definition: "Taktik di mana pasangan bikin lo ragu sama ingatan atau kenyataan lo sendiri. Lo jadi nanya 'Gue yang gila ya?'.",
    signs: ["Lo cuma baperan", "Gue nggak pernah ngomong gitu", "Tadi kan lo yang bilang gitu"],
    icon: <Brain className="text-rose-400" size={18} />
  },
  {
    term: "Hoovering",
    category: "Manipulasi",
    definition: "Upaya 'menyedot' kembali mantan ke dalam hubungan yang toksik setelah putus dengan janji-janji manis palsu.",
    signs: ["Tiba-tiba chat 'Aku udah berubah'", "Nangis-nangis depan rumah", "Pura-pura sakit biar dijenguk"],
    icon: <RefreshCw className="text-rose-500" size={18} />
  },
  {
    term: "Love Bombing",
    category: "Awal Hubungan",
    definition: "Perhatian dan kasih sayang yang berlebihan banget di awal buat 'menjerat' lo secara emosional.",
    signs: ["Ngajak nikah pas baru 1 minggu", "Kasih kado mahal tiba-tiba", "Chat 24/7 tanpa henti"],
    icon: <Zap className="text-rose-400" size={18} />
  },
  {
    term: "Ghosting",
    category: "Komunikasi",
    definition: "Mendadak hilang tanpa kabar kayak ditelan bumi, padahal sebelumnya komunikasi lancar jaya.",
    signs: ["Chat cuma di-read", "Dihapus dari semua sosmed", "Nggak bisa dihubungi sama sekali"],
    icon: <MessageCircle className="text-slate-400" size={18} />
  },
  {
    term: "Projection",
    category: "Defensif",
    definition: "Melemparkan kesalahan atau rasa insecure diri sendiri ke pasangan. Lo yang salah tapi nuduh dia yang gitu.",
    signs: ["Dia yang bohong tapi nuduh lo bohong", "Marah karena lo curiga padahal dia emang mencurigakan", "Insecure tapi bilang lo yang ribet"],
    icon: <Target className="text-indigo-400" size={18} />
  },
  {
    term: "Breadcrumbing",
    category: "Manipulasi",
    definition: "Hanya ngasih 'remah-remah' perhatian supaya lo tetap nungguin, tapi nggak pernah mau komitmen.",
    signs: ["Cuma nge-like story tapi nggak chat", "Chat 'Apa kabar' tiap 2 minggu sekali", "Nggak pernah mau diajak jalan"],
    icon: <Star className="text-amber-400" size={18} />
  },
  {
    term: "Stonewalling",
    category: "Konflik",
    definition: "Membangun 'tembok' kalau lagi berantem. Bukannya diskusi, malah diem seribu bahasa dan nge-block lo secara emosional.",
    signs: ["Silent treatment berminggu-minggu", "Ganti topik tiap diajak ngomong serius", "Keluar dari ruangan pas berantem"],
    icon: <Shield className="text-rose-400" size={18} />
  },
  {
    term: "Mirroring",
    category: "Dinamika",
    definition: "Secara alami meniru gerakan atau gaya bicara pasangan. Biasanya tanda lo udah klop banget sama dia.",
    signs: ["Pake istilah yang sama", "Gaya duduk barengan", "Pesen makanan yang mirip terus"],
    icon: <RefreshCw className="text-emerald-400" size={18} />
  },
  {
    term: "Emotional Availability",
    category: "Kedewasaan",
    definition: "Kesiapan mental buat terbuka, rentan, dan terhubung secara emosional tanpa rasa takut berlebihan.",
    signs: ["Berani ngomongin perasaan", "Nggak lari pas ada konflik", "Dengerin curhat lo dengan tulus"],
    icon: <Heart className="text-emerald-400" size={18} />
  },
  {
    term: "Situationship",
    category: "Dinamika",
    definition: "Lebih dari temen tapi bukan pacar. Nggak ada status jelas meskipun perlakuan udah kayak orang pacaran.",
    signs: ["'Jalanin aja dulu'", "Nggak berani ngenalin ke orang tua", "Nggak ada rencana masa depan"],
    icon: <RefreshCw className="text-indigo-400" size={18} />
  },
  {
    term: "Benign Neglect",
    category: "Kebiasaan",
    definition: "Mengabaikan pasangan bukan karena benci, tapi karena merasa 'terlalu nyaman' sampai lupa buat usaha lagi.",
    signs: ["Udah nggak pernah nge-date", "Lupa hari spesial terus", "Lebih fokus ke HP pas barengan"],
    icon: <Info className="text-slate-400" size={18} />
  },
  {
    term: "Orbiting",
    category: "Sosmed",
    definition: "Udah putus atau ghosting, tapi dia tetap 'beredar' di orbit lo dengan cara pantau semua sosmed lo.",
    signs: ["Selalu jadi yang pertama liat story lo", "Nge-love foto lama lo", "Tapi nggak pernah nge-chat"],
    icon: <RefreshCw className="text-slate-400" size={18} />
  },
  {
    term: "Micro-cheating",
    category: "Kesetiaan",
    definition: "Tindakan kecil yang 'abu-abu' tapi sebenernya udah menjurus ke perselingkuhan secara emosional.",
    signs: ["Tetap install dating apps", "Chat intens sama mantan dgn alasan 'temen'", "Nyembunyiin notif HP"],
    icon: <Target className="text-rose-500" size={18} />
  },
  {
    term: "Boundaries",
    category: "Kesehatan",
    definition: "Batasan sehat buat ngelindungi diri sendiri baik secara fisik maupun mental dari perlakuan orang lain.",
    signs: ["Bisa bilang 'Nggak' tanpa rasa bersalah", "Menghargai privasi HP masing-masing", "Tahu kapan harus stop berantem"],
    icon: <Shield className="text-emerald-500" size={18} />
  },
  {
    term: "Fair Fighting",
    category: "Kedewasaan",
    definition: "Berantem yang konstruktif. Fokus ke masalah, bukan nyerang pribadi, dan nyari solusi bareng.",
    signs: ["Nggak bawa-bawa masa lalu", "Nggak pake kata-kata kasar", "Saling dengerin argumen"],
    icon: <Star className="text-emerald-500" size={18} />
  },
  {
    term: "Love Language",
    category: "Dasar",
    definition: "5 cara utama seseorang mengekpresikan & menerima cinta: Words, Acts, Gifts, Time, atau Touch.",
    signs: ["Lo suka dipuji (Words)", "Suka dibantuin (Acts)", "Suka ditemenin (Time)"],
    icon: <Heart className="text-rose-400" size={18} />
  },
  {
    term: "Attachment Style",
    category: "Dasar",
    definition: "Pola cara lo berhubungan sama orang lain. Ada Secure, Anxious (cemas), dan Avoidant (menghindar).",
    signs: ["Takut ditinggal (Anxious)", "Butuh ruang terus (Avoidant)", "Nyaman & percaya (Secure)"],
    icon: <Brain className="text-indigo-400" size={18} />
  },
  {
    term: "Enmeshment",
    category: "Dinamika",
    definition: "Kondisi di mana batasan antara lo dan pasangan (atau keluarga) jadi kabur banget sampai nggak ada privasi.",
    signs: ["Perasaan dia jadi perasaan lo", "Nggak bisa bikin keputusan sendiri", "Selalu tau password kabeh"],
    icon: <Target className="text-orange-400" size={18} />
  },
  {
    term: "Pocketing",
    category: "Manipulasi",
    definition: "Pasangan sengaja nyembunyiin lo dari lingkaran sosial atau keluarganya, meskipun udah lama jalan.",
    signs: ["Nggak pernah diposting", "Nggak diajak ke acara temen", "Ketemuannya di tempat sepi terus"],
    icon: <Info className="text-slate-400" size={18} />
  },
  {
    term: "Cookie Jarring",
    category: "Manipulasi",
    definition: "Menjadikan lo sebagai 'cadangan' atau opsi kedua kalau hubungan utamanya lagi bermasalah.",
    signs: ["Cuma dicari pas dia lagi berantem", "Sering ilang timbul", "Nggak ada rencana masa depan"],
    icon: <Target className="text-rose-400" size={18} />
  },
  {
    term: "Textlationship",
    category: "Komunikasi",
    definition: "Hubungan yang cuma aktif di chat atau DM, tapi jarang banget atau malah nggak pernah ketemu fisik.",
    signs: ["Chat intens 24/7", "Selalu ada alasan pas diajak ketemu", "Ngerasa deket padahal belum kenal luar-dalam"],
    icon: <MessageCircle className="text-blue-400" size={18} />
  },
  {
    term: "Zombied",
    category: "Sosmed",
    definition: "Versi upgrade dari ghosting. Setelah hilang berbulan-bulan, dia tiba-tiba 'bangkit dari kubur' dan chat lo lagi.",
    signs: ["Tiba-tiba reply story 'Eh apa kabar?'", "Nge-like foto setaun lalu", "Berlagak nggak pernah ghosting"],
    icon: <RefreshCw className="text-slate-500" size={18} />
  },
  {
    term: "Future Faking",
    category: "Manipulasi",
    definition: "Taktik janji-janji manis tentang masa depan (nikah, rumah, liburan) cuma buat 'ngiket' lo biar nggak pergi sekarang.",
    signs: ["Ngomongin anak pas baru kenal", "Janji mau berubah tapi bohong", "Visi masa depan yang terlalu indah buat jadi nyata"],
    icon: <Zap className="text-amber-500" size={18} />
  },
  {
    term: "Triangulation",
    category: "Manipulasi",
    definition: "Sengaja bawa orang ketiga (mantan, temen, atau saingan) ke obrolan buat bikin lo cemburu atau insecure.",
    signs: ["Bandingin lo sama mantannya", "Bilang ada orang lain yang naksir dia", "Sengaja chat orang lain depan lo"],
    icon: <User className="text-indigo-400" size={18} />
  },
  {
    term: "Sunk Cost Fallacy",
    category: "Kognitif",
    definition: "Bertahan di hubungan yang buruk cuma karena lo ngerasa sayang sama 'waktu dan tenaga' yang udah lo investasi-in.",
    signs: ["'Sayang udah 5 tahun bareng'", "'Malu kalau putus sekarang'", "Padahal tiap hari isinya berantem terus"],
    icon: <Target className="text-rose-400" size={18} />
  },
  {
    term: "Passive Aggressive",
    category: "Komunikasi",
    definition: "Cara nyampein kemarahan secara nggak langsung, kayak sindiran halus atau muka jutek tanpa ngomong apa masalahnya.",
    signs: ["'Terserah lo aja lah'", "Ngapain aja dibanting-banting", "Bilang 'Nggak apa-apa' padahal jelas ada apa-apa"],
    icon: <MessageCircle className="text-orange-400" size={18} />
  },
  {
    term: "Emotional Intelligence",
    category: "Kesehatan",
    definition: "Kemampuan buat mahamin, ngelola, dan ngegunain emosi diri sendiri & pasangan secara cerdas.",
    signs: ["Nggak gampang meledak", "Tahu kapan harus minta maaf", "Bisa ngerasain apa yang pasangan rasain"],
    icon: <Brain className="text-emerald-400" size={18} />
  },
  {
    term: "Roaching",
    category: "Manipulasi",
    definition: "Sembunyi-sembunyi pacaran sama banyak orang sekaligus, dan pas ketauan bilangnya 'Kan nggak ada komitmen'.",
    signs: ["Punya banyak 'temen' chat yang mencurigakan", "Hobi nge-gas pas ditanya status", "Sering ilang di jam-jam tertentu"],
    icon: <Info className="text-rose-500" size={18} />
  },
  {
    term: "Kittenfishing",
    category: "Awal Hubungan",
    definition: "Versi ringan dari catfishing. Menampilkan diri 'sedikit' lebih wah (filter, edit, tinggi badan palsu) biar terlihat lebih menarik di dating apps.",
    signs: ["Foto profil beda jauh sama aslinya", "Ngaku-ngaku punya hobi mahal padahal nggak", "Takut banget diajak video call"],
    icon: <User className="text-blue-400" size={18} />
  },
  {
    term: "Soft-launching",
    category: "Sosmed",
    definition: "Mulai pelan-pelan nunjukin kalau punya pasangan di sosmed tanpa nampilin muka jelas (misal: foto dua gelas kopi atau tangan doang).",
    signs: ["Postingan story yang 'misterius'", "Tag yang ditaruh di dalam banget", "Ngetes ombak reaksi temen-temen"],
    icon: <Star className="text-amber-400" size={18} />
  },
  {
    term: "Cushioning",
    category: "Manipulasi",
    definition: "Menjaga hubungan chat dengan beberapa 'cadangan' buat jaga-jaga kalau hubungan utama lo berakhir.",
    signs: ["Masih sering flirty ke orang lain", "Nggak pernah mau hapus dating apps", "Bilangnya 'cuma temen lama'"],
    icon: <Target className="text-rose-400" size={18} />
  },
  {
    term: "Micro-validation",
    category: "Kesehatan",
    definition: "Memberikan perhatian kecil yang konsisten (misal: bilang 'makasih udah dengerin') yang bikin pasangan ngerasa dihargai banget.",
    signs: ["Sering muji hal sepele", "Respons chat yang bikin tenang", "Nggak pelit apresiasi"],
    icon: <CheckCircle2 className="text-emerald-500" size={18} />
  },
  {
    term: "Haunting",
    category: "Sosmed",
    definition: "Doi sengaja muncul di notif lo (search history atau suggestion) buat ngasih tau kalau dia tetap 'ada' di sekitar lo.",
    signs: ["Namanya muncul terus di list viewer story", "Sengaja nge-like foto lama banget", "Tapi nggak pernah nge-chat langsung"],
    icon: <Ghost className="text-slate-400" size={18} />
  },
  {
    term: "Trauma Bonding",
    category: "Dinamika",
    definition: "Keterikatan emosional yang kuat sama orang toksik karena siklus 'disiksa lalu dimanja' yang bikin otak ketagihan.",
    signs: ["Ngerasa cuma dia yang ngertiin lo", "Masih belain dia padahal udah disakiti", "Takut banget kalau dia beneran pergi"],
    icon: <Flame className="text-rose-500" size={18} />
  },
  {
    term: "Negging",
    category: "Manipulasi",
    definition: "Pujian yang sebenernya hinaan buat bikin rasa percaya diri lo turun dan makin haus validasi dari dia.",
    signs: ["'Baju lo bagus, tumben nggak keliatan lebar'", "'Lo pinter ya buat ukuran orang males'", "'Lo cantik kalau lagi nggak make-up'"],
    icon: <Target className="text-orange-400" size={18} />
  },
  {
    term: "Love Map",
    category: "Kesehatan",
    definition: "Pemahaman mendalam tentang dunia internal pasangan; mulai dari hobi, mimpi besar, sampai ketakutan terdalamnya.",
    signs: ["Tahu apa yang bikin dia mood-swing", "Hafal siapa temen masa kecilnya", "Paham impian dia 5 tahun ke depan"],
    icon: <BookOpen className="text-emerald-400" size={18} />
  },
  {
    term: "Codependency",
    category: "Dinamika",
    definition: "Kondisi di mana identitas lo 100% tergantung pada pasangan. Lo ngerasa nggak ada artinya kalau nggak ada dia.",
    signs: ["Selalu ngalah demi kebahagiaan dia", "Nggak punya hobi sendiri lagi", "Sering minta maaf padahal nggak salah"],
    icon: <RefreshCw className="text-indigo-400" size={18} />
  }
];

const RELATIONSHIP_STAGES = [
  {
    stage: "PDKT / Deceptively Sweet",
    subtitle: "The Pursuit",
    description: "Fase pedekate yang penuh 'jaim' dan strategi chat. Jantung deg-degan tiap liat notif, dan tiap perilaku doi terlihat sempurna tanpa celah.",
    duration: "O - 3 Bulan",
    color: "bg-rose-400",
    icon: <Sparkles className="text-white" size={24} />
  },
  {
    stage: "Honey-Pacaran Phase",
    subtitle: "Intimacy & Bonding",
    description: "Resmi jadian! Dunia serasa milik berdua. Hormon cinta lagi di puncaknya, bikin lo ngerasa dia adalah 'the one' yang selama ini dicari.",
    duration: "3 Bulan - 1.5 Tahun",
    color: "bg-pink-500",
    icon: <Heart className="text-white" size={24} />
  },
  {
    stage: "The Reality Wall",
    subtitle: "Crisis & Conflict",
    description: "Filter 'cinta' mulai pudar. Kebiasaan buruk doi mulai keliatan dan jadi bahan berantem. Ini fase penentu: mau dewasa bareng atau udahan.",
    duration: "1.5 - 3 Tahun",
    color: "bg-amber-500",
    icon: <Flame className="text-white" size={24} />
  },
  {
    stage: "Solid & Committed",
    subtitle: "Security & Stability",
    description: "Cinta bukan lagi soal perasaan meledak-ledak, tapi soal komitmen harian. Lo berdua adalah tim solid yang siap ngadepin dunia bareng.",
    duration: "3+ Tahun",
    color: "bg-emerald-500",
    icon: <Shield className="text-white" size={24} />
  }
];

export function PsychologyView({ onClose }: PsychologyViewProps) {
  const [viewMode, setViewMode] = useState<'encyclopedia' | 'stages' | 'quiz'>('encyclopedia');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  
  // Quiz State
  const [isQuizMode, setIsQuizMode] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState<QuizQuestion | null>(null);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [totalAnswered, setTotalAnswered] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [quizFinished, setQuizFinished] = useState(false);

  const QUIZ_LIMIT = 5;

  const generateQuestion = () => {
    if (totalAnswered >= QUIZ_LIMIT) {
      setQuizFinished(true);
      return;
    }
    
    const randomTerm = PSYCH_TERMS[Math.floor(Math.random() * PSYCH_TERMS.length)];
    const distractors = PSYCH_TERMS
      .filter(t => t.term !== randomTerm.term)
      .sort(() => 0.5 - Math.random())
      .slice(0, 3)
      .map(t => t.term);
    
    const options = [randomTerm.term, ...distractors].sort(() => 0.5 - Math.random());
    
    setCurrentQuestion({
      question: `Apa istilah untuk: "${randomTerm.definition}"`,
      correctAnswer: randomTerm.term,
      options,
      definition: randomTerm.definition
    });
    setSelectedAnswer(null);
    setIsAnswered(false);
  };

  const startQuiz = () => {
    setViewMode('quiz');
    setIsQuizMode(true);
    setScore(0);
    setStreak(0);
    setTotalAnswered(0);
    setQuizFinished(false);
    generateQuestion();
  };

  const handleAnswer = (answer: string) => {
    if (isAnswered) return;
    
    setSelectedAnswer(answer);
    setIsAnswered(true);
    setTotalAnswered(prev => prev + 1);
    
    if (answer === currentQuestion?.correctAnswer) {
      setScore(prev => prev + 10 + (streak * 2));
      setStreak(prev => prev + 1);
    } else {
      setStreak(0);
    }
  };

  const categories = useMemo(() => {
    return Array.from(new Set(PSYCH_TERMS.map(t => t.category))).sort();
  }, []);

  const filteredTerms = useMemo(() => {
    let list = PSYCH_TERMS;
    if (activeCategory) {
      list = list.filter(t => t.category === activeCategory);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(t => 
        t.term.toLowerCase().includes(q) || 
        t.definition.toLowerCase().includes(q)
      );
    }
    return list;
  }, [searchQuery, activeCategory]);

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[60] bg-white dark:bg-slate-950 flex flex-col noise-bg"
    >
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Dynamic Header */}
        <header className="shrink-0 p-5 sm:p-8 border-b border-slate-100 dark:border-white/5 bg-white/80 dark:bg-slate-950/80 backdrop-blur-xl z-20">
          <div className="max-w-5xl mx-auto flex flex-col gap-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 sm:gap-4">
                <div className="p-2.5 sm:p-3 bg-rose-500 text-white rounded-2xl shadow-xl shadow-rose-500/20">
                  {viewMode === 'quiz' ? <Trophy size={20} className="sm:w-[24px] sm:h-[24px]" /> : 
                   viewMode === 'stages' ? <Layers size={20} className="sm:w-[24px] sm:h-[24px]" /> : 
                   <BookOpen size={20} className="sm:w-[24px] sm:h-[24px]" />}
                </div>
                <div>
                  <h2 className="text-xl sm:text-2xl font-display font-black uppercase tracking-tight text-slate-900 dark:text-white">
                    {viewMode === 'quiz' ? "Brain Quiz" : 
                     viewMode === 'stages' ? "Love Stages" : 
                     "Psychology 101"}
                  </h2>
                  <p className="text-[9px] sm:text-xs font-black uppercase tracking-[0.2em] text-slate-400 mt-0.5 sm:mt-1">
                    {viewMode === 'quiz' ? `Score: ${score} • Streak: ${streak}` : 
                     viewMode === 'stages' ? "Pahami Fase Hubunganmu" :
                     "Relational Health Encyclopedia"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {viewMode !== 'quiz' && (
                  <div className="flex items-center p-1 bg-slate-100 dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-white/5">
                    <button 
                      onClick={() => setViewMode('encyclopedia')}
                      className={cn(
                        "flex items-center gap-2 px-3 sm:px-4 py-2 rounded-xl text-[8px] sm:text-[9px] font-black uppercase tracking-widest transition-all",
                        viewMode === 'encyclopedia' ? "bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm" : "text-slate-400"
                      )}
                    >
                      <BookOpen size={12} className="sm:w-3 sm:h-3" />
                      Kamus
                    </button>
                    <button 
                      onClick={() => setViewMode('stages')}
                      className={cn(
                        "flex items-center gap-2 px-3 sm:px-4 py-2 rounded-xl text-[8px] sm:text-[9px] font-black uppercase tracking-widest transition-all",
                        viewMode === 'stages' ? "bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm" : "text-slate-400"
                      )}
                    >
                      <Layers size={12} className="sm:w-3 sm:h-3" />
                      Stages
                    </button>
                  </div>
                )}
                
                {viewMode !== 'quiz' && (
                  <button 
                    onClick={startQuiz}
                    className="flex items-center gap-2 px-3 sm:px-4 py-2.5 bg-amber-500 text-white rounded-xl text-[8px] sm:text-[9px] font-black uppercase tracking-widest shadow-lg shadow-amber-500/20 active:scale-95 transition-all"
                  >
                    <PlayCircle size={14} className="sm:w-4 sm:h-4" />
                    Quiz
                  </button>
                )}
                <button 
                  onClick={viewMode !== 'encyclopedia' ? () => { setViewMode('encyclopedia'); setIsQuizMode(false); } : onClose}
                  className="p-2 sm:p-3 bg-slate-50 dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-2xl text-slate-400 transition-all active:scale-90"
                >
                  <X size={20} className="sm:w-[24px] sm:h-[24px]" />
                </button>
              </div>
            </div>

            {viewMode === 'encyclopedia' && (
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                  <input
                    type="text"
                    placeholder="Cari makna atau perilaku..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-2xl py-3.5 pl-11 pr-4 text-sm font-medium focus:outline-none focus:border-rose-400 transition-all shadow-sm"
                  />
                </div>
                <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 no-scrollbar">
                  <button 
                    onClick={() => setActiveCategory(null)}
                    className={cn(
                      "px-4 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all whitespace-nowrap",
                      !activeCategory ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900" : "bg-white dark:bg-slate-900 text-slate-400"
                    )}
                  >
                    All
                  </button>
                  {categories.map(cat => (
                    <button
                      key={cat}
                      onClick={() => setActiveCategory(cat)}
                      className={cn(
                        "px-4 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all whitespace-nowrap",
                        activeCategory === cat ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900" : "bg-white dark:bg-slate-900 text-slate-400"
                      )}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto px-5 py-8 sm:px-8 sm:py-12 relative">
          <div className="max-w-5xl mx-auto h-full">
            <AnimatePresence mode="wait">
              {viewMode === 'quiz' ? (
                <motion.div
                  key="quiz"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="h-full flex flex-col items-center justify-center max-w-2xl mx-auto py-12"
                >
                  <AnimatePresence mode="wait">
                    {quizFinished ? (
                      <motion.div
                        key="result"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="text-center space-y-8 skeuo-card p-12 w-full"
                      >
                        <div className="w-24 h-24 bg-amber-100 dark:bg-amber-950/30 rounded-[2.5rem] flex items-center justify-center mx-auto mb-6">
                          <Trophy size={48} className="text-amber-500" />
                        </div>
                        <div className="space-y-2">
                          <h3 className="text-4xl font-display font-black text-slate-900 dark:text-white uppercase tracking-tight">Quiz Selesai!</h3>
                          <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px]">Poin Kejeniusan Hubungan Lo:</p>
                        </div>
                        
                        <div className="text-6xl font-display font-black text-rose-500">
                          {score}
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl">
                            <div className="text-slate-400 text-[8px] font-black uppercase mb-1">Total Jawab</div>
                            <div className="text-xl font-black">{totalAnswered}</div>
                          </div>
                          <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl">
                            <div className="text-slate-400 text-[8px] font-black uppercase mb-1">Max Streak</div>
                            <div className="text-xl font-black text-emerald-500">{streak}</div>
                          </div>
                        </div>

                        <div className="pt-8 flex flex-col sm:flex-row gap-4">
                          <button
                            onClick={startQuiz}
                            className="flex-1 py-4 bg-rose-500 text-white rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-rose-500/20 active:scale-95 transition-all"
                          >
                            Main Lagi
                          </button>
                          <button
                            onClick={() => { setViewMode('encyclopedia'); setIsQuizMode(false); }}
                            className="flex-1 py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl font-black uppercase tracking-widest active:scale-95 transition-all"
                          >
                            Kembali Belajar
                          </button>
                        </div>
                      </motion.div>
                    ) : (
                      currentQuestion && (
                        <motion.div 
                          key={totalAnswered}
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -20 }}
                          className="w-full space-y-8"
                        >
                          <div className="text-center space-y-4">
                            <div className="flex items-center justify-center gap-1.5">
                              {Array.from({ length: QUIZ_LIMIT }).map((_, i) => (
                                <div 
                                  key={i}
                                  className={cn(
                                    "h-1.5 rounded-full transition-all duration-500",
                                    i < totalAnswered ? "w-8 bg-rose-500" : "w-1.5 bg-slate-200 dark:bg-slate-800"
                                  )}
                                />
                              ))}
                            </div>
                            <div className="inline-flex items-center gap-2 px-3 py-1 bg-slate-100 dark:bg-slate-900 rounded-lg text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">
                              <Target size={10} className="text-rose-500" />
                              Question {totalAnswered + 1} / {QUIZ_LIMIT}
                            </div>
                            <h3 className="text-2xl sm:text-3xl font-display font-black text-slate-900 dark:text-white leading-tight max-w-lg mx-auto">
                              {currentQuestion.question}
                            </h3>
                          </div>

                          <div className="grid grid-cols-1 gap-4">
                            <AnimatePresence mode="popLayout">
                              {currentQuestion.options.map((option, oIdx) => {
                                const isCorrect = option === currentQuestion.correctAnswer;
                                const isSelected = option === selectedAnswer;
                                
                                return (
                                  <motion.button
                                    key={option}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: oIdx * 0.05 }}
                                    onClick={() => handleAnswer(option)}
                                    disabled={isAnswered}
                                    className={cn(
                                      "p-6 rounded-[2rem] border-2 text-left transition-all duration-300 flex items-center justify-between group relative overflow-hidden",
                                      !isAnswered && "bg-white dark:bg-slate-900 border-slate-100 dark:border-white/5 hover:border-rose-400 dark:hover:border-rose-400 hover:scale-[1.02] active:scale-[0.98]",
                                      isAnswered && isCorrect && "bg-emerald-50 dark:bg-emerald-950/20 border-emerald-500 text-emerald-700 dark:text-emerald-400",
                                      isAnswered && isSelected && !isCorrect && "bg-rose-50 dark:bg-rose-950/20 border-rose-500 text-rose-700 dark:text-rose-400",
                                      isAnswered && !isSelected && !isCorrect && "opacity-50 grayscale"
                                    )}
                                  >
                                    <span className="text-lg font-bold relative z-10">{option}</span>
                                    {isAnswered && isCorrect && <CheckCircle2 className="text-emerald-500 relative z-10" size={24} />}
                                    {isAnswered && isSelected && !isCorrect && <XCircle className="text-rose-500 relative z-10" size={24} />}
                                    
                                    {isAnswered && isCorrect && (
                                      <motion.div 
                                        initial={{ scale: 0, opacity: 0 }}
                                        animate={{ scale: 2, opacity: 0.1 }}
                                        className="absolute inset-0 bg-emerald-500 rounded-full"
                                      />
                                    )}
                                  </motion.button>
                                );
                              })}
                            </AnimatePresence>
                          </div>

                          {isAnswered && (
                            <motion.div
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              className="space-y-6 pt-4"
                            >
                              <div className={cn(
                                "p-4 rounded-2xl text-center text-sm font-bold flex items-center justify-center gap-2",
                                selectedAnswer === currentQuestion.correctAnswer ? "bg-emerald-500 text-white" : "bg-rose-500 text-white"
                              )}>
                                {selectedAnswer === currentQuestion.correctAnswer ? (
                                  <><Trophy size={16} /> Mantap! Lo paham banget.</>
                                ) : (
                                  <><Info size={16} /> Yah, salah dikit. Belajar lagi!</>
                                )}
                              </div>
                              
                              <div className="flex justify-center">
                                <button
                                  onClick={generateQuestion}
                                  className="px-8 py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl text-xs font-black uppercase tracking-[0.3em] shadow-xl hover:scale-105 active:scale-95 transition-all flex items-center gap-3"
                                >
                                  {totalAnswered >= QUIZ_LIMIT ? "Lihat Hasil" : "Lanjut Pertanyaan"} <ArrowRight size={16} />
                                </button>
                              </div>
                            </motion.div>
                          )}
                        </motion.div>
                      )
                    )}
                  </AnimatePresence>
                </motion.div>
              ) : viewMode === 'stages' ? (
                <motion.div
                  key="stages"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-12"
                >
                  <div className="text-center max-w-2xl mx-auto space-y-4">
                    <h3 className="text-3xl font-display font-black text-slate-900 dark:text-white uppercase tracking-tight">The Love Cycle</h3>
                    <p className="text-slate-500 text-sm leading-relaxed">
                      Setiap hubungan pasti melewati fase-fase ini. Memahami sedang di posisi mana bisa ngebantu lo lebih dewasa dalam ngejalaninnya.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-12 relative pb-20 mt-12">
                    <div className="absolute top-0 bottom-0 left-[2.25rem] md:left-1/2 w-0.5 bg-rose-500/10 md:-translate-x-1/2 block" />
                    
                    {RELATIONSHIP_STAGES.map((stage, idx) => (
                      <motion.div
                        key={stage.stage}
                        initial={{ opacity: 0, x: idx % 2 === 0 ? -30 : 30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true, margin: "-100px" }}
                        className={cn(
                          "skeuo-card p-6 sm:p-8 relative z-10 flex flex-col items-center text-center group transition-all duration-500",
                          idx % 2 === 1 ? "md:mt-24" : ""
                        )}
                      >
                        {/* Connecting Dot */}
                        <div className={cn(
                          "absolute top-1/2 w-6 h-6 rounded-full bg-white dark:bg-slate-950 border-4 border-rose-500 shadow-xl z-20 transition-all duration-500 group-hover:scale-125",
                          "left-[2.25rem] md:left-autos translate-x-[-1.125rem]", // Mobile default
                          idx % 2 === 0 ? "md:left-full md:translate-x-[-1.125rem] md:ml-4" : "md:right-full md:translate-x-[1.125rem] md:mr-4"
                        )} />

                        <div className={cn(
                          "w-16 h-16 sm:w-24 sm:h-24 rounded-3xl flex items-center justify-center mb-8 shadow-2xl relative transition-transform duration-500 group-hover:rotate-6",
                          stage.color
                        )}>
                          {stage.icon}
                          <div className="absolute -bottom-3 -right-3 bg-white dark:bg-slate-950 text-slate-900 dark:text-white w-10 h-10 sm:w-12 sm:h-12 rounded-2xl flex items-center justify-center text-xs sm:text-sm font-black border-4 border-slate-50 dark:border-slate-950 shadow-lg ring-1 ring-slate-200 dark:ring-white/5">
                            {idx + 1}
                          </div>
                        </div>

                        <div className="space-y-1 mb-4">
                          <h4 className="text-2xl font-display font-black text-slate-900 dark:text-white uppercase tracking-tight group-hover:text-rose-500 transition-colors">
                            {stage.stage}
                          </h4>
                          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-rose-500">
                            {stage.subtitle}
                          </p>
                        </div>

                        <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed mb-8">
                          {stage.description}
                        </p>

                        <div className="mt-auto px-6 py-2.5 bg-slate-50 dark:bg-slate-900/50 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 border border-slate-100 dark:border-white/5">
                          EST. TIME: {stage.duration}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 pb-20">
                  {filteredTerms.map((item, idx) => (
                    <motion.div
                      key={item.term}
                      layout
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.02 }}
                      className="skeuo-card p-5 sm:p-6 flex flex-col group hover:border-rose-200 dark:hover:border-rose-900 transition-all"
                    >
                      <div className="flex items-center justify-between mb-4">
                        <div className="p-2 sm:p-3 bg-white dark:bg-slate-900 rounded-2xl shadow-sm ring-1 ring-slate-100 dark:ring-white/5">
                          {item.icon}
                        </div>
                        <span className="text-[8px] font-black uppercase tracking-widest text-slate-400 bg-slate-50 dark:bg-slate-900 px-2 py-1 rounded-lg">
                          {item.category}
                        </span>
                      </div>
                      
                      <h3 className="text-lg font-display font-black text-slate-900 dark:text-white mb-2 group-hover:text-rose-500 transition-colors">
                        {item.term}
                      </h3>
                      
                      <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed mb-6 flex-1">
                        {item.definition}
                      </p>

                      <div className="space-y-2 pt-4 border-t border-slate-50 dark:border-white/5">
                        <div className="flex items-center gap-2">
                          <Info size={10} className="text-slate-400" />
                          <span className="text-[8px] font-black uppercase tracking-[0.2em] text-slate-400">Context:</span>
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {item.signs.map((sign, i) => (
                            <span key={i} className="text-[9px] font-medium px-2 py-1 bg-slate-50 dark:bg-slate-900 text-slate-600 dark:text-slate-400 rounded-lg truncate max-w-full">
                              "{sign}"
                            </span>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </AnimatePresence>
            
            {/* Empty State */}
            {viewMode === 'encyclopedia' && filteredTerms.length === 0 && (
              <div className="text-center py-20 px-6">
                <div className="text-4xl mb-4">🔍</div>
                <h3 className="font-display font-bold text-slate-900 dark:text-white">Istilah nggak ketemu</h3>
                <p className="text-sm text-slate-500 mt-2">Coba kata kunci lain atau reset filter.</p>
                <button 
                  onClick={() => { setSearchQuery(''); setActiveCategory(null); }}
                  className="mt-6 px-6 py-2.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl text-[10px] font-black uppercase tracking-[0.2em]"
                >
                  Reset
                </button>
              </div>
            )}
            
            <div className="h-24" />
          </div>
        </main>

        {/* Sticky Bottom Actions */}
        <footer className="shrink-0 p-5 sm:p-8 bg-white/80 dark:bg-slate-950/80 backdrop-blur-xl border-t border-slate-100 dark:border-white/5 flex justify-center z-20">
          <button 
            onClick={viewMode !== 'encyclopedia' ? () => { setViewMode('encyclopedia'); setIsQuizMode(false); } : onClose}
            className="w-full sm:w-auto px-10 py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl text-xs font-black uppercase tracking-[0.3em] shadow-xl hover:scale-[1.02] active:scale-95 transition-all text-center"
          >
            {viewMode === 'quiz' ? "Stop Main Quiz" : viewMode === 'stages' ? "Kembali ke Kamus" : "Selesai Belajar"}
          </button>
        </footer>
      </div>
    </motion.div>
  );
}

