const fs = require('fs');
let code = fs.readFileSync('firestore.rules', 'utf8');

const insertionIndex = code.lastIndexOf('match /deep_dive_assessments/{docId} {');
const before = code.substring(0, insertionIndex);

const toAdd = `
    match /communications/{commId} {
      allow read, write: if true;
    }

    match /deep_dive_assessments/{docId} {
      allow read, write: if true;
    }

    match /{collectionName}/{docId} {
      allow read, write: if collectionName.matches('^surveys_.*');
    }
  }
}`;

fs.writeFileSync('firestore.rules', before + toAdd);
