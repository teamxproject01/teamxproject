import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { CheckCircle, ArrowRight, FileText, Calendar, UserCheck, CreditCard, Upload, Phone, Clock, Globe } from 'lucide-react';
import ParticleBackground from '../../components/particles/ParticleBackground';
import { useLang } from '../../components/layout/Navbar';
import { t } from '../../lib/i18n';

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
};
const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.1 } } };

const steps = [
  { icon: FileText, title: 'Choose Your Program', desc: 'Browse our CRICOS-registered courses and select the program that aligns with your career goals.', step: '01' },
  { icon: UserCheck, title: 'Check Eligibility', desc: 'Review academic entry requirements, language proficiency scores, and any special admission pathways.', step: '02' },
  { icon: Upload, title: 'Submit Application', desc: 'Complete your online application form and upload supporting documents — transcripts, passport, and English test results.', step: '03' },
  { icon: CreditCard, title: 'Accept & Pay', desc: 'Receive your Letter of Offer, accept via the student portal, and pay your acceptance deposit to confirm your place.', step: '04' },
  { icon: Calendar, title: 'Enrol & Orientate', desc: 'Attend orientation, meet your cohort, and set up your student ID, library access, and learning management system.', step: '05' },
];

const requirements = {
  domestic: [
    'Completed Year 12 / Tertiary qualification',
    'Valid photo ID or birth certificate',
    'Certified academic transcripts',
    'Written statement of purpose (postgraduate)',
  ],
  international: [
    'Valid passport (minimum 6 months validity)',
    'Certified academic transcripts (translated to English)',
    'IELTS 6.0+ (6.5+ for postgraduate) or equivalent',
    'Statement of Purpose',
    'Financial capacity evidence',
    'Overseas Student Health Cover (OSHC)',
  ],
};

const intakes = [
  { date: 'February 2025', status: 'Open Now', statusColor: 'bg-green-100 text-green-700', icon: Calendar },
  { date: 'July 2025', status: 'Applications Open', statusColor: 'bg-blue-100 text-blue-700', icon: Calendar },
  { date: 'November 2025', status: 'Opens May 2025', statusColor: 'bg-amber-100 text-amber-700', icon: Calendar },
];

