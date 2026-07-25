const fs = require('fs');
let code = fs.readFileSync('src/components/DeepDiveAssessment.tsx', 'utf8');

const effectBlock = `  useEffect(() => {
    INITIAL_14_DIMENSIONS.forEach(dim => {
      updateDimensionScore(dim.id, answers);
    });
  }, [answers, inputStudentTeacherRatio, inputParentResponseHours, inputRetrainingHours, inputPlanningHours, inputProjectUnits, uploadedDocs]);`;

code = code.replace(effectBlock, '');
code = code.replace(`// Check points manual entry state`, `// Check points manual entry state\n${effectBlock}`);

fs.writeFileSync('src/components/DeepDiveAssessment.tsx', code);
