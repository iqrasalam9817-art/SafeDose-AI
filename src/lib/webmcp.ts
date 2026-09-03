import { Medication, Interaction, SafetyScore, AgentActivityItem } from '../types';
import {
  searchRxNormDrugs,
  fetchDrugInfoFromFDA,
  detectLocalInteraction
} from './fda';

export type WebMCPStatus = 'ready' | 'unavailable';

export interface WebMCPCallbacks {
  getMedications: () => Medication[];
  getInteractions: () => Interaction[];
  getSafetyScore: () => SafetyScore;
  onSearchMedicationUI?: (query: string, results: any) => void;
  onViewRegimenUI?: () => void;
  onViewSafetyFindingsUI?: () => void;
  onAddAgentActivity: (activity: Omit<AgentActivityItem, 'id' | 'timestamp'>) => void;
  onRecalculateInteractions?: () => Promise<void>;
}

// Module-level state & registration lifecycle
let activeAbortController: AbortController | null = null;
let isWebMCPRegistered = false;
let activeCallbacks: WebMCPCallbacks | null = null;

/**
 * Discovers available real WebMCP hosts in the browser environment.
 * WebMCP may be exposed on document.modelContext (W3C draft & desktop agents)
 * or navigator.modelContext (early Chromium prototypes).
 *
 * CRITICAL: Returns null if no real host is present. Does NOT create a fake polyfill.
 */
export function getModelContexts(): any[] {
  const contexts: any[] = [];

  if (
    typeof document !== 'undefined' &&
    (document as any).modelContext &&
    typeof (document as any).modelContext.registerTool === 'function'
  ) {
    contexts.push((document as any).modelContext);
  }

  if (
    typeof navigator !== 'undefined' &&
    (navigator as any).modelContext &&
    typeof (navigator as any).modelContext.registerTool === 'function'
  ) {
    const navMC = (navigator as any).modelContext;
    if (!contexts.includes(navMC)) {
      contexts.push(navMC);
    }
  }

  return contexts;
}

/**
 * Checks whether a genuine WebMCP host is available in the current browser session.
 * Never polyfills or mocks.
 */
export function isWebMCPAvailable(): boolean {
  return getModelContexts().length > 0;
}

/**
 * Watcher for hosts that might attach document.modelContext or navigator.modelContext
 * asynchronously after initial script execution (e.g. extensions, debuggers, or test runners).
 */
export function watchForModelContext(onAvailable: () => void): () => void {
  if (typeof window === 'undefined') return () => {};
  if (isWebMCPAvailable()) return () => {};

  let disposed = false;
  let intervalId: any = null;
  let attempts = 0;

  // Poll briefly for the first 3 seconds (every 300ms) to detect delayed host attachment
  intervalId = setInterval(() => {
    attempts++;
    if (disposed || attempts > 10) {
      clearInterval(intervalId);
      return;
    }
    if (isWebMCPAvailable()) {
      clearInterval(intervalId);
      onAvailable();
    }
  }, 300);

  const handleHostReady = () => {
    if (!disposed && isWebMCPAvailable()) {
      onAvailable();
    }
  };

  window.addEventListener('modelcontextready', handleHostReady);
  window.addEventListener('webmcpready', handleHostReady);

  return () => {
    disposed = true;
    if (intervalId) clearInterval(intervalId);
    window.removeEventListener('modelcontextready', handleHostReady);
    window.removeEventListener('webmcpready', handleHostReady);
  };
}

/**
 * Registers the 3 official SafeDose-AI read-only tools on the genuine WebMCP host:
 * 1. search_medication ({ query: string })
 * 2. get_current_regimen ({})
 * 3. check_regimen_safety ({ candidateMedication: string })
 *
 * Strictly adheres to W3C WebMCP specification:
 * - Uses real document.modelContext.registerTool()
 * - Registers using AbortSignal for clean lifecycle unregistration on unmount/re-render
 * - Strictly read-only tools: AI agents cannot add, remove, or prescribe medications
 * - Connects real executions to Agent Activity panel
 */
