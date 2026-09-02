/**
 * k6 Load Test - Spike Test
 * Tests: Sudden traffic spike (100 → 500 users in 30 seconds)
 * Purpose: Verify system handles sudden traffic increases
 * Duration: 5 minutes total
 */

import http from 'k6/http';
import { check, group, sleep } from 'k6';

export let options = {
  stages: [
    { duration: '1m', target: 100 },   // Normal load
    { duration: '30s', target: 500 },  // SPIKE! Jump to 500
    { duration: '2m', target: 500 },   // Maintain spike
    { duration: '1m', target: 100 },   // Return to normal
    { duration: '30s', target: 0 },    // Wind down
  ],
  thresholds: {
    'http_req_duration': ['p(95)<10000'],
    'http_req_failed': ['rate<0.1'],
  },
};

const BASE_URL = 'https://disha-diagnostics.web.app';

export default function () {
  group('Spike Test - Homepage', () => {
    let res = http.get(`${BASE_URL}/`);
    check(res, {
      'status is 200': (r) => r.status === 200,
      'responds under spike': (r) => r.status !== 503,
      'response time acceptable': (r) => r.timings.duration < 15000,
    });
  });

  sleep(0.5);

  group('Spike Test - Multiple Requests', () => {
    // Rapid-fire requests during spike
    for (let i = 0; i < 3; i++) {
      let res = http.get(`${BASE_URL}/`);
      check(res, {
        'handles spike traffic': (r) => r.status === 200 || r.status === 429,
      });
    }
  });

  sleep(1);

  group('Spike Test - Connection Stability', () => {
    let res = http.get(`${BASE_URL}/`);
    check(res, {
      'no connection drops': (r) => r.status !== 0,
      'no timeouts': (r) => r.error === undefined,
    });
  });

  sleep(0.5);
}
