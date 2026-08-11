import type { GSAData, PreviousCoERecord, PreviousAustraliaStudyRecord, StudyGapRecord } from '../types';

export function validateGSA(data: GSAData, isAgentSubmitted: boolean): string | null {
  if (data.gsa_immigration_history_has === null) return 'Immigration History: Please select Yes or No.';
  if (data.gsa_immigration_history_has && !data.gsa_immigration_history_details.trim())
    return 'Immigration History: Details are required when you answered Yes.';

  if (!data.gsa_choice_reason.trim()) return 'Choice of Course: Please explain why you chose this course.';

  if (data.gsa_has_previous_coe === null) return 'Previous CoE: Please select Yes or No.';
  if (data.gsa_has_previous_coe) {
    if (data.gsa_previous_coes.length === 0) return 'Previous CoE: Add at least one previous CoE record.';
    for (const coe of data.gsa_previous_coes) {
      if (!coe.institution.trim() || !coe.course.trim() || !coe.start_date || !coe.end_date || !coe.reason_for_withdrawing.trim())
        return 'Previous CoE: Each record needs institution, course, start date, end date, and reason for withdrawing.';
    }
  }

  if (data.gsa_studied_in_australia === null) return 'Previous Study in Australia: Please select Yes or No.';
  if (data.gsa_studied_in_australia) {
    if (data.gsa_previous_australia_study.length === 0) return 'Previous Study in Australia: Add at least one record.';
    for (const s of data.gsa_previous_australia_study) {
      if (!s.institution.trim() || !s.course.trim() || !s.start_date || !s.end_date)
        return 'Previous Study in Australia: Each record needs institution, course, start date, and end date.';
    }
  }

  if (data.gsa_has_study_gaps === null) return 'Gaps in Studies: Please select Yes or No.';
  if (data.gsa_has_study_gaps) {
    if (data.gsa_study_gaps.length === 0) return 'Gaps in Studies: Add at least one gap period.';
    for (const g of data.gsa_study_gaps) {
      if (!g.start_date || !g.end_date || !g.details_of_gap.trim())
        return 'Gaps in Studies: Each gap period needs start date, end date, and details.';
    }
  }

  if (!data.gsa_current_circumstances.trim()) return 'Current Circumstances: Please describe your current situation.';
  if (!data.gsa_funding_source.trim()) return 'Ability to Afford: Please specify your funding source.';
  if (!data.gsa_estimated_tuition.trim()) return 'Ability to Afford: Please provide estimated tuition funds.';
  if (!data.gsa_estimated_living.trim()) return 'Ability to Afford: Please provide estimated living funds.';

  if (!data.gsa_student_decl_1 || !data.gsa_student_decl_2 || !data.gsa_student_decl_3 || !data.gsa_student_decl_4)
    return 'Student Declaration: All four checkboxes must be ticked.';
  if (!data.gsa_student_decl_name.trim()) return 'Student Declaration: Print name is required.';
  if (!data.gsa_student_decl_date) return 'Student Declaration: Date is required.';
  if (!data.gsa_student_decl_signature.trim()) return 'Student Declaration: Signature is required.';

  if (isAgentSubmitted) {
    if (!data.gsa_agent_decl_1 || !data.gsa_agent_decl_2 || !data.gsa_agent_decl_3)
      return 'Agent Declaration: All three checkboxes must be ticked.';
    if (!data.gsa_agent_decl_name.trim()) return 'Agent Declaration: Print name is required.';
    if (!data.gsa_agent_decl_date) return 'Agent Declaration: Date is required.';
    if (!data.gsa_agent_decl_signature.trim()) return 'Agent Declaration: Signature is required.';
  }

  return null;
}

export interface GSAStatusResult {
  status: 'green' | 'yellow' | 'red';
  label: string;
  reason: string;
}

