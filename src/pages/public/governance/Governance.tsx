import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowLeft, Users, GraduationCap, BookOpen, Scale, FileCheck, Award, Shield } from 'lucide-react';
import ParticleBackground from '../../../components/particles/ParticleBackground';

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] as const } },
};
const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.1 } } };

const board = [
  { name: 'Prof. David Nguyen', role: 'Chair, Vice-Chancellor', avatar: 'D', gradient: 'from-blue-700 to-blue-800' },
  { name: 'Dr. Sarah Williams', role: 'Deputy Chair, Dean of Business', avatar: 'S', gradient: 'from-sky-500 to-blue-700' },
  { name: 'Prof. Michael Chen', role: 'Dean of Technology', avatar: 'M', gradient: 'from-blue-500 to-blue-700' },
  { name: 'Ms. Linda Patel', role: 'External Member, Industry', avatar: 'L', gradient: 'from-blue-700 to-blue-900' },
  { name: 'Mr. Robert Tan', role: 'External Member, Finance', avatar: 'R', gradient: 'from-sky-600 to-blue-700' },
  { name: 'Dr. Amina Hassan', role: 'Academic Member', avatar: 'A', gradient: 'from-blue-400 to-blue-700' },
];

const academicBoard = [
  { name: 'Dr. James Kowalski', role: 'Chair, Dean of Accounting', avatar: 'J' },
  { name: 'Prof. Michael Chen', role: 'Dean of Technology', avatar: 'M' },
  { name: 'Dr. Sarah Williams', role: 'Dean of Business', avatar: 'S' },
  { name: 'Dr. Amina Hassan', role: 'Head of Admissions', avatar: 'A' },
];

const leadership = [
  { name: 'Prof. David Nguyen', role: 'Vice-Chancellor', dept: 'Executive', avatar: 'D', gradient: 'from-blue-700 to-blue-800' },
  { name: 'Dr. Sarah Williams', role: 'Dean of Business', dept: 'Business School', avatar: 'S', gradient: 'from-sky-500 to-blue-700' },
  { name: 'Prof. Michael Chen', role: 'Dean of Technology', dept: 'IT School', avatar: 'M', gradient: 'from-blue-500 to-blue-700' },
  { name: 'Dr. James Kowalski', role: 'Dean of Accounting', dept: 'Accounting School', avatar: 'J', gradient: 'from-sky-600 to-blue-700' },
  { name: 'Dr. Amina Hassan', role: 'Head of Admissions', dept: 'Administration', avatar: 'A', gradient: 'from-blue-700 to-blue-900' },
  { name: 'Ms. Linda Patel', role: 'Head of Student Services', dept: 'Student Services', avatar: 'L', gradient: 'from-blue-400 to-blue-700' },
];

const policies = [
  { title: 'Academic Integrity Policy', desc: 'Standards and expectations for academic honesty across all programs.' },
  { title: 'Student Code of Conduct', desc: 'Behavioural expectations and disciplinary procedures for all students.' },
  { title: 'Privacy & Data Protection Policy', desc: 'How MIHE collects, uses, and protects personal information.' },
  { title: 'Research Ethics Policy', desc: 'Ethical guidelines for research conducted at MIHE.' },
  { title: 'Work Health & Safety Policy', desc: 'Commitment to a safe and healthy campus environment.' },
  { title: 'Equity & Diversity Policy', desc: 'Promoting inclusion and equal opportunity across the institution.' },
];

