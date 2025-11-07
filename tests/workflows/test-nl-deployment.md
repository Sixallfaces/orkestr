# Test: Deployment Pipeline Creation

## Test Complex Workflow with Variable Binding

**Input:** `/orchestration:create deploy with security validation`

**Expected Questions:**
1. "What validations should this include?" (multi-select)
   - Options: Tests, Security scan, Linting, Type checking

2. "What if validation fails?" (single-select)
   - Options: Fix and retry, Notify only, Block deployment, Manual review

3. "What if deployment fails?" (single-select)
   - Options: Rollback automatically, Notify only, Manual intervention

**Sample Answers:**
- Validations: Tests, Security scan, Linting
- If validation fails: Fix and retry
- If deployment fails: Rollback automatically

**Expected Generated Syntax:**
```
require-clean-working-tree ->
build ->
[test || security-scan || lint] (all success):validation-passed~>
(if !validation-passed)~> fix -> @retry ->
(if validation-passed)~> @pre-deploy -> deploy ->
smoke-test (if failed):deployment-failed~>
  (if deployment-failed)~> rollback -> notify-failure ->
  (if !deployment-failed)~> notify-success
```

**Verification Points:**
- [ ] Pattern identified as deployment pipeline
- [ ] Variable binding: `validation-passed`, `deployment-failed`
- [ ] Negative conditions: `(if !validation-passed)`, `(if !deployment-failed)`
- [ ] Parallel validations: `[test || security-scan || lint]`
- [ ] Conditional aggregation: `(all success)`
- [ ] Guard added: `require-clean-working-tree`
- [ ] Checkpoint added: `@pre-deploy`
- [ ] Rollback path included

**Expected Custom Syntax:**
- May create `@pre-deploy` checkpoint if not in global library
- May create `require-clean-working-tree` guard if not in global library

**Expected Promotion Prompt:**
- Should ask if want to promote custom syntax to global library

**Manual Test Steps:**
1. Run `/orchestration:create deploy with security validation`
2. Answer questions as specified above
3. Verify generated syntax matches expected
4. Check custom syntax created if needed
5. Save as template
6. Choose to promote custom syntax to global library
7. Verify files created in library/syntax/
8. Run template to ensure it executes correctly
