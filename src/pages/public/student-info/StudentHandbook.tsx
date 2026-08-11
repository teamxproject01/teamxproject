import { BookOpen } from 'lucide-react';
import StudentInfoPage from '../StudentInfoPage';

export default function StudentHandbook() {
  return (
    <StudentInfoPage
      title="Student Handbook"
      tagline="Your comprehensive guide to policies, procedures, and life at MIHE."
      icon={BookOpen}
      category="handbook"
      showDocs
    />
  );
}
