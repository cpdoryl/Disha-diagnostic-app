/**
 * Generates a blank Excel template pre-formatted to the 14-dimension
 * objective metrics schema, so an admin can fill in one row of school data
 * offline and upload it back through ObjectiveDataUploadModal. Column
 * headers match each metric's label exactly, so the upload matcher
 * (objectiveMetricsHeaderMatcher.ts) picks every column up on re-upload.
 */
import * as XLSX from 'xlsx';
import { FOURTEEN_DIMENSIONS } from '../data/14DimensionsQuestions';
import { getDimensionMetricSchema } from '../data/objectiveMetricsSchema';

export function downloadObjectiveDataTemplate(): void {
  const headers: string[] = ['School Name', 'Data As Of'];
  const guideRows: (string | number)[][] = [
    ['Dimension', 'Column Header', 'Unit', 'Data Type', 'Required', 'Benchmark Target', 'Description'],
  ];

  for (const dim of FOURTEEN_DIMENSIONS) {
    const schema = getDimensionMetricSchema(dim.id);
    for (const def of schema?.metrics || []) {
      headers.push(def.label);
      guideRows.push([
        dim.name,
        def.label,
        def.unit,
        def.dataType,
        def.required ? 'Yes' : 'No',
        `${def.benchmark} ${def.unit}`,
        def.description || '',
      ]);
    }
  }

  const dataSheet = XLSX.utils.aoa_to_sheet([headers]);
  dataSheet['!cols'] = headers.map(() => ({ wch: 24 }));

  const guideSheet = XLSX.utils.aoa_to_sheet(guideRows);
  guideSheet['!cols'] = [{ wch: 28 }, { wch: 34 }, { wch: 16 }, { wch: 14 }, { wch: 10 }, { wch: 18 }, { wch: 55 }];

  const workbook = XLSX.utils.book_new();
  // "School Data" must stay the first sheet - fileParser.ts / parseExcelFile
  // only ever reads workbook.SheetNames[0].
  XLSX.utils.book_append_sheet(workbook, dataSheet, 'School Data');
  XLSX.utils.book_append_sheet(workbook, guideSheet, 'Field Guide');

  XLSX.writeFile(workbook, 'DISHA-Objective-Data-Template.xlsx');
}
