/**
 * Contact Filter and Deduplication
 * Applies hard exclusion rules and deduplicates contacts
 */

import type { RawContact } from '@shared/scrapingTypes';
import { DECISION_MAKER_TITLES } from '@shared/scrapingTypes';

/**
 * Validate E.164 phone format
 */
function isValidE164(phone: string): boolean {
  if (!phone) return false;
  const cleaned = phone.replace(/[\s.-]/g, '');
  return /^\+[1-9]\d{6,14}$/.test(cleaned);
}

/**
 * Validate RFC 5322 email format
 */
function isValidEmail(email: string): boolean {
  if (!email) return false;
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailRegex.test(email);
}

/**
 * Check if LinkedIn URL is valid
 */
function isValidLinkedInUrl(url: string): boolean {
  if (!url) return false;
  return url.toLowerCase().startsWith('https://linkedin.com/in/') ||
         url.toLowerCase().startsWith('https://www.linkedin.com/in/') ||
         url.toLowerCase().startsWith('linkedin.com/in/');
}

/**
 * Check if title contains decision maker keywords
 */
function isDecisionMakerTitle(title: string): boolean {
  if (!title) return false;

  const normalizedTitle = title.toUpperCase();

  return DECISION_MAKER_TITLES.some(dmTitle =>
    normalizedTitle.includes(dmTitle.toUpperCase())
  );
}

/**
 * Hard exclusion filter
 * Returns true if contact meets MINIMUM data requirements
 *
 * EXCLUDE if ANY of these are missing or invalid:
 * - full_name (not null, not empty)
 * - title (must contain decision maker keywords)
 * - company_name
 * - linkedin_url (valid format)
 * - business_phone (E.164 format) OR email (RFC 5322 OR constructed with confidence >= 60)
 */
export function meetsMinimumDataRequirements(contact: RawContact): boolean {
  // Must have full name
  if (!contact.full_name || contact.full_name.trim().length === 0) {
    return false;
  }

  // Must have decision maker title
  if (!contact.title || !isDecisionMakerTitle(contact.title)) {
    return false;
  }

  // Must have company name
  if (!contact.company_name || contact.company_name.trim().length === 0) {
    return false;
  }

  // Must have valid LinkedIn URL
  if (!contact.linkedin_url || !isValidLinkedInUrl(contact.linkedin_url)) {
    return false;
  }

  // Must have either valid phone OR valid email
  const hasValidPhone = contact.business_phone && isValidE164(contact.business_phone);
  const hasValidEmail = contact.email && (
    isValidEmail(contact.email) ||
    (contact.email_confidence && contact.email_confidence >= 60)
  );

  if (!hasValidPhone && !hasValidEmail) {
    return false;
  }

  return true;
}

/**
 * Calculate data quality score (0-100)
 *
 * Scoring breakdown:
 * - full_name present: +15
 * - title + seniority confirmed: +20
 * - company_name: +10
 * - linkedin_url valid: +15
 * - business_phone verified: +15
 * - email verified: +15
 * - cell_phone present: +10
 */
export function calculateDataQualityScore(contact: RawContact): number {
  let score = 0;

  // Full name: +15
  if (contact.full_name && contact.full_name.trim().length > 0) {
    score += 15;
  }

  // Title + seniority: +20
  if (contact.title && isDecisionMakerTitle(contact.title)) {
    score += 20;
  }

  // Company name: +10
  if (contact.company_name && contact.company_name.trim().length > 0) {
    score += 10;
  }

  // LinkedIn URL: +15
  if (contact.linkedin_url && isValidLinkedInUrl(contact.linkedin_url)) {
    score += 15;
  }

  // Business phone verified: +15
  if (contact.business_phone && isValidE164(contact.business_phone)) {
    score += 15;
  }

  // Email verified: +15
  if (contact.email) {
    if (isValidEmail(contact.email)) {
      if (contact.email_confidence && contact.email_confidence >= 80) {
        score += 15;
      } else if (contact.email_confidence && contact.email_confidence >= 60) {
        score += 10;
      } else {
        score += 8;
      }
    }
  }

  // Cell phone present: +10
  if (contact.cell_phone && isValidE164(contact.cell_phone)) {
    score += 10;
  }

  return Math.min(100, score);
}

/**
 * Normalize LinkedIn URL for comparison
 */
