/**
 * k6 Load Test - Heavy Load
 * Tests: 500 concurrent users (stress test)
 * Purpose: Push system to limits / stress testing
 * Duration: 10 minutes with ramp-up
 */

import http from 'k6/http';
import { check, group, sleep } from 'k6';

export let options = {
  stages: [
    { duration: '5m', target: 250 },  // Ramp-up to 250
    { duration: '5m', target: 500 },  // Continue to 500
    { duration: '10m', target: 500 }, // Stay at 500 (heavy load)
    { duration: '3m', target: 0 },    // Ramp-down
  ],
  thresholds: {
    'http_req_duration': ['p(95)<10000', 'p(99)<20000'],
    'http_req_failed': ['rate<0.1'],
  },
};

const BASE_URL = 'https://disha-diagnostics.web.app';

export default function () {
  group('Heavy Load - Homepage', () => {
    let res = http.get(`${BASE_URL}/`);
    check(res, {
      'status is 200': (r) => r.status === 200,
      'response time < 10s': (r) => r.timings.duration < 10000,
      'no server errors': (r) => r.status !== 500,
    });
  });

  sleep(1);

  group('Heavy Load - Concurrent Requests', () => {
    // Simulate multiple concurrent requests
    for (let i = 0; i < 5; i++) {
      let res = http.get(`${BASE_URL}/`, {
        headers: { 'Content-Type': 'application/json' },
      });
      check(res, {
        'concurrent request succeeds': (r) => r.status === 200 || r.status === 404,
      });
    }
  });

  sleep(2);

  group('Heavy Load - Sustained Traffic', () => {
    // Keep making requests to simulate sustained load
    let res = http.get(`${BASE_URL}/`);
    check(res, {
      'system still responsive': (r) => r.status === 200 || r.status === 429,
      'response time reasonable': (r) => r.timings.duration < 15000,
    });
  });

  sleep(1);
}
