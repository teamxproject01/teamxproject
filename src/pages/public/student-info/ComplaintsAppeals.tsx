import { motion } from 'framer-motion';
import { MessageSquareWarning, FileCheck, Clock, Mail, ArrowRight } from 'lucide-react';
import StudentInfoPage from '../StudentInfoPage';

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] as const } },
};
const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.1 } } };

const steps = [
  { step: '1', title: 'Informal Resolution', desc: 'Discuss your concern directly with the relevant staff member. Most issues are resolved at this stage.' },
  { step: '2', title: 'Formal Complaint', desc: 'If unresolved, submit a formal written complaint to the Student Services Centre within 10 business days.' },
  { step: '3', title: 'Internal Review', desc: 'A senior staff member will review your complaint and provide a written decision within 15 business days.' },
  { step: '4', title: 'External Appeal', desc: 'If still unresolved, you may appeal to an external body such as the Ombudsman or TEQSA.' },
];

export default function ComplaintsAppeals() {
  return (
    <StudentInfoPage
      title="Student Complaints and Appeals"
      tagline="We take your concerns seriously. Here's how to raise a complaint or appeal a decision."
      icon={MessageSquareWarning}
    >
      <motion.div variants={stagger} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.1 }} className="grid sm:grid-cols-2 gap-4 sm:gap-5 mb-10">
        {[
          { icon: FileCheck, title: 'Fair & Transparent', desc: 'All complaints are handled impartially and confidentially.' },
          { icon: Clock, title: 'Timely Response', desc: 'We acknowledge complaints within 3 business days and respond within 15.' },
          { icon: Mail, title: 'Multiple Channels', desc: 'Submit in person, by email, or via the student portal.' },
          { icon: MessageSquareWarning, title: 'No Retaliation', desc: 'You will not be disadvantaged for raising a genuine complaint.' },
        ].map(({ icon: Icon, title, desc }) => (
          <motion.div key={title} variants={fadeUp} className="card p-5 flex items-start gap-4">
            <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center flex-shrink-0">
              <Icon className="w-5 h-5 text-blue-700" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm mb-1">{title}</h3>
              <p className="text-slate-500 text-xs leading-relaxed">{desc}</p>
            </div>
          </motion.div>
        ))}
      </motion.div>

      <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}>
        <h2 className="text-xl font-bold text-slate-900 mb-5">Complaints Process</h2>
        <div className="space-y-3">
          {steps.map(({ step, title, desc }) => (
            <div key={step} className="flex gap-4 p-4 rounded-2xl border border-slate-100 hover:border-blue-200 transition-colors">
              <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-blue-700 rounded-xl flex items-center justify-center flex-shrink-0 text-white font-bold text-sm">
                {step}
              </div>
              <div className="flex-1">
                <p className="font-semibold text-slate-800 text-sm">{title}</p>
                <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} className="mt-8 card p-6 bg-blue-50/30">
        <h3 className="font-bold text-slate-900 text-sm mb-2">Need Help?</h3>
        <p className="text-slate-600 text-xs leading-relaxed mb-4">
          If you need assistance lodging a complaint or appeal, our Student Services team can guide you through the process.
        </p>
        <a href="mailto:studentservices@mihe.edu.au" className="inline-flex items-center gap-2 text-sm font-semibold text-blue-700 hover:text-blue-800 transition-colors">
          Contact Student Services <ArrowRight className="w-4 h-4" />
        </a>
      </motion.div>
    </StudentInfoPage>
  );
}
