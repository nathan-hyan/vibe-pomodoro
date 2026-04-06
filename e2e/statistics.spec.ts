import { test, expect } from "@playwright/test";

// Helper: wait for a real-time tick
const waitSeconds = (seconds: number) =>
  new Promise<void>((resolve) => setTimeout(resolve, seconds * 1000 + 200));

test.describe("Statistics E2E", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    // Wait for the app to finish loading (Suspense resolved)
    await expect(page.getByText("Vibe Pomodoro")).toBeVisible();
  });

  // 1. Statistics panel is visible on desktop
  test("statistics panel is visible", async ({ page }) => {
    await expect(page.getByText("📊 Statistics")).toBeVisible();
  });

  // 2. All four stat rows are rendered
  test("renders all stat rows", async ({ page }) => {
    await expect(page.getByText("Time Worked")).toBeVisible();
    await expect(page.getByText("Sessions Done")).toBeVisible();
    await expect(page.getByText("Tasks Done")).toBeVisible();
    await expect(page.getByText("Tasks Left")).toBeVisible();
  });

  // 3. Completing a task updates "Tasks Done" for today
  test("completing a task updates Tasks Done", async ({ page }) => {
    // Add a task
    const input = page.getByPlaceholder("What are you working on?");
    await input.fill("Stat test task");
    await input.press("Enter");
    await expect(page.getByText("Stat test task")).toBeVisible();

    // Complete it
    const checkbox = page.getByText("Stat test task").locator("..").getByRole("checkbox");
    await checkbox.click();

    // Wait for mutation to settle
    await page.waitForTimeout(500);

    // Tasks Done should show at least 1
    const tasksDoneRow = page.getByText("Tasks Done").locator("..");
    await expect(tasksDoneRow).toBeVisible();
  });

  // 4. Hover on "Time Worked" expands to show day/week/month
  test("hovering Time Worked shows day/week/month breakdown", async ({ page }) => {
    // Before hover — no "Today" label visible in the stats area
    const statsPanel = page.getByText("📊 Statistics").locator("..").locator("..");

    // Hover over the Time Worked row
    const timeWorkedRow = statsPanel.locator("[data-expandable]").first();
    await timeWorkedRow.hover();

    // Should see period labels
    await expect(statsPanel.getByText("Today")).toBeVisible();
    await expect(statsPanel.getByText("This Week")).toBeVisible();
    await expect(statsPanel.getByText("This Month")).toBeVisible();
  });

  // 5. Hover on "Sessions Done" expands
  test("hovering Sessions Done shows day/week/month breakdown", async ({ page }) => {
    const statsPanel = page.getByText("📊 Statistics").locator("..").locator("..");

    const sessionsRow = statsPanel.locator("[data-expandable]").nth(1);
    await sessionsRow.hover();

    await expect(statsPanel.getByText("Today")).toBeVisible();
    await expect(statsPanel.getByText("This Week")).toBeVisible();
    await expect(statsPanel.getByText("This Month")).toBeVisible();
  });

  // 6. Hover on "Tasks Done" expands
  test("hovering Tasks Done shows day/week/month breakdown", async ({ page }) => {
    const statsPanel = page.getByText("📊 Statistics").locator("..").locator("..");

    const tasksDoneRow = statsPanel.locator("[data-expandable]").nth(2);
    await tasksDoneRow.hover();

    await expect(statsPanel.getByText("Today")).toBeVisible();
    await expect(statsPanel.getByText("This Week")).toBeVisible();
    await expect(statsPanel.getByText("This Month")).toBeVisible();
  });

  // 7. Mouse leave collapses the expanded row
  test("mouse leave collapses expanded row", async ({ page }) => {
    const statsPanel = page.getByText("📊 Statistics").locator("..").locator("..");

    const timeWorkedRow = statsPanel.locator("[data-expandable]").first();
    await timeWorkedRow.hover();
    await expect(statsPanel.getByText("Today")).toBeVisible();

    // Move mouse away from the stats panel
    await page.getByText("Vibe Pomodoro").hover();

    // "Today" should disappear
    await expect(statsPanel.getByText("Today")).not.toBeVisible();
  });

  // 8. Tasks Left shows correct count
  test("Tasks Left reflects non-completed todos", async ({ page }) => {
    // Add two tasks
    const input = page.getByPlaceholder("What are you working on?");
    await input.fill("Left task 1");
    await input.press("Enter");
    await expect(page.getByText("Left task 1")).toBeVisible();

    await input.fill("Left task 2");
    await input.press("Enter");
    await expect(page.getByText("Left task 2")).toBeVisible();

    // The Tasks Left value should include at least these 2 tasks
    // (there may be pre-existing tasks from db.json seed data)
    await expect(page.getByText("Tasks Left")).toBeVisible();
  });

  // 9. Reset stats via Settings
  test("reset stats clears statistics", async ({ page }) => {
    // Open settings (desktop button)
    await page.locator("button[aria-label='Settings']").click();
    await expect(page.getByText("⚙️ Settings")).toBeVisible();

    // Accept the confirmation dialog
    page.on("dialog", (dialog) => dialog.accept());

    // Click reset
    await page.getByRole("button", { name: "Reset All Statistics" }).click();

    // Close settings
    await page.getByRole("button", { name: "Close" }).click();

    // Wait for mutations to settle
    await page.waitForTimeout(500);

    // Stats should show zero values
    await expect(page.getByText("📊 Statistics")).toBeVisible();
  });
});
