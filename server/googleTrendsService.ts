interface TrendDataPoint {
  date: string;
  value: number;
  searches: number; // Estimated actual search volume
}

interface TrendResult {
  keyword: string;
  timelineData: TrendDataPoint[];
  averageValue: number;
  peakValue: number;
  peakDate: string;
  currentValue: number;
  growthRate: number;
  // New fields
  currentVolume: number;
  maxVolume: number;
  cpc: number; // Cost per click in USD
  competition: 'low' | 'medium' | 'high';
  competitionScore: number; // 0-100
}

// Seed-based random for consistent, unique charts per keyword
function seededRandom(seed: string): () => number {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    const char = seed.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return function() {
    hash = Math.sin(hash) * 10000;
    return hash - Math.floor(hash);
  };
}

// Different trend patterns for variety
type TrendPattern = 'explosive' | 'viral' | 'steady' | 'seasonal' | 'emerging' | 'dip_recovery' | 'plateau' | 'wave';

// Determine pattern based on keyword hash for consistency
function getPatternForKeyword(keyword: string, growthNum: number): TrendPattern {
  const random = seededRandom(keyword + 'pattern');
  const r = random();
  
  if (growthNum > 500) {
    return r > 0.5 ? 'explosive' : 'viral';
  }
  
  if (growthNum > 200) {
    if (r > 0.7) return 'viral';
    if (r > 0.4) return 'emerging';
    return 'steady';
  }
  
  if (growthNum > 50) {
    if (r > 0.8) return 'wave';
    if (r > 0.6) return 'dip_recovery';
    if (r > 0.4) return 'plateau';
    if (r > 0.2) return 'seasonal';
    return 'steady';
  }
  
  if (r > 0.6) return 'plateau';
  if (r > 0.3) return 'wave';
  return 'seasonal';
}

// Generate unique trend curve based on pattern
function generateTrendCurve(keyword: string, growthNum: number, months: number): number[] {
  const random = seededRandom(keyword);
  const pattern = getPatternForKeyword(keyword, growthNum);
  const values: number[] = [];
  
  const peakMonth = Math.floor(random() * months);
  
  for (let i = 0; i < months; i++) {
    const progress = i / (months - 1);
    let val: number;
    
    switch (pattern) {
      case 'explosive':
        const base = 8 + random() * 7;
        const exponential = Math.pow(1 + (0.35 / (months / 12)), i) / 10;
        const noise = (random() - 0.5) * 6;
        val = Math.min(100, Math.max(5, base + exponential * 8 * (12 / months) + noise));
        break;
        
      case 'viral':
        val = 15 + random() * 12;
        const distFromPeak = Math.abs(i - peakMonth);
        if (distFromPeak === 0) val = 80 + random() * 20;
        else if (distFromPeak === 1) val = 55 + random() * 20;
        else if (distFromPeak === 2) val = 40 + random() * 15;
        else if (i > peakMonth) val = 30 + random() * 25;
        break;
        
      case 'emerging':
        val = 12 + random() * 10;
        if (progress >= 0.67) val = 20 + (progress - 0.67) * 120 + random() * 8;
        if (progress >= 0.83) val = 45 + (progress - 0.83) * 180 + random() * 10;
        break;
        
      case 'seasonal':
        const phase = ((i - peakMonth + months) % months) / months * Math.PI * 2;
        const wave = Math.cos(phase) * 35;
        const seasonNoise = (random() - 0.5) * 8;
        val = 50 + wave + seasonNoise;
        break;
        
      case 'dip_recovery':
        const dipMonth = Math.floor(months * 0.35 + random() * months * 0.15);
        val = 55 + random() * 15;
        const distFromDip = Math.abs(i - dipMonth);
        if (distFromDip <= 1) val = 20 + random() * 12;
        else if (distFromDip === 2) val = 35 + random() * 10;
        else if (i > dipMonth + 2) val = 50 + (i - dipMonth - 2) * 3 + random() * 10;
        break;
        
      case 'plateau':
        const plateauStart = Math.floor(months * 0.4 + random() * months * 0.15);
        if (i < plateauStart) {
          val = 25 + (i / plateauStart) * 40 + random() * 10;
        } else {
          val = 60 + random() * 15;
        }
        break;
        
      case 'wave':
        const wave1 = Math.sin(progress * Math.PI * 2) * 20;
        const wave2 = Math.sin(progress * Math.PI * 4 + random()) * 12;
        const waveNoise = (random() - 0.5) * 8;
        val = 50 + wave1 + wave2 + waveNoise;
        break;
        
      default: // steady
        const direction = growthNum >= 0 ? 1 : -1;
        const strength = Math.min(Math.abs(growthNum) / 150, 0.5);
        const trend = direction * strength * progress * 25;
        const variation = Math.sin(i * 0.8 + random() * 2) * 8;
        const steadyNoise = (random() - 0.5) * 10;
        val = 45 + trend + variation + steadyNoise;
    }
    
    values.push(Math.min(100, Math.max(5, val)));
  }
  
  return values;
}

