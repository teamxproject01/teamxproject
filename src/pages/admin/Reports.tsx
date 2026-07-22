import { motion } from 'framer-motion';
import { TrendingUp, Users, FileText, BarChart2, PieChart as PieIcon } from 'lucide-react';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer,
} from 'recharts';

const conversionData = [
  { month: 'Sep', inquiries: 120, applications: 45, enrollments: 32 },
  { month: 'Oct', inquiries: 145, applications: 62, enrollments: 41 },
  { month: 'Nov', inquiries: 167, applications: 78, enrollments: 55 },
  { month: 'Dec', inquiries: 98, applications: 41, enrollments: 28 },
  { month: 'Jan', inquiries: 210, applications: 95, enrollments: 68 },
  { month: 'Feb', inquiries: 265, applications: 124, enrollments: 89 },
  { month: 'Mar', inquiries: 231, applications: 108, enrollments: 77 },
];

const courseInterest = [
  { course: 'BBA', applications: 145 },
  { course: 'MBA', applications: 98 },
  { course: 'BIT', applications: 132 },
  { course: 'MIT', applications: 67 },
  { course: 'BAcc', applications: 89 },
  { course: 'GCB', applications: 44 },
];

const formVolumes = [
  { name: 'Special Consideration', value: 48, color: '#3B9AE1' },
  { name: 'Course Variation', value: 31, color: '#93CAFE' },
  { name: 'Credit Transfer', value: 22, color: '#10B981' },
  { name: 'Refund', value: 15, color: '#F59E0B' },
  { name: 'General Enquiry', value: 36, color: '#8B5CF6' },
  { name: 'Other', value: 11, color: '#94A3B8' },
];

const processingTime = [
  { type: 'Special Consideration', days: 3.2 },
  { type: 'Course Variation', days: 2.1 },
  { type: 'Credit Transfer', days: 8.5 },
  { type: 'Refund', days: 6.3 },
  { type: 'General Enquiry', days: 1.4 },
];

export default function Reports() {
  const kpis = [
    { label: 'Application Conversion Rate', value: '34%', trend: '+5%', icon: TrendingUp, color: 'text-green-600 bg-green-50' },
    { label: 'Avg. Processing Time', value: '4.3 days', trend: '-0.8d', icon: BarChart2, color: 'text-blue-600 bg-blue-50' },
    { label: 'Student Satisfaction', value: '4.8/5.0', trend: '+0.2', icon: Users, color: 'text-amber-600 bg-amber-50' },
    { label: 'Forms Resolved', value: '92%', trend: '+3%', icon: FileText, color: 'text-purple-600 bg-purple-50' },
  ];

  return (
    <div className="space-y-6 max-w-6xl">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Reports & Analytics</h1>
        <p className="text-slate-500 text-sm mt-1">Conversion rates, form volumes, and processing metrics</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {kpis.map(({ label, value, trend, icon: Icon, color }) => (
          <motion.div
            key={label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="card p-5"
          >
            <div className={`w-10 h-10 ${color} rounded-xl flex items-center justify-center mb-3`}>
              <Icon className="w-5 h-5" />
            </div>
            <div className="text-2xl font-bold text-slate-900">{value}</div>
            <div className="text-xs text-slate-500 mt-0.5">{label}</div>
            <div className="text-xs text-green-600 font-semibold mt-1">{trend} vs last period</div>
          </motion.div>
        ))}
      </div>

      {/* Conversion funnel */}
      <div className="card p-6">
        <h3 className="font-bold text-slate-900 mb-1 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-blue-600" />
          Enrolment Conversion Funnel
        </h3>
        <p className="text-xs text-slate-400 mb-4">Inquiries → Applications → Enrolments</p>
        <ResponsiveContainer width="100%" height={240}>
          <LineChart data={conversionData} margin={{ top: 5, right: 20, left: -15, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }} />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            <Line type="monotone" dataKey="inquiries" stroke="#93CAFE" strokeWidth={2} dot={false} name="Inquiries" />
            <Line type="monotone" dataKey="applications" stroke="#3B9AE1" strokeWidth={2.5} dot={false} name="Applications" />
            <Line type="monotone" dataKey="enrollments" stroke="#0A4887" strokeWidth={2} dot={false} name="Enrolments" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Course interest */}
        <div className="card p-6">
          <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
            <BarChart2 className="w-5 h-5 text-blue-600" />
            Applications by Course
          </h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={courseInterest} layout="vertical" margin={{ left: 0, right: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <YAxis dataKey="course" type="category" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} width={36} />
              <Tooltip contentStyle={{ borderRadius: 12, border: 'none' }} />
              <Bar dataKey="applications" fill="#3B9AE1" radius={[0, 6, 6, 0]} name="Applications" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Form volumes */}
        <div className="card p-6">
          <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
            <PieIcon className="w-5 h-5 text-blue-600" />
            Form Submissions by Type
          </h3>
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <ResponsiveContainer width="100%" height={180} className="sm:w-1/2">
              <PieChart>
                <Pie data={formVolumes} cx="50%" cy="50%" outerRadius={72} dataKey="value" paddingAngle={2}>
                  {formVolumes.map((d, i) => <Cell key={i} fill={d.color} />)}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: 12, border: 'none' }} />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex-1 space-y-2 w-full sm:w-auto">
              {formVolumes.map(({ name, value, color }) => (
                <div key={name} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: color }} />
                    <span className="text-slate-600 truncate">{name}</span>
                  </div>
                  <span className="font-bold text-slate-800 ml-2">{value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Processing time */}
      <div className="card p-6">
        <h3 className="font-bold text-slate-900 mb-4">Average Form Processing Time (Days)</h3>
        <ResponsiveContainer width="100%" height={180}>
          <BarChart data={processingTime} margin={{ top: 5, right: 20, left: -15, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis dataKey="type" tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} angle={-30} textAnchor="end" height={60} interval={0} />
            <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={{ borderRadius: 12, border: 'none' }} />
            <Bar dataKey="days" fill="#93CAFE" radius={[6, 6, 0, 0]} name="Avg. Days" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
