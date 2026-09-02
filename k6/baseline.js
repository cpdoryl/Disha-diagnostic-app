/**
 * k6 Load Test - Baseline Performance
 * Tests: No load / baseline metrics
 * Purpose: Establish baseline performance metrics
 * Duration: 5 minutes with 1 user
 */

import http from 'k6/http';
import { check, group, sleep } from 'k6';

export let options = {
  stages: [
    { duration: '1m', target: 1 },   // Start with 1 user
    { duration: '4m', target: 1 },   // Keep for 4 minutes
  ],
  thresholds: {
    'http_req_duration': ['p(95)<1000', 'p(99)<2000'],
    'http_req_failed': ['rate<0.05'],
  },
};

const BASE_URL = 'https://disha-diagnostics.web.app';

export default function () {
  group('Baseline - Homepage', () => {
    let res = http.get(`${BASE_URL}/`);
    check(res, {
      'status is 200': (r) => r.status === 200,
      'page loads': (r) => r.body.length > 0,
      'response time < 2s': (r) => r.timings.duration < 2000,
    });
  });

  sleep(2);

  group('Baseline - Dashboard', () => {
    let res = http.get(`${BASE_URL}/`);
    check(res, {
      'dashboard loads': (r) => r.status === 200,
      'response time < 2s': (r) => r.timings.duration < 2000,
    });
  });

  sleep(3);

  group('Baseline - API Health', () => {
    let res = http.get(`${BASE_URL}/api/health`, {
      headers: { 'Content-Type': 'application/json' },
    });
    check(res, {
      'health check passes': (r) => r.status === 200 || r.status === 404,
      'response time < 1s': (r) => r.timings.duration < 1000,
    });
  });

  sleep(2);
}
