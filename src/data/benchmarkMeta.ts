/**
 * Shared shape for disclosing where a benchmark dataset comes from and how
 * current it is - surfaced in the report so schools know what they're being
 * compared against, rather than trusting an unexplained number.
 */
export interface BenchmarkDatasetMeta {
  version: string;
  methodology: string;
  lastUpdated: string;
}
