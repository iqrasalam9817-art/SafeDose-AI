import { Medication, Interaction, SafetyScore, AgentActivityItem } from '../types';
import {
  searchRxNormDrugs,
  fetchDrugInfoFromFDA,
  detectLocalInteraction,
  KNOWN_CLINICAL_INTERACTIONS
} from './fda';

export type WebMCPStatus = 'ready' | 'unavailable';

declare global {
  interface Document {
    modelContext?: {
      registerTool: (toolDef: {
        name: string;
        description: string;
        inputSchema: Record<string, any>;
        annotations?: { readOnlyHint?: boolean; [key: string]: any };
        untrustedContentHint?: boolean;
        execute: (input: any) => Promise<any> | any;
        [key: string]: any;
      }) => void;
      [key: string]: any;
    };
  }
}

export interface WebMCPCallbacks {
  getMedications: () => Medication[];
  getInteractions: () => Interaction[];
  getSafetyScore: () => SafetyScore;
  onSearchMedicationUI?: (name: string, results: any) => void;
  onViewRegimenUI?: () => void;
  onViewSafetyFindingsUI?: () => void;
  onAddAgentActivity: (activity: Omit<AgentActivityItem, 'id' | 'timestamp'>) => void;
  onRecalculateInteractions?: () => Promise<void>;
}

// Module-level state & registration guard
let isWebMCPRegistered = false;
let activeCallbacks: WebMCPCallbacks | null = null;

/**
 * Checks if the browser environment supports the WebMCP Imperative API.
 */
export function isWebMCPAvailable(): boolean {
  if (typeof document === 'undefined') return false;
  return Boolean(document.modelContext && typeof document.modelContext.registerTool === 'function');
}

/**
 * Registers the three SafeDose-AI WebMCP tools:
 * 1. search_medication
 * 2. get_current_regimen
 * 3. check_regimen_safety
 *
 * Uses the real browser-side WebMCP Imperative API: document.modelContext.registerTool()
 * Uses feature detection and a registration guard to prevent duplicate registrations.
 */
export function registerWebMCP(callbacks: WebMCPCallbacks): boolean {
  // Keep the latest callbacks reference updated across React re-renders
  activeCallbacks = callbacks;

  // If already registered, don't re-register with document.modelContext
  if (isWebMCPRegistered) {
    return true;
  }

  // Feature detection for the browser-provided WebMCP Imperative API
  if (typeof document === 'undefined' || !document.modelContext || typeof document.modelContext.registerTool !== 'function') {
    // Also expose a local testing bridge on window for manual Chrome verification
    setupTestingBridge();
    return false;
  }

  try {
    /* -------------------------------------------------------------
     * Tool 1: search_medication
     * ------------------------------------------------------------- */
    document.modelContext.registerTool({
      name: 'search_medication',
      description: 'Search SafeDose-AI for a medication by brand or generic name.',
      inputSchema: {
        type: 'object',
        properties: {
          name: {
            type: 'string',
            description: 'The brand or generic name of the medication to search.'
          }
        },
        required: ['name'],
        additionalProperties: false
      },
      annotations: {
        readOnlyHint: true
      },
      untrustedContentHint: true,
      execute: async (input: any) => {
        return handleSearchMedication(input);
      }
    });

    /* -------------------------------------------------------------
     * Tool 2: get_current_regimen
     * ------------------------------------------------------------- */
    document.modelContext.registerTool({
      name: 'get_current_regimen',
      description: 'Show the currently confirmed medications in the SafeDose-AI medication cabinet.',
      inputSchema: {
        type: 'object',
        properties: {},
        additionalProperties: false
      },
      annotations: {
        readOnlyHint: true
      },
      untrustedContentHint: false,
      execute: async (input: any) => {
        return handleGetCurrentRegimen(input);
      }
    });

    /* -------------------------------------------------------------
     * Tool 3: check_regimen_safety
     * ------------------------------------------------------------- */
    document.modelContext.registerTool({
      name: 'check_regimen_safety',
      description: 'Check the current medication regimen for potential interaction and timing findings to review with a qualified clinician or pharmacist.',
      inputSchema: {
        type: 'object',
        properties: {
          medicationName: {
            type: 'string',
            description: 'Optional name of a specific candidate medication to test against the current regimen.'
          },
          includeFoodAndSupplements: {
            type: 'boolean',
            description: 'Whether to include food and supplement interactions (e.g., grapefruit, calcium) in the assessment.'
          }
        },
        additionalProperties: false
      },
      annotations: {
        readOnlyHint: true
      },
      untrustedContentHint: true,
      execute: async (input: any) => {
        return handleCheckRegimenSafety(input);
      }
    });

    isWebMCPRegistered = true;
    setupTestingBridge();
    return true;
  } catch (err: any) {
    console.warn('[WebMCP] Tool registration error:', err);
    // If tools were already registered by an earlier script instance
    if (err?.name === 'InvalidStateError' || err?.message?.includes?.('already registered')) {
      isWebMCPRegistered = true;
      setupTestingBridge();
      return true;
    }
    return false;
  }
}

