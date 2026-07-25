const fs = require('fs');
let code = fs.readFileSync('src/pages/LandingPage.tsx', 'utf8');

const oldSubmit = `    try {
      await addDoc(collection(db, 'contact_requests'), {
        ...contactData,
        createdAt: serverTimestamp(),
      });
      setContactStatus('success');`;

const newSubmit = `    try {
      await addDoc(collection(db, 'contact_requests'), {
        ...contactData,
        createdAt: serverTimestamp(),
      });
      
      // Also send to backend to trigger email notification
      await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(contactData),
      });

      setContactStatus('success');`;

code = code.replace(oldSubmit, newSubmit);
fs.writeFileSync('src/pages/LandingPage.tsx', code);
console.log("Patched contact submit");
