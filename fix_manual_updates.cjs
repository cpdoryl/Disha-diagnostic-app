const fs = require('fs');
let code = fs.readFileSync('src/components/DeepDiveAssessment.tsx', 'utf8');

code = code.replace(`    setAnswers(newAnswers);
    
    // Update all dimensions
    dimensions.forEach(dim => {
      updateDimensionScore(dim.id, newAnswers);
    });
    
    markStakeholderAnswered(st);`, `    setAnswers(newAnswers);
    
    markStakeholderAnswered(st);`);

code = code.replace(`      setAnswers(newAnswers);
      // Update all dimensions
      dimensions.forEach(dim => {
        updateDimensionScore(dim.id, newAnswers);
      });
      setSimulateStakeholderLoading(null);`, `      setAnswers(newAnswers);
      setSimulateStakeholderLoading(null);`);

fs.writeFileSync('src/components/DeepDiveAssessment.tsx', code);