export async function registerWebMCP(callbacks: WebMCPCallbacks): Promise<boolean> {
  activeCallbacks = callbacks;

  const contexts = getModelContexts();
  if (contexts.length === 0) {
    // Real host not present: do not fake success
    isWebMCPRegistered = false;
    setupTestingBridge();
    return false;
  }

  // Avoid duplicate registrations during React re-renders if already registered with active controller
  if (isWebMCPRegistered && activeAbortController && !activeAbortController.signal.aborted) {
    setupTestingBridge();
    return true;
  }

  // Clean up any previous registration controller
  if (activeAbortController) {
    try {
      activeAbortController.abort();
    } catch {
      // ignore
    }
  }

  activeAbortController = new AbortController();
  const signal = activeAbortController.signal;

  try {
    console.log('[SafeDose WebMCP] API detected');
    console.log('[SafeDose WebMCP] Registering tools...');

    /* -------------------------------------------------------------
     * Tool 1: search_medication
     * Input: { "query": "string" }
     * Purpose: Search SafeDose medication data and return structured
     *          medication information.
     * ------------------------------------------------------------- */
    const searchMedicationTool = {
      name: 'search_medication',
      title: 'Search Medication',
      description: 'Search SafeDose medication data and return structured medication information, cabinet matches, and clinical monograph summaries.',
      inputSchema: {
        type: 'object',
        properties: {
          query: {
            type: 'string',
            description: 'Brand or generic name of the medication to search (e.g., Warfarin, Lisinopril, Metformin).'
          }
        },
        required: ['query'],
        additionalProperties: false
      },
      annotations: {
        readOnlyHint: true,
        untrustedContentHint: true
      },
      execute: async (input: any) => {
        return await handleSearchMedication(input);
      }
    };

    /* -------------------------------------------------------------
     * Tool 2: get_current_regimen
     * Input: {}
     * Purpose: Return the medications CURRENTLY displayed in the user's
     *          SafeDose cabinet.
     * ------------------------------------------------------------- */
    const getCurrentRegimenTool = {
      name: 'get_current_regimen',
      title: 'Get Current Regimen',
      description: 'Return the medications currently confirmed and displayed in the user\'s SafeDose cabinet with dosage, frequency, and food instructions.',
      inputSchema: {
        type: 'object',
        properties: {},
        additionalProperties: false
      },
      annotations: {
        readOnlyHint: true
      },
      execute: async (input: any) => {
        return await handleGetCurrentRegimen(input);
      }
    };

    /* -------------------------------------------------------------
     * Tool 3: check_regimen_safety
     * Input: { "candidateMedication": "string" }
     * Purpose: Check the candidate medication against the CURRENT SafeDose
     *          regimen and return structured interaction results,
     *          including severity and affected medication pairs.
     * ------------------------------------------------------------- */
    const checkRegimenSafetyTool = {
      name: 'check_regimen_safety',
      title: 'Check Regimen Safety',
      description: 'Check candidate medication against the current SafeDose regimen and return structured interaction results, including severity, mechanism, and affected medication pairs.',
      inputSchema: {
        type: 'object',
        properties: {
          candidateMedication: {
            type: 'string',
            description: 'Candidate medication name to evaluate against the current active SafeDose regimen.'
          }
        },
        required: ['candidateMedication'],
        additionalProperties: false
      },
      annotations: {
        readOnlyHint: true
      },
      execute: async (input: any) => {
        return await handleCheckRegimenSafety(input);
      }
    };

    // Register on all discovered real model contexts (document.modelContext / navigator.modelContext)
    for (const mc of contexts) {
      await mc.registerTool(searchMedicationTool, { signal });
      console.log('[SafeDose WebMCP] search_medication registered');

      await mc.registerTool(getCurrentRegimenTool, { signal });
      console.log('[SafeDose WebMCP] get_current_regimen registered');

      await mc.registerTool(checkRegimenSafetyTool, { signal });
      console.log('[SafeDose WebMCP] check_regimen_safety registered');
    }

    console.log('[SafeDose WebMCP] Ready');
    isWebMCPRegistered = true;
    setupTestingBridge();
    return true;
  } catch (err: any) {
    // If tools were already registered in this context (e.g. HMR or prior registration instance)
    if (err?.name === 'InvalidStateError' || err?.message?.includes?.('already registered')) {
      console.log('[SafeDose WebMCP] Ready (re-used existing registration)');
      isWebMCPRegistered = true;
      setupTestingBridge();
      return true;
    }

    console.error('[SafeDose WebMCP] Registration failed:', err);
    isWebMCPRegistered = false;
    setupTestingBridge();
    return false;
  }
}