export default function Governance() {
  return (
    <div>
      {/* Hero */}
      <section className="relative pt-28 sm:pt-32 pb-20 sm:pb-24 bg-hero-gradient overflow-hidden">
        <ParticleBackground count={40} connectLines />
        <div className="absolute top-0 right-0 w-[600px] h-[500px] bg-blue-200/20 rounded-full blur-[120px] pointer-events-none" />
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link to="/" className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-blue-700 transition-colors mb-6">
            <ArrowLeft className="w-4 h-4" /> Back to Home
          </Link>
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
            <p className="text-blue-700 font-semibold text-xs sm:text-sm uppercase tracking-widest mb-3">Governance</p>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-slate-900 leading-[1.08] mb-5">
              Institutional <span className="text-gradient">Governance</span>
            </h1>
            <p className="text-base sm:text-xl text-slate-600 max-w-2xl leading-relaxed">
              MIHE is committed to transparent, accountable governance. Our structure ensures academic quality, financial integrity, and strategic direction for all students and staff.
            </p>
          </motion.div>
        </div>
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 80" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
            <path d="M0 80L60 74.7C120 69.3 240 58.7 360 53.3C480 48 600 48 720 53.3C840 58.7 960 69.3 1080 72C1200 74.7 1320 69.3 1380 66.7L1440 64V80H0Z" fill="white" />
          </svg>
        </div>
      </section>

      {/* Board of Directors */}
      <section className="py-16 sm:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} className="text-center mb-10 sm:mb-14">
            <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Users className="w-7 h-7 text-blue-700" />
            </div>
            <h2 className="section-title">Board of Directors</h2>
            <p className="section-subtitle max-w-xl mx-auto text-sm sm:text-base">
              Our Board provides strategic oversight and ensures MIHE fulfils its mission and regulatory obligations.
            </p>
          </motion.div>
          <motion.div variants={stagger} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.1 }} className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
            {board.map(({ name, role, avatar, gradient }) => (
              <motion.div key={name} variants={fadeUp} className="card p-5 flex items-center gap-4 hover:-translate-y-1 hover:shadow-blue transition-all duration-300 group">
                <div className={`w-14 h-14 bg-gradient-to-br ${gradient} rounded-2xl flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform`}>
                  <span className="text-white text-xl font-bold">{avatar}</span>
                </div>
                <div className="min-w-0">
                  <p className="font-bold text-slate-900 text-sm">{name}</p>
                  <p className="text-blue-700 text-xs font-semibold mt-0.5">{role}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Academic Board */}
      <section className="py-16 sm:py-24 bg-slate-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} className="text-center mb-10 sm:mb-14">
            <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <GraduationCap className="w-7 h-7 text-blue-700" />
            </div>
            <h2 className="section-title">Academic Board</h2>
            <p className="section-subtitle max-w-xl mx-auto text-sm sm:text-base">
              Responsible for academic quality, curriculum standards, and educational policy.
            </p>
          </motion.div>
          <motion.div variants={stagger} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.1 }} className="grid sm:grid-cols-2 gap-4 sm:gap-5">
            {academicBoard.map(({ name, role, avatar }) => (
              <motion.div key={name} variants={fadeUp} className="card p-5 flex items-center gap-4 hover:-translate-y-1 hover:shadow-blue transition-all duration-300 group">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-700 to-blue-900 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
                  <span className="text-white text-lg font-bold">{avatar}</span>
                </div>
                <div className="min-w-0">
                  <p className="font-bold text-slate-900 text-sm">{name}</p>
                  <p className="text-blue-700 text-xs font-semibold mt-0.5">{role}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Leadership & Academic Team */}
      <section className="py-16 sm:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} className="text-center mb-10 sm:mb-14">
            <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Shield className="w-7 h-7 text-blue-700" />
            </div>
            <h2 className="section-title">Leadership & Academic Team</h2>
            <p className="section-subtitle max-w-xl mx-auto text-sm sm:text-base">
              Experienced academic leaders driving excellence across all schools and departments.
            </p>
          </motion.div>
          <motion.div variants={stagger} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.1 }} className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
            {leadership.map(({ name, role, dept, avatar, gradient }) => (
              <motion.div key={name} variants={fadeUp} className="card p-5 flex items-center gap-4 hover:-translate-y-1 hover:shadow-blue transition-all duration-300 group">
                <div className={`w-14 h-14 bg-gradient-to-br ${gradient} rounded-2xl flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform`}>
                  <span className="text-white text-xl font-bold">{avatar}</span>
                </div>
                <div className="min-w-0">
                  <p className="font-bold text-slate-900 text-sm">{name}</p>
                  <p className="text-blue-700 text-xs font-semibold mt-0.5">{role}</p>
                  <p className="text-slate-400 text-xs mt-0.5">{dept}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Learning & Teaching Committee */}
      <section className="py-16 sm:py-24 bg-slate-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} className="text-center mb-10 sm:mb-14">
            <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <BookOpen className="w-7 h-7 text-blue-700" />
            </div>
            <h2 className="section-title">Learning & Teaching Committee</h2>
            <p className="section-subtitle max-w-xl mx-auto text-sm sm:text-base">
              Oversees teaching quality, student learning outcomes, and continuous improvement of programs.
            </p>
          </motion.div>
          <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} className="card p-6 sm:p-8">
            <div className="space-y-4">
              {[
                'Review and approve curriculum changes across all programs',
                'Monitor student satisfaction and learning outcome metrics',
                'Oversee teaching quality assurance and professional development',
                'Evaluate graduate employability and industry alignment',
                'Ensure compliance with TEQSA and AQF standards',
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                    <FileCheck className="w-3.5 h-3.5 text-blue-700" />
                  </div>
                  <p className="text-slate-600 text-sm leading-relaxed">{item}</p>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Institutional Policies */}
      <section className="py-16 sm:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} className="text-center mb-10 sm:mb-14">
            <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Scale className="w-7 h-7 text-blue-700" />
            </div>
            <h2 className="section-title">Institutional Policies</h2>
            <p className="section-subtitle max-w-xl mx-auto text-sm sm:text-base">
              Key policies that govern our institution and ensure compliance, fairness, and quality.
            </p>
          </motion.div>
          <motion.div variants={stagger} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.1 }} className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
            {policies.map(({ title, desc }) => (
              <motion.div key={title} variants={fadeUp} className="card p-6 hover:-translate-y-1 hover:shadow-blue transition-all duration-300">
                <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center mb-4">
                  <FileCheck className="w-5 h-5 text-blue-700" />
                </div>
                <h3 className="font-bold text-slate-900 text-sm mb-2">{title}</h3>
                <p className="text-slate-500 text-xs leading-relaxed">{desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Accreditation CTA */}
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
            <Link to="/about" className="inline-flex items-center gap-2 px-8 py-4 bg-white text-blue-700 font-bold rounded-xl hover:bg-blue-50 hover:scale-105 transition-all duration-200 shadow-lg">
              Learn More About MIHE
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
