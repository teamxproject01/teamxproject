import { useState } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Phone, Mail, Clock, Send, CheckCircle, ArrowRight, MessageCircle } from 'lucide-react';
import ParticleBackground from '../../components/particles/ParticleBackground';
import Button from '../../components/ui/Button';
import { useLang } from '../../components/layout/Navbar';
import { t } from '../../lib/i18n';

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
};

const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.1 } } };

const info = [
  { icon: MapPin, title: 'Campus Address', lines: ['123 Collins Street, Level 15', 'Melbourne VIC 3000, Australia'], color: 'from-blue-500 to-blue-700' },
  { icon: Phone, title: 'Phone', lines: ['+61 3 9000 1234', '+61 3 9000 5678 (International)'], color: 'from-sky-500 to-blue-600' },
  { icon: Mail, title: 'Email', lines: ['info@mihe.edu.au', 'admissions@mihe.edu.au'], color: 'from-blue-600 to-blue-800' },
  { icon: Clock, title: 'Office Hours', lines: ['Mon – Fri: 8:30am – 5:30pm', 'Sat: 10:00am – 2:00pm'], color: 'from-blue-400 to-blue-600' },
];

export default function Contact() {
  const { lang } = useLang();
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', phone: '', subject: '', message: '' });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1000));
    setSubmitted(true);
    setLoading(false);
  };

  return (
    <div>
      {/* Hero */}
      <section className="relative pt-28 sm:pt-32 pb-20 sm:pb-24 bg-hero-gradient overflow-hidden">
        <ParticleBackground count={50} />
        <div className="absolute top-0 left-0 w-[500px] h-[400px] bg-blue-200/20 rounded-full blur-[100px] pointer-events-none" />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 32 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="max-w-2xl"
          >
            <p className="text-blue-600 font-semibold text-sm uppercase tracking-widest mb-3">{t('contact_tag', lang)}</p>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-slate-900 leading-[1.08] mb-5 sm:mb-6">
              {t('contact_h1', lang)} <span className="text-gradient">{t('contact_h1_accent', lang)}</span>
            </h1>
            <p className="text-base sm:text-xl text-slate-600 leading-relaxed">
              {t('contact_sub', lang)}
            </p>
          </motion.div>
        </div>

        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 80" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
            <path d="M0 80L60 74.7C120 69.3 240 58.7 360 53.3C480 48 600 48 720 53.3C840 58.7 960 69.3 1080 72C1200 74.7 1320 69.3 1380 66.7L1440 64V80H0Z" fill="white" />
          </svg>
        </div>
      </section>

      {/* Info cards */}
      <section className="py-12 sm:py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mb-12 sm:mb-16"
          >
            {info.map(({ icon: Icon, title, lines, color }) => (
              <motion.div key={title} variants={fadeUp} className="card p-4 sm:p-6 group hover:-translate-y-1.5 hover:shadow-blue transition-all duration-300">
                <div className={`w-9 h-9 sm:w-11 sm:h-11 bg-gradient-to-br ${color} rounded-xl flex items-center justify-center mb-3 sm:mb-4 group-hover:scale-110 transition-transform`}>
                  <Icon className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                </div>
                <p className="font-bold text-slate-900 text-xs sm:text-sm mb-1">{title}</p>
                {lines.map((l) => (
                  <p key={l} className="text-slate-500 text-xs leading-relaxed">{l}</p>
                ))}
              </motion.div>
            ))}
          </motion.div>

          {/* Main grid */}
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-start">
            {/* Map + message info */}
            <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mb-5 sm:mb-6">Find Us in Melbourne CBD</h2>

              {/* Map placeholder */}
              <div className="relative h-48 sm:h-64 bg-gradient-to-br from-blue-50 to-sky-100 rounded-2xl border border-blue-100 overflow-hidden mb-6 sm:mb-8 shadow-card">
                <img
                  src="https://images.pexels.com/photos/590478/pexels-photo-590478.jpeg?auto=compress&cs=tinysrgb&w=700"
                  alt="Melbourne CBD"
                  className="w-full h-full object-cover opacity-40"
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center bg-white/80 backdrop-blur-sm rounded-2xl px-6 py-4 shadow-card">
                    <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-2">
                      <MapPin className="w-5 h-5 text-white" />
                    </div>
                    <p className="font-bold text-slate-900 text-sm">123 Collins Street</p>
                    <p className="text-slate-500 text-xs">Level 15, Melbourne VIC 3000</p>
                    <p className="text-xs text-blue-600 font-medium mt-1">Near Flinders Street Station</p>
                  </div>
                </div>
              </div>

              {/* Quick actions */}
              <div className="space-y-3">
                <p className="font-bold text-slate-900 mb-4">Quick Enquiries</p>
                {[
                  { label: 'Admissions Team', email: 'admissions@mihe.edu.au', icon: MessageCircle },
                  { label: 'International Students', email: 'international@mihe.edu.au', icon: Mail },
                  { label: 'Fees & Finance', email: 'finance@mihe.edu.au', icon: Mail },
                ].map(({ label, email, icon: Icon }) => (
                  <a
                    key={email}
                    href={`mailto:${email}`}
                    className="flex items-center gap-3 p-3.5 rounded-xl border border-slate-100 hover:bg-blue-50 hover:border-blue-200 transition-all duration-200 group"
                  >
                    <div className="w-9 h-9 bg-blue-50 rounded-lg flex items-center justify-center group-hover:bg-blue-100 transition-colors">
                      <Icon className="w-4 h-4 text-blue-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-800">{label}</p>
                      <p className="text-xs text-slate-400 truncate">{email}</p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-blue-500 transition-colors" />
                  </a>
                ))}
              </div>
            </motion.div>

            {/* Form */}
            <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }}>
              <div className="card p-6 sm:p-8 shadow-card-hover">
                <div className="flex items-center gap-3 mb-5 sm:mb-6">
                  <div className="w-9 h-9 sm:w-10 sm:h-10 bg-blue-600 rounded-xl flex items-center justify-center">
                    <Send className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                  </div>
                  <h2 className="text-xl sm:text-2xl font-bold text-slate-900">Send an Enquiry</h2>
                </div>

                {submitted ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center py-10"
                  >
                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-5">
                      <CheckCircle className="w-10 h-10 text-green-600" />
                    </div>
                    <h3 className="text-2xl font-bold text-slate-900 mb-2">{t('contact_sent_title', lang)}</h3>
                    <p className="text-slate-500 mb-6">
                      {t('contact_sent_sub', lang)}
                    </p>
                    <button
                      onClick={() => { setSubmitted(false); setForm({ name: '', email: '', phone: '', subject: '', message: '' }); }}
                      className="btn-ghost"
                    >
                      Send Another Message
                    </button>
                  </motion.div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <label className="label">{t('contact_name', lang)} *</label>
                        <input
                          required
                          type="text"
                          value={form.name}
                          onChange={(e) => setForm({ ...form, name: e.target.value })}
                          className="input-field"
                          placeholder="John Smith"
                        />
                      </div>
                      <div>
                        <label className="label">{t('contact_email', lang)} *</label>
                        <input
                          required
                          type="email"
                          value={form.email}
                          onChange={(e) => setForm({ ...form, email: e.target.value })}
                          className="input-field"
                          placeholder="john@email.com"
                        />
                      </div>
                    </div>
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <label className="label">{t('contact_phone', lang)}</label>
                        <input
                          type="tel"
                          value={form.phone}
                          onChange={(e) => setForm({ ...form, phone: e.target.value })}
                          className="input-field"
                          placeholder="+61 4xx xxx xxx"
                        />
                      </div>
                      <div>
                        <label className="label">{t('contact_subject', lang)} *</label>
                        <select
                          required
                          value={form.subject}
                          onChange={(e) => setForm({ ...form, subject: e.target.value })}
                          className="input-field"
                        >
                          <option value="">Select a topic</option>
                          <option>Admissions Enquiry</option>
                          <option>Course Information</option>
                          <option>International Students</option>
                          <option>Fees & Scholarships</option>
                          <option>Student Services</option>
                          <option>Other</option>
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className="label">{t('contact_message', lang)} *</label>
                      <textarea
                        required
                        rows={5}
                        value={form.message}
                        onChange={(e) => setForm({ ...form, message: e.target.value })}
                        className="input-field resize-none"
                        placeholder="Tell us how we can help…"
                      />
                    </div>
                    <p className="text-xs text-slate-400">
                      By submitting you agree to our Privacy Policy. We'll only use your information to respond to your enquiry.
                    </p>
                    <Button type="submit" loading={loading} className="w-full">
                      <Send className="w-4 h-4" /> {t('contact_send', lang)}
                    </Button>
                  </form>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
}
