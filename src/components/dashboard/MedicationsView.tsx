import React, { useState, useEffect } from 'react';
import { useApp } from '../../stores/AppContext';
import { Medication } from '../../types';
import {
  Pill,
  Plus,
  Search,
  LayoutGrid,
  List,
  Clock,
  Utensils,
  AlertTriangle,
  Info,
  Trash2,
  Edit3,
  CheckCircle2,
  Camera
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
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
            <Pill className="w-6 h-6 text-emerald-600" />
            <span>Medication Manager</span>
            <span className="text-xs font-black px-3 py-1 rounded-full bg-slate-100 text-slate-800 border border-slate-200">
              {medications.length} Active Prescriptions
            </span>
          </h2>
          <p className="text-xs font-medium text-slate-500 mt-1">
            Active medications monitored 24/7 for combinatorial and food interactions.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {/* View Toggle */}
          <div className="flex items-center p-1 rounded-full bg-slate-100 border border-slate-200">
            <button
              onClick={() => setViewMode('cards')}
              className={`p-1.5 rounded-full transition-colors cursor-pointer ${
                viewMode === 'cards' ? 'bg-slate-900 text-white shadow-xs' : 'text-slate-500 hover:text-slate-900'
              }`}
              title="Card View"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-full transition-colors cursor-pointer ${
                viewMode === 'list' ? 'bg-slate-900 text-white shadow-xs' : 'text-slate-500 hover:text-slate-900'
              }`}
              title="List View"
            >
              <List className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={() => setShowAddMedModal(true)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-slate-900 hover:bg-black text-white text-xs font-black uppercase tracking-tight shadow-sm hover:scale-102 active:scale-98 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4 text-emerald-400" />
            <span>Add Medication</span>
          </button>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => {
              setSearchQuery(e.target.value);
              setMedicationSearchQuery(e.target.value);
            }}
            placeholder="Search by drug name, generic, or class..."
            className="w-full pl-11 pr-9 py-2.5 rounded-full bg-white border border-slate-200 text-xs font-bold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-slate-900 shadow-xs"
          />
          {searchQuery && (
            <button
              onClick={() => {
                setSearchQuery('');
                setMedicationSearchQuery('');
              }}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 text-xs font-bold"
              title="Clear search"
            >
              ✕
            </button>
          )}
        </div>

        {/* Drug Class Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-xl">
          {drugClasses.map(cls => (
            <button
              key={cls}
              onClick={() => setSelectedClass(cls)}
              className={`px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-tight whitespace-nowrap transition-all cursor-pointer ${
                selectedClass === cls
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200'
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
                className="bg-white rounded-3xl p-6 border border-slate-200 flex flex-col justify-between group hover:border-slate-400 cursor-pointer relative overflow-hidden transition-all duration-200 shadow-sm hover:shadow-md"
              >
                {/* Accent Top Bar */}
                <div
                  className={`absolute top-0 left-0 right-0 h-2 ${
                    conflictCount > 0
                      ? 'bg-red-500'
                      : 'bg-emerald-500'
                  }`}
                />

                <div className="space-y-3 mt-1">
                  {/* Top Row */}
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center text-xl shadow-xs group-hover:scale-105 transition-transform">
                        💊
                      </div>
                      <div>
                        <h3 className="font-black text-base text-slate-900 group-hover:text-emerald-700 transition-colors">
                          {med.drugName}
                        </h3>
                        <span className="text-[11px] font-bold text-slate-500 line-clamp-1">
                          {med.genericName || med.brandName || 'Prescription'}
                        </span>
                      </div>
                    </div>

                    <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-900 text-xs font-black border border-slate-200">
                      {med.dosage} {med.dosageUnit}
                    </span>
                  </div>

                  {/* Drug Class Tag */}
                  <div className="text-xs text-emerald-700 font-black uppercase tracking-tight">
                    {med.drugClass}
                  </div>

                  {/* Frequency & Food Info */}
                  <div className="space-y-1.5 text-xs text-slate-600 font-medium pt-2 border-t border-slate-100">
                    <div className="flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span>{med.frequency}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Utensils className="w-3.5 h-3.5 text-slate-400" />
                      <span>{med.withFood ? 'Take with food 🍽️' : 'Empty stomach or with food'}</span>
                    </div>
                  </div>

                  {/* Identified Conflicts Pill */}
                  {conflictCount > 0 ? (
                    <div className="p-2.5 rounded-xl bg-red-50 border border-red-200 text-[11px] font-black text-red-700 flex items-center gap-1.5">
                      <AlertTriangle className="w-3.5 h-3.5 text-red-600" />
                      <span>{conflictCount} active drug conflict{conflictCount > 1 ? 's' : ''} detected</span>
                    </div>
                  ) : (
                    <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-[11px] font-black text-emerald-800 flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Compatible with current medications</span>
                    </div>
                  )}
                </div>

                {/* Card Footer Actions */}
                <div className="flex items-center justify-between pt-4 mt-4 border-t border-slate-100 text-xs">
                  <span className="text-slate-400 text-[11px] font-bold">
                    Prescriber: {med.prescriber ? med.prescriber.split(' ')[1] || 'Doctor' : 'PCP'}
                  </span>
                  <button className="text-slate-900 font-black uppercase tracking-tight hover:text-emerald-700 group-hover:translate-x-0.5 transition-transform flex items-center gap-1">
                    Details →
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ================= LIST VIEW ================= */}
      {viewMode === 'list' && (
        <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 text-slate-500 uppercase font-black tracking-wider text-[10px] border-b border-slate-200">
                <tr>
                  <th className="p-4 font-black">Medication</th>
                  <th className="p-4 font-black">Dosage</th>
                  <th className="p-4 font-black">Class</th>
                  <th className="p-4 font-black">Frequency</th>
                  <th className="p-4 font-black">Dietary Rule</th>
                  <th className="p-4 font-black">Safety Status</th>
                  <th className="p-4 text-right font-black">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredMeds.map(med => {
                  const conflictCount = getConflictCount(med.drugName);
                  return (
                    <tr
                      key={med.id}
                      onClick={() => setActiveDrugDetail(med)}
                      className="hover:bg-slate-50 transition-colors cursor-pointer"
                    >
                      <td className="p-4">
                        <div className="font-black text-slate-900 text-sm">{med.drugName}</div>
                        <div className="text-[11px] font-bold text-slate-400">{med.genericName}</div>
                      </td>
                      <td className="p-4 font-mono font-black text-slate-900">
                        {med.dosage} {med.dosageUnit}
                      </td>
                      <td className="p-4 text-emerald-700 font-black">{med.drugClass}</td>
                      <td className="p-4 font-medium">{med.frequency}</td>
                      <td className="p-4 font-medium">
                        {med.withFood ? '🍽️ With food' : '🥛 Normal'}
                      </td>
                      <td className="p-4">
                        {conflictCount > 0 ? (
                          <span className="px-3 py-1 rounded-full bg-red-100 text-red-700 font-black text-[10px] border border-red-200 inline-flex items-center gap-1">
                            <AlertTriangle className="w-3 h-3" /> {conflictCount} Conflict
                          </span>
                        ) : (
                          <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 font-black text-[10px] border border-emerald-200 inline-flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" /> Compatible
                          </span>
                        )}
                      </td>
                      <td className="p-4 text-right">
                        <button
                          onClick={e => {
                            e.stopPropagation();
                            if (confirm(`Remove ${med.drugName}?`)) removeMedication(med.id);
                          }}
                          className="p-2 text-slate-400 hover:text-red-600 rounded-full hover:bg-slate-100 transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
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
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-4 shadow-sm">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-slate-100 flex items-center justify-center text-3xl">
            💊
          </div>
          <h3 className="text-lg font-black text-slate-900">No medications match your search</h3>
          <p className="text-xs font-medium text-slate-500 max-w-sm mx-auto">
            Try adjusting your search filters or click below to add a new prescription.
          </p>
          <button
            onClick={() => setShowAddMedModal(true)}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-slate-900 hover:bg-black text-white text-xs font-black uppercase tracking-tight shadow-sm cursor-pointer"
          >
            <Plus className="w-4 h-4 text-emerald-400" /> Add Medication
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
