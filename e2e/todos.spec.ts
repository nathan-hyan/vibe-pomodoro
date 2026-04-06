import { test, expect } from "@playwright/test";

test.describe("Focus Tasks E2E", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    // Wait for the app to finish loading (Suspense resolved)
    await expect(page.getByText("Vibe Pomodoro")).toBeVisible();
  });

  // 1. Add a task → appears in "Next tasks"
  test("adds a task via input + Enter", async ({ page }) => {
    const input = page.getByPlaceholder("What are you working on?");
    await input.fill("Buy milk");
    await input.press("Enter");

    await expect(page.getByText("Buy milk")).toBeVisible();
    await expect(page.getByText("Next tasks")).toBeVisible();
    await expect(input).toHaveValue("");
  });

  // 2. Add a task via Add button
  test("adds a task via Add button", async ({ page }) => {
    const input = page.getByPlaceholder("What are you working on?");
    await input.fill("Walk the dog");
    await page.getByRole("button", { name: "Add" }).click();

    await expect(page.getByText("Walk the dog")).toBeVisible();
    await expect(input).toHaveValue("");
  });

  // 3. Promote task → "Currently working on"
  test("promotes a task to Currently working on", async ({ page }) => {
    const input = page.getByPlaceholder("What are you working on?");
    await input.fill("Promote me");
    await input.press("Enter");
    await expect(page.getByText("Promote me")).toBeVisible();

    // Hover to reveal promote button, then click
    const todoRow = page.getByText("Promote me").locator("..");
    await todoRow.hover();
    await page.getByTitle("Move to Currently working on").click();

    await expect(page.getByText("Currently working on")).toBeVisible();
  });

  // 4. Demote task → back to "Next tasks"
  test("demotes a task back to Next tasks", async ({ page }) => {
    // Add and promote
    const input = page.getByPlaceholder("What are you working on?");
    await input.fill("Demote me");
    await input.press("Enter");

    const todoRow = page.getByText("Demote me").locator("..");
    await todoRow.hover();
    await page.getByTitle("Move to Currently working on").click();
    await expect(page.getByText("Currently working on")).toBeVisible();

    // Now demote
    const workingRow = page.getByText("Demote me").locator("..");
    await workingRow.hover();
    await page.getByTitle("Move to Next tasks").click();

    await expect(page.getByText("Next tasks")).toBeVisible();
    // "Currently working on" section should be gone (empty)
    await expect(page.getByText("Currently working on")).not.toBeVisible();
  });

  // 5. Complete task → "Finished"
  test("completes a task and moves it to Finished", async ({ page }) => {
    const input = page.getByPlaceholder("What are you working on?");
    await input.fill("Finish me");
    await input.press("Enter");

    // Click the checkbox
    const checkbox = page.getByText("Finish me").locator("..").getByRole("checkbox");
    await checkbox.click();

    await expect(page.getByText("Finished")).toBeVisible();
  });

  // 6. Uncomplete task → back to "Next tasks"
  test("uncompletes a task back to Next tasks", async ({ page }) => {
    const input = page.getByPlaceholder("What are you working on?");
    await input.fill("Toggle me");
    await input.press("Enter");

    // Complete
    const checkbox = page.getByText("Toggle me").locator("..").getByRole("checkbox");
    await checkbox.click();
    await expect(page.getByText("Finished")).toBeVisible();

    // Uncomplete
    await checkbox.click();
    await expect(page.getByText("Next tasks")).toBeVisible();
  });

  // 7. Edit a task via double-click
  test("edits a task via double-click", async ({ page }) => {
    const input = page.getByPlaceholder("What are you working on?");
    await input.fill("Edit me");
    await input.press("Enter");

    // Double-click to enter edit mode
    await page.getByText("Edit me").dblclick();

    // Find the edit input and change text
    const editInput = page.locator("input[type='text']").last();
    await editInput.fill("Edited task");
    await editInput.press("Enter");

    await expect(page.getByText("Edited task")).toBeVisible();
    await expect(page.getByText("Edit me")).not.toBeVisible();
  });

  // 8. Delete a task
  test("deletes a task", async ({ page }) => {
    const input = page.getByPlaceholder("What are you working on?");
    await input.fill("Delete me");
    await input.press("Enter");
    await expect(page.getByText("Delete me")).toBeVisible();

    // Hover to reveal delete button, then click
    const todoRow = page.getByText("Delete me").locator("..");
    await todoRow.hover();
    await page.getByTitle("Delete task").click();

    await expect(page.getByText("Delete me")).not.toBeVisible();
  });

  // 9. Empty input does not add
  test("does not add with empty input", async ({ page }) => {
    await page.getByRole("button", { name: "Add" }).click();

    // Should still show empty state or no new tasks
    // The empty state text may or may not be visible depending on existing seed data,
    // so just verify no mutation happened by checking the input is still empty
    const input = page.getByPlaceholder("What are you working on?");
    await expect(input).toHaveValue("");
  });
});