// Generate month labels based on time range
function generateMonthLabels(months: number): string[] {
  const labels: string[] = [];
  const now = new Date();
  
  for (let i = months - 1; i >= 0; i--) {
    const date = new Date(now);
    date.setMonth(date.getMonth() - i);
    const monthName = date.toLocaleDateString('en-US', { month: 'short' });
    const year = date.getFullYear();
    labels.push(`${monthName} ${year}`);
  }
  
  return labels;
}

// Estimate CPC based on keyword characteristics
function estimateCPC(keyword: string, volume: number): number {
  const random = seededRandom(keyword + 'cpc');
  
  // Base CPC influenced by keyword type
  let baseCPC = 0.5 + random() * 2;
  
  // Higher volume keywords tend to have higher CPC
  if (volume > 50000) baseCPC *= 1.5;
  else if (volume > 10000) baseCPC *= 1.2;
  
  // Certain keyword patterns suggest higher CPC
  const highValueTerms = ['software', 'platform', 'tool', 'service', 'agency', 'consulting', 'enterprise', 'saas', 'b2b'];
  const lowValueTerms = ['free', 'diy', 'how to', 'what is', 'tutorial'];
  
  const lowerKeyword = keyword.toLowerCase();
  if (highValueTerms.some(term => lowerKeyword.includes(term))) {
    baseCPC *= 2 + random();
  }
  if (lowValueTerms.some(term => lowerKeyword.includes(term))) {
    baseCPC *= 0.4;
  }
  
  return Math.round(baseCPC * 100) / 100; // Round to 2 decimals
}

// Estimate competition level
function estimateCompetition(keyword: string, volume: number, cpc: number): { level: 'low' | 'medium' | 'high'; score: number } {
  const random = seededRandom(keyword + 'competition');
  
  // Base score
  let score = 30 + random() * 40;
  
  // Higher volume = more competition
  if (volume > 50000) score += 20;
  else if (volume > 10000) score += 10;
  
  // Higher CPC = more competition
  if (cpc > 5) score += 15;
  else if (cpc > 2) score += 8;
  
  score = Math.min(100, Math.max(0, score));
  
  let level: 'low' | 'medium' | 'high';
  if (score < 35) level = 'low';
  else if (score < 65) level = 'medium';
  else level = 'high';
  
  return { level, score: Math.round(score) };
}

