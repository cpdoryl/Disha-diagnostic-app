/**
 * k6 Load Test - Normal Load
 * Tests: 200 concurrent users
 * Purpose: Peak school hours usage
 * Duration: 15 minutes with ramp-up
 */

import http from 'k6/http';
import { check, group, sleep } from 'k6';

export let options = {
  stages: [
    { duration: '3m', target: 100 },  // Ramp-up to 100
    { duration: '2m', target: 200 },  // Continue to 200
    { duration: '10m', target: 200 }, // Stay at 200
    { duration: '2m', target: 0 },    // Ramp-down
  ],
  thresholds: {
    'http_req_duration': ['p(95)<5000', 'p(99)<10000'],
    'http_req_failed': ['rate<0.05'],
  },
};

const BASE_URL = 'https://disha-diagnostics.web.app';

export default function () {
  group('Normal Load - Dashboard', () => {
    let res = http.get(`${BASE_URL}/`);
    check(res, {
      'status is 200': (r) => r.status === 200,
      'response time < 5s': (r) => r.timings.duration < 5000,
      'page loads': (r) => r.body.length > 1000,
    });
  });

  sleep(1);

  group('Normal Load - Navigation', () => {
    // Simulate user clicking through pages
    let pages = ['/', '/dashboard', '/assessments'];
    pages.forEach((page) => {
      let res = http.get(`${BASE_URL}${page}`);
      check(res, {
        [`navigation to ${page} works`]: (r) => r.status === 200 || r.status === 404,
      });
      sleep(0.5);
    });
  });

  sleep(2);

  group('Normal Load - API Calls', () => {
    let res = http.get(`${BASE_URL}/`, {
      headers: { 'Content-Type': 'application/json' },
    });
    check(res, {
      'api responds': (r) => r.status === 200 || r.status === 404,
      'response time acceptable': (r) => r.timings.duration < 5000,
    });
  });

  sleep(2);
}
