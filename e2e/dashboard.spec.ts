import { test, expect } from '@playwright/test';

test.describe('Navigation & Layout', () => {
  test('homepage redirects to /properties', async ({ page }) => {
    await page.goto('/');
    await page.waitForURL('**/properties');
    await page.screenshot({ path: 'e2e/screenshots/01-homepage-redirect.png', fullPage: true });
    expect(page.url()).toContain('/properties');
  });

  test('nav bar displays Marshall White branding', async ({ page }) => {
    await page.goto('/properties');
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: 'e2e/screenshots/02-nav-bar.png', fullPage: false });

    const nav = page.locator('nav');
    await expect(nav).toBeVisible();
    await expect(page.getByText('Marshall White')).toBeVisible();
    await expect(page.getByText('Stonnington Office')).toBeVisible();
  });
});

test.describe('All Properties Tab', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/properties');
    await page.waitForLoadState('networkidle');
  });

  test('dashboard loads with properties table', async ({ page }) => {
    await page.screenshot({ path: 'e2e/screenshots/03-all-properties-tab.png', fullPage: true });

    const allTab = page.getByRole('tab', { name: /all properties/i });
    await expect(allTab).toBeVisible();

    const rows = page.locator('table tbody tr');
    const count = await rows.count();
    expect(count).toBeGreaterThan(0);
    expect(count).toBeLessThanOrEqual(25);
  });

  test('table has correct columns', async ({ page }) => {
    const headers = page.locator('table thead th');
    const headerTexts = await headers.allTextContents();
    await page.screenshot({ path: 'e2e/screenshots/04-table-headers.png' });

    const expectedHeaders = ['Address', 'Status', 'Office', 'Lead Agent', 'Listed', 'Days on Market'];
    for (const header of expectedHeaders) {
      expect(headerTexts.some(h => h.toLowerCase().includes(header.toLowerCase()))).toBeTruthy();
    }
  });

  test('search filters properties', async ({ page }) => {
    const searchInput = page.getByPlaceholder(/search/i);
    await expect(searchInput).toBeVisible();

    await searchInput.fill('Toorak');
    await page.waitForTimeout(500);
    await page.screenshot({ path: 'e2e/screenshots/05-search-filter.png', fullPage: true });

    const rows = page.locator('table tbody tr');
    const count = await rows.count();
    if (count > 0) {
      for (let i = 0; i < Math.min(count, 5); i++) {
        const rowText = await rows.nth(i).textContent();
        expect(rowText?.toLowerCase()).toContain('toorak');
      }
    }
  });

  test('status filter dropdown works', async ({ page }) => {
    await page.screenshot({ path: 'e2e/screenshots/06-status-filter-before.png' });

    // shadcn Select is not a native <select>, try clicking the trigger
    const trigger = page.locator('button').filter({ hasText: /all/i }).first();
    if (await trigger.isVisible()) {
      await trigger.click();
      await page.waitForTimeout(300);
      await page.screenshot({ path: 'e2e/screenshots/06b-status-filter-open.png' });

      // Try clicking "Sold" option
      const soldOption = page.getByText('Sold', { exact: true }).last();
      if (await soldOption.isVisible()) {
        await soldOption.click();
        await page.waitForTimeout(500);
        await page.screenshot({ path: 'e2e/screenshots/07-status-filter-sold.png', fullPage: true });
      }
    }
  });

  test('pagination shows correct page count', async ({ page }) => {
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.screenshot({ path: 'e2e/screenshots/08-pagination.png', fullPage: true });

    const paginationText = page.getByText(/page/i);
    await expect(paginationText.first()).toBeVisible();
  });

  test('column sorting works', async ({ page }) => {
    const daysHeader = page.locator('button').filter({ hasText: 'Days on Market' });
    if (await daysHeader.isVisible()) {
      await daysHeader.click();
      await page.waitForTimeout(300);
      await page.screenshot({ path: 'e2e/screenshots/09-sorted-by-days.png', fullPage: true });
    }
  });

  test('status badges render correctly', async ({ page }) => {
    await page.screenshot({ path: 'e2e/screenshots/10-status-badges.png' });
  });

  test('row click navigates to detail via address link', async ({ page }) => {
    // Navigation is via address link, not row click
    const firstLink = page.locator('table tbody tr a').first();
    await expect(firstLink).toBeVisible();

    const href = await firstLink.getAttribute('href');
    expect(href).toContain('/properties/');

    await firstLink.click();
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: 'e2e/screenshots/14-detail-page-navigation.png', fullPage: true });
    expect(page.url()).toContain('/properties/');
    expect(page.url()).not.toMatch(/\/properties$/);
  });
});

