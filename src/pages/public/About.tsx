import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, Target, Eye, Heart, Users, Award, BookOpen, Quote } from 'lucide-react';
import ParticleBackground from '../../components/particles/ParticleBackground';
import { useLang } from '../../components/layout/Navbar';
import { t } from '../../lib/i18n';

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
};

const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.1 } } };

const staff = [
  { name: 'Prof. David Nguyen', role: 'Vice-Chancellor', avatar: 'D', dept: 'Executive', gradient: 'from-blue-600 to-blue-800' },
  { name: 'Dr. Sarah Williams', role: 'Dean of Business', avatar: 'S', dept: 'Business School', gradient: 'from-sky-500 to-blue-600' },
  { name: 'Prof. Michael Chen', role: 'Dean of Technology', avatar: 'M', dept: 'IT School', gradient: 'from-blue-500 to-blue-700' },
  { name: 'Dr. Amina Hassan', role: 'Head of Admissions', avatar: 'A', dept: 'Administration', gradient: 'from-blue-700 to-blue-900' },
  { name: 'Dr. James Kowalski', role: 'Dean of Accounting', avatar: 'J', dept: 'Accounting School', gradient: 'from-sky-600 to-blue-700' },
  { name: 'Ms. Linda Patel', role: 'Head of Student Services', avatar: 'L', dept: 'Student Services', gradient: 'from-blue-400 to-blue-600' },
];

const timeline = [
  { year: '2005', event: 'MIHE founded in Melbourne CBD with 200 founding students' },
  { year: '2009', event: 'Achieved CRICOS registration for international student programs' },
  { year: '2013', event: 'Launched Bachelor of Information Technology program' },
  { year: '2017', event: 'Opened state-of-the-art technology labs and innovation hub' },
  { year: '2021', event: 'Surpassed 5,000 enrolled students milestone' },
  { year: '2024', event: 'Launched digital campus platform and online learning portal' },
];

const values = [
  {
    icon: Target,
    title: 'Our Mission',
    text: 'To provide accessible, high-quality higher education that empowers students to achieve their potential and contribute meaningfully to society and the global economy.',
    gradient: 'from-blue-600 to-blue-800',
    bg: 'bg-blue-50',
  },
  {
    icon: Eye,
    title: 'Our Vision',
    text: "To be Australia's most innovative and student-centric higher education institution, recognised globally for graduate excellence and industry relevance.",
    gradient: 'from-sky-500 to-blue-600',
    bg: 'bg-sky-50',
  },
  {
    icon: Heart,
    title: 'Our Values',
    text: "Integrity, inclusivity, academic excellence, industry relevance, and a genuine commitment to every student's success guide everything we do.",
    gradient: 'from-blue-700 to-blue-900',
    bg: 'bg-blue-50',
  },
];

