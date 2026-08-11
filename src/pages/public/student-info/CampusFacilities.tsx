import { motion } from 'framer-motion';
import { Building, Wifi, BookOpen, Coffee, Dumbbell, Monitor, Library, Beaker } from 'lucide-react';
import StudentInfoPage from '../StudentInfoPage';

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] as const } },
};
const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.1 } } };

const facilities = [
  { icon: Library, title: 'Library & Study Spaces', desc: 'Extensive physical and digital collections, quiet study zones, and collaborative learning spaces.' },
  { icon: Monitor, title: 'Computer Labs', desc: 'Modern computing facilities with industry-standard software and high-speed internet.' },
  { icon: Beaker, title: 'Specialised Labs', desc: 'Dedicated laboratories for IT, accounting, and business simulation exercises.' },
  { icon: Wifi, title: 'Campus-Wide Wi-Fi', desc: 'Free high-speed wireless internet access throughout all campus buildings.' },
  { icon: Coffee, title: 'Student Lounge & Café', desc: 'Relax, socialise, and grab a coffee between classes in our comfortable student areas.' },
  { icon: BookOpen, title: 'Learning Management System', desc: '24/7 online access to course materials, assignments, and grades via our digital platform.' },
  { icon: Dumbbell, title: 'Recreation Area', desc: 'Space for relaxation and wellbeing activities during breaks.' },
  { icon: Building, title: 'Student Services Centre', desc: 'One-stop support hub for enrolment, welfare, counselling, and academic assistance.' },
];

export default function CampusFacilities() {
  return (
    <StudentInfoPage
      title="Campus and Facilities"
      tagline="Explore our modern, well-equipped campus designed to support your learning and wellbeing."
      icon={Building}
    >
      <motion.div variants={stagger} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.1 }} className="grid sm:grid-cols-2 gap-4 sm:gap-5">
        {facilities.map(({ icon: Icon, title, desc }) => (
          <motion.div key={title} variants={fadeUp} className="card p-6 hover:-translate-y-1 hover:shadow-blue transition-all duration-300 group">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-700 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Icon className="w-6 h-6 text-white" />
            </div>
            <h3 className="font-bold text-slate-900 text-sm mb-2">{title}</h3>
            <p className="text-slate-500 text-xs leading-relaxed">{desc}</p>
          </motion.div>
        ))}
      </motion.div>

      <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} className="mt-10 card p-6 sm:p-8 bg-blue-50/30">
        <h2 className="text-lg font-bold text-slate-900 mb-3">Campus Location</h2>
        <p className="text-slate-600 text-sm leading-relaxed mb-4">
          Our campus is located in the heart of Melbourne's CBD, easily accessible by public transport. We're a short walk from Southern Cross Station and major tram routes.
        </p>
        <div className="rounded-2xl overflow-hidden border border-slate-200">
          <iframe
            title="MIHE Campus Location"
            src="https://www.openstreetmap.org/export/embed.html?bbox=144.95%2C-37.82%2C144.97%2C-37.81&layer=mapnik"
            className="w-full h-[300px]"
            loading="lazy"
          />
        </div>
      </motion.div>
    </StudentInfoPage>
  );
}
