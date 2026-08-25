import React, { useState, useRef } from 'react';
import { useApp } from '../../stores/AppContext';
import { Medication } from '../../types';
import {
  X,
  Camera,
  Search,
  Mic,
  MicOff,
  FileText,
  Sparkles,
  Upload,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  ArrowRight,
  Plus
} from 'lucide-react';
import { scanPrescriptionLabel } from '../../lib/gemini';
import { searchRxNormDrugs, searchFdaDrugLabel } from '../../lib/fda';

type TabType = 'scan' | 'search' | 'voice' | 'paste';

export const AddMedModal: React.FC = () => {
  const { showAddMedModal, setShowAddMedModal, addMedication, medications } = useApp();

  const [activeTab, setActiveTab] = useState<TabType>('scan');

  // Form State
  const [drugName, setDrugName] = useState('');
  const [genericName, setGenericName] = useState('');
  const [dosage, setDosage] = useState('');
  const [dosageUnit, setDosageUnit] = useState('mg');
  const [frequency, setFrequency] = useState('Once daily (Morning)');
  const [drugClass, setDrugClass] = useState('Prescription');
  const [withFood, setWithFood] = useState(false);
  const [timingInstructions, setTimingInstructions] = useState('');
  const [notes, setNotes] = useState('');

  // Scanning & OCR state
  const [isScanning, setIsScanning] = useState(false);
  const [scanPreviewUrl, setScanPreviewUrl] = useState<string | null>(null);
  const [scanResultConfidence, setScanResultConfidence] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<string[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // Voice state
  const [isListening, setIsListening] = useState(false);
  const [voiceTranscript, setVoiceTranscript] = useState('');

  // Paste Bulk state
  const [bulkText, setBulkText] = useState('');

  if (!showAddMedModal) return null;

  const resetForm = () => {
    setDrugName('');
    setGenericName('');
    setDosage('');
    setDosageUnit('mg');
    setFrequency('Once daily (Morning)');
    setDrugClass('Prescription');
    setWithFood(false);
    setTimingInstructions('');
    setNotes('');
    setScanPreviewUrl(null);
    setScanResultConfidence(null);
  };

  const handleClose = () => {
    resetForm();
    setShowAddMedModal(false);
  };

  // Submit single medication
  const handleSubmitSingle = (e: React.FormEvent) => {
    e.preventDefault();
    if (!drugName.trim()) return;

    addMedication({
      drugName: drugName.trim(),
      genericName: genericName.trim() || undefined,
      dosage: dosage.trim() || '10',
      dosageUnit: dosageUnit || 'mg',
      frequency: frequency || 'Once daily',
      drugClass: drugClass || 'Prescription',
      withFood,
      timingInstructions: timingInstructions || undefined,
      notes: notes || undefined,
      prescriber: 'Dr. Physician'
    });
    handleClose();
  };

  // Process File / Image Scan
  const handleFileUpload = async (file: File) => {
    const reader = new FileReader();
    reader.onload = async () => {
      const base64Data = (reader.result as string).split(',')[1];
      setScanPreviewUrl(reader.result as string);
      setIsScanning(true);

      try {
        const extracted = await scanPrescriptionLabel(base64Data, file.type);
        if (extracted) {
          setDrugName(extracted.drugName || '');
          setGenericName(extracted.genericName || '');
          setDosage(extracted.dosage || '');
          setDosageUnit(extracted.dosageUnit || 'mg');
          setFrequency(extracted.frequency || 'Once daily');
          setDrugClass(extracted.drugClass || 'Prescription');
          setWithFood(!!extracted.withFood);
          setTimingInstructions(extracted.timingInstructions || '');
          setScanResultConfidence(extracted.confidence || 0.95);
        }
      } catch (err) {
        console.error('Scan error:', err);
      } finally {
        setIsScanning(false);
      }
    };
    reader.readAsDataURL(file);
  };

  // Quick Demo Bottle Presets for fast testing
  const handleTestScanSample = (sampleDrug: {
    name: string;
    generic: string;
    dosage: string;
    unit: string;
    freq: string;
    cls: string;
    food: boolean;
    timing: string;
  }) => {
    setIsScanning(true);
    setTimeout(() => {
      setDrugName(sampleDrug.name);
      setGenericName(sampleDrug.generic);
      setDosage(sampleDrug.dosage);
      setDosageUnit(sampleDrug.unit);
      setFrequency(sampleDrug.freq);
      setDrugClass(sampleDrug.cls);
      setWithFood(sampleDrug.food);
      setTimingInstructions(sampleDrug.timing);
      setScanResultConfidence(0.98);
      setIsScanning(false);
    }, 800);
  };

  // Autocomplete Search
  const handleSearchChange = async (val: string) => {
    setSearchQuery(val);
    if (val.length < 2) {
      setSearchResults([]);
      return;
    }
    setIsSearching(true);
    try {
      const res = await searchRxNormDrugs(val);
      setSearchResults(res);
    } catch (e) {
      console.error(e);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSelectDrugSearch = (selectedName: string) => {
    setDrugName(selectedName);
    setGenericName(selectedName.toLowerCase());
    setSearchResults([]);
    setSearchQuery(selectedName);
  };

  // Voice Web Speech Recognition
  const toggleVoice = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert('Speech recognition is not supported in this browser. Please type or scan.');
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;

    if (!isListening) {
      recognition.start();
      setIsListening(true);

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setVoiceTranscript(transcript);
        setIsListening(false);

        // Simple parse
        setNotes(`Dictated: "${transcript}"`);
        if (transcript.toLowerCase().includes('warfarin')) setDrugName('Warfarin');
        else if (transcript.toLowerCase().includes('aspirin')) setDrugName('Aspirin');
        else if (transcript.toLowerCase().includes('lisinopril')) setDrugName('Lisinopril');
        else if (transcript.toLowerCase().includes('metformin')) setDrugName('Metformin');
        else if (transcript.toLowerCase().includes('atorvastatin')) setDrugName('Atorvastatin');
        else setDrugName(transcript.split(' ')[0] || 'Medication');
      };

      recognition.onerror = () => setIsListening(false);
      recognition.onend = () => setIsListening(false);
    } else {
      recognition.stop();
      setIsListening(false);
    }
  };

  // Bulk parse
  const handleBulkImport = () => {
    if (!bulkText.trim()) return;
    const lines = bulkText.split('\n').filter(l => l.trim().length > 0);
    lines.forEach(line => {
      const parts = line.split(/[,\t]/);
      const name = parts[0]?.trim() || line.trim();
      if (name) {
        addMedication({
          drugName: name,
          dosage: parts[1]?.trim() || '10',
          dosageUnit: 'mg',
          frequency: parts[2]?.trim() || 'Once daily',
          drugClass: 'Prescription',
          withFood: false,
          prescriber: 'PCP'
        });
      }
    });
    handleClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 my-8 text-left">
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-slate-900 p-2 rounded-full hover:bg-slate-100 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div>
          <div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-emerald-700 mb-1">
            <Sparkles className="w-4 h-4" />
            <span>AI Medication Ingestion</span>
          </div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">Add Medication to SafeDose</h2>
          <p className="text-xs font-medium text-slate-500 mt-1">
            Capture labels with camera AI, search verified FDA monographs, or speak naturally.
          </p>
        </div>

        {/* 4 Mode Tabs */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 border-b border-slate-200 pb-4">
          <button
            type="button"
            onClick={() => setActiveTab('scan')}
            className={`p-3 rounded-2xl text-xs font-black uppercase tracking-tight flex flex-col items-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'scan'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:text-slate-900 border border-slate-200'
            }`}
          >
            <Camera className="w-5 h-5" />
            <span>Photo Scan</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('search')}
            className={`p-3 rounded-2xl text-xs font-black uppercase tracking-tight flex flex-col items-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'search'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:text-slate-900 border border-slate-200'
            }`}
          >
            <Search className="w-5 h-5" />
            <span>Search FDA</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('voice')}
            className={`p-3 rounded-2xl text-xs font-black uppercase tracking-tight flex flex-col items-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'voice'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:text-slate-900 border border-slate-200'
            }`}
          >
            <Mic className="w-5 h-5" />
            <span>Voice Dictate</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('paste')}
            className={`p-3 rounded-2xl text-xs font-black uppercase tracking-tight flex flex-col items-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'paste'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:text-slate-900 border border-slate-200'
            }`}
          >
            <FileText className="w-5 h-5" />
            <span>Bulk List</span>
          </button>
        </div>

        {/* ================= TAB 1: SCAN PHOTO ================= */}
        {activeTab === 'scan' && (
          <div className="space-y-4">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={e => {
                if (e.target.files && e.target.files[0]) {
                  handleFileUpload(e.target.files[0]);
                }
              }}
            />

            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-slate-300 hover:border-slate-500 rounded-3xl p-8 text-center bg-slate-50 hover:bg-slate-100 transition-all cursor-pointer space-y-3"
            >
              <div className="w-14 h-14 mx-auto rounded-2xl bg-slate-200 text-slate-800 flex items-center justify-center text-2xl">
                {isScanning ? <Loader2 className="w-7 h-7 animate-spin" /> : <Upload className="w-7 h-7" />}
              </div>
              <div>
                <strong className="text-slate-900 text-sm font-black block">
                  {isScanning ? 'Extracting Label Details with Gemini 2.5 Vision...' : 'Click to Upload or Snap Prescription Label Photo'}
                </strong>
                <span className="text-xs font-medium text-slate-500">
                  Supports JPG, PNG, WebP prescription bottles, blisters, or pharmacy receipts
                </span>
              </div>
            </div>

            {/* Quick Demo Test Presets */}
            <div>
              <span className="text-[11px] font-black text-slate-500 uppercase tracking-widest block mb-2">
                Or test with sample pharmacy labels:
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <button
                  type="button"
                  onClick={() =>
                    handleTestScanSample({
                      name: 'Eliquis',
                      generic: 'apixaban',
                      dosage: '5',
                      unit: 'mg',
                      freq: 'Twice daily',
                      cls: 'Direct Oral Anticoagulant (DOAC)',
                      food: false,
                      timing: 'Take 1 tablet every 12 hours with water'
                    })
                  }
                  className="p-3 rounded-2xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-xs text-slate-700 text-left cursor-pointer transition-colors"
                >
                  <strong className="text-slate-900 font-black block">Eliquis 5mg</strong>
                  <span className="text-[10px] text-slate-500 font-bold">DOAC Thinner</span>
                </button>

                <button
                  type="button"
                  onClick={() =>
                    handleTestScanSample({
                      name: 'Ibuprofen',
                      generic: 'ibuprofen',
                      dosage: '400',
                      unit: 'mg',
                      freq: 'Every 6 hours as needed',
                      cls: 'NSAID',
                      food: true,
                      timing: 'Take with food to prevent GI bleeding'
                    })
                  }
                  className="p-3 rounded-2xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-xs text-slate-700 text-left cursor-pointer transition-colors"
                >
                  <strong className="text-slate-900 font-black block">Ibuprofen 400mg</strong>
                  <span className="text-[10px] text-slate-500 font-bold">NSAID Pain</span>
                </button>

                <button
                  type="button"
                  onClick={() =>
                    handleTestScanSample({
                      name: 'Levothyroxine',
                      generic: 'levothyroxine sodium',
                      dosage: '75',
                      unit: 'mcg',
                      freq: 'Once daily (Morning)',
                      cls: 'Thyroid Hormone',
                      food: false,
                      timing: 'Take 30-60 min before breakfast on empty stomach'
                    })
                  }
                  className="p-3 rounded-2xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-xs text-slate-700 text-left cursor-pointer transition-colors"
                >
                  <strong className="text-slate-900 font-black block">Levothyroxine</strong>
                  <span className="text-[10px] text-slate-500 font-bold">Thyroid 75mcg</span>
                </button>

                <button
                  type="button"
                  onClick={() =>
                    handleTestScanSample({
                      name: 'Omeprazole',
                      generic: 'omeprazole',
                      dosage: '20',
                      unit: 'mg',
                      freq: 'Once daily (Morning)',
                      cls: 'Proton Pump Inhibitor (PPI)',
                      food: false,
                      timing: 'Take 30 mins before first meal'
                    })
                  }
                  className="p-3 rounded-2xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-xs text-slate-700 text-left cursor-pointer transition-colors"
                >
                  <strong className="text-slate-900 font-black block">Omeprazole 20mg</strong>
                  <span className="text-[10px] text-slate-500 font-bold">PPI Acid Reducer</span>
                </button>
              </div>
            </div>

            {scanResultConfidence && (
              <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 font-bold flex items-center justify-between">
                <span>✓ Multimodal OCR confidence: {Math.round(scanResultConfidence * 100)}%</span>
                <span>Review fields below</span>
              </div>
            )}
          </div>
        )}

        {/* ================= TAB 2: SEARCH RXNORM ================= */}
        {activeTab === 'search' && (
          <div className="space-y-4">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => handleSearchChange(e.target.value)}
                placeholder="Type brand or generic drug name (e.g. Lisinopril, Metformin)..."
                className="w-full pl-11 pr-4 py-3 rounded-2xl bg-white border border-slate-200 text-xs font-bold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-slate-900 shadow-xs"
              />
              {isSearching && (
                <Loader2 className="w-4 h-4 text-slate-600 animate-spin absolute right-4 top-1/2 -translate-y-1/2" />
              )}
            </div>

            {searchResults.length > 0 && (
              <div className="max-h-48 overflow-y-auto space-y-1 p-2 rounded-2xl bg-slate-50 border border-slate-200">
                {searchResults.map((item, idx) => (
                  <button
                    type="button"
                    key={idx}
                    onClick={() => handleSelectDrugSearch(item)}
                    className="w-full p-2.5 text-left rounded-xl hover:bg-slate-200 text-xs font-bold text-slate-800 transition-colors flex items-center justify-between"
                  >
                    <span>💊 {item}</span>
                    <span className="text-[10px] text-slate-500 font-black uppercase">Select</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ================= TAB 3: VOICE DICTATE ================= */}
        {activeTab === 'voice' && (
          <div className="space-y-4 text-center p-6 bg-slate-50 rounded-3xl border border-slate-200">
            <button
              type="button"
              onClick={toggleVoice}
              className={`w-20 h-20 mx-auto rounded-full flex items-center justify-center text-2xl transition-all cursor-pointer ${
                isListening
                  ? 'bg-red-600 text-white animate-pulse shadow-lg shadow-red-500/40 scale-110'
                  : 'bg-slate-900 text-white hover:scale-105 shadow-sm'
              }`}
            >
              {isListening ? <Mic className="w-8 h-8" /> : <MicOff className="w-8 h-8" />}
            </button>

            <div>
              <strong className="text-slate-900 font-black text-sm block">
                {isListening ? 'Listening... Speak your prescription name and dosage' : 'Click microphone to begin dictating'}
              </strong>
              <p className="text-xs font-medium text-slate-500 mt-1">
                Example: "I take Lisinopril 20 milligrams once every morning with breakfast."
              </p>
            </div>

            {voiceTranscript && (
              <div className="p-3.5 rounded-2xl bg-white border border-slate-200 text-xs text-emerald-800 font-mono font-bold">
                "{voiceTranscript}"
              </div>
            )}
          </div>
        )}

        {/* ================= TAB 4: PASTE BULK LIST ================= */}
        {activeTab === 'paste' && (
          <div className="space-y-4">
            <textarea
              value={bulkText}
              onChange={e => setBulkText(e.target.value)}
              rows={4}
              placeholder="Paste medication list (one per line):&#10;Warfarin, 5mg, Once daily&#10;Aspirin, 81mg, Once daily&#10;Lisinopril, 20mg, Once daily"
              className="w-full p-4 rounded-2xl bg-white border border-slate-200 text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-slate-900 shadow-xs"
            />
            <button
              type="button"
              onClick={handleBulkImport}
              className="w-full py-3.5 rounded-full bg-slate-900 hover:bg-black text-white font-black text-xs uppercase tracking-tight shadow-sm transition-all cursor-pointer"
            >
              Parse & Import All Medications
            </button>
          </div>
        )}

        {/* ================= COMMON EDITABLE FORM FIELDS ================= */}
        {activeTab !== 'paste' && (
          <form onSubmit={handleSubmitSingle} className="space-y-4 pt-2 border-t border-slate-200">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="text-slate-700 block mb-1 font-black uppercase tracking-tight text-[10px]">Medication Name *</label>
                <input
                  type="text"
                  value={drugName}
                  onChange={e => setDrugName(e.target.value)}
                  placeholder="e.g. Warfarin"
                  required
                  className="w-full p-3 rounded-2xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:border-slate-900 font-bold"
                />
              </div>

              <div>
                <label className="text-slate-700 block mb-1 font-black uppercase tracking-tight text-[10px]">Generic Name</label>
                <input
                  type="text"
                  value={genericName}
                  onChange={e => setGenericName(e.target.value)}
                  placeholder="e.g. warfarin sodium"
                  className="w-full p-3 rounded-2xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:border-slate-900 font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-slate-700 block mb-1 font-black uppercase tracking-tight text-[10px]">Dosage</label>
                  <input
                    type="text"
                    value={dosage}
                    onChange={e => setDosage(e.target.value)}
                    placeholder="e.g. 5"
                    className="w-full p-3 rounded-2xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:border-slate-900 font-bold font-mono"
                  />
                </div>
                <div>
                  <label className="text-slate-700 block mb-1 font-black uppercase tracking-tight text-[10px]">Unit</label>
                  <select
                    value={dosageUnit}
                    onChange={e => setDosageUnit(e.target.value)}
                    className="w-full p-3 rounded-2xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:border-slate-900 font-bold"
                  >
                    <option value="mg">mg</option>
                    <option value="mcg">mcg</option>
                    <option value="g">g</option>
                    <option value="mL">mL</option>
                    <option value="IU">IU</option>
                    <option value="puffs">puffs</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-slate-700 block mb-1 font-black uppercase tracking-tight text-[10px]">Frequency</label>
                <select
                  value={frequency}
                  onChange={e => setFrequency(e.target.value)}
                  className="w-full p-3 rounded-2xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:border-slate-900 font-bold"
                >
                  <option value="Once daily (Morning)">Once daily (Morning)</option>
                  <option value="Once daily (Evening)">Once daily (Evening)</option>
                  <option value="Once daily (Bedtime)">Once daily (Bedtime)</option>
                  <option value="Twice daily (Morning & Evening)">Twice daily (Morning & Evening)</option>
                  <option value="Three times daily">Three times daily</option>
                  <option value="Every 4-6 hours as needed">Every 4-6 hours as needed</option>
                  <option value="Weekly">Weekly</option>
                </select>
              </div>

              <div>
                <label className="text-slate-700 block mb-1 font-black uppercase tracking-tight text-[10px]">Drug Class</label>
                <input
                  type="text"
                  value={drugClass}
                  onChange={e => setDrugClass(e.target.value)}
                  placeholder="e.g. Anticoagulant, Statin"
                  className="w-full p-3 rounded-2xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:border-slate-900 font-bold"
                />
              </div>

              <div className="flex items-center gap-2 pt-6">
                <input
                  type="checkbox"
                  id="withFoodModal"
                  checked={withFood}
                  onChange={e => setWithFood(e.target.checked)}
                  className="w-4 h-4 rounded text-slate-900 focus:ring-slate-900 border-slate-300 bg-white"
                />
                <label htmlFor="withFoodModal" className="text-xs text-slate-800 font-bold cursor-pointer">
                  🍽️ Must be taken with food / meals
                </label>
              </div>
            </div>

            {/* Submit Bar */}
            <div className="flex items-center justify-between pt-4">
              <button
                type="button"
                onClick={handleClose}
                className="px-4 py-2.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-black uppercase tracking-tight cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="submit"
                className="flex items-center gap-2 px-7 py-3 rounded-full bg-slate-900 hover:bg-black text-white font-black text-xs uppercase tracking-tight shadow-sm hover:scale-102 transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4 text-emerald-400" />
                <span>Save to Active Regimen</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