export default function About() {
  const { lang } = useLang();

  const values = [
    {
      icon: Target,
      title: t('about_mission_t', lang),
      text: t('about_mission_d', lang),
      gradient: 'from-blue-600 to-blue-800',
      bg: 'bg-blue-50',
    },
    {
      icon: Eye,
      title: t('about_vision_t', lang),
      text: t('about_vision_d', lang),
      gradient: 'from-sky-500 to-blue-600',
      bg: 'bg-sky-50',
    },
    {
      icon: Heart,
      title: t('about_values_t', lang),
      text: t('about_values_d', lang),
      gradient: 'from-blue-700 to-blue-900',
      bg: 'bg-blue-50',
    },
  ];

  const statsRow = [
    { value: '20+', label: t('about_stats1', lang) },
    { value: '8,400+', label: t('about_stats2', lang) },
    { value: '40+', label: t('about_stats3', lang) },
    { value: '96%', label: t('about_stats4', lang) },
  ];

  return (
    <div>
      {/* Hero */}
      <section className="relative pt-28 sm:pt-32 pb-24 sm:pb-32 bg-hero-gradient overflow-hidden">
        <ParticleBackground count={60} connectLines />
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-blue-200/20 rounded-full blur-[120px] pointer-events-none" />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, y: 32 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            >
              <p className="text-blue-600 font-semibold text-xs sm:text-sm uppercase tracking-widest mb-3">{t('about_tag', lang)}</p>
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-slate-900 leading-[1.08] mb-5 sm:mb-6">
                {t('about_h1', lang)} <span className="text-gradient">{t('about_h1_accent', lang)}</span>
              </h1>
              <p className="text-base sm:text-xl text-slate-600 leading-relaxed mb-7 sm:mb-8">
                {t('about_sub', lang)}
              </p>
              <div className="flex flex-wrap gap-4">
                <Link to="/courses" className="btn-primary gap-2">
                  {t('about_explore', lang)} <ArrowRight className="w-4 h-4" />
                </Link>
                <Link to="/admissions" className="btn-secondary">
                  {t('about_apply', lang)}
                </Link>
              </div>
            </motion.div>

            {/* Right: campus image */}
            <motion.div
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
              className="hidden lg:block"
            >
              <div className="relative">
                <div className="rounded-3xl overflow-hidden shadow-2xl border-4 border-white/60">
                  <img
                    src="https://images.pexels.com/photos/1181396/pexels-photo-1181396.jpeg?auto=compress&cs=tinysrgb&w=700"
                    alt="MIHE Leadership"
                    className="w-full h-[380px] object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-blue-900/40 to-transparent" />
                </div>
                {/* Floating quote */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.0, duration: 0.6 }}
                  className="absolute -bottom-6 -left-6 glass rounded-2xl p-5 shadow-card-hover max-w-xs"
                >
                  <Quote className="w-6 h-6 text-blue-400 mb-2" />
                  <p className="text-sm text-slate-700 font-medium leading-snug italic">
                    {t('about_quote', lang)}
                  </p>
                  <p className="text-xs text-blue-600 font-semibold mt-2">— Prof. David Nguyen, Vice-Chancellor</p>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 80" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
            <path d="M0 80L60 74.7C120 69.3 240 58.7 360 53.3C480 48 600 48 720 53.3C840 58.7 960 69.3 1080 72C1200 74.7 1320 69.3 1380 66.7L1440 64V80H0Z" fill="white" />
          </svg>
        </div>
      </section>

      {/* Stats row */}
      <section className="py-10 sm:py-12 bg-white border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6"
          >
            {statsRow.map(({ value, label }) => (
              <motion.div key={label} variants={fadeUp} className="text-center">
                <div className="text-3xl sm:text-4xl font-black text-blue-600 mb-1">{value}</div>
                <div className="text-xs sm:text-sm text-slate-500 font-medium leading-tight">{label}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Mission / Vision / Values */}
      <section className="py-16 sm:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} className="text-center mb-10 sm:mb-14">
            <p className="text-blue-600 font-semibold text-xs sm:text-sm uppercase tracking-widest mb-3">{t('about_mvv_tag', lang)}</p>
            <h2 className="section-title">{t('about_mvv_title', lang)}</h2>
          </motion.div>
          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6"
          >
            {values.map(({ icon: Icon, title, text, gradient, bg }) => (
              <motion.div
                key={title}
                variants={fadeUp}
                className="card p-6 sm:p-8 group hover:-translate-y-1.5 transition-all duration-300 overflow-hidden relative"
              >
                <div className={`absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r ${gradient}`} />
                <div className={`w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br ${gradient} rounded-2xl flex items-center justify-center mb-5 sm:mb-6 shadow-blue group-hover:scale-110 transition-transform duration-300`}>
                  <Icon className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">{title}</h3>
                <p className="text-slate-500 leading-relaxed text-sm">{text}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Timeline */}
      <section className="py-16 sm:py-24 bg-slate-50 overflow-hidden">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} className="text-center mb-16">
            <p className="text-blue-600 font-semibold text-sm uppercase tracking-widest mb-3">{t('about_history_tag', lang)}</p>
            <h2 className="section-title">{t('about_history_title', lang)}</h2>
            <p className="section-subtitle">{t('about_history_sub', lang)}</p>
          </motion.div>
          <div className="relative">
            <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-0.5 bg-gradient-to-b from-blue-200 via-blue-400 to-blue-200 transform md:-translate-x-px" />
            <div className="space-y-10">
              {timeline.map(({ year, event }, i) => (
                <motion.div
                  key={year}
                  initial={{ opacity: 0, x: i % 2 === 0 ? -24 : 24 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, amount: 0.5 }}
                  transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                  className={`relative flex items-start gap-4 sm:gap-6 ${i % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'}`}
                >
                  <div className={`hidden md:block flex-1 ${i % 2 === 0 ? 'text-right pr-10' : 'text-left pl-10'}`}>
                    <div className="card p-5 inline-block shadow-card">
                      <span className="text-2xl font-black text-blue-600">{year}</span>
                      <p className="text-slate-600 text-sm mt-1 max-w-xs leading-relaxed">{event}</p>
                    </div>
                  </div>
                  <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-blue-700 rounded-full border-4 border-white shadow-blue flex-shrink-0 z-10 flex items-center justify-center md:absolute md:left-1/2 md:-translate-x-1/2">
                    <div className="w-2.5 h-2.5 bg-white rounded-full" />
                  </div>
                  <div className="flex-1 md:hidden">
                    <span className="text-lg font-bold text-blue-600">{year}</span>
                    <p className="text-slate-600 text-sm mt-1 leading-relaxed">{event}</p>
                  </div>
                  <div className="hidden md:block flex-1" />
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Staff */}
      <section className="relative py-16 sm:py-24 bg-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} className="text-center mb-10 sm:mb-14">
            <p className="text-blue-600 font-semibold text-xs sm:text-sm uppercase tracking-widest mb-3">{t('about_team_tag', lang)}</p>
            <h2 className="section-title">{t('about_team_title', lang)}</h2>
            <p className="section-subtitle max-w-xl mx-auto text-sm sm:text-lg">
              {t('about_team_sub', lang)}
            </p>
          </motion.div>
          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.1 }}
            className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5"
          >
            {staff.map(({ name, role, avatar, dept, gradient }) => (
              <motion.div
                key={name}
                variants={fadeUp}
                className="card p-5 flex items-center gap-4 hover:-translate-y-1 hover:shadow-blue transition-all duration-300 group"
              >
                <div className={`w-14 h-14 bg-gradient-to-br ${gradient} rounded-2xl flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform`}>
                  <span className="text-white text-xl font-bold">{avatar}</span>
                </div>
                <div className="min-w-0">
                  <p className="font-bold text-slate-900 text-sm">{name}</p>
                  <p className="text-blue-600 text-xs font-semibold mt-0.5">{role}</p>
                  <p className="text-slate-400 text-xs mt-0.5">{dept}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Governance */}
      <section className="py-16 sm:py-20 bg-cta-gradient relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(59,154,225,0.2)_0%,transparent_70%)] pointer-events-none" />
        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}>
            <div className="flex flex-wrap justify-center gap-6 sm:gap-8 mb-12">
              {[
                { icon: Award, label: 'TEQSA Registered', sub: 'Quality Assured' },
                { icon: Users, label: 'CRICOS Provider', sub: 'International Students' },
                { icon: BookOpen, label: 'AQF Accredited', sub: 'Recognised Qualifications' },
              ].map(({ icon: Icon, label, sub }) => (
                <div key={label} className="text-center">
                  <div className="w-16 h-16 bg-white/15 border border-white/25 rounded-2xl flex items-center justify-center mx-auto mb-3">
                    <Icon className="w-8 h-8 text-white" />
                  </div>
                  <p className="text-white font-bold text-sm">{label}</p>
                  <p className="text-blue-200 text-xs mt-0.5">{sub}</p>
                </div>
              ))}
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Accredited & Trustworthy</h2>
            <p className="text-blue-100 leading-relaxed mb-8 max-w-xl mx-auto">
              MIHE is registered with TEQSA and is a CRICOS-registered provider, ensuring your qualification is recognised worldwide.
            </p>
            <Link to="/admissions" className="inline-flex items-center gap-2 px-8 py-4 bg-white text-blue-700 font-bold rounded-xl hover:bg-blue-50 hover:scale-105 transition-all duration-200 shadow-lg">
              Learn How to Apply <ArrowRight className="w-4 h-4" />
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
