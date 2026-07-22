import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, Filter, Clock, MapPin, Award, ArrowRight, ChevronDown, ChevronUp, BookOpen } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { Course } from '../../types';
import ParticleBackground from '../../components/particles/ParticleBackground';
import { useLang } from '../../components/layout/Navbar';
import { useAuth } from '../../context/AuthContext';
import { t } from '../../lib/i18n';

const courseImages: Record<string, string> = {
  undergraduate: 'https://images.pexels.com/photos/3184360/pexels-photo-3184360.jpeg?auto=compress&cs=tinysrgb&w=800',
  postgraduate: 'https://images.pexels.com/photos/6147369/pexels-photo-6147369.jpeg?auto=compress&cs=tinysrgb&w=800',
  graduate_certificate: 'https://images.pexels.com/photos/267885/pexels-photo-267885.jpeg?auto=compress&cs=tinysrgb&w=800',
  diploma: 'https://images.pexels.com/photos/1181396/pexels-photo-1181396.jpeg?auto=compress&cs=tinysrgb&w=800',
};

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } },
};

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
};

const levelLabels: Record<string, string> = {
  all: 'All Levels',
  undergraduate: 'Undergraduate',
  postgraduate: 'Postgraduate',
  graduate_certificate: 'Graduate Certificate',
  diploma: 'Diploma',
};

