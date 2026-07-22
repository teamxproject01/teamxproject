import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { motion } from 'framer-motion';
import {
  ArrowLeft, ArrowRight, Clock, MapPin, DollarSign, Award,
  BookOpen, CheckCircle, Users, Calendar, GraduationCap,
  FileText, Banknote, ClipboardList, CalendarCheck, Phone,
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { Course } from '../../types';

const levelImages: Record<string, string> = {
  undergraduate: 'https://images.pexels.com/photos/1438072/pexels-photo-1438072.jpeg?auto=compress&cs=tinysrgb&w=1600',
  postgraduate: 'https://images.pexels.com/photos/2280571/pexels-photo-2280571.jpeg?auto=compress&cs=tinysrgb&w=1600',
  graduate_certificate: 'https://images.pexels.com/photos/267885/pexels-photo-267885.jpeg?auto=compress&cs=tinysrgb&w=1600',
  diploma: 'https://images.pexels.com/photos/1181396/pexels-photo-1181396.jpeg?auto=compress&cs=tinysrgb&w=1600',
};

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] } },
};

const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.1 } } };

const TABS = [
  { id: 'entry',     label: 'Entry Requirements', icon: ClipboardList },
  { id: 'structure', label: 'Study Structure',     icon: BookOpen },
  { id: 'fees',      label: 'Fees & Scholarships', icon: Banknote },
  { id: 'apply',     label: 'How to Apply',        icon: FileText },
];

