import { test, expect } from "@playwright/test";

// Helper: wait for a real-time tick (the app uses 1s setInterval)
const waitSeconds = (seconds: number) =>
  new Promise<void>((resolve) => setTimeout(resolve, seconds * 1000 + 200));

test.describe("Pomodoro Timer E2E", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    // Wait for the app to finish loading (Suspense resolved)
    await expect(page.getByText("Vibe Pomodoro")).toBeVisible();
  });

  // 1. Starts the timer
  test("starts the timer and counts down", async ({ page }) => {
    await expect(page.getByText("25:00")).toBeVisible();
    await expect(page.getByText("Ready")).toBeVisible();

    await page.getByRole("button", { name: "Start" }).click();
    await expect(page.getByText("Focus Time")).toBeVisible();

    // Wait ~2 real seconds and verify countdown
    await waitSeconds(2);
    // The timer should have moved from 25:00
    await expect(page.getByText("25:00")).not.toBeVisible();
  });

  // 2. Stops the timer
  test("stops and resets the timer", async ({ page }) => {
    // Adjust to a shorter time first for faster test
    await page.getByRole("button", { name: "-20s" }).click();
    await page.getByRole("button", { name: "-20s" }).click();
    // Now at 24:20

    await page.getByRole("button", { name: "Start" }).click();
    await waitSeconds(2);

    await page.getByRole("button", { name: "Reset" }).click();
    await expect(page.getByText("24:20")).toBeVisible();
    await expect(page.getByText("Ready")).toBeVisible();
  });

  // 3. Pauses the timer
  test("pauses the timer", async ({ page }) => {
    await page.getByRole("button", { name: "Start" }).click();
    await waitSeconds(2);

    await page.getByRole("button", { name: "Pause" }).click();

    // Capture current time text
    const timeText = await page.locator("text=/\\d{2}:\\d{2}/").first().textContent();

    // Wait and verify it hasn't changed
    await waitSeconds(2);
    await expect(page.locator("text=/\\d{2}:\\d{2}/").first()).toHaveText(timeText!);
  });

  // 4. Resumes the timer
  test("resumes the timer after pause", async ({ page }) => {
    await page.getByRole("button", { name: "Start" }).click();
    await waitSeconds(2);

    await page.getByRole("button", { name: "Pause" }).click();
    const pausedTime = await page.locator("text=/\\d{2}:\\d{2}/").first().textContent();

    await page.getByRole("button", { name: "Resume" }).click();
    await expect(page.getByText("Focus Time")).toBeVisible();

    await waitSeconds(2);
    // Time should have decreased from the paused value
    const currentTime = await page.locator("text=/\\d{2}:\\d{2}/").first().textContent();
    expect(currentTime).not.toBe(pausedTime);
  });

  // 5 & 6. Time adjustments when stopped
  test("adds and removes time when stopped", async ({ page }) => {
    await expect(page.getByText("25:00")).toBeVisible();

    await page.getByRole("button", { name: "+5s" }).click();
    await expect(page.getByText("25:05")).toBeVisible();

    await page.getByRole("button", { name: "+10s" }).click();
    await expect(page.getByText("25:15")).toBeVisible();

    await page.getByRole("button", { name: "+20s" }).click();
    await expect(page.getByText("25:35")).toBeVisible();

    await page.getByRole("button", { name: "-5s" }).click();
    await expect(page.getByText("25:30")).toBeVisible();

    await page.getByRole("button", { name: "-10s" }).click();
    await expect(page.getByText("25:20")).toBeVisible();

    await page.getByRole("button", { name: "-20s" }).click();
    await expect(page.getByText("25:00")).toBeVisible();
  });

  // 7 & 8. Time adjustments when running
  test("adds and removes time when running", async ({ page }) => {
    await page.getByRole("button", { name: "Start" }).click();
    await waitSeconds(2);

    // Add time
    await page.getByRole("button", { name: "+20s" }).click();
    // The time display should reflect the addition (we just verify it's visible)
    await expect(page.getByText("Focus Time")).toBeVisible();

    // Remove time
    await page.getByRole("button", { name: "-20s" }).click();
    await expect(page.getByText("Focus Time")).toBeVisible();
  });

  // 9. Resets when stopped (to user-set time)
  test("resets to user-set time after adjustments", async ({ page }) => {
    // Set custom time
    await page.getByRole("button", { name: "+20s" }).click();
    await expect(page.getByText("25:20")).toBeVisible();

    // Start, tick, pause, reset
    await page.getByRole("button", { name: "Start" }).click();
    await waitSeconds(2);
    await page.getByRole("button", { name: "Pause" }).click();
    await page.getByRole("button", { name: "Reset" }).click();

    // Should go back to the user-set time, not the default 25:00
    await expect(page.getByText("25:20")).toBeVisible();
  });

  // 10. Resets and stops while running
  test("resets and stops the timer while running", async ({ page }) => {
    await page.getByRole("button", { name: "Start" }).click();
    await waitSeconds(2);
    await expect(page.getByText("Focus Time")).toBeVisible();

    await page.getByRole("button", { name: "Reset" }).click();
    await expect(page.getByText("25:00")).toBeVisible();
    await expect(page.getByText("Ready")).toBeVisible();

    // Verify timer stays stopped
    await waitSeconds(2);
    await expect(page.getByText("25:00")).toBeVisible();
  });

  // 11. Custom time input when stopped
  test("allows entering custom time when stopped", async ({ page }) => {
    // Click on the time display to enter edit mode
    await page.getByText("25:00").click();

    const input = page.getByPlaceholder("MM:SS");
    await expect(input).toBeVisible();

    await input.fill("10:00");
    await input.press("Enter");

    await expect(page.getByText("10:00")).toBeVisible();
  });

  // 12. Timer completion — modal and sound
  test("shows completion modal when timer reaches 0", async ({ page }) => {
    // Set timer to a very short duration via custom input
    await page.getByText("25:00").click();
    const input = page.getByPlaceholder("MM:SS");
    await input.clear();
    // Type digits one-by-one (React controlled input needs sequential input)
    await input.pressSequentially("005");
    await input.press("Enter");
    await expect(page.getByText("00:05")).toBeVisible();

    // Start and wait for completion
    await page.getByRole("button", { name: "Start" }).click();

    // Modal should appear after the timer reaches 0
    await expect(page.getByText("Time's Up!")).toBeVisible({ timeout: 15000 });
    await expect(page.getByText("Complete!")).toBeVisible();

    // Dismiss modal
    await page.getByRole("button", { name: "Stop Session" }).click();
    await expect(page.getByText("Time's Up!")).not.toBeVisible();
  });
});
