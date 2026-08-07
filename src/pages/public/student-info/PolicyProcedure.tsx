import { Scale } from 'lucide-react';
import StudentInfoPage from '../StudentInfoPage';

export default function PolicyProcedure() {
  return (
    <StudentInfoPage
      title="Policy and Procedure"
      tagline="Access all institutional policies and procedures that govern student life at MIHE."
      icon={Scale}
      category="policy_procedure"
      showDocs
    />
  );
}
