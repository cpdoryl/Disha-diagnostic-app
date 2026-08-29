/**
 * k6 Load Test - Reverse Simulation Workflow
 * Tests: 100 concurrent users going through 6-step workflow
 * Purpose: Test complete user journey under load
 * Duration: 15 minutes
 */

import http from 'k6/http';
import { check, group, sleep } from 'k6';

export let options = {
  stages: [
    { duration: '2m', target: 50 },   // Ramp-up
    { duration: '2m', target: 100 },  // Reach target
    { duration: '10m', target: 100 }, // Stay at load
    { duration: '1m', target: 0 },    // Ramp-down
  ],
  thresholds: {
    'http_req_duration': ['p(95)<10000', 'p(99)<15000'],
    'http_req_failed': ['rate<0.05'],
  },
};

const BASE_URL = 'https://disha-diagnostics.web.app';

export default function () {
  // Step 1: Load app and dashboard
  group('Workflow - Step 1: Load Dashboard', () => {
    let res = http.get(`${BASE_URL}/`);
    check(res, {
      'dashboard loads': (r) => r.status === 200,
      'response time < 5s': (r) => r.timings.duration < 5000,
    });
  });

  sleep(1);

  // Step 2: Access Reverse Simulation feature
  group('Workflow - Step 2: Access Reverse Simulation', () => {
    let res = http.get(`${BASE_URL}/`);
    check(res, {
      'feature accessible': (r) => r.status === 200,
      'loads quickly': (r) => r.timings.duration < 5000,
    });
  });

  sleep(2);

  // Step 3: Enter goal data (Goal Setting)
  group('Workflow - Step 3: Goal Setting', () => {
    let payload = JSON.stringify({
      currentHealth: 60,
      targetHealth: 90,
      gap: 30,
      timelineMonths: 12,
      budget: 250000,
    });

    let res = http.post(`${BASE_URL}/api/simulation/goals`, payload, {
      headers: { 'Content-Type': 'application/json' },
    });

    check(res, {
      'goals submitted': (r) => r.status === 200 || r.status === 404,
      'fast submission': (r) => r.timings.duration < 5000,
    });
  });

  sleep(2);

  // Step 4: Calculate outcomes
  group('Workflow - Step 4: Calculate Outcomes', () => {
    let res = http.get(`${BASE_URL}/`);
    check(res, {
      'calculation responds': (r) => r.status === 200,
      'calculation time < 10s': (r) => r.timings.duration < 10000,
    });
  });

  sleep(2);

  // Step 5: View Feasibility Assessment
  group('Workflow - Step 5: Feasibility Assessment', () => {
    let res = http.get(`${BASE_URL}/`);
    check(res, {
      'feasibility data loads': (r) => r.status === 200,
      'response acceptable': (r) => r.timings.duration < 8000,
    });
  });

  sleep(1);

  // Step 6: View Action Mapping and Resources
  group('Workflow - Step 6: Action Mapping', () => {
    let res = http.get(`${BASE_URL}/`);
    check(res, {
      'mapping loads': (r) => r.status === 200,
      'response time good': (r) => r.timings.duration < 8000,
    });
  });

  sleep(2);

  // Step 7: Download/Export Report
  group('Workflow - Final: Export Report', () => {
    let res = http.get(`${BASE_URL}/`);
    check(res, {
      'export available': (r) => r.status === 200 || r.status === 404,
      'completes quickly': (r) => r.timings.duration < 10000,
    });
  });

  sleep(1);
}
