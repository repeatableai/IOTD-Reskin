/**
 * Validation Service
 *
 * Provides validation functions for analysis tool outputs to ensure:
 * - No placeholder tokens remain
 * - Source attribution is present for numeric claims
 * - Required sections are complete
 */

// ─── Type Definitions ────────────────────────────────────────────────────────

export interface ValidationError {
  type: 'placeholder' | 'missing_source' | 'missing_section' | 'invalid_format';
  message: string;
  location?: string;
  severity: 'error' | 'critical';
}

export interface ValidationWarning {
  type: 'assumption_needs_verification' | 'low_confidence' | 'data_gap';
  message: string;
  location?: string;
}

export interface ValidationResult {
  passed: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
  stats: {
    placeholdersFound: number;
    sourcedClaims: number;
    assumptionClaims: number;
    sectionsPresent: number;
    sectionsRequired: number;
  };
}

export interface ValidationOptions {
  noPlaceholders?: boolean;
  requireSources?: boolean;
  requiredSections?: string[];
  strictMode?: boolean;
}

// ─── Regex Patterns ──────────────────────────────────────────────────────────

// Matches placeholder tokens like [PLACEHOLDER], [TBD], [INSERT_VALUE], etc.
const PLACEHOLDER_PATTERN = /\[[A-Z][A-Z0-9_]*\]/g;

// Matches source attributions like "(Source: ...)" or "(Assumption: ...)"
const SOURCE_PATTERN = /\((Source|Assumption|Estimate|Based on|Per|According to|Ref|Citation):\s*[^)]+\)/gi;

// Matches numeric claims - numbers with units or percentages that should be sourced
const NUMERIC_CLAIM_PATTERN = /\$[\d,.]+[BMK]?|\d+(\.\d+)?%|\d+[BMK]\+?|\d{1,3}(,\d{3})+/g;

// Matches common unverified markers
const UNVERIFIED_PATTERN = /\[UNVERIFIED\]|\[TBD\]|\[TODO\]|\[NEEDS VERIFICATION\]|\[PENDING\]/gi;

// ─── Validation Functions ────────────────────────────────────────────────────

/**
 * Validate that no placeholder tokens remain in content
 */
export function validateNoPlaceholderTokens(content: string): ValidationResult {
  const errors: ValidationError[] = [];
  const warnings: ValidationWarning[] = [];
  let placeholdersFound = 0;

  // Find all placeholder matches
  const matches = content.match(PLACEHOLDER_PATTERN) || [];
  placeholdersFound = matches.length;

  // Create unique set of placeholders
  const uniquePlaceholders = [...new Set(matches)];

  for (const placeholder of uniquePlaceholders) {
    const count = matches.filter(m => m === placeholder).length;
    errors.push({
      type: 'placeholder',
      message: `Placeholder token "${placeholder}" found ${count} time(s) - must be replaced with actual data`,
      location: placeholder,
      severity: 'error',
    });
  }

  // Also check for unverified markers as warnings
  const unverifiedMatches = content.match(UNVERIFIED_PATTERN) || [];
  for (const marker of [...new Set(unverifiedMatches)]) {
    warnings.push({
      type: 'assumption_needs_verification',
      message: `Unverified marker "${marker}" found - requires follow-up verification`,
      location: marker,
    });
  }

  return {
    passed: errors.length === 0,
    errors,
    warnings,
    stats: {
      placeholdersFound,
      sourcedClaims: 0,
      assumptionClaims: 0,
      sectionsPresent: 0,
      sectionsRequired: 0,
    },
  };
}

/**
 * Validate that numeric claims have source attribution
 */
export function validateSourceAttribution(content: string): ValidationResult {
  const errors: ValidationError[] = [];
  const warnings: ValidationWarning[] = [];

  // Find all source attributions
  const sourceMatches = content.match(SOURCE_PATTERN) || [];
  const sourcedClaims = sourceMatches.length;

  // Count assumption-based claims
  const assumptionClaims = sourceMatches.filter(s =>
    s.toLowerCase().includes('assumption') || s.toLowerCase().includes('estimate')
  ).length;

  // Find numeric claims
  const numericMatches = content.match(NUMERIC_CLAIM_PATTERN) || [];

  // Check if there's a reasonable ratio of sources to numeric claims
  // A rough heuristic: at least 30% of major numeric claims should have attribution nearby
  if (numericMatches.length > 5 && sourcedClaims < numericMatches.length * 0.3) {
    warnings.push({
      type: 'low_confidence',
      message: `Found ${numericMatches.length} numeric claims but only ${sourcedClaims} source attributions. Consider adding more source references.`,
    });
  }

  // Check for specific high-value claims that should always be sourced
  const highValuePatterns = [
    { pattern: /TAM[:\s]+\$[\d,.]+[BMK]/gi, name: 'TAM estimate' },
    { pattern: /SAM[:\s]+\$[\d,.]+[BMK]/gi, name: 'SAM estimate' },
    { pattern: /SOM[:\s]+\$[\d,.]+[BMK]/gi, name: 'SOM estimate' },
    { pattern: /CAGR[:\s]+[\d.]+%/gi, name: 'CAGR estimate' },
    { pattern: /market size[:\s]+\$[\d,.]+[BMK]/gi, name: 'market size' },
    { pattern: /funding[:\s]+\$[\d,.]+[BMK]/gi, name: 'funding data' },
    { pattern: /revenue[:\s]+\$[\d,.]+[BMK]/gi, name: 'revenue data' },
  ];

  for (const { pattern, name } of highValuePatterns) {
    const matches = content.match(pattern) || [];
    for (const match of matches) {
      // Check if there's a source within 200 characters after the claim
      const matchIndex = content.indexOf(match);
      const contextAfter = content.substring(matchIndex, matchIndex + 300);
      const hasSource = SOURCE_PATTERN.test(contextAfter);

      if (!hasSource) {
        warnings.push({
          type: 'data_gap',
          message: `${name} claim "${match}" should have source attribution`,
          location: match,
        });
      }
    }
  }

  return {
    passed: true, // Source attribution is advisory, not blocking
    errors,
    warnings,
    stats: {
      placeholdersFound: 0,
      sourcedClaims,
      assumptionClaims,
      sectionsPresent: 0,
      sectionsRequired: 0,
    },
  };
}

