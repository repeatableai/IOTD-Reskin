import {
  type ComplianceFlag,
  type ComplianceCheckResult,
  type ComplianceType,
  type ComplianceSeverity,
  REGION_COMPLIANCE_MAP,
  COMPLIANCE_REQUIREMENTS,
} from '@shared/icpBuilderTypes';

/**
 * Compliance Service
 * Handles GDPR, TCPA, CCPA, and CASL region flagging for validation contacts
 */

// ─── Region Detection ──────────────────────────────────────────────────────────

/**
 * Normalize region string to match our mapping
 */
function normalizeRegion(region: string): string {
  const normalized = region.trim();

  // Common variations
  const regionMap: Record<string, string> = {
    // US variations
    'united states': 'United States',
    'usa': 'USA',
    'us': 'US',
    'america': 'United States',
    // UK variations
    'uk': 'UK',
    'united kingdom': 'United Kingdom',
    'great britain': 'UK',
    'england': 'UK',
    'scotland': 'UK',
    'wales': 'UK',
    // Canada variations
    'ca': 'Canada',
    'canada': 'Canada',
    // EU variations
    'eu': 'EU',
    'european union': 'EU',
    'europe': 'EU',
    // California specific
    'california': 'California',
    'ca, usa': 'California',
    'ca, us': 'California',
    'california, usa': 'California',
    'california, us': 'California',
  };

  const lowerRegion = normalized.toLowerCase();
  return regionMap[lowerRegion] || normalized;
}

/**
 * Detect compliance types based on region
 */
function detectComplianceTypes(region: string): ComplianceType[] {
  const normalizedRegion = normalizeRegion(region);

  // Direct match
  if (REGION_COMPLIANCE_MAP[normalizedRegion]) {
    return REGION_COMPLIANCE_MAP[normalizedRegion];
  }

  // Try case-insensitive match
  for (const [key, types] of Object.entries(REGION_COMPLIANCE_MAP)) {
    if (key.toLowerCase() === normalizedRegion.toLowerCase()) {
      return types;
    }
  }

  // Check if it contains a known region
  const lowerRegion = normalizedRegion.toLowerCase();

  // California detection (must check before general US)
  if (lowerRegion.includes('california') || lowerRegion === 'ca') {
    return ['tcpa', 'ccpa'];
  }

  // US detection
  if (lowerRegion.includes('united states') ||
      lowerRegion.includes('usa') ||
      lowerRegion === 'us' ||
      lowerRegion.includes('america')) {
    return ['tcpa'];
  }

  // Canada detection
  if (lowerRegion.includes('canada')) {
    return ['casl'];
  }

  // EU detection
  if (lowerRegion.includes('european') ||
      lowerRegion === 'eu' ||
      lowerRegion.includes('europe')) {
    return ['gdpr'];
  }

  // Check for EU country names
  const euCountries = [
    'austria', 'belgium', 'bulgaria', 'croatia', 'cyprus', 'czech',
    'denmark', 'estonia', 'finland', 'france', 'germany', 'greece',
    'hungary', 'ireland', 'italy', 'latvia', 'lithuania', 'luxembourg',
    'malta', 'netherlands', 'poland', 'portugal', 'romania', 'slovakia',
    'slovenia', 'spain', 'sweden', 'iceland', 'liechtenstein', 'norway'
  ];

  for (const country of euCountries) {
    if (lowerRegion.includes(country)) {
      return ['gdpr'];
    }
  }

  // UK detection
  if (lowerRegion.includes('united kingdom') ||
      lowerRegion === 'uk' ||
      lowerRegion.includes('britain') ||
      lowerRegion.includes('england') ||
      lowerRegion.includes('scotland') ||
      lowerRegion.includes('wales')) {
    return ['gdpr'];
  }

  // No known compliance regulations
  return [];
}

/**
 * Determine severity based on compliance type
 */
function getSeverity(type: ComplianceType): ComplianceSeverity {
  switch (type) {
    case 'gdpr':
      return 'high'; // Strictest penalties
    case 'ccpa':
      return 'high'; // California is strict
    case 'tcpa':
      return 'medium'; // Significant but less strict than GDPR
    case 'casl':
      return 'medium'; // Canadian anti-spam
    default:
      return 'low';
  }
}

