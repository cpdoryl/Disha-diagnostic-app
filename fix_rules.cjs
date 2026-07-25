const fs = require('fs');
let code = fs.readFileSync('firestore.rules', 'utf8');

code = code.replace(`    match /support_requests/{requestId} {
      allow create: if isValidId(requestId) && isValidSupportRequest(incoming());
      allow read, update, delete: if isAdmin();
    }
  }
}`, `    match /support_requests/{requestId} {
      allow create: if isValidId(requestId) && isValidSupportRequest(incoming());
      allow read, update, delete: if isAdmin();
    }
    
    match /deep_dive_assessments/{docId} {
      allow read, write: if true;
    }

    match /surveys_{aid}/{docId} {
      allow read, write: if true;
    }
  }
}`);

fs.writeFileSync('firestore.rules', code);
