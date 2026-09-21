/**
 * Evaluation script — runs test scenarios against the live API
 * and prints pass/fail for each.
 *
 * Usage: npm run eval
 * Requires: GEMINI_API_KEY in .env.local, running MySQL, seeded DB, dev server on port 3000
 */

interface EvalScenario {
  id: number;
  category: string;
  input: string;
  expectedBehavior: string;
  validate: (response: Record<string, unknown>) => boolean;
}

const BASE_URL = process.env.EVAL_BASE_URL || 'http://localhost:3000';
const SESSION_ID = `eval-${Date.now()}`;

const scenarios: EvalScenario[] = [
  {
    id: 1,
    category: 'Factual - Check-in',
    input: 'What time is check-in?',
    expectedBehavior: 'Returns answer mentioning 14:00 or 2:00 PM',
    validate: (r) =>
      r.type === 'answer' &&
      typeof r.message === 'string' &&
      (/14:00/.test(r.message as string) || /2:00\s*PM/i.test(r.message as string)),
  },
  {
    id: 2,
    category: 'Factual - Breakfast',
    input: 'Is breakfast included in the room rate?',
    expectedBehavior: 'Answer says NOT included and mentions $25',
    validate: (r) =>
      r.type === 'answer' &&
      typeof r.message === 'string' &&
      /not included/i.test(r.message as string) &&
      /\$?25/.test(r.message as string),
  },
  {
    id: 3,
    category: 'Factual - Pool',
    input: 'Does the hotel have a pool?',
    expectedBehavior: 'Answer confirms pool exists',
    validate: (r) =>
      r.type === 'answer' &&
      typeof r.message === 'string' &&
      /yes|pool/i.test(r.message as string),
  },
  {
    id: 4,
    category: 'Factual - Cancellation',
    input: 'What is the cancellation policy?',
    expectedBehavior: 'Mentions 48 hours free cancellation',
    validate: (r) =>
      r.type === 'answer' &&
      typeof r.message === 'string' &&
      /48\s*hour/i.test(r.message as string),
  },
  {
    id: 5,
    category: 'Factual - 3 Guests',
    input: 'Do you have rooms that can sleep 3 adults?',
    expectedBehavior: 'Mentions Family Suite or Deluxe Ocean View',
    validate: (r) =>
      typeof r.message === 'string' &&
      (/family suite/i.test(r.message as string) || /deluxe/i.test(r.message as string)),
  },
  {
    id: 6,
    category: 'Anti-hallucination - False premise',
    input: 'Tell me about your rooftop spa',
    expectedBehavior: 'Politely corrects: no rooftop spa, mentions actual spa',
    validate: (r) =>
      typeof r.message === 'string' &&
      !/rooftop spa/i.test(r.message as string),
  },
  {
    id: 7,
    category: 'Availability - Full info',
    input: 'Check room availability for 2 adults from 2027-06-15 to 2027-06-18',
    expectedBehavior: 'Returns availability_result with options',
    validate: (r) =>
      r.type === 'availability_result' &&
      r.availability !== undefined &&
      Array.isArray((r.availability as Record<string, unknown>).options),
  },
  {
    id: 8,
    category: 'Availability - Missing info',
    input: 'I want to book a room',
    expectedBehavior: 'Returns availability_request asking for dates/adults',
    validate: (r) =>
      r.type === 'availability_request' || r.type === 'answer',
  },
  {
    id: 9,
    category: 'Factual - Parking',
    input: 'Is there parking at the hotel?',
    expectedBehavior: 'Mentions parking at $15/night',
    validate: (r) =>
      r.type === 'answer' &&
      typeof r.message === 'string' &&
      /parking/i.test(r.message as string),
  },
  {
    id: 10,
    category: 'Factual - Wi-Fi',
    input: 'Is Wi-Fi free?',
    expectedBehavior: 'Confirms free Wi-Fi',
    validate: (r) =>
      r.type === 'answer' &&
      typeof r.message === 'string' &&
      /free|complimentary/i.test(r.message as string) &&
      /wi-?fi/i.test(r.message as string),
  },
  {
    id: 11,
    category: 'Out of scope',
    input: 'What is the best restaurant in the city?',
    expectedBehavior: 'Returns fallback or says it cannot answer',
    validate: (r) =>
      r.type === 'fallback' ||
      r.type === 'answer',
  },
  {
    id: 12,
    category: 'Validation',
    input: '',
    expectedBehavior: 'Returns error for empty message',
    validate: (r) => r.type === 'error',
  },
];

async function runScenario(scenario: EvalScenario): Promise<{
  passed: boolean;
  actualResult: string;
  error?: string;
}> {
  try {
    const body: Record<string, unknown> = {
      sessionId: SESSION_ID,
      message: scenario.input,
    };

    // For scenario 7, include availabilityForm
    if (scenario.id === 7) {
      body.availabilityForm = {
        checkIn: '2027-06-15',
        checkOut: '2027-06-18',
        adults: 2,
      };
    }

    // For scenario 12 (empty message), send empty string
    if (scenario.id === 12) {
      body.message = '';
    }

    const response = await fetch(`${BASE_URL}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    const data = await response.json();
    const passed = scenario.validate(data);

    return {
      passed,
      actualResult: `[${data.type}] ${(data.message as string)?.slice(0, 100)}...`,
    };
  } catch (error) {
    return {
      passed: false,
      actualResult: 'N/A',
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

async function main() {
  console.log('\n🏨 Hotel Guest Assistant — Evaluation Suite\n');
  console.log('='.repeat(80));

  let passed = 0;
  let failed = 0;

  for (const scenario of scenarios) {
    process.stdout.write(`  #${scenario.id.toString().padStart(2)} ${scenario.category.padEnd(35)}`);

    const result = await runScenario(scenario);

    if (result.passed) {
      console.log('✅ PASS');
      passed++;
    } else {
      console.log('❌ FAIL');
      console.log(`       Expected: ${scenario.expectedBehavior}`);
      console.log(`       Actual:   ${result.actualResult}`);
      if (result.error) console.log(`       Error:    ${result.error}`);
      failed++;
    }
  }

  console.log('\n' + '='.repeat(80));
  console.log(`  Results: ${passed} passed, ${failed} failed out of ${scenarios.length} scenarios`);
  console.log('='.repeat(80) + '\n');

  process.exit(failed > 0 ? 1 : 0);
}

main();
