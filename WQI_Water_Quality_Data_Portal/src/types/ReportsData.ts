export interface ReportsData {
  Concentrations: ReportsDataCounters;
  DailyLoad: ReportsDataCounters;
  AnnualLoad: ReportsDataCounters;
  // AnnualFlow: ReportsDataCounters;
  // AnnualConcentration: ReportsDataCounters;
  DailyPRM: ReportsDataCounters;
  AnnualPRM: ReportsDataCounters;
}

interface ReportsDataCounters {
  sites: number;
  results: number;
  id: string;
  label: string;
}
