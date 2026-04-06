# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: todos.spec.ts >> Focus Tasks E2E >> promotes a task to Currently working on
- Location: e2e/todos.spec.ts:32:3

# Error details

```
Error: locator.click: Error: strict mode violation: getByTitle('Move to Currently working on') resolved to 9 elements:
    1) <button title="Move to Currently working on" class="text-white/40 hover:text-violet-400 transition-all cursor-pointer text-sm">▲</button> aka getByRole('button', { name: '▲' }).first()
    2) <button title="Move to Currently working on" class="text-white/40 hover:text-violet-400 transition-all cursor-pointer text-sm">▲</button> aka getByRole('button', { name: '▲' }).nth(1)
    3) <button title="Move to Currently working on" class="text-white/40 hover:text-violet-400 transition-all cursor-pointer text-sm">▲</button> aka getByRole('button', { name: '▲' }).nth(2)
    4) <button title="Move to Currently working on" class="text-white/40 hover:text-violet-400 transition-all cursor-pointer text-sm">▲</button> aka getByRole('button', { name: '▲' }).nth(3)
    5) <button title="Move to Currently working on" class="text-white/40 hover:text-violet-400 transition-all cursor-pointer text-sm">▲</button> aka getByRole('button', { name: '▲' }).nth(4)
    6) <button title="Move to Currently working on" class="text-white/40 hover:text-violet-400 transition-all cursor-pointer text-sm">▲</button> aka getByRole('button', { name: '▲' }).nth(5)
    7) <button title="Move to Currently working on" class="text-white/40 hover:text-violet-400 transition-all cursor-pointer text-sm">▲</button> aka locator('div:nth-child(7) > .flex > .text-white\\/40.hover\\:text-violet-400')
    8) <button title="Move to Currently working on" class="text-white/40 hover:text-violet-400 transition-all cursor-pointer text-sm">▲</button> aka locator('div:nth-child(8) > .flex > .text-white\\/40.hover\\:text-violet-400')
    9) <button title="Move to Currently working on" class="text-white/40 hover:text-violet-400 transition-all cursor-pointer text-sm">▲</button> aka locator('div:nth-child(9) > .flex > .text-white\\/40.hover\\:text-violet-400')

Call log:
  - waiting for getByTitle('Move to Currently working on')

```

# Page snapshot