/**
 * Handler for search_medication tool
 */
async function handleSearchMedication(input: any) {
  // Input validation
  if (!input || typeof input !== 'object' || typeof input.name !== 'string' || !input.name.trim()) {
    const errorMsg = 'Invalid input: "name" parameter is required and must be a non-empty string.';
    activeCallbacks?.onAddAgentActivity({
      tool: 'search_medication',
      status: 'error',
      summary: 'Search failed: missing or invalid medication name.',
      params: input,
      result: { error: errorMsg }
    });
    return {
      status: 'error',
      message: errorMsg
    };
  }

  const query = input.name.trim();

  try {
    // 1. Call existing SafeDose medication search functions
    const [suggestions, fdaInfo] = await Promise.all([
      searchRxNormDrugs(query).catch(() => []),
      fetchDrugInfoFromFDA(query).catch(() => null)
    ]);

    // 2. Check currently confirmed cabinet medications
    const currentMeds = activeCallbacks?.getMedications() || [];
    const inCabinetMatches = currentMeds.filter(
      m =>
        m.drugName.toLowerCase().includes(query.toLowerCase()) ||
        (m.genericName && m.genericName.toLowerCase().includes(query.toLowerCase()))
    );

    const results = {
      query,
      foundInCabinet: inCabinetMatches.length > 0,
      cabinetMatches: inCabinetMatches.map(m => ({
        id: m.id,
        drugName: m.drugName,
        genericName: m.genericName || m.drugName,
        dosage: `${m.dosage} ${m.dosageUnit}`.trim(),
        frequency: m.frequency,
        active: m.active
      })),
      rxNormSuggestions: suggestions.slice(0, 5),
      fdaDetails: fdaInfo
        ? {
            brandName: fdaInfo.brandName,
            genericName: fdaInfo.genericName,
            drugClass: fdaInfo.drugClass,
            warnings: fdaInfo.warnings?.slice(0, 2) || []
          }
        : null
    };

    // 3. Update existing medication-results UI
    activeCallbacks?.onSearchMedicationUI?.(query, results);

    // 4. Add visible Agent Activity entry
    activeCallbacks?.onAddAgentActivity({
      tool: 'search_medication',
      status: 'success',
      summary: `Searched for "${query}": ${
        inCabinetMatches.length > 0 ? `${inCabinetMatches.length} in cabinet, ` : ''
      }${suggestions.length} RxNorm suggestions found.`,
      params: { name: query },
      result: {
        foundInCabinet: inCabinetMatches.length > 0,
        suggestionCount: suggestions.length,
        hasFdaDetails: Boolean(fdaInfo)
      }
    });

    // 5. Return concise JSON
    return {
      status: 'success',
      medicationName: query,
      results,
      disclaimer: 'Informational only. Not a medical prescription or diagnostic evaluation.'
    };
  } catch (err: any) {
    const errorMsg = `Medication search error: ${err?.message || 'Failed to query drug directory'}`;
    activeCallbacks?.onAddAgentActivity({
      tool: 'search_medication',
      status: 'error',
      summary: `Search error for "${query}".`,
      params: { name: query },
      result: { error: errorMsg }
    });
    return {
      status: 'error',
      medicationName: query,
      message: errorMsg
    };
  }
}

/**
 * Handler for get_current_regimen tool
 */
