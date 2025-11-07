# Test: Security Audit Workflow

## Test Custom Syntax Creation

**Input:** `/orchestration:create security audit for auth module`

**Expected Questions:**
1. "What security checks should this include?" (multi-select)
   - Options: Code review, Dependency scan, Static analysis, Penetration testing

2. "What if issues are found?" (single-select)
   - Options: Automatic fix attempt, Manual review required, Block changes, Document only

3. "How critical are these checks?" (single-select)
   - Options: Blocking (must pass), Warning only, Informational

**Sample Answers:**
- Security checks: Code review, Dependency scan
- If issues found: Manual review required
- Criticality: Blocking

**Expected Generated Syntax:**
```
explore:"analyze auth module security" ->
[code-reviewer:"security" || dependency-scan] (any failed):has-issues~>
(if has-issues)~> @security-review -> fix-issues -> verify (if passed)~> document ->
(if !has-issues)~> document-findings
```

**Expected Custom Syntax:**
- `@security-review` checkpoint with specific prompt
- `tool:dependency-scan` if not in global library
- Possibly `(if any failed)` condition

**Verification Points:**
- [ ] Pattern identified as security audit
- [ ] Variable binding: `has-issues`
- [ ] Negative condition: `(if !has-issues)`
- [ ] Parallel checks: `[code-reviewer:"security" || dependency-scan]`
- [ ] Custom checkpoint created: `@security-review`
- [ ] Conditional paths for both cases

**Expected @security-review Definition:**
```yaml
@security-review: checkpoint
description: Security review checkpoint
prompt: Review security findings. Verify issues are addressed before proceeding.
```

**Manual Test Steps:**
1. Run `/orchestration:create security audit for auth module`
2. Answer questions as specified above
3. Verify generated syntax matches expected
4. Check @security-review checkpoint created
5. Verify checkpoint has appropriate prompt
6. Save as template
7. Verify Definitions section includes checkpoint
8. Choose to promote @security-review to global library
9. Verify library/syntax/checkpoints/security-review.md created
10. Create another workflow that could use security review
11. Verify system reuses existing @security-review instead of creating new one
