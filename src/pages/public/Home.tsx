import { useEffect, useRef, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import {
  ArrowRight, BookOpen, Users, Award, Globe, ChevronRight,
  Star, TrendingUp, CheckCircle, MapPin, Calendar, Phone,
  Sparkles, Building2, Briefcase, ChevronLeft, ChevronRight as ChevronRightIcon,
  GraduationCap, Briefcase as BriefcaseIcon, Play,
} from 'lucide-react';
import ParticleBackground from '../../components/particles/ParticleBackground';
import { useLang } from '../../components/layout/Navbar';
import { t, type Lang } from '../../lib/i18n';

gsap.registerPlugin(ScrollTrigger);

// ── Carousel slides ──────────────────────────────────────────────────────────

function getSlides(lang: Lang) {
  return [
  {
    id: 1,
    tag: t('home_slide1_tag', lang),
    heading: t('home_slide1_h1', lang),
    headingAccent: t('home_slide1_h2', lang),
    sub: t('home_slide1_sub', lang),
    cta: { label: t('home_slide1_cta', lang), href: '/courses' },
    cta2: { label: t('home_slide1_cta2', lang), href: '/signup' },
    image: 'https://images.pexels.com/photos/1438072/pexels-photo-1438072.jpeg?auto=compress&cs=tinysrgb&w=900',
    chips: [
      { icon: TrendingUp, value: '96%',    label: t('home_stat3_label', lang), pos: 'top-5 left-5',     enter: { x: -16, y: -16 } },
      { icon: Users,      value: '8,400+', label: t('home_stat1_label', lang), pos: 'top-5 right-5',    enter: { x: 16,  y: -16 } },
      { icon: BookOpen,   value: '42+',    label: t('nav_courses', lang),      pos: 'bottom-5 left-5',  enter: { x: -16, y: 16  } },
      { icon: Globe,      value: '60+',    label: t('home_stat4_label', lang), pos: 'bottom-5 right-5', enter: { x: 16,  y: 16  } },
    ],
  },
  {
    id: 2,
    tag: t('home_slide2_tag', lang),
    heading: t('home_slide2_h1', lang),
    headingAccent: t('home_slide2_h2', lang),
    sub: t('home_slide2_sub', lang),
    cta: { label: t('home_slide2_cta', lang), href: '/admissions' },
    cta2: { label: t('home_slide2_cta2', lang), href: '/about' },
    image: 'https://images.pexels.com/photos/1181396/pexels-photo-1181396.jpeg?auto=compress&cs=tinysrgb&w=900',
    chips: [
      { icon: Calendar,    value: 'July 25',  label: t('home_slide2_h1', lang), pos: 'top-5 left-1/2 -translate-x-1/2',    enter: { x: 0,   y: -20 } },
      { icon: MapPin,      value: 'CBD',      label: t('home_badge_campus', lang), pos: 'top-1/2 -translate-y-1/2 right-5', enter: { x: 20,  y: 0   } },
      { icon: Users,       value: lang === 'zh' ? '免费' : 'Free', label: lang === 'zh' ? '入场' : 'Entry', pos: 'top-1/2 -translate-y-1/2 left-5', enter: { x: -20, y: 0   } },
      { icon: CheckCircle, value: lang === 'zh' ? '全部' : 'All',  label: t('nav_courses', lang), pos: 'bottom-5 left-1/2 -translate-x-1/2', enter: { x: 0,   y: 20  } },
    ],
  },
  {
    id: 3,
    tag: t('home_slide3_tag', lang),
    heading: t('home_slide3_h1', lang),
    headingAccent: t('home_slide3_h2', lang),
    sub: t('home_slide3_sub', lang),
    cta: { label: t('home_slide3_cta', lang), href: '/courses' },
    cta2: { label: t('home_slide3_cta2', lang), href: '/admissions' },
    image: 'https://images.pexels.com/photos/267885/pexels-photo-267885.jpeg?auto=compress&cs=tinysrgb&w=900',
    chips: [
      { icon: GraduationCap, value: '1,200+', label: lang === 'zh' ? '毕业生' : 'Graduates',  pos: 'top-5 right-5',     enter: { x: 16,  y: -16 } },
      { icon: BookOpen,      value: lang === 'zh' ? '3年' : '3 yrs', label: lang === 'zh' ? '学制' : 'Duration', pos: 'top-[38%] left-5', enter: { x: -20, y: 0   } },
      { icon: Award,         value: '12+',    label: lang === 'zh' ? '专业方向' : 'Majors',   pos: 'top-[38%] right-5', enter: { x: 20,  y: 0   } },
      { icon: CheckCircle,   value: 'CRICOS', label: lang === 'zh' ? '注册' : 'Registered',   pos: 'bottom-5 left-5',   enter: { x: -16, y: 16  } },
    ],
  },
  {
    id: 4,
    tag: t('home_slide4_tag', lang),
    heading: t('home_slide4_h1', lang),
    headingAccent: t('home_slide4_h2', lang),
    sub: t('home_slide4_sub', lang),
    cta: { label: t('home_slide4_cta', lang), href: '/courses' },
    cta2: { label: t('home_slide4_cta2', lang), href: '/signup' },
    image: 'https://images.pexels.com/photos/2280571/pexels-photo-2280571.jpeg?auto=compress&cs=tinysrgb&w=900',
    chips: [
      { icon: Star,          value: '4.8★',  label: lang === 'zh' ? '评分' : 'Rating',      pos: 'top-5 left-5',     enter: { x: -16, y: -16 } },
      { icon: GraduationCap, value: lang === 'zh' ? '2年' : '2 yrs', label: lang === 'zh' ? '学制' : 'Duration', pos: 'top-5 right-5', enter: { x: 16,  y: -16 } },
      { icon: Globe,         value: lang === 'zh' ? '全球' : 'Global', label: lang === 'zh' ? '认可' : 'Recognition', pos: 'bottom-5 left-5', enter: { x: -16, y: 16 } },
      { icon: TrendingUp,    value: 'MBA',   label: lang === 'zh' ? '旗舰' : 'Flagship',    pos: 'bottom-5 right-5', enter: { x: 16,  y: 16  } },
    ],
  },
  {
    id: 5,
    tag: t('home_slide5_tag', lang),
    heading: t('home_slide5_h1', lang),
    headingAccent: t('home_slide5_h2', lang),
    sub: t('home_slide5_sub', lang),
    cta: { label: t('home_slide5_cta', lang), href: '/about' },
    cta2: { label: t('home_slide5_cta2', lang), href: '/signup' },
    image: 'https://images.pexels.com/photos/3184360/pexels-photo-3184360.jpeg?auto=compress&cs=tinysrgb&w=900',
    chips: [
      { icon: BriefcaseIcon, value: '60+',  label: lang === 'zh' ? '合作伙伴' : 'Partners',    pos: 'top-5 left-1/2 -translate-x-1/2',    enter: { x: 0,   y: -20 } },
      { icon: TrendingUp,    value: '96%',  label: lang === 'zh' ? '就业' : 'Hired',            pos: 'top-[30%] right-5',                  enter: { x: 20,  y: -10 } },
      { icon: Users,         value: lang === 'zh' ? '带薪' : 'Paid', label: lang === 'zh' ? '实习' : 'Internships', pos: 'bottom-[30%] left-5', enter: { x: -20, y: 10  } },
      { icon: Award,         value: lang === 'zh' ? '真实' : 'Real', label: lang === 'zh' ? '经验' : 'Experience',  pos: 'bottom-5 left-1/2 -translate-x-1/2', enter: { x: 0, y: 20 } },
    ],
  },
];
}

// ── Data ─────────────────────────────────────────────────────────────────────

function getStats(lang: Lang) {
  return [
    { value: '8,400+', label: t('home_stat1_label', lang), icon: Users,      color: 'from-blue-500 to-blue-600' },
    { value: '42+',    label: t('home_stat2_label', lang), icon: BookOpen,   color: 'from-sky-500 to-blue-500' },
    { value: '96%',    label: t('home_stat3_label', lang), icon: TrendingUp, color: 'from-blue-600 to-blue-700' },
    { value: '60+',    label: t('home_stat4_label', lang), icon: Globe,      color: 'from-blue-400 to-sky-500' },
  ];
}

function getFeaturedCourses(lang: Lang) {
  return [
    {
      title: lang === 'zh' ? '工商管理学士' : 'Bachelor of Business Administration',
      level: lang === 'zh' ? '本科' : 'Undergraduate',
      duration: lang === 'zh' ? '3年' : '3 years',
      cricos: '0101234A',
      image: 'https://images.pexels.com/photos/3183197/pexels-photo-3183197.jpeg?auto=compress&cs=tinysrgb&w=600',
      tag: lang === 'zh' ? '最受欢迎' : 'Most Popular',
      tagColor: 'bg-amber-100 text-amber-700',
    },
    {
      title: lang === 'zh' ? 'MBA工商管理硕士' : 'Master of Business Administration',
      level: lang === 'zh' ? '研究生' : 'Postgraduate',
      duration: lang === 'zh' ? '2年' : '2 years',
      cricos: '0102345B',
      image: 'https://images.pexels.com/photos/6147369/pexels-photo-6147369.jpeg?auto=compress&cs=tinysrgb&w=600',
      tag: lang === 'zh' ? '需求旺盛' : 'High Demand',
      tagColor: 'bg-blue-100 text-blue-700',
    },
    {
      title: lang === 'zh' ? '信息技术学士' : 'Bachelor of Information Technology',
      level: lang === 'zh' ? '本科' : 'Undergraduate',
      duration: lang === 'zh' ? '3年' : '3 years',
      cricos: '0103456C',
      image: 'https://images.pexels.com/photos/5926389/pexels-photo-5926389.jpeg?auto=compress&cs=tinysrgb&w=600',
      tag: lang === 'zh' ? '增长领域' : 'Growing Field',
      tagColor: 'bg-green-100 text-green-700',
    },
  ];
}

const testimonials = [
  {
    name: 'Sarah Chen',
    role: 'MBA Graduate, 2024',
    avatar: 'S',
    avatarColor: 'from-blue-500 to-blue-700',
    text: { en: 'MIHE gave me the practical skills and global network I needed to launch my own startup. The professors bring real-world experience into every lecture.', zh: 'MIHE给了我创业所需的实践技能和全球网络。教授们将真实的行业经验带入每一堂课。' },
    stars: 5,
    outcome: 'Founded TechVenture AU',
  },
  {
    name: 'James Okafor',
    role: 'Bachelor of IT, 2024',
    avatar: 'J',
    avatarColor: 'from-sky-500 to-blue-600',
    text: { en: 'The curriculum is incredibly up-to-date. I graduated with hands-on experience in AI and cloud computing, which immediately set me apart in the job market.', zh: '课程内容非常与时俱进。我毕业时具备了人工智能和云计算的实践经验，这让我在求职市场中脱颖而出。' },
    stars: 5,
    outcome: 'Software Engineer at Atlassian',
  },
  {
    name: 'Priya Sharma',
    role: 'Bachelor of Accounting, 2023',
    avatar: 'P',
    avatarColor: 'from-blue-600 to-blue-800',
    text: { en: "MIHE's accounting program is perfectly aligned with CPA requirements. I passed my professional exams on the first attempt thanks to the excellent preparation here.", zh: 'MIHE的会计课程与CPA要求完美契合。得益于这里出色的教学，我第一次就通过了专业考试。' },
    stars: 5,
    outcome: 'CPA at Deloitte Melbourne',
  },
];

function getPerks(lang: Lang) {
  return [
    { icon: Building2, label: t('home_perk1', lang), desc: t('home_perk1_desc', lang) },
    { icon: Users,     label: t('home_perk2', lang), desc: t('home_perk2_desc', lang) },
    { icon: Briefcase, label: t('home_perk3', lang), desc: t('home_perk3_desc', lang) },
    { icon: Award,     label: t('home_perk4', lang), desc: t('home_perk4_desc', lang) },
  ];
}

const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
};

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
};