/**
 * Unregisters tools by aborting the active AbortController per WebMCP specification.
 */
export function unregisterWebMCP(): void {
  if (activeAbortController) {
    try {
      activeAbortController.abort();
    } catch {
      // ignore
    }
    activeAbortController = null;
  }
  isWebMCPRegistered = false;
}

/**
 * Handler for search_medication tool.
 * Input: { "query": "string" }
 */
export async function handleSearchMedication(input: any) {
  // Extract and sanitize query parameter (accepting query per spec, fallback to name if passed)
  const rawQuery = input && typeof input === 'object' ? (input.query ?? input.name) : input;
  const sanitizedQuery = typeof rawQuery === 'string' ? rawQuery.trim().slice(0, 128) : '';

  if (!sanitizedQuery) {
    const errorMsg = 'Invalid input: "query" parameter is required and must be a non-empty string.';
    activeCallbacks?.onAddAgentActivity({
      tool: 'search_medication',
      status: 'error',
      summary: 'Search failed: missing or invalid "query" parameter.',
      params: input && typeof input === 'object' ? input : { query: String(rawQuery ?? '') },
      result: { error: errorMsg }
    });
    return {
      status: 'error',
      message: errorMsg
    };
  }

  try {
    // 1. Query real live RxNorm & FDA directories
    const [suggestions, fdaInfo] = await Promise.all([
      searchRxNormDrugs(sanitizedQuery).catch(() => []),
      fetchDrugInfoFromFDA(sanitizedQuery).catch(() => null)
    ]);

    // 2. Query currently confirmed cabinet medications
    const currentMeds = activeCallbacks?.getMedications() || [];
    const inCabinetMatches = currentMeds.filter(
      m =>
        m.drugName.toLowerCase().includes(sanitizedQuery.toLowerCase()) ||
        (m.genericName && m.genericName.toLowerCase().includes(sanitizedQuery.toLowerCase()))
    );

    const cabinetSummary = inCabinetMatches.map(m => ({
      id: m.id,
      drugName: m.drugName,
      genericName: m.genericName || m.drugName,
      dosage: `${m.dosage} ${m.dosageUnit}`.trim(),
      frequency: m.frequency,
      active: m.active
    }));

    // 3. Update existing medication-results UI if available
    activeCallbacks?.onSearchMedicationUI?.(sanitizedQuery, {
      query: sanitizedQuery,
      inCabinetMatches: cabinetSummary,
      suggestions: suggestions.slice(0, 5)
    });

    // 4. Log real external tool execution to Agent Activity panel
    activeCallbacks?.onAddAgentActivity({
      tool: 'search_medication',
      status: 'success',
      summary: `Searched for "${sanitizedQuery}": ${inCabinetMatches.length} in cabinet, ${suggestions.length} RxNorm suggestions found.`,
      params: { query: sanitizedQuery },
      result: {
        foundInCabinet: inCabinetMatches.length > 0,
        inCabinetCount: inCabinetMatches.length,
        suggestionCount: suggestions.length,
        hasFdaDetails: Boolean(fdaInfo)
      }
    });

    // 5. Return structured medication information (READ-ONLY)
    return {
      status: 'success',
      query: sanitizedQuery,
      foundInCabinet: inCabinetMatches.length > 0,
      inCabinetMatches: cabinetSummary,
      suggestions: suggestions.slice(0, 5),
      fdaDetails: fdaInfo
        ? {
            brandName: fdaInfo.brandName,
            genericName: fdaInfo.genericName,
            drugClass: fdaInfo.drugClass,
            warnings: fdaInfo.warnings?.slice(0, 3) || []
          }
        : null,
      disclaimer: 'Read-only search data. Medication changes require human clinician or pharmacist action.'
    };
  } catch (err: any) {
    const errorMsg = `Medication search error: ${err?.message || 'Failed to query drug directory'}`;
    activeCallbacks?.onAddAgentActivity({
      tool: 'search_medication',
      status: 'error',
      summary: `Search error for "${sanitizedQuery}".`,
      params: { query: sanitizedQuery },
      result: { error: errorMsg }
    });
    return {
      status: 'error',
      query: sanitizedQuery,
      message: errorMsg
    };
  }
}

