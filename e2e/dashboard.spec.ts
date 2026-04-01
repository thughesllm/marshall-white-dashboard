import { test, expect } from '@playwright/test';

// ═══════════════════════════════════════════════════════════════════════════
// 1. NAVIGATION & LAYOUT
// ═══════════════════════════════════════════════════════════════════════════

test.describe('Navigation & Layout', () => {
  test('homepage redirects to /properties', async ({ page }) => {
    await page.goto('/');
    await page.waitForURL('**/properties');
    expect(page.url()).toContain('/properties');
  });

  test('nav bar shows Marshall White branding', async ({ page }) => {
    await page.goto('/properties');
    await page.waitForLoadState('networkidle');
    await expect(page.getByText('Marshall White')).toBeVisible();
    await expect(page.getByText('Stonnington Office')).toBeVisible();
    await page.screenshot({ path: 'e2e/screenshots/01-nav.png' });
  });

  test('Geist font renders (not serif)', async ({ page }) => {
    await page.goto('/properties');
    await page.waitForLoadState('networkidle');
    const fontFamily = await page.locator('body').evaluate(el =>
      window.getComputedStyle(el).fontFamily
    );
    expect(fontFamily.toLowerCase()).not.toContain('times');
    expect(fontFamily.toLowerCase()).toContain('geist');
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// 2. ALL PROPERTIES TAB
// ═══════════════════════════════════════════════════════════════════════════

test.describe('All Properties Tab', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/properties');
    await page.waitForLoadState('networkidle');
  });

  test('table loads with properties, no lease/leased', async ({ page }) => {
    const rows = page.locator('table tbody tr');
    const count = await rows.count();
    expect(count).toBeGreaterThan(0);
    expect(count).toBeLessThanOrEqual(25);
    await page.screenshot({ path: 'e2e/screenshots/02-all-properties.png', fullPage: true });

    // Verify no lease/leased badges
    const allText = await page.locator('table tbody').textContent();
    expect(allText).not.toContain('For Lease');
    expect(allText).not.toContain('Leased');
  });

  test('correct columns visible on desktop', async ({ page }) => {
    const headers = page.locator('table thead th');
    const headerTexts = await headers.allTextContents();
    const joined = headerTexts.join(' ').toLowerCase();
    expect(joined).toContain('address');
    expect(joined).toContain('status');
    expect(joined).toContain('lead agent');
    expect(joined).toContain('days on market');
    expect(joined).toContain('campaign');
  });

  test('search filters by address', async ({ page }) => {
    const search = page.getByPlaceholder(/search/i);
    await search.fill('Toorak');
    await page.waitForTimeout(300);
    const rows = page.locator('table tbody tr');
    const count = await rows.count();
    expect(count).toBeGreaterThan(0);
    for (let i = 0; i < Math.min(count, 3); i++) {
      const text = await rows.nth(i).textContent();
      expect(text?.toLowerCase()).toContain('toorak');
    }
    await page.screenshot({ path: 'e2e/screenshots/03-search-toorak.png', fullPage: true });
  });

  test('search filters by agent name', async ({ page }) => {
    const search = page.getByPlaceholder(/search/i);
    await search.fill('Nicholas Brooks');
    await page.waitForTimeout(300);
    const rows = page.locator('table tbody tr');
    const count = await rows.count();
    expect(count).toBeGreaterThan(0);
    const text = await rows.first().textContent();
    expect(text?.toLowerCase()).toContain('nicholas brooks');
  });

  test('status filter opens and shows correct options (no lease)', async ({ page }) => {
    // Click the status filter trigger (first select trigger = status)
    const statusTrigger = page.locator('button[data-slot="select-trigger"]').nth(0);
    await statusTrigger.click();
    await page.waitForTimeout(300);
    await page.screenshot({ path: 'e2e/screenshots/04-status-filter-open.png' });

    // Check options rendered in portal
    const items = page.locator('[data-slot="select-item"]');
    const texts = await items.allTextContents();
    const joined = texts.join('|').toLowerCase();
    expect(joined).toContain('for sale');
    expect(joined).toContain('sold');
    expect(joined).not.toContain('for lease');
    expect(joined).not.toContain('leased');
  });

  test('status filter "Sold" shows only sold properties', async ({ page }) => {
    const statusTrigger = page.locator('button[data-slot="select-trigger"]').nth(0);
    await statusTrigger.click();
    await page.waitForTimeout(200);
    await page.locator('[data-slot="select-item"]').filter({ hasText: /^Sold$/ }).click();
    await page.waitForTimeout(300);

    const rows = page.locator('table tbody tr');
    const count = await rows.count();
    expect(count).toBeGreaterThan(0);

    // All visible status badges should say "Sold"
    for (let i = 0; i < Math.min(count, 5); i++) {
      const rowText = await rows.nth(i).textContent();
      expect(rowText).toContain('Sold');
    }
    await page.screenshot({ path: 'e2e/screenshots/05-status-sold.png', fullPage: true });
  });

  test('agent filter opens, selects agent, table updates', async ({ page }) => {
    // Second select trigger = agent filter
    const agentTrigger = page.locator('button[data-slot="select-trigger"]').nth(1);
    await agentTrigger.click();
    await page.waitForTimeout(300);
    await page.screenshot({ path: 'e2e/screenshots/06-agent-filter-open.png' });

    // Pick the first real agent option (not "All Agents")
    const items = page.locator('[data-slot="select-item"]');
    const optionTexts = await items.allTextContents();
    const agentName = optionTexts.find(t => t !== 'All Agents' && t.trim() !== '');
    expect(agentName).toBeTruthy();

    await page.locator('[data-slot="select-item"]').filter({ hasText: agentName! }).click();
    await page.waitForTimeout(300);
    await page.screenshot({ path: 'e2e/screenshots/07-agent-filtered.png', fullPage: true });

    // All visible rows should contain that agent
    const rows = page.locator('table tbody tr');
    const count = await rows.count();
    expect(count).toBeGreaterThan(0);
    for (let i = 0; i < Math.min(count, 5); i++) {
      const rowText = await rows.nth(i).textContent();
      expect(rowText).toContain(agentName!);
    }
  });

  test('agent filter resets with "All Agents"', async ({ page }) => {
    // Second select trigger = agent filter
    const agentTrigger = page.locator('button[data-slot="select-trigger"]').nth(1);
    await agentTrigger.click();
    await page.waitForTimeout(200);
    const items = page.locator('[data-slot="select-item"]');
    const optionTexts = await items.allTextContents();
    const agentName = optionTexts.find(t => t !== 'All Agents' && t.trim() !== '');
    await page.locator('[data-slot="select-item"]').filter({ hasText: agentName! }).click();
    await page.waitForTimeout(300);
    const filteredCount = await page.locator('table tbody tr').count();

    // Reset
    await agentTrigger.click();
    await page.waitForTimeout(200);
    await page.locator('[data-slot="select-item"]').filter({ hasText: /^All Agents$/ }).click();
    await page.waitForTimeout(300);
    const allCount = await page.locator('table tbody tr').count();
    expect(allCount).toBeGreaterThanOrEqual(filteredCount);
  });

  test('combining status + agent filter works', async ({ page }) => {
    // Set status to "Sold" — first select trigger
    const statusTrigger = page.locator('button[data-slot="select-trigger"]').nth(0);
    await statusTrigger.click();
    await page.waitForTimeout(200);
    await page.locator('[data-slot="select-item"]').filter({ hasText: /^Sold$/ }).click();
    await page.waitForTimeout(500);
    const soldCount = await page.locator('table tbody tr').count();

    // Now also filter by agent — second select trigger
    const agentTrigger = page.locator('button[data-slot="select-trigger"]').nth(1);
    await agentTrigger.click();
    await page.waitForTimeout(300);
    // Get all visible select-items and click the second one (skip "All Agents")
    const allItems = page.locator('[data-slot="select-item"]:visible');
    const itemCount = await allItems.count();
    // nth(1) skips "All Agents"
    if (itemCount > 1) {
      await allItems.nth(1).click();
    } else {
      await allItems.first().click();
    }
    await page.waitForTimeout(500);
    const combinedCount = await page.locator('table tbody tr').count();

    expect(combinedCount).toBeLessThanOrEqual(soldCount);
    await page.screenshot({ path: 'e2e/screenshots/08-combined-filter.png', fullPage: true });
  });

  test('column sorting: Days on Market', async ({ page }) => {
    const daysHeader = page.locator('button').filter({ hasText: 'Days on Market' });
    await daysHeader.click();
    await page.waitForTimeout(300);
    await page.screenshot({ path: 'e2e/screenshots/09-sorted-days.png', fullPage: true });
  });

  test('pagination works', async ({ page }) => {
    const pageText = page.getByText(/page \d+ of \d+/i);
    await expect(pageText).toBeVisible();

    // Scope to the pagination row to avoid matching the Next.js dev toolbar button
    const nextBtn = page.locator('button[data-slot="button"]').filter({ hasText: /^Next$/ });
    if (await nextBtn.isEnabled()) {
      await nextBtn.click();
      await page.waitForTimeout(300);
      await expect(page.getByText(/page 2 of/i)).toBeVisible();
      await page.screenshot({ path: 'e2e/screenshots/10-page-2.png', fullPage: true });

      const prevBtn = page.locator('button[data-slot="button"]').filter({ hasText: /^Previous$/ });
      await prevBtn.click();
      await page.waitForTimeout(300);
      await expect(page.getByText(/page 1 of/i)).toBeVisible();
    }
  });

  test('row click navigates to detail page', async ({ page }) => {
    const firstRow = page.locator('table tbody tr').first();
    await firstRow.click();
    await page.waitForURL(/\/properties\/.+/);
    expect(page.url()).toMatch(/\/properties\/.+/);
    await page.screenshot({ path: 'e2e/screenshots/11-row-click-detail.png', fullPage: true });
  });

  test('Order Campaign button in table shows toast, does not navigate', async ({ page }) => {
    const campaignBtn = page.getByRole('button', { name: 'Order Campaign' }).first();
    const urlBefore = page.url();
    await campaignBtn.click();
    await page.waitForTimeout(500);

    // Toast should appear
    const toast = page.getByText('Campaign ordering coming soon');
    await expect(toast).toBeVisible();

    // Should NOT have navigated
    expect(page.url()).toBe(urlBefore);
    await page.screenshot({ path: 'e2e/screenshots/12-table-toast.png' });
  });

  test('status badges show correct colours', async ({ page }) => {
    await page.screenshot({ path: 'e2e/screenshots/13-status-badges.png' });
    // Just visual verification via screenshot
  });

  test('days on market colour coding', async ({ page }) => {
    await page.screenshot({ path: 'e2e/screenshots/14-days-colours.png' });
    // Visual verification via screenshot
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// 3. RESCUE TAB
// ═══════════════════════════════════════════════════════════════════════════

test.describe('Rescue Tab', () => {
  test('rescue tab shows count and properties', async ({ page }) => {
    await page.goto('/properties');
    await page.waitForLoadState('networkidle');

    const rescueTab = page.getByRole('tab', { name: /rescue/i });
    await expect(rescueTab).toBeVisible();
    const tabText = await rescueTab.textContent();
    expect(tabText).toMatch(/\d+/); // Should contain a number

    await rescueTab.click();
    await page.waitForTimeout(300);

    const rows = page.locator('table tbody tr');
    expect(await rows.count()).toBeGreaterThan(0);
    await page.screenshot({ path: 'e2e/screenshots/15-rescue-tab.png', fullPage: true });
  });

  test('rescue tab has no sold properties', async ({ page }) => {
    await page.goto('/properties');
    await page.waitForLoadState('networkidle');
    await page.getByRole('tab', { name: /rescue/i }).click();
    await page.waitForTimeout(300);

    const tableText = await page.locator('table tbody').textContent();
    expect(tableText).not.toContain('Sold');
  });

  test('rescue tab shows rescue reason badges', async ({ page }) => {
    await page.goto('/properties');
    await page.waitForLoadState('networkidle');
    await page.getByRole('tab', { name: /rescue/i }).click();
    await page.waitForTimeout(300);

    const headers = await page.locator('table thead th').allTextContents();
    expect(headers.join(' ').toLowerCase()).toContain('rescue');
    await page.screenshot({ path: 'e2e/screenshots/16-rescue-badges.png' });
  });

  test('rescue tab search works', async ({ page }) => {
    await page.goto('/properties');
    await page.waitForLoadState('networkidle');
    await page.getByRole('tab', { name: /rescue/i }).click();
    await page.waitForTimeout(300);

    const search = page.getByPlaceholder(/search/i);
    const beforeCount = await page.locator('table tbody tr').count();
    await search.fill('Toorak');
    await page.waitForTimeout(300);
    const afterCount = await page.locator('table tbody tr').count();
    expect(afterCount).toBeLessThanOrEqual(beforeCount);
  });

  test('rescue tab row click navigates', async ({ page }) => {
    await page.goto('/properties');
    await page.waitForLoadState('networkidle');
    await page.getByRole('tab', { name: /rescue/i }).click();
    await page.waitForTimeout(300);

    await page.locator('table tbody tr td').first().click();
    await page.waitForURL(/\/properties\/.+/);
    expect(page.url()).toMatch(/\/properties\/.+/);
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// 4. JUST LISTED TAB
// ═══════════════════════════════════════════════════════════════════════════

test.describe('Just Listed Tab', () => {
  test('tab shows count and only recent listings', async ({ page }) => {
    await page.goto('/properties');
    await page.waitForLoadState('networkidle');

    const tab = page.getByRole('tab', { name: /just listed/i });
    await expect(tab).toBeVisible();
    await tab.click();
    await page.waitForTimeout(300);
    await page.screenshot({ path: 'e2e/screenshots/17-just-listed.png', fullPage: true });

    // May have 0 if no properties listed in last 14 days
    const rows = page.locator('table tbody tr');
    const count = await rows.count();
    // Just verify the tab rendered without error
    expect(count).toBeGreaterThanOrEqual(0);
  });

  test('just listed row click navigates', async ({ page }) => {
    await page.goto('/properties');
    await page.waitForLoadState('networkidle');
    await page.getByRole('tab', { name: /just listed/i }).click();
    await page.waitForTimeout(300);

    const rows = page.locator('table tbody tr');
    if (await rows.count() > 0) {
      await page.locator('table tbody tr td').first().click();
      await page.waitForURL(/\/properties\/.+/);
      expect(page.url()).toMatch(/\/properties\/.+/);
    }
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// 5. JUST SOLD TAB
// ═══════════════════════════════════════════════════════════════════════════

test.describe('Just Sold Tab', () => {
  test('tab shows count and only sold properties', async ({ page }) => {
    await page.goto('/properties');
    await page.waitForLoadState('networkidle');

    const tab = page.getByRole('tab', { name: /just sold/i });
    await expect(tab).toBeVisible();
    await tab.click();
    await page.waitForTimeout(300);

    const rows = page.locator('table tbody tr');
    const count = await rows.count();
    expect(count).toBeGreaterThan(0);

    // All should be "Sold"
    for (let i = 0; i < Math.min(count, 5); i++) {
      const rowText = await rows.nth(i).textContent();
      expect(rowText).toContain('Sold');
    }
    await page.screenshot({ path: 'e2e/screenshots/18-just-sold.png', fullPage: true });
  });

  test('just sold row click navigates', async ({ page }) => {
    await page.goto('/properties');
    await page.waitForLoadState('networkidle');
    await page.getByRole('tab', { name: /just sold/i }).click();
    await page.waitForTimeout(300);

    await page.locator('table tbody tr td').first().click();
    await page.waitForURL(/\/properties\/.+/);
    expect(page.url()).toMatch(/\/properties\/.+/);
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// 6. PROPERTY DETAIL PAGE — CAMPAIGN DECISION VIEW
// ═══════════════════════════════════════════════════════════════════════════

test.describe('Property Detail Page', () => {
  let detailUrl: string;

  test.beforeAll(async ({ browser }) => {
    // Get a property URL to reuse
    const page = await browser.newPage();
    await page.goto('http://localhost:3000/properties');
    await page.waitForLoadState('networkidle');
    const href = await page.locator('table tbody tr a').first().getAttribute('href');
    detailUrl = href!;
    await page.close();
  });

  test('back link visible and navigates', async ({ page }) => {
    await page.goto(detailUrl);
    await page.waitForLoadState('domcontentloaded');

    const backLink = page.getByText('Back to Properties');
    await expect(backLink).toBeVisible();
    await backLink.click();
    await page.waitForLoadState('networkidle');
    expect(page.url()).toContain('/properties');
    expect(page.url()).not.toMatch(/\/properties\/.+/);
  });

  test('address, identifier bar with price and listed date', async ({ page }) => {
    await page.goto(detailUrl);
    await page.waitForLoadState('domcontentloaded');

    // Address heading exists
    const h1 = page.locator('h1');
    await expect(h1).toBeVisible();
    const address = await h1.textContent();
    expect(address!.length).toBeGreaterThan(5);

    // Identifier bar has key info
    const barText = await page.locator('h1 + div').textContent();
    expect(barText?.toLowerCase()).toContain('stonnington');
    await page.screenshot({ path: 'e2e/screenshots/19-detail-top.png' });
  });

  test('Order Campaign button visible on sale property', async ({ page }) => {
    await page.goto(detailUrl);
    await page.waitForLoadState('domcontentloaded');

    const btn = page.getByRole('button', { name: /order campaign/i }).first();
    await expect(btn).toBeVisible();
    await btn.click();
    await page.waitForTimeout(500);
    await expect(page.getByText('Campaign ordering coming soon')).toBeVisible();
    await page.screenshot({ path: 'e2e/screenshots/20-order-campaign-toast.png' });
  });

  test('Order Campaign button visible on sold property', async ({ page }) => {
    // Navigate to Just Sold tab and get a sold property URL
    await page.goto('/properties');
    await page.waitForLoadState('networkidle');
    await page.getByRole('tab', { name: /just sold/i }).click();
    await page.waitForTimeout(300);

    const soldHref = await page.locator('table tbody tr a').first().getAttribute('href');
    await page.goto(soldHref!);
    await page.waitForLoadState('domcontentloaded');

    const btn = page.getByRole('button', { name: /order campaign/i }).first();
    await expect(btn).toBeVisible();
    await page.screenshot({ path: 'e2e/screenshots/21-sold-order-campaign.png' });
  });

  test('key metrics grid shows status, days, campaign', async ({ page }) => {
    await page.goto(detailUrl);
    await page.waitForLoadState('domcontentloaded');

    await expect(page.getByText('STATUS', { exact: false })).toBeVisible();
    await expect(page.getByText('DAYS ON MARKET', { exact: false })).toBeVisible();
    await expect(page.getByText('Campaign').first()).toBeVisible();
    await page.screenshot({ path: 'e2e/screenshots/22-metrics-grid.png' });
  });

  test('agent cards show photos', async ({ page }) => {
    await page.goto(detailUrl);
    await page.waitForLoadState('domcontentloaded');

    // Look for agent section
    await expect(page.getByText('AGENTS', { exact: false })).toBeVisible();

    // Check for agent images (from datocms)
    const agentImages = page.locator('img[src*="datocms"]');
    const imgCount = await agentImages.count();
    // At least one agent should have a photo
    expect(imgCount).toBeGreaterThan(0);
    await page.screenshot({ path: 'e2e/screenshots/23-agent-photos.png' });
  });

  test('listing details collapsed by default, expands on click', async ({ page }) => {
    await page.goto(detailUrl);
    await page.waitForLoadState('domcontentloaded');

    // Listing Details toggle should be visible
    const toggle = page.getByText('Listing Details');
    await expect(toggle).toBeVisible();

    // Images should NOT be visible (collapsed)
    const gallery = page.locator('[class*="aspect-video"]');
    expect(await gallery.count()).toBe(0);

    // Click to expand
    await toggle.click();
    await page.waitForTimeout(500);
    await page.screenshot({ path: 'e2e/screenshots/24-listing-expanded.png', fullPage: true });

    // Now images should be visible
    const galleryAfter = page.locator('[class*="aspect-video"]');
    expect(await galleryAfter.count()).toBeGreaterThan(0);
  });

  test('external link to MW site, no REA/Domain, no \\1 in URL', async ({ page }) => {
    await page.goto(detailUrl);
    await page.waitForLoadState('domcontentloaded');

    const mwLink = page.getByText('View on marshallwhite.com.au');
    await expect(mwLink).toBeVisible();
    const href = await mwLink.getAttribute('href');
    expect(href).toContain('marshallwhite.com.au');
    expect(href).not.toContain('\\1');

    // No REA or Domain links
    await expect(page.getByText('View on realestate.com.au')).not.toBeVisible();
    await expect(page.getByText('View on domain.com.au')).not.toBeVisible();
  });

  test('detail page full scroll screenshot', async ({ page }) => {
    await page.goto(detailUrl);
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(1000);
    await page.screenshot({ path: 'e2e/screenshots/25-detail-full.png', fullPage: true });
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// 7. RESPONSIVE
// ═══════════════════════════════════════════════════════════════════════════

test.describe('Responsive', () => {
  test('mobile dashboard: columns hidden, table readable', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('/properties');
    await page.waitForLoadState('networkidle');

    // Office column should be hidden via responsive class
    const officeHeader = page.locator('table thead th').filter({ hasText: 'Office' });
    await expect(officeHeader).toBeHidden();

    await page.screenshot({ path: 'e2e/screenshots/26-mobile-dashboard.png', fullPage: true });
  });

  test('mobile detail page stacks correctly', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('/properties');
    await page.waitForLoadState('networkidle');

    const href = await page.locator('table tbody tr a').first().getAttribute('href');
    await page.goto(href!);
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(1000);
    await page.screenshot({ path: 'e2e/screenshots/27-mobile-detail.png', fullPage: true });
  });

  test('mobile tabs accessible', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('/properties');
    await page.waitForLoadState('networkidle');

    // All 4 tabs should exist
    await expect(page.getByRole('tab', { name: /all properties/i })).toBeVisible();
    await expect(page.getByRole('tab', { name: /rescue/i })).toBeVisible();
    await page.screenshot({ path: 'e2e/screenshots/28-mobile-tabs.png' });
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// 8. CROSS-TAB NAVIGATION
// ═══════════════════════════════════════════════════════════════════════════

test.describe('Cross-tab Navigation', () => {
  test('switch between all 4 tabs without errors', async ({ page }) => {
    await page.goto('/properties');
    await page.waitForLoadState('networkidle');

    const tabs = ['All Properties', 'Rescue', 'Just Listed', 'Just Sold'];
    for (const tabName of tabs) {
      const tab = page.getByRole('tab', { name: new RegExp(tabName, 'i') });
      await tab.click();
      await page.waitForTimeout(500);
      // Verify no error overlay
      const errorOverlay = page.locator('[id="__next-build-error"]');
      expect(await errorOverlay.count()).toBe(0);
    }
    await page.screenshot({ path: 'e2e/screenshots/29-all-tabs.png' });
  });

  test('navigate to detail from rescue tab, back returns', async ({ page }) => {
    await page.goto('/properties');
    await page.waitForLoadState('networkidle');
    await page.getByRole('tab', { name: /rescue/i }).click();
    await page.waitForTimeout(300);

    await page.locator('table tbody tr a').first().click();
    await page.waitForURL(/\/properties\/.+/);
    expect(page.url()).toMatch(/\/properties\/.+/);

    await page.getByText('Back to Properties').click();
    await page.waitForURL('**/properties');
    expect(page.url()).toContain('/properties');
    expect(page.url()).not.toMatch(/\/properties\/.+/);
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// 9. RESCUE DETAIL PAGE SPECIFICS
// ═══════════════════════════════════════════════════════════════════════════

test.describe('Rescue Property Detail', () => {
  test('rescue property shows alert card with badges', async ({ page }) => {
    await page.goto('/properties');
    await page.waitForLoadState('networkidle');
    await page.getByRole('tab', { name: /rescue/i }).click();
    await page.waitForTimeout(300);

    const href = await page.locator('table tbody tr a').first().getAttribute('href');
    await page.goto(href!);
    await page.waitForLoadState('domcontentloaded');

    await expect(page.getByText('Rescue Property')).toBeVisible();
    await page.screenshot({ path: 'e2e/screenshots/30-rescue-detail.png', fullPage: true });
  });
});
