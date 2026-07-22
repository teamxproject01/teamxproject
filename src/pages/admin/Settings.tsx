import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Settings as SettingsIcon, Shield, Users, Bell, Award, Save, CheckCircle, AlertCircle } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { EnglishScoreStandard } from '../../types';

export default function AdminSettings() {
  const [standards, setStandards] = useState<EnglishScoreStandard[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    supabase.from('english_score_standards').select('*').order('test_type').then(({ data, error }) => {
      if (error) setError(error.message);
      setStandards(data ?? []);
      setLoading(false);
    });
  }, []);

  const updateField = (id: string, field: keyof EnglishScoreStandard, value: string | boolean) => {
    setStandards(prev => prev.map(s => s.id === id ? { ...s, [field]: value } : s));
  };

  const handleSave = async () => {
    setSaving(true);
    setError('');
    setSuccess(false);

    for (const s of standards) {
      const { error } = await supabase.from('english_score_standards')
        .update({
          min_reading: parseFloat(String(s.min_reading)) || 0,
          min_writing: parseFloat(String(s.min_writing)) || 0,
          min_speaking: parseFloat(String(s.min_speaking)) || 0,
          min_listening: parseFloat(String(s.min_listening)) || 0,
          min_overall: parseFloat(String(s.min_overall)) || 0,
          is_active: s.is_active,
          updated_at: new Date().toISOString(),
        })
        .eq('id', s.id);

      if (error) {
        setError(error.message);
        setSaving(false);
        return;
      }
    }

    setSaving(false);
    setSuccess(true);
    setTimeout(() => setSuccess(false), 3000);
  };

  const scoreFields: { key: keyof EnglishScoreStandard; label: string }[] = [
    { key: 'min_reading', label: 'Reading' },
    { key: 'min_writing', label: 'Writing' },
    { key: 'min_speaking', label: 'Speaking' },
    { key: 'min_listening', label: 'Listening' },
    { key: 'min_overall', label: 'Overall' },
  ];

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <SettingsIcon className="w-6 h-6 text-blue-600" /> Settings
        </h1>
        <p className="text-slate-500 text-sm mt-1">Platform configuration and preferences</p>
      </div>

      {/* English Score Standards */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="card p-6">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center flex-shrink-0">
            <Award className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900">English Score Standards</h3>
            <p className="text-sm text-slate-500">Set minimum eligible scores for each English test type. Applications with scores below these thresholds will be flagged.</p>
          </div>
        </div>

        {error && (
          <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl mb-4">
            <AlertCircle className="w-4 h-4 text-red-500" />
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {success && (
          <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-xl mb-4">
            <CheckCircle className="w-4 h-4 text-green-600" />
            <p className="text-sm text-green-700">Standards saved successfully.</p>
          </div>
        )}

        {loading ? (
          <div className="space-y-3">
            {[1,2,3,4].map(i => <div key={i} className="h-20 bg-slate-50 rounded-xl animate-pulse" />)}
          </div>
        ) : (
          <div className="space-y-4">
            {standards.map((s) => (
              <div key={s.id} className={`p-4 rounded-xl border-2 transition-all ${s.is_active ? 'border-blue-100 bg-blue-50/30' : 'border-slate-100 bg-slate-50'}`}>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-800">{s.test_type}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${s.is_active ? 'bg-green-100 text-green-700' : 'bg-slate-200 text-slate-500'}`}>
                      {s.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <span className="text-xs text-slate-500">Enabled</span>
                    <button
                      type="button"
                      onClick={() => updateField(s.id, 'is_active', !s.is_active)}
                      className={`relative w-10 h-5 rounded-full transition-colors ${s.is_active ? 'bg-blue-600' : 'bg-slate-300'}`}
                    >
                      <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${s.is_active ? 'translate-x-5' : 'translate-x-0.5'}`} />
                    </button>
                  </label>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                  {scoreFields.map(({ key, label }) => (
                    <div key={key}>
                      <label className="label">{label}</label>
                      <input
                        type="number"
                        step="0.5"
                        min="0"
                        value={s[key] as number}
                        onChange={(e) => updateField(s.id, key, e.target.value)}
                        className="input-field"
                      />
                    </div>
                  ))}
                </div>
              </div>
            ))}

            <Button onClick={handleSave} loading={saving} className="w-full sm:w-auto">
              <Save className="w-4 h-4" /> Save Standards
            </Button>
          </div>
        )}
      </motion.div>

      {/* Other settings (placeholder) */}
      <div className="space-y-4">
        {[
          { icon: Users, title: 'Role Management', desc: 'Manage staff roles and permissions across the platform.', action: 'Configure' },
          { icon: Shield, title: 'Security', desc: 'Multi-factor authentication and session policies for staff accounts.', action: 'Configure' },
          { icon: Bell, title: 'Notifications', desc: 'Email and in-app notification preferences for different event types.', action: 'Configure' },
        ].map(({ icon: Icon, title, desc, action }) => (
          <motion.div
            key={title}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="card p-5 flex items-center gap-4"
          >
            <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center flex-shrink-0">
              <Icon className="w-6 h-6 text-blue-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-slate-900">{title}</h3>
              <p className="text-sm text-slate-500">{desc}</p>
            </div>
            <button className="btn-secondary text-sm px-4 py-2 flex-shrink-0 whitespace-nowrap">{action}</button>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
