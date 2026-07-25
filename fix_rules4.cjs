const fs = require('fs');
let code = fs.readFileSync('firestore.rules', 'utf8');

const regex = /match \/communications\/\{commId\} \{[\s\S]*?allow delete: if isApproved\(\) && isValidId\(commId\);\s*\}/;
code = code.replace(regex, '');

fs.writeFileSync('firestore.rules', code);
