import { ClipboardList } from 'lucide-react';
import StudentInfoPage from '../StudentInfoPage';

export default function Forms() {
  return (
    <StudentInfoPage
      title="Forms"
      tagline="Download and submit the forms you need for enrolment, services, and administration."
      icon={ClipboardList}
      category="forms"
      showDocs
    />
  );
}
