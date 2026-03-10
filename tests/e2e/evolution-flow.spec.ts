/**
 * E2E tests for complete evolution flow
 */

import { test, expect } from '@playwright/test';

test.describe('Evolution Flow E2E', () => {
  test('complete evolution flow', async ({ request }) => {
    // 1. Start evolution service (assume it's running)
    const baseUrl = 'http://localhost:3001';

    // 2. Perform handshake
    const handshakeResponse = await request.post(`${baseUrl}/v1/runtime/handshake`, {
      data: {
        pluginInfo: {
          name: '@test/e2e-plugin',
          version: '1.0.0',
          minHostVersion: '2026.3.0',
          capabilities: ['event_capture'],
        },
      },
    });

    expect(handshakeResponse.ok()).toBeTruthy();
    const handshakeData = await handshakeResponse.json();
    expect(handshakeData.sessionId).toBeDefined();

    // 3. Send user message event
    const eventResponse = await request.post(`${baseUrl}/v1/events`, {
      data: {
        events: [
          {
            id: 'evt-e2e-1',
            type: 'user_message',
            timestamp: Date.now(),
            sessionId: handshakeData.sessionId,
            data: { content: 'Test evolution trigger' },
          },
        ],
      },
    });

    expect(eventResponse.ok()).toBeTruthy();
    const eventData = await eventResponse.json();
    expect(eventData.accepted).toBe(1);

    // 4. Create a candidate (simulating trigger engine)
    const candidateResponse = await request.post(`${baseUrl}/v1/candidates`, {
      data: {
        sessionId: handshakeData.sessionId,
        candidateType: 'skill',
        sourceEventId: 'evt-e2e-1',
        content: 'test skill from e2e',
        description: 'E2E test skill',
        confidence: 0.8,
      },
    });

    expect(candidateResponse.ok()).toBeTruthy();
    const candidateData = await candidateResponse.json();
    expect(candidateData.candidateId).toBeDefined();

    // 5. Run evaluation
    const evaluationResponse = await request.post(`${baseUrl}/v1/evaluations/run`, {
      data: {
        candidateId: candidateData.candidateId,
        evaluationType: 'automated',
      },
    });

    expect(evaluationResponse.ok()).toBeTruthy();
    const evaluationData = await evaluationResponse.json();
    expect(evaluationData.evaluationId).toBeDefined();
    expect(evaluationData.status).toMatch(/^(passed|failed|pending)$/);

    // 6. Get cards for session
    const cardsResponse = await request.get(
      `${baseUrl}/v1/cards?session_id=${handshakeData.sessionId}`
    );

    expect(cardsResponse.ok()).toBeTruthy();
    const cardsData = await cardsResponse.json();
    expect(Array.isArray(cardsData.cards)).toBeTruthy();

    // 7. If there are cards, make a decision
    if (cardsData.cards.length > 0) {
      const card = cardsData.cards[0];
      const decisionResponse = await request.post(
        `${baseUrl}/v1/cards/${card.card_id}/decision`,
        {
          data: {
            decision: 'approved',
            feedback: 'E2E test approval',
          },
        }
      );

      expect(decisionResponse.ok()).toBeTruthy();

      // 8. Verify skill was promoted (if decision was approved)
      if (evaluationData.status === 'passed') {
        const skillsResponse = await request.get(`${baseUrl}/v1/insights/skills`);
        expect(skillsResponse.ok()).toBeTruthy();
        const skillsData = await skillsResponse.json();
        expect(skillsData.skills.length).toBeGreaterThan(0);
      }
    }

    // 9. Verify dashboard metrics updated
    const dashboardResponse = await request.get(`${baseUrl}/v1/insights/dashboard`);
    expect(dashboardResponse.ok()).toBeTruthy();
    const dashboardData = await dashboardResponse.json();
    expect(dashboardData.totalSessions).toBeGreaterThanOrEqual(1);
    expect(dashboardData.totalEvents).toBeGreaterThanOrEqual(1);
  });

  test('error handling for invalid requests', async ({ request }) => {
    const baseUrl = 'http://localhost:3001';

    // Test invalid handshake
    const response = await request.post(`${baseUrl}/v1/runtime/handshake`, {
      data: { invalid: 'data' },
    });

    expect(response.status()).toBe(400);

    // Test invalid event
    const eventResponse = await request.post(`${baseUrl}/v1/events`, {
      data: { events: [{ invalid: 'event' }] },
    });

    expect(eventResponse.status()).toBe(400);
  });

  test('concurrent event processing', async ({ request }) => {
    const baseUrl = 'http://localhost:3001';

    // Perform handshake
    const handshakeResponse = await request.post(`${baseUrl}/v1/runtime/handshake`, {
      data: {
        pluginInfo: {
          name: '@test/concurrent-plugin',
          version: '1.0.0',
          minHostVersion: '2026.3.0',
          capabilities: ['event_capture'],
        },
      },
    });

    const handshakeData = await handshakeResponse.json();

    // Send multiple concurrent events
    const events = Array.from({ length: 10 }, (_, i) => ({
      id: `evt-concurrent-${i}`,
      type: 'user_message',
      timestamp: Date.now(),
      sessionId: handshakeData.sessionId,
      data: { content: `Concurrent test message ${i}` },
    }));

    const response = await request.post(`${baseUrl}/v1/events`, {
      data: { events },
    });

    expect(response.ok()).toBeTruthy();
    const data = await response.json();
    expect(data.accepted).toBe(10);
  });
});
