import React, { useState } from 'react';
import { useApp } from '../../stores/AppContext';
import {
  Settings,
  User,
  Heart,
  Phone,
  Shield,
  Save,
  RotateCcw,
  Download,
  AlertTriangle,
  CheckCircle2,
  Trash2
} from 'lucide-react';

export const SettingsView: React.FC = () => {
  const { profile, updateProfile, resetAllData, medications } = useApp();

  const [formData, setFormData] = useState({ ...profile });
  const [saved, setSaved] = useState(false);
  const [newAllergy, setNewAllergy] = useState('');
  const [newCondition, setNewCondition] = useState('');

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile(formData);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const handleAddAllergy = () => {
    if (!newAllergy.trim()) return;
    setFormData(prev => ({
      ...prev,
      allergies: [...prev.allergies, newAllergy.trim()]
    }));
    setNewAllergy('');
  };

  const handleRemoveAllergy = (index: number) => {
    setFormData(prev => ({
      ...prev,
      allergies: prev.allergies.filter((_, i) => i !== index)
    }));
  };

  const handleAddCondition = () => {
    if (!newCondition.trim()) return;
    setFormData(prev => ({
      ...prev,
      conditions: [...prev.conditions, newCondition.trim()]
    }));
    setNewCondition('');
  };

  const handleRemoveCondition = (index: number) => {
    setFormData(prev => ({
      ...prev,
      conditions: prev.conditions.filter((_, i) => i !== index)
    }));
  };

  const handleExportJson = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify({ profile, medications }, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `safedose_backup_${profile.fullName.toLowerCase().replace(/\s+/g, '_')}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header Bar */}
      <div>
        <h2 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
          <Settings className="w-6 h-6 text-slate-900" />
          <span>Patient Profile & Safety Parameters</span>
        </h2>
        <p className="text-xs font-medium text-slate-500 mt-1">
          Customise clinical demographics, chronic health conditions, allergies, and prescribing doctors.
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Section 1: Demographics */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-4">
          <h3 className="text-xs font-black uppercase tracking-widest text-slate-700 flex items-center gap-2">
            <User className="w-4 h-4 text-emerald-600" /> Personal Health Demographics
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="text-slate-700 block mb-1.5 font-bold">Full Legal Name</label>
              <input
                type="text"
                value={formData.fullName}
                onChange={e => setFormData({ ...formData, fullName: e.target.value })}
                className="w-full p-2.5 rounded-2xl bg-white border border-slate-200 text-slate-900 font-medium focus:outline-none focus:border-slate-900"
              />
            </div>

            <div>
              <label className="text-slate-700 block mb-1.5 font-bold">Age (Years)</label>
              <input
                type="number"
                value={formData.age}
                onChange={e => setFormData({ ...formData, age: Number(e.target.value) })}
                className="w-full p-2.5 rounded-2xl bg-white border border-slate-200 text-slate-900 font-medium focus:outline-none focus:border-slate-900"
              />
            </div>

            <div>
              <label className="text-slate-700 block mb-1.5 font-bold">Biological Sex</label>
              <select
                value={formData.gender}
                onChange={e => setFormData({ ...formData, gender: e.target.value as any })}
                className="w-full p-2.5 rounded-2xl bg-white border border-slate-200 text-slate-900 font-medium focus:outline-none focus:border-slate-900"
              >
                <option value="female">Female</option>
                <option value="male">Male</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div>
              <label className="text-slate-700 block mb-1.5 font-bold">Weight (lbs)</label>
              <input
                type="number"
                value={formData.weightLbs}
                onChange={e => setFormData({ ...formData, weightLbs: Number(e.target.value) })}
                className="w-full p-2.5 rounded-2xl bg-white border border-slate-200 text-slate-900 font-medium focus:outline-none focus:border-slate-900"
              />
            </div>

            <div>
              <label className="text-slate-700 block mb-1.5 font-bold">Blood Type</label>
              <select
                value={formData.bloodType}
                onChange={e => setFormData({ ...formData, bloodType: e.target.value })}
                className="w-full p-2.5 rounded-2xl bg-white border border-slate-200 text-slate-900 font-medium focus:outline-none focus:border-slate-900"
              >
                <option value="A+">A+</option>
                <option value="A-">A-</option>
                <option value="B+">B+</option>
                <option value="B-">B-</option>
                <option value="AB+">AB+</option>
                <option value="AB-">AB-</option>
                <option value="O+">O+</option>
                <option value="O-">O-</option>
              </select>
            </div>
          </div>
        </div>

        {/* Section 2: Chronic Conditions & Allergies */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-5">
          <h3 className="text-xs font-black uppercase tracking-widest text-slate-700 flex items-center gap-2">
            <Heart className="w-4 h-4 text-slate-900" /> Diagnosed Conditions & Allergies
          </h3>

          {/* Conditions */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700 block">Chronic Conditions</label>
            <div className="flex flex-wrap items-center gap-2">
              {formData.conditions.map((cond, idx) => (
                <span
                  key={idx}
                  className="px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-slate-800 text-xs font-bold flex items-center gap-1.5"
                >
                  {cond}
                  <button
                    type="button"
                    onClick={() => handleRemoveCondition(idx)}
                    className="text-slate-400 hover:text-slate-900 font-bold"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
            <div className="flex gap-2 max-w-md pt-1">
              <input
                type="text"
                value={newCondition}
                onChange={e => setNewCondition(e.target.value)}
                placeholder="Add condition (e.g. Hypertension)"
                className="flex-1 p-2.5 rounded-2xl bg-white border border-slate-200 text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-slate-900"
              />
              <button
                type="button"
                onClick={handleAddCondition}
                className="px-4 py-2 rounded-full bg-slate-900 hover:bg-black text-white text-xs font-black uppercase tracking-tight"
              >
                Add
              </button>
            </div>
          </div>

          {/* Allergies */}
          <div className="space-y-2 pt-2 border-t border-slate-200">
            <label className="text-xs font-bold text-slate-700 block">Drug & Food Allergies</label>
            <div className="flex flex-wrap items-center gap-2">
              {formData.allergies.map((allg, idx) => (
                <span
                  key={idx}
                  className="px-3 py-1 rounded-full bg-red-50 border border-red-200 text-red-800 text-xs font-bold flex items-center gap-1.5"
                >
                  {allg}
                  <button
                    type="button"
                    onClick={() => handleRemoveAllergy(idx)}
                    className="text-red-400 hover:text-red-800 font-bold"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
            <div className="flex gap-2 max-w-md pt-1">
              <input
                type="text"
                value={newAllergy}
                onChange={e => setNewAllergy(e.target.value)}
                placeholder="Add allergy (e.g. Penicillin)"
                className="flex-1 p-2.5 rounded-2xl bg-white border border-slate-200 text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-red-500"
              />
              <button
                type="button"
                onClick={handleAddAllergy}
                className="px-4 py-2 rounded-full bg-red-600 hover:bg-red-700 text-white text-xs font-black uppercase tracking-tight"
              >
                Add
              </button>
            </div>
          </div>
        </div>

        {/* Section 3: Physician Info */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-4">
          <h3 className="text-xs font-black uppercase tracking-widest text-slate-700 flex items-center gap-2">
            <Phone className="w-4 h-4 text-slate-900" /> Primary Prescribing Physician
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="text-slate-700 block mb-1.5 font-bold">Doctor Full Name</label>
              <input
                type="text"
                value={formData.primaryDoctorName}
                onChange={e => setFormData({ ...formData, primaryDoctorName: e.target.value })}
                className="w-full p-2.5 rounded-2xl bg-white border border-slate-200 text-slate-900 font-medium focus:outline-none focus:border-slate-900"
              />
            </div>

            <div>
              <label className="text-slate-700 block mb-1.5 font-bold">Clinic / Direct Phone</label>
              <input
                type="tel"
                value={formData.primaryDoctorPhone}
                onChange={e => setFormData({ ...formData, primaryDoctorPhone: e.target.value })}
                className="w-full p-2.5 rounded-2xl bg-white border border-slate-200 text-slate-900 font-medium focus:outline-none focus:border-slate-900"
              />
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex items-center justify-between pt-2">
          {saved ? (
            <span className="text-emerald-700 font-bold text-xs flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4" /> Changes successfully saved!
            </span>
          ) : (
            <span className="text-slate-500 text-xs font-mono font-medium">Changes persist automatically</span>
          )}

          <button
            type="submit"
            className="flex items-center gap-2 px-7 py-3 rounded-full bg-slate-900 hover:bg-black text-white text-xs font-black uppercase tracking-tight shadow-sm hover:scale-102 transition-all cursor-pointer"
          >
            <Save className="w-4 h-4 text-emerald-400" />
            <span>Save Profile Changes</span>
          </button>
        </div>
      </form>

      {/* Section 4: Data Management & Reset */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4 pt-6">
        <h3 className="text-xs font-black uppercase tracking-widest text-red-600 flex items-center gap-2">
          <Shield className="w-4 h-4" /> Data Management & Reset
        </h3>

        <div className="flex flex-wrap items-center justify-between gap-4 text-xs">
          <div className="text-slate-600 font-medium">
            Export all active prescription records or reset back to default multi-drug clinical demo state.
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={handleExportJson}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-black uppercase tracking-tight border border-slate-200 transition-colors cursor-pointer"
            >
              <Download className="w-4 h-4" /> Export Backup (JSON)
            </button>

            <button
              onClick={() => {
                if (confirm('Reset all medications, profile, and schedule back to default demo state?')) {
                  resetAllData();
                }
              }}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-full bg-red-50 hover:bg-red-100 text-red-800 font-black uppercase tracking-tight border border-red-200 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" /> Reset to Demo State
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