async function handleGetCurrentRegimen(input: any) {
  // Validate that no unexpected required parameters are missing
  if (input && typeof input !== 'object') {
    return {
      status: 'error',
      message: 'Invalid parameters: expected empty object.'
    };
  }

  try {
    // 1. Read existing medication/regimen state
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

    // 2. Update visible UI or Agent Activity panel
    activeCallbacks?.onViewRegimenUI?.();

    // 3. Add visible Agent Activity entry
    activeCallbacks?.onAddAgentActivity({
      tool: 'get_current_regimen',
      status: 'success',
      summary: `Retrieved ${regimen.length} active confirmed medications from SafeDose cabinet.`,
      params: {},
      result: { totalMedications: regimen.length }
    });

    // 4. Return concise JSON
    return {
      status: 'success',
      totalCount: regimen.length,
      regimen,
      notice: 'Active confirmed regimen. No medical changes should be made without clinician review.'
    };
  } catch (err: any) {
    const errorMsg = `Failed to read regimen: ${err?.message || 'State access failure'}`;
    activeCallbacks?.onAddAgentActivity({
      tool: 'get_current_regimen',
      status: 'error',
      summary: 'Failed to retrieve cabinet regimen.',
      result: { error: errorMsg }
    });
    return {
      status: 'error',
      message: errorMsg
    };
  }
}

/**
 * Handler for check_regimen_safety tool
 */
async function handleCheckRegimenSafety(input: any) {
  // Input validation
  if (input && typeof input === 'object') {
    if (
      input.medicationName !== undefined &&
      (typeof input.medicationName !== 'string' || !input.medicationName.trim())
    ) {
      const errorMsg = 'Invalid input: "medicationName" must be a non-empty string when provided.';
      activeCallbacks?.onAddAgentActivity({
        tool: 'check_regimen_safety',
        status: 'error',
        summary: 'Safety check failed: invalid medicationName.',
        params: input,
        result: { error: errorMsg }
      });
      return { status: 'error', message: errorMsg };
    }

    if (
      input.includeFoodAndSupplements !== undefined &&
      typeof input.includeFoodAndSupplements !== 'boolean'
    ) {
      const errorMsg = 'Invalid input: "includeFoodAndSupplements" must be a boolean value.';
      activeCallbacks?.onAddAgentActivity({
        tool: 'check_regimen_safety',
        status: 'error',
        summary: 'Safety check failed: invalid includeFoodAndSupplements parameter.',
        params: input,
        result: { error: errorMsg }
      });
      return { status: 'error', message: errorMsg };
    }
  }

  const candidateMed = input?.medicationName?.trim() || null;
  const checkFood = input?.includeFoodAndSupplements ?? true;

  try {
    const currentMeds = activeCallbacks?.getMedications() || [];
    const activeMeds = currentMeds.filter(m => m.active);

    const findings: Array<{
      drugPair: [string, string];
      severity: string;
      mechanism: string;
      clinicalReviewAction: string;
    }> = [];

    if (candidateMed) {
      // Test candidate medication against active regimen
      for (const med of activeMeds) {
        const local = detectLocalInteraction(candidateMed, med.drugName);
        if (local) {
          findings.push({
            drugPair: [candidateMed, med.drugName],
            severity: local.severity,
            mechanism: local.mechanism,
            clinicalReviewAction: local.actionRequired
          });
        }
      }

      // Check food/supplement interactions for the candidate if requested
      if (checkFood) {
        const foodAgents = ['grapefruit', 'alcohol', 'calcium', 'potassium'];
        for (const food of foodAgents) {
          const foodConflict = detectLocalInteraction(candidateMed, food);
          if (foodConflict) {
            findings.push({
              drugPair: [candidateMed, food],
              severity: foodConflict.severity,
              mechanism: foodConflict.mechanism,
              clinicalReviewAction: foodConflict.actionRequired
            });
          }
        }
      }
    } else {
      // Evaluate all pairwise combinations of the active regimen
      for (let i = 0; i < activeMeds.length; i++) {
        for (let j = i + 1; j < activeMeds.length; j++) {
          const drugA = activeMeds[i].drugName;
          const drugB = activeMeds[j].drugName;
          const local = detectLocalInteraction(drugA, drugB);
          if (local && local.severity !== 'safe') {
            findings.push({
              drugPair: [drugA, drugB],
              severity: local.severity,
              mechanism: local.mechanism,
              clinicalReviewAction: local.actionRequired
            });
          }
        }
      }

      // Also include existing verified interactions from state
      const stateInteractions = activeCallbacks?.getInteractions() || [];
      for (const item of stateInteractions) {
        if (item.dismissed || item.severity === 'safe') continue;
        const exists = findings.some(
          f =>
            (f.drugPair[0].toLowerCase() === item.drugAName.toLowerCase() &&
              f.drugPair[1].toLowerCase() === item.drugBName.toLowerCase()) ||
            (f.drugPair[0].toLowerCase() === item.drugBName.toLowerCase() &&
              f.drugPair[1].toLowerCase() === item.drugAName.toLowerCase())
        );
        if (!exists) {
          findings.push({
            drugPair: [item.drugAName, item.drugBName],
            severity: item.severity,
            mechanism: item.mechanism,
            clinicalReviewAction: item.actionRequired
          });
        }
      }
    }

    // Refresh clinical interactions in background if available
    if (activeCallbacks?.onRecalculateInteractions) {
      activeCallbacks.onRecalculateInteractions().catch(() => {});
    }

    // Read current safety score
    const safetyScore = activeCallbacks?.getSafetyScore();

    // 2. Update existing safety-findings UI
    activeCallbacks?.onViewSafetyFindingsUI?.();

    // 3. Add visible Agent Activity entry
    const criticalCount = findings.filter(
      f => f.severity === 'critical' || f.severity === 'deadly'
    ).length;

    activeCallbacks?.onAddAgentActivity({
      tool: 'check_regimen_safety',
      status: 'success',
      summary: candidateMed
        ? `Checked "${candidateMed}" against regimen: ${findings.length} findings (${criticalCount} critical).`
        : `Regimen safety review: ${findings.length} findings (${criticalCount} critical).`,
      params: { medicationName: candidateMed, includeFoodAndSupplements: checkFood },
      result: {
        totalFindings: findings.length,
        criticalCount,
        safetyScore: safetyScore?.score
      }
    });

    // 4. Return concise JSON
    return {
      status: 'success',
      evaluationTarget: candidateMed || 'full_active_regimen',
      safetyScore: safetyScore?.score ?? 85,
      findingsCount: findings.length,
      findings,
      disclaimer:
        'Potential interaction and timing findings to review with a qualified clinician or pharmacist. Does not diagnose, prescribe, adjust dosage, recommend stopping medicine, or guarantee safety.'
    };
  } catch (err: any) {
    const errorMsg = `Safety check error: ${err?.message || 'Analysis failure'}`;
    activeCallbacks?.onAddAgentActivity({
      tool: 'check_regimen_safety',
      status: 'error',
      summary: 'Regimen safety assessment encountered an error.',
      params: input,
      result: { error: errorMsg }
    });
    return {
      status: 'error',
      message: errorMsg
    };
  }
}