export default function CourseDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('entry');
  const [bookingOpen, setBookingOpen] = useState(false);
  const [applyOpen, setApplyOpen] = useState(false);
  const [applyNotes, setApplyNotes] = useState('');
  const [applyLoading, setApplyLoading] = useState(false);
  const [applyDone, setApplyDone] = useState(false);
  const { profile } = useAuth();

  useEffect(() => {
    if (!id) return;
    supabase.from('courses').select('*').eq('id', id).single().then(({ data }) => {
      setCourse(data);
      setLoading(false);
    });
  }, [id]);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-10 h-10 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin" />
    </div>
  );

  if (!course) return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4">
      <p className="text-slate-500 text-lg">Course not found.</p>
      <Link to="/courses" className="btn-primary text-sm">Back to Courses</Link>
    </div>
  );

  const heroImg = levelImages[course.level] ?? levelImages.undergraduate;

  return (
    <div className="bg-white">
      {/* ── Hero ── */}
      <div className="relative h-[420px] md:h-[520px] overflow-hidden">
        <img src={heroImg} alt={course.title} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#1e0a3c] via-[#1e0a3c]/50 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#1e0a3c]/60 via-transparent to-transparent" />

        {/* Back button */}
        <button
          onClick={() => navigate(-1)}
          className="absolute top-24 left-6 md:left-12 flex items-center gap-2 text-white/80 hover:text-white text-sm font-semibold transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Courses
        </button>

        <div className="absolute bottom-0 left-0 right-0 max-w-5xl mx-auto px-6 md:px-12 pb-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <span className="px-3 py-1 bg-blue-500/30 border border-blue-400/40 text-blue-200 text-xs font-semibold rounded-full capitalize">
                {course.level.replace('_', ' ')}
              </span>
              {course.is_featured && (
                <span className="px-3 py-1 bg-amber-500/30 border border-amber-400/40 text-amber-200 text-xs font-semibold rounded-full flex items-center gap-1">
                  <Award className="w-3 h-3" /> Featured
                </span>
              )}
              {course.cricos_code && (
                <span className="text-white/50 text-xs font-medium">CRICOS {course.cricos_code}</span>
              )}
            </div>
            <h1 className="text-3xl md:text-5xl font-extrabold text-white leading-tight">{course.title}</h1>

            <div className="mt-4 flex flex-wrap gap-5 text-sm text-white/75">
              <span className="flex items-center gap-1.5"><Clock className="w-4 h-4 text-blue-300" /> {course.duration}</span>
              <span className="flex items-center gap-1.5"><MapPin className="w-4 h-4 text-blue-300" /> {course.campus}</span>
              {course.fees && (
                <span className="flex items-center gap-1.5">
                  <DollarSign className="w-4 h-4 text-blue-300" />
                  From ${course.fees.domestic?.toLocaleString()}/yr
                </span>
              )}
            </div>
          </motion.div>
        </div>
      </div>

      {/* ── Sticky Tab Nav ── */}
      <div className="sticky top-16 z-30 bg-white border-b border-slate-100 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex overflow-x-auto scrollbar-hide gap-0.5">
            {TABS.map(({ id: tid, label, icon: Icon }) => (
              <button
                key={tid}
                onClick={() => setTab(tid)}
                className={`flex items-center gap-2 px-4 py-4 text-sm font-semibold whitespace-nowrap border-b-2 transition-all duration-200 ${
                  tab === tid
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-slate-500 hover:text-blue-600 hover:border-blue-200'
                }`}
              >
                <Icon className="w-4 h-4" />
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Tab Content ── */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid md:grid-cols-3 gap-10">

          {/* Main content */}
          <div className="md:col-span-2">
            {tab === 'entry' && (
              <motion.div variants={stagger} initial="hidden" animate="visible" key="entry">
                <motion.h2 variants={fadeUp} className="text-2xl font-bold text-slate-900 mb-6">Entry Requirements</motion.h2>
                <motion.div variants={fadeUp} className="prose prose-slate max-w-none">
                  <p className="text-slate-600 leading-relaxed mb-6">
                    {course.entry_requirements ?? 'Entry requirements for this program ensure students have the foundational knowledge and skills to succeed in their studies.'}
                  </p>
                  {[
                    { heading: 'Academic Requirements', items: ['Completion of Australian Year 12 or equivalent', 'Minimum ATAR of 65 or equivalent academic achievement', 'Satisfactory academic transcripts from previous studies'] },
                    { heading: 'English Language Requirements', items: ['IELTS overall band score of 6.0 (no band below 5.5)', 'TOEFL iBT minimum score of 60', 'PTE Academic minimum score of 50', 'Other equivalent English qualifications considered'] },
                    { heading: 'Additional Requirements', items: ['Completed application form', 'Certified copies of academic transcripts', 'Valid passport copy (international students)', 'Statement of purpose (postgraduate only)'] },
                  ].map(({ heading, items }) => (
                    <motion.div key={heading} variants={fadeUp} className="mb-8">
                      <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                        <CheckCircle className="w-5 h-5 text-blue-600" /> {heading}
                      </h3>
                      <ul className="space-y-2.5">
                        {items.map((item) => (
                          <li key={item} className="flex items-start gap-2.5 text-slate-600 text-sm">
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2 flex-shrink-0" />
                            {item}
                          </li>
                        ))}
                      </ul>
                    </motion.div>
                  ))}
                </motion.div>
              </motion.div>
            )}

            {tab === 'structure' && (
              <motion.div variants={stagger} initial="hidden" animate="visible" key="structure">
                <motion.h2 variants={fadeUp} className="text-2xl font-bold text-slate-900 mb-6">Study Structure</motion.h2>
                <motion.p variants={fadeUp} className="text-slate-600 mb-8 leading-relaxed">
                  {course.overview ?? 'This program is structured to build knowledge progressively, combining foundational theory with practical application.'}
                </motion.p>

                {[
                  { year: 'Year 1', label: 'Foundations', units: ['Introduction to Business Principles', 'Academic Communication Skills', 'Quantitative Methods', 'Organisational Behaviour', 'Microeconomics', 'Digital Business Tools'] },
                  { year: 'Year 2', label: 'Core Specialisation', units: ['Strategic Management', 'Financial Accounting', 'Marketing Management', 'Business Law & Ethics', 'Operations Management', 'Research Methods'] },
                  { year: 'Year 3', label: 'Advanced & Electives', units: ['Capstone Business Project', 'Entrepreneurship & Innovation', '2 x Elective Units', 'Work-Integrated Learning Placement'] },
                ].slice(0, course.duration?.includes('2') ? 2 : 3).map(({ year, label, units }) => (
                  <motion.div key={year} variants={fadeUp} className="mb-8">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center flex-shrink-0">
                        <GraduationCap className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <div className="font-bold text-slate-900">{year}</div>
                        <div className="text-sm text-blue-600 font-medium">{label}</div>
                      </div>
                    </div>
                    <div className="ml-14 grid sm:grid-cols-2 gap-2">
                      {units.map((u) => (
                        <div key={u} className="flex items-center gap-2 p-3 bg-slate-50 rounded-xl text-sm text-slate-700 font-medium border border-slate-100">
                          <BookOpen className="w-4 h-4 text-blue-400 flex-shrink-0" />
                          {u}
                        </div>
                      ))}
                    </div>
                  </motion.div>
                ))}

                {course.intake_dates && (
                  <motion.div variants={fadeUp} className="mt-8 p-6 bg-blue-50 rounded-2xl border border-blue-100">
                    <h3 className="font-bold text-slate-900 mb-3 flex items-center gap-2">
                      <Calendar className="w-5 h-5 text-blue-600" /> Intake Dates
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {course.intake_dates.map((d) => (
                        <span key={d} className="px-4 py-1.5 bg-white border border-blue-200 text-blue-700 rounded-full text-sm font-medium shadow-sm">
                          {d}
                        </span>
                      ))}
                    </div>
                  </motion.div>
                )}
              </motion.div>
            )}

            {tab === 'fees' && (
              <motion.div variants={stagger} initial="hidden" animate="visible" key="fees">
                <motion.h2 variants={fadeUp} className="text-2xl font-bold text-slate-900 mb-6">Fees & Scholarships</motion.h2>

                {course.fees && (
                  <motion.div variants={fadeUp} className="bg-white border border-slate-200 rounded-2xl overflow-hidden mb-8">
                    <div className="bg-[#1e0a3c] px-6 py-4">
                      <h3 className="text-white font-bold text-lg">Annual Tuition Fees</h3>
                      <p className="text-purple-300 text-sm mt-1">Per year of study</p>
                    </div>
                    <div className="divide-y divide-slate-100">
                      <div className="flex justify-between items-center px-6 py-5">
                        <div>
                          <div className="font-semibold text-slate-900">Domestic Students</div>
                          <div className="text-sm text-slate-500 mt-0.5">Australian citizens & PR holders</div>
                        </div>
                        <div className="text-2xl font-extrabold text-blue-600">${course.fees.domestic?.toLocaleString()}</div>
                      </div>
                      <div className="flex justify-between items-center px-6 py-5">
                        <div>
                          <div className="font-semibold text-slate-900">International Students</div>
                          <div className="text-sm text-slate-500 mt-0.5">Student visa holders</div>
                        </div>
                        <div className="text-2xl font-extrabold text-blue-600">${course.fees.international?.toLocaleString()}</div>
                      </div>
                    </div>
                  </motion.div>
                )}

                <motion.div variants={fadeUp}>
                  <h3 className="text-xl font-bold text-slate-900 mb-5">Available Scholarships</h3>
                  <div className="space-y-4">
                    {[
                      { name: 'MIHE Excellence Scholarship', value: 'Up to $5,000', desc: 'Awarded to high-achieving domestic and international students based on academic merit.' },
                      { name: 'International Student Bursary', value: 'Up to $3,000', desc: 'Financial assistance for international students demonstrating financial need.' },
                      { name: 'Industry Partner Scholarship', value: 'Up to $4,000', desc: 'Co-funded by our 60+ industry partners for students entering work-integrated programs.' },
                      { name: 'Community Leaders Award', value: 'Up to $2,500', desc: 'Recognising students who have demonstrated outstanding community contribution.' },
                    ].map(({ name, value, desc }) => (
                      <div key={name} className="p-5 bg-gradient-to-r from-blue-50 to-white border border-blue-100 rounded-2xl flex flex-col sm:flex-row sm:items-center gap-4">
                        <div className="flex-1">
                          <div className="font-bold text-slate-900">{name}</div>
                          <div className="text-sm text-slate-500 mt-1 leading-relaxed">{desc}</div>
                        </div>
                        <div className="flex-shrink-0 text-lg font-extrabold text-blue-600 bg-blue-100 px-4 py-2 rounded-xl whitespace-nowrap">{value}</div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              </motion.div>
            )}

            {tab === 'apply' && (
              <motion.div variants={stagger} initial="hidden" animate="visible" key="apply">
                <motion.h2 variants={fadeUp} className="text-2xl font-bold text-slate-900 mb-6">How to Apply</motion.h2>
                <motion.p variants={fadeUp} className="text-slate-600 leading-relaxed mb-8">
                  Applying to MIHE is a straightforward process. Follow the steps below to submit your application and begin your journey.
                </motion.p>

                <div className="space-y-6">
                  {[
                    { step: '01', title: 'Check Entry Requirements', desc: 'Review the entry requirements for this program and confirm you meet the academic and English language criteria.', icon: ClipboardList },
                    { step: '02', title: 'Prepare Your Documents', desc: 'Gather certified copies of your academic transcripts, passport, and any supporting documents required.', icon: FileText },
                    { step: '03', title: 'Submit Your Application', desc: 'Complete the online application form through our portal. International students applying through an agent should consult their representative.', icon: ArrowRight },
                    { step: '04', title: 'Receive Your Offer Letter', desc: "Once reviewed, you'll receive a conditional or unconditional offer letter within 5–10 business days.", icon: CheckCircle },
                    { step: '05', title: 'Accept & Enrol', desc: "Accept your offer, pay the enrolment deposit, and receive your Confirmation of Enrolment (CoE) to apply for your student visa.", icon: GraduationCap },
                    { step: '06', title: 'Commence Your Studies', desc: 'Attend orientation, collect your student card, and begin your MIHE journey!', icon: CalendarCheck },
                  ].map(({ step, title, desc, icon: Icon }) => (
                    <motion.div key={step} variants={fadeUp} className="flex gap-5">
                      <div className="flex-shrink-0 flex flex-col items-center">
                        <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-md">
                          <Icon className="w-5 h-5 text-white" />
                        </div>
                        <div className="w-px flex-1 bg-blue-100 mt-2" />
                      </div>
                      <div className="pb-6">
                        <span className="text-xs font-bold text-blue-500 uppercase tracking-wider">Step {step}</span>
                        <h3 className="text-base font-bold text-slate-900 mt-0.5">{title}</h3>
                        <p className="text-slate-500 text-sm mt-1.5 leading-relaxed">{desc}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>

                <motion.div variants={fadeUp} className="mt-6 flex flex-col sm:flex-row gap-3">
                  {profile ? (
                    <button onClick={() => setApplyOpen(true)} className="btn-primary flex-1 justify-center text-sm">
                      Start My Application <ArrowRight className="w-4 h-4" />
                    </button>
                  ) : (
                    <Link to="/signup" className="btn-primary flex-1 justify-center text-sm">
                      Start My Application <ArrowRight className="w-4 h-4" />
                    </Link>
                  )}
                  <Link to="/contact" className="btn-secondary flex-1 justify-center text-sm">
                    Ask a Question
                  </Link>
                </motion.div>
              </motion.div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-5">
            {/* Apply Now card */}
            <div className="bg-[#1e0a3c] rounded-2xl p-6 text-white">
              <h3 className="font-bold text-lg mb-1">Ready to Apply?</h3>
              <p className="text-purple-200 text-sm mb-5">Applications open now for Feb & July 2025 intakes.</p>
              {profile ? (
                <button onClick={() => setApplyOpen(true)} className="flex items-center justify-center gap-2 w-full bg-white text-[#1e0a3c] font-bold py-3 rounded-xl hover:bg-purple-50 transition-colors text-sm">
                  Apply Now <ArrowRight className="w-4 h-4" />
                </button>
              ) : (
                <Link to="/signup" className="flex items-center justify-center gap-2 w-full bg-white text-[#1e0a3c] font-bold py-3 rounded-xl hover:bg-purple-50 transition-colors text-sm">
                  Apply Now <ArrowRight className="w-4 h-4" />
                </Link>
              )}
              <Link to="/contact" className="flex items-center justify-center gap-2 w-full mt-2 bg-white/10 hover:bg-white/20 border border-white/20 text-white font-semibold py-3 rounded-xl transition-colors text-sm">
                Enquire
              </Link>
            </div>

            {/* Book 1:1 Session */}
            <div className="bg-white border-2 border-blue-100 rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                  <CalendarCheck className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <div className="font-bold text-slate-900 text-sm">Book a 1:1 Session</div>
                  <div className="text-xs text-slate-500">Free • 30 min • Online or In-person</div>
                </div>
              </div>
              <p className="text-slate-600 text-xs leading-relaxed mb-4">
                Speak directly with a course advisor to get personalised guidance on entry requirements, fees, and career pathways.
              </p>
              <button
                onClick={() => setBookingOpen(true)}
                className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl transition-colors text-sm"
              >
                <Phone className="w-4 h-4" /> Book Free Session
              </button>
            </div>

            {/* Quick facts */}
            <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100">
              <h4 className="font-bold text-slate-900 mb-4 text-sm uppercase tracking-wide">Quick Facts</h4>
              <dl className="space-y-3 text-sm">
                {[
                  { icon: Clock, label: 'Duration', val: course.duration },
                  { icon: MapPin, label: 'Campus', val: course.campus },
                  { icon: Users, label: 'Student Type', val: 'Domestic & International' },
                  { icon: Calendar, label: 'Intakes', val: course.intake_dates?.join(', ') ?? 'Feb & July' },
                ].map(({ icon: Icon, label, val }) => (
                  <div key={label} className="flex items-center gap-3">
                    <Icon className="w-4 h-4 text-blue-500 flex-shrink-0" />
                    <div className="min-w-0">
                      <div className="text-xs text-slate-400 font-medium">{label}</div>
                      <div className="font-semibold text-slate-800 truncate">{val}</div>
                    </div>
                  </div>
                ))}
              </dl>
            </div>

            {/* Career outcomes */}
            {course.career_outcomes && (
              <div className="bg-white border border-slate-200 rounded-2xl p-6">
                <h4 className="font-bold text-slate-900 mb-3 text-sm">Career Outcomes</h4>
                <div className="flex flex-wrap gap-2">
                  {course.career_outcomes.map((o) => (
                    <span key={o} className="px-2.5 py-1 bg-blue-50 text-blue-700 text-xs font-medium rounded-lg border border-blue-100">{o}</span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Apply Modal */}
      {applyOpen && course && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => !applyLoading && setApplyOpen(false)}>
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 sm:p-8"
            onClick={(e) => e.stopPropagation()}
          >
            {applyDone ? (
              <div className="text-center">
                <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-7 h-7 text-green-600" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">Application Submitted!</h3>
                <p className="text-slate-500 text-sm mb-6">Your application for {course.title} has been submitted. You can track its status in your student portal.</p>
                <Link to="/student/applications" className="btn-primary w-full justify-center text-sm">Go to My Applications</Link>
              </div>
            ) : (
              <>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                    <FileText className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-900">Apply for Course</h3>
                    <p className="text-sm text-slate-500 truncate">{course.title}</p>
                  </div>
                </div>
                <form className="space-y-4" onSubmit={async (e) => {
                  e.preventDefault();
                  setApplyLoading(true);
                  await supabase.from('applications').insert({
                    course_id: course.id,
                    status: 'submitted',
                    notes: applyNotes || null,
                  });
                  setApplyLoading(false);
                  setApplyDone(true);
                }}>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">Notes (optional)</label>
                    <textarea rows={3} value={applyNotes} onChange={(e) => setApplyNotes(e.target.value)} placeholder="Any additional information for your application…" className="input-field resize-none" />
                  </div>
                  <div className="flex gap-3 pt-2">
                    <button type="submit" disabled={applyLoading} className="btn-primary flex-1 justify-center text-sm disabled:opacity-60">
                      {applyLoading ? 'Submitting…' : 'Submit Application'}
                    </button>
                    <button type="button" onClick={() => setApplyOpen(false)} disabled={applyLoading} className="btn-secondary flex-1 justify-center text-sm disabled:opacity-60">
                      Cancel
                    </button>
                  </div>
                </form>
              </>
            )}
          </motion.div>
        </div>
      )}

      {/* Book 1:1 Modal */}
      {bookingOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setBookingOpen(false)}>
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 sm:p-8"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <CalendarCheck className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-900">Book a 1:1 Session</h3>
                <p className="text-sm text-slate-500">Free 30-minute advisor meeting</p>
              </div>
            </div>

            <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); setBookingOpen(false); alert('Session request submitted! We\'ll contact you within 24 hours.'); }}>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">Full Name</label>
                <input type="text" required placeholder="Your full name" className="input-field" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">Email Address</label>
                <input type="email" required placeholder="your@email.com" className="input-field" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">Phone (optional)</label>
                <input type="tel" placeholder="+61 4XX XXX XXX" className="input-field" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">Preferred Meeting Type</label>
                <select className="input-field">
                  <option>Online (Zoom / Teams)</option>
                  <option>In-person — Melbourne CBD Campus</option>
                  <option>Phone Call</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">Message (optional)</label>
                <textarea rows={3} placeholder="Any specific questions or topics you'd like to discuss…" className="input-field resize-none" />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="submit" className="btn-primary flex-1 justify-center text-sm">
                  <CalendarCheck className="w-4 h-4" /> Confirm Booking
                </button>
                <button type="button" onClick={() => setBookingOpen(false)} className="btn-secondary flex-1 justify-center text-sm">
                  Cancel
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
