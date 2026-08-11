import { AlertCircle, CheckCircle } from 'lucide-react';
import { EnglishScoreStandard } from '../../types';

export interface EnglishScoreFields {
  english_reading: string;
  english_writing: string;
  english_speaking: string;
  english_listening: string;
  english_overall: string;
}

export const emptyEnglishScores: EnglishScoreFields = {
  english_reading: '',
  english_writing: '',
  english_speaking: '',
  english_listening: '',
  english_overall: '',
};

export function checkEnglishEligibility(
  testType: string,
  scores: EnglishScoreFields,
  standards: EnglishScoreStandard[],
): { eligible: boolean; failures: string[] } {
  const standard = standards.find(s => s.test_type === testType && s.is_active);
  if (!standard) return { eligible: true, failures: [] };

  const failures: string[] = [];
  const r = parseFloat(scores.english_reading);
  const w = parseFloat(scores.english_writing);
  const s = parseFloat(scores.english_speaking);
  const l = parseFloat(scores.english_listening);
  const o = parseFloat(scores.english_overall);

  if (!isNaN(r) && r < standard.min_reading) failures.push(`Reading: ${r} (min ${standard.min_reading})`);
  if (!isNaN(w) && w < standard.min_writing) failures.push(`Writing: ${w} (min ${standard.min_writing})`);
  if (!isNaN(s) && s < standard.min_speaking) failures.push(`Speaking: ${s} (min ${standard.min_speaking})`);
  if (!isNaN(l) && l < standard.min_listening) failures.push(`Listening: ${l} (min ${standard.min_listening})`);
  if (!isNaN(o) && o < standard.min_overall) failures.push(`Overall: ${o} (min ${standard.min_overall})`);

  return { eligible: failures.length === 0, failures };
}

interface Props {
  testType: string;
  scores: EnglishScoreFields;
  onChange: (field: keyof EnglishScoreFields, value: string) => void;
  standard?: EnglishScoreStandard;
}

export default function EnglishScoreInput({ testType, scores, onChange, standard }: Props) {
  const fields: { key: keyof EnglishScoreFields; label: string; min: number }[] = [
    { key: 'english_reading', label: 'Reading', min: standard?.min_reading ?? 0 },
    { key: 'english_writing', label: 'Writing', min: standard?.min_writing ?? 0 },
    { key: 'english_speaking', label: 'Speaking', min: standard?.min_speaking ?? 0 },
    { key: 'english_listening', label: 'Listening', min: standard?.min_listening ?? 0 },
    { key: 'english_overall', label: 'Overall', min: standard?.min_overall ?? 0 },
  ];

  return (
    <div className="col-span-full">
      <div className="p-4 bg-blue-50/50 border border-blue-100 rounded-xl space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-sm font-semibold text-slate-700">
            {testType} Scores <span className="text-red-500">*</span>
          </label>
          {standard && (
            <span className="text-xs text-slate-500">
              Min: R {standard.min_reading} · W {standard.min_writing} · S {standard.min_speaking} · L {standard.min_listening} · O {standard.min_overall}
            </span>
          )}
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {fields.map(({ key, label, min }) => {
            const val = parseFloat(scores[key]);
            const hasVal = !isNaN(val) && scores[key] !== '';
            const meets = hasVal && val >= min;
            return (
              <div key={key}>
                <label className="label">{label}</label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.5"
                    min="0"
                    value={scores[key]}
                    onChange={(e) => onChange(key, e.target.value)}
                    className={`input-field pr-8 ${hasVal ? (meets ? 'border-green-300' : 'border-red-300') : ''}`}
                    placeholder="0.0"
                  />
                  {hasVal && (
                    <div className="absolute right-2.5 top-1/2 -translate-y-1/2">
                      {meets ? <CheckCircle className="w-4 h-4 text-green-500" /> : <AlertCircle className="w-4 h-4 text-red-400" />}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