/**
 * Setup testing bridge on window for manual Chrome verification
 */
function setupTestingBridge() {
  if (typeof window === 'undefined') return;
  (window as any).__safedose_webmcp = {
    isRegistered: isWebMCPRegistered,
    isAvailable: isWebMCPAvailable(),
    tools: {
      search_medication: (params: any) => handleSearchMedication(params),
      get_current_regimen: (params?: any) => handleGetCurrentRegimen(params || {}),
      check_regimen_safety: (params?: any) => handleCheckRegimenSafety(params || {})
    },
    // Helper to simulate document.modelContext in standard Chrome DevTools
    simulateModelContext: () => {
      const mockRegisteredTools: Record<string, any> = {};
      (document as any).modelContext = {
        registerTool: (toolDef: any) => {
          mockRegisteredTools[toolDef.name] = toolDef;
          console.log(`[WebMCP Mock] Registered tool: ${toolDef.name}`, toolDef);
        },
        getTools: () => Object.values(mockRegisteredTools),
        executeTool: async (name: string, input: any) => {
          if (!mockRegisteredTools[name]) throw new Error(`Tool not found: ${name}`);
          return mockRegisteredTools[name].execute(input);
        }
      };
      isWebMCPRegistered = false;
      if (activeCallbacks) {
        registerWebMCP(activeCallbacks);
      }
      return 'document.modelContext simulated successfully. WebMCP is now ready.';
    }
  };
}
