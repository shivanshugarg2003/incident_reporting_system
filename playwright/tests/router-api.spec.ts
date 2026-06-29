import { test, expect } from '../fixtures';
import { createTicket, updateTicket } from '../utils/api-client';
import { today } from '../utils/date-helper';

/**
 * Comprehensive API-level tests for backend/router.py assign_priority logic.
 * Validates Task 3 minimum keywords and all CRITICAL_KEYWORDS patterns.
 */
test.describe('Router API — backend/router.py', () => {
  const criticalCases = [
    {
      label: 'system down (Task 3 minimum)',
      reporter_name: 'Router System Down',
      description: 'The system down affected all production users today',
    },
    {
      label: 'security down (Task 3 minimum)',
      reporter_name: 'Router Security Down',
      description: 'We have a security down on the main firewall',
    },
    {
      label: 'error 500 (Task 3 minimum)',
      reporter_name: 'Router Error 500',
      description: 'Users see error 500 on the login page repeatedly',
    },
    {
      label: 'error500 compact form',
      reporter_name: 'Router Error500',
      description: 'Checkout returns error500 for all customers',
    },
    {
      label: 'server crash',
      reporter_name: 'Router Server Crash',
      description: 'Detected a server crash in production overnight',
    },
    {
      label: 'data breach',
      reporter_name: 'Router Data Breach',
      description: 'Possible data breach identified during audit review',
    },
    {
      label: 'outage',
      reporter_name: 'Router Outage',
      description: 'Major network outage impacted customer access today',
    },
    {
      label: 'critical failure',
      reporter_name: 'Router Critical Failure',
      description: 'critical failure in authentication service today',
    },
    {
      label: 'unauthorized access',
      reporter_name: 'Router Unauthorized',
      description: 'unauthorized access detected on admin console today',
    },
    {
      label: 'unauthorised access (UK spelling)',
      reporter_name: 'Router Unauthorised',
      description: 'unauthorised access detected on admin console today',
    },
    {
      label: 'case insensitive SYSTEM DOWN',
      reporter_name: 'Router Case Test',
      description: 'SYSTEM DOWN in production environment',
    },
    {
      label: 'server down',
      reporter_name: 'Router Server Down',
      description: 'server down in staging environment overnight',
    },
    {
      label: 'database failure',
      reporter_name: 'Router Database Failure',
      description: 'database failure during nightly backup job',
    },
    {
      label: 'network issue',
      reporter_name: 'Router Network Issue',
      description: 'Major network issue blocked internal access today',
    },
    {
      label: 'authentication failed',
      reporter_name: 'Router Auth Failed',
      description: 'authentication failed for multiple admin accounts',
    },
    {
      label: 'api failure',
      reporter_name: 'Router API Failure',
      description: 'api failure on payment gateway endpoint today',
    },
    {
      label: 'extra whitespace system down',
      reporter_name: 'Router Whitespace',
      description: 'The   system    down   affected production users',
    },
  ];

  for (const ticketCase of criticalCases) {
    test(`assigns Critical for ${ticketCase.label}`, async ({ request }) => {
      const ticket = await createTicket(request, {
        reporter_name: ticketCase.reporter_name,
        source_type: 'Email',
        incident_date: today(),
        description: ticketCase.description,
      });

      expect(ticket.priority).toBe('Critical');
      expect(ticket.status).toBe('Open');
      expect(ticket.created_at).toBeTruthy();
      expect(ticket.id).toBeTruthy();
    });
  }

  const lowCases = [
    {
      label: 'minor UI issue',
      reporter_name: 'Router Low Minor',
      description: 'Minor UI glitch on the settings page today',
    },
    {
      label: 'random text with no keywords',
      reporter_name: 'Router Low Random',
      description: 'Random text with no matching keywords at all',
    },
    {
      label: 'slow performance only',
      reporter_name: 'Router Low Slow',
      description: 'slow page load on dashboard with no failure keywords',
    },
  ];

  for (const ticketCase of lowCases) {
    test(`assigns Low for ${ticketCase.label}`, async ({ request }) => {
      const ticket = await createTicket(request, {
        reporter_name: ticketCase.reporter_name,
        source_type: 'Portal',
        incident_date: today(),
        description: ticketCase.description,
      });

      expect(ticket.priority).toBe('Low');
      expect(ticket.status).toBe('Open');
    });
  }

  test('recomputes priority on GET when description changes via PUT', async ({
    request,
  }) => {
    const ticket = await createTicket(request, {
      reporter_name: 'Router Recompute',
      source_type: 'Email',
      incident_date: today(),
      description: 'Minor cosmetic issue on dashboard page',
    });
    expect(ticket.priority).toBe('Low');

    const body = await updateTicket(request, ticket.id, {
      description: 'system down in production environment today',
    });
    expect(body.priority).toBe('Critical');
  });
});
