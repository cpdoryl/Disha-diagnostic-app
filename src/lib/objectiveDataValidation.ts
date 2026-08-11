/**
 * Type/range/required validation for objective metric values, shared by
 * both the manual-entry form and the file-upload review table so both
 * paths enforce identical rules before anything is saved.
 */
import { ObjectiveMetricDefinition, getDimensionMetricSchema } from '../data/objectiveMetricsSchema';

export interface FieldValidationResult {
  valid: boolean;
  error?: string;
  parsedValue?: number;
}

/**
 * Coerces a raw entry-field value (string from an input, or a cell from a
 * parsed spreadsheet) into a number and validates it against the metric's
 * data type / required / range rules. Treats 0 as a legitimate value, not
 * "missing".
 */
export function validateMetricValue(definition: ObjectiveMetricDefinition, rawValue: unknown): FieldValidationResult {
  const isEmpty = rawValue === undefined || rawValue === null || (typeof rawValue === 'string' && rawValue.trim() === '');

  if (isEmpty) {
    if (definition.required) {
      return { valid: false, error: `${definition.label} is required` };
    }
    return { valid: true };
  }

  let numericValue: number;
  if (typeof rawValue === 'number') {
    numericValue = rawValue;
  } else {
    const cleaned = String(rawValue).replace(/[%₹,\s]/g, '');
    numericValue = parseFloat(cleaned);
  }

  if (Number.isNaN(numericValue)) {
    return { valid: false, error: `${definition.label} must be a number` };
  }

  if (numericValue < definition.min || numericValue > definition.max) {
    return {
      valid: false,
      error: `${definition.label} must be between ${definition.min} and ${definition.max} ${definition.unit}`,
    };
  }

  return { valid: true, parsedValue: numericValue };
}

export interface DimensionValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
  parsedValues: Record<string, number>;
}

export function validateDimensionMetrics(
  dimensionId: string,
  rawValues: Record<string, unknown>
): DimensionValidationResult {
  const schema = getDimensionMetricSchema(dimensionId);
  const errors: Record<string, string> = {};
  const parsedValues: Record<string, number> = {};

  for (const def of schema?.metrics || []) {
    const result = validateMetricValue(def, rawValues[def.id]);
    if (!result.valid) {
      errors[def.id] = result.error || `${def.label} is invalid`;
    } else if (result.parsedValue !== undefined) {
      parsedValues[def.id] = result.parsedValue;
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
    parsedValues,
  };
}

export function validateAllDimensions(
  rawByDimension: Record<string, Record<string, unknown>>
): Record<string, DimensionValidationResult> {
  const results: Record<string, DimensionValidationResult> = {};
  for (const [dimensionId, rawValues] of Object.entries(rawByDimension)) {
    results[dimensionId] = validateDimensionMetrics(dimensionId, rawValues);
  }
  return results;
}
