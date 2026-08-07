import { motion } from 'framer-motion';
import { CalendarDays } from 'lucide-react';
import CalendarView from '../../components/ui/CalendarView';

export default function StudentCalendar() {
  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <CalendarDays className="w-6 h-6 text-blue-700" />
          Academic Calendar
        </h1>
        <p className="text-slate-500 text-sm mt-1">Important dates and events for the academic year</p>
      </div>
      <CalendarView readOnly />
    </motion.div>
  );
}
