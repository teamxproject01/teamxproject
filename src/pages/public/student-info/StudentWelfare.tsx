import { motion } from 'framer-motion';
import { Heart, Brain, Users, Phone, Home, Briefcase, Stethoscope, LifeBuoy } from 'lucide-react';
import StudentInfoPage from '../StudentInfoPage';

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] as const } },
};
const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.1 } } };

const services = [
  { icon: Brain, title: 'Counselling Services', desc: 'Free, confidential counselling for mental health, stress, and personal challenges. Bookings via the student portal.' },
  { icon: Heart, title: 'Wellbeing Programs', desc: 'Workshops and activities focused on mindfulness, resilience, and healthy living.' },
  { icon: Users, title: 'Peer Support', desc: 'Connect with student mentors and peer support groups for guidance and friendship.' },
  { icon: Stethoscope, title: 'Health Referrals', desc: 'Information on local GPs, hospitals, and overseas student health cover (OSHC).' },
  { icon: Home, title: 'Accommodation Support', desc: 'Assistance finding suitable housing and understanding your tenancy rights.' },
  { icon: Briefcase, title: 'Career Services', desc: 'Resume help, interview prep, job listings, and career counselling.' },
  { icon: LifeBuoy, title: 'Emergency Support', desc: '24/7 emergency contact line for urgent welfare and safety concerns.' },
  { icon: Phone, title: 'Disability Support', desc: 'Reasonable adjustments and learning support plans for students with disabilities.' },
];

export default function StudentWelfare() {
  return (
    <StudentInfoPage
      title="Student Welfare, Wellbeing and Support"
      tagline="Your wellbeing matters. We offer a range of free, confidential support services to help you thrive."
      icon={Heart}
    >
      <motion.div variants={stagger} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.1 }} className="grid sm:grid-cols-2 gap-4 sm:gap-5">
        {services.map(({ icon: Icon, title, desc }) => (
          <motion.div key={title} variants={fadeUp} className="card p-6 hover:-translate-y-1 hover:shadow-blue transition-all duration-300 group">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-700 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Icon className="w-6 h-6 text-white" />
            </div>
            <h3 className="font-bold text-slate-900 text-sm mb-2">{title}</h3>
            <p className="text-slate-500 text-xs leading-relaxed">{desc}</p>
          </motion.div>
        ))}
      </motion.div>

      <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} className="mt-8 card p-6 bg-blue-50/30">
        <h3 className="font-bold text-slate-900 text-sm mb-3">Emergency Contacts</h3>
        <div className="grid sm:grid-cols-2 gap-3 text-xs">
          <div className="flex items-center gap-2">
            <Phone className="w-4 h-4 text-blue-700 flex-shrink-0" />
            <span className="text-slate-600"><strong className="text-slate-800">Emergency:</strong> 000 (Police, Fire, Ambulance)</span>
          </div>
          <div className="flex items-center gap-2">
            <Phone className="w-4 h-4 text-blue-700 flex-shrink-0" />
            <span className="text-slate-600"><strong className="text-slate-800">MIHE Welfare Line:</strong> +61 3 9000 0000</span>
          </div>
        </div>
      </motion.div>
    </StudentInfoPage>
  );
}
