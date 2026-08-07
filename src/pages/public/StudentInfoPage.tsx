import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowLeft, type LucideIcon } from 'lucide-react';
import DocumentList from '../../components/ui/DocumentList';

interface StudentInfoPageProps {
  title: string;
  tagline: string;
  icon: LucideIcon;
  category?: string;
  showDocs?: boolean;
  children?: React.ReactNode;
}

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] as const } },
};

export default function StudentInfoPage({ title, tagline, icon: Icon, category, showDocs = false, children }: StudentInfoPageProps) {
  return (
    <div>
      {/* Hero */}
      <section className="relative pt-28 sm:pt-32 pb-16 sm:pb-20 bg-hero-gradient overflow-hidden">
        <div className="absolute top-0 right-0 w-[500px] h-[400px] bg-blue-200/20 rounded-full blur-[120px] pointer-events-none" />
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link
            to="/admissions"
            className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-blue-700 transition-colors mb-6"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Admissions
          </Link>
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <div className="w-14 h-14 bg-blue-700 rounded-2xl flex items-center justify-center mb-5 shadow-blue">
              <Icon className="w-7 h-7 text-white" />
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-slate-900 leading-[1.08] mb-3">
              {title}
            </h1>
            <p className="text-base sm:text-lg text-slate-600 max-w-2xl leading-relaxed">{tagline}</p>
          </motion.div>
        </div>
      </section>

      {/* Content */}
      <section className="py-12 sm:py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {children}
          {showDocs && category && (
            <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}>
              <h2 className="text-xl font-bold text-slate-900 mb-5 mt-8">Documents & Resources</h2>
              <DocumentList category={category} />
            </motion.div>
          )}
        </div>
      </section>
    </div>
  );
}
