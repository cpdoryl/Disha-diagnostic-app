import React, { useState } from 'react';
import { X, Loader2 } from 'lucide-react';
import { getDimensionMetricSchema } from '../../data/objectiveMetricsSchema';
import { validateDimensionMetrics } from '../../lib/objectiveDataValidation';
import { saveDimensionObjectiveData } from '../../lib/objectiveDataService';
import { MetricInputField } from './MetricInputField';

interface ObjectiveDataEntryModalProps {
  dimensionId: string;
  dimensionName: string;
  eventId: string;
  schoolId: string;
  existingValues: Record<string, number>;
  onSaved: () => void;
  onClose: () => void;
}

export function ObjectiveDataEntryModal({
  dimensionId,
  dimensionName,
  eventId,
  schoolId,
  existingValues,
  onSaved,
  onClose,
}: ObjectiveDataEntryModalProps) {
  const schema = getDimensionMetricSchema(dimensionId);
  const [values, setValues] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {};
    for (const def of schema?.metrics || []) {
      if (existingValues[def.id] != null) initial[def.id] = String(existingValues[def.id]);
    }
    return initial;
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState('');

  const handleSave = async () => {
    const result = validateDimensionMetrics(dimensionId, values);
    if (!result.isValid) {
      setErrors(result.errors);
      return;
    }
    setErrors({});
    setIsSaving(true);
    setSaveError('');
    try {
      await saveDimensionObjectiveData(eventId, schoolId, dimensionId, result.parsedValues, { source: 'manual' });
      onSaved();
    } catch (err) {
      console.error('Failed to save objective data:', err);
      setSaveError('Could not save this data. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[85vh] overflow-y-auto">
        <div className="flex items-center justify-between p-5 border-b border-gray-100 sticky top-0 bg-white">
          <h3 className="text-lg font-bold text-gray-900">{dimensionName} — Operational Data</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-5 space-y-4">
          {(schema?.metrics || []).map((def) => (
            <MetricInputField
              key={def.id}
              definition={def}
              value={values[def.id] ?? ''}
              onChange={(val) => setValues((prev) => ({ ...prev, [def.id]: val }))}
              error={errors[def.id]}
            />
          ))}
          {saveError && <p className="text-sm text-red-600">{saveError}</p>}
        </div>
        <div className="flex items-center justify-end gap-3 p-5 border-t border-gray-100">
          <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900">
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition text-sm flex items-center gap-2 disabled:opacity-60"
          >
            {isSaving && <Loader2 className="w-4 h-4 animate-spin" />}
            Save Data
          </button>
        </div>
      </div>
    </div>
  );
}
