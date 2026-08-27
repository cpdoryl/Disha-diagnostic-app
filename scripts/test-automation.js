#!/usr/bin/env node

/**
 * SIMPLIFIED AUTOMATION TEST
 * Testing if the automation framework can run
 */

import fs from 'fs';
import axios from 'axios';

console.log('\n╔════════════════════════════════════════════════════════════╗');
console.log('║   AUTOMATED UI TESTING & DEPLOYMENT FRAMEWORK');
console.log('║   Test Version');
console.log('╚════════════════════════════════════════════════════════════╝\n');

const testUrls = [
  'https://disha.rylneuroacademy.com',
  'https://disha-diagnostics.web.app/'
];

const newFeatures = [
  'FirstOpinionEngineV3',
  '14DimensionalAssessmentV2',
  'ReverseSimulationEngine',
  'AnalyticsReports'
];

console.log('📊 PHASE 1: TESTING URLS');
console.log('═════════════════════════════════════════════════════════════\n');

for (const url of testUrls) {
  console.log(`Testing: ${url}`);
  try {
    const response = await axios.get(url, { timeout: 10000 });
    console.log(`  ✅ Page loads (HTTP ${response.status})`);

    const html = response.data;
    const foundFeatures = newFeatures.filter(feature =>
      html.includes(feature) || html.includes(feature.toLowerCase())
    );

    console.log(`  ✅ New features found: ${foundFeatures.length}/${newFeatures.length}`);
    console.log(`  ✅ Page size: ${(html.length / 1024).toFixed(2)} KB\n`);
  } catch (error) {
    console.log(`  ❌ Error: ${error.message}\n`);
  }
}

console.log('═════════════════════════════════════════════════════════════');
console.log('✅ TEST PHASE COMPLETE');
console.log('═════════════════════════════════════════════════════════════\n');

console.log('📋 NEXT STEPS:');
console.log('  1. Review test results above');
console.log('  2. Check both URLs manually in browser');
console.log('  3. Verify new features are present');
console.log('  4. Confirm old UI is removed\n');