```yaml
- generic [ref=e3]:
  - button "Settings" [ref=e4] [cursor=pointer]:
    - generic [ref=e5]: ⚙️
  - generic [ref=e7]:
    - generic [ref=e9]:
      - heading "🍅 Vibe Pomodoro" [level=1] [ref=e10]
      - generic [ref=e11]:
        - img [ref=e12]
        - generic [ref=e16]:
          - generic "Click to edit time" [ref=e17] [cursor=pointer]: 25:00
          - generic [ref=e18]: Ready
      - generic [ref=e19]:
        - generic [ref=e20]:
          - button "-20s" [ref=e21] [cursor=pointer]
          - button "-10s" [ref=e22] [cursor=pointer]
          - button "-5s" [ref=e23] [cursor=pointer]
          - button "+5s" [ref=e24] [cursor=pointer]
          - button "+10s" [ref=e25] [cursor=pointer]
          - button "+20s" [ref=e26] [cursor=pointer]
        - generic [ref=e27]:
          - button "Start" [ref=e28] [cursor=pointer]
          - button "Reset" [disabled] [ref=e29]
    - generic [ref=e30]:
      - generic [ref=e34]:
        - heading "Focus Tasks" [level=2] [ref=e35]
        - generic [ref=e36]:
          - textbox "What are you working on?" [active] [ref=e37]
          - button "Add" [ref=e38] [cursor=pointer]
        - generic [ref=e40]:
          - heading "Next tasks" [level=3] [ref=e41]
          - generic [ref=e42]:
            - generic [ref=e43]:
              - checkbox [ref=e44] [cursor=pointer]
              - generic [ref=e45]: what
              - generic [ref=e46]:
                - button "▲" [ref=e47] [cursor=pointer]
                - button "✕" [ref=e48] [cursor=pointer]
            - generic [ref=e49]:
              - checkbox [ref=e50] [cursor=pointer]
              - generic [ref=e51]: Stat test task
              - generic [ref=e52]:
                - button "▲" [ref=e53] [cursor=pointer]
                - button "✕" [ref=e54] [cursor=pointer]
            - generic [ref=e55]:
              - checkbox [ref=e56] [cursor=pointer]
              - generic [ref=e57]: Left task 1
              - generic [ref=e58]:
                - button "▲" [ref=e59] [cursor=pointer]
                - button "✕" [ref=e60] [cursor=pointer]
            - generic [ref=e61]:
              - checkbox [ref=e62] [cursor=pointer]
              - generic [ref=e63]: Left task 2
              - generic [ref=e64]:
                - button "▲" [ref=e65] [cursor=pointer]
                - button "✕" [ref=e66] [cursor=pointer]
            - generic [ref=e67]:
              - checkbox [ref=e68] [cursor=pointer]
              - generic [ref=e69]: Stat test task
              - generic [ref=e70]:
                - button "▲" [ref=e71] [cursor=pointer]
                - button "✕" [ref=e72] [cursor=pointer]
            - generic [ref=e73]:
              - checkbox [ref=e74] [cursor=pointer]
              - generic [ref=e75]: Left task 1
              - generic [ref=e76]:
                - button "▲" [ref=e77] [cursor=pointer]
                - button "✕" [ref=e78] [cursor=pointer]
            - generic [ref=e79]:
              - checkbox [ref=e80] [cursor=pointer]
              - generic [ref=e81]: Buy milk
              - generic [ref=e82]:
                - button "▲" [ref=e83] [cursor=pointer]
                - button "✕" [ref=e84] [cursor=pointer]
            - generic [ref=e85]:
              - checkbox [ref=e86] [cursor=pointer]
              - generic [ref=e87]: Left task 2
              - generic [ref=e88]:
                - button "▲" [ref=e89] [cursor=pointer]
                - button "✕" [ref=e90] [cursor=pointer]
            - generic [ref=e91]:
              - checkbox [ref=e92] [cursor=pointer]
              - generic [ref=e93]: Promote me
              - generic [ref=e94]:
                - button "▲" [ref=e95] [cursor=pointer]
                - button "✕" [ref=e96] [cursor=pointer]
      - generic [ref=e100]:
        - heading "📊 Statistics" [level=3] [ref=e101]
        - generic [ref=e102]:
          - generic [ref=e104]:
            - generic [ref=e105]:
              - generic [ref=e106]: ⏱️
              - generic [ref=e107]: Time Worked
            - generic [ref=e108]: 0m
          - generic [ref=e110]:
            - generic [ref=e111]:
              - generic [ref=e112]: 🍅
              - generic [ref=e113]: Sessions Done
            - generic [ref=e114]: "0"
          - generic [ref=e116]:
            - generic [ref=e117]:
              - generic [ref=e118]: ✓
              - generic [ref=e119]: Tasks Done
            - generic [ref=e120]: "0"
          - generic [ref=e121]:
            - generic [ref=e122]:
              - generic [ref=e123]: 📝
              - generic [ref=e124]: Tasks Left
            - generic [ref=e125]: "11"
```

# Test source