/**
 * Handler for get_current_regimen tool.
 * Input: {}
 */
export async function handleGetCurrentRegimen(input: any = {}) {
  try {
    // 1. Read real live medications currently displayed in user's SafeDose cabinet
    const currentMeds = activeCallbacks?.getMedications() || [];
    const regimen = currentMeds.map(m => ({
      id: m.id,
      drugName: m.drugName,
      genericName: m.genericName || m.drugName,
      dosage: `${m.dosage} ${m.dosageUnit}`.trim(),
      frequency: m.frequency,
      withFood: m.withFood,
      drugClass: m.drugClass,
      active: m.active
    }));

    // 2. Update visible UI if callback provided
    activeCallbacks?.onViewRegimenUI?.();

    // 3. Log real execution to Agent Activity panel
    activeCallbacks?.onAddAgentActivity({
      tool: 'get_current_regimen',
      status: 'success',
      summary: `Retrieved ${regimen.length} active confirmed medications from SafeDose cabinet.`,
      params: {},
      result: { totalMedications: regimen.length }
    });

    // 4. Return structured regimen JSON
    return {
      status: 'success',
      totalCount: regimen.length,
      regimen,
      timestamp: new Date().toISOString(),
      notice: 'Current cabinet regimen. Read-only: agents cannot modify active medications.'
    };
  } catch (err: any) {
    const errorMsg = `Failed to read regimen: ${err?.message || 'State access failure'}`;
    activeCallbacks?.onAddAgentActivity({
      tool: 'get_current_regimen',
      status: 'error',
      summary: 'Failed to retrieve cabinet regimen.',
      params: input || {},
      result: { error: errorMsg }
    });
    return {
      status: 'error',
      message: errorMsg
    };
  }
}

/**
 * Handler for check_regimen_safety tool.
 * Input: { "candidateMedication": "string" }
 */