// ── AnimatedCounter ───────────────────────────────────────────────────────────

function AnimatedCounter({ target }: { target: string }) {
  const [display, setDisplay] = useState('0');
  const ref = useRef<HTMLSpanElement>(null);
  const hasRun = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasRun.current) {
          hasRun.current = true;
          const numMatch = target.match(/[\d,.]+/);
          if (!numMatch) { setDisplay(target); return; }
          const num = parseFloat(numMatch[0].replace(',', ''));
          const suffix = target.replace(numMatch[0], '');
          let start = 0;
          const duration = 1400;
          const step = 16;
          const increment = num / (duration / step);
          const timer = setInterval(() => {
            start += increment;
            if (start >= num) {
              setDisplay(target);
              clearInterval(timer);
            } else {
              const rounded = num >= 100 ? Math.floor(start).toLocaleString() : start.toFixed(0);
              setDisplay(rounded + suffix);
            }
          }, step);
        }
      },
      { threshold: 0.5 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target]);

  return <span ref={ref}>{display}</span>;
}

// ── Slide content animation variants ─────────────────────────────────────────

const slideContentVariants = {
  enter: { opacity: 0, y: 32 },
  center: { opacity: 1, y: 0, transition: { duration: 0.65, ease: [0.22, 1, 0.36, 1], staggerChildren: 0.1 } },
  exit: { opacity: 0, y: -20, transition: { duration: 0.4, ease: [0.55, 0, 1, 0.45] } },
};