export default function Courses() {
  const { lang } = useLang();
  const { profile } = useAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [levelFilter, setLevelFilter] = useState('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    supabase
      .from('courses')
      .select('*')
      .order('is_featured', { ascending: false })
      .then(({ data }) => {
        setCourses(data ?? []);
        setLoading(false);
      });
  }, []);

  const filtered = courses.filter((c) => {
    const matchesSearch =
      c.title.toLowerCase().includes(search.toLowerCase()) ||
      (c.cricos_code ?? '').toLowerCase().includes(search.toLowerCase());
    const matchesLevel = levelFilter === 'all' || c.level === levelFilter;
    return matchesSearch && matchesLevel;
  });

  return (
    <div>
      {/* Hero */}
      <section className="relative pt-32 pb-20 bg-hero-gradient overflow-hidden">
        <ParticleBackground count={50} density="medium" />
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="text-center"
          >
            <p className="text-blue-600 font-semibold text-sm uppercase tracking-widest mb-3">{t('courses_tag', lang)}</p>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-slate-900 mb-6">
              {t('courses_h1', lang)} <span className="text-gradient">{t('courses_h1_accent', lang)}</span>
            </h1>
            <p className="text-base sm:text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
              {t('courses_sub', lang)}
            </p>
          </motion.div>
        </div>
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 60" fill="none"><path d="M0 60L720 0L1440 60V60H0Z" fill="white" /></svg>
        </div>
      </section>

      {/* Filters */}
      <section className="py-8 bg-white sticky top-16 z-20 border-b border-slate-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder={t('courses_search', lang)}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="input-field pl-10"
              />
            </div>
            <div className="relative">
              <Filter className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <select
                value={levelFilter}
                onChange={(e) => setLevelFilter(e.target.value)}
                className="input-field pl-10 pr-10 cursor-pointer appearance-none min-w-44"
              >
                {Object.entries(levelLabels).map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </div>
          </div>
          {filtered.length !== courses.length && (
            <p className="text-sm text-slate-500 mt-2">
              {t('courses_showing', lang)} {filtered.length} {t('courses_of', lang)} {courses.length} {t('courses_programs', lang)}
            </p>
          )}
        </div>
      </section>

      {/* Course list */}
      <section className="py-12 bg-slate-50 min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="w-10 h-10 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-slate-500 text-lg">{t('courses_no_match', lang)}</p>
              <button onClick={() => { setSearch(''); setLevelFilter('all'); }} className="btn-ghost mt-4">
                {t('courses_clear', lang)}
              </button>
            </div>
          ) : (
            <motion.div
              variants={stagger}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.05 }}
              className="space-y-4"
            >
              {filtered.map((course) => {
                const isExpanded = expandedId === course.id;
                const coverImg = courseImages[course.level] ?? courseImages.undergraduate;
                return (
                  <motion.div
                    key={course.id}
                    variants={fadeUp}
                    className="card overflow-hidden"
                  >
                    <div
                      className="p-4 sm:p-6 cursor-pointer"
                      onClick={() => setExpandedId(isExpanded ? null : course.id)}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2 mb-2">
                            <span className="badge bg-blue-100 text-blue-700 capitalize">
                              {course.level.replace('_', ' ')}
                            </span>
                            {course.is_featured && (
                              <span className="badge bg-amber-100 text-amber-700">
                                <Award className="w-3 h-3 mr-1" />
                                Featured
                              </span>
                            )}
                          </div>
                          <h3 className="text-lg sm:text-xl font-bold text-slate-900">{course.title}</h3>
                          {course.cricos_code && (
                            <p className="text-xs text-slate-400 mt-1">CRICOS {course.cricos_code}</p>
                          )}
                        </div>
                        <button className="flex-shrink-0 p-2 rounded-lg hover:bg-slate-100 transition-colors text-slate-400">
                          {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                        </button>
                      </div>

                      <div className="mt-4 flex flex-wrap gap-4 text-sm text-slate-500">
                        <span className="flex items-center gap-1.5">
                          <Clock className="w-4 h-4 text-blue-400" /> {course.duration}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <MapPin className="w-4 h-4 text-blue-400" /> {course.campus}
                        </span>
                      </div>
                    </div>

                    {/* Expanded detail */}
                    {isExpanded && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="border-t border-slate-100"
                      >
                        {/* Cover image strip */}
                        <div className="relative h-40 overflow-hidden">
                          <img src={coverImg} alt={course.title} className="w-full h-full object-cover" />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
                          <div className="absolute bottom-4 left-6">
                            <span className="text-white font-bold text-lg">{course.title}</span>
                          </div>
                        </div>

                        <div className="p-4 sm:p-6 bg-blue-50/40 grid md:grid-cols-2 gap-6 sm:gap-8">
                          <div>
                            <h4 className="font-bold text-slate-900 mb-3">{t('courses_overview', lang)}</h4>
                            <p className="text-slate-600 text-sm leading-relaxed">{course.overview}</p>

                            {course.entry_requirements && (
                              <div className="mt-5">
                                <h4 className="font-bold text-slate-900 mb-2">{t('courses_entry', lang)}</h4>
                                <p className="text-slate-600 text-sm leading-relaxed">{course.entry_requirements}</p>
                              </div>
                            )}

                            {course.intake_dates && (
                              <div className="mt-5">
                                <h4 className="font-bold text-slate-900 mb-2">{t('courses_intakes', lang)}</h4>
                                <div className="flex flex-wrap gap-2">
                                  {course.intake_dates.map((d) => (
                                    <span key={d} className="px-3 py-1 bg-white border border-blue-200 text-blue-700 rounded-full text-xs font-medium">
                                      {d}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>

                          <div>
                            {course.career_outcomes && (
                              <div className="mb-5">
                                <h4 className="font-bold text-slate-900 mb-3">{t('courses_careers', lang)}</h4>
                                <div className="flex flex-wrap gap-2">
                                  {course.career_outcomes.map((o) => (
                                    <span key={o} className="px-3 py-1.5 bg-white text-slate-700 text-xs font-medium rounded-lg border border-slate-200">
                                      {o}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}

                            {course.fees && (
                              <div className="bg-white rounded-xl p-5 border border-slate-200">
                                <h4 className="font-bold text-slate-900 mb-3">{t('courses_fees', lang)}</h4>
                                <div className="space-y-2 text-sm">
                                  <div className="flex justify-between">
                                    <span className="text-slate-500">{t('courses_dom', lang)}</span>
                                    <span className="font-bold text-slate-900">${course.fees.domestic?.toLocaleString()}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-slate-500">{t('courses_intl', lang)}</span>
                                    <span className="font-bold text-slate-900">${course.fees.international?.toLocaleString()}</span>
                                  </div>
                                </div>
                              </div>
                            )}

                            <div className="mt-5 flex flex-col sm:flex-row gap-3">
                              <Link
                                to={`/courses/${course.id}`}
                                className="btn-primary flex-1 text-center text-sm justify-center"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <BookOpen className="w-4 h-4" /> {t('courses_learn', lang)}
                              </Link>
                              <Link to={profile ? `/courses/${course.id}` : '/signup'} className="btn-secondary flex-1 text-center text-sm justify-center" onClick={(e) => e.stopPropagation()}>
                                {profile ? 'Apply Now' : 'Sign Up'} <ArrowRight className="w-4 h-4" />
                              </Link>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </motion.div>
                );
              })}
            </motion.div>
          )}
        </div>
      </section>
    </div>
  );
}