export function computeGSAStatus(app: {
  gsa_status?: string | null;
  gsa_immigration_history_has?: boolean | null;
  gsa_choice_reason?: string | null;
  gsa_has_previous_coe?: boolean | null;
  gsa_previous_coes?: PreviousCoERecord[] | null;
  gsa_studied_in_australia?: boolean | null;
  gsa_previous_australia_study?: PreviousAustraliaStudyRecord[] | null;
  gsa_has_study_gaps?: boolean | null;
  gsa_study_gaps?: StudyGapRecord[] | null;
  gsa_current_circumstances?: string | null;
  gsa_funding_source?: string | null;
  gsa_estimated_tuition?: string | null;
  gsa_estimated_living?: string | null;
  gsa_student_decl_1?: boolean | null;
  gsa_student_decl_2?: boolean | null;
  gsa_student_decl_3?: boolean | null;
  gsa_student_decl_4?: boolean | null;
  gsa_student_decl_name?: string | null;
  gsa_student_decl_date?: string | null;
  gsa_student_decl_signature?: string | null;
  gsa_agent_decl_1?: boolean | null;
  gsa_agent_decl_2?: boolean | null;
  gsa_agent_decl_3?: boolean | null;
  gsa_agent_decl_name?: string | null;
  gsa_agent_decl_date?: string | null;
  gsa_agent_decl_signature?: string | null;
  source?: string | null;
}): GSAStatusResult {
  if (app.gsa_status === 'approved') return { status: 'green', label: 'GSA Approved', reason: 'Assessment approved by staff.' };

  const hasImmigrationFlag = app.gsa_immigration_history_has === true;

  const requiredFields = [
    app.gsa_choice_reason,
    app.gsa_current_circumstances,
    app.gsa_funding_source,
    app.gsa_estimated_tuition,
    app.gsa_estimated_living,
    app.gsa_student_decl_name,
    app.gsa_student_decl_date,
    app.gsa_student_decl_signature,
  ];
  const allRequiredFilled = requiredFields.every(f => f && String(f).trim());

  const studentDecls = [app.gsa_student_decl_1, app.gsa_student_decl_2, app.gsa_student_decl_3, app.gsa_student_decl_4];
  const allStudentDeclsChecked = studentDecls.every(d => d === true);

  const isAgent = app.source === 'agent';
  const agentDecls = [app.gsa_agent_decl_1, app.gsa_agent_decl_2, app.gsa_agent_decl_3];
  const agentFields = [app.gsa_agent_decl_name, app.gsa_agent_decl_date, app.gsa_agent_decl_signature];
  const allAgentDeclsChecked = !isAgent || (agentDecls.every(d => d === true) && agentFields.every(f => f && String(f).trim()));

  const coeComplete = !(app.gsa_has_previous_coe === true) || (
    (app.gsa_previous_coes ?? []).length > 0 &&
    (app.gsa_previous_coes ?? []).every(c => c.institution?.trim() && c.course?.trim() && c.start_date && c.end_date && c.reason_for_withdrawing?.trim())
  );
  const studyComplete = !(app.gsa_studied_in_australia === true) || (
    (app.gsa_previous_australia_study ?? []).length > 0 &&
    (app.gsa_previous_australia_study ?? []).every(s => s.institution?.trim() && s.course?.trim() && s.start_date && s.end_date)
  );
  const gapComplete = !(app.gsa_has_study_gaps === true) || (
    (app.gsa_study_gaps ?? []).length > 0 &&
    (app.gsa_study_gaps ?? []).every(g => g.start_date && g.end_date && g.details_of_gap?.trim())
  );

  const immigrationAnswered = app.gsa_immigration_history_has !== null && app.gsa_immigration_history_has !== undefined;
  const coeAnswered = app.gsa_has_previous_coe !== null && app.gsa_has_previous_coe !== undefined;
  const studyAnswered = app.gsa_studied_in_australia !== null && app.gsa_studied_in_australia !== undefined;
  const gapAnswered = app.gsa_has_study_gaps !== null && app.gsa_has_study_gaps !== undefined;

  const allYesNoAnswered = immigrationAnswered && coeAnswered && studyAnswered && gapAnswered;

  if (hasImmigrationFlag && allRequiredFilled && allStudentDeclsChecked && allAgentDeclsChecked && allYesNoAnswered && coeComplete && studyComplete && gapComplete) {
    return { status: 'yellow', label: 'Needs Review', reason: 'Immigration history flagged — requires manual staff review.' };
  }

  if (!allRequiredFilled || !allStudentDeclsChecked || !allAgentDeclsChecked || !allYesNoAnswered || !coeComplete || !studyComplete || !gapComplete) {
    return { status: 'red', label: 'GSA Incomplete', reason: 'Required GSA fields are missing or declarations not checked.' };
  }

  return { status: 'green', label: 'GSA Meets', reason: 'All mandatory GSA fields completed and declarations checked.' };
}
