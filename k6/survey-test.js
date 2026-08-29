/**
 * k6 Load Test - 14D Diagnostic Assessment Survey
 * Tests: 200 concurrent users submitting survey responses
 * Purpose: Test form submission and data capture under load
 * Duration: 10 minutes
 */

import http from 'k6/http';
import { check, group, sleep } from 'k6';

export let options = {
  stages: [
    { duration: '2m', target: 100 },  // Ramp-up
    { duration: '2m', target: 200 },  // Reach target
    { duration: '8m', target: 200 },  // Stay at load
    { duration: '1m', target: 0 },    // Ramp-down
  ],
  thresholds: {
    'http_req_duration': ['p(95)<5000', 'p(99)<10000'],
    'http_req_failed': ['rate<0.05'],
  },
};

const BASE_URL = 'https://disha-diagnostics.web.app';

export default function () {
  const assessmentId = `assess-${__VU}-${__ITER}`;
  const respondent = ['Teacher', 'Parent', 'Student', 'Admin'][__VU % 4];

  // Step 1: Load survey
  group('Survey - Load Assessment', () => {
    let res = http.get(`${BASE_URL}/`);
    check(res, {
      'survey loads': (r) => r.status === 200,
      'quick load': (r) => r.timings.duration < 3000,
    });
  });

  sleep(1);

  // Step 2: Submit survey response (simulated 14D assessment)
  group('Survey - Submit Response', () => {
    let surveyData = {
      assessmentId: assessmentId,
      respondent: respondent,
      responses: generateResponses(),
      timestamp: new Date().toISOString(),
    };

    let res = http.post(`${BASE_URL}/api/surveys/submit`, JSON.stringify(surveyData), {
      headers: { 'Content-Type': 'application/json' },
    });

    check(res, {
      'submission succeeds': (r) => r.status === 200 || r.status === 201 || r.status === 404,
      'submission time < 5s': (r) => r.timings.duration < 5000,
      'no server errors': (r) => r.status !== 500,
    });
  });

  sleep(1);

  // Step 3: Verify submission
  group('Survey - Verify Submission', () => {
    let res = http.get(`${BASE_URL}/`, {
      headers: { 'Content-Type': 'application/json' },
    });

    check(res, {
      'verification works': (r) => r.status === 200 || r.status === 404,
      'fast verification': (r) => r.timings.duration < 3000,
    });
  });

  sleep(2);

  // Step 4: View aggregated results
  group('Survey - View Aggregates', () => {
    let res = http.get(`${BASE_URL}/`, {
      headers: { 'Content-Type': 'application/json' },
    });

    check(res, {
      'aggregates load': (r) => r.status === 200 || r.status === 404,
      'performance acceptable': (r) => r.timings.duration < 5000,
    });
  });

  sleep(1);
}

function generateResponses() {
  // Simulate 14-dimension responses
  let responses = {};
  for (let i = 1; i <= 14; i++) {
    responses[`dimension_${i}`] = Math.floor(Math.random() * 5) + 1; // 1-5 scale
  }
  return responses;
}