function normalizeLinkedInUrl(url: string): string {
  if (!url) return '';

  return url
    .toLowerCase()
    .replace(/^https?:\/\//, '')
    .replace(/^www\./, '')
    .replace(/\/$/, '')
    .replace(/\?.*$/, '');
}

/**
 * Merge two contacts, keeping the most complete data
 */
function mergeContacts(a: RawContact, b: RawContact): RawContact {
  const merged: RawContact = {
    full_name: a.full_name || b.full_name,
    first_name: a.first_name || b.first_name,
    last_name: a.last_name || b.last_name,
    title: a.title || b.title,
    company_name: a.company_name || b.company_name,
    linkedin_url: a.linkedin_url || b.linkedin_url,
    email: a.email || b.email,
    email_confidence: Math.max(a.email_confidence || 0, b.email_confidence || 0) || undefined,
    business_phone: a.business_phone || b.business_phone,
    cell_phone: a.cell_phone || b.cell_phone,
    location: a.location || b.location,
    data_quality_score: 0, // Will be recalculated
    source: {
      method: 'merged',
      confidence: Math.max(a.source.confidence, b.source.confidence),
      scraped_at: new Date(),
      urls: [...(a.source.urls || []), ...(b.source.urls || [])].filter((v, i, arr) => arr.indexOf(v) === i),
    },
    raw_data: {
      ...a.raw_data,
      ...b.raw_data,
      merged_from: [a.source.method, b.source.method],
    },
  };

  // Prefer higher confidence email
  if (a.email && b.email) {
    if ((b.email_confidence || 0) > (a.email_confidence || 0)) {
      merged.email = b.email;
      merged.email_confidence = b.email_confidence;
    }
  }

  // Recalculate quality score
  merged.data_quality_score = calculateDataQualityScore(merged);

  return merged;
}

/**
 * Deduplicate contacts
 *
 * Deduplication keys (in priority order):
 * 1. Primary key: email (if verified)
 * 2. Secondary key: linkedin_url
 *
 * When same person found by multiple scrapers: merge to most complete record
 */
export function deduplicate(contacts: RawContact[]): RawContact[] {
  const byEmail = new Map<string, RawContact>();
  const byLinkedIn = new Map<string, RawContact>();
  const result: RawContact[] = [];

  for (const contact of contacts) {
    let merged = contact;
    let existingKey: string | null = null;
    let existingMap: Map<string, RawContact> | null = null;

    // Check email key first
    if (contact.email && isValidEmail(contact.email)) {
      const emailKey = contact.email.toLowerCase();
      if (byEmail.has(emailKey)) {
        merged = mergeContacts(byEmail.get(emailKey)!, contact);
        existingKey = emailKey;
        existingMap = byEmail;
      } else {
        byEmail.set(emailKey, contact);
      }
    }

    // Check LinkedIn key
    if (contact.linkedin_url && isValidLinkedInUrl(contact.linkedin_url)) {
      const linkedInKey = normalizeLinkedInUrl(contact.linkedin_url);
      if (byLinkedIn.has(linkedInKey)) {
        const existing = byLinkedIn.get(linkedInKey)!;
        merged = mergeContacts(existing, merged);
        existingKey = linkedInKey;
        existingMap = byLinkedIn;
      } else {
        byLinkedIn.set(linkedInKey, merged);
      }
    }

    // Update maps with merged contact
    if (merged.email && isValidEmail(merged.email)) {
      byEmail.set(merged.email.toLowerCase(), merged);
    }
    if (merged.linkedin_url && isValidLinkedInUrl(merged.linkedin_url)) {
      byLinkedIn.set(normalizeLinkedInUrl(merged.linkedin_url), merged);
    }
  }

  // Collect unique contacts (prefer by email, then by LinkedIn)
  const seen = new Set<string>();

  // First pass: contacts with email
  Array.from(byEmail.entries()).forEach(([email, contact]) => {
    const key = contact.linkedin_url
      ? normalizeLinkedInUrl(contact.linkedin_url)
      : email;

    if (!seen.has(key)) {
      seen.add(key);
      if (contact.linkedin_url) {
        seen.add(normalizeLinkedInUrl(contact.linkedin_url));
      }
      result.push(contact);
    }
  });

  // Second pass: contacts with LinkedIn but no email match
  Array.from(byLinkedIn.entries()).forEach(([linkedIn, contact]) => {
    if (!seen.has(linkedIn)) {
      seen.add(linkedIn);
      result.push(contact);
    }
  });

  return result;
}

/**
 * Full filter pipeline
 * 1. Calculate quality scores
 * 2. Apply hard exclusion rules
 * 3. Deduplicate
 * 4. Sort by quality score
 */
export function filterAndDeduplicate(contacts: RawContact[]): {
  filtered: RawContact[];
  excluded: number;
  byReason: Record<string, number>;
} {
  const byReason: Record<string, number> = {
    missing_name: 0,
    missing_title: 0,
    missing_company: 0,
    missing_linkedin: 0,
    missing_contact_info: 0,
  };

  // First pass: calculate quality scores and track exclusion reasons
  const withScores = contacts.map(contact => ({
    ...contact,
    data_quality_score: calculateDataQualityScore(contact),
  }));

  // Apply hard exclusion with reason tracking
  const passing: RawContact[] = [];

  for (const contact of withScores) {
    if (!contact.full_name || contact.full_name.trim().length === 0) {
      byReason.missing_name++;
      continue;
    }
    if (!contact.title || !isDecisionMakerTitle(contact.title)) {
      byReason.missing_title++;
      continue;
    }
    if (!contact.company_name || contact.company_name.trim().length === 0) {
      byReason.missing_company++;
      continue;
    }
    if (!contact.linkedin_url || !isValidLinkedInUrl(contact.linkedin_url)) {
      byReason.missing_linkedin++;
      continue;
    }

    const hasValidPhone = contact.business_phone && isValidE164(contact.business_phone);
    const hasValidEmail = contact.email && (
      isValidEmail(contact.email) ||
      (contact.email_confidence && contact.email_confidence >= 60)
    );

    if (!hasValidPhone && !hasValidEmail) {
      byReason.missing_contact_info++;
      continue;
    }

    passing.push(contact);
  }

  // Deduplicate passing contacts
  const deduped = deduplicate(passing);

  // Sort by quality score descending
  deduped.sort((a, b) => b.data_quality_score - a.data_quality_score);

  const excluded = contacts.length - deduped.length;

  return {
    filtered: deduped,
    excluded,
    byReason,
  };
}

export default filterAndDeduplicate;