// ─── Main Compliance Check ─────────────────────────────────────────────────────

/**
 * Check compliance requirements for a contact based on their region
 */
export function checkCompliance(contact: {
  region: string;
  email?: string;
  phone?: string;
}): ComplianceCheckResult {
  const { region, email, phone } = contact;

  const complianceTypes = detectComplianceTypes(region);
  const flags: ComplianceFlag[] = [];
  const warnings: string[] = [];
  const recommendations: string[] = [];

  // Build flags for each detected compliance type
  for (const type of complianceTypes) {
    const requirements = COMPLIANCE_REQUIREMENTS[type];
    const severity = getSeverity(type);

    flags.push({
      type,
      region: normalizeRegion(region),
      severity,
      requirements,
    });
  }

  // Add warnings based on compliance types
  if (complianceTypes.includes('gdpr')) {
    warnings.push('GDPR applies - explicit consent required before any contact');
    recommendations.push('Document lawful basis for processing personal data');
    recommendations.push('Prepare for potential data subject access requests');
  }

  if (complianceTypes.includes('tcpa')) {
    warnings.push('TCPA applies - verify phone consent before calling');
    if (phone) {
      recommendations.push('Check Do-Not-Call registry before calling');
      recommendations.push('Only call between 8am-9pm local time');
    }
  }

  if (complianceTypes.includes('ccpa')) {
    warnings.push('CCPA applies - California privacy rights in effect');
    recommendations.push('Provide clear privacy notice at first contact');
    recommendations.push('Be prepared to honor opt-out requests');
  }

  if (complianceTypes.includes('casl')) {
    warnings.push('CASL applies - Canadian anti-spam law in effect');
    if (email) {
      recommendations.push('Ensure express or implied consent for email');
      recommendations.push('Include clear unsubscribe mechanism in emails');
    }
  }

  // Contact method specific warnings
  if (email && complianceTypes.length > 0) {
    warnings.push('Email contact requires documented consent');
  }

  if (phone && complianceTypes.length > 0) {
    warnings.push('Phone contact may have additional consent requirements');
  }

  // Unknown region warning
  if (complianceTypes.length === 0 && region) {
    warnings.push(`Region "${region}" has no specific compliance mapping - general privacy best practices apply`);
    recommendations.push('Apply general privacy best practices');
    recommendations.push('Document consent for any contact');
  }

  return {
    flags,
    isCompliant: true, // We flag but don't block - user decides
    warnings,
    recommendations,
  };
}

/**
 * Check multiple contacts at once
 */
export function checkBulkCompliance(contacts: Array<{
  id: string;
  region: string;
  email?: string;
  phone?: string;
}>): Map<string, ComplianceCheckResult> {
  const results = new Map<string, ComplianceCheckResult>();

  for (const contact of contacts) {
    results.set(contact.id, checkCompliance(contact));
  }

  return results;
}

/**
 * Get compliance summary for export/display
 */
export function getComplianceSummary(flags: ComplianceFlag[]): string {
  if (flags.length === 0) {
    return 'No specific compliance requirements detected';
  }

  const types = flags.map(f => f.type.toUpperCase()).join(', ');
  const highSeverity = flags.some(f => f.severity === 'high');

  if (highSeverity) {
    return `${types} - Strict compliance required`;
  }

  return `${types} - Compliance requirements apply`;
}

/**
 * Format compliance flags for CSV export
 */
export function formatComplianceForExport(flags: ComplianceFlag[]): {
  complianceTypes: string;
  complianceSeverity: string;
  complianceRegion: string;
} {
  if (flags.length === 0) {
    return {
      complianceTypes: '',
      complianceSeverity: '',
      complianceRegion: '',
    };
  }

  return {
    complianceTypes: flags.map(f => f.type.toUpperCase()).join('; '),
    complianceSeverity: flags.map(f => f.severity).sort()[0] || '', // Return highest severity
    complianceRegion: flags[0]?.region || '',
  };
}