export async function handleCheckRegimenSafety(input: any) {
  // Extract and sanitize candidateMedication parameter (fallback to medicationName if passed)
  const rawCandidate = input && typeof input === 'object' ? (input.candidateMedication ?? input.medicationName ?? input.query) : input;
  const sanitizedCandidate = typeof rawCandidate === 'string' ? rawCandidate.trim().slice(0, 128) : '';

  if (!sanitizedCandidate) {
    const errorMsg = 'Invalid input: "candidateMedication" parameter is required and must be a non-empty string.';
    activeCallbacks?.onAddAgentActivity({
      tool: 'check_regimen_safety',
      status: 'error',
      summary: 'Safety check failed: missing "candidateMedication" parameter.',
      params: input && typeof input === 'object' ? input : { candidateMedication: String(rawCandidate ?? '') },
      result: { error: errorMsg }
    });
    return {
      status: 'error',
      message: errorMsg
    };
  }

  try {
    const currentMeds = activeCallbacks?.getMedications() || [];
    const activeMeds = currentMeds.filter(m => m.active);

    const findings: Array<{
      drugPair: [string, string];
      severity: string;
      mechanism: string;
      clinicalReviewAction: string;
    }> = [];

    // Evaluate candidate medication against each active medication in the cabinet
    for (const med of activeMeds) {
      const interaction = detectLocalInteraction(sanitizedCandidate, med.drugName);
      if (interaction && interaction.severity !== 'safe') {
        findings.push({
          drugPair: [sanitizedCandidate, med.drugName],
          severity: interaction.severity,
          mechanism: interaction.mechanism,
          clinicalReviewAction: interaction.actionRequired
        });
      }
    }

    // Also check standard high-risk food/supplement agents
    const foodAgents = ['grapefruit', 'alcohol', 'calcium', 'potassium', 'st johns wort'];
    for (const food of foodAgents) {
      const foodConflict = detectLocalInteraction(sanitizedCandidate, food);
      if (foodConflict && foodConflict.severity !== 'safe') {
        findings.push({
          drugPair: [sanitizedCandidate, food],
          severity: foodConflict.severity,
          mechanism: foodConflict.mechanism,
          clinicalReviewAction: foodConflict.actionRequired
        });
      }
    }

    // Refresh clinical interactions in background if available
    if (activeCallbacks?.onRecalculateInteractions) {
      activeCallbacks.onRecalculateInteractions().catch(() => {});
    }

    const safetyScore = activeCallbacks?.getSafetyScore();

    // Update safety UI
    activeCallbacks?.onViewSafetyFindingsUI?.();

    const criticalCount = findings.filter(
      f => f.severity === 'critical' || f.severity === 'deadly'
    ).length;

    // Log real tool execution to Agent Activity panel
    activeCallbacks?.onAddAgentActivity({
      tool: 'check_regimen_safety',
      status: 'success',
      summary: `Checked "${sanitizedCandidate}" against ${activeMeds.length} active meds: ${findings.length} findings (${criticalCount} critical).`,
      params: { candidateMedication: sanitizedCandidate },
      result: {
        candidateMedication: sanitizedCandidate,
        totalFindings: findings.length,
        criticalCount,
        safetyScore: safetyScore?.score
      }
    });

    // Return structured interaction results
    return {
      status: 'success',
      candidateMedication: sanitizedCandidate,
      comparedAgainstCount: activeMeds.length,
      findingsCount: findings.length,
      findings,
      safetyScore: safetyScore?.score ?? 100,
      disclaimer: 'Potential interaction and timing findings to review with a qualified clinician or pharmacist. Read-only clinical decision support. AI agents cannot prescribe or alter medication.'
    };
  } catch (err: any) {
    const errorMsg = `Safety check error: ${err?.message || 'Analysis failure'}`;
    activeCallbacks?.onAddAgentActivity({
      tool: 'check_regimen_safety',
      status: 'error',
      summary: 'Regimen safety assessment encountered an error.',
      params: { candidateMedication: sanitizedCandidate },
      result: { error: errorMsg }
    });
    return {
      status: 'error',
      candidateMedication: sanitizedCandidate,
      message: errorMsg
    };
  }
}

/**
 * Directly executes a WebMCP tool by name with input parameters.
 * Invoked by UI test triggers in Agent Activity Panel or direct developer verification.
 */
export async function executeWebMCPTool(name: string, input: any = {}): Promise<any> {
  if (name === 'search_medication') {
    return await handleSearchMedication(input);
  }
  if (name === 'get_current_regimen') {
    return await handleGetCurrentRegimen(input);
  }
  if (name === 'check_regimen_safety') {
    return await handleCheckRegimenSafety(input);
  }

  throw new Error(`WebMCP tool "${name}" not found.`);
}

/**
 * Inspection helper on window.__safedose_webmcp for developer verification.
 * Does NOT mock document.modelContext or fake registration.
 */
function setupTestingBridge() {
  if (typeof window === 'undefined') return;

  (window as any).__safedose_webmcp = {
    isRegistered: isWebMCPRegistered,
    isAvailable: isWebMCPAvailable(),
    registeredHosts: getModelContexts().length,
    tools: {
      search_medication: (params: any) => handleSearchMedication(params),
      get_current_regimen: (params?: any) => handleGetCurrentRegimen(params || {}),
      check_regimen_safety: (params?: any) => handleCheckRegimenSafety(params || {})
    }
  };
}

/**
 * Returns the list of declared WebMCP tool signatures.
 */
export function getRegisteredWebMCPTools(): Array<{ name: string; description: string; input: string }> {
  return [
    {
      name: 'search_medication',
      description: 'Search SafeDose medication data and return structured medication information.',
      input: '{ query: string }'
    },
    {
      name: 'get_current_regimen',
      description: 'Return the medications currently displayed in the user\'s SafeDose cabinet.',
      input: '{}'
    },
    {
      name: 'check_regimen_safety',
      description: 'Check candidate medication against the current SafeDose regimen for interactions.',
      input: '{ candidateMedication: string }'
    }
  ];
}