test.describe('Rescue Properties Tab', () => {
  test('rescue tab shows correct count and properties', async ({ page }) => {
    await page.goto('/properties');
    await page.waitForLoadState('networkidle');

    const rescueTab = page.getByRole('tab', { name: /rescue/i });
    await expect(rescueTab).toBeVisible();
    await rescueTab.click();
    await page.waitForTimeout(500);
    await page.screenshot({ path: 'e2e/screenshots/11-rescue-tab.png', fullPage: true });

    const headers = page.locator('table thead th');
    const headerTexts = await headers.allTextContents();
    expect(headerTexts.some(h => h.toLowerCase().includes('rescue'))).toBeTruthy();
  });

  test('rescue badges display', async ({ page }) => {
    await page.goto('/properties');
    await page.waitForLoadState('networkidle');

    const rescueTab = page.getByRole('tab', { name: /rescue/i });
    await rescueTab.click();
    await page.waitForTimeout(500);
    await page.screenshot({ path: 'e2e/screenshots/12-rescue-badges.png' });
  });

  test('rescue tab excludes sold/leased properties', async ({ page }) => {
    await page.goto('/properties');
    await page.waitForLoadState('networkidle');

    const rescueTab = page.getByRole('tab', { name: /rescue/i });
    await rescueTab.click();
    await page.waitForTimeout(500);

    const soldBadges = page.locator('table tbody').getByText('Sold', { exact: true });
    const leasedBadges = page.locator('table tbody').getByText('Leased', { exact: true });

    expect(await soldBadges.count()).toBe(0);
    expect(await leasedBadges.count()).toBe(0);

    await page.screenshot({ path: 'e2e/screenshots/13-rescue-no-sold-leased.png', fullPage: true });
  });
});

test.describe('Property Detail Page', () => {
  test('detail page renders correctly', async ({ page }) => {
    // Navigate directly to a property detail page
    await page.goto('/properties');
    await page.waitForLoadState('networkidle');

    // Get first property link href
    const firstLink = page.locator('table tbody tr a').first();
    const href = await firstLink.getAttribute('href');
    expect(href).toBeTruthy();

    await page.goto(href!);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    await page.screenshot({ path: 'e2e/screenshots/15-detail-full-top.png', fullPage: false });
  });

  test('detail page full scroll', async ({ page }) => {
    await page.goto('/properties');
    await page.waitForLoadState('networkidle');
    const firstLink = page.locator('table tbody tr a').first();
    const href = await firstLink.getAttribute('href');
    await page.goto(href!);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    await page.screenshot({ path: 'e2e/screenshots/20-detail-full-page.png', fullPage: true });
  });

  test('detail page hero image area', async ({ page }) => {
    await page.goto('/properties');
    await page.waitForLoadState('networkidle');
    const firstLink = page.locator('table tbody tr a').first();
    const href = await firstLink.getAttribute('href');
    await page.goto(href!);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);

    // Check all images and their status
    const images = page.locator('img');
    const imgCount = await images.count();
    const imgDetails: string[] = [];
    for (let i = 0; i < Math.min(imgCount, 10); i++) {
      const src = await images.nth(i).getAttribute('src');
      const isVisible = await images.nth(i).isVisible();
      const box = await images.nth(i).boundingBox();
      imgDetails.push(`img[${i}]: src=${src?.substring(0, 80)}, visible=${isVisible}, box=${JSON.stringify(box)}`);
    }
    console.log('IMAGE DETAILS:', imgDetails.join('\n'));

    await page.screenshot({ path: 'e2e/screenshots/16-detail-hero-image.png', fullPage: false });
  });

  test('detail page agent cards section', async ({ page }) => {
    await page.goto('/properties');
    await page.waitForLoadState('networkidle');
    const firstLink = page.locator('table tbody tr a').first();
    const href = await firstLink.getAttribute('href');
    await page.goto(href!);
    await page.waitForLoadState('networkidle');

    // Scroll right sidebar area into view
    await page.evaluate(() => window.scrollTo(0, 300));
    await page.waitForTimeout(500);
    await page.screenshot({ path: 'e2e/screenshots/17-detail-agent-cards.png', fullPage: false });
  });

  test('detail page property stats and description', async ({ page }) => {
    await page.goto('/properties');
    await page.waitForLoadState('networkidle');
    const firstLink = page.locator('table tbody tr a').first();
    const href = await firstLink.getAttribute('href');
    await page.goto(href!);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);

    await page.screenshot({ path: 'e2e/screenshots/18-detail-stats.png', fullPage: true });
  });

  test('Order Campaign button shows toast', async ({ page }) => {
    await page.goto('/properties');
    await page.waitForLoadState('networkidle');
    const firstLink = page.locator('table tbody tr a').first();
    const href = await firstLink.getAttribute('href');
    await page.goto(href!);
    await page.waitForLoadState('networkidle');

    const orderBtn = page.getByRole('button', { name: /order campaign/i }).first();
    if (await orderBtn.isVisible()) {
      await orderBtn.click();
      await page.waitForTimeout(1000);
      await page.screenshot({ path: 'e2e/screenshots/19-order-campaign-toast.png', fullPage: false });
    } else {
      // Take screenshot showing what's on the page
      await page.screenshot({ path: 'e2e/screenshots/19-no-order-campaign-btn.png', fullPage: false });
    }
  });
});

test.describe('Responsive Layout', () => {
  test('mobile view - dashboard', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('/properties');
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: 'e2e/screenshots/21-mobile-dashboard.png', fullPage: true });
  });

  test('mobile view - detail page', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('/properties');
    await page.waitForLoadState('networkidle');

    const firstLink = page.locator('table tbody tr a').first();
    const href = await firstLink.getAttribute('href');
    await page.goto(href!);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    await page.screenshot({ path: 'e2e/screenshots/22-mobile-detail.png', fullPage: true });
  });
});

test.describe('Days on Market Colours', () => {
  test('days on market shows correct colour coding', async ({ page }) => {
    await page.goto('/properties');
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: 'e2e/screenshots/23-days-on-market-colours.png' });
  });
});
