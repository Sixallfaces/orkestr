# Test: Simple TDD Workflow Creation

## Test Natural Language to Syntax Generation

**Input:** `/orchestration:create implement auth feature with TDD`

**Expected Questions:**
1. "What should this workflow include?" (multi-select)
   - Options should include: Error retry, Code review, Logging, Documentation

**Sample Answers:**
- Select: Error retry, Code review

**Expected Generated Syntax:**
```
@try -> write-test:"auth feature" ->
run-test (if failed):tests-failing~>
  (if tests-failing)~> implement:"auth feature" -> run-test (if failed)~> @try ->
  (if !tests-failing)~> code-review (if approved):review-passed~>
    (if review-passed)~> merge ->
    (if !review-passed)~> @review-feedback
```

**Verification Points:**
- [ ] Pattern identified as TDD
- [ ] Variable binding used: `tests-failing`, `review-passed`
- [ ] Negative conditions used: `(if !tests-failing)`, `(if !review-passed)`
- [ ] Retry loop structure correct
- [ ] Code review conditional added based on answer

**Expected Template Save:**
- Name suggestion: `tdd-auth` or similar
- Parameters extracted: `feature` from "auth feature"
- Definitions section: Empty (no custom syntax needed)

**Manual Test Steps:**
1. Run `/orchestration:create implement auth feature with TDD`
2. Answer questions as specified above
3. Verify generated syntax matches expected
4. Save as template
5. Verify template file created in examples/
6. Run template to ensure it executes correctly
