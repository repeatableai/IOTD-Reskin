import { useState, useCallback, useMemo } from 'react';
import {
  runFullRevaluation,
  RevaluationInputs,
  RevaluationResults,
  Scenario,
  AdoptionStatus,
  ThreatLevel,
  FundingStage,
  MoatFactors,
} from '@/utils/module3/damodaranFramework';

export interface UseRevaluationEngineState {
  // Form inputs
  companyName: string;
  industry: string;
  fundingStage: FundingStage;
  currentValuation: number;
  annualRevenue: number;
  ebitdaMargin: number;
  revenueMultiple: number;
  headcount: number;
  adoptionStatus: AdoptionStatus;
  competitorThreatLevel: ThreatLevel;
  moats: MoatFactors;

  // UI state
  isLoading: boolean;
  hasResults: boolean;
  activeScenario: Scenario;
  results: RevaluationResults | null;
}

export interface UseRevaluationEngineActions {
  setCompanyName: (value: string) => void;
  setIndustry: (value: string) => void;
  setFundingStage: (value: FundingStage) => void;
  setCurrentValuation: (value: number) => void;
  setAnnualRevenue: (value: number) => void;
  setEbitdaMargin: (value: number) => void;
  setRevenueMultiple: (value: number) => void;
  setHeadcount: (value: number) => void;
  setAdoptionStatus: (value: AdoptionStatus) => void;
  setCompetitorThreatLevel: (value: ThreatLevel) => void;
  setMoat: (key: keyof MoatFactors, value: boolean) => void;
  setActiveScenario: (scenario: Scenario) => void;
  runAnalysis: () => Promise<void>;
  loadDemoData: () => void;
  reset: () => void;
}

const initialMoats: MoatFactors = {
  proprietaryData: false,
  networkEffects: false,
  regulatoryAdvantage: false,
  brandLoyalty: false,
  switchingCosts: false,
};

const initialState: UseRevaluationEngineState = {
  companyName: '',
  industry: 'saas',
  fundingStage: 'series_a',
  currentValuation: 0,
  annualRevenue: 0,
  ebitdaMargin: 0,
  revenueMultiple: 0,
  headcount: 0,
  adoptionStatus: 'none',
  competitorThreatLevel: 'medium',
  moats: initialMoats,
  isLoading: false,
  hasResults: false,
  activeScenario: 'base',
  results: null,
};

export function useRevaluationEngine(): UseRevaluationEngineState & UseRevaluationEngineActions {
  const [state, setState] = useState<UseRevaluationEngineState>(initialState);

  // Individual setters
  const setCompanyName = useCallback((value: string) => {
    setState((prev) => ({ ...prev, companyName: value }));
  }, []);

  const setIndustry = useCallback((value: string) => {
    setState((prev) => ({ ...prev, industry: value }));
  }, []);

  const setFundingStage = useCallback((value: FundingStage) => {
    setState((prev) => ({ ...prev, fundingStage: value }));
  }, []);

  const setCurrentValuation = useCallback((value: number) => {
    setState((prev) => ({ ...prev, currentValuation: value }));
  }, []);

  const setAnnualRevenue = useCallback((value: number) => {
    setState((prev) => ({ ...prev, annualRevenue: value }));
  }, []);

  const setEbitdaMargin = useCallback((value: number) => {
    setState((prev) => ({ ...prev, ebitdaMargin: value }));
  }, []);

  const setRevenueMultiple = useCallback((value: number) => {
    setState((prev) => ({ ...prev, revenueMultiple: value }));
  }, []);

  const setHeadcount = useCallback((value: number) => {
    setState((prev) => ({ ...prev, headcount: value }));
  }, []);

  const setAdoptionStatus = useCallback((value: AdoptionStatus) => {
    setState((prev) => ({ ...prev, adoptionStatus: value }));
  }, []);

  const setCompetitorThreatLevel = useCallback((value: ThreatLevel) => {
    setState((prev) => ({ ...prev, competitorThreatLevel: value }));
  }, []);

  const setMoat = useCallback((key: keyof MoatFactors, value: boolean) => {
    setState((prev) => ({
      ...prev,
      moats: { ...prev.moats, [key]: value },
    }));
  }, []);

  const setActiveScenario = useCallback((scenario: Scenario) => {
    setState((prev) => ({ ...prev, activeScenario: scenario }));
  }, []);

  const runAnalysis = useCallback(async () => {
    setState((prev) => ({ ...prev, isLoading: true }));

    // Simulate async processing
    await new Promise((resolve) => setTimeout(resolve, 1500));

    const inputs: RevaluationInputs = {
      companyName: state.companyName,
      industry: state.industry,
      fundingStage: state.fundingStage,
      currentValuation: state.currentValuation,
      annualRevenue: state.annualRevenue,
      ebitdaMargin: state.ebitdaMargin,
      revenueMultiple: state.revenueMultiple,
      headcount: state.headcount,
      adoptionStatus: state.adoptionStatus,
      competitorThreatLevel: state.competitorThreatLevel,
      moats: state.moats,
    };

    const results = runFullRevaluation(inputs);

    setState((prev) => ({
      ...prev,
      isLoading: false,
      hasResults: true,
      results,
    }));
  }, [state]);

  const loadDemoData = useCallback(() => {
    setState((prev) => ({
      ...prev,
      companyName: 'OperationsIQ',
      industry: 'saas',
      fundingStage: 'series_b',
      currentValuation: 42000000,
      annualRevenue: 5200000,
      ebitdaMargin: 0.12,
      revenueMultiple: 8.1,
      headcount: 85,
      adoptionStatus: 'early',
      competitorThreatLevel: 'high',
      moats: {
        proprietaryData: true,
        networkEffects: false,
        regulatoryAdvantage: false,
        brandLoyalty: true,
        switchingCosts: true,
      },
    }));
  }, []);

  const reset = useCallback(() => {
    setState(initialState);
  }, []);

  return {
    ...state,
    setCompanyName,
    setIndustry,
    setFundingStage,
    setCurrentValuation,
    setAnnualRevenue,
    setEbitdaMargin,
    setRevenueMultiple,
    setHeadcount,
    setAdoptionStatus,
    setCompetitorThreatLevel,
    setMoat,
    setActiveScenario,
    runAnalysis,
    loadDemoData,
    reset,
  };
}

export default useRevaluationEngine;
