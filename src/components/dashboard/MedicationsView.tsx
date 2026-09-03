import React, { useState } from 'react';
import { useApp } from '../../stores/AppContext';
import {
  Pill,
  Plus,
  Search,
  LayoutGrid,
  List,
  Clock,
  Utensils,
  AlertTriangle,
  CheckCircle2,
  Trash2,
  ChevronRight
} from 'lucide-react';
import { DrugDetailModal } from '../modals/DrugDetailModal';

export const MedicationsView: React.FC = () => {
  const {
    medications,
    setShowAddMedModal,
    activeDrugDetail,
    setActiveDrugDetail,
    removeMedication,
    interactions,
    medicationSearchQuery,
    setMedicationSearchQuery
  } = useApp();

  const [viewMode, setViewMode] = useState<'cards' | 'list'>('cards');
  const searchQuery = medicationSearchQuery || '';
  const setSearchQuery = (val: string) => setMedicationSearchQuery(val);
  const [selectedClass, setSelectedClass] = useState<string>('All');

  // Extract unique drug classes
  const drugClasses = ['All', ...Array.from(new Set(medications.map(m => m.drugClass)))];

  // Filtered meds
  const filteredMeds = medications.filter(m => {
    const matchesSearch =
      m.drugName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (m.genericName && m.genericName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      m.drugClass.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesClass = selectedClass === 'All' || m.drugClass === selectedClass;

    return matchesSearch && matchesClass;
  });

  const getConflictCount = (drugName: string) => {
    return interactions.filter(
      i =>
        (i.drugAName.toLowerCase().includes(drugName.toLowerCase()) ||
          i.drugBName.toLowerCase().includes(drugName.toLowerCase())) &&
        !i.dismissed
    ).length;
  };

  return (
    <div className="space-y-6 text-white font-geist">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
              <Pill className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2.5">
                <span>My Medications</span>
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-white/10 text-slate-300 border border-white/10">
                  {medications.length} Active
                </span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Continuously monitored for pairwise conflicts, chronopharmacology, and dietary guidelines.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          {/* View Toggle */}
          <div className="flex items-center p-1 rounded-xl bg-white/5 border border-white/10">
            <button
              onClick={() => setViewMode('cards')}
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                viewMode === 'cards' ? 'bg-white/15 text-white shadow-xs' : 'text-slate-400 hover:text-white'
              }`}
              title="Card View"
              aria-label="Card View"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                viewMode === 'list' ? 'bg-white/15 text-white shadow-xs' : 'text-slate-400 hover:text-white'
              }`}
              title="List View"
              aria-label="List View"
            >
              <List className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={() => setShowAddMedModal(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white hover:bg-slate-200 text-black text-xs font-semibold tracking-tight shadow-md hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Medication</span>
          </button>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => {
              setSearchQuery(e.target.value);
              setMedicationSearchQuery(e.target.value);
            }}
            placeholder="Search by drug name, generic, or class..."
            className="w-full pl-10 pr-9 py-2 rounded-xl bg-white/5 border border-white/10 text-xs font-medium text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 transition-all shadow-inner"
          />
          {searchQuery && (
            <button
              onClick={() => {
                setSearchQuery('');
                setMedicationSearchQuery('');
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white text-xs"
              title="Clear search"
            >
              ✕
            </button>
          )}
        </div>

        {/* Drug Class Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-xl scrollbar-none">
          {drugClasses.map(cls => (
            <button
              key={cls}
              onClick={() => setSelectedClass(cls)}
              className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-all cursor-pointer ${
                selectedClass === cls
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-xs'
                  : 'bg-white/5 text-slate-400 hover:text-white hover:bg-white/10 border border-white/10'
              }`}
            >
              {cls}
            </button>
          ))}
        </div>
      </div>

      {/* ================= CARDS VIEW ================= */}
      {viewMode === 'cards' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredMeds.map(med => {
            const conflictCount = getConflictCount(med.drugName);
            return (
              <div
                key={med.id}
                onClick={() => setActiveDrugDetail(med)}
                className="group relative bg-[#0e0e17]/80 rounded-2xl p-5 border border-white/10 hover:border-white/20 flex flex-col justify-between cursor-pointer transition-all duration-300 shadow-lg shadow-black/20 hover:-translate-y-1 hover:shadow-xl hover:shadow-cyan-500/5"
              >
                {/* Accent Top Bar */}
                <div
                  className={`absolute top-0 left-0 right-0 h-1 rounded-t-2xl ${
                    conflictCount > 0
                      ? 'bg-red-500 shadow-[0_0_12px_rgba(239,68,68,0.5)]'
                      : 'bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.5)]'
                  }`}
                />

                <div className="space-y-3 mt-1">
                  {/* Top Row: Name + Dosage */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-xl shrink-0 group-hover:scale-105 transition-transform">
                        💊
                      </div>
                      <div>
                        <h3 className="font-bold text-base text-white group-hover:text-cyan-300 transition-colors">
                          {med.drugName}
                        </h3>
                        <span className="text-xs text-slate-400 font-normal line-clamp-1">
                          {med.genericName || med.brandName || 'Prescription'}
                        </span>
                      </div>
                    </div>

                    <span className="px-2.5 py-1 rounded-lg bg-white/10 text-white text-xs font-mono font-semibold border border-white/10 shrink-0">
                      {med.dosage} {med.dosageUnit}
                    </span>
                  </div>

                  {/* Drug Class Badge as Compact Pill */}
                  <div>
                    <span className="inline-block px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">
                      {med.drugClass}
                    </span>
                  </div>

                  {/* Frequency & Food Info */}
                  <div className="space-y-1 text-xs text-slate-300 pt-2 border-t border-white/5">
                    <div className="flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span>{med.frequency}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Utensils className="w-3.5 h-3.5 text-slate-400" />
                      <span>{med.withFood ? 'Take with food 🍽️' : 'With or without food'}</span>
                    </div>
                  </div>

                  {/* Identified Conflicts Pill (with text + icon) */}
                  {conflictCount > 0 ? (
                    <div className="p-2.5 rounded-xl bg-red-500/10 border border-red-500/30 text-xs font-semibold text-red-400 flex items-center gap-2">
                      <AlertTriangle className="w-3.5 h-3.5 text-red-400 shrink-0" />
                      <span>{conflictCount} active drug conflict{conflictCount > 1 ? 's' : ''} detected</span>
                    </div>
                  ) : (
                    <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs font-semibold text-emerald-400 flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span>Compatible with current medications</span>
                    </div>
                  )}
                </div>

                {/* Card Footer Actions */}
                <div className="flex items-center justify-between pt-3.5 mt-3 border-t border-white/5 text-xs">
                  <span className="text-slate-400 text-[11px]">
                    Prescriber: {med.prescriber ? med.prescriber.split(' ')[1] || med.prescriber : 'Physician'}
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveDrugDetail(med);
                    }}
                    className="text-cyan-400 font-semibold hover:text-cyan-300 group-hover:translate-x-0.5 transition-transform flex items-center gap-1 cursor-pointer"
                  >
                    <span>Details</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ================= LIST VIEW ================= */}
      {viewMode === 'list' && (
        <div className="bg-[#0e0e17]/80 rounded-2xl border border-white/10 overflow-hidden shadow-lg">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-white/[0.03] text-slate-400 uppercase font-semibold tracking-wider text-[10px] border-b border-white/10">
                <tr>
                  <th className="p-4">Medication</th>
                  <th className="p-4">Dosage</th>
                  <th className="p-4">Class</th>
                  <th className="p-4">Frequency</th>
                  <th className="p-4">Dietary Rule</th>
                  <th className="p-4">Safety Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredMeds.map(med => {
                  const conflictCount = getConflictCount(med.drugName);
                  return (
                    <tr
                      key={med.id}
                      onClick={() => setActiveDrugDetail(med)}
                      className="hover:bg-white/[0.03] transition-colors cursor-pointer"
                    >
                      <td className="p-4">
                        <div className="font-bold text-white text-sm">{med.drugName}</div>
                        <div className="text-[11px] text-slate-400">{med.genericName}</div>
                      </td>
                      <td className="p-4 font-mono font-semibold text-white">
                        {med.dosage} {med.dosageUnit}
                      </td>
                      <td className="p-4">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">
                          {med.drugClass}
                        </span>
                      </td>
                      <td className="p-4">{med.frequency}</td>
                      <td className="p-4">
                        {med.withFood ? '🍽️ With food' : '🥛 Normal'}
                      </td>
                      <td className="p-4">
                        {conflictCount > 0 ? (
                          <span className="px-2.5 py-1 rounded-full bg-red-500/10 text-red-400 font-semibold text-[11px] border border-red-500/30 inline-flex items-center gap-1">
                            <AlertTriangle className="w-3 h-3" /> {conflictCount} Conflict
                          </span>
                        ) : (
                          <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 font-semibold text-[11px] border border-emerald-500/30 inline-flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" /> Compatible
                          </span>
                        )}
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-2" onClick={e => e.stopPropagation()}>
                          <button
                            onClick={() => setActiveDrugDetail(med)}
                            className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-cyan-400 hover:text-cyan-300 text-xs font-medium transition-colors"
                          >
                            Details
                          </button>
                          <button
                            onClick={() => {
                              if (confirm(`Remove ${med.drugName}?`)) removeMedication(med.id);
                            }}
                            className="p-1.5 text-slate-400 hover:text-red-400 rounded-lg hover:bg-white/5 transition-colors"
                            title="Remove medication"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Empty State */}
      {filteredMeds.length === 0 && (
        <div className="bg-[#0e0e17]/80 rounded-2xl border border-white/10 p-12 text-center space-y-4 shadow-lg">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-3xl">
            💊
          </div>
          <h3 className="text-lg font-bold text-white">No medications match your search</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Try adjusting your search filters or click below to add a new prescription.
          </p>
          <button
            onClick={() => setShowAddMedModal(true)}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white hover:bg-slate-200 text-black text-xs font-semibold shadow-md cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Add Medication
          </button>
        </div>
      )}

      {/* Slide-over / Modal Detail */}
      <DrugDetailModal
        medication={activeDrugDetail}
        onClose={() => setActiveDrugDetail(null)}
      />
    </div>
  );
};
