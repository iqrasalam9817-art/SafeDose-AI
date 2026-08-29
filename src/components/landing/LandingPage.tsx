import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { useApp } from '../../stores/AppContext';
import SafeDoseHero from './SafeDoseHero';
import {
  Camera,
  Plus,
  PlayCircle,
  ShieldCheck,
  Lock,
  Zap,
  CheckCircle2,
  AlertOctagon,
  AlertTriangle,
  Clock,
  HeartHandshake,
  QrCode,
  Salad,
  MessageSquareHeart,
  ChevronRight,
  Sparkles,
  ArrowRight,
  TrendingUp,
  Activity,
  FileText,
  Users,
  Shield,
  Layers,
  HeartPulse
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  const { setView, setShowAddMedModal, startOnboarding, medications, safetyScore } = useApp();

  return (
    <div className="min-h-screen bg-[#0A0F1E] text-slate-100 selection:bg-blue-500/30 overflow-x-hidden">
      {/* Top Fullscreen Video Hero with 3D Preview Card */}
      <SafeDoseHero />

      {/* Background Gradients & Ambient Lighting */}
      <div className="relative z-10">

        {/* ===================== STATS / PROBLEM STATEMENT ===================== */}
        <section className="py-20 px-4 sm:px-6 lg:px-8 border-y border-white/5 bg-slate-900/30">
          <div className="max-w-7xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="max-w-3xl mx-auto mb-14"
            >
              <span className="text-xs font-bold uppercase tracking-widest text-red-400 mb-2 block">
                The Silent Crisis in Medicine Cabinets
              </span>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white tracking-tight">
                Every day, millions take medication combinations that work against each other.
              </h2>
            </motion.div>

            {/* 3 Stat Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto mb-10">
              <motion.div
                whileHover={{ y: -6 }}
                className="glass-card p-8 text-center relative overflow-hidden group border-red-500/20 hover:border-red-500/50"
              >
                <div className="w-14 h-14 mx-auto rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition-transform">
                  🏥
                </div>
                <div className="text-4xl sm:text-5xl font-black text-white mb-2">125,000+</div>
                <div className="text-sm font-semibold text-red-400 uppercase tracking-wider mb-2">
                  Hospitalizations Annually
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Americans admitted into emergency rooms directly due to adverse drug-drug interactions.
                </p>
              </motion.div>

              <motion.div
                whileHover={{ y: -6 }}
                className="glass-card p-8 text-center relative overflow-hidden group border-amber-500/20 hover:border-amber-500/50"
              >
                <div className="w-14 h-14 mx-auto rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition-transform">
                  💊
                </div>
                <div className="text-4xl sm:text-5xl font-black text-white mb-2">5 – 15</div>
                <div className="text-sm font-semibold text-amber-400 uppercase tracking-wider mb-2">
                  Daily Prescriptions
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  The national average for adults over 65 managing chronic conditions and multiple specialists.
                </p>
              </motion.div>

              <motion.div
                whileHover={{ y: -6 }}
                className="glass-card p-8 text-center relative overflow-hidden group border-blue-500/20 hover:border-blue-500/50"
              >
                <div className="w-14 h-14 mx-auto rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition-transform">
                  ⏰
                </div>
                <div className="text-4xl sm:text-5xl font-black text-white mb-2">1x</div>
                <div className="text-sm font-semibold text-blue-400 uppercase tracking-wider mb-2">
                  Checked at Pharmacy
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Pharmacies only check medications filled at their specific branch—not changing OTCs, supplements, or other clinics.
                </p>
              </motion.div>
            </div>

            {/* Continuous callout bar */}
            <div className="max-w-3xl mx-auto p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-red-500/10 via-amber-500/10 to-blue-500/10 border border-red-500/30 text-xs sm:text-sm font-medium text-slate-200">
              ⚡ <strong className="text-white">Pharmacists check once.</strong> SafeDose continuously cross-references your medications, supplements, timing, and diet every single day.
            </div>
          </div>
        </section>

        {/* ===================== SECTION 3: HOW IT WORKS (4 STEPS) ===================== */}
        <section id="how-it-works" className="py-24 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="text-center max-w-3xl mx-auto mb-20">
              <span className="text-xs font-bold uppercase tracking-widest text-emerald-400 mb-2 block">
                Seamless Workflow
              </span>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white tracking-tight">
                From Photo to Protection in Seconds
              </h2>
            </div>

            <div className="space-y-20">
              {/* Step 1 */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                <div className="order-2 lg:order-1 space-y-4">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-r from-emerald-500 to-blue-600 flex items-center justify-center font-bold text-white text-sm">
                    01
                  </div>
                  <h3 className="text-2xl sm:text-3xl font-bold text-white">
                    📷 Photograph Any Medication Label
                  </h3>
                  <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
                    Point your camera at any prescription bottle, blister pack, or supplement label. Our Multimodal Vision AI instantly extracts the exact drug name, dosage, frequency, and instructions—even from curved, faded, or reflective pharmacy labels.
                  </p>
                  <div className="flex items-center gap-2 text-xs text-emerald-400 font-semibold pt-2">
                    <CheckCircle2 className="w-4 h-4" /> 98.4% OCR recognition accuracy on standard prescription bottles
                  </div>
                </div>

                {/* Animated Camera Frame Visual */}
                <div className="order-1 lg:order-2">
                  <div className="relative rounded-2xl bg-slate-900 border border-blue-500/30 p-6 overflow-hidden shadow-2xl">
                    <div className="relative h-56 bg-slate-950 rounded-xl border border-dashed border-blue-400/40 flex flex-col items-center justify-center p-4">
                      {/* Scanning line */}
                      <div className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-emerald-400 to-transparent animate-scan" />
                      {/* Corner brackets */}
                      <div className="absolute top-2 left-2 w-5 h-5 border-t-2 border-l-2 border-blue-400" />
                      <div className="absolute top-2 right-2 w-5 h-5 border-t-2 border-r-2 border-blue-400" />
                      <div className="absolute bottom-2 left-2 w-5 h-5 border-b-2 border-l-2 border-blue-400" />
                      <div className="absolute bottom-2 right-2 w-5 h-5 border-b-2 border-r-2 border-blue-400" />

                      <div className="text-center space-y-2">
                        <div className="text-3xl">💊</div>
                        <span className="text-xs font-mono text-slate-300">WARFARIN SODIUM 5MG</span>
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-500/30">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Extracted: 5mg Once Daily
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Step 2 */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                <div className="order-2 lg:order-2 space-y-4">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-center font-bold text-white text-sm">
                    02
                  </div>
                  <h3 className="text-2xl sm:text-3xl font-bold text-white">
                    🧠 AI Cross-References All Combinations
                  </h3>
                  <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
                    Our safety engine simultaneously runs combinatorial checks across all pairwise interactions against the openFDA national repository, National Library of Medicine RxNorm, and pharmacological metabolism pathways (CYP450 enzymes).
                  </p>
                  <div className="flex items-center gap-2 text-xs text-blue-400 font-semibold pt-2">
                    <CheckCircle2 className="w-4 h-4" /> Checks food, grapefruit, alcohol, and supplement conflicts
                  </div>
                </div>

                {/* Animated Network Node Visual */}
                <div className="order-1 lg:order-1">
                  <div className="relative rounded-2xl bg-slate-900 border border-indigo-500/30 p-6 overflow-hidden shadow-2xl">
                    <div className="h-56 bg-slate-950 rounded-xl p-4 flex flex-col justify-between">
                      <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
                        <span>Combinatorial Mesh Check</span>
                        <span className="text-emerald-400 font-bold">15 Pairs Verified in 0.8s</span>
                      </div>
                      {/* Visual nodes */}
                      <div className="grid grid-cols-3 gap-3 my-auto">
                        <div className="bg-red-500/20 border border-red-500/40 rounded-xl p-2.5 text-center text-xs">
                          <span className="font-bold text-red-300 block">Warfarin</span>
                          <span className="text-[10px] text-slate-400">Anticoagulant</span>
                        </div>
                        <div className="flex items-center justify-center text-red-400 font-bold text-lg animate-pulse">
                          ⚡ Conflict
                        </div>
                        <div className="bg-red-500/20 border border-red-500/40 rounded-xl p-2.5 text-center text-xs">
                          <span className="font-bold text-red-300 block">Aspirin</span>
                          <span className="text-[10px] text-slate-400">Antiplatelet</span>
                        </div>
                      </div>
                      <div className="text-center text-[11px] text-slate-500 font-mono">
                        FDA Monograph NDC #54868-0841-0 matched
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Step 3 */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                <div className="order-2 lg:order-1 space-y-4">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 flex items-center justify-center font-bold text-white text-sm">
                    03
                  </div>
                  <h3 className="text-2xl sm:text-3xl font-bold text-white">
                    ⚠️ Receive Plain-English Clinical Explanations
                  </h3>
                  <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
                    No confusing medical jargon or Latin abbreviations. SafeDose translates complex pharmacology into clear explanations: exactly <strong className="text-slate-200">WHAT</strong> the risk is, <strong className="text-slate-200">WHY</strong> it matters to your body, and <strong className="text-slate-200">WHAT TO DO</strong> next.
                  </p>
                  <div className="flex items-center gap-2 text-xs text-purple-400 font-semibold pt-2">
                    <CheckCircle2 className="w-4 h-4" /> Ready-to-share summaries for your doctor visits
                  </div>
                </div>

                {/* Report Card Mockup Visual */}
                <div className="order-1 lg:order-2">
                  <div className="glass-card p-6 border-purple-500/30">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-xs pb-2 border-b border-white/10">
                        <span className="font-bold text-white">Safety Intelligence Report</span>
                        <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold">
                          Confidence: 99%
                        </span>
                      </div>
                      <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-xs">
                        <div className="font-bold text-red-300">WHAT: Dual Blood Thinner Warning</div>
                        <div className="text-slate-300 mt-1">Both medicines thin your blood in different ways. Taking them together significantly increases your risk of internal bleeding.</div>
                      </div>
                      <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs">
                        <div className="font-bold text-amber-300">WHAT TO DO: Timing Adjustment</div>
                        <div className="text-slate-300 mt-1">Separate Calcium supplements from your blood pressure medication by 2 hours.</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Step 4 */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                <div className="order-2 lg:order-2 space-y-4">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-pink-600 flex items-center justify-center font-bold text-white text-sm">
                    04
                  </div>
                  <h3 className="text-2xl sm:text-3xl font-bold text-white">
                    📬 Weekly Safety Digest for You & Caregivers
                  </h3>
                  <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
                    Keep your loved ones in the loop automatically. Every Monday morning, you and your designated caregivers receive an organized digest containing adherence scores, open alerts, and any new interactions detected during the week.
                  </p>
                  <div className="flex items-center gap-2 text-xs text-pink-400 font-semibold pt-2">
                    <CheckCircle2 className="w-4 h-4" /> Instant SMS & email notification for critical alerts
                  </div>
                </div>

                {/* Email Preview Card Visual */}
                <div className="order-1 lg:order-1">
                  <div className="glass-card p-6 border-pink-500/30">
                    <div className="bg-slate-950 rounded-xl p-4 border border-white/5 space-y-3">
                      <div className="flex items-center gap-2 pb-3 border-b border-white/10">
                        <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-sm">
                          🌿
                        </div>
                        <div>
                          <div className="text-xs font-bold text-white">SafeDose Weekly Digest</div>
                          <div className="text-[10px] text-slate-400">To: John Rodriguez (Caregiver)</div>
                        </div>
                      </div>
                      <div className="flex items-center justify-between text-xs bg-slate-900 p-2.5 rounded-lg">
                        <span className="text-slate-300">Weekly Adherence</span>
                        <span className="text-emerald-400 font-bold">89% Taken on Time</span>
                      </div>
                      <div className="text-[11px] text-slate-400">
                        "Maria took all morning and evening doses on time. 1 critical interaction under active doctor monitoring."
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ===================== SECTION 4: FEATURES BENTO GRID ===================== */}
        <section id="features" className="py-24 px-4 sm:px-6 lg:px-8 bg-slate-950/50 border-t border-white/5">
          <div className="max-w-7xl mx-auto">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <span className="text-xs font-bold uppercase tracking-widest text-blue-400 mb-2 block">
                Comprehensive Protection
              </span>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white tracking-tight">
                Everything You Need. Nothing You Don't.
              </h2>
              <p className="text-slate-400 text-sm sm:text-base mt-4">
                Built specifically for real people managing real medications and their caregivers.
              </p>
            </div>

            {/* Bento Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Bento Card 1 (Wide 2 cols) */}
              <div className="md:col-span-2 glass-card p-8 relative overflow-hidden group hover:border-blue-500/40 transition-all">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-xl text-blue-400">
                    <Camera className="w-6 h-6" />
                  </div>
                  <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-blue-500/10 text-blue-300 border border-blue-500/20">
                    Multimodal Vision OCR
                  </span>
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-white mb-2">
                  Photo Scan & AI Label Extraction
                </h3>
                <p className="text-sm text-slate-400 leading-relaxed mb-6">
                  Point and shoot any medicine container. Gemini 2.5 Vision identifies active ingredients, dosage strengths, timing instructions, and refill details directly from your bottle.
                </p>
                <div className="flex flex-wrap gap-2 text-xs">
                  <span className="px-3 py-1 rounded-lg bg-slate-900 border border-white/5 text-slate-300">
                    📷 Live Camera Stream
                  </span>
                  <span className="px-3 py-1 rounded-lg bg-slate-900 border border-white/5 text-slate-300">
                    📁 Image Upload
                  </span>
                  <span className="px-3 py-1 rounded-lg bg-slate-900 border border-white/5 text-slate-300">
                    🎙️ Voice Dictation
                  </span>
                </div>
              </div>

              {/* Bento Card 2 */}
              <div className="glass-card p-8 hover:border-emerald-500/40 transition-all">
                <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-xl text-emerald-400 mb-4">
                  <Activity className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Interaction Intelligence</h3>
                <p className="text-sm text-slate-400 leading-relaxed mb-4">
                  Checks over 24,000+ FDA monographs in real time with dynamic severity classification.
                </p>
                <span className="text-xs text-emerald-400 font-mono font-semibold">
                  RxNorm & openFDA Synced
                </span>
              </div>

              {/* Bento Card 3 */}
              <div className="glass-card p-8 hover:border-purple-500/40 transition-all">
                <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-xl text-purple-400 mb-4">
                  <Clock className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">AI Smart Schedule</h3>
                <p className="text-sm text-slate-400 leading-relaxed mb-4">
                  Optimizes daily dosage times, spaces chelation minerals, and maps with-food rules.
                </p>
                <span className="text-xs text-purple-400 font-mono font-semibold">
                  Chronopharmacology Powered
                </span>
              </div>

              {/* Bento Card 4 */}
              <div className="glass-card p-8 hover:border-amber-500/40 transition-all">
                <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-xl text-amber-400 mb-4">
                  <HeartHandshake className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Caregiver Sync</h3>
                <p className="text-sm text-slate-400 leading-relaxed mb-4">
                  Share peace of mind with sons, daughters, and healthcare proxies with automated weekly digests.
                </p>
                <span className="text-xs text-amber-400 font-mono font-semibold">
                  Dual-Access Portals
                </span>
              </div>

              {/* Bento Card 5 */}
              <div className="glass-card p-8 hover:border-red-500/40 transition-all">
                <div className="w-12 h-12 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-xl text-red-400 mb-4">
                  <QrCode className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Emergency Card & QR</h3>
                <p className="text-sm text-slate-400 leading-relaxed mb-4">
                  One-tap access for paramedics, EMTs, and ER physicians during acute medical emergencies.
                </p>
                <span className="text-xs text-red-400 font-mono font-semibold">
                  Printable & Wallet Ready
                </span>
              </div>

              {/* Bento Card 6 (Wide 2 cols) */}
              <div className="md:col-span-2 glass-card p-8 hover:border-blue-500/40 transition-all">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-xl text-blue-400">
                    <MessageSquareHeart className="w-6 h-6" />
                  </div>
                  <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                    Natural Language Medical QA
                  </span>
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-white mb-2">
                  24/7 AI Clinical Assistant & Symptom Correlator
                </h3>
                <p className="text-sm text-slate-400 leading-relaxed mb-4">
                  Ask questions anytime in natural language: "Can I take Tylenol with my blood thinner?", "What foods must I avoid with Atorvastatin?", or log sudden dizziness to discover possible drug correlations.
                </p>
                <div className="text-xs text-slate-400">
                  ⚠️ Formatted strictly with medical disclaimers and doctor consultation guidance.
                </div>
              </div>

              {/* Bento Card 7 */}
              <div className="glass-card p-8 hover:border-emerald-500/40 transition-all">
                <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-xl text-emerald-400 mb-4">
                  <Salad className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Food & Supplement Safety</h3>
                <p className="text-sm text-slate-400 leading-relaxed mb-4">
                  Detects grapefruit, high-potassium foods, spinach / Vitamin K, alcohol, and St. John's Wort risks.
                </p>
                <span className="text-xs text-emerald-400 font-mono font-semibold">
                  Nutritional Conflict Matrix
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* ===================== SECTION 5: INTERACTION SEVERITY EXPLAINER ===================== */}
        <section id="severity" className="py-24 px-4 sm:px-6 lg:px-8 border-t border-white/5">
          <div className="max-w-7xl mx-auto">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <span className="text-xs font-bold uppercase tracking-widest text-red-400 mb-2 block">
                Clear Severity Classifications
              </span>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white tracking-tight">
                We Don't Just Say "Interaction". We Tell You How Serious.
              </h2>
              <p className="text-slate-400 text-sm sm:text-base mt-4">
                Five standardized clinical tiers to help you know when to seek immediate medical advice vs simple timing tweaks.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              {/* DEADLY */}
              <div className="glass-card p-6 border-red-600/40 bg-red-950/20 rounded-2xl flex flex-col justify-between">
                <div>
                  <div className="text-2xl mb-3">☠️</div>
                  <span className="text-xs font-black uppercase tracking-wider text-red-400 block mb-1">
                    Deadly
                  </span>
                  <h4 className="text-sm font-bold text-white mb-2">Contraindicated</h4>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Must NEVER be taken together under any circumstance. High risk of life-threatening toxicity.
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-red-500/20 text-[11px] text-red-300 font-mono">
                  Ex: MAOIs + SSRIs
                </div>
              </div>

              {/* CRITICAL */}
              <div className="glass-card p-6 border-red-500/40 bg-red-900/20 rounded-2xl flex flex-col justify-between">
                <div>
                  <div className="text-2xl mb-3">❌</div>
                  <span className="text-xs font-black uppercase tracking-wider text-red-400 block mb-1">
                    Critical
                  </span>
                  <h4 className="text-sm font-bold text-white mb-2">Major Hazard</h4>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Major clinical interaction requiring immediate prescriber review, dose adjustment, or close monitoring.
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-red-500/20 text-[11px] text-red-300 font-mono">
                  Ex: Warfarin + Aspirin
                </div>
              </div>

              {/* CAUTION */}
              <div className="glass-card p-6 border-amber-500/40 bg-amber-950/20 rounded-2xl flex flex-col justify-between">
                <div>
                  <div className="text-2xl mb-3">⚠️</div>
                  <span className="text-xs font-black uppercase tracking-wider text-amber-400 block mb-1">
                    Caution
                  </span>
                  <h4 className="text-sm font-bold text-white mb-2">Moderate Conflict</h4>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Requires timing separation (e.g. 2 hours apart) or dietary adjustments to avoid reduced efficacy.
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-amber-500/20 text-[11px] text-amber-300 font-mono">
                  Ex: Lisinopril + Calcium
                </div>
              </div>

              {/* MINOR */}
              <div className="glass-card p-6 border-yellow-500/30 bg-yellow-950/10 rounded-2xl flex flex-col justify-between">
                <div>
                  <div className="text-2xl mb-3">💛</div>
                  <span className="text-xs font-black uppercase tracking-wider text-yellow-400 block mb-1">
                    Minor
                  </span>
                  <h4 className="text-sm font-bold text-white mb-2">Informational</h4>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Low clinical severity. Minor fluctuation in blood levels; worth noting during routine wellness visits.
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-yellow-500/20 text-[11px] text-yellow-300 font-mono">
                  Ex: Metformin + Statin
                </div>
              </div>

              {/* SAFE */}
              <div className="glass-card p-6 border-emerald-500/40 bg-emerald-950/20 rounded-2xl flex flex-col justify-between">
                <div>
                  <div className="text-2xl mb-3">✅</div>
                  <span className="text-xs font-black uppercase tracking-wider text-emerald-400 block mb-1">
                    Safe
                  </span>
                  <h4 className="text-sm font-bold text-white mb-2">Compatible</h4>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    No documented pharmacological conflict. Established dual therapy with safe co-administration.
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-emerald-500/20 text-[11px] text-emerald-300 font-mono">
                  Ex: Metformin + Lisinopril
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ===================== SECTION 6: TESTIMONIALS ===================== */}
        <section id="caregivers" className="py-24 px-4 sm:px-6 lg:px-8 bg-slate-950/40 border-t border-white/5">
          <div className="max-w-7xl mx-auto">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <span className="text-xs font-bold uppercase tracking-widest text-emerald-400 mb-2 block">
                Loved By Families & Caregivers
              </span>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white tracking-tight">
                Protecting Families Across America
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
              {/* Testimonial 1 */}
              <div className="glass-card p-8 relative">
                <div className="flex items-center gap-1 text-amber-400 mb-4 text-sm">
                  ★★★★★
                </div>
                <p className="text-slate-300 text-sm leading-relaxed mb-6">
                  "My 74-year-old mother was prescribed Warfarin by her cardiologist and baby aspirin by her PCP. SafeDose flagged the dual blood-thinner risk the minute we scanned her bottles. Her doctor adjusted the regimen the next day."
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-600 flex items-center justify-center font-bold text-white text-sm">
                    JR
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white">John Rodriguez</div>
                    <div className="text-[11px] text-slate-400">Son & Primary Caregiver • Austin, TX</div>
                  </div>
                </div>
              </div>

              {/* Testimonial 2 */}
              <div className="glass-card p-8 relative">
                <div className="flex items-center gap-1 text-amber-400 mb-4 text-sm">
                  ★★★★★
                </div>
                <p className="text-slate-300 text-sm leading-relaxed mb-6">
                  "I take 8 pills daily for diabetes, high blood pressure, and arthritis. The AI schedule feature separated my calcium supplements from Lisinopril so both actually work. My blood pressure numbers have finally stabilized."
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-emerald-500 to-blue-600 flex items-center justify-center font-bold text-white text-sm">
                    MR
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white">Maria Rodriguez</div>
                    <div className="text-[11px] text-slate-400">Patient, Age 74 • Coral Gables, FL</div>
                  </div>
                </div>
              </div>

              {/* Testimonial 3 */}
              <div className="glass-card p-8 relative">
                <div className="flex items-center gap-1 text-amber-400 mb-4 text-sm">
                  ★★★★★
                </div>
                <p className="text-slate-300 text-sm leading-relaxed mb-6">
                  "As a home health nurse, I recommend SafeDose to every elderly patient. The emergency card with the instant QR code has already saved EMTs critical minutes in the field."
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-purple-500 to-pink-600 flex items-center justify-center font-bold text-white text-sm">
                    SW
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white">Sarah Williams, BSN, RN</div>
                    <div className="text-[11px] text-slate-400">Geriatric Nurse Specialist • Boston, MA</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Marquee Bar */}
            <div className="text-center border-t border-white/5 pt-10">
              <span className="text-xs text-slate-500 uppercase tracking-widest font-mono block mb-4">
                Clinical Knowledge Grounded In Verified Open Standards
              </span>
              <div className="flex flex-wrap items-center justify-center gap-8 text-sm font-semibold text-slate-400">
                <span className="hover:text-white transition-colors">🏛️ U.S. FDA</span>
                <span>•</span>
                <span className="hover:text-white transition-colors">📚 NLM RxNorm</span>
                <span>•</span>
                <span className="hover:text-white transition-colors">💊 DailyMed</span>
                <span>•</span>
                <span className="hover:text-white transition-colors">🔬 openFDA</span>
                <span>•</span>
                <span className="hover:text-white transition-colors">✨ Google Gemini 2.5</span>
              </div>
            </div>
          </div>
        </section>

        {/* ===================== SECTION 7: FINAL CTA ===================== */}
        <section className="py-24 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
          <div className="max-w-5xl mx-auto rounded-3xl p-8 sm:p-14 bg-gradient-to-br from-indigo-950 via-slate-900 to-[#0A0F1E] border border-blue-500/30 text-center relative shadow-[0_0_80px_rgba(59,130,246,0.2)]">
            <div className="absolute top-0 right-0 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="relative z-10 max-w-2xl mx-auto space-y-6">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-500/30">
                🌿 SafeDose Protection Shield
              </span>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white tracking-tight">
                Your Medications Deserve a Guardian.
              </h2>
              <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
                Take the guesswork and fear out of managing multiple prescriptions. Start protecting yourself or your loved ones right now.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
                <button
                  onClick={() => {
                    setShowAddMedModal(true);
                    setView('dashboard');
                  }}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-4 rounded-2xl bg-gradient-to-r from-emerald-500 via-blue-600 to-indigo-600 text-white font-bold text-base shadow-xl shadow-blue-500/30 hover:scale-105 transition-all cursor-pointer"
                >
                  <Camera className="w-5 h-5" />
                  <span>Start Scanning for Free</span>
                </button>
                <button
                  onClick={() => setView('dashboard')}
                  className="w-full sm:w-auto px-7 py-4 rounded-2xl bg-white/5 hover:bg-white/10 text-white font-semibold text-base border border-white/10 transition-all cursor-pointer"
                >
                  Launch Interactive Demo
                </button>
              </div>
              <div className="text-xs text-slate-500 pt-2">
                No credit card required • Free forever for up to 5 medications • Takes 2 minutes to set up
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};
