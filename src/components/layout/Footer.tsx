import { Link } from 'react-router-dom';
import { MapPin, Phone, Mail, Facebook, Twitter, Linkedin, Instagram, Briefcase } from 'lucide-react';

const links = {
  courses: [
    { label: 'Bachelor of Business', href: '/courses' },
    { label: 'MBA', href: '/courses' },
    { label: 'Bachelor of IT', href: '/courses' },
    { label: 'Master of IT', href: '/courses' },
    { label: 'Bachelor of Accounting', href: '/courses' },
  ],
  students: [
    { label: 'How to Apply', href: '/admissions' },
    { label: 'Student Portal', href: '/student/dashboard' },
    { label: 'Student Services', href: '/admissions' },
    { label: 'International Students', href: '/admissions' },
    { label: 'Scholarships', href: '/admissions' },
  ],
  about: [
    { label: 'About MIHE', href: '/about' },
    { label: 'Governance', href: '/about' },
    { label: 'Staff Directory', href: '/about' },
    { label: 'News & Events', href: '/about' },
    { label: 'Contact Us', href: '/contact' },
  ],
};

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main footer */}
        <div className="py-12 sm:py-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8 sm:gap-10">
          {/* Brand */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center">
                <img src="/Gemini_Generated_Image_wn7wp2wn7wp2wn7w-removebg-preview copy.png" alt="MIHE logo" className="w-9 h-9 object-contain" />
              </div>
              <div>
                <span className="text-xl font-bold">MIHE</span>
                <p className="text-xs text-slate-400 -mt-0.5">Melbourne Institute of Higher Education</p>
              </div>
            </div>
            <p className="text-slate-400 text-sm leading-relaxed mb-6 max-w-xs">
              Empowering students with world-class education, practical skills, and the confidence to lead in tomorrow's global economy.
            </p>
            <div className="space-y-2.5 text-sm text-slate-400">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-blue-400 flex-shrink-0" />
                <span>123 Collins Street, Melbourne VIC 3000</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-blue-400 flex-shrink-0" />
                <span>+61 3 9000 1234</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-blue-400 flex-shrink-0" />
                <span>info@mihe.edu.au</span>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              {[Facebook, Twitter, Linkedin, Instagram].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  className="w-9 h-9 bg-slate-800 rounded-lg flex items-center justify-center text-slate-400 hover:bg-blue-600 hover:text-white transition-all duration-200"
                >
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Links */}
          {[
            { title: 'Courses', items: links.courses },
            { title: 'Students', items: links.students },
            { title: 'About', items: links.about },
          ].map(({ title, items }) => (
            <div key={title}>
              <h4 className="text-sm font-bold text-white mb-4 uppercase tracking-wider">{title}</h4>
              <ul className="space-y-2.5">
                {items.map(({ label, href }) => (
                  <li key={label}>
                    <Link
                      to={href}
                      className="text-sm text-slate-400 hover:text-blue-400 transition-colors"
                    >
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Become an Agent CTA */}
        <div className="py-6 border-t border-slate-800">
          <Link
            to="/become-agent"
            className="group inline-flex items-center gap-3 bg-slate-800 hover:bg-blue-600 rounded-xl px-6 py-3.5 transition-all duration-200"
          >
            <Briefcase className="w-5 h-5 text-blue-400 group-hover:text-white transition-colors" />
            <div>
              <p className="text-sm font-bold text-white">Become an Agent</p>
              <p className="text-xs text-slate-400 group-hover:text-blue-100 transition-colors">Partner with MIHE to help students apply</p>
            </div>
          </Link>
        </div>

        {/* Bottom bar */}
        <div className="py-5 sm:py-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <p className="text-center sm:text-left">© 2025 Melbourne Institute of Higher Education. All rights reserved.</p>
          <div className="flex flex-wrap justify-center gap-4 sm:gap-6">
            <a href="#" className="hover:text-slate-300 transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-slate-300 transition-colors">Terms of Use</a>
            <a href="#" className="hover:text-slate-300 transition-colors">CRICOS 00000A</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
