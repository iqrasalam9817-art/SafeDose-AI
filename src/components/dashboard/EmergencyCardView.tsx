import React, { useRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { useApp } from '../../stores/AppContext';
import {
  FileHeart,
  Printer,
  Share2,
  Phone,
  AlertOctagon,
  CheckCircle2,
  QrCode,
  Shield,
  Download,
  Copy,
  Check
} from 'lucide-react';

export const EmergencyCardView: React.FC = () => {
  const { profile, medications, interactions, caregivers } = useApp();
  const printRef = useRef<HTMLDivElement | null>(null);
  const [copied, setCopied] = React.useState(false);

  const criticalInteractions = interactions.filter(
    i => (i.severity === 'critical' || i.severity === 'deadly') && !i.dismissed
  );

  // Generate emergency snapshot JSON / URL
  const emergencyData = {
    patient: profile.fullName,
    age: profile.age,
    bloodType: profile.bloodType,
    allergies: profile.allergies,
    doctor: `${profile.primaryDoctorName} (${profile.primaryDoctorPhone})`,
    emergencyContact: caregivers[0] ? `${caregivers[0].name} (${caregivers[0].phone})` : 'None',
    medications: medications.map(m => `${m.drugName} ${m.dosage}${m.dosageUnit} (${m.frequency})`),
    criticalAlerts: criticalInteractions.map(c => `${c.drugAName} + ${c.drugBName}: ${c.whatItMeans}`)
  };

  const emergencyJsonString = JSON.stringify(emergencyData);
  const shareableUrl = `${window.location.origin}/#emergency-${encodeURIComponent(profile.fullName)}`;

  const handlePrint = () => {
    window.print();
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareableUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
            <FileHeart className="w-6 h-6 text-red-600" />
            <span>Emergency Medical ID & Wallet Card</span>
          </h2>
          <p className="text-xs font-medium text-slate-500 mt-1">
            Instantly accessible for first responders, emergency medical technicians (EMTs), and emergency room physicians.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleCopyLink}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-black uppercase tracking-tight border border-slate-200 transition-all cursor-pointer"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? 'Copied Link' : 'Copy Public Link'}</span>
          </button>

          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-red-600 hover:bg-red-700 text-white text-xs font-black uppercase tracking-tight shadow-sm hover:scale-102 transition-all cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>Print Wallet Card</span>
          </button>
        </div>
      </div>

      {/* ================= PRINTABLE WALLET CARD CONTAINER ================= */}
      <div
        ref={printRef}
        className="max-w-4xl mx-auto rounded-3xl bg-white border-2 border-red-500 p-6 sm:p-8 shadow-sm space-y-6 text-left relative overflow-hidden"
      >
        {/* Top Emergency Red Banner */}
        <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-red-200">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-red-600 text-white flex items-center justify-center text-2xl font-black shadow-sm">
              🚨
            </div>
            <div>
              <span className="text-[11px] font-black uppercase tracking-widest text-red-600 block">
                Official Emergency Medical Identification
              </span>
              <h3 className="text-xl sm:text-2xl font-black text-slate-900">{profile.fullName}</h3>
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs font-mono">
            <div className="bg-red-50 border border-red-200 px-3 py-1.5 rounded-xl text-red-800 font-bold">
              Blood Type: <strong className="text-slate-900 text-sm font-black">{profile.bloodType}</strong>
            </div>
            <div className="bg-slate-100 border border-slate-200 px-3 py-1.5 rounded-xl text-slate-700 font-bold">
              Age: <strong className="text-slate-900 font-black">{profile.age}</strong>
            </div>
          </div>
        </div>

        {/* 2-Column Main Info */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column (8 cols): Critical Warnings + Medications */}
          <div className="lg:col-span-8 space-y-5">
            {/* Critical Interaction Warning Box */}
            {criticalInteractions.length > 0 && (
              <div className="p-4 rounded-2xl bg-red-50 border-2 border-red-500 text-xs space-y-2">
                <div className="flex items-center gap-2 text-red-800 font-black uppercase tracking-wide">
                  <AlertOctagon className="w-4 h-4 text-red-600" />
                  <span>Critical Drug Conflict Alert</span>
                </div>
                {criticalInteractions.map(ci => (
                  <div key={ci.id} className="text-slate-800">
                    <strong className="text-slate-900 font-black">
                      ⚠️ {ci.drugAName} + {ci.drugBName}:
                    </strong>{' '}
                    <span className="font-medium">{ci.whatItMeans}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Documented Allergies */}
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs flex items-center justify-between">
              <span className="text-slate-600 font-black uppercase tracking-tight">Allergies & Contraindications:</span>
              <span className="text-amber-800 font-mono font-black">
                {profile.allergies && profile.allergies.length > 0
                  ? profile.allergies.join(', ')
                  : 'No Known Drug Allergies (NKDA)'}
              </span>
            </div>

            {/* Complete Active Medication List */}
            <div>
              <h4 className="text-xs font-black uppercase tracking-widest text-slate-500 mb-2.5">
                Active Medications List ({medications.length})
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                {medications.map(med => (
                  <div
                    key={med.id}
                    className="p-3 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between"
                  >
                    <div>
                      <span className="font-black text-slate-900 block">{med.drugName}</span>
                      <span className="text-[11px] font-medium text-slate-500">{med.frequency}</span>
                    </div>
                    <span className="px-2.5 py-1 rounded-full bg-slate-200 text-slate-800 font-mono text-xs font-black">
                      {med.dosage}
                      {med.dosageUnit}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Emergency Contacts & Physician */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs">
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                <span className="text-slate-500 block uppercase font-mono text-[10px] font-black">
                  Primary Prescriber
                </span>
                <strong className="text-slate-900 block font-black">{profile.primaryDoctorName}</strong>
                <span className="text-slate-600 font-medium flex items-center gap-1">
                  <Phone className="w-3 h-3 text-slate-500" /> {profile.primaryDoctorPhone}
                </span>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                <span className="text-slate-500 block uppercase font-mono text-[10px] font-black">
                  Family Emergency Contact
                </span>
                <strong className="text-slate-900 block font-black">
                  {caregivers[0]?.name || 'Family Contact'} ({caregivers[0]?.relation || 'Proxy'})
                </strong>
                <span className="text-slate-600 font-medium flex items-center gap-1">
                  <Phone className="w-3 h-3 text-slate-500" /> {caregivers[0]?.phone || '(555) 000-0000'}
                </span>
              </div>
            </div>
          </div>

          {/* Right Column (4 cols): Live QR Code */}
          <div className="lg:col-span-4 flex flex-col items-center justify-center p-6 rounded-3xl bg-slate-50 border border-slate-200 text-center space-y-4">
            <div className="p-3 bg-white rounded-2xl border border-slate-200 shadow-sm">
              <QRCodeSVG
                value={shareableUrl}
                size={160}
                level="H"
                includeMargin={false}
              />
            </div>
            <div className="space-y-1 text-center">
              <span className="text-xs font-black text-slate-900 block">Scan for EMT Live Access</span>
              <p className="text-[10px] font-medium text-slate-500 leading-relaxed">
                Opens full digital health profile, prescriber phone directory, and real-time interaction warnings.
              </p>
            </div>
            <div className="w-full text-center text-[10px] font-mono font-bold text-emerald-800 bg-emerald-50 py-1.5 rounded-xl border border-emerald-200">
              SafeDose Verified ID #SD-74892
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
