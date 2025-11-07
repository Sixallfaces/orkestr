# Security Scan with Temporary Agents

This example demonstrates using temporary agents to perform a security audit workflow.

## Workflow

```
$security-scanner := {
  base: "general-purpose",
  prompt: "You are a security expert. Focus on OWASP top 10 vulnerabilities: SQL injection, XSS, CSRF, authentication flaws, and authorization issues. Provide specific line numbers and code examples.",
  model: "opus"
}

$fixer := {
  base: "expert-code-implementer",
  prompt: "Fix security vulnerabilities while maintaining functionality. Add comments explaining the security fix. Follow secure coding best practices.",
  model: "sonnet"
}

$security-scanner:"Scan authentication and authorization code in the project":issues ->
@review-issues ->
$fixer:"Fix the following security issues: {issues}":fixes ->
general-purpose:"Verify all security fixes are properly implemented and test still pass"
```

## Execution Flow

1. **Define temporary agents**
   - `$security-scanner` - Opus model for thorough analysis
   - `$fixer` - Sonnet model for implementation

2. **Security scan**
   - Scanner uses specialized security prompt
   - Output captured to `issues` variable

3. **Review checkpoint**
   - User reviews found issues
   - Can jump, edit, or continue

4. **Apply fixes**
   - Fixer receives issues via `{issues}` interpolation
   - Output captured to `fixes` variable

5. **Verification**
   - Standard agent verifies fixes

## Benefits

- **Specialized prompts**: Each agent has domain-specific instructions
- **Model optimization**: Use Opus for analysis, Sonnet for implementation
- **State passing**: Issues flow from scanner to fixer
- **No agent pollution**: Agents exist only for this workflow
- **Clear intent**: Workflow shows exactly what each agent does

## Usage

```bash
/orchestration:run [paste workflow above]
```

## Expected Output

```
Temporary agents detected:
  - security-scanner (general-purpose with opus)
  - fixer (expert-code-implementer with sonnet)

Variables to capture:
  - issues
  - fixes

[Workflow visualization]

Executing security-scanner...
  → Will capture output to: issues

Found 3 vulnerabilities:
1. SQL injection in auth.js:42
2. XSS vulnerability in dashboard.js:67
3. Missing CSRF token validation in api.js:89

✓ Captured output to variable 'issues'

[Checkpoint: @review-issues]
(c)ontinue  (j)ump  (v)iew-output  (q)uit

> continue

Executing fixer...
  → Will capture output to: fixes
  → Interpolating variable: issues

Fixed all 3 security issues:
- auth.js:42 - Added parameterized query
- dashboard.js:67 - Added input sanitization
- api.js:89 - Added CSRF token validation

✓ Captured output to variable 'fixes'

Executing general-purpose...
Verified all fixes are working correctly. Tests pass.

Workflow complete!

Variables captured:
  issues: Found 3 vulnerabilities: 1. SQL injection...
  fixes: Fixed all 3 security issues: - auth.js:42...
```
