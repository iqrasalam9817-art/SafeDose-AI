import React, { useState, useRef, useEffect } from 'react';
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
  RefreshCw,
  Plus,
  Image as ImageIcon,
  Check,
  SwitchCamera
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
        <div className="grid grid-cols-3 gap-2 border-b border-slate-200 pb-4">
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

        {/* ================= TAB 1: SCAN PHOTO & LIVE CAMERA ================= */}
        {activeTab === 'scan' && (
          <div className="space-y-4">
            {/* Hidden native file input accepting JPG, JPEG, PNG, WEBP */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/jpg,image/png,image/webp,.jpg,.jpeg,.png,.webp"
              className="hidden"
              onChange={e => {
                if (e.target.files && e.target.files[0]) {
                  handleFileUpload(e.target.files[0]);
                  e.target.value = '';
                }
              }}
            />

            {/* LIVE CAMERA VIEWPORT */}
            {isCameraActive ? (
              <div className="relative rounded-3xl overflow-hidden bg-black border-2 border-emerald-500 shadow-xl aspect-video sm:aspect-4/3 flex flex-col justify-between p-4">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="absolute inset-0 w-full h-full object-cover"
                />

                {/* Target Frame Overlay */}
                <div className="absolute inset-8 sm:inset-12 border-2 border-white/60 rounded-2xl pointer-events-none flex items-center justify-center">
                  <div className="bg-black/50 backdrop-blur-xs text-white text-[11px] font-bold px-3 py-1 rounded-full border border-white/20">
                    Align bottle or prescription label here
                  </div>
                </div>

                {/* Top Control Bar */}
                <div className="relative z-10 flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-xs font-bold text-white bg-black/60 backdrop-blur-md px-3 py-1 rounded-full">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                    Live Camera Feed
                  </span>
                  <button
                    type="button"
                    onClick={toggleCamera}
                    className="flex items-center gap-1 text-xs font-bold text-white bg-black/60 hover:bg-black/80 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/20 transition-colors cursor-pointer"
                  >
                    <SwitchCamera className="w-3.5 h-3.5" />
                    <span>Flip</span>
                  </button>
                </div>

                {/* Bottom Capture Buttons */}
                <div className="relative z-10 flex items-center justify-center gap-4 pt-4">
                  <button
                    type="button"
                    onClick={stopCamera}
                    className="px-4 py-2.5 rounded-full bg-black/70 hover:bg-black text-white text-xs font-bold border border-white/20 transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={captureCameraFrame}
                    className="flex items-center gap-2 px-6 py-3 rounded-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-black uppercase tracking-wider shadow-lg shadow-emerald-500/40 hover:scale-105 transition-all cursor-pointer"
                  >
                    <Camera className="w-4 h-4" />
                    <span>Capture Label</span>
                  </button>
                </div>
              </div>
            ) : isCameraStarting ? (
              <div className="rounded-3xl bg-slate-900 text-white p-12 text-center space-y-3 flex flex-col items-center justify-center">
                <Loader2 className="w-8 h-8 text-emerald-400 animate-spin" />
                <strong className="text-sm font-bold block">Initializing Camera Stream...</strong>
                <span className="text-xs text-slate-400">Requesting browser camera permission</span>
              </div>
            ) : (
              /* DUAL ACTION TILES: Camera or Upload */
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* 1. Live Camera Button */}
                <button
                  type="button"
                  onClick={() => startCamera('environment')}
                  className="group relative p-6 rounded-3xl bg-slate-900 hover:bg-black text-white text-left transition-all border border-slate-800 shadow-md flex flex-col justify-between space-y-4 cursor-pointer hover:scale-101"
                >
                  <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center">
                    <Camera className="w-6 h-6" />
                  </div>
                  <div>
                    <strong className="text-sm font-black text-white block">Open Live Camera</strong>
                    <p className="text-xs text-slate-400 mt-1">
                      Stream camera & snap bottle label directly in real-time
                    </p>
                  </div>
                  <div className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-400 group-hover:translate-x-1 transition-transform">
                    <span>Start Camera Viewport</span>
                    <span>→</span>
                  </div>
                </button>

                {/* 2. File Upload Dropzone */}
                <div
                  onClick={() => fileInputRef.current?.click()}
                  onDragOver={e => {
                    e.preventDefault();
                    setIsDragOver(true);
                  }}
                  onDragLeave={() => setIsDragOver(false)}
                  onDrop={e => {
                    e.preventDefault();
                    setIsDragOver(false);
                    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                      handleFileUpload(e.dataTransfer.files[0]);
                    }
                  }}
                  className={`p-6 rounded-3xl border-2 border-dashed text-left transition-all cursor-pointer flex flex-col justify-between space-y-4 ${
                    isDragOver
                      ? 'border-emerald-500 bg-emerald-50/50 scale-101'
                      : 'border-slate-300 hover:border-slate-600 bg-slate-50 hover:bg-slate-100/80'
                  }`}
                >
                  <div className="w-12 h-12 rounded-2xl bg-slate-200 text-slate-800 flex items-center justify-center">
                    <Upload className="w-6 h-6" />
                  </div>
                  <div>
                    <strong className="text-sm font-black text-slate-900 block">Upload Label Photo</strong>
                    <p className="text-xs text-slate-500 mt-1">
                      Drag & drop or browse JPG, JPEG, PNG, WebP files
                    </p>
                  </div>
                  <div className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-700">
                    <span>Select from Device</span>
                    <span>→</span>
                  </div>
                </div>
              </div>
            )}

            {/* CAMERA HARDWARE ERROR BANNER */}
            {cameraError && (
              <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs space-y-2">
                <div className="flex items-start gap-2 font-bold">
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <span>{cameraError}</span>
                </div>
                <div className="flex items-center gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => startCamera('environment')}
                    className="px-3 py-1.5 rounded-full bg-amber-600 hover:bg-amber-700 text-white font-bold text-[11px] cursor-pointer"
                  >
                    Retry Camera
                  </button>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-3 py-1.5 rounded-full bg-white hover:bg-amber-100 border border-amber-300 text-amber-800 font-bold text-[11px] cursor-pointer"
                  >
                    Upload Image File Instead
                  </button>
                </div>
              </div>
            )}

            {/* PROCESSING LOADING SPINNER */}
            {isScanning && (
              <div className="p-6 rounded-3xl bg-slate-900 text-white flex items-center gap-4 shadow-lg border border-slate-800 animate-pulse">
                <Loader2 className="w-8 h-8 text-emerald-400 animate-spin shrink-0" />
                <div>
                  <strong className="text-sm font-black text-white block">
                    Extracting Medication Details with Gemini Vision AI...
                  </strong>
                  <span className="text-xs text-slate-400">
                    Analyzing drug name, dosage, frequency, and food interaction rules
                  </span>
                </div>
              </div>
            )}

            {/* SCANNING ERROR BANNER */}
            {scanError && !isScanning && (
              <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-900 text-xs space-y-2">
                <div className="flex items-start gap-2.5">
                  <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                  <div>
                    <strong className="font-black text-red-950 block mb-0.5">Extraction Issue</strong>
                    <p className="text-red-800 leading-relaxed">{scanError}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-red-600 hover:bg-red-700 text-white font-bold text-[11px] cursor-pointer transition-colors"
                  >
                    <RefreshCw className="w-3 h-3" />
                    <span>Upload Different Image</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => startCamera('environment')}
                    className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white hover:bg-red-100 border border-red-300 text-red-800 font-bold text-[11px] cursor-pointer transition-colors"
                  >
                    <Camera className="w-3 h-3" />
                    <span>Snap with Camera</span>
                  </button>
                </div>
              </div>
            )}

            {/* EXTRACTION SUCCESS BANNER */}
            {scanResultConfidence && !isScanning && !scanError && (
              <div className="p-4 rounded-3xl bg-emerald-50 border border-emerald-200 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-emerald-900 font-black text-xs">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Medication Details Extracted Successfully</span>
                  </div>
                  <span className="text-[11px] font-black text-emerald-800 bg-emerald-100/80 px-2.5 py-1 rounded-full border border-emerald-300">
                    {scanResultConfidence}% AI Confidence
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  {scanPreviewUrl && (
                    <img
                      src={scanPreviewUrl}
                      alt="Scanned Label Preview"
                      referrerPolicy="no-referrer"
                      className="w-14 h-14 object-cover rounded-xl border border-emerald-300 bg-white shrink-0"
                    />
                  )}
                  <div className="text-xs">
                    <strong className="text-slate-900 font-black text-sm block">
                      {drugName} {dosage ? `${dosage}${dosageUnit}` : ''}
                    </strong>
                    <span className="text-slate-600 text-[11px]">
                      {extractedSummary || 'Auto-filled in the form below. Review before saving.'}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1 text-[11px] text-emerald-800 font-bold">
                  <span>↓ Review and verify extracted details below</span>
                  <button
                    type="button"
                    onClick={() => {
                      setScanPreviewUrl(null);
                      setScanResultConfidence(null);
                      setExtractedSummary(null);
                    }}
                    className="hover:underline text-slate-500 cursor-pointer"
                  >
                    Clear Photo
                  </button>
                </div>
              </div>
            )}

            {/* SAMPLE PHARMACY LABELS */}
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
                      freq: 'Twice daily (Morning & Evening)',
                      cls: 'DOAC Blood Thinner',
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
                      freq: 'Every 4-6 hours as needed',
                      cls: 'NSAID',
                      food: true,
                      timing: 'Take with food to protect stomach lining'
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
                      cls: 'Proton Pump Inhibitor',
                      food: false,
                      timing: 'Take 30 mins before morning meal'
                    })
                  }
                  className="p-3 rounded-2xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-xs text-slate-700 text-left cursor-pointer transition-colors"
                >
                  <strong className="text-slate-900 font-black block">Omeprazole 20mg</strong>
                  <span className="text-[10px] text-slate-500 font-bold">PPI Acid Reducer</span>
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

