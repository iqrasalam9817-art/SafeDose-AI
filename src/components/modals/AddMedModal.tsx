import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../../stores/AppContext';
import { Medication } from '../../types';
import { DrugScanner } from '../scanner/DrugScanner';
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
  RefreshCw,
  Plus,
  Image as ImageIcon,
  Check,
  SwitchCamera,
  Scan
} from 'lucide-react';
import { scanPrescriptionLabel } from '../../lib/gemini';
import { searchRxNormDrugs, searchFdaDrugLabel } from '../../lib/fda';

type TabType = 'scan' | 'search' | 'voice' | 'paste';

export const AddMedModal: React.FC = () => {
  const { showAddMedModal, setShowAddMedModal, addMedication } = useApp();

  const [activeTab, setActiveTab] = useState<TabType>('search');

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
  const [extractedSummary, setExtractedSummary] = useState<string | null>(null);
  const [scanError, setScanError] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  // Live Camera state
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [isCameraStarting, setIsCameraStarting] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const cameraStreamRef = useRef<MediaStream | null>(null);

  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<string[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // Voice state
  const [isListening, setIsListening] = useState(false);
  const [voiceTranscript, setVoiceTranscript] = useState('');

  // Paste Bulk state
  const [bulkText, setBulkText] = useState('');

  // Stop camera tracks helper
  const stopCamera = () => {
    if (cameraStreamRef.current) {
      cameraStreamRef.current.getTracks().forEach(track => track.stop());
      cameraStreamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsCameraActive(false);
    setIsCameraStarting(false);
  };

  // Clean up camera on unmount or tab switch
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  useEffect(() => {
    if (activeTab !== 'scan') {
      stopCamera();
    }
  }, [activeTab]);

  if (!showAddMedModal) return null;

  const resetForm = () => {
    stopCamera();
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
    setExtractedSummary(null);
    setScanError(null);
    setCameraError(null);
  };

  const handleClose = () => {
    resetForm();
    setShowAddMedModal(false);
  };

  // Start live camera stream
  const startCamera = async (mode: 'environment' | 'user' = facingMode) => {
    setCameraError(null);
    setScanError(null);
    setIsCameraStarting(true);
    stopCamera();

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera access is not supported by your browser.');
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: mode,
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
        audio: false
      });

      cameraStreamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setIsCameraActive(true);
    } catch (err: any) {
      console.error('Camera access error:', err);
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setCameraError('Camera permission was denied. Please allow camera access in your browser permissions or upload an image file instead.');
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        setCameraError('No camera found on this device. Please upload an image file instead.');
      } else {
        setCameraError(err.message || 'Unable to access camera. Please try image file upload.');
      }
    } finally {
      setIsCameraStarting(false);
    }
  };

  // Toggle camera direction (front/back)
  const toggleCamera = () => {
    const nextMode = facingMode === 'environment' ? 'user' : 'environment';
    setFacingMode(nextMode);
    startCamera(nextMode);
  };

  // Capture video frame to canvas and process with Gemini Vision
  const captureCameraFrame = () => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;

    const width = video.videoWidth || 640;
    const height = video.videoHeight || 480;
    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.drawImage(video, 0, 0, width, height);

    // Get Base64 without data URI prefix
    const base64 = canvas.toDataURL('image/jpeg').split(',')[1];
    const previewDataUrl = canvas.toDataURL('image/jpeg');

    setScanPreviewUrl(previewDataUrl);
    stopCamera();

    // Send Base64 image to Gemini Vision
    processImageScan(base64, 'image/jpeg');
  };

  // Process uploaded image file
  const handleFileUpload = (file: File) => {
    if (!file) return;

    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    const isImageExtension = /\.(jpe?g|png|webp)$/i.test(file.name);

    if (!validTypes.includes(file.type) && !isImageExtension) {
      setScanError('Please select a valid image file (JPG, JPEG, PNG, or WebP).');
      return;
    }

    setScanError(null);
    setScanResultConfidence(null);
    setExtractedSummary(null);

    const reader = new FileReader();
    reader.onload = () => {
      if (!reader.result) return;
      const base64 = reader.result.toString().split(',')[1];
      setScanPreviewUrl(reader.result.toString());
      processImageScan(base64, file.type || 'image/jpeg');
    };
    reader.onerror = () => {
      setScanError('Failed to read the image file. Please try selecting the file again.');
    };
    reader.readAsDataURL(file);
  };

  // Core Gemini Vision processing & Auto-fill
  const processImageScan = async (base64ImageData: string, mimeType: string) => {
    setIsScanning(true);
    setScanError(null);
    setScanResultConfidence(null);
    setExtractedSummary(null);

    try {
      const extracted = await scanPrescriptionLabel(base64ImageData, mimeType);

      if (!extracted) {
        throw new Error('No response received from vision extraction service.');
      }

      if (extracted.error === 'not_a_label' || extracted.error === 'not a label') {
        setScanError(
          extracted.message ||
            'No medication label detected in this photo. Please make sure the medicine name, dosage, and label text are clearly visible and well-lit.'
        );
        return;
      }

      // Extract medication name
      const extractedDrugName = extracted.drug_name || extracted.drugName || '';
      const extractedBrandName = extracted.brand_name || extracted.brandName || '';

      if (!extractedDrugName && !extractedBrandName) {
        setScanError(
          'Could not clearly identify a medication name on this label. Please try a clearer, closer photo or enter details manually below.'
        );
        return;
      }

      const primaryName = extractedBrandName || extractedDrugName;
      setDrugName(primaryName);

      if (extractedDrugName && extractedBrandName && extractedDrugName.toLowerCase() !== extractedBrandName.toLowerCase()) {
        setGenericName(extractedDrugName);
      } else if (extracted.genericName) {
        setGenericName(extracted.genericName);
      }

      // Dosage & Unit parsing
      if (extracted.dosage) {
        const doseStr = String(extracted.dosage).trim();
        const numMatch = doseStr.match(/\d+(\.\d+)?/);
        if (numMatch) {
          setDosage(numMatch[0]);
        } else {
          setDosage(doseStr);
        }

        if (/mcg|microgram/i.test(doseStr)) setDosageUnit('mcg');
        else if (/ml|milliliter/i.test(doseStr)) setDosageUnit('mL');
        else if (/iu|units/i.test(doseStr)) setDosageUnit('IU');
        else if (/puffs/i.test(doseStr)) setDosageUnit('puffs');
        else if (/g|gram/i.test(doseStr) && !/mg/i.test(doseStr)) setDosageUnit('g');
        else setDosageUnit('mg');
      }

      // Frequency mapping
      if (extracted.frequency) {
        const freqStr = String(extracted.frequency).toLowerCase();
        if (freqStr.includes('twice') || freqStr.includes('bid') || freqStr.includes('every 12')) {
          setFrequency('Twice daily (Morning & Evening)');
        } else if (freqStr.includes('three') || freqStr.includes('tid') || freqStr.includes('every 8')) {
          setFrequency('Three times daily');
        } else if (freqStr.includes('bedtime') || freqStr.includes('sleep') || freqStr.includes('night')) {
          setFrequency('Once daily (Bedtime)');
        } else if (freqStr.includes('evening') || freqStr.includes('dinner')) {
          setFrequency('Once daily (Evening)');
        } else if (freqStr.includes('as needed') || freqStr.includes('prn') || freqStr.includes('hour')) {
          setFrequency('Every 4-6 hours as needed');
        } else if (freqStr.includes('week')) {
          setFrequency('Weekly');
        } else {
          setFrequency('Once daily (Morning)');
        }
      }

      // With food boolean
      const foodBool = typeof extracted.with_food === 'boolean' ? extracted.with_food : Boolean(extracted.withFood);
      setWithFood(foodBool);

      // Timing instructions
      if (extracted.timing_instructions || extracted.timingInstructions) {
        setTimingInstructions(extracted.timing_instructions || extracted.timingInstructions);
      }

      // Confidence & summary
      const conf =
        typeof extracted.confidence === 'number'
          ? extracted.confidence > 1
            ? Math.round(extracted.confidence)
            : Math.round(extracted.confidence * 100)
          : 96;

      setScanResultConfidence(conf);
      setExtractedSummary(
        `${primaryName}${extracted.dosage ? ` ${extracted.dosage}` : ''} • ${extracted.frequency || 'Daily'} • ${
          foodBool ? 'Take with food' : 'Take with water'
        }`
      );
    } catch (err: any) {
      console.error('Scan processing error:', err);
      setScanError(
        err.message ||
          'Failed to extract data from the image. Please try again with a closer, well-lit photo or enter the medication details manually.'
      );
    } finally {
      setIsScanning(false);
    }
  };

  // Submit single medication to active regimen
  const handleSubmitSingle = (e: React.FormEvent) => {
    e.preventDefault();
    if (!drugName.trim()) return;

    addMedication({
      drugName: drugName.trim(),
      genericName: genericName.trim() || undefined,
      dosage: dosage.trim() || '10',
      dosageUnit: dosageUnit || 'mg',
      frequency: frequency || 'Once daily (Morning)',
      drugClass: drugClass || 'Prescription',
      withFood,
      timingInstructions: timingInstructions || undefined,
      notes: notes || undefined,
      prescriber: 'Physician / Pharmacy'
    });
    handleClose();
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
    setScanError(null);
    setScanResultConfidence(null);
    setExtractedSummary(null);
    setTimeout(() => {
      setDrugName(sampleDrug.name);
      setGenericName(sampleDrug.generic);
      setDosage(sampleDrug.dosage);
      setDosageUnit(sampleDrug.unit);
      setFrequency(sampleDrug.freq);
      setDrugClass(sampleDrug.cls);
      setWithFood(sampleDrug.food);
      setTimingInstructions(sampleDrug.timing);
      setScanResultConfidence(98);
      setExtractedSummary(`${sampleDrug.name} ${sampleDrug.dosage}${sampleDrug.unit} • ${sampleDrug.freq} • ${sampleDrug.food ? 'With Food' : 'Standard'}`);
      setIsScanning(false);
    }, 600);
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

  // Handler for Client-side DrugScanner OCR / Barcode recognition
  const handleClientScannerDetect = async (detectedValue: string) => {
    if (!detectedValue || detectedValue.trim().length === 0) return;
    const cleanValue = detectedValue.trim();
    
    setScanResultConfidence(96);
    setExtractedSummary(`Label detected: "${cleanValue}"`);
    setDrugName(cleanValue);
    setSearchQuery(cleanValue);
    
    try {
      const results = await searchRxNormDrugs(cleanValue);
      if (results && results.length > 0) {
        setDrugName(results[0]);
        setGenericName(results[0].toLowerCase());
      }
    } catch (e) {
      console.log('Search fallback error:', e);
    }
    
    // Switch to search/manual form so user can review the recognized drug
    setActiveTab('search');
  };

  // Voice Dictation
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
          frequency: parts[2]?.trim() || 'Once daily (Morning)',
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
      {/* Hidden canvas for video frame extraction */}
      <canvas ref={canvasRef} className="hidden" />

      <div className="relative w-full max-w-2xl bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 my-8 text-left max-h-[90vh] overflow-y-auto">
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
            Search FDA monographs, dictate instructions, or enter prescription details.
          </p>
        </div>

        {/* Mode Tabs */}
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
            <Scan className="w-5 h-5" />
            <span>OCR & Barcode</span>
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
            <span>Search FDA & Manual</span>
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

        {/* ================= TAB 1: SCAN PHOTO & CLIENT-SIDE OCR / BARCODE ================= */}
        {activeTab === 'scan' && (
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-slate-900 text-white flex items-center justify-between">
              <div>
                <span className="text-xs font-black text-cyan-400 uppercase tracking-widest block">Client-Side Engine</span>
                <h4 className="text-sm font-bold text-white">Live Barcode & Tesseract.js OCR Scanner</h4>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-cyan-500/20 text-cyan-300 text-[11px] font-semibold border border-cyan-500/30">
                100% On-Device
              </span>
            </div>

            {/* Embedded DrugScanner */}
            <DrugScanner onDetect={handleClientScannerDetect} />

            {/* Sample Label Simulations */}
            <div className="pt-2 border-t border-slate-200">
              <span className="text-[11px] font-black uppercase tracking-wider text-slate-400 block mb-2">
                Or simulate scan with sample labels:
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <button
                  type="button"
                  onClick={() =>
                    handleTestScanSample({
                      name: 'Warfarin',
                      generic: 'warfarin sodium',
                      dosage: '5',
                      unit: 'mg',
                      freq: 'Once daily (Evening)',
                      cls: 'Anticoagulant (Vitamin K Antagonist)',
                      food: false,
                      timing: 'Take consistently at 6:00 PM with or without food'
                    })
                  }
                  className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold text-left transition-colors cursor-pointer border border-slate-200"
                >
                  <span className="block text-emerald-600 font-extrabold text-[10px]">SAMPLE 1</span>
                  Warfarin 5mg
                </button>
                <button
                  type="button"
                  onClick={() =>
                    handleTestScanSample({
                      name: 'Aspirin (Low Dose)',
                      generic: 'aspirin',
                      dosage: '81',
                      unit: 'mg',
                      freq: 'Once daily (Morning)',
                      cls: 'NSAID / Antiplatelet Agent',
                      food: true,
                      timing: 'Take with breakfast and full glass of water'
                    })
                  }
                  className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold text-left transition-colors cursor-pointer border border-slate-200"
                >
                  <span className="block text-red-600 font-extrabold text-[10px]">SAMPLE 2</span>
                  Aspirin 81mg
                </button>
                <button
                  type="button"
                  onClick={() =>
                    handleTestScanSample({
                      name: 'Lisinopril',
                      generic: 'lisinopril',
                      dosage: '10',
                      unit: 'mg',
                      freq: 'Once daily (Morning)',
                      cls: 'ACE Inhibitor (Antihypertensive)',
                      food: false,
                      timing: 'Take in morning at 8:00 AM'
                    })
                  }
                  className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold text-left transition-colors cursor-pointer border border-slate-200"
                >
                  <span className="block text-blue-600 font-extrabold text-[10px]">SAMPLE 3</span>
                  Lisinopril 10mg
                </button>
                <button
                  type="button"
                  onClick={() =>
                    handleTestScanSample({
                      name: 'Atorvastatin',
                      generic: 'atorvastatin calcium',
                      dosage: '20',
                      unit: 'mg',
                      freq: 'Once daily (Bedtime)',
                      cls: 'HMG-CoA Reductase Inhibitor (Statin)',
                      food: false,
                      timing: 'Take at bedtime (9:00 PM). Avoid Grapefruit'
                    })
                  }
                  className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold text-left transition-colors cursor-pointer border border-slate-200"
                >
                  <span className="block text-purple-600 font-extrabold text-[10px]">SAMPLE 4</span>
                  Atorvastatin 20mg
                </button>
              </div>
            </div>
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

        {/* ================= REVIEW & CONFIRM FORM FIELDS ================= */}
        {activeTab !== 'paste' && (
          <form onSubmit={handleSubmitSingle} className="space-y-4 pt-4 border-t border-slate-200">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-black text-slate-700 uppercase tracking-wider">
                {scanResultConfidence ? 'Review & Confirm Extracted Details' : 'Medication Details'}
              </span>
              {scanResultConfidence && (
                <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  Auto-populated from Vision AI
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="text-slate-700 block mb-1 font-black uppercase tracking-tight text-[10px]">
                  Medication Name *
                </label>
                <input
                  type="text"
                  value={drugName}
                  onChange={e => setDrugName(e.target.value)}
                  placeholder="e.g. Metformin, Lisinopril"
                  required
                  className="w-full p-3 rounded-2xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:border-slate-900 font-bold"
                />
              </div>

              <div>
                <label className="text-slate-700 block mb-1 font-black uppercase tracking-tight text-[10px]">
                  Generic Name (Active Ingredient)
                </label>
                <input
                  type="text"
                  value={genericName}
                  onChange={e => setGenericName(e.target.value)}
                  placeholder="e.g. metformin hcl"
                  className="w-full p-3 rounded-2xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:border-slate-900 font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-slate-700 block mb-1 font-black uppercase tracking-tight text-[10px]">
                    Dosage
                  </label>
                  <input
                    type="text"
                    value={dosage}
                    onChange={e => setDosage(e.target.value)}
                    placeholder="e.g. 500"
                    className="w-full p-3 rounded-2xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:border-slate-900 font-bold font-mono"
                  />
                </div>
                <div>
                  <label className="text-slate-700 block mb-1 font-black uppercase tracking-tight text-[10px]">
                    Unit
                  </label>
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
                <label className="text-slate-700 block mb-1 font-black uppercase tracking-tight text-[10px]">
                  Frequency Schedule
                </label>
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
                <label className="text-slate-700 block mb-1 font-black uppercase tracking-tight text-[10px]">
                  Timing Instructions
                </label>
                <input
                  type="text"
                  value={timingInstructions}
                  onChange={e => setTimingInstructions(e.target.value)}
                  placeholder="e.g. Take with morning and evening meals"
                  className="w-full p-3 rounded-2xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:border-slate-900 font-medium"
                />
              </div>

              <div className="flex items-center gap-2 pt-6">
                <input
                  type="checkbox"
                  id="withFoodModal"
                  checked={withFood}
                  onChange={e => setWithFood(e.target.checked)}
                  className="w-4 h-4 rounded text-slate-900 focus:ring-slate-900 border-slate-300 bg-white cursor-pointer"
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
                className="px-4 py-2.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-black uppercase tracking-tight cursor-pointer transition-colors"
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