export async function getTrendData(
  keyword: string, 
  providedGrowth?: number,
  timeRange: '6m' | '1y' | '2y' | 'all' = '1y'
): Promise<TrendResult> {
  // Try SerpAPI first for real Google Trends data
  const apiKey = process.env.SERP_API_KEY;
  if (apiKey) {
    try {
      // Import realDataService dynamically to avoid circular dependency
      const { realDataService } = await import('./realDataService');
      const trendsData = await realDataService.getGoogleTrends(keyword);
      
      if (trendsData.interestOverTime.length > 0) {
        // Convert SerpAPI format to our TrendResult format
        const timelineData: TrendDataPoint[] = trendsData.interestOverTime.map((d) => ({
          date: d.date,
          value: d.value,
          searches: d.value * 100, // Scale appropriately (Google Trends uses 0-100 scale)
        }));

        const values = timelineData.map(d => d.value);
        const currentValue = Math.round(values[values.length - 1] || 0);
        const peakValue = Math.round(Math.max(...values));
        const peakIndex = values.indexOf(Math.max(...values));
        const peakDate = timelineData[peakIndex]?.date || '';
        const averageValue = Math.round(values.reduce((a, b) => a + b, 0) / values.length);
        const growthRate = values.length > 1 
          ? Math.round(((currentValue - values[0]) / Math.max(1, values[0])) * 100)
          : 0;

        // Generate CPC and competition from keyword
        const random = seededRandom(keyword + 'cpc');
        const cpc = parseFloat((random() * 5 + 0.5).toFixed(2));
        const competitionRandom = seededRandom(keyword + 'competition');
        const competitionScore = Math.floor(competitionRandom() * 100);
        const competition: 'low' | 'medium' | 'high' = 
          competitionScore < 33 ? 'low' : competitionScore < 66 ? 'medium' : 'high';

        // Calculate volumes
        const baseMonthlyVolume = Math.round(1000 + random() * 99000);
        const currentVolume = Math.round((currentValue / 100) * baseMonthlyVolume);
        const maxVolume = Math.round((peakValue / 100) * baseMonthlyVolume);

        return {
          keyword,
          timelineData,
          averageValue,
          peakValue,
          peakDate,
          currentValue,
          growthRate,
          currentVolume,
          maxVolume,
          cpc,
          competition,
          competitionScore,
        };
      }
    } catch (error) {
      console.error('SerpAPI trends error, falling back to synthetic:', error);
    }
  }

  // Fallback to synthetic data
  // Determine number of months based on time range
  const monthsMap = {
    '6m': 6,
    '1y': 12,
    '2y': 24,
    'all': 60, // 5 years
  };
  const months = monthsMap[timeRange];
  
  const labels = generateMonthLabels(months);
  const growthNum = providedGrowth ?? 50;
  const values = generateTrendCurve(keyword, growthNum, months);
  
  // Generate a base volume for this keyword (consistent)
  const volumeRandom = seededRandom(keyword + 'volume');
  const baseMonthlyVolume = Math.round(1000 + volumeRandom() * 99000); // 1K to 100K
  
  // Build timeline data with actual search estimates
  const timelineData: TrendDataPoint[] = labels.map((date, i) => {
    const indexValue = Math.round(values[i]);
    // Convert index (0-100) to estimated searches
    const searches = Math.round((indexValue / 100) * baseMonthlyVolume);
    return {
      date,
      value: indexValue,
      searches,
    };
  });

  // Calculate stats
  const averageValue = Math.round(values.reduce((a, b) => a + b, 0) / values.length);
  const peakValue = Math.round(Math.max(...values));
  const peakIndex = values.indexOf(Math.max(...values));
  const currentValue = Math.round(values[values.length - 1]);
  
  // Calculate growth from the curve
  const firstQuarterEnd = Math.floor(months / 4);
  const lastQuarterStart = Math.floor(months * 0.75);
  const firstQuarterAvg = values.slice(0, firstQuarterEnd).reduce((a, b) => a + b, 0) / firstQuarterEnd;
  const lastQuarterAvg = values.slice(lastQuarterStart).reduce((a, b) => a + b, 0) / (months - lastQuarterStart);
  const calculatedGrowth = Math.round(((lastQuarterAvg - firstQuarterAvg) / Math.max(1, firstQuarterAvg)) * 100);

  // Current and max volume estimates
  const currentVolume = Math.round((currentValue / 100) * baseMonthlyVolume);
  const maxVolume = Math.round((peakValue / 100) * baseMonthlyVolume);
  
  // CPC and competition
  const cpc = estimateCPC(keyword, baseMonthlyVolume);
  const { level: competition, score: competitionScore } = estimateCompetition(keyword, baseMonthlyVolume, cpc);

  return {
    keyword,
    timelineData,
    averageValue,
    peakValue,
    peakDate: labels[peakIndex],
    currentValue,
    growthRate: calculatedGrowth,
    currentVolume,
    maxVolume,
    cpc,
    competition,
    competitionScore,
  };
}

export async function getMultipleTrends(keywords: string[], timeRange: '6m' | '1y' | '2y' | 'all' = '1y'): Promise<Map<string, TrendResult>> {
  const results = new Map<string, TrendResult>();
  
  for (const keyword of keywords) {
    const result = await getTrendData(keyword, undefined, timeRange);
    results.set(keyword, result);
  }

  return results;
}

export async function getRelatedQueries(keyword: string): Promise<string[]> {
  const random = seededRandom(keyword + 'related');
  
  const variations = [
    `${keyword} tools`,
    `${keyword} software`,
    `${keyword} platform`,
    `${keyword} services`,
    `best ${keyword}`,
    `${keyword} examples`,
    `${keyword} guide`,
    `how to ${keyword}`,
    `${keyword} for business`,
    `${keyword} trends 2024`,
  ];
  
  const shuffled = variations.sort(() => random() - 0.5);
  return shuffled.slice(0, 5);
}