const slideItemVariants = {
  enter: { opacity: 0, y: 20 },
  center: { opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] } },
  exit: { opacity: 0, y: -10 },
};

const slideImageVariants = {
  enter: () => ({ opacity: 0, x: 100, scale: 0.97 }),
  center: { opacity: 1, x: 0, scale: 1, transition: { duration: 0.85, ease: [0.22, 1, 0.36, 1] } },
  exit: () => ({ opacity: 0, x: -40, scale: 0.97, transition: { duration: 0.55, ease: [0.4, 0, 1, 0.6] } }),
};

// ── Hero Carousel ─────────────────────────────────────────────────────────────

const AUTOPLAY_INTERVAL = 5500;

function HeroCarousel() {
  const { lang } = useLang();
  const slides = getSlides(lang);
  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState(1);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const go = useCallback((index: number, dir: number) => {
    setDirection(dir);
    setCurrent(index);
  }, []);

  const next = useCallback(() => {
    go((current + 1) % slides.length, 1);
  }, [current, go]);

  const prev = useCallback(() => {
    go((current - 1 + slides.length) % slides.length, -1);
  }, [current, go]);

  const goTo = useCallback((index: number) => {
    go(index, index > current ? 1 : -1);
  }, [current, go]);

  useEffect(() => {
    timerRef.current = setInterval(next, AUTOPLAY_INTERVAL);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [next]);

  const resetTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(next, AUTOPLAY_INTERVAL);
  };

  const slide = slides[current];

  return (
    <section className="relative min-h-screen flex flex-col overflow-hidden bg-[#1e0a3c]">
      {/* Subtle radial glow — single accent colour */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-[700px] h-[700px] rounded-full bg-purple-700/10 blur-3xl" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] rounded-full bg-purple-900/20 blur-3xl" />
      </div>

      {/* Decorative geometric rings */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -right-40 w-[600px] h-[600px] rounded-full border border-white/[0.05]" />
        <div className="absolute -bottom-20 -left-20 w-[400px] h-[400px] rounded-full border border-white/[0.04]" />
      </div>

      {/* Particles overlay */}
      <div className="absolute inset-0 pointer-events-none opacity-30">
        <ParticleBackground count={40} density="medium" connectLines />
      </div>

      {/* Right-half full-viewport image (desktop) */}
      <div className="absolute inset-y-0 right-0 w-1/2 hidden lg:block pointer-events-none overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={`hero-img-${slide.id}`}
            initial={{ opacity: 0, x: 120 }}
            animate={{ opacity: 1, x: 0, transition: { duration: 0.9, ease: [0.22, 1, 0.36, 1] } }}
            exit={{ opacity: 0, x: -60, transition: { duration: 0.55, ease: [0.4, 0, 1, 0.6] } }}
            className="absolute inset-0"
          >
            <img src={slide.image} alt={slide.headingAccent} className="w-full h-full object-cover" />
            {/* Strong left-edge fade into the dark background */}
            <div className="absolute inset-0 bg-gradient-to-r from-[#1e0a3c] via-[#1e0a3c]/60 to-transparent" />
            {/* Bottom fade */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#1e0a3c]/60 via-transparent to-transparent" />
          </motion.div>
        </AnimatePresence>

      </div>

      {/* Main content */}
      <div className="relative z-10 flex-1 flex items-center w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-36 lg:pb-28">
        <div className="w-full lg:w-1/2 lg:pr-4">

          {/* Left: text content */}
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={`content-${slide.id}`}
              custom={direction}
              variants={slideContentVariants}
              initial="enter"
              animate="center"
              exit="exit"
            >
              <motion.div variants={slideItemVariants} className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/8 border border-white/15 backdrop-blur-sm rounded-full text-[11px] font-semibold mb-6 text-white/60 tracking-widest uppercase">
                <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse" />
                {slide.tag}
              </motion.div>

              <motion.h1 variants={slideItemVariants} className="text-[2rem] sm:text-[2.6rem] md:text-[3.1rem] font-bold text-white leading-[1.1] tracking-tight">
                <span className="block font-light text-white/70 text-[1.4rem] sm:text-[1.75rem] md:text-[2rem] tracking-normal mb-1">{slide.heading}</span>
                <span className="bg-gradient-to-r from-white via-purple-100 to-purple-300 bg-clip-text text-transparent">
                  {slide.headingAccent}
                </span>
              </motion.h1>

              <motion.p variants={slideItemVariants} className="mt-5 text-sm sm:text-[15px] text-white/55 leading-relaxed max-w-md font-normal tracking-wide">
                {slide.sub}
              </motion.p>

              <motion.div variants={slideItemVariants} className="mt-8 flex flex-wrap gap-3">
                <Link
                  to={slide.cta.href}
                  className="inline-flex items-center gap-2 px-6 sm:px-8 py-3.5 sm:py-4 bg-white text-slate-900 font-bold rounded-xl transition-all duration-200 hover:scale-105 hover:bg-blue-50 shadow-xl text-sm sm:text-base"
                >
                  {slide.cta.label}
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  to={slide.cta2.href}
                  className="inline-flex items-center gap-2 px-6 sm:px-8 py-3.5 sm:py-4 bg-white/10 hover:bg-white/20 border border-white/30 hover:border-white/60 text-white font-semibold rounded-xl backdrop-blur-sm transition-all duration-200 text-sm sm:text-base"
                >
                  {slide.cta2.label}
                </Link>
              </motion.div>

              {/* Trust badges */}
              <motion.div variants={slideItemVariants} className="mt-8 flex flex-wrap gap-3 sm:gap-5">
                {[
                  { icon: MapPin, text: t('home_badge_campus', lang) },
                  { icon: Calendar, text: t('home_badge_intakes', lang) },
                  { icon: Phone, text: t('home_badge_consult', lang) },
                ].map(({ icon: Icon, text }) => (
                  <div key={text} className="flex items-center gap-2 text-white/80 text-xs sm:text-sm font-semibold">
                    <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-white/15 flex items-center justify-center flex-shrink-0">
                      <Icon className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-white" />
                    </div>
                    {text}
                  </div>
                ))}
              </motion.div>
            </motion.div>
          </AnimatePresence>

          {/* Mobile: compact image strip */}
          <div className="lg:hidden mt-6">
            <AnimatePresence mode="wait">
              <motion.div
                key={`mobile-img-${slide.id}`}
                initial={{ opacity: 0, scale: 0.97 }}
                animate={{ opacity: 1, scale: 1, transition: { duration: 0.5 } }}
                exit={{ opacity: 0, transition: { duration: 0.3 } }}
                className="relative w-full rounded-2xl overflow-hidden border border-white/15 shadow-xl"
                style={{ height: 220 }}
              >
                <img src={slide.image} alt={slide.headingAccent} className="absolute inset-0 w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Navigation controls */}
      <div className="absolute bottom-14 left-0 right-0 z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-6">

          {/* Dot indicators + progress bar */}
          <div className="flex items-center gap-2">
            {slides.map((s, i) => (
              <button
                key={s.id}
                onClick={() => { goTo(i); resetTimer(); }}
                className="relative group focus:outline-none"
                aria-label={`Go to slide ${i + 1}`}
              >
                <span className={`block rounded-full transition-all duration-300 ${
                  i === current
                    ? 'w-8 h-2.5 bg-white'
                    : 'w-2.5 h-2.5 bg-white/30 hover:bg-white/60'
                }`} />
                {i === current && (
                  <motion.span
                    key={`progress-${current}`}
                    className="absolute inset-0 rounded-full bg-white/60 origin-left"
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ duration: AUTOPLAY_INTERVAL / 1000, ease: 'linear' }}
                  />
                )}
              </button>
            ))}
          </div>

          {/* Prev / Next arrows */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => { prev(); resetTimer(); }}
              className="w-10 h-10 rounded-xl bg-white/10 hover:bg-white/25 border border-white/20 flex items-center justify-center text-white transition-all duration-200 hover:scale-110 backdrop-blur-sm focus:outline-none"
              aria-label="Previous slide"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={() => { next(); resetTimer(); }}
              className="w-10 h-10 rounded-xl bg-white/10 hover:bg-white/25 border border-white/20 flex items-center justify-center text-white transition-all duration-200 hover:scale-110 backdrop-blur-sm focus:outline-none"
              aria-label="Next slide"
            >
              <ChevronRightIcon className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Wave divider */}
      <div className="absolute bottom-0 left-0 right-0 z-10">
        <svg viewBox="0 0 1440 80" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
          <path d="M0 80L60 74.7C120 69.3 240 58.7 360 53.3C480 48 600 48 720 53.3C840 58.7 960 69.3 1080 72C1200 74.7 1320 69.3 1380 66.7L1440 64V80H0Z" fill="white" />
        </svg>
      </div>
    </section>
  );
}