/**
 * Validate that all required sections are present in content
 */
export function validateSectionCompleteness(
  content: string,
  requiredSections: string[]
): ValidationResult {
  const errors: ValidationError[] = [];
  const warnings: ValidationWarning[] = [];
  const presentSections: string[] = [];

  for (const section of requiredSections) {
    // Create flexible pattern to match section headings
    // Matches: "## Section Name", "### Section Name", "**Section Name**", "Section Name:"
    const patterns = [
      new RegExp(`##\\s*${escapeRegex(section)}`, 'i'),
      new RegExp(`\\*\\*${escapeRegex(section)}\\*\\*`, 'i'),
      new RegExp(`^${escapeRegex(section)}:`, 'mi'),
      new RegExp(`"${escapeRegex(section)}"\\s*:`, 'i'), // JSON key format
    ];

    const found = patterns.some(pattern => pattern.test(content));

    if (found) {
      presentSections.push(section);
    } else {
      errors.push({
        type: 'missing_section',
        message: `Required section "${section}" not found in output`,
        location: section,
        severity: 'error',
      });
    }
  }

  return {
    passed: errors.length === 0,
    errors,
    warnings,
    stats: {
      placeholdersFound: 0,
      sourcedClaims: 0,
      assumptionClaims: 0,
      sectionsPresent: presentSections.length,
      sectionsRequired: requiredSections.length,
    },
  };
}

/**
 * Combined validation with all checks
 */
export function validateOutput(
  content: string,
  options: ValidationOptions = {}
): ValidationResult {
  const {
    noPlaceholders = true,
    requireSources = true,
    requiredSections = [],
    strictMode = false,
  } = options;

  const allErrors: ValidationError[] = [];
  const allWarnings: ValidationWarning[] = [];
  let stats = {
    placeholdersFound: 0,
    sourcedClaims: 0,
    assumptionClaims: 0,
    sectionsPresent: 0,
    sectionsRequired: requiredSections.length,
  };

  // Run placeholder validation
  if (noPlaceholders) {
    const placeholderResult = validateNoPlaceholderTokens(content);
    allErrors.push(...placeholderResult.errors);
    allWarnings.push(...placeholderResult.warnings);
    stats.placeholdersFound = placeholderResult.stats.placeholdersFound;
  }

  // Run source attribution validation
  if (requireSources) {
    const sourceResult = validateSourceAttribution(content);
    allErrors.push(...sourceResult.errors);
    allWarnings.push(...sourceResult.warnings);
    stats.sourcedClaims = sourceResult.stats.sourcedClaims;
    stats.assumptionClaims = sourceResult.stats.assumptionClaims;
  }

  // Run section completeness validation
  if (requiredSections.length > 0) {
    const sectionResult = validateSectionCompleteness(content, requiredSections);
    allErrors.push(...sectionResult.errors);
    allWarnings.push(...sectionResult.warnings);
    stats.sectionsPresent = sectionResult.stats.sectionsPresent;
  }

  // In strict mode, warnings become errors
  if (strictMode) {
    for (const warning of allWarnings) {
      allErrors.push({
        type: 'invalid_format',
        message: warning.message,
        location: warning.location,
        severity: 'error',
      });
    }
    allWarnings.length = 0;
  }

  return {
    passed: allErrors.length === 0,
    errors: allErrors,
    warnings: allWarnings,
    stats,
  };
}

// ─── Helper Functions ────────────────────────────────────────────────────────

/**
 * Escape special regex characters
 */
function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Format validation result for logging
 */
export function formatValidationResult(result: ValidationResult): string {
  const lines: string[] = [];

  lines.push(`Validation ${result.passed ? 'PASSED' : 'FAILED'}`);
  lines.push(`Stats: ${result.stats.placeholdersFound} placeholders, ${result.stats.sourcedClaims} sources, ${result.stats.sectionsPresent}/${result.stats.sectionsRequired} sections`);

  if (result.errors.length > 0) {
    lines.push('\nErrors:');
    for (const error of result.errors) {
      lines.push(`  [${error.severity.toUpperCase()}] ${error.type}: ${error.message}`);
    }
  }

  if (result.warnings.length > 0) {
    lines.push('\nWarnings:');
    for (const warning of result.warnings) {
      lines.push(`  [WARN] ${warning.type}: ${warning.message}`);
    }
  }

  return lines.join('\n');
}

/**
 * Dev-mode validation gate - logs issues in development, optionally throws in strict mode
 */
export function validateInDevMode(
  content: string,
  toolName: string,
  requiredSections: string[],
  strictMode = false
): void {
  if (process.env.NODE_ENV !== 'development') {
    return; // Only validate in development
  }

  const result = validateOutput(content, {
    noPlaceholders: true,
    requireSources: true,
    requiredSections,
    strictMode,
  });

  if (!result.passed || result.warnings.length > 0) {
    console.log(`[${toolName} Validation] ${formatValidationResult(result)}`);
  }

  if (!result.passed && strictMode) {
    throw new Error(`[${toolName}] Validation failed: ${result.errors.map(e => e.message).join('; ')}`);
  }
}
