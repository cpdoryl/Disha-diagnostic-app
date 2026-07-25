const fs = require('fs');
let code = fs.readFileSync('firestore.rules', 'utf8');

const insertionIndex = code.lastIndexOf('}');
const before = code.substring(0, code.lastIndexOf('}', insertionIndex - 1));

const toAdd = `
    match /deep_dive_assessments/{docId} {
      allow read, write: if true;
    }

    match /surveys_{aid}/{docId} {
      allow read, write: if true;
    }
  }
}`;

fs.writeFileSync('firestore.rules', before + toAdd);
