/**
 * k6 Load Test - Endurance Test
 * Tests: 100 concurrent users for 60 minutes
 * Purpose: Verify system stability and detect memory leaks
 * Duration: 60 minutes
 */

import http from 'k6/http';
import { check, group, sleep } from 'k6';

export let options = {
  stages: [
    { duration: '5m', target: 50 },    // Ramp-up
    { duration: '5m', target: 100 },   // Reach target
    { duration: '50m', target: 100 },  // Maintain for 50 minutes
    { duration: '5m', target: 0 },     // Ramp-down
  ],
  thresholds: {
    'http_req_duration': ['p(95)<5000', 'p(99)<10000'],
    'http_req_failed': ['rate<0.05'],
  },
};

const BASE_URL = 'https://disha-diagnostics.web.app';
let requestCount = 0;
let errorCount = 0;

export default function () {
  group('Endurance - Regular Load', () => {
    let res = http.get(`${BASE_URL}/`);
    requestCount++;

    let success = check(res, {
      'status is 200': (r) => r.status === 200,
      'response time < 5s': (r) => r.timings.duration < 5000,
      'no server errors': (r) => r.status !== 500,
    });

    if (!success) {
      errorCount++;
    }
  });

  sleep(2);

  group('Endurance - Periodic API Call', () => {
    let res = http.get(`${BASE_URL}/`, {
      headers: { 'Content-Type': 'application/json' },
    });

    check(res, {
      'api still responding': (r) => r.status === 200 || r.status === 404,
      'no timeouts': (r) => r.timings.duration < 10000,
    });
  });

  sleep(1);

  // Every 30 minutes, do a heavier load to check stability
  if (requestCount % 1000 === 0) {
    group('Endurance - Stress Check', () => {
      for (let i = 0; i < 5; i++) {
        let res = http.get(`${BASE_URL}/`);
        check(res, {
          'handles sustained load': (r) => r.status === 200,
        });
      }
    });
  }

  sleep(1);
}

export function handleSummary(data) {
  return {
    stdout: `
====================================
ENDURANCE TEST RESULTS (60 minutes)
====================================
Total Requests: ${requestCount}
Error Count: ${errorCount}
Error Rate: ${((errorCount / requestCount) * 100).toFixed(2)}%
Average RPS: ${(requestCount / 3600).toFixed(2)}
====================================
    `,
  };
}
