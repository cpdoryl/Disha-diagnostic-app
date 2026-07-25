const fs = require('fs');
let code = fs.readFileSync('src/components/DeepDiveAssessment.tsx', 'utf8');

code = code.replace(
  "setSaveStatus('Success! Full 14-dimension scorecard has been compiled and saved persistently to Firestore. Digital Quiet Watch is updated.');\\\\n      setTimeout(() => setActiveTab('compare'), 1500);",
  "setSaveStatus('Success! Full 14-dimension scorecard has been compiled and saved persistently to Firestore. Digital Quiet Watch is updated.');\n      setTimeout(() => setActiveTab('compare'), 1500);"
);

fs.writeFileSync('src/components/DeepDiveAssessment.tsx', code);
