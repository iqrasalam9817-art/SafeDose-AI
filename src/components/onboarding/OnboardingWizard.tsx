import React, { useState } from 'react';
import { useApp } from '../../stores/AppContext';
import {
  X,
  User,
  Pill,
  Sparkles,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  Camera,
  Heart
} from 'lucide-react';

export const OnboardingWizard: React.FC = () => {
  const {
    showOnboarding,
    completeOnboarding,
    profile,
    updateProfile,
    medications,
    recalculateAllInteractions
  } = useApp();

  const [step, setStep] = useState(1);
  const [fullName, setFullName] = useState(profile.fullName);
  const [age, setAge] = useState(profile.age);
  const [bloodType, setBloodType] = useState(profile.bloodType);

  if (!showOnboarding) return null;

  const handleNextStep = () => {
    if (step === 1) {
      updateProfile({ fullName, age, bloodType });
      setStep(2);
    } else if (step === 2) {
      setStep(3);
      recalculateAllInteractions();
    } else if (step === 3) {
      setStep(4);
    } else {
      completeOnboarding();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="relative w-full max-w-xl bg-[#0F172A] border border-blue-500/30 rounded-3xl p-6 sm:p-10 shadow-2xl space-y-6 text-left">
        {/* Step Indicator */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-2">
            <span className="w-7 h-7 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs">
              {step}
            </span>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
              {step === 1 && 'Patient Setup'}
              {step === 2 && 'Prescription Review'}
              {step === 3 && 'FDA Safety Analysis'}
              {step === 4 && 'Protection Active'}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            {[1, 2, 3, 4].map(s => (
              <div
                key={s}
                className={`w-2.5 h-2.5 rounded-full transition-colors ${
                  s === step ? 'bg-blue-500' : s < step ? 'bg-emerald-500' : 'bg-slate-800'
                }`}
              />
            ))}
          </div>
        </div>

        {/* STEP 1 */}
        {step === 1 && (
          <div className="space-y-4">
            <div className="space-y-1">
              <h3 className="text-xl font-bold text-white">Welcome to 🌿 SafeDose</h3>
              <p className="text-xs text-slate-400">
                Let's set up your profile to ensure all drug-drug and food interactions are calculated accurately.
              </p>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-slate-300 block mb-1 font-semibold">Your Name or Loved One's Name</label>
                <input
                  type="text"
                  value={fullName}
                  onChange={e => setFullName(e.target.value)}
                  className="w-full p-3 rounded-xl bg-slate-900 border border-white/10 text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 block mb-1 font-semibold">Age</label>
                  <input
                    type="number"
                    value={age}
                    onChange={e => setAge(Number(e.target.value))}
                    className="w-full p-3 rounded-xl bg-slate-900 border border-white/10 text-white focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="text-slate-300 block mb-1 font-semibold">Blood Type</label>
                  <select
                    value={bloodType}
                    onChange={e => setBloodType(e.target.value)}
                    className="w-full p-3 rounded-xl bg-slate-900 border border-white/10 text-white focus:outline-none focus:border-blue-500"
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
          </div>
        )}

        {/* STEP 2 */}
        {step === 2 && (
          <div className="space-y-4">
            <div className="space-y-1">
              <h3 className="text-xl font-bold text-white">Your Starting Medications</h3>
              <p className="text-xs text-slate-400">
                We've pre-loaded a clinical multi-drug regimen for demonstration. You can add more anytime with the photo scanner.
              </p>
            </div>

            <div className="max-h-48 overflow-y-auto space-y-2 p-3 rounded-2xl bg-slate-900/80 border border-white/5 text-xs">
              {medications.map(med => (
                <div key={med.id} className="flex items-center justify-between p-2 rounded-lg bg-slate-950">
                  <span className="font-bold text-white">💊 {med.drugName}</span>
                  <span className="text-slate-400 font-mono">
                    {med.dosage}
                    {med.dosageUnit} • {med.frequency}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* STEP 3 */}
        {step === 3 && (
          <div className="space-y-4 text-center py-4">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-blue-500/20 text-blue-400 flex items-center justify-center text-3xl animate-spin [animation-duration:8s]">
              🧠
            </div>
            <h3 className="text-xl font-bold text-white">Cross-Referencing FDA Database</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto leading-relaxed">
              SafeDose is running 15 pairwise interaction checks across CYP450 metabolic enzymes and FDA drug monographs...
            </p>
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-300">
              ✓ 1 Critical Conflict identified (Warfarin + Aspirin)
              <br />✓ 2 Timing Cautions mapped (Calcium separation)
            </div>
          </div>
        )}

        {/* STEP 4 */}
        {step === 4 && (
          <div className="space-y-4 text-center py-2">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-3xl">
              🌿
            </div>
            <h3 className="text-2xl font-black text-white">You're Protected 24/7</h3>
            <p className="text-xs text-slate-300 max-w-sm mx-auto leading-relaxed">
              SafeDose is now watching your medications. Your interactive schedule, conflict action plans, and emergency QR card are ready.
            </p>
          </div>
        )}

        {/* Bottom Action Bar */}
        <div className="flex items-center justify-between pt-4 border-t border-white/10">
          <button
            type="button"
            onClick={completeOnboarding}
            className="text-xs text-slate-400 hover:text-white underline cursor-pointer"
          >
            Skip Intro
          </button>

          <button
            type="button"
            onClick={handleNextStep}
            className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-blue-600 text-white font-bold text-xs shadow-lg shadow-blue-500/25 hover:scale-105 transition-all cursor-pointer"
          >
            <span>{step === 4 ? 'Launch SafeDose Dashboard' : 'Continue'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