```ts
  1   | import { test, expect } from "@playwright/test";
  2   | 
  3   | test.describe("Focus Tasks E2E", () => {
  4   |   test.beforeEach(async ({ page }) => {
  5   |     await page.goto("/");
  6   |     // Wait for the app to finish loading (Suspense resolved)
  7   |     await expect(page.getByText("Vibe Pomodoro")).toBeVisible();
  8   |   });
  9   | 
  10  |   // 1. Add a task → appears in "Next tasks"
  11  |   test("adds a task via input + Enter", async ({ page }) => {
  12  |     const input = page.getByPlaceholder("What are you working on?");
  13  |     await input.fill("Buy milk");
  14  |     await input.press("Enter");
  15  | 
  16  |     await expect(page.getByText("Buy milk")).toBeVisible();
  17  |     await expect(page.getByText("Next tasks")).toBeVisible();
  18  |     await expect(input).toHaveValue("");
  19  |   });
  20  | 
  21  |   // 2. Add a task via Add button
  22  |   test("adds a task via Add button", async ({ page }) => {
  23  |     const input = page.getByPlaceholder("What are you working on?");
  24  |     await input.fill("Walk the dog");
  25  |     await page.getByRole("button", { name: "Add" }).click();
  26  | 
  27  |     await expect(page.getByText("Walk the dog")).toBeVisible();
  28  |     await expect(input).toHaveValue("");
  29  |   });
  30  | 
  31  |   // 3. Promote task → "Currently working on"
  32  |   test("promotes a task to Currently working on", async ({ page }) => {
  33  |     const input = page.getByPlaceholder("What are you working on?");
  34  |     await input.fill("Promote me");
  35  |     await input.press("Enter");
  36  |     await expect(page.getByText("Promote me")).toBeVisible();
  37  | 
  38  |     // Hover to reveal promote button, then click
  39  |     const todoRow = page.getByText("Promote me").locator("..");
  40  |     await todoRow.hover();
> 41  |     await page.getByTitle("Move to Currently working on").click();
      |                                                           ^ Error: locator.click: Error: strict mode violation: getByTitle('Move to Currently working on') resolved to 9 elements:
  42  | 
  43  |     await expect(page.getByText("Currently working on")).toBeVisible();
  44  |   });
  45  | 
  46  |   // 4. Demote task → back to "Next tasks"
  47  |   test("demotes a task back to Next tasks", async ({ page }) => {
  48  |     // Add and promote
  49  |     const input = page.getByPlaceholder("What are you working on?");
  50  |     await input.fill("Demote me");
  51  |     await input.press("Enter");
  52  | 
  53  |     const todoRow = page.getByText("Demote me").locator("..");
  54  |     await todoRow.hover();
  55  |     await page.getByTitle("Move to Currently working on").click();
  56  |     await expect(page.getByText("Currently working on")).toBeVisible();
  57  | 
  58  |     // Now demote
  59  |     const workingRow = page.getByText("Demote me").locator("..");
  60  |     await workingRow.hover();
  61  |     await page.getByTitle("Move to Next tasks").click();
  62  | 
  63  |     await expect(page.getByText("Next tasks")).toBeVisible();
  64  |     // "Currently working on" section should be gone (empty)
  65  |     await expect(page.getByText("Currently working on")).not.toBeVisible();
  66  |   });
  67  | 
  68  |   // 5. Complete task → "Finished"
  69  |   test("completes a task and moves it to Finished", async ({ page }) => {
  70  |     const input = page.getByPlaceholder("What are you working on?");
  71  |     await input.fill("Finish me");
  72  |     await input.press("Enter");
  73  | 
  74  |     // Click the checkbox
  75  |     const checkbox = page.getByText("Finish me").locator("..").getByRole("checkbox");
  76  |     await checkbox.click();
  77  | 
  78  |     await expect(page.getByText("Finished")).toBeVisible();
  79  |   });
  80  | 
  81  |   // 6. Uncomplete task → back to "Next tasks"
  82  |   test("uncompletes a task back to Next tasks", async ({ page }) => {
  83  |     const input = page.getByPlaceholder("What are you working on?");
  84  |     await input.fill("Toggle me");
  85  |     await input.press("Enter");
  86  | 
  87  |     // Complete
  88  |     const checkbox = page.getByText("Toggle me").locator("..").getByRole("checkbox");
  89  |     await checkbox.click();
  90  |     await expect(page.getByText("Finished")).toBeVisible();
  91  | 
  92  |     // Uncomplete
  93  |     await checkbox.click();
  94  |     await expect(page.getByText("Next tasks")).toBeVisible();
  95  |   });
  96  | 
  97  |   // 7. Edit a task via double-click
  98  |   test("edits a task via double-click", async ({ page }) => {
  99  |     const input = page.getByPlaceholder("What are you working on?");
  100 |     await input.fill("Edit me");
  101 |     await input.press("Enter");
  102 | 
  103 |     // Double-click to enter edit mode
  104 |     await page.getByText("Edit me").dblclick();
  105 | 
  106 |     // Find the edit input and change text
  107 |     const editInput = page.locator("input[type='text']").last();
  108 |     await editInput.fill("Edited task");
  109 |     await editInput.press("Enter");
  110 | 
  111 |     await expect(page.getByText("Edited task")).toBeVisible();
  112 |     await expect(page.getByText("Edit me")).not.toBeVisible();
  113 |   });
  114 | 
  115 |   // 8. Delete a task
  116 |   test("deletes a task", async ({ page }) => {
  117 |     const input = page.getByPlaceholder("What are you working on?");
  118 |     await input.fill("Delete me");
  119 |     await input.press("Enter");
  120 |     await expect(page.getByText("Delete me")).toBeVisible();
  121 | 
  122 |     // Hover to reveal delete button, then click
  123 |     const todoRow = page.getByText("Delete me").locator("..");
  124 |     await todoRow.hover();
  125 |     await page.getByTitle("Delete task").click();
  126 | 
  127 |     await expect(page.getByText("Delete me")).not.toBeVisible();
  128 |   });
  129 | 
  130 |   // 9. Empty input does not add
  131 |   test("does not add with empty input", async ({ page }) => {
  132 |     await page.getByRole("button", { name: "Add" }).click();
  133 | 
  134 |     // Should still show empty state or no new tasks
  135 |     // The empty state text may or may not be visible depending on existing seed data,
  136 |     // so just verify no mutation happened by checking the input is still empty
  137 |     const input = page.getByPlaceholder("What are you working on?");
  138 |     await expect(input).toHaveValue("");
  139 |   });
  140 | });
  141 | 
```