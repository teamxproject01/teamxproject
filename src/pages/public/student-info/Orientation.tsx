import { motion } from 'framer-motion';
import { Compass, Calendar, Users, MapPin, BookOpen, CheckCircle } from 'lucide-react';
import StudentInfoPage from '../StudentInfoPage';

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] as const } },
};
const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.1 } } };

const schedule = [
  { time: '9:00 AM', title: 'Welcome & Registration', desc: 'Check in, collect your student ID card, and meet the orientation team.' },
  { time: '10:00 AM', title: 'Campus Tour', desc: 'Guided tour of all facilities including libraries, labs, and student services.' },
  { time: '11:30 AM', title: 'Academic Briefing', desc: 'Meet your program coordinator and learn about course structure and expectations.' },
  { time: '1:00 PM', title: 'Lunch & Networking', desc: 'Connect with fellow students and faculty over lunch.' },
  { time: '2:00 PM', title: 'IT & Learning Systems', desc: 'Set up your student portal, email, and learning management system access.' },
  { time: '3:30 PM', title: 'Student Services Briefing', desc: 'Learn about welfare, counselling, academic support, and career services.' },
];

export default function Orientation() {
  return (
    <StudentInfoPage
      title="Orientation at MIHE"
      tagline="Your essential introduction to life and study at Melbourne Institute of Higher Education."
      icon={Compass}
    >
      <motion.div variants={stagger} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.1 }} className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        {[
          { icon: Calendar, label: 'Next Orientation', value: 'Feb 24, 2025' },
          { icon: MapPin, label: 'Location', value: 'Melbourne CBD Campus' },
          { icon: Users, label: 'Duration', value: 'Full Day (9 AM - 4 PM)' },
          { icon: BookOpen, label: 'Format', value: 'In-Person + Online' },
        ].map(({ icon: Icon, label, value }) => (
          <motion.div key={label} variants={fadeUp} className="card p-4 text-center">
            <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center mx-auto mb-3">
              <Icon className="w-5 h-5 text-blue-700" />
            </div>
            <p className="text-xs text-slate-400 font-medium">{label}</p>
            <p className="text-sm font-bold text-slate-800 mt-1">{value}</p>
          </motion.div>
        ))}
      </motion.div>

      <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} className="mb-8">
        <h2 className="text-xl font-bold text-slate-900 mb-4">What to Expect</h2>
        <div className="space-y-3">
          {[
            'Collect your student ID card and activate your campus access',
            'Tour the campus and familiarise yourself with key facilities',
            'Meet your program coordinator and fellow classmates',
            'Set up your student email, portal, and learning management system',
            'Learn about student services, welfare, and academic support',
            'Understand your rights, responsibilities, and key policies',
          ].map((item, i) => (
            <div key={i} className="flex items-start gap-3">
              <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <CheckCircle className="w-3.5 h-3.5 text-green-600" />
              </div>
              <p className="text-slate-600 text-sm leading-relaxed">{item}</p>
            </div>
          ))}
        </div>
      </motion.div>

      <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}>
        <h2 className="text-xl font-bold text-slate-900 mb-5">Orientation Day Schedule</h2>
        <div className="space-y-3">
          {schedule.map(({ time, title, desc }) => (
            <div key={time} className="flex gap-4 p-4 rounded-2xl border border-slate-100 hover:border-blue-200 hover:bg-blue-50/30 transition-all duration-200">
              <div className="flex-shrink-0 w-20">
                <p className="text-sm font-bold text-blue-700">{time}</p>
              </div>
              <div className="flex-1">
                <p className="font-semibold text-slate-800 text-sm">{title}</p>
                <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </StudentInfoPage>
  );
}
