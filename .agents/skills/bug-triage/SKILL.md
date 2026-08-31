---
name: bug-triage
description: 'Use when diagnosing and fixing a reported software bug with a regression test: reproduce the behavior, identify its owning code path, make a focused fix, and verify the regression test passes.'
---

# Bug Triage

Use this workflow for a concrete bug report when a practical automated test can capture the expected behavior.

## Procedure

1. **Establish the failure.** Translate the report into observable expected and actual behavior. Find the narrowest public boundary that owns the behavior and inspect nearby tests and repository instructions. When reproduction requires the isolated test database or API, use the `spawn-test-app` skill. State a falsifiable root-cause hypothesis and the cheapest check that could disprove it.
2. **Write a regression test first.** Add one focused test at the existing test seam, using the project's conventions. Assert the externally meaningful behavior, not private implementation details. Keep the test specific enough that it fails for the reported bug.
3. **Run the test red.** Execute the narrow test or test filter. Confirm it fails for the expected reason. If it passes, revise the test or the hypothesis before changing production code. If it fails for an unrelated setup issue, fix the test setup first.
4. **Fix the owning behavior.** Make the smallest root-cause change that satisfies the expected behavior. Preserve existing contracts and unrelated work. Add a second boundary test only when the same input crosses another independently failing boundary.
5. **Verify green.** Rerun the regression test and then the narrow related test set or required checks. Do not broaden verification without a meaningful risk or repository requirement.
6. **Report the result.** Summarize the cause, fix, tests run, and any remaining unverified behavior. Do not claim a test passed unless it was run successfully.

## Guardrails

- Do not modify production code before the regression test demonstrates the bug when a practical test path exists.
- Keep the test and fix in the layer that controls the behavior; do not mask a backend defect with UI-only validation or vice versa.
- Do not weaken or delete assertions just to make the test pass.
- If a test cannot reproduce the report, take one nearby diagnostic step and update the hypothesis before editing production code.
- Avoid unrelated cleanup, refactoring, or broad test additions.