export default function Admissions() {
  const { lang } = useLang();

  const steps = [
    { icon: FileText,  title: t('adm_step1_t', lang), desc: t('adm_step1_d', lang), step: '01' },
    { icon: UserCheck, title: t('adm_step2_t', lang), desc: t('adm_step2_d', lang), step: '02' },
    { icon: Upload,    title: t('adm_step3_t', lang), desc: t('adm_step3_d', lang), step: '03' },
    { icon: CreditCard,title: t('adm_step4_t', lang), desc: t('adm_step4_d', lang), step: '04' },
    { icon: Calendar,  title: t('adm_step5_t', lang), desc: t('adm_step5_d', lang), step: '05' },
  ];

  const requirements = {
    domestic: lang === 'zh'
      ? ['已完成12年级/高等资格', '有效照片证件或出生证明', '经认证的学业成绩单', '书面目的陈述（研究生）']
      : ['Completed Year 12 / Tertiary qualification', 'Valid photo ID or birth certificate', 'Certified academic transcripts', 'Written statement of purpose (postgraduate)'],
    international: lang === 'zh'
      ? ['有效护照（至少6个月有效期）', '经认证的学业成绩单（翻译成英文）', 'IELTS 6.0+（研究生6.5+）或同等水平', '目的陈述', '经济能力证明', '海外学生医疗保险（OSHC）']
      : ['Valid passport (minimum 6 months validity)', 'Certified academic transcripts (translated to English)', 'IELTS 6.0+ (6.5+ for postgraduate) or equivalent', 'Statement of Purpose', 'Financial capacity evidence', 'Overseas Student Health Cover (OSHC)'],
  };

  const intakes = [
    { date: lang === 'zh' ? '2025年2月' : 'February 2025', status: lang === 'zh' ? '现已开放' : 'Open Now', statusColor: 'bg-green-100 text-green-700', icon: Calendar },
    { date: lang === 'zh' ? '2025年7月' : 'July 2025', status: lang === 'zh' ? '申请开放中' : 'Applications Open', statusColor: 'bg-blue-100 text-blue-700', icon: Calendar },
    { date: lang === 'zh' ? '2025年11月' : 'November 2025', status: lang === 'zh' ? '2025年5月开放' : 'Opens May 2025', statusColor: 'bg-amber-100 text-amber-700', icon: Calendar },
  ];

  return (
    <div>
      {/* Hero */}
      <section className="relative pt-28 sm:pt-32 pb-24 sm:pb-28 bg-hero-gradient overflow-hidden">
        <ParticleBackground count={60} connectLines />
        <div className="absolute bottom-0 right-0 w-[500px] h-[400px] bg-sky-200/25 rounded-full blur-[100px] pointer-events-none" />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, y: 32 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            >
              <p className="text-blue-600 font-semibold text-sm uppercase tracking-widest mb-3">{t('adm_tag', lang)}</p>
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-slate-900 leading-[1.08] mb-5 sm:mb-6">
                {t('adm_h1', lang)} <span className="text-gradient">{t('adm_h1_accent', lang)}</span>
              </h1>
              <p className="text-base sm:text-xl text-slate-600 max-w-xl leading-relaxed mb-7 sm:mb-8">
                {t('adm_sub', lang)}
              </p>
                <div className="flex flex-wrap gap-3 sm:gap-4">
                <Link to="/signup" className="btn-primary gap-2 group text-sm sm:text-base">
                  Start Application <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </Link>
                <Link to="/contact" className="btn-secondary gap-2 text-sm sm:text-base">
                  <Phone className="w-4 h-4" /> Speak to Admissions
                </Link>
              </div>
            </motion.div>

            {/* Quick facts */}
            <motion.div
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
              className="hidden lg:grid grid-cols-2 gap-4"
            >
              {[
                { icon: Clock, label: '2-Week Decision', sub: 'Fast application review', gradient: 'from-blue-600 to-blue-800' },
                { icon: Globe, label: '40+ Countries', sub: 'International student body', gradient: 'from-sky-500 to-blue-600' },
                { icon: Calendar, label: '3 Intakes/Year', sub: 'Flexible start dates', gradient: 'from-blue-500 to-blue-700' },
                { icon: CheckCircle, label: 'No App Fee', sub: 'Free to apply online', gradient: 'from-blue-700 to-blue-900' },
              ].map(({ icon: Icon, label, sub, gradient }) => (
                <div key={label} className={`bg-gradient-to-br ${gradient} rounded-2xl p-6 text-white flex flex-col gap-3`}>
                  <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <div className="font-bold text-lg">{label}</div>
                    <div className="text-white/70 text-xs mt-0.5">{sub}</div>
                  </div>
                </div>
              ))}
            </motion.div>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 80" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
            <path d="M0 80L60 74.7C120 69.3 240 58.7 360 53.3C480 48 600 48 720 53.3C840 58.7 960 69.3 1080 72C1200 74.7 1320 69.3 1380 66.7L1440 64V80H0Z" fill="white" />
          </svg>
        </div>
      </section>

      {/* Steps */}
      <section className="py-16 sm:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} className="text-center mb-12 sm:mb-16">
            <p className="text-blue-600 font-semibold text-xs sm:text-sm uppercase tracking-widest mb-3">{t('adm_steps_tag', lang)}</p>
            <h2 className="section-title">{t('adm_steps_title', lang)}</h2>
            <p className="section-subtitle max-w-xl mx-auto text-sm sm:text-base">{lang === 'zh' ? '清晰、有指导、无压力——从第一次点击到迎新日。' : 'Clear, guided, and stress-free — from first click to orientation day.'}</p>
          </motion.div>
          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.1 }}
            className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 sm:gap-5"
          >
            {steps.map(({ icon: Icon, title, desc, step }, i) => (
              <motion.div key={step} variants={fadeUp} className="relative group">
                <div className="card p-6 h-full flex flex-col hover:-translate-y-1.5 hover:shadow-blue transition-all duration-300">
                  <div className="flex items-center gap-2 mb-5">
                    <div className="w-11 h-11 bg-gradient-to-br from-blue-500 to-blue-700 rounded-xl flex items-center justify-center flex-shrink-0 shadow-blue group-hover:scale-110 transition-transform">
                      <Icon className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-4xl font-black text-blue-100 leading-none">{step}</span>
                  </div>
                  <h3 className="font-bold text-slate-900 mb-2 text-sm">{title}</h3>
                  <p className="text-slate-500 text-xs leading-relaxed flex-1">{desc}</p>
                </div>
                {i < steps.length - 1 && (
                  <div className="hidden md:flex absolute top-9 -right-2.5 z-10 items-center">
                    <ArrowRight className="w-4 h-4 text-blue-300" />
                  </div>
                )}
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Requirements */}
      <section className="py-16 sm:py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} className="text-center mb-10 sm:mb-14">
            <p className="text-blue-600 font-semibold text-xs sm:text-sm uppercase tracking-widest mb-3">{t('adm_req_tag', lang)}</p>
            <h2 className="section-title">{t('adm_req_title', lang)}</h2>
            <p className="section-subtitle max-w-xl mx-auto text-sm sm:text-base">{lang === 'zh' ? '申请前准备好您的文件以加快评估流程。' : 'Gather your documents before you apply to speed up the assessment process.'}</p>
          </motion.div>
          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            className="grid md:grid-cols-2 gap-6 sm:gap-8"
          >
            {/* Domestic */}
            <motion.div variants={fadeUp} className="card p-6 sm:p-8 overflow-hidden relative">
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-green-400 to-green-600" />
              <div className="flex items-center gap-3 mb-5 sm:mb-6">
                <span className="badge bg-green-100 text-green-700 text-xs px-3 py-1">Domestic</span>
                <h3 className="text-lg sm:text-xl font-bold text-slate-900">{t('adm_domestic', lang)}</h3>
              </div>
              <ul className="space-y-3">
                {requirements.domestic.map((r) => (
                  <li key={r} className="flex items-start gap-3 p-2 rounded-lg hover:bg-green-50 transition-colors">
                    <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <CheckCircle className="w-3.5 h-3.5 text-green-600" />
                    </div>
                    <span className="text-slate-600 text-sm">{r}</span>
                  </li>
                ))}
              </ul>
            </motion.div>

            {/* International */}
            <motion.div variants={fadeUp} className="card p-6 sm:p-8 overflow-hidden relative">
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-blue-400 to-blue-600" />
              <div className="flex items-center gap-3 mb-5 sm:mb-6">
                <span className="badge bg-blue-100 text-blue-700 text-xs px-3 py-1">International</span>
                <h3 className="text-lg sm:text-xl font-bold text-slate-900">{t('adm_intl', lang)}</h3>
              </div>
              <ul className="space-y-3">
                {requirements.international.map((r) => (
                  <li key={r} className="flex items-start gap-3 p-2 rounded-lg hover:bg-blue-50 transition-colors">
                    <div className="w-5 h-5 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <CheckCircle className="w-3.5 h-3.5 text-blue-600" />
                    </div>
                    <span className="text-slate-600 text-sm">{r}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Intakes CTA */}
      <section className="py-16 sm:py-24 bg-cta-gradient relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(59,154,225,0.2)_0%,transparent_70%)] pointer-events-none" />
        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}>
            <p className="text-blue-200 font-semibold text-xs sm:text-sm uppercase tracking-widest mb-3">{t('adm_intakes_tag', lang)}</p>
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-8 sm:mb-10">{t('adm_intakes_title', lang)}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-10 sm:mb-12">
              {intakes.map(({ date, status, statusColor, icon: Icon }) => (
                <div key={date} className="bg-white/10 border border-white/20 rounded-2xl p-6 text-left backdrop-blur-sm hover:bg-white/15 transition-colors">
                  <div className="w-10 h-10 bg-white/15 rounded-xl flex items-center justify-center mb-4">
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <div className="text-white font-bold text-lg mb-2">{date}</div>
                  <span className={`badge text-xs ${statusColor}`}>{status}</span>
                </div>
              ))}
            </div>
            <Link
              to="/signup"
              className="inline-flex items-center gap-2 px-6 sm:px-9 py-4 bg-white text-blue-700 font-bold rounded-xl hover:bg-blue-50 hover:scale-105 transition-all duration-200 shadow-lg"
            >
              Begin Your Application <ArrowRight className="w-5 h-5" />
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
