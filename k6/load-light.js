/**
 * k6 Load Test - Light Load
 * Tests: 50 concurrent users
 * Purpose: Typical school usage / daily average
 * Duration: 10 minutes with smooth ramp-up
 */

import http from 'k6/http';
import { check, group, sleep } from 'k6';

export let options = {
  stages: [
    { duration: '2m', target: 50 },   // Ramp-up to 50 users
    { duration: '8m', target: 50 },   // Stay at 50 users
    { duration: '1m', target: 0 },    // Ramp-down
  ],
  thresholds: {
    'http_req_duration': ['p(95)<3000', 'p(99)<5000'],
    'http_req_failed': ['rate<0.05'],
  },
};

const BASE_URL = 'https://disha-diagnostics.web.app';

export default function () {
  group('Light Load - Homepage', () => {
    let res = http.get(`${BASE_URL}/`);
    check(res, {
      'status is 200': (r) => r.status === 200,
      'response time < 3s': (r) => r.timings.duration < 3000,
      'no errors': (r) => r.status !== 500,
    });
  });

  sleep(1);

  group('Light Load - Dashboard Access', () => {
    let res = http.get(`${BASE_URL}/`);
    check(res, {
      'dashboard responds': (r) => r.status === 200,
      'contains content': (r) => r.body.length > 1000,
    });
  });

  sleep(2);

  group('Light Load - Multiple Page Loads', () => {
    for (let i = 0; i < 3; i++) {
      let res = http.get(`${BASE_URL}/`);
      check(res, {
        'consecutive load succeeds': (r) => r.status === 200,
      });
      sleep(0.5);
    }
  });

  sleep(1);
}
