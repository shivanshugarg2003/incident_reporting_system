import { test as base } from '@playwright/test';
import { SubmitIncidentPage } from '../pages/SubmitIncidentPage';
import { DashboardPage } from '../pages/DashboardPage';
import { NavbarPage } from '../pages/NavbarPage';
import { resetTickets } from '../utils/ticket-store';

type AppFixtures = {
  submitPage: SubmitIncidentPage;
  dashboardPage: DashboardPage;
  navbar: NavbarPage;
};

export const test = base.extend<AppFixtures>({
  submitPage: async ({ page }, use) => {
    await use(new SubmitIncidentPage(page));
  },
  dashboardPage: async ({ page }, use) => {
    await use(new DashboardPage(page));
  },
  navbar: async ({ page }, use) => {
    await use(new NavbarPage(page));
  },
});

test.beforeEach(async () => {
  await resetTickets();
});

export { expect } from '@playwright/test';