// ── MIHE in Shorts ───────────────────────────────────────────────────────────

const shorts = [
  { id: 'qp0HIF3SfI4', title: 'How Great Leaders Inspire Action | Simon Sinek', duration: '18:01' },
  { id: 'iCvmsMzlF7o', title: 'The Power of Vulnerability | Brené Brown', duration: '20:19' },
  { id: 'Ks-_Mh1QhMc', title: 'Your Body Language Shapes Who You Are | Amy Cuddy', duration: '21:02' },
  { id: 'rrkrvAUbU9Y', title: 'The Puzzle of Motivation | Dan Pink', duration: '18:36' },
  { id: 'ullgxHECeiw', title: 'Inside the Mind of a Master Procrastinator | Tim Urban', duration: '14:03' },
  { id: 'GXy__kBVq1M', title: 'The Happy Secret to Better Work | Shawn Achor', duration: '12:20' },
];

function ShortCard({ id, title, duration }: { id: string; title: string; duration: string }) {
  const [hovered, setHovered] = useState(false);
  const [tapped, setTapped] = useState(false);
  const isMobile = typeof window !== 'undefined' && window.matchMedia('(hover: none)').matches;

  const playing = isMobile ? tapped : hovered;

  return (
    <motion.div
      whileHover={{ y: -6 }}
      transition={{ duration: 0.25 }}
      className="flex-shrink-0 w-[220px] sm:w-[240px] group"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={() => { if (isMobile) setTapped((v) => !v); }}
    >
      <div className="relative rounded-2xl overflow-hidden aspect-[9/16] bg-slate-900 shadow-md cursor-pointer">
        {playing ? (
          <iframe
            src={`https://www.youtube.com/embed/${id}?autoplay=1&mute=1&rel=0&playsinline=1&loop=1&playlist=${id}&modestbranding=1`}
            allow="autoplay; encrypted-media"
            allowFullScreen
            className="absolute inset-0 w-full h-full"
            style={{ border: 0 }}
          />
        ) : (
          <>
            <img
              src={`https://img.youtube.com/vi/${id}/mqdefault.jpg`}
              alt={title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-12 h-12 bg-white/90 rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                <Play className="w-5 h-5 text-blue-600 ml-0.5" fill="currentColor" />
              </div>
            </div>
            <div className="absolute bottom-3 right-3 bg-black/60 text-white text-xs font-semibold px-2 py-0.5 rounded-md">
              {duration}
            </div>
          </>
        )}
      </div>
      <p className="mt-2.5 text-sm font-semibold text-slate-800 leading-snug line-clamp-2">{title}</p>
    </motion.div>
  );
}

function MiheShorts() {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (dir: number) => {
    if (scrollRef.current) scrollRef.current.scrollBy({ left: dir * 280, behavior: 'smooth' });
  };

  return (
    <div className="relative">
      <button
        onClick={() => scroll(-1)}
        className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-10 w-10 h-10 bg-white border border-slate-200 rounded-full shadow flex items-center justify-center text-slate-600 hover:text-blue-600 hover:border-blue-300 transition-all"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>
      <button
        onClick={() => scroll(1)}
        className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-10 w-10 h-10 bg-white border border-slate-200 rounded-full shadow flex items-center justify-center text-slate-600 hover:text-blue-600 hover:border-blue-300 transition-all"
      >
        <ChevronRightIcon className="w-5 h-5" />
      </button>

      <div
        ref={scrollRef}
        className="flex gap-4 overflow-x-auto scrollbar-hide pb-2 -mx-2 px-2"
        style={{ scrollbarWidth: 'none' }}
      >
        {shorts.map((s) => (
          <ShortCard key={s.id} id={s.id} title={s.title} duration={s.duration} />
        ))}
      </div>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function Home() {
  const { lang } = useLang();
  const stats = getStats(lang);
  const perks = getPerks(lang);
  const featuredCourses = getFeaturedCourses(lang);

  const whyList = lang === 'zh'
    ? [
        '与60多家企业合作的行业导师制',
        '墨尔本CBD最先进的设施',
        '灵活的学习方式：全日制、兼读制、混合式',
        '专属职业就业支持和实习通道',
        '全球认可的资格证书，CRICOS注册',
      ]
    : [
        'Industry mentorship with 60+ corporate partners',
        'State-of-the-art facilities in Melbourne CBD',
        'Flexible study options: full-time, part-time, blended',
        'Dedicated career placement support and internship pathways',
        'Globally recognised qualifications, CRICOS registered',
      ];

  return (
    <div className="overflow-x-hidden">

      {/* ── Hero Carousel ── */}
      <HeroCarousel />

      {/* ── Stats ── */}
      <section className="py-12 sm:py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6"
          >
            {stats.map(({ value, label, icon: Icon, color }) => (
              <motion.div
                key={label}
                variants={fadeUp}
                className="card p-4 sm:p-6 text-center group hover:-translate-y-1.5 transition-all duration-300 overflow-hidden relative"
              >
                <div className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${color} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
                <div className={`w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br ${color} rounded-xl flex items-center justify-center mx-auto mb-3 sm:mb-4 shadow-blue`}>
                  <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </div>
                <div className="text-2xl sm:text-3xl font-bold text-slate-900">
                  <AnimatedCounter target={value} />
                </div>
                <div className="text-xs sm:text-sm text-slate-500 mt-1 font-medium leading-tight">{label}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── Perks strip ── */}
      <section className="py-8 sm:py-10 bg-gradient-to-r from-blue-600 via-blue-700 to-blue-800 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
            {perks.map(({ icon: Icon, label, desc }) => (
              <motion.div
                key={label}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
                className="flex items-center gap-3"
              >
                <div className="w-9 h-9 sm:w-11 sm:h-11 bg-white/15 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Icon className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                </div>
                <div className="min-w-0">
                  <div className="text-white font-semibold text-xs sm:text-sm leading-tight">{label}</div>
                  <div className="text-blue-200 text-xs mt-0.5 hidden sm:block">{desc}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Talks Worth Watching ── */}
      <section className="py-16 sm:py-24 bg-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            className="text-center mb-10 sm:mb-14"
          >
            <p className="text-blue-600 font-semibold text-xs sm:text-sm uppercase tracking-widest mb-3">{t('home_shorts_tag', lang)}</p>
            <h2 className="section-title">{t('home_shorts_title', lang)}</h2>
            <p className="section-subtitle max-w-xl mx-auto">{t('home_shorts_sub', lang)}</p>
          </motion.div>
          <MiheShorts />
        </div>
      </section>

      {/* ── Featured Courses ── */}
      <section className="relative py-16 sm:py-24 bg-slate-50 overflow-hidden">
        <div className="absolute inset-0 opacity-30 hidden md:block">
          <ParticleBackground count={35} density="low" />
        </div>
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            className="text-center mb-10 sm:mb-14"
          >
            <p className="text-blue-600 font-semibold text-xs sm:text-sm uppercase tracking-widest mb-3">{t('home_courses_tag', lang)}</p>
            <h2 className="section-title">{t('home_courses_title', lang)}</h2>
            <p className="section-subtitle max-w-2xl mx-auto text-base sm:text-lg">{t('home_courses_sub', lang)}</p>
          </motion.div>

          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.1 }}
            className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-7"
          >
            {featuredCourses.map((course) => (
              <motion.div
                key={course.title}
                variants={fadeUp}
                className="card overflow-hidden group hover:-translate-y-2 hover:shadow-blue transition-all duration-300 cursor-pointer"
              >
                <div className="relative h-44 sm:h-48 overflow-hidden">
                  <img
                    src={course.image}
                    alt={course.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent" />
                  <span className={`absolute top-3 left-3 px-2.5 py-1 rounded-full text-xs font-bold ${course.tagColor}`}>
                    {course.tag}
                  </span>
                  <span className="absolute bottom-3 left-3 text-xs font-bold uppercase tracking-widest text-white/80">
                    {course.level}
                  </span>
                </div>

                <div className="p-4 sm:p-6">
                  <h3 className="text-base sm:text-lg font-bold text-slate-900 mb-3 sm:mb-4 leading-snug">{course.title}</h3>
                  <div className="space-y-2 text-sm mb-4 sm:mb-5">
                    <div className="flex justify-between py-1.5 border-b border-slate-100">
                      <span className="text-slate-500">{t('home_course_dur', lang)}</span>
                      <span className="font-semibold text-slate-800">{course.duration}</span>
                    </div>
                    <div className="flex justify-between py-1.5">
                      <span className="text-slate-500">CRICOS</span>
                      <span className="font-semibold text-slate-800 font-mono text-xs">{course.cricos}</span>
                    </div>
                  </div>
                  <Link
                    to="/courses"
                    className="inline-flex items-center gap-1.5 text-sm font-semibold text-blue-600 group-hover:gap-3 transition-all duration-200"
                  >
                    {t('home_course_btn', lang)} <ChevronRight className="w-4 h-4" />
                  </Link>
                </div>
              </motion.div>
            ))}
          </motion.div>

          <div className="text-center mt-10 sm:mt-12">
            <Link to="/courses" className="btn-primary gap-2 text-sm sm:text-base">
              {t('home_courses_cta', lang)} <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ── Why MIHE ── */}
      <section className="py-16 sm:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
            <motion.div
              variants={fadeUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.2 }}
            >
              <p className="text-blue-600 font-semibold text-xs sm:text-sm uppercase tracking-widest mb-3">{t('home_perks_tag', lang)}</p>
              <h2 className="section-title mb-5 sm:mb-6">{t('home_perks_title', lang)}</h2>
              <p className="text-slate-500 leading-relaxed mb-6 sm:mb-8 text-sm sm:text-base">{t('home_perks_sub', lang)}</p>
              <div className="space-y-2 sm:space-y-3">
                {whyList.map((item) => (
                  <div key={item} className="flex items-start gap-3 p-2.5 sm:p-3 rounded-xl hover:bg-blue-50 transition-colors duration-200">
                    <div className="w-5 h-5 sm:w-6 sm:h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <CheckCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-green-600" />
                    </div>
                    <span className="text-slate-700 text-xs sm:text-sm font-medium">{item}</span>
                  </div>
                ))}
              </div>
              <div className="mt-8 sm:mt-10">
                <Link to="/about" className="btn-primary gap-2 text-sm sm:text-base">
                  {lang === 'zh' ? '了解MIHE' : 'Learn About MIHE'} <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </motion.div>

            {/* Metric mosaic */}
            <motion.div
              variants={stagger}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.2 }}
              className="grid grid-cols-2 gap-3 sm:gap-4"
            >
              {[
                { label: 'Melbourne CBD', sub: lang === 'zh' ? '黄金校园地段' : 'Prime Campus Location', gradient: 'from-blue-600 to-blue-800', textColor: 'text-white', subColor: 'text-blue-200' },
                { label: '4.8 / 5.0', sub: lang === 'zh' ? '学生满意度' : 'Student Satisfaction', gradient: 'from-sky-50 to-blue-50', textColor: 'text-slate-900', subColor: 'text-slate-500' },
                { label: '96%', sub: lang === 'zh' ? '毕业就业率' : 'Graduate Employment', gradient: 'from-blue-50 to-sky-50', textColor: 'text-slate-900', subColor: 'text-slate-500' },
                { label: lang === 'zh' ? '40+国' : '40+ Nations', sub: lang === 'zh' ? '学生多元化' : 'Student Diversity', gradient: 'from-slate-800 to-slate-900', textColor: 'text-white', subColor: 'text-slate-400' },
              ].map(({ label, sub, gradient, textColor, subColor }) => (
                <motion.div
                  key={label}
                  variants={fadeUp}
                  className={`bg-gradient-to-br ${gradient} rounded-2xl p-5 sm:p-7 flex flex-col justify-between min-h-28 sm:min-h-36 shadow-card`}
                >
                  <div className={`text-xl sm:text-2xl md:text-3xl font-bold ${textColor}`}>{label}</div>
                  <div className={`text-xs sm:text-sm font-medium mt-2 ${subColor}`}>{sub}</div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── Testimonials ── */}
      <section className="relative py-16 sm:py-24 overflow-hidden bg-gradient-to-b from-slate-50 to-white">
        <div className="absolute inset-0 opacity-25 pointer-events-none hidden md:block">
          <ParticleBackground count={28} density="low" />
        </div>
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            className="text-center mb-10 sm:mb-14"
          >
            <p className="text-blue-600 font-semibold text-xs sm:text-sm uppercase tracking-widest mb-3">{t('home_test_tag', lang)}</p>
            <h2 className="section-title">{t('home_test_title', lang)}</h2>
            <p className="section-subtitle max-w-xl mx-auto text-base sm:text-lg">{t('home_test_sub', lang)}</p>
          </motion.div>

          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.1 }}
            className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6"
          >
            {testimonials.map((item) => (
              <motion.div
                key={item.name}
                variants={fadeUp}
                className="card p-5 sm:p-7 hover:-translate-y-1.5 hover:shadow-blue transition-all duration-300 flex flex-col"
              >
                <div className="flex gap-1 mb-4 sm:mb-5">
                  {Array.from({ length: item.stars }).map((_, i) => (
                    <Star key={i} className="w-4 h-4 text-amber-400 fill-amber-400" />
                  ))}
                </div>
                <p className="text-slate-600 leading-relaxed text-sm mb-5 sm:mb-6 flex-1">"{item.text[lang]}"</p>
                <div className="pt-4 border-t border-slate-100">
                  <div className="flex items-center gap-3 mb-3">
                    <div className={`w-10 h-10 sm:w-11 sm:h-11 bg-gradient-to-br ${item.avatarColor} rounded-full flex items-center justify-center flex-shrink-0`}>
                      <span className="text-white font-bold text-sm">{item.avatar}</span>
                    </div>
                    <div>
                      <p className="font-bold text-slate-900 text-sm">{item.name}</p>
                      <p className="text-xs text-slate-500">{item.role}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 px-3 py-1.5 bg-green-50 rounded-lg w-fit">
                    <Briefcase className="w-3 h-3 text-green-600 flex-shrink-0" />
                    <span className="text-xs font-semibold text-green-700">{item.outcome}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── Campus showcase ── */}
      <section className="py-8 sm:py-10 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3"
          >
            {[
              'https://images.pexels.com/photos/159490/yale-university-landscape-universities-schools-159490.jpeg?auto=compress&cs=tinysrgb&w=600',
              'https://images.pexels.com/photos/1516440/pexels-photo-1516440.jpeg?auto=compress&cs=tinysrgb&w=600',
              'https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?auto=compress&cs=tinysrgb&w=600',
              'https://images.pexels.com/photos/3228684/pexels-photo-3228684.jpeg?auto=compress&cs=tinysrgb&w=600',
            ].map((src, i) => (
              <div key={i} className="overflow-hidden rounded-xl sm:rounded-2xl">
                <img
                  src={src}
                  alt="MIHE campus"
                  className="w-full h-36 sm:h-48 object-cover hover:scale-105 transition-transform duration-500"
                />
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-16 sm:py-24 bg-cta-gradient relative overflow-hidden">
        <ParticleBackground count={40} density="low" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(139,92,246,0.25)_0%,transparent_70%)] pointer-events-none" />

        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 bg-white/15 text-white/90 rounded-full text-xs sm:text-sm font-semibold mb-5 sm:mb-6 border border-white/20">
              <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              {lang === 'zh' ? '招生开放 — 2025年2月入学' : 'Applications Open — February 2025 Intake'}
            </div>

            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-5 sm:mb-6 leading-tight">
              {t('home_cta_title', lang)}
            </h2>
            <p className="text-blue-100 text-sm sm:text-lg leading-relaxed mb-8 sm:mb-10 max-w-xl mx-auto">
              {t('home_cta_sub', lang)}
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4">
              <Link
                to="/signup"
                className="inline-flex items-center justify-center gap-2 px-7 sm:px-9 py-3.5 sm:py-4 bg-white text-blue-700 font-bold rounded-xl hover:bg-blue-50 hover:scale-105 transition-all duration-200 shadow-lg"
              >
                {t('home_cta_btn1', lang)} <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                to="/contact"
                className="inline-flex items-center justify-center gap-2 px-7 sm:px-8 py-3.5 sm:py-4 bg-transparent text-white font-semibold rounded-xl border-2 border-white/30 hover:bg-white/15 hover:border-white/60 transition-all duration-200"
              >
                <Phone className="w-4 h-4" /> {lang === 'zh' ? '咨询顾问' : 'Talk to an Adviser'}
              </Link>
            </div>

            <div className="mt-10 sm:mt-12 flex justify-center gap-6 sm:gap-8">
              {[
                { value: '8,400+', label: lang === 'zh' ? '在校学生' : 'Active Students' },
                { value: '96%', label: lang === 'zh' ? '就业率' : 'Employment Rate' },
                { value: '4.8★', label: lang === 'zh' ? '学生评分' : 'Student Rating' },
              ].map(({ value, label }) => (
                <div key={label} className="text-center">
                  <div className="text-xl sm:text-2xl font-bold text-white">{value}</div>
                  <div className="text-blue-200 text-xs font-medium mt-0.5">{label}</div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